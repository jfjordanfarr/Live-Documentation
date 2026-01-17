import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";
import { z } from "zod";

import {
  INSPECT_DEPENDENCIES_REQUEST,
  type InspectDependenciesParams
} from "@live-documentation/shared/contracts/dependencies";

import { KnowledgeArtifactSchema, LinkRelationshipKindSchema } from "../shared/artifactSchemas";

interface DependencyQuickPickItem extends vscode.QuickPickItem {
  target: vscode.Uri;
}

interface DependencyQuickPickClient {
  sendRequest(method: string, params: InspectDependenciesParams): Promise<unknown>;
}

export function registerDependencyQuickPick(client: LanguageClient): vscode.Disposable {
  const controller = new DependencyQuickPickController(client);

  return vscode.commands.registerCommand(
    "linkDiagnostics.inspectDependencies",
    async (target?: vscode.Uri | string) => {
      await controller.show(target);
    }
  );
}

export class DependencyQuickPickController {
  constructor(private readonly client: DependencyQuickPickClient) {}

  async show(target?: vscode.Uri | string): Promise<void> {
    const uri = this.resolveTarget(target);
    if (!uri) {
      await vscode.window.showInformationMessage(
        "Open a file to inspect its dependencies or provide a file URI."
      );
      return;
    }

    let result: ParsedInspection;
    try {
      const params: InspectDependenciesParams = { uri: uri.toString() };
      const method = String(INSPECT_DEPENDENCIES_REQUEST);
      const raw = await this.client.sendRequest(method, params);
      result = InspectDependenciesResultSchema.parse(raw);
    } catch (error) {
      await vscode.window.showErrorMessage(
        `Unable to load dependency information: ${describeError(error)}`
      );
      return;
    }

    if (!result.trigger) {
      await vscode.window.showInformationMessage(
        "No dependency information is available for this artifact yet."
      );
      return;
    }

    if (result.edges.length === 0) {
      await vscode.window.showInformationMessage(
        "No dependent artifacts are recorded for this file."
      );
      return;
    }

    const triggerLabel = vscode.workspace.asRelativePath(
      vscode.Uri.parse(result.trigger.uri),
      false
    );

    const items = result.edges.map(edge => this.toQuickPickItem(edge));

    const selection = await vscode.window.showQuickPick(items, {
      placeHolder: `Artifacts affected by ${triggerLabel}`,
      matchOnDescription: true,
      matchOnDetail: true
    });

    if (!selection) {
      return;
    }

    try {
      const document = await vscode.workspace.openTextDocument(selection.target);
      await vscode.window.showTextDocument(document, { preview: false });
    } catch (error) {
      await vscode.window.showErrorMessage(
        `Failed to open ${selection.target.toString()}: ${describeError(error)}`
      );
    }
  }

  private resolveTarget(target?: vscode.Uri | string): vscode.Uri | undefined {
    if (target instanceof vscode.Uri) {
      return target;
    }

    if (typeof target === "string") {
      try {
        return vscode.Uri.parse(target);
      } catch {
        return undefined;
      }
    }

    return vscode.window.activeTextEditor?.document.uri;
  }

  private toQuickPickItem(edge: ParsedEdge): DependencyQuickPickItem {
    const targetUri = vscode.Uri.parse(edge.dependent.uri);
    const label = vscode.workspace.asRelativePath(targetUri, false);
    const description = `${edge.viaKind} • depth ${edge.depth}`;
    const detail = describeEdgePath(edge, uri => this.formatUri(uri));

    return {
      label,
      description,
      detail,
      target: targetUri
    };
  }

  private formatUri(uri: string): string {
    return vscode.workspace.asRelativePath(vscode.Uri.parse(uri), false);
  }
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

const DependencyGraphEdgeSchema = z.object({
  dependent: KnowledgeArtifactSchema,
  viaLinkId: z.string(),
  viaKind: LinkRelationshipKindSchema,
  depth: z.number().int().min(0),
  path: z.array(KnowledgeArtifactSchema)
});

const InspectDependenciesResultSchema = z.object({
  trigger: KnowledgeArtifactSchema.optional(),
  edges: z.array(DependencyGraphEdgeSchema),
  summary: z.object({
    totalDependents: z.number().int().min(0),
    maxDepthReached: z.number().int().min(0)
  })
});

type ParsedInspection = z.infer<typeof InspectDependenciesResultSchema>;
export type ParsedEdge = z.infer<typeof DependencyGraphEdgeSchema>;

export function describeEdgePath(edge: ParsedEdge, format: (uri: string) => string): string | undefined {
  if (edge.depth <= 1 || edge.path.length <= 1) {
    return undefined;
  }

  const segments = edge.path
    .slice(0, Math.max(0, edge.path.length - 1))
    .map(artifact => format(artifact.uri))
    .filter(segment => segment.length > 0);

  if (segments.length === 0) {
    return undefined;
  }

  return `via ${segments.join(" → ")}`;
}

export const InspectDependenciesResultValidator = InspectDependenciesResultSchema;

