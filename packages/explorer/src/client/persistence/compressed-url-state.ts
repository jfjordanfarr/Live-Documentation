/**
 * Portable exploration state for the Local Map.
 *
 * Encodes the full view state (view, node selection, pins, opened
 * directories, open evidence, the path's destination, perspective, filters) into a single
 * `?s=` query parameter using lz-string compression.
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

import { getDefaultFilters } from "./local-storage";
import { readPerspective, readSpatialLayout, readView } from "./navigation";
import { readLayoutSettings, type LayoutSettings } from "../layout-presets";
import type { InspectionTarget, LocalMapPerspective, PathDestination, SpatialLayout, ViewName } from "../types";
import { commitUrl } from "./history";
import type { PinSet } from "../views/pin-state";
import { serializePins, deserializePins, EMPTY_PIN_SET, INTERNAL_SYMBOL } from "../views/pin-state";
import { reconcileRetained } from "../views/retained-state";

// ─── Current Payload Version ───────────────────────────────────────

/**
 * Bump when the payload shape changes in a backward-incompatible way. Version 3 (2026-10-16) changed what an omitted
 * `f` means: before it, both filters shown; from it, the default filters.
 */
const CURRENT_VERSION = 3;

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
  /** View name. Version 1 also used the retired view names. */
  w?: string;
  /** Local Map representation, independent of the navigable view. */
  q?: LocalMapPerspective;
  /** Selected node ID. */
  n?: string;
  /** Explicitly open evidence: file `n` (symbol `s`), bundled Markdown `m` (section `a`), or directory `d`. */
  i?: { n: string; s?: string } | { m: string; a?: string } | { d: string };
  /** Pin entries (compact: `{ n, s, h? }[]`). */
  p?: Array<{ n: string; s: string; h?: number }>;
  /** Version 1 Membrane Map directories; read only for migration. */
  e?: string[];
  /** Version 1 camera; no longer written. */
  t?: [number, number, number];
  /** Filters: [showTests, showAssets]. Stored as 0/1 for compactness; omitted when they are the default's (both shown before version 3). */
  f?: [number, number];
  /** Whether related documentation participates in the spatial graph; omitted by older links. */
  r?: boolean;
  /** Version 1 expanded cards; no longer written. */
  c?: string[];
  /** The directories opened in the Local Map (2026-10-08). */
  d?: string[];
  /** Oldest-first retained-item identities, interleaving file/symbol pins and directory openings. */
  o?: string[];
  /** The 3D Local Map's layout; omitted for the connections layout (2026-10-14). */
  y?: SpatialLayout;
  /** Shared packing and spatial encoding settings, including advanced edits. */
  l?: LayoutSettings;
  /** The end of the path asked for (2026-10-14): a file `n` with perhaps one symbol `s`, or a directory `d`. The start is the newest pin. */
  x?: { n: string; s?: string } | { d: string };
  /** What the Knowledge Sources panel walks from in place of the entry points (2026-10-15): a file `n` or a directory `d`. */
  a?: { n: string; s?: string } | { d: string };
  /** The commit of the history the 3D Local Map shows (2026-10-18); omitted for today. */
  h?: string;
  /** Whether the history's step panel names each commit's author (the plan's C8); omitted when it does not. */
  b?: boolean;
}

// ─── Snapshot (typed application-level state) ──────────────────────

/**
 * Application-level state snapshot that maps 1:1 with the URL.
 * This is what the controller produces and consumes; the
 * {@link CompressedPayload} is the wire format.
 */
