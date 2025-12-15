import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import * as path from "node:path";

import { safeFetch, NetworkPolicyViolation } from "./safeFetch";

export interface OllamaChatRequest {
  endpoint: string;
  model: string;
  prompt: string;
  systemPrompt?: string;
  timeoutMs?: number;
  contextWindow?: number;
  options?: Record<string, unknown>;
}

export interface OllamaChatUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface OllamaChatResult {
  text: string;
  modelId: string;
  usage?: OllamaChatUsage;
}

interface OllamaChatResponse {
  model?: string;
  message?: { role?: string; content?: string };
  eval_count?: number;
  prompt_eval_count?: number;
  error?: string;
}

const DEFAULT_SYSTEM_PROMPT =
  "You are assisting the Link-Aware Diagnostics tool. Provide concise JSON describing relationships between files when requested.";

export class OllamaInvocationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "OllamaInvocationError";
  }
}

export async function invokeOllamaChat(request: OllamaChatRequest): Promise<OllamaChatResult> {
  const controller = new AbortController();
  const timeoutMs = request.timeoutMs ?? 60_000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();
  const trace = createTraceHandle(request);

  try {
    // Use safeFetch to enforce localhost-only network policy.
    // This ensures Ollama can only be accessed via localhost endpoints,
    // preventing accidental or malicious exfiltration to remote servers.
    const response = await safeFetch(new URL("/api/chat", request.endpoint).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: request.model,
        stream: false,
        options: buildRequestOptions(request),
        messages: [
          {
            role: "system",
            content: request.systemPrompt ?? DEFAULT_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: request.prompt
          }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const detail = await safeReadText(response);
      throw new OllamaInvocationError(`Ollama /api/chat returned ${response.status}: ${detail}`);
    }

    const payload = (await response.json()) as OllamaChatResponse;
    if (payload.error) {
      throw new OllamaInvocationError(payload.error);
    }

    const text = payload.message?.content ?? "";
    const result: OllamaChatResult = {
      text,
      modelId: payload.model ?? request.model,
      usage: summariseUsage(payload)
    };
    trace?.success(result, Date.now() - startedAt);
    return result;
  } catch (error) {
    clearTimeout(timeout);
    // Re-throw network policy violations directly — these indicate configuration errors
    // (e.g., user configured a cloud Ollama endpoint instead of localhost)
    if (error instanceof NetworkPolicyViolation) {
      trace?.failure(error, Date.now() - startedAt);
      throw new OllamaInvocationError(
        `Ollama endpoint "${request.endpoint}" violates network policy. ` +
          `Only localhost endpoints are allowed. See SECURITY.md for details.`,
        error
      );
    }
    if (error instanceof OllamaInvocationError) {
      trace?.failure(error, Date.now() - startedAt);
      throw error;
    }
    const wrapped = new OllamaInvocationError("Failed to invoke Ollama", error);
    trace?.failure(wrapped, Date.now() - startedAt);
    throw wrapped;
  }
}

function summariseUsage(payload: OllamaChatResponse): OllamaChatUsage | undefined {
  const prompt = payload.prompt_eval_count;
  const completion = payload.eval_count;
  if (typeof prompt !== "number" && typeof completion !== "number") {
    return undefined;
  }

  const usage: OllamaChatUsage = {};
  if (typeof prompt === "number") {
    usage.promptTokens = prompt;
  }
  if (typeof completion === "number") {
    usage.completionTokens = completion;
  }
  if (typeof prompt === "number" && typeof completion === "number") {
    usage.totalTokens = prompt + completion;
  }
  return usage;
}

function buildRequestOptions(request: OllamaChatRequest): Record<string, unknown> {
  const base: Record<string, unknown> = {
    temperature: 0,
    top_p: 0.1
  };

  if (typeof request.contextWindow === "number" && Number.isFinite(request.contextWindow)) {
    base.num_ctx = Math.max(1, Math.floor(request.contextWindow));
  }

  if (request.options) {
    for (const [key, value] of Object.entries(request.options)) {
      base[key] = value;
    }
  }

  return base;
}

async function safeReadText(response: { text: () => Promise<string> }): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "<unable to read response body>";
  }
}

