import type {
  ExplorerGraphPayload,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../shared/types";
import type { DirectoryNode } from "../types";

/** Sentinel key representing the virtual root directory in the layout tree. */
export const ROOT_KEY = "__root__";

interface FileGridMetrics {
  columns: number;
  rows: number;
  width: number;
  height: number;
}

interface DirectoryMeasure {
  directory: DirectoryNode;
  childMeasures: DirectoryMeasure[];
  totalNodes: number;
  contentWidth: number;
  contentHeight: number;
  outerWidth: number;
  outerHeight: number;
  fileMetrics?: FileGridMetrics;
  depth: number;
}

/** Axis-aligned bounding rectangle used for layout placement. */
export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A single node positioned within a file area grid, with its computed scale factor. */
export interface NodeLayoutPlan {
  node: ExplorerNodePayload;
  rect: LayoutRect;
  scale: number;
}

/** Layout geometry for the file-node grid within a directory. */
export interface FileAreaLayoutPlan {
  rect: LayoutRect;
  scale: number;
  columns: number;
  rows: number;
  nodes: NodeLayoutPlan[];
}

/**
 * Recursive layout plan for a single directory in the Circuit Board treemap.
 *
 * Collapsed single-child directories are folded into their parent, tracked
 * via {@link collapsedAncestors} so the breadcrumb display name remains
 * accurate (e.g. `"packages > shared > src"`).
 */
export interface DirectoryLayoutPlan {
  path: string;
  name: string;
  rect: LayoutRect;
  contentRect: LayoutRect;
  directories: DirectoryLayoutPlan[];
  fileArea?: FileAreaLayoutPlan;
  totalNodes: number;
  depth: number;
  displayName: string;
  collapsedAncestors: Array<{ path: string; name: string }>;
}

/** Top-level output of the directory layout algorithm — a root plan plus overall dimensions. */
export interface DirectoryLayoutResult {
  root: DirectoryLayoutPlan;
  width: number;
  height: number;
}

interface FlowLayoutItem {
  kind: "directory" | "files";
  measure?: DirectoryMeasure;
  nodes?: ExplorerNodePayload[];
  width: number;
  height: number;
}

interface FlowLayoutResult {
  placements: Map<FlowLayoutItem, LayoutRect>;
  width: number;
  height: number;
}

/** Exposed layout tuning constants for consumers that need to align calculations with the treemap grid. */
export interface LayoutConstants {
  targetAspectRatio: number;
  nodeWidth: number;
  nodeHeight: number;
  nodeGapX: number;
  nodeGapY: number;
  directoryPadding: number;
  directoryLabelHeight: number;
}

const TARGET_ASPECT_RATIO = 4 / 3;
const NODE_WIDTH = 260;
const NODE_HEIGHT = 168;
const NODE_GAP_X = 36;
const NODE_GAP_Y = 32;
const DIRECTORY_PADDING = 40;
const DIRECTORY_LABEL_HEIGHT = 32;
const DIRECTORY_MIN_WIDTH = NODE_WIDTH + NODE_GAP_X;
const DIRECTORY_MIN_HEIGHT = NODE_HEIGHT + NODE_GAP_Y;
const DIRECTORY_GAP = 24;
const NODE_VISUAL_SCALE_MAX = 1.65;
const GRID_STEP_X = NODE_WIDTH + NODE_GAP_X;
const GRID_STEP_Y = NODE_HEIGHT + NODE_GAP_Y;

function resolveDirectoryName(path: string, fallback: string): string {
  if (path === ROOT_KEY) {
    return "(root)";
  }
  if (fallback && fallback.trim().length > 0) {
    return fallback;
  }
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) {
    return "(root)";
  }
  return segments[segments.length - 1];
}

function composeDisplayName(
  baseName: string,
  ancestors: Array<{ path: string; name: string }>
): string {
  const trimmedBase = baseName && baseName.trim().length > 0 ? baseName : "(root)";
  if (!ancestors || ancestors.length === 0) {
    return trimmedBase;
  }
  const parts = ancestors
    .map(entry => (entry.path === ROOT_KEY ? "(root)" : entry.name))
    .filter(name => name && name.trim().length > 0);
  const uniqueParts = parts.filter((part, index) => parts.indexOf(part) === index);
  if (!uniqueParts.includes(trimmedBase)) {
    uniqueParts.push(trimmedBase);
  }
  return uniqueParts.join(" › ");
}

