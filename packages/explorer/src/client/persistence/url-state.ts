/** URL navigation and the remembered Local Map representation. */
import type { LocalMapPerspective, ViewName } from "../types";
import { decompressSnapshot, compressSnapshot } from "./compressed-url-state";
import { commitUrl } from "./history";
import { readPerspective, readView } from "./navigation";

/** The Local Map keeps its established `view=local` address. */
const viewNameToUrl = (name: ViewName): string => name === "map" ? "local" : name;

/** Navigation read from an address. An omitted perspective outside Local Map uses the saved preference. */
export interface InitialUrlState {
  view: ViewName;
  perspective: LocalMapPerspective | null;
  nodeId: string | null;
  openDirectories: ReadonlySet<string>;
  hasUrlState: boolean;
}

/** Parse an address without consulting browser storage; an explicit Local Map link owns its representation. */
export function parseNavigation(search: string): InitialUrlState {
  const params = new URLSearchParams(search);
  const compressed = params.get("s");
  if (compressed) {
    const snapshot = decompressSnapshot(compressed);
    return { view: snapshot.view, perspective: snapshot.perspective, nodeId: snapshot.selectedNodeId,
      openDirectories: snapshot.openDirectories, hasUrlState: true };
  }
  const view = params.get("view");
  const node = params.get("node");
  const directory = params.get("dir");
  const mode = params.get("mode");
  const hasUrlState = view !== null || node !== null || directory !== null || mode !== null;
  const local = hasUrlState && readView(view) === "map";
  return {
    view: readView(view),
    perspective: local || mode !== null ? readPerspective(mode, view) : null,
    nodeId: node,
    openDirectories: new Set(directory !== null ? [directory.replace(/\/+$/u, "")] : []),
    hasUrlState
  };
}

/** URL navigation takes precedence over saved navigation. A board chooses World Map on a fresh visit. */
export const parseInitialState = (): InitialUrlState => parseNavigation(window.location.search);

/** Write view, subject and representation together, preserving paths and exploration state. */
export function updateUrlState(view: ViewName, nodeId: string | null, perspective: LocalMapPerspective): void {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const compressed = params.get("s");
  if (compressed) {
    params.set("s", compressSnapshot({ ...decompressSnapshot(compressed), view, perspective, selectedNodeId: nodeId }));
  }
  params.set("view", viewNameToUrl(view));
  params.set("mode", perspective);
  if (nodeId) params.set("node", nodeId);
  else params.delete("node");
  commitUrl(`${url.pathname}?${params.toString()}`);
}
