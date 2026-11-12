import { alignmentCandidates } from "./branch-alignments";
import { boxKeyOf, easeInOutCubic, scenePose, tweenPose, type Pose } from "./branch-motion";
import type { BoundaryAlignment } from "./branch-placement";
import { candidateStarts, layoutStarts, scoreOf, signalsOf, startName, startOrder, type StartCosts } from "./branch-restarts";
import { BAND_BORDER, hostOf, layoutScene, planBranches, type Scene, type SceneBox, type SceneMeasurer, type ScenePlan, type SceneTuning } from "./branch-scene";
import { beginSearch, endpointKey, judgeAlignment, judgeStart, nextTrialKind, pinFor, rowBounds, type CardRows, type ResolvedPin, type RowMeasure, type SearchState } from "./branch-search";
import { edgeKey, exploreBranches, isClosedDirectory, orderExploration, type BranchGraph, type DirectoryDisclosure, type Exploration } from "./branches";
import { countsOf, createClosedDirectory, createNodeCard, hasCloseAction, PIN_GLYPH } from "./card-factory";
import { markFirstPin } from "./card-reading";
import type { LocalViewController } from "./controller";
import { ancestryButton } from "./directory-ancestry";
import { layoutTopOf } from "./ladder-rooms";
import { membranePath } from "./membrane-outline";
import type { LocalEdge } from "./types";
import { setSeamedText } from "../../dom";
import { normalizeSymbolIdentifier } from "../symbolAnchors";
import { countOf } from "./word-seams";

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * The branch picture's elements, kept across renders by what each one is: a
 * card's wrapper by its file, a membrane's section and a lane's spacer by
 * the pose's box key, a label by its directory. A render builds the cards
 * afresh for the state it draws, but inside the wrapper that stood for the
 * file before, so that the picture moves from where it was to where it now
 * belongs instead of being redrawn (the owner's ask, 2026-10-07). The stage
 * also carries the continuing search that runs after each picture.
 */
export interface BranchStage {
  root: HTMLElement;
  /** The wires' layer, which says `moving` while a move runs so that the stylesheet can lighten the wires' drawing. */
  overlay: HTMLElement;
  wrappers: Map<string, HTMLElement>;
  boxes: Map<string, HTMLElement>;
  shapes: Map<string, SVGPathElement>;
  labels: Map<string, HTMLElement>;
  /** What each drawn directory's label says of it, from the exploration drawn: its state and what it hides. */
  disclosures: Map<string, DirectoryDisclosure>;
  /** The pose the page shows: the picture's once a move has ended, the frame's while one runs; null before the first picture. */
  pose: Pose | null;
  move: Move | null;
  search: Search | null;
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
  /** Boxed rows (or children of legacy display:contents rows), with their displacement from the new place. */
  rows: Array<{ element: HTMLElement; delta: number }>;
  heights?: Array<{ element: HTMLElement; from: number; to: number }>;
  anchor?: DOMRect;
}

/** What the page answered the scene's measurer that no start changes, kept so that the search can price a start without the page. */
interface PageAnswers {
  natural: Map<string, number>;
  heights: Map<string, number>;
  /** Each drawn directory's label height at its width, by directory. */
  labelHeights: Map<string, number>;
}

/** The continuing competition over ordering starts and boundary joins, priced from the page's measured cards and endpoints. */
interface Search {
  state: SearchState;
  incumbent: { branches: BranchGraph; scene: Scene };
  alignmentEnabled: boolean;
  alignments: BoundaryAlignment[][];
  alignmentIndex: number;
  alignmentTried: number;
  alignmentAdopted: number;
  preferAlignment: boolean;
  exploration: Exploration;
  sceneTuning: SceneTuning;
  sweeps: number;
  costs: StartCosts;
  moveMs: number;
  answers: PageAnswers;
  rows: Map<string, CardRows>;
  /** The idle callback or timer waiting to run the next start; zero when none. */
  handle: number;
  /** Takes the next step when the page is idle; a move that ends calls it. */
  resume: () => void;
}

/** A stage for a root that holds nothing yet. */
export function createStage(root: HTMLElement, overlay: HTMLElement): BranchStage {
  return { root, overlay, wrappers: new Map(), boxes: new Map(), shapes: new Map(), labels: new Map(), disclosures: new Map(), pose: null, move: null, search: null };
}

/** Ends whatever move the stage runs, where it stands, and its search; the stage's elements are the caller's to remove. */
export function dropStage(stage: BranchStage): void {
  stopSearch(stage);
  endMove(stage, false);
}

/** The same canonical disclosure is used to build a scene and to recognize a text-only reading change. */
function explorationOf(controller: LocalViewController): Exploration {
  const { state, graphData } = controller.options;
  const tuning = state.tuning.localMap;
  return exploreBranches(state.selectedNode, graphData, controller.pins, node => controller.shouldIncludeNode(node), {
    symbolOrder: tuning.symbolOrder,
    ranking: { pull: tuning.rankingPull, tie: tuning.rankingTie },
    membraneDepth: tuning.membraneDepth,
    openDirectories: controller.openDirectories,
    reading: state.reading,
    path: controller.getActivePath() ?? undefined
  });
}

/** Update fixed-slot text and its controls without rebuilding an unchanged scene or restarting its search. */
export function refreshReadingPresentation(controller: LocalViewController, stage: BranchStage): boolean {
  const reading = controller.reading, search = stage.search;
  if (!reading || !search || !stage.pose || controller.options.state.tuning.localMap.cardText !== "slot") return false;
  const next = explorationOf(controller);
  if (!sameReadingScope(search.exploration, next)) return false;
  const presentRow = rowPresentation(controller, next);
  const rows: Array<{ row: HTMLElement; muted: boolean }> = [];
  for (const card of cardsOf(stage)) {
    if (!card.classList.contains("node-card")) continue;
    const node = controller.options.nodesById.get(card.dataset.id!);
    const closes = card.querySelector(".local-file-close") !== null;
    if (!node || closes !== hasCloseAction(controller.cardContext.presentation(node))) return false;
    for (const row of card.querySelectorAll<HTMLElement>(".symbol-row")) {
      const state = presentRow(node.id, row.dataset.symbol);
      if (row.classList.contains("branch-symbol-hidden") !== state.hidden) return false;
      rows.push({ row, muted: state.muted });
    }
  }
  // Every structural check precedes every write. The current row order, measured answers and search counters survive.
  reading.updatePresentation();
  for (const { row, muted } of rows) row.classList.toggle("branch-symbol-muted", muted);
  search.exploration = next;
  return true;
}

/** Membership, not a learned arrangement or a raw list of reading choices, determines whether a scene is unchanged. */
function sameReadingScope(before: Exploration, after: Exploration): boolean {
  const links = (value: Exploration): Map<string, LocalEdge> => new Map(value.subgraph.links.map(edge => [edgeKey(edge), edge]));
  return sameMembers(before.subgraph.nodes.map(node => node.id), after.subgraph.nodes.map(node => node.id))
    && sameMap(links(before), links(after), (a, b) => a.referenceCount === b.referenceCount && a.direction === b.direction)
    && sameMembers(before.members, after.members)
    && sameMap(before.order.rows, after.order.rows, sameMembers)
    && sameMap(before.hiddenConnections, after.hiddenConnections, (a, b) => a === b)
    && sameMap(before.closed, after.closed, (a, b) => a.files === b.files && a.directories === b.directories)
    && sameMap(before.directories, after.directories, (a, b) => a.state === b.state
      && a.hiddenFiles === b.hiddenFiles && a.hiddenDirectories === b.hiddenDirectories);
}

function sameMembers<T>(before: Iterable<T>, after: Iterable<T>): boolean {
  const left = new Set(before), right = new Set(after);
  return left.size === right.size && [...left].every(value => right.has(value));
}

function sameMap<T>(before: ReadonlyMap<string, T>, after: ReadonlyMap<string, T>, same: (left: T, right: T) => boolean): boolean {
  return before.size === after.size && [...before].every(([key, value]) => after.has(key) && same(value, after.get(key)!));
}

/** The canonical row disclosure and emphasis, shared by structural rendering and text-only reading refreshes. */
function rowPresentation(controller: LocalViewController, exploration: Exploration): (id: string, symbol?: string) => { hidden: boolean; muted: boolean } {
  const { state } = controller.options;
  const path = controller.getActivePath();
  const connected = new Set<string>();
  const key = (id: string, symbol?: string): string => `${id}\0${normalizeSymbolIdentifier(symbol) ?? "__internals__"}`;
  for (const [id, rows] of exploration.relevantSymbols) for (const row of rows) connected.add(key(id, row));
  if (!path) for (const pin of controller.pins.entries) connected.add(key(pin.nodeId, pin.symbol));
  return (id, symbol) => {
    const all = controller.expandedCards.has(id) || (!path && (controller.reading?.showsAllRows(id) || controller.isPinned(id, "*") || id === state.selectedNode?.id));
    const read = controller.reading?.showsRow(id, symbol ?? "__internals__");
    const joined = connected.has(key(id, symbol));
    return {
      hidden: !all && Boolean(path || !read) && Boolean(path || state.tuning.localMap.collapseOnPin) && !joined,
      muted: !controller.isPinned(id, "*") && !read && !joined
    };
  };
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
 * After the picture is drawn, the continuing search alternates ordering
 * starts and boundary joins in idle moments, moving to a better picture.
 * The layout's dials come from the Local Map's tuning.
 */
export function renderBranches(controller: LocalViewController, stage: BranchStage): void {
  const started = performance.now();
  const { state } = controller.options;
  const tuning = state.tuning.localMap;
  const { root } = stage;
  const path = controller.getActivePath();
  const scale = controller.runtime.mapTransform.k || 1;
  // Capture the visible rows before ending an interrupted move removes their current displacement.
  const oldRows = stage.pose ? rowOffsets(stage, scale) : null;
  // A move still running ends where it stands, and the search for the previous picture ends: the new picture starts
  // from the frame the page shows and searches anew.
  stopSearch(stage);
  endMove(stage, false);
  const previous = stage.pose;

  const exploration = explorationOf(controller);
  // Every drawn directory's label says what this picture makes of it; the labels already made are refilled.
  stage.disclosures = exploration.directories;
  for (const [directory, label] of stage.labels) fillLabel(controller, label, directory, exploration.directories.get(directory));
  root.classList.add("branch-mode", "local-placed");
  root.classList.toggle("path-mode", !!path);
  root.style.gridTemplateColumns = "";
  root.style.alignItems = "";
  const sceneTuning: SceneTuning = {
    columnGap: tuning.columnGap, itemGap: tuning.itemGap, bandGap: tuning.bandGap, neck: tuning.membraneNeck, bandPadding: tuning.membranePadding, cardMaxWidth: tuning.cardMaxWidth,
    evenness: tuning.membraneEvenness, levelness: tuning.rowLevelness
  };

  // The cards, once per render, each built afresh for this render's state inside the wrapper that stood for its file
  // before, or a new one; in the root to be measured, hosted by the chosen scene's boxes after. Each card keeps its
  // column wrapper: the page's hover rules, the router and the deck find a card through it. A closed directory's box
  // takes a wrapper of the same kind, by its path, and no card.
  const entering: HTMLElement[] = [];
  const kept = new Set<string>();
  for (const node of exploration.subgraph.nodes) {
    let wrapper = stage.wrappers.get(node.id);
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "local-column center";
      wrapper.dataset.direction = "center";
      wrapper.dataset.position = "center";
      wrapper.classList.toggle("local-closed-directory", isClosedDirectory(node));
      stage.wrappers.set(node.id, wrapper);
      if (previous) entering.push(wrapper);
    }
    if (isClosedDirectory(node)) {
      wrapper.replaceChildren(createClosedDirectory(controller.cardContext, exploration.closed.get(node.id)!));
    } else {
      const card = createNodeCard(controller.cardContext, node, "center");
      card.classList.add("focus-node");
      card.classList.toggle("branch-member", exploration.members.has(node.id));
      wrapper.replaceChildren(card);
    }
    const hop = path?.nodeIds.indexOf(node.id) ?? -1;
    wrapper.classList.toggle("path-node", hop >= 0);
    wrapper.classList.toggle("path-origin", hop === 0);
    wrapper.classList.toggle("path-destination", !!path && hop === path.nodeIds.length - 1);
    if (hop >= 0) wrapper.dataset.pathIndex = String(hop);
    else delete wrapper.dataset.pathIndex;
    root.append(wrapper);
    kept.add(node.id);
  }
  const leaving: HTMLElement[] = [];
  for (const [id, wrapper] of stage.wrappers) {
    if (kept.has(id)) continue;
    stage.wrappers.delete(id);
    leaving.push(wrapper);
  }
  dressCards(controller, cardsOf(stage), exploration);
  for (const [id, symbol] of [[path?.nodeIds[0], path?.fromSymbol], [path?.nodeIds[path.nodeIds.length - 1], path?.toSymbol]]) {
    if (!id || !symbol) continue;
    stage.wrappers.get(id)?.querySelectorAll<HTMLElement>(".symbol-row").forEach(row => {
      if (normalizeSymbolIdentifier(row.dataset.symbol) === normalizeSymbolIdentifier(symbol)) row.classList.add("symbol-pinned", "symbol-pinned-named");
    });
  }

  // The starts, each ordered, its rows stood on the cards, planned, measured on the page and placed; the cheapest
  // picture is kept. The page's answers that no start changes are kept for the search.
  const answers: PageAnswers = { natural: new Map(), heights: new Map(), labelHeights: new Map() };
  const ranked = exploration.ranking.columns.map(column => column.map(node => node.id));
  const starts = candidateStarts(tuning.orderStarts, tuning.orderSeed, controller.previousTops, ranked);
  const costs: StartCosts = { crossing: tuning.crossingCost, height: tuning.heightCost, churn: tuning.churnCost,
    evenness: tuning.membraneEvenness, levelness: tuning.rowLevelness, steps: tuning.membraneSimplicity };
  const { chosen, outcomes } = layoutStarts(starts, start => {
    const branches = orderExploration(exploration, { sweeps: tuning.orderSweeps, ...startOrder(start) });
    orderRows(cardsOf(stage), branches.rows);
    const plan = planBranches(branches, sceneTuning.bandPadding);
    return { branches, scene: layoutScene(plan, branches, pageMeasurer(controller, stage, plan, scale, answers), sceneTuning) };
  }, costs, controller.previousTops);
  const { branches, scene } = chosen;
  if (outcomes[outcomes.length - 1] !== chosen) orderRows(cardsOf(stage), branches.rows);
  controller.branches = branches;
  controller.currentSubgraph = branches.subgraph;
  controller.previousTops = scene.tops;
  root.dataset.placementCost = String(scene.placement.cost);
  root.dataset.placementOptimal = String(scene.placement.optimal);
  root.dataset.orderStart = startName(chosen.start);
  root.dataset.orderStarts = String(outcomes.length);
  root.dataset.orderScore = String(chosen.score);
  root.dataset.layoutMs = String(Math.round(performance.now() - started));

  const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const moveMs = reduced ? 0 : Math.max(0, tuning.moveMs);
  const measuredRows = rowsOf(controller, stage, scale, branches);
  showScene(controller, stage, scene, sceneTuning, previous ? moveMs : 0, leaving, entering, oldRows);

  // The search over the seeds the first paint did not try, priced from the page's answers and each card's rows as they
  // now stand; a forced seed, the lab's lever, searches nothing.
  const from = tuning.orderSeed !== null ? 1 : Math.max(0, Math.floor(tuning.orderStarts)) + 1;
  const to = tuning.orderSeed !== null ? 0 : from - 1 + Math.max(0, Math.floor(tuning.searchStarts));
  const alignmentEnabled = to >= from && tuning.searchPatience > 0 && costs.steps > 0;
  const search: Search = {
    state: beginSearch({ from, to, patience: Math.floor(tuning.searchPatience) }, scoreOf(chosen.signals, { ...costs, churn: 0 })),
    incumbent: { branches, scene }, alignmentEnabled, alignments: alignmentEnabled ? alignmentCandidates(scene) : [],
    alignmentIndex: 0, alignmentTried: 0, alignmentAdopted: 0, preferAlignment: true,
    exploration, sceneTuning, sweeps: tuning.orderSweeps, costs, moveMs, answers, rows: measuredRows, handle: 0,
    resume: () => scheduleSearch(controller, stage)
  };
  stage.search = search;
  writeSearch(stage);
  if (!stage.move) scheduleSearch(controller, stage);
}

/**
 * Remeasure an existing scene after a disclosure change without rebuilding cards or changing row order: the zoom
 * fold or restore, a resize, or an arrival that unfolds. The opened or folded text changes card heights, so the
 * same branches are laid out again and moved to with the acted-on element held still, and a fresh measured
 * competition begins from the new picture.
 */
export function refreshReadingGeometry(controller: LocalViewController, stage: BranchStage, change: () => void): void {
  const search = stage.search;
  const previous = stage.pose;
  if (!search || !previous) { change(); return; }
  pauseSearch(search);
  const scale = controller.mapTransform.k || 1;
  const rows = rowOffsets(stage, scale);
  const fileCards = cardsOf(stage).filter(card => card.classList.contains("node-card"));
  const beforeHeights = new Map(fileCards.map(card => [card.dataset.id!, card.getBoundingClientRect().height / scale]));
  const anchor = elementHeld(controller, stage, previous, previous)?.getBoundingClientRect();
  endMove(stage, false);
  change();
  controller.reading?.measure();
  const branches = search.incumbent.branches;
  const plan = planBranches(branches, search.sceneTuning.bandPadding);
  const answers: PageAnswers = { natural: new Map(), heights: new Map(), labelHeights: new Map() };
  const scene = layoutScene(plan, branches, pageMeasurer(controller, stage, plan, scale, answers), search.sceneTuning);
  stage.root.dataset.placementCost = String(scene.placement.cost);
  stage.root.dataset.placementOptimal = String(scene.placement.optimal);
  search.incumbent = { branches, scene };
  search.answers = answers;
  search.rows = rowsOf(controller, stage, scale, branches);
  const options = controller.options.state.tuning.localMap;
  search.state = beginSearch({ from: 1, to: Math.max(0, Math.floor(options.searchStarts)), patience: Math.floor(options.searchPatience) }, scoreOf(signalsOf(branches, scene, scene.tops), { ...search.costs, churn: 0 }));
  search.alignments = search.alignmentEnabled ? alignmentCandidates(scene) : [];
  search.alignmentIndex = 0;
  controller.previousTops = scene.tops;
  const heights = fileCards.flatMap(card => {
    const from = beforeHeights.get(card.dataset.id!), to = card.offsetHeight;
    return from !== undefined && Math.abs(from - to) > 0.5 ? [{ element: card, from, to }] : [];
  });
  showScene(controller, stage, scene, search.sceneTuning, Math.min(180, search.moveMs), [], [], rows, { heights, anchor });
  if (!stage.move) scheduleSearch(controller, stage);
}

/** The outline's stroke, which the scene counts in a membrane's inset. */
export { BAND_BORDER };

/** Every card the stage shows, inside its wrapper. */
const cardsOf = (stage: BranchStage): HTMLElement[] => [...stage.wrappers.values()].map(wrapper => wrapper.firstElementChild as HTMLElement);

/** The drawn directory's label, made when first asked for, in the root until a section hosts it. */
function labelFor(controller: LocalViewController, stage: BranchStage, directory: string): HTMLElement {
  let label = stage.labels.get(directory);
  if (!label) {
    label = document.createElement("div");
    label.className = "local-directory-label";
    label.dataset.directory = directory;
    fillLabel(controller, label, directory, stage.disclosures.get(directory));
    stage.root.append(label);
    stage.labels.set(directory, label);
  }
  return label;
}

/**
 * A directory label inspects its directory. Its caption is the name and, while the directory is encasing, what it
 * hides, "+3 files, 1 directory": one text flow, which the layout lab lays out as the page does. Open or Close and
 * More stand beside the caption in a column of their own, as the ancestry control does, so that no button's box
 * enters the text; the lab measures that column like the ancestry control's (2026-10-20, when the buttons first
 * stood in the caption and the lab's text no longer matched the page).
 */
function fillLabel(controller: LocalViewController, label: HTMLElement, directory: string, disclosure: DirectoryDisclosure | undefined): void {
  const open = disclosure?.state === "open";
  // A span in the button role, not a button: a button is one box that cannot break across lines with the count after
  // it, and the caption must wrap as the one text flow it is. The label's click inspects; the name takes the keyboard.
  const name = document.createElement("span");
  name.className = "local-directory-name";
  setSeamedText(name, directory);
  name.tabIndex = 0;
  name.setAttribute("role", "button");
  name.title = `Inspect ${directory}`;
  name.setAttribute("aria-label", `Inspect ${directory}`);
  name.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.stopPropagation();
    void controller.inspectDirectory(directory);
  });
  const caption = document.createElement("span");
  caption.className = "local-directory-caption";
  caption.append(name);
  let held = directory;
  if (!open && disclosure && (disclosure.hiddenFiles || disclosure.hiddenDirectories)) {
    const hidden = document.createElement("span");
    hidden.className = "local-directory-more";
    hidden.textContent = `+${countsOf(disclosure.hiddenFiles, disclosure.hiddenDirectories)}`;
    hidden.title = "Not drawn; open the directory to see them";
    caption.append(" ", hidden);
    held += ` ${hidden.textContent}`;
  }
  // From the middle band out the card ladder draws the caption held at its reading size on one line, cut at its start
  // so that the last segments and the count stay (the far-zoom review, 2026-11-06): the generated content of an
  // aria-hidden child, from its attribute, drawn right to left so that the cut falls at the start, with a left-to-right
  // mark at each end so that a leading dot or a trailing slash keeps its place. The caption in the layout keeps the
  // label's height in every band.
  const drawing = document.createElement("span");
  drawing.className = "local-directory-held";
  drawing.setAttribute("aria-hidden", "true");
  drawing.dataset.held = `\u200e${held}\u200e`;
  label.title = directory;
  const disclose = document.createElement("button");
  disclose.type = "button";
  if (open) {
    disclose.className = "local-directory-close";
    disclose.title = "Close this directory; what other pins need stays";
    disclose.setAttribute("aria-label", `Close ${directory}`);
    disclose.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
    disclose.addEventListener("click", event => { event.stopPropagation(); controller.options.onCloseDirectory(directory); });
  } else {
    disclose.className = "local-directory-open";
    disclose.textContent = "Open";
    disclose.setAttribute("aria-label", `Open ${directory}`);
    disclose.title = "Show the files and subdirectories inside";
    disclose.addEventListener("click", event => { event.stopPropagation(); controller.options.onOpenDirectory(directory); });
  }
  const more = document.createElement("button");
  more.type = "button";
  more.className = "local-directory-actions";
  more.title = `More actions for ${directory}`;
  more.setAttribute("aria-label", more.title);
  more.setAttribute("aria-haspopup", "menu");
  more.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>';
  more.addEventListener("click", event => {
    event.stopPropagation();
    const rect = more.getBoundingClientRect();
    void controller.showDirectoryActions(directory, { x: rect.left + rect.width / 2, y: rect.bottom });
  });
  const controls = document.createElement("span");
  controls.className = "local-directory-controls";
  controls.append(disclose, more);
  label.replaceChildren(ancestryButton(controller, directory), caption, controls, drawing);
  // Labels survive renders. Replace their one body action instead of accumulating a listener on every refill.
  label.onclick = event => { event.stopPropagation(); void controller.inspectDirectory(directory); };
}