/** Singleton instance of the layout constants used by the Circuit Board view. */
export const layoutConstants: LayoutConstants = {
  targetAspectRatio: TARGET_ASPECT_RATIO,
  nodeWidth: NODE_WIDTH,
  nodeHeight: NODE_HEIGHT,
  nodeGapX: NODE_GAP_X,
  nodeGapY: NODE_GAP_Y,
  directoryPadding: DIRECTORY_PADDING,
  directoryLabelHeight: DIRECTORY_LABEL_HEIGHT
};

/**
 * Builds a directory tree from a flat list of explorer nodes, grouping
 * them by their source-relative path (`node.id`). Nodes without a
 * directory prefix land at the root.
 */
export function buildHierarchy(nodes: ExplorerNodePayload[]): DirectoryNode {
  const root: DirectoryNode = { name: "", path: ROOT_KEY, children: new Map(), nodes: [] };
  nodes.forEach(node => {
    const parts = (node.id || "").split("/").filter(Boolean);
    if (parts.length === 0) {
      root.nodes.push(node);
      return;
    }
    const dirParts = parts.slice(0, -1);
    let current = root;
    dirParts.forEach(part => {
      if (!current.children.has(part)) {
        const segmentPath = current.path === ROOT_KEY ? part : `${current.path}/${part}`;
        current.children.set(part, {
          name: part,
          path: segmentPath,
          children: new Map(),
          nodes: []
        });
      }
      current = current.children.get(part)!;
    });
    current.nodes.push(node);
  });
  return root;
}

/** Returns the directory key for a node by stripping the filename from `node.id`. */
export function getDirectoryKey(node: ExplorerNodePayload): string {
  const parts = (node.id || "").split("/").filter(Boolean);
  if (parts.length <= 1) {
    return ROOT_KEY;
  }
  return parts.slice(0, -1).join("/");
}

/**
 * Recursively measures a directory tree, computing bounding-box dimensions
 * for each node using a flow-layout algorithm that targets a 4:3 aspect ratio.
 *
 * Empty directories are pruned during measurement.
 */
export function measureDirectoryTree(root: DirectoryNode, depth = 0): DirectoryMeasure {
  const rawChildren = Array.from(root.children.values())
    .map(child => measureDirectoryTree(child, depth + 1))
    .filter(child => child.totalNodes > 0);

  const childMeasures = sortChildMeasures(rawChildren);
  const fileMetrics = root.nodes.length > 0 ? computeFileGridMetrics(root.nodes.length) : undefined;
  const nodeCount = root.nodes.length;
  const totalChildNodes = childMeasures.reduce((sum, child) => sum + child.totalNodes, 0);
  const totalNodes = nodeCount + totalChildNodes;

  const flowItems = buildFlowItems(childMeasures, root, fileMetrics);
  const flowBounds = computeFlowLayout(flowItems);

  let contentWidth = flowBounds.width;
  let contentHeight = flowBounds.height;

  if (contentWidth <= 0 && contentHeight <= 0) {
    contentWidth = DIRECTORY_MIN_WIDTH;
    contentHeight = DIRECTORY_MIN_HEIGHT;
  }

  contentWidth = quantizeDimension(contentWidth, GRID_STEP_X, DIRECTORY_MIN_WIDTH);
  contentHeight = quantizeDimension(contentHeight, GRID_STEP_Y, DIRECTORY_MIN_HEIGHT);

  const labelHeight = depth === 0 ? 0 : DIRECTORY_LABEL_HEIGHT;
  const outerWidth = contentWidth + DIRECTORY_PADDING * 2;
  const outerHeight = contentHeight + DIRECTORY_PADDING * 2 + labelHeight;

  return {
    directory: root,
    childMeasures,
    totalNodes,
    contentWidth,
    contentHeight,
    outerWidth,
    outerHeight,
    fileMetrics,
    depth
  };
}

/**
 * Converts a measured directory tree into absolute layout coordinates.
 *
 * Single-child directories are collapsed into their parent, placing the
 * root plan at the origin. Returns the total canvas width and height.
 */
export function computeDirectoryLayout(measure: DirectoryMeasure): DirectoryLayoutResult {
  const rootRect: LayoutRect = {
    x: 0,
    y: 0,
    width: measure.outerWidth,
    height: measure.outerHeight
  };
  const rootPlan = layoutDirectory(measure, rootRect, 0);
  return { root: rootPlan, width: rootRect.width, height: rootRect.height };
}

