import { settleViews } from "../dom";
import { activePalette, mix, whenPaletteChanges } from "../palette";
import { directoryNodeId } from "./forceGraphData";
import type { SceneBody } from "./perspectiveBodies";
import { directoryOpacity, gatherWire, outlineLength, parseCssContent, pathOutline, perspectiveCorrespondences, perspectivePhases, polygonOutline, sampleOutline, tokenLabelPresence, type TransitionPoint } from "./perspectiveGeometry";

/** Screen-space correspondence between native cards and native force positions. */
export interface SceneFile {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  /** A frozen projection of a real container, never painted as an opaque sphere. */
  body?: SceneBody;
}

/** A frozen projection of the native force scene, without introducing another layout. */
export interface ForceScene {
  files: SceneFile[];
  links: { source: string; target: string }[];
  /** A collapsed Structure directory whose real destination is its sole file, without duplicating the file node. */
  directoryRepresentatives?: ReadonlyMap<string, string>;
}

interface CardSnapshot {
  /** Where the card's title stands and its name: its token travels as the 3D file does, in the 3D file's colour. */
  file: Omit<SceneFile, "color">;
  /** The card's drawing, for a card whose box meets the transition's frame; none for one outside it, never seen. */
  clone: HTMLElement | null;
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface WireSnapshot {
  provider: string;
  consumer: string;
  points: TransitionPoint[];
  opacity: number;
  width: number;
}

interface DirectorySnapshot {
  directory: string;
  depth: number;
  clone: HTMLElement;
  x: number;
  y: number;
  scale: number;
}

/** Native reading geometry, captured before the view is hidden or its camera changes. */
export interface LocalScene {
  cards: CardSnapshot[];
  wires: WireSnapshot[];
  directories: DirectorySnapshot[];
}

/** A capture of the 2D map: its scene, complete once `copied` resolves, the copies of its cards and its directories' shells made a slice at a time. */
export interface LocalCapture {
  scene: LocalScene;
  /** Resolves when every card the frame meets has its copy; the transition waits for it. */
  copied: Promise<void>;
  /** Stop copying, for a capture no transition will use. */
  cancel: () => void;
}

/**
 * How long one slice of the cards' copying may hold the page's main thread, in milliseconds, at least; and at most, where
 * the page is slow to come back to the copying between slices. Between two slices the page draws a frame when one is
 * due, and where the 3D picture's software renderer takes a few hundred milliseconds a frame, slices of 16 ms had kept
 * the copying to a twentieth of the time and the transition waiting for seconds (the header round's specs, 2026-11-08);
 * a slice as long as the page was away, up to the most, keeps the copying to about half of it.
 */
const COPY_SLICE = 16, COPY_SLICE_MOST = 100;

/**
 * Capture native cards, rendered symbol curves and directory shells before hiding their view. Every place, every wire
 * and every shell is read at once, while the picture stands as it was pressed; the copies, of the cards and of the
 * directories' shells, the costly part, are
 * made in slices of the page's main thread between which it answers input and draws, while the caller holds the
 * picture still ({@link holdPerspective}), and `copied` says when they are done (2026-11-07: made at once, they had held
 * the page for seconds).
 */
export function captureLocalScene(root: HTMLElement, frame: DOMRect): LocalCapture {
  const started = performance.now();
  const copies: { steps: Generator<void, HTMLElement>; done: (copy: HTMLElement) => void }[] = [];
  const moving = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // What the transition can show of a copy: its frame, grown so that a part standing a little past its box is kept.
  const seen = { left: frame.left - SEEN_MARGIN, top: frame.top - SEEN_MARGIN, right: frame.right + SEEN_MARGIN, bottom: frame.bottom + SEEN_MARGIN };
  const catalog = copyStyleCatalog(root.ownerDocument);
  const cards = [...root.querySelectorAll<HTMLElement>(".node-card, .local-directory-closed")].flatMap(card => {
    const directory = card.classList.contains("local-directory-closed");
    const title = card.querySelector<HTMLElement>(directory ? ".local-directory-closed__name" : ".node-title");
    if (!title) return [];
    const rect = card.getBoundingClientRect(), t = title.getBoundingClientRect();
    // A card is drawn only inside its own box while it folds (it shrinks toward its title and has gone before its token
    // moves), so a card outside the transition's frame is never seen and is not copied: its token travels all the same.
    const x = t.left + t.width / 2, y = t.top + t.height / 2;
    const snapshot: CardSnapshot = { file: { id: directory ? directoryNodeId(card.dataset.directory!) : card.dataset.id!,
      name: title.textContent ?? "", x, y, radius: 5 },
      clone: null, width: card.offsetWidth, height: card.offsetHeight, scale: rect.width / card.offsetWidth,
      offsetX: x - rect.left, offsetY: y - rect.top };
    // Under reduced motion there is no transition to draw a copy in: none is made, and the switch does not wait for any.
    if (moving && meets(rect, frame)) copies.push({ steps: visualCopySteps(card, catalog, catalog.hostAValues, true, seen, { x, y }), done: copy => { snapshot.clone = copy; } });
    return [snapshot];
  });
  const cardsDone = performance.now();
  performance.measure("live-docs:capture-cards", { start: started, end: cardsDone });
  const svgCtms = new WeakMap<SVGSVGElement, DOMMatrix | null>();
  const wires = [...root.querySelectorAll<SVGPathElement>(".connection-path")].flatMap(path => {
    if (!path.dataset.sourceId || !path.dataset.targetId) return [];
    const style = getComputedStyle(path);
    const svg = path.ownerSVGElement;
    let matrix: DOMMatrix | null;
    if (svg && path.parentNode === svg && !path.hasAttribute("transform") && style.transform === "none") {
      if (svgCtms.has(svg)) matrix = svgCtms.get(svg)!;
      else { matrix = svg.getScreenCTM(); svgCtms.set(svg, matrix); }
    } else {
      matrix = path.getScreenCTM();
    }
    if (!matrix) return [];
    // The outline is read from the wire's own data where the Local Map wrote it in the forms it uses, the browser's
    // sampling being some 15 ms a wire; any other form is sampled by the browser as before.
    const outline = path.tagName === "polygon" ? polygonOutline(path.getAttribute("points") ?? "") : pathOutline(path.getAttribute("d") ?? "");
    const length = outline ? outlineLength(outline) : path.getTotalLength();
    const steps = Math.max(24, Math.min(256, Math.ceil(length / 4)));
    const local = outline ? sampleOutline(outline, steps)
      : Array.from({ length: steps + 1 }, (_, i) => path.getPointAtLength(length * i / steps));
    const points = local.map(point => ({ x: matrix.a * point.x + matrix.c * point.y + matrix.e, y: matrix.b * point.x + matrix.d * point.y + matrix.f }));
    return [{ provider: path.dataset.targetId, consumer: path.dataset.sourceId, points,
      opacity: Number(style.opacity) * Number(path.tagName === "polygon" ? style.fillOpacity : style.strokeOpacity),
      width: parseFloat(style.strokeWidth) * Math.hypot(matrix.a, matrix.b) }];
  });
  const wiresDone = performance.now();
  performance.measure("live-docs:capture-wires", { start: cardsDone, end: wiresDone });
  const directories = [...root.querySelectorAll<HTMLElement>(".local-directory-band")].map(band => {
    const rect = band.getBoundingClientRect();
    // A band is drawn only inside its own box, so one outside the frame stands in the layer as an empty box of its
    // size, keeping its identity and depth; its outline and its label are copied where the frame meets them.
    // Only the shell travels here, its outline and its label; cards and nested bands each have one identity.
    const shape = band.querySelector<HTMLElement>(":scope > .local-membrane");
    const label = band.querySelector<HTMLElement>(":scope > .local-directory-label");
    const parts = { own: meets(rect, seen), shape: shape && meets(shape.getBoundingClientRect(), seen) ? shape : null,
      label: label && meets(label.getBoundingClientRect(), seen) ? label : null };
    const box = { display: "block", width: `${band.offsetWidth}px`, height: `${band.offsetHeight}px`,
      boxSizing: "border-box", margin: "0", position: "absolute", transformOrigin: "0 0" };
    let depth = 0;
    for (let parent = band.parentElement; parent && parent !== root; parent = parent.parentElement) {
      if (parent.classList.contains("local-directory-band")) depth++;
    }
    // The box stands at once; its copies are made in the slices with the cards' (2026-11-21: made at once, the 22
    // shells of graph.ts's picture held the 3D press for 325 to 383 ms of its 600 to 690).
    const snapshot: DirectorySnapshot = { directory: band.dataset.directory ?? "", depth, clone: document.createElement("div"),
      x: rect.left, y: rect.top, scale: rect.width / band.offsetWidth };
    Object.assign(snapshot.clone.style, box);
    if (moving && (parts.own || parts.shape || parts.label)) {
      copies.push({ steps: shellCopySteps(band, parts, seen, catalog), done: copy => { Object.assign(copy.style, box); snapshot.clone = copy; } });
    }
    return snapshot;
  });
  performance.measure("live-docs:capture-directories", { start: wiresDone });
  performance.mark("live-docs:capture-counts", { detail: { cards: cards.length, copied: copies.length, wires: wires.length, directories: directories.length } });
  let cancelled = false;
  const channel = new MessageChannel();
  const copied = new Promise<void>(resolve => {
    const copying = performance.now();
    let paused = copying;
    const slice = (): void => {
      if (cancelled) { channel.port1.close(); resolve(); return; }
      const begun = performance.now();
      // As long as the page was away since the last slice, within the bounds.
      const budget = Math.min(COPY_SLICE_MOST, Math.max(COPY_SLICE, begun - paused));
      while (copies.length) {
        let step: IteratorResult<void, HTMLElement>;
        // A card the page removed or changed under the copy is left undrawn, rather than the transition never starting.
        try { step = copies[0].steps.next(); } catch { copies.shift(); continue; }
        if (step.done) { copies[0].done(step.value); copies.shift(); continue; }
        if (performance.now() - begun >= budget) { paused = performance.now(); channel.port2.postMessage(null); return; }
      }
      channel.port1.close();
      performance.measure("live-docs:capture-copies", { start: copying });
      resolve();
    };
    // A task of its own each slice, not a frame: the page answers input and draws between slices as it needs, and the
    // copying is not paced by frames, which the 3D picture's software renderer makes slow on some machines.
    channel.port1.onmessage = slice;
    slice();
  });
  return { scene: { cards, wires, directories }, copied, cancel: () => { cancelled = true; } };
}

/**
 * Fold cards to named file tokens, then rearrange those tokens to the native
 * projection. Reverse the same sequence on approach. Canonical edges and pins
 * are not changed by this temporary, non-interactive drawing.
 */
export function animatePerspective(
  scene: LocalScene, graph: ForceScene, toGraph: boolean, focusId: string,
  viewport: DOMRect, onFinish: () => void
): () => void {
  const { cards, wires, directories } = scene;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !cards.length && !directories.length) { onFinish(); return () => {}; }
  const layer = document.createElement("div");
  layer.className = "perspective-transition local-map-host";
  layer.dataset.graphFiles = String(graph.files.length);
  layer.setAttribute("aria-hidden", "true");
  layer.inert = true;
  Object.assign(layer.style, { left: `${viewport.left}px`, top: `${viewport.top}px`, width: `${viewport.width}px`, height: `${viewport.height}px` });
  for (const directory of directories) {
    const { clone } = directory;
    clone.dataset.transitionDirectory = directory.directory;
    clone.dataset.depth = String(directory.depth);
    Object.assign(clone.style, { left: `${directory.x - viewport.left}px`, top: `${directory.y - viewport.top}px`, transform: `scale(${directory.scale})` });
    layer.append(clone);
  }
  const bodyPaths = new Map(graph.files.flatMap(file => {
    if (!file.body) return [];
    const pathOf = (boundaries: readonly (readonly TransitionPoint[])[]): Path2D => {
      const path = new Path2D();
      for (const boundary of boundaries) {
        boundary.forEach((point, index) => { if (index) path.lineTo(point.x, point.y); else path.moveTo(point.x, point.y); });
        path.closePath();
      }
      return path;
    };
    return [[file.id, { boundary: pathOf([file.body.boundary]), units: file.body.units.map(unit => ({ ...unit, path: pathOf(unit.polygons ?? [unit.boundary]) })) }]] as const;
  }));
  const bodyPrimitives = graph.files.flatMap(file => {
    if (!file.body) return [];
    const paths = bodyPaths.get(file.id)!, body = file.body;
    return [
      ...paths.units.map(unit => ({ id: file.id, pass: unit.kind === "file" ? 0 : 1, order: unit.order, path: unit.path, unit })),
      { id: file.id, pass: body.kind === "balloon" ? 1 : 2, order: body.order, path: paths.boundary, unit: undefined }
    ];
  }).sort((a, b) => a.pass - b.pass || a.order - b.order);
  const levels = 1 + Math.max(0, ...directories.map(directory => directory.depth));
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width * devicePixelRatio); canvas.height = Math.ceil(viewport.height * devicePixelRatio);
  Object.assign(canvas.style, { width: "100%", height: "100%", position: "absolute" });
  layer.append(canvas);
  const context = canvas.getContext("2d")!;
  context.scale(devicePixelRatio, devicePixelRatio);
  // The layer goes from the 2D map's ground to the 3D map's as the background phase runs; the wires fold in the roles'
  // colours, and the files and skins in the 3D map's own.
  const palette = activePalette();
  const projected = new Map(graph.files.map(file => [file.id, file]));
  const local = new Map(cards.map(card => [card.file.id, card]));
  const correspondences = perspectiveCorrespondences([...local.keys()], new Set(projected.keys()), graph.directoryRepresentatives);
  const localForFile = new Map([...correspondences].map(([localId, graphId]) => [graphId, local.get(localId)!]));
  const pairKey = (a: string, b: string): string => JSON.stringify([a, b].sort());
  const pairs = new Map<string, WireSnapshot[]>();
  for (const wire of wires) {
    const key = pairKey(wire.provider, wire.consumer);
    const group = pairs.get(key) ?? [];
    group.push(wire); pairs.set(key, group);
  }
  layer.dataset.symbolWires = String(wires.length);
  layer.dataset.filePairs = String(pairs.size);
  const ghosts = cards.map(card => {
    let wrapper: HTMLElement | null = null;
    if (card.clone) {
      wrapper = document.createElement("div");
      wrapper.className = "perspective-card local-column center";
      Object.assign(wrapper.style, { position: "absolute", width: `${card.width}px`, height: `${card.height}px`, transformOrigin: "0 0" });
      Object.assign(card.clone.style, { width: `${card.width}px`, height: `${card.height}px`, boxSizing: "border-box", margin: "0", transition: "none" });
      wrapper.append(card.clone); layer.append(wrapper);
    }
    const label = document.createElement("div");
    label.className = "perspective-file-name";
    label.dataset.nodeId = card.file.id;
    label.textContent = card.file.name;
    layer.append(label);
    return { card, wrapper, label };
  });
  document.body.append(layer);
  let frameId = 0;
  const start = performance.now();
  const frame = (now: number): void => {
    const elapsed = Math.min(1, (now - start) / 1400);
    const progress = toGraph ? elapsed : 1 - elapsed;
    const { fold, move, background } = perspectivePhases(progress);
    for (const directory of directories) directory.clone.style.opacity = String(directoryOpacity(progress, directory.depth, levels));
    layer.style.backgroundColor = mix(palette.ground.surface, palette.scene.ground, background);
    const positions = new Map<string, SceneFile>();
    for (const file of graph.files) {
      const card = localForFile.get(file.id);
      positions.set(file.id, card ? { ...file, x: card.file.x + (file.x - card.file.x) * move, y: card.file.y + (file.y - card.file.y) * move } : file);
    }
    context.clearRect(0, 0, viewport.width, viewport.height);
    layer.dataset.wireFold = String(fold);
    for (const group of pairs.values()) {
      if (fold === 1) continue;
      for (const wire of group) {
        const provider = positions.get(correspondences.get(wire.provider) ?? wire.provider) ?? local.get(wire.provider)?.file;
        const consumer = positions.get(correspondences.get(wire.consumer) ?? wire.consumer) ?? local.get(wire.consumer)?.file;
        if (!provider || !consumer) continue;
        const points = gatherWire(wire.points, provider, consumer, fold);
        context.globalAlpha = wire.opacity * (1 - fold) + .32 / group.length * fold;
        context.lineWidth = wire.width * (1 - fold) + fold;
        const a = points[0], b = points[points.length - 1];
        const gradient = context.createLinearGradient(a.x - viewport.left, a.y - viewport.top, b.x - viewport.left, b.y - viewport.top);
        gradient.addColorStop(0, palette.role.offers); gradient.addColorStop(1, palette.role.uses);
        context.strokeStyle = gradient;
        context.beginPath();
        points.forEach((point, i) => {
          if (i === 0) context.moveTo(point.x - viewport.left, point.y - viewport.top);
          else context.lineTo(point.x - viewport.left, point.y - viewport.top);
        });
        context.stroke();
      }
    }
    context.lineWidth = 1;
    for (const link of graph.links) {
      const a = positions.get(link.source), b = positions.get(link.target);
      if (!a || !b) continue;
      const localA = localForFile.get(a.id), localB = localForFile.get(b.id);
      const inside = !!localA && !!localB && pairs.has(pairKey(localA.file.id, localB.file.id));
      if (fold < 1 && inside) continue;
      context.globalAlpha = inside ? .32 : background * .16;
      context.strokeStyle = inside ? palette.role.offers : palette.scene.unmatchedWire;
      context.beginPath(); context.moveTo(a.x - viewport.left, a.y - viewport.top); context.lineTo(b.x - viewport.left, b.y - viewport.top); context.stroke();
    }
    for (const file of positions.values()) {
      if (file.body) continue;
      context.globalAlpha = localForFile.has(file.id) ? fold : background;
      context.fillStyle = file.color;
      context.beginPath(); context.arc(file.x - viewport.left, file.y - viewport.top, Math.max(.5, Math.min(80, file.radius)), 0, 2 * Math.PI); context.fill();
    }
    // Match the native global passes: file marks, inner/fallback balloons, then outer skins.
    for (const primitive of bodyPrimitives) {
      const file = positions.get(primitive.id)!, body = file.body!;
      const presence = localForFile.has(file.id) ? fold : background;
      context.save(); context.translate(file.x - viewport.left, file.y - viewport.top);
      if (primitive.unit?.kind === "file") {
        context.globalAlpha = presence * primitive.unit.alpha;
        context.fillStyle = primitive.unit.color; context.fill(primitive.path);
      } else {
        const alpha = primitive.unit?.alpha ?? body.alpha;
        const veiled = primitive.unit?.veiled ?? false;
        const inner = !!primitive.unit || body.kind === "balloon";
        const cloud = body.look !== "skin";
        // A bubble or skin the step of the history lights folds white, as it was drawn (2026-11-11).
        const lit = primitive.unit ? !!primitive.unit.lit : !!body.lit;
        context.fillStyle = context.strokeStyle = lit ? palette.history.changed : cloud ? palette.scene.cloud : palette.scene.skin;
        context.globalAlpha = presence * alpha * (cloud ? 0.27 : veiled ? 0.42 : inner ? 0.015 : 0.05);
        context.fill(primitive.path);
        context.globalAlpha = presence * alpha * (cloud ? body.hovered ? 0.6 : 0 : veiled ? 0.62 : inner ? 0.315 : 0.27);
        context.stroke(primitive.path);
      }
      context.restore();
    }
    context.globalAlpha = 1;
    for (const { card, wrapper, label } of ghosts) {
      const counterpart = projected.get(correspondences.get(card.file.id) ?? "");
      const destination = counterpart ?? card.file;
      const x = card.file.x + (destination.x - card.file.x) * move - viewport.left;
      const y = card.file.y + (destination.y - card.file.y) * move - viewport.top;
      // A Structure folder travels to its cell hub or canonical sole file; an unmatched folder fades in/out;
      // showing only its name during the fold would leave unexplained floating text with no corresponding sphere.
      const shrink = counterpart ? 1 - fold : 1;
      if (wrapper) {
        wrapper.style.left = `${x - card.offsetX * shrink}px`;
        wrapper.style.top = `${y - card.offsetY * shrink}px`;
        wrapper.style.transform = `scale(${card.scale * shrink})`;
        wrapper.style.opacity = String(1 - fold);
      }
      label.style.left = `${x}px`; label.style.top = `${y + destination.radius + 10}px`;
      label.style.opacity = String(counterpart ? tokenLabelPresence(fold) * (card.file.id === focusId ? 1 : 1 - background) : 0);
    }
    layer.dataset.progress = String(elapsed);
    if (elapsed < 1) frameId = requestAnimationFrame(frame);
    else { layer.remove(); onFinish(); }
  };
  frame(start);
  return () => { cancelAnimationFrame(frameId); layer.remove(); };
}

