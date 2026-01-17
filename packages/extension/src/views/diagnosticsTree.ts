import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";

import {
  LIST_OUTSTANDING_DIAGNOSTICS_REQUEST,
  type ListOutstandingDiagnosticsResult,
  type OutstandingDiagnosticSummary
} from "@live-documentation/shared/contracts/diagnostics";

import { ACKNOWLEDGE_DIAGNOSTIC_COMMAND } from "../commands/acknowledgeDiagnostic";

export type TreeNode = TargetNode | DiagnosticNode;

interface TargetNode {
  readonly kind: "target";
  readonly uri?: vscode.Uri;
  readonly label: string;
  readonly diagnostics: OutstandingDiagnosticSummary[];
}

interface DiagnosticNode {
  readonly kind: "diagnostic";
  readonly parent: TargetNode;
  readonly diagnostic: OutstandingDiagnosticSummary;
}

export class DiagnosticsTreeDataProvider
  implements vscode.TreeDataProvider<TreeNode>, vscode.Disposable
{
  private readonly emitter = new vscode.EventEmitter<TreeNode | undefined>();
  readonly onDidChangeTreeData = this.emitter.event;

  private snapshot: ListOutstandingDiagnosticsResult | null = null;
  private loading: Promise<void> | null = null;

  constructor(private readonly client: LanguageClient) {}

  dispose(): void {
    this.emitter.dispose();
  }

  async refresh(): Promise<void> {
    this.snapshot = null;
    await this.ensureSnapshot(true);
    this.emitter.fire(undefined);
  }

  async getChildren(element?: TreeNode): Promise<TreeNode[]> {
    await this.ensureSnapshot();

    if (!this.snapshot) {
      return [];
    }

    if (!element) {
      return this.buildTargetNodes();
    }

    if (element.kind === "target") {
      return element.diagnostics.map(diagnostic => ({
        kind: "diagnostic" as const,
        parent: element,
        diagnostic
      }));
    }

    return [];
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    if (element.kind === "target") {
      const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.Collapsed);
      item.contextValue = "linkDiagnostics.target";
      if (element.uri) {
        item.resourceUri = element.uri;
      }
      item.description = element.diagnostics.length === 1
        ? "1 diagnostic"
        : `${element.diagnostics.length} diagnostics`;
      return item;
    }

    const diagnostic = element.diagnostic;
    const label = diagnostic.message;
    const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
    item.contextValue = "linkDiagnostics.diagnostic";
    item.tooltip = this.buildTooltip(diagnostic);
    item.iconPath = this.getIconForSeverity(diagnostic.severity);
    const created = formatLocalTimestamp(diagnostic.createdAt);
    const triggerLabel = diagnostic.trigger?.uri
      ? vscode.workspace.asRelativePath(diagnostic.trigger.uri, false)
      : diagnostic.trigger?.id;
    item.description = triggerLabel ? `${diagnostic.severity} · ${created} · ${triggerLabel}` : `${diagnostic.severity} · ${created}`;

    const targetUri = element.parent.uri ?? (diagnostic.target?.uri ? vscode.Uri.parse(diagnostic.target.uri) : undefined);
    if (targetUri) {
      item.command = {
        title: "Open diagnostic target",
        command: "vscode.open",
        arguments: [targetUri]
      };
    }

    item.id = diagnostic.recordId;
    item.accessibilityInformation = {
      label: `Diagnostic ${diagnostic.severity} ${diagnostic.message}`
    };

    return item;
  }

  getParent(element: TreeNode): TreeNode | undefined {
    return element.kind === "diagnostic" ? element.parent : undefined;
  }

  private async ensureSnapshot(force = false): Promise<void> {
    if (this.snapshot && !force) {
      return;
    }

    if (this.loading) {
      await this.loading;
      return;
    }

    this.loading = (async () => {
      try {
        const result = await this.client.sendRequest<ListOutstandingDiagnosticsResult>(
          LIST_OUTSTANDING_DIAGNOSTICS_REQUEST
        );
        this.snapshot = result;
      } catch (error) {
        this.snapshot = { generatedAt: new Date().toISOString(), diagnostics: [] };
        void vscode.window.showErrorMessage(
          `Failed to retrieve diagnostics snapshot: ${error instanceof Error ? error.message : String(error)}`
        );
      } finally {
        this.loading = null;
      }
    })();

    await this.loading;
  }

  private buildTargetNodes(): TargetNode[] {
    if (!this.snapshot) {
      return [];
    }

    const groups = new Map<string, OutstandingDiagnosticSummary[]>();

    for (const diagnostic of this.snapshot.diagnostics) {
      const key = diagnostic.target?.uri ?? `__unknown:${diagnostic.recordId}`;
      const bucket = groups.get(key) ?? [];
      bucket.push(diagnostic);
      groups.set(key, bucket);
    }

    const nodes: TargetNode[] = [];

    for (const [_key, diagnostics] of groups.entries()) {
      const targetUri = diagnostics[0]?.target?.uri;
      const uri = targetUri ? vscode.Uri.parse(targetUri) : undefined;
      const label = uri
        ? vscode.workspace.asRelativePath(uri, false)
        : diagnostics[0]?.target?.id ?? "Unknown artifact";

      diagnostics.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

      nodes.push({
        kind: "target",
        uri,
        label,
        diagnostics
      });
    }

    nodes.sort((a, b) => a.label.localeCompare(b.label));
    return nodes;
  }

  private buildTooltip(diagnostic: OutstandingDiagnosticSummary): string {
    const lines = [diagnostic.message];
    const created = formatLocalTimestamp(diagnostic.createdAt);
    lines.push(`Generated: ${created}`);
    if (diagnostic.trigger?.uri) {
      lines.push(
        `Triggered by: ${vscode.workspace.asRelativePath(diagnostic.trigger.uri, false)}`
      );
    } else if (diagnostic.trigger?.id) {
      lines.push(`Triggered by: ${diagnostic.trigger.id}`);
    }
    lines.push(`Change Event: ${diagnostic.changeEventId}`);
    if (diagnostic.linkIds.length > 0) {
      lines.push(`Links: ${diagnostic.linkIds.join(", ")}`);
    }
    const assessment = diagnostic.llmAssessment;
    if (assessment?.summary) {
      lines.push("");
      lines.push("AI Summary:");
      lines.push(assessment.summary);
      if (typeof assessment.confidence === "number") {
        lines.push(`AI Confidence: ${formatConfidence(assessment.confidence)}`);
      }
      if (assessment.recommendedActions?.length) {
        lines.push("AI Recommended Actions:");
        for (const action of assessment.recommendedActions) {
          lines.push(`- ${action}`);
        }
      }
    }
    return lines.join("\n");
  }

  private getIconForSeverity(severity: OutstandingDiagnosticSummary["severity"]): vscode.ThemeIcon {
    switch (severity) {
      case "warning":
        return new vscode.ThemeIcon("warning");
      case "hint":
        return new vscode.ThemeIcon("info");
      case "info":
      default:
        return new vscode.ThemeIcon("bell-dot");
    }
  }
}

function formatLocalTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatConfidence(value: number): string {
  const percentage = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return `${percentage}%`;
}

export function isDiagnosticNode(node: TreeNode): node is DiagnosticNode {
  return Boolean(node && typeof node === "object" && (node as DiagnosticNode).kind === "diagnostic");
}

export function buildTreeAcknowledgementArgs(node: DiagnosticNode): {
  data: Record<string, unknown>;
  uri?: vscode.Uri;
} {
  const targetUri = node.parent.uri ?? (node.diagnostic.target?.uri ? vscode.Uri.parse(node.diagnostic.target.uri) : undefined);
  return {
    data: {
      recordId: node.diagnostic.recordId,
      targetUri: node.diagnostic.target?.uri,
      triggerUri: node.diagnostic.trigger?.uri
    },
    uri: targetUri
  };
}

export interface DiagnosticsTreeRegistration extends vscode.Disposable {
  readonly provider: DiagnosticsTreeDataProvider;
}

export function registerDiagnosticsTreeView(client: LanguageClient): DiagnosticsTreeRegistration {
  const provider = new DiagnosticsTreeDataProvider(client);
  const treeView = vscode.window.createTreeView("linkDiagnostics.diagnosticsTree", {
    treeDataProvider: provider
  });

  const refreshCommand = vscode.commands.registerCommand(
    "linkDiagnostics.refreshDiagnosticsTree",
    async () => {
      await provider.refresh();
    }
  );

  const acknowledgeCommand = vscode.commands.registerCommand(
    "linkDiagnostics.acknowledgeDiagnosticFromTree",
    async (node: TreeNode | undefined) => {
      if (!node || !isDiagnosticNode(node)) {
        void vscode.window.showWarningMessage("Select a diagnostic entry to acknowledge.");
        return;
      }

      await vscode.commands.executeCommand(
        ACKNOWLEDGE_DIAGNOSTIC_COMMAND,
        buildTreeAcknowledgementArgs(node)
      );
    }
  );

  const composite = vscode.Disposable.from(treeView, provider, refreshCommand, acknowledgeCommand);

  return {
    provider,
    dispose(): void {
      composite.dispose();
    }
  };
}