function sortChildMeasures(children: DirectoryMeasure[]): DirectoryMeasure[] {
  return children
    .slice()
    .sort((a, b) => {
      const nodeDelta = b.totalNodes - a.totalNodes;
      if (nodeDelta !== 0) {
        return nodeDelta;
      }
      const nameA = a.directory.name || "";
      const nameB = b.directory.name || "";
      return nameA.localeCompare(nameB);
    });
}

function buildFlowItems(
  childMeasures: DirectoryMeasure[],
  directory: DirectoryNode,
  fileMetrics?: FileGridMetrics
): FlowLayoutItem[] {
  const items: FlowLayoutItem[] = childMeasures.map(child => ({
    kind: "directory",
    measure: child,
    width: child.outerWidth,
    height: child.outerHeight
  }));

  if (directory.nodes.length > 0) {
    const metrics = fileMetrics ?? computeFileGridMetrics(directory.nodes.length);
    items.push({
      kind: "files",
      nodes: directory.nodes.slice(),
      width: metrics.width,
      height: metrics.height
    });
  }

  return items;
}

function quantizeDimension(value: number, step: number, minimum: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return minimum;
  }
  const units = Math.ceil(value / step);
  return Math.max(units * step, minimum);
}

function computeFlowLayout(items: FlowLayoutItem[]): FlowLayoutResult {
  const placements = new Map<FlowLayoutItem, LayoutRect>();
  if (items.length === 0) {
    return { placements, width: 0, height: 0 };
  }

  const targetWidth = computeTargetRowWidth(items);
  let cursorX = 0;
  let cursorY = 0;
  let currentRowHeight = 0;
  let maxRowWidth = 0;

  items.forEach(item => {
    const width = Math.max(item.width, DIRECTORY_MIN_WIDTH);
    const height = Math.max(item.height, DIRECTORY_MIN_HEIGHT);

    if (cursorX > 0 && cursorX + width > targetWidth) {
      cursorY += currentRowHeight + DIRECTORY_GAP;
      cursorX = 0;
      currentRowHeight = 0;
    }

    placements.set(item, {
      x: cursorX,
      y: cursorY,
      width,
      height
    });

    cursorX += width + DIRECTORY_GAP;
    currentRowHeight = Math.max(currentRowHeight, height);
    maxRowWidth = Math.max(maxRowWidth, cursorX - DIRECTORY_GAP);
  });

  const totalHeight = cursorY + currentRowHeight;
  return {
    placements,
    width: Math.max(maxRowWidth, DIRECTORY_MIN_WIDTH),
    height: Math.max(totalHeight, DIRECTORY_MIN_HEIGHT)
  };
}

function computeTargetRowWidth(items: FlowLayoutItem[]): number {
  const totalArea = items.reduce((sum, item) => sum + Math.max(item.width, 1) * Math.max(item.height, 1), 0);
  const longestWidth = items.reduce((max, item) => Math.max(max, item.width), DIRECTORY_MIN_WIDTH);
  if (totalArea <= 0) {
    return longestWidth;
  }
  const idealWidth = Math.sqrt(totalArea * TARGET_ASPECT_RATIO);
  return Math.max(longestWidth, idealWidth);
}
function layoutDirectory(measure: DirectoryMeasure, rect: LayoutRect, depth: number): DirectoryLayoutPlan {
  const directoryPath = measure.directory.path || ROOT_KEY;
  const directoryName = depth === 0 ? "(root)" : resolveDirectoryName(directoryPath, measure.directory.name);

  const labelHeight = depth === 0 ? 0 : DIRECTORY_LABEL_HEIGHT;
  const sizedRect: LayoutRect = {
    x: rect.x,
    y: rect.y,
    width: measure.contentWidth + DIRECTORY_PADDING * 2,
    height: measure.contentHeight + DIRECTORY_PADDING * 2 + labelHeight
  };
  const contentRect: LayoutRect = {
    x: sizedRect.x + DIRECTORY_PADDING,
    y: sizedRect.y + DIRECTORY_PADDING + labelHeight,
    width: measure.contentWidth,
    height: measure.contentHeight
  };

  const shouldCollapse =
    depth > 0 &&
    measure.directory.nodes.length === 0 &&
    measure.childMeasures.length === 1;

  if (shouldCollapse) {
    const collapsedPlan = layoutDirectory(measure.childMeasures[0], sizedRect, depth);
    const ancestorEntry = { path: directoryPath, name: directoryName };
    const collapsedAncestors = [ancestorEntry, ...collapsedPlan.collapsedAncestors];
    return {
      ...collapsedPlan,
      collapsedAncestors,
      displayName: composeDisplayName(collapsedPlan.name, collapsedAncestors)
    };
  }

  const directories: DirectoryLayoutPlan[] = [];
  let fileArea: FileAreaLayoutPlan | undefined;

  const layoutItems = buildFlowItems(measure.childMeasures, measure.directory, measure.fileMetrics);
  const flowLayout = computeFlowLayout(layoutItems);
  const offsetX = contentRect.x + Math.max(0, (contentRect.width - flowLayout.width) / 2);
  const offsetY = contentRect.y + Math.max(0, (contentRect.height - flowLayout.height) / 2);

  layoutItems.forEach(item => {
    const placement = flowLayout.placements.get(item);
    if (!placement) {
      return;
    }
    const absoluteRect: LayoutRect = {
      x: offsetX + placement.x,
      y: offsetY + placement.y,
      width: placement.width,
      height: placement.height
    };
    if (item.kind === "directory" && item.measure) {
      directories.push(layoutDirectory(item.measure, absoluteRect, depth + 1));
    } else if (item.kind === "files") {
      fileArea = layoutFileArea(item.nodes ?? [], absoluteRect, measure.fileMetrics);
    }
  });

  const plan: DirectoryLayoutPlan = {
    path: directoryPath,
    name: directoryName,
    rect: sizedRect,
    contentRect,
    directories,
    fileArea,
    totalNodes: measure.totalNodes,
    depth,
    displayName: composeDisplayName(directoryName, []),
    collapsedAncestors: []
  };

  return plan;
}

