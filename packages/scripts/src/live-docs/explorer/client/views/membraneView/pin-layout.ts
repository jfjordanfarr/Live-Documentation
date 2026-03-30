/**
 * Dependency-flow layout for pin-active state in the Membrane Map.
 *
 * Pure-function module: no DOM, no side effects.
 *
 * When pins are active, the squarify treemap is replaced by a
 * left-to-right dependency-flow layout. This module computes:
 * - Which nodes are relevant (pinned + 1-hop neighbors)
 * - Topological column assignment via BFS from pinned nodes
 * - Directory-based membrane grouping within each column
 *
 * The output drives a dedicated renderer that shows only relevant
 * cards arranged in dependency-flow columns wrapped in membranes.
 *
 * @module pin-layout
 */

import type { PinSet } from "./pin-state";
import { getPinnedNodeIds, getVisibleConnections } from "./pin-state";
import type { ExplorerLinkPayload, ExplorerNodePayload } from "../../../shared/types";

// ─── Types ─────────────────────────────────────────────────────────

/** A node positioned within the dependency-flow layout. */
export interface FlowNode {
  /** The node's unique ID (codeRelativePath). */
  readonly id: string;
  /** Column index (0 = leftmost). */
  readonly column: number;
  /** Role relative to pinned nodes. */
  readonly role: "upstream" | "pinned" | "downstream";
  /** Parent directory path (for membrane grouping). */
  readonly directory: string;
}

/** A group of nodes in the same directory, within a column. */
export interface MembraneGroup {
  /** Directory path that serves as the membrane label. */
  readonly directory: string;
  /** Column index this group occupies. */
  readonly column: number;
  /** Node IDs in this group, ordered consistently. */
  readonly nodeIds: readonly string[];
}

/**
 * A directory band that spans one or more columns.
 *
 * Unlike {@link MembraneGroup} (which is per-column), a band spans
 * the full column range of its children. This enables cross-column
 * directory membranes in the rendered layout.
 */
export interface DirectoryBand {
  /** Directory path that serves as the membrane label. */
  readonly directory: string;
  /** First (leftmost) column containing a node in this directory. */
  readonly minColumn: number;
  /** Last (rightmost) column containing a node in this directory. */
  readonly maxColumn: number;
  /** Vertical band index used for row ordering (0 = topmost). */
  readonly bandRow: number;
  /** Node IDs grouped by column. Key = column index. Empty for parent bands. */
  readonly nodesByColumn: ReadonlyMap<number, readonly string[]>;
  /** All node IDs in this band and descendants (unordered). */
  readonly allNodeIds: readonly string[];
  /** Nested child bands. Empty for leaf bands that hold file cards directly. */
  readonly children: readonly DirectoryBand[];
}

/** Complete dependency-flow layout result. */
export interface PinLayoutResult {
  /** Set of node IDs that should be rendered. */
  readonly relevantNodeIds: ReadonlySet<string>;
  /** Column assignment for each relevant node. */
  readonly columns: ReadonlyMap<string, number>;
  /** Total number of columns. */
  readonly columnCount: number;
  /** Flow-node details keyed by node ID. */
  readonly flowNodes: ReadonlyMap<string, FlowNode>;
  /** Membrane groups: directory clusters within each column. */
  readonly membraneGroups: readonly MembraneGroup[];
  /** Column labels (e.g. "Dependencies", "Pinned", "Dependents"). */
  readonly columnLabels: readonly string[];
  /** Least Common Ancestor directory of all relevant nodes. */
  readonly lcaDirectory: string;
  /** Ancestor chain from outermost directory to LCA (e.g. ["packages", "packages/scripts", ...]). */
  readonly ancestorChain: readonly string[];
  /** Cross-column directory bands (Strategy B+C layout). */
  readonly directoryBands: readonly DirectoryBand[];
}

// ─── Helpers ───────────────────────────────────────────────────────

/** Resolve a link endpoint to its string ID. */
function resolveId(endpoint: string | { id: string }): string {
  return typeof endpoint === "string" ? endpoint : endpoint.id;
}

/** Extract the parent directory from a file path. */
export function parentDirectory(filePath: string): string {
  const lastSlash = filePath.lastIndexOf("/");
  return lastSlash > 0 ? filePath.substring(0, lastSlash) : "";
}

/**
 * Compute the Least Common Ancestor directory of a set of file paths.
 * Returns the longest directory prefix shared by all paths.
 */
