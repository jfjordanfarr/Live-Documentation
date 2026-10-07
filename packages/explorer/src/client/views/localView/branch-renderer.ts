import { boxKeyOf, easeInOutCubic, scenePose, tweenPose, type Pose } from "./branch-motion";
import { candidateStarts, layoutStarts, startName, startOrder } from "./branch-restarts";
import { BAND_BORDER, hostOf, layoutScene, planBranches, type SceneBox, type SceneMeasurer, type ScenePlan, type SceneTuning } from "./branch-scene";
import { edgeKey, exploreBranches, orderExploration, type Exploration } from "./branches";
import { createNodeCard } from "./card-factory";
import type { LocalViewController } from "./controller";
import { membranePath } from "./membrane-outline";
import { normalizeSymbolIdentifier } from "../symbolAnchors";

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * The branch picture's elements, kept across renders by what each one is: a
 * card's wrapper by its file, a membrane's section and a lane's spacer by
 * the pose's box key, a label by its directory. A render builds the cards
 * afresh for the state it draws, but inside the wrapper that stood for the
 * file before, so that the picture moves from where it was to where it now
 * belongs instead of being redrawn (the owner's ask, 2026-10-07).
 */
export interface BranchStage {
  root: HTMLElement;
  /** The wires' layer, which says `moving` while a move runs so that the stylesheet can lighten the wires' drawing. */
  overlay: HTMLElement;
  wrappers: Map<string, HTMLElement>;
  boxes: Map<string, HTMLElement>;
  shapes: Map<string, SVGPathElement>;
  labels: Map<string, HTMLElement>;
  /** The pose the page shows: the picture's once a move has ended, the frame's while one runs; null before the first picture. */
  pose: Pose | null;
  move: Move | null;
}

/** One move of the picture from one pose to the next, running. */
interface Move {
  frame: number;
  to: Pose;
  bandPadding: number;
  /** Elements of the previous picture that the new one has no place for: they fade out and go when the move ends. */
  leaving: HTMLElement[];
  /** Elements new to the picture: they fade in at their place. */
  entering: HTMLElement[];
  /** The children of rows whose place on their card changed, each with how far from its new place it starts. */
  rows: Array<{ element: HTMLElement; delta: number }>;
}

/** A stage for a root that holds nothing yet. */
export function createStage(root: HTMLElement, overlay: HTMLElement): BranchStage {
  return { root, overlay, wrappers: new Map(), boxes: new Map(), shapes: new Map(), labels: new Map(), pose: null, move: null };
}

/** Ends whatever move the stage runs, where it stands; the stage's elements are the caller's to remove. */
export function dropStage(stage: BranchStage): void {
  endMove(stage, false);
}

/**
 * Render the independently retained branches with the Local Map's cards,
 * symbol pins and interface colours, placed by the scene of
 * `branch-scene.ts`: the cards and lanes of every column stand where the
 * wires between pins are shortest, inside the directory membranes the order
 * chose, each membrane one segment per column following its members and
 * drawn as one outline, and each lane as tall as the slots its wires spread.
 * The exploration is ranked once and ordered from several starts (the
 * ranking's order, the previous picture's, and seeded shuffles, as
 * `branch-restarts.ts` names them); each start is measured on the page's
 * own cards and placed exactly, and the cheapest picture is drawn. This
 * module builds the cards once, measures them for every start, then builds
 * the chosen scene's sections and lanes and applies the layout; the elements
 * keep the names the router, the deck and the perspective transition read.
 * When the stage already shows a picture, the new one is not applied at once:
 * every element the two share slides from its old place to its new over the
 * tuning's move length, the rows of a card with them, what is new fades in
 * and what is gone fades out, the wires are redrawn every frame, and the card
 * the person last interacted with is held still on screen by the camera.
 * The layout's dials come from the Local Map's tuning.
 */
export function renderBranches(controller: LocalViewController, stage: BranchStage): void {
  const started = performance.now();
  const { state, graphData } = controller.options;
  const tuning = state.tuning.localMap;
  const { root } = stage;
  // A move still running ends where it stands: the new picture starts from the frame the page shows.
  endMove(stage, false);
  const previous = stage.pose;
  const scale = controller.runtime.mapTransform.k || 1;
  const oldRows = previous ? rowOffsets(stage, scale) : null;

  const exploration = exploreBranches(state.selectedNode!, graphData, controller.pins, node => controller.shouldIncludeNode(node), {
    symbolOrder: tuning.symbolOrder,
    ranking: { pull: tuning.rankingPull, tie: tuning.rankingTie }
  });
  root.classList.add("branch-mode", "local-placed");
  root.style.gridTemplateColumns = "";
  root.style.alignItems = "";
  const sceneTuning: SceneTuning = {
    columnGap: tuning.columnGap, itemGap: tuning.itemGap, bandGap: tuning.bandGap, neck: tuning.membraneNeck, bandPadding: tuning.membranePadding, cardMaxWidth: tuning.cardMaxWidth
  };

  // The cards, once per render, each built afresh for this render's state inside the wrapper that stood for its file
  // before, or a new one; in the root to be measured, hosted by the chosen scene's boxes after. Each card keeps its
  // column wrapper: the page's hover rules, the router and the deck find a card through it.
  const entering: HTMLElement[] = [];
  const kept = new Set<string>();
  for (const node of exploration.subgraph.nodes) {
    let wrapper = stage.wrappers.get(node.id);
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "local-column center";
      wrapper.dataset.direction = "center";
      wrapper.dataset.position = "center";
      stage.wrappers.set(node.id, wrapper);
      if (previous) entering.push(wrapper);
    }
    const card = createNodeCard(controller, node, "center");
    card.classList.add("focus-node");
    wrapper.replaceChildren(card);
    root.append(wrapper);
    kept.add(node.id);
  }
  const leaving: HTMLElement[] = [];
  for (const [id, wrapper] of stage.wrappers) {
    if (kept.has(id)) continue;
    stage.wrappers.delete(id);
    leaving.push(wrapper);
  }
  const cards = [...stage.wrappers.values()].map(wrapper => wrapper.firstElementChild as HTMLElement);
  dressCards(controller, cards, exploration);
  // The drawn directories' labels, once each, by directory: measured at the width the scene gives, hosted by the chosen scene's sections after.
  const labelFor = (directory: string): HTMLElement => {
    let label = stage.labels.get(directory);
    if (!label) {
      label = document.createElement("div");
      label.className = "local-directory-label";
      label.textContent = directory;
      root.append(label);
      stage.labels.set(directory, label);
    }
    return label;
  };

  // The page as the scene's measurer. Widths first, every card at its own, no wider than the cap; then heights at the
  // widths the columns give, since a card's rows of test names wrap at its column's width where its own did not, and a
  // label wraps to nothing in a box not yet given a width; and every pin's height on its card, in the rows of this start.
  const measurerFor = (plan: ScenePlan): SceneMeasurer => ({
    widths(cardMaxWidth) {
      for (const wrapper of stage.wrappers.values()) Object.assign(wrapper.style, { width: "max-content", maxWidth: cardMaxWidth === null ? "" : `${cardMaxWidth}px` });
      const widths = new Map<string, number>();
      for (const [id, wrapper] of stage.wrappers) widths.set(id, wrapper.offsetWidth);
      return widths;
    },
    measure(cardWidths, labelWidths) {
      const boxes = new Map(plan.boxes.map(box => [box.key, box]));
      for (const [id, width] of cardWidths) { const wrapper = stage.wrappers.get(id); if (wrapper) wrapper.style.width = `${width}px`; }
      for (const [key, width] of labelWidths) { const box = boxes.get(key)!; Object.assign(labelFor(box.directory).style, { left: `${box.inset}px`, width: `${width}px` }); }
      const heights = new Map<string, number>();
      for (const [id, wrapper] of stage.wrappers) heights.set(id, wrapper.offsetHeight);
      const labelHeights = new Map<string, number>();
      for (const key of labelWidths.keys()) labelHeights.set(key, labelFor(boxes.get(key)!.directory).offsetHeight);
      const pin = (id: string, direction: "inbound" | "outbound", symbol: string | undefined): number | null => {
        const anchor = controller.getAnchor(id, "center", direction, symbol);
        const card = stage.wrappers.get(id);
        if (!anchor || !card) return null;
        const rect = anchor.getBoundingClientRect(), cardRect = card.getBoundingClientRect();
        if (!rect.width && !rect.height) return null;
        // A pin centred on a half pixel, as a dot in a row of odd height is, rounds up whatever the floating noise of
        // the page's transform, so the placement's input is the same wherever the card stood when it was measured.
        return Math.round((rect.top - cardRect.top + rect.height / 2) / scale + 1e-3);
      };
      return { heights, pin, labelHeights };
    }
  });

  // The starts, each ordered, its rows stood on the cards, planned, measured and placed; the cheapest picture is kept.
  const ranked = exploration.ranking.columns.map(column => column.map(node => node.id));
  const starts = candidateStarts(tuning.orderStarts, tuning.orderSeed, controller.previousTops, ranked);
  const costs = { crossing: tuning.crossingCost, height: tuning.heightCost, churn: tuning.churnCost };
  const { chosen, outcomes } = layoutStarts(starts, start => {
    const branches = orderExploration(exploration, { sweeps: tuning.orderSweeps, ...startOrder(start) });
    orderRows(cards, branches.rows);
    const plan = planBranches(branches, sceneTuning.bandPadding);
    return { branches, scene: layoutScene(plan, branches, measurerFor(plan), sceneTuning) };
  }, costs, controller.previousTops);
  const { branches, scene } = chosen;
  if (outcomes[outcomes.length - 1] !== chosen) orderRows(cards, branches.rows);
  controller.branches = branches;
  controller.currentSubgraph = branches.subgraph;
  controller.previousTops = scene.tops;
  root.dataset.placementCost = String(scene.placement.cost);
  root.dataset.placementOptimal = String(scene.placement.optimal);
  root.dataset.orderStart = startName(chosen.start);
  root.dataset.orderStarts = String(outcomes.length);
  root.dataset.orderScore = String(chosen.score);
  root.dataset.layoutMs = String(Math.round(performance.now() - started));

  // The elements of the chosen scene: a section for the root and for each directory, a drawn directory's with its
  // outline and label; a spacer for each lane; each kept by its key across renders, created when new. Each sits inside
  // the element of the box that hosts it, the cards' wrappers inside theirs.
  const elements = new Map<SceneBox, HTMLElement>();
  const keptBoxes = new Set<string>();
  for (const box of scene.boxes) {
    if (box.kind === "files") continue;
    const key = boxKeyOf(box);
    keptBoxes.add(key);
    let element = stage.boxes.get(key);
    if (!element) {
      if (box.kind === "lane") element = laneElement(box.lane!.key);
      else {
        element = document.createElement("section");
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
          element.append(svg, labelFor(box.directory));
          stage.shapes.set(key, shape);
          if (previous) entering.push(element);
        }
      }
      stage.boxes.set(key, element);
    }
    elements.set(box, element);
  }
  for (const [key, element] of stage.boxes) {
    if (keptBoxes.has(key)) continue;
    stage.boxes.delete(key);
    stage.shapes.delete(key);
    leaving.push(element);
  }
  const drawn = new Set(scene.boxes.filter(box => box.kind === "directory").map(box => box.directory));
  for (const [directory, label] of stage.labels) if (!drawn.has(directory)) { label.remove(); stage.labels.delete(directory); }
  const hostElement = (anchor: SceneBox | null): HTMLElement => (anchor ? elements.get(anchor)! : root);
  for (const box of scene.boxes) if (box.kind !== "files") hostElement(box.anchor).append(elements.get(box)!);
  for (const item of scene.items.values()) hostElement(hostOf(item.box)).append(stage.wrappers.get(item.id)!);
  // A drawn directory publishes its segments, a lane where its slots came to rest, for the router and the tests.
  for (const box of scene.boxes) {
    const element = elements.get(box);
    if (!element) continue;
    if (box.kind === "lane") element.dataset.slots = (scene.slotLines.get(box.lane!.key) ?? []).map(String).join(",");
    else element.dataset.segments = box.segments.map(segment => `${segment.column}:${segment.left}:${segment.top}:${segment.right}:${segment.bottom}`).join(";");
  }

  // Every element at its place, at once for the first picture, else moved there from where the previous one stood it.
  const pose = scenePose(scene);
  const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = previous && !reduced ? Math.max(0, tuning.moveMs) : 0;
  if (!previous || duration === 0) {
    for (const element of leaving) element.remove();
    applyPose(stage, pose, sceneTuning.bandPadding);
    stage.pose = pose;
    return;
  }
  const rows = oldRows ? rowMotions(stage, oldRows, scale) : [];
  startMove(controller, stage, previous, pose, duration, { to: pose, bandPadding: sceneTuning.bandPadding, leaving, entering, rows, frame: 0 });
}

