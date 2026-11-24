/**
 * The World Map, drawn.
 *
 * @remarks
 * Everything here touches the DOM: the SVG the board is drawn into, the tools,
 * the panel that shows evidence, the help and the walkthrough. The numbers come
 * from `projection.ts`, `layout.ts` and `model.ts`, which are pure and tested;
 * this module only draws what they return and answers the pointer.
 */

import { renderBoard, type Board } from "@live-documentation/engine/live-docs/board";
import type { Ghost, ServedDoor } from "@live-documentation/engine/live-docs/boardGraph";
import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";

import { escapeHtml } from "../../graph-helpers";
import { activePalette, mix, whenPaletteChanges, type WorldForm } from "../../palette";
import { CLOSE_ICON, iconButton } from "../../panels/icon-button";
import { parseInitialState } from "../../persistence/url-state";
import { NO_REST, restAt, restedOn, restsAt, type PointerRest } from "../pointerRest";
import {
  FLOAT,
  GRID,
  autoPlace,
  clamp,
  corners,
  coveredArea,
  drawOrder,
  inRect,
  labelAnchor,
  labelMoves,
  panelBeside,
  pixelsToUnits,
  placePiece,
  rectAround,
  roadCurve,
  silhouette,
  spanWithin,
  spreadTokens,
  unitsToPixels,
  wallOf,
  wallPoint,
  type Anchor,
  type Avoid,
  type LabelMove,
  type Placed,
  type Rect,
  type ScreenBox,
  type Wall
} from "./layout";
import { regionsOf, type WorldModel, type WorldRoad } from "./model";
import {
  MIN_ELEVATION,
  REST_ELEVATION,
  TOP_DOWN,
  bezierAt,
  cuboidFaces,
  depthOf,
  fitScreen,
  fromScreen,
  lookDown,
  lookUp,
  looksDown,
  pointInPolygon,
  project,
  ring,
  shade,
  smooth,
  toScreen,
  unproject,
  zoomAt,
  type Camera,
  type Pivot,
  type Point2,
  type Point3,
  type Screen
} from "./projection";
import { wireEndsOf, wireFilesOf } from "./way-down";

const SVG = "http://www.w3.org/2000/svg";

/**
 * Where a piece's two lines stand above the top of its outline, in screen pixels: the second line's box ends a few
 * pixels clear of the outline, and the name stands one line above it.
 */
const SUB_DY = -6;
const NAME_DY = -21;
/** How far a label may move sideways, in fractions of its own width: up to half, so that it stays over what it names. */
const SHIFTS = [0, -0.25, 0.25, -0.5, 0.5];
/**
 * Where a piece's label may move from where it rests when a nearer piece's label or any piece's outline is in its way:
 * above its piece, up a line at most and sideways; then below its piece, clear of the strands it hangs, and sideways.
 * A label lifted further read as the next piece's (2026-11-12).
 */
const LABEL_MOVES = [...labelMoves([0, -14], SHIFTS), ...labelMoves([0, 14], SHIFTS).map((move) => ({ ...move, below: true }))];
/** The longest strand a piece hangs, in board pixels: the longest `drawStrands` draws. */
const LONGEST_STRAND = 26;

/**
 * The board's tools, three groups parted by rules: turning the camera, what the board shows, and the layout. Each is an
 * icon with its name and key in its tooltip (the owner, 2026-10-30: "everything is an icon and text only appears when
 * it is user-authored"). The drawings are the application's own.
 */
