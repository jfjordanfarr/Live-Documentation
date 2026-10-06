import { directoryOpacity, gatherWire, perspectivePhases, type TransitionPoint } from "./perspectiveGeometry";

/** Screen-space correspondence between native cards and native force positions. */
export interface SceneFile {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  color: string;
}

/** A frozen projection of the native force scene, without introducing another layout. */
export interface ForceScene {
  files: SceneFile[];
  links: { source: string; target: string }[];
}

interface CardSnapshot {
  file: SceneFile;
  clone: HTMLElement;
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

/** Capture native cards, rendered symbol curves and directory shells before hiding their view. */
export function captureLocalScene(root: HTMLElement): LocalScene {
  const cards = [...root.querySelectorAll<HTMLElement>(".node-card")].flatMap(card => {
    const title = card.querySelector<HTMLElement>(".node-title");
    if (!title) return [];
    const rect = card.getBoundingClientRect(), t = title.getBoundingClientRect();
    const clone = visualCopy(card);
    const x = t.left + t.width / 2, y = t.top + t.height / 2;
    return [{ file: { id: card.dataset.id!, name: title.textContent ?? "", x, y, radius: 5, color: "#0091ff" },
      clone, width: card.offsetWidth, height: card.offsetHeight, scale: rect.width / card.offsetWidth,
      offsetX: x - rect.left, offsetY: y - rect.top }];
  });
  const wires = [...root.querySelectorAll<SVGPathElement>(".connection-path")].flatMap(path => {
    const matrix = path.getScreenCTM();
    if (!matrix || !path.dataset.sourceId || !path.dataset.targetId) return [];
    const length = path.getTotalLength();
    const steps = Math.max(24, Math.min(256, Math.ceil(length / 4)));
    const points = Array.from({ length: steps + 1 }, (_, i) => {
      const point = path.getPointAtLength(length * i / steps).matrixTransform(matrix);
      return { x: point.x, y: point.y };
    });
    const style = getComputedStyle(path);
    return [{ provider: path.dataset.targetId, consumer: path.dataset.sourceId, points,
      opacity: Number(style.opacity), width: parseFloat(style.strokeWidth) * Math.hypot(matrix.a, matrix.b) }];
  });
  const directories = [...root.querySelectorAll<HTMLElement>(".local-directory-band")].map(band => {
    const rect = band.getBoundingClientRect();
    const clone = visualCopy(band, false);
    // Only the shell travels here, its outline and its label; cards and nested bands each have one identity.
    const shape = band.querySelector<HTMLElement>(":scope > .local-membrane");
    if (shape) clone.append(visualCopy(shape));
    const label = band.querySelector<HTMLElement>(":scope > .local-directory-label");
    if (label) clone.append(visualCopy(label));
    Object.assign(clone.style, { display: "block", width: `${band.offsetWidth}px`, height: `${band.offsetHeight}px`,
      boxSizing: "border-box", margin: "0", position: "absolute", transformOrigin: "0 0" });
    let depth = 0;
    for (let parent = band.parentElement; parent && parent !== root; parent = parent.parentElement) {
      if (parent.classList.contains("local-directory-band")) depth++;
    }
    return { directory: band.dataset.directory ?? "", depth, clone, x: rect.left, y: rect.top, scale: rect.width / band.offsetWidth };
  });
  return { cards, wires, directories };
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
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !cards.length) { onFinish(); return () => {}; }
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
  const levels = 1 + Math.max(0, ...directories.map(directory => directory.depth));
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width * devicePixelRatio); canvas.height = Math.ceil(viewport.height * devicePixelRatio);
  Object.assign(canvas.style, { width: "100%", height: "100%", position: "absolute" });
  layer.append(canvas);
  const context = canvas.getContext("2d")!;
  context.scale(devicePixelRatio, devicePixelRatio);
  const projected = new Map(graph.files.map(file => [file.id, file]));
  const local = new Map(cards.map(card => [card.file.id, card]));
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
    const wrapper = document.createElement("div");
    wrapper.className = "perspective-card local-column center";
    Object.assign(wrapper.style, { position: "absolute", width: `${card.width}px`, height: `${card.height}px`, transformOrigin: "0 0" });
    Object.assign(card.clone.style, { width: `${card.width}px`, height: `${card.height}px`, boxSizing: "border-box", margin: "0", transition: "none" });
    wrapper.append(card.clone); layer.append(wrapper);
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
      const card = local.get(file.id);
      positions.set(file.id, card ? { ...file, x: card.file.x + (file.x - card.file.x) * move, y: card.file.y + (file.y - card.file.y) * move } : file);
    }
    context.clearRect(0, 0, viewport.width, viewport.height);
    layer.dataset.wireFold = String(fold);
    for (const group of pairs.values()) {
      if (fold === 1) continue;
      for (const wire of group) {
        const provider = positions.get(wire.provider) ?? local.get(wire.provider)?.file;
        const consumer = positions.get(wire.consumer) ?? local.get(wire.consumer)?.file;
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
      if (fold < 1 && pairs.has(pairKey(a.id, b.id))) continue;
      const inside = local.has(a.id) && local.has(b.id);
      context.globalAlpha = inside ? .32 : background * .16;
      context.strokeStyle = inside ? "#38bdf8" : "#9baec5";
      context.beginPath(); context.moveTo(a.x - viewport.left, a.y - viewport.top); context.lineTo(b.x - viewport.left, b.y - viewport.top); context.stroke();
    }
    for (const file of positions.values()) {
      context.globalAlpha = local.has(file.id) ? fold : background;
      context.fillStyle = file.color;
      context.beginPath(); context.arc(file.x - viewport.left, file.y - viewport.top, Math.max(.5, Math.min(80, file.radius)), 0, 2 * Math.PI); context.fill();
    }
    context.globalAlpha = 1;
    for (const { card, wrapper, label } of ghosts) {
      const destination = projected.get(card.file.id) ?? card.file;
      const x = card.file.x + (destination.x - card.file.x) * move - viewport.left;
      const y = card.file.y + (destination.y - card.file.y) * move - viewport.top;
      const shrink = 1 - fold;
      wrapper.style.left = `${x - card.offsetX * shrink}px`;
      wrapper.style.top = `${y - card.offsetY * shrink}px`;
      wrapper.style.transform = `scale(${card.scale * shrink})`;
      wrapper.style.opacity = String(1 - fold);
      label.style.left = `${x}px`; label.style.top = `${y + destination.radius + 10}px`;
      label.style.opacity = String(fold * (card.file.id === focusId ? 1 : 1 - background));
    }
    layer.dataset.progress = String(elapsed);
    if (elapsed < 1) frameId = requestAnimationFrame(frame);
    else { layer.remove(); onFinish(); }
  };
  frame(start);
  return () => { cancelAnimationFrame(frameId); layer.remove(); };
}

