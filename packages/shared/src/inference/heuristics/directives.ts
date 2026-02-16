import { resolveReference } from "./referenceResolver";
import { cleanupReference } from "./shared";
import type { FallbackHeuristic, HeuristicArtifact } from "../fallbackHeuristicTypes";

const LINK_DIRECTIVE_PATTERN = "@link\\s+([^\\s]+)";

/**
 * Creates a heuristic that detects file-path references in preprocessor-style
 * directives: YAML/Docker `FROM`, `COPY`, Makefiles, and similar patterns
 * that reference workspace artifacts by relative path.
 */
export function createDirectiveHeuristic(): FallbackHeuristic {
  let candidates: readonly HeuristicArtifact[] = [];

  return {
    id: "link-directives",
    initialize(artifacts) {
      candidates = artifacts;
    },
    appliesTo(_source) {
      return true;
    },
    evaluate(source, emit) {
      const content = source.content ?? "";
      if (!content) {
        return;
      }

      const pattern = new RegExp(LINK_DIRECTIVE_PATTERN, "g");
      for (const match of content.matchAll(pattern)) {
        const reference = cleanupReference(match[1]);
        if (!reference) {
          continue;
        }

        const resolution = resolveReference(reference, source, candidates, `@link ${reference}`);
        if (!resolution) {
          continue;
        }

        emit({
          target: resolution.target,
          confidence: resolution.confidence,
          rationale: resolution.rationale,
          context: "directive",
        });
      }
    },
  };
}
