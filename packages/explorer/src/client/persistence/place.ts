/**
 * The place an Explorer address names, as a key two addresses can be compared by: the view, the file in focus, the
 * folders open in the Local Map, its representation and 3D layout, and the ends of a path. Pins, pan, zoom and filters are left out;
 * they change what a place shows, not where the person is.
 */

import { parseNavigation } from "./url-state";

/** Reads the place from an address's query, in either form the Explorer writes: `?view=&node=` or the compressed `?s=`. */
export function placeOf(search: string): string {
  const params = new URLSearchParams(search);
  const navigation = parseNavigation(search);
  const node = navigation.nodeId ?? "";
  const view = navigation.hasUrlState ? navigation.view : "";
  const folders = [...navigation.openDirectories].sort();
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const path = from && to ? [from, params.get("fromSymbol") ?? "", to, params.get("toSymbol") ?? ""] : [];
  return JSON.stringify([view, view === "map" ? navigation.perspective : null, view === "map" ? navigation.spatialLayout : null, node, folders, path]);
}
