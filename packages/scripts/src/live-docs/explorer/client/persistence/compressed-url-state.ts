/**
 * Compressed URL state for the Membrane Map.
 *
 * Encodes the full view state (view, node selection, pins, expanded
 * directories, transform, filters) into a single `?s=` query parameter
 * using lz-string compression.
 *
 * **Forward-compatibility contract:**
 * - Every serialized payload contains a `v` (version) field.
 * - Deserialization always checks `v` and applies migrations from older versions.
 * - New fields added in future versions MUST have defaults so older payloads
 *   deserialize without error.
 * - Field keys are deliberately short (1-3 chars) to minimize compressed size,
 *   but each is documented in {@link CompressedPayload}.
 *
 * @module compressed-url-state
 */

import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

import type { ViewName } from "../types";
import type { PinSet } from "../views/membraneView/pin-state";
import { serializePins, deserializePins, EMPTY_PIN_SET } from "../views/membraneView/pin-state";

// ─── Current Payload Version ───────────────────────────────────────

/** Bump when the payload shape changes in a backward-incompatible way. */
const CURRENT_VERSION = 1;

// ─── Payload Shape ─────────────────────────────────────────────────

/**
 * The JSON structure compressed into the `?s=` parameter.
 *
 * All fields except `v` are optional — omitted fields use defaults.
 * Key naming convention: single-letter or short abbreviation to
 * minimize serialized size while remaining readable in code.
 */
export interface CompressedPayload {
  /** Schema version. Always present. */
  v: number;
  /** View name (internal: "membrane", "graph", "sources", etc.). */
  w?: string;
  /** Selected node ID. */
  n?: string;
  /** Pin entries (compact: `{ n, s, h? }[]`). */
  p?: Array<{ n: string; s: string; h?: number }>;
  /** Expanded directory IDs. */
  e?: string[];
  /** Transform: [x, y, k]. */
  t?: [number, number, number];
  /** Filters: [showTests, showAssets]. Stored as 0/1 for compactness. */
  f?: [number, number];
  /** Expanded file card IDs. */
  c?: string[];
}

// ─── Snapshot (typed application-level state) ──────────────────────

/**
 * Application-level state snapshot that maps 1:1 with the URL.
 * This is what the controller produces and consumes; the
 * {@link CompressedPayload} is the wire format.
 */
export interface UrlStateSnapshot {
  view: ViewName;
  selectedNodeId: string | null;
  pinSet: PinSet;
  expandedDirectories: ReadonlySet<string>;
  expandedCards: ReadonlySet<string>;
  transform: { x: number; y: number; k: number };
  filters: { showTests: boolean; showAssets: boolean };
}

/** Default state for cold start (no URL parameter). */
export const DEFAULT_SNAPSHOT: UrlStateSnapshot = {
  view: "membrane",
  selectedNodeId: null,
  pinSet: EMPTY_PIN_SET,
  expandedDirectories: new Set(),
  expandedCards: new Set(),
  transform: { x: 0, y: 0, k: 1 },
  filters: { showTests: true, showAssets: true },
};

// ─── Pure Functions (testable) ─────────────────────────────────────

/**
 * Convert a snapshot into a compact JSON payload.
 * Omits fields that match defaults to keep the output small.
 */
export function snapshotToPayload(snapshot: UrlStateSnapshot): CompressedPayload {
  const payload: CompressedPayload = { v: CURRENT_VERSION };

  if (snapshot.view !== DEFAULT_SNAPSHOT.view) {
    payload.w = snapshot.view;
  }
  if (snapshot.selectedNodeId) {
    payload.n = snapshot.selectedNodeId;
  }
  if (snapshot.pinSet.entries.length > 0) {
    payload.p = serializePins(snapshot.pinSet);
  }
  if (snapshot.expandedDirectories.size > 0) {
    payload.e = [...snapshot.expandedDirectories];
  }
  if (snapshot.expandedCards.size > 0) {
    payload.c = [...snapshot.expandedCards];
  }
  const { x, y, k } = snapshot.transform;
  if (x !== 0 || y !== 0 || k !== 1) {
    payload.t = [
      Math.round(x * 100) / 100,
      Math.round(y * 100) / 100,
      Math.round(k * 1000) / 1000,
    ];
  }
  if (!snapshot.filters.showTests || !snapshot.filters.showAssets) {
    payload.f = [
      snapshot.filters.showTests ? 1 : 0,
      snapshot.filters.showAssets ? 1 : 0,
    ];
  }

  return payload;
}

