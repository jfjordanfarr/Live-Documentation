import { requireElement } from "../dom";
import { SPATIAL_NODE_STYLES, spatialNodeStyle } from "../views/forceGraphAppearance";
import type { SpatialGraphData } from "../views/forceGraphData";

const previous = new WeakMap<HTMLElement, string>();

/** Describe the spatial map's filtered, current-moment encodings without changing its geometry or attention. */
export function renderSpatialLegend(graph: SpatialGraphData, symbolScale: number): void {
  const legend = requireElement("spatial-legend");
  const styles = new Set(graph.nodes.map(node => spatialNodeStyle(node.archetype)));
  const kinds = new Set(graph.links.map(link => link.kind));
  const rows: Array<{ label: string; color: string; shape: "node" | "size" | "width" | "wire" | "arrow" }> =
    Object.values(SPATIAL_NODE_STYLES).filter(style => styles.has(style)).map(style => ({ ...style, shape: "node" }));
  if (graph.nodes.length && symbolScale > 0) rows.push({ label: "Size: public symbols", color: "#aeb8c6", shape: "size" });
  if ([...kinds].some(kind => kind !== "containment" && kind !== "related-doc" && kind !== "cited-by")) {
    rows.push({ label: "Width: references", color: "#ffffff", shape: "width" });
  }
  if (kinds.has("containment")) rows.push({ label: "Contains", color: SPATIAL_NODE_STYLES.directory.color, shape: "wire" });
  if (kinds.has("related-doc")) rows.push({ label: "Cites document", color: SPATIAL_NODE_STYLES["related-doc"].color, shape: "arrow" });
  if (kinds.has("cited-by")) rows.push({ label: "Cited by document", color: "#d6b2f0", shape: "arrow" });
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
