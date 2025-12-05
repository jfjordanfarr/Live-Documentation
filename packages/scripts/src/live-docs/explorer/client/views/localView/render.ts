import type { ExplorerNodePayload } from "../../../shared/types";
import type { DirectoryNode } from "../../types";
import {
  ROOT_KEY,
  buildHierarchy,
  computeDirectoryLayout,
  getDirectoryKey,
  measureDirectoryTree
} from "../layoutUtils";
import type { DirectoryLayoutPlan } from "../layoutUtils";
import type { LocalViewController } from "./controller";
import type { CenterAlignmentGuides } from "./types";

export function renderLocalView(controller: LocalViewController): void {
  const container = controller.getContainer();
  const overlay = controller.getOverlay();
  const { state } = controller.options;

  overlay.innerHTML = "";
  container.innerHTML = "";
  controller.currentSubgraph = null;
  controller.contentRoot = null;
  controller.clearAnchors();

  if (!state.selectedNode) {
    container.innerHTML = '<div class="empty-hint">Select a node to view local relationships.</div>';
    controller.mapTransform = { x: 0, y: 0, k: 1 };
    controller.mapHasInitialFit = false;
    controller.mapUserAdjusted = false;
    controller.lastCenteredNodeId = null;
    controller.mapInitialTransform = null;
    controller.updateMapTransform();
    return;
  }

  const subgraph = controller.buildLocalSubgraph(state.selectedNode);
  controller.currentSubgraph = subgraph;

  if (subgraph.nodes.length === 0) {
    container.innerHTML = '<div class="empty-hint">No related nodes were found.</div>';
    controller.mapTransform = { x: 0, y: 0, k: 1 };
    controller.mapHasInitialFit = false;
    controller.mapUserAdjusted = false;
    controller.mapInitialTransform = null;
    controller.updateMapTransform();
    return;
  }

  if (!controller.mapUserAdjusted) {
    controller.mapHasInitialFit = false;
    controller.mapInitialTransform = null;
  }

  if (state.selectedNode.id !== controller.lastCenteredNodeId) {
    controller.mapHasInitialFit = false;
    controller.mapUserAdjusted = false;
    controller.lastCenteredNodeId = state.selectedNode.id;
    controller.mapInitialTransform = null;
  }

  const connectionScore = new Map<string, number>();
  subgraph.links.forEach(edge => {
    connectionScore.set(edge.sourceId, (connectionScore.get(edge.sourceId) ?? 0) + 1);
    connectionScore.set(edge.targetId, (connectionScore.get(edge.targetId) ?? 0) + 1);
  });

  const layoutRoot = document.createElement("div");
  layoutRoot.className = "local-layout";
  container.appendChild(layoutRoot);
  controller.contentRoot = layoutRoot;

  const centerNodes = [subgraph.center];
  const inboundNodes = subgraph.nodes.filter(node => subgraph.inboundIds.has(node.id));
  const outboundNodes = subgraph.nodes.filter(node => subgraph.outboundIds.has(node.id));

  const centerColumn = createHierarchicalColumn(
    controller,
    "Selected Artifact",
    centerNodes,
    "center",
    "No artifact selected",
    "center",
    connectionScore
  );
  layoutRoot.appendChild(centerColumn);

  const alignmentGuides = controller.collectCenterAlignmentGuides(centerColumn);

  const dependenciesColumn = createStackedColumn(
    controller,
    "Dependencies (Inputs)",
    outboundNodes,
    "outbound",
    "No dependencies",
    alignmentGuides,
    "left",
    connectionScore
  );
  layoutRoot.insertBefore(dependenciesColumn, centerColumn);

  const dependentsColumn = createStackedColumn(
    controller,
    "Dependents (Outputs)",
    inboundNodes,
    "inbound",
    "No dependents",
    alignmentGuides,
    "right",
    connectionScore
  );
  layoutRoot.appendChild(dependentsColumn);

  controller.applyColumnVerticalCentering(layoutRoot);

  if (!controller.mapHasInitialFit && controller.contentRoot) {
    controller.fitMapToContent();
  } else {
    controller.updateMapTransform();
  }

  controller.scheduleConnectionRedraw();
}

