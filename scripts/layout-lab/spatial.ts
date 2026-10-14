/** The 3D Local Map's documented file pairs and shared force simulation, available as a headless report. */
import { includeNode, scopePins } from "./evaluate";
import { retainedSubject, type ScopeRun } from "./scopes";
import type { ExplorerFilters, ForceGraphTuning } from "../../packages/explorer/src/client/types";
import { spatialGraphOf } from "../../packages/explorer/src/client/views/forceGraphData";
import { simulateSpatialLayout, spatialLinkDistance, spatialNodeRadius } from "../../packages/explorer/src/client/views/forceGraphLayout";
import { getVisibleConnections } from "../../packages/explorer/src/client/views/pin-state";
import type { RelatedDocLink } from "../../packages/explorer/src/shared/staticExplorerData";
import type { ExplorerGraphPayload } from "../../packages/explorer/src/shared/types";

/** Run the same full filtered graph the 3D view simulates; the retained neighborhood is attention, not hidden physics. */
export function spatialReport(graph: ExplorerGraphPayload, run: ScopeRun, tuning: ForceGraphTuning, ticks = 300,
  filters: Pick<ExplorerFilters, "showTests" | "showAssets"> & Partial<Pick<ExplorerFilters, "showRelatedDocs" | "showDirectories" | "showDirectoryLinks">> = { showTests: true, showAssets: true },
  relatedDocLinks: readonly RelatedDocLink[] = []) {
  if (!run.scope.length) throw new Error("A spatial scope must name a retained file.");
  for (const file of run.scope) if (!graph.nodes.some(node => node.id === file)) throw new Error(`The bundle has no retained file ${JSON.stringify(file)}.`);
  const pins = scopePins(run);
  const id = (endpoint: string | { id: string }): string => typeof endpoint === "string" ? endpoint : endpoint.id;
  const related = "showRelatedDocs" in filters && filters.showRelatedDocs;
  const directories = "showDirectories" in filters && filters.showDirectories;
  const data = spatialGraphOf(graph, includeNode(pins, retainedSubject(run), filters), related ? relatedDocLinks : [], !!directories);
  const metadata = new Map(data.nodes.map(node => [node.id, node]));
  const retained = new Set(run.scope);
  for (const { link } of getVisibleConnections(pins, graph.links)) { retained.add(id(link.source)); retained.add(id(link.target)); }
  const result = simulateSpatialLayout(data.nodes, data.links, tuning, ticks);
  const nodes = result.nodes.map(node => ({
    id: node.id,
    kind: metadata.get(node.id)?.directoryPath !== undefined ? "directory"
      : metadata.get(node.id)?.archetype === "related-doc" ? "documentation" : "file",
    directory: metadata.get(node.id)?.directoryPath,
    files: metadata.get(node.id)?.directoryFileCount,
    symbols: node.publicSymbols.length,
    radius: spatialNodeRadius(node, tuning),
    x: node.x!, y: node.y!, z: node.z!, retained: retained.has(node.id)
  }));
  const bounds = (dimension: "x" | "y" | "z") => nodes.length
    ? Math.max(...nodes.map(node => node[dimension] + node.radius)) - Math.min(...nodes.map(node => node[dimension] - node.radius)) : 0;
  const edges = result.links.map(link => {
    if (typeof link.source === "string" || typeof link.target === "string") throw new Error("Unresolved spatial report endpoint.");
    return { source: link.source.id, target: link.target.id, kind: link.kind,
      references: link.kind === "containment" ? null : link.count, preferredDistance: spatialLinkDistance(link, tuning),
      distance: Math.hypot(link.source.x! - link.target.x!, link.source.y! - link.target.y!, link.source.z! - link.target.z!) };
  });
  let overlaps = 0, worstOverlap = 0;
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j];
    const overlap = a.radius + b.radius - Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
    if (overlap > 0.01) { overlaps++; worstOverlap = Math.max(worstOverlap, overlap); }
  }
  return { bundle: run.bundle, scope: run.scopeName, subject: retainedSubject(run), tuning, ticks, filters,
    bounds: { width: bounds("x"), height: bounds("y"), depth: bounds("z") }, overlaps, worstOverlap, nodes, links: edges };
}

/** Human-readable companion to the complete node, reference-count and coordinate JSON. */
export function renderSpatialReport(report: ReturnType<typeof spatialReport>): string {
  const fixed = (number: number) => number.toFixed(2);
  return `# 3D Local Map: ${report.bundle}/${report.scope}\n\nHistorical layout-lab measurement, ${new Date().toISOString()}.\n\n`
    + `The full filtered graph supplies the forces; the retained neighborhood supplies attention. ${report.nodes.filter(node => node.kind === "file").length} files, ${report.nodes.filter(node => node.kind === "directory").length} directory hubs, ${report.links.filter(link => link.kind !== "containment").length} reference pairs, ${report.links.filter(link => link.kind === "containment").length} immediate membership links, ${report.ticks} deterministic ticks.\n\n`
    + `Bounds: ${fixed(report.bounds.width)} × ${fixed(report.bounds.height)} × ${fixed(report.bounds.depth)} layout units. Sphere overlaps: ${report.overlaps}; largest penetration ${fixed(report.worstOverlap)}.\n\n`
    + `Settings: \`${JSON.stringify(report.tuning)}\`. Filters: \`${JSON.stringify(report.filters)}\`.\n\n`
    + `File sphere volume grows with exposed symbols plus one baseline unit; coupling shortens the preferred surface gap logarithmically. Directory hubs use the baseline radius and one degree-normalized spring to each immediate member. Containment has no documented-reference count; line visibility does not change its force. The JSON companion carries every node, radius, coordinate and relationship.\n`;
}
