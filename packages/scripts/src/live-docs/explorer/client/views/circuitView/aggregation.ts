import type { ExplorerNodePayload } from "../../../shared/types";
import type { DirectoryNode } from "../../types";

/**
 * Aggregate metrics for a single directory, computed from its child files.
 * Used to drive the visual weight and labels of collapsed directory tiles.
 */
export interface DirectoryAggregate {
  /** The directory path key (e.g. "packages/shared/src") */
  readonly path: string;
  /** Display name (last segment, or collapsed chain like "shared/src") */
  readonly name: string;
  /** Total file count (all files, including test/asset, for honest metric display) */
  readonly fileCount: number;
  /** Total public symbols across all child files */
  readonly symbolCount: number;
  /** Count of unique outbound dependency targets outside this directory */
  readonly outboundDepCount: number;
  /** Count of unique inbound dependent sources outside this directory */
  readonly inboundDepCount: number;
  /** Set of distinct archetypes found among child files */
  readonly archetypes: ReadonlySet<string>;
}

/**
 * Computes aggregate metrics for the children of a given directory node.
 *
 * This is the core progressive-disclosure aggregation: given any directory
 * in the hierarchy, it returns one DirectoryAggregate per effective child
 * directory. Single-child chains are collapsed (e.g. if `packages/` only
 * contains `shared/`, the aggregate is named `packages/shared` and points
 * to the deeper node).
 *
 * @param parentDir - The directory whose children to aggregate
 * @returns Array of aggregates for each effective child directory
 */
export function computeChildAggregates(
  parentDir: DirectoryNode
): DirectoryAggregate[] {
  const results: DirectoryAggregate[] = [];

  for (const child of parentDir.children.values()) {
    const effective = collapseSingleChildChain(child);

    // Build display name: if chain was collapsed, show the full chain
    const displayName = effective.path !== child.path
      ? effective.path.slice(child.path.indexOf(child.name))
      : effective.name;

    const allFiles = collectAllFiles(effective);
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

    results.push({
      path: effective.path,
      name: displayName,
      fileCount: allFiles.length,
      symbolCount,
      outboundDepCount: outboundTargets.size,
      inboundDepCount: inboundSources.size,
      archetypes
    });
  }

  return results;
}

/**
 * Walks a hierarchy tree to find the DirectoryNode at a given path.
 * Returns null if the path doesn't exist in the tree.
 */
export function findDirectoryByPath(
  root: DirectoryNode,
  targetPath: string
): DirectoryNode | null {
  if (root.path === targetPath) return root;

  // Walk down the tree segment by segment
  const rootPrefix = root.path === "__root__" ? "" : root.path + "/";
  const remainder = rootPrefix
    ? (targetPath.startsWith(rootPrefix) ? targetPath.slice(rootPrefix.length) : targetPath)
    : targetPath;

  const segments = remainder.split("/").filter(Boolean);
  let current: DirectoryNode = root;

  for (const segment of segments) {
    const child = current.children.get(segment);
    if (!child) return null;
    current = child;
    if (current.path === targetPath) return current;
  }

  return current.path === targetPath ? current : null;
}

/**
 * Computes aggregate metrics for each top-level directory in a hierarchy.
 * @deprecated Use computeChildAggregates(root) instead for progressive disclosure.
 */
export function computeDirectoryAggregates(
  root: DirectoryNode,
  _allNodes: ReadonlyArray<ExplorerNodePayload>
): Map<string, DirectoryAggregate> {
  const aggregates = new Map<string, DirectoryAggregate>();
  for (const agg of computeChildAggregates(root)) {
    aggregates.set(agg.path, agg);
  }
  return aggregates;
}

function collapseSingleChildChain(dir: DirectoryNode): DirectoryNode {
  let current = dir;
  while (
    current.nodes.length === 0 &&
    current.children.size === 1
  ) {
    const [onlyChild] = current.children.values();
    current = onlyChild;
  }
  return current;
}

/** Recursively collects all file nodes under a directory tree. */
function collectAllFiles(dir: DirectoryNode): ExplorerNodePayload[] {
  const files: ExplorerNodePayload[] = [...dir.nodes];
  for (const child of dir.children.values()) {
    files.push(...collectAllFiles(child));
  }
  return files;
}

/**
 * Computes the total weight for a directory aggregate.
 * Weight determines the visual area of the tile in the squarified layout.
 * Uses file count as the primary factor with a dependency bonus.
 */
export function computeAggregateWeight(aggregate: DirectoryAggregate): number {
  return aggregate.fileCount + (aggregate.outboundDepCount + aggregate.inboundDepCount) * 0.25;
}

/** Weight for a single file node in the squarified layout. */
export function computeFileWeight(node: ExplorerNodePayload): number {
  return 1 + node.publicSymbols.length * 0.15;
}
