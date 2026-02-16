import type { FallbackHeuristic, HeuristicArtifact, MatchEmitter } from "../fallbackHeuristicTypes";
import { isDocumentLayer } from "./artifactLayerUtils";
import { resolveReference } from "./referenceResolver";
import { cleanupReference } from "./shared";

const MARKDOWN_LINK_PATTERN = "\\[[^\\]]+\\]\\(([^)]+)\\)";
const MARKDOWN_WIKI_LINK_PATTERN = "\\[\\[([^\\]]+)\\]\\]";

/**
 * Creates a heuristic that detects relative markdown links and wiki-links,
 * resolving them to workspace artifacts. Ignores external HTTP(S) URLs
 * and anchor-only fragments.
 */
export function createMarkdownHeuristic(): FallbackHeuristic {
  let candidates: readonly HeuristicArtifact[] = [];

  const evaluateReferences = (
    source: HeuristicArtifact,
    emit: MatchEmitter,
  pattern: RegExp,
    rationaleFactory: (match: RegExpMatchArray) => string
  ): void => {
    const content = source.content ?? "";
    if (!content) {
      return;
    }

  for (const match of content.matchAll(pattern)) {
      const reference = cleanupReference(match[1]);
      if (!reference) {
        continue;
      }

      const resolution = resolveReference(reference, source, candidates, rationaleFactory(match));
      if (!resolution) {
        continue;
      }

      emit({
        target: resolution.target,
        confidence: resolution.confidence,
        rationale: resolution.rationale,
        context: "text",
      });
    }
  };

  return {
    id: "markdown-links",
    initialize(artifacts) {
      candidates = artifacts;
    },
    appliesTo(source) {
      return isDocumentLayer(source.artifact.layer);
    },
    evaluate(source, emit) {
      evaluateReferences(
        source,
        emit,
        new RegExp(MARKDOWN_LINK_PATTERN, "g"),
        (match) => `markdown link ${match[0]}`
      );
      evaluateReferences(
        source,
        emit,
        new RegExp(MARKDOWN_WIKI_LINK_PATTERN, "g"),
        (match) => `wiki link [[${match[1]}]]`
      );
    },
  };
}
