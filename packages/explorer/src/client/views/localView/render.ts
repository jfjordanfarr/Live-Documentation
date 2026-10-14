import { createStage, renderBranches } from "./branch-renderer";
import type { LocalViewController } from "./controller";

/** Draw every Local Map scope with the same cards, directory membranes and optimized layout. */
export function renderLocalView(controller: LocalViewController): void {
  const container = controller.getContainer();
  const overlay = controller.getOverlay();
  const { state } = controller.options;
  const tuning = state.tuning.localMap;
  container.style.setProperty("--local-column-gap", `${tuning.columnGap}px`);
  container.style.setProperty("--hover-dim-symbols", String(tuning.hoverDimSymbols));
  container.style.setProperty("--hover-dim-connections", String(tuning.hoverDimConnections));

  controller.currentSubgraph = null;
  controller.branches = null;
  container.classList.remove("symbol-hover-active");
  overlay.classList.remove("symbol-hover-active");
  controller.clearAnchors();
  const path = controller.getActivePath();
  // A path borrows the view, not the exploration's camera or retained arrangement.
  const keepStage = controller.stage?.root.parentElement === container
    && controller.stage.root.classList.contains("path-mode") === !!path;
  if (!keepStage) {
    controller.dropStage();
    controller.previousTops = null;
    container.innerHTML = "";
    controller.contentRoot = null;
  }

  if (!controller.options.graphData.nodes.length) {
    overlay.replaceChildren();
    overlay.dataset.active = "false";
    container.innerHTML = '<div class="empty-hint" tabindex="-1" role="status">No files in this graph.</div>';
    controller.mapTransform = { x: 0, y: 0, k: 1 };
    controller.mapHasInitialFit = false;
    controller.mapUserAdjusted = false;
    controller.lastCenteredNodeId = null;
    controller.mapInitialTransform = null;
    controller.updateMapTransform();
    return;
  }

  if (!controller.mapUserAdjusted) {
    controller.mapHasInitialFit = false;
    controller.mapInitialTransform = null;
  }
  const centeredId = state.selectedNode?.id ?? null;
  if (centeredId !== controller.lastCenteredNodeId) {
    controller.mapHasInitialFit = false;
    controller.mapUserAdjusted = false;
    controller.lastCenteredNodeId = centeredId;
    controller.mapInitialTransform = null;
    controller.lastInteracted = centeredId;
  }

  const root = keepStage ? controller.stage!.root : document.createElement("div");
  if (!keepStage) {
    root.className = "local-layout";
    container.append(root);
  }
  controller.contentRoot = root;
  const stage = controller.stage ?? (controller.stage = createStage(root, overlay));
  renderBranches(controller, stage);
  if (path) controller.fitMapToPath();
  else if (!controller.mapHasInitialFit) controller.fitMapToContent();
  else controller.updateMapTransform();
  controller.scheduleConnectionRedraw();
}
