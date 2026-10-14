import { fileConnections, type FileConnection } from "./fileConnections";
import { parentDirectory } from "./localView/directory-bands";
import type { RelatedDocLink } from "../../shared/staticExplorerData";
import type { ExplorerGraphPayload, ExplorerLinkKind, ExplorerNodePayload } from "../../shared/types";
import type { SpatialLayout } from "../types";

/** A source file, a related document or, in the structure layout, a directory hub derived from their paths. */
export interface SpatialGraphNode extends ExplorerNodePayload {
  directoryPath?: string;
  /** Number of filtered source files below this directory, at every depth. */
  directoryFileCount?: number;
  /** The public-symbol counts of everything drawn below this directory, at every depth; the hub's volume is the sum of their volumes. */
  containedSymbolCounts?: readonly number[];
}

/** Containment is distinct from a documented reference and never contributes to coupling counts. */
export type SpatialLinkKind = ExplorerLinkKind | "containment";

/** Stable directory identity outside the source-file namespace. */
export const directoryNodeId = (directory: string): string => `directory:${directory}`;

/** A filtered, counted spatial graph, before the simulation adds positions. */
export interface SpatialGraphData {
  nodes: SpatialGraphNode[];
  links: FileConnection<SpatialLinkKind>[];
}

/**
 * Build the spatial graph the 3D page and the headless command share: the filtered files with their counted reference
 * pairs and, with the documentation overlay, the related documents. In the structure layout (2026-10-14) every file and
 * document also hangs from its directory's hub and every hub from its parent's, up to the scan root, by one containment
 * link each; the reference pairs stay in the data so that they can be drawn on demand, and which links pull is the
 * layout's to say. A hub that holds nothing but one child hub collapses into it, as the 2D bands collapse such chains;
 * the scan root stands whatever it holds.
 */
export function spatialGraphOf(graph: ExplorerGraphPayload, include: (node: ExplorerNodePayload) => boolean,
  relatedDocLinks: readonly RelatedDocLink[] = [], layout: SpatialLayout = "connections"): SpatialGraphData {
  const nodes: SpatialGraphNode[] = graph.nodes.filter(include).map(node => ({ ...node }));
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
  const pairs: FileConnection<SpatialLinkKind>[] = fileConnections(links);
  if (layout === "structure") {
    const hubs = new Map<string, SpatialGraphNode>();
    const children = new Map<string, Set<string>>();
    const members = new Map<string, string[]>();

    function hubOf(path: string): SpatialGraphNode {
      const existing = hubs.get(path);
      if (existing) return existing;
      const hub: SpatialGraphNode = {
        id: directoryNodeId(path),
        name: path.split("/").pop() || "Scan root",
        codePath: path,
        codeRelativePath: path,
        docPath: "",
        docRelativePath: "",
        archetype: "directory",
        directoryPath: path,
        directoryFileCount: 0,
        containedSymbolCounts: [],
        publicSymbols: [],
        dependencies: [],
        dependents: [],
        missingDependencies: []
      };
      hubs.set(path, hub);
      children.set(path, new Set());
      members.set(path, []);
      if (path !== "") children.get(hubOf(parentDirectory(path)).directoryPath!)!.add(path);
      return hub;
    }

    for (const node of nodes) {
      const parent = hubOf(parentDirectory(node.codeRelativePath));
      members.get(parent.directoryPath!)!.push(node.id);
      for (let path = parent.directoryPath!; ; path = parentDirectory(path)) {
        const hub = hubs.get(path)!;
        (hub.containedSymbolCounts as number[]).push(node.publicSymbols.length);
        if (node.archetype !== "related-doc") hub.directoryFileCount = (hub.directoryFileCount ?? 0) + 1;
        if (path === "") break;
      }
    }
    // A chain of hubs with nothing of their own stands as its deepest hub, named by the whole chain, deepest first so
    // that a longer chain collapses step by step.
    const deepestFirst = [...hubs.keys()].filter(path => path !== "").sort((a, b) => b.split("/").length - a.split("/").length);
    for (const path of deepestFirst) {
      const below = children.get(path)!;
      if (below.size !== 1 || members.get(path)!.length) continue;
      const [child] = below;
      const survivor = hubs.get(child)!;
      survivor.name = `${hubs.get(path)!.name}/${survivor.name}`;
      const siblings = children.get(parentDirectory(path))!;
      siblings.delete(path);
      siblings.add(child);
      hubs.delete(path);
      children.delete(path);
      members.delete(path);
    }
    for (const [path, hub] of hubs) {
      for (const child of children.get(path)!) pairs.push({ source: hub.id, target: hubs.get(child)!.id, kind: "containment", count: 1 });
      for (const member of members.get(path)!) pairs.push({ source: hub.id, target: member, kind: "containment", count: 1 });
    }
    nodes.push(...hubs.values());
  }
  return { nodes, links: pairs };
}
