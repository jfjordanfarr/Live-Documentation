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
    resetZoom: () => controller.resetZoom()
  };
}

export type { LocalViewApi, LocalViewOptions } from "./types";
