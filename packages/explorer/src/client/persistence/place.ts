/**
 * The place an Explorer address names, as a key two addresses can be compared by: the view, the file in focus, the
 * folders open in the Membrane Map, and the ends of a path. Pins, expanded cards, pan, zoom and filters are left out;
 * they change what a place shows, not where the person is.
 */

import { decompressSnapshot } from "./compressed-url-state";
import { viewNameToInternal } from "./url-state";

/** Reads the place from an address's query, in either form the Explorer writes: `?view=&node=` or the compressed `?s=`. */
export function placeOf(search: string): string {
  const params = new URLSearchParams(search);
  const compressed = params.get("s");
  const snapshot = compressed ? decompressSnapshot(compressed) : null;
  const viewParam = params.get("view");
  const node = params.get("node") ?? snapshot?.selectedNodeId ?? "";
  // A node without a view has always opened the Local Map; no view and no node is the page's own default.
  const view = viewParam ? viewNameToInternal(viewParam) : snapshot ? snapshot.view : node ? "map" : "";
  const folders = snapshot ? [...snapshot.expandedDirectories].sort() : [];
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const path = from && to ? [from, params.get("fromSymbol") ?? "", to, params.get("toSymbol") ?? ""] : [];
  return JSON.stringify([view, node, folders, path]);
}
