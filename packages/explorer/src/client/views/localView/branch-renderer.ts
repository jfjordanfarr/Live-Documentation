import { buildBranches } from "./branches";
import { createHierarchicalColumn } from "./column-factory";
import type { LocalViewController } from "./controller";
import { normalizeSymbolIdentifier } from "../symbolAnchors";

/** Extend the native card grammar to the independently retained branches. */
export function renderBranches(controller: LocalViewController, root: HTMLElement): void {
  const { state, graphData } = controller.options;
  const branches = buildBranches(state.selectedNode!, graphData, controller.pins, node => controller.shouldIncludeNode(node));
  controller.branches = branches;
  controller.currentSubgraph = branches.subgraph;
  root.classList.add("branch-mode");
  root.style.gridTemplateColumns = `repeat(${branches.columns.length}, max-content)`;
  root.style.alignItems = "center";
  for (const nodes of branches.columns) {
    const selected = nodes.some(node => node.id === state.selectedNode?.id);
    const column = createHierarchicalColumn(controller, selected ? "Selected artifact" : "", nodes, "center", "", "center", new Map());
    root.append(column);
  }
  const connected = new Set<string>();
  const key = (id: string, symbol?: string): string => `${id}\0${normalizeSymbolIdentifier(symbol) ?? "__internals__"}`;
  for (const link of branches.subgraph.links) {
    connected.add(key(link.sourceId, link.sourceSymbol));
    connected.add(key(link.targetId, link.targetSymbol));
  }
  for (const pin of controller.pins.entries) connected.add(key(pin.nodeId, pin.symbol));
  root.querySelectorAll<HTMLElement>(".node-card").forEach(card => {
    const id = card.dataset.id!;
    const all = controller.isPinned(id, "*") || controller.expandedCards.has(id) || id === state.selectedNode?.id;
    let hidden = 0;
    card.querySelectorAll<HTMLElement>(".symbol-row").forEach(row => {
      const collapse = !all && state.tuning.localMap.collapseOnPin && !connected.has(key(id, row.dataset.symbol));
      row.classList.toggle("branch-symbol-hidden", collapse);
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
