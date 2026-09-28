/**
 * Aggregate metric computation for the Membrane Map.
 *
 * Extends the Circuit Board's per-level aggregation to produce
 * metrics for EVERY directory in the hierarchy tree, not just
 * the direct children of a given parent.
 */
import type { ExplorerNodePayload } from "../../../shared/types";
import type { DirectoryNode } from "../../types";
export type { DirectoryAggregate } from "../circuitView/aggregation";
import type { DirectoryAggregate } from "../circuitView/aggregation";

/**
 * Recursively collect all file nodes under a directory subtree.
 */
function collectAllFiles(dir: DirectoryNode): ExplorerNodePayload[] {
  const files: ExplorerNodePayload[] = [...dir.nodes];
  for (const child of dir.children.values()) {
    files.push(...collectAllFiles(child));
  }
  return files;
}

/**
 * Compute aggregate metrics for every directory in the tree.
 *
 * Returns a Map keyed by directory path. Each value contains file count,
 * symbol count, cross-boundary dependency counts, and archetype set —
 * the same shape as the Circuit Board's DirectoryAggregate.
 */
export function computeAllAggregates(root: DirectoryNode): Map<string, DirectoryAggregate> {
  const result = new Map<string, DirectoryAggregate>();

  function walk(dir: DirectoryNode): void {
    const allFiles = collectAllFiles(dir);
    const dirFileIds = new Set(allFiles.map(n => n.id));

    let symbolCount = 0;
    const archetypes = new Set<string>();
    const outboundTargets = new Set<string>();
    const inboundSources = new Set<string>();

    for (const file of allFiles) {
      symbolCount += file.publicSymbols.length;
      if (file.archetype) {
        archetypes.add(file.archetype.toLowerCase());
      }
      for (const dep of file.dependencies) {
        const targetId = typeof dep === "string" ? dep : dep.targetId;
        if (targetId && !dirFileIds.has(targetId)) {
          outboundTargets.add(targetId);
        }
      }
      for (const depId of file.dependents) {
        if (!dirFileIds.has(depId)) {
          inboundSources.add(depId);
        }
      }
    }

    result.set(dir.path, {
      path: dir.path,
      name: dir.name,
      fileCount: allFiles.length,
      symbolCount,
      outboundDepCount: outboundTargets.size,
      inboundDepCount: inboundSources.size,
      archetypes,
    });

    for (const child of dir.children.values()) {
      walk(child);
    }
  }

  walk(root);
  return result;
}
