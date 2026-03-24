/**
 * Pin state management for the Membrane Map.
 *
 * Pure-function module: no DOM, no side effects.
 *
 * The pin model drives the continuous rendering spectrum:
 * Browse (0 pins) → Selected → Partial Pins → All Pins (≡ Local Map).
 * "Compare" emerges from pinning symbols on two nodes.
 * "Path" emerges from injecting BFS-ordered pins via a population strategy.
 *
 * @module pin-state
 */

import type { ExplorerLinkPayload } from "../../../shared/types";

// ─── Types ─────────────────────────────────────────────────────────

/**
 * A single pinned symbol on a node.
 */
export interface PinEntry {
  readonly nodeId: string;
  readonly symbol: string;
  /**
   * When populated by BFS pathfinding, the hop index orders this pin
   * in the path sequence. Undefined for manually pinned symbols.
   */
  readonly hopIndex?: number;
}

/**
 * Immutable pin set. All mutations return a new PinSet.
 */
export interface PinSet {
  readonly entries: readonly PinEntry[];
}

/**
 * A connection visible because of the current pin set.
 * Carries the original link plus which pin entry caused it to be visible.
 */
export interface VisibleConnection {
  readonly link: ExplorerLinkPayload;
  /** The pin entry (or entries) that caused this link to be visible. */
  readonly causedBy: readonly PinEntry[];
}

// ─── Constants ─────────────────────────────────────────────────────

/** The empty pin set. */
export const EMPTY_PIN_SET: PinSet = { entries: [] };

// ─── Pin Manipulation ──────────────────────────────────────────────

/** Build a stable key for de-duplication. */
function pinKey(nodeId: string, symbol: string): string {
  return `${nodeId}\0${symbol}`;
}

/**
 * Add a pin. If the exact (nodeId, symbol) already exists, returns
 * the same PinSet unchanged.
 */
export function addPin(set: PinSet, nodeId: string, symbol: string, hopIndex?: number): PinSet {
  const key = pinKey(nodeId, symbol);
  if (set.entries.some(e => pinKey(e.nodeId, e.symbol) === key)) {
    return set;
  }
  return { entries: [...set.entries, { nodeId, symbol, hopIndex }] };
}

/**
 * Remove a pin by (nodeId, symbol). Returns unchanged PinSet if not found.
 */
export function removePin(set: PinSet, nodeId: string, symbol: string): PinSet {
  const key = pinKey(nodeId, symbol);
  const filtered = set.entries.filter(e => pinKey(e.nodeId, e.symbol) !== key);
  if (filtered.length === set.entries.length) return set;
  return { entries: filtered };
}

/**
 * Toggle a pin: add if absent, remove if present.
 */
export function togglePin(set: PinSet, nodeId: string, symbol: string): PinSet {
  const key = pinKey(nodeId, symbol);
  if (set.entries.some(e => pinKey(e.nodeId, e.symbol) === key)) {
    return removePin(set, nodeId, symbol);
  }
  return addPin(set, nodeId, symbol);
}

/**
 * Remove all pins for a specific node.
 */
export function removePinsForNode(set: PinSet, nodeId: string): PinSet {
  const filtered = set.entries.filter(e => e.nodeId !== nodeId);
  if (filtered.length === set.entries.length) return set;
  return { entries: filtered };
}

/**
 * Clear all pins.
 */
export function clearPins(): PinSet {
  return EMPTY_PIN_SET;
}

/**
 * Replace the entire pin set with BFS path results.
 * Each entry gets a hopIndex corresponding to its position in the path.
 */
export function setPinsFromPath(
  hops: ReadonlyArray<{ nodeId: string; symbol: string }>
): PinSet {
  return {
    entries: hops.map((hop, i) => ({
      nodeId: hop.nodeId,
      symbol: hop.symbol,
      hopIndex: i,
    })),
  };
}

// ─── Queries ───────────────────────────────────────────────────────

/**
 * Get the set of distinct node IDs that have at least one pin.
 */
export function getPinnedNodeIds(set: PinSet): ReadonlySet<string> {
  return new Set(set.entries.map(e => e.nodeId));
}

/**
 * Check whether a specific (nodeId, symbol) is pinned.
 */
export function isSymbolPinned(set: PinSet, nodeId: string, symbol: string): boolean {
  const key = pinKey(nodeId, symbol);
  return set.entries.some(e => pinKey(e.nodeId, e.symbol) === key);
}

/**
 * Whether the pin set contains any entries with hop indices (i.e., a path is active).
 */
export function hasActivePath(set: PinSet): boolean {
  return set.entries.some(e => e.hopIndex !== undefined);
}

