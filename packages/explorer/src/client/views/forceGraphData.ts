import { fileConnections, type FileConnection } from "./fileConnections";
import type { RelatedDocLink } from "../../shared/staticExplorerData";
import type { ExplorerGraphPayload, ExplorerLinkKind, ExplorerNodePayload } from "../../shared/types";

/** A filtered, counted spatial graph, before the simulation adds positions. */
export interface SpatialGraphData {
  nodes: ExplorerNodePayload[];
  links: FileConnection<ExplorerLinkKind>[];
}

/** Build the same file pairs and optional documentation overlay for the 3D page and headless command. */
export function spatialGraphOf(graph: ExplorerGraphPayload, include: (node: ExplorerNodePayload) => boolean,
  relatedDocLinks: readonly RelatedDocLink[] = []): SpatialGraphData {
  const nodes = graph.nodes.filter(include).map(node => ({ ...node }));
  const allowed = new Set(nodes.map(node => node.id));
  const id = (endpoint: string | { id: string }): string => typeof endpoint === "string" ? endpoint : endpoint.id;
  const links = graph.links.filter(link => allowed.has(id(link.source)) && allowed.has(id(link.target)))
    .map(link => ({ ...link, source: id(link.source), target: id(link.target) }));
  const liveDocs = new Set(graph.nodes.map(node => node.docPath.replace(/\\/g, "/")));
  const sources = new Set<string>(), targets = new Set<string>();
  const related: Array<{ source: string; target: string; kind: ExplorerLinkKind; referenceCount: number }> = [];
  for (const link of relatedDocLinks) {
    if (liveDocs.has(link.targetPath.replace(/\\/g, "/"))) continue;
    if (!link.sourceId.startsWith("related:") && !allowed.has(link.sourceId)) continue;
    if (link.sourceId.startsWith("related:")) {
      const source = link.sourceId.slice("related:".length);
      if (liveDocs.has(source.replace(/\\/g, "/"))) continue;
      sources.add(source);
    }
    targets.add(link.targetPath);
    related.push({ source: link.sourceId, target: `related:${link.targetPath}`, kind: "related-doc", referenceCount: 1 });
  }
  for (const docPath of [...sources, ...targets]) {
    const nodeId = `related:${docPath}`;
    if (allowed.has(nodeId)) continue;
    nodes.push({ id: nodeId, name: docPath.split("/").pop() ?? docPath, codePath: docPath, codeRelativePath: docPath,
      docPath, docRelativePath: docPath, archetype: "related-doc", publicSymbols: [], dependencies: [], dependents: [], missingDependencies: [] });
    allowed.add(nodeId);
  }
  links.push(...related.filter(link => allowed.has(link.source) && allowed.has(link.target)));
  return { nodes, links: fileConnections(links) };
}