export interface UrlStateSnapshot {
  view: ViewName;
  perspective: LocalMapPerspective;
  /** The 3D Local Map's layout, remembered and shared like the perspective. */
  spatialLayout: SpatialLayout;
  selectedNodeId: string | null;
  /** The reader is closed when absent, including in links written before this field existed. */
  inspection?: InspectionTarget | null;
  pinSet: PinSet;
  /** The directories opened in the Local Map; folder navigation is a history step, while pin edits remain within it. */
  openDirectories: ReadonlySet<string>;
  retentionOrder?: readonly string[];
  filters: { showTests: boolean; showAssets: boolean; showRelatedDocs?: boolean };
  /** Absent on older links; those retain the viewer's existing preferences. */
  layout?: LayoutSettings;
  /** The end of the path asked for, drawn from the newest pin; null when no path is asked. */
  destination: PathDestination | null;
  /** The file or directory the Knowledge Sources panel walks from in place of the entry points; null for the entry points. */
  reachFrom: PathDestination | null;
  /** The commit of the history the 3D Local Map shows; null for today (2026-10-18). */
  commit: string | null;
  /** Whether the history's step panel names each commit's author. */
  authors: boolean;
}

const COLD_FILTERS = getDefaultFilters();

/**
 * Default state for cold start (no URL parameter). Its filters are the cold start's own, tests shown and assets hidden:
 * a page opened without an address reads `getDefaultFilters`, so a link that omits the filters shows what a fresh page
 * shows (2026-10-16; until then this said assets shown and every written link carried them hidden).
 */
export const DEFAULT_SNAPSHOT: UrlStateSnapshot = {
  view: "map",
  perspective: "2d",
  spatialLayout: "connections",
  selectedNodeId: null,
  inspection: null,
  pinSet: EMPTY_PIN_SET,
  openDirectories: new Set(),
  filters: { showTests: COLD_FILTERS.showTests, showAssets: COLD_FILTERS.showAssets },
  destination: null,
  reachFrom: null,
  commit: null,
  authors: false
};

// ─── Pure Functions (testable) ─────────────────────────────────────

/**
 * Convert a snapshot into a compact JSON payload.
 * Omits fields that match defaults to keep the output small.
 */
export function snapshotToPayload(snapshot: UrlStateSnapshot): CompressedPayload {
  const payload: CompressedPayload = { v: CURRENT_VERSION };
  const layout = readLayoutSettings(snapshot.layout);
  if (layout) payload.l = layout;
  if (typeof snapshot.filters.showRelatedDocs === "boolean") payload.r = snapshot.filters.showRelatedDocs;
  if (snapshot.retentionOrder?.length) {
    payload.o = [...reconcileRetained({
      pins: snapshot.pinSet,
      openDirectories: snapshot.openDirectories,
      retentionOrder: snapshot.retentionOrder
    }).retentionOrder!];
  }

  if (snapshot.view !== DEFAULT_SNAPSHOT.view) {
    payload.w = snapshot.view;
  }
  if (snapshot.perspective !== DEFAULT_SNAPSHOT.perspective) payload.q = snapshot.perspective;
  if (snapshot.spatialLayout !== DEFAULT_SNAPSHOT.spatialLayout) payload.y = snapshot.spatialLayout;
  if (snapshot.selectedNodeId) {
    payload.n = snapshot.selectedNodeId;
  }
  if (snapshot.inspection?.kind === "file") payload.i = snapshot.inspection.symbol
    ? { n: snapshot.inspection.nodeId, s: snapshot.inspection.symbol } : { n: snapshot.inspection.nodeId };
  else if (snapshot.inspection?.kind === "bundled-doc") payload.i = snapshot.inspection.fragment
    ? { m: snapshot.inspection.path, a: snapshot.inspection.fragment } : { m: snapshot.inspection.path };
  else if (snapshot.inspection?.kind === "directory") payload.i = { d: snapshot.inspection.directory };
  if (snapshot.pinSet.entries.length > 0) {
    payload.p = serializePins(snapshot.pinSet);
  }
  if (snapshot.openDirectories.size > 0) {
    payload.d = [...snapshot.openDirectories].sort();
  }
  if (snapshot.filters.showTests !== DEFAULT_SNAPSHOT.filters.showTests || snapshot.filters.showAssets !== DEFAULT_SNAPSHOT.filters.showAssets) {
    payload.f = [
      snapshot.filters.showTests ? 1 : 0,
      snapshot.filters.showAssets ? 1 : 0,
    ];
  }
  const destination = writeDestination(snapshot.destination);
  if (destination) payload.x = destination;
  const reachFrom = writeDestination(snapshot.reachFrom);
  if (reachFrom) payload.a = reachFrom;
  if (snapshot.commit) payload.h = snapshot.commit;
  if (snapshot.authors) payload.b = true;

  return payload;
}

