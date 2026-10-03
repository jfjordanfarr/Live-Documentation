import { buildBranches } from "./branches";
import { createHierarchicalColumn } from "./column-factory";
import type { LocalViewController } from "./controller";
import { computeDirectoryBands, parentDirectory, type DirectoryBand, type FlowNode } from "../membraneView/pin-layout";
import { normalizeSymbolIdentifier } from "../symbolAnchors";

/** Extend the native card grammar to the independently retained branches. */
export function renderBranches(controller: LocalViewController, root: HTMLElement): void {
  const { state, graphData } = controller.options;
  const branches = buildBranches(state.selectedNode!, graphData, controller.pins, node => controller.shouldIncludeNode(node));
  controller.branches = branches;
  controller.currentSubgraph = branches.subgraph;
  root.classList.add("branch-mode");
  root.style.gridTemplateColumns = `repeat(${branches.columns.length}, max-content)`;
  root.style.alignItems = "start";
  const flow = new Map<string, FlowNode>();
  branches.columns.forEach((nodes, column) => nodes.forEach(node => flow.set(node.id, {
    id: node.id, column, role: "pinned", directory: parentDirectory(node.codeRelativePath)
  })));
  const bands = computeDirectoryBands(flow);
  const scanRoot: DirectoryBand = { directory: "", minColumn: 0, maxColumn: branches.columns.length - 1,
    bandRow: 0, nodesByColumn: new Map(), allNodeIds: branches.subgraph.nodes.map(node => node.id), children: bands };
  const byId = new Map(branches.subgraph.nodes.map(node => [node.id, node]));
  const renderBand = (band: DirectoryBand, parent: HTMLElement, firstColumn: number, parentDirectory?: string): void => {
    const group = document.createElement("section");
    // A band's loose-file bucket has its parent's path; it is not another directory.
    const isDirectory = band.directory !== parentDirectory;
    group.className = isDirectory ? "local-directory-band" : "local-directory-files";
    if (isDirectory) group.dataset.directory = band.directory;
    group.style.gridColumn = `${band.minColumn - firstColumn + 1} / span ${band.maxColumn - band.minColumn + 1}`;
    group.style.gridRow = String(band.bandRow + 1);
    if (isDirectory) {
      const label = document.createElement("div");
      label.className = "local-directory-label";
      label.textContent = band.directory || "/";
      group.append(label);
    }
    const content = document.createElement("div");
    content.className = "local-directory-content";
    group.append(content);
    for (const child of band.children) renderBand(child, content, band.minColumn, band.directory);
    for (const [columnIndex, ids] of band.nodesByColumn) {
      const nodes = ids.flatMap(id => byId.get(id) ?? []);
      const column = createHierarchicalColumn(controller, "", nodes, "center", "", "center", new Map());
      column.style.gridColumn = String(columnIndex - band.minColumn + 1);
      content.append(column);
    }
    parent.append(group);
  };
  renderBand(scanRoot, root, 0);
  const connected = new Set<string>();
  const key = (id: string, symbol?: string): string => `${id}\0${normalizeSymbolIdentifier(symbol) ?? "__internals__"}`;
  for (const [id, rows] of branches.relevantSymbols) for (const row of rows) connected.add(key(id, row));
  for (const pin of controller.pins.entries) connected.add(key(pin.nodeId, pin.symbol));
  root.querySelectorAll<HTMLElement>(".node-card").forEach(card => {
    const id = card.dataset.id!;
    const all = controller.isPinned(id, "*") || controller.expandedCards.has(id) || id === state.selectedNode?.id;
    let hidden = 0;
    card.querySelectorAll<HTMLElement>(".symbol-row").forEach(row => {
      const collapse = !all && state.tuning.localMap.collapseOnPin && !connected.has(key(id, row.dataset.symbol));
      row.classList.toggle("branch-symbol-hidden", collapse);
      row.classList.toggle("branch-symbol-muted", !controller.isPinned(id, "*") && !connected.has(key(id, row.dataset.symbol)));
      if (collapse) hidden++;
    });
    if (hidden) {
      const reveal = document.createElement("button");
      reveal.className = "local-disclosure";
      reveal.textContent = `+${hidden} symbols`;
      reveal.title = "Show the other symbols in this file";
      reveal.addEventListener("click", event => {
        event.stopPropagation(); controller.expandedCards.add(id); controller.render();
      });
      card.append(reveal);
    }
    const outside = branches.hiddenConnections.get(id) ?? 0;
    if (outside) {
      const filePinned = controller.isPinned(id, "*");
      const reveal = document.createElement(filePinned ? "span" : "button");
      reveal.className = "local-disclosure";
      reveal.textContent = `${outside} ${outside === 1 ? "connection" : "connections"} ${filePinned ? "hidden by filters" : "outside this view"}`;
      if (!filePinned) {
        reveal.title = "Pin this file to reveal its connections; display filters still apply";
        reveal.addEventListener("click", event => { event.stopPropagation(); controller.togglePinnedSymbol(id, "*"); });
      }
      card.append(reveal);
    }
  });
}