const TOOLS: Array<Array<{ act: string; label: string; key?: string; toggle?: boolean; drawing: string }>> = [
  [
    // Open circular arrows, the usual sign for turning; a cube with its top face filled, the usual sign for a view from
    // above; layers, for what lies under the things. First drawn as arcs round a diamond, an arrow onto a box and a
    // block on strands, which read as gauges, a download and a stool (2026-11-12).
    { act: "rotl", label: "Turn left", key: "Q", drawing: '<path d="M8.25 5.5A7.5 7.5 0 1 0 15.75 5.5"/><path d="M16.65 8.9 15.75 5.5 19.15 4.6"/>' },
    { act: "rotr", label: "Turn right", key: "E", drawing: '<path d="M15.75 5.5A7.5 7.5 0 1 1 8.25 5.5"/><path d="M7.35 8.9 8.25 5.5 4.85 4.6"/>' },
    { act: "tilt", label: "Look straight down", key: "T", toggle: true, drawing: '<path d="M12 3 20 7.5 12 12 4 7.5Z" fill="currentColor"/><path d="M4 7.5v9L12 21l8-4.5v-9M12 12v9"/>' }
  ],
  [
    { act: "under", label: "Built on", key: "U", toggle: true, drawing: '<path d="M12 4 20 8.5 12 13 4 8.5Z"/><path d="m4 12.5 8 4.5 8-4.5M4 16.5 12 21l8-4.5"/>' },
    { act: "snap", label: "Snap to grid", key: "G", toggle: true, drawing: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M9.33 4v16M14.67 4v16M4 9.33h16M4 14.67h16"/>' },
    { act: "theme", label: "Dark board", key: "D", toggle: true, drawing: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>' }
  ],
  [
    { act: "fit", label: "Fit", key: "F", drawing: '<path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/>' },
    // Pressed while a reset stands that a second press takes back (see `resetLayout`).
    { act: "reset", label: "Reset layout", key: "R", toggle: true, drawing: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>' },
    { act: "save", label: "Save board", drawing: '<path d="M12 3v12M7.5 10.5 12 15l4.5-4.5M4 15v4.5h16V15"/>' }
  ]
];

/** What the pointer is on. */
export interface Hover {
  kind: "piece" | "road" | "token" | "door" | "region" | "crossing";
  id: string;
}

/** What the controller is given: where to draw, the board and its join, the graph, and the doors out of the view. */
export interface WorldMapOptions {
  root: HTMLElement;
  board: Board;
  boardPath: string;
  model: WorldModel;
  graph: LiveDocGraph;
  /** Opens a file of the graph in the Local Map, from a link in a pinned panel. */
  onOpenFile?: (file: string) => void;
  /**
   * Opens a thing's folder in the Local Map: the wheel past half the view, a double-click, or the link in its pinned
   * panel. Where the way down carries the question, with the files that carry the thing's wires.
   */
  onOpenThing?: (thing: OpenedThing) => void;
  /**
   * Whether a way down carries the question asked on the board (Tuning's Way Down, a trial of 2026-11-22), read at each
   * press and each panel drawn: a thing then opens with the files that carry its wires, a wire's pinned panel offers its
   * own way down, and the board's pin is kept for the way back.
   */
  carriesQuestion?: () => boolean;
  /** Opens a wire as the files at its two ends, pair by pair, from the link in its pinned panel. */
  onOpenWire?: (wire: { from: string; to: string; files: string[] }) => void;
  /** Told which thing with a folder is pinned on the board, and that none is, as the pin changes. */
  onPinnedThing?: (thing: { name: string; folder: string } | null) => void;
}

/**
 * A thing as its way down hands it to the page: its board name, its folder, and, where the question is carried, every
 * file that carries its wires, in the order a picture should take them.
 */
export interface OpenedThing {
  name: string;
  folder: string;
  wireFiles?: string[];
}

interface Door {
  key: string;
  piece: string;
  toward: Point2;
  role: "offers" | "uses";
  label: string;
  sub: string;
  roads: string[];
  wall: Wall;
  anchor: Anchor;
  /** A ghost: a door that uses what nothing on the board serves, with no road. */
  ghost?: Ghost;
  /** A door the board declares that nothing on the board uses, with no road: drawn all the same, since a promise is never hidden. */
  declared?: ServedDoor;
}

interface Token {
  key: string;
  label: string;
  kind: "package" | "reference";
  users: string[];
  at: Point2;
}

interface Drag {
  x0: number;
  y0: number;
  /** What was pressed; the pointer is captured, so later events name the surface instead. */
  target: Element;
  moved: boolean;
  orbit: boolean;
  theta0: number;
  phi0: number;
  pivot?: { s: Point2; w: Point2 };
  piece?: string;
  screen0: Screen;
  world0: Point2;
  pos0?: Point2;
  /** Where the drawing's corner stands on the page, read once when the drag begins: nothing moves it while the drag lasts. */
  origin: Point2;
}

/** How dark a piece's footprint is on each board: its colour is the palette's, its strength the board's. */
const SHADOW_STRENGTH = { light: 0.26, dark: 0.55 } as const;

/** How much of a face an imagined thing keeps: enough to catch the pointer, too little to read as a solid. */
const HOLLOW = 0.08;

const BASIS_WORDS: Record<string, string> = {
  source: "from source",
  contract: "from a contract",
  configuration: "from configuration",
  declared: "declared"
};

/** Draws a board and answers the pointer. */
export class WorldMapController {
  private readonly root: HTMLElement;
  private readonly board: Board;
  private readonly boardPath: string;
  private readonly model: WorldModel;
  private readonly graph: LiveDocGraph;
  private readonly onOpenFile?: (file: string) => void;
  private readonly onOpenThing?: (thing: OpenedThing) => void;
  private readonly carriesQuestion: () => boolean;
  private readonly onOpenWire?: WorldMapOptions["onOpenWire"];
  private readonly onPinnedThing?: WorldMapOptions["onPinnedThing"];

  private readonly world: HTMLElement;
  private readonly svg: SVGSVGElement;
  private readonly defs: SVGElement;
  private readonly camGroup: SVGGElement;
  private readonly layers: Record<string, SVGGElement> = {};
  private readonly hud: HTMLElement;
  private readonly crumbs: HTMLElement;
  private readonly tools: HTMLElement;
  /** One keyboard stop per piece, in the board's own order, kept across draws so that focus survives a turn. */
  private readonly focusTargets = new Map<string, SVGGElement>();
  /** The piece the keyboard is on, whose peek stands beside it as a pinned panel does. */
  private focused: string | null = null;
  private readonly evidence: HTMLElement;
  private readonly helpButton: HTMLButtonElement;
  private readonly help: HTMLElement;
  private readonly tourBox: HTMLElement;
  /** Says the walkthrough's step aloud when it changes: the World Map's own, so that it never shares a region with the page's. */
  private readonly status: HTMLElement;

  private camera: Camera = { theta: 0, phi: REST_ELEVATION };
  /** The view "look straight down" left and the one it went to, so that looking up again returns there if nothing turned between. */
  private lookedDown: { from: Camera; above: Camera } | null = null;
  private screen: Screen = { x: 0, y: 0, k: 1 };
  private pivot: Pivot = { x: 0, y: 0 };
  private bench: Rect = { x: 0, y: 0, w: 1400, d: 900 };
  private positions = new Map<string, Point2>();
  private readonly restPositions = new Map<string, Point2>();
  /** Where the pieces stood before a reset, kept so that the same control puts them back, until a piece is next moved. */
  private beforeReset: Map<string, Point2> | null = null;

  /** What the pointer has rested on, or the keyboard is on: the peek's subject. */
  private hover: Hover | null = null;
  /** What the pointer touches now, and its rest (`lookAtRest`). */
  private touched: Hover | null = null;
  private rest: PointerRest = NO_REST;
  private restTimer = 0;
  private pinned: Hover | null = null;
  private under = false;
  private snap = false;
  private theme: "light" | "dark" = "light";
  private instant = false;
  private drag: Drag | null = null;
  private lastPointer: Point2 = [0, 0];
  private doors: Door[] = [];
  private tokens: Token[] = [];
  private roadCurves = new Map<string, [Point3, Point3, Point3, Point3]>();
  /** The walkthrough, and the view it began on, to which it returns. */
  private tour: { on: boolean; at: number; start?: { camera: Camera; screen: Screen; under: boolean } } = { on: false, at: 0 };
  /** What the last press landed on; a click and a double-click are retargeted to the surface by the pointer capture. */
  private lastPressed: Element | null = null;
  /** What the next frame must bring up to date for the pointer: the whole drawing, or the pan and zoom alone; and that frame. */
  private pending: "draw" | "camera" | null = null;
  private frame = 0;
  private readonly disposers: Array<() => void> = [];
  private readonly resizeHandler = (): void => this.applyCamera();

  constructor(options: WorldMapOptions) {
    this.root = options.root;
    this.board = options.board;
    this.boardPath = options.boardPath;
    this.model = options.model;
    this.graph = options.graph;
    this.onOpenFile = options.onOpenFile;
    this.onOpenThing = options.onOpenThing;
    this.carriesQuestion = options.carriesQuestion ?? (() => false);
    this.onOpenWire = options.onOpenWire;
    this.onPinnedThing = options.onPinnedThing;

    this.root.innerHTML = "";
    this.world = element("div", "world", this.root);
    // The board's letters act only while the keyboard is on it (see `attachInput`). Focusable but never a Tab stop, the
    // board takes focus from a press anywhere on it that lands on nothing focusable of its own, as the browser gives a
    // press to the nearest focusable thing under it: a tool, a link or a pinned panel keeps the focus a press gives it.
    this.world.tabIndex = -1;
    this.svg = svgElement("svg", { class: "world-svg" }, this.world) as SVGSVGElement;
    this.defs = svgElement("defs", {}, this.svg);
    const blur = svgElement("filter", { id: "world-blur", x: "-30%", y: "-30%", width: "160%", height: "160%" }, svgElement("defs", {}, this.svg));
    svgElement("feGaussianBlur", { stdDeviation: "7" }, blur);
    this.camGroup = svgElement("g", { class: "w-cam" }, this.svg) as SVGGElement;
    for (const name of ["ground", "under", "shadows", "roads", "blocks", "roots", "doors", "labels", "focus"]) {
      this.layers[name] = svgElement("g", { class: `w-layer-${name}` }, this.camGroup) as SVGGElement;
    }
    this.hud = element("div", "world-hud", this.world);
    this.crumbs = element("div", "world-crumbs", this.hud);
    this.tools = element("div", "world-tools", this.hud);
    this.tools.setAttribute("role", "toolbar");
    this.tools.setAttribute("aria-label", "Board");
    for (const group of TOOLS) {
      const span = element("span", "world-tool-group", this.tools);
      for (const tool of group) {
        const button = iconButton(tool.label, tool.drawing);
        button.dataset.act = tool.act;
        if (tool.key) {
          button.title = `${tool.label} (${tool.key})`;
          button.setAttribute("aria-keyshortcuts", tool.key);
        }
        if (tool.toggle) {
          button.setAttribute("aria-pressed", "false");
        }
        span.append(button);
      }
    }
    // One Tab stop for the toolbar, its first tool until another is chosen; the arrows move inside it (`attachInput`).
    this.tools.querySelectorAll("button").forEach((button, i) => { button.tabIndex = i === 0 ? 0 : -1; });
    this.evidence = element("div", "world-evidence", this.world);
    // The pinned panel takes focus when a piece is pinned from the keyboard, so that its links are the next stops.
    this.evidence.tabIndex = -1;
    this.helpButton = element("button", "world-help-btn", this.world, "?");
    this.helpButton.title = "Help (?)";
    this.helpButton.setAttribute("aria-label", "Help");
    this.helpButton.setAttribute("aria-keyshortcuts", "?");
    this.helpButton.setAttribute("aria-expanded", "false");
    this.help = element("div", "world-help", this.world);
    // One World Map on the page, so one id.
    this.help.id = "world-help";
    this.helpButton.setAttribute("aria-controls", this.help.id);
    this.tourBox = element("div", "world-tour", this.world);
    this.tourBox.innerHTML = `<div class="step"></div><div class="text"></div><div class="row"><button data-tour="back">back</button><button data-tour="next" class="primary">next</button><button data-tour="done">done</button></div>`;
    // Outside the walkthrough's box, which is hidden when it ends: a region that is not displayed says nothing.
    this.status = element("div", "visually-hidden", this.world);
    this.status.setAttribute("role", "status");

    this.restPositions = this.initialPositions();
    this.positions = this.loadPositions();
    this.bench = this.benchAround();
    this.pivot = { x: this.bench.x + this.bench.w / 2, y: this.bench.y + this.bench.d / 2 };
    this.restoreTheme();
    // A palette chosen later draws the board again in its colours: its faces and tints are written when drawn.
    this.disposers.push(whenPaletteChanges(() => this.draw()));
    this.writeHelp();
    this.buildFocusTargets();
    this.attachInput();
  }

  // ==========================================================================
  // Lifecycle
  // ==========================================================================

  /** Draws the board and fits it to the viewport. */
  render(): void {
    this.writeCrumbs();
    this.draw();
    this.fit();
  }

    /** Removes every listener and empties the root. */
  dispose(): void {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.pending = null;
    for (const dispose of this.disposers) {
      dispose();
    }
    this.root.innerHTML = "";
  }

  // ==========================================================================
  // Positions
  // ==========================================================================

  /** Where every piece rests: the board's Layout, and rows below it for the pieces it does not place. */
  private initialPositions(): Map<string, Point2> {
    const positions = new Map<string, Point2>();
    for (const [name, units] of this.model.positions) {
      positions.set(name, unitsToPixels(units));
    }
    const unplaced = this.model.pieces.filter((piece) => !positions.has(piece.name));
    const groups: Array<{ names: string[] }> = [];
    for (const region of this.model.regions) {
      const names = unplaced.filter((piece) => piece.region === region.name).map((piece) => piece.name);
      if (names.length) {
        groups.push({ names });
      }
    }
    const loose = unplaced.filter((piece) => piece.region === undefined || !this.model.regions.some((region) => region.name === piece.region)).map((piece) => piece.name);
    if (loose.length) {
      groups.push({ names: loose });
    }
    for (const [name, units] of autoPlace(groups, [...this.model.positions.values()])) {
      positions.set(name, unitsToPixels(units));
    }
    return positions;
  }

  private get storageKey(): string {
    return `live-docs.world.${this.boardPath}`;
  }

  private loadPositions(): Map<string, Point2> {
    const positions = new Map(this.restPositions);
    try {
      const stored = JSON.parse(window.localStorage.getItem(`${this.storageKey}.positions`) ?? "null") as Record<string, Point2> | null;
      if (stored) {
        for (const [name, units] of Object.entries(stored)) {
          if (positions.has(name)) {
            positions.set(name, unitsToPixels(units));
          }
        }
      }
    } catch {
      // Storage may be unavailable; the rest positions stand.
    }
    return positions;
  }

  private savePositions(): void {
    try {
      const units: Record<string, Point2> = {};
      for (const [name, pixels] of this.positions) {
        units[name] = pixelsToUnits(pixels);
      }
      window.localStorage.setItem(`${this.storageKey}.positions`, JSON.stringify(units));
    } catch {
      // Storage may be unavailable; positions live for the page.
    }
  }

  private benchAround(): Rect {
    const rects: Rect[] = this.model.pieces.map((piece) => this.place(piece.name));
    for (const region of this.regionRects().values()) {
      rects.push(region);
    }
    const around = rectAround(rects, 140) ?? { x: 0, y: 0, w: 1400, d: 900 };
    return { x: around.x, y: around.y, w: Math.max(around.w, 900), d: Math.max(around.d, 600) };
  }

  private place(name: string): Placed {
    const piece = this.model.pieces.find((candidate) => candidate.name === name);
    const center = this.positions.get(name) ?? [0, 0];
    const lifted = this.drag?.piece === name && this.drag.moved;
    return placePiece(name, piece?.shape ?? "cube", center, lifted);
  }

  /** The rectangle each region tints: around its pieces and the regions inside it, innermost first. */
  private regionRects(): Map<string, Rect> {
    const rects = new Map<string, Rect>();
    const ordered = [...this.model.regions].sort((a, b) => b.depth - a.depth);
    for (const region of ordered) {
      const members: Rect[] = [];
      for (const held of region.holds) {
        const inner = rects.get(held);
        if (inner) {
          members.push(inner);
        } else if (this.positions.has(held)) {
          const placed = this.place(held);
          members.push({ x: placed.x, y: placed.y, w: placed.w, d: placed.d });
        }
      }
      const rect = rectAround(members, 40 + 8 * (region.depth === 0 ? 1 : 0));
      if (rect) {
        rects.set(region.name, { ...rect, d: rect.d + 18 });
      }
    }
    return rects;
  }

  // ==========================================================================
  // Drawing
  // ==========================================================================

  private P(x: number, y: number, z = 0): string {
    return project(this.camera, this.pivot, x, y, z).join(",");
  }

  private draw(): void {
    // A frame asked for by the pointer has nothing left to do once the whole board is drawn.
    this.pending = null;
    // Everything is drawn afresh but the keyboard's stops, which are moved in place so that a focused piece keeps focus.
    for (const [name, layer] of Object.entries(this.layers)) {
      if (name !== "focus") {
        layer.innerHTML = "";
      }
    }
    this.defs.innerHTML = "";
    const regionRects = this.regionRects();
    this.drawGround(regionRects);
    this.drawRoads(regionRects);
    if (this.under) {
      this.drawTokens();
    }
    for (const placed of drawOrder(this.camera, this.pivot, this.model.pieces.map((piece) => this.place(piece.name)))) {
      this.drawPiece(placed);
      this.drawStrands(placed);
    }
    this.drawLabels();
    for (const [name, target] of this.focusTargets) {
      target.querySelector("polygon")?.setAttribute("points", silhouette(this.camera, this.pivot, this.place(name)).map((p) => p.join(",")).join(" "));
    }
    // The hover settles the labels, once; settling them before it as well was work thrown away (2026-11-13).
    this.placeCamera();
    this.applyHover();
  }

  /**
   * The pieces' keyboard stops, in the board's own order, the order its author wrote its things in: each a button
   * named for what the piece is, with a ring on the piece's outline that shows while the keyboard is on it. They stand
   * over the drawing and take no pointer, so a click still lands on the piece beneath.
   */
  private buildFocusTargets(): void {
    for (const piece of this.model.pieces) {
      const files = `${piece.files.length} file${piece.files.length === 1 ? "" : "s"}`;
      // The folder a piece opens is said with its name, in the scan's words: every blind tester met a box named
      // "payments" that opened PaymentService/ and said so nowhere until it was opened (2026-11-19).
      const said = [piece.name, piece.kind, piece.imagined ? "imagined, nothing inside yet" : piece.folder !== undefined ? `opens ${piece.folder || "the scan root"}` : "", piece.imagined ? "" : files].filter(Boolean).join(", ");
      const target = svgElement("g", { class: "w-focus", tabindex: 0, role: "button", "aria-label": said, "data-focus": piece.name }, this.layers.focus) as SVGGElement;
      svgElement("polygon", { class: "w-focus-ring" }, target);
      this.focusTargets.set(piece.name, target);
    }
  }

  /** The board's form of the palette, light or dark. */
  private themeColours(): WorldForm {
    return activePalette().world[this.theme];
  }

  private drawGround(regionRects: Map<string, Rect>): void {
    const ground = this.layers.ground;
    svgElement("polygon", { class: "w-bench", points: corners(this.bench).map(([x, y]) => this.P(x, y)).join(" ") }, ground);
    const ordered = [...this.model.regions].sort((a, b) => a.depth - b.depth);
    for (const region of ordered) {
      const rect = regionRects.get(region.name);
      if (!rect) {
        continue;
      }
      const colour = this.themeColours().tints[region.tint];
      const polygon = svgElement("polygon", { class: "w-region", "data-region": region.name, points: corners(rect).map(([x, y]) => this.P(x, y)).join(" "), fill: colour }, ground);
      if (region.depth > 0) {
        polygon.setAttribute("fill-opacity", "0.85");
      }
      // The region's name sits just outside its left point, off the feet of the things at its corners.
      const label = svgElement("text", { class: "w-zone", "data-fixed": this.P(rect.x - 10, rect.y + rect.d / 2), "text-anchor": "end", dy: "4", "data-dy": "4" }, this.layers.labels);
      label.textContent = region.name;
    }
    if (this.snap) {
      for (let x = Math.ceil(this.bench.x / GRID) * GRID; x < this.bench.x + this.bench.w; x += GRID) {
        const [x1, y1] = project(this.camera, this.pivot, x, this.bench.y);
        const [x2, y2] = project(this.camera, this.pivot, x, this.bench.y + this.bench.d);
        svgElement("line", { class: "w-grid", x1, y1, x2, y2 }, ground);
      }
      for (let y = Math.ceil(this.bench.y / GRID) * GRID; y < this.bench.y + this.bench.d; y += GRID) {
        const [x1, y1] = project(this.camera, this.pivot, this.bench.x, y);
        const [x2, y2] = project(this.camera, this.pivot, this.bench.x + this.bench.w, y);
        svgElement("line", { class: "w-grid", x1, y1, x2, y2 }, ground);
      }
    }
  }

  private drawPiece(placed: Placed): void {
    const colours = this.themeColours();
    // An imagined thing is hollow: its edges dashed, its faces all but unfilled, its shadow faint. A promise and a fact are not the same solid.
    const imagined = this.model.pieces.find((piece) => piece.name === placed.name)?.imagined === true;
    const footprint = placed.form === "tank" ? ring(placed.cx, placed.cy, placed.r, 0, 24).map((p) => [p[0], p[1]] as Point2) : corners({ x: placed.x, y: placed.y, w: placed.w, d: placed.d });
    svgElement("polygon", { class: "w-shadow", filter: "url(#world-blur)", "fill-opacity": SHADOW_STRENGTH[this.theme] * (placed.z0 > FLOAT ? 0.6 : 1) * (imagined ? 0.35 : 1), points: footprint.map(([x, y]) => this.P(x + 6, y + 6, 0)).join(" ") }, this.layers.shadows);
    const group = svgElement("g", { class: `w-piece${imagined ? " imagined" : ""}`, "data-piece": placed.name }, this.layers.blocks);
    if (placed.form === "tank") {
      this.drawTank(group, placed, imagined);
      return;
    }
    for (const face of cuboidFaces(this.camera, this.pivot, placed)) {
      svgElement("polygon", { class: `w-face${imagined ? " imagined" : ""}`, points: face.points.map((p) => this.P(p[0], p[1], p[2])).join(" "), fill: this.faceFill(shade(this.camera, face.normal)), "fill-opacity": imagined ? HOLLOW : 1, stroke: colours.faceEdge, "stroke-dasharray": imagined ? "5 4" : "" }, group);
    }
  }

  private drawTank(group: SVGElement, placed: Placed, imagined = false): void {
    const count = 40;
    const bottom = ring(placed.cx, placed.cy, placed.r, placed.z0, count);
    const top = ring(placed.cx, placed.cy, placed.r, placed.z0 + placed.h, count);
    const centreDepth = depthOf(this.camera, this.pivot, placed.cx, placed.cy, 0);
    const front = bottom.map((p, i) => [depthOf(this.camera, this.pivot, p[0], p[1], 0) >= centreDepth, i] as [boolean, number]).filter(([near]) => near).map(([, i]) => i);
    const start = front.find((i) => !front.includes((i + count - 1) % count)) ?? front[0] ?? 0;
    const ordered: number[] = [];
    for (let k = 0, i = start; k < front.length; k += 1, i = (i + 1) % count) {
      ordered.push(i);
    }
    const side = [...ordered.map((i) => bottom[i]), ...ordered.slice().reverse().map((i) => top[i])];
    const colours = this.themeColours();
    svgElement("polygon", { class: `w-face${imagined ? " imagined" : ""}`, points: side.map((p) => this.P(p[0], p[1], p[2])).join(" "), fill: this.faceFill(0.55), "fill-opacity": imagined ? HOLLOW : 1, "stroke-dasharray": "4 3", stroke: colours.drumEdge }, group);
    svgElement("polygon", { class: `w-face${imagined ? " imagined" : ""}`, points: top.map((p) => this.P(p[0], p[1], p[2])).join(" "), fill: this.faceFill(0.9), "fill-opacity": imagined ? HOLLOW : 1, "stroke-dasharray": "4 3", stroke: colours.drumEdge }, group);
  }

  private faceFill(value: number): string {
    const colours = this.themeColours();
    return mix(colours.faceDark, colours.faceLight, value);
  }

  /** Doors: a blue one where a piece offers each opening a road lands on, a green one where it uses another piece's. */
  private computeDoors(): void {
    const byKey = new Map<string, Door>();
    this.doors = [];
    const request = (key: string, piece: string, toward: Point2, role: "offers" | "uses", label: string, sub: string, roadId: string): void => {
      let door = byKey.get(key);
      if (!door) {
        door = { key, piece, toward, role, label, sub, roads: [], wall: "E", anchor: { p: [0, 0, 0], out: [1, 0] } };
        byKey.set(key, door);
        this.doors.push(door);
      }
      door.roads.push(roadId);
    };
    for (const road of this.model.roads) {
      if (road.kind !== "call") {
        continue;
      }
      const provider = this.place(road.to);
      const consumer = this.place(road.from);
      const doorName = road.door?.name ?? `from ${road.from}`;
      request(`offers:${road.to}:${doorName}`, road.to, [consumer.cx, consumer.cy], "offers", doorName, road.door?.kind ?? (road.over ? `over ${road.over}` : BASIS_WORDS[road.basis]), road.id);
      const files = [...new Set(road.lines.map((line) => basename(line.from)))];
      request(`uses:${road.from}:${road.to}`, road.from, [provider.cx, provider.cy], "uses", `to ${road.to}`, files.join(", ") || (road.over ? `over ${road.over}` : BASIS_WORDS[road.basis]), road.id);
    }
    // A ghost is a door that uses what nothing on the board serves: it faces away from the board's middle, toward the unknown.
    const placedPieces = this.model.pieces.map((piece) => this.place(piece.name));
    const middle: Point2 = placedPieces.length
      ? [placedPieces.reduce((sum, b) => sum + b.cx, 0) / placedPieces.length, placedPieces.reduce((sum, b) => sum + b.cy, 0) / placedPieces.length]
      : [0, 0];
    for (const piece of this.model.pieces) {
      const placed = this.place(piece.name);
      const away: Point2 = placed.cx === middle[0] && placed.cy === middle[1] ? [placed.cx + 1, placed.cy] : [placed.cx + (placed.cx - middle[0]), placed.cy + (placed.cy - middle[1])];
      for (const ghost of piece.ghosts) {
        const key = `ghost:${piece.name}:${ghost.basis}:${ghost.label}`;
        if (!byKey.has(key)) {
          const door: Door = { key, piece: piece.name, toward: away, role: "uses", label: ghost.label, sub: `${BASIS_WORDS[ghost.basis]} · nothing on the board serves it`, roads: [], wall: "E", anchor: { p: [0, 0, 0], out: [1, 0] }, ghost };
          byKey.set(key, door);
          this.doors.push(door);
        }
      }
      // A door the board declares that no road lands on is drawn all the same, facing the same way: a promise is never hidden.
      for (const served of piece.doors) {
        const key = `offers:${piece.name}:${served.name}`;
        if (served.file === undefined && !byKey.has(key)) {
          const door: Door = { key, piece: piece.name, toward: away, role: "offers", label: served.name, sub: `${served.kind} · declared, nothing on the board uses it`, roads: [], wall: "E", anchor: { p: [0, 0, 0], out: [1, 0] }, declared: served };
          byKey.set(key, door);
          this.doors.push(door);
        }
      }
    }
    const groups = new Map<string, Door[]>();
    for (const door of this.doors) {
      const placed = this.place(door.piece);
      door.wall = wallOf(this.camera, placed, door.toward);
      const key = `${door.piece}:${door.wall}`;
      groups.set(key, [...(groups.get(key) ?? []), door]);
    }
    for (const list of groups.values()) {
      const placed = this.place(list[0].piece);
      const along = list[0].wall === "E" || list[0].wall === "W" ? 1 : 0;
      list.sort((a, b) => a.toward[along] - b.toward[along]);
      list.forEach((door, i) => {
        door.anchor = wallPoint(this.camera, placed, door.wall, door.toward, (i + 1) / (list.length + 1));
      });
    }
  }

  private pathOf(curve: [Point3, Point3, Point3, Point3]): string {
    const [a, b, c, d] = curve.map((p) => project(this.camera, this.pivot, p[0], p[1], p[2]));
    return `M${a[0]},${a[1]} C${b[0]},${b[1]} ${c[0]},${c[1]} ${d[0]},${d[1]}`;
  }

  private gradient(id: string, from: Point2, to: Point2): string {
    const gradient = svgElement("linearGradient", { id, gradientUnits: "userSpaceOnUse", x1: from[0], y1: from[1], x2: to[0], y2: to[1] }, this.defs);
    // The form's wire colours by their custom properties (world.css), so that the board's form or a palette chosen later re-colours them at once.
    for (const [offset, role] of [[0, "offers"], [0.1, "offers"], [0.9, "uses"], [1, "uses"]] as Array<[number, string]>) {
      svgElement("stop", { offset, style: `stop-color: var(--w-wire-${role})` }, gradient);
    }
    return `url(#${id})`;
  }

  private drawRoads(regionRects: Map<string, Rect>): void {
    this.computeDoors();
    this.roadCurves.clear();
    const byKey = new Map(this.doors.map((door) => [door.key, door]));
    let index = 0;
    for (const road of this.model.roads) {
      const id = `world-grad-${index++}`;
      const group = svgElement("g", { class: road.kind === "stands" ? "w-road-group w-stand-group" : "w-road-group", "data-road": road.id }, this.layers.roads);
      if (road.kind === "stands") {
        // One piece standing on another's code: a dotted line on the board, in the family of the strands and spokes, with no flow along it.
        const from = this.place(road.from);
        const to = this.place(road.to);
        const a = project(this.camera, this.pivot, from.cx, from.cy, 0);
        const b = project(this.camera, this.pivot, to.cx, to.cy, 0);
        svgElement("line", { class: "w-stand", x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, group);
        svgElement("circle", { class: "w-station", r: 3, "data-fixed": a.join(",") }, group);
        svgElement("line", { class: "w-road-hit", x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, group);
        continue;
      }
      const consumerDoor = byKey.get(`uses:${road.from}:${road.to}`);
      const providerDoor = byKey.get(`offers:${road.to}:${road.door?.name ?? `from ${road.from}`}`);
      if (!consumerDoor || !providerDoor) {
        continue;
      }
      // A wire runs from the door that offers to the door that uses, blue to green, as inside a system.
      const curve = roadCurve(providerDoor.anchor, consumerDoor.anchor);
      this.roadCurves.set(road.id, curve);
      const a = project(this.camera, this.pivot, curve[0][0], curve[0][1], curve[0][2]);
      const z = project(this.camera, this.pivot, curve[3][0], curve[3][1], curve[3][2]);
      const d = this.pathOf(curve);
      this.drawCrossing(group, road, curve, regionRects);
      svgElement("path", { class: "w-road", d, stroke: this.gradient(id, a, z), "stroke-width": 2.5 + Math.min(3, road.count), "stroke-dasharray": road.basis === "declared" ? "7 5" : "" }, group);
      svgElement("path", { class: "w-flow", d }, group);
      svgElement("path", { class: "w-road-hit", d }, group);
    }
    for (const crossing of this.model.crossings) {
      if (this.model.roads.some((road) => road.kind === "call" && this.crosses(road, crossing))) {
        continue;
      }
      const a = regionRects.get(crossing.from);
      const b = regionRects.get(crossing.to);
      if (!a || !b) {
        continue;
      }
      const group = svgElement("g", { class: "w-road-group", "data-crossing": crossing.id }, this.layers.roads);
      const from: Point2 = [a.x + a.w / 2, a.y + a.d / 2];
      const to: Point2 = [b.x + b.w / 2, b.y + b.d / 2];
      const p = project(this.camera, this.pivot, from[0], from[1]);
      const q = project(this.camera, this.pivot, to[0], to[1]);
      svgElement("line", { class: "w-tunnel-dashed", x1: p[0], y1: p[1], x2: q[0], y2: q[1] }, group);
      svgElement("line", { class: "w-road-hit", x1: p[0], y1: p[1], x2: q[0], y2: q[1] }, group);
      const tag = svgElement("text", { class: "w-tag", "data-fixed": this.P((from[0] + to[0]) / 2, (from[1] + to[1]) / 2), "text-anchor": "middle", dy: "-8", "data-dy": "-8" }, this.layers.labels);
      tag.textContent = `${crossing.over ?? "crossing"} · declared`;
    }
    for (const door of this.doors) {
      const group = svgElement("g", { class: "w-door-group", "data-piece": door.piece, "data-door": door.key }, this.layers.doors);
      const s = project(this.camera, this.pivot, door.anchor.p[0], door.anchor.p[1], door.anchor.p[2]);
      if (door.ghost || door.declared) {
        // The stub into the air: a call that leaves the wall and lands nowhere on the board, or a promised door that nothing on the board reaches.
        const far = project(this.camera, this.pivot, door.anchor.p[0] + door.anchor.out[0] * 34, door.anchor.p[1] + door.anchor.out[1] * 34, door.anchor.p[2]);
        svgElement("path", { class: `w-stub ${door.role}`, d: `M${s[0]},${s[1]} L${far[0]},${far[1]}` }, group);
        svgElement("circle", { class: "w-ghost-end", r: 3, "data-fixed": far.join(",") }, group);
      }
      svgElement("circle", { class: `w-door ${door.role}${door.ghost ? " ghost" : ""}${door.declared ? " declared" : ""}`, r: 5, "data-fixed": s.join(",") }, group);
      const leftward = door.anchor.out[0] < 0 || (door.anchor.out[0] === 0 && door.anchor.out[1] < 0);
      const text = svgElement("text", { class: "w-doorlabel", "data-fixed": s.join(","), "data-piece": door.piece, "data-roads": door.roads.join(" "), "data-anchor": leftward ? "end" : "start", "data-dx": leftward ? -10 : 10, "text-anchor": leftward ? "end" : "start", dx: leftward ? -10 : 10, dy: door.role === "offers" ? -6 : 14 }, this.layers.labels);
      text.textContent = door.label;
      // Hidden until the hover shows it, by its own style as well as the sheet's, so that settling passes it by unread.
      text.style.display = "none";
    }
  }

  /** Whether a road runs between the two regions of a crossing. */
  private crosses(road: WorldRoad, crossing: { from: string; to: string }): boolean {
    const from = regionsOf(this.model, road.from).map((region) => region.name);
    const to = regionsOf(this.model, road.to).map((region) => region.name);
    return (from.includes(crossing.from) && to.includes(crossing.to)) || (from.includes(crossing.to) && to.includes(crossing.from));
  }

  /** The warm sleeve where a road leaves one region and enters another, with the crossing's tag. */
  private drawCrossing(group: SVGElement, road: WorldRoad, curve: [Point3, Point3, Point3, Point3], regionRects: Map<string, Rect>): void {
    const crossing = this.model.crossings.find((candidate) => this.crosses(road, candidate));
    if (!crossing) {
      return;
    }
    const a = regionRects.get(crossing.from);
    const b = regionRects.get(crossing.to);
    if (!a || !b) {
      return;
    }
    const steps = 80;
    const points: Point3[] = [];
    for (let i = 0; i <= steps; i += 1) {
      const p = bezierAt(curve, i / steps);
      if (!inRect(a, [p[0], p[1]]) && !inRect(b, [p[0], p[1]])) {
        points.push(p);
      }
    }
    if (points.length < 2) {
      return;
    }
    svgElement("polyline", { class: "w-tunnel", points: points.map((p) => this.P(p[0], p[1], p[2])).join(" ") }, group);
    for (const p of [points[0], points[points.length - 1]]) {
      svgElement("ellipse", { class: "w-portal", "data-fixed": this.P(p[0], p[1], p[2]), rx: 4, ry: 9 }, group);
    }
    const mid = points[Math.floor(points.length / 2)];
    const at = project(this.camera, this.pivot, mid[0], mid[1], mid[2]);
    // The tag rests below the sleeve's middle; settling moves it off the labels and the pieces' outlines from there.
    const tag = svgElement("text", { class: "w-tag", "data-fixed": at.join(","), "text-anchor": "middle", dy: 24, "data-dy": 24 }, this.layers.labels);
    tag.textContent = `${crossing.over ?? "crossing"} · declared`;
  }

  /** The pieces a piece stands on: the things whose code it builds in. */
  private standsOnPieces(name: string): WorldRoad[] {
    return this.model.roads.filter((road) => road.kind === "stands" && road.from === name);
  }

  /** The pieces that stand on a piece. */
  private standingOn(name: string): WorldRoad[] {
    return this.model.roads.filter((road) => road.kind === "stands" && road.to === name);
  }

  /** Strands beneath a piece: one for each thing it stands on, another piece's code or what its manifests name outside. */
  private drawStrands(placed: Placed): void {
    const piece = this.model.pieces.find((candidate) => candidate.name === placed.name);
    const n = piece ? piece.standsOn.length + this.standsOnPieces(piece.name).length : 0;
    if (n === 0 || placed.form === "tank") {
      return;
    }
    const box = corners({ x: placed.x, y: placed.y, w: placed.w, d: placed.d });
    const near = box.map((c, i) => [depthOf(this.camera, this.pivot, c[0], c[1]), i] as [number, number]).sort((p, q) => q[0] - p[0])[0][1];
    const edges: Array<[Point2, Point2]> = [[box[near], box[(near + 1) % 4]], [box[near], box[(near + 3) % 4]]];
    const group = svgElement("g", { class: "w-strands", "data-piece": placed.name }, this.layers.roots);
    for (let i = 0; i < n; i += 1) {
      const [a, c] = edges[i % 2];
      const per = Math.ceil(n / 2);
      const t = 0.15 + 0.7 * (((i >> 1) + 0.5) / per);
      const p: Point2 = [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t];
      const length = LONGEST_STRAND - 7 * (2 - ((i * 7) % 3));
      const [sx, sy] = project(this.camera, this.pivot, p[0], p[1], placed.z0);
      const [ex, ey] = project(this.camera, this.pivot, p[0], p[1], placed.z0 - length);
      const wobble = (((i * 13) % 5) - 2) * 2.5;
      svgElement("path", { class: "w-root", d: `M${sx},${sy} Q${sx + wobble},${(sy + ey) / 2} ${ex + wobble * 0.6},${ey}` }, group);
    }
  }

  /** Tokens on the board for what two or more pieces share, each with a spoke to the pieces that stand on it. */
  private drawTokens(): void {
    const pieces = this.model.pieces.map((piece) => this.place(piece.name));
    const seeds: Point2[] = this.model.tokens.map((token) => {
      const users = token.users.map((name) => this.place(name));
      return [users.reduce((sum, b) => sum + b.cx, 0) / users.length, users.reduce((sum, b) => sum + b.cy, 0) / users.length];
    });
    const spread = spreadTokens(seeds, pieces.map((b) => [b.cx, b.cy]), 150, 200, this.bench);
    this.tokens = this.model.tokens.map((token, i) => ({ ...token, at: spread[i] }));
    for (const token of this.tokens) {
      const c = project(this.camera, this.pivot, token.at[0], token.at[1], 0);
      const group = svgElement("g", { class: "w-token", "data-token": token.key, "data-users": token.users.join(" ") }, this.layers.under);
      for (const name of token.users) {
        const b = this.place(name);
        const p = project(this.camera, this.pivot, b.cx, b.cy, 0);
        svgElement("line", { class: `w-spoke ${token.kind}`, x1: c[0], y1: c[1], x2: p[0], y2: p[1] }, group);
        svgElement("line", { class: "w-spoke-hit", x1: c[0], y1: c[1], x2: p[0], y2: p[1] }, group);
        svgElement("circle", { class: "w-station", r: 3, "data-fixed": p.join(",") }, group);
      }
      svgElement("rect", { class: "w-station", "data-fixed": c.join(","), x: -6, y: -6, width: 12, height: 12, rx: 2 }, group);
      const labelGroup = svgElement("g", { class: "w-token", "data-token": token.key, "data-users": token.users.join(" ") }, this.layers.labels);
      const text = svgElement("text", { class: `w-tokenlabel ${token.kind}`, "data-fixed": c.join(","), "text-anchor": "middle", dy: 22, "data-dy": 22 }, labelGroup);
      text.textContent = token.label;
      const kind = svgElement("tspan", { class: "k" }, text);
      kind.textContent = ` · ${token.kind}`;
    }
  }

  /** Each piece's name, and under it its kind and its files, standing above the top of the piece's outline. */
  private drawLabels(): void {
    for (const piece of this.model.pieces) {
      const placed = this.place(piece.name);
      const group = svgElement("g", { class: "w-label", "data-piece": piece.name }, this.layers.labels);
      const c = labelAnchor(this.camera, this.pivot, placed);
      const name = svgElement("text", { class: "w-name", "data-fixed": c.join(","), "text-anchor": "middle", dy: NAME_DY }, group);
      name.textContent = piece.name;
      const sub = svgElement("text", { class: "w-sub", "data-fixed": c.join(","), "text-anchor": "middle", dy: SUB_DY }, group);
      sub.textContent = piece.imagined ? (piece.kind ?? "") : `${piece.kind ? `${piece.kind} · ` : ""}${piece.files.length} file${piece.files.length === 1 ? "" : "s"}`;
    }
  }

  // ==========================================================================
  // The camera
  // ==========================================================================

  private viewport(): { width: number; height: number } {
    return { width: this.root.clientWidth || window.innerWidth, height: this.root.clientHeight || window.innerHeight };
  }

  /** Pans and zooms the drawing to the screen, keeping what stands at a fixed size at that size, and settles the labels. */
  private applyCamera(): void {
    if (this.pending === "camera") {
      this.pending = null;
    }
    this.placeCamera();
    this.settleLabels();
  }

  private placeCamera(): void {
    this.camGroup.setAttribute("transform", `translate(${this.screen.x} ${this.screen.y}) scale(${this.screen.k})`);
    for (const node of this.svg.querySelectorAll<SVGElement>("[data-fixed]")) {
      const [x, y] = (node.dataset.fixed ?? "0,0").split(",").map(Number);
      node.setAttribute("transform", `translate(${x} ${y}) scale(${1 / this.screen.k})`);
    }
  }

  /**
   * Asks for the drawing to catch up with the camera, or with a piece being dragged, at the next frame. A browser may
   * deliver several pointer moves or wheel steps between two frames, and each was drawn in full (2026-11-13); now the
   * frame draws once, from where the last of them left the camera.
   */
  private request(work: "draw" | "camera"): void {
    this.pending = this.pending === "draw" || work === "draw" ? "draw" : "camera";
    if (this.frame === 0) {
      this.frame = requestAnimationFrame(() => {
        this.frame = 0;
        this.flush();
      });
    }
  }

  /** Does now what the next frame was asked to do, so that the drawing and the camera agree, as when the pointer lets go. */
  private flush(): void {
    if (this.pending === "draw") {
      this.draw();
    } else if (this.pending === "camera") {
      this.applyCamera();
    }
  }

  /**
   * Keeps labels off each other and off the pieces' outlines, since a word
   * with an edge through it reads as struck out whichever piece the edge is
   * (2026-11-12). A thing's name, with its kind and its files under it,
   * stands above its own piece; while a nearer piece's label or any piece's
   * outline is in its way it moves up a line at most or sideways by up to half
   * its width, the line under it keeping to its height and finding its own
   * place aside; failing that, it stands below its piece, clear of the
   * strands, never on it; nearer pieces settle first. Where no move clears
   * both lines, the second goes and the name stands alone, as it does when the
   * world is zoomed out
   * and names draw together; the hover, the pinned panel and the keyboard's
   * name for the piece still say what it said. A region's label, a crossing's
   * tag, a token's label and a door's label, shown while its thing, its road
   * or the door itself is under the pointer or pinned, then settle in that
   * order: each moves a step up or down, a region's further since it names an
   * area, and all but a door's sideways, from where it rests until it covers
   * nothing, keeping clear of the labels settled before it.
   * Labels keep their size while the world scales, so this runs after every
   * camera move and every hover. Every label is read where it rests in one
   * batch, and every place it might go is arithmetic on that box.
   */
  private settleLabels(): void {
    if (!this.world.isConnected) {
      return;
    }
    const labels = this.layers.labels;
    const kinds = ["w-zone", "w-tag", "w-tokenlabel", "w-doorlabel"];
    // A door's label rests on the side its door faces; when no step up or down clears it there, it may cross to the other side of the door.
    const sidesOf = (node: SVGElement): Array<{ anchor: string; dx: string } | undefined> => (node.dataset.anchor
      ? [{ anchor: node.dataset.anchor, dx: node.dataset.dx ?? "0" }, { anchor: node.dataset.anchor === "end" ? "start" : "end", dx: String(-Number(node.dataset.dx ?? "0")) }]
      : [undefined]);
    const nearestFirst = this.model.pieces
      .map((piece) => ({ name: piece.name, depth: depthOf(this.camera, this.pivot, this.place(piece.name).cx, this.place(piece.name).cy) }))
      .sort((a, b) => b.depth - a.depth)
      .map((entry) => labels.querySelector<SVGGElement>(`.w-label[data-piece="${CSS.escape(entry.name)}"]`))
      .filter((group): group is SVGGElement => group !== null)
      .map((group) => ({ group, name: group.querySelector<SVGElement>("text.w-name"), sub: group.querySelector<SVGElement>("text.w-sub") }));
    const others = kinds.map((kind) => ({ kind, nodes: [...labels.querySelectorAll<SVGElement>(`text.${kind}`)].filter((node) => node.style.display !== "none") }));
    // Every label goes back to where it rests, and then every resting box is read at once, so that the page is laid out
    // once for all of them; until 2026-11-13 each label was put back and read in turn, the page laid out again for
    // each, about forty-five times a turn's move on this repository's board. The boxes are the browser's own, so that
    // ties between places break as they always did.
    for (const { name, sub } of nearestFirst) {
      for (const [node, dy] of [[name, NAME_DY], [sub, SUB_DY]] as Array<[SVGElement | null, number]>) {
        node?.setAttribute("dy", String(dy));
        node?.setAttribute("dx", "0");
      }
      if (sub) {
        sub.style.display = "";
      }
    }
    for (const { nodes } of others) {
      for (const node of nodes) {
        const side = sidesOf(node)[0];
        if (side) {
          node.setAttribute("text-anchor", side.anchor);
        }
        node.setAttribute("dx", String(Number(side?.dx ?? "0")));
        node.setAttribute("dy", String(Number(node.dataset.dy ?? node.getAttribute("dy") ?? "0")));
      }
    }
    const left = this.svgLeft();
    const top = this.svgTop();
    const rests = new Map<SVGElement, DOMRect>();
    for (const { name, sub } of nearestFirst) {
      for (const node of [name, sub]) {
        if (node) {
          rests.set(node, node.getBoundingClientRect());
        }
      }
    }
    for (const { nodes } of others) {
      for (const node of nodes) {
        rests.set(node, node.getBoundingClientRect());
      }
    }
    const outlineOf = new Map(this.model.pieces.map((piece) => [piece.name, silhouette(this.camera, this.pivot, this.place(piece.name)).map((p): Point2 => {
      const s = toScreen(this.screen, p);
      return [s[0] + left, s[1] + top];
    })]));
    const outlines = [...outlineOf.values()];
    // Interior sample points of visible call wires in client coordinates: used as a soft tie-breaker so piece labels
    // nudge off dense wire crossings when a collision-free slot exists, without ever disturbing already-clear boards.
    const wirePoints: Point2[] = [];
    for (const curve of this.roadCurves.values()) {
      for (let i = 1; i <= 15; i += 1) {
        const p = bezierAt(curve, i / 16);
        const s = toScreen(this.screen, project(this.camera, this.pivot, p[0], p[1], p[2]));
        wirePoints.push([s[0] + left, s[1] + top]);
      }
    }
    const wireHits = (box: ScreenBox): number => {
      let hits = 0;
      for (const [wx, wy] of wirePoints) {
        if (wx >= box.left - 3 && wx <= box.right + 3 && wy >= box.top - 3 && wy <= box.bottom + 3) {
          hits += 1;
        }
      }
      return hits;
    };
    // How far below its outline a piece's strands hang on the screen, which a label below the piece keeps clear of.
    const strands = LONGEST_STRAND * Math.cos(this.camera.phi) * this.screen.k;
    // Visible HUD chrome (title crumbs, top toolbar, help button) is treated as hard obstacles with 6 px breathing room
    // so no label ever sits on top of the toolbar or "?" control at default fit, rotated, tilted, or zoomed views.
    const chromePad = 6;
    const chromeBoxes: ScreenBox[] = [this.crumbs, this.tools, this.helpButton]
      .map((node) => node.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.height > 0)
      .map((rect) => ({ left: rect.left - chromePad, top: rect.top - chromePad, right: rect.right + chromePad, bottom: rect.bottom + chromePad }));
    const placed: ScreenBox[] = [];
    // Zero-tolerance overlap for piece names, zone banners, tags, and HUD chrome (removing the old -1 px slack that let
    // "REPOSITORY" graze "library · 207 files" and "GITHUB" graze "live-docs"). Door labels keep the original 1 px halo
    // slack against other labels so dense door stacks stay tightly grouped beside their piece and never displace the
    // piece's pinned evidence panel onto a neighbour.
    const rectOverlap = (a: ScreenBox, b: ScreenBox, slack = 0): number =>
      Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left) - slack)
      * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) - slack);
    const covered = (box: ScreenBox, labelSlack = 0): number =>
      placed.reduce((sum, other) => sum + rectOverlap(box, other, labelSlack), 0)
      + chromeBoxes.reduce((sum, chrome) => sum + rectOverlap(box, chrome, 0) * 4, 0)
      + outlines.reduce((sum, outline) => sum + coveredArea(box, outline), 0);
    const moved = (box: ScreenBox, dx: number, dy: number): ScreenBox => ({ left: box.left + dx, right: box.right + dx, top: box.top + dy, bottom: box.bottom + dy });
    // A region's name labels an area, not a point, so it may travel further along the region's side than the others.
    // Door labels include fine vertical steps so dense multi-door walls (e.g. live-docs) stack with 0 px² overlap.
    const steps: Record<string, number[]> = { "w-zone": [0, -18, 18, -36, 36, -54, 54, -72, 72], "w-tag": [0, -20, 20, -40, 40, -60, 60], "w-tokenlabel": [0, -52, 18, -70, 36, -88, 54, -106, 72], "w-doorlabel": [0, -4, 4, -8, 8, -14, 14, -20, 20, -28, 28, -42, 42, -56, 56, -70, 70, -84, 84] };
    const doorBoxes: ScreenBox[] = [];
    const subsShown = new Map<SVGElement, ScreenBox>();
    // A piece's name takes the smallest move where it covers nothing and the line under it, at the same height, has a
    // place that covers nothing, under the name or aside by up to half the label's width (preferring a move clear of
    // passing wires when one exists); failing that, the name alone where it covers nothing, and the line under it goes;
    // failing that, the name where it covers least.
    for (const { group, name, sub } of nearestFirst) {
      const nameBox = name ? rests.get(name) : undefined;
      if (!name || !nameBox) {
        continue;
      }
      const subRect = sub ? rests.get(sub) : undefined;
      const subBox = subRect && subRect.width > 0 ? subRect : undefined;
      const span = Math.max(nameBox.width, subBox?.width ?? 0);
      // Below its piece, the name's top stands a few pixels under the lowest of the outline and its strands.
      const own = outlineOf.get(group.dataset.piece ?? "") ?? [];
      const below = own.length ? Math.max(...own.map((p) => p[1])) + strands + 4 - nameBox.top : 0;
      const drop = (move: LabelMove): number => move.rise + (move.below ? below : 0);
      const nameCover = (move: LabelMove): number => covered(moved(nameBox, move.shift * span, drop(move)));
      // The line under the name, at the name's height: under the name first, then aside (wire-clear shifts first).
      const subPlace = (move: LabelMove): number | undefined => {
        if (!subBox) {
          return undefined;
        }
        const candidates = [move.shift, ...SHIFTS.filter((shift) => shift !== move.shift)]
          .filter((shift) => covered(moved(subBox, shift * span, drop(move))) === 0);
        if (!candidates.length) {
          return undefined;
        }
        return candidates.reduce((best, shift) => (
          wireHits(moved(subBox, shift * span, drop(move))) < wireHits(moved(subBox, best * span, drop(move))) ? shift : best
        ));
      };
      const clearPairs = LABEL_MOVES
        .map((candidate) => ({ candidate, subShift: subPlace(candidate) }))
        .filter(({ candidate, subShift }) => nameCover(candidate) === 0 && (!subBox || subShift !== undefined));
      let move: LabelMove | undefined;
      let subShift: number | undefined;
      if (clearPairs.length) {
        const pairWires = (entry: { candidate: LabelMove; subShift: number | undefined }): number =>
          wireHits(moved(nameBox, entry.candidate.shift * span, drop(entry.candidate)))
          + (subBox && entry.subShift !== undefined ? wireHits(moved(subBox, entry.subShift * span, drop(entry.candidate))) : 0);
        const best = clearPairs.reduce((winner, entry) => (pairWires(entry) < pairWires(winner) ? entry : winner));
        move = best.candidate;
        subShift = best.subShift;
      }
      if (!move) {
        const clearNames = LABEL_MOVES.filter((candidate) => nameCover(candidate) === 0);
        move = clearNames.length
          ? clearNames.reduce((best, candidate) => (wireHits(moved(nameBox, candidate.shift * span, drop(candidate))) < wireHits(moved(nameBox, best.shift * span, drop(best))) ? candidate : best))
          : LABEL_MOVES.reduce((best, candidate) => (nameCover(candidate) < nameCover(best) ? candidate : best));
        subShift = undefined;
      }
      name.setAttribute("dx", String(move.shift * span));
      name.setAttribute("dy", String(NAME_DY + drop(move)));
      placed.push(moved(nameBox, move.shift * span, drop(move)));
      if (sub) {
        sub.style.display = subShift === undefined ? "none" : "";
        if (subShift !== undefined && subBox) {
          sub.setAttribute("dx", String(subShift * span));
          sub.setAttribute("dy", String(SUB_DY + drop(move)));
          const box = moved(subBox, subShift * span, drop(move));
          placed.push(box);
          subsShown.set(sub, box);
        }
      }
    }
    // A region's label, a crossing's tag, a token's label and a door's label then settle in that order: each takes the
    // first step from where it rests that covers nothing, or else the one covering least. Region banners keep 6 px of
    // breathing room from piece labels and outlines when a padded slot is clear so banners like GITHUB never kiss a
    // neighbouring piece subtitle (2026-11-24).
    for (const { kind, nodes } of others) {
      for (const node of nodes) {
        const resting = rests.get(node);
        if (!resting || resting.width <= 0) {
          continue;
        }
        const rest = Number(node.dataset.dy ?? node.getAttribute("dy") ?? "0");
        const sides = sidesOf(node);
        // A door's label keeps to its door; a region's banner may travel up to a full width sideways to stay clear of
        // pieces, labels, and HUD controls on narrower viewports; any other moves by up to half its width.
        const shifts = node.dataset.anchor ? [0] : kind === "w-zone" ? [0, -0.25, 0.25, -0.5, 0.5, -0.75, 0.75, -1, 1, -1.25, 1.25] : SHIFTS;
        const labelSlack = 0;
        const zonePad = kind === "w-zone" ? 6 : 0;
        let best = { dy: rest, dx: Number(node.dataset.dx ?? "0"), cover: Number.POSITIVE_INFINITY, padded: Number.POSITIVE_INFINITY, wires: Number.POSITIVE_INFINITY, side: sides[0], box: resting as ScreenBox, sideDx: 0 };
        search: for (const [index, side] of sides.entries()) {
          const sideDx = Number(side?.dx ?? "0");
          let box: DOMRect = resting;
          if (index > 0 && side) {
            // The other side of a door is measured where it stands, only when the first side found no clear place.
            node.setAttribute("text-anchor", side.anchor);
            node.setAttribute("dx", String(sideDx));
            node.setAttribute("dy", String(rest));
            box = node.getBoundingClientRect();
          }
          // A door sits on its piece's wall, so its label starts just beyond the piece's outline at the label's height.
          const own = side ? outlineOf.get(node.dataset.piece ?? "") : undefined;
          for (const step of steps[kind]) {
            for (const shift of shifts) {
              const candidate = moved(box, shift * box.width, step);
              const span = own ? spanWithin(own, candidate.top, candidate.bottom) : undefined;
              const beyond = !span ? 0 : side?.anchor === "end" ? Math.min(0, span[0] - 4 - candidate.right) : Math.max(0, span[1] + 4 - candidate.left);
              const positioned = moved(candidate, beyond, 0);
              const cover = covered(positioned, labelSlack);
              const padded = zonePad > 0
                ? covered({ left: positioned.left - zonePad, right: positioned.right + zonePad, top: positioned.top - zonePad, bottom: positioned.bottom + zonePad }, 0)
                : cover;
              const wires = kind === "w-zone" ? wireHits(positioned) : 0;
              if (cover < best.cover || (cover === best.cover && (padded < best.padded || (padded === best.padded && wires < best.wires)))) {
                best = { dy: rest + step, dx: sideDx + shift * box.width + beyond, cover, padded, wires, side, box, sideDx };
              }
              if (cover === 0 && padded === 0 && wires === 0) {
                break search;
              }
            }
          }
        }
        if (best.side) {
          node.setAttribute("text-anchor", best.side.anchor);
        }
        node.setAttribute("dx", String(best.dx));
        node.setAttribute("dy", String(best.dy));
        const box = moved(best.box, best.dx - best.sideDx, best.dy - rest);
        placed.push(box);
        if (kind === "w-doorlabel") {
          doorBoxes.push(box);
        }
      }
    }
    // A sub-line that a door's label still covers goes, as it does under a name: the pinned panel says the same words.
    for (const [node, box] of subsShown) {
      if (doorBoxes.some((other) => Math.min(box.right, other.right) - Math.max(box.left, other.left) > 1 && Math.min(box.bottom, other.bottom) - Math.max(box.top, other.top) > 1)) {
        node.style.display = "none";
      }
    }
  }

  private fitParams(): Screen {
    return fitScreen(this.camera, this.pivot, corners(this.bench), this.viewport());
  }

    /** Pans and zooms so that the whole board is in view. */
  fit(): void {
    this.screen = this.fitParams();
    this.applyCamera();
  }

  private zoomBy(factor: number, px: number, py: number): void {
    this.screen = zoomAt(this.screen, factor, px, py);
    this.applyCamera();
  }

  private setCamera(theta: number, phi: number, pivot?: { s: Point2; w: Point2 }): void {
    this.turnTo(theta, phi, pivot);
    this.draw();
  }

  /** Turns the camera, keeping a board point under the same screen point if one is given, and draws nothing. */
  private turnTo(theta: number, phi: number, pivot?: { s: Point2; w: Point2 }): void {
    this.camera = { theta, phi: clamp(phi, MIN_ELEVATION, TOP_DOWN) };
    if (pivot) {
      const s = toScreen(this.screen, project(this.camera, this.pivot, pivot.w[0], pivot.w[1], 0));
      this.screen = { ...this.screen, x: this.screen.x + pivot.s[0] - s[0], y: this.screen.y + pivot.s[1] - s[1] };
    }
  }

  private pivotAt(sx: number, sy: number): { s: Point2; w: Point2 } {
    const [px, py] = fromScreen(this.screen, sx, sy);
    return { s: [sx, sy], w: unproject(this.camera, this.pivot, px, py) };
  }

  /**
   * Eases a change over `ms`, or makes it at once: for a test's handle, and for a person whose system asks for reduced
   * motion, read at each change so that a choice made while the page is open counts.
   */
  private tween(ms: number, step: (t: number) => void): Promise<void> {
    if (this.instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      step(1);
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const start = performance.now();
      const frame = (now: number): void => {
        const t = Math.min(1, (now - start) / ms);
        step(t);
        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(frame);
    });
  }

  /**
   * Eases the camera to an azimuth and elevation about the centre of the view; or, given where the picture should end,
   * eases the pan and zoom there with it: the board refitted, or a framing kept from before.
   */
  async orbitTo(theta: number, phi: number, ms = 520, finish?: "fit" | Screen): Promise<void> {
    const from = { ...this.camera };
    const to = { theta, phi: clamp(phi, MIN_ELEVATION, TOP_DOWN) };
    const { width, height } = this.viewport();
    const pivot = this.pivotAt(width / 2, height / 2);
    let end: Screen | null = null;
    if (finish === "fit") {
      const kept = this.camera;
      this.camera = to;
      end = this.fitParams();
      this.camera = kept;
    } else if (finish) {
      end = { ...finish };
    }
    const screen0 = { ...this.screen };
    // The pan and zoom move first, so that each frame is drawn once.
    await this.tween(ms, (t) => {
      const k = smooth(t);
      if (end) {
        this.screen = { k: screen0.k + (end.k - screen0.k) * k, x: screen0.x + (end.x - screen0.x) * k, y: screen0.y + (end.y - screen0.y) * k };
      }
      this.setCamera(from.theta + (to.theta - from.theta) * k, from.phi + (to.phi - from.phi) * k, end ? undefined : pivot);
    });
    if (end) {
      this.screen = end;
    }
    this.setCamera(to.theta, to.phi, end ? undefined : pivot);
    this.syncButtons();
  }

    /** Turns the camera by an angle, easing. */
  rotateBy(radians: number): Promise<void> {
    return this.orbitTo(this.camera.theta + radians, this.camera.phi);
  }

  /**
   * Straight down, squared to the screen at the nearest squared azimuth, with the whole board in view, which from
   * straight above at another azimuth squares the board where it stands; or, once there, back up: to the view it looked
   * down from if the camera has not turned since, else on an eighth turn to the resting elevation.
   */
  topDown(): Promise<void> {
    if (looksDown(this.camera)) {
      const to = lookUp(this.camera, this.lookedDown ?? undefined);
      this.lookedDown = null;
      return this.orbitTo(to.theta, to.phi, 520, "fit");
    }
    const above = lookDown(this.camera);
    this.lookedDown = { from: { ...this.camera }, above };
    return this.orbitTo(above.theta, above.phi, 520, "fit");
  }

  // ==========================================================================
  // Hover, pin, evidence
  // ==========================================================================

  private applyHover(): void {
    const h = this.pinned ?? this.hover;
    const roads = [...this.svg.querySelectorAll<SVGElement>(".w-road-group")];
    const pieces = [...this.camGroup.querySelectorAll<SVGElement>("[data-piece]")];
    const tokens = [...this.svg.querySelectorAll<SVGElement>(".w-token")];
    const doorLabels = [...this.svg.querySelectorAll<SVGElement>("text.w-doorlabel")];
    for (const node of [...roads, ...pieces, ...tokens]) {
      node.classList.remove("dim", "dim-soft");
    }
    for (const node of doorLabels) {
      node.style.display = "none";
    }
    if (h?.kind === "road") {
      const road = this.model.roads.find((candidate) => candidate.id === h.id);
      for (const node of roads) {
        if (node.dataset.road !== h.id) {
          node.classList.add("dim");
        }
      }
      for (const node of pieces) {
        if (road && node.dataset.piece !== road.from && node.dataset.piece !== road.to) {
          node.classList.add("dim-soft");
        }
      }
      for (const node of doorLabels) {
        if ((node.dataset.roads ?? "").split(" ").includes(h.id)) {
          node.style.display = "inline";
        }
      }
    } else if (h?.kind === "piece") {
      const touching = new Set(this.model.roads.filter((road) => road.from === h.id || road.to === h.id).map((road) => road.id));
      const near = new Set([h.id, ...this.model.roads.filter((road) => touching.has(road.id)).flatMap((road) => [road.from, road.to])]);
      for (const node of roads) {
        if (node.dataset.road && !touching.has(node.dataset.road)) {
          node.classList.add("dim");
        }
      }
      for (const node of pieces) {
        if (!near.has(node.dataset.piece ?? "")) {
          node.classList.add("dim-soft");
        }
      }
      for (const node of doorLabels) {
        if (node.dataset.piece === h.id) {
          node.style.display = "inline";
        }
      }
      for (const node of tokens) {
        if (!(node.dataset.users ?? "").split(" ").includes(h.id)) {
          node.classList.add("dim");
        }
      }
    } else if (h?.kind === "token") {
      const token = this.tokens.find((candidate) => candidate.key === h.id);
      for (const node of tokens) {
        if (node.dataset.token !== h.id) {
          node.classList.add("dim");
        }
      }
      for (const node of pieces) {
        if (token && !token.users.includes(node.dataset.piece ?? "")) {
          node.classList.add("dim-soft");
        }
      }
      for (const node of roads) {
        node.classList.add("dim");
      }
    } else if (h?.kind === "door") {
      const door = this.doors.find((candidate) => candidate.key === h.id);
      for (const node of doorLabels) {
        if (door && node.dataset.piece === door.piece) {
          node.style.display = "inline";
        }
      }
      for (const node of roads) {
        if (door && node.dataset.road && !door.roads.includes(node.dataset.road)) {
          node.classList.add("dim");
        }
      }
    } else if (h?.kind === "region") {
      const region = this.model.regions.find((candidate) => candidate.name === h.id);
      for (const node of pieces) {
        if (region && !region.pieces.includes(node.dataset.piece ?? "")) {
          node.classList.add("dim-soft");
        }
      }
    }
    // Labels first: a piece's panel stands clear of the piece's label where it has settled.
    this.settleLabels();
    // Nothing about the hover changes while a drag is under way, and the panel was written and placed again on every
    // frame of it (2026-11-13); it is placed again once the pointer lets go.
    if (!this.drag?.moved) {
      this.showEvidence(h);
    }
  }

  private showEvidence(h: Hover | null): void {
    const box = this.evidence;
    if (!h) {
      box.style.display = "none";
      box.classList.remove("pinned");
      return;
    }
    const pinned = this.pinned !== null && this.pinned.kind === h.kind && this.pinned.id === h.id;
    if (pinned && box.dataset.pin === `${h.kind}:${h.id}`) {
      return;
    }
    const keyboardWasHere = box.contains(document.activeElement);
    const { head, body } = this.evidenceFor(h, pinned);
    // The head holds what the panel is about and, pinned, its close control; it stays at the top while the rest scrolls.
    box.innerHTML = `<div class="head">${head}</div>${body}`;
    box.style.display = "block";
    box.classList.toggle("pinned", pinned);
    box.dataset.pin = pinned ? `${h.kind}:${h.id}` : "";
    if (pinned) {
      const close = iconButton("Close", CLOSE_ICON);
      close.className = "close";
      close.title = "Close (Esc)";
      close.setAttribute("aria-keyshortcuts", "Escape");
      close.addEventListener("click", () => this.unpin());
      box.querySelector(".head")?.append(close);
      box.setAttribute("role", "region");
      box.setAttribute("aria-label", h.id);
    } else {
      box.removeAttribute("role");
      box.removeAttribute("aria-label");
    }
    this.placeEvidence(h, pinned);
    // A name followed from the keyboard inside the panel draws a new panel: the keyboard stays in it.
    if (pinned && keyboardWasHere) {
      box.focus();
    }
  }

  /**
   * Where the panel stands. A piece's panel, pinned or peeking at the keyboard's piece, and any wire's panel stand
   * beside their subject, never on it, inside the view below the tools, and as clear as they can be of wired pieces
   * and visible board labels; any other panel, and a peek at the pointer's piece, follows the pointer.
   */
  private placeEvidence(h: Hover, pinned: boolean): void {
    const box = this.evidence;
    const { width, height } = this.viewport();
    // Measured at the left edge, where nothing narrows it, so that its size is its own wherever it then stands.
    box.style.left = "0px";
    box.style.top = "0px";
    const rect = box.getBoundingClientRect();
    if (h.kind === "piece" && (pinned || this.focused === h.id)) {
      const wired = new Set(this.model.roads.filter((road) => road.from === h.id || road.to === h.id).flatMap((road) => [road.from, road.to]));
      const avoid = this.panelAvoid(h.id, wired);
      const at = panelBeside(this.pieceBox(h.id), { width: rect.width, height: rect.height }, this.panelRoom(), avoid);
      box.style.left = `${at.left}px`;
      box.style.top = `${at.top}px`;
      return;
    }
    if (h.kind === "road") {
      const road = this.model.roads.find((candidate) => candidate.id === h.id);
      if (road) {
        const endpoints = new Set([road.from, road.to]);
        const avoid = this.panelAvoid(undefined, endpoints, 3);
        const at = panelBeside(this.roadBox(road), { width: rect.width, height: rect.height }, this.panelRoom(), avoid);
        box.style.left = `${at.left}px`;
        box.style.top = `${at.top}px`;
        return;
      }
    }
    box.style.left = `${clamp(this.lastPointer[0] + 18, 12, width - rect.width - 12)}px`;
    box.style.top = `${clamp(this.lastPointer[1] + 18, 12, height - rect.height - 12)}px`;
  }

  /**
   * Obstacles an evidence panel avoids, in view pixels: every other piece's footprint and every visible piece, door,
   * crossing, and region label on the board, weighted so the panel never slices through a visible name or endpoint
   * when open board space exists (2026-11-24).
   */
  private panelAvoid(excludePiece: string | undefined, priorityPieces: ReadonlySet<string>, priorityWeight = 1): Avoid[] {
    const avoid: Avoid[] = this.model.pieces
      .filter((piece) => piece.name !== excludePiece)
      .map((piece) => ({ box: this.pieceBox(piece.name), weight: priorityPieces.has(piece.name) ? priorityWeight : 0.25 }));
    const left = this.svgLeft();
    const top = this.svgTop();
    for (const text of this.layers.labels.querySelectorAll<SVGElement>("text")) {
      if (text.style.display === "none") {
        continue;
      }
      const owner = text.dataset.piece ?? text.closest<SVGElement>("[data-piece]")?.dataset.piece;
      if (excludePiece && owner === excludePiece && !text.classList.contains("w-doorlabel")) {
        continue;
      }
      const r = text.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        const weight = text.classList.contains("w-doorlabel") || (owner !== undefined && priorityPieces.has(owner)) ? 2 : 1.5;
        avoid.push({ box: { left: r.left - left - 4, top: r.top - top - 3, right: r.right - left + 4, bottom: r.bottom - top + 3 }, weight });
      }
    }
    return avoid;
  }

  /** A wire's screen bounds, in view pixels: its projected curve when drawn, or the midpoint between its two endpoints. */
  private roadBox(road: WorldRoad): ScreenBox {
    const curve = this.roadCurves.get(road.id);
    if (curve) {
      const pts: Point2[] = [];
      for (let i = 0; i <= 8; i += 1) {
        const p = bezierAt(curve, i / 8);
        pts.push(toScreen(this.screen, project(this.camera, this.pivot, p[0], p[1], p[2])));
      }
      return {
        left: Math.min(...pts.map((p) => p[0])) - 8,
        top: Math.min(...pts.map((p) => p[1])) - 8,
        right: Math.max(...pts.map((p) => p[0])) + 8,
        bottom: Math.max(...pts.map((p) => p[1])) + 8
      };
    }
    const a = this.pieceBox(road.from);
    const b = this.pieceBox(road.to);
    const cx = ((a.left + a.right) / 2 + (b.left + b.right) / 2) / 2;
    const cy = ((a.top + a.bottom) / 2 + (b.top + b.bottom) / 2) / 2;
    return { left: cx - 12, top: cy - 12, right: cx + 12, bottom: cy + 12 };
  }

  /** The room a panel has, in the view's pixels: inside the view, below the board's title and tools. */
  private panelRoom(): ScreenBox {
    const { width, height } = this.viewport();
    const below = this.hud.getBoundingClientRect().bottom - this.svgTop();
    return { left: 12, top: Math.max(12, below + 8), right: width - 12, bottom: height - 12 };
  }

  /** A piece on the screen, in the view's pixels: its outline and the label above it. */
  private pieceBox(name: string): ScreenBox {
    const outline = silhouette(this.camera, this.pivot, this.place(name)).map((p) => toScreen(this.screen, p));
    const box = {
      left: Math.min(...outline.map((p) => p[0])),
      top: Math.min(...outline.map((p) => p[1])),
      right: Math.max(...outline.map((p) => p[0])),
      bottom: Math.max(...outline.map((p) => p[1]))
    };
    const left = this.svgLeft();
    const top = this.svgTop();
    for (const text of this.layers.labels.querySelectorAll<SVGElement>(`.w-label[data-piece="${CSS.escape(name)}"] text`)) {
      const rect = text.getBoundingClientRect();
      if (rect.width > 0) {
        box.left = Math.min(box.left, rect.left - left);
        box.top = Math.min(box.top, rect.top - top);
        box.right = Math.max(box.right, rect.right - left);
        box.bottom = Math.max(box.bottom, rect.bottom - top);
      }
    }
    return box;
  }

  /**
   * The panel's words for what the pointer is on, a peek on hover and everything when pinned: its head, the line that
   * names it, and its body.
   */
  private evidenceFor(h: Hover, full: boolean): { head: string; body: string } {
    const nothing = { head: "", body: "" };
    const title = (name: string, tier: string): string => `<div class="h">${name}<span class="tier">${tier}</span></div>`;
    if (h.kind === "road") {
      const road = this.model.roads.find((candidate) => candidate.id === h.id);
      if (!road) {
        return nothing;
      }
      const verb = road.kind === "call" ? "calls" : "stands on";
      const door = road.door ? `<div>${escapeHtml(road.door.name)}${road.door.kind ? ` <span class="k">· ${escapeHtml(road.door.kind)}</span>` : ""}</div>` : "";
      const over = road.over ? `<div><span class="k">over</span> ${escapeHtml(road.over)}</div>` : "";
      const meaning = road.kind === "stands" ? `<div class="k">its code built in; no call crosses this while they run</div>` : "";
      const shown = full ? road.lines : road.lines.slice(0, 6);
      const lines = shown.map((line) => {
        // When the door heading already names this exact symbol/procedure, avoid repeating it directly beneath itself.
        const via = road.door && line.label === road.door.name ? "" : `<div class="via">${escapeHtml(line.label)}</div>`;
        return `${via}<div class="f">${this.fileLink(line.from)} &rarr; ${this.fileLink(line.to)}</div>`;
      }).join("");
      const more = road.lines.length > shown.length ? `<div class="src">and ${road.lines.length - shown.length} more; click to pin and see them all</div>` : "";
      const source = road.basis === "declared" ? `<div class="src">declared on the board</div>` : `<div class="src">${road.count} reference${road.count === 1 ? "" : "s"} in the docs</div>`;
      // The wire's own way down (Tuning's Way Down, a trial of 2026-11-22): the files at its two ends, both kept. A
      // declared wire has no file behind it and offers none.
      const open = full && road.lines.length && this.onOpenWire && this.carriesQuestion()
        ? `<a href="#" class="open" data-open-road="${escapeHtml(road.id)}">open ${escapeHtml(road.from)} and ${escapeHtml(road.to)}</a>` : "";
      return { head: title(`${this.pinLink("piece", road.from)} ${verb} ${this.pinLink("piece", road.to)}`, BASIS_WORDS[road.basis]), body: `${door}${over}${meaning}${lines}${more}${open}${source}` };
    }
    if (h.kind === "piece") {
      const piece = this.model.pieces.find((candidate) => candidate.name === h.id);
      if (!piece) {
        return nothing;
      }
      const folder = piece.folder ?? "";
      const inside = (file: string): string => (folder && file.startsWith(`${folder}/`) ? file.slice(folder.length + 1) : file);
      const regions = regionsOf(this.model, piece.name);
      const calls = [...new Set(this.model.roads.filter((road) => road.kind === "call" && road.from === piece.name).map((road) => road.to))];
      const calledBy = [...new Set(this.model.roads.filter((road) => road.kind === "call" && road.to === piece.name).map((road) => road.from))];
      const onPieces = this.standsOnPieces(piece.name).map((road) => road.to);
      const under = this.standingOn(piece.name).map((road) => road.from);
      const ghosts = piece.ghosts.map((ghost) => (full
        ? `<span class="f">${escapeHtml(ghost.label)} <span class="k">· ${BASIS_WORDS[ghost.basis]}, in ${ghost.files.map((file) => this.fileLink(file, inside(file))).join(", ")}</span></span>`
        : escapeHtml(ghost.label)));
      const packages = piece.standsOn.filter((item) => item.label.includes("@"));
      const references = piece.standsOn.filter((item) => !item.label.includes("@"));
      const manifests = [...new Set(piece.standsOn.map((item) => item.manifest))];
      const stands = [
        ...onPieces.map((name) => this.pinLink("piece", name)),
        packages.length ? `${packages.length} package${packages.length === 1 ? "" : "s"}` : "",
        references.length ? `${references.length} reference${references.length === 1 ? "" : "s"}` : ""
      ].filter(Boolean).join(", ");
      const served = piece.doors.map((door) => (full
        ? `<span class="f">${escapeHtml(door.name)} <span class="k">· ${escapeHtml(door.kind)}${door.file ? ` in ${this.fileLink(door.file, inside(door.file))}` : ", declared"}</span></span>`
        : escapeHtml(door.name)));
      const standsList = full && piece.standsOn.length ? `<div class="list">${piece.standsOn.map((item) => `<span class="f">${escapeHtml(item.label)} <span class="k">in ${this.fileLink(item.manifest, inside(item.manifest))}</span></span>`).join("")}</div>` : "";
      const named = piece.standsOn.length && !full ? `<div class="src">named in ${manifests.map((manifest) => this.fileLink(manifest, inside(manifest))).join(", ")}</div>` : "";
      // What the piece is, who it talks to, the way inside, and last its files, folded behind their count when pinned
      // (2026-11-12: a newcomer found 213 file names first and "called by" and "open" ten panel-heights down).
      const what = piece.imagined ? `<div>imagined: no folder yet, nothing inside to open</div>` : piece.folder ? `<div class="k">${escapeHtml(piece.folder)}</div>` : "";
      const talks = (served.length ? `<div class="via"><span class="k">offers</span> ${full ? `<div class="list">${served.join("")}</div>` : served.join(", ")}</div>` : "")
        + (calls.length ? `<div class="via"><span class="k">calls</span> ${calls.map((name) => this.pinLink("piece", name)).join(", ")}</div>` : "")
        + (calledBy.length ? `<div class="via"><span class="k">called by</span> ${calledBy.map((name) => this.pinLink("piece", name)).join(", ")}</div>` : "")
        + (ghosts.length ? `<div class="via"><span class="k">calls out to</span> ${full ? `<div class="list">${ghosts.join("")}</div><div class="src">nothing on the board serves ${ghosts.length === 1 ? "it" : "them"}; a ghost until something does</div>` : ghosts.join(", ")}</div>` : "")
        + (stands ? `<div class="via"><span class="k">stands on</span> ${stands}</div>${standsList}${named}` : "")
        + (under.length ? `<div class="via"><span class="k">under</span> ${under.map((name) => this.pinLink("piece", name)).join(", ")}</div>` : "");
      const open = piece.folder && full ? `<a href="#" class="open" data-open="${escapeHtml(piece.name)}">open ${escapeHtml(piece.name)}</a>` : "";
      const count = `${piece.files.length} file${piece.files.length === 1 ? "" : "s"} · ${piece.symbols} symbol${piece.symbols === 1 ? "" : "s"}`;
      const files = piece.imagined
        ? ""
        : full && piece.files.length
          ? `<details class="files"><summary>${count}</summary><div class="list">${piece.files.map((file) => `<span class="f">${this.fileLink(file, inside(file))}</span>`).join("")}</div></details>`
          : `<div class="src">${count}</div>`;
      const tier = `${escapeHtml(piece.kind ?? "thing")}${regions.length ? ` · ${regions.map((region) => this.pinLink("region", region.name)).join(" · ")}` : ""}`;
      return { head: title(escapeHtml(piece.name), tier), body: `${what}${talks}${open}${files}` };
    }
    if (h.kind === "token") {
      const token = this.tokens.find((candidate) => candidate.key === h.id);
      if (!token) {
        return nothing;
      }
      const rows: string[] = [];
      for (const user of token.users) {
        const item = this.model.pieces.find((candidate) => candidate.name === user)?.standsOn.find((candidate) => candidate.label === token.label);
        rows.push(`<span class="f">${this.pinLink("piece", user)}${item ? ` <span class="k">in ${this.fileLink(item.manifest)}</span>` : ""}</span>`);
      }
      return {
        head: title(escapeHtml(token.label), token.kind),
        body: full ? `<div class="via"><span class="k">under</span></div><div class="list">${rows.join("")}</div>` : `<div><span class="k">under</span> ${token.users.map((user) => this.pinLink("piece", user)).join(", ")}</div><div class="src">named in the manifests</div>`
      };
    }
    if (h.kind === "door") {
      const door = this.doors.find((candidate) => candidate.key === h.id);
      if (!door) {
        return nothing;
      }
      if (door.ghost) {
        const from = door.ghost.files.map((file) => this.fileLink(file)).join(", ");
        return { head: title(escapeHtml(door.label), "a ghost"), body: `<div class="k">a call ${this.pinLink("piece", door.piece)} makes that nothing on the board serves; point at the folder that serves it and it becomes a wire</div><div><span class="k">from</span> ${from}</div><div class="src">${BASIS_WORDS[door.ghost.basis]}</div>` };
      }
      if (door.declared) {
        return { head: title(escapeHtml(door.label), "a door declared"), body: `<div class="k">a door ${this.pinLink("piece", door.piece)} promises on the board that nothing on the board uses; a thing that called it would draw a wire</div><div class="src">${escapeHtml(door.declared.kind)}, declared</div>` };
      }
      const served = door.role === "offers" ? this.model.pieces.find((candidate) => candidate.name === door.piece)?.doors.find((candidate) => candidate.name === door.label) : undefined;
      const where = served?.file ? `<div class="src">in ${this.fileLink(served.file)}</div>` : "";
      return { head: title(escapeHtml(door.label), door.role === "offers" ? "a door that offers" : "a door that uses"), body: `<div class="k">${escapeHtml(door.sub)}</div><div><span class="k">on</span> ${this.pinLink("piece", door.piece)}</div>${where}` };
    }
    if (h.kind === "region") {
      const region = this.model.regions.find((candidate) => candidate.name === h.id);
      if (!region) {
        return nothing;
      }
      const isRegion = (name: string): boolean => this.model.regions.some((candidate) => candidate.name === name);
      return { head: title(escapeHtml(region.name), escapeHtml(region.kind ?? "region")), body: `<div><span class="k">holds</span> ${region.holds.map((name) => this.pinLink(isRegion(name) ? "region" : "piece", name)).join(", ")}</div>` };
    }
    const crossing = this.model.crossings.find((candidate) => candidate.id === h.id);
    return crossing
      ? { head: title(`${this.pinLink("region", crossing.from)} and ${this.pinLink("region", crossing.to)}`, "declared"), body: `${crossing.over ? `<div><span class="k">over</span> ${escapeHtml(crossing.over)}</div>` : ""}<div class="src">declared on the board</div>` }
      : nothing;
  }

  /** A name in a panel that pins the thing it names. */
  private pinLink(kind: Hover["kind"], id: string): string {
    return `<a href="#" class="pin" data-pin-kind="${escapeHtml(kind)}" data-pin-id="${escapeHtml(id)}">${escapeHtml(id)}</a>`;
  }

  /** A file in a panel that opens in the Local Map. */
  private fileLink(file: string, text = file): string {
    return `<a class="file" href="${escapeHtml(localMapHref(file))}" data-file="${escapeHtml(file)}">${escapeHtml(text)}</a>`;
  }

    /** Pins what the pointer is on, so the panel stays and every name in it is a link. */
  pin(h: Hover): void {
    this.pinned = h;
    this.evidence.dataset.pin = "";
    this.applyHover();
    this.sayPinnedThing();
  }

  /** Draws the pinned panel again where a setting has changed what it offers (Tuning's Way Down). */
  redrawPanel(): void {
    this.evidence.dataset.pin = "";
    this.showEvidence(this.pinned ?? this.hover);
  }

  /** Tells the page which thing with a folder is pinned, so that its bar can ask a path from it; none for any other pin. */
  private sayPinnedThing(): void {
    const piece = this.pinned?.kind === "piece" ? this.model.pieces.find((candidate) => candidate.name === this.pinned?.id) : undefined;
    this.onPinnedThing?.(piece?.folder ? { name: piece.name, folder: piece.folder } : null);
  }

  /**
   * Lets go of the pinned thing. When the keyboard was in a piece's panel it goes back to that piece, unless the
   * caller is leaving the board.
   */
  unpin(returnFocus = true): void {
    const from = this.pinned;
    const keyboardWasHere = this.evidence.contains(document.activeElement);
    this.pinned = null;
    this.evidence.dataset.pin = "";
    this.applyHover();
    this.sayPinnedThing();
    if (returnFocus && keyboardWasHere && from?.kind === "piece") {
      this.focusTargets.get(from.id)?.focus();
    }
  }

  // ==========================================================================
  // Opening a thing
  // ==========================================================================

  /** The screen corners of a piece's lid, its top face. */
  private lidCorners(name: string): Point2[] {
    const placed = this.place(name);
    return corners({ x: placed.x, y: placed.y, w: placed.w, d: placed.d }).map(([x, y]) => toScreen(this.screen, project(this.camera, this.pivot, x, y, placed.z0 + placed.h)));
  }

  /** Opens a thing's folder in the Local Map, easing the camera back first so that the next wheel over the board does not open it again. */
  enter(name: string): void {
    const piece = this.model.pieces.find((candidate) => candidate.name === name);
    if (piece && piece.folder === undefined) {
      // Nothing inside an imagined thing to open: its panel says so rather than the view staying silent.
      this.pin({ kind: "piece", id: name });
      return;
    }
    if (!piece?.folder || !this.onOpenThing) {
      return;
    }
    this.hover = null;
    // Where the way down carries the question (a trial, 2026-11-22), what was pinned on the board stays pinned there, so
    // that Back and the sidebar's World Map return to the question as it was left.
    const carries = this.carriesQuestion();
    if (!carries) {
      this.unpin(false);
    }
    const [p0, p1, , p3] = this.lidCorners(name);
    const span = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + Math.hypot(p3[0] - p0[0], p3[1] - p0[1]);
    const { width } = this.viewport();
    if (width > 0 && span > 0.5 * width) {
      const centre = this.lidCorners(name).reduce<Point2>((sum, p) => [sum[0] + p[0] / 4, sum[1] + p[1] / 4], [0, 0]);
      this.zoomBy((0.3 * width) / span, centre[0], centre[1]);
    }
    this.onOpenThing({ name: piece.name, folder: piece.folder, ...(carries ? { wireFiles: wireFilesOf(this.model, piece.name) } : null) });
  }

  /** Opens a wire as the files at its two ends, from the link in its pinned panel; the wire stays pinned on the board. */
  private openWire(id: string): void {
    const road = this.model.roads.find((candidate) => candidate.id === id);
    if (road && this.onOpenWire) {
      this.onOpenWire({ from: road.from, to: road.to, files: wireEndsOf(road) });
    }
  }

  /** Opens the piece whose lid spans half the view under a screen point, if there is one. */
  private maybeEnter(sx: number, sy: number): boolean {
    const { width, height } = this.viewport();
    for (const piece of this.model.pieces) {
      if (!piece.folder) {
        continue;
      }
      const lid = this.lidCorners(piece.name);
      if (!pointInPolygon(lid, [sx, sy])) {
        continue;
      }
      const xs = lid.map((p) => p[0]);
      const ys = lid.map((p) => p[1]);
      if (Math.max(...xs) - Math.min(...xs) > 0.5 * width || Math.max(...ys) - Math.min(...ys) > 0.5 * height) {
        this.enter(piece.name);
        return true;
      }
    }
    return false;
  }

  // ==========================================================================
  // Input
  // ==========================================================================

  private attachInput(): void {
    const svg = this.svg;
    const on = <K extends keyof HTMLElementEventMap>(target: EventTarget, type: K | string, handler: (event: never) => void, options?: AddEventListenerOptions): void => {
      target.addEventListener(type, handler as EventListener, options);
      this.disposers.push(() => target.removeEventListener(type, handler as EventListener, options));
    };

    on(svg, "contextmenu", (event: Event) => event.preventDefault());

    on(svg, "pointerdown", (event: PointerEvent) => {
      const orbit = event.button === 2 || event.button === 1 || event.shiftKey;
      const target = event.target as Element;
      this.lastPressed = target;
      const pieceNode = orbit ? null : target.closest<SVGElement>(".w-piece");
      const piece = pieceNode?.dataset.piece;
      svg.setPointerCapture(event.pointerId);
      window.clearTimeout(this.restTimer);
      const origin: Point2 = [this.svgLeft(), this.svgTop()];
      const [px, py] = fromScreen(this.screen, event.clientX - origin[0], event.clientY - origin[1]);
      const { width, height } = this.viewport();
      this.drag = {
        x0: event.clientX,
        y0: event.clientY,
        target,
        moved: false,
        orbit,
        theta0: this.camera.theta,
        phi0: this.camera.phi,
        pivot: orbit ? this.pivotAt(width / 2, height / 2) : undefined,
        piece,
        screen0: { ...this.screen },
        world0: unproject(this.camera, this.pivot, px, py),
        pos0: piece ? [...(this.positions.get(piece) ?? [0, 0])] as Point2 : undefined,
        origin
      };
      if (!piece) {
        svg.classList.add("panning");
      }
    });

    on(svg, "pointermove", (event: PointerEvent) => {
      // During a drag the drawing's corner is the one read when it began: reading it again could make the browser lay
      // the page out between frames, which the wires' flowing dashes leave due now and then.
      const origin = this.drag?.origin ?? [this.svgLeft(), this.svgTop()];
      this.lastPointer = [event.clientX - origin[0], event.clientY - origin[1]];
      if (this.drag) {
        const drag = this.drag;
        if (Math.hypot(event.clientX - drag.x0, event.clientY - drag.y0) > 3) {
          drag.moved = true;
        }
        if (drag.piece && drag.moved && drag.pos0) {
          const [px, py] = fromScreen(this.screen, this.lastPointer[0], this.lastPointer[1]);
          const w = unproject(this.camera, this.pivot, px, py);
          const placed = this.place(drag.piece);
          const padX = placed.w / 2;
          const padY = placed.d / 2;
          this.positions.set(drag.piece, [clamp(drag.pos0[0] + w[0] - drag.world0[0], this.bench.x + padX, this.bench.x + this.bench.w - padX), clamp(drag.pos0[1] + w[1] - drag.world0[1], this.bench.y + padY, this.bench.y + this.bench.d - padY)]);
          this.request("draw");
        } else if (drag.orbit) {
          // The world follows the pointer, as it does in the force graph: drag right and the camera turns left, drag down and the camera rises.
          this.turnTo(drag.theta0 - (event.clientX - drag.x0) * 0.006, drag.phi0 + (event.clientY - drag.y0) * 0.005, drag.pivot);
          this.request("draw");
        } else if (!drag.piece) {
          this.screen = { ...this.screen, x: drag.screen0.x + event.clientX - drag.x0, y: drag.screen0.y + event.clientY - drag.y0 };
          this.request("camera");
        }
        return;
      }
      this.lookAtRest(this.hoverAt(event.target as Element));
    });

    on(svg, "pointerup", () => {
      // The picture catches up with the last move before anything else happens.
      this.flush();
      const drag = this.drag;
      this.drag = null;
      svg.classList.remove("panning");
      if (drag?.orbit) {
        this.syncButtons();
      }
      if (drag?.piece && drag.moved) {
        if (this.snap) {
          const [x, y] = this.positions.get(drag.piece) ?? [0, 0];
          this.positions.set(drag.piece, [Math.round(x / GRID) * GRID, Math.round(y / GRID) * GRID]);
        }
        this.forgetReset();
        this.savePositions();
        this.draw();
      } else if (drag?.moved) {
        // The panel waited out the turn or the pan where it stood; it takes its place again now.
        this.showEvidence(this.pinned ?? this.hover);
      } else if (drag && !drag.moved && !drag.orbit) {
        const h = this.hoverAt(drag.target, true);
        if (h) {
          this.pin(h);
        } else {
          this.unpin();
        }
      }
    });

    on(svg, "pointerleave", () => {
      window.clearTimeout(this.restTimer);
      this.rest = NO_REST;
      this.touched = null;
      if (!this.drag && !this.pinned) {
        this.hover = null;
        this.applyHover();
      }
    });
    this.disposers.push(() => window.clearTimeout(this.restTimer));

    on(this.root, "wheel", (event: WheelEvent) => {
      event.preventDefault();
      const sx = event.clientX - this.svgLeft();
      const sy = event.clientY - this.svgTop();
      this.screen = zoomAt(this.screen, Math.exp(-event.deltaY * 0.0016), sx, sy);
      this.request("camera");
      if (event.deltaY < 0) {
        this.maybeEnter(sx, sy);
      }
    }, { passive: false });

    on(svg, "dblclick", () => {
      const piece = this.lastPressed?.closest<SVGElement>(".w-piece")?.dataset.piece;
      if (piece) {
        this.enter(piece);
      }
    });

    // A key is the map's while the World Map is the view, outside any field where it types, and not used by another
    // surface: Escape closing the reader, or a key typed inside a full-screen reader over the map.
    const isMine = (event: KeyboardEvent): boolean => this.world.isConnected && !!this.world.closest(".view-container.active")
      && !isField(event.target) && !event.defaultPrevented && !(event.target instanceof Element && event.target.closest('[aria-modal="true"]'));

    // Escape lets go from anywhere on the page while the map is the view: it types nothing, and it is the way out.
    on(window, "keydown", (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !isMine(event)) {
        return;
      }
      if (this.tour.on) {
        this.endTour();
      } else if (this.help.classList.contains("on")) {
        this.toggleHelp(false);
      } else if (this.pinned) {
        this.unpin();
      } else {
        this.hover = null;
        this.applyHover();
      }
    });

    // The letters and ? act only while the keyboard is on the board's own surface, and never with Ctrl, Meta or Alt held,
    // which are the browser's and the system's (WCAG 2.2, 2.1.4 Character Key Shortcuts). Bound to the whole page they
    // fired from the sidebar and from a speech user's words, and Ctrl+R reloaded the page and reset the layout with it
    // (the design system's check, 2026-11-18). A press on the board gives it focus (the constructor), so a pointer that
    // clicked the board finds them working.
    on(this.world, "keydown", (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || !isMine(event)) {
        return;
      }
      const key = event.key.toLowerCase();
      if (event.key === "?") {
        this.toggleHelp();
        return;
      }
      if (key === "d") {
        this.setTheme(this.theme === "dark" ? "light" : "dark");
        return;
      }
      if (key === "q") {
        void this.rotateBy(-Math.PI / 2);
      } else if (key === "e") {
        void this.rotateBy(Math.PI / 2);
      } else if (key === "f") {
        this.fit();
      } else if (key === "t") {
        void this.topDown();
      } else if (key === "u") {
        this.setUnder(!this.under);
      } else if (key === "r") {
        this.resetLayout();
      } else if (key === "g") {
        this.setSnap(!this.snap);
      }
    });

    on(this.tools, "click", (event: MouseEvent) => {
      const button = (event.target as Element).closest("button");
      if (!button) {
        return;
      }
      const actions: Record<string, () => void> = {
        rotl: () => void this.rotateBy(-Math.PI / 2),
        rotr: () => void this.rotateBy(Math.PI / 2),
        tilt: () => void this.topDown(),
        under: () => this.setUnder(!this.under),
        snap: () => this.setSnap(!this.snap),
        theme: () => this.setTheme(this.theme === "dark" ? "light" : "dark"),
        fit: () => this.fit(),
        reset: () => this.resetLayout(),
        save: () => this.saveBoard()
      };
      actions[button.dataset.act ?? ""]?.();
    });

    // The toolbar is one Tab stop, and the arrows, Home and End move between its tools, as the WAI-ARIA Authoring
    // Practices' toolbar does: nine stops before the board's things were nine presses of Tab for nothing. The tool last
    // on is the stop, so Tab back into the toolbar returns to it.
    const tools = (): HTMLButtonElement[] => [...this.tools.querySelectorAll<HTMLButtonElement>("button")];
    on(this.tools, "focusin", (event: FocusEvent) => {
      const at = (event.target as Element).closest("button");
      for (const button of tools()) {
        button.tabIndex = button === at ? 0 : -1;
      }
    });
    on(this.tools, "keydown", (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      const all = tools();
      const at = all.indexOf(event.target as HTMLButtonElement);
      const next = { ArrowRight: at + 1, ArrowLeft: at - 1, Home: 0, End: all.length - 1 }[event.key];
      if (at < 0 || next === undefined) {
        return;
      }
      event.preventDefault();
      all[(next + all.length) % all.length].focus();
    });

    on(this.evidence, "click", (event: MouseEvent) => {
      const anchor = (event.target as Element).closest<HTMLAnchorElement>("a[data-pin-id], a[data-file], a[data-open], a[data-open-road]");
      if (!anchor) {
        return;
      }
      const rect = this.evidence.getBoundingClientRect();
      this.lastPointer = [rect.left - this.svgLeft() - 18, rect.top - this.svgTop() - 18];
      if (anchor.dataset.open !== undefined) {
        event.preventDefault();
        this.enter(anchor.dataset.open);
      } else if (anchor.dataset.openRoad !== undefined) {
        event.preventDefault();
        this.openWire(anchor.dataset.openRoad);
      } else if (anchor.dataset.pinId !== undefined) {
        event.preventDefault();
        this.pin({ kind: anchor.dataset.pinKind as Hover["kind"], id: anchor.dataset.pinId });
      } else if (anchor.dataset.file !== undefined && this.onOpenFile && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
        event.preventDefault();
        this.onOpenFile(anchor.dataset.file);
      }
    });

    // A pinned panel that changes size, its files unfolded or folded, is placed again, beside its piece and in the view.
    // A resize observer answers after the browser lays the panel out and before it paints it, so no frame shows it
    // grown where it stood. The `toggle` event it replaces comes in a task of its own, which may follow a painted frame
    // with the unfolded panel's foot below the view (2026-11-19).
    const resized = new ResizeObserver(() => {
      if (this.pinned && this.evidence.style.display !== "none") {
        this.placeEvidence(this.pinned, true);
      }
    });
    resized.observe(this.evidence);
    this.disposers.push(() => resized.disconnect());

    // The keyboard on a piece peeks at it as the pointer does; Enter or Space pins it as a click does and takes the
    // keyboard into its panel, where who it talks to, the way inside and its files are the next stops. The listeners
    // stand on the view's HTML, since Chrome makes an SVG element with focus listeners a stop of its own.
    const focusedPiece = (event: Event): string | undefined => (event.target as Element).closest<SVGElement>(".w-focus")?.dataset.focus;
    on(this.world, "focusin", (event: FocusEvent) => {
      const name = focusedPiece(event);
      if (!name) {
        return;
      }
      this.focused = name;
      if (!this.pinned) {
        this.hover = { kind: "piece", id: name };
        this.applyHover();
      }
    });
    on(this.world, "focusout", (event: FocusEvent) => {
      if (!focusedPiece(event)) {
        return;
      }
      this.focused = null;
      if (!this.pinned) {
        this.hover = null;
        this.applyHover();
      }
    });
    on(this.world, "keydown", (event: KeyboardEvent) => {
      const name = focusedPiece(event);
      if (!name || (event.key !== "Enter" && event.key !== " ")) {
        return;
      }
      event.preventDefault();
      this.pin({ kind: "piece", id: name });
      this.evidence.focus();
    });

    on(this.helpButton, "click", () => this.toggleHelp());
    on(this.tourBox, "click", (event: MouseEvent) => {
      const button = (event.target as Element).closest("button");
      if (!button) {
        return;
      }
      if (button.dataset.tour === "done") {
        this.endTour();
      } else {
        void this.tourStep(this.tour.at + (button.dataset.tour === "next" ? 1 : -1));
      }
    });
    window.addEventListener("resize", this.resizeHandler);
    this.disposers.push(() => window.removeEventListener("resize", this.resizeHandler));
  }

  private svgLeft(): number {
    return this.svg.getBoundingClientRect().left;
  }

  private svgTop(): number {
    return this.svg.getBoundingClientRect().top;
  }

  /**
   * "A hover peeks; a click pins": the peek is words, so it waits until the pointer has rested on a thing
   * (`pointerRest.ts`, 2026-11-19), and goes as soon as the pointer is on something else. A moving pointer shows at once
   * only that a thing can be pressed, by the cursor. Under a pin the peek stays away, but the rest is kept for the
   * moment the pin is let go. Keyboard focus peeks at once (`attachInput`); a click pins at once.
   */
  private lookAtRest(h: Hover | null): void {
    // A drag is no rest, and a peek that came in its middle would lay the page out again on every frame of it.
    if (this.drag) {
      window.clearTimeout(this.restTimer);
      return;
    }
    const now = performance.now();
    this.touched = h;
    this.rest = restAt(this.rest, h && `${h.kind}:${h.id}`, { x: this.lastPointer[0], y: this.lastPointer[1] }, now);
    window.clearTimeout(this.restTimer);
    const due = restsAt(this.rest);
    const rested = restedOn(this.rest, now) !== null ? h : null;
    if (!rested && due !== null) {
      this.restTimer = window.setTimeout(() => this.lookAtRest(this.touched), Math.max(0, due - now) + 1);
    }
    if (this.pinned) {
      this.hover = rested;
    } else if (JSON.stringify(rested) !== JSON.stringify(this.hover)) {
      this.hover = rested;
      this.applyHover();
    } else if (rested) {
      // A peek follows the pointer about its thing.
      this.showEvidence(rested);
    }
  }

  private hoverAt(target: Element, forClick = false): Hover | null {
    const door = target.closest<SVGElement>("[data-door]");
    const road = target.closest<SVGElement>("[data-road]");
    const crossing = target.closest<SVGElement>("[data-crossing]");
    const token = target.closest<SVGElement>("[data-token]");
    const piece = target.closest<SVGElement>(".w-piece");
    const region = target.closest<SVGElement>("[data-region]");
    if (door?.dataset.door) {
      return forClick && door.dataset.piece ? { kind: "piece", id: door.dataset.piece } : { kind: "door", id: door.dataset.door };
    }
    if (road?.dataset.road) {
      return { kind: "road", id: road.dataset.road };
    }
    if (crossing?.dataset.crossing) {
      return { kind: "crossing", id: crossing.dataset.crossing };
    }
    if (token?.dataset.token) {
      return { kind: "token", id: token.dataset.token };
    }
    if (piece?.dataset.piece) {
      return { kind: "piece", id: piece.dataset.piece };
    }
    if (region?.dataset.region) {
      return { kind: "region", id: region.dataset.region };
    }
    return null;
  }

  // ==========================================================================
  // Tools
  // ==========================================================================

  private button(act: string): HTMLButtonElement | null {
    return this.tools.querySelector<HTMLButtonElement>(`[data-act="${act}"]`);
  }

  /**
   * Each toggle says whether it is on, for the eye by its fill and for a screen reader by its pressed state. Reset is
   * pressed while a reset stands that it can take back, and its tooltip says which of the two it will do; its name
   * stays, as a toggle's does.
   */
  private syncButtons(): void {
    const resetStands = this.beforeReset !== null;
    for (const [act, on] of [["tilt", looksDown(this.camera)], ["under", this.under], ["snap", this.snap], ["theme", this.theme === "dark"], ["reset", resetStands]] as Array<[string, boolean]>) {
      this.button(act)?.setAttribute("aria-pressed", String(on));
    }
    const reset = this.button("reset");
    if (reset) {
      reset.title = resetStands ? "Put things back where you had them (R)" : "Reset layout (R)";
    }
  }

    /** Shows the grid and snaps a dropped piece to it, or stops. */
  setSnap(value: boolean): void {
    this.snap = value;
    this.syncButtons();
    this.draw();
  }

    /** Shows the built-on layer, what two or more pieces share, or hides it. */
  setUnder(value: boolean): void {
    this.under = value;
    this.world.classList.toggle("under", value);
    this.syncButtons();
    this.draw();
  }

    /** Switches between the white board and the dark one, remembering the choice. */
  setTheme(theme: "light" | "dark"): void {
    this.theme = theme;
    this.world.dataset.theme = theme;
    try {
      window.localStorage.setItem("live-docs.world.theme", theme);
    } catch {
      // Storage may be unavailable.
    }
    this.syncButtons();
    this.draw();
  }

  private restoreTheme(): void {
    try {
      const stored = window.localStorage.getItem("live-docs.world.theme");
      if (stored === "dark" || stored === "light") {
        this.theme = stored;
      }
    } catch {
      // Storage may be unavailable.
    }
    this.world.dataset.theme = this.theme;
    this.syncButtons();
  }

  /**
   * Puts every piece back where the board's Layout rests it, keeping where they stood; or, pressed again before any
   * piece is moved, puts them back there. An act is undone by repeating it, as a second click releases a pin
   * (2026-11-18: the reset threw every position away at once, saved, with no way back). Nothing moved, nothing to reset.
   */
  resetLayout(): void {
    if (this.beforeReset) {
      this.positions = this.beforeReset;
      this.beforeReset = null;
    } else {
      const atRest = [...this.positions].every(([name, [x, y]]) => {
        const [rx, ry] = this.restPositions.get(name) ?? [x, y];
        return Math.abs(x - rx) < 1e-6 && Math.abs(y - ry) < 1e-6;
      });
      if (atRest) {
        return;
      }
      this.beforeReset = this.positions;
      this.positions = new Map(this.restPositions);
    }
    this.savePositions();
    this.syncButtons();
    this.draw();
  }

  /** A piece was moved: what a reset discarded is gone for good, and the control resets again. */
  private forgetReset(): void {
    if (this.beforeReset) {
      this.beforeReset = null;
      this.syncButtons();
    }
  }

  /** The board text with its Layout replaced by where the pieces sit now. */
  boardText(): string {
    const layout = this.model.pieces.map((piece) => {
      const [x, y] = pixelsToUnits(this.positions.get(piece.name) ?? [0, 0]);
      return { name: piece.name, x, y };
    });
    return renderBoard({ ...this.board, layout });
  }

  private saveBoard(): void {
    const text = this.boardText();
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = this.boardPath.split("/").pop() ?? "board.md";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private writeCrumbs(): void {
    const n = this.model.pieces.length;
    const r = this.model.regions.length;
    const parts = [`${n} thing${n === 1 ? "" : "s"}`];
    if (r) {
      parts.push(`${r} region${r === 1 ? "" : "s"}`);
    }
    if (this.model.crossings.length) {
      parts.push(`${this.model.crossings.length} crossing${this.model.crossings.length === 1 ? "" : "s"}`);
    }
    // What the join found wanting is counted here and listed in the help, as the board command prints it: the viewer never knows less than the command.
    const wanting = this.model.issues.length ? ` <a href="#" class="w-wanting">· ${this.model.issues.length} wanting</a>` : "";
    this.crumbs.innerHTML = `<b>${escapeHtml(this.model.title)}</b> <span style="color:var(--w-faint)">· ${parts.join(", ")}${wanting}</span>`;
    this.crumbs.querySelector<HTMLElement>(".w-wanting")?.addEventListener("click", (event) => {
      event.preventDefault();
      this.toggleHelp(true);
    });
  }

  // ==========================================================================
  // Help and the walkthrough
  // ==========================================================================

  private writeHelp(): void {
    const wanting = this.model.issues.length ? `<h4>Wanting</h4><p>What the join found wanting on this board, as <b>live-docs:board</b> prints it.</p><ul class="w-wanting-list">${this.model.issues.map((issue) => `<li>${escapeHtml(issue)}</li>`).join("")}</ul>` : "";
    this.help.innerHTML = `<h3>World Map</h3><p>Each thing on the board is a system, a database, a site, or something imagined, which is drawn hollow until its folder arrives. Click one for its facts. A tinted region holds the things inside it.</p>${wanting}
<h4>Doors and wires</h4><p><i style="border-color:var(--w-offers)"></i><b>blue</b> offers, <i style="border-color:var(--w-uses)"></i><b>green</b> uses, as inside a system. A wire in the air is one call, flowing from what is offered to where it is used; hover it for how it is known. The warm sleeve is a declared crossing. A dashed door with a stub into the air is a ghost: a call that nothing on the board serves, named on hover; point at the folder that serves it and it becomes a wire.</p>
<h4>What a thing stands on</h4><p>The strands under a thing are what it is built with: another thing's code, drawn as a dotted line on the board to that thing, and the packages its manifests name. No call crosses these while the things run. <b>built on</b> lays out what two or more things share.</p>
<h4>Pinned</h4><p>A hover peeks; a click pins. In a pinned panel every name is a link: a thing pins it, a file opens it in the Local Map.</p>
<h4>Inside a thing</h4><p>Wheel into a thing, double-click it, or follow <b>open</b> in its pinned panel: it opens in the Local Map, its folders as membranes. World Map in the sidebar leads back to the board.</p>
<h4>Moving around</h4><p>Drag to pan. Right-drag or <kbd>Shift</kbd>-drag to orbit. Wheel to zoom. Drag a thing to move it; <b>save board</b> writes the positions into the board text.</p>
<p><kbd>Q</kbd> <kbd>E</kbd> turn · <kbd>T</kbd> top-down · <kbd>F</kbd> fit · <kbd>U</kbd> built on · <kbd>G</kbd> snap · <kbd>D</kbd> dark · <kbd>R</kbd> reset, and again to put back · <kbd>Esc</kbd> let go</p><p>The keys work while the board has the keyboard: click it, or <kbd>Tab</kbd> to it.</p>
<button data-act="tour">walk me through it</button>`;
    this.help.querySelector("[data-act=tour]")?.addEventListener("click", () => {
      this.toggleHelp(false);
      void this.startTour();
    });
  }

    /** Opens or closes the help panel. */
  toggleHelp(value?: boolean): void {
    const on = value === undefined ? !this.help.classList.contains("on") : value;
    this.help.classList.toggle("on", on);
    this.helpButton.classList.toggle("on", on);
    this.helpButton.setAttribute("aria-expanded", String(on));
  }

  /** The walkthrough's steps: what each says, what it does, and which of the view's states it changes to show its point. */
  private tourSteps(): Array<{ text: string; shows?: "under" | "orbit"; go: () => void | Promise<void> }> {
    const firstPiece = this.model.pieces[0]?.name;
    const firstRoad = this.model.roads.find((road) => road.kind === "call") ?? this.model.roads[0];
    const { width, height } = this.viewport();
    const point: Point2 = [width * 0.5, height * 0.42];
    const theta = this.tour.start?.camera.theta ?? this.camera.theta;
    return [
      { text: "Each thing on the board is one system, database or person, drawn by its kind. Click one to pin what it offers, calls and stands on; every name in the panel is a link.", go: () => { if (firstPiece) { this.hover = { kind: "piece", id: firstPiece }; this.lastPointer = point; this.applyHover(); } } },
      { text: "A wire is one call, from the blue door that offers to the green door that uses it. Hover it for how it is known and which files carry it.", go: () => { if (firstRoad) { this.hover = { kind: "road", id: firstRoad.id }; this.lastPointer = point; this.applyHover(); } } },
      { text: "The strands under a thing are what it is built with: another thing's code, a dotted line on the board, or a package from its manifests. Built on shows what things share.", shows: "under", go: () => { this.hover = null; this.applyHover(); this.setUnder(true); } },
      { text: "Nothing inside a thing shows until you open it: wheel in, double-click, or follow open in its pinned panel. It opens in the Local Map, folder by folder.", go: () => { const first = this.model.pieces.find((piece) => piece.folder); if (first) { this.lastPointer = point; this.pin({ kind: "piece", id: first.name }); } } },
      { text: "Drag to pan, right-drag to orbit, wheel to zoom. Things stay where you put them, and save board writes them into the text.", shows: "orbit", go: async () => { this.unpin(); await this.orbitTo(theta - (35 * Math.PI) / 180, (42 * Math.PI) / 180); } }
    ];
  }

  /**
   * Shows one step of the walkthrough and does what it describes. A step stands on the view the walkthrough began
   * on, but for the one state it changes to show its point, so that stepping back undoes what the next step showed.
   */
  async tourStep(index: number): Promise<void> {
    const steps = this.tourSteps();
    this.tour.at = clamp(index, 0, steps.length - 1);
    const step = steps[this.tour.at];
    this.tourBox.querySelector(".step")!.textContent = `${this.tour.at + 1} of ${steps.length}`;
    this.tourBox.querySelector(".text")!.textContent = step.text;
    // Next and back keep the keyboard where it is, so nothing else would say that the words beside them changed.
    this.status.textContent = `Step ${this.tour.at + 1} of ${steps.length}. ${step.text}`;
    (this.tourBox.querySelector<HTMLButtonElement>("[data-tour=back]"))!.disabled = this.tour.at === 0;
    (this.tourBox.querySelector<HTMLElement>("[data-tour=next]"))!.style.display = this.tour.at === steps.length - 1 ? "none" : "";
    const start = this.tour.start;
    if (start && step.shows !== "under" && this.under !== start.under) {
      this.setUnder(start.under);
    }
    if (start && step.shows !== "orbit") {
      await this.returnTo(start);
    }
    await step.go();
  }

  /** Begins the walkthrough at its first step, remembering the view it began on. */
  async startTour(): Promise<void> {
    if (!this.tour.on) {
      this.tour.start = { camera: { ...this.camera }, screen: { ...this.screen }, under: this.under };
    }
    this.tour.on = true;
    this.tourBox.classList.add("on");
    await this.tourStep(0);
  }

  /**
   * Ends the walkthrough, lets go of what it pinned or showed, and eases the board back to the view it began on
   * (2026-11-12: a newcomer finished it with the board left turned by its last step).
   */
  endTour(): void {
    const start = this.tour.start;
    this.tour = { on: false, at: 0 };
    this.tourBox.classList.remove("on");
    this.status.textContent = "";
    this.hover = null;
    this.unpin();
    if (start) {
      if (this.under !== start.under) {
        this.setUnder(start.under);
      }
      void this.returnTo(start);
    }
  }

  /** Eases the camera, the pan and the zoom back to a view kept from before, if any of them has moved. */
  private returnTo(view: { camera: Camera; screen: Screen }): Promise<void> {
    const close = (a: number, b: number): boolean => Math.abs(a - b) < 1e-6;
    const unmoved = close(this.camera.theta, view.camera.theta) && close(this.camera.phi, view.camera.phi)
      && close(this.screen.x, view.screen.x) && close(this.screen.y, view.screen.y) && close(this.screen.k, view.screen.k);
    return unmoved ? Promise.resolve() : this.orbitTo(view.camera.theta, view.camera.phi, 520, view.screen);
  }

  // ==========================================================================
  // The window's handle, for tests and screenshots
  // ==========================================================================

  /** What a test or a screenshot script may drive. */
  get api(): WorldMapApi {
    return {
      ready: true,
      instant: (value) => { this.instant = value; },
      rotate: (quarters = 1) => this.rotateBy((quarters * Math.PI) / 2),
      tilt: () => this.topDown(),
      orbit: (azimuthDegrees, elevationDegrees, ms) => this.orbitTo((azimuthDegrees * Math.PI) / 180, (elevationDegrees * Math.PI) / 180, ms),
      under: (value) => this.setUnder(value),
      snap: (value) => this.setSnap(value),
      theme: (theme) => this.setTheme(theme),
      help: (value) => this.toggleHelp(value),
      tour: async (index = 0) => { await this.startTour(); await this.tourStep(index); },
      hover: (kind, id) => {
        const { width, height } = this.viewport();
        this.hover = kind ? { kind, id: id ?? "" } : null;
        this.lastPointer = [width * 0.5, height * 0.42];
        this.applyHover();
      },
      pin: (kind, id) => {
        const { width, height } = this.viewport();
        this.lastPointer = [width * 0.55, height * 0.4];
        this.pin({ kind, id });
      },
      unpin: () => this.unpin(),
      fit: () => this.fit(),
      zoom: (k) => { const { width, height } = this.viewport(); this.zoomBy(k / this.screen.k, width / 2, height / 2); return this.screen.k; },
      move: (name, x, y) => { if (this.positions.has(name)) { this.positions.set(name, unitsToPixels([x, y])); this.forgetReset(); this.savePositions(); this.draw(); } },
      reset: () => this.resetLayout(),
      boardText: () => this.boardText(),
      state: () => ({ theta: this.camera.theta, phi: this.camera.phi, k: this.screen.k, under: this.under, snap: this.snap, theme: this.theme, hover: this.hover, pinned: this.pinned, positions: Object.fromEntries([...this.positions].map(([name, pixels]) => [name, pixelsToUnits(pixels)])) }),
      pieces: () => this.model.pieces.map((piece) => piece.name),
      roads: () => this.model.roads.map((road) => road.id),
      doors: () => this.doors.map((door) => door.key),
      tokens: () => this.model.tokens.map((token) => token.key),
      screenPointOf: (name) => {
        const placed = this.place(name);
        const p = toScreen(this.screen, project(this.camera, this.pivot, placed.cx, placed.cy, placed.z0 + placed.h / 2));
        return [p[0] + this.svgLeft(), p[1] + this.svgTop()];
      },
      lidCorners: (name) => this.lidCorners(name),
      pointInLid: (name, sx, sy) => pointInPolygon(this.lidCorners(name), [sx, sy]),
      enter: (name) => this.enter(name)
    };
  }
}

