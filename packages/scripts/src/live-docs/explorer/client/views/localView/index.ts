import { LocalViewController } from "./controller";
import type { LocalViewApi, LocalViewOptions } from "./types";

export function createLocalView(options: LocalViewOptions): LocalViewApi {
  const controller = new LocalViewController(options);
  return {
    render: () => controller.render(),
    drawConnections: () => controller.drawConnections(),
    highlightSelection: () => controller.highlightSelection(),
    zoomIn: () => controller.zoomIn(),
    zoomOut: () => controller.zoomOut(),
    resetZoom: () => controller.resetZoom(),
    // Multi-hop API
    get localMapState() { return controller.localMapState; },
    addPinToPath: (nodeId, symbol, hopIndex) => controller.addPinToPath(nodeId, symbol, hopIndex),
    removePinFromPath: (fromHopIndex) => controller.removePinFromPath(fromHopIndex),
    getPinnedPath: () => controller.getPinnedPath(),
    // Path mode API
    setActivePath: (path) => controller.setActivePath(path),
    getActivePath: () => controller.getActivePath(),
    dispose: () => controller.dispose()
  };
}

export type { LocalViewApi, LocalViewOptions } from "./types";