/**
 * Hold the source picture while the destination renderer produces its first frame: the source surface itself stays
 * drawn, as it stands, over the destination until released (`perspective-held` in local.css). A held view is laid out
 * and drawn, so nothing need be copied; until 2026-11-07 the hold was a copy of the whole surface with every computed
 * property of every element, several seconds of the page's main thread on this repository's pictures, and on the way to
 * 2D a copy never seen, since the 2D map is ready at once and the cover went in the same task. A view put away is kept
 * and not drawn (`content-visibility` in shell.css), and the held one is put away when its hold lets go: until then it
 * is hidden from assistive technology, a transparent cover over the views' room takes the pointer, so that a click
 * meant for the held picture reaches neither it nor the destination drawing beneath it, and focus offered to it is
 * given back (`dom.ts`). It is not inert while held: making a drawn view inert has the browser work out the style of
 * every element in it again, 180 ms of each press of 3D on a map of 14,810 elements; made inert once it is not drawn,
 * it costs 3 ms (measured 2026-11-22; `settleViews`).
 *
 * The surface keeps the size and border it was drawn with while held, since leaving the 2D map takes away the room its
 * zoom controls kept below it, which would otherwise grow the held map into that room.
 */
export function holdPerspective(root: HTMLElement): () => void {
  let hold = holds.get(root);
  if (!hold) {
    // The cover spans the views' common room, so that the destination drawing beneath, which may reach past the held
    // source (the 3D picture into the 2D map's zoom controls' strip), takes no click either.
    const style = getComputedStyle(root), rect = (root.parentElement ?? root).getBoundingClientRect();
    hold = { count: 0, height: root.style.height, borderBottom: root.style.borderBottom, cover: document.createElement("div") };
    root.style.height = style.height;
    root.style.borderBottom = `${style.borderBottomWidth} ${style.borderBottomStyle} ${style.borderBottomColor}`;
    root.classList.add("perspective-held");
    hold.cover.className = "perspective-hold-cover";
    hold.cover.setAttribute("aria-hidden", "true");
    Object.assign(hold.cover.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
    document.body.append(hold.cover);
    holds.set(root, hold);
  }
  hold.count++;
  const held = hold;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--held.count > 0) return;
    holds.delete(root);
    held.cover.remove();
    // Gone at once, as the copy's cover went, rather than fading for the view's 0.4 s from here.
    const transition = root.style.transition;
    root.style.transition = "none";
    root.classList.remove("perspective-held");
    void getComputedStyle(root).opacity;
    root.style.transition = transition;
    root.style.height = held.height;
    root.style.borderBottom = held.borderBottom;
    // No longer drawn, the view is now made inert with the others put away.
    settleViews();
  };
}

