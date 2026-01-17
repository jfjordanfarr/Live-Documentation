// Live Documentation: .mdmd/layer-4/extension-commands/latencySummary.mdmd.md#source-breadcrumbs
import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";

import {
  LATENCY_SUMMARY_REQUEST,
  type LatencySummary,
  type LatencySummaryRequest,
  type LatencySummaryResponse
} from "@live-documentation/shared/contracts/telemetry";

const SHOW_LATENCY_SUMMARY_COMMAND = "linkDiagnostics.showLatencySummary";
const GET_LATENCY_SUMMARY_COMMAND = "linkDiagnostics.getLatencySummary";

interface SummaryCommandOptions extends LatencySummaryRequest {
  suppressOutput?: boolean;
}

function formatDuration(duration: number | null): string {
  if (typeof duration !== "number" || Number.isNaN(duration)) {
    return "–";
  }
  if (duration >= 1000) {
    return `${(duration / 1000).toFixed(2)}s`;
  }
  return `${Math.round(duration)}ms`;
}

function formatSummary(summary: LatencySummary): string[] {
  const lines: string[] = [];
  lines.push(`Total changes: ${summary.totalChanges}`);
  lines.push(
    `Completed: ${summary.completedChanges} • In-flight: ${summary.inFlightChanges} • Queued: ${summary.queuedChanges}`
  );
  lines.push(`Diagnostics emitted: ${summary.diagnosticsEmitted}`);
  lines.push(
    `Latency — avg: ${formatDuration(summary.averageLatencyMs)}, p95: ${formatDuration(summary.p95LatencyMs)}, max: ${formatDuration(summary.maxLatencyMs)}, threshold: ${formatDuration(summary.thresholdMs)}`
  );
  lines.push(
    `Document changes — total: ${summary.byType.document.total}, completed: ${summary.byType.document.completed}, avg: ${formatDuration(summary.byType.document.averageLatencyMs)}, max: ${formatDuration(summary.byType.document.maxLatencyMs)}`
  );
  lines.push(
    `Code changes — total: ${summary.byType.code.total}, completed: ${summary.byType.code.completed}, avg: ${formatDuration(summary.byType.code.averageLatencyMs)}, max: ${formatDuration(summary.byType.code.maxLatencyMs)}`
  );

  if (summary.recentSamples.length > 0) {
    lines.push("");
    lines.push("Recent samples:");
    for (const sample of summary.recentSamples) {
      lines.push(
        ` • ${sample.changeType} ${sample.changeEventId} → ${formatDuration(sample.durationMs)} (${sample.diagnosticsEmitted} diagnostic(s), queued ${sample.queuedAt}, published ${sample.publishedAt})`
      );
    }
  }

  return lines;
}

export function registerLatencyTelemetryCommands(client: LanguageClient): vscode.Disposable {
  const output = vscode.window.createOutputChannel("Link Diagnostics Telemetry");

  async function requestSummary(options: LatencySummaryRequest | undefined): Promise<LatencySummary> {
    const payload: LatencySummaryRequest = {
      maxSamples: 10,
      ...options
    };
    const response = await client.sendRequest<LatencySummaryResponse>(LATENCY_SUMMARY_REQUEST, payload);
    return response.summary;
  }

  const getCommand = vscode.commands.registerCommand(
    GET_LATENCY_SUMMARY_COMMAND,
    async (options?: SummaryCommandOptions): Promise<LatencySummary | undefined> => {
      try {
        return await requestSummary(options);
      } catch (error) {
        if (!options?.suppressOutput) {
          void vscode.window.showErrorMessage(
            `Failed to retrieve latency summary: ${error instanceof Error ? error.message : String(error)}`
          );
        }
        return undefined;
      }
    }
  );

  const showCommand = vscode.commands.registerCommand(SHOW_LATENCY_SUMMARY_COMMAND, async () => {
    const quickPick = await vscode.window.showQuickPick(
      [
        { label: "View latency summary", id: "view", reset: false },
        { label: "View and reset counters", id: "reset", reset: true }
      ],
      {
        placeHolder: "Select telemetry action",
        title: "Link Diagnostics Latency"
      }
    );

    if (!quickPick) {
      return;
    }

    const summary = await requestSummary({ reset: quickPick.reset, maxSamples: 20 });

    output.appendLine(`\n[${new Date().toISOString()}] Latency summary${quickPick.reset ? " (reset)" : ""}`);
    for (const line of formatSummary(summary)) {
      output.appendLine(line);
    }
    output.show(true);

    const durationFlag = summary.p95LatencyMs && summary.p95LatencyMs > summary.thresholdMs ? "⚠" : "";
    void vscode.window.showInformationMessage(
      `${durationFlag}Latency avg ${formatDuration(summary.averageLatencyMs)}, p95 ${formatDuration(summary.p95LatencyMs)}.`
    );
  });

  return vscode.Disposable.from(output, getCommand, showCommand);
}

export const LATENCY_SUMMARY_COMMAND = SHOW_LATENCY_SUMMARY_COMMAND;
export const GET_LATENCY_SUMMARY_INTERNAL_COMMAND = GET_LATENCY_SUMMARY_COMMAND;