/**
 * What the card ladder needs to know of a directory label's room, in the map's own units, read at render (2026-11-06):
 * where its caption begins, the caption's width beside the label's buttons, which stand through the middle band, the
 * label's width from there, which the caption takes once they leave, and the label's height below the caption's top,
 * its line and the padding beneath it above the first card. The label's layout is the same in every band, so the
 * readings are too.
 */
function roomsOfLabel(label: HTMLElement, scale: number): readonly (readonly [string, string])[] {
  const caption = label.querySelector<HTMLElement>(".local-directory-caption");
  if (!caption || !(scale > 0)) return [];
  const box = label.getBoundingClientRect(), text = caption.getBoundingClientRect();
  const x = (text.left - box.left) / scale, y = (text.top - box.top) / scale;
  return [
    ["--dir-x", x.toFixed(1)],
    ["--dir-y", y.toFixed(1)],
    ["--dir-room-mid", (text.width / scale).toFixed(1)],
    ["--dir-room-far", Math.max(0, label.clientWidth - x).toFixed(1)],
    ["--dir-room-h", Math.max(0, label.offsetHeight - y).toFixed(1)]
  ];
}

/**
 * Where an anchor's centre stands below its card's wrapper's top, in the map's own units, as the placement reads it for
 * a pin, which it rounds: from its box as the layout put it, a held dot's shift and scale taken back, the same arithmetic
 * as the layout search's rows (`laidOutBox`), so that a render at any zoom reads the pins a render at reading scale reads
 * (the root's reviews of the far bands, 2026-11-06: a pin made one press out placed eight cards two or three pixels from
 * where the same pin made at reading scale put them). A first repair read the layout's offsets up to the wrapper, which is
 * not among an anchor's offset parents, so every pin had still been read from the dot as drawn: 112.5 at reading scale,
 * 114.2 one press out. A hub keeps its own centring, a transform that no step changes.
 */
