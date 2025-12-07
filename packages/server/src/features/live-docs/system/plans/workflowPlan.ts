import type { Stage0Doc } from "@live-documentation/shared/live-docs/types";

import { LAYER3_PREFIX } from "../constants";
import { buildStageSequenceEdges } from "../stageSequence";
import type { StageSequence, SystemDocPlan } from "../types";
import { formatDisplayName, includeInComponents, layer3Slug } from "../utils";

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Plan Builder
// ─────────────────────────────────────────────────────────────────────────────

export function buildWorkflowPlans(args: {
  stage0Docs: Stage0Doc[];
  stage0PathSet: Set<string>;
  stageSequence: StageSequence;
}): SystemDocPlan[] {
  const plans: SystemDocPlan[] = [];
  const workflowDocs = args.stage0Docs.filter((doc) => doc.sourcePath.endsWith("run-all.ts"));

  for (const doc of workflowDocs) {
    const slug = layer3Slug(doc.sourcePath);
    const id = `${LAYER3_PREFIX.workflow}-${slug}`;
    const titleSuffix = `${formatDisplayName(doc.sourcePath)} Workflow`;

    const componentCandidates = new Set<string>();
    componentCandidates.add(doc.sourcePath);
    
    for (const dependency of doc.dependencies) {
      if (dependency.includes("live-docs") && includeInComponents(dependency, args.stage0PathSet)) {
        componentCandidates.add(dependency);
      }
    }
    
    for (const script of args.stageSequence.order) {
      componentCandidates.add(script);
    }

    const componentPaths = Array.from(componentCandidates).sort();

    const sequenceEdges = buildStageSequenceEdges({
      stageSequence: args.stageSequence,
      stage0PathSet: args.stage0PathSet,
      orchestratorPath: doc.sourcePath
    });

    const dependencyEdges = doc.dependencies
      .filter((dependency) => dependency.includes("live-docs") && includeInComponents(dependency, args.stage0PathSet))
      .map((dependency) => ({ from: doc.sourcePath, to: dependency }));
    
    const edgeSet = new Set<string>(sequenceEdges.map((edge) => `${edge.from}|${edge.to}`));
    for (const edge of dependencyEdges) {
      edgeSet.add(`${edge.from}|${edge.to}`);
    }

    plans.push({
      id,
      archetype: "workflow",
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