/** The outline's stroke, which the scene counts in a membrane's inset. */
export { BAND_BORDER };

/**
 * Sets every element of the stage where the pose stands it, relative to the
 * element that holds it: a membrane's section with its outline and its label
 * at its leftmost segment's top, a lane's spacer, each card's wrapper, and
 * the picture's own size.
 */
function applyPose(stage: BranchStage, pose: Pose, bandPadding: number): void {
  const origin = (host: string | null): { left: number; top: number } => {
    const box = host ? pose.boxes.get(host) : undefined;
    return box ? { left: box.left, top: box.top } : { left: 0, top: 0 };
  };
  for (const box of pose.boxes.values()) {
    const element = stage.boxes.get(box.key);
    if (!element) continue;
    const at = origin(box.host);
    Object.assign(element.style, { left: `${box.left - at.left}px`, width: `${box.right - box.left}px`, top: `${box.top - at.top}px`, height: `${Math.max(0, box.bottom - box.top)}px` });
    if (box.kind !== "directory") continue;
    stage.shapes.get(box.key)?.setAttribute("d", membranePath(box.segments.map(segment => ({ left: segment.left - box.left, right: segment.right - box.left, top: segment.top - box.top, bottom: segment.bottom - box.top })), bandPadding));
    const label = stage.labels.get(box.directory);
    if (label && box.segments.length) label.style.top = `${box.segments[0].top - box.top + box.inset}px`;
  }
  for (const item of pose.items.values()) {
    const wrapper = stage.wrappers.get(item.id);
    if (!wrapper) continue;
    const at = origin(item.host);
    Object.assign(wrapper.style, { left: `${item.left - at.left}px`, width: `${item.width}px`, top: `${item.top - at.top}px` });
  }
  Object.assign(stage.root.style, { width: `${pose.pictureWidth}px`, height: `${pose.pictureHeight}px` });
}

