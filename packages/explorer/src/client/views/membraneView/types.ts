import type { LayoutRect } from "../layoutUtils";

/**
 * The weight function used to determine how much area a node or
 * directory occupies in the membrane treemap.
 */
export type WeightFunction = "fileCount" | "lineCount" | "connectionCount";

/**
 * Configuration for the membrane layout engine.
 */
export interface MembraneLayoutConfig {
  /** Padding (px) inside each membrane boundary before child content. */
  readonly membranePadding: number;
  /** Height (px) reserved for the membrane label bar. */
  readonly labelHeight: number;
  /** Minimum membrane dimension (px) below which children collapse to a badge. */
  readonly minMembraneDimension: number;
  /** How to compute the weight of each leaf node. */
  readonly weightFunction: WeightFunction;
}

/** Sensible defaults for the membrane layout. */
export const DEFAULT_MEMBRANE_CONFIG: MembraneLayoutConfig = {
  membranePadding: 8,
  labelHeight: 24,
  minMembraneDimension: 40,
  weightFunction: "fileCount",
};

/**
 * A node in the membrane layout tree.
 *
 * - Leaf nodes represent individual files.
 * - Branch nodes represent directories (membranes) containing children.
 *
 * All coordinates are absolute (relative to the root viewport).
 */
export interface MembraneNode {
  /** Unique identifier — directory path for branches, file path for leaves. */
  readonly id: string;
  /** Display name (directory name or file name). */
  readonly name: string;
  /** The absolute bounding rectangle for this node. */
  readonly rect: LayoutRect;
  /** The content rectangle inside the membrane (after padding/label). Equals `rect` for leaves. */
  readonly contentRect: LayoutRect;
  /** Whether this is a directory (membrane) or file (leaf). */
  readonly isDirectory: boolean;
  /** Child membrane nodes. Empty for leaf nodes. */
  readonly children: readonly MembraneNode[];
  /** Depth in the hierarchy (root = 0). */
  readonly depth: number;
  /** Total file count in this subtree (1 for leaves). */
  readonly weight: number;
  /** Whether this node is a barrel file absorbed into the membrane boundary. */
  readonly isBarrel: boolean;
}

/**
 * The complete output of the membrane layout computation.
 */
export interface MembraneLayout {
  /** The root membrane node (the workspace root). */
  readonly root: MembraneNode;
  /** The viewport rectangle that was used to compute this layout. */
  readonly viewport: LayoutRect;
  /** Flat index of all membrane nodes for O(1) lookup by id. */
  readonly index: ReadonlyMap<string, MembraneNode>;
}
