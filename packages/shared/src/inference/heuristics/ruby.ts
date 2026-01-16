import path from "node:path";

import { isImplementationLayer } from "./artifactLayerUtils";
import { normalizePath } from "./shared";
import type { FallbackHeuristic, HeuristicArtifact } from "../fallbackHeuristicTypes";

const RUBY_REQUIRE_RELATIVE_PATTERN = "require_relative\\s+[\"']([^\"'\\s]+)[\"']";

export function createRubyHeuristic(): FallbackHeuristic {
  let candidates: readonly HeuristicArtifact[] = [];

  return {
    id: "ruby-require-relative",
    initialize(artifacts) {
      candidates = artifacts;
    },
    appliesTo(source) {
      return isImplementationLayer(source.artifact.layer) && source.comparablePath.endsWith(".rb");
    },
    evaluate(source, emit) {
      if (!source.content) {
        return;
      }

      const sourceDir = path.dirname(source.comparablePath);
      const seen = new Set<string>();
      const pattern = new RegExp(RUBY_REQUIRE_RELATIVE_PATTERN, "g");

      for (const match of source.content.matchAll(pattern)) {
        const relativeRequire = match[1];
        if (!relativeRequire) {
          continue;
        }

        const candidatePath = normalizePath(path.join(sourceDir, appendRubyExtension(relativeRequire)));
        const target = candidates.find((candidate) => candidate.comparablePath === candidatePath);
        if (!target || target.artifact.id === source.artifact.id) {
          continue;
        }

        if (seen.has(target.artifact.id)) {
          continue;
        }

        seen.add(target.artifact.id);
        emit({
          target,
          confidence: 0.75,
          rationale: `ruby require_relative ${relativeRequire}`,
          context: "require",
        });
      }
    },
  };
}

function appendRubyExtension(reference: string): string {
  return reference.endsWith(".rb") ? reference : `${reference}.rb`;
}