/** The surfaces held: how many holds stand, the inline size and border each had before the first, and its cover. */
const holds = new WeakMap<HTMLElement, { count: number; height: string; borderBottom: string; cover: HTMLElement }>();

interface Box { left: number; top: number; right: number; bottom: number }

/** How far past the transition's frame a copy is kept, in screen pixels: more than any part stands past its box. */
const SEEN_MARGIN = 64;

/** A box grown to hold a point, when there is one. */
function spanning(box: Box, point?: TransitionPoint): Box {
  return point ? { left: Math.min(box.left, point.x), top: Math.min(box.top, point.y), right: Math.max(box.right, point.x), bottom: Math.max(box.bottom, point.y) } : box;
}

/** Whether two boxes overlap. */
function meets(box: Box, frame: Box): boolean {
  return box.right > frame.left && box.left < frame.right && box.bottom > frame.top && box.top < frame.bottom;
}

const SVG_NS = "http://www.w3.org/2000/svg";
const MODE_CONSTANT = 0, MODE_INHERIT = 1, MODE_CURRENT_COLOR = 2, MODE_ALWAYS = 3;

/** Properties whose computed "0px" turns into `medium` (3 px) once their sibling style leaves "none". */
const WIDTH_GUARD_OF: Readonly<Record<string, string>> = {
  "border-top-width": "border-top-style",
  "border-right-width": "border-right-style",
  "border-bottom-width": "border-bottom-style",
  "border-left-width": "border-left-style",
  "border-block-start-width": "border-block-start-style",
  "border-block-end-width": "border-block-end-style",
  "border-inline-start-width": "border-inline-start-style",
  "border-inline-end-width": "border-inline-end-style",
  "outline-width": "outline-style",
  "column-rule-width": "column-rule-style"
};

