/**
 * Force Graph View
 *
 * Renders the 3D force-directed graph view for the Live Docs Explorer using
 * ForceGraph3D. Supports Related Documentation overlay nodes when enabled.
 *
 * Extracted from index.ts during the Feb 2026 refactor to reduce the
 * monolith below the 1000-line threshold.
 */

import ForceGraph3D, { type ForceGraph3DInstance } from "3d-force-graph";
import { Vector3 } from "three";

import type { RelatedDocLink } from "../../shared/staticExplorerData";
import type {
  ExplorerGraphPayload,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../shared/types";
import { requireElement } from "../dom";
import type { ExplorerState } from "../types";
import { focusedCameraPosition, type CameraPoint } from "./forceGraphCamera";

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
  x?: number;
  y?: number;
  z?: number;
};

/** Complete data structure for the Force Graph view. */
export interface ForceGraphData {
  nodes: ForceGraphNode[];
  links: ForceGraphLink[];
}


// ─────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────

/** Options passed to the Force Graph view factory. */
export interface ForceGraphViewOptions {
  state: ExplorerState;
  graphData: ExplorerGraphPayload;
  nodesById: Map<string, ExplorerNodePayload>;
  resolveLinkEndpoint: (endpoint: ExplorerLinkPayload["source"]) => string;
  relatedDocLinks?: RelatedDocLink[];
  onShowBundledDoc: (docPath: string) => void;
  onFocusNode: (node: ExplorerNodePayload) => void;
}

/** Public API surface of the Force Graph view. */
export interface ForceGraphViewApi {
  render(): void;
  setActive(active: boolean): void;
}

