import { requireElement } from "../dom";
import { activePalette } from "../palette";
import { spatialNodeStyle, spatialNodeStyles } from "../views/forceGraphAppearance";
import type { SpatialGraphData } from "../views/forceGraphData";

/** What the 3D picture draws beyond its data: the key says only what is on screen (2026-10-30). */
export interface SpatialLegendDrawn {
  /** Whether reference wires are drawn: always in the connections layout, on demand in the structure layout. */
  references: boolean;
  /** Whether a path's wires are drawn at full strength. */
  path: boolean;
  /** Whether the picture ends in a frontier: a last hop of connections drawn dimmed, a click on which shows more (2026-10-31). */
  frontier: boolean;
  /** Whether any sphere wears a ring: connections the picture does not show, a click on which shows them (2026-11-02). */
  rings: boolean;
  /** Whether any group is drawn wrapped, the Group Wrappers experiment: its files hidden in a shape a click opens (2026-11-05). */
  wrapped?: boolean;
  /** Whether any directory shell is drawn, the same experiment's second rule: a directory's hidden files as one body (2026-11-05). */
  shells?: boolean;
}

/** A sample of the key and the words beside it, two at most. */
export interface SpatialLegendMark {
  label: string;
  color: string;
}

/**
 * One row of the key (2026-11-16): the sample the stylesheet draws from its shape, the mark's words, and the sentence
 * that says what the mark means, which is drawn nowhere: a pointer reads it as the row's tooltip and assistive
 * technology as its description. A row samples one mark; the kinds' row alone has a mark for each kind drawn, each
 * with its one word.
 */
export interface SpatialLegendRow {
  shape: "node" | "size" | "width" | "wire" | "arrow" | "path" | "frontier" | "ring" | "wrapped" | "shell";
  marks: SpatialLegendMark[];
  description: string;
}

/** The kinds whose colours are drawn, in the table's order. */
const kindMarks = (drawn: ReadonlySet<SpatialLegendMark>): SpatialLegendMark[] => Object.values(spatialNodeStyles()).filter(style => drawn.has(style));

/** The rows of the key for a filtered graph at the moment shown, in reading order; pure, so that a test can read them. */
export function spatialLegendRows(graph: SpatialGraphData, symbolScale: number, drawn: SpatialLegendDrawn): SpatialLegendRow[] {
  const styles = new Set(graph.nodes.map(node => spatialNodeStyle(node.archetype)));
  const kinds = new Set(graph.links.map(link => link.kind));
  const { scene, kind } = activePalette(), grey = scene.keySample;
  const rows: SpatialLegendRow[] = styles.size ? [{ shape: "node", marks: kindMarks(styles), description: "Colour: the kind of file, directory or document a sphere stands for." }] : [];
  const row = (shape: SpatialLegendRow["shape"], label: string, color: string, description: string): void => { rows.push({ shape, marks: [{ label, color }], description }); };
  if (graph.nodes.length && symbolScale > 0) {
    row("size", "Symbols", grey, `Size: the number of public symbols a file offers.${styles.has(spatialNodeStyles().directory) ? " Folders are all one size." : ""}`);
  }
  const references = [...kinds].some(kind => kind !== "containment" && kind !== "related-doc" && kind !== "cited-by");
  if (references && drawn.references) row("width", "References", scene.wire, "Width: the number of references between two files.");
  if (drawn.path) row("path", "Path", scene.wire, "The path asked for, wide and bright. What is not on it is faded.");
  if (drawn.frontier) row("frontier", "Beyond", grey, "Dimmed: a hop beyond, or another group. Press one to see more.");
  if (drawn.rings) row("ring", "More connected", grey, "A ring: more is connected to this file than the picture shows. Press the file to see it.");
  if (drawn.wrapped) row("wrapped", "Wrapped group", grey, "A wrapped group: its files are not shown. Press it to open it.");
  if (drawn.shells) row("shell", "Directory shell", grey, "A shell: the files of a directory, drawn as one body. Press it to open it.");
  if (kinds.has("containment")) row("wire", "Contains", kind.directory, "A directory holds the file or the directory at the line's other end.");
  if (kinds.has("related-doc")) row("arrow", "Cites", kind.document, "From a file to a document that the file's own words cite.");
  if (kinds.has("cited-by")) row("arrow", "Cited by", scene.citedBy, "From a document to a file that the document's links name.");
  return rows;
}

