import { createHash } from "node:crypto";
import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";

import {
  LIST_OUTSTANDING_DIAGNOSTICS_REQUEST,
  SET_DIAGNOSTIC_ASSESSMENT_REQUEST,
  type ListOutstandingDiagnosticsResult,
  type OutstandingDiagnosticSummary,
  type SetDiagnosticAssessmentParams,
  type SetDiagnosticAssessmentResult
} from "@live-documentation/shared/contracts/diagnostics";

import { LlmInvocationError, LlmInvoker, type InvokeChatResult } from "../services/llmInvoker";
import type { LinkDiagnosticsSettings } from "../settings/configService";

const SNIPPET_CHAR_LIMIT = 4000;

interface AnalyzeWithAIOptions {
  client: LanguageClient;
  llmInvoker: LlmInvoker;
  getSettings: () => LinkDiagnosticsSettings;
  refreshDiagnosticsTree?: () => Promise<void>;
}

interface SnippetContext {
  label: string;
  snippet: string;
}

export function registerAnalyzeWithAICommand(options: AnalyzeWithAIOptions): vscode.Disposable {
  return vscode.commands.registerCommand("linkDiagnostics.analyzeWithAI", async () => {
    const settings = options.getSettings();
    if (settings.llmProviderMode === "disabled") {
      void vscode.window.showInformationMessage(
        "AI analysis is disabled. Update the Link-Aware Diagnostics settings to enable a provider."
      );
      return;
    }

    let snapshot: ListOutstandingDiagnosticsResult | undefined;
    try {
      snapshot = await options.client.sendRequest<ListOutstandingDiagnosticsResult>(
        LIST_OUTSTANDING_DIAGNOSTICS_REQUEST
      );
    } catch (error) {
      void vscode.window.showErrorMessage(
        `Failed to load diagnostics: ${error instanceof Error ? error.message : String(error)}`
      );
      return;
    }

    const diagnostics = snapshot?.diagnostics ?? [];
    if (diagnostics.length === 0) {
      void vscode.window.showInformationMessage("No outstanding diagnostics to analyze.");
      return;
    }

    const pickItems = diagnostics.map(diagnostic => ({
      label: formatDiagnosticLabel(diagnostic),
      description: diagnostic.message,
      detail: diagnostic.target?.uri ?? diagnostic.trigger?.uri ?? diagnostic.recordId,
      diagnostic
    }));

    const selection = await vscode.window.showQuickPick(pickItems, {
      placeHolder: "Select a diagnostic to analyze with AI",
      matchOnDescription: true,
      matchOnDetail: true
    });

    if (!selection) {
      return;
    }

    const diagnostic = selection.diagnostic;
    const prompt = await buildPrompt(diagnostic);
    const promptHash = createHash("sha1").update(prompt).digest("hex");
    const tags = {
      "link-aware.command": "analyze-diagnostic",
      "link-aware.diagnosticId": diagnostic.recordId,
      "link-aware.promptHash": promptHash
    } satisfies Record<string, string>;

  let invocation: InvokeChatResult;
    try {
      invocation = await vscode.window.withProgress(
        {
          title: "Link Diagnostics: Analyze Impact with AI",
          location: vscode.ProgressLocation.Notification,
          cancellable: true
        },
        async (_progress, token) =>
          options.llmInvoker.invoke({
            prompt,
            tags,
            interactive: true,
            justification: "Link-Aware Diagnostics impact analysis",
            token
          })
      );
    } catch (error: unknown) {
      if (error instanceof vscode.CancellationError) {
        return;
      }
      if (error instanceof LlmInvocationError) {
        if (error.reason !== "cancelled") {
          void vscode.window.showErrorMessage(error.message);
        }
        return;
      }
      void vscode.window.showErrorMessage(
        `Language model request failed: ${error instanceof Error ? error.message : String(error)}`
      );
      return;
    }

    const assessment = parseAssessment(invocation.text);
    assessment.generatedAt = new Date().toISOString();
    assessment.promptHash = promptHash;
    assessment.model = {
      id: invocation.model.id,
      name: invocation.model.name,
      vendor: invocation.model.vendor,
      family: invocation.model.family,
      version: invocation.model.version
    };
    assessment.tags = tags;
    assessment.rawResponse = invocation.text;

    const payload: SetDiagnosticAssessmentParams = {
      diagnosticId: diagnostic.recordId,
      assessment
    };

    try {
      await options.client.sendRequest<SetDiagnosticAssessmentResult>(
        SET_DIAGNOSTIC_ASSESSMENT_REQUEST,
        payload
      );
    } catch (error) {
      void vscode.window.showErrorMessage(
        `Failed to store assessment: ${error instanceof Error ? error.message : String(error)}`
      );
      return;
    }

    await options.refreshDiagnosticsTree?.();

    const summaryPreview = truncate(assessment.summary, 120);
    void vscode.window.showInformationMessage(
      `Saved AI assessment for diagnostic: ${summaryPreview}`
    );
  });
}

