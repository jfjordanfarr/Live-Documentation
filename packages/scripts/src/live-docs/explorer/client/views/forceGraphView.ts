/**
 * Force Graph View
 *
 * Renders the 3D force-directed graph view for the Live Docs Explorer using
 * ForceGraph3D. Supports Related Documentation overlay nodes when enabled.
 *
 * Extracted from index.ts during the Feb 2026 refactor to reduce the
 * monolith below the 1000-line threshold.
 */

import type { RelatedDocLink } from "../../shared/staticExplorerData";
import type {
  ExplorerGraphPayload,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../shared/types";
import type { ServerBundledDocsState } from "../dataLoader";
import { requireElement } from "../dom";
import type { ExplorerState } from "../types";

// ─────────────────────────────────────────────────────────────────────────
// Force Graph Types
// ─────────────────────────────────────────────────────────────────────────

/** A link in the Force Graph between two nodes. */
export interface ForceGraphLink {
  source: string;
  target: string;
  kind: ExplorerLinkPayload["kind"] | "related-doc";
}

/** A node in the Force Graph, extending the payload with optional archetype. */
export type ForceGraphNode = ExplorerNodePayload & {
  /** Archetype for Related Documentation nodes */
  archetype?: string;
};

/** Complete data structure for the Force Graph view. */
export interface ForceGraphData {
  nodes: ForceGraphNode[];
  links: ForceGraphLink[];
}

interface ForceGraphInstance {
  (container: HTMLElement): ForceGraphInstance;
  graphData(data: ForceGraphData): ForceGraphInstance;
  nodeLabel(labelAccessor: string | ((node: ForceGraphNode) => string)): ForceGraphInstance;
  nodeColor(colorAccessor: (node: ForceGraphNode) => string): ForceGraphInstance;
  linkColor(colorAccessor: (link: ForceGraphLink) => string): ForceGraphInstance;
  linkWidth(widthAccessor: (link: ForceGraphLink) => number): ForceGraphInstance;
  onNodeClick(handler: (node: ForceGraphNode) => void): ForceGraphInstance;
}

type ForceGraphFactory = () => ForceGraphInstance;

declare const ForceGraph3D: ForceGraphFactory | undefined;

// ─────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────

/** Options passed to the Force Graph view factory. */
export interface ForceGraphViewOptions {
  state: ExplorerState;
  graphData: ExplorerGraphPayload;
  nodesById: Map<string, ExplorerNodePayload>;
  resolveLinkEndpoint: (endpoint: ExplorerLinkPayload["source"]) => string;
  isStaticMode: boolean;
  relatedDocLinks?: RelatedDocLink[];
  serverBundledDocs: ServerBundledDocsState;
  onShowBundledDoc: (docPath: string) => void;
  onFocusNode: (node: ExplorerNodePayload) => void;
}

/** Public API surface of the Force Graph view. */
export interface ForceGraphViewApi {
  render(): void;
}

/** Creates the Force Graph (3D) view for the Live Docs Explorer. */
export function createForceGraphView(options: ForceGraphViewOptions): ForceGraphViewApi {
  const {
    state,
    graphData,
    nodesById,
    resolveLinkEndpoint,
    isStaticMode,
    relatedDocLinks,
    serverBundledDocs,
    onShowBundledDoc,
    onFocusNode
  } = options;

  let forceGraphInstance: ForceGraphInstance | null = null;

  function render(): void {
    const container = requireElement<HTMLDivElement>("graph-svg");

    const includeNode = (node: ExplorerNodePayload): boolean => {
      if (state.selectedNode && state.selectedNode.id === node.id) {
        return true;
      }
      const archetype = (node.archetype || "").toLowerCase();
      if (archetype === "test" && !state.filters.showTests) {
        return false;
      }
      if (archetype === "asset" && !state.filters.showAssets) {
        return false;
      }
      return true;
    };

    const filteredNodes = graphData.nodes.filter(includeNode);
    const allowedIds = new Set(filteredNodes.map(node => node.id));
    const filteredLinks = graphData.links.filter(link => {
      const sourceId = resolveLinkEndpoint(link.source);
      const targetId = resolveLinkEndpoint(link.target);
      return sourceId !== "" && targetId !== "" && allowedIds.has(sourceId) && allowedIds.has(targetId);
    });

    // Build base graph data
    const graphNodes: ForceGraphNode[] = filteredNodes.map(node => ({ ...node }));
    const graphLinks: ForceGraphLink[] = filteredLinks.map(link => ({
      source: resolveLinkEndpoint(link.source),
      target: resolveLinkEndpoint(link.target),
      kind: link.kind
    }));

    // Add Related Documentation nodes and links when enabled
    if (state.filters.showRelatedDocs) {
      const links = isStaticMode ? relatedDocLinks : serverBundledDocs.relatedDocLinks;
      if (links && links.length > 0) {
        const existingNodeIds = new Set(graphNodes.map(n => n.id));

        const liveDocPaths = new Set<string>();
        for (const node of graphData.nodes) {
          if (node.docPath) {
            liveDocPaths.add(node.docPath.replace(/\\/g, "/"));
          }
        }

        const bundledDocPaths = new Set<string>();
        const relatedSourcePaths = new Set<string>();
        const relatedLinks: Array<{ source: string; target: string }> = [];

        for (const link of links) {
          const normalizedTarget = link.targetPath.replace(/\\/g, "/");
          if (normalizedTarget.endsWith(".mdmd.md") || liveDocPaths.has(normalizedTarget)) {
            continue;
          }

          const sourceId = link.sourceId;

          if (!link.sourceId.startsWith("related:") && !allowedIds.has(sourceId)) {
            continue;
          }

          if (link.sourceId.startsWith("related:")) {
            const sourcePath = link.sourceId.slice("related:".length);
            if (!sourcePath.endsWith(".mdmd.md") && !liveDocPaths.has(sourcePath)) {
              relatedSourcePaths.add(sourcePath);
            } else {
              continue;
            }
          }

          const targetId = `related:${link.targetPath}`;
          bundledDocPaths.add(link.targetPath);
          relatedLinks.push({ source: sourceId, target: targetId });
        }

        for (const docPath of relatedSourcePaths) {
          const nodeId = `related:${docPath}`;
          if (!existingNodeIds.has(nodeId)) {
            const fileName = docPath.split("/").pop() ?? docPath;
            graphNodes.push({
              id: nodeId,
              name: fileName,
              archetype: "related-doc",
              docPath: docPath,
              publicSymbols: [],
              dependencies: [],
              dependents: []
            } as unknown as ForceGraphNode);
            existingNodeIds.add(nodeId);
          }
        }

        for (const docPath of bundledDocPaths) {
          const nodeId = `related:${docPath}`;
          if (!existingNodeIds.has(nodeId)) {
            const fileName = docPath.split("/").pop() ?? docPath;
            graphNodes.push({
              id: nodeId,
              name: fileName,
              archetype: "related-doc",
              docPath: docPath,
              publicSymbols: [],
              dependencies: [],
              dependents: []
            } as unknown as ForceGraphNode);
            existingNodeIds.add(nodeId);
          }
        }

        const finalNodeIds = new Set(graphNodes.map(n => n.id));
        for (const link of relatedLinks) {
          if (finalNodeIds.has(link.source) && finalNodeIds.has(link.target)) {
            graphLinks.push({
              source: link.source,
              target: link.target,
              kind: "related-doc"
            });
          }
        }
      }
    }

    const dataForGraph: ForceGraphData = {
      nodes: graphNodes,
      links: graphLinks
    };

    if (forceGraphInstance) {
      forceGraphInstance.graphData(dataForGraph);
      return;
    }

    if (typeof ForceGraph3D !== "function") {
      container.innerHTML = '<div style="padding:20px;color:#f88;">ForceGraph3D failed to load.</div>';
      return;
    }

    const instance = ForceGraph3D();
    forceGraphInstance = instance(container)
      .graphData(dataForGraph)
      .nodeLabel("name")
      .nodeColor(node => {
        const archetype = (node.archetype || "").toLowerCase();
        switch (archetype) {
          case "implementation":
            return "#0091ff";
          case "test":
            return "#28a745";
          case "interface":
            return "#ffc107";
          case "config":
            return "#6c757d";
          case "script":
            return "#17a2b8";
          case "related-doc":
            return "#9966cc";
          default:
            return "#888";
        }
      })
      .linkColor((link: ForceGraphLink) => {
        if (link.kind === "related-doc") {
          return "rgba(153, 102, 204, 0.4)";
        }
        return "rgba(255, 255, 255, 0.2)";
      })
      .linkWidth((link: ForceGraphLink) => {
        if (link.kind === "related-doc") {
          return 0.5;
        }
        return 1;
      })
      .onNodeClick(node => {
        if (node.id.startsWith("related:")) {
          const docPath = node.id.slice("related:".length);
          onShowBundledDoc(docPath);
          return;
        }

        const original = nodesById.get(node.id);
        if (!original) {
          return;
        }
        onFocusNode(original);
      });
  }

  return { render };
}
