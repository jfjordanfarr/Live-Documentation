import * as path from "path";
import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";

import {
  RebindImpactedArtifact,
  RebindReason,
  RebindRequiredArtifact
} from "@live-documentation/shared/contracts/maintenance";
import {
  OVERRIDE_LINK_REQUEST,
  OverrideLinkRequest,
  OverrideLinkResponse
} from "@live-documentation/shared/contracts/overrides";
import {
  ArtifactLayer,
  LinkRelationshipKind
} from "@live-documentation/shared/domain/artifacts";

interface OverrideCommandPayload {
  removed?: RebindRequiredArtifact;
  impacted?: RebindImpactedArtifact[];
  reason?: RebindReason;
  newUri?: string;
}

const LAYER_OPTIONS: ArtifactLayer[] = [
  "vision",
  "requirements",
  "architecture",
  "implementation",
  "code"
];

const RELATIONSHIP_OPTIONS: LinkRelationshipKind[] = [
  "documents",
  "implements",
  "depends_on",
  "references",
  "includes"
];

export function registerOverrideLinkCommand(client: LanguageClient): vscode.Disposable {
  return vscode.commands.registerCommand(
    "linkDiagnostics.overrideLink",
    async (payload?: OverrideCommandPayload) => {
      try {
        if (payload?.removed && payload.impacted?.length) {
          await handleRebindOverride(client, payload);
          return;
        }

        await handleManualOverride(client);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        void vscode.window.showErrorMessage(`Failed to override link: ${message}`);
      }
    }
  );
}

async function handleManualOverride(client: LanguageClient): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    void vscode.window.showWarningMessage("Open a source document before overriding links.");
    return;
  }

  const sourceUri = editor.document.uri;
  const sourceLayer = await promptForLayer(
    "Select layer for the active document",
    guessLayer(sourceUri)
  );
  if (!sourceLayer) {
    return;
  }

  const targetSelection = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    title: "Select linked artifact",
    openLabel: "Select"
  });

  if (!targetSelection || targetSelection.length === 0) {
    return;
  }

  const targetUri = targetSelection[0];
  const targetLayer = await promptForLayer(
    `Select layer for ${path.basename(targetUri.fsPath)}`,
    guessLayer(targetUri)
  );

  if (!targetLayer) {
    return;
  }

  const defaultKind = defaultRelationshipForLayers(sourceLayer, targetLayer);
  const relationship = await promptForRelationship(defaultKind);
  if (!relationship) {
    return;
  }

  const targetLanguage = await resolveLanguageId(targetUri);

  const request: OverrideLinkRequest = {
    source: {
      uri: sourceUri.toString(),
      layer: sourceLayer,
      languageId: editor.document.languageId
    },
    target: {
      uri: targetUri.toString(),
      layer: targetLayer,
      languageId: targetLanguage
    },
    kind: relationship,
    confidence: 1,
    reason: "manual"
  };

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Applying manual link override"
    },
    async () => {
      await client.sendRequest<OverrideLinkResponse>(OVERRIDE_LINK_REQUEST, request);
    }
  );

  void vscode.window.showInformationMessage(
    `Linked ${formatBasename(sourceUri)} to ${formatBasename(targetUri)} via '${relationship}'.`
  );
}

async function handleRebindOverride(
  client: LanguageClient,
  payload: OverrideCommandPayload
): Promise<void> {
  if (!payload.removed || !payload.impacted?.length) {
    return;
  }

  const replacementUriString = await resolveReplacementUri(payload);
  if (!replacementUriString) {
    return;
  }

  const replacementUri = vscode.Uri.parse(replacementUriString);
  const replacementLanguage = await resolveLanguageId(replacementUri);

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Rebinding impacted artifacts"
    },
    async (
      progress: vscode.Progress<{ message?: string; increment?: number }>,
      token: vscode.CancellationToken
    ) => {
      const total = payload.impacted?.length ?? 0;
      for (const [index, impacted] of payload.impacted!.entries()) {
        if (token.isCancellationRequested) {
          return;
        }
        const request = buildRebindRequest(
          impacted,
          payload.removed!,
          replacementUriString,
          replacementLanguage
        );

        await client.sendRequest<OverrideLinkResponse>(OVERRIDE_LINK_REQUEST, request);
        progress.report({
          message: `Rebound ${index + 1} of ${total}`,
          increment: total > 0 ? 100 / total : undefined
        });
      }
    }
  );

  void vscode.window.showInformationMessage(
    `Rebound ${payload.impacted.length} link${payload.impacted.length === 1 ? "" : "s"} to ${formatBasename(replacementUri)}.`
  );
}

