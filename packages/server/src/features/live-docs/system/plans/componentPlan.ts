import type { Stage0Doc } from "@live-documentation/shared/live-docs/types";

import {
  IMPLEMENTATION_ARCHETYPE,
  LAYER3_PREFIX,
  LIVE_DOCS_SEGMENT,
  RUN_ALL_SCRIPT_PATH
} from "../constants";
import { buildStageSequenceEdges } from "../stageSequence";
import type { StageSequence, SystemDocPlan } from "../types";
import { formatDisplayName, includeInComponents, layer3Slug } from "../utils";

// ─────────────────────────────────────────────────────────────────────────────
// Component Plan Builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Groups Stage-0 implementation docs by directory prefix and produces
 * one {@link SystemDocPlan} per component with intra-component
 * dependency and stage-sequence edges.
 */
export function buildComponentPlans(args: {
  stage0Docs: Stage0Doc[];
  stage0PathSet: Set<string>;
  stageSequence: StageSequence;
}): SystemDocPlan[] {
  const docMap = new Map(args.stage0Docs.map((doc) => [doc.sourcePath, doc] as const));
  const groups = new Map<string, Stage0Doc[]>();
  
  for (const doc of args.stage0Docs) {
    if (!doc.sourcePath.includes(LIVE_DOCS_SEGMENT)) {
      continue;
    }
    if (!includeInComponents(doc.sourcePath, args.stage0PathSet)) {
      continue;
    }
    if (!isImplementationDoc(doc)) {
      continue;
    }
    const key = deriveComponentKey(doc.sourcePath);
    const bucket = groups.get(key) ?? [];
    bucket.push(doc);
    groups.set(key, bucket);
  }

  const plans: SystemDocPlan[] = [];
  
  for (const [groupKey, docs] of groups) {
    if (!docs.length) {
      continue;
    }

    const componentPaths = docs
      .map((doc) => doc.sourcePath)
      .filter((sourcePath) => includeInComponents(sourcePath, args.stage0PathSet))
      .sort();

    if (!componentPaths.length) {
      continue;
    }

    const componentSet = new Set(componentPaths);
    const edgeSet = new Set<string>();

    for (const doc of docs) {
      for (const dependency of doc.dependencies) {
        if (!componentSet.has(dependency)) {
          continue;
        }
        const dependencyDoc = docMap.get(dependency);
        if (!dependencyDoc || !isImplementationDoc(dependencyDoc)) {
          continue;
        }
        edgeSet.add(`${doc.sourcePath}|${dependency}`);
      }
    }

    if (groupKey === "scripts/live-docs") {
      const orchestrationEdges = buildStageSequenceEdges({
        stageSequence: args.stageSequence,
        stage0PathSet: args.stage0PathSet,
        orchestratorPath: RUN_ALL_SCRIPT_PATH
      });
      for (const edge of orchestrationEdges) {
        if (componentSet.has(edge.from) && componentSet.has(edge.to)) {
          edgeSet.add(`${edge.from}|${edge.to}`);
        }
      }
    }

    const slug = layer3Slug(groupKey);
    const id = `${LAYER3_PREFIX.component}-${slug}`;
    const titleSuffix = `${formatDisplayName(groupKey)} Component`;

    plans.push({
      id,
      archetype: "component",
      slug,
      titleSuffix,
      componentPaths,
      edgeTuples: Array.from(edgeSet).map((entry) => {
        const [from, to] = entry.split("|");
        return { from, to } as const;
      })
    });
  }

  return plans;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/** Derives a grouping key from a source path for component clustering. */
function deriveComponentKey(sourcePath: string): string {
  const segments = sourcePath.split("/");
  const featureIndex = segments.indexOf("features");
  if (featureIndex !== -1 && featureIndex + 1 < segments.length) {
    return segments.slice(0, featureIndex + 2).join("/");
  }

  const scriptsIndex = segments.indexOf("scripts");
  if (scriptsIndex !== -1 && scriptsIndex + 1 < segments.length) {
    return segments.slice(0, scriptsIndex + 2).join("/");
  }

  return segments.slice(0, Math.max(segments.length - 1, 1)).join("/");
}

// isImplementationDoc and deriveComponentKey are exported for reuse
// by sibling plan builders that need the same archetype/directory logic.

/** Returns `true` when the doc's archetype is `"implementation"`. */
function isImplementationDoc(doc: Stage0Doc): boolean {
  return (doc.archetype ?? IMPLEMENTATION_ARCHETYPE).toLowerCase() === IMPLEMENTATION_ARCHETYPE;
}

export { isImplementationDoc, deriveComponentKey };
