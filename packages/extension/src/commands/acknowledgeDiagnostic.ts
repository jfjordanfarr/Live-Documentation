import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";

import {
  ACKNOWLEDGE_DIAGNOSTIC_REQUEST,
  DIAGNOSTIC_ACKNOWLEDGED_NOTIFICATION,
  type AcknowledgeDiagnosticParams,
  type AcknowledgeDiagnosticResult,
  type DiagnosticAcknowledgedPayload
} from "@live-documentation/shared/contracts/diagnostics";

export const ACKNOWLEDGE_DIAGNOSTIC_COMMAND = "linkDiagnostics.acknowledgeDiagnostic";

interface AcknowledgeCommandArgs {
  diagnostic?: vscode.Diagnostic;
  data?: unknown;
  uri?: vscode.Uri;
}

export interface AcknowledgementWorkflowOptions {
  onAcknowledged?: (payload: DiagnosticAcknowledgedPayload) => void;
}

export function registerAcknowledgementWorkflow(
  client: LanguageClient,
  options?: AcknowledgementWorkflowOptions
): vscode.Disposable {
  const command = vscode.commands.registerCommand(
    ACKNOWLEDGE_DIAGNOSTIC_COMMAND,
    async (args?: AcknowledgeCommandArgs) => {
      if (!args || !args.data) {
        void vscode.window.showWarningMessage("Unable to acknowledge diagnostic: missing context.");
        return;
      }

      const context = args.data as Record<string, unknown> | undefined;
      const recordId = typeof context?.recordId === "string" ? context.recordId : undefined;
      if (!recordId) {
        void vscode.window.showWarningMessage(
          "This diagnostic cannot be acknowledged because it lacks a persistent identifier."
        );
        return;
      }

      const targetUriString =
        typeof context?.targetUri === "string"
          ? context.targetUri
          : args.uri?.toString();

      const targetUri = resolveTargetUri(args.uri, targetUriString);

      const actor = vscode.env.machineId || "unknown";
      const params: AcknowledgeDiagnosticParams = {
        diagnosticId: recordId,
        actor
      };

      let result: AcknowledgeDiagnosticResult;
      try {
        result = await client.sendRequest<AcknowledgeDiagnosticResult>(
          ACKNOWLEDGE_DIAGNOSTIC_REQUEST,
          params
        );
      } catch (error) {
        void vscode.window.showErrorMessage(
          `Failed to acknowledge diagnostic: ${error instanceof Error ? error.message : String(error)}`
        );
        return;
      }

      if (result.status === "not_found") {
        void vscode.window.showWarningMessage("Diagnostic was already cleared or is no longer available.");
        pruneDiagnostic(client, targetUri, recordId);
        options?.onAcknowledged?.({
          recordId,
          targetUri: targetUriString,
          triggerUri: typeof context?.triggerUri === "string" ? context.triggerUri : undefined
        });
        return;
      }

      pruneDiagnostic(client, targetUri, recordId);

      const acknowledgedAt = result.acknowledgedAt ?? new Date().toISOString();
      const acknowledgedBy = result.acknowledgedBy ?? actor;
      const message =
        result.status === "already_acknowledged"
          ? `Diagnostic was already acknowledged by ${acknowledgedBy}.`
          : `Diagnostic acknowledged by ${acknowledgedBy} at ${acknowledgedAt}.`;
      void vscode.window.showInformationMessage(message);

      options?.onAcknowledged?.({
        recordId,
        targetUri: targetUriString,
        triggerUri: typeof context?.triggerUri === "string" ? context.triggerUri : undefined
      });
    }
  );

  const notification = client.onNotification(
    DIAGNOSTIC_ACKNOWLEDGED_NOTIFICATION,
    (payload: DiagnosticAcknowledgedPayload) => {
      if (!payload?.recordId || !payload.targetUri) {
        return;
      }

      try {
        const uri = vscode.Uri.parse(payload.targetUri);
        pruneDiagnostic(client, uri, payload.recordId);
        options?.onAcknowledged?.(payload);
      } catch (error) {
        console.warn("Failed to prune diagnostics after acknowledgement", error);
      }
    }
  );

  return vscode.Disposable.from(command, notification);
}

function pruneDiagnostic(client: LanguageClient, uri: vscode.Uri | undefined, recordId: string): void {
  const collection = client.diagnostics;
  if (!collection) {
    return;
  }

  if (!uri) {
    return;
  }

  const diagnostics = collection.get(uri);
  if (!diagnostics || diagnostics.length === 0) {
    return;
  }

  const remaining = diagnostics.filter(diagnostic => {
    const data = (diagnostic as vscode.Diagnostic & { data?: unknown }).data;
    if (!data || typeof data !== "object") {
      return true;
    }
    const record = (data as Record<string, unknown>).recordId;
    return typeof record !== "string" || record !== recordId;
  });

  collection.set(uri, remaining);
}

function resolveTargetUri(candidate: vscode.Uri | undefined, fallback?: string): vscode.Uri | undefined {
  if (candidate) {
    return candidate;
  }

  if (!fallback) {
    return undefined;
  }

  try {
    return vscode.Uri.parse(fallback);
  } catch {
    return undefined;
  }
}