/** A file, a file's symbol or a directory as the payload carries it; nothing for none. */
function writeDestination(destination: PathDestination | null): CompressedPayload["x"] | undefined {
  if (destination?.kind === "file") return destination.symbol ? { n: destination.nodeId, s: destination.symbol } : { n: destination.nodeId };
  if (destination?.kind === "directory") return { d: destination.directory };
  return undefined;
}

/**
 * Convert a compact JSON payload back into a typed snapshot.
 * Applies version migrations and defaults for missing fields.
 */
export function payloadToSnapshot(payload: CompressedPayload): UrlStateSnapshot {
  // Version 1 defaulted to the retired Membrane Map and stored ancestor expansion chains.
  if (!payload || typeof payload.v !== "number" || payload.v < 1 || payload.v > CURRENT_VERSION) {
    return { ...DEFAULT_SNAPSHOT };
  }

  const view = readView(payload.w);
  const perspective = readPerspective(payload.q, payload.w);
  const spatialLayout = readSpatialLayout(payload.y);
  const selectedNodeId = payload.n ?? null;
  const pinSet = payload.p ? deserializePins(payload.p) : EMPTY_PIN_SET;
  const legacyDirectories = payload.v === 1 && (!payload.w || payload.w === "membrane" || payload.w === "circuit")
    ? (payload.e ?? []).filter((dir, _, all) => !all.some(other => other !== dir && other.startsWith(`${dir}/`))) : [];
  const openDirectories = new Set([...(payload.d ?? []), ...legacyDirectories].filter((entry): entry is string => typeof entry === "string"));
  const filters: UrlStateSnapshot["filters"] = payload.f
    ? { showTests: payload.f[0] === 1, showAssets: payload.f[1] === 1 }
    : payload.v < 3 ? { showTests: true, showAssets: true } : { ...DEFAULT_SNAPSHOT.filters };
  if (typeof payload.r === "boolean") filters.showRelatedDocs = payload.r;
  const retentionOrder = Array.isArray(payload.o)
    ? payload.o.filter((key): key is string => typeof key === "string") : undefined;

  const layout = readLayoutSettings(payload.l);
  return {
    view, perspective, spatialLayout, selectedNodeId, inspection: readInspection(payload.i), pinSet, openDirectories, filters,
    ...(retentionOrder ? { retentionOrder } : {}),
    ...(layout ? { layout } : {}),
    destination: readDestination(payload.x),
    reachFrom: readDestination(payload.a),
    commit: typeof payload.h === "string" && payload.h.trim() ? payload.h.trim() : null,
    authors: payload.b === true
  };
}

/** Read only a declared reader target; malformed or older payloads leave the reader closed. */
function readInspection(value: unknown): InspectionTarget | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const target = value as Record<string, unknown>;
  // A target has one identity. Ambiguous payloads must not silently select a different kind of evidence.
  if (["n", "m", "d"].filter(key => Object.hasOwn(target, key)).length !== 1) return null;
  if (Object.hasOwn(target, "n") && typeof target.n === "string" && target.n) return {
    kind: "file", nodeId: target.n,
    ...(typeof target.s === "string" && target.s ? { symbol: target.s } : {})
  };
  if (Object.hasOwn(target, "m") && typeof target.m === "string" && target.m) return {
    kind: "bundled-doc", path: target.m,
    ...(typeof target.a === "string" && target.a ? { fragment: target.a } : {})
  };
  if (Object.hasOwn(target, "d") && typeof target.d === "string") return { kind: "directory", directory: target.d };
  return null;
}

