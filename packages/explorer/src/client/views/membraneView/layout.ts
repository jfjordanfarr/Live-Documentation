import type { DirectoryNode } from "../../types";
import type { LayoutRect } from "../layoutUtils";
import type { SquarifyItem } from "../squarify";
import { computeSquarifiedLayout } from "../squarify";
import type {
  MembraneNode,
  MembraneLayout,
  MembraneLayoutConfig,
} from "./types";
import { DEFAULT_MEMBRANE_CONFIG } from "./types";

/**
 * Compute the total file count in a DirectoryNode subtree.
 */
function computeWeight(node: DirectoryNode): number {
  let weight = node.nodes.length;
  for (const child of node.children.values()) {
    weight += computeWeight(child);
  }
  return weight;
}

/**
 * Build a MembraneNode tree from a DirectoryNode, recursively applying
 * the squarified treemap algorithm at each level.
 *
 * @param dirNode - The source directory tree node
 * @param rect - The bounding rectangle allocated to this node
 * @param depth - Current depth in the hierarchy (root = 0)
 * @param config - Layout tuning parameters
 * @returns A fully-positioned MembraneNode tree
 */
/**
 * Thin config used for focus-path ancestor directories so their
 * padding/labels consume minimal space, keeping the focused directory's
 * content area nearly constant regardless of nesting depth.
 */
const FOCUS_ANCESTOR_CONFIG: MembraneLayoutConfig = {
  membranePadding: 2,
  labelHeight: 18,
  minMembraneDimension: 40,
  weightFunction: "fileCount",
};

