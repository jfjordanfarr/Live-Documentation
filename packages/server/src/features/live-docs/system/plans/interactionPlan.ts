import type { Stage0Doc } from "@live-documentation/shared/live-docs/types";

import {
  LAYER3_PREFIX,
  LIVE_DOCS_SEGMENT,
  RUN_ALL_SCRIPT_PATH
} from "../constants";
import type { StageSequence, SystemDocPlan } from "../types";
import { formatDisplayName, includeInComponents, layer3Slug } from "../utils";

// ─────────────────────────────────────────────────────────────────────────────
// Interaction Plan Builder
// ─────────────────────────────────────────────────────────────────────────────

export function buildInteractionPlans(args: {
  stage0Docs: Stage0Doc[];
  stage0PathSet: Set<string>;
  skipSources: Set<string>;
  stageSequence: StageSequence;
}): SystemDocPlan[] {
  const plans: SystemDocPlan[] = [];
  const interactionDocs = args.stage0Docs.filter((doc) =>
    doc.sourcePath.startsWith("scripts/live-docs/")
  );

  for (const doc of interactionDocs) {
    if (doc.sourcePath === RUN_ALL_SCRIPT_PATH) {
      continue;
    }

    if (args.skipSources.has(doc.sourcePath)) {
      continue;
    }
    
    const slug = layer3Slug(doc.sourcePath);
    const id = `${LAYER3_PREFIX.interaction}-${slug}`;
    const titleSuffix = `${formatDisplayName(doc.sourcePath)} Interaction`;
    const componentSet = new Set<string>();
    componentSet.add(doc.sourcePath);

    const edgeSet = new Set<string>();

    const stageEntry = args.stageSequence.map.get(doc.sourcePath);
    if (stageEntry) {
      for (const next of stageEntry.after) {
        if (includeInComponents(next, args.stage0PathSet)) {
          componentSet.add(next);
          edgeSet.add(`${doc.sourcePath}|${next}`);
        }
      }
      for (const previous of stageEntry.before) {
        if (includeInComponents(previous, args.stage0PathSet)) {
          componentSet.add(previous);
          edgeSet.add(`${previous}|${doc.sourcePath}`);
        }
      }
    }

    for (const dependency of doc.dependencies) {
      if (!dependency.includes(LIVE_DOCS_SEGMENT)) {
        continue;
      }
      if (!includeInComponents(dependency, args.stage0PathSet)) {
        continue;
      }
      componentSet.add(dependency);
      edgeSet.add(`${doc.sourcePath}|${dependency}`);
    }

    if (componentSet.size <= 1 || edgeSet.size === 0) {
      continue;
    }

    const componentPaths = Array.from(componentSet).sort();

    plans.push({
      id,
      archetype: "interaction",
      slug,
      titleSuffix,
      componentPaths,
      edgeTuples: Array.from(edgeSet).map((entry) => {
        const [from, to] = entry.split("|");
        return { from, to };
      })
    });
  }

  return plans;
}
