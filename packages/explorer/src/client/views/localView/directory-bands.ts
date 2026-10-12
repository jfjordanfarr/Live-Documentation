/** Directory grouping for the Local Map's ranked files and wire lanes. Pure layout, independent of the renderer. */

/** A node positioned within the dependency-flow layout. */
export interface FlowNode {
  /** The node's unique ID (codeRelativePath). */
  readonly id: string;
  /** Column index (0 = leftmost). */
  readonly column: number;
  /** Parent directory path (for membrane grouping). */
  readonly directory: string;
}

/** A directory spanning columns, with nested bands or directly held files. */
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

/** Extract the parent directory from a file path. */
export function parentDirectory(filePath: string): string {
  const lastSlash = filePath.lastIndexOf("/");
  return lastSlash > 0 ? filePath.substring(0, lastSlash) : "";
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
 * 3. Collapses single-child chains (e.g. packages → shared → src → packages/engine/src)
 * 4. At branching trie nodes, creates parent bands wrapping child bands
 * 5. Assigns bandRow at each nesting level via greedy interval scheduling
 *
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
