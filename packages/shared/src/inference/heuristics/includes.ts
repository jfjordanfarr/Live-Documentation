import { isImplementationLayer } from "./artifactLayerUtils";
import { resolveIncludeReference } from "./referenceResolver";
import { computeReferenceStart, isWithinComment } from "./shared";
import type { FallbackHeuristic, HeuristicArtifact } from "../fallbackHeuristicTypes";

const INCLUDE_DIRECTIVE_PATTERN = "#\\s*include\\s*(?:\"([^\"\\n]+)\"|<([^>\\n]+)>)";

/**
 * Creates a heuristic that detects C/C++ `#include` directives and resolves
 * them against the workspace file tree, supporting both quoted and angle-bracket forms.
 */
export function createIncludeHeuristic(): FallbackHeuristic {
  let candidates: readonly HeuristicArtifact[] = [];

  return {
    id: "c-include-directives",
    initialize(artifacts) {
      candidates = artifacts;
    },
    appliesTo(source) {
      return isImplementationLayer(source.artifact.layer);
    },
    evaluate(source, emit) {
      const content = source.content ?? "";
      if (!content) {
        return;
      }

      const pattern = new RegExp(INCLUDE_DIRECTIVE_PATTERN, "g");
      for (const match of content.matchAll(pattern)) {
        const localReference = match[1] ?? "";
        if (!localReference) {
          continue;
        }

        const referenceStart = computeReferenceStart(match, localReference);
        if (referenceStart !== null && isWithinComment(content, referenceStart)) {
          continue;
        }

        const resolution = resolveIncludeReference(localReference, source, candidates);
        if (!resolution) {
          continue;
        }

        emit({
          target: resolution.target,
          confidence: resolution.confidence,
          rationale: resolution.rationale,
          context: "include",
        });
      }
    },
  };
}
