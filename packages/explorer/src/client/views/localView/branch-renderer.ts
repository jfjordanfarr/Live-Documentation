import { alignmentCandidates } from "./branch-alignments";
import { boxKeyOf, easeInOutCubic, scenePose, tweenPose, type Pose } from "./branch-motion";
import type { BoundaryAlignment } from "./branch-placement";
import { candidateStarts, layoutStarts, pictureScore, scoreOf, signalsOf, startName, startOrder, type StartCosts, type StartSignals } from "./branch-restarts";
import { BAND_BORDER, hostOf, layoutScene, planBranches, type Scene, type SceneBox, type SceneMeasurer, type ScenePlan, type SceneTuning } from "./branch-scene";
import { beginSearch, endpointKey, judgeAlignment, judgeStart, nextTrialKind, pinFor, rowBounds, type CardRows, type ResolvedPin, type RowMeasure, type SearchState } from "./branch-search";
import { arrangeExploration, edgeKey, exploreBranches, isClosedDirectory, orderExploration, type BranchGraph, type DirectoryDisclosure, type Exploration } from "./branches";
import { countsOf, createClosedDirectory, createHiddenCells, createHiddenField, createNodeCard, hasCloseAction, PIN_GLYPH } from "./card-factory";
import { markFirstPin } from "./card-reading";
import { drawsReference } from "./connections";
import type { LocalViewController } from "./controller";
import { cycleOrdersOf, horizontalWire, nextCycleTrial, returningLinks, standingOrders, type CycleTrial } from "./cycle-trials";
import { ancestryButton } from "./directory-ancestry";
import { isPairLine, NARROW_SHAPE, nominalMeasurer, searchFlowShape, shapeRecord, type FlowShape, type ShapeSearch } from "./directory-flow";
import { chevronMarkup, handleParts, handleReach, HANDLE_AIR, HANDLE_FLOOR, HANDLE_HOLD, HANDLE_INDENT, HANDLE_LINE, HANDLE_STRIP, type Standing } from "./directory-handle";
import { layoutTopOf } from "./ladder-rooms";
import { membranePath } from "./membrane-outline";
import { OVERVIEW_FILES_ATTRIBUTE, OVERVIEW_LINES_ATTRIBUTE, type PictureSize } from "./overview-files";
import { connectionCount, returningConnections } from "./returning-connections";
import type { LocalEdge } from "./types";
import { NODE_HUB } from "./wire-gathering";
import { countOf } from "./word-seams";
import type { ExplorerNodePayload } from "../../../shared/types";
import type { LocalMapTuning } from "../../types";
import { EMPTY_PIN_SET } from "../pin-state";
import { normalizeSymbolIdentifier } from "../symbolAnchors";

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
  /** The flow shape chosen for each set of opened directories under its filters and tuning, kept while the page lives. */
  flowShapes: Map<string, ShapeSearch>;
  /**
   * The size of the picture with its rows while files only is shown at the overview (2026-11-13), for Fit; null when the
   * rows are drawn, or when the picture was drawn files only from the start and the rows' size was never laid out.
   */
  rowsPicture: PictureSize | null;
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
  rows: RowMotion[];
  /** Boxes whose height travels, clipped below; `across` keeps what stands out at their sides, as a card's rows' dots do. */
  heights?: Array<{ element: HTMLElement; from: number; to: number; across?: boolean }>;
  anchor?: DOMRect;
  /** The container that draws the pairs' lines in place of the symbols' wires until the move ends (the way back in from files only). */
  lines?: HTMLElement;
  /**
   * The element held still, when the caller chose it (the overview's files only, 2026-11-13), or null to hold nothing,
   * where the camera already moves to a frame of its own; else, when absent, the card acted on.
   */
  held?: HTMLElement | null;
}

/** What the page answered the scene's measurer that no start changes, kept so that the search can price a start without the page. */
interface PageAnswers {
  natural: Map<string, number>;
  heights: Map<string, number>;
  /** Each drawn directory's label height at its width, by directory. */
  labelHeights: Map<string, number>;
}

/** A picture's price as the search reads it, term by term: the page's signals, its ranking's two terms, and the totals. */
interface PricedRecord {
  signals: StartSignals;
  horizontal: number;
  returns: number;
  base: number;
  withChurn: number;
}

/** One cycle trial: its prices against the shown picture's, and whether it was adopted. */
interface CycleRecord {
  shown: number;
  predicted: PricedRecord;
  measured: PricedRecord | null;
  adopted: boolean;
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
  /**
   * The orders the picture's cycles offer, tried first (2026-11-16), and where the next trial is looked for; tried only
   * while the search searches at all. A cycle trial ranks the picture anew, so it is priced with what a ranking changes:
   * the wires' horizontal length and the Return Cost of every returning link, which `pictureScore` adds to every price
   * the order step, the search and the page's report name, so that all of them stand on one price.
   */
  cycleOrders: CycleTrial[];
  cycleNext: number;
  cyclesEnabled: boolean;
  cycleTried: number;
  cycleAdopted: number;
  returnCost: number;
  /** The opened directories' shape the picture stands in, which a cycle trial's ranking is laid out in too; none outside flow order. */
  shape: FlowShape | null;
  /**
   * Whether the cached rows hold the endpoints of every reference between two files, a returning one's too, which only
   * a cycle's trial needs: measured when the first is tried, in idle time, so that the first draw reads no endpoint
   * the search alone needs.
   */
  everyEndpoint: boolean;
  /** Each cycle trial's prices, predicted on the cached measurements and, when it went so far, measured on the page. */
  cycleRecords: CycleRecord[];
  /** The idle callback or timer waiting to run the next start; zero when none. */
  handle: number;
  /** Takes the next step when the page is idle; a move that ends calls it. */
  resume: () => void;
}

/** A stage for a root that holds nothing yet. */
export function createStage(root: HTMLElement): BranchStage {
  return { root, wrappers: new Map(), boxes: new Map(), shapes: new Map(), labels: new Map(), disclosures: new Map(), pose: null, move: null, search: null, flowShapes: new Map(), rowsPicture: null };
}

/** Ends whatever move the stage runs, where it stands, and its search; the stage's elements are the caller's to remove. */
export function dropStage(stage: BranchStage): void {
  stopSearch(stage);
  endMove(stage, false);
}

/**
 * The order the continuing search last adopted for each cycle this session, by the cycle's files and references
 * (2026-11-16): where the next picture holding that cycle starts, so that a person who pins on does not watch a cycle
 * turn back and forth. It is a start, not a verdict: the search judges it in the new picture like any other.
 */
const cycleMemory = new WeakMap<LocalViewController, Map<string, string[]>>();

/** The disclosure as the controller holds it, ranked with the cycles' orders given; the greedy order for any not given. */
function exploreWith(controller: LocalViewController, orders?: ReadonlyMap<string, readonly string[]>): Exploration {
  const { state, graphData } = controller.options;
  const tuning = state.tuning.localMap;
  return exploreBranches(state.selectedNode, graphData, controller.pins, node => controller.shouldIncludeNode(node), {
    symbolOrder: tuning.symbolOrder,
    ranking: { pull: tuning.rankingPull, tie: tuning.rankingTie, orders },
    membraneDepth: tuning.membraneDepth,
    openDirectories: controller.openDirectories,
    reading: state.reading,
    path: controller.getActivePath() ?? undefined,
    directoryFlow: tuning.directoryLayout === "flow"
  });
}

/**
 * The same canonical disclosure is used to build a scene and to recognize a text-only reading change. Its cycles stand in
 * the greedy order, or in the order this session last adopted for them; nothing is priced before the picture is drawn.
 */