function anchorCentre(anchor: HTMLElement, wrapper: HTMLElement, scale: number): number {
  const box = laidOutBox(anchor, scale);
  return onLayoutGrid(((box.top + box.bottom) / 2 - wrapper.getBoundingClientRect().top) / scale);
}

/**
 * Chromium's and WebKit's layout unit, 1/64 px. Gecko's is 1/60 px: there the snap moves a value by under 1/128 px and
 * never across a pin's rounding, since no sixtieth lies within that of a half but the half itself, which both grids hold.
 */
const LAYOUT_UNIT = 64;

/**
 * A length in the map's own units read from the drawn page, put back on the layout's grid, where every box the layout
 * gives stands. The page is always transformed, at reading scale too (the camera's own scale and translation), and a
 * transformed page's boxes are computed in single precision, so a reading carries noise that grows with its distance
 * down the picture: far down a tall one it reached a few thousandths of a pixel (an Internals dot laid out at 4292.5
 * read back at 4292.4984 one press out, against 4292.5 at reading scale, the root's review of the far bands,
 * 2026-11-06), enough to tip a half-pixel pin's rounding. The snap takes away noise under half a unit, and so is what
 * makes readings at different scales agree.
 */
function onLayoutGrid(value: number): number {
  return Math.round(value * LAYOUT_UNIT) / LAYOUT_UNIT;
}

