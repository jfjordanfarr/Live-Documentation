import { LocalViewController } from "./controller";
import type { LocalViewApi, LocalViewOptions } from "./types";

/** Creates a Local Map view backed by a {@link LocalViewController}. */
export function createLocalView(options: LocalViewOptions): LocalViewApi {
  const controller = new LocalViewController(options);
  return {
    render: () => controller.render(),
    getStrain: () => controller.getStrain(),
    getSubjectAnchor: nodeId => controller.getSubjectAnchor(nodeId),
    placeSubjectAnchor: (nodeId, anchor) => controller.placeSubjectAnchor(nodeId, anchor),
    drawConnections: () => controller.drawConnections(),
    highlightSelection: () => controller.highlightSelection(),
    ensureReadable: () => controller.ensureReadable(),
    zoomIn: () => controller.zoomIn(),
    zoomOut: () => controller.zoomOut(),
    resetZoom: () => controller.resetZoom(),
    // Multi-hop API
    get localMapState() { return controller.localMapState; },
    // Path mode API
    setActivePath: (path) => controller.setActivePath(path),
    getActivePath: () => controller.getActivePath(),
    dispose: () => controller.dispose()
  };
}

export type { LocalViewApi, LocalViewOptions } from "./types";