/** Creates the Force Graph (3D) view for the Live Docs Explorer. */
export function createForceGraphView(options: ForceGraphViewOptions): ForceGraphViewApi {
  const {
    state,
    graphData,
    nodesById,
    resolveLinkEndpoint,
    relatedDocLinks,
    onShowBundledDoc,
    onFocusNode
  } = options;

  let forceGraphInstance: ForceGraph3DInstance | null = null;
  const nodeCache = new Map<string, ForceGraphNode>();
  let membership = "";
  let focusedId: string | null = null;
  let active = false;
  let animation = 0;
  let focusMotion: { started: number; camera: CameraPoint; target: CameraPoint; offset: CameraPoint } | null = null;
  let following = false;
  let focusLabel: HTMLButtonElement | null = null;
  let pausedAt = 0;

  function setActive(value: boolean): void {
    if (value && !active && focusMotion && pausedAt) focusMotion.started += performance.now() - pausedAt;
    if (!value && active) pausedAt = performance.now();
    active = value;
    if (value) {
      forceGraphInstance?.resumeAnimation();
      if (!animation && forceGraphInstance) animation = requestAnimationFrame(updateFocus);
    } else {
      forceGraphInstance?.pauseAnimation();
      cancelAnimationFrame(animation);
      animation = 0;
    }
  }

  function updateFocus(now: number): void {
    animation = 0;
    if (!active || !forceGraphInstance) return;
    const node = focusedId ? nodeCache.get(focusedId) : undefined;
    if (node && Number.isFinite(node.x) && Number.isFinite(node.y) && Number.isFinite(node.z)) {
      const point = node as ForceGraphNode & CameraPoint;
      if (following) {
        const controls = forceGraphInstance.controls() as { target: CameraPoint };
        if (!focusMotion) {
          const camera = { ...forceGraphInstance.cameraPosition() };
          const target = { x: controls.target.x, y: controls.target.y, z: controls.target.z };
          focusMotion = { started: now, camera, target, offset: focusedCameraPosition(camera, target, { x: 0, y: 0, z: 0 }) };
        }
        const motion = focusMotion;
        const t = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : Math.min(1, (now - motion.started) / 650);
        const k = 1 - Math.pow(1 - t, 3);
        const mix = (from: CameraPoint, to: CameraPoint): CameraPoint => ({ x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k, z: from.z + (to.z - from.z) * k });
        forceGraphInstance.cameraPosition(mix(motion.camera, { x: point.x + motion.offset.x, y: point.y + motion.offset.y, z: point.z + motion.offset.z }), mix(motion.target, point));
      }
      const screen = forceGraphInstance.graph2ScreenCoords(point.x, point.y, point.z);
      const depth = new Vector3(point.x, point.y, point.z).project(forceGraphInstance.camera()).z;
      if (focusLabel) {
        focusLabel.hidden = depth < -1 || depth > 1 || screen.x < 0 || screen.y < 0 || screen.x > forceGraphInstance.width() || screen.y > forceGraphInstance.height();
        focusLabel.style.left = `${screen.x}px`;
        focusLabel.style.top = `${screen.y}px`;
      }
    } else if (focusLabel) {
      focusLabel.hidden = true;
    }
    animation = requestAnimationFrame(updateFocus);
  }

  function focusSelection(force = false): void {
    const node = state.focusedNode ?? state.selectedNode;
    if (!force && node?.id === focusedId) return;
    focusedId = node?.id ?? null;
    following = !!node;
    focusMotion = null;
    if (focusLabel) {
      focusLabel.textContent = node?.name ?? "";
      focusLabel.title = node ? `${node.codeRelativePath} — Show details` : "";
      focusLabel.dataset.nodeId = node?.id ?? "";
      focusLabel.hidden = !node;
    }
  }

  function render(): void {
    const container = requireElement<HTMLDivElement>("graph-svg");

    const includeNode = (node: ExplorerNodePayload): boolean => {
      if ((state.focusedNode ?? state.selectedNode)?.id === node.id) {
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
    const graphNodes: ForceGraphNode[] = filteredNodes.map(node => nodeCache.get(node.id) ?? { ...node });
    const graphLinks: ForceGraphLink[] = filteredLinks.map(link => ({
      source: resolveLinkEndpoint(link.source),
      target: resolveLinkEndpoint(link.target),
      kind: link.kind
    }));

    // Add Related Documentation nodes and links when enabled
    if (state.filters.showRelatedDocs) {
      if (relatedDocLinks && relatedDocLinks.length > 0) {
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

        for (const link of relatedDocLinks) {
          const normalizedTarget = link.targetPath.replace(/\\/g, "/");
          if (liveDocPaths.has(normalizedTarget)) {
            continue;
          }

          const sourceId = link.sourceId;

          if (!link.sourceId.startsWith("related:") && !allowedIds.has(sourceId)) {
            continue;
          }

          if (link.sourceId.startsWith("related:")) {
            const sourcePath = link.sourceId.slice("related:".length);
            if (!liveDocPaths.has(sourcePath)) {
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

    for (let index = 0; index < graphNodes.length; index++) {
      const node = graphNodes[index];
      graphNodes[index] = nodeCache.get(node.id) ?? node;
      nodeCache.set(node.id, graphNodes[index]);
    }
    const nextMembership = JSON.stringify([graphNodes.map(node => node.id), graphLinks]);

    if (forceGraphInstance) {
      if (nextMembership !== membership) forceGraphInstance.graphData(dataForGraph);
      membership = nextMembership;
      focusSelection();
      setActive(true);
      return;
    }

    // The library types its callbacks for any node and link; the ones it hands back are this view's own.
    forceGraphInstance = new ForceGraph3D(container)
      .width(container.clientWidth)
      .height(container.clientHeight)
      .graphData(dataForGraph)
      .nodeLabel("name")
      .nodeColor(node => {
        const archetype = ((node as ForceGraphNode).archetype || "").toLowerCase();
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
      .linkColor(link => {
        if ((link as ForceGraphLink).kind === "related-doc") {
          return "rgba(153, 102, 204, 0.4)";
        }
        return "rgba(255, 255, 255, 0.2)";
      })
      .linkWidth(link => {
        if ((link as ForceGraphLink).kind === "related-doc") {
          return 0.5;
        }
        return 1;
      })
      .onNodeClick(clicked => {
        const node = clicked as ForceGraphNode;
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
        focusSelection(true);
      });
    membership = nextMembership;
    focusLabel = document.createElement("button");
    focusLabel.className = "force-graph-focus";
    focusLabel.hidden = true;
    focusLabel.addEventListener("click", () => {
      const node = focusedId ? nodesById.get(focusedId) : undefined;
      if (node) {
        onFocusNode(node);
        focusSelection(true);
      }
    });
    container.append(focusLabel);
    const interrupt = (): void => { following = false; focusMotion = null; };
    container.addEventListener("pointerdown", interrupt);
    container.addEventListener("wheel", interrupt, { passive: true });
    new ResizeObserver(() => {
      if (container.clientWidth && container.clientHeight) forceGraphInstance?.width(container.clientWidth).height(container.clientHeight);
    }).observe(container);
    focusSelection();
    setActive(true);
  }

  return { render, setActive };
}