function createHierarchicalColumn(
  controller: LocalViewController,
  label: string,
  nodes: ExplorerNodePayload[],
  direction: "inbound" | "outbound" | "center",
  emptyLabel: string,
  position: "left" | "center" | "right",
  connectionScore: Map<string, number>
): HTMLElement {
  const column = document.createElement("div");
  column.className = `local-column ${direction}`;
  column.dataset.direction = direction;
  column.dataset.position = position;

  const heading = document.createElement("div");
  heading.className = "local-column-label";
  heading.textContent = label;
  column.appendChild(heading);

  if (direction === "center") {
    if (nodes.length === 0) {
      const empty = document.createElement("div");
      empty.className = "local-column-empty";
      empty.textContent = emptyLabel;
      column.appendChild(empty);
      return column;
    }
    const focusSurface = document.createElement("div");
    focusSurface.className = "local-focus-surface";
    nodes.forEach(node => {
      const card = createNodeCard(controller, node);
      card.classList.add("focus-node");
      focusSurface.appendChild(card);
    });
    column.appendChild(focusSurface);
    return column;
  }

  const surface = renderLayoutForNodes(controller, nodes, direction, connectionScore);
  if (!surface) {
    const empty = document.createElement("div");
    empty.className = "local-column-empty";
    empty.textContent = emptyLabel;
    column.appendChild(empty);
    return column;
  }

  column.appendChild(surface);
  return column;
}

function createStackedColumn(
  controller: LocalViewController,
  label: string,
  nodes: ExplorerNodePayload[],
  direction: "inbound" | "outbound",
  emptyLabel: string,
  guides: CenterAlignmentGuides,
  position: "left" | "right",
  connectionScore: Map<string, number>
): HTMLElement {
  const column = document.createElement("div");
  column.className = `local-column ${direction} local-column--stacked`;
  column.dataset.direction = direction;
  column.dataset.position = position;

  const heading = document.createElement("div");
  heading.className = "local-column-label";
  heading.textContent = label;
  column.appendChild(heading);

  const eligibleNodes = nodes.filter(node => controller.shouldIncludeNode(node));
  if (eligibleNodes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "local-column-empty";
    empty.textContent = emptyLabel;
    column.appendChild(empty);
    return column;
  }

  const stack = document.createElement("div");
  stack.className = "local-stack";

  const grouped = new Map<
    string,
    {
      nodes: Array<{ node: ExplorerNodePayload; alignment: number; weight: number }>;
      order: number;
    }
  >();

  eligibleNodes.forEach(node => {
    const alignment = computeDirectionalAlignmentValue(controller, node, direction, guides);
    const weight = connectionScore.get(node.id) ?? 0;
    const key = getDirectoryKey(node);
    if (!grouped.has(key)) {
      grouped.set(key, {
        nodes: [],
        order: Number.POSITIVE_INFINITY
      });
    }
    const group = grouped.get(key)!;
    group.nodes.push({ node, alignment, weight });
    if (Number.isFinite(alignment)) {
      group.order = Math.min(group.order, alignment);
    }
  });

  const orderedGroups = Array.from(grouped.entries())
    .map(([path, group]) => {
      const nodesWithOrder = group.nodes.slice().sort((a, b) => {
        const aAlignment = Number.isFinite(a.alignment) ? a.alignment : Number.POSITIVE_INFINITY;
        const bAlignment = Number.isFinite(b.alignment) ? b.alignment : Number.POSITIVE_INFINITY;
        if (aAlignment !== bAlignment) {
          return aAlignment - bAlignment;
        }
        if (b.weight !== a.weight) {
          return b.weight - a.weight;
        }
        return a.node.name.localeCompare(b.node.name);
      });
      const displayName = path === ROOT_KEY ? "(root)" : path.split("/").filter(Boolean).pop() ?? "(root)";
      const orderValue = Number.isFinite(group.order) ? group.order : Number.POSITIVE_INFINITY;
      return {
        path,
        displayName,
        order: orderValue,
        nodes: nodesWithOrder
      };
    })
    .sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.displayName.localeCompare(b.displayName);
    });

  orderedGroups.forEach(group => {
    const groupElement = document.createElement("div");
    groupElement.className = "local-stack-group";

    const shouldShowLabel = !(group.path === ROOT_KEY && orderedGroups.length === 1);
    if (shouldShowLabel) {
      const labelElement = document.createElement("div");
      labelElement.className = "local-stack-group__label";
      labelElement.textContent = group.displayName;
      groupElement.appendChild(labelElement);
    }

    const content = document.createElement("div");
    content.className = "local-stack-group__content";
    group.nodes.forEach(entry => {
      const card = createNodeCard(controller, entry.node);
      card.classList.add("layout-node", "stacked-node");
      card.dataset.direction = direction;
      content.appendChild(card);
    });
    groupElement.appendChild(content);
    stack.appendChild(groupElement);
  });

  column.appendChild(stack);
  return column;
}

