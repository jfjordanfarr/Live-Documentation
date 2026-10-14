import { fileConnections, type FileConnection } from "./fileConnections";
import { parentDirectory } from "./localView/directory-bands";
import type { RelatedDocLink } from "../../shared/staticExplorerData";
import type { ExplorerGraphPayload, ExplorerLinkKind, ExplorerNodePayload } from "../../shared/types";

/** A source file, related document, or optional directory derived from source paths. */
export interface SpatialGraphNode extends ExplorerNodePayload {
  directoryPath?: string;
  /** Number of filtered source files below this directory, at every depth. */
  directoryFileCount?: number;
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

/** Build the same file pairs and optional documentation overlay for the 3D page and headless command. */
export function spatialGraphOf(graph: ExplorerGraphPayload, include: (node: ExplorerNodePayload) => boolean,
  relatedDocLinks: readonly RelatedDocLink[] = [], includeDirectories = false): SpatialGraphData {
  const nodes: SpatialGraphNode[] = graph.nodes.filter(include).map(node => ({ ...node }));
  const sourceFiles = [...nodes];
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
  if (includeDirectories) {
    const directories = new Map<string, SpatialGraphNode>();

    function ensureDirectory(path: string): SpatialGraphNode {
      const existing = directories.get(path);
      if (existing) return existing;
      const directory: SpatialGraphNode = {
        id: directoryNodeId(path),
        name: path.split("/").pop() || "Scan root",
        codePath: path,
        codeRelativePath: path,
        docPath: "",
        docRelativePath: "",
        archetype: "directory",
        directoryPath: path,
        directoryFileCount: 0,
        publicSymbols: [],
        dependencies: [],
        dependents: [],
        missingDependencies: []
      };
      directories.set(path, directory);
      if (path !== "") {
        const parent = ensureDirectory(parentDirectory(path));
        pairs.push({ source: parent.id, target: directory.id, kind: "containment", count: 1 });
      }
      return directory;
    }

    for (const file of sourceFiles) {
      const parent = ensureDirectory(parentDirectory(file.codeRelativePath));
      pairs.push({ source: parent.id, target: file.id, kind: "containment", count: 1 });
      for (let path = parent.directoryPath!; ; path = parentDirectory(path)) {
        const directory = directories.get(path)!;
        directory.directoryFileCount = (directory.directoryFileCount ?? 0) + 1;
        if (path === "") break;
      }
    }
    nodes.push(...directories.values());
  }
  return { nodes, links: pairs };
}
