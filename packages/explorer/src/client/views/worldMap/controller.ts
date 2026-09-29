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

import {
  FLOAT,
  GRID,
  NORMALS,
  autoPlace,
  clamp,
  corners,
  drawOrder,
  inRect,
  pixelsToUnits,
  placePiece,
  rectAround,
  roadCurve,
  spreadTokens,
  unitsToPixels,
  wallOf,
  wallPoint,
  type Anchor,
  type Placed,
  type Rect,
  type Wall
} from "./layout";
import { regionsOf, type Tint, type WorldModel, type WorldRoad } from "./model";
import {
  MIN_ELEVATION,
  REST_ELEVATION,
  TOP_DOWN,
  bezierAt,
  cuboidFaces,
  depthOf,
  fitScreen,
  fromScreen,
  isTopDown,
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

const SVG = "http://www.w3.org/2000/svg";

/** What the pointer is on. */
export interface Hover {
  kind: "piece" | "road" | "token" | "door" | "region" | "crossing";
  id: string;
}

export interface WorldMapOptions {
  root: HTMLElement;
  board: Board;
  boardPath: string;
  model: WorldModel;
  /** Opens a file of the graph in the Local Map, from a link in a pinned panel. */
  onOpenFile?: (file: string) => void;
}

interface Door {
  key: string;
  piece: string;
  toward: Point2;
  role: "in" | "out";
  label: string;
  sub: string;
  roads: string[];
  wall: Wall;
  anchor: Anchor;
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
}

const TINT_COLOURS: Record<Tint, { light: string; dark: string }> = {
  blue:   { light: "hsl(212 68% 92%)", dark: "hsl(214 32% 13%)" },
  orange: { light: "hsl(30 72% 91%)",  dark: "hsl(30 12% 13%)" },
  green:  { light: "hsl(150 45% 90%)", dark: "hsl(150 18% 12%)" },
  grey:   { light: "hsl(215 12% 91%)", dark: "hsl(215 8% 14%)" },
  violet: { light: "hsl(262 55% 93%)", dark: "hsl(262 20% 14%)" },
  rose:   { light: "hsl(345 60% 93%)", dark: "hsl(345 18% 14%)" }
};

const THEMES = {
  light: { faceLight: "#ffffff", faceDark: "#98a2b1", faceStroke: "#505c6b", tankStroke: "#505c6b", shadow: 0.26 },
  dark:  { faceLight: "#4a5468", faceDark: "#1f2530", faceStroke: "#0b0d11", tankStroke: "#6b7a90", shadow: 0.55 }
};

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
  private readonly onOpenFile?: (file: string) => void;

  private readonly world: HTMLElement;
  private readonly svg: SVGSVGElement;
  private readonly defs: SVGElement;
  private readonly camGroup: SVGGElement;
  private readonly layers: Record<string, SVGGElement> = {};
  private readonly crumbs: HTMLElement;
  private readonly tools: HTMLElement;
  private readonly evidence: HTMLElement;
  private readonly helpButton: HTMLButtonElement;
  private readonly help: HTMLElement;
  private readonly tourBox: HTMLElement;

  private camera: Camera = { theta: 0, phi: REST_ELEVATION };
  private screen: Screen = { x: 0, y: 0, k: 1 };
  private pivot: Pivot = { x: 0, y: 0 };
  private bench: Rect = { x: 0, y: 0, w: 1400, d: 900 };
  private positions = new Map<string, Point2>();
  private readonly restPositions = new Map<string, Point2>();

  private hover: Hover | null = null;
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
  private tour = { on: false, at: 0 };
  private readonly disposers: Array<() => void> = [];
  private readonly resizeHandler = (): void => this.applyCamera();

  constructor(options: WorldMapOptions) {
    this.root = options.root;
    this.board = options.board;
    this.boardPath = options.boardPath;
    this.model = options.model;
    this.onOpenFile = options.onOpenFile;

    this.root.innerHTML = "";
    this.world = element("div", "world", this.root);
    this.svg = svgElement("svg", { class: "world-svg" }, this.world) as SVGSVGElement;
    this.defs = svgElement("defs", {}, this.svg);
    const blur = svgElement("filter", { id: "world-blur", x: "-30%", y: "-30%", width: "160%", height: "160%" }, svgElement("defs", {}, this.svg));
    svgElement("feGaussianBlur", { stdDeviation: "7" }, blur);
    this.camGroup = svgElement("g", { class: "w-cam" }, this.svg) as SVGGElement;
    for (const name of ["ground", "under", "shadows", "roads", "blocks", "roots", "doors", "labels"]) {
      this.layers[name] = svgElement("g", { class: `w-layer-${name}` }, this.camGroup) as SVGGElement;
    }
    const hud = element("div", "world-hud", this.world);
    this.crumbs = element("div", "world-crumbs", hud);
    this.tools = element("div", "world-tools", hud);
    for (const [act, label] of [["rotl", "rotate left"], ["rotr", "rotate right"], ["tilt", "top-down"], ["under", "built on"], ["snap", "snap to grid"], ["theme", "dark"], ["fit", "fit"], ["reset", "reset layout"], ["save", "save board"]]) {
      const button = element("button", "", this.tools, label);
      button.dataset.act = act;
    }
    this.evidence = element("div", "world-evidence", this.world);
    this.helpButton = element("button", "world-help-btn", this.world, "?");
    this.helpButton.title = "what am I looking at?";
    this.help = element("div", "world-help", this.world);
    this.tourBox = element("div", "world-tour", this.world);
    this.tourBox.innerHTML = `<div class="step"></div><div class="text"></div><div class="row"><button data-tour="back">back</button><button data-tour="next" class="primary">next</button><button data-tour="done">done</button></div>`;

    this.restPositions = this.initialPositions();
    this.positions = this.loadPositions();
    this.bench = this.benchAround();
    this.pivot = { x: this.bench.x + this.bench.w / 2, y: this.bench.y + this.bench.d / 2 };
    this.restoreTheme();
    this.writeHelp();
    this.attachInput();
  }

  // ==========================================================================
  // Lifecycle
  // ==========================================================================

  /** Draws the board and fits it to the viewport. */
  render(): void {
    this.draw();
    this.fit();
    this.writeCrumbs();
  }

  dispose(): void {
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
    for (const layer of Object.values(this.layers)) {
      layer.innerHTML = "";
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
    this.applyCamera();
    this.applyHover();
  }

  private themeColours(): (typeof THEMES)["light"] {
    return THEMES[this.theme];
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
      const colour = TINT_COLOURS[region.tint][this.theme];
      const polygon = svgElement("polygon", { class: "w-region", "data-region": region.name, points: corners(rect).map(([x, y]) => this.P(x, y)).join(" "), fill: colour }, ground);
      if (region.depth > 0) {
        polygon.setAttribute("fill-opacity", "0.85");
      }
      const label = svgElement("text", { class: "w-zone", "data-fixed": this.P(rect.x + 18, rect.y + rect.d - 14), "text-anchor": "start", dy: "4" }, this.layers.labels);
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
    const footprint = placed.form === "tank" ? ring(placed.cx, placed.cy, placed.r, 0, 24).map((p) => [p[0], p[1]] as Point2) : corners({ x: placed.x, y: placed.y, w: placed.w, d: placed.d });
    svgElement("polygon", { class: "w-shadow", filter: "url(#world-blur)", "fill-opacity": colours.shadow * (placed.z0 > FLOAT ? 0.6 : 1), points: footprint.map(([x, y]) => this.P(x + 6, y + 6, 0)).join(" ") }, this.layers.shadows);
    const group = svgElement("g", { class: "w-piece", "data-piece": placed.name }, this.layers.blocks);
    if (placed.form === "tank") {
      this.drawTank(group, placed);
      return;
    }
    for (const face of cuboidFaces(this.camera, this.pivot, placed)) {
      svgElement("polygon", { class: "w-face", points: face.points.map((p) => this.P(p[0], p[1], p[2])).join(" "), fill: this.faceFill(shade(this.camera, face.normal)), stroke: colours.faceStroke }, group);
    }
  }

  private drawTank(group: SVGElement, placed: Placed): void {
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
    svgElement("polygon", { class: "w-face", points: side.map((p) => this.P(p[0], p[1], p[2])).join(" "), fill: this.faceFill(0.55), "stroke-dasharray": "4 3", stroke: colours.tankStroke }, group);
    svgElement("polygon", { class: "w-face", points: top.map((p) => this.P(p[0], p[1], p[2])).join(" "), fill: this.faceFill(0.9), "stroke-dasharray": "4 3", stroke: colours.tankStroke }, group);
  }

  private faceFill(value: number): string {
    const colours = this.themeColours();
    return mix(colours.faceDark, colours.faceLight, value);
  }

  /** Doors: one where a piece serves each opening a road lands on, one where it calls each other piece. */
  private computeDoors(): void {
    const byKey = new Map<string, Door>();
    this.doors = [];
    const request = (key: string, piece: string, toward: Point2, role: "in" | "out", label: string, sub: string, roadId: string): void => {
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
      request(`in:${road.to}:${doorName}`, road.to, [consumer.cx, consumer.cy], "in", doorName, road.door?.kind ?? (road.over ? `over ${road.over}` : BASIS_WORDS[road.basis]), road.id);
      const files = [...new Set(road.lines.map((line) => basename(line.from)))];
      request(`out:${road.from}:${road.to}`, road.from, [provider.cx, provider.cy], "out", `to ${road.to}`, files.join(", ") || (road.over ? `over ${road.over}` : BASIS_WORDS[road.basis]), road.id);
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
    for (const [offset, colour] of [[0, "#38bdf8"], [0.1, "#38bdf8"], [0.9, "#34d399"], [1, "#34d399"]] as Array<[number, string]>) {
      svgElement("stop", { offset, "stop-color": colour }, gradient);
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
      const consumerDoor = byKey.get(`out:${road.from}:${road.to}`);
      const providerDoor = byKey.get(`in:${road.to}:${road.door?.name ?? `from ${road.from}`}`);
      if (!consumerDoor || !providerDoor) {
        continue;
      }
      const curve = roadCurve(consumerDoor.anchor, providerDoor.anchor);
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
      const tag = svgElement("text", { class: "w-tag", "data-fixed": this.P((from[0] + to[0]) / 2, (from[1] + to[1]) / 2), "text-anchor": "middle", dy: "-8" }, this.layers.labels);
      tag.textContent = `${crossing.over ?? "crossing"} · declared`;
    }
    for (const door of this.doors) {
      const group = svgElement("g", { class: "w-door-group", "data-piece": door.piece, "data-door": door.key }, this.layers.doors);
      const s = project(this.camera, this.pivot, door.anchor.p[0], door.anchor.p[1], door.anchor.p[2]);
      svgElement("circle", { class: `w-door ${door.role}`, r: 5, "data-fixed": s.join(",") }, group);
      const leftward = door.anchor.out[0] < 0 || (door.anchor.out[0] === 0 && door.anchor.out[1] < 0);
      const text = svgElement("text", { class: "w-doorlabel", "data-fixed": s.join(","), "data-piece": door.piece, "data-roads": door.roads.join(" "), "text-anchor": leftward ? "end" : "start", dx: leftward ? -10 : 10, dy: door.role === "in" ? -6 : 14 }, this.layers.labels);
      text.textContent = door.label;
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
    const collides = (dy: number): boolean =>
      this.model.pieces.some((piece) => {
        const placed = this.place(piece.name);
        const label = project(this.camera, this.pivot, placed.cx, placed.cy, placed.z0 + placed.h);
        const tagY = at[1] * this.screen.k + dy;
        return Math.abs(label[0] - at[0]) * this.screen.k < 100 && (Math.abs(tagY - (label[1] * this.screen.k - 14)) < 16 || Math.abs(tagY - (label[1] * this.screen.k + 1)) < 16);
      });
    const dy = !collides(24) ? 24 : !collides(-22) ? -22 : !collides(44) ? 44 : 24;
    const tag = svgElement("text", { class: "w-tag", "data-fixed": at.join(","), "text-anchor": "middle", dy }, this.layers.labels);
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
      const length = 12 + 7 * ((i * 7) % 3);
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
      const text = svgElement("text", { class: `w-tokenlabel ${token.kind}`, "data-fixed": c.join(","), "text-anchor": "middle", dy: 22 }, labelGroup);
      text.textContent = token.label;
      const kind = svgElement("tspan", { class: "k" }, text);
      kind.textContent = ` · ${token.kind}`;
    }
  }

  private drawLabels(): void {
    for (const piece of this.model.pieces) {
      const placed = this.place(piece.name);
      const group = svgElement("g", { class: "w-label", "data-piece": piece.name }, this.layers.labels);
      const c = project(this.camera, this.pivot, placed.cx, placed.cy, placed.z0 + placed.h);
      const name = svgElement("text", { "data-fixed": c.join(","), "text-anchor": "middle", dy: -14 }, group);
      name.textContent = piece.name;
      const sub = svgElement("text", { class: "w-sub", "data-fixed": c.join(","), "text-anchor": "middle", dy: 1 }, group);
      sub.textContent = piece.imagined ? "imagined" : `${piece.kind ? `${piece.kind} · ` : ""}${piece.files.length} file${piece.files.length === 1 ? "" : "s"}`;
    }
  }

  // ==========================================================================
  // The camera
  // ==========================================================================

  private viewport(): { width: number; height: number } {
    return { width: this.root.clientWidth || window.innerWidth, height: this.root.clientHeight || window.innerHeight };
  }

  private applyCamera(): void {
    this.camGroup.setAttribute("transform", `translate(${this.screen.x} ${this.screen.y}) scale(${this.screen.k})`);
    for (const node of this.svg.querySelectorAll<SVGElement>("[data-fixed]")) {
      const [x, y] = (node.dataset.fixed ?? "0,0").split(",").map(Number);
      node.setAttribute("transform", `translate(${x} ${y}) scale(${1 / this.screen.k})`);
    }
  }

  private fitParams(): Screen {
    return fitScreen(this.camera, this.pivot, corners(this.bench), this.viewport());
  }

  fit(): void {
    this.screen = this.fitParams();
    this.applyCamera();
  }

  private zoomBy(factor: number, px: number, py: number): void {
    this.screen = zoomAt(this.screen, factor, px, py);
    this.applyCamera();
  }

  private setCamera(theta: number, phi: number, pivot?: { s: Point2; w: Point2 }): void {
    this.camera = { theta, phi: clamp(phi, MIN_ELEVATION, TOP_DOWN) };
    if (pivot) {
      const s = toScreen(this.screen, project(this.camera, this.pivot, pivot.w[0], pivot.w[1], 0));
      this.screen = { ...this.screen, x: this.screen.x + pivot.s[0] - s[0], y: this.screen.y + pivot.s[1] - s[1] };
    }
    this.draw();
  }

  private pivotAt(sx: number, sy: number): { s: Point2; w: Point2 } {
    const [px, py] = fromScreen(this.screen, sx, sy);
    return { s: [sx, sy], w: unproject(this.camera, this.pivot, px, py) };
  }

  private tween(ms: number, step: (t: number) => void): Promise<void> {
    if (this.instant) {
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

  async orbitTo(theta: number, phi: number, ms = 520, fitAfter = false): Promise<void> {
    const from = { ...this.camera };
    const to = { theta, phi: clamp(phi, MIN_ELEVATION, TOP_DOWN) };
    const { width, height } = this.viewport();
    const pivot = this.pivotAt(width / 2, height / 2);
    let end: Screen | null = null;
    if (fitAfter) {
      const kept = this.camera;
      this.camera = to;
      end = this.fitParams();
      this.camera = kept;
    }
    const screen0 = { ...this.screen };
    await this.tween(ms, (t) => {
      const k = smooth(t);
      this.setCamera(from.theta + (to.theta - from.theta) * k, from.phi + (to.phi - from.phi) * k, end ? undefined : pivot);
      if (end) {
        this.screen = { k: screen0.k + (end.k - screen0.k) * k, x: screen0.x + (end.x - screen0.x) * k, y: screen0.y + (end.y - screen0.y) * k };
        this.applyCamera();
      }
    });
    this.setCamera(to.theta, to.phi, end ? undefined : pivot);
    if (end) {
      this.screen = end;
      this.applyCamera();
    }
    this.syncButtons();
  }

  rotateBy(radians: number): Promise<void> {
    return this.orbitTo(this.camera.theta + radians, this.camera.phi);
  }

  /** Straight down, squared to the screen with the whole board in view; or back to the resting angle. */
  topDown(): Promise<void> {
    return isTopDown(this.camera) ? this.orbitTo(this.camera.theta + Math.PI / 4, REST_ELEVATION, 520, true) : this.orbitTo(this.camera.theta - Math.PI / 4, TOP_DOWN, 520, true);
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
          node.style.display = "";
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
          node.style.display = "";
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
          node.style.display = "";
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
    this.showEvidence(h);
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
    let out = this.evidenceFor(h, pinned);
    if (pinned) {
      out += `<button class="close" title="dismiss">&times;</button>`;
    }
    box.innerHTML = out;
    box.style.display = "block";
    box.classList.toggle("pinned", pinned);
    box.dataset.pin = pinned ? `${h.kind}:${h.id}` : "";
    if (pinned) {
      box.querySelector(".close")?.addEventListener("click", () => this.unpin());
    }
    const { width, height } = this.viewport();
    const rect = box.getBoundingClientRect();
    box.style.left = `${clamp(this.lastPointer[0] + 18, 12, width - rect.width - 12)}px`;
    box.style.top = `${clamp(this.lastPointer[1] + 18, 12, height - rect.height - 12)}px`;
  }

  /** The panel's words for what the pointer is on: a peek on hover, everything when pinned. */
  private evidenceFor(h: Hover, full: boolean): string {
    if (h.kind === "road") {
      const road = this.model.roads.find((candidate) => candidate.id === h.id);
      if (!road) {
        return "";
      }
      const verb = road.kind === "call" ? "calls" : "stands on";
      const door = road.door ? `<div>${escapeHtml(road.door.name)}${road.door.kind ? ` <span class="k">· ${escapeHtml(road.door.kind)}</span>` : ""}</div>` : "";
      const over = road.over ? `<div><span class="k">over</span> ${escapeHtml(road.over)}</div>` : "";
      const meaning = road.kind === "stands" ? `<div class="k">its code built in; no call crosses this while they run</div>` : "";
      const shown = full ? road.lines : road.lines.slice(0, 6);
      const lines = shown.map((line) => `<div class="via">${escapeHtml(line.label)}</div><div class="f">${this.fileLink(line.from)} &rarr; ${this.fileLink(line.to)}</div>`).join("");
      const more = road.lines.length > shown.length ? `<div class="src">and ${road.lines.length - shown.length} more; click to pin and see them all</div>` : "";
      const source = road.basis === "declared" ? `<div class="src">declared on the board</div>` : `<div class="src">${road.count} edge${road.count === 1 ? "" : "s"} in the docs</div>`;
      return `<div class="h">${this.pinLink("piece", road.from)} ${verb} ${this.pinLink("piece", road.to)}<span class="tier">${BASIS_WORDS[road.basis]}</span></div>${door}${over}${meaning}${lines}${more}${source}`;
    }
    if (h.kind === "piece") {
      const piece = this.model.pieces.find((candidate) => candidate.name === h.id);
      if (!piece) {
        return "";
      }
      const folder = piece.folder ?? "";
      const inside = (file: string): string => (folder && file.startsWith(`${folder}/`) ? file.slice(folder.length + 1) : file);
      const regions = regionsOf(this.model, piece.name);
      const calls = [...new Set(this.model.roads.filter((road) => road.kind === "call" && road.from === piece.name).map((road) => road.to))];
      const calledBy = [...new Set(this.model.roads.filter((road) => road.kind === "call" && road.to === piece.name).map((road) => road.from))];
      const onPieces = this.standsOnPieces(piece.name).map((road) => road.to);
      const under = this.standingOn(piece.name).map((road) => road.from);
      const packages = piece.standsOn.filter((item) => item.label.includes("@"));
      const references = piece.standsOn.filter((item) => !item.label.includes("@"));
      const manifests = [...new Set(piece.standsOn.map((item) => item.manifest))];
      const stands = [
        ...onPieces.map((name) => this.pinLink("piece", name)),
        packages.length ? `${packages.length} package${packages.length === 1 ? "" : "s"}` : "",
        references.length ? `${references.length} reference${references.length === 1 ? "" : "s"}` : ""
      ].filter(Boolean).join(", ");
      const files = full && piece.files.length ? `<div class="list">${piece.files.map((file) => `<span class="f">${this.fileLink(file, inside(file))}</span>`).join("")}</div>` : "";
      const served = piece.doors.map((door) => (full
        ? `<span class="f">${escapeHtml(door.name)} <span class="k">· ${escapeHtml(door.kind)}${door.file ? ` in ${this.fileLink(door.file, inside(door.file))}` : ", declared"}</span></span>`
        : escapeHtml(door.name)));
      const standsList = full && piece.standsOn.length ? `<div class="list">${piece.standsOn.map((item) => `<span class="f">${escapeHtml(item.label)} <span class="k">in ${this.fileLink(item.manifest, inside(item.manifest))}</span></span>`).join("")}</div>` : "";
      const named = piece.standsOn.length && !full ? `<div class="src">named in ${manifests.map((manifest) => this.fileLink(manifest, inside(manifest))).join(", ")}</div>` : "";
      return `<div class="h">${escapeHtml(piece.name)}<span class="tier">${escapeHtml(piece.kind ?? "thing")}${regions.length ? ` · ${regions.map((region) => this.pinLink("region", region.name)).join(" · ")}` : ""}</span></div>`
        + (piece.imagined ? `<div>imagined: no folder yet</div>` : `<div>${piece.files.length} file${piece.files.length === 1 ? "" : "s"} · ${piece.symbols} symbol${piece.symbols === 1 ? "" : "s"}</div>${files}`)
        + (served.length ? `<div class="via"><span class="k">serves</span> ${full ? `<div class="list">${served.join("")}</div>` : served.join(", ")}</div>` : "")
        + (calls.length ? `<div class="via"><span class="k">calls</span> ${calls.map((name) => this.pinLink("piece", name)).join(", ")}</div>` : "")
        + (calledBy.length ? `<div class="via"><span class="k">called by</span> ${calledBy.map((name) => this.pinLink("piece", name)).join(", ")}</div>` : "")
        + (stands ? `<div class="via"><span class="k">stands on</span> ${stands}</div>${standsList}${named}` : "")
        + (under.length ? `<div class="via"><span class="k">under</span> ${under.map((name) => this.pinLink("piece", name)).join(", ")}</div>` : "")
        + (piece.folder ? `<div class="src">${escapeHtml(piece.folder)}</div>` : "");
    }
    if (h.kind === "token") {
      const token = this.tokens.find((candidate) => candidate.key === h.id);
      if (!token) {
        return "";
      }
      const rows: string[] = [];
      for (const user of token.users) {
        const item = this.model.pieces.find((candidate) => candidate.name === user)?.standsOn.find((candidate) => candidate.label === token.label);
        rows.push(`<span class="f">${this.pinLink("piece", user)}${item ? ` <span class="k">in ${this.fileLink(item.manifest)}</span>` : ""}</span>`);
      }
      return `<div class="h">${escapeHtml(token.label)}<span class="tier">${token.kind}</span></div>`
        + (full ? `<div class="via"><span class="k">under</span></div><div class="list">${rows.join("")}</div>` : `<div><span class="k">under</span> ${token.users.map((user) => this.pinLink("piece", user)).join(", ")}</div><div class="src">named in the manifests</div>`);
    }
    if (h.kind === "door") {
      const door = this.doors.find((candidate) => candidate.key === h.id);
      if (!door) {
        return "";
      }
      const served = door.role === "in" ? this.model.pieces.find((candidate) => candidate.name === door.piece)?.doors.find((candidate) => candidate.name === door.label) : undefined;
      const where = served?.file ? `<div class="src">in ${this.fileLink(served.file)}</div>` : "";
      return `<div class="h">${escapeHtml(door.label)}<span class="tier">${door.role === "in" ? "a door that serves" : "a door that calls"}</span></div><div class="k">${escapeHtml(door.sub)}</div><div><span class="k">on</span> ${this.pinLink("piece", door.piece)}</div>${where}`;
    }
    if (h.kind === "region") {
      const region = this.model.regions.find((candidate) => candidate.name === h.id);
      if (!region) {
        return "";
      }
      const isRegion = (name: string): boolean => this.model.regions.some((candidate) => candidate.name === name);
      return `<div class="h">${escapeHtml(region.name)}<span class="tier">${escapeHtml(region.kind ?? "region")}</span></div><div><span class="k">holds</span> ${region.holds.map((name) => this.pinLink(isRegion(name) ? "region" : "piece", name)).join(", ")}</div>`;
    }
    const crossing = this.model.crossings.find((candidate) => candidate.id === h.id);
    return crossing ? `<div class="h">${this.pinLink("region", crossing.from)} and ${this.pinLink("region", crossing.to)}<span class="tier">declared</span></div>${crossing.over ? `<div><span class="k">over</span> ${escapeHtml(crossing.over)}</div>` : ""}<div class="src">declared on the board</div>` : "";
  }

  /** A name in a panel that pins the thing it names. */
  private pinLink(kind: Hover["kind"], id: string): string {
    return `<a href="#" class="pin" data-pin-kind="${escapeHtml(kind)}" data-pin-id="${escapeHtml(id)}">${escapeHtml(id)}</a>`;
  }

  /** A file in a panel that opens in the Local Map. */
  private fileLink(file: string, text = file): string {
    return `<a class="file" href="${escapeHtml(localMapHref(file))}" data-file="${escapeHtml(file)}">${escapeHtml(text)}</a>`;
  }

  pin(h: Hover): void {
    this.pinned = h;
    this.evidence.dataset.pin = "";
    this.applyHover();
  }

  unpin(): void {
    this.pinned = null;
    this.evidence.dataset.pin = "";
    this.applyHover();
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
      const pieceNode = orbit ? null : target.closest<SVGElement>(".w-piece");
      const piece = pieceNode?.dataset.piece;
      svg.setPointerCapture(event.pointerId);
      const [px, py] = fromScreen(this.screen, event.clientX - this.svgLeft(), event.clientY - this.svgTop());
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
        pos0: piece ? [...(this.positions.get(piece) ?? [0, 0])] as Point2 : undefined
      };
      if (!piece) {
        svg.classList.add("panning");
      }
    });

    on(svg, "pointermove", (event: PointerEvent) => {
      this.lastPointer = [event.clientX - this.svgLeft(), event.clientY - this.svgTop()];
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
          this.draw();
        } else if (drag.orbit) {
          // The world follows the pointer, as it does in the force graph: drag right and the camera turns left, drag down and the camera rises.
        this.setCamera(drag.theta0 - (event.clientX - drag.x0) * 0.006, drag.phi0 + (event.clientY - drag.y0) * 0.005, drag.pivot);
        } else if (!drag.piece) {
          this.screen = { ...this.screen, x: drag.screen0.x + event.clientX - drag.x0, y: drag.screen0.y + event.clientY - drag.y0 };
          this.applyCamera();
        }
        return;
      }
      const h = this.hoverAt(event.target as Element);
      if (this.pinned) {
        this.hover = h;
        return;
      }
      if (JSON.stringify(h) !== JSON.stringify(this.hover)) {
        this.hover = h;
        this.applyHover();
      } else if (h) {
        this.showEvidence(h);
      }
    });

    on(svg, "pointerup", () => {
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
        this.savePositions();
        this.draw();
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
      if (!this.drag && !this.pinned) {
        this.hover = null;
        this.applyHover();
      }
    });

    on(this.root, "wheel", (event: WheelEvent) => {
      event.preventDefault();
      this.zoomBy(Math.exp(-event.deltaY * 0.0016), event.clientX - this.svgLeft(), event.clientY - this.svgTop());
    }, { passive: false });

    on(window, "keydown", (event: KeyboardEvent) => {
      if (!this.world.isConnected || !this.world.closest(".view-container.active")) {
        return;
      }
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      const key = event.key.toLowerCase();
      if (event.key === "Escape") {
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
        return;
      }
      if (event.key === "?") {
        this.toggleHelp();
      } else if (key === "q") {
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
      } else if (key === "d") {
        this.setTheme(this.theme === "dark" ? "light" : "dark");
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

    on(this.evidence, "click", (event: MouseEvent) => {
      const anchor = (event.target as Element).closest<HTMLAnchorElement>("a[data-pin-id], a[data-file]");
      if (!anchor) {
        return;
      }
      const rect = this.evidence.getBoundingClientRect();
      this.lastPointer = [rect.left - this.svgLeft() - 18, rect.top - this.svgTop() - 18];
      if (anchor.dataset.pinId !== undefined) {
        event.preventDefault();
        this.pin({ kind: anchor.dataset.pinKind as Hover["kind"], id: anchor.dataset.pinId });
      } else if (anchor.dataset.file !== undefined && this.onOpenFile && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
        event.preventDefault();
        this.onOpenFile(anchor.dataset.file);
      }
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

  private syncButtons(): void {
    this.button("tilt")?.classList.toggle("on", isTopDown(this.camera));
    this.button("under")?.classList.toggle("on", this.under);
    this.button("snap")?.classList.toggle("on", this.snap);
    const theme = this.button("theme");
    if (theme) {
      theme.textContent = this.theme === "dark" ? "light" : "dark";
    }
  }

  setSnap(value: boolean): void {
    this.snap = value;
    this.syncButtons();
    this.draw();
  }

  setUnder(value: boolean): void {
    this.under = value;
    this.world.classList.toggle("under", value);
    this.syncButtons();
    this.draw();
  }

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

  resetLayout(): void {
    this.positions = new Map(this.restPositions);
    this.savePositions();
    this.draw();
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
    this.crumbs.innerHTML = `<b>${escapeHtml(this.model.title)}</b> <span style="color:var(--w-faint)">· ${parts.join(", ")}</span>`;
  }

  // ==========================================================================
  // Help and the walkthrough
  // ==========================================================================

  private writeHelp(): void {
    this.help.innerHTML = `<h3>World Map</h3><p>Each thing on the board is a system, a database, a person, or something imagined. Click one for its facts. A tinted region holds the things inside it.</p>
<h4>Doors and wires</h4><p><i style="border-color:var(--w-green)"></i><b>green</b> serves, <i style="border-color:var(--w-blue)"></i><b>blue</b> calls. A wire in the air is one call, flowing the way the request goes; hover it for how it is known. The warm sleeve is a declared crossing.</p>
<h4>What a thing stands on</h4><p>The strands under a thing are what it is built with: another thing's code, drawn as a dotted line on the board to that thing, and the packages its manifests name. No call crosses these while the things run. <b>built on</b> lays out what two or more things share.</p>
<h4>Pinned</h4><p>A hover peeks; a click pins. In a pinned panel every name is a link: a thing pins it, a file opens it in the Local Map.</p>
<h4>Moving around</h4><p>Drag to pan. Right-drag or <kbd>Shift</kbd>-drag to orbit. Wheel to zoom. Drag a thing to move it; <b>save board</b> writes the positions into the board text.</p>
<p><kbd>Q</kbd> <kbd>E</kbd> turn · <kbd>T</kbd> top-down · <kbd>F</kbd> fit · <kbd>U</kbd> built on · <kbd>G</kbd> snap · <kbd>D</kbd> dark · <kbd>R</kbd> reset · <kbd>Esc</kbd> back</p>
<button data-act="tour">walk me through it</button>`;
    this.help.querySelector("[data-act=tour]")?.addEventListener("click", () => {
      this.toggleHelp(false);
      void this.startTour();
    });
  }

  toggleHelp(value?: boolean): void {
    const on = value === undefined ? !this.help.classList.contains("on") : value;
    this.help.classList.toggle("on", on);
    this.helpButton.classList.toggle("on", on);
  }

  private tourSteps(): Array<{ text: string; go: () => void | Promise<void> }> {
    const firstPiece = this.model.pieces[0]?.name;
    const firstRoad = this.model.roads.find((road) => road.kind === "call") ?? this.model.roads[0];
    const { width, height } = this.viewport();
    const point: Point2 = [width * 0.5, height * 0.42];
    return [
      { text: "Each thing on the board is one system, database or person, drawn by its kind. Click one to pin what it serves, calls and stands on; every name in the panel is a link.", go: () => { if (firstPiece) { this.hover = { kind: "piece", id: firstPiece }; this.lastPointer = point; this.applyHover(); } } },
      { text: "A wire is one call, from a blue door to a green one, flowing the way the request goes. Hover it for how it is known and which files carry it.", go: () => { if (firstRoad) { this.hover = { kind: "road", id: firstRoad.id }; this.lastPointer = point; this.applyHover(); } } },
      { text: "The strands under a thing are what it is built with: another thing's code, a dotted line on the board, or a package from its manifests. Built on shows what things share.", go: () => { this.hover = null; this.applyHover(); this.setUnder(true); } },
      { text: "Drag to pan, right-drag to orbit, wheel to zoom. Things stay where you put them, and save board writes them into the text.", go: async () => { this.setUnder(false); await this.orbitTo((-35 * Math.PI) / 180, (42 * Math.PI) / 180); } }
    ];
  }

  async tourStep(index: number): Promise<void> {
    const steps = this.tourSteps();
    this.tour.at = clamp(index, 0, steps.length - 1);
    this.tourBox.querySelector(".step")!.textContent = `${this.tour.at + 1} of ${steps.length}`;
    this.tourBox.querySelector(".text")!.textContent = steps[this.tour.at].text;
    (this.tourBox.querySelector<HTMLButtonElement>("[data-tour=back]"))!.disabled = this.tour.at === 0;
    (this.tourBox.querySelector<HTMLElement>("[data-tour=next]"))!.style.display = this.tour.at === steps.length - 1 ? "none" : "";
    await steps[this.tour.at].go();
  }

  async startTour(): Promise<void> {
    this.tour.on = true;
    this.tourBox.classList.add("on");
    await this.tourStep(0);
  }

  endTour(): void {
    this.tour.on = false;
    this.tourBox.classList.remove("on");
    this.hover = null;
    this.applyHover();
    if (this.under) {
      this.setUnder(false);
    }
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
      move: (name, x, y) => { if (this.positions.has(name)) { this.positions.set(name, unitsToPixels([x, y])); this.savePositions(); this.draw(); } },
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
      lidCorners: (name) => {
        const placed = this.place(name);
        return corners({ x: placed.x, y: placed.y, w: placed.w, d: placed.d }).map(([x, y]) => toScreen(this.screen, project(this.camera, this.pivot, x, y, placed.z0 + placed.h)));
      },
      pointInLid: (name, sx, sy) => pointInPolygon(this.api.lidCorners(name), [sx, sy])
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

function escapeHtml(text: string): string {
  return text.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;");
}

function basename(path: string): string {
  return path.split("/").pop() ?? path;
}

/** The page's URL opened on the Local Map at a file, so a link can be followed in a new tab as well as in place. */
function localMapHref(file: string): string {
  const url = new URL(window.location.href);
  for (const key of ["view", "node", "s"]) {
    url.searchParams.delete(key);
  }
  url.searchParams.set("view", "local");
  url.searchParams.set("node", file);
  return `${url.pathname}?${url.searchParams.toString()}`;
}

/** A colour between two hex colours. */
function mix(a: string, b: string, t: number): string {
  const channels = (colour: string): number[] => [1, 3, 5].map((i) => parseInt(colour.slice(i, i + 2), 16));
  const A = channels(a);
  const B = channels(b);
  return `rgb(${A.map((value, i) => Math.round(value + (B[i] - value) * t)).join(",")})`;
}

export { NORMALS };
