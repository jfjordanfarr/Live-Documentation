/**
 * The folder map drawn: a panel over the dimmed board.
 *
 * @remarks
 * Everything here touches the DOM. The panel holds a bar of crumbs and a
 * scrolling map: cards for files, boxes for folders, wires between their
 * rows, and the wall pins at the map's edges. Text is the browser's own at one
 * size; a map larger than the panel scrolls. What to draw comes from
 * `model.ts` and where from `layout.ts`, both pure and tested.
 */

import { layoutInside, pinOf, type InsideLayout } from "./layout";
import { neighboursOf, type InsideModel } from "./model";

const SVG = "http://www.w3.org/2000/svg";

export interface InsidePanelCallbacks {
  onOpenFile: (file: string) => void;
  onOpenFolder: (folder: string) => void;
  /** A crumb was clicked: its index, 0 being the World Map. */
  onCrumb: (index: number) => void;
}

export class InsidePanel {
  readonly element: HTMLElement;
  private readonly bar: HTMLElement;
  private readonly scroll: HTMLElement;
  private readonly map: HTMLElement;
  private model: InsideModel | null = null;

  constructor(parent: HTMLElement, private readonly callbacks: InsidePanelCallbacks) {
    this.element = element("div", "world-inside", parent);
    this.bar = element("div", "inside-bar", this.element);
    this.scroll = element("div", "inside-scroll", this.element);
    this.map = element("div", "inside-map", this.scroll);
    this.element.addEventListener("click", (event) => {
      const target = event.target as Element;
      const crumb = target.closest<HTMLElement>("[data-crumb]");
      if (crumb) {
        event.preventDefault();
        this.callbacks.onCrumb(Number(crumb.dataset.crumb));
        return;
      }
      const open = target.closest<HTMLElement>("[data-open-file], [data-open-folder]");
      if (open?.dataset.openFile !== undefined) {
        event.preventDefault();
        this.callbacks.onOpenFile(open.dataset.openFile);
      } else if (open?.dataset.openFolder !== undefined) {
        event.preventDefault();
        this.callbacks.onOpenFolder(open.dataset.openFolder);
      }
    });
    this.map.addEventListener("pointerover", (event) => {
      const node = (event.target as Element).closest<HTMLElement>("[data-node]");
      this.hover(node?.dataset.node ?? null);
    });
    this.map.addEventListener("pointerleave", () => this.hover(null));
  }