function layoutDirectory(
  dirNode: DirectoryNode,
  rect: LayoutRect,
  depth: number,
  config: MembraneLayoutConfig,
  focusPath?: Set<string>
): MembraneNode {
  const weight = computeWeight(dirNode);

  // Determine if this directory is an ancestor on the focus path
  // (i.e., it's on the path AND one of its children is also on the path).
  const isFocusAncestor = focusPath?.has(dirNode.path) && Array.from(dirNode.children.values())
    .some(c => focusPath.has(c.path));

  // Focus-path ancestors use thin padding to keep the content area stable
  const effectiveConfig = isFocusAncestor ? FOCUS_ANCESTOR_CONFIG : config;

  // Compute the content rectangle (inset by padding + label height)
  const contentRect: LayoutRect = {
    x: rect.x + effectiveConfig.membranePadding,
    y: rect.y + effectiveConfig.labelHeight + effectiveConfig.membranePadding,
    width: Math.max(0, rect.width - 2 * effectiveConfig.membranePadding),
    height: Math.max(0, rect.height - effectiveConfig.labelHeight - 2 * effectiveConfig.membranePadding),
  };

  // If content area is too small, return a collapsed membrane with no children
  if (contentRect.width < effectiveConfig.minMembraneDimension || contentRect.height < effectiveConfig.minMembraneDimension) {
    return {
      id: dirNode.path,
      name: dirNode.name,
      rect,
      contentRect,
      isDirectory: true,
      children: [],
      depth,
      weight,
      isBarrel: false,
    };
  }

  // Collect all children to lay out: subdirectories + individual files
  const childItems: Array<{ kind: "dir" | "file"; dirNode?: DirectoryNode; fileIndex?: number; weight: number; id: string; name: string }> = [];

  for (const [, childDir] of dirNode.children) {
    const childWeight = computeWeight(childDir);
    if (childWeight > 0) {
      childItems.push({
        kind: "dir",
        dirNode: childDir,
        weight: childWeight,
        id: childDir.path,
        name: childDir.name,
      });
    }
  }

  for (let i = 0; i < dirNode.nodes.length; i++) {
    const fileNode = dirNode.nodes[i];
    childItems.push({
      kind: "file",
      fileIndex: i,
      weight: 1,
      id: fileNode.codeRelativePath || fileNode.id,
      name: fileNode.name,
    });
  }

  if (childItems.length === 0) {
    return {
      id: dirNode.path,
      name: dirNode.name,
      rect,
      contentRect,
      isDirectory: true,
      children: [],
      depth,
      weight,
      isBarrel: false,
    };
  }

  // Focus-aware child filtering: when one child is on the focus path,
  // EXCLUDE all siblings from the layout entirely. The focused child
  // gets the full content rect, and non-focus siblings disappear.
  const focusedChildId = focusPath
    ? childItems.find(c => focusPath.has(c.id))?.id
    : undefined;

  const itemsToLayout = focusedChildId
    ? childItems.filter(c => c.id === focusedChildId)
    : childItems;

  // Mixed-content focus target: when the focused directory (innermost
  // on the focus path) contains both subdirectories and leaf files,
  // exclude files from the squarify layout so directories get the full
  // treemap area.  Files will be rendered as card-grid cards by the
  // browse renderer instead of tiny treemap tiles.
  const isFocusTarget = focusPath?.has(dirNode.path) && !isFocusAncestor;
  const dirItemCount = itemsToLayout.filter(c => c.kind === "dir").length;
  const fileItemCount = itemsToLayout.filter(c => c.kind === "file").length;
  const isMixedFocusTarget = !!isFocusTarget
    && dirItemCount > 0
    && fileItemCount > 0;

  const squarifySource = isMixedFocusTarget
    ? itemsToLayout.filter(c => c.kind === "dir")
    : itemsToLayout;
  const squarifyItems: SquarifyItem[] = squarifySource.map(c => ({
    id: c.id,
    weight: c.weight,
  }));

  const tiles = computeSquarifiedLayout(squarifyItems, contentRect);

  // Build a lookup from tile id → rect
  const tileRects = new Map<string, LayoutRect>();
  for (const tile of tiles) {
    tileRects.set(tile.item.id, tile.rect);
  }

  // Recursively build child MembraneNodes
  const children: MembraneNode[] = [];
  for (const childItem of itemsToLayout) {
    const tileRect = tileRects.get(childItem.id);

    if (childItem.kind === "dir" && childItem.dirNode) {
      if (!tileRect) continue;
      children.push(layoutDirectory(childItem.dirNode, tileRect, depth + 1, config, focusPath));
    } else {
      // Leaf file node — in mixed focus targets, files are excluded
      // from squarify and receive zero-area rects.  The browse
      // renderer will render them as card-grid cards instead.
      const fileRect = tileRect ?? { x: 0, y: 0, width: 0, height: 0 };
      children.push({
        id: childItem.id,
        name: childItem.name,
        rect: fileRect,
        contentRect: fileRect,
        isDirectory: false,
        children: [],
        depth: depth + 1,
        weight: 1,
        isBarrel: false,
      });
    }
  }

  return {
    id: dirNode.path,
    name: dirNode.name,
    rect,
    contentRect,
    isDirectory: true,
    children,
    depth,
    weight,
    isBarrel: false,
  };
}

/**
 * Build a flat index of all MembraneNodes by id.
 */
function buildIndex(node: MembraneNode, index: Map<string, MembraneNode>): void {
  index.set(node.id, node);
  for (const child of node.children) {
    buildIndex(child, index);
  }
}

/**
 * Computes a recursive membrane layout for an entire directory tree.
 *
 * Each directory becomes a nested membrane container. Files inside
 * a directory are laid out as sibling leaf tiles. The squarified
 * treemap algorithm ensures that tiles have aspect ratios close to 1:1.
 *
 * @param root - The root DirectoryNode (from `buildHierarchy()`)
 * @param viewport - The bounding rectangle to fill
 * @param config - Layout tuning parameters (optional; uses defaults)
 * @returns A fully-positioned MembraneLayout
 */
export function computeMembraneLayout(
  root: DirectoryNode,
  viewport: LayoutRect,
  config: MembraneLayoutConfig = DEFAULT_MEMBRANE_CONFIG,
  focusPath?: Set<string>
): MembraneLayout {
  const rootNode = layoutDirectory(root, viewport, 0, config, focusPath);

  const index = new Map<string, MembraneNode>();
  buildIndex(rootNode, index);

  return {
    root: rootNode,
    viewport,
    index,
  };
}