/**
 * Runs the move from one pose to the next over `duration` milliseconds: each
 * frame applies the pose part way, eased; the rows of a card slide from their
 * old place on it; new elements fade in and gone ones fade out; the camera
 * shifts to keep the held card where the eye left it on screen, measured
 * there each frame, so that the picture's own shift as its size changes is
 * held too while a drag of the person's own is left alone; and the wires are
 * redrawn to the frame, without their glow, whose filters cost more than
 * everything else in the frame (six frames a second with them, sixty
 * without, measured headless on 31 cards and 172 wires, 2026-10-07). The
 * stage's pose follows the frames, so a render that interrupts the move
 * starts from what the page shows. The root says `data-moving` throughout,
 * for whoever reads the page.
 */
function startMove(controller: LocalViewController, stage: BranchStage, from: Pose, to: Pose, duration: number, move: Move): void {
  const { root } = stage;
  root.dataset.moving = "true";
  stage.overlay.classList.add("moving");
  applyPose(stage, tweenPose(from, to, 0), move.bandPadding);
  for (const element of move.entering) element.style.opacity = "0";
  for (const { element, delta } of move.rows) element.style.transform = `translateY(${delta}px)`;
  const held = heldCard(controller, from, to);
  const heldElement = held ? stage.wrappers.get(held) ?? null : null;
  const heldRect = heldElement?.getBoundingClientRect() ?? null;
  const cameraAtStart = { ...controller.mapTransform };
  const start = performance.now();
  const step = (now: number): void => {
    const t = Math.min(1, (now - start) / duration);
    const eased = easeInOutCubic(t);
    const frame = tweenPose(from, to, eased);
    applyPose(stage, frame, move.bandPadding);
    for (const element of move.entering) element.style.opacity = String(eased);
    for (const element of move.leaving) element.style.opacity = String(1 - eased);
    for (const { element, delta } of move.rows) element.style.transform = `translateY(${delta * (1 - eased)}px)`;
    if (heldElement && heldRect) {
      // Where the card should be: where it was, moved by whatever the camera itself has moved since (a drag, say).
      const camera = controller.mapTransform;
      const now = heldElement.getBoundingClientRect();
      const dx = heldRect.left + (camera.x - cameraAtStart.x) - now.left;
      const dy = heldRect.top + (camera.y - cameraAtStart.y) - now.top;
      if (dx || dy) {
        controller.mapTransform = { ...camera, x: camera.x + dx, y: camera.y + dy };
        cameraAtStart.x += dx;
        cameraAtStart.y += dy;
        controller.updateMapTransform();
      }
    }
    stage.pose = frame;
    controller.drawConnections();
    if (t < 1) move.frame = requestAnimationFrame(step);
    else {
      endMove(stage, true);
      controller.drawConnections();
      const hovered = controller.localMapState.getState().hoveredSymbol;
      if (hovered) controller.highlightSymbolConnections(hovered.nodeId, hovered.symbol);
    }
  };
  move.frame = requestAnimationFrame(step);
  stage.move = move;
}