  /** Draws a folder map, sized to the viewport, and returns its layout. */
  render(model: InsideModel, crumbs: string[], viewport: { width: number; height: number }): InsideLayout {
    this.model = model;
    const layout = layoutInside(model, viewport);
    const width = clamp(layout.width + 2, 620, viewport.width - 40);
    const height = clamp(layout.height + 46, 380, viewport.height - 76);
    Object.assign(this.element.style, { width: `${width}px`, height: `${height}px`, left: `${Math.round((viewport.width - width) / 2)}px`, top: `${Math.round(Math.max(56, (viewport.height - height) / 2))}px` });
    this.writeBar(model, crumbs, width);
    this.map.innerHTML = "";
    Object.assign(this.map.style, { width: `${layout.width}px`, height: `${layout.height}px` });
    this.scroll.scrollTop = 0;
    this.scroll.scrollLeft = 0;
    const svg = svgElement("svg", { class: "inside-wires", width: layout.width, height: layout.height }, this.map);
    const defs = svgElement("defs", {}, svg);
    let gradients = 0;
    const gradient = (a: [number, number], b: [number, number]): string => {
      const id = `inside-grad-${gradients++}`;
      const node = svgElement("linearGradient", { id, gradientUnits: "userSpaceOnUse", x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, defs);
      for (const [offset, colour] of [[0, "#38bdf8"], [0.1, "#38bdf8"], [0.9, "#34d399"], [1, "#34d399"]] as Array<[number, string]>) {
        svgElement("stop", { offset, "stop-color": colour }, node);
      }
      return `url(#${id})`;
    };
    const wire = (a: [number, number], b: [number, number], nodes: string, dashed: boolean, count: number, wall = false): void => {
      const dx = Math.max(40, Math.abs(b[0] - a[0]) * 0.5);
      svgElement("path", { class: `inside-wire${dashed ? " basis" : ""}${wall ? " wall" : ""}`, d: `M${a[0]},${a[1]} C${a[0] + dx},${a[1]} ${b[0] - dx},${b[1]} ${b[0]},${b[1]}`, stroke: gradient(a, b), "stroke-width": wall ? 1.5 : count > 2 ? 3 : 2, "data-nodes": nodes }, svg);
    };
    const stubs = (a: [number, number], b: [number, number], nodes: string, dashed: boolean): void => {
      svgElement("path", { class: `inside-stub${dashed ? " basis" : ""}`, d: `M${a[0]},${a[1]} c 8,0 12,-4 14,-9`, stroke: "#38bdf8", "data-nodes": nodes }, svg);
      svgElement("path", { class: `inside-stub${dashed ? " basis" : ""}`, d: `M${b[0]},${b[1]} c -8,0 -12,4 -14,9`, stroke: "#34d399", "data-nodes": nodes }, svg);
    };
    for (const edge of model.edges) {
      const provider = layout.nodes.get(edge.to);
      const consumer = layout.nodes.get(edge.from);
      if (!provider || !consumer) {
        continue;
      }
      const a = pinOf(layout, edge.to, edge.toSymbol ?? (provider.kind === "folder" ? edge.from : undefined), "out");
      const b = pinOf(layout, edge.from, edge.fromSymbol ?? (consumer.kind === "folder" ? edge.to : undefined), "in");
      const nodes = `${edge.from} ${edge.to}`;
      if (edge.from === edge.to || provider.x >= consumer.x) {
        stubs(a, b, nodes, edge.basis !== undefined);
      } else {
        wire(a, b, nodes, edge.basis !== undefined, edge.count);
      }
    }
    for (const wall of layout.walls) {
      const pin = element("div", `inside-wallpin ${wall.role}`, this.map);
      Object.assign(pin.style, { left: `${wall.x - 6}px`, top: `${wall.y - 6}px` });
      pin.dataset.nodes = wall.nodes.map((node) => node.id).join(" ");
      const text = element("div", "inside-walltext", this.map);
      text.innerHTML = `<b>${escapeHtml(wall.counterpart)}</b> · ${wall.count}`;
      Object.assign(text.style, wall.role === "out" ? { left: "12px", top: `${wall.y - 22}px` } : { right: "12px", top: `${wall.y - 22}px` });
      for (const touched of wall.nodes) {
        if (!layout.nodes.has(touched.id)) {
          continue;
        }
        if (wall.role === "out") {
          wire([wall.x, wall.y], pinOf(layout, touched.id, touched.symbol, "in"), touched.id, false, touched.count, true);
        } else {
          wire(pinOf(layout, touched.id, touched.symbol, "out"), [wall.x, wall.y], touched.id, false, touched.count, true);
        }
      }
    }
    for (const node of model.nodes) {
      const placed = layout.nodes.get(node.id);
      if (!placed) {
        continue;
      }
      const card = element("div", node.kind === "file" ? "inside-card" : "inside-card box", this.map);
      card.dataset.node = node.id;
      Object.assign(card.style, { left: `${placed.x}px`, top: `${placed.y}px`, width: `${placed.w}px` });
      const name = element("a", "name", card, node.name);
      name.href = "#";
      if (node.kind === "file") {
        name.dataset.openFile = node.id;
        name.title = "open in the Local Map";
        element("div", "path", card, node.sub);
        for (const row of node.rows) {
          const line = element("div", "row", card);
          element("span", "pin in", line);
          line.append(row.name);
          element("span", "kind", line, row.kind);
          element("span", "pin out", line);
        }
        const internals = element("div", "row internals", card, "Internals");
        element("span", "pin in", internals);
        element("span", "pin out", internals);
      } else {
        name.dataset.openFolder = node.id;
        name.title = "open this folder";
        element("div", "path", card, `${node.files.length} file${node.files.length === 1 ? "" : "s"}`);
        const counts = new Map<string, number>();
        for (const edge of model.edges) {
          if (edge.from === node.id && edge.to !== node.id) {
            counts.set(edge.to, (counts.get(edge.to) ?? 0) + edge.count);
          }
          if (edge.to === node.id && edge.from !== node.id) {
            counts.set(edge.from, (counts.get(edge.from) ?? 0) + edge.count);
          }
        }
        if (placed.rows.length === 0 || counts.size === 0) {
          element("div", "row internals", card, "no wires here");
        }
        for (const neighbour of placed.rows) {
          const line = element("div", "row", card);
          element("span", "pin in", line);
          line.append(neighbour.slice(neighbour.lastIndexOf("/") + 1));
          element("span", "kind", line, String(counts.get(neighbour) ?? 0));
          element("span", "pin out", line);
        }
      }
    }
    return layout;
  }

  /** Dims what is not wired to a node; nothing dims when there is no node. */
  hover(id: string | null): void {
    if (!this.model) {
      return;
    }
    const related = id ? neighboursOf(this.model, id) : null;
    for (const card of this.map.querySelectorAll<HTMLElement>("[data-node]")) {
      card.classList.toggle("dim", related !== null && !related.has(card.dataset.node ?? ""));
    }
    for (const path of this.map.querySelectorAll<SVGElement>(".inside-wire, .inside-stub")) {
      path.classList.toggle("dim", related !== null && !(path.dataset.nodes ?? "").split(" ").includes(id ?? ""));
    }
    for (const pin of this.map.querySelectorAll<HTMLElement>(".inside-wallpin")) {
      pin.classList.toggle("dim", related !== null && !(pin.dataset.nodes ?? "").split(" ").includes(id ?? ""));
    }
  }

  private writeBar(model: InsideModel, crumbs: string[], width: number): void {
    const trail = crumbs.map((crumb, i) => (i === crumbs.length - 1 ? `<b>${escapeHtml(crumb)}</b>` : `<a href="#" data-crumb="${i}">${escapeHtml(crumb)}</a>`)).join(" &rsaquo; ");
    const files = model.nodes.reduce((count, node) => count + (node.kind === "file" ? 1 : node.files.length), 0);
    const hint = width >= 860 ? `<span class="hint">Escape or wheel out goes back up</span>` : "";
    this.bar.innerHTML = `<span>${trail}</span><span>Local Map · ${files} file${files === 1 ? "" : "s"}</span>${hint}`;
  }
}

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

function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
}
