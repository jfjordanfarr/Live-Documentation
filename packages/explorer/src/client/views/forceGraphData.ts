import { fileConnections, type FileConnection } from "./fileConnections";
import { symbolCountOf } from "./forceGraphLayout";
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

/**
 * Containment is distinct from a documented reference and never contributes to coupling counts; a document's citation
 * of a file (`cited-by`) is told from a file's citation of a document (`related-doc`).
 */
export type SpatialLinkKind = ExplorerLinkKind | "containment" | "cited-by";

/** Stable directory identity outside the source-file namespace. */
export const directoryNodeId = (directory: string): string => `directory:${directory}`;

/** A filtered, counted spatial graph, before the simulation adds positions. */
export interface SpatialGraphData {
  nodes: SpatialGraphNode[];
  links: FileConnection<SpatialLinkKind>[];
}

/**
 * Build the spatial graph the 3D page and the headless command share: the filtered files with their counted reference
 * pairs and, with the documentation overlay, the related documents. A document a file cites is drawn from the file to
 * the document (`related-doc`); a document that cites the file is drawn from the document to the file (`cited-by`,
 * 2026-10-22), so that the line's direction is the citation's, and the two are counted apart even between one pair. In
 * the structure layout (2026-10-14) every file and document also hangs from its directory's hub and every hub from its
 * parent's, up to the scan root, by one containment link each; the reference pairs stay in the data so that they can be
 * drawn on demand, and which links pull is the layout's to say. A hub that holds nothing but one child hub collapses
 * into it, as the 2D bands collapse such chains; the scan root stands whatever it holds.
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
  const related = new Map<string, FileConnection<SpatialLinkKind>>();
  for (const link of relatedDocLinks) {
    if (liveDocs.has(link.targetPath.replace(/\\/g, "/"))) continue;
    if (!link.sourceId.startsWith("related:") && !allowed.has(link.sourceId)) continue;
    if (link.sourceId.startsWith("related:")) {
      const source = link.sourceId.slice("related:".length);
      if (liveDocs.has(source.replace(/\\/g, "/"))) continue;
      sources.add(source);
    }
    targets.add(link.targetPath);
    const document = `related:${link.targetPath}`;
    const pair = link.direction === "cited-by"
      ? { source: document, target: link.sourceId, kind: "cited-by" as const }
      : { source: link.sourceId, target: document, kind: "related-doc" as const };
    const key = `${pair.kind}|${pair.source}|${pair.target}`;
    const counted = related.get(key);
    if (counted) { counted.count += 1; counted.forward += 1; }
    else related.set(key, { ...pair, count: 1, forward: 1, backward: 0 });
  }
  for (const docPath of [...sources, ...targets]) {
    const nodeId = `related:${docPath}`;
    if (allowed.has(nodeId)) continue;
    nodes.push({ id: nodeId, name: docPath.split("/").pop() ?? docPath, codePath: docPath, codeRelativePath: docPath,
      docPath, docRelativePath: docPath, archetype: "related-doc", publicSymbols: [], dependencies: [], dependents: [], missingDependencies: [] });
    allowed.add(nodeId);
  }
  const pairs: FileConnection<SpatialLinkKind>[] = fileConnections(links);
  pairs.push(...[...related.values()].filter(link => allowed.has(link.source) && allowed.has(link.target)));
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
        (hub.containedSymbolCounts as number[]).push(symbolCountOf(node));
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
      for (const child of children.get(path)!) pairs.push({ source: hub.id, target: hubs.get(child)!.id, kind: "containment", count: 1, forward: 1, backward: 0 });
      for (const member of members.get(path)!) pairs.push({ source: hub.id, target: member, kind: "containment", count: 1, forward: 1, backward: 0 });
    }
    nodes.push(...hubs.values());
  }
  return { nodes, links: pairs };
}

/** What a sphere's label reads of its node: a hub's directory, a file's name and path. */
export type LabelledNode = Pick<SpatialGraphNode, "id" | "name" | "codeRelativePath" | "directoryPath">;

/**
 * The name each sphere's label shows, by node id: a directory hub its path, the scan root "Scan root"; a file its name,
 * or, when another node in the picture has that name, the shortest ending of its path that no other node's path ends
 * with, up to its whole path. The names and every path ending are counted once, so that naming the T3 bundle's 21,720
 * files costs a tenth of a second where asking every file about every other cost seventeen (measured 2026-10-27).
 */
export function labelNamesOf(nodes: readonly LabelledNode[]): Map<string, string> {
  const names = new Map<string, number>(), endings = new Map<string, number>();
  const count = (map: Map<string, number>, key: string): void => { map.set(key, (map.get(key) ?? 0) + 1); };
  for (const node of nodes) {
    count(names, node.name);
    const parts = node.codeRelativePath.split("/");
    for (let length = 1; length <= parts.length; length++) count(endings, parts.slice(-length).join("/"));
  }
  return new Map(nodes.map(node => {
    if (node.directoryPath !== undefined) return [node.id, node.directoryPath || "Scan root"];
    let name = node.name;
    if ((names.get(name) ?? 0) > 1) {
      const parts = node.codeRelativePath.split("/");
      for (let length = 2; length <= parts.length; length++) {
        name = parts.slice(-length).join("/");
        if ((endings.get(name) ?? 0) <= 1) break;
      }
    }
    return [node.id, name];
  }));
}
