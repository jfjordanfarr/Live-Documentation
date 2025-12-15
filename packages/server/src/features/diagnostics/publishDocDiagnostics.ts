import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  Diagnostic,
  DiagnosticSeverity
} from "vscode-languageserver/node";

import type { KnowledgeArtifact } from "@live-documentation/shared";

import type { AcknowledgementService } from "./acknowledgementService";
import { normaliseDisplayPath, type DiagnosticSender } from "./diagnosticUtils";
import type { HysteresisController } from "./hysteresisController";
import { applyNoiseFilter, type NoiseFilterTotals, ZERO_NOISE_FILTER_TOTALS } from "./noiseFilter";
import type { RippleImpact } from "./rippleTypes";
import type { RuntimeSettings } from "../settings/settingsBridge";
import type { DocumentTrackedArtifactChange } from "../watchers/artifactWatcher";

export interface DocumentChangeContext {
  change: DocumentTrackedArtifactChange;
  artifact: KnowledgeArtifact;
  changeEventId: string;
  rippleImpacts: RippleImpact[];
}

export interface PublishDocDiagnosticsOptions {
  sender: DiagnosticSender;
  contexts: DocumentChangeContext[];
  runtimeSettings: RuntimeSettings;
  hysteresis?: HysteresisController;
  acknowledgements?: AcknowledgementService;
}

export interface PublishDocDiagnosticsResult {
  emitted: number;
  suppressedByBudget: number;
  suppressedByHysteresis: number;
  suppressedByAcknowledgement: number;
  noiseFilter: NoiseFilterTotals;
  emittedByChange: Record<string, number>;
}

export function publishDocDiagnostics(
  options: PublishDocDiagnosticsOptions
): PublishDocDiagnosticsResult {
  if (options.contexts.length === 0) {
    return {
      emitted: 0,
      suppressedByBudget: 0,
      suppressedByHysteresis: 0,
      suppressedByAcknowledgement: 0,
      noiseFilter: { ...ZERO_NOISE_FILTER_TOTALS },
      emittedByChange: {}
    };
  }

  const filterOutcome = applyNoiseFilter(options.contexts, options.runtimeSettings.noiseSuppression.filter);
  const contexts = filterOutcome.contexts;
  const diagnosticsByUri = new Map<string, Diagnostic[]>();
  let emitted = 0;
  let suppressedByBudget = 0;
  let suppressedByHysteresis = 0;
  let suppressedByAcknowledgement = 0;
  let remaining = options.runtimeSettings.noiseSuppression.maxDiagnosticsPerBatch;
  const hysteresisWindow = options.runtimeSettings.noiseSuppression.hysteresisMs;
  const acknowledgementService = options.acknowledgements;
  const emittedByChange: Record<string, number> = {};
  for (const context of contexts) {
    const brokenLinkDiagnostics = collectBrokenLinkDiagnostics(context);
    if (brokenLinkDiagnostics.length > 0) {
      const bucket = diagnosticsByUri.get(context.artifact.uri) ?? [];
      bucket.push(...brokenLinkDiagnostics);
      diagnosticsByUri.set(context.artifact.uri, bucket);
      emitted += brokenLinkDiagnostics.length;
      emittedByChange[context.changeEventId] =
        (emittedByChange[context.changeEventId] ?? 0) + brokenLinkDiagnostics.length;
    }

    if (context.rippleImpacts.length === 0) {
      continue;
    }

    for (const impact of context.rippleImpacts) {
      const targetUri = impact.target.uri ?? impact.hint.targetUri;
      if (!targetUri) {
        continue;
      }

      if (
        options.hysteresis?.shouldSuppress(
          context.artifact.uri,
          targetUri,
          hysteresisWindow
        )
      ) {
        suppressedByHysteresis += 1;
        continue;
      }

      if (
        acknowledgementService &&
        impact.target.id &&
        context.artifact.id &&
        !acknowledgementService.shouldEmitDiagnostic({
          changeEventId: context.changeEventId,
          triggerArtifactId: context.artifact.id,
          targetArtifactId: impact.target.id
        })
      ) {
        suppressedByAcknowledgement += 1;
        continue;
      }

      if (remaining <= 0) {
        suppressedByBudget += 1;
        continue;
      }

      const diagnostic = createDiagnostic(context.artifact, impact, context.changeEventId);
      const existing = diagnosticsByUri.get(targetUri) ?? [];
      existing.push(diagnostic);
      diagnosticsByUri.set(targetUri, existing);
      emitted += 1;
      remaining -= 1;
      emittedByChange[context.changeEventId] =
        (emittedByChange[context.changeEventId] ?? 0) + 1;

      options.hysteresis?.recordEmission(
        context.artifact.uri,
        targetUri,
        context.changeEventId
      );

      if (acknowledgementService && impact.target.id && context.artifact.id) {
        const record = acknowledgementService.registerEmission({
          changeEventId: context.changeEventId,
          triggerArtifactId: context.artifact.id,
          targetArtifactId: impact.target.id,
          message: diagnostic.message,
          severity: "info",
          linkIds: []
        });

        (diagnostic as Diagnostic & { data: Record<string, unknown> }).data = {
          ...(diagnostic.data as Record<string, unknown>),
          recordId: record.id,
          changeEventId: context.changeEventId,
          triggerArtifactId: context.artifact.id,
          targetArtifactId: impact.target.id
        };
      }
    }
  }

  for (const [uri, diagnostics] of diagnosticsByUri.entries()) {
    options.sender.sendDiagnostics({ uri, diagnostics });
  }

  return {
    emitted,
    suppressedByBudget,
    suppressedByHysteresis,
    suppressedByAcknowledgement,
    noiseFilter: filterOutcome.totals,
    emittedByChange
  };
}