/**
 * Get entries sorted by hop index (for path breadcrumb rendering).
 * Returns only entries that have a hopIndex.
 */
export function getPathEntries(set: PinSet): readonly PinEntry[] {
  return set.entries
    .filter(e => e.hopIndex !== undefined)
    .sort((a, b) => a.hopIndex! - b.hopIndex!);
}

// ─── Connection Visibility ─────────────────────────────────────────

/**
 * Resolve a link endpoint to a string ID.
 */
function resolveId(endpoint: string | { id: string }): string {
  return typeof endpoint === "string" ? endpoint : endpoint.id;
}

/**
 * Given the current pin set and the full graph edge list, compute
 * which connections should be drawn.
 *
 * A connection is visible if at least one of its endpoints matches
 * a pinned (nodeId, symbol) pair:
 * - Link's sourceSymbol matches a pin on the source node, OR
 * - Link's targetSymbol matches a pin on the target node, OR
 * - A node-level wildcard pin ("*") makes all connections to/from that node visible
 *
 * Returns the list of visible connections with causation metadata.
 */
export function getVisibleConnections(
  set: PinSet,
  links: readonly ExplorerLinkPayload[]
): readonly VisibleConnection[] {
  if (set.entries.length === 0) return [];

  // Build lookup: nodeId → Set<symbol>
  const pinsByNode = new Map<string, Set<string>>();
  for (const entry of set.entries) {
    let symbols = pinsByNode.get(entry.nodeId);
    if (!symbols) {
      symbols = new Set();
      pinsByNode.set(entry.nodeId, symbols);
    }
    symbols.add(entry.symbol);
  }

  const result: VisibleConnection[] = [];

  for (const link of links) {
    const sourceId = resolveId(link.source);
    const targetId = resolveId(link.target);

    const sourceSymbols = pinsByNode.get(sourceId);
    const targetSymbols = pinsByNode.get(targetId);

    const causes: PinEntry[] = [];

    // Check source-side match
    if (sourceSymbols) {
      if (sourceSymbols.has("*")) {
        // Wildcard: all connections from this node
        causes.push(...set.entries.filter(e => e.nodeId === sourceId && e.symbol === "*"));
      } else if (link.sourceSymbol && sourceSymbols.has(link.sourceSymbol)) {
        causes.push(...set.entries.filter(
          e => e.nodeId === sourceId && e.symbol === link.sourceSymbol
        ));
      }
    }

    // Check target-side match
    if (targetSymbols) {
      if (targetSymbols.has("*")) {
        causes.push(...set.entries.filter(e => e.nodeId === targetId && e.symbol === "*"));
      } else if (link.targetSymbol && targetSymbols.has(link.targetSymbol)) {
        causes.push(...set.entries.filter(
          e => e.nodeId === targetId && e.symbol === link.targetSymbol
        ));
      }
    }

    if (causes.length > 0) {
      result.push({ link, causedBy: causes });
    }
  }

  return result;
}

// ─── Serialization (for URL state) ─────────────────────────────────

/**
 * Serialize pin set to a plain JSON-friendly array for lz-string compression.
 */
export function serializePins(set: PinSet): Array<{ n: string; s: string; h?: number }> {
  return set.entries.map(e => {
    const item: { n: string; s: string; h?: number } = { n: e.nodeId, s: e.symbol };
    if (e.hopIndex !== undefined) item.h = e.hopIndex;
    return item;
  });
}

/**
 * Deserialize pin set from URL state.
 */
export function deserializePins(data: ReadonlyArray<{ n: string; s: string; h?: number }>): PinSet {
  return {
    entries: data.map(d => ({
      nodeId: d.n,
      symbol: d.s,
      hopIndex: d.h,
    })),
  };
}

// ─── Auto-Expansion ────────────────────────────────────────────────

/**
 * Compute the set of directory IDs that must be expanded so all
 * pinned nodes are visible in the membrane layout.
 *
 * For each pinned node ID (a file path like `"packages/shared/src/types.ts"`),
 * we derive the ancestor directories (`"packages"`, `"packages/shared"`,
 * `"packages/shared/src"`) and add them to the result set.
 *
 * @param set - Current pin state
 * @returns Set of directory IDs that should be expanded
 */
export function getRequiredExpansions(set: PinSet): ReadonlySet<string> {
  const dirs = new Set<string>();
  for (const entry of set.entries) {
    const parts = entry.nodeId.split("/");
    // Build ancestor paths (exclude the filename itself)
    for (let i = 1; i < parts.length; i++) {
      dirs.add(parts.slice(0, i).join("/"));
    }
  }
  return dirs;
}