/**
 * Where an element stands as the layout placed it, in screen pixels, for the placement's pins and the layout search's
 * rows, which keep the fractions: its drawn box, with the shift and the scale about its centre that the card ladder draws
 * a held dot with taken back (2026-11-06), so that both read the same rows and pins in every band.
 */
function laidOutBox(element: Element, scale: number): { top: number; bottom: number } {
  const rect = element.getBoundingClientRect();
  if (!element.classList.contains("dot")) return { top: rect.top, bottom: rect.bottom };
  // The card reading's arithmetic (`layoutTopOf`), in the map's own units, and back to the screen's.
  const drawn = new DOMMatrix(getComputedStyle(element).transform), height = (element as HTMLElement).offsetHeight;
  const top = layoutTopOf(rect.top / scale, height, drawn.f, drawn.d || 1) * scale;
  return { top, bottom: top + height * scale };
}

/**
 * A card's natural width, whole pixels, never less than its content: the browser lays out in 1/64 px, so the width
 * is read at that unit and taken up to the next pixel. `offsetWidth` rounded to the nearest, and a card whose
 * content stood a few hundredths over the pixel (a path of 304.08 px, the seams' `<wbr>` elements each a layout
 * unit wide since 2026-10-30) was given a 304 px box and wrapped its own path at a seam (found 2026-10-31).
 */
function naturalWidthOf(wrapper: HTMLElement, scale: number): number {
  return Math.ceil(onLayoutGrid(wrapper.getBoundingClientRect().width / scale));
}

/**
 * The page as the scene's measurer. Widths first, every card at its own, no
 * wider than the cap; then heights at the widths the columns give, since a
 * card's rows of test names wrap at its column's width where its own did
 * not, and a label wraps to nothing in a box not yet given a width; and
 * every pin's height on its card, in the rows as they stand. What no start
 * changes is written into `answers` for the search.
 */