function computeDirectionalAlignmentValue(
  controller: LocalViewController,
  node: ExplorerNodePayload,
  direction: "inbound" | "outbound",
  guides: CenterAlignmentGuides
): number {
  const subgraph = controller.currentSubgraph;
  if (!subgraph) {
    return Number.POSITIVE_INFINITY;
  }

  const relatedEdges = subgraph.links.filter(edge => {
    if (direction === "inbound") {
      return edge.direction === "inbound" && edge.sourceId === node.id;
    }
    return edge.direction === "outbound" && edge.targetId === node.id;
  });

  const anchorPositions: number[] = [];
  relatedEdges.forEach(edge => {
    const centerNodeId = direction === "inbound" ? edge.targetId : edge.sourceId;
    if (!centerNodeId) {
      return;
    }
    const anchorDirection = direction === "inbound" ? "outbound" : "inbound";
    const symbol = direction === "inbound" ? edge.targetSymbol : edge.sourceSymbol;
    const anchorY = controller.lookupCenterAnchorPosition(guides, centerNodeId, anchorDirection, symbol);
    if (anchorY !== null && Number.isFinite(anchorY)) {
      anchorPositions.push(anchorY);
    }
  });

  if (anchorPositions.length > 0) {
    const sum = anchorPositions.reduce((acc, value) => acc + value, 0);
    return sum / anchorPositions.length;
  }

  const { state } = controller.options;
  const focusFallback = state.selectedNode ? guides.cardCenters.get(state.selectedNode.id) : undefined;
  return focusFallback !== undefined ? focusFallback : Number.POSITIVE_INFINITY;
}

