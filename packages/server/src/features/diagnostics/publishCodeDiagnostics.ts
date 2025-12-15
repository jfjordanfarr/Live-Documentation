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
import type { CodeTrackedArtifactChange } from "../watchers/artifactWatcher";

export interface CodeChangeContext {
  change: CodeTrackedArtifactChange;
  artifact: KnowledgeArtifact;
  changeEventId: string;
  rippleImpacts: RippleImpact[];
}

export interface PublishCodeDiagnosticsOptions {
  sender: DiagnosticSender;
  contexts: CodeChangeContext[];
  runtimeSettings: RuntimeSettings;
  hysteresis?: HysteresisController;
  acknowledgements?: AcknowledgementService;
}

export interface PublishCodeDiagnosticsResult {
  emitted: number;
  suppressedByBudget: number;
  suppressedByHysteresis: number;
  withoutDependents: number;
  suppressedByAcknowledgement: number;
  noiseFilter: NoiseFilterTotals;
  emittedByChange: Record<string, number>;
}

const DIAGNOSTIC_CODE = "code-ripple";
const ZERO_RANGE = {
  start: { line: 0, character: 0 },
  end: { line: 0, character: 1 }
};

export function publishCodeDiagnostics(
  options: PublishCodeDiagnosticsOptions
): PublishCodeDiagnosticsResult {
  if (options.contexts.length === 0) {
    return {
      emitted: 0,
      suppressedByBudget: 0,
      suppressedByHysteresis: 0,
      withoutDependents: 0,
      suppressedByAcknowledgement: 0,
      noiseFilter: { ...ZERO_NOISE_FILTER_TOTALS },
      emittedByChange: {}
    };
  }

  const filterOutcome = applyNoiseFilter(options.contexts, options.runtimeSettings.noiseSuppression.filter);
  const filteredContexts = filterOutcome.contexts;
  const diagnosticsByUri = new Map<string, Diagnostic[]>();
  const budget = options.runtimeSettings.noiseSuppression.maxDiagnosticsPerBatch;
  let remaining = budget;
  let emitted = 0;
  let suppressedByBudget = 0;
  let suppressedByHysteresis = 0;
  let withoutDependents = 0;
  let suppressedByAcknowledgement = 0;
  const acknowledgementService = options.acknowledgements;
  const emittedByChange: Record<string, number> = {};

  for (let index = 0; index < filteredContexts.length; index += 1) {
    const context = filteredContexts[index];
    if (context.rippleImpacts.length === 0) {
      if (options.contexts[index]?.rippleImpacts.length === 0) {
        withoutDependents += 1;
      }
      continue;
    }

    for (const impact of context.rippleImpacts) {
      const dependentUri = impact.target.uri ?? impact.hint.targetUri;
      if (!dependentUri) {
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

      if (
        options.hysteresis?.shouldSuppress(
          context.artifact.uri,
          dependentUri,
          options.runtimeSettings.noiseSuppression.hysteresisMs
        )
      ) {
        suppressedByHysteresis += 1;
        continue;
      }

      const diagnostic = createDiagnostic(context, impact);
      const existing = diagnosticsByUri.get(dependentUri) ?? [];
      existing.push(diagnostic);
      diagnosticsByUri.set(dependentUri, existing);
      emitted += 1;
      remaining -= 1;
      emittedByChange[context.changeEventId] =
        (emittedByChange[context.changeEventId] ?? 0) + 1;

      options.hysteresis?.recordEmission(context.artifact.uri, dependentUri, context.changeEventId);

      if (acknowledgementService && impact.target.id && context.artifact.id) {
        const record = acknowledgementService.registerEmission({
          changeEventId: context.changeEventId,
          triggerArtifactId: context.artifact.id,
          targetArtifactId: impact.target.id,
          message: diagnostic.message,
          severity: "warning",
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
    withoutDependents,
    suppressedByAcknowledgement,
    noiseFilter: filterOutcome.totals,
    emittedByChange
  };
}

function createDiagnostic(context: CodeChangeContext, impact: RippleImpact): Diagnostic {
  const triggerPath = normaliseDisplayPath(context.artifact.uri);
  const dependentPath = normaliseDisplayPath(impact.target.uri ?? impact.hint.targetUri ?? "");
  const depth = impact.hint.depth ?? 1;
  const relationshipLabel = impact.hint.kind ? ` (${impact.hint.kind})` : "";
  const confidenceLabel = formatConfidence(impact.hint.confidence);
  const pathLabel = describeIntermediatePath(impact.hint.path, dependentPath);
  const rationale = impact.hint.rationale ? ` ${impact.hint.rationale}` : "";

  const metadataParts = [
    impact.hint.kind ? `relationship ${impact.hint.kind}` : undefined,
    confidenceLabel ? `confidence ${confidenceLabel}` : undefined,
    depth ? `depth ${depth}` : undefined,
    pathLabel ? `path ${pathLabel}` : undefined
  ].filter((part): part is string => Boolean(part));

  const metadata = metadataParts.length > 0 ? ` [${metadataParts.join("; ")}]` : "";

  return {
    severity: DiagnosticSeverity.Warning,
    range: ZERO_RANGE,
    message: `linked dependency changed${relationshipLabel} in ${triggerPath}. Review ${dependentPath} for compatibility.${metadata}${rationale}`.trim(),
    source: "live-documentation",
    code: DIAGNOSTIC_CODE,
    data: {
      triggerUri: context.artifact.uri,
      dependentUri: impact.target.uri ?? impact.hint.targetUri,
      relationshipKind: impact.hint.kind,
      confidence: impact.hint.confidence,
      depth,
      path: impact.hint.path,
      changeEventId: context.changeEventId
    }
  };
}

function describeIntermediatePath(path: string[] | undefined, dependentPath: string): string {
  if (!path || path.length <= 1) {
    return "";
  }

  const segments = path
    .slice(0, path.length - 1)
    .map((uri) => normaliseDisplayPath(uri))
    .filter((segment) => segment !== dependentPath);

  if (segments.length === 0) {
    return "";
  }

  return segments.join(" -> ");
}

function formatConfidence(confidence: number | undefined): string | undefined {
  if (typeof confidence !== "number" || Number.isNaN(confidence)) {
    return undefined;
  }

  return `${Math.round(confidence * 100)}%`;
}