export function computeLCA(paths: readonly string[]): string {
  if (paths.length === 0) return "";
  const dirs = paths.map(p => parentDirectory(p));
  let lcaParts = dirs[0].split("/");
  for (let i = 1; i < dirs.length; i++) {
    const parts = dirs[i].split("/");
    const minLen = Math.min(lcaParts.length, parts.length);
    let j = 0;
    while (j < minLen && lcaParts[j] === parts[j]) j++;
    lcaParts = lcaParts.slice(0, j);
  }
  return lcaParts.filter(Boolean).join("/");
}

/**
 * Build the ancestor chain from root to a directory path.
 * E.g. "a/b/c" → ["a", "a/b", "a/b/c"].
 */
export function buildAncestorChain(dir: string): string[] {
  if (!dir) return [];
  const parts = dir.split("/");
  const chain: string[] = [];
  for (let i = 1; i <= parts.length; i++) {
    chain.push(parts.slice(0, i).join("/"));
  }
  return chain;
}

// ─── Core Algorithm ────────────────────────────────────────────────

/**
 * Compute a dependency-flow layout from the current pin state.
 *
 * Algorithm:
 * 1. Get visible connections from pin state
 * 2. Identify relevant nodes (pinned + connected neighbors)
 * 3. BFS from pinned nodes to assign topological columns:
 *    - Pinned nodes → column 0
 *    - Dependencies (upstream) → column -1, -2, ...
 *    - Dependents (downstream) → column +1, +2, ...
 * 4. Normalize columns to start at 0
 * 5. Group by parent directory within each column
 *
 * @param pinSet - Current pin state
 * @param links - Full graph edge list
 * @param nodesById - Node payload lookup
 * @returns The dependency-flow layout
 */