/** Inherited properties that stay fixed in the neutral probe so logical/physical axes never swap. */
const EXPLICIT_INHERITED = new Set(["writing-mode", "direction"]);

/** Layout-resolved and core visual properties always inspected regardless of stylesheet presence. */
const ALWAYS_CHECK_PROPS = [
  "width", "height", "inline-size", "block-size",
  "min-width", "min-height", "min-inline-size", "min-block-size",
  "max-width", "max-height", "max-inline-size", "max-block-size",
  "top", "right", "bottom", "left",
  "inset-block-start", "inset-block-end", "inset-inline-start", "inset-inline-end",
  "transform", "transform-origin", "perspective", "perspective-origin", "scale", "rotate", "translate",
  "display", "position", "visibility", "opacity", "color", "interactivity", "box-sizing",
  "font-size", "font-family", "font-weight", "font-style", "line-height", "text-align", "white-space",
  "overflow-x", "overflow-y", "overflow-block", "overflow-inline", "text-overflow",
  "fill", "stroke", "stroke-width", "fill-opacity", "stroke-opacity", "stroke-dasharray", "stroke-linecap", "stroke-linejoin",
  "clip-path", "mask", "mask-image", "background-color", "background-image", "box-shadow",
  "z-index", "pointer-events", "cursor", "user-select", "contain", "isolation",
  "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
  "border-block-start-width", "border-block-end-width", "border-inline-start-width", "border-inline-end-width",
  "border-top-style", "border-right-style", "border-bottom-style", "border-left-style",
  "border-block-start-style", "border-block-end-style", "border-inline-start-style", "border-inline-end-style",
  "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
  "border-block-start-color", "border-block-end-color", "border-inline-start-color", "border-inline-end-color",
  "border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
  "border-start-start-radius", "border-start-end-radius", "border-end-start-radius", "border-end-end-radius",
  "margin-top", "margin-right", "margin-bottom", "margin-left",
  "margin-block-start", "margin-block-end", "margin-inline-start", "margin-inline-end",
  "padding-top", "padding-right", "padding-bottom", "padding-left",
  "padding-block-start", "padding-block-end", "padding-inline-start", "padding-inline-end",
  "outline-width", "outline-style", "outline-color", "outline-offset",
  "text-decoration-line", "text-decoration-style", "text-decoration-color", "text-decoration-thickness",
  "row-gap", "column-gap"
];

