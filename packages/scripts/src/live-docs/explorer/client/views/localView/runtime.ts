import type { ColumnRole, LocalSubgraph, MapTransform } from "./types";

export type AnchorRegistry = Map<string, Map<string, HTMLElement>>;

/**
 * Builds the composite registry key for anchor storage.
 * Format: `{columnRole}:{nodeId}` to disambiguate nodes appearing in multiple columns.
 */
export function buildRegistryKey(columnRole: ColumnRole, nodeId: string): string {
  return `${columnRole}:${nodeId}`;
}

export interface DragPosition {
  x: number;
  y: number;
  time: number;
}

export interface LocalViewRuntime {
  viewport: HTMLDivElement;
  container: HTMLDivElement;
  overlay: HTMLDivElement;
  currentSubgraph: LocalSubgraph | null;
  mapTransform: MapTransform;
  isDragging: boolean;
  lastDragPosition: DragPosition | null;
  dragVelocity: { x: number; y: number };
  mapInertiaFrame: number;
  mapAnimationFrame: number;
  mapHasInitialFit: boolean;
  mapUserAdjusted: boolean;
  lastCenteredNodeId: string | null;
  mapInitialTransform: MapTransform | null;
  contentRoot: HTMLElement | null;
  anchorRegistry: AnchorRegistry;
}

export function createRuntime(
  viewport: HTMLDivElement,
  container: HTMLDivElement,
  overlay: HTMLDivElement
): LocalViewRuntime {
  return {
    viewport,
    container,
    overlay,
    currentSubgraph: null,
    mapTransform: { x: 0, y: 0, k: 1 },
    isDragging: false,
    lastDragPosition: null,
    dragVelocity: { x: 0, y: 0 },
    mapInertiaFrame: 0,
    mapAnimationFrame: 0,
    mapHasInitialFit: false,
    mapUserAdjusted: false,
    lastCenteredNodeId: null,
    mapInitialTransform: null,
    contentRoot: null,
    anchorRegistry: new Map()
  };
}

export function registerAnchor(
  registry: AnchorRegistry,
  nodeId: string,
  columnRole: ColumnRole,
  key: string,
  element: HTMLElement,
  normalize: (key: string) => string | null
): void {
  const registryKey = buildRegistryKey(columnRole, nodeId);
  if (!registry.has(registryKey)) {
    registry.set(registryKey, new Map());
  }
  const anchors = registry.get(registryKey)!;
  anchors.set(key, element);
  const normalizedKey = normalize(key);
  if (normalizedKey) {
    anchors.set(normalizedKey, element);
  }
}

export function getAnchor(
  registry: AnchorRegistry,
  nodeId: string,
  columnRole: ColumnRole,
  direction: "inbound" | "outbound",
  symbol: string | undefined,
  buildNormalizedKey: (direction: "inbound" | "outbound", symbol: string) => string | null
): HTMLElement | null {
  const registryKey = buildRegistryKey(columnRole, nodeId);
  const anchors = registry.get(registryKey);
  if (!anchors) {
    return null;
  }
  if (symbol) {
    const exactKey = `${direction}:${symbol}`;
    if (anchors.has(exactKey)) {
      return anchors.get(exactKey)!;
    }
    const normalizedKey = buildNormalizedKey(direction, symbol);
    if (normalizedKey && anchors.has(normalizedKey)) {
      return anchors.get(normalizedKey)!;
    }
  }
  const defaultKey = `${direction}:*`;
  if (anchors.has(defaultKey)) {
    return anchors.get(defaultKey)!;
  }
  if (anchors.has("card")) {
    return anchors.get("card")!;
  }
  return null;
}

export function clearAnchorRegistry(registry: AnchorRegistry): void {
  registry.clear();
}