/**
 * Ends the stage's move, if one runs: gone elements are removed, new ones
 * and moved rows stand plain. Finished, the picture is at its destination;
 * interrupted, it stays at the frame the page shows.
 */
function endMove(stage: BranchStage, finished: boolean): void {
  const move = stage.move;
  if (!move) return;
  cancelAnimationFrame(move.frame);
  for (const element of move.leaving) element.remove();
  for (const element of move.entering) element.style.opacity = "";
  for (const { element } of move.rows) element.style.transform = "";
  if (finished) {
    applyPose(stage, move.to, move.bandPadding);
    stage.pose = move.to;
  }
  delete stage.root.dataset.moving;
  stage.overlay.classList.remove("moving");
  stage.move = null;
}

/**
 * The card held still on screen through a move: the one the person last
 * interacted with, else the selected file, when the picture has it before
 * and after; a card that enters or leaves cannot be held.
 */
function heldCard(controller: LocalViewController, from: Pose, to: Pose): string | null {
  for (const id of [controller.lastInteracted, controller.options.state.selectedNode?.id]) {
    if (id && from.items.has(id) && to.items.has(id)) return id;
  }
  return null;
}

/**
 * Where each visible row of each card stands, from its card's top, in the
 * picture's pixels, by the row's symbol and its place among rows of that
 * name (LinkTarget and linkTarget share one). Hidden rows have no place.
 */