function explorationOf(controller: LocalViewController): Exploration {
  const explored = exploreWith(controller);
  const memory = cycleMemory.get(controller);
  const remembered = explored.ranking.cycles.flatMap(cycle => {
    const order = memory?.get(cycle.key);
    return order && order.join("\0") !== cycle.order.join("\0") ? [[cycle.key, order] as const] : [];
  });
  return remembered.length ? exploreWith(controller, new Map(remembered)) : explored;
}

/** The scene's dials from the tuning; an opened directory in flow order stands its columns from the top (2026-11-12). */
const sceneTuningOf = (tuning: LocalMapTuning, flow: boolean): SceneTuning => ({
  columnGap: tuning.columnGap, itemGap: tuning.itemGap, bandGap: tuning.bandGap, neck: tuning.membraneNeck, bandPadding: tuning.membranePadding, cardMaxWidth: tuning.cardMaxWidth,
  evenness: tuning.membraneEvenness, levelness: tuning.rowLevelness, ...(flow ? { fromTop: true } : null)
});

/** What a picture's crossings, size, churn and shape cost, from the tuning. */
const startCostsOf = (tuning: LocalMapTuning): StartCosts => ({ crossing: tuning.crossingCost, height: tuning.heightCost, width: tuning.widthCost, churn: tuning.churnCost,
  evenness: tuning.membraneEvenness, levelness: tuning.rowLevelness, steps: tuning.membraneSimplicity });


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
  const change = (): void => {
    reading.updatePresentation();
    for (const { row, muted } of rows) row.classList.toggle("branch-symbol-muted", muted);
    search.exploration = next;
  };
  // A fold or a restore that shortens or lengthens a slot row (2026-11-13) changes its card's box: the same scene is laid
  // out again around the acted-on card held still, its rows, foot and height travelling together.
  if (reading.rowsChange()) refreshReadingGeometry(controller, stage, change, false);
  else change();
  return true;
}