/** Collect every non-custom, non-animation CSS property declared across a document's stylesheets (following `@import`), or null if unreadable. */
function collectDocumentProps(doc: Document): Set<string> | null {
  const used = new Set<string>(ALWAYS_CHECK_PROPS);
  const walk = (rules: CSSRuleList): void => {
    for (let r = 0; r < rules.length; r++) {
      const rule = rules[r];
      if ("styleSheet" in rule && rule.styleSheet) {
        walk((rule.styleSheet as CSSStyleSheet).cssRules);
      }
      if ("style" in rule && rule.style instanceof CSSStyleDeclaration) {
        for (let i = 0; i < rule.style.length; i++) {
          const name = rule.style.item(i);
          if (!name.startsWith("--") && name !== "animation" && !name.startsWith("animation-")) used.add(name);
        }
      }
      if ("cssRules" in rule && rule.cssRules) walk(rule.cssRules as CSSRuleList);
    }
  };
  for (let s = 0; s < doc.styleSheets.length; s++) {
    try { walk(doc.styleSheets[s].cssRules); } catch { return null; }
  }
  for (const [widthProp, styleProp] of Object.entries(WIDTH_GUARD_OF)) {
    if (used.has(widthProp)) used.add(styleProp);
  }
  return used;
}

/** Distinct non-default values applied to a probe host so tag baselines classify inherited vs constant properties automatically. */
function probeInheritedOverrides(): string {
  const palette = activePalette();
  return [
    `color: ${palette.role.offers}`,
    "font-family: monospace",
    "font-size: 23px",
    "font-style: italic",
    "font-weight: 700",
    "font-stretch: condensed",
    "font-kerning: none",
    "font-optical-sizing: none",
    "font-synthesis-small-caps: none",
    "font-synthesis-style: none",
    "font-synthesis-weight: none",
    "font-variant-caps: small-caps",
    "font-variant-east-asian: full-width",
    "font-variant-ligatures: no-common-ligatures",
    "font-variant-numeric: tabular-nums",
    "font-variant-position: sub",
    "font-variant-emoji: text",
    "line-height: 31px",
    "letter-spacing: 3px",
    "word-spacing: 7px",
    "white-space: pre",
    "white-space-collapse: preserve",
    "text-wrap-mode: nowrap",
    "text-wrap-style: balance",
    "text-align: right",
    "text-align-last: right",
    "text-indent: 13px",
    "text-transform: uppercase",
    "text-rendering: geometricprecision",
    `text-shadow: ${palette.role.uses} 1px 2px 3px`,
    "text-emphasis-style: dot",
    `text-emphasis-color: ${palette.kind.asset}`,
    "text-emphasis-position: under",
    "text-underline-offset: 5px",
    "text-underline-position: under",
    "text-orientation: upright",
    "text-anchor: middle",
    "text-size-adjust: 150%",
    "visibility: hidden",
    "cursor: crosshair",
    "pointer-events: none",
    "user-select: none",
    "overflow-wrap: anywhere",
    "word-break: break-all",
    "line-break: anywhere",
    "hyphens: manual",
    "hyphenate-character: '~'",
    "tab-size: 3",
    "quotes: '[' ']'",
    "list-style-type: square",
    "list-style-position: inside",
    "orphans: 5",
    "widows: 5",
    "image-rendering: pixelated",
    "shape-rendering: crispedges",
    "color-rendering: optimizespeed",
    "color-interpolation: linearrgb",
    "color-interpolation-filters: srgb",
    `fill: ${palette.kind.directory}`,
    "fill-opacity: 0.5",
    "fill-rule: evenodd",
    `stroke: ${palette.kind.document}`,
    "stroke-width: 5px",
    "stroke-opacity: 0.5",
    "stroke-dasharray: 3px, 4px",
    "stroke-dashoffset: 2px",
    "stroke-linecap: round",
    "stroke-linejoin: round",
    "stroke-miterlimit: 7",
    "paint-order: stroke",
    "clip-rule: evenodd",
    "border-collapse: collapse",
    "border-spacing: 5px",
    "-webkit-border-horizontal-spacing: 5px",
    "-webkit-border-vertical-spacing: 5px",
    "caption-side: bottom",
    "empty-cells: hide",
    "speak: none",
    "print-color-adjust: exact",
    "-webkit-font-smoothing: antialiased",
    `-webkit-text-fill-color: ${palette.hasTests.mark}`,
    `-webkit-text-stroke-color: ${palette.signal.error}`,
    "-webkit-text-stroke-width: 2px",
    `caret-color: ${palette.signal.cue}`,
    "-webkit-box-direction: reverse",
    "-webkit-line-break: after-white-space",
    "-webkit-rtl-ordering: visual",
    "-webkit-ruby-position: after",
    "-webkit-text-combine: horizontal",
    "-webkit-text-orientation: upright",
    "-webkit-text-security: disc",
    "-webkit-user-modify: read-write",
    "ruby-align: center",
    "ruby-position: under",
    "math-style: compact",
    `accent-color: ${palette.signal.pathFound}`,
    "dominant-baseline: central",
    "interactivity: inert"
  ].join(";");
}

