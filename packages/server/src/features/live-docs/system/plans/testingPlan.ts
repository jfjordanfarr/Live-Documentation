import type { Stage0Doc, TargetManifest } from "@live-documentation/shared/live-docs/types";
import { normalizeWorkspacePath } from "@live-documentation/shared/tooling/pathUtils";

import { loadTargetManifest } from "../../targets/manifest";
import { LAYER3_PREFIX, VIRTUAL_NODE_PREFIX } from "../constants";
import type { SystemDocPlan, SystemVirtualNode } from "../types";
import { formatDisplayName, includeInComponents, layer3Slug } from "../utils";

// ─────────────────────────────────────────────────────────────────────────────
// Testing Plan Builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds testing-focused System-layer plans from the target manifest,
 * linking test files to the live-docs implementation artifacts they cover.
 */
export async function buildTestingPlans(args: {
  workspaceRoot: string;
  stage0Docs: Stage0Doc[];
  manifest?: TargetManifest;
  stage0PathSet: Set<string>;
}): Promise<SystemDocPlan[]> {
  const manifest = args.manifest ?? (await loadTargetManifest(args.workspaceRoot));
  if (!manifest) {
    return [];
  }

  const relevantTests = new Set<string>();

  for (const suite of manifest.suites ?? []) {
    for (const test of suite.tests ?? []) {
      const matchesLiveDocs = (test.targets ?? []).some((target) =>
        target.includes("live-docs")
      );
      if (matchesLiveDocs && test.path) {
        relevantTests.add(normalizeWorkspacePath(test.path));
      }
    }
  }

  if (!relevantTests.size) {
    return [];
  }

  const targetPaths = new Set<string>();
  const stage0TestPaths = new Set<string>();
  const virtualNodeStats = new Map<string, { groupKey: string; count: number }>();
  const edgeTuples: Array<{ from: string; to: string }> = [];

  for (const suite of manifest.suites ?? []) {
    for (const test of suite.tests ?? []) {
      if (!test.path || !test.targets) {
        continue;
      }
      const normalizedPath = normalizeWorkspacePath(test.path);
      if (!relevantTests.has(normalizedPath)) {
        continue;
      }

      const normalizedTargets = (test.targets ?? [])
        .filter((target) => target.includes("live-docs"))
        .map((target) => normalizeWorkspacePath(target))
        .filter((target) => includeInComponents(target, args.stage0PathSet));

      if (!normalizedTargets.length) {
        continue;
      }
      
      const stage0Backed = includeInComponents(normalizedPath, args.stage0PathSet);
      let fromKey: string;

      if (stage0Backed) {
        stage0TestPaths.add(normalizedPath);
        fromKey = normalizedPath;
      } else {
        const groupKey = deriveTestGroupKey(normalizedPath);
        const virtualKey = createVirtualNodeKey(groupKey);
        const existing = virtualNodeStats.get(virtualKey);
        if (existing) {
          existing.count += 1;
        } else {
          virtualNodeStats.set(virtualKey, { groupKey, count: 1 });
        }
        fromKey = virtualKey;
      }

      for (const target of normalizedTargets) {
        targetPaths.add(target);
        edgeTuples.push({ from: fromKey, to: target });
      }
    }
  }

  const componentPaths = Array.from(
    new Set<string>([
      ...Array.from(targetPaths),
      ...Array.from(stage0TestPaths)
    ])
  ).sort();

  const virtualNodes: SystemVirtualNode[] = Array.from(virtualNodeStats.entries())
    .map(([key, value]) => ({
      key,
      label: `${formatDisplayName(value.groupKey)} Suites (${value.count})`,
      archetype: "test-summary" as const
    }))
    .sort((left, right) => left.key.localeCompare(right.key));

  const plan: SystemDocPlan = {
    id: `${LAYER3_PREFIX.testing}-live-docs-coverage`,
    archetype: "testing",
    slug: "live-docs-coverage",
    titleSuffix: "Live Docs Coverage",
    componentPaths,
    edgeTuples,
    virtualNodes: virtualNodes.length ? virtualNodes : undefined
  };

  return [plan];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/** Derives a short grouping key from a test file path (e.g. `"packages/server"`). */
function deriveTestGroupKey(testPath: string): string {
  const segments = testPath.split("/").filter(Boolean);
  if (segments.length >= 2 && (segments[0] === "packages" || segments[0] === "tests")) {
    return `${segments[0]}/${segments[1]}`;
  }
  if (segments.length >= 1) {
    return segments[0];
  }
  return testPath;
}

/** Creates a prefixed virtual-node key from a group key for test suites without Stage-0 docs. */
function createVirtualNodeKey(groupKey: string): string {
  return `${VIRTUAL_NODE_PREFIX}${layer3Slug(groupKey)}`;
}

export { deriveTestGroupKey, createVirtualNodeKey };