function createNodeCard(controller: LocalViewController, node: ExplorerNodePayload): HTMLElement {
  const card = document.createElement("div");
  card.className = "node-card";
  card.dataset.id = node.id;
  card.title = node.codeRelativePath;
  card.tabIndex = 0;

  const { state, testCoverage } = controller.options;

  if (state.selectedNode && state.selectedNode.id === node.id) {
    card.classList.add("selected", "local-focus");
  }

  controller.registerAnchor(node.id, "card", card);

  const inboundHub = document.createElement("div");
  inboundHub.className = "symbol-anchor hub inbound";
  card.appendChild(inboundHub);
  controller.registerAnchor(node.id, "inbound:*", inboundHub);

  const outboundHub = document.createElement("div");
  outboundHub.className = "symbol-anchor hub outbound";
  card.appendChild(outboundHub);
  controller.registerAnchor(node.id, "outbound:*", outboundHub);

  const header = document.createElement("div");
  header.className = "node-title";
  header.textContent = node.name;
  card.appendChild(header);

  const pathElement = document.createElement("div");
  pathElement.className = "node-path";
  pathElement.textContent = node.codeRelativePath;
  card.appendChild(pathElement);

  card.appendChild(createSymbolSection(controller, node));

  if (!controller.isTestNode(node) && state.filters.showTests) {
    const backing = testCoverage.get(node.id);
    if (backing && backing.length > 0) {
      card.classList.add("test-backed");
      card.dataset.testCount = String(backing.length);
      const coverage = document.createElement("div");
      coverage.className = "node-tests";
      const label = document.createElement("span");
      label.className = "node-tests__label";
      label.textContent = backing.length === 1 ? "Test" : "Tests";
      coverage.appendChild(label);
      backing.slice(0, 3).forEach(testNode => {
        const tag = document.createElement("span");
        tag.className = "node-tests__item";
        tag.textContent = testNode.name;
        coverage.appendChild(tag);
      });
      if (backing.length > 3) {
        const remainder = document.createElement("span");
        remainder.className = "node-tests__more";
        remainder.textContent = `+${backing.length - 3}`;
        coverage.appendChild(remainder);
      }
      const coverageTitle = backing.map(test => test.codeRelativePath).join("\n");
      card.title = `${card.title}\nTest coverage:\n${coverageTitle}`;
      card.appendChild(coverage);
    }
  }

  const directory = document.createElement("div");
  directory.className = "node-directory";
  directory.textContent = getDirectoryKey(node) === ROOT_KEY ? "(root)" : getDirectoryKey(node);
  card.appendChild(directory);

  card.addEventListener("click", event => {
    event.stopPropagation();
    void controller.selectNode(node);
  });

  card.addEventListener("dblclick", event => {
    event.stopPropagation();
    void controller.selectNode(node);
  });

  return card;
}

function createSymbolSection(controller: LocalViewController, node: ExplorerNodePayload): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "node-symbols";

  if (!node.publicSymbols || node.publicSymbols.length === 0) {
    const empty = document.createElement("div");
    empty.className = "node-meta";
    empty.textContent = "No public symbols";
    wrapper.appendChild(empty);
    return wrapper;
  }

  const grid = document.createElement("div");
  grid.className = "symbol-grid";

  node.publicSymbols.forEach(symbol => {
    const inboundAnchor = document.createElement("div");
    inboundAnchor.className = "symbol-anchor dot inbound";
    inboundAnchor.dataset.symbol = symbol;
    grid.appendChild(inboundAnchor);
    controller.registerAnchor(node.id, `inbound:${symbol}`, inboundAnchor);

    const label = document.createElement("div");
    label.className = "symbol-label";
    label.textContent = symbol;
    grid.appendChild(label);

    const outboundAnchor = document.createElement("div");
    outboundAnchor.className = "symbol-anchor dot outbound";
    outboundAnchor.dataset.symbol = symbol;
    grid.appendChild(outboundAnchor);
    controller.registerAnchor(node.id, `outbound:${symbol}`, outboundAnchor);
  });

  wrapper.appendChild(grid);
  return wrapper;
}

