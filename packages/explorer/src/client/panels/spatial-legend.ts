import { requireElement } from "../dom";
import { SPATIAL_NODE_STYLES, spatialNodeStyle } from "../views/forceGraphAppearance";
import { SPATIAL_FLOW_COLORS } from "../views/forceGraphBatches";
import type { SpatialGraphData } from "../views/forceGraphData";

/** What the 3D picture draws beyond its data: the key says only what is on screen (2026-10-30). */
export interface SpatialLegendDrawn {
  /** Whether reference wires are drawn: always in the connections layout, on demand in the structure layout. */
  references: boolean;
  /** Whether a path's wires are drawn at full strength. */
  path: boolean;
  /** Whether anything is faded for standing outside the pins, the path or the hover. */
  faded: boolean;
}

/** One row of the key: its words and the sample the stylesheet draws from its shape and colour. */
export interface SpatialLegendRow {
  label: string;
  color: string;
  shape: "node" | "size" | "width" | "wire" | "arrow" | "flow" | "path" | "faded";
}

/** The rows of the key for a filtered graph at the moment shown, in reading order; pure, so that a test can read them. */
export function spatialLegendRows(graph: SpatialGraphData, symbolScale: number, drawn: SpatialLegendDrawn): SpatialLegendRow[] {
  const styles = new Set(graph.nodes.map(node => spatialNodeStyle(node.archetype)));
  const kinds = new Set(graph.links.map(link => link.kind));
  const rows: SpatialLegendRow[] = Object.values(SPATIAL_NODE_STYLES).filter(style => styles.has(style)).map(style => ({ ...style, shape: "node" }));
  if (graph.nodes.length && symbolScale > 0) {
    // A directory hub's volume is the sum of its files' volumes.
    rows.push({ label: styles.has(SPATIAL_NODE_STYLES.directory) ? "Size: public symbols; a folder sums its files" : "Size: public symbols", color: "#aeb8c6", shape: "size" });
  }
  const references = [...kinds].some(kind => kind !== "containment" && kind !== "related-doc" && kind !== "cited-by");
  if (references && drawn.references) {
    rows.push({ label: "From what offers to what uses", color: SPATIAL_FLOW_COLORS.offers, shape: "flow" });
    rows.push({ label: "Width: references", color: "#ffffff", shape: "width" });
  }
  if (drawn.path) rows.push({ label: "Path", color: "#ffffff", shape: "path" });
  if (drawn.faded) rows.push({ label: "Faded: not pinned, on the path or hovered", color: "#aeb8c6", shape: "faded" });
  if (kinds.has("containment")) rows.push({ label: "Contains", color: SPATIAL_NODE_STYLES.directory.color, shape: "wire" });
  if (kinds.has("related-doc")) rows.push({ label: "Cites document", color: SPATIAL_NODE_STYLES["related-doc"].color, shape: "arrow" });
  if (kinds.has("cited-by")) rows.push({ label: "Cited by document", color: "#d6b2f0", shape: "arrow" });
  return rows;
}

const previous = new WeakMap<HTMLElement, string>();

/** Describe the spatial map's filtered, current-moment encodings without changing its geometry or attention. */
export function renderSpatialLegend(graph: SpatialGraphData, symbolScale: number, drawn: SpatialLegendDrawn): void {
  const legend = requireElement("spatial-legend");
  const rows = spatialLegendRows(graph, symbolScale, drawn);
  const signature = JSON.stringify(rows);
  if (previous.get(legend) === signature) return;
  previous.set(legend, signature);
  legend.replaceChildren(...rows.map(({ label, color, shape }) => {
    const row = document.createElement("div");
    row.className = "legend-row";
    row.setAttribute("role", "listitem");
    const sample = document.createElement("span");
    sample.className = `spatial-legend-sample spatial-legend-sample--${shape}`;
    sample.setAttribute("aria-hidden", "true");
    sample.style.setProperty("--legend-color", color);
    const text = document.createElement("span");
    text.textContent = label;
    row.append(sample, text);
    return row;
  }));
}
