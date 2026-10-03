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

/** Capture the visible native cards before switching their container off. */
export function captureCards(root: HTMLElement): CardSnapshot[] {
  const viewport = root.getBoundingClientRect();
  return [...root.querySelectorAll<HTMLElement>(".node-card")].flatMap(card => {
    const title = card.querySelector<HTMLElement>(".node-title");
    if (!title) return [];
    const rect = card.getBoundingClientRect(), t = title.getBoundingClientRect();
    if (rect.right < viewport.left || rect.left > viewport.right || rect.bottom < viewport.top || rect.top > viewport.bottom) return [];
    const clone = visualCopy(card);
    const x = t.left + t.width / 2, y = t.top + t.height / 2;
    return [{ file: { id: card.dataset.id!, name: title.textContent ?? "", x, y, radius: 5, color: "#0091ff" },
      clone, width: card.offsetWidth, height: card.offsetHeight, scale: rect.width / card.offsetWidth,
      offsetX: x - rect.left, offsetY: y - rect.top }];
  });
}

/**
 * Fold cards to named file tokens, then rearrange those tokens to the native
 * projection. Reverse the same sequence on approach. Canonical edges and pins
 * are not changed by this temporary, non-interactive drawing.
 */
export function animatePerspective(
  cards: CardSnapshot[], graph: ForceScene, toGraph: boolean, focusId: string,
  viewport: DOMRect, onFinish: () => void
): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !cards.length) { onFinish(); return () => {}; }
  const layer = document.createElement("div");
  layer.className = "perspective-transition local-map-host";
  layer.dataset.graphFiles = String(graph.files.length);
  layer.setAttribute("aria-hidden", "true");
  layer.inert = true;
  Object.assign(layer.style, { left: `${viewport.left}px`, top: `${viewport.top}px`, width: `${viewport.width}px`, height: `${viewport.height}px` });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width * devicePixelRatio); canvas.height = Math.ceil(viewport.height * devicePixelRatio);
  Object.assign(canvas.style, { width: "100%", height: "100%", position: "absolute" });
  layer.append(canvas);
  const context = canvas.getContext("2d")!;
  context.scale(devicePixelRatio, devicePixelRatio);
  const projected = new Map(graph.files.map(file => [file.id, file]));
  const local = new Map(cards.map(card => [card.file.id, card]));
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
  const smooth = (value: number): number => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
  const frame = (now: number): void => {
    const elapsed = Math.min(1, (now - start) / 1050);
    const progress = toGraph ? elapsed : 1 - elapsed;
    const fold = smooth(progress / .32);
    const move = smooth((progress - .24) / .66);
    const background = smooth((progress - .38) / .62);
    layer.style.backgroundColor = `rgb(${Math.round(30 * (1 - background))}, ${Math.round(30 * (1 - background))}, ${Math.round(30 * (1 - background) + 12 * background)})`;
    const positions = new Map<string, SceneFile>();
    for (const file of graph.files) {
      const card = local.get(file.id);
      positions.set(file.id, card ? { ...file, x: card.file.x + (file.x - card.file.x) * move, y: card.file.y + (file.y - card.file.y) * move } : file);
    }
    context.clearRect(0, 0, viewport.width, viewport.height);
    for (const link of graph.links) {
      const a = positions.get(link.source), b = positions.get(link.target);
      if (!a || !b) continue;
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
      const shrink = 1 - fold * .92;
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
function visualCopy(root: HTMLElement): HTMLElement {
  const copy = root.cloneNode(true) as HTMLElement;
  const originals = [root, ...root.querySelectorAll<HTMLElement>("*")];
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