function computeFileGridMetrics(count: number): FileGridMetrics {
  const cappedCount = Math.max(1, count);
  const maxColumns = Math.min(cappedCount, 18);
  let best: { columns: number; rows: number; width: number; height: number; score: number; area: number } | null = null;

  for (let columns = 1; columns <= maxColumns; columns += 1) {
    const rows = Math.max(1, Math.ceil(cappedCount / columns));
    const width = columns * NODE_WIDTH + (columns - 1) * NODE_GAP_X;
    const height = rows * NODE_HEIGHT + (rows - 1) * NODE_GAP_Y;
    const aspect = height === 0 ? TARGET_ASPECT_RATIO : width / height;
    const aspectScore = Math.abs(Math.log(aspect / TARGET_ASPECT_RATIO));
    const area = width * height;
    if (!best || aspectScore < best.score || (Math.abs(aspectScore - best.score) < 0.02 && area < best.area)) {
      best = { columns, rows, width, height, score: aspectScore, area };
    }
  }

  if (!best) {
    return {
      columns: 1,
      rows: cappedCount,
      width: NODE_WIDTH,
      height: cappedCount * NODE_HEIGHT + (cappedCount - 1) * NODE_GAP_Y
    };
  }

  return {
    columns: best.columns,
    rows: best.rows,
    width: Math.max(best.width, DIRECTORY_MIN_WIDTH),
    height: Math.max(best.height, DIRECTORY_MIN_HEIGHT)
  };
}