export function computePinLayout(
  pinSet: PinSet,
  links: readonly ExplorerLinkPayload[],
  nodesById: ReadonlyMap<string, ExplorerNodePayload>,
): PinLayoutResult {
  const pinnedNodeIds = getPinnedNodeIds(pinSet);

  if (pinnedNodeIds.size === 0) {
    return {
      relevantNodeIds: new Set(),
      columns: new Map(),
      columnCount: 0,
      flowNodes: new Map(),
      membraneGroups: [],
      columnLabels: [],
      lcaDirectory: "",
      ancestorChain: [],
      directoryBands: [],
    };
  }

  // Step 1: Get visible connections (edges touching a pinned symbol)
  const visibleConns = getVisibleConnections(pinSet, links);

  // Step 2: Build adjacency from visible connections
  // outEdges: nodeId → set of nodeIds it depends ON (source→target means source uses target)
  // inEdges: nodeId → set of nodeIds that depend on it
  const outEdges = new Map<string, Set<string>>();
  const inEdges = new Map<string, Set<string>>();

  for (const conn of visibleConns) {
    const sourceId = resolveId(conn.link.source);
    const targetId = resolveId(conn.link.target);

    // source depends on target: source→target is an outbound dependency
    if (!outEdges.has(sourceId)) outEdges.set(sourceId, new Set());
    outEdges.get(sourceId)!.add(targetId);

    if (!inEdges.has(targetId)) inEdges.set(targetId, new Set());
    inEdges.get(targetId)!.add(sourceId);
  }

  // Step 3: Topologically sort pinned nodes to respect inter-pinned dependencies.
  // If pinned node A depends on pinned node B, B is upstream (lower depth) of A.
  // Root pinned nodes (no dependencies on other pinned nodes) start at depth 0;
  // their pinned dependents get depth +1, etc.
  //
  // Links go source→target where source DEPENDS ON target.
  // So: target is UPSTREAM (left, negative column) of source,
  //     source is DOWNSTREAM (right, positive column) of target.
  //
  // For a pinned node P at depth d:
  //   - Nodes P depends on (outEdges[P]) → column d - 1 (upstream)
  //   - Nodes that depend on P (inEdges[P]) → column d + 1 (downstream)
  const rawColumns = new Map<string, number>();
  const queue: Array<{ id: string; depth: number }> = [];

  // Compute inter-pinned in-degree: how many other pinned nodes does each
  // pinned node depend on? (outEdges[A] targets that are also pinned)
  const validPinned = new Set<string>();
  for (const id of pinnedNodeIds) {
    if (nodesById.has(id)) validPinned.add(id);
  }

  const interPinnedInDeg = new Map<string, number>();
  for (const id of validPinned) interPinnedInDeg.set(id, 0);

  for (const id of validPinned) {
    const deps = outEdges.get(id);
    if (!deps) continue;
    let count = 0;
    for (const depId of deps) {
      if (validPinned.has(depId)) count++;
    }
    interPinnedInDeg.set(id, count);
  }

  // Kahn's algorithm: root pinned nodes (in-degree 0) get depth 0
  const pinnedDepths = new Map<string, number>();
  const topoQueue: string[] = [];
  for (const [id, deg] of interPinnedInDeg) {
    if (deg === 0) {
      topoQueue.push(id);
      pinnedDepths.set(id, 0);
    }
  }

  while (topoQueue.length > 0) {
    const id = topoQueue.shift()!;
    const depth = pinnedDepths.get(id)!;
    // Nodes that depend on this pinned node (inEdges = downstream consumers)
    const dependents = inEdges.get(id);
    if (dependents) {
      for (const depId of dependents) {
        if (!interPinnedInDeg.has(depId)) continue;
        const candidateDepth = depth + 1;
        pinnedDepths.set(depId, Math.max(pinnedDepths.get(depId) ?? 0, candidateDepth));
        const newDeg = interPinnedInDeg.get(depId)! - 1;
        interPinnedInDeg.set(depId, newDeg);
        if (newDeg === 0) topoQueue.push(depId);
      }
    }
  }

  // Safety: any pinned node not reached (e.g. cycles) defaults to depth 0
  for (const id of validPinned) {
    if (!pinnedDepths.has(id)) pinnedDepths.set(id, 0);
  }

  // Seed BFS with topologically-ordered pinned nodes
  for (const [id, depth] of pinnedDepths) {
    rawColumns.set(id, depth);
    queue.push({ id, depth });
  }

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;

    // Upstream: nodes this one depends on (outEdges)
    const deps = outEdges.get(id);
    if (deps) {
      for (const depId of deps) {
        if (!nodesById.has(depId)) continue;
        if (!rawColumns.has(depId)) {
          rawColumns.set(depId, depth - 1);
          queue.push({ id: depId, depth: depth - 1 });
        }
      }
    }

    // Downstream: nodes that depend on this one (inEdges)
    const dependents = inEdges.get(id);
    if (dependents) {
      for (const depId of dependents) {
        if (!nodesById.has(depId)) continue;
        if (!rawColumns.has(depId)) {
          rawColumns.set(depId, depth + 1);
          queue.push({ id: depId, depth: depth + 1 });
        }
      }
    }
  }

  // Step 4: Normalize so leftmost column is 0
  let minCol = 0;
  let maxCol = 0;
  for (const col of rawColumns.values()) {
    if (col < minCol) minCol = col;
    if (col > maxCol) maxCol = col;
  }

  const columns = new Map<string, number>();
  for (const [id, rawCol] of rawColumns) {
    columns.set(id, rawCol - minCol);
  }
  const columnCount = maxCol - minCol + 1;

  // Determine which column index corresponds to the pinned nodes' raw 0
  const pinnedColumnIndex = 0 - minCol;

  // Step 5: Build FlowNode entries
  const relevantNodeIds = new Set(columns.keys());
  const flowNodes = new Map<string, FlowNode>();

  for (const [id, col] of columns) {
    const payload = nodesById.get(id);
    // Use node.id so directories match the browse-mode hierarchy
    // (which is built from source-relative node.id paths).
    const dir = payload?.id
      ? parentDirectory(payload.id)
      : "";

    let role: "upstream" | "pinned" | "downstream";
    if (pinnedNodeIds.has(id)) {
      role = "pinned";
    } else if (col < pinnedColumnIndex) {
      role = "upstream";
    } else {
      role = "downstream";
    }

    flowNodes.set(id, { id, column: col, role, directory: dir });
  }

  // Step 6: Build membrane groups (directory clusters per column)
  const groupKey = (dir: string, col: number) => `${col}\0${dir}`;
  const groupMap = new Map<string, { directory: string; column: number; nodeIds: string[] }>();

  for (const [id, node] of flowNodes) {
    const key = groupKey(node.directory, node.column);
    let group = groupMap.get(key);
    if (!group) {
      group = { directory: node.directory, column: node.column, nodeIds: [] };
      groupMap.set(key, group);
    }
    group.nodeIds.push(id);
  }

  // Sort node IDs within each group alphabetically for stability
  for (const group of groupMap.values()) {
    group.nodeIds.sort();
  }

  // Sort groups by column, then by directory
  const membraneGroups = Array.from(groupMap.values())
    .sort((a, b) => a.column - b.column || a.directory.localeCompare(b.directory));

  // Step 7: Generate column labels
  const columnLabels: string[] = [];
  for (let i = 0; i < columnCount; i++) {
    if (i < pinnedColumnIndex) {
      const hopsBack = pinnedColumnIndex - i;
      columnLabels.push(hopsBack === 1 ? "Dependencies" : `${hopsBack}-hop Dependencies`);
    } else if (i === pinnedColumnIndex) {
      columnLabels.push("Pinned");
    } else {
      const hopsForward = i - pinnedColumnIndex;
      columnLabels.push(hopsForward === 1 ? "Dependents" : `${hopsForward}-hop Dependents`);
    }
  }

  // Step 8: Compute LCA and ancestor chain
  // Use node.id so directories match the browse-mode hierarchy.
  const relevantPaths = [...relevantNodeIds]
    .map(id => nodesById.get(id)?.id ?? id);
  const lcaDirectory = computeLCA(relevantPaths);
  const ancestorChain = buildAncestorChain(lcaDirectory);

  // Step 9: Compute cross-column directory bands (Strategy B+C)
  const directoryBands = computeDirectoryBands(flowNodes, lcaDirectory);

  return {
    relevantNodeIds,
    columns,
    columnCount,
    flowNodes,
    membraneGroups,
    columnLabels,
    lcaDirectory,
    ancestorChain,
    directoryBands,
  };
}

