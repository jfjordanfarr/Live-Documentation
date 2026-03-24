import type { MembraneLayout, MembraneNode } from "./types";

/**
 * A bundled edge representing N individual edges between two visible membrane endpoints.
 */
export interface BundledEdge {
  /** The resolved source (a collapsed membrane ID or an individual node ID). */
  sourceMembrane: string;
  /** The resolved target (a collapsed membrane ID or an individual node ID). */
  targetMembrane: string;
  /** Number of individual edges aggregated into this bundle. */
  count: number;
}

/**
 * Build a parent-pointer map from the membrane tree.
 */
function buildParentMap(root: MembraneNode): Map<string, string> {
  const parents = new Map<string, string>();
  function walk(node: MembraneNode) {
    for (const child of node.children) {
      parents.set(child.id, node.id);
      walk(child);
    }
  }
  walk(root);
  return parents;
}

/**
 * Resolve a node's visible representative given the set of collapsed directories.
 * Walks from the node toward the root, returning the shallowest collapsed ancestor.
 * If no ancestor is collapsed, the node itself is returned.
 */
function resolveEndpoint(
  nodeId: string,
  collapsed: Set<string>,
  parentMap: Map<string, string>,
): string {
  let current = nodeId;
  let resolved = nodeId;
  while (parentMap.has(current)) {
    const parent = parentMap.get(current)!;
    if (collapsed.has(parent)) {
      resolved = parent;
    }
    current = parent;
  }
  return resolved;
}

/**
 * Aggregate individual edges into membrane-level bundles based on which
 * directories are currently collapsed.
 *
 * - Edges whose both endpoints resolve to the same membrane (internal) are excluded.
 * - Edges whose both endpoints are visible (not inside any collapsed dir) are excluded
 *   (they remain individual connections, not bundled).
 * - Direction is preserved: A→B and B→A are separate bundles.
 */
export function aggregateEdges(
  layout: MembraneLayout,
  edges: ReadonlyArray<[string, string]>,
  collapsed: Set<string>,
): BundledEdge[] {
  const parentMap = buildParentMap(layout.root);
  const bundleMap = new Map<string, number>();

  for (const [src, tgt] of edges) {
    const resolvedSrc = resolveEndpoint(src, collapsed, parentMap);
    const resolvedTgt = resolveEndpoint(tgt, collapsed, parentMap);

    // Skip if both resolve to themselves (nothing collapsed) or both are same membrane (internal)
    if (resolvedSrc === src && resolvedTgt === tgt) continue;
    if (resolvedSrc === resolvedTgt) continue;

    const key = `${resolvedSrc}\0${resolvedTgt}`;
    bundleMap.set(key, (bundleMap.get(key) ?? 0) + 1);
  }

  const result: BundledEdge[] = [];
  for (const [key, count] of bundleMap) {
    const [sourceMembrane, targetMembrane] = key.split("\0");
    result.push({ sourceMembrane, targetMembrane, count });
  }
  return result;
}
