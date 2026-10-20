/**
 * The place an Explorer address names, as a key two addresses can be compared by: the view, the file in focus, the
 * folders open in the Local Map, its representation and 3D layout, the end of a path asked for, and the evidence open
 * in the reader. Pins, pan, zoom and filters are left out; they change what a place shows, not where the person is.
 */

import { decompressSnapshot } from "./compressed-url-state";
import { parseNavigation } from "./url-state";

/** Reads the place from an address's query, in either form the Explorer writes: `?view=&node=` or the compressed `?s=`. */
export function placeOf(search: string): string {
  const params = new URLSearchParams(search);
  const navigation = parseNavigation(search);
  const node = navigation.nodeId ?? "";
  const view = navigation.hasUrlState ? navigation.view : "";
  const folders = [...navigation.openDirectories].sort();
  const compressed = params.get("s");
  const snapshot = compressed ? decompressSnapshot(compressed) : null;
  const destination = snapshot?.destination;
  const path = destination?.kind === "file" ? ["file", destination.nodeId, destination.symbol ?? ""]
    : destination?.kind === "directory" ? ["directory", destination.directory] : [];
  const inspection = snapshot?.inspection;
  const reader = inspection?.kind === "file" ? ["file", inspection.nodeId, inspection.symbol ?? ""]
    : inspection?.kind === "bundled-doc" ? ["bundled-doc", inspection.path, inspection.fragment ?? ""]
    : inspection?.kind === "directory" ? ["directory", inspection.directory] : [];
  return JSON.stringify([view, view === "map" ? navigation.perspective : null, view === "map" ? navigation.spatialLayout : null, node, folders, path, reader]);
}