/** Hold the source picture while the destination renderer produces its first frame. */
export function holdPerspective(root: HTMLElement): () => void {
  const rect = root.getBoundingClientRect();
  const cover = document.createElement("div");
  cover.className = "perspective-transition";
  cover.setAttribute("aria-hidden", "true"); cover.inert = true;
  Object.assign(cover.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
  const copy = visualCopy(root);
  Object.assign(copy.style, { position: "absolute", left: "0", top: "0", margin: "0" });
  cover.append(copy); document.body.append(cover);
  return () => cover.remove();
}

/** Freeze computed appearance without duplicating live selectors, IDs or controls. */
function visualCopy(root: HTMLElement, deep = true): HTMLElement {
  const copy = root.cloneNode(deep) as HTMLElement;
  const originals = deep ? [root, ...root.querySelectorAll<HTMLElement>("*")] : [root];
  const clones = [copy, ...copy.querySelectorAll<HTMLElement>("*")];
  originals.forEach((element, index) => {
    const clone = clones[index];
    const style = getComputedStyle(element);
    for (const name of style) clone.style.setProperty(name, style.getPropertyValue(name));
    for (const name of [...clone.getAttributeNames()]) {
      if (name === "id" || name === "class" || name === "tabindex" || name === "role" || name.startsWith("data-") || name.startsWith("on")) clone.removeAttribute(name);
    }
    if (element instanceof HTMLCanvasElement && clone instanceof HTMLCanvasElement) clone.getContext("2d")?.drawImage(element, 0, 0);
  });
  return copy;
}