function formatDiagnosticLabel(diagnostic: OutstandingDiagnosticSummary): string {
  const severity = diagnostic.severity.toUpperCase();
  const target = diagnostic.target?.uri
    ? vscode.workspace.asRelativePath(diagnostic.target.uri, false)
    : diagnostic.target?.id;
  if (target) {
    return `${severity} • ${target}`;
  }
  return `${severity} • ${diagnostic.recordId}`;
}

async function buildPrompt(diagnostic: OutstandingDiagnosticSummary): Promise<string> {
  const lines: string[] = [];
  lines.push("You are an AI assistant helping triage link-aware diagnostics.");
  lines.push(
    "Return a JSON object with keys: summary (string), confidence (number between 0 and 1), recommendedActions (array of concise strings)."
  );
  lines.push(
    "Focus on practical remediation steps and limit recommendedActions to at most four items."
  );
  lines.push(`Diagnostic ID: ${diagnostic.recordId}`);
  lines.push(`Message: ${diagnostic.message}`);
  lines.push(`Severity: ${diagnostic.severity}`);
  lines.push(`Created At: ${diagnostic.createdAt}`);
  if (diagnostic.trigger?.uri) {
    lines.push(`Triggered By: ${vscode.workspace.asRelativePath(diagnostic.trigger.uri, false)}`);
  } else if (diagnostic.trigger?.id) {
    lines.push(`Triggered By: ${diagnostic.trigger.id}`);
  }
  if (diagnostic.linkIds.length) {
    lines.push(`Related Link IDs: ${diagnostic.linkIds.join(", ")}`);
  }
  if (diagnostic.llmAssessment?.summary) {
    lines.push(
      `Previous Assessment Summary: ${diagnostic.llmAssessment.summary}. Provide an updated assessment if new context warrants it.`
    );
  }
  lines.push("Context snippets follow. Use them for grounding before producing the JSON response.");

  const targetContext = await loadSnippet(diagnostic.target);
  if (targetContext) {
    lines.push(`### Target Artifact (${targetContext.label})`);
    lines.push(formatSnippet(targetContext.snippet));
  }

  const triggerContext = await loadSnippet(diagnostic.trigger);
  if (triggerContext) {
    lines.push(`### Trigger Artifact (${triggerContext.label})`);
    lines.push(formatSnippet(triggerContext.snippet));
  }

  return lines.join("\n\n");
}

async function loadSnippet(artifact: OutstandingDiagnosticSummary["target"]): Promise<SnippetContext | undefined> {
  if (!artifact?.uri) {
    return undefined;
  }

  try {
    const uri = vscode.Uri.parse(artifact.uri);
    const document = await vscode.workspace.openTextDocument(uri);
    const label = vscode.workspace.asRelativePath(uri, false);
    const snippet = truncate(document.getText(), SNIPPET_CHAR_LIMIT);
    return { label, snippet };
  } catch (error: unknown) {
    console.warn(
      `Failed to load context for ${artifact.uri}: ${error instanceof Error ? error.message : String(error)}`
    );
    return undefined;
  }
}

function formatSnippet(content: string): string {
  return ["```", content, "```"].join("\n");
}

interface ParsedAssessment {
  summary: string;
  confidence: number;
  recommendedActions: string[];
  generatedAt?: string;
  promptHash?: string;
  model?: {
    id: string;
    name?: string;
    vendor?: string;
    family?: string;
    version?: string;
  };
  tags?: Record<string, string>;
  rawResponse?: string;
}

function parseAssessment(responseText: string): ParsedAssessment {
  const cleaned = responseText.trim();
  const jsonText = extractJson(cleaned);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText) as unknown;
  } catch {
    throw new Error("AI response was not valid JSON");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("AI response did not contain a JSON object");
  }

  const record = parsed as Record<string, unknown>;
  const summary = typeof record.summary === "string" ? record.summary.trim() : undefined;
  const confidence = typeof record.confidence === "number" ? record.confidence : undefined;
  const recommended = Array.isArray(record.recommendedActions)
    ? record.recommendedActions.filter((item): item is string => typeof item === "string")
    : [];

  if (!summary || confidence === undefined) {
    throw new Error("AI response missing summary or confidence");
  }

  return {
    summary,
    confidence: clamp(confidence, 0, 1),
    recommendedActions: recommended.map(item => item.trim()).filter(Boolean).slice(0, 4)
  } satisfies ParsedAssessment;
}

function extractJson(text: string): string {
  let working = text;
  if (working.startsWith("```")) {
    const firstLineBreak = working.indexOf("\n");
    if (firstLineBreak !== -1) {
      working = working.slice(firstLineBreak + 1);
    }
    const fenceIndex = working.lastIndexOf("```");
    if (fenceIndex !== -1) {
      working = working.slice(0, fenceIndex);
    }
  }

  const start = working.indexOf("{");
  const end = working.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not include a JSON object");
  }

  return working.slice(start, end + 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function truncate(value: string, limit: number): string {
  if (value.length <= limit) {
    return value;
  }
  const suffix = "\n… (truncated)";
  return value.slice(0, Math.max(0, limit - suffix.length)) + suffix;
}