/** Membership, not a learned arrangement or a raw list of reading choices, determines whether a scene is unchanged. */
function sameReadingScope(before: Exploration, after: Exploration): boolean {
  const links = (value: Exploration): Map<string, LocalEdge> => new Map(value.subgraph.links.map(edge => [edgeKey(edge), edge]));
  return sameMembers(before.subgraph.nodes.map(node => node.id), after.subgraph.nodes.map(node => node.id))
    && sameMap(links(before), links(after), (a, b) => a.referenceCount === b.referenceCount && a.direction === b.direction && a.gathered === b.gathered)
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

  const explored = explorationOf(controller);
  // Every drawn directory's label says what this picture makes of it; the labels already made are refilled.
  stage.disclosures = explored.directories;
  for (const [directory, label] of stage.labels) fillLabel(controller, label, directory, explored.directories.get(directory));
  root.classList.add("branch-mode", "local-placed");
  root.classList.toggle("path-mode", !!path);
  root.style.gridTemplateColumns = "";
  root.style.alignItems = "";
  const sceneTuning = sceneTuningOf(tuning, explored.flow);

  // The cards, once per render, each built afresh for this render's state inside the wrapper that stood for its file
  // before, or a new one; in the root to be measured, hosted by the chosen scene's boxes after. Each card keeps its
  // column wrapper: the page's hover rules, the router and the deck find a card through it. A closed directory's box
  // takes a wrapper of the same kind, by its path, and no card.
  const entering: HTMLElement[] = [];
  const kept = new Set<string>();
  for (const node of explored.subgraph.nodes) {
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
      // A render builds the box anew; the keyboard's focus on its handle or its More passes to the new one, so that a
      // render the person did not ask for (the continuing search's, a look's) does not take the handle from under them.
      const focused = wrapper.contains(document.activeElement) ? document.activeElement : null;
      wrapper.replaceChildren(createClosedDirectory(controller.cardContext, explored.closed.get(node.id)!));
      if (focused) wrapper.querySelector<HTMLElement>(focused.classList.contains("local-directory-actions") ? ".local-directory-actions" : ".local-directory-handle")?.focus({ preventScroll: true });
    } else {
      const card = createNodeCard(controller.cardContext, node, "center");
      card.classList.add("focus-node");
      card.classList.toggle("branch-member", explored.members.has(node.id));
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
  dressCards(controller, cardsOf(stage), explored);
  for (const [id, symbol] of [[path?.nodeIds[0], path?.fromSymbol], [path?.nodeIds[path.nodeIds.length - 1], path?.toSymbol]]) {
    if (!id || !symbol) continue;
    stage.wrappers.get(id)?.querySelectorAll<HTMLElement>(".symbol-row").forEach(row => {
      if (normalizeSymbolIdentifier(row.dataset.symbol) === normalizeSymbolIdentifier(symbol)) row.classList.add("symbol-pinned", "symbol-pinned-named");
    });
  }

  // The starts, each ordered, its rows stood on the cards, planned, measured on the page and placed; the cheapest
  // picture is kept. The page's answers that no start changes are kept for the search.
  const answers: PageAnswers = { natural: new Map(), heights: new Map(), labelHeights: new Map() };
  const costs = startCostsOf(tuning);
  // In flow order the opened directories stand in the shape the price chooses (2026-11-13), on the directories alone:
  // their own files unpinned under the filters, the lines among them and the tuning, every card at the nominal model's
  // size (`nominalMeasurer`), churn aside since no picture came before. No pin, no path the person took and no font
  // enters it, so the same link shows the same shape on every screen. It is chosen once for those directories, filters
  // and tuning, and reused while the page lives: a pin prices no shape, and the picture is then drawn and measured as ever.
  let exploration = explored;
  let shape: FlowShape | null = null;
  delete root.dataset.flowShape;
  delete root.dataset.flowShapes;
  delete root.dataset.flowShapeMs;
  if (explored.arrangement) {
    const key = JSON.stringify([[...controller.openDirectories].sort(), state.filters.showTests, state.filters.showAssets, tuning]);
    let chosenShape = stage.flowShapes.get(key);
    if (!chosenShape) {
      const shaping = performance.now();
      chosenShape = shapeOfDirectories(controller, sceneTuning, costs);
      stage.flowShapes.set(key, chosenShape);
      root.dataset.flowShapeMs = String(Math.round(performance.now() - shaping));
    }
    shape = chosenShape.shape;
    exploration = arrangeExploration(explored, shape);
    root.dataset.flowShape = JSON.stringify(shapeRecord(chosenShape.shape));
    root.dataset.flowShapes = JSON.stringify(chosenShape.priced.map(({ shape, price }) => ({ ...shapeRecord(shape), price: Math.round(price) })));
  }
  const ranked = exploration.ranking.columns.map(column => column.map(node => node.id));
  const starts = candidateStarts(tuning.orderStarts, tuning.orderSeed, controller.previousTops, ranked);
  const { chosen, outcomes } = layoutStarts(starts, start => {
    const branches = orderExploration(exploration, { sweeps: tuning.orderSweeps, ...startOrder(start) });
    orderRows(cardsOf(stage), branches.rows);
    const plan = planBranches(branches, sceneTuning.bandPadding);
    return { branches, scene: layoutScene(plan, branches, pageMeasurer(controller, stage, plan, scale, answers), sceneTuning) };
  }, costs, tuning.returnCost, controller.previousTops);
  const { branches, scene } = chosen;
  if (outcomes[outcomes.length - 1] !== chosen) orderRows(cardsOf(stage), branches.rows);
  // Drawn files only, the picture with its rows is laid out once more for its size, which Fit frames (2026-11-13).
  const rowsPicture = controller.getContainer().hasAttribute(OVERVIEW_FILES_ATTRIBUTE) ? rowsPictureOf(controller, stage, branches, sceneTuning, scale, answers.natural) : null;
  controller.branches = branches;
  controller.currentSubgraph = branches.subgraph;
  controller.previousTops = scene.tops;
  root.dataset.placementCost = String(scene.placement.cost);
  root.dataset.placementOptimal = String(scene.placement.optimal);
  root.dataset.orderStart = startName(chosen.start);
  root.dataset.orderStarts = String(outcomes.length);
  root.dataset.orderScore = String(chosen.score);
  root.dataset.orderSignals = JSON.stringify(chosen.signals);
  root.dataset.layoutMs = String(Math.round(performance.now() - started));

  const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const moveMs = reduced ? 0 : Math.max(0, tuning.moveMs);
  const measuredRows = rowsOf(controller, stage, scale, branches);
  showScene(controller, stage, scene, sceneTuning, previous ? moveMs : 0, leaving, entering, oldRows);
  stage.rowsPicture = rowsPicture;

  // The search over the seeds the first paint did not try, priced from the page's answers and each card's rows as they
  // now stand; a forced seed, the lab's lever, searches nothing.
  const from = tuning.orderSeed !== null ? 1 : Math.max(0, Math.floor(tuning.orderStarts)) + 1;
  const to = tuning.orderSeed !== null ? 0 : from - 1 + Math.max(0, Math.floor(tuning.searchStarts));
  const alignmentEnabled = to >= from && tuning.searchPatience > 0 && costs.steps > 0;
  const search: Search = {
    state: beginSearch({ from, to, patience: Math.floor(tuning.searchPatience) }, pictureScore(chosen.signals, { ...costs, churn: 0 }, tuning.returnCost, scene, branches)),
    cycleOrders: cycleOrdersOf(exploration.ranking.cycles), cycleNext: 0, cyclesEnabled: to >= from, cycleTried: 0, cycleAdopted: 0, returnCost: tuning.returnCost,
    shape, everyEndpoint: false, cycleRecords: [],
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
 * The shape the price chooses for the opened directories alone (2026-11-13): their files under the filters, with no
 * pin, no selected file and no reading, laid out on the nominal model at the cheapest of the starts the page tries from
 * nothing before, churn aside. A filter is the filters alone, with no exception for a pinned file, so that the shape
 * does not depend on what is pinned. It is priced by the signals alone (`scoreOf`), as it was chosen before cycles were
 * priced: the ranking's two terms of `pictureScore` are not part of this choice, which reports its prices only as the
 * shapes' own (`data-flow-shapes`).
 */
function shapeOfDirectories(controller: LocalViewController, sceneTuning: SceneTuning, costs: StartCosts): ShapeSearch {
  const { state, graphData } = controller.options;
  const tuning = state.tuning.localMap;
  const filtered = (node: ExplorerNodePayload): boolean => {
    const archetype = (node.archetype || "").toLowerCase();
    return !(archetype === "test" && !state.filters.showTests) && !(archetype === "asset" && !state.filters.showAssets);
  };
  const own = exploreBranches(null, graphData, EMPTY_PIN_SET, filtered, {
    symbolOrder: tuning.symbolOrder, ranking: { pull: tuning.rankingPull, tie: tuning.rankingTie }, membraneDepth: tuning.membraneDepth,
    openDirectories: controller.openDirectories, directoryFlow: true
  });
  const input = own.arrangement;
  const boxes = new Set(own.closed.keys());
  const price = (shape: FlowShape): number => {
    const laid = arrangeExploration(own, shape);
    let best = Infinity;
    for (const start of candidateStarts(tuning.orderStarts, tuning.orderSeed, null, laid.ranking.columns.map(column => column.map(node => node.id)))) {
      const branches = orderExploration(laid, { sweeps: tuning.orderSweeps, ...startOrder(start) });
      const plan = planBranches(branches, sceneTuning.bandPadding);
      const scene = layoutScene(plan, branches, nominalMeasurer(plan.items.keys(), id => boxes.has(id)), sceneTuning);
      best = Math.min(best, scoreOf(signalsOf(branches, scene, null), { ...costs, churn: 0 }));
    }
    return best;
  };
  return input ? searchFlowShape(input, price) : { shape: NARROW_SHAPE, price: 0, priced: [] };
}

/**
 * Remeasure an existing scene after a disclosure change without rebuilding cards or changing row order: the zoom
 * fold or restore, a resize, or an arrival that unfolds. The opened or folded text changes card heights, so the
 * same branches are laid out again and moved to with the acted-on element held still, and a fresh measured
 * competition begins from the new picture.
 */
export function refreshReadingGeometry(controller: LocalViewController, stage: BranchStage, change: () => void, restart = true,
  options: { held?: HTMLElement | null; moveMs?: number; keepWidths?: boolean } = {}): void {
  const search = stage.search;
  const previous = stage.pose;
  if (!search || !previous) { change(); return; }
  pauseSearch(search);
  const filesBefore = controller.getContainer().hasAttribute(OVERVIEW_FILES_ATTRIBUTE), shownBefore = stage.move?.to ?? previous;
  const scale = controller.mapTransform.k || 1;
  const rows = rowOffsets(stage, scale);
  const fileCards = cardsOf(stage).filter(card => card.classList.contains("node-card"));
  const beforeHeights = new Map(fileCards.map(card => [card.dataset.id!, card.getBoundingClientRect().height / scale]));
  const gridOf = (card: HTMLElement): HTMLElement | null => card.querySelector<HTMLElement>(".symbol-grid");
  const held = options.held === null ? null : options.held?.isConnected ? options.held : undefined;
  const anchor = held === null ? undefined : (held ?? elementHeld(controller, stage, previous, previous))?.getBoundingClientRect();
  endMove(stage, false);
  change();
  controller.reading?.measure();
  const branches = search.incumbent.branches;
  const plan = planBranches(branches, search.sceneTuning.bandPadding);
  const answers: PageAnswers = { natural: new Map(), heights: new Map(), labelHeights: new Map() };
  // A change between the overview's two layouts keeps every card's width (2026-11-13): the widths measured before stand,
  // without laying the page out twice more to measure them again.
  const measurer = pageMeasurer(controller, stage, plan, scale, answers);
  if (options.keepWidths) { const natural = search.answers.natural; measurer.widths = () => (answers.natural = natural); }
  const scene = layoutScene(plan, branches, measurer, search.sceneTuning);
  stage.root.dataset.placementCost = String(scene.placement.cost);
  stage.root.dataset.placementOptimal = String(scene.placement.optimal);
  search.incumbent = { branches, scene };
  search.answers = answers;
  search.rows = rowsOf(controller, stage, scale, branches, search.everyEndpoint);
  // A fold or a restore of a slot row (2026-11-13) keeps the search where it stood, so that nothing but the acted-on card
  // and what it pushes moves after the person's own act; a resize or an arrival begins a fresh competition. Either way
  // the shown picture is priced again, its cards' heights having changed: a search still running would otherwise judge
  // its next starts against the price of a picture no longer shown, and a shortened card could let a worse one in.
  const shown = pictureScore(signalsOf(branches, scene, scene.tops), { ...search.costs, churn: 0 }, search.returnCost, scene, branches);
  if (restart) {
    const options = controller.options.state.tuning.localMap;
    search.state = beginSearch({ from: 1, to: Math.max(0, Math.floor(options.searchStarts)), patience: Math.floor(options.searchPatience) }, shown);
    search.alignments = search.alignmentEnabled ? alignmentCandidates(scene) : [];
    search.alignmentIndex = 0;
    search.cycleNext = 0;
  } else search.state = { ...search.state, shown, best: shown };
  controller.previousTops = scene.tops;
  const filesAfter = controller.getContainer().hasAttribute(OVERVIEW_FILES_ATTRIBUTE), back = filesBefore && !filesAfter;
  // Back in from files only (2026-11-13) a card grows by its rows: its rows' grid grows from what keeps the card's height
  // where it stood, clipped below, and its foot follows the grid in the card's own flow, as in a fold its foot follows
  // its rows; elsewhere the card's box travels between its two heights.
  const heights: NonNullable<Move["heights"]> = fileCards.flatMap(card => {
    const from = beforeHeights.get(card.dataset.id!), to = card.offsetHeight, grid = back ? gridOf(card) : null;
    if (from === undefined || Math.abs(from - to) <= 0.5) return [];
    if (!grid) return [{ element: card, from, to }];
    const rowsTo = grid.offsetHeight;
    return [{ element: grid, from: Math.max(0, Math.min(rowsTo, from - (to - rowsTo))), to: rowsTo, across: true }];
  });
  const growing = new Set(heights.filter(entry => entry.across).map(entry => entry.element.closest<HTMLElement>(".node-card")));
  // The picture with its rows keeps its size for Fit while files only stands in for it.
  if (!filesAfter) stage.rowsPicture = null;
  else if (!filesBefore) stage.rowsPicture = { width: shownBefore.pictureWidth, height: shownBefore.pictureHeight };
  else stage.rowsPicture = rowsPictureOf(controller, stage, branches, search.sceneTuning, scale, search.answers.natural);
  const moveMs = options.moveMs ?? Math.min(180, search.moveMs);
  showScene(controller, stage, scene, search.sceneTuning, moveMs, [], [], rows, { heights, anchor, held,
    ...(back && moveMs > 0 ? { lines: controller.getContainer() } : null) }, growing);
  if (!stage.move) scheduleSearch(controller, stage);
}

/**
 * The size of the picture with its rows, for Fit while files only is shown (2026-11-13): the same branches laid out once
 * with the rows, at the widths measured before, and files only drawn again after.
 */
function rowsPictureOf(controller: LocalViewController, stage: BranchStage, branches: BranchGraph, sceneTuning: SceneTuning, scale: number, natural: ReadonlyMap<string, number>): PictureSize {
  const container = controller.getContainer();
  container.removeAttribute(OVERVIEW_FILES_ATTRIBUTE);
  controller.reading?.measure();
  const plan = planBranches(branches, sceneTuning.bandPadding);
  const measurer = pageMeasurer(controller, stage, plan, scale, { natural: new Map(), heights: new Map(), labelHeights: new Map() });
  measurer.widths = () => natural;
  const scene = layoutScene(plan, branches, measurer, sceneTuning);
  container.setAttribute(OVERVIEW_FILES_ATTRIBUTE, "");
  controller.reading?.measure();
  return { width: scene.pictureWidth, height: scene.pictureHeight };
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
    // The strip's height is the layout's constant, and what it holds the handle's line and largest held scale.
    label.style.height = `${HANDLE_STRIP}px`;
    label.style.setProperty("--dir-line", String(HANDLE_LINE));
    label.style.setProperty("--dir-hold", String(HANDLE_HOLD));
    label.style.setProperty("--dir-floor", String(HANDLE_FLOOR));
    label.style.setProperty("--dir-strip", String(HANDLE_STRIP));
    label.style.setProperty("--dir-air", String(HANDLE_AIR));
    fillLabel(controller, label, directory, stage.disclosures.get(directory));
    stage.root.append(label);
    stage.labels.set(directory, label);
  }
  return label;
}

/**
 * A drawn directory's label is its handle (2026-11-15): one button, a disclosure chevron, pointing down on an opened
 * directory and right on one drawn only around what the pins need, then its name; a press closes or opens it, and the
 * button says the act and is the keyboard's stop, its focus ring around the chevron and the name together. The name
 * is the parent's path, muted, which gives way first and from its start, and the directory's own name, which is cut
 * last; while the directory is encasing, what it hides follows, "+3 files, 1 directory", drawn whole or not at all,
 * or, with Tuning's Hidden Files at Cells (a trial of 2026-11-17), a closed directory's cell or small skin for each
 * thing hidden, beside the handle and before More, which give way after the parent's path and before the name
 * (`createHiddenCells` in card-factory.ts; the count's words then stand in the handle's hover text and description).
 * More and the ancestry control stand after it and never give way; the evidence reader is behind More. It is one line
 * in a strip of constant height (`directory-handle.ts`), so the layout never waits on its text, and from the middle
 * band out the whole line is held at the file names' size, which the strip is tall enough for (local.css).
 */
function fillLabel(controller: LocalViewController, label: HTMLElement, directory: string, disclosure: DirectoryDisclosure | undefined): void {
  const open = disclosure?.state === "open";
  const act = open ? "Close" : "Open";
  const toggle = (): void => { if (open) controller.options.onCloseDirectory(directory); else controller.options.onOpenDirectory(directory); };
  const handle = document.createElement("button");
  handle.type = "button";
  handle.className = `local-directory-handle ${open ? "local-directory-close" : "local-directory-open"}`;
  handle.setAttribute("aria-label", `${act} ${directory}`);
  handle.setAttribute("aria-expanded", String(open));
  handle.title = open ? `Close ${directory}; what other pins need stays` : `Open ${directory}: show the files and subdirectories inside`;
  handle.addEventListener("click", event => { event.stopPropagation(); toggle(); });
  // The button's one line, which clips what does not fit: the chevron, the parent's path, the directory's own name, and
  // what an encasing directory hides. The parent's path is drawn right to left so that its cut falls at its start, with
  // a left-to-right mark at each end so that a leading dot and the closing slash keep their places (2026-11-06).
  const caption = document.createElement("span");
  caption.className = "local-directory-caption";
  caption.innerHTML = chevronMarkup(open);
  const { parent, leaf } = handleParts(directory);
  if (parent) {
    const path = document.createElement("span");
    path.className = "local-directory-parent";
    path.textContent = `\u200e${parent}\u200e`;
    caption.append(path);
  }
  const own = document.createElement("span");
  own.className = "local-directory-leaf";
  own.textContent = leaf;
  caption.append(own);
  // What an encasing directory hides: the count's words in the caption, or, with Hidden Files' cells (2026-11-17), a
  // mark for each beside the handle, never inside it, so that a press on a mark does not also open or close the
  // directory, the count's words moving to the handle's hover text and description; with the cells under the name, the
  // same marks in the strip's free height under the line at the reading look, and beside the name from the connections
  // look out (local.css shows the one or the other).
  let cells: HTMLElement | null = null, field: HTMLElement | null = null, words: HTMLElement | null = null;
  const look = controller.options.state.tuning.localMap.hiddenFiles;
  if (!open && disclosure && (disclosure.hiddenFiles || disclosure.hiddenDirectories)) {
    const counted = `+${countsOf(disclosure.hiddenFiles, disclosure.hiddenDirectories)}`;
    if (look !== "count") {
      handle.title = `${handle.title}\n${counted}`;
      handle.setAttribute("aria-description", counted);
      const style = controller.cardContext.closedStyle?.() ?? { look: "cells", shape: "tab", cells: "kind" } as const;
      const actions = { pin: (file: string) => controller.pinFromHandle(file, directory), open: (path: string) => controller.options.onOpenDirectory(path) };
      cells = createHiddenCells(directory, disclosure.hidden, style, actions);
      if (look === "under") field = createHiddenField(directory, disclosure.hidden, style, actions);
      // The count's words, laid out unseen in the line's own type, for the room the marks may claim against the parent's
      // path (writeHandleNeeds): the marks stand in the count's room, and cost the path no more than its words did.
      words = document.createElement("span");
      words.className = "local-directory-cells-words";
      words.setAttribute("aria-hidden", "true");
      words.textContent = counted;
    } else {
      const hidden = document.createElement("span");
      hidden.className = "local-directory-more";
      hidden.textContent = counted;
      caption.append(hidden);
    }
  }
  handle.append(caption);
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
  controls.append(more, ancestryButton(controller, directory));
  const row = document.createElement("span");
  row.className = "local-directory-row";
  row.classList.toggle("local-directory-row--cells", !!cells);
  row.append(handle, ...(cells ? [cells] : []), controls, ...(words ? [words] : []));
  if (field) label.dataset.hiddenLook = "under"; else delete label.dataset.hiddenLook;
  // A label survives renders but its buttons are made anew: the keyboard's focus passes to the new handle, More, or the
  // mark for the same file or directory in the line or the field it was in, which then keeps that toolbar's stop.
  const focused = label.contains(document.activeElement) ? document.activeElement as HTMLElement : null;
  const toolbar = focused?.closest(".local-directory-field") ? field : cells;
  label.replaceChildren(row, ...(field ? [field] : []));
  label.style.removeProperty("--dir-need");
  label.style.removeProperty("--dir-name");
  label.style.removeProperty("--cells-words");
  if (!focused) return;
  // A mark pressed and gone, its file now a card, passes the focus to the mark that stands in its place, else the last.
  const marks = [...(toolbar?.querySelectorAll<HTMLButtonElement>(".local-directory-cell") ?? [])];
  const mark = focused.dataset.path === undefined ? null
    : marks.find(each => each.dataset.path === focused.dataset.path) ?? marks[Math.min(Number(focused.dataset.mark ?? 0), marks.length - 1)] ?? null;
  if (mark) { for (const other of marks) other.tabIndex = other === mark ? 0 : -1; }
  (mark ?? (focused.classList.contains("local-directory-actions") ? more : handle)).focus({ preventScroll: true });
}

/**
 * What a handle's line needs across, in the line's own units, read once from the label as laid out, after it is filled,
 * and written for the stylesheet. `--dir-name`: the chevron and the directory's own name whole, from which the
 * stylesheet brings the held line down in size before the name is cut, as a closed box's name is (2026-11-16, when
 * "Pay…" stood cut at the overview look's full size). `--dir-need`: the same and the count of what the directory hides
 * with the air before it; the stylesheet draws the count only where the line's room holds this beside More: a count is
 * drawn whole or not at all (the owner's rule for counts of 2026-11-13), and one that the line's wrapping has sent out
 * of sight is then not drawn in fact, not merely clipped. `--cells-words`, with Hidden Files' cells: the count's words
 * and the air before them as the count would stand in this line, unrounded, the room the marks claim against the
 * parent's path (the root's rule of 2026-11-17: the marks stand in the count's room, and cost the path no more than its
 * words did; local.css).
 */
function writeHandleNeeds(label: HTMLElement): void {
  const count = label.querySelector<HTMLElement>(".local-directory-more"), leaf = label.querySelector<HTMLElement>(".local-directory-leaf");
  if (!leaf || !leaf.scrollWidth) return;
  if (!label.style.getPropertyValue("--dir-name")) label.style.setProperty("--dir-name", String(HANDLE_INDENT + leaf.scrollWidth));
  const words = label.querySelector<HTMLElement>(".local-directory-cells-words"), row = label.querySelector<HTMLElement>(".local-directory-row");
  if (words && row && !label.style.getPropertyValue("--cells-words")) {
    // Read in the line's own units: the drawn width over the scale the row and the camera draw it at.
    const drawn = row.getBoundingClientRect().width, own = parseFloat(getComputedStyle(row).width);
    if (drawn > 0 && own > 0) label.style.setProperty("--cells-words", (words.getBoundingClientRect().width * own / drawn + (parseFloat(getComputedStyle(words).marginLeft) || 0)).toFixed(3));
  }
  if (label.style.getPropertyValue("--dir-need") || !count || !count.offsetWidth) return;
  label.style.setProperty("--dir-need", String(Math.ceil(HANDLE_INDENT + leaf.scrollWidth + count.offsetWidth + (parseFloat(getComputedStyle(count).marginLeft) || 0))));
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
      // A card's width is its rows' at every look: files only at the overview (2026-11-13) keeps each card's width and its
      // column, so its rows are laid out for the measure and silenced again after it.
      const container = controller.getContainer(), files = container.getAttribute(OVERVIEW_FILES_ATTRIBUTE);
      if (files !== null) container.removeAttribute(OVERVIEW_FILES_ATTRIBUTE);
      for (const wrapper of stage.wrappers.values()) Object.assign(wrapper.style, { width: "max-content", maxWidth: cardMaxWidth === null ? "" : `${cardMaxWidth}px` });
      const widths = new Map<string, number>();
      for (const [id, wrapper] of stage.wrappers) widths.set(id, naturalWidthOf(wrapper, scale));
      if (files !== null) container.setAttribute(OVERVIEW_FILES_ATTRIBUTE, files);
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
      for (const key of labelWidths.keys()) {
        const directory = boxes.get(key)!.directory;
        const height = labelFor(controller, stage, directory).offsetHeight;
        labelHeights.set(key, height);
        answers.labelHeights.set(directory, height);
      }
      answers.heights = heights;
      // With files only at the overview every wire is laid out between the two cards' node-level hubs, as Flow's lines are.
      const filesOnly = controller.getContainer().hasAttribute(OVERVIEW_FILES_ATTRIBUTE);
      const pin = (id: string, direction: "inbound" | "outbound", symbol: string | undefined): number | null => {
        const anchor = controller.getAnchor(id, "center", direction, filesOnly ? NODE_HUB : symbol);
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
function answersMeasurer(search: Search, plan: ScenePlan, branches: BranchGraph, heights: ReadonlyMap<string, number> = search.answers.heights): SceneMeasurer {
  const boxes = new Map(plan.boxes.map(box => [box.key, box]));
  return {
    widths: () => search.answers.natural,
    measure: (_cardWidths, labelWidths) => ({
      heights,
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
function showScene(controller: LocalViewController, stage: BranchStage, scene: Scene, sceneTuning: SceneTuning, moveMs: number, leavingCards: HTMLElement[], enteringCards: HTMLElement[], oldRows: Map<string, Map<string, number>> | null, reading: Pick<Move, "heights" | "anchor" | "held" | "lines"> = {}, footFlows: ReadonlySet<HTMLElement | null> = new Set()): void {
  const { root } = stage;
  const previous = stage.pose;
  const pose = scenePose(scene);
  const instantHeld = previous && moveMs <= 0 && reading.held !== null ? reading.held ?? elementHeld(controller, stage, previous, pose) : null;
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
  // A foot that follows its growing rows in the card's own flow needs no motion of its own.
  const rows = (oldRows ? rowMotions(stage, oldRows, scale) : []).filter(motion => !(motion.foot && footFlows.has(motion.element.parentElement)));
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
    if (label && box.segments.length) {
      label.style.top = `${box.segments[0].top - box.top + box.inset}px`;
      // What stands in the membrane, as placed: the handle reaches over its strip's columns and on over level columns that are clear under it.
      const standing: Standing[] = [...pose.items.values()].filter(item => item.host === box.key).map(item => ({ left: item.left, right: item.left + item.width, top: item.top }));
      for (const other of pose.boxes.values()) if (other.host === box.key) standing.push(...other.segments);
      const width = Math.max(0, handleReach(box.segments, box.stripColumns, box.inset + HANDLE_STRIP, standing) - 2 * box.inset);
      label.style.width = `${width}px`;
      label.style.setProperty("--dir-inset", String(box.inset));
      label.style.setProperty("--dir-room", String(width));
      writeHandleNeeds(label);
    }
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
 * redrawn to the frame (their glow, whose filters had cost more than
 * everything else in a frame, six frames a second with them and sixty
 * without on 31 cards and 172 wires on 2026-10-07, was first left out while
 * a move ran and then, on 2026-11-15, deleted from the wires altogether). The
 * stage's pose follows the frames, so a render that interrupts the move
 * starts from what the page shows. The root says `data-moving` throughout,
 * for whoever reads the page, and the search waits for the move to end.
 */
function startMove(controller: LocalViewController, stage: BranchStage, from: Pose, to: Pose, duration: number, move: Move): void {
  const { root } = stage;
  root.dataset.moving = "true";
  applyPose(stage, tweenPose(from, to, 0), move.bandPadding);
  for (const element of move.entering) element.style.opacity = "0";
  for (const motion of move.rows) shiftRow(motion, motion.delta);
  let heldId = controller.lastInteracted;
  let heldSymbol = controller.lastInteractedSymbol;
  const heldOf = (): HTMLElement | null => (move.held === null ? null : move.held ?? elementHeld(controller, stage, from, to));
  let heldElement = heldOf();
  let heldRect = move.anchor ?? heldElement?.getBoundingClientRect() ?? null;
  const cameraAtStart = { ...controller.mapTransform };
  const layerTop = (): number => controller.getViewport().getBoundingClientRect().top + (controller.getContainer().parentElement?.offsetTop ?? 0);
  let layerTopAtStart = layerTop();
  for (const { element, from, across } of move.heights ?? []) {
    element.style.height = `${from}px`;
    element.style.overflow = across ? "visible clip" : "clip";
  }
  move.lines?.setAttribute(OVERVIEW_LINES_ATTRIBUTE, "");
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
        heldElement = heldOf();
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
    for (const motion of move.rows) shiftRow(motion, motion.delta * (1 - eased));
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
  for (const motion of move.rows) {
    shiftRow(motion, null);
    motion.element.classList.remove("local-row-moving");
  }
  for (const { element } of move.heights ?? []) { element.style.height = ""; element.style.overflow = ""; }
  move.lines?.removeAttribute(OVERVIEW_LINES_ATTRIBUTE);
  if (finished) {
    applyPose(stage, move.to, move.bandPadding);
    stage.pose = move.to;
  }
  delete stage.root.dataset.moving;
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
  if (!search || !nextTrialKind(search.state, search.alignmentIndex < search.alignments.length, search.preferAlignment, cyclePending(search)) || stage.move || search.handle) return;
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
  // Files only at the overview is the same branches drawn compact: the search waits for the rows' picture to return.
  && !controller.getContainer().hasAttribute(OVERVIEW_FILES_ATTRIBUTE)
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

/** Whether a cycle's order is left to try: the search searches, and some order is not the one its cycle stands in. */
const cyclePending = (search: Search): boolean =>
  search.cyclesEnabled && nextCycleTrial(search.cycleOrders, standingOrders(search.exploration.ranking.cycles), search.cycleNext) !== null;

/** A picture's price as the search compares it: the page's own, churn counted or aside, and what its ranking adds. */
const searchPrice = (search: Search, branches: BranchGraph, scene: Scene, previousTops: ReadonlyMap<string, number> | null, churn: boolean): number =>
  pictureScore(signalsOf(branches, scene, previousTops), churn ? search.costs : { ...search.costs, churn: 0 }, search.returnCost, scene, branches);

/**
 * One idle trial: a cycle's other order first, then the next ordering seed or a join of the incumbent's flat boundary
 * runs. A cycle's order comes first because it changes the ranking, the columns every other trial orders within, and
 * the seeds and joins then refine what stands (2026-11-16). Cached measurements price the trial against the shown
 * picture; a predicted improvement is measured again before the final decision.
 */
function searchStep(controller: LocalViewController, stage: BranchStage, search: Search): void {
  const kind = nextTrialKind(search.state, search.alignmentIndex < search.alignments.length, search.preferAlignment, cyclePending(search));
  if (!kind) return;
  if (kind === "cycle") { cycleStep(controller, stage, search); writeSearch(stage); return; }
  search.preferAlignment = kind === "seed";
  const seed = search.state.next;
  const alignments = kind === "alignment" ? search.alignments[search.alignmentIndex++] : [];
  const branches = kind === "alignment" ? search.incumbent.branches : orderExploration(search.exploration, { sweeps: search.sweeps, seed });
  if (kind === "alignment") search.alignmentTried++;
  const plan = planBranches(branches, search.sceneTuning.bandPadding);
  const scene = layoutScene(plan, branches, answersMeasurer(search, plan, branches), search.sceneTuning, alignments);
  const priced = searchPrice(search, branches, scene, controller.previousTops, true);
  const judge = kind === "alignment" ? judgeAlignment : judgeStart;
  const { state, adopt } = judge(search.state, priced, searchPrice(search, branches, scene, controller.previousTops, false));
  if (adopt) {
    const adopted = tryAdoptPicture(controller, stage, search, branches, kind === "seed" ? `seed ${seed}` : stage.root.dataset.orderStart ?? "ranked", priced, alignments, kind);
    if (adopted && kind === "alignment") search.alignmentAdopted++;
  } else search.state = state;
  writeSearch(stage);
}

/**
 * A cycle's trial: the picture ranked with one cycle standing in another of its orders, in the shape the picture stands
 * in, ordered from the shown picture's own order where its files allow (so that the move's churn is what the ranking
 * makes it), laid out on the cached measurements and judged as a join is: adopted when its price with its churn is below
 * the shown picture's, without spending the seeds' patience.
 */
function cycleStep(controller: LocalViewController, stage: BranchStage, search: Search): void {
  if (!search.everyEndpoint) {
    search.rows = rowsOf(controller, stage, controller.runtime.mapTransform.k || 1, search.incumbent.branches, true);
    search.everyEndpoint = true;
  }
  const step = nextCycleTrial(search.cycleOrders, standingOrders(search.exploration.ranking.cycles), search.cycleNext)!;
  search.cycleNext = step.next;
  search.cycleTried++;
  const orders = standingOrders(search.exploration.ranking.cycles);
  orders.set(step.trial.key, step.trial.order);
  const explored = exploreWith(controller, orders);
  const exploration = search.shape ? arrangeExploration(explored, search.shape) : explored;
  const ranked = exploration.ranking.columns.map(column => column.map(node => node.id));
  const starts = candidateStarts(0, null, controller.previousTops, ranked);
  const branches = orderExploration(exploration, { sweeps: search.sweeps, ...startOrder(starts[starts.length - 1]) });
  const plan = planBranches(branches, search.sceneTuning.bandPadding);
  const scene = layoutScene(plan, branches, answersMeasurer(search, plan, branches, footedHeights(controller, stage, search, exploration)), search.sceneTuning);
  const predicted = pricedRecord(search, branches, scene, controller.previousTops);
  const record: CycleRecord = { shown: search.state.shown, predicted, measured: null, adopted: false };
  search.cycleRecords.push(record);
  const { state, adopt } = judgeAlignment(search.state, predicted.withChurn, predicted.base);
  if (!adopt) { search.state = state; return; }
  record.adopted = tryAdoptPicture(controller, stage, search, branches, `cycle ${search.cycleTried}`, predicted.withChurn, [], "cycle", { exploration, orders, record });
  if (record.adopted) search.cycleAdopted++;
}

/**
 * The cached card heights as a cycle's trial would stand them: a card whose foot on returning connections the trial
 * adds, takes away or words anew is as much taller or shorter as that card itself measures (`footChange`), in idle
 * time, so that the prediction prices the trial's own cards.
 */
function footedHeights(controller: LocalViewController, stage: BranchStage, search: Search, trial: Exploration): ReadonlyMap<string, number> {
  const drawn = (edge: LocalEdge): boolean => drawsReference((nodeId, role, direction, symbol) => controller.getAnchor(nodeId, role, direction, symbol), edge);
  const feet = (exploration: Exploration): Map<string, string> =>
    new Map([...returningConnections(exploration.subgraph.links, edge => exploration.ranking.back.has(edgeKey(edge)), drawn).byFile]
      .filter(([, back]) => back.length).map(([id, back]) => [id, returnsWording(back)]));
  const before = feet(search.exploration), after = feet(trial);
  const changed = [...new Set([...before.keys(), ...after.keys()])].filter(id => before.get(id) !== after.get(id));
  if (!changed.length) return search.answers.heights;
  const cards = new Map(cardsOf(stage).map(card => [card.dataset.id, card]));
  const heights = new Map(search.answers.heights);
  for (const id of changed) {
    const height = heights.get(id), card = cards.get(id);
    if (height !== undefined && card) heights.set(id, height + footChange(controller, card, after.get(id) ?? null));
  }
  return heights;
}

/**
 * How much taller, or shorter, a card would stand with the foot a trial gives it, its words or none, than it stands
 * now: the element the page dresses, set on that card and taken away again. A foot's room is the card's own. On
 * `branches.ts` opened whole it is 20 px on twenty-seven cards and 21 on eleven; until 2026-11-17 it was measured once
 * per search, on the first card without a foot, and used for every card, and when a new reference changed which card
 * came first the search's prediction of a trial stood 7 px from the layout lab's walk in its unevenness.
 */
function footChange(controller: LocalViewController, card: HTMLElement, wording: string | null): number {
  const standing = card.offsetHeight;
  const note = card.querySelector<HTMLElement>(":scope > .local-back-references");
  if (note) {
    const worded = note.textContent, next = note.nextSibling;
    if (wording === null) note.remove(); else note.textContent = wording;
    const change = card.offsetHeight - standing;
    if (wording === null) card.insertBefore(note, next); else note.textContent = worded;
    return change;
  }
  if (wording === null) return 0;
  const probe = document.createElement(controller.reading ? "button" : "span");
  probe.className = "local-disclosure local-back-references";
  probe.textContent = wording;
  card.insertBefore(probe, card.querySelector(":scope > [data-outside]"));
  const change = card.offsetHeight - standing;
  probe.remove();
  return change;
}

/** A picture's price as the search compares it, term by term. */
function pricedRecord(search: Search, branches: BranchGraph, scene: Scene, previousTops: ReadonlyMap<string, number> | null): PricedRecord {
  return { signals: signalsOf(branches, scene, previousTops), horizontal: horizontalWire(scene, branches), returns: returningLinks(branches),
    base: searchPrice(search, branches, scene, previousTops, false), withChurn: searchPrice(search, branches, scene, previousTops, true) };
}

/** Measures a promising candidate on the page and accepts it only if its actual complete price improves the picture. */
function tryAdoptPicture(controller: LocalViewController, stage: BranchStage, search: Search, branches: BranchGraph, name: string, priced: number,
  alignments: readonly BoundaryAlignment[], kind: "seed" | "alignment" | "cycle", cycle?: { exploration: Exploration; orders: ReadonlyMap<string, readonly string[]>; record: CycleRecord }): boolean {
  const { root } = stage;
  const scale = controller.runtime.mapTransform.k || 1;
  const oldRows = rowOffsets(stage, scale);
  orderRows(cardsOf(stage), branches.rows);
  // A cycle's order returns other references: each card's foot is the trial's before the cards are measured.
  if (cycle) dressReturns(controller, cardsOf(stage), cycle.exploration);
  const plan = planBranches(branches, search.sceneTuning.bandPadding);
  const answers: PageAnswers = { natural: new Map(), heights: new Map(), labelHeights: new Map() };
  const scene = layoutScene(plan, branches, pageMeasurer(controller, stage, plan, scale, answers), search.sceneTuning, alignments);
  const signals = signalsOf(branches, scene, controller.previousTops);
  const measured = searchPrice(search, branches, scene, controller.previousTops, false);
  const actual = searchPrice(search, branches, scene, controller.previousTops, true);
  const judge = kind === "seed" ? judgeStart : judgeAlignment;
  if (cycle) cycle.record.measured = pricedRecord(search, branches, scene, controller.previousTops);
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
    if (cycle) dressReturns(controller, cardsOf(stage), search.exploration);
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
  if (cycle) {
    search.exploration = cycle.exploration;
    const memory = cycleMemory.get(controller) ?? cycleMemory.set(controller, new Map()).get(controller)!;
    for (const [key, order] of cycle.orders) memory.set(key, [...order]);
  }
  search.alignments = search.alignmentEnabled ? alignmentCandidates(scene) : [];
  search.alignmentIndex = 0;
  search.rows = rowsOf(controller, stage, scale, branches, search.everyEndpoint);
  controller.branches = branches;
  controller.currentSubgraph = branches.subgraph;
  controller.previousTops = scene.tops;
  root.dataset.placementCost = String(scene.placement.cost);
  root.dataset.placementOptimal = String(scene.placement.optimal);
  root.dataset.orderStart = name;
  // The adopted picture's price as the search measured it, its ranking's two terms included, as its prediction is.
  root.dataset.orderScore = String(actual);
  root.dataset.orderSignals = JSON.stringify(signals);
  root.dataset.searchPriced = String(priced);
  showScene(controller, stage, scene, search.sceneTuning, search.moveMs, [], [], oldRows);
  return true;
}

/** What the search has done, on the root, for whoever reads the page: no text announces it. */
function writeSearch(stage: BranchStage): void {
  const search = stage.search;
  if (!search) return;
  const { state } = search;
  stage.root.dataset.searchStatus = search.alignmentIndex < search.alignments.length || cyclePending(search) ? "running" : state.status;
  stage.root.dataset.searchCycleTried = String(search.cycleTried);
  stage.root.dataset.searchCycleAdopted = String(search.cycleAdopted);
  stage.root.dataset.searchEndpoints = search.everyEndpoint ? "every" : "drawn";
  stage.root.dataset.searchCycleTrials = JSON.stringify(search.cycleRecords);
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
function rowsOf(controller: LocalViewController, stage: BranchStage, scale: number, branches: BranchGraph, everyEndpoint = false): Map<string, CardRows> {
  const measured = new Map<string, CardRows>();
  const requests = new Map<string, Map<string, { direction: "inbound" | "outbound"; symbol: string | undefined }>>();
  const request = (id: string, direction: "inbound" | "outbound", symbol: string | undefined): void => {
    const endpoints = requests.get(id) ?? new Map<string, { direction: "inbound" | "outbound"; symbol: string | undefined }>();
    endpoints.set(endpointKey(direction, symbol), { direction, symbol });
    requests.set(id, endpoints);
  };
  // The drawn wires' endpoints; with `everyEndpoint`, a returning reference's too, which a cycle's trial may rank forward
  // and draw (2026-11-16): the search asks for them when it first tries a cycle's order, not the first draw.
  for (const edge of branches.subgraph.links) {
    if (edge.sourceId === edge.targetId || (!everyEndpoint && branches.back.has(edgeKey(edge)))) continue;
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
      // A row with a box of its own is read by that box, which is its allotment whatever stands in it: a slot row is as
      // tall as its slot lines and a short row as its head (2026-11-13), while their children may be hidden, taken out
      // or drawn smaller. Read through its children, a short row, whose slot is taken out, was found shorter than it
      // stands, every row below it was predicted too high, and the search priced its trials against pins the page does
      // not have (found 2026-11-14). A legacy `display: contents` row has no box and is read through its children as
      // laid out, a held dot's shift and scale taken back.
      const bounds = getComputedStyle(row).display === "contents" ? rowBounds([...row.children].flatMap(child => {
        const rect = child.getBoundingClientRect();
        if (!rect.width && !rect.height) return [];
        const style = getComputedStyle(child), box = laidOutBox(child, scale);
        return [{ top: onLayoutGrid((box.top - cardTop) / scale), bottom: onLayoutGrid((box.bottom - cardTop) / scale),
          marginTop: Number.parseFloat(style.marginTop) || 0, marginBottom: Number.parseFloat(style.marginBottom) || 0 }];
      })) : ownBounds(row, cardTop, scale);
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

/** A boxed row's own extent from its card's top, in the picture's pixels on the layout's grid; null when it is not laid out. */
function ownBounds(row: HTMLElement, cardTop: number, scale: number): { top: number; bottom: number } | null {
  const rect = row.getBoundingClientRect();
  if (!rect.width && !rect.height) return null;
  return { top: onLayoutGrid((rect.top - cardTop) / scale), bottom: onLayoutGrid((rect.bottom - cardTop) / scale) };
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
    for (const [element, key] of footKeys(card)) {
      const rect = element.getBoundingClientRect();
      if (rect.width || rect.height) rows.set(key, (rect.top - cardTop) / scale);
    }
    offsets.set(id, rows);
  }
  return offsets;
}

/** A row, or a part of a card's foot, travelling from where it stood by `delta` back to its place. */
interface RowMotion {
  element: HTMLElement;
  delta: number;
  /** A foot's part moves by its `translate`, which composes with a transform the stylesheet may hold it at. */
  foot?: boolean;
}

/** Draw a travelling row or foot part `by` above or below its place, or at its place again (null). */
function shiftRow(motion: RowMotion, by: number | null): void {
  if (motion.foot) motion.element.style.translate = by === null ? "" : `0 ${by}px`;
  else motion.element.style.transform = by === null ? "" : `translateY(${by}px)`;
}

/**
 * The parts of a card below its rows, its test chips, directory line and counts, by a key of their own: when a fold or
 * a restore changes a slot row's height (2026-11-13), they travel with the rows above them instead of standing at once
 * where the rows will end, which had laid the directory line over a row still on its way.
 */
function footKeys(card: HTMLElement): Array<[HTMLElement, string]> {
  return [...card.children].filter((child): child is HTMLElement => child instanceof HTMLElement
    && child.matches(".node-tests, .node-directory, .local-disclosure")).map((element, index) => [element, `\0foot\0${index}`]);
}

/**
 * Move a boxed symbol as one surface, so its explanation and name cannot be interleaved with another row's text
 * when their order changes. Legacy display:contents rows have no surface and still move through their children.
 */
function rowMotions(stage: BranchStage, before: Map<string, Map<string, number>>, scale: number): RowMotion[] {
  const motions: RowMotion[] = [];
  const after = rowOffsets(stage, scale);
  for (const [id, wrapper] of stage.wrappers) {
    const was = before.get(id), now = after.get(id);
    if (!was || !now) continue;
    const card = wrapper.querySelector<HTMLElement>(".node-card");
    if (!card) continue;
    for (const [element, key] of footKeys(card)) {
      const from = was.get(key), to = now.get(key);
      if (from !== undefined && to !== undefined && Math.abs(from - to) >= 0.5) motions.push({ element, delta: from - to, foot: true });
    }
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
 * any start is measured, since they take room on the card. A card's note on
 * references read back counts the returning references the picture draws at
 * it, from the rows disclosed, by the same function the 3D button's number
 * comes from (2026-11-15): a returning reference whose rows the disclosure
 * hides draws no lace, and is told by the card's "+N symbols" until shown.
 */
function dressCards(controller: LocalViewController, cards: readonly HTMLElement[], exploration: Exploration): void {
  const presentRow = rowPresentation(controller, exploration);
  // Every card's rows are disclosed or hidden before any card counts its returns, since a return has a row on two cards.
  const hiddenRows = new Map<HTMLElement, number>();
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
    hiddenRows.set(card, hidden);
  }
  for (const card of cards) {
    if (!card.classList.contains("node-card")) continue;
    const id = card.dataset.id!;
    const hidden = hiddenRows.get(card) ?? 0;
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
    const outside = exploration.hiddenConnections.get(id) ?? 0;
    if (outside) {
      const control = controller.isPinned(id, "*") ? hiddenByFilters(outside) : revealControl(controller, id, outside);
      control.dataset.outside = "";
      card.append(control);
    }
  }
  dressReturns(controller, cards, exploration);
}

/** A foot's words on the references a card returns in a cycle. */
const returnsWording = (back: readonly LocalEdge[]): string => `${countOf(connectionCount(back), "connection returns", "connections return")} in a cycle`;

/**
 * Each card's foot on the references it returns in a cycle, from the rows disclosed, before its count of connections
 * outside the view: the first paint's, and a cycle's trial's again, since another order returns other references.
 */
function dressReturns(controller: LocalViewController, cards: readonly HTMLElement[], exploration: Exploration): void {
  const returning = returningConnections(exploration.subgraph.links, edge => exploration.ranking.back.has(edgeKey(edge)),
    edge => drawsReference((nodeId, role, direction, symbol) => controller.getAnchor(nodeId, role, direction, symbol), edge));
  for (const card of cards) {
    if (!card.classList.contains("node-card")) continue;
    const id = card.dataset.id!;
    card.querySelectorAll(":scope > .local-back-references").forEach(note => note.remove());
    const back = returning.byFile.get(id) ?? [];
    // A pair line names no symbol: its return is told by its two files, and counted by the links it stands for.
    controller.reading?.setBackReferences(id, back.map(edge => (isPairLine(edge) ? { ...edge, sourceSymbol: undefined, targetSymbol: undefined } : edge)));
    if (!back.length) continue;
    const note = document.createElement(controller.reading ? "button" : "span");
    note.className = "local-disclosure local-back-references";
    note.textContent = returnsWording(back);
    note.title = "Show the files joined by connections that return against the layout's reading direction";
    if (controller.reading) {
      note.setAttribute("aria-haspopup", "menu");
      note.addEventListener("click", event => {
        event.stopPropagation();
        const rect = note.getBoundingClientRect();
        controller.reading!.showBackReferences(id, { x: rect.left, y: rect.bottom + 4 });
      });
    }
    card.insertBefore(note, card.querySelector(":scope > [data-outside]"));
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