function renderLayoutForNodes(
  controller: LocalViewController,
  nodes: ExplorerNodePayload[],
  direction: "inbound" | "outbound" | "center",
  connectionScore: Map<string, number>
): HTMLElement | null {
  const eligibleNodes = direction === "center" ? nodes.slice() : nodes.filter(node => controller.shouldIncludeNode(node));
  if (eligibleNodes.length === 0) {
    return null;
  }

  const hierarchy = buildHierarchy(eligibleNodes);
  const scoreCache = new Map<string, number>();
  const computeScore = (dir: DirectoryNode): number => {
    const cached = scoreCache.get(dir.path);
    if (cached !== undefined) {
      return cached;
    }
    let score = 0;
    dir.nodes.forEach(node => {
      score += connectionScore.get(node.id) ?? 0;
    });
    dir.children.forEach(child => {
      score += computeScore(child);
    });
    scoreCache.set(dir.path, score);
    return score;
  };

  reorderDirectory(hierarchy, computeScore, connectionScore);

  const measure = measureDirectoryTree(hierarchy);
  if (measure.totalNodes === 0) {
    return null;
  }

  const layout = computeDirectoryLayout(measure);

  const surface = document.createElement("div");
  surface.className = "layout-surface local-surface";
  surface.dataset.direction = direction;
  surface.style.position = "relative";
  surface.style.width = `${layout.width}px`;
  surface.style.height = `${layout.height}px`;
  surface.style.minWidth = `${layout.width}px`;
  surface.style.minHeight = `${layout.height}px`;

  const positionElement = (
    element: HTMLElement,
    rect: { x: number; y: number; width: number; height: number },
    origin: { x: number; y: number }
  ): void => {
    element.style.position = "absolute";
    element.style.left = `${rect.x - origin.x}px`;
    element.style.top = `${rect.y - origin.y}px`;
    element.style.width = `${rect.width}px`;
    element.style.height = `${rect.height}px`;
  };

  const renderDirectoryPlan = (
    plan: DirectoryLayoutPlan,
    parentPlan: DirectoryLayoutPlan | null,
    host: HTMLElement
  ): void => {
    const element = document.createElement("div");
    element.className =
      plan.depth === 0 ? "layout-box layout-box--root local-layout-box" : "layout-box local-layout-box";
    element.dataset.direction = direction;
    element.dataset.clusterPath = plan.path;
    element.setAttribute("role", "region");
    element.setAttribute("aria-label", `Cluster ${plan.path === ROOT_KEY ? "root" : plan.name}`);
    element.tabIndex = 0;
    element.title = plan.path === ROOT_KEY ? "root" : plan.path;
    if (plan.collapsedAncestors.length > 0) {
      element.dataset.collapsedAncestors = plan.collapsedAncestors.map(entry => entry.path).join(",");
    }

    const origin = parentPlan ? { x: parentPlan.contentRect.x, y: parentPlan.contentRect.y } : { x: 0, y: 0 };
    positionElement(element, plan.rect, origin);

    const showLabel = plan.depth > 0 || plan.path === ROOT_KEY;
    if (showLabel) {
      const heading = document.createElement("div");
      heading.className = "layout-box__label";
      heading.textContent = plan.path === ROOT_KEY ? "(root)" : plan.displayName;
      element.appendChild(heading);
    }

    const content = document.createElement("div");
    content.className = "layout-box__content";
    positionElement(content, plan.contentRect, { x: plan.rect.x, y: plan.rect.y });
    element.appendChild(content);
    host.appendChild(element);

    if (plan.fileArea && plan.fileArea.nodes.length > 0) {
      const nodeOrigin = { x: plan.contentRect.x, y: plan.contentRect.y };
      plan.fileArea.nodes.forEach(nodePlan => {
        const card = createNodeCard(controller, nodePlan.node);
        card.classList.add("layout-node");
        card.dataset.direction = direction;
        positionElement(card, nodePlan.rect, nodeOrigin);
        content.appendChild(card);
      });
    }

    plan.directories.forEach(child => {
      renderDirectoryPlan(child, plan, content);
    });
  };

  renderDirectoryPlan(layout.root, null, surface);
  return surface;
}

function reorderDirectory(
  dir: DirectoryNode,
  computeScore: (dir: DirectoryNode) => number,
  connectionScore: Map<string, number>
): void {
  const entries = Array.from(dir.children.entries());
  entries.forEach(([, child]) => reorderDirectory(child, computeScore, connectionScore));
  entries.sort(([, a], [, b]) => {
    const weightDelta = computeScore(b) - computeScore(a);
    if (weightDelta !== 0) {
      return weightDelta;
    }
    return a.name.localeCompare(b.name);
  });
  dir.children.clear();
  entries.forEach(([key, child]) => {
    dir.children.set(key, child);
  });
  dir.nodes.sort((a, b) => {
    const weightDelta = (connectionScore.get(b.id) ?? 0) - (connectionScore.get(a.id) ?? 0);
    if (weightDelta !== 0) {
      return weightDelta;
    }
    return a.name.localeCompare(b.name);
  });
}
