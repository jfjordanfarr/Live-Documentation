import path from "node:path";

import type { HeuristicArtifact } from "../fallbackHeuristicTypes";
import {
  buildReferenceVariants,
  cleanupReference,
  evaluateVariantMatch,
  isExternalLink,
  toComparablePath,
} from "./shared";

/**
 * Result of resolving a raw reference string against the workspace artifact list.
 * Carries the matched target, a confidence score, and a human-readable rationale.
 */
export interface ReferenceResolution {
  target: HeuristicArtifact;
  confidence: number;
  rationale: string;
}

/**
 * Resolves a raw reference (e.g. an import path, a link target) against
 * the workspace artifact list using variant expansion and fuzzy matching.
 *
 * Returns the highest-confidence {@link ReferenceResolution} or `null`
 * when no candidate exceeds the minimum match threshold.
 */
export function resolveReference(
  rawReference: string,
  source: HeuristicArtifact,
  candidates: readonly HeuristicArtifact[],
  rationale: string
): ReferenceResolution | null {
  const reference = cleanupReference(rawReference);
  if (!reference || isExternalLink(reference)) {
    return null;
  }

  const anchorStripped = reference.split("#")[0];
  const sourceDir = path.dirname(source.comparablePath);
  const variants = buildReferenceVariants(anchorStripped, sourceDir);

  let selected: ReferenceResolution | null = null;

  for (const candidate of candidates) {
    if (candidate.artifact.id === source.artifact.id) {
      continue;
    }

    for (const variant of variants) {
      const result = evaluateVariantMatch(variant, anchorStripped, candidate);
      if (!result) {
        continue;
      }

      if (!selected || result.confidence > selected.confidence) {
        selected = {
          target: candidate,
          confidence: result.confidence,
          rationale: `${rationale} → ${result.rationale}`,
        };
      }
    }
  }

  return selected;
}

/**
 * Resolves a C/C++ `#include` path against the workspace artifact list.
 *
 * Unlike {@link resolveReference}, this uses exact path matching (no fuzzy
 * variant expansion) since `#include` paths are fully specified.
 */
export function resolveIncludeReference(
  rawReference: string,
  source: HeuristicArtifact,
  candidates: readonly HeuristicArtifact[]
): ReferenceResolution | null {
  const reference = cleanupReference(rawReference);
  if (!reference) {
    return null;
  }

  const sourceDir = path.dirname(source.comparablePath);
  const attempts: string[] = [reference];

  if (!path.isAbsolute(reference)) {
    attempts.push(path.join(sourceDir, reference));
  }

  const match = attempts
    .map((candidatePath) => toComparablePath(candidatePath))
    .map((comparable) => candidates.find((candidate) => candidate.comparablePath === comparable))
    .find((candidate): candidate is HeuristicArtifact => Boolean(candidate));

  if (!match) {
    return null;
  }

  return {
    target: match,
    confidence: 0.85,
    rationale: `#include ${reference} → relative include match`,
  };
}