interface TagBaseline {
  modes: Uint8Array;
  values: string[];
  hasAnimation: boolean;
}

interface CopyStyleCatalog {
  version: number;
  sheetCount: number;
  doc: Document;
  probeOverrides: string;
  propNames: string[];
  indexOf: Map<string, number>;
  colorIndex: number;
  interactivityIndex: number;
  widthGuardIndices: Int32Array;
  hostAValues: string[];
  hostBValues: string[];
  hostAColor: string;
  hostBColor: string;
  baselines: Map<string, TagBaseline>;
}

let catalogVersion = 0;
whenPaletteChanges(() => { catalogVersion++; });
const styleCatalogs = new WeakMap<Document, CopyStyleCatalog>();

/** Build or reuse a document's tag-baseline catalog so transition copies emit only non-default, non-inherited declarations. */
function copyStyleCatalog(doc: Document): CopyStyleCatalog {
  const cached = styleCatalogs.get(doc);
  if (cached && cached.version === catalogVersion && cached.sheetCount === doc.styleSheets.length) return cached;
  const probeOverrides = probeInheritedOverrides();
  const hostA = doc.createElement("div");
  hostA.className = "perspective-transition local-map-host";
  hostA.style.cssText = "display: none";
  const hostB = doc.createElement("div");
  hostB.className = "perspective-transition local-map-host";
  hostB.style.cssText = `display: none; ${probeOverrides}`;
  doc.body.append(hostA, hostB);
  const csA = getComputedStyle(hostA), csB = getComputedStyle(hostB);
  const usedProps = collectDocumentProps(doc);
  const propNames: string[] = [];
  for (let i = 0; i < csA.length; i++) {
    const name = csA.item(i);
    // Custom properties are never read by a classless copy, animations must never replay on a frozen frame, and
    // properties absent from every stylesheet and core layout set only appear via element inline styles (checked below).
    if (name.startsWith("--") || name === "animation" || name.startsWith("animation-") || (usedProps && !usedProps.has(name))) continue;
    propNames.push(name);
  }
  const indexOf = new Map(propNames.map((name, index) => [name, index]));
  const widthGuardIndices = new Int32Array(propNames.length).fill(-1);
  for (const [widthProp, styleProp] of Object.entries(WIDTH_GUARD_OF)) {
    const wi = indexOf.get(widthProp), si = indexOf.get(styleProp);
    if (wi !== undefined && si !== undefined) widthGuardIndices[wi] = si;
  }
  const interactivityIndex = indexOf.get("interactivity") ?? -1;
  const hostAValues = propNames.map((name, index) => index === interactivityIndex ? "auto" : csA.getPropertyValue(name));
  const hostBValues = propNames.map(name => csB.getPropertyValue(name));
  const colorIndex = indexOf.get("color") ?? -1;
  const hostAColor = colorIndex >= 0 ? hostAValues[colorIndex] : "";
  const hostBColor = colorIndex >= 0 ? hostBValues[colorIndex] : "";
  hostA.remove();
  hostB.remove();
  const catalog: CopyStyleCatalog = {
    version: catalogVersion, sheetCount: doc.styleSheets.length, doc, probeOverrides, propNames, indexOf, colorIndex, interactivityIndex,
    widthGuardIndices, hostAValues, hostBValues, hostAColor, hostBColor, baselines: new Map()
  };
  styleCatalogs.set(doc, catalog);
  return catalog;
}