/** The destination a payload names, or null when it names none or names it badly. */
function readDestination(value: CompressedPayload["x"]): PathDestination | null {
  if (!value || typeof value !== "object") return null;
  if ("d" in value && typeof value.d === "string") return { kind: "directory", directory: value.d };
  if ("n" in value && typeof value.n === "string") {
    return typeof value.s === "string" && value.s ? { kind: "file", nodeId: value.n, symbol: value.s } : { kind: "file", nodeId: value.n };
  }
  return null;
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

// ─── Stale State Scrubbing ─────────────────────────────────────────

/**
 * Scrub a snapshot against the live node set, dropping references to
 * nodes/directories that no longer exist. This prevents stale shared
 * URLs from producing empty treemaps, zombie pins, or orphan cards.
 *
 * Pure function — returns a new snapshot; does not mutate the input.
 */
export function scrubSnapshot(
  snapshot: UrlStateSnapshot,
  nodesById: ReadonlyMap<string, unknown>,
  bundledMarkdown?: Readonly<Record<string, string>>,
): UrlStateSnapshot {
  const nodeIds = [...nodesById.keys()];

  // Opened directories: keep only those with a live node under them
  const openDirectories = new Set<string>();
  for (const dir of snapshot.openDirectories) {
    const prefix = dir === "" ? "" : dir.endsWith("/") ? dir : dir + "/";
    if (nodeIds.some(id => id.startsWith(prefix))) openDirectories.add(dir);
  }

  // Pins: keep only entries whose node still exists
  const validEntries = snapshot.pinSet.entries.filter(e => nodesById.has(e.nodeId));
  const pinSet: PinSet = validEntries.length === snapshot.pinSet.entries.length
    ? snapshot.pinSet
    : { entries: validEntries };

  // Selected node: clear if stale
  const selectedNodeId = snapshot.selectedNodeId && nodesById.has(snapshot.selectedNodeId)
    ? snapshot.selectedNodeId
    : null;

  let inspection: InspectionTarget | null = null;
  const target = snapshot.inspection;
  if (target?.kind === "file" && nodesById.has(target.nodeId)) {
    const symbols = (nodesById.get(target.nodeId) as { publicSymbols?: unknown } | undefined)?.publicSymbols;
    inspection = target.symbol && (target.symbol === INTERNAL_SYMBOL || Array.isArray(symbols) && symbols.includes(target.symbol))
      ? target : { kind: "file", nodeId: target.nodeId };
  } else if (target?.kind === "directory" && destinationLives(target, nodesById, nodeIds)) {
    inspection = target;
  } else if (target?.kind === "bundled-doc" && bundledMarkdown && Object.hasOwn(bundledMarkdown, target.path)) {
    inspection = target;
  }

  // The destination and the panel's start: a file that still exists, or a directory with a live file under it
  const destination = snapshot.destination && destinationLives(snapshot.destination, nodesById, nodeIds) ? snapshot.destination : null;
  const reachFrom = snapshot.reachFrom && destinationLives(snapshot.reachFrom, nodesById, nodeIds) ? snapshot.reachFrom : null;

  return {
    ...snapshot,
    openDirectories,
    pinSet,
    selectedNodeId,
    inspection,
    destination,
    reachFrom,
    ...(snapshot.retentionOrder ? {
      retentionOrder: reconcileRetained({ pins: pinSet, openDirectories, retentionOrder: snapshot.retentionOrder }).retentionOrder
    } : {})
  };
}

/** Whether a destination still names something in the bundle. */
function destinationLives(destination: PathDestination, nodesById: ReadonlyMap<string, unknown>, nodeIds: readonly string[]): boolean {
  if (destination.kind === "file") return nodesById.has(destination.nodeId);
  const prefix = destination.directory === "" ? "" : `${destination.directory}/`;
  return nodeIds.some(id => id.startsWith(prefix));
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
 * Write a state snapshot into the URL without reloading the page; the history decides whether it is a new entry.
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

  // Always encode an explicit exploration, including an empty Local Map. A bare URL may land on a World Map.
  params.set(URL_PARAM, compressSnapshot(snapshot));

  // Restore data param
  if (dataParam) {
    params.set("data", dataParam);
  }

  const newUrl = params.toString() ? `${url.pathname}?${params.toString()}` : url.pathname;
  commitUrl(newUrl);
}