function layoutFileArea(
  nodes: ExplorerNodePayload[],
  rect: LayoutRect,
  preferredMetrics?: FileGridMetrics
): FileAreaLayoutPlan {
  if (nodes.length === 0) {
    return { rect, scale: 1, columns: 0, rows: 0, nodes: [] };
  }

  const availableWidth = Math.max(rect.width, NODE_WIDTH);
  const availableHeight = Math.max(rect.height, NODE_HEIGHT);
  const maxColumns = Math.min(nodes.length, 16);
  const candidateColumns = new Set<number>();
  for (let columns = 1; columns <= Math.max(1, maxColumns); columns += 1) {
    candidateColumns.add(columns);
  }
  if (preferredMetrics) {
    candidateColumns.add(Math.max(1, Math.min(preferredMetrics.columns, nodes.length)));
  }

  type Candidate = { columns: number; rows: number; scale: number; score: number };
  let best: Candidate | null = null;

  candidateColumns.forEach(columns => {
    const rows = Math.max(1, Math.ceil(nodes.length / columns));
    const requiredWidth = columns * NODE_WIDTH + (columns - 1) * NODE_GAP_X;
    const requiredHeight = rows * NODE_HEIGHT + (rows - 1) * NODE_GAP_Y;
    if (requiredWidth <= 0 || requiredHeight <= 0) {
      return;
    }

    const rawScale = Math.min(availableWidth / requiredWidth, availableHeight / requiredHeight);
    if (!Number.isFinite(rawScale) || rawScale <= 0) {
      return;
    }

    const scale = Math.min(rawScale, NODE_VISUAL_SCALE_MAX);
    const scaledWidth = requiredWidth * scale;
    const scaledHeight = requiredHeight * scale;
    const aspect = scaledHeight === 0 ? TARGET_ASPECT_RATIO : scaledWidth / scaledHeight;
    const aspectScore = Math.abs(Math.log(aspect / TARGET_ASPECT_RATIO));
    const fillX = scaledWidth / availableWidth;
    const fillY = scaledHeight / availableHeight;
    const fillPenalty = Math.abs(1 - Math.min(fillX, fillY));
    const scalePreference = scale >= 1 ? Math.abs(scale - 1) * 0.1 : Math.abs(1 - scale) * 0.3;
    const score = aspectScore * 0.6 + fillPenalty * 0.25 + scalePreference;

    if (!best || score < best.score) {
      best = { columns, rows, scale, score };
    }
  });

  if (!best) {
    best = {
      columns: Math.max(1, Math.min(nodes.length, preferredMetrics?.columns ?? 1)),
      rows: Math.max(1, Math.ceil(nodes.length / Math.max(1, preferredMetrics?.columns ?? 1))),
      scale: Math.min(
        Math.min(availableWidth / NODE_WIDTH, availableHeight / NODE_HEIGHT),
        NODE_VISUAL_SCALE_MAX
      ),
      score: 0
    };
  }

  const { columns, rows, scale } = best;
  const horizontalGap = NODE_GAP_X * scale;
  const verticalGap = NODE_GAP_Y * scale;
  const cardWidth = NODE_WIDTH * scale;
  const cardHeight = NODE_HEIGHT * scale;
  const layoutWidth = columns * cardWidth + (columns - 1) * horizontalGap;
  const layoutHeight = rows * cardHeight + (rows - 1) * verticalGap;
  const offsetX = rect.x + Math.max(0, (rect.width - layoutWidth) / 2);
  const offsetY = rect.y + Math.max(0, (rect.height - layoutHeight) / 2);

  const nodePlans = nodes.map((node, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    return {
      node,
      rect: {
        x: offsetX + column * (cardWidth + horizontalGap),
        y: offsetY + row * (cardHeight + verticalGap),
        width: cardWidth,
        height: cardHeight
      },
      scale
    };
  });

  return {
    rect,
    scale,
    columns,
    rows,
    nodes: nodePlans
  };
}

/**
 * Identifies the directory with the highest aggregate link-degree score
 * among a set of nodes.
 *
 * Used by the Circuit Board view to determine the initial viewport
 * position — centering on the most-connected directory cluster.
 */
export function findDominantDirectory(
  graphData: ExplorerGraphPayload,
  nodes: ExplorerNodePayload[],
  resolveLinkEndpoint: (endpoint: ExplorerLinkPayload["source"]) => string
): { path: string; score: number; count: number } | null {
  if (!nodes || nodes.length === 0) {
    return null;
  }
  const included = new Set(nodes.map(node => node.id));
  const degreeMap = new Map<string, number>();
  graphData.links.forEach(link => {
    const sourceId = resolveLinkEndpoint(link.source);
    const targetId = resolveLinkEndpoint(link.target);
    if (included.has(sourceId)) {
      degreeMap.set(sourceId, (degreeMap.get(sourceId) ?? 0) + 1);
    }
    if (included.has(targetId)) {
      degreeMap.set(targetId, (degreeMap.get(targetId) ?? 0) + 1);
    }
  });

  const directoryScores = new Map<string, { score: number; count: number }>();
  nodes.forEach(node => {
    const key = getDirectoryKey(node);
    if (!directoryScores.has(key)) {
      directoryScores.set(key, { score: 0, count: 0 });
    }
    const entry = directoryScores.get(key)!;
    entry.score += degreeMap.get(node.id) ?? 0;
    entry.count += 1;
  });

  let best: { path: string; score: number; count: number } | null = null;
  directoryScores.forEach((value, key) => {
    if (!best || value.score > best.score || (value.score === best.score && value.count > best.count)) {
      best = { path: key, score: value.score, count: value.count };
    }
  });

  return best;
}
