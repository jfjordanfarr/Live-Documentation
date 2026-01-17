import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";

import {
  LIST_OUTSTANDING_DIAGNOSTICS_REQUEST,
  type ListOutstandingDiagnosticsResult
} from "@live-documentation/shared/contracts/diagnostics";

export const EXPORT_DIAGNOSTICS_COMMAND = "linkDiagnostics.exportDiagnostics";

interface ExportFormat {
  label: string;
  extension: string;
  formatter: (result: ListOutstandingDiagnosticsResult) => string;
}

const EXPORT_FORMATS: Record<string, ExportFormat> = {
  csv: {
    label: "CSV",
    extension: ".csv",
    formatter: (result) => {
      const rows = [
        ["Record ID", "Target", "Trigger", "Message", "Severity", "Created At", "Change Event", "Links"].join(",")
      ];

      for (const diagnostic of result.diagnostics) {
        const targetUri = diagnostic.target?.uri
          ? vscode.workspace.asRelativePath(diagnostic.target.uri, false)
          : (diagnostic.target?.id ?? "");
        const triggerUri = diagnostic.trigger?.uri
          ? vscode.workspace.asRelativePath(diagnostic.trigger.uri, false)
          : (diagnostic.trigger?.id ?? "");

        rows.push([
          csvEscape(diagnostic.recordId),
          csvEscape(targetUri),
          csvEscape(triggerUri),
          csvEscape(diagnostic.message),
          diagnostic.severity,
          diagnostic.createdAt,
          diagnostic.changeEventId,
          diagnostic.linkIds.join(";")
        ].join(","));
      }

      return rows.join("\n");
    }
  },
  json: {
    label: "JSON",
    extension: ".json",
    formatter: (result) => {
      return JSON.stringify(result, null, 2);
    }
  }
};

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }
  return value;
}

export function registerExportDiagnosticsCommand(client: LanguageClient): vscode.Disposable {
  return vscode.commands.registerCommand(EXPORT_DIAGNOSTICS_COMMAND, async () => {
    try {
      // Ask user for format
      const formatChoice = await vscode.window.showQuickPick(
        Object.entries(EXPORT_FORMATS).map(([key, format]) => ({
          label: format.label,
          key
        })),
        {
          placeHolder: "Select export format",
          title: "Export Diagnostics"
        }
      );

      if (!formatChoice) {
        return;
      }

      const format = EXPORT_FORMATS[formatChoice.key];

      // Fetch diagnostics
      const result = await client.sendRequest<ListOutstandingDiagnosticsResult>(
        LIST_OUTSTANDING_DIAGNOSTICS_REQUEST
      );

      if (result.diagnostics.length === 0) {
        void vscode.window.showInformationMessage("No outstanding diagnostics to export.");
        return;
      }

      // Format output
      const content = format.formatter(result);

      // Ask for save location
      const defaultUri = vscode.workspace.workspaceFolders?.[0]?.uri
        ?? vscode.Uri.file(process.cwd());
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
      const defaultFilename = `diagnostics-${timestamp}${format.extension}`;

      const saveUri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.joinPath(defaultUri, defaultFilename),
        filters: {
          [format.label]: [format.extension.replace(".", "")]
        },
        title: "Export Diagnostics"
      });

      if (!saveUri) {
        return;
      }

      // Write file
      await fs.writeFile(saveUri.fsPath, content, "utf-8");

      const choice = await vscode.window.showInformationMessage(
        `Exported ${result.diagnostics.length} diagnostic(s) to ${path.basename(saveUri.fsPath)}`,
        "Open File"
      );

      if (choice === "Open File") {
        await vscode.commands.executeCommand("vscode.open", saveUri);
      }
    } catch (error) {
      void vscode.window.showErrorMessage(
        `Failed to export diagnostics: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });
}