/**
 * Convert a compact JSON payload back into a typed snapshot.
 * Applies version migrations and defaults for missing fields.
 */
export function payloadToSnapshot(payload: CompressedPayload): UrlStateSnapshot {
  // Version check — currently only v1 exists.
  // Future: add migration logic here for v2+.
  if (typeof payload.v !== "number" || payload.v < 1) {
    return { ...DEFAULT_SNAPSHOT };
  }

  const view = (payload.w ?? DEFAULT_SNAPSHOT.view) as ViewName;
  const selectedNodeId = payload.n ?? null;
  const pinSet = payload.p ? deserializePins(payload.p) : EMPTY_PIN_SET;
  const expandedDirectories = new Set(payload.e ?? []);
  const expandedCards = new Set(payload.c ?? []);
  const transform = payload.t
    ? { x: payload.t[0], y: payload.t[1], k: payload.t[2] }
    : { ...DEFAULT_SNAPSHOT.transform };
  const filters = payload.f
    ? { showTests: payload.f[0] === 1, showAssets: payload.f[1] === 1 }
    : { ...DEFAULT_SNAPSHOT.filters };

  return { view, selectedNodeId, pinSet, expandedDirectories, expandedCards, transform, filters };
}

/**
 * Compress a snapshot into a URL-safe string.
 */
export function compressSnapshot(snapshot: UrlStateSnapshot): string {
  const payload = snapshotToPayload(snapshot);
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

/**
 * Decompress a URL-safe string back into a snapshot.
 * Returns the default snapshot if decompression or parsing fails.
 */
export function decompressSnapshot(compressed: string): UrlStateSnapshot {
  try {
    const json = decompressFromEncodedURIComponent(compressed);
    if (!json) return { ...DEFAULT_SNAPSHOT };
    const payload = JSON.parse(json) as CompressedPayload;
    return payloadToSnapshot(payload);
  } catch {
    return { ...DEFAULT_SNAPSHOT };
  }
}

// ─── URL Integration ───────────────────────────────────────────────

const URL_PARAM = "s";

/**
 * Read the current URL and extract a state snapshot.
 * Falls back to defaults if no `?s=` parameter is present.
 */
export function readUrlState(): UrlStateSnapshot {
  const params = new URLSearchParams(window.location.search);
  const compressed = params.get(URL_PARAM);
  if (!compressed) return { ...DEFAULT_SNAPSHOT };
  return decompressSnapshot(compressed);
}

/**
 * Write a state snapshot into the URL without triggering navigation.
 * Preserves the `?data=` parameter if present (used for custom data sources).
 */
export function writeUrlState(snapshot: UrlStateSnapshot): void {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  // Preserve data param
  const dataParam = params.get("data");

  // Clear all existing params
  for (const key of [...params.keys()]) {
    params.delete(key);
  }

  // Only write ?s= if state differs from defaults
  const isDefault = (
    snapshot.view === DEFAULT_SNAPSHOT.view &&
    !snapshot.selectedNodeId &&
    snapshot.pinSet.entries.length === 0 &&
    snapshot.expandedDirectories.size === 0 &&
    snapshot.transform.x === 0 &&
    snapshot.transform.y === 0 &&
    snapshot.transform.k === 1 &&
    snapshot.filters.showTests &&
    snapshot.filters.showAssets
  );

  if (!isDefault) {
    params.set(URL_PARAM, compressSnapshot(snapshot));
  }

  // Restore data param
  if (dataParam) {
    params.set("data", dataParam);
  }

  const newUrl = params.toString() ? `${url.pathname}?${params.toString()}` : url.pathname;
  window.history.replaceState({}, "", newUrl);
}
