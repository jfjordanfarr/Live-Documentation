import type { LinkRelationshipKind } from "@live-documentation/shared/domain/artifacts";

import { ExtensionSettings } from "./providerGuard";

/** Preset intensity level for diagnostic noise suppression. */
export type NoiseSuppressionLevel = "low" | "medium" | "high";

/**
 * Concrete noise-filter thresholds applied at runtime.
 */
export interface NoiseFilterRuntimeConfig {
  /** Minimum confidence score for a diagnostic to be emitted. */
  minConfidence: number;
  /** Maximum graph traversal depth for ripple analysis. */
  maxDepth?: number;
  /** Maximum diagnostics per single file change. */
  maxPerChange?: number;
  /** Maximum diagnostics per impacted artifact. */
  maxPerArtifact?: number;
}

/**
 * Fully resolved noise-suppression settings including the preset level,
 * batch limits, hysteresis window, and filter thresholds.
 */
export interface NoiseSuppressionRuntime {
  level: NoiseSuppressionLevel;
  /** Maximum diagnostics published per debounce cycle. */
  maxDiagnosticsPerBatch: number;
  /** Minimum milliseconds between diagnostic publications. */
  hysteresisMs: number;
  /** Concrete filter thresholds. */
  filter: NoiseFilterRuntimeConfig;
}

/**
 * Resolved ripple (change-impact) traversal settings.
 */
export interface RippleRuntimeSettings {
  /** Maximum hop count for ripple propagation. */
  maxDepth: number;
  /** Maximum impacted files returned. */
  maxResults: number;
  /** Relationship kinds eligible for traversal. */
  allowedKinds: LinkRelationshipKind[];
  /** Subset of allowed kinds used for document-type links. */
  documentKinds: LinkRelationshipKind[];
  /** Subset of allowed kinds used for code-type links. */
  codeKinds: LinkRelationshipKind[];
}

/**
 * Concrete runtime settings used by the language server, derived from
 * user-facing {@link ExtensionSettings} via {@link deriveRuntimeSettings}.
 */
export interface RuntimeSettings {
  /** Debounce interval in milliseconds before processing changes. */
  debounceMs: number;
  /** Resolved noise-suppression configuration. */
  noiseSuppression: NoiseSuppressionRuntime;
  /** Resolved ripple traversal settings. */
  ripple: RippleRuntimeSettings;
}

/** Sensible defaults applied when no user settings are provided. */
export const DEFAULT_RUNTIME_SETTINGS: RuntimeSettings = {
  debounceMs: 1000,
  noiseSuppression: {
    level: "medium",
    maxDiagnosticsPerBatch: 20,
    hysteresisMs: 1500,
    filter: {
      minConfidence: 0.35,
      maxDepth: 3,
      maxPerChange: 10,
      maxPerArtifact: 4
    }
  },
  ripple: {
    maxDepth: 3,
    maxResults: 50,
    allowedKinds: ["depends_on", "implements", "documents", "references", "includes"],
    documentKinds: ["depends_on", "implements", "documents", "references", "includes"],
    codeKinds: ["depends_on", "implements", "references", "includes"]
  }
};

interface NoiseSuppressionPreset {
  maxDiagnosticsPerBatch: number;
  hysteresisMs: number;
  filter: NoiseFilterRuntimeConfig;
}

const NOISE_PRESETS: Record<NoiseSuppressionLevel, NoiseSuppressionPreset> = {
  low: {
    maxDiagnosticsPerBatch: 50,
    hysteresisMs: 750,
    filter: {
      minConfidence: 0.1,
      maxPerChange: 20,
      maxPerArtifact: 8
    }
  },
  medium: {
    maxDiagnosticsPerBatch: 20,
    hysteresisMs: 1500,
    filter: {
      minConfidence: 0.35,
      maxDepth: 3,
      maxPerChange: 10,
      maxPerArtifact: 4
    }
  },
  high: {
    maxDiagnosticsPerBatch: 10,
    hysteresisMs: 2500,
    filter: {
      minConfidence: 0.6,
      maxDepth: 3,
      maxPerChange: 6,
      maxPerArtifact: 2
    }
  }
};

const LINK_KIND_VALUES = new Set<LinkRelationshipKind>([
  "depends_on",
  "implements",
  "documents",
  "references",
  "includes"
]);

function clampConfidence(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

function coerceConfidence(value: unknown): number | undefined {
  if (typeof value !== "number") {
    return undefined;
  }
  const clamped = clampConfidence(value);
  return clamped;
}

function coercePositiveInteger(value: unknown): number | undefined {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }
  const integer = Math.floor(value);
  if (integer <= 0) {
    return undefined;
  }
  return integer;
}

