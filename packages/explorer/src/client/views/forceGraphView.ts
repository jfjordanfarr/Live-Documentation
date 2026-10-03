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
import { Box3, Raycaster, Vector2, Vector3, type Object3D } from "three";

import type { RelatedDocLink } from "../../shared/staticExplorerData";
import type {
  ExplorerGraphPayload,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../shared/types";
import { requireElement } from "../dom";
import type { ExplorerState } from "../types";
import { fileConnections } from "./fileConnections";
import { focusedCameraPosition, screenAnchorTranslation, type CameraPoint } from "./forceGraphCamera";
import type { ForceScene } from "./perspectiveTransition";
import { getVisibleConnections, EMPTY_PIN_SET } from "./pin-state";
import { ZoomBarrier, wheelPixels } from "./zoomBarrier";

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
  onZoomIn?: () => void;
  onZoomBoundary?: (active: boolean) => void;
  getPath?: () => readonly string[] | undefined;
}

/** Public API surface of the Force Graph view. */
export interface ForceGraphViewApi {
  render(): void;
  captureScene(): ForceScene;
  whenReady(): Promise<void>;
  setActive(active: boolean): void;
  getSubjectAnchor(nodeId: string): { x: number; y: number } | null;
  placeSubjectAnchor(nodeId: string, anchor: { x: number; y: number }): void;
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
  const nodeObjects = new Map<string, Object3D>();
  const raycaster = new Raycaster();
  let membership = "";
  let focusedId: string | null = null;
  let active = false;
  let animation = 0;
  let focusMotion: { started: number; camera: CameraPoint; target: CameraPoint; offset: CameraPoint } | null = null;
  let following = false;
  let zoomMotion: { started: number; from: CameraPoint; fromTarget: CameraPoint; to: CameraPoint; toTarget: CameraPoint } | null = null;
  let focusLabel: HTMLButtonElement | null = null;
  let pausedAt = 0;
  let subjectAnchor: { x: number; y: number } | null = null;
  let simulationRunning = true;
  let ready = false;
  const barrier = new ZoomBarrier();
  const readyWaiters: Array<() => void> = [];

  function getSubjectAnchor(nodeId: string): { x: number; y: number } | null {
    const node = nodeCache.get(nodeId);
    if (!forceGraphInstance || !node || !Number.isFinite(node.x)) return null;
    const point = forceGraphInstance.graph2ScreenCoords(node.x!, node.y!, node.z!);
    const rect = requireElement("graph-svg").getBoundingClientRect();
    return { x: rect.left + point.x, y: rect.top + point.y };
  }

  /** Translate the camera in its image plane; preserve its bearing and the subject's screen point. */
  function alignSubject(point: CameraPoint): void {
    if (!forceGraphInstance || !subjectAnchor) return;
    const camera = forceGraphInstance.camera();
    const controls = forceGraphInstance.controls() as { target: Vector3 };
    camera.lookAt(controls.target);
    camera.updateMatrixWorld();
    const offset = screenAnchorTranslation(camera, point, subjectAnchor);
    forceGraphInstance.cameraPosition(camera.position.clone().add(offset), controls.target.clone().add(offset));
    camera.lookAt(controls.target);
    camera.updateMatrixWorld();
  }

  function placeSubjectAnchor(nodeId: string, anchor: { x: number; y: number }): void {
    if (!forceGraphInstance) return;
    const node = nodeCache.get(nodeId);
    const rect = requireElement("graph-svg").getBoundingClientRect();
    subjectAnchor = { x: (anchor.x - rect.left) / rect.width, y: (anchor.y - rect.top) / rect.height };
    if (!node || !Number.isFinite(node.x)) return;
    const controls = forceGraphInstance.controls() as { target: CameraPoint };
    const camera = forceGraphInstance.cameraPosition();
    const point = node as ForceGraphNode & CameraPoint;
    // Re-entering an existing camera preserves its distance and viewing angle.
    const distance = Math.hypot(camera.x - controls.target.x, camera.y - controls.target.y, camera.z - controls.target.z);
    const position = focusedCameraPosition(camera, controls.target, point, distance || 600);
    forceGraphInstance.cameraPosition(position, point);
    alignSubject(point);
    focusMotion = null;
    following = false;
    focusedId = nodeId;
    // Track a still-running simulation without introducing a second camera flight.
    if (focusLabel) { focusLabel.style.left = `${anchor.x - rect.left}px`; focusLabel.style.top = `${anchor.y - rect.top}px`; }
  }

