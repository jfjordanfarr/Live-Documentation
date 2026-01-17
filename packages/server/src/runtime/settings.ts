// Live Documentation: .mdmd/layer-4/language-server-runtime/languageServerRuntime.mdmd.md#source-breadcrumbs
import type { LinkRelationshipKind } from "@live-documentation/shared/domain/artifacts";

import { ExtensionSettings } from "../features/settings/providerGuard";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLlmProviderMode(
  value: unknown
): value is NonNullable<ExtensionSettings["llmProviderMode"]> {
  return value === "prompt" || value === "local-only" || value === "disabled";
}

function isNoiseSuppressionLevel(value: unknown): value is "low" | "medium" | "high" {
  return value === "low" || value === "medium" || value === "high";
}

function isLinkRelationshipKind(value: unknown): value is LinkRelationshipKind {
  return (
    value === "depends_on" ||
    value === "implements" ||
    value === "documents" ||
    value === "references" ||
    value === "includes"
  );
}

function extractNoiseSuppressionSettings(
  value: unknown
): NonNullable<ExtensionSettings["noiseSuppression"]> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const record = value;
  const noise: NonNullable<ExtensionSettings["noiseSuppression"]> = {};
  let hasSettings = false;

  if (isNoiseSuppressionLevel(record.level)) {
    noise.level = record.level;
    hasSettings = true;
  }

  if (typeof record.minConfidence === "number") {
    noise.minConfidence = record.minConfidence;
    hasSettings = true;
  }

  if (typeof record.maxDepth === "number") {
    noise.maxDepth = record.maxDepth;
    hasSettings = true;
  }

  if (typeof record.maxPerChange === "number") {
    noise.maxPerChange = record.maxPerChange;
    hasSettings = true;
  }

  if (typeof record.maxPerArtifact === "number") {
    noise.maxPerArtifact = record.maxPerArtifact;
    hasSettings = true;
  }

  return hasSettings ? noise : undefined;
}

export function extractExtensionSettings(source: unknown): ExtensionSettings | undefined {
  if (!isRecord(source)) {
    return undefined;
  }

  const sourceRecord = source;

  const base =
    "settings" in sourceRecord && isRecord(sourceRecord.settings)
      ? sourceRecord.settings
      : sourceRecord;

  if (!isRecord(base)) {
    return undefined;
  }

  const container =
    "linkAwareDiagnostics" in base && isRecord(base.linkAwareDiagnostics)
      ? base.linkAwareDiagnostics
      : base;

  if (!isRecord(container)) {
    return undefined;
  }

  const record = container;
  const settings: ExtensionSettings = {};

  if (typeof record.storagePath === "string") {
    settings.storagePath = record.storagePath;
  }

  if (typeof record.enableDiagnostics === "boolean") {
    settings.enableDiagnostics = record.enableDiagnostics;
  }

  if (typeof record.debounceMs === "number") {
    settings.debounceMs = record.debounceMs;
  }

  if (isLlmProviderMode(record.llmProviderMode)) {
    settings.llmProviderMode = record.llmProviderMode;
  }

  const noiseSuppression = extractNoiseSuppressionSettings(record.noiseSuppression);
  if (noiseSuppression) {
    settings.noiseSuppression = noiseSuppression;
  }

  if (isRecord(record.ripple)) {
    const rippleRecord = record.ripple;
    const ripple: NonNullable<ExtensionSettings["ripple"]> = {};

    if ("maxDepth" in rippleRecord && typeof rippleRecord.maxDepth === "number") {
      ripple.maxDepth = rippleRecord.maxDepth;
    }

    if ("maxResults" in rippleRecord && typeof rippleRecord.maxResults === "number") {
      ripple.maxResults = rippleRecord.maxResults;
    }

    if ("allowedKinds" in rippleRecord && Array.isArray(rippleRecord.allowedKinds)) {
      ripple.allowedKinds = rippleRecord.allowedKinds.filter(isLinkRelationshipKind);
    }

    if ("documentKinds" in rippleRecord && Array.isArray(rippleRecord.documentKinds)) {
      ripple.documentKinds = rippleRecord.documentKinds.filter(isLinkRelationshipKind);
    }

    if ("codeKinds" in rippleRecord && Array.isArray(rippleRecord.codeKinds)) {
      ripple.codeKinds = rippleRecord.codeKinds.filter(isLinkRelationshipKind);
    }

    if (
      ripple.maxDepth !== undefined ||
      ripple.maxResults !== undefined ||
      ripple.allowedKinds?.length ||
      ripple.documentKinds?.length ||
      ripple.codeKinds?.length
    ) {
      settings.ripple = ripple;
    }
  }

  return settings;
}

export function extractTestModeOverrides(source: unknown): ExtensionSettings | undefined {
  if (!isRecord(source)) {
    return undefined;
  }

  const candidate = "testModeOverrides" in source ? source.testModeOverrides : undefined;
  if (!isRecord(candidate)) {
    return undefined;
  }

  const overrides: ExtensionSettings = {};

  if (typeof candidate.enableDiagnostics === "boolean") {
    overrides.enableDiagnostics = candidate.enableDiagnostics;
  }

  if (isLlmProviderMode(candidate.llmProviderMode)) {
    overrides.llmProviderMode = candidate.llmProviderMode;
  }

  const noiseSuppression = extractNoiseSuppressionSettings(candidate.noiseSuppression);
  if (noiseSuppression) {
    overrides.noiseSuppression = noiseSuppression;
  }

  if (isRecord(candidate.ripple)) {
    const rippleRecord = candidate.ripple;
    const ripple: NonNullable<ExtensionSettings["ripple"]> = {};

    if ("maxDepth" in rippleRecord && typeof rippleRecord.maxDepth === "number") {
      ripple.maxDepth = rippleRecord.maxDepth;
    }

    if ("maxResults" in rippleRecord && typeof rippleRecord.maxResults === "number") {
      ripple.maxResults = rippleRecord.maxResults;
    }

    if ("allowedKinds" in rippleRecord && Array.isArray(rippleRecord.allowedKinds)) {
      ripple.allowedKinds = rippleRecord.allowedKinds.filter(isLinkRelationshipKind);
    }

    if ("documentKinds" in rippleRecord && Array.isArray(rippleRecord.documentKinds)) {
      ripple.documentKinds = rippleRecord.documentKinds.filter(isLinkRelationshipKind);
    }

    if ("codeKinds" in rippleRecord && Array.isArray(rippleRecord.codeKinds)) {
      ripple.codeKinds = rippleRecord.codeKinds.filter(isLinkRelationshipKind);
    }

    if (
      ripple.maxDepth !== undefined ||
      ripple.maxResults !== undefined ||
      ripple.allowedKinds?.length ||
      ripple.documentKinds?.length ||
      ripple.codeKinds?.length
    ) {
      overrides.ripple = ripple;
    }
  }

  return overrides;
}

export function mergeExtensionSettings(
  base: ExtensionSettings | undefined,
  overrides: ExtensionSettings | undefined
): ExtensionSettings {
  return { ...(base ?? {}), ...(overrides ?? {}) };
}