function rowOffsets(stage: BranchStage, scale: number): Map<string, Map<string, number>> {
  const offsets = new Map<string, Map<string, number>>();
  for (const [id, wrapper] of stage.wrappers) {
    const card = wrapper.querySelector<HTMLElement>(".node-card");
    if (!card) continue;
    const cardTop = card.getBoundingClientRect().top;
    const seen = new Map<string, number>();
    const rows = new Map<string, number>();
    card.querySelectorAll<HTMLElement>(".symbol-row").forEach(row => {
      const name = normalizeSymbolIdentifier(row.dataset.symbol) ?? "__internals__";
      const count = seen.get(name) ?? 0;
      seen.set(name, count + 1);
      const rect = row.firstElementChild?.getBoundingClientRect();
      if (!rect || (!rect.width && !rect.height)) return;
      rows.set(`${name}\0${count}`, (rect.top - cardTop) / scale);
    });
    offsets.set(id, rows);
  }
  return offsets;
}

/** The children of every row that stands elsewhere on its card than it did, each with how far from its new place it starts. */
function rowMotions(stage: BranchStage, before: Map<string, Map<string, number>>, scale: number): Array<{ element: HTMLElement; delta: number }> {
  const motions: Array<{ element: HTMLElement; delta: number }> = [];
  const after = rowOffsets(stage, scale);
  for (const [id, wrapper] of stage.wrappers) {
    const was = before.get(id), now = after.get(id);
    if (!was || !now) continue;
    const seen = new Map<string, number>();
    wrapper.querySelectorAll<HTMLElement>(".symbol-row").forEach(row => {
      const name = normalizeSymbolIdentifier(row.dataset.symbol) ?? "__internals__";
      const count = seen.get(name) ?? 0;
      seen.set(name, count + 1);
      const key = `${name}\0${count}`;
      const from = was.get(key), to = now.get(key);
      if (from === undefined || to === undefined || Math.abs(from - to) < 0.5) return;
      for (const child of row.children) motions.push({ element: child as HTMLElement, delta: from - to });
    });
  }
  return motions;
}