/** Measure once what a bare, classless tag computes inside the transition layer vs an overridden parent. */
function tagBaseline(catalog: CopyStyleCatalog, element: Element): TagBaseline {
  const ns = element.namespaceURI ?? "";
  const tag = element.tagName;
  const key = `${ns}\0${tag}`;
  const existing = catalog.baselines.get(key);
  if (existing) return existing;
  const { doc, probeOverrides, propNames, hostAValues, hostBValues, hostAColor, hostBColor } = catalog;
  const hostA = doc.createElement("div");
  hostA.className = "perspective-transition local-map-host";
  hostA.style.cssText = "display: none";
  const hostB = doc.createElement("div");
  hostB.className = "perspective-transition local-map-host";
  hostB.style.cssText = `display: none; ${probeOverrides}`;
  const mount = (host: HTMLDivElement): Element => {
    // HTML element.tagName is uppercase ("BUTTON", "P", "A"); createElementNS is case-sensitive and would create
    // unknown XML elements without HTML UA styles, whereas createElement lowercases HTML tags and SVG keeps exact case.
    const sample = ns === SVG_NS ? doc.createElementNS(SVG_NS, tag)
      : ns && ns !== "http://www.w3.org/1999/xhtml" ? doc.createElementNS(ns, tag)
        : doc.createElement(tag);
    if (ns === SVG_NS && tag.toLowerCase() !== "svg") {
      const svg = doc.createElementNS(SVG_NS, "svg");
      svg.append(sample);
      host.append(svg);
    } else {
      host.append(sample);
    }
    return sample;
  };
  const elA = mount(hostA), elB = mount(hostB);
  doc.body.append(hostA, hostB);
  const csA = getComputedStyle(elA), csB = getComputedStyle(elB);
  const count = propNames.length;
  const modes = new Uint8Array(count);
  const values = new Array<string>(count);
  for (let i = 0; i < count; i++) {
    const name = propNames[i];
    const valA = i === catalog.interactivityIndex ? "auto" : csA.getPropertyValue(name);
    const valB = csB.getPropertyValue(name);
    values[i] = valA;
    const hA = hostAValues[i], hB = hostBValues[i];
    if (name !== "color" && valA === hostAColor && valB === hostBColor && hostAColor !== hostBColor) {
      modes[i] = MODE_CURRENT_COLOR;
    } else if (valA === hA && valB === hB && (hA !== hB || EXPLICIT_INHERITED.has(name))) {
      modes[i] = MODE_INHERIT;
    } else if (valA === valB) {
      modes[i] = MODE_CONSTANT;
    } else {
      modes[i] = MODE_ALWAYS;
    }
  }
  const hasAnimation = csA.getPropertyValue("animation-name") !== "none";
  hostA.remove();
  hostB.remove();
  const baseline: TagBaseline = { modes, values, hasAnimation };
  catalog.baselines.set(key, baseline);
  return baseline;
}

/**
 * A directory's shell copied an element at a time: the band's own box where the frame meets it, else an empty box, with
 * its outline and its label where the frame meets them.
 */
function* shellCopySteps(
  band: HTMLElement,
  parts: { own: boolean; shape: HTMLElement | null; label: HTMLElement | null },
  seen: Box,
  catalog: CopyStyleCatalog
): Generator<void, HTMLElement> {
  let childParent: readonly string[] = catalog.hostAValues;
  let clone: HTMLElement;
  if (parts.own) {
    const copied = yield* visualCopyStepsWithStyle(band, catalog, catalog.hostAValues, false);
    clone = copied.copy;
    childParent = copied.ownValues;
  } else {
    clone = document.createElement("div");
  }
  if (parts.shape) clone.append(yield* visualCopySteps(parts.shape, catalog, childParent, true, seen));
  if (parts.label) clone.append(yield* visualCopySteps(parts.label, catalog, childParent, true, seen));
  return clone;
}

/**
 * Freeze an element's computed appearance without duplicating live selectors, IDs or controls, an element at a time,
 * pausing after each, so that a large copy can be spread over slices.
 */
function* visualCopySteps(
  root: HTMLElement,
  catalog: CopyStyleCatalog,
  parentValues: readonly string[],
  deep = true,
  seen?: Box,
  anchor?: TransitionPoint
): Generator<void, HTMLElement> {
  return (yield* visualCopyStepsWithStyle(root, catalog, parentValues, deep, seen, anchor)).copy;
}

/** Check whether a live element's `::before` or `::after` pseudo-element draws visible text or paint. */
function visiblePseudoStyle(root: Element, pseudo: "::before" | "::after"): { style: CSSStyleDeclaration; text: string } | null {
  if (root instanceof SVGElement) return null;
  const ps = getComputedStyle(root, pseudo);
  const text = parseCssContent(ps.content);
  if (text === null || ps.display === "none" || ps.visibility === "hidden" || Number(ps.opacity) === 0) return null;
  if (text === "") {
    const bg = ps.backgroundColor;
    const paints = (bg !== "" && bg !== "transparent" && !bg.endsWith(", 0)"))
      || ps.backgroundImage !== "none"
      || ps.boxShadow !== "none"
      || ps.borderTopStyle !== "none"
      || ps.borderRightStyle !== "none"
      || ps.borderBottomStyle !== "none"
      || ps.borderLeftStyle !== "none"
      || ps.outlineStyle !== "none";
    if (!paints) return null;
  }
  return { style: ps, text };
}

/** Materialize a visible CSS `::before` or `::after` pseudo-element as a sparse-styled `<span>` inside the frozen copy. */
function buildPseudoCopy(
  pseudo: { style: CSSStyleDeclaration; text: string },
  catalog: CopyStyleCatalog,
  parentValues: readonly string[]
): HTMLSpanElement {
  const span = catalog.doc.createElement("span");
  if (pseudo.text) span.textContent = pseudo.text;
  // Its text is the span's own: a `content` declaration on an element would replace it.
  const declarations = sparseDeclarations(pseudo.style, catalog, tagBaseline(catalog, span), parentValues).filter(declaration => !declaration.startsWith("content:"));
  if (declarations.length > 0) span.style.cssText = declarations.join("");
  return span;
}

/**
 * The declarations a copy needs to look as `style` does: each that differs from a bare tag's baseline (non-inherited),
 * the parent copy's value (inherited) or the colour (currentColor), each the copy also keeps as an attribute, a zero
 * width whose border or outline style still draws, and no live animation. `own`, where given, takes every value read,
 * for the copy's children to compare against.
 */
