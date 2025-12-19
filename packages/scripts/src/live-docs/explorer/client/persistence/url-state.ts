/**
 * URL State Management
 * 
 * Handles URL parameter parsing and updates for view navigation
 * without page reloads. Uses replaceState to avoid polluting browser history.
 */

import type { ViewName } from "../types";

/**
 * Map between URL/config view names and internal state view names.
 * URL uses: circuit, local, force, sources (matches config schema)
 * Internal uses: circuit, map, graph, sources
 */
export const viewNameToInternal = (name: string): ViewName => {
  switch (name) {
    case "local": return "map";
    case "force": return "graph";
    case "sources": return "sources";
    case "circuit":
    default:
      return "circuit";
  }
};

export const viewNameToUrl = (name: ViewName): string => {
  switch (name) {
    case "map": return "local";
    case "graph": return "force";
    case "sources": return "sources";
    case "circuit":
    default:
      return "circuit";
  }
};

export interface InitialUrlState {
  view: ViewName;
  nodeId: string | null;
  hasUrlState: boolean;
}

export interface ViewerConfig {
  defaultView?: string;
  initialFocusNode?: string;
}

/**
 * Parse initial view and node from URL parameters.
 * Priority: URL params > viewerConfig > defaults (Sources view for cold start)
 */
export const parseInitialState = (viewerConfig: ViewerConfig | null): InitialUrlState => {
  const params = new URLSearchParams(window.location.search);
  const urlView = params.get("view");
  const urlNode = params.get("node");

  // URL params take priority
  if (urlView || urlNode) {
    return {
      view: urlView ? viewNameToInternal(urlView) : "map",
      nodeId: urlNode,
      hasUrlState: true
    };
  }

  // Fall back to viewerConfig
  if (viewerConfig) {
    return {
      view: viewerConfig.defaultView ? viewNameToInternal(viewerConfig.defaultView) : "map",
      nodeId: viewerConfig.initialFocusNode ?? null,
      hasUrlState: false
    };
  }

  // Defaults: Knowledge Sources is the cold-start landing for first-time visitors
  return { view: "sources", nodeId: null, hasUrlState: false };
};

/**
 * Update URL to reflect current view and focused node without page reload.
 * Uses replaceState to avoid polluting browser history on every interaction.
 */
export const updateUrlState = (view: ViewName, nodeId: string | null): void => {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  // Preserve data param if present
  const dataParam = params.get("data");

  // Clear existing view/node params
  params.delete("view");
  params.delete("node");

  // Set new params (skip defaults to keep URLs clean)
  // Local Map ("local") is the default, so omit it from URL
  const urlViewName = viewNameToUrl(view);
  if (urlViewName !== "local") {
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
  window.history.replaceState({}, "", newUrl);
};