function pageMeasurer(controller: LocalViewController, stage: BranchStage, plan: ScenePlan, scale: number, answers: PageAnswers): SceneMeasurer {
  return {
    widths(cardMaxWidth) {
      for (const wrapper of stage.wrappers.values()) Object.assign(wrapper.style, { width: "max-content", maxWidth: cardMaxWidth === null ? "" : `${cardMaxWidth}px` });
      const widths = new Map<string, number>();
      for (const [id, wrapper] of stage.wrappers) widths.set(id, naturalWidthOf(wrapper, scale));
      answers.natural = widths;
      return widths;
    },
    measure(cardWidths, labelWidths) {
      const boxes = new Map(plan.boxes.map(box => [box.key, box]));
      for (const [id, width] of cardWidths) { const wrapper = stage.wrappers.get(id); if (wrapper) wrapper.style.width = `${width}px`; }
      controller.reading?.measure();
      for (const [key, width] of labelWidths) { const box = boxes.get(key)!; Object.assign(labelFor(controller, stage, box.directory).style, { left: `${box.inset}px`, width: `${width}px` }); }
      const heights = new Map<string, number>();
      for (const [id, wrapper] of stage.wrappers) heights.set(id, wrapper.offsetHeight);
      const labelHeights = new Map<string, number>();
      const labelRooms: (readonly [HTMLElement, readonly (readonly [string, string])[]])[] = [];
      for (const key of labelWidths.keys()) {
        const directory = boxes.get(key)!.directory;
        const label = labelFor(controller, stage, directory);
        const height = label.offsetHeight;
        labelHeights.set(key, height);
        answers.labelHeights.set(directory, height);
        labelRooms.push([label, roomsOfLabel(label, scale)]);
      }
      for (const [label, rooms] of labelRooms) for (const [name, value] of rooms) label.style.setProperty(name, value);
      answers.heights = heights;
      const pin = (id: string, direction: "inbound" | "outbound", symbol: string | undefined): number | null => {
        const anchor = controller.getAnchor(id, "center", direction, symbol);
        const card = stage.wrappers.get(id);
        if (!anchor || !card) return null;
        const rect = anchor.getBoundingClientRect();
        if (!rect.width && !rect.height) return null;
        // A pin centred on a half pixel, as a dot in a row of odd height is, rounds up whatever the floating noise of
        // the page's transform, so the placement's input is the same wherever the card stood when it was measured.
        return Math.round(anchorCentre(anchor, card, scale) + 1e-3);
      };
      return { heights, pin, labelHeights };
    }
  };
}

/**
 * The page's answers as the scene's measurer, with every pin arithmetic from
 * the card's rows as measured once, so that the search prices a start
 * without the page's layout.
 */
function answersMeasurer(search: Search, plan: ScenePlan, branches: BranchGraph): SceneMeasurer {
  const boxes = new Map(plan.boxes.map(box => [box.key, box]));
  return {
    widths: () => search.answers.natural,
    measure: (_cardWidths, labelWidths) => ({
      heights: search.answers.heights,
      labelHeights: new Map([...labelWidths.keys()].map(key => [key, search.answers.labelHeights.get(boxes.get(key)!.directory) ?? 0])),
      pin: (id, direction, symbol) => {
        const card = search.rows.get(id);
        if (!card) throw new Error(`The search has no measured endpoints for card ${JSON.stringify(id)}.`);
        return pinFor(card, branches.rows.get(id), direction, symbol);
      }
    })
  };
}

/**
 * Builds or finds the elements of a scene's boxes, hosts every element inside
 * the element of the box that holds it, publishes a drawn directory's segments
 * and a lane's slots, and shows the scene: at once when `moveMs` is zero or
 * no picture was shown, else moved to from the pose the page shows.
 */
function showScene(controller: LocalViewController, stage: BranchStage, scene: Scene, sceneTuning: SceneTuning, moveMs: number, leavingCards: HTMLElement[], enteringCards: HTMLElement[], oldRows: Map<string, Map<string, number>> | null, reading: Pick<Move, "heights" | "anchor"> = {}): void {
  const { root } = stage;
  const previous = stage.pose;
  const pose = scenePose(scene);
  const instantHeld = previous && moveMs <= 0 ? elementHeld(controller, stage, previous, pose) : null;
  const instantAnchor = reading.anchor ?? instantHeld?.getBoundingClientRect();
  const scale = controller.runtime.mapTransform.k || 1;
  const leaving = [...leavingCards];
  const entering = [...enteringCards];
  // The elements of the scene: a section for the root and for each directory, a drawn directory's with its outline
  // and label; a spacer for each lane; each kept by its key across renders, created when new.
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
          element.append(svg, labelFor(controller, stage, box.directory));
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
  for (const box of scene.boxes) if (box.kind !== "files") {
    const element = elements.get(box)!, host = hostElement(box.anchor);
    // Appending an element to its existing parent still blurs a focused descendant in Chromium. A geometry-only
    // change has no structural move to make; keep its reading controls and keyboard focus in place.
    if (element.parentElement !== host) host.append(element);
  }
  // Each item's wrapper in the element of the box that holds it, saying its column for the router's column bounds.
  for (const item of scene.items.values()) {
    const wrapper = stage.wrappers.get(item.id)!;
    wrapper.dataset.column = String(item.column);
    const host = hostElement(hostOf(item.box));
    if (wrapper.parentElement !== host) host.append(wrapper);
  }
  // A drawn directory publishes its segments, a lane where its slots came to rest, for the router and the tests.
  for (const box of scene.boxes) {
    const element = elements.get(box);
    if (!element) continue;
    if (box.kind === "lane") element.dataset.slots = (scene.slotLines.get(box.lane!.key) ?? []).map(String).join(",");
    else element.dataset.segments = box.segments.map(segment => `${segment.column}:${segment.left}:${segment.top}:${segment.right}:${segment.bottom}`).join(";");
  }

  // Every element at its place, at once for the first picture, else moved there from where the previous one stood it.
  if (!previous || moveMs <= 0) {
    for (const element of leaving) element.remove();
    applyPose(stage, pose, sceneTuning.bandPadding);
    stage.pose = pose;
    if (instantHeld && instantAnchor) {
      const rect = instantHeld.getBoundingClientRect();
      const camera = controller.mapTransform;
      controller.mapTransform = { ...camera, x: camera.x + instantAnchor.left - rect.left, y: camera.y + instantAnchor.top - rect.top };
      controller.updateMapTransform();
    }
    controller.drawConnections();
    return;
  }
  const rows = oldRows ? rowMotions(stage, oldRows, scale) : [];
  startMove(controller, stage, previous, pose, moveMs, { to: pose, bandPadding: sceneTuning.bandPadding, leaving, entering, rows, frame: 0, ...reading });
}

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
 * for whoever reads the page, and the search waits for the move to end.
 */
