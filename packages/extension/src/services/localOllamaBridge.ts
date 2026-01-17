import * as vscode from "vscode";

import type { InvokeLlmResult } from "@live-documentation/shared/contracts/llm";
import {
  invokeOllamaChat,
  OllamaInvocationError
} from "@live-documentation/shared/tooling/ollamaClient";
import { resolveOllamaEndpoint } from "@live-documentation/shared/tooling/ollamaEndpoint";
import { createMockOllamaResponse } from "@live-documentation/shared/tooling/ollamaMock";

interface LocalInvocationOptions {
  prompt: string;
  timeoutMs?: number;
}

const DEFAULT_CONTEXT_WINDOW = 32_768;

/**
 * Attempt to call a workspace-local Ollama server. Falls back to a deterministic mock response when
 * the model is undefined or the request fails so integration tests stay reproducible.
 */
export async function invokeLocalOllamaBridge(options: LocalInvocationOptions): Promise<InvokeLlmResult> {
  const prompt = typeof options.prompt === "string" ? options.prompt : "";
  const timeoutMs = options.timeoutMs ?? 60_000;
  const configuration = vscode.workspace.getConfiguration("github.copilot.chat.byok");
  const model = pickModel(configuration);
  const endpoint = resolveOllamaEndpoint({
    configuration,
    env: process.env
  });

  if (!model) {
    console.warn("[ollama-bridge] No model configured; emitting mock response.");
    const mock = createMockOllamaResponse(prompt);
    return {
      response: mock.responseText,
      modelId: mock.modelId,
      usage: mock.usage
    } satisfies InvokeLlmResult;
  }

  try {
    const result = await invokeOllamaChat({
      endpoint,
      model,
      prompt,
      timeoutMs,
      contextWindow: pickContextWindow()
    });

    return {
      response: result.text,
      modelId: result.modelId,
      usage: result.usage
    } satisfies InvokeLlmResult;
  } catch (error) {
    const detail = error instanceof OllamaInvocationError ? error.message : String(error);
    if (isMissingModelError(detail, model)) {
      console.warn(
        `[ollama-bridge] Model '${model}' was not found. Run "ollama pull ${model}" or update LINK_AWARE_OLLAMA_MODEL before rerunning tests.`
      );
      console.warn("[ollama-bridge] Falling back to deterministic mock response.");
    } else {
      console.warn(`[ollama-bridge] Request failed (${detail}); falling back to mock response.`);
    }
    const mock = createMockOllamaResponse(prompt, { modelId: model });
    return {
      response: mock.responseText,
      modelId: mock.modelId,
      usage: mock.usage
    } satisfies InvokeLlmResult;
  }
}

function pickModel(configuration: vscode.WorkspaceConfiguration): string | undefined {
  const candidates = [
    process.env.LINK_AWARE_OLLAMA_MODEL,
    process.env.OLLAMA_MODEL,
    configuration.get<string>("ollamaModel")
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return undefined;
}

function pickContextWindow(): number {
  const candidates = [
    process.env.LINK_AWARE_OLLAMA_CONTEXT,
    process.env.LINK_AWARE_OLLAMA_CONTEXT_WINDOW,
    process.env.OLLAMA_NUM_CTX
  ];

  for (const candidate of candidates) {
    const parsed = candidate ? Number.parseInt(candidate, 10) : NaN;
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return DEFAULT_CONTEXT_WINDOW;
}

function isMissingModelError(message: string, model: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("not found") && normalized.includes(model.toLowerCase());
}
