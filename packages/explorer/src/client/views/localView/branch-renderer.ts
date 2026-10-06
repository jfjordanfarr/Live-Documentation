import { BAND_BORDER, hostOf, layoutScene, planBranches, type SceneBox, type SceneMeasurer, type SceneTuning } from "./branch-scene";
import { buildBranches, edgeKey } from "./branches";
import { createNodeCard } from "./card-factory";
import type { LocalViewController } from "./controller";
import { membranePath } from "./membrane-outline";
import { normalizeSymbolIdentifier } from "../symbolAnchors";

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Render the independently retained branches with the Local Map's cards,
 * symbol pins and interface colours, placed by the scene of
 * `branch-scene.ts`: the cards and lanes of every column stand where the
 * wires between pins are shortest, inside the directory membranes the order
 * chose, each membrane one segment per column following its members and
 * drawn as one outline, and each lane as tall as the slots its wires spread.
 * This module builds the elements for the scene's plan, measures them for the
 * layout, and applies it; the elements keep the names the router, the deck
 * and the perspective transition read. The layout's dials come from the
 * Local Map's tuning.
 */
export function renderBranches(controller: LocalViewController, root: HTMLElement): void {
  const { state, graphData } = controller.options;
  const tuning = state.tuning.localMap;
  const branches = buildBranches(state.selectedNode!, graphData, controller.pins, node => controller.shouldIncludeNode(node), {
    symbolOrder: tuning.symbolOrder,
    ranking: { pull: tuning.rankingPull, tie: tuning.rankingTie },
    order: { sweeps: tuning.orderSweeps, seed: tuning.orderSeed ?? undefined }
  });
  controller.branches = branches;
  controller.currentSubgraph = branches.subgraph;
  root.classList.add("branch-mode", "local-placed");
  root.style.gridTemplateColumns = "";
  root.style.alignItems = "";
  const sceneTuning: SceneTuning = {
    columnGap: tuning.columnGap, itemGap: tuning.itemGap, bandGap: tuning.bandGap, neck: tuning.membraneNeck, bandPadding: tuning.membranePadding, cardMaxWidth: tuning.cardMaxWidth
  };
  const plan = planBranches(branches, sceneTuning.bandPadding);
  const byId = new Map(branches.subgraph.nodes.map(node => [node.id, node]));

  // The elements of the plan: a section for the root and for each directory, a drawn directory's with its outline and
  // label; a spacer for each lane; a wrapper and card for each item. Each sits inside the element of the box that hosts it.
  const elements = new Map<SceneBox, HTMLElement>();
  const shapes = new Map<SceneBox, SVGPathElement>();
  const labels = new Map<SceneBox, HTMLElement>();
  const hostElement = (anchor: SceneBox | null): HTMLElement => (anchor ? elements.get(anchor)! : root);
  for (const box of plan.boxes) {
    if (box.kind === "files") continue;
    if (box.kind === "lane") {
      const element = laneElement(box.lane!.key);
      elements.set(box, element);
      hostElement(box.anchor).append(element);
      continue;
    }
    const element = document.createElement("section");
    element.className = `local-directory-band${box.kind === "root" ? " local-directory-root" : ""}`;
    element.dataset.directory = box.directory;
    if (box.kind === "directory") {
      // The membrane's outline, beneath everything the element holds, and its label at its leftmost segment's top.
      const svg = document.createElementNS(SVG_NS, "svg");
      svg.classList.add("local-membrane");
      svg.dataset.directory = box.directory;
      const shape = document.createElementNS(SVG_NS, "path");
      shape.classList.add("local-membrane-shape");
      shape.dataset.directory = box.directory;
      svg.append(shape);
      const label = document.createElement("div");
      label.className = "local-directory-label";
      label.textContent = box.directory;
      element.append(svg, label);
      shapes.set(box, shape);
      labels.set(box, label);
    }
    elements.set(box, element);
    hostElement(box.anchor).append(element);
  }
  const wrappers = new Map<string, HTMLElement>();
  for (const item of plan.items.values()) {
    const node = byId.get(item.id);
    if (!node) continue;
    // Each card keeps its column wrapper: the page's hover rules, the router and the deck find a card through it.
    const wrapper = document.createElement("div");
    wrapper.className = "local-column center";
    wrapper.dataset.direction = "center";
    wrapper.dataset.position = "center";
    const card = createNodeCard(controller, node, "center");
    card.classList.add("focus-node");
    wrapper.append(card);
    hostElement(hostOf(item.box)).append(wrapper);
    wrappers.set(item.id, wrapper);
  }

  dressCards(controller, root, branches);

  // The page as the scene's measurer. Widths first, every card at its own, no wider than the cap; then heights at the
  // widths the columns give, since a card's rows of test names wrap at its column's width where its own did not, and a
  // label wraps to nothing in a box not yet given a width; and every pin's height on its card.
  const scale = controller.runtime.mapTransform.k || 1;
  const measurer: SceneMeasurer = {
    widths(cardMaxWidth) {
      for (const wrapper of wrappers.values()) Object.assign(wrapper.style, { width: "max-content", maxWidth: cardMaxWidth === null ? "" : `${cardMaxWidth}px` });
      const widths = new Map<string, number>();
      for (const [id, wrapper] of wrappers) widths.set(id, wrapper.offsetWidth);
      return widths;
    },
    measure(cardWidths, labelWidths) {
      for (const [id, width] of cardWidths) { const wrapper = wrappers.get(id); if (wrapper) wrapper.style.width = `${width}px`; }
      for (const [box, label] of labels) Object.assign(label.style, { left: `${box.inset}px`, width: `${labelWidths.get(box.key) ?? 0}px` });
      const heights = new Map<string, number>();
      for (const [id, wrapper] of wrappers) heights.set(id, wrapper.offsetHeight);
      const labelHeights = new Map<string, number>();
      for (const [box, label] of labels) labelHeights.set(box.key, label.offsetHeight);
      const pin = (id: string, direction: "inbound" | "outbound", symbol: string | undefined): number | null => {
        const anchor = controller.getAnchor(id, "center", direction, symbol);
        const card = wrappers.get(id);
        if (!anchor || !card) return null;
        const rect = anchor.getBoundingClientRect(), cardRect = card.getBoundingClientRect();
        if (!rect.width && !rect.height) return null;
        // A pin centred on a half pixel, as a dot in a row of odd height is, rounds up whatever the floating noise of
        // the page's transform, so the placement's input is the same wherever the card stood when it was measured.
        return Math.round((rect.top - cardRect.top + rect.height / 2) / scale + 1e-3);
      };
      return { heights, pin, labelHeights };
    }
  };
  const scene = layoutScene(plan, branches, measurer, sceneTuning);
  root.dataset.placementCost = String(scene.placement.cost);
  root.dataset.placementOptimal = String(scene.placement.optimal);

  // Every element at its place, relative to the element it sits in; a drawn directory gets its outline, its label at
  // its leftmost segment, and its segments as data; a lane says where its slots came to rest, for the router.
  const origin = (anchor: SceneBox | null): { left: number; top: number } => (anchor ? { left: anchor.left, top: anchor.top } : { left: 0, top: 0 });
  for (const box of plan.boxes) {
    const element = elements.get(box);
    if (!element) continue;
    const at = origin(box.anchor);
    Object.assign(element.style, { left: `${box.left - at.left}px`, width: `${box.right - box.left}px`, top: `${box.top - at.top}px`, height: `${Math.max(0, box.bottom - box.top)}px` });
    if (box.kind === "lane") {
      element.dataset.slots = (scene.slotLines.get(box.lane!.key) ?? []).map(String).join(",");
      continue;
    }
    element.dataset.segments = box.segments.map(segment => `${segment.column}:${segment.left}:${segment.top}:${segment.right}:${segment.bottom}`).join(";");
    const shape = shapes.get(box);
    if (shape) {
      shape.setAttribute("d", membranePath(box.segments.map(segment => ({ left: segment.left - box.left, right: segment.right - box.left, top: segment.top - box.top, bottom: segment.bottom - box.top })), sceneTuning.bandPadding));
    }
    const label = labels.get(box);
    if (label) label.style.top = `${box.segments[0].top - box.top + box.inset}px`;
  }
  for (const item of plan.items.values()) {
    const wrapper = wrappers.get(item.id);
    if (!wrapper) continue;
    const at = origin(hostOf(item.box));
    Object.assign(wrapper.style, { left: `${scene.lefts[item.column] + item.inset - at.left}px`, width: `${scene.widths[item.column] - 2 * item.inset}px`, top: `${(scene.tops.get(item.id) ?? 0) - at.top}px` });
  }
  Object.assign(root.style, { width: `${scene.pictureWidth}px`, height: `${scene.pictureHeight}px` });
}