function buildRebindRequest(
  impacted: RebindImpactedArtifact,
  removed: RebindRequiredArtifact,
  replacementUri: string,
  replacementLanguage?: string
): OverrideLinkRequest {
  const base: OverrideLinkRequest = {
    source: {
      uri: impacted.direction === "incoming" ? impacted.uri : replacementUri,
      layer: impacted.direction === "incoming" ? impacted.layer : removed.layer
    },
    target: {
      uri: impacted.direction === "incoming" ? replacementUri : impacted.uri,
      layer: impacted.direction === "incoming" ? removed.layer : impacted.layer
    },
    kind: impacted.relationship,
    confidence: 1,
    reason: "rebind"
  };

  if (impacted.direction === "incoming") {
    base.target.languageId = replacementLanguage;
  } else {
    base.source.languageId = replacementLanguage;
  }

  return base;
}

async function resolveReplacementUri(payload: OverrideCommandPayload): Promise<string | undefined> {
  if (payload.newUri) {
    const useRenamed = await vscode.window.showInformationMessage(
      `Use renamed file ${payload.newUri} for ${payload.impacted?.length ?? 0} impacted link${
        (payload.impacted?.length ?? 0) === 1 ? "" : "s"
      }?`,
      "Use renamed path",
      "Choose different file",
      "Cancel"
    );

    if (useRenamed === "Use renamed path") {
      return payload.newUri;
    }

    if (useRenamed === "Cancel" || !useRenamed) {
      return undefined;
    }
  } else {
    const action = await vscode.window.showInformationMessage(
      `Select a replacement for ${payload.removed?.uri}?`,
      "Select replacement",
      "Leave unlinked"
    );

    if (action !== "Select replacement") {
      return undefined;
    }
  }

  const selection = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    title: "Select replacement artifact",
    openLabel: "Select"
  });

  if (!selection || selection.length === 0) {
    return undefined;
  }

  return selection[0].toString();
}

function guessLayer(uri: vscode.Uri): ArtifactLayer {
  const extension = path.extname(uri.fsPath).toLowerCase();

  if (extension === ".md" || extension === ".markdown") {
    return "requirements";
  }

  return "code";
}

async function promptForLayer(
  placeholder: string,
  defaultLayer: ArtifactLayer
): Promise<ArtifactLayer | undefined> {
  const items = LAYER_OPTIONS.map(layer => ({
    label: toTitleCase(layer),
    description: layer === defaultLayer ? "(default)" : undefined,
    value: layer
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: placeholder
  });

  return selected?.value;
}

function defaultRelationshipForLayers(
  source: ArtifactLayer,
  target: ArtifactLayer
): LinkRelationshipKind {
  const sourceIsDoc = isDocumentationLayer(source);
  const targetIsDoc = isDocumentationLayer(target);

  if (sourceIsDoc && !targetIsDoc) {
    return "documents";
  }

  if (!sourceIsDoc && targetIsDoc) {
    return "implements";
  }

  if (!sourceIsDoc && !targetIsDoc) {
    return "depends_on";
  }

  return "references";
}

async function promptForRelationship(
  defaultKind: LinkRelationshipKind
): Promise<LinkRelationshipKind | undefined> {
  const items = RELATIONSHIP_OPTIONS.map(kind => ({
    label: toTitleCase(kind.replace("_", " ")),
    description: kind === defaultKind ? "(default)" : undefined,
    value: kind
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: "Select relationship type"
  });

  return selected?.value;
}

function isDocumentationLayer(layer: ArtifactLayer): boolean {
  return layer !== "code";
}

function toTitleCase(value: string): string {
  return value
    .split(/[ _]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function resolveLanguageId(uri: vscode.Uri): Promise<string | undefined> {
  try {
    const document = await vscode.workspace.openTextDocument(uri);
    return document.languageId;
  } catch {
    return undefined;
  }
}

function formatBasename(uri: vscode.Uri): string {
  return path.basename(uri.fsPath);
}
