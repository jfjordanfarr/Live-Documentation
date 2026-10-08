/**
 * URL State Management
 * 
 * Handles URL parameter parsing and updates for view navigation
 * without page reloads. Writes go through the history module, which decides
 * whether a change is a move Back can return from.
 */

import type { ViewName } from "../types";
import { decompressSnapshot, compressSnapshot } from "./compressed-url-state";
import { commitUrl } from "./history";

/**
 * Map between URL/config view names and internal state view names.
 * URL uses: circuit, local, membrane, force, sources, world (matches config schema)
 * Internal uses: circuit, map, membrane, graph, sources, world
 */
/** Maps a URL-facing view name (e.g. `"local"`) to the internal {@link ViewName}. */
export const viewNameToInternal = (name: string): ViewName => {
  switch (name) {
    case "local": return "map";
    case "force": return "graph";
    case "sources": return "sources";
    case "membrane": return "membrane";
    case "world": return "world";
    case "circuit":
    default:
      return "circuit";
  }
};

/** Maps an internal {@link ViewName} back to the URL-facing string used in query parameters. */
export const viewNameToUrl = (name: ViewName): string => {
  switch (name) {
    case "map": return "local";
    case "graph": return "force";
    case "sources": return "sources";
    case "membrane": return "membrane";
    case "world": return "world";
    case "circuit":
    default:
      return "circuit";
  }
};

/** State parsed from the initial URL on page load. */
export interface InitialUrlState {
  view: ViewName;
  nodeId: string | null;
  /** The directories opened in the Local Map: a snapshot's, or the one `?dir=` names, the door into a directory with no file in focus (2026-10-08). */
  openDirectories: ReadonlySet<string>;
  hasUrlState: boolean;
}

/**
 * Parse initial view and node from URL parameters.
 * Priority: URL params > defaults (Membrane view for cold start)
 */
export const parseInitialState = (): InitialUrlState => {
  const params = new URLSearchParams(window.location.search);

  // Compressed state (?s=) takes highest priority — it encodes the full
  // Membrane Map snapshot including view, pins, expanded dirs, transform.
  const compressedParam = params.get("s");
  if (compressedParam) {
    const snapshot = decompressSnapshot(compressedParam);
    return {
      view: snapshot.view,
      nodeId: snapshot.selectedNodeId,
      openDirectories: snapshot.openDirectories,
      hasUrlState: true
    };
  }

  const urlView = params.get("view");
  const urlNode = params.get("node");
  const urlDirectory = params.get("dir");

  // URL params take priority
  if (urlView || urlNode || urlDirectory) {
    return {
      view: urlView ? viewNameToInternal(urlView) : "map",
      nodeId: urlNode,
      openDirectories: new Set(urlDirectory ? [urlDirectory.replace(/\/+$/u, "")] : []),
      hasUrlState: true
    };
  }

  // Defaults: Membrane Map is the cold-start landing for first-time visitors.
  return { view: "membrane", nodeId: null, openDirectories: new Set(), hasUrlState: false };
};

/**
 * Update URL to reflect current view and focused node without page reload.
 */
export const updateUrlState = (view: ViewName, nodeId: string | null): void => {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  // Preserve data param if present
  const dataParam = params.get("data");

  const compressed = params.get("s");
  if (compressed) {
    params.set("s", compressSnapshot({ ...decompressSnapshot(compressed), view, selectedNodeId: nodeId }));
  }

  // Clear existing view/node params
  params.delete("view");
  params.delete("node");

  // Set new params (skip defaults to keep URLs clean)
  // Membrane is the default cold-start view, but node-only legacy URLs
  // still imply Local Map, so only omit the view when Membrane has no node.
  const urlViewName = viewNameToUrl(view);
  const canOmitView = urlViewName === "membrane" && !nodeId;
  if (!canOmitView) {
    params.set("view", urlViewName);
  }
  if (nodeId) {
    params.set("node", nodeId);
  }

  // Restore data param at the end for consistency
  if (dataParam) {
    params.delete("data");
    params.set("data", dataParam);
  }

  // Build clean URL (no params = no query string)
  const newUrl = params.toString() ? `${url.pathname}?${params.toString()}` : url.pathname;
  commitUrl(newUrl);
};