/**
 * Each card's rows in the order a start chose; rows the order does not name
 * keep their place after them, Internals last. Two symbols may share a
 * normalized name (LinkTarget and linkTarget), so a name claims one row per
 * mention. Run once per start, since a start's pins stand where its rows do.
 */
function orderRows(cards: readonly HTMLElement[], rows: ReadonlyMap<string, readonly string[]>): void {
  for (const card of cards) {
    const rowOrder = rows.get(card.dataset.id!);
    if (!rowOrder) continue;
    const byName = new Map<string, HTMLElement[]>();
    card.querySelectorAll<HTMLElement>(".symbol-row").forEach(row => {
      const name = normalizeSymbolIdentifier(row.dataset.symbol) ?? "__internals__";
      (byName.get(name) ?? byName.set(name, []).get(name)!).push(row);
    });
    for (const name of rowOrder) {
      const row = byName.get(name)?.shift();
      if (row) row.parentElement?.append(row);
    }
    for (const list of byName.values()) for (const row of list) row.parentElement?.append(row);
    const internals = card.querySelector<HTMLElement>(".symbol-row.internals-row");
    if (internals) internals.parentElement?.append(internals);
  }
}

/**
 * The cards' hidden rows counted and their notes on references read back and
 * connections outside the view, which every start shares: they stand before
 * any start is measured, since they take room on the card.
 */
function dressCards(controller: LocalViewController, cards: readonly HTMLElement[], exploration: Exploration): void {
  const { state } = controller.options;
  const connected = new Set<string>();
  const key = (id: string, symbol?: string): string => `${id}\0${normalizeSymbolIdentifier(symbol) ?? "__internals__"}`;
  for (const [id, rows] of exploration.relevantSymbols) for (const row of rows) connected.add(key(id, row));
  for (const pin of controller.pins.entries) connected.add(key(pin.nodeId, pin.symbol));
  const backReferences = new Map<string, number>();
  for (const edge of exploration.subgraph.links) {
    if (!exploration.ranking.back.has(edgeKey(edge))) continue;
    for (const id of new Set([edge.sourceId, edge.targetId])) backReferences.set(id, (backReferences.get(id) ?? 0) + 1);
  }
  for (const card of cards) {
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
    const back = backReferences.get(id) ?? 0;
    if (back) {
      const note = document.createElement("span");
      note.className = "local-disclosure local-back-references";
      note.textContent = `${back} ${back === 1 ? "reference reads" : "references read"} back`;
      note.title = "Against the reading direction, part of a cycle: drawn as stubs at its pins. Hover a symbol to trace it.";
      card.append(note);
    }
    const outside = exploration.hiddenConnections.get(id) ?? 0;
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
  }
}

/** The room a lane's bundles pass through; the placement sizes it, and the router reads its place and its slots back from the page. */
function laneElement(laneKey: string): HTMLElement {
  const element = document.createElement("div");
  element.className = "local-pass-through";
  element.dataset.lane = laneKey;
  return element;
}
