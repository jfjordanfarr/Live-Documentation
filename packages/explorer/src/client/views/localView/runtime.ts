/**
 * Runtime state and anchor registry for the Local Map (3-column) view.
 *
 * Created 2025-12-04 during the Local Map modularisation (commit `4504d36`).
 * Extended 2025-12-06 with column-role-aware keys (commit `47ea9a9`)
 * and 2025-12-19 with hop-aware keys for multi-hop path mode (commit `a0cc5de`).
 *
 * Pure functions live here (no DOM rendering) so they can be tested
 * in isolation. The DOM-touching counterpart is `controller.ts`.
 *
 * @module
 */

import type { MultiHopEntry } from "./connections";
import type { ColumnRole, LocalSubgraph, MapTransform } from "./types";

/**
 * Two-level map used to store DOM anchor elements keyed by
 * `registryKey → symbolKey → HTMLElement`.
 *
 * The outer key is produced by {@link buildRegistryKey} or
 * {@link buildRegistryKeyWithHop}; the inner key is a
 * direction-qualified symbol identifier (e.g. `"inbound:MyClass"`).
 */
export type AnchorRegistry = Map<string, Map<string, HTMLElement>>;

/**
 * Builds the composite registry key for anchor storage.
 * Format: `{columnRole}:{nodeId}` to disambiguate nodes appearing in multiple columns.
 * For multi-hop, use {@link buildRegistryKeyWithHop} instead.
 */
export function buildRegistryKey(columnRole: ColumnRole, nodeId: string): string {
  return `${columnRole}:${nodeId}`;
}

/**
 * Builds a hop-aware registry key for multi-hop anchor storage.
 * Format: `{columnRole}:{hopIndex}:{nodeId}` to disambiguate the same node
 * appearing in multiple columns across different hops.
 */
export function buildRegistryKeyWithHop(columnRole: ColumnRole, hopIndex: number, nodeId: string): string {
  return `${columnRole}:${hopIndex}:${nodeId}`;
}

/** Ephemeral pointer position captured during drag interactions. */
export interface DragPosition {
  x: number;
  y: number;
  time: number;
}

/**
 * Mutable runtime bag for the Local Map view, holding references to
 * the viewport DOM nodes, pan/zoom transform, drag state, and the
 * current anchor registry. Created by {@link createRuntime}.
 */
export interface LocalViewRuntime {
  viewport: HTMLDivElement;
  container: HTMLDivElement;
  overlay: HTMLDivElement;
  currentSubgraph: LocalSubgraph | null;
  /** Multi-hop subgraphs for rendering and connection drawing. */
  multiHopSubgraphs: MultiHopEntry[] | null;
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

/**
 * Creates a fresh {@link LocalViewRuntime} with default values.
 * All transform/drag fields start at zero/null; the anchor registry
 * starts empty.
 */
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
    multiHopSubgraphs: null,
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

/**
 * Registers a DOM element as an anchor point for connection drawing.
 *
 * The element is stored under both its raw `key` and a normalised
 * variant (produced by `normalize`) so that callers can look up anchors
 * by either original or canonical symbol name.
 */
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

/**
 * Registers an anchor with hop-aware key for multi-hop visualisation.
 * Similar to {@link registerAnchor} but uses {@link buildRegistryKeyWithHop}
 * to scope the anchor to a specific hop index.
 */
export function registerAnchorWithHop(
  registry: AnchorRegistry,
  nodeId: string,
  columnRole: ColumnRole,
  hopIndex: number,
  key: string,
  element: HTMLElement,
  normalize: (key: string) => string | null
): void {
  const registryKey = buildRegistryKeyWithHop(columnRole, hopIndex, nodeId);
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

/**
 * Resolves the best-matching anchor element for a connection endpoint.
 *
 * Look-up priority:
 * 1. Exact `{direction}:{symbol}` match
 * 2. Normalised symbol match (via `buildNormalizedKey`)
 * 3. Wildcard fallback `{direction}:*`
 * 4. Card-level fallback `"card"`
 */
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

/**
 * Hop-aware variant of {@link getAnchor} for multi-hop path mode.
 * Uses {@link buildRegistryKeyWithHop} to scope the look-up to a specific
 * hop index. Same priority cascade as `getAnchor`.
 */
export function getAnchorWithHop(
  registry: AnchorRegistry,
  nodeId: string,
  columnRole: ColumnRole,
  hopIndex: number,
  direction: "inbound" | "outbound",
  symbol: string | undefined,
  buildNormalizedKey: (direction: "inbound" | "outbound", symbol: string) => string | null
): HTMLElement | null {
  const registryKey = buildRegistryKeyWithHop(columnRole, hopIndex, nodeId);
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

/** Empties every entry in the given anchor registry. */
export function clearAnchorRegistry(registry: AnchorRegistry): void {
  registry.clear();
}