// ─── Directory Band Computation ────────────────────────────────────

/**
 * A node in the directory trie used to discover intermediate groupings.
 * Not exported — internal to the hierarchy builder.
 */
interface TrieNode {
  /** Display segment (may be collapsed, e.g. "shared/src"). */
  segment: string;
  /** Full directory path. */
  fullDir: string;
  /** Leaf band info (non-null if files live directly in this directory). */
  leaf: LeafBandInfo | null;
  /** Child trie nodes keyed by their first segment. */
  children: Map<string, TrieNode>;
}

interface LeafBandInfo {
  directory: string;
  minColumn: number;
  maxColumn: number;
  nodesByColumn: Map<number, string[]>;
  allNodeIds: string[];
}

/**
 * Compute hierarchical cross-column directory bands (Strategy B+C).
 *
 * 1. Groups flow nodes by immediate parent directory → leaf bands
 * 2. Builds a directory trie relative to the LCA
 * 3. Collapses single-child chains (e.g. packages → shared → src → packages/shared/src)
 * 4. At branching trie nodes, creates parent bands wrapping child bands
 * 5. Assigns bandRow at each nesting level via greedy interval scheduling
 *
 * Exported for testing.
 */
export function computeDirectoryBands(
  flowNodes: ReadonlyMap<string, FlowNode>,
  lcaDirectory: string = "",
): DirectoryBand[] {
  if (flowNodes.size === 0) return [];

  // ── Step 1: Group nodes by immediate parent directory ───────────
  const dirNodes = new Map<string, FlowNode[]>();
  for (const node of flowNodes.values()) {
    let list = dirNodes.get(node.directory);
    if (!list) { list = []; dirNodes.set(node.directory, list); }
    list.push(node);
  }

  // ── Step 2: Build leaf band info ────────────────────────────────
  const leafInfos = new Map<string, LeafBandInfo>();
  for (const [dir, nodes] of dirNodes) {
    let minCol = Infinity, maxCol = -Infinity;
    const byCol = new Map<number, string[]>();
    const allIds: string[] = [];
    for (const n of nodes) {
      if (n.column < minCol) minCol = n.column;
      if (n.column > maxCol) maxCol = n.column;
      let colList = byCol.get(n.column);
      if (!colList) { colList = []; byCol.set(n.column, colList); }
      colList.push(n.id);
      allIds.push(n.id);
    }
    for (const list of byCol.values()) list.sort();
    allIds.sort();
    leafInfos.set(dir, { directory: dir, minColumn: minCol, maxColumn: maxCol, nodesByColumn: byCol, allNodeIds: allIds });
  }

  // ── Step 3: Build directory trie relative to LCA ────────────────
  const lcaPrefix = lcaDirectory ? lcaDirectory + "/" : "";
  const root: TrieNode = { segment: "", fullDir: lcaDirectory, leaf: null, children: new Map() };

  for (const [dir, info] of leafInfos) {
    const relDir = lcaPrefix && dir.startsWith(lcaPrefix)
      ? dir.substring(lcaPrefix.length)
      : (dir === lcaDirectory ? "" : dir);
    if (!relDir) {
      root.leaf = info;
      continue;
    }
    const segments = relDir.split("/");
    let current = root;
    let pathSoFar = lcaDirectory;
    for (const seg of segments) {
      pathSoFar = pathSoFar ? pathSoFar + "/" + seg : seg;
      let child = current.children.get(seg);
      if (!child) {
        child = { segment: seg, fullDir: pathSoFar, leaf: null, children: new Map() };
        current.children.set(seg, child);
      }
      current = child;
    }
    current.leaf = info;
  }

  // ── Step 4: Collapse single-child chains ────────────────────────
  function collapse(node: TrieNode): void {
    for (const child of node.children.values()) collapse(child);
    if (node.children.size === 1 && !node.leaf) {
      const child = [...node.children.values()][0];
      node.segment = node.segment ? node.segment + "/" + child.segment : child.segment;
      node.fullDir = child.fullDir;
      node.leaf = child.leaf;
      node.children = child.children;
    }
  }
  for (const child of root.children.values()) collapse(child);

  // ── Step 5: Convert trie to hierarchical bands ──────────────────
  function buildBand(node: TrieNode): DirectoryBand[] {
    const hasChildren = node.children.size > 0;
    const hasLeaf = node.leaf !== null;

    // Pure leaf: no sub-directories → single leaf band
    if (!hasChildren && hasLeaf) {
      return [{
        directory: node.leaf!.directory,
        minColumn: node.leaf!.minColumn,
        maxColumn: node.leaf!.maxColumn,
        bandRow: -1,
        nodesByColumn: node.leaf!.nodesByColumn,
        allNodeIds: node.leaf!.allNodeIds,
        children: [],
      }];
    }

    // Has sub-directories → recurse and possibly create parent band
    if (hasChildren) {
      const childBands: DirectoryBand[] = [];
      for (const child of node.children.values()) {
        childBands.push(...buildBand(child));
      }

      // If loose files exist directly in this directory, add as a child band
      if (hasLeaf) {
        childBands.push({
          directory: node.leaf!.directory,
          minColumn: node.leaf!.minColumn,
          maxColumn: node.leaf!.maxColumn,
          bandRow: -1,
          nodesByColumn: node.leaf!.nodesByColumn,
          allNodeIds: node.leaf!.allNodeIds,
          children: [],
        });
      }

      // Only create a parent wrapper when there are 2+ child bands to group.
      // A single child doesn't benefit from an extra nesting layer.
      if (childBands.length >= 2) {
        const nested = assignBandRows(childBands);
        let minCol = Infinity, maxCol = -Infinity;
        const allIds: string[] = [];
        for (const b of nested) {
          if (b.minColumn < minCol) minCol = b.minColumn;
          if (b.maxColumn > maxCol) maxCol = b.maxColumn;
          allIds.push(...b.allNodeIds);
        }
        allIds.sort();
        return [{
          directory: node.fullDir,
          minColumn: minCol,
          maxColumn: maxCol,
          bandRow: -1,
          nodesByColumn: new Map(),
          allNodeIds: allIds,
          children: nested,
        }];
      }

      // Only 1 child band → no parent wrapper, pass through
      return childBands;
    }

    return [];
  }

  // Collect top-level bands from root's children
  const topBands: DirectoryBand[] = [];
  for (const child of root.children.values()) {
    topBands.push(...buildBand(child));
  }
  if (root.leaf) {
    topBands.push({
      directory: root.leaf.directory,
      minColumn: root.leaf.minColumn,
      maxColumn: root.leaf.maxColumn,
      bandRow: -1,
      nodesByColumn: root.leaf.nodesByColumn,
      allNodeIds: root.leaf.allNodeIds,
      children: [],
    });
  }

  // ── Step 6: Assign top-level band rows ──────────────────────────
  return assignBandRows(topBands);
}

/**
 * Assign `bandRow` to a list of bands via greedy interval scheduling.
 *
 * Sorts by minColumn ascending then span width descending. Non-overlapping
 * bands share a row; overlapping ones are stacked.
 */
function assignBandRows(bands: DirectoryBand[]): DirectoryBand[] {
  if (bands.length === 0) return [];

  const sorted = [...bands].sort((a, b) =>
    a.minColumn - b.minColumn || (b.maxColumn - b.minColumn) - (a.maxColumn - a.minColumn),
  );

  const rows: Array<Array<[number, number]>> = [];

  function fitsInRow(row: Array<[number, number]>, minC: number, maxC: number): boolean {
    for (const [rMin, rMax] of row) {
      if (minC <= rMax && maxC >= rMin) return false;
    }
    return true;
  }

  return sorted.map(band => {
    let assigned = -1;
    for (let r = 0; r < rows.length; r++) {
      if (fitsInRow(rows[r], band.minColumn, band.maxColumn)) {
        assigned = r;
        break;
      }
    }
    if (assigned === -1) {
      assigned = rows.length;
      rows.push([]);
    }
    rows[assigned].push([band.minColumn, band.maxColumn]);
    return { ...band, bandRow: assigned };
  });
}