function normaliseLinkKinds(
  input: LinkRelationshipKind[] | undefined,
  fallback: LinkRelationshipKind[]
): LinkRelationshipKind[] {
  if (!input?.length) {
    return fallback;
  }

  const filtered = input.filter(kind => LINK_KIND_VALUES.has(kind));
  return filtered.length > 0 ? Array.from(new Set(filtered)) : fallback;
}

/**
 * Normalises raw {@link ExtensionSettings} from the VS Code client into
 * concrete {@link RuntimeSettings} used by the language server.
 *
 * Applies preset-based defaults for noise suppression, validates and clamps
 * numeric inputs, and filters link kinds against the allowed set.
 *
 * @param settings - Raw extension settings; defaults are used when absent.
 * @returns Fully resolved runtime settings.
 */
export function deriveRuntimeSettings(settings?: ExtensionSettings): RuntimeSettings {
  const debounceOverride =
    typeof settings?.debounceMs === "number" && settings.debounceMs >= 0
      ? settings.debounceMs
      : DEFAULT_RUNTIME_SETTINGS.debounceMs;

  const levelCandidate = settings?.noiseSuppression?.level;
  const level: NoiseSuppressionLevel =
    levelCandidate === "low" || levelCandidate === "medium" || levelCandidate === "high"
      ? levelCandidate
      : DEFAULT_RUNTIME_SETTINGS.noiseSuppression.level;

  const preset = NOISE_PRESETS[level];

  const rippleSettings = settings?.ripple;
  const maxDepth =
    typeof rippleSettings?.maxDepth === "number" && rippleSettings.maxDepth > 0
      ? Math.floor(rippleSettings.maxDepth)
      : DEFAULT_RUNTIME_SETTINGS.ripple.maxDepth;
  const maxResults =
    typeof rippleSettings?.maxResults === "number" && rippleSettings.maxResults > 0
      ? Math.floor(rippleSettings.maxResults)
      : DEFAULT_RUNTIME_SETTINGS.ripple.maxResults;

  const allowedKinds = normaliseLinkKinds(
    rippleSettings?.allowedKinds,
    DEFAULT_RUNTIME_SETTINGS.ripple.allowedKinds
  );
  const filterByAllowed = (kinds: LinkRelationshipKind[]): LinkRelationshipKind[] =>
    kinds.filter(kind => allowedKinds.includes(kind));

  const documentKindsCandidate = filterByAllowed(
    normaliseLinkKinds(
      rippleSettings?.documentKinds,
      DEFAULT_RUNTIME_SETTINGS.ripple.documentKinds
    )
  );
  const documentKinds =
    documentKindsCandidate.length > 0
      ? documentKindsCandidate
      : filterByAllowed(DEFAULT_RUNTIME_SETTINGS.ripple.documentKinds);

  const codeKindsCandidate = filterByAllowed(
    normaliseLinkKinds(rippleSettings?.codeKinds, DEFAULT_RUNTIME_SETTINGS.ripple.codeKinds)
  );
  const codeKinds =
    codeKindsCandidate.length > 0
      ? codeKindsCandidate
      : filterByAllowed(DEFAULT_RUNTIME_SETTINGS.ripple.codeKinds);

  const noiseOverrides = settings?.noiseSuppression;
  const minConfidenceOverride = coerceConfidence(noiseOverrides?.minConfidence);
  let maxDepthOverride = coercePositiveInteger(noiseOverrides?.maxDepth);
  const maxPerChangeOverride = coercePositiveInteger(noiseOverrides?.maxPerChange);
  const maxPerArtifactOverride = coercePositiveInteger(noiseOverrides?.maxPerArtifact);

  if (maxDepthOverride !== undefined && maxDepthOverride > maxDepth) {
    maxDepthOverride = maxDepth;
  }

  const runtime: RuntimeSettings = {
    debounceMs: debounceOverride,
    noiseSuppression: {
      level,
      maxDiagnosticsPerBatch: preset.maxDiagnosticsPerBatch,
      hysteresisMs: preset.hysteresisMs,
      filter: {
        minConfidence: minConfidenceOverride ?? preset.filter.minConfidence,
        maxDepth: maxDepthOverride ?? preset.filter.maxDepth,
        maxPerChange: maxPerChangeOverride ?? preset.filter.maxPerChange,
        maxPerArtifact: maxPerArtifactOverride ?? preset.filter.maxPerArtifact
      }
    },
    ripple: {
      maxDepth,
      maxResults,
      allowedKinds,
      documentKinds,
      codeKinds
    }
  };

  const filterMaxDepth = runtime.noiseSuppression.filter.maxDepth;
  if (typeof filterMaxDepth === "number" && filterMaxDepth > runtime.ripple.maxDepth) {
    runtime.noiseSuppression.filter.maxDepth = runtime.ripple.maxDepth;
  }

  return runtime;
}