/** A row's samples, each with its words beside it. */
function marksOf(shape: SpatialLegendRow["shape"], marks: readonly SpatialLegendMark[]): HTMLElement[] {
  return marks.map(({ label, color }) => {
    const mark = document.createElement("span");
    mark.className = "legend-mark";
    const sample = document.createElement("span");
    sample.className = `spatial-legend-sample spatial-legend-sample--${shape}`;
    sample.setAttribute("aria-hidden", "true");
    sample.style.setProperty("--legend-color", color);
    const word = document.createElement("span");
    word.className = "legend-word";
    word.textContent = label;
    mark.append(sample, word);
    return mark;
  });
}

const previous = new WeakMap<HTMLElement, string>();

/** Describe the spatial map's filtered, current-moment encodings without changing its geometry or attention. */
export function renderSpatialLegend(graph: SpatialGraphData, symbolScale: number, drawn: SpatialLegendDrawn): void {
  const legend = requireElement("spatial-legend");
  const rows = spatialLegendRows(graph, symbolScale, drawn);
  const signature = JSON.stringify(rows);
  if (previous.get(legend) === signature) return;
  previous.set(legend, signature);
  legend.replaceChildren(...rows.map(({ shape, marks, description }) => {
    const row = document.createElement("div");
    row.className = shape === "node" ? "legend-row legend-row--kinds" : "legend-row";
    row.setAttribute("role", "listitem");
    row.title = description;
    row.setAttribute("aria-description", description);
    row.append(...marksOf(shape, marks));
    return row;
  }));
}

/**
 * The 2D map's kinds (2026-11-16): the template's `local-legend-kinds` row, where the template has one, holds a mark
 * for each kind whose colour a closed directory's cells are drawn in, and stands empty, which the stylesheet hides,
 * while no coloured cell is drawn. The kinds are read from the cells themselves, whose fills the 2D map writes from the
 * table this key shares with it: a cell hidden at the look shown, or drawn in the one grey, counts for nothing.
 */
export function watchLocalKinds(): void {
  const row = document.getElementById("local-legend-kinds"), map = document.getElementById("map-container");
  if (!row || !map) return;
  const kindOf = new Map<string, SpatialLegendMark>(Object.values(spatialNodeStyles()).map(style => [style.color, style]));
  let pending = 0, shown = "";
  const draw = (): void => {
    pending = 0;
    const drawn = new Set<SpatialLegendMark>();
    for (const cell of map.querySelectorAll<SVGElement>(".local-cell")) {
      const kind = kindOf.get(cell.getAttribute("fill") ?? "");
      if (kind && !drawn.has(kind) && !cell.closest(".local-closed-cells--grey") && cell.checkVisibility({ visibilityProperty: true })) drawn.add(kind);
    }
    const marks = kindMarks(drawn), signature = marks.map(mark => mark.label).join();
    if (signature === shown) return;
    shown = signature;
    row.replaceChildren(...marksOf("node", marks));
  };
  // The cells are drawn and redrawn inside their boxes, and a look shows or hides them by the map's attributes.
  const concerns = (node: Node): boolean => node instanceof Element && (node.matches(".local-directory-closed, .local-directory-closed *") || !!node.querySelector(".local-directory-closed"));
  new MutationObserver(changes => {
    if (!pending && changes.some(change => change.type === "attributes" || concerns(change.target) || [...change.addedNodes, ...change.removedNodes].some(concerns))) pending = requestAnimationFrame(draw);
  }).observe(map, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-lod", "data-looks"] });
  draw();
}