function createDiagnostic(
  sourceArtifact: KnowledgeArtifact,
  impact: RippleImpact,
  changeEventId: string
): Diagnostic {
  const docPath = normaliseDisplayPath(sourceArtifact.uri);
  const targetPath = normaliseDisplayPath(impact.target.uri ?? impact.hint.targetUri ?? "");
  const relationshipLabel = impact.hint.kind ? ` (${impact.hint.kind})` : "";
  const depth = impact.hint.depth ?? 1;
  const depthLabel = depth > 1 ? ` (depth ${depth})` : "";
  const rationale = impact.hint.rationale ? ` ${impact.hint.rationale}` : "";

  return {
    severity: DiagnosticSeverity.Information,
    range: {
      start: { line: 0, character: 0 },
      end: { line: 0, character: 1 }
    },
    message: `linked documentation changed${relationshipLabel}: ${docPath} -> ${targetPath}${depthLabel}.${rationale}`.trim(),
    source: "live-documentation",
    code: "doc-drift",
    data: {
      triggerUri: sourceArtifact.uri,
      targetUri: impact.target.uri ?? impact.hint.targetUri,
      relationshipKind: impact.hint.kind,
      confidence: impact.hint.confidence,
      depth,
      path: impact.hint.path,
      changeEventId
    }
  };
}

const MARKDOWN_LINK_REGEX = /!?\[[^\]]*\]\((?<path>[^)]+)\)/g;
const URL_SCHEME_PATTERN = /^[a-z]+:\/\//i;

function collectBrokenLinkDiagnostics(context: DocumentChangeContext): Diagnostic[] {
  const content = context.change.content;
  if (!content) {
    return [];
  }

  const basePath = resolveFilePath(context.artifact.uri ?? context.change.uri);
  if (!basePath) {
    return [];
  }

  const baseDir = path.dirname(basePath);
  const missingTargets = new Set<string>();

  for (const linkPath of extractMarkdownLinks(content)) {
    const absolutePath = path.resolve(baseDir, linkPath);
    if (!fs.existsSync(absolutePath)) {
      missingTargets.add(absolutePath);
    }
  }

  if (missingTargets.size === 0) {
    return [];
  }

  const diagnostics: Diagnostic[] = [];
  const sourcePath = normaliseDisplayPath(context.artifact.uri);

  for (const targetPath of missingTargets) {
    const targetUri = pathToFileURL(targetPath).toString();
    diagnostics.push({
      severity: DiagnosticSeverity.Warning,
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 1 }
      },
      message: `linked documentation missing: ${normaliseDisplayPath(targetUri)} (referenced by ${sourcePath}).`,
      source: "live-documentation",
      code: "doc-drift",
      data: {
        triggerUri: targetUri,
        targetUri: context.artifact.uri,
        relationshipKind: "references",
        depth: 1,
        path: [targetUri, context.artifact.uri],
        changeEventId: context.changeEventId
      }
    });
  }

  return diagnostics;
}

function extractMarkdownLinks(content: string): string[] {
  const results: string[] = [];
  const pattern = new RegExp(MARKDOWN_LINK_REGEX.source, MARKDOWN_LINK_REGEX.flags);
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    const candidate = match.groups?.path ?? match[1];
    const sanitised = sanitiseLink(candidate);
    if (sanitised) {
      results.push(sanitised);
    }
  }
  return results;
}

function sanitiseLink(raw: string | undefined): string | null {
  if (!raw) {
    return null;
  }
  const trimmed = raw.trim();
  if (!trimmed || URL_SCHEME_PATTERN.test(trimmed) || trimmed.startsWith("#")) {
    return null;
  }

  const withoutFragment = trimmed.replace(/[#?].*$/, "");
  if (!withoutFragment) {
    return null;
  }

  return withoutFragment.replace(/\\/g, "/");
}

function resolveFilePath(uri: string | undefined): string | null {
  if (!uri) {
    return null;
  }

  try {
    if (uri.startsWith("file://")) {
      return fileURLToPath(uri);
    }
  } catch {
    return null;
  }

  return path.resolve(uri);
}

