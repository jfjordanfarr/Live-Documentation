/**
 * Independent symbol pins shared by the Explorer views.
 *
 * Pure-function module: no DOM, no side effects.
 *
 * Pins retain independent file and symbol neighborhoods in both Local Map
 * representations. Explicit paths have their own scope; hop indices remain
 * readable only to preserve earlier shared snapshots.
 *
 * @module pin-state
 */

import { normalizeSymbolIdentifier } from "./symbolAnchors";
import type { ExplorerLinkPayload } from "../../shared/types";

// ─── Types ─────────────────────────────────────────────────────────

/**
 * A single pinned symbol on a node.
 */
export interface PinEntry {
  readonly nodeId: string;
  readonly symbol: string;
  /**
   * Legacy path order, preserved when reading earlier shared snapshots.
   * Undefined for manually pinned symbols.
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

/** Retain every interface of a file; repeating the action never releases it. */
export function retainFile(set: PinSet, nodeId: string): PinSet {
  if (isSymbolPinned(set, nodeId, "*")) return set;
  return addPin(removePinsForNode(set, nodeId), nodeId, "*");
}

/**
 * Toggle a row in the effective selection. Removing a row from a whole-file
 * selection materializes its remaining rows, so the wildcard cannot mask it.
 */
export function toggleFileSymbol(set: PinSet, nodeId: string, symbol: string, symbols: readonly string[]): PinSet {
  if (!isSymbolPinned(set, nodeId, "*")) return togglePin(set, nodeId, symbol);
  let next = removePinsForNode(set, nodeId);
  for (const row of new Set([...symbols, "__internals__"])) {
    if (row !== symbol) next = addPin(next, nodeId, row);
  }
  return next;
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

  // Build lookup: nodeId → Set<normalizedSymbol>
  // Also track original entries by normalized key for cause attribution
  const pinsByNode = new Map<string, Set<string>>();
  const entriesByNormKey = new Map<string, PinEntry[]>();
  for (const entry of set.entries) {
    const norm = entry.symbol === "*" ? "*" : (normalizeSymbolIdentifier(entry.symbol) ?? entry.symbol);
    let symbols = pinsByNode.get(entry.nodeId);
    if (!symbols) {
      symbols = new Set();
      pinsByNode.set(entry.nodeId, symbols);
    }
    symbols.add(norm);
    const mapKey = `${entry.nodeId}\0${norm}`;
    let arr = entriesByNormKey.get(mapKey);
    if (!arr) { arr = []; entriesByNormKey.set(mapKey, arr); }
    arr.push(entry);
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
        causes.push(...(entriesByNormKey.get(`${sourceId}\0*`) ?? []));
      } else if (link.sourceSymbol) {
        const normLink = normalizeSymbolIdentifier(link.sourceSymbol);
        if (normLink && sourceSymbols.has(normLink)) {
          causes.push(...(entriesByNormKey.get(`${sourceId}\0${normLink}`) ?? []));
        }
      } else {
        // sourceSymbol is null/undefined — this dependency is caused by internal/
        // private code. Attribute it to ALL pins on the source node (like the Local
        // Map's Internals row absorbing unattributed deps).
        for (const entry of set.entries) {
          if (entry.nodeId === sourceId) {
            causes.push(entry);
          }
        }
      }
    }

    // Check target-side match
    if (targetSymbols) {
      if (targetSymbols.has("*")) {
        causes.push(...(entriesByNormKey.get(`${targetId}\0*`) ?? []));
      } else if (link.targetSymbol) {
        const normLink = normalizeSymbolIdentifier(link.targetSymbol);
        if (normLink && targetSymbols.has(normLink)) {
          causes.push(...(entriesByNormKey.get(`${targetId}\0${normLink}`) ?? []));
        }
      } else {
        // targetSymbol is null — attribute to __internals__ pin if present,
        // or to ALL pins on the target node (mirrors source-side absorption).
        if (targetSymbols.has("__internals__")) {
          causes.push(...(entriesByNormKey.get(`${targetId}\0__internals__`) ?? []));
        } else {
          for (const entry of set.entries) {
            if (entry.nodeId === targetId) {
              causes.push(entry);
            }
          }
        }
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
