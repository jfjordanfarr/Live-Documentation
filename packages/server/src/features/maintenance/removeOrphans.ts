import { Connection, Diagnostic, DiagnosticSeverity } from "vscode-languageserver/node";

import {
  GraphStore,
  LinkedArtifactSummary,
  RebindRequiredPayload,
  RebindImpactedArtifact,
  RebindReason
} from "@live-documentation/shared";

import { normaliseDisplayPath, type DiagnosticSender } from "../diagnostics/diagnosticUtils";
import { normalizeFileUri } from "../utils/uri";

const REBIND_NOTIFICATION = "linkDiagnostics/maintenance/rebindRequired";

export function handleArtifactDeleted(
  connection: Connection,
  store: GraphStore,
  uri: string,
  diagnostics: DiagnosticSender
): void {
  handleRemoval(connection, store, uri, "delete", diagnostics);
}

export function handleArtifactRenamed(
  connection: Connection,
  store: GraphStore,
  oldUri: string,
  newUri: string,
  diagnostics: DiagnosticSender
): void {
  handleRemoval(connection, store, oldUri, "rename", diagnostics, newUri);
}

function handleRemoval(
  connection: Connection,
  store: GraphStore,
  uri: string,
  reason: RebindReason,
  diagnostics: DiagnosticSender,
  newUri?: string
): void {
  const canonicalUri = normalizeFileUri(uri);
  const canonicalNewUri = newUri ? normalizeFileUri(newUri) : undefined;

  const artifact = store.getArtifactByUri(canonicalUri);
  if (!artifact) {
    connection.console.info(`no artifact registered for ${canonicalUri}; skipping orphan cleanup`);
    return;
  }

  const linked = store.listLinkedArtifacts(artifact.id);
  store.removeArtifact(artifact.id);

  if (linked.length === 0) {
    connection.console.info(`no linked artifacts remained after removing ${uri}`);
    return;
  }

  publishRemovalDiagnostics(diagnostics, artifact.uri, linked, reason, canonicalNewUri);

  const impacted: RebindImpactedArtifact[] = linked.map(toImpactedArtifact);

  const payload: RebindRequiredPayload = {
    removed: { uri: artifact.uri, layer: artifact.layer },
    reason,
    newUri: canonicalNewUri,
    impacted
  };

  void connection.sendNotification(REBIND_NOTIFICATION, payload);
}

function toImpactedArtifact(summary: LinkedArtifactSummary): RebindImpactedArtifact {
  return {
    uri: summary.artifact.uri,
    layer: summary.artifact.layer,
    relationship: summary.kind,
    direction: summary.direction
  };
}

function publishRemovalDiagnostics(
  diagnosticsSender: DiagnosticSender,
  removedUri: string,
  linked: LinkedArtifactSummary[],
  reason: RebindReason,
  newUri?: string
): void {
  const diagnosticsByUri = new Map<string, Diagnostic[]>();
  const removedPath = normaliseDisplayPath(removedUri);
  const renameSuffix = reason === "rename" && newUri ? ` → ${normaliseDisplayPath(newUri)}` : "";

  for (const summary of linked) {
    const targetUri = summary.artifact.uri;
    const diagnostics = diagnosticsByUri.get(targetUri) ?? [];

    const message = `linked documentation changed: ${removedPath}${renameSuffix} is unavailable.`;
    diagnostics.push({
      severity: DiagnosticSeverity.Information,
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 1 }
      },
      message,
      source: "live-documentation",
      code: "doc-drift",
      data: {
        triggerUri: removedUri,
        targetUri,
        relationshipKind: summary.kind,
        depth: 1,
        path: [removedUri, targetUri],
        linkKind: summary.kind
      }
    });

    diagnosticsByUri.set(targetUri, diagnostics);
  }

  for (const [uri, diagnostics] of diagnosticsByUri.entries()) {
    diagnosticsSender.sendDiagnostics({ uri, diagnostics });
  }
}
