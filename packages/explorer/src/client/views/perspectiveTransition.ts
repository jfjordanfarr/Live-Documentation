import { directoryNodeId } from "./forceGraphData";
import type { SceneBody } from "./perspectiveBodies";
import { directoryOpacity, gatherWire, outlineLength, pathOutline, perspectiveCorrespondences, perspectivePhases, polygonOutline, sampleOutline, type TransitionPoint } from "./perspectiveGeometry";

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
  file: SceneFile;
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

/** A capture of the 2D map: its scene, complete once `copied` resolves, the cards' copies made a slice at a time. */
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
 * and every shell is read at once, while the picture stands as it was pressed; the cards' copies, the costly part, are
 * made in slices of the page's main thread between which it answers input and draws, while the caller holds the
 * picture still ({@link holdPerspective}), and `copied` says when they are done (2026-11-07: made at once, they had held
 * the page for seconds).
 */
export function captureLocalScene(root: HTMLElement, frame: DOMRect): LocalCapture {
  const started = performance.now();
  const copies: { card: CardSnapshot; steps: Generator<void, HTMLElement> }[] = [];
  const moving = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // What the transition can show of a copy: its frame, grown so that a part standing a little past its box is kept.
  const seen = { left: frame.left - SEEN_MARGIN, top: frame.top - SEEN_MARGIN, right: frame.right + SEEN_MARGIN, bottom: frame.bottom + SEEN_MARGIN };
  const cards = [...root.querySelectorAll<HTMLElement>(".node-card, .local-directory-closed")].flatMap(card => {
    const directory = card.classList.contains("local-directory-closed");
    const title = card.querySelector<HTMLElement>(directory ? ".local-directory-closed__name" : ".node-title");
    if (!title) return [];
    const rect = card.getBoundingClientRect(), t = title.getBoundingClientRect();
    // A card is drawn only inside its own box while it folds (it shrinks toward its title and has gone before its token
    // moves), so a card outside the transition's frame is never seen and is not copied: its token travels all the same.
    const x = t.left + t.width / 2, y = t.top + t.height / 2;
    const snapshot: CardSnapshot = { file: { id: directory ? directoryNodeId(card.dataset.directory!) : card.dataset.id!,
      name: title.textContent ?? "", x, y, radius: 5, color: directory ? "#e9984d" : "#0091ff" },
      clone: null, width: card.offsetWidth, height: card.offsetHeight, scale: rect.width / card.offsetWidth,
      offsetX: x - rect.left, offsetY: y - rect.top };
    // Under reduced motion there is no transition to draw a copy in: none is made, and the switch does not wait for any.
    if (moving && meets(rect, frame)) copies.push({ card: snapshot, steps: visualCopySteps(card, true, seen, { x, y }) });
    return [snapshot];
  });
  const cardsDone = performance.now();
  performance.measure("live-docs:capture-cards", { start: started, end: cardsDone });
  const wires = [...root.querySelectorAll<SVGPathElement>(".connection-path")].flatMap(path => {
    const matrix = path.getScreenCTM();
    if (!matrix || !path.dataset.sourceId || !path.dataset.targetId) return [];
    // The outline is read from the wire's own data where the Local Map wrote it in the forms it uses, the browser's
    // sampling being some 15 ms a wire; any other form is sampled by the browser as before.
    const outline = path.tagName === "polygon" ? polygonOutline(path.getAttribute("points") ?? "") : pathOutline(path.getAttribute("d") ?? "");
    const length = outline ? outlineLength(outline) : path.getTotalLength();
    const steps = Math.max(24, Math.min(256, Math.ceil(length / 4)));
    const local = outline ? sampleOutline(outline, steps)
      : Array.from({ length: steps + 1 }, (_, i) => path.getPointAtLength(length * i / steps));
    const points = local.map(point => ({ x: matrix.a * point.x + matrix.c * point.y + matrix.e, y: matrix.b * point.x + matrix.d * point.y + matrix.f }));
    const style = getComputedStyle(path);
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
    const clone = meets(rect, seen) ? visualCopy(band, false) : document.createElement("div");
    // Only the shell travels here, its outline and its label; cards and nested bands each have one identity.
    const shape = band.querySelector<HTMLElement>(":scope > .local-membrane");
    if (shape && meets(shape.getBoundingClientRect(), seen)) clone.append(visualCopy(shape, true, seen));
    const label = band.querySelector<HTMLElement>(":scope > .local-directory-label");
    if (label && meets(label.getBoundingClientRect(), seen)) clone.append(visualCopy(label, true, seen));
    Object.assign(clone.style, { display: "block", width: `${band.offsetWidth}px`, height: `${band.offsetHeight}px`,
      boxSizing: "border-box", margin: "0", position: "absolute", transformOrigin: "0 0" });
    let depth = 0;
    for (let parent = band.parentElement; parent && parent !== root; parent = parent.parentElement) {
      if (parent.classList.contains("local-directory-band")) depth++;
    }
    return { directory: band.dataset.directory ?? "", depth, clone, x: rect.left, y: rect.top, scale: rect.width / band.offsetWidth };
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
        if (step.done) { copies[0].card.clone = step.value; copies.shift(); continue; }
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
    layer.style.backgroundColor = `rgb(${Math.round(30 * (1 - background))}, ${Math.round(30 * (1 - background))}, ${Math.round(30 * (1 - background) + 12 * background)})`;
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
        gradient.addColorStop(0, "#38bdf8"); gradient.addColorStop(1, "#34d399");
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
      context.strokeStyle = inside ? "#38bdf8" : "#9baec5";
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
        context.fillStyle = context.strokeStyle = lit ? "#ffffff" : cloud ? "#8bacc7" : "#83b9d4";
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
      label.style.opacity = String(counterpart ? fold * (card.file.id === focusId ? 1 : 1 - background) : 0);
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
 * drawn, as it stands, over the destination until released (`perspective-held` in local.css). An inactive view is laid
 * out and drawn, only transparent, so nothing need be copied; until 2026-11-07 the hold was a copy of the whole surface
 * with every computed property of every element, several seconds of the page's main thread on this repository's
 * pictures, and on the way to 2D a copy never seen, since the 2D map is ready at once and the cover went in the same
 * task. The surface is inert and hidden from assistive technology while inactive, as the copy was, and a transparent
 * cover over the views' room takes the pointer while it is held, so that a click meant for the held picture reaches
 * neither it nor the destination drawing beneath it.
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

/** Freeze computed appearance without duplicating live selectors, IDs or controls. */
function visualCopy(root: HTMLElement, deep = true, seen?: Box): HTMLElement {
  const steps = visualCopySteps(root, deep, seen);
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

/** {@link visualCopy} an element at a time, pausing after each, so that a large copy can be spread over slices. */
function* visualCopySteps(root: HTMLElement, deep = true, seen?: Box, anchor?: TransitionPoint): Generator<void, HTMLElement> {
  const copy = root.cloneNode(false) as HTMLElement;
  const style = getComputedStyle(root);
  // A box the transition cannot show keeps its own declarations, and so its size and its place in its parent's layout,
  // without its contents: a pinned file's card of a hundred rows is copied for the rows the frame meets (2026-11-07). A
  // card shrinks toward its title (the anchor) while it folds, so a part of it stays unseen only if the box spanning it
  // and the anchor misses the frame. An inline box is copied whole, since its size is its contents'.
  if (deep && seen && !style.display.startsWith("inline") && style.display !== "contents" && !meets(spanning(root.getBoundingClientRect(), anchor), seen)) deep = false;
  // Remove live hooks before writing the large style, avoiding its lazy attribute serialization here.
  for (const name of [...copy.getAttributeNames()]) {
    if (name === "id" || name === "class" || name === "tabindex" || name === "role" || name.startsWith("data-") || name.startsWith("on")) copy.removeAttribute(name);
  }
  // display:none contributes neither layout nor pixels to this frozen picture. Do not expand an invisible subtree.
  // visibility:hidden and opacity:0 still occupy layout, so they retain the full copy below.
  if (style.display === "none") { copy.style.cssText = "display:none"; return copy; }
  // Read the native length once and preserve every computed property in one parsed declaration block.
  const length = style.length;
  const declarations = new Array<string>(length);
  for (let property = 0; property < length; property++) {
    const name = style.item(property);
    // A card copied in slices is read after its view was made inactive, and so inert; the copy is of the picture as it
    // was pressed, live, and stands in a layer that is inert itself.
    declarations[property] = `${name}: ${name === "interactivity" ? "auto" : style.getPropertyValue(name)};`;
  }
  copy.style.cssText = declarations.join("");
  if (root instanceof HTMLCanvasElement && copy instanceof HTMLCanvasElement) copy.getContext("2d")?.drawImage(root, 0, 0);
  yield;
  if (deep) for (const child of [...root.childNodes]) {
    copy.append(child instanceof Element ? yield* visualCopySteps(child as HTMLElement, true, seen, anchor) : child.cloneNode(true));
  }
  return copy;
}