/** The outline's stroke, which the scene counts in a membrane's inset. */
export { BAND_BORDER };

/**
 * The cards' rows in the chosen order, their hidden rows counted, and their
 * notes on references read back and connections outside the view.
 */
function dressCards(controller: LocalViewController, root: HTMLElement, branches: ReturnType<typeof buildBranches>): void {
  const { state } = controller.options;
  const connected = new Set<string>();
  const key = (id: string, symbol?: string): string => `${id}\0${normalizeSymbolIdentifier(symbol) ?? "__internals__"}`;
  for (const [id, rows] of branches.relevantSymbols) for (const row of rows) connected.add(key(id, row));
  for (const pin of controller.pins.entries) connected.add(key(pin.nodeId, pin.symbol));
  const backReferences = new Map<string, number>();
  for (const edge of branches.subgraph.links) {
    if (!branches.back.has(edgeKey(edge))) continue;
    for (const id of new Set([edge.sourceId, edge.targetId])) backReferences.set(id, (backReferences.get(id) ?? 0) + 1);
  }
  root.querySelectorAll<HTMLElement>(".node-card").forEach(card => {
    const id = card.dataset.id!;
    // The card's rows stand in the chosen order; rows the order does not name keep their place after them, Internals last.
    // Two symbols may share a normalized name (LinkTarget and linkTarget), so a name may claim one row per mention.
    const rowOrder = branches.rows.get(id);
    if (rowOrder) {
      const byName = new Map<string, HTMLElement[]>();
      card.querySelectorAll<HTMLElement>(".symbol-row").forEach(row => {
        const name = normalizeSymbolIdentifier(row.dataset.symbol) ?? "__internals__";
        (byName.get(name) ?? byName.set(name, []).get(name)!).push(row);
      });
      for (const name of rowOrder) {
        const row = byName.get(name)?.shift();
        if (row) row.parentElement?.append(row);
      }
      for (const rows of byName.values()) for (const row of rows) row.parentElement?.append(row);
      const internals = card.querySelector<HTMLElement>(".symbol-row.internals-row");
      if (internals) internals.parentElement?.append(internals);
    }
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
    const back = backReferences.get(id) ?? 0;
    if (back) {
      const note = document.createElement("span");
      note.className = "local-disclosure local-back-references";
      note.textContent = `${back} ${back === 1 ? "reference reads" : "references read"} back`;
      note.title = "Against the reading direction, part of a cycle: drawn as stubs at its pins. Hover a symbol to trace it.";
      card.append(note);
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

/** The room a lane's bundles pass through; the placement sizes it, and the router reads its place and its slots back from the page. */
function laneElement(laneKey: string): HTMLElement {
  const element = document.createElement("div");
  element.className = "local-pass-through";
  element.dataset.lane = laneKey;
  return element;
}