function startMove(controller: LocalViewController, stage: BranchStage, from: Pose, to: Pose, duration: number, move: Move): void {
  const { root } = stage;
  root.dataset.moving = "true";
  stage.overlay.classList.add("moving");
  applyPose(stage, tweenPose(from, to, 0), move.bandPadding);
  for (const element of move.entering) element.style.opacity = "0";
  for (const { element, delta } of move.rows) element.style.transform = `translateY(${delta}px)`;
  let heldId = controller.lastInteracted;
  let heldSymbol = controller.lastInteractedSymbol;
  let heldElement = elementHeld(controller, stage, from, to);
  let heldRect = move.anchor ?? heldElement?.getBoundingClientRect() ?? null;
  const cameraAtStart = { ...controller.mapTransform };
  const layerTop = (): number => controller.getViewport().getBoundingClientRect().top + (controller.getContainer().parentElement?.offsetTop ?? 0);
  let layerTopAtStart = layerTop();
  for (const { element, from } of move.heights ?? []) {
    element.style.height = `${from}px`;
    element.style.overflow = "clip";
  }
  /** Keep camera gestures and header compensation; the latter also changes the frame's screen origin. */
  const hold = (): void => {
    if (!heldElement || !heldRect) return;
    const camera = controller.mapTransform;
    const rect = heldElement.getBoundingClientRect();
    const dx = heldRect.left + (camera.x - cameraAtStart.x) - rect.left;
    const layerShift = layerTop() - layerTopAtStart;
    const dy = heldRect.top + (camera.y - cameraAtStart.y) + layerShift - rect.top;
    if (dx || dy) {
      controller.mapTransform = { ...camera, x: camera.x + dx, y: camera.y + dy };
      cameraAtStart.x += dx;
      cameraAtStart.y += dy;
      controller.updateMapTransform();
    }
  };
  const start = performance.now();
  const step = (now: number): void => {
    // A real zoom already moved the visible anchor. Rebase before changing the pose so holding corrects only
    // layout motion, rather than retaining zoom's translation while cancelling its scale.
    const changedIdentity = heldId !== controller.lastInteracted || heldSymbol !== controller.lastInteractedSymbol;
    if (changedIdentity || cameraAtStart.k !== controller.mapTransform.k) {
      if (changedIdentity) {
        heldId = controller.lastInteracted;
        heldSymbol = controller.lastInteractedSymbol;
        heldElement = elementHeld(controller, stage, from, to);
      }
      heldRect = heldElement?.getBoundingClientRect() ?? null;
      Object.assign(cameraAtStart, controller.mapTransform);
      layerTopAtStart = layerTop();
    }
    const t = Math.min(1, (now - start) / duration);
    const eased = easeInOutCubic(t);
    const frame = tweenPose(from, to, eased);
    applyPose(stage, frame, move.bandPadding);
    for (const { element, from, to } of move.heights ?? []) element.style.height = `${from + (to - from) * eased}px`;
    for (const element of move.entering) element.style.opacity = String(eased);
    for (const element of move.leaving) element.style.opacity = String(1 - eased);
    for (const { element, delta } of move.rows) element.style.transform = `translateY(${delta * (1 - eased)}px)`;
    hold();
    stage.pose = frame;
    controller.drawConnections();
    if (t < 1) move.frame = requestAnimationFrame(step);
    else {
      endMove(stage, true);
      // The end of a move settles what the frames tweened; the hold is made exact once more on the settled picture
      // (a residual of two pixels over a long move, measured 2026-10-15).
      hold();
      controller.drawConnections();
      controller.settleArrival();
      controller.readingHold = false;
      const hovered = controller.localMapState.getState().hoveredSymbol;
      if (hovered) controller.highlightSymbolConnections(hovered.nodeId, hovered.symbol);
      stage.search?.resume();
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
  for (const { element } of move.rows) {
    element.style.transform = "";
    element.classList.remove("local-row-moving");
  }
  for (const { element } of move.heights ?? []) { element.style.height = ""; element.style.overflow = ""; }
  if (finished) {
    applyPose(stage, move.to, move.bandPadding);
    stage.pose = move.to;
  }
  delete stage.root.dataset.moving;
  stage.overlay.classList.remove("moving");
  stage.move = null;
}

/**
 * The element held still on screen through a move: the card the person last
 * interacted with, else the selected file's, when the picture has it before
 * and after; or, when what they last acted on is a directory, its label once
 * it is a membrane and its box once it is closed, so that what was clicked
 * stays under the eye while the directory opens or closes (2026-10-08). An
 * element that enters or leaves cannot be held.
 */
function elementHeld(controller: LocalViewController, stage: BranchStage, from: Pose, to: Pose): HTMLElement | null {
  for (const id of [controller.lastInteracted, controller.options.state.selectedNode?.id]) {
    if (!id) continue;
    const membrane = `directory\0${id}`;
    if (!(from.items.has(id) || from.boxes.has(membrane)) || !(to.items.has(id) || to.boxes.has(membrane))) continue;
    if (id === controller.lastInteracted && controller.lastInteractedSymbol && to.items.has(id)) {
      const row = stage.wrappers.get(id)?.querySelector<HTMLElement>(
        `.symbol-row[data-symbol="${CSS.escape(controller.lastInteractedSymbol)}"] .symbol-label-wrapper`
      );
      if (row?.getClientRects().length) return row;
    }
    return (to.items.has(id) ? stage.wrappers.get(id) : stage.labels.get(id)) ?? null;
  }
  return null;
}

// ─── The continuing search ──────────────────────────────────────────────

/**
 * Waits for the page's next idle moment and runs the search's next start in
 * it, one start a moment, unless the search is over, a move runs, a step is
 * already waiting, or no one is looking: the search runs only while the map
 * is the view shown and the page visible, and the controller resumes it when
 * the map is shown again (the owner's choice, 2026-10-16; before, the search
 * went on behind another view and was begun anew on return). Without
 * `requestIdleCallback` a short timer stands in.
 */
function scheduleSearch(controller: LocalViewController, stage: BranchStage): void {
  const search = stage.search;
  if (!search || !nextTrialKind(search.state, search.alignmentIndex < search.alignments.length, search.preferAlignment) || stage.move || search.handle) return;
  if (!searchAllowed(controller)) return;
  const run = (): void => {
    search.handle = 0;
    // A step whose moment comes after the map was hidden does nothing; the controller's resume schedules the next.
    if (stage.search !== search || !searchAllowed(controller)) return;
    searchStep(controller, stage, search);
    scheduleSearch(controller, stage);
  };
  search.handle = typeof requestIdleCallback === "function" ? requestIdleCallback(run, { timeout: 1000 }) : window.setTimeout(run, 32);
}

/** Whether a search may step now: the map is the view shown and the page is visible. */
const searchAllowed = (controller: LocalViewController): boolean => controller.isShown()
  && !controller.runtime.mapAnimationTarget && controller.options.state.inspection?.presentation !== "reading"
  && document.visibilityState !== "hidden";

/** Ends the stage's search, if one runs, and lets any waiting step go. */
function stopSearch(stage: BranchStage): void {
  const search = stage.search;
  if (!search) return;
  pauseSearch(search);
  stage.search = null;
}

/** Cancel the pending competition step while keeping its measured state available for a preview's return. */
function pauseSearch(search: Search): void {
  if (search.handle) {
    if (typeof cancelIdleCallback === "function") cancelIdleCallback(search.handle);
    window.clearTimeout(search.handle);
    search.handle = 0;
  }
}

/**
 * One idle trial: the next ordering seed or a join of the incumbent's flat
 * boundary runs. Cached measurements price it against the shown picture;
 * a predicted improvement is measured again before the final decision.
 */
function searchStep(controller: LocalViewController, stage: BranchStage, search: Search): void {
  const kind = nextTrialKind(search.state, search.alignmentIndex < search.alignments.length, search.preferAlignment);
  if (!kind) return;
  search.preferAlignment = kind === "seed";
  const seed = search.state.next;
  const alignments = kind === "alignment" ? search.alignments[search.alignmentIndex++] : [];
  const branches = kind === "alignment" ? search.incumbent.branches : orderExploration(search.exploration, { sweeps: search.sweeps, seed });
  if (kind === "alignment") search.alignmentTried++;
  const plan = planBranches(branches, search.sceneTuning.bandPadding);
  const scene = layoutScene(plan, branches, answersMeasurer(search, plan, branches), search.sceneTuning, alignments);
  const signals = signalsOf(branches, scene, controller.previousTops);
  const priced = scoreOf(signals, search.costs);
  const judge = kind === "alignment" ? judgeAlignment : judgeStart;
  const { state, adopt } = judge(search.state, priced, scoreOf(signals, { ...search.costs, churn: 0 }));
  if (adopt) {
    const adopted = tryAdoptPicture(controller, stage, search, branches, kind === "seed" ? `seed ${seed}` : stage.root.dataset.orderStart ?? "ranked", priced, alignments, kind);
    if (adopted && kind === "alignment") search.alignmentAdopted++;
  } else search.state = state;
  writeSearch(stage);
}

/** Measures a promising candidate on the page and accepts it only if its actual complete price improves the picture. */
function tryAdoptPicture(controller: LocalViewController, stage: BranchStage, search: Search, branches: BranchGraph, name: string, priced: number, alignments: readonly BoundaryAlignment[], kind: "seed" | "alignment"): boolean {
  const { root } = stage;
  const scale = controller.runtime.mapTransform.k || 1;
  const oldRows = rowOffsets(stage, scale);
  orderRows(cardsOf(stage), branches.rows);
  const plan = planBranches(branches, search.sceneTuning.bandPadding);
  const answers: PageAnswers = { natural: new Map(), heights: new Map(), labelHeights: new Map() };
  const scene = layoutScene(plan, branches, pageMeasurer(controller, stage, plan, scale, answers), search.sceneTuning, alignments);
  const signals = signalsOf(branches, scene, controller.previousTops);
  const measured = scoreOf(signals, { ...search.costs, churn: 0 });
  const actual = scoreOf(signals, search.costs);
  const judge = kind === "alignment" ? judgeAlignment : judgeStart;
  const decision = judge(search.state, actual, measured);
  search.state = decision.state;
  root.dataset.searchPredicted = String(priced);
  root.dataset.searchMeasured = String(actual);
  if (!decision.adopt) {
    // Measuring tries row order and widths in the existing elements. Refusing
    // that candidate must restore the displayed picture and its label widths,
    // while leaving its measurement cache uncontaminated by the rejected one.
    const incumbent = search.incumbent;
    orderRows(cardsOf(stage), incumbent.branches.rows);
    const drawn = new Set<string>();
    for (const box of incumbent.scene.boxes) {
      if (box.kind !== "directory") continue;
      drawn.add(box.directory);
      const label = stage.labels.get(box.directory);
      if (label) Object.assign(label.style, { left: `${box.inset}px`, width: `${Math.max(0, box.segments[0].right - box.segments[0].left - 2 * box.inset)}px` });
    }
    for (const [directory, label] of stage.labels) if (!drawn.has(directory)) { label.remove(); stage.labels.delete(directory); }
    applyPose(stage, scenePose(incumbent.scene), search.sceneTuning.bandPadding);
    return false;
  }
  search.answers = answers;
  search.incumbent = { branches, scene };
  search.alignments = search.alignmentEnabled ? alignmentCandidates(scene) : [];
  search.alignmentIndex = 0;
  search.rows = rowsOf(controller, stage, scale, branches);
  controller.branches = branches;
  controller.currentSubgraph = branches.subgraph;
  controller.previousTops = scene.tops;
  root.dataset.placementCost = String(scene.placement.cost);
  root.dataset.placementOptimal = String(scene.placement.optimal);
  root.dataset.orderStart = name;
  root.dataset.orderScore = String(scoreOf(signals, search.costs));
  root.dataset.searchPriced = String(priced);
  showScene(controller, stage, scene, search.sceneTuning, search.moveMs, [], [], oldRows);
  return true;
}

/** What the search has done, on the root, for whoever reads the page: no text announces it. */
function writeSearch(stage: BranchStage): void {
  const search = stage.search;
  if (!search) return;
  const { state } = search;
  stage.root.dataset.searchStatus = search.alignmentIndex < search.alignments.length ? "running" : state.status;
  stage.root.dataset.searchAlignmentTried = String(search.alignmentTried);
  stage.root.dataset.searchAlignmentAdopted = String(search.alignmentAdopted);
  stage.root.dataset.searchTried = String(state.tried);
  stage.root.dataset.searchNext = String(state.next);
  stage.root.dataset.searchAdopted = String(state.adopted);
  stage.root.dataset.searchShown = String(state.shown);
  stage.root.dataset.searchBest = String(state.best);
}

// ─── Measuring the cards ────────────────────────────────────────────────

/** An exact projected heading and its occurrence among duplicates; case and declaration-kind distinctions remain separate. */
function rowKeys(card: HTMLElement): Array<[HTMLElement, string]> {
  const seen = new Map<string, number>();
  return [...card.querySelectorAll<HTMLElement>(".symbol-row")].map(row => {
    const name = normalizeSymbolIdentifier(row.dataset.symbol) ?? "__internals__";
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);
    return [row, `${name}\0${count}`];
  });
}

/**
 * Each card's rows as they stand, measured once in the picture's pixels:
 * the header above the first visible grid track, the grid's gap and each
 * track's height. Endpoints use the runtime's exact anchor resolution, so
 * duplicate names, file hubs and hidden rows agree with the page measurer.
 */
function rowsOf(controller: LocalViewController, stage: BranchStage, scale: number, branches: BranchGraph): Map<string, CardRows> {
  const measured = new Map<string, CardRows>();
  const requests = new Map<string, Map<string, { direction: "inbound" | "outbound"; symbol: string | undefined }>>();
  const request = (id: string, direction: "inbound" | "outbound", symbol: string | undefined): void => {
    const endpoints = requests.get(id) ?? new Map<string, { direction: "inbound" | "outbound"; symbol: string | undefined }>();
    endpoints.set(endpointKey(direction, symbol), { direction, symbol });
    requests.set(id, endpoints);
  };
  for (const edge of branches.subgraph.links) {
    if (edge.sourceId === edge.targetId || branches.back.has(edgeKey(edge))) continue;
    request(edge.targetId, "outbound", edge.targetSymbol);
    request(edge.sourceId, "inbound", edge.sourceSymbol);
  }
  for (const [id, wrapper] of stage.wrappers) {
    const card = wrapper.querySelector<HTMLElement>(".node-card");
    if (!card) continue;
    const cardTop = wrapper.getBoundingClientRect().top;
    const grid = card.querySelector<HTMLElement>(".symbol-grid");
    const gap = grid ? Number.parseFloat(getComputedStyle(grid).rowGap) || 0 : 0;
    const rows: RowMeasure[] = [];
    const rowPositions = new Map<HTMLElement, { key: string; top: number }>();
    let internals: string | null = null;
    let header = 0;
    for (const [row, key] of rowKeys(card)) {
      // A row is read through its children as laid out, a held dot's shift and scale taken back, and a slot card's slot
      // only hidden below reading scale, never taken out, so that the search reads the same rows in every band (2026-11-06).
      const bounds = rowBounds([...row.children].flatMap(child => {
        const rect = child.getBoundingClientRect();
        if (!rect.width && !rect.height) return [];
        const style = getComputedStyle(child), box = laidOutBox(child, scale);
        return [{ top: onLayoutGrid((box.top - cardTop) / scale), bottom: onLayoutGrid((box.bottom - cardTop) / scale),
          marginTop: Number.parseFloat(style.marginTop) || 0, marginBottom: Number.parseFloat(style.marginBottom) || 0 }];
      }));
      if (!bounds) continue;
      if (!rows.length) header = bounds.top;
      rowPositions.set(row, { key, top: bounds.top });
      rows.push({ key, height: bounds.bottom - bounds.top });
      if (row.classList.contains("internals-row")) internals = key;
    }
    const endpoints = new Map<string, ResolvedPin | null>();
    for (const [key, { direction, symbol }] of requests.get(id) ?? []) {
      const anchor = controller.getAnchor(id, "center", direction, symbol);
      const rect = anchor?.getBoundingClientRect();
      if (!anchor || !rect || (!rect.width && !rect.height)) { endpoints.set(key, null); continue; }
      const row = anchor.closest<HTMLElement>(".symbol-row");
      const at = row ? rowPositions.get(row) : undefined;
      if (row && !at) throw new Error(`The visible endpoint ${JSON.stringify(symbol ?? "*")} of ${JSON.stringify(id)} has no measured row.`);
      const box = laidOutBox(anchor, scale);
      endpoints.set(key, { row: at?.key ?? null, offset: onLayoutGrid(((box.top + box.bottom) / 2 - cardTop) / scale) - (at?.top ?? 0) });
    }
    measured.set(id, { header, gap, rows, internals, endpoints });
  }
  return measured;
}

/**
 * Where each visible row of each card stands, from its card's top, in the
 * picture's pixels, by the row's key. Hidden rows have no place.
 */
function rowOffsets(stage: BranchStage, scale: number): Map<string, Map<string, number>> {
  const offsets = new Map<string, Map<string, number>>();
  for (const [id, wrapper] of stage.wrappers) {
    const card = wrapper.querySelector<HTMLElement>(".node-card");
    if (!card) continue;
    const cardTop = card.getBoundingClientRect().top;
    const rows = new Map<string, number>();
    for (const [row, key] of rowKeys(card)) {
      const rect = row.firstElementChild?.getBoundingClientRect();
      if (!rect || (!rect.width && !rect.height)) continue;
      rows.set(key, (rect.top - cardTop) / scale);
    }
    offsets.set(id, rows);
  }
  return offsets;
}

/**
 * Move a boxed symbol as one surface, so its explanation and name cannot be interleaved with another row's text
 * when their order changes. Legacy display:contents rows have no surface and still move through their children.
 */
function rowMotions(stage: BranchStage, before: Map<string, Map<string, number>>, scale: number): Array<{ element: HTMLElement; delta: number }> {
  const motions: Array<{ element: HTMLElement; delta: number }> = [];
  const after = rowOffsets(stage, scale);
  for (const [id, wrapper] of stage.wrappers) {
    const was = before.get(id), now = after.get(id);
    if (!was || !now) continue;
    const card = wrapper.querySelector<HTMLElement>(".node-card");
    if (!card) continue;
    for (const [row, key] of rowKeys(card)) {
      const from = was.get(key), to = now.get(key);
      if (from === undefined || to === undefined || Math.abs(from - to) < 0.5) continue;
      if (getComputedStyle(row).display !== "contents") {
        row.classList.add("local-row-moving");
        motions.push({ element: row, delta: from - to });
      } else {
        for (const child of row.children) motions.push({ element: child as HTMLElement, delta: from - to });
      }
    }
  }
  return motions;
}

/**
 * Each card's rows in the order a start chose; rows the order does not name
 * keep their place after them, Internals last. Two symbols may share a
 * normalized name (LinkTarget and linkTarget), so a name claims one row per
 * mention. Run once per start, since a start's pins stand where its rows do; it tells the card ladder again how many
 * rows stand above the first pinned one, which bounds the file's name at the overview band.
 */
function orderRows(cards: readonly HTMLElement[], rows: ReadonlyMap<string, readonly string[]>): void {
  for (const card of cards) {
    const rowOrder = rows.get(card.dataset.id!);
    if (!rowOrder) { markFirstPin(card); continue; }
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
    markFirstPin(card);
  }
}

/**
 * The cards' hidden rows counted and their notes on references read back and
 * connections outside the view, which every start shares: they stand before
 * any start is measured, since they take room on the card.
 */
function dressCards(controller: LocalViewController, cards: readonly HTMLElement[], exploration: Exploration): void {
  const presentRow = rowPresentation(controller, exploration);
  const backReferences = new Map<string, LocalEdge[]>();
  for (const edge of exploration.subgraph.links) {
    if (!exploration.ranking.back.has(edgeKey(edge))) continue;
    for (const id of new Set([edge.sourceId, edge.targetId])) backReferences.set(id, [...(backReferences.get(id) ?? []), edge]);
  }
  for (const card of cards) {
    // A closed directory's box has no rows and no notes.
    if (!card.classList.contains("node-card")) continue;
    const id = card.dataset.id!;
    let hidden = 0;
    card.querySelectorAll<HTMLElement>(".symbol-row").forEach(row => {
      const state = presentRow(id, row.dataset.symbol);
      row.classList.toggle("branch-symbol-hidden", state.hidden);
      row.classList.toggle("branch-symbol-muted", state.muted);
      // The Internals row stands for the file's private contents, not for a symbol: it is not counted on the reveal.
      if (state.hidden && !row.classList.contains("internals-row")) hidden++;
    });
    if (hidden) {
      const reveal = document.createElement("button");
      reveal.className = "local-disclosure";
      reveal.textContent = `+${countOf(hidden, "symbol")}`;
      reveal.title = "Show the other symbols in this file";
      reveal.addEventListener("click", event => {
        event.stopPropagation(); controller.lastInteracted = id; controller.lastInteractedSymbol = null; controller.expandedCards.add(id); controller.render();
      });
      card.append(reveal);
    }
    const back = backReferences.get(id) ?? [];
    controller.reading?.setBackReferences(id, back);
    if (back.length) {
      const note = document.createElement(controller.reading ? "button" : "span");
      note.className = "local-disclosure local-back-references";
      note.textContent = `${countOf(back.length, "connection returns", "connections return")} in a cycle`;
      note.title = "Show the files joined by connections that return against the layout's reading direction";
      if (controller.reading) {
        note.setAttribute("aria-haspopup", "menu");
        note.addEventListener("click", event => {
          event.stopPropagation();
          const rect = note.getBoundingClientRect();
          controller.reading!.showBackReferences(id, { x: rect.left, y: rect.bottom + 4 });
        });
      }
      card.append(note);
    }
    const outside = exploration.hiddenConnections.get(id) ?? 0;
    if (outside) card.append(controller.isPinned(id, "*") ? hiddenByFilters(outside) : revealControl(controller, id, outside));
  }
}

/** A pinned file's count of the connections the display filters hide: a fact, not a control. */
function hiddenByFilters(count: number): HTMLElement {
  const note = document.createElement("span");
  note.className = "local-disclosure";
  note.textContent = `${countOf(count, "connection")} hidden by filters`;
  return note;
}

/**
 * The control a card's connections outside the view are counted on, which pins the file and so reveals them (since
 * 2026-10-02). A newcomer read the faint line, "21 connections outside this view", as static text and concluded the map
 * draws no connections (the first-visit review of 2026-11-12). It is drawn as the card's other text control, the
 * directory's Open, is: framed, the Pin glyph, the action's own icon, beside the count in the card's idiom of what is not
 * drawn here, "+21 connections", as "+4 symbols" above it says. Its name begins with those words and carries the rest,
 * so that a spoken command using what is drawn finds it. The root chose this form over an underlined link the same day:
 * on a card what acts is framed or filled, and underlined text is a link to a file. It keeps the line's box.
 */
function revealControl(controller: LocalViewController, id: string, count: number): HTMLElement {
  const reveal = document.createElement("button");
  reveal.className = "local-disclosure local-reveal-connections";
  const drawn = `+${countOf(count, "connection")}`;
  reveal.setAttribute("aria-label", `${drawn} outside this view`);
  reveal.title = "Pin this file to reveal its connections; display filters still apply";
  reveal.innerHTML = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PIN_GLYPH}"/></svg>`;
  reveal.append(drawn);
  reveal.addEventListener("click", event => { event.stopPropagation(); controller.options.onPressPin(id, "*"); });
  return reveal;
}

/** The room a lane's bundles pass through; the placement sizes it, and the router reads its place and its slots back from the page. */
function laneElement(laneKey: string): HTMLElement {
  const element = document.createElement("div");
  element.className = "local-pass-through";
  element.dataset.lane = laneKey;
  return element;
}