function sparseDeclarations(style: CSSStyleDeclaration, catalog: CopyStyleCatalog, baseline: TagBaseline, parentValues: readonly string[],
  own: string[] | null = null, presentAttrs: ReadonlySet<string> | null = null): string[] {
  const { propNames, colorIndex, interactivityIndex, widthGuardIndices } = catalog;
  const { modes, values: refValues } = baseline;
  const elColor = colorIndex >= 0 ? style.getPropertyValue("color") : "";
  const declarations: string[] = [];
  for (let i = 0; i < propNames.length; i++) {
    const name = propNames[i];
    // A card is copied from the view shown or the view held, neither of them inert since 2026-11-22, but behind the modal
    // reader every view is; the copy is of the picture as it was pressed, live, and stands in a layer that is inert itself.
    const val = i === interactivityIndex ? "auto" : style.getPropertyValue(name);
    if (own) own[i] = val;
    const mode = modes[i];
    let emit = presentAttrs?.has(name) || (mode === MODE_CONSTANT ? val !== refValues[i] : mode === MODE_INHERIT ? val !== parentValues[i] : mode === MODE_CURRENT_COLOR ? val !== elColor : true);
    if (!emit) {
      const styleIdx = widthGuardIndices[i];
      emit = styleIdx >= 0 && val === "0px" && style.getPropertyValue(propNames[styleIdx]) !== "none";
    }
    if (emit) declarations.push(`${name}: ${val};`);
  }
  // Never replay live keyframe animations (such as local-look-* during .local-look-fading) on a frozen copy.
  if (baseline.hasAnimation || style.getPropertyValue("animation-name") !== "none") declarations.push("animation-name: none;");
  return declarations;
}

function* visualCopyStepsWithStyle(
  root: HTMLElement,
  catalog: CopyStyleCatalog,
  parentValues: readonly string[],
  deep = true,
  seen?: Box,
  anchor?: TransitionPoint
): Generator<void, { copy: HTMLElement; ownValues: readonly string[] }> {
  const copy = root.cloneNode(false) as HTMLElement;
  const style = getComputedStyle(root);
  // A box the transition cannot show keeps its own declarations, and so its size and its place in its parent's layout,
  // without its contents: a pinned file's card of a hundred rows is copied for the rows the frame meets (2026-11-07). A
  // card shrinks toward its title (the anchor) while it folds, so a part of it stays unseen only if the box spanning it
  // and the anchor misses the frame. An inline box is copied whole, since its size is its contents'.
  if (deep && seen && !style.display.startsWith("inline") && style.display !== "contents" && !meets(spanning(root.getBoundingClientRect(), anchor), seen)) deep = false;
  // Remove live hooks and cloned inline style before writing sparse declarations, avoiding stale custom properties
  // and lazy attribute serialization. Track surviving attributes (e.g. SVG fill/stroke) so CSS overrides always win.
  let presentAttrs: Set<string> | null = null;
  for (const name of copy.getAttributeNames()) {
    if (name === "id" || name === "class" || name === "style" || name === "tabindex" || name === "role" || name.startsWith("data-") || name.startsWith("on")) {
      copy.removeAttribute(name);
    } else {
      (presentAttrs ??= new Set()).add(name.toLowerCase());
    }
  }
  // display:none contributes neither layout nor pixels to this frozen picture. Do not expand an invisible subtree.
  // visibility:hidden and opacity:0 still occupy layout, so they retain the sparse copy below.
  if (style.display === "none") { copy.style.cssText = "display:none"; return { copy, ownValues: parentValues }; }
  // Capture visible CSS ::before / ::after boxes (held zoom-look card titles, test-backed halos, +N connections frames,
  // Internals dashed boxes) before stripping live classes and data-* attributes.
  const beforePseudo = deep ? visiblePseudoStyle(root, "::before") : null;
  const afterPseudo = deep ? visiblePseudoStyle(root, "::after") : null;
  // Emit only declarations that differ from a bare tag-matched baseline (non-inherited) or the parent copy's computed
  // style (inherited), skipping custom properties and active animations so copies stay pixel-identical while cutting
  // inline declarations ~15x (2026-11-24).
  const needOwn = (deep && (root.childNodes.length > 0 || beforePseudo !== null || afterPseudo !== null)) || !deep;
  const ownValues = needOwn ? new Array<string>(catalog.propNames.length) : parentValues;
  const declarations = sparseDeclarations(style, catalog, tagBaseline(catalog, root), parentValues, needOwn ? ownValues as string[] : null, presentAttrs);
  // Preserve any inline-style or presentation-attribute property outside the stylesheet catalog (e.g. ad-hoc inline SVG rules).
  const inlineStyle = root.style;
  if (inlineStyle && inlineStyle.length > 0) {
    for (let k = 0; k < inlineStyle.length; k++) {
      const name = inlineStyle.item(k);
      if (name.startsWith("--") || name === "animation" || name.startsWith("animation-") || catalog.indexOf.has(name)) continue;
      const val = style.getPropertyValue(name);
      if (val) declarations.push(`${name}: ${val};`);
    }
  }
  if (presentAttrs !== null) {
    for (const attr of presentAttrs) {
      if (catalog.indexOf.has(attr) || attr === "animation" || attr.startsWith("animation-")) continue;
      const val = style.getPropertyValue(attr);
      if (val) declarations.push(`${attr}: ${val};`);
    }
  }
  if (declarations.length > 0) copy.style.cssText = declarations.join("");
  if (root instanceof HTMLCanvasElement && copy instanceof HTMLCanvasElement) copy.getContext("2d")?.drawImage(root, 0, 0);
  yield;
  if (beforePseudo) copy.append(buildPseudoCopy(beforePseudo, catalog, ownValues));
  if (deep) for (const child of [...root.childNodes]) {
    copy.append(child instanceof Element ? yield* visualCopySteps(child as HTMLElement, catalog, ownValues, true, seen, anchor) : child.cloneNode(true));
  }
  if (afterPseudo) copy.append(buildPseudoCopy(afterPseudo, catalog, ownValues));
  return { copy, ownValues };
}