interface TraceHandle {
  success(result: OllamaChatResult, durationMs: number): void;
  failure(error: OllamaInvocationError, durationMs: number): void;
}

interface TracePayload {
  id: string;
  status: "success" | "error";
  requestedAt: string;
  durationMs: number;
  request: {
    endpoint: string;
    model: string;
    prompt: string;
    promptLength: number;
    systemPrompt?: string;
    contextWindow?: number;
    options?: Record<string, unknown>;
  };
  response?: {
    modelId: string;
    text: string;
    textLength: number;
    usage?: OllamaChatUsage;
  };
  errorMessage?: string;
  errorStack?: string;
}

let cachedTraceDir: string | null | undefined;

function resolveTraceDirectory(): string | null {
  if (cachedTraceDir !== undefined) {
    return cachedTraceDir;
  }

  if (typeof process === "undefined") {
    cachedTraceDir = null;
    return cachedTraceDir;
  }

  const raw = process.env.LINK_AWARE_OLLAMA_TRACE_DIR;
  if (!raw) {
    cachedTraceDir = null;
    return cachedTraceDir;
  }

  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    cachedTraceDir = null;
    return cachedTraceDir;
  }

  cachedTraceDir = path.isAbsolute(trimmed) ? trimmed : path.resolve(process.cwd(), trimmed);
  return cachedTraceDir;
}

function createTraceHandle(request: OllamaChatRequest): TraceHandle | null {
  const traceDir = resolveTraceDirectory();
  if (!traceDir) {
    return null;
  }

  const requestedAt = new Date();
  const traceId = `${requestedAt.toISOString().replace(/[:.]/g, "-")}-${randomUUID()}`;

  const basePayload: Omit<TracePayload, "status" | "response" | "errorMessage" | "errorStack" | "durationMs"> = {
    id: traceId,
    requestedAt: requestedAt.toISOString(),
    request: {
      endpoint: request.endpoint,
      model: request.model,
      prompt: truncateForTrace(request.prompt),
      promptLength: request.prompt.length,
      systemPrompt: request.systemPrompt ? truncateForTrace(request.systemPrompt) : undefined,
      contextWindow: request.contextWindow,
      options: request.options && Object.keys(request.options).length > 0 ? request.options : undefined
    }
  };

  const writeTrace = (payload: TracePayload) => {
    void persistTrace(traceDir, payload).catch((error) => {
      const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      console.warn(`[ollama-trace] Failed to persist trace ${payload.id}: ${detail}`);
    });
  };

  return {
    success(result, durationMs) {
      writeTrace({
        ...basePayload,
        status: "success",
        durationMs,
        response: {
          modelId: result.modelId,
          text: truncateForTrace(result.text),
          textLength: result.text.length,
          usage: result.usage
        }
      });
    },
    failure(error, durationMs) {
      writeTrace({
        ...basePayload,
        status: "error",
        durationMs,
        errorMessage: error.message,
        errorStack: error.cause instanceof Error ? error.cause.stack ?? undefined : error.stack
      });
    }
  } satisfies TraceHandle;
}

async function persistTrace(traceDir: string, payload: TracePayload): Promise<void> {
  const filePath = path.join(traceDir, `${payload.id}.json`);
  await fs.mkdir(traceDir, { recursive: true });
  const serialised = JSON.stringify(payload, null, 2);
  await fs.writeFile(filePath, `${serialised}\n`, "utf8");
}

function truncateForTrace(value: string, limit = 16_000): string {
  if (value.length <= limit) {
    return value;
  }
  return `${value.slice(0, limit)}\n…<truncated ${value.length - limit} chars>`;
}