/** The handle a test or a screenshot script drives, at `window.__worldMap`. */
export interface WorldMapApi {
  ready: boolean;
  instant: (value: boolean) => void;
  rotate: (quarters?: number) => Promise<void>;
  tilt: () => Promise<void>;
  orbit: (azimuthDegrees: number, elevationDegrees: number, ms?: number) => Promise<void>;
  under: (value: boolean) => void;
  snap: (value: boolean) => void;
  theme: (theme: "light" | "dark") => void;
  help: (value?: boolean) => void;
  tour: (index?: number) => Promise<void>;
  hover: (kind: Hover["kind"] | null, id?: string) => void;
  pin: (kind: Hover["kind"], id: string) => void;
  unpin: () => void;
  fit: () => void;
  zoom: (k: number) => number;
  move: (name: string, x: number, y: number) => void;
  reset: () => void;
  boardText: () => string;
  state: () => { theta: number; phi: number; k: number; under: boolean; snap: boolean; theme: string; hover: Hover | null; pinned: Hover | null; positions: Record<string, Point2> };
  pieces: () => string[];
  roads: () => string[];
  doors: () => string[];
  tokens: () => string[];
  screenPointOf: (name: string) => Point2;
  lidCorners: (name: string) => Point2[];
  pointInLid: (name: string, sx: number, sy: number) => boolean;
  enter: (name: string) => void;
}

// ============================================================================
// Helpers
// ============================================================================

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, parent?: Element, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  parent?.appendChild(node);
  return node;
}

/** Whether a key pressed here types into a field of any kind, where a letter is the person's and never a command. */
function isField(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select") !== null);
}

function svgElement(tag: string, attributes: Record<string, string | number>, parent?: Element): SVGElement {
  const node = document.createElementNS(SVG, tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (value !== "") {
      node.setAttribute(key, String(value));
    }
  }
  parent?.appendChild(node);
  return node;
}

function basename(path: string): string {
  return path.split("/").pop() ?? path;
}

/** The page's URL opened on the Local Map at a file, so a link can be followed in a new tab as well as in place. */
function localMapHref(file: string): string {
  const url = new URL(window.location.href);
  const mode = parseInitialState().perspective ?? "2d";
  for (const key of ["view", "node", "s", "dir", "from", "to", "fromSymbol", "toSymbol"]) {
    url.searchParams.delete(key);
  }
  url.searchParams.set("view", "local");
  url.searchParams.set("node", file);
  url.searchParams.set("mode", mode);
  return `${url.pathname}?${url.searchParams.toString()}`;
}

