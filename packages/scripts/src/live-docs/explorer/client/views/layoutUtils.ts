import type {
  ExplorerGraphPayload,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../shared/types";
import type { DirectoryNode } from "../types";

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

export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NodeLayoutPlan {
  node: ExplorerNodePayload;
  rect: LayoutRect;
  scale: number;
}

export interface FileAreaLayoutPlan {
  rect: LayoutRect;
  scale: number;
  columns: number;
  rows: number;
  nodes: NodeLayoutPlan[];
}

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

export interface DirectoryLayoutResult {
  root: DirectoryLayoutPlan;
  width: number;
  height: number;
}

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
const NODE_AREA = (NODE_WIDTH + NODE_GAP_X) * (NODE_HEIGHT + NODE_GAP_Y);
const DIRECTORY_PADDING = 40;
const DIRECTORY_LABEL_HEIGHT = 32;
const DIRECTORY_MIN_WIDTH = NODE_WIDTH + NODE_GAP_X;
const DIRECTORY_MIN_HEIGHT = NODE_HEIGHT + NODE_GAP_Y;
const DIRECTORY_AREA_WEIGHT = 0.92;
const MIN_DIRECTORY_SCALE = 0.4;
const MAX_DIRECTORY_SCALE = 1.45;
const DIRECTORY_GAP = 24;
const FILE_AREA_INSET = 16;
const CONTENT_SCALE_MAX = 1.12;
const NODE_VISUAL_SCALE_MAX = 1.65;

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

export const layoutConstants: LayoutConstants = {
  targetAspectRatio: TARGET_ASPECT_RATIO,
  nodeWidth: NODE_WIDTH,
  nodeHeight: NODE_HEIGHT,
  nodeGapX: NODE_GAP_X,
  nodeGapY: NODE_GAP_Y,
  directoryPadding: DIRECTORY_PADDING,
  directoryLabelHeight: DIRECTORY_LABEL_HEIGHT
};

export function buildHierarchy(nodes: ExplorerNodePayload[]): DirectoryNode {
  const root: DirectoryNode = { name: "", path: ROOT_KEY, children: new Map(), nodes: [] };
  nodes.forEach(node => {
    const parts = (node.docRelativePath || "").split("/").filter(Boolean);
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

export function getDirectoryKey(node: ExplorerNodePayload): string {
  const parts = (node.docRelativePath || "").split("/").filter(Boolean);
  if (parts.length <= 1) {
    return ROOT_KEY;
  }
  return parts.slice(0, -1).join("/");
}

export function measureDirectoryTree(root: DirectoryNode, depth = 0): DirectoryMeasure {
  const childMeasures = Array.from(root.children.values())
    .map(child => measureDirectoryTree(child, depth + 1))
    .filter(child => child.totalNodes > 0);

  const fileMetrics = root.nodes.length > 0 ? computeFileGridMetrics(root.nodes.length) : undefined;
  const nodeCount = root.nodes.length;
  const totalChildNodes = childMeasures.reduce((sum, child) => sum + child.totalNodes, 0);
  const totalNodes = nodeCount + totalChildNodes;

  const largestChildWidth = childMeasures.reduce((max, child) => Math.max(max, child.contentWidth), 0);
  const largestChildHeight = childMeasures.reduce((max, child) => Math.max(max, child.contentHeight), 0);
  const fileWidth = fileMetrics ? fileMetrics.width : 0;
  const fileHeight = fileMetrics ? fileMetrics.height : 0;

  const weightedChildArea = childMeasures.reduce(
    (sum, child) => sum + child.contentWidth * child.contentHeight * DIRECTORY_AREA_WEIGHT,
    0
  );
  const fileArea = fileMetrics ? fileMetrics.width * fileMetrics.height : 0;
  const targetArea = weightedChildArea + fileArea;

  let contentWidth = Math.max(DIRECTORY_MIN_WIDTH, largestChildWidth, fileWidth);
  let contentHeight = Math.max(DIRECTORY_MIN_HEIGHT, largestChildHeight, fileHeight);

  if (targetArea > 0) {
    const idealWidth = Math.sqrt(targetArea * TARGET_ASPECT_RATIO);
    const idealHeight = targetArea / Math.max(idealWidth, 1);
    contentWidth = Math.max(contentWidth, idealWidth);
    contentHeight = Math.max(contentHeight, idealHeight);
  }

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

export function computeDirectoryLayout(measure: DirectoryMeasure): DirectoryLayoutResult {
  const rootRect: LayoutRect = {
    x: 0,
    y: 0,
    width: Math.max(measure.outerWidth, DIRECTORY_MIN_WIDTH + DIRECTORY_PADDING * 2),
    height: Math.max(measure.outerHeight, DIRECTORY_MIN_HEIGHT + DIRECTORY_PADDING * 2)
  };
  const rootPlan = layoutDirectory(measure, rootRect, 0);
  return { root: rootPlan, width: rootRect.width, height: rootRect.height };
}
type LayoutItem =
  | { kind: "directory"; measure: DirectoryMeasure; area: number }
  | { kind: "files"; nodes: ExplorerNodePayload[]; area: number };

type TreemapItem = LayoutItem;

function layoutDirectory(measure: DirectoryMeasure, rect: LayoutRect, depth: number): DirectoryLayoutPlan {
  const directoryPath = measure.directory.path || ROOT_KEY;
  const directoryName = depth === 0 ? "(root)" : resolveDirectoryName(directoryPath, measure.directory.name);

  const labelHeight = depth === 0 ? 0 : DIRECTORY_LABEL_HEIGHT;
  const contentRect = ensurePositiveRect({
    x: rect.x + DIRECTORY_PADDING,
    y: rect.y + DIRECTORY_PADDING + labelHeight,
    width: rect.width - DIRECTORY_PADDING * 2,
    height: rect.height - DIRECTORY_PADDING * 2 - labelHeight
  }, DIRECTORY_MIN_WIDTH, DIRECTORY_MIN_HEIGHT);

  const shouldCollapse =
    depth > 0 &&
    measure.directory.nodes.length === 0 &&
    measure.childMeasures.length === 1;

  if (shouldCollapse) {
    const collapsedPlan = layoutDirectory(measure.childMeasures[0], rect, depth);
    const ancestorEntry = { path: directoryPath, name: directoryName };
    const collapsedAncestors = [ancestorEntry, ...collapsedPlan.collapsedAncestors];
    return {
      ...collapsedPlan,
      collapsedAncestors,
      displayName: composeDisplayName(collapsedPlan.name, collapsedAncestors)
    };
  }

  const items: LayoutItem[] = [];
  measure.childMeasures.forEach(child => {
    if (child.totalNodes === 0) {
      return;
    }
    const intrinsicArea = Math.max(child.contentWidth * child.contentHeight, NODE_AREA);
    items.push({ kind: "directory", measure: child, area: intrinsicArea * DIRECTORY_AREA_WEIGHT });
  });

  if (measure.directory.nodes.length > 0) {
    const intrinsicArea = measure.fileMetrics
      ? Math.max(measure.fileMetrics.width * measure.fileMetrics.height, NODE_AREA)
      : Math.max(measure.directory.nodes.length, 1) * NODE_AREA;
    items.push({ kind: "files", nodes: measure.directory.nodes.slice(), area: intrinsicArea });
  }

  const directories: DirectoryLayoutPlan[] = [];
  let fileArea: FileAreaLayoutPlan | undefined;

  if (items.length > 0) {
    normalizeItemAreas(items, contentRect.width * contentRect.height);
    const placements = squarify(items, contentRect);
    items.forEach(item => {
      const placement = placements.get(item);
      if (!placement) {
        return;
      }
      if (item.kind === "directory") {
        const adjusted = fitRectWithin(
          placement,
          item.measure.outerWidth,
          item.measure.outerHeight,
          DIRECTORY_GAP
        );
        directories.push(layoutDirectory(item.measure, adjusted, depth + 1));
      } else {
        const desiredWidth = measure.fileMetrics?.width ?? placement.width;
        const desiredHeight = measure.fileMetrics?.height ?? placement.height;
        const adjusted = fitRectWithin(placement, desiredWidth, desiredHeight, FILE_AREA_INSET);
        fileArea = layoutFileArea(item.nodes, adjusted, measure.fileMetrics);
      }
    });
  }

  const plan: DirectoryLayoutPlan = {
    path: directoryPath,
    name: directoryName,
    rect,
    contentRect,
    directories,
    fileArea,
    totalNodes: measure.totalNodes,
    depth,
    displayName: composeDisplayName(directoryName, []),
    collapsedAncestors: []
  };

  finalizeDirectoryPlan(plan);
  return plan;
}

function normalizeItemAreas(items: LayoutItem[], targetArea: number): void {
  const total = items.reduce((sum, item) => sum + item.area, 0);
  if (total === 0 || targetArea <= 0) {
    return;
  }
  const scale = targetArea / total;
  items.forEach(item => {
    item.area = Math.max(item.area * scale, 1);
  });
}

function ensurePositiveRect(rect: LayoutRect, minWidth: number, minHeight: number): LayoutRect {
  return {
    x: rect.x,
    y: rect.y,
    width: Math.max(rect.width, minWidth),
    height: Math.max(rect.height, minHeight)
  };
}

function fitRectWithin(
  rect: LayoutRect,
  desiredWidth: number,
  desiredHeight: number,
  gap: number
): LayoutRect {
  const gapX = Math.min(gap, rect.width / 2);
  const gapY = Math.min(gap, rect.height / 2);
  const usable = {
    x: rect.x + gapX,
    y: rect.y + gapY,
    width: Math.max(rect.width - gapX * 2, 0),
    height: Math.max(rect.height - gapY * 2, 0)
  };

  if (usable.width <= 0 || usable.height <= 0) {
    return {
      x: rect.x,
      y: rect.y,
      width: Math.max(rect.width, DIRECTORY_MIN_WIDTH),
      height: Math.max(rect.height, DIRECTORY_MIN_HEIGHT)
    };
  }

  const safeDesiredWidth = Math.max(desiredWidth, DIRECTORY_MIN_WIDTH);
  const safeDesiredHeight = Math.max(desiredHeight, DIRECTORY_MIN_HEIGHT);
  const scaleX = usable.width / safeDesiredWidth;
  const scaleY = usable.height / safeDesiredHeight;
  const scale = Math.max(
    MIN_DIRECTORY_SCALE,
    Math.min(MAX_DIRECTORY_SCALE, Math.min(scaleX, scaleY))
  );

  const scaledWidth = Math.min(safeDesiredWidth * scale, usable.width);
  const scaledHeight = Math.min(safeDesiredHeight * scale, usable.height);

  const offsetX = (usable.width - scaledWidth) / 2;
  const offsetY = (usable.height - scaledHeight) / 2;

  return {
    x: usable.x + offsetX,
    y: usable.y + offsetY,
    width: Math.max(scaledWidth, Math.min(usable.width, DIRECTORY_MIN_WIDTH)),
    height: Math.max(scaledHeight, Math.min(usable.height, DIRECTORY_MIN_HEIGHT))
  };
}

function finalizeDirectoryPlan(plan: DirectoryLayoutPlan): void {
  adjustDirectoryContent(plan);
  plan.directories.forEach(child => finalizeDirectoryPlan(child));
}

function adjustDirectoryContent(plan: DirectoryLayoutPlan): void {
  const hasDirectories = plan.directories.length > 0;
  const hasFiles = !!(plan.fileArea && plan.fileArea.nodes.length > 0);
  if (!hasDirectories && !hasFiles) {
    return;
  }

  const originX = plan.contentRect.x;
  const originY = plan.contentRect.y;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  const trackBounds = (rect: LayoutRect): void => {
    const relativeX = rect.x - originX;
    const relativeY = rect.y - originY;
    minX = Math.min(minX, relativeX);
    minY = Math.min(minY, relativeY);
    maxX = Math.max(maxX, relativeX + rect.width);
    maxY = Math.max(maxY, relativeY + rect.height);
  };

  plan.directories.forEach(child => trackBounds(child.rect));
  if (plan.fileArea && plan.fileArea.nodes.length > 0) {
    trackBounds(plan.fileArea.rect);
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return;
  }

  const usedWidth = Math.max(maxX - minX, 1);
  const usedHeight = Math.max(maxY - minY, 1);
  if (usedWidth <= 0 || usedHeight <= 0) {
    return;
  }

  const scaleX = plan.contentRect.width / usedWidth;
  const scaleY = plan.contentRect.height / usedHeight;
  const rawScale = Math.min(scaleX, scaleY);
  if (!Number.isFinite(rawScale) || rawScale <= 0) {
    return;
  }

  let scale = rawScale > 1 ? Math.min(rawScale, CONTENT_SCALE_MAX) : rawScale;
  scale = Math.max(scale, MIN_DIRECTORY_SCALE);

  const offsetX = (plan.contentRect.width - usedWidth * scale) / 2;
  const offsetY = (plan.contentRect.height - usedHeight * scale) / 2;

  plan.directories.forEach(child => {
    scaleDirectorySubtree(child, originX, originY, minX, minY, scale, offsetX, offsetY);
  });

  if (plan.fileArea && plan.fileArea.nodes.length > 0) {
    scaleFileAreaPlan(plan.fileArea, originX, originY, minX, minY, scale, offsetX, offsetY);
  }
}

function squarify(items: LayoutItem[], bounds: LayoutRect): Map<LayoutItem, LayoutRect> {
  const result = new Map<LayoutItem, LayoutRect>();
  const sorted = items
    .filter(item => item.area > 0)
    .slice()
    .sort((a, b) => b.area - a.area);
  if (sorted.length === 0) {
    return result;
  }

  let rect = { ...bounds };
  let row: TreemapItem[] = [];
  let rowArea = 0;

  const pushRow = (): void => {
    if (row.length === 0 || rect.width <= 0 || rect.height <= 0) {
      row = [];
      rowArea = 0;
      return;
    }
    const horizontal = rect.width >= rect.height;
    const rowSize = rowArea / (horizontal ? rect.width : rect.height);
    let offset = horizontal ? rect.x : rect.y;

    row.forEach(item => {
      if (horizontal) {
        const itemWidth = item.area / rowSize;
        result.set(item, stripPrecision({
          x: offset,
          y: rect.y,
          width: itemWidth,
          height: rowSize
        }));
        offset += itemWidth;
      } else {
        const itemHeight = item.area / rowSize;
        result.set(item, stripPrecision({
          x: rect.x,
          y: offset,
          width: rowSize,
          height: itemHeight
        }));
        offset += itemHeight;
      }
    });

    if (horizontal) {
      rect = {
        x: rect.x,
        y: rect.y + rowSize,
        width: rect.width,
        height: Math.max(rect.height - rowSize, 0)
      };
    } else {
      rect = {
        x: rect.x + rowSize,
        y: rect.y,
        width: Math.max(rect.width - rowSize, 0),
        height: rect.height
      };
    }

    row = [];
    rowArea = 0;
  };

  const worstAspect = (candidateRow: TreemapItem[], side: number): number => {
    if (candidateRow.length === 0) {
      return Number.POSITIVE_INFINITY;
    }
    const areas = candidateRow.map(item => item.area);
    const sum = candidateRow.reduce((acc, item) => acc + item.area, 0);
    const maxArea = Math.max(...areas);
    const minArea = Math.min(...areas);
    if (minArea === 0 || side === 0 || sum === 0) {
      return Number.POSITIVE_INFINITY;
    }
    const sideSquared = side * side;
    return Math.max((sideSquared * maxArea) / (sum * sum), (sum * sum) / (sideSquared * minArea));
  };

  sorted.forEach(item => {
    const testRow = row.concat(item);
    const side = Math.min(rect.width, rect.height);
    if (row.length === 0 || worstAspect(testRow, side) <= worstAspect(row, side)) {
      row = testRow;
      rowArea += item.area;
    } else {
      pushRow();
      row = [item];
      rowArea = item.area;
    }
  });

  pushRow();
  return result;
}

function stripPrecision(rect: LayoutRect): LayoutRect {
  return {
    x: rect.x,
    y: rect.y,
    width: Math.max(rect.width, 0),
    height: Math.max(rect.height, 0)
  };
}

function transformRect(
  rect: LayoutRect,
  originX: number,
  originY: number,
  minX: number,
  minY: number,
  scale: number,
  offsetX: number,
  offsetY: number
): LayoutRect {
  const relativeX = rect.x - originX;
  const relativeY = rect.y - originY;
  return stripPrecision({
    x: originX + offsetX + (relativeX - minX) * scale,
    y: originY + offsetY + (relativeY - minY) * scale,
    width: rect.width * scale,
    height: rect.height * scale
  });
}

function scaleDirectorySubtree(
  plan: DirectoryLayoutPlan,
  originX: number,
  originY: number,
  minX: number,
  minY: number,
  scale: number,
  offsetX: number,
  offsetY: number
): void {
  plan.rect = transformRect(plan.rect, originX, originY, minX, minY, scale, offsetX, offsetY);
  plan.contentRect = transformRect(plan.contentRect, originX, originY, minX, minY, scale, offsetX, offsetY);
  if (plan.fileArea && plan.fileArea.nodes.length > 0) {
    scaleFileAreaPlan(plan.fileArea, originX, originY, minX, minY, scale, offsetX, offsetY);
  }
  plan.directories.forEach(child => {
    scaleDirectorySubtree(child, originX, originY, minX, minY, scale, offsetX, offsetY);
  });
}

function scaleFileAreaPlan(
  fileArea: FileAreaLayoutPlan,
  originX: number,
  originY: number,
  minX: number,
  minY: number,
  scale: number,
  offsetX: number,
  offsetY: number
): void {
  fileArea.rect = transformRect(fileArea.rect, originX, originY, minX, minY, scale, offsetX, offsetY);
  fileArea.nodes.forEach(nodePlan => {
    nodePlan.rect = transformRect(nodePlan.rect, originX, originY, minX, minY, scale, offsetX, offsetY);
    nodePlan.scale = Math.min(nodePlan.scale * scale, NODE_VISUAL_SCALE_MAX);
  });
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