  function setActive(value: boolean): void {
    if (value && !active && focusMotion && pausedAt) focusMotion.started += performance.now() - pausedAt;
    if (!value && active) { pausedAt = performance.now(); zoomMotion = null; }
    active = value;
    if (value) {
      forceGraphInstance?.resumeAnimation();
      if (!animation && forceGraphInstance) animation = requestAnimationFrame(animateFocus);
    } else {
      forceGraphInstance?.pauseAnimation();
      cancelAnimationFrame(animation);
      animation = 0;
    }
  }

  function animateFocus(): void {
    animation = 0;
    if (!active) return;
    updateFocus(performance.now(), !simulationRunning);
    animation = requestAnimationFrame(animateFocus);
  }

  function updateFocus(now: number, advanceCamera = true): void {
    if (!active || !forceGraphInstance) return;
    if (zoomMotion && advanceCamera) {
      const motion = zoomMotion;
      const t = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : Math.min(1, (now - motion.started) / 180);
      const k = 1 - Math.pow(1 - t, 3);
      const mix = (a: CameraPoint, b: CameraPoint): CameraPoint => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k });
      forceGraphInstance.cameraPosition(mix(motion.from, motion.to), mix(motion.fromTarget, motion.toTarget));
      if (t === 1) zoomMotion = null;
    }
    const node = focusedId ? nodeCache.get(focusedId) : undefined;
    if (node && Number.isFinite(node.x) && Number.isFinite(node.y) && Number.isFinite(node.z)) {
      const point = node as ForceGraphNode & CameraPoint;
      if (following && advanceCamera) {
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
      const camera = forceGraphInstance.camera();
      camera.lookAt((forceGraphInstance.controls() as { target: Vector3 }).target);
      camera.updateMatrixWorld();
      if (subjectAnchor && advanceCamera) alignSubject(point);
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
  }

  function focusSelection(force = false): void {
    const node = state.focusedNode ?? state.selectedNode;
    if (!force && node?.id === focusedId) return;
    focusedId = node?.id ?? null;
    zoomMotion = null;
    barrier.reset(); options.onZoomBoundary?.(false);
    subjectAnchor = null;
    following = !!node;
    focusMotion = null;
    if (focusLabel) {
      focusLabel.textContent = node?.name ?? "";
      focusLabel.title = node ? `${node.codeRelativePath} — Show details` : "";
      focusLabel.dataset.nodeId = node?.id ?? "";
      focusLabel.hidden = true;
    }
  }

  function render(): void {
    const container = requireElement<HTMLDivElement>("graph-svg");
    const path = options.getPath?.();

    const includeNode = (node: ExplorerNodePayload): boolean => {
      if (path?.includes(node.id) || (state.focusedNode ?? state.selectedNode)?.id === node.id || state.pins?.entries.some(pin => pin.nodeId === node.id)) {
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
      links: fileConnections(graphLinks)
    };

    for (let index = 0; index < graphNodes.length; index++) {
      const node = graphNodes[index];
      graphNodes[index] = nodeCache.get(node.id) ?? node;
      nodeCache.set(node.id, graphNodes[index]);
    }
    const nextMembership = JSON.stringify([graphNodes.map(node => node.id), dataForGraph.links]);
    const present = new Set(graphNodes.map(node => node.id));
    for (const id of nodeObjects.keys()) if (!present.has(id)) nodeObjects.delete(id);
    const pins = state.pins ?? EMPTY_PIN_SET;
    const retained = new Set(pins.entries.map(pin => pin.nodeId));
    for (const { link } of getVisibleConnections(pins, graphData.links)) {
      retained.add(resolveLinkEndpoint(link.source)); retained.add(resolveLinkEndpoint(link.target));
    }
    if (state.selectedNode) retained.add(state.selectedNode.id);
    if (path?.length) { retained.clear(); for (const id of path) retained.add(id); }
    const hasAttention = !!pins.entries.length || !!path?.length;
    const nodeColor = (node: ForceGraphNode): string => {
      const colors: Record<string, string> = { implementation: "#0091ff", test: "#28a745", interface: "#ffc107", config: "#6c757d", script: "#17a2b8", "related-doc": "#9966cc" };
      const color = colors[(node.archetype ?? "").toLowerCase()] ?? "#888888";
      return hasAttention && !retained.has(node.id) ? `${color}33` : color;
    };

    const pathPairs = new Set(path?.slice(1).map((id, index) => JSON.stringify([id, path[index]].sort())));
    const linkColor = (link: ForceGraphLink): string => {
      const a = resolveLinkEndpoint(link.source), b = resolveLinkEndpoint(link.target);
      const visible = path?.length ? pathPairs.has(JSON.stringify([a, b].sort())) : !hasAttention || (retained.has(a) && retained.has(b));
      return link.kind === "related-doc"
        ? `rgba(153, 102, 204, ${visible ? 0.4 : 0.04})`
        : `rgba(255, 255, 255, ${visible ? 0.2 : 0.025})`;
    };

    if (forceGraphInstance) {
      if (nextMembership !== membership) forceGraphInstance.graphData(dataForGraph);
      membership = nextMembership;
      focusSelection();
      forceGraphInstance.nodeColor(node => nodeColor(node as ForceGraphNode));
      forceGraphInstance.linkColor(link => linkColor(link as ForceGraphLink));
      setActive(true);
      return;
    }

    container.dataset.hoveredNode = "false";
    // The library types its callbacks for any node and link; the ones it hands back are this view's own.
    forceGraphInstance = new ForceGraph3D(container)
      .width(container.clientWidth)
      .height(container.clientHeight)
      .graphData(dataForGraph)
      .warmupTicks(100)
      // The simulation moves nodes immediately before painting. Track that
      // position in the same frame so the sphere and its projected label agree.
      .onEngineTick(() => { simulationRunning = true; ready = true; updateFocus(performance.now()); for (const resolve of readyWaiters.splice(0)) resolve(); })
      .onEngineStop(() => { simulationRunning = false; })
      .nodePositionUpdate((object, _position, node) => {
        nodeObjects.set((node as ForceGraphNode).id, object);
        return false; // The native renderer still owns object placement.
      })
      .onNodeHover(node => { container.dataset.hoveredNode = String(!!node); })
      .nodeLabel("name")
      .linkLabel(link => `${(link as { count?: number }).count ?? 1} references`)
      .nodeColor(node => nodeColor(node as ForceGraphNode))
      .linkColor(link => linkColor(link as ForceGraphLink))
      .linkWidth(link => {
        if ((link as ForceGraphLink).kind === "related-doc") {
          return 0.5;
        }
        return 1;
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
    const interrupt = (): void => { following = false; focusMotion = null; subjectAnchor = null; zoomMotion = null; barrier.reset(); options.onZoomBoundary?.(false); };
    let press: { x: number; y: number } | null = null;
    container.addEventListener("pointerdown", event => { press = { x: event.clientX, y: event.clientY }; });
    container.addEventListener("pointermove", event => {
      if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 3) { interrupt(); press = null; }
    });
    // The library dispatches clicks through its throttled hover cache. Resolve
    // a press against the actual rendered node objects instead, including fast
    // clicks and touch taps that have never produced a hover frame.
    container.addEventListener("pointerup", event => {
      if (!press || event.button !== 0 || event.target !== forceGraphInstance?.renderer().domElement) return;
      const rect = forceGraphInstance.renderer().domElement.getBoundingClientRect();
      const pointer = new Vector2((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2);
      forceGraphInstance.scene().updateMatrixWorld(true);
      forceGraphInstance.camera().updateMatrixWorld();
      raycaster.setFromCamera(pointer, forceGraphInstance.camera());
      const byObject = new Map([...nodeObjects].map(([id, object]) => [object, id]));
      const hit = raycaster.intersectObjects([...nodeObjects.values()], true)[0];
      let object: Object3D | null = hit?.object ?? null;
      while (object && !byObject.has(object)) object = object.parent;
      const id = object ? byObject.get(object) : undefined;
      if (id?.startsWith("related:")) onShowBundledDoc(id.slice("related:".length));
      else if (id) {
        const node = nodesById.get(id);
        if (node) { onFocusNode(node); focusSelection(true); }
      }
    });
    window.addEventListener("pointerup", () => { press = null; });
    container.addEventListener("wheel", event => {
      const node = state.selectedNode ? nodeCache.get(state.selectedNode.id) : null;
      if (!forceGraphInstance || !node || !Number.isFinite(node.x)) { interrupt(); return; }
      event.preventDefault(); event.stopPropagation();
      const point = new Vector3(node.x, node.y, node.z);
      const camera = forceGraphInstance.camera();
      const controls = forceGraphInstance.controls() as { target: Vector3 };
      const previous = zoomMotion;
      const from = new Vector3().copy(previous?.to ?? camera.position);
      const target = new Vector3().copy(previous?.toTarget ?? controls.target);
      const distance = from.distanceTo(point);
      const delta = wheelPixels(event.deltaY, event.deltaMode, container.clientHeight);
      if (options.onZoomIn && delta < 0 && (distance <= 65.01 || barrier.waiting)) {
        options.onZoomBoundary?.(true);
        if (barrier.push(-delta, performance.now())) {
          options.onZoomBoundary?.(false); options.onZoomIn();
        }
        return;
      }
      barrier.reset(); options.onZoomBoundary?.(false);
      interrupt();
      const nextDistance = Math.max(65, Math.min(20000, distance * Math.exp(delta * .0015)));
      if (delta < 0 && nextDistance === 65) { barrier.push(-delta, performance.now()); options.onZoomBoundary?.(true); }
      const ratio = nextDistance / Math.max(.001, distance);
      zoomMotion = { started: performance.now(), from: camera.position.clone(), fromTarget: controls.target.clone(),
        to: point.clone().add(from.sub(point).multiplyScalar(ratio)),
        toTarget: point.clone().add(target.sub(point).multiplyScalar(ratio)) };
    }, { passive: false, capture: true });
    new ResizeObserver(() => {
      if (container.clientWidth && container.clientHeight) forceGraphInstance?.width(container.clientWidth).height(container.clientHeight);
    }).observe(container);
    focusSelection();
    setActive(true);
  }

  function captureScene(): ForceScene {
    if (!forceGraphInstance) return { files: [], links: [] };
    const instance = forceGraphInstance;
    const camera = instance.camera();
    camera.lookAt((instance.controls() as { target: Vector3 }).target);
    camera.updateMatrixWorld();
    const rect = requireElement("graph-svg").getBoundingClientRect();
    const colorForNode = instance.nodeColor();
    const files = (instance.graphData().nodes as ForceGraphNode[]).flatMap(node => {
      if (!Number.isFinite(node.x)) return [];
      const point = new Vector3(node.x, node.y, node.z);
      const depth = point.clone().project(camera).z;
      if (depth < -1 || depth > 1) return [];
      const center = instance.graph2ScreenCoords(point.x, point.y, point.z);
      const object = nodeObjects.get(node.id);
      const size = object ? new Box3().setFromObject(object).getSize(new Vector3()) : null;
      const radius = size ? Math.max(size.x, size.y, size.z) / 2 : instance.nodeRelSize();
      const edge = point.clone().add(new Vector3(radius, 0, 0).applyQuaternion(camera.quaternion));
      const screenEdge = instance.graph2ScreenCoords(edge.x, edge.y, edge.z);
      return [{ id: node.id, name: node.name, x: rect.left + center.x, y: rect.top + center.y,
        radius: Math.abs(screenEdge.x - center.x), color: typeof colorForNode === "function" ? colorForNode(node) : "#888888" }];
    });
    return { files, links: instance.graphData().links.map(link => ({ source: resolveLinkEndpoint(link.source as string | { id: string }), target: resolveLinkEndpoint(link.target as string | { id: string }) })) };
  }

  return { render, setActive, getSubjectAnchor, placeSubjectAnchor, captureScene, whenReady: () => ready ? Promise.resolve() : new Promise(resolve => readyWaiters.push(resolve)) };
}
