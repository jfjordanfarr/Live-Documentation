import { LocalViewController } from "./controller";
import type { LocalViewApi, LocalViewOptions } from "./types";

/** Creates a Local Map view backed by a {@link LocalViewController}. */
export function createLocalView(options: LocalViewOptions): LocalViewApi {
  const controller = new LocalViewController(options);
  return {
    render: () => controller.render(),
    setMoment: (moment, changes, settle) => controller.setMoment(moment, changes, settle),
    settle: () => controller.settle(),
    tryRefreshReading: () => controller.tryRefreshReading(),
    isShown: () => controller.isShown(),
    show: () => controller.show(),
    capturePinChange: (nodeId, symbol, nextSubjectId, closeExpansion) => controller.capturePinChange(nodeId, symbol, nextSubjectId, closeExpansion),
    captureDirectoryChange: directory => controller.captureDirectoryChange(directory),
    captureReadingChange: (nodeId, symbol, control) => controller.captureReadingChange(nodeId, symbol, control),
    clearPathForExploration: () => controller.clearPathForExploration(),
    focusNode: (nodeId, symbol) => controller.focusNode(nodeId, symbol),
    focusDirectory: directory => controller.focusDirectory(directory),
    getSubjectAnchor: nodeId => controller.getSubjectAnchor(nodeId),
    placeSubjectAnchor: (nodeId, anchor) => controller.placeSubjectAnchor(nodeId, anchor),
    placeReturnedSubject: (nodeId, anchor) => controller.placeReturnedSubject(nodeId, anchor),
    settleIntoFrame: () => controller.settleIntoFrame(),
    keepInspectionVisible: target => controller.keepInspectionVisible(target),
    drawConnections: () => controller.drawConnections(),
    highlightSelection: () => controller.highlightSelection(),
    zoomIn: () => controller.zoomIn(),
    zoomOut: () => controller.zoomOut(),
    resetZoom: () => controller.resetZoom(),
    fitWhole: () => controller.fitWhole(),
    arriveWithLines: target => controller.arriveWithLines(target),
    applyReads: () => controller.applyReads(),
    isFollowing: () => controller.isFollowing(),
    framingLeftOut: () => controller.framingLeftOut(),
    // Multi-hop API
    get localMapState() { return controller.localMapState; },
    // Path mode API
    setActivePath: (path) => controller.setActivePath(path),
    getActivePath: () => controller.getActivePath(),
    dispose: () => controller.dispose()
  };
}

export type { LocalViewApi, LocalViewOptions } from "./types";
