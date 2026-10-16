/**
 * Force Graph View
 *
 * Renders the 3D force-directed graph view for the Live Docs Explorer using
 * ForceGraph3D. Supports Related Documentation overlay nodes when enabled.
 *
 * Two layouts share the renderer (2026-10-14): in the connections layout the
 * documented references pull and are drawn; in the structure layout every file
 * hangs from its directory's hub and the references pull nothing, drawn only
 * for the hovered file or hub, the retained files and a path. Retention and
 * hover decide which parts of either picture receive attention.
 */

import ForceGraph3D, { type ForceGraph3DInstance } from "3d-force-graph";
import { Box3, PerspectiveCamera, Raycaster, Vector2, Vector3, type Object3D } from "three";

import type { RelatedDocLink } from "../../shared/staticExplorerData";
import type {
  ExplorerGraphPayload,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../shared/types";
import { requireElement } from "../dom";
import type { ExplorerState } from "../types";
import { directoryNodeId, spatialGraphOf, type SpatialGraphNode, type SpatialLinkKind } from "./forceGraphData";
import { configureSpatialForces, spatialNodeRadius, spatialNodeValue } from "./forceGraphLayout";
import { layoutPresetOf } from "../layout-presets";
import { focusedCameraPosition, frameCameraSpheres, screenAnchorTranslation, wheelZoomCamera, type CameraPoint } from "./forceGraphCamera";
import { under } from "./localView/directory-state";
import type { ForceScene } from "./perspectiveTransition";
import { getVisibleConnections, EMPTY_PIN_SET } from "./pin-state";
import { wheelPixels } from "./wheel";

const NODE_COLORS: Readonly<Record<string, string>> = {
  implementation: "#0091ff",
  test: "#28a745",
  asset: "#e83e8c",
  interface: "#ffc107",
  config: "#6c757d",
  script: "#17a2b8",
  "related-doc": "#9966cc",
  directory: "#e9984d"
};

// ─────────────────────────────────────────────────────────────────────────
// Force Graph Types
// ─────────────────────────────────────────────────────────────────────────

/** A link in the Force Graph between two nodes. */
export interface ForceGraphLink {
  source: string | ForceGraphNode;
  target: string | ForceGraphNode;
  kind: SpatialLinkKind;
  count: number;
}

/** A node in the Force Graph, extending the payload with optional archetype. */
export type ForceGraphNode = SpatialGraphNode & {
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
  onRetainNode: (node: ExplorerNodePayload) => void;
  onOpenDirectory: (directory: string) => void;
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
  focusDirectory(directory: string): void;
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

  let forceGraphInstance: ForceGraph3DInstance<ForceGraphNode, ForceGraphLink> | null = null;
  const nodeCache = new Map<string, ForceGraphNode>();
  const nodeObjects = new Map<string, Object3D>();
  const raycaster = new Raycaster();
  let membership = "";
  let forceSettings = "";
  let sizeSettings = "";
  let attentionSettings = "";
  let focusedId: string | null = null;
  let selectedId: string | null = null;
  let focusedDirectory: string | null = null;
  let hoveredId: string | null = null;
  let updateAttention = (): void => {};
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
  let framedDirectoryScope = "";
  let frameDirectory = (): void => {};
  const readyWaiters: Array<() => void> = [];

  /** Pick the rendered sphere directly, including re-entry before the native hover cache changes. */
  function nodeAt(clientX: number, clientY: number): string | undefined {
    if (!forceGraphInstance) return undefined;
    const rect = forceGraphInstance.renderer().domElement.getBoundingClientRect();
    const pointer = new Vector2((clientX - rect.left) / rect.width * 2 - 1, 1 - (clientY - rect.top) / rect.height * 2);
    forceGraphInstance.scene().updateMatrixWorld(true);
    forceGraphInstance.camera().updateMatrixWorld();
    raycaster.setFromCamera(pointer, forceGraphInstance.camera());
    const byObject = new Map([...nodeObjects].map(([id, object]) => [object, id]));
    const hit = raycaster.intersectObjects([...nodeObjects.values()], true)[0];
    let object: Object3D | null = hit?.object ?? null;
    while (object && !byObject.has(object)) object = object.parent;
    return object ? byObject.get(object) : undefined;
  }

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
    focusedDirectory = node.directoryPath ?? null;
    if (focusLabel) {
      focusLabel.textContent = node.name;
      focusLabel.dataset.nodeId = nodeId;
      focusLabel.title = focusedDirectory !== null ? `Open ${focusedDirectory || "Scan root"}` : `${node.codeRelativePath} — Show details`;
    }
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
    if (!force && (node?.id ?? null) === selectedId) return;
    selectedId = node?.id ?? null;
    focusedDirectory = null;
    focusedId = node?.id ?? null;
    zoomMotion = null;

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

  function focusDirectory(directory: string): void {
    focusedDirectory = directory;
    focusedId = state.spatialLayout === "structure" ? directoryNodeId(directory) : null;
    following = false;
    subjectAnchor = null;
    zoomMotion = null;
    focusMotion = null;
    if (focusLabel) {
      focusLabel.textContent = directory.split("/").pop() || "Scan root";
      focusLabel.title = `Open ${directory || "Scan root"}`;
      focusLabel.dataset.nodeId = focusedId ?? "";
      focusLabel.hidden = true;
    }
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 500;
    frameDirectories([directory], duration);
    updateAttention();
  }

  function frameDirectories(directories: readonly string[], duration: number): void {
    if (!forceGraphInstance) return;
    const instance = forceGraphInstance;
    const spheres = instance.graphData().nodes
      .filter(node => Number.isFinite(node.x) && Number.isFinite(node.y) && Number.isFinite(node.z)
        && directories.some(directory => under(node.directoryPath ?? node.codeRelativePath, directory)))
      .map(node => ({
        center: { x: node.x!, y: node.y!, z: node.z! },
        radius: spatialNodeRadius(node, state.tuning.forceGraph)
      }));
    const camera = instance.camera();
    if (!(camera instanceof PerspectiveCamera)) throw new Error("Directory framing requires a perspective camera.");
    const framing = frameCameraSpheres(camera, spheres, { width: instance.width(), height: instance.height() });
    if (framing) instance.cameraPosition(framing.camera, framing.target, duration);
  }

  function render(): void {
    const container = requireElement<HTMLDivElement>("graph-svg");
    const path = options.getPath?.();
    const directories = [...(state.openDirectories ?? [])].sort();
    const directoryScope = directories.length && !state.selectedNode && !path?.length ? JSON.stringify(directories) : "";
    container.dataset.directoryScope = directoryScope;

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
    const data = spatialGraphOf(graphData, includeNode, state.filters.showRelatedDocs ? relatedDocLinks : [], state.spatialLayout);
    const graphNodes: ForceGraphNode[] = data.nodes.map(node => {
      const cached = nodeCache.get(node.id);
      return cached ? Object.assign(cached, node) : node;
    });
    const dataForGraph: ForceGraphData = { nodes: graphNodes, links: data.links };
    container.dataset.layoutPreset = layoutPresetOf(state.tuning);

    const updateForces = (): void => {
      const instance = forceGraphInstance!;
      const nextSettings = JSON.stringify([state.tuning.forceGraph, state.spatialLayout]);
      if (forceSettings === nextSettings) return;
      const subjectId = focusedDirectory !== null
        ? state.spatialLayout === "structure" ? directoryNodeId(focusedDirectory) : null
        : (state.focusedNode ?? state.selectedNode)?.id;
      const anchor = subjectId ? getSubjectAnchor(subjectId) : null;
      const tuning = { ...state.tuning.forceGraph };
      const nextSize = JSON.stringify([tuning.nodeSize, tuning.symbolScale]);
      if (sizeSettings !== nextSize) {
        instance.nodeVal(node => spatialNodeValue(node, tuning)).nodeRelSize(tuning.nodeSize);
        sizeSettings = nextSize;
      }
      configureSpatialForces<ForceGraphNode>({
        get: name => instance.d3Force(name),
        set: (name, force) => { instance.d3Force(name, force); }
      }, tuning, state.spatialLayout);
      forceSettings = nextSettings;
      container.dataset.layoutSettings = JSON.stringify(tuning);
      container.dataset.spatialLayout = state.spatialLayout;
      container.setAttribute("aria-busy", "true");
      instance.d3ReheatSimulation();
      simulationRunning = true;
      if (subjectId && anchor) placeSubjectAnchor(subjectId, anchor);
    };

    for (let index = 0; index < graphNodes.length; index++) {
      const node = graphNodes[index];
      graphNodes[index] = nodeCache.get(node.id) ?? node;
      nodeCache.set(node.id, graphNodes[index]);
    }
    // A hub new to the picture starts at the centroid of its members that already stand somewhere, and the files keep
    // their places, so that the structure layout folds the network into the tree from where the eye left it.
    for (const hub of graphNodes) {
      if (hub.directoryPath === undefined || Number.isFinite(hub.x)) continue;
      const placed = graphNodes.filter(node => node !== hub && Number.isFinite(node.x) && under(node.directoryPath ?? node.codeRelativePath, hub.directoryPath!));
      if (!placed.length) continue;
      hub.x = placed.reduce((sum, node) => sum + node.x!, 0) / placed.length;
      hub.y = placed.reduce((sum, node) => sum + node.y!, 0) / placed.length;
      hub.z = placed.reduce((sum, node) => sum + node.z!, 0) / placed.length;
    }
    const nextMembership = JSON.stringify([graphNodes.map(node => node.id), dataForGraph.links]);
    const present = new Set(graphNodes.map(node => node.id));
    for (const id of nodeObjects.keys()) if (!present.has(id)) nodeObjects.delete(id);
    if (hoveredId && !present.has(hoveredId)) hoveredId = null;
    if (focusedDirectory !== null && !state.openDirectories?.has(focusedDirectory)) {
      focusedDirectory = null;
      selectedId = null;
      focusedId = null;
      if (focusLabel) focusLabel.hidden = true;
    }
    if (focusedDirectory !== null) {
      const id = directoryNodeId(focusedDirectory);
      focusedId = state.spatialLayout === "structure" && present.has(id) ? id : null;
      if (focusLabel) {
        focusLabel.dataset.nodeId = focusedId ?? "";
        if (!focusedId) focusLabel.hidden = true;
      }
    }
    const pins = state.pins ?? EMPTY_PIN_SET;
    const retained = new Set(pins.entries.map(pin => pin.nodeId));
    for (const { link } of getVisibleConnections(pins, graphData.links)) {
      retained.add(resolveLinkEndpoint(link.source)); retained.add(resolveLinkEndpoint(link.target));
    }
    for (const node of filteredNodes) if (directories.some(directory => under(node.id, directory))) retained.add(node.id);
    if (state.selectedNode) retained.add(state.selectedNode.id);
    if (path?.length) { retained.clear(); for (const id of path) retained.add(id); }
    const retainedFiles = [...retained];
    for (const node of graphNodes) {
      if (node.directoryPath !== undefined && retainedFiles.some(id => under(id, node.directoryPath!))) retained.add(node.id);
    }
    const hasAttention = !!pins.entries.length || !!path?.length || directories.length > 0;
    frameDirectory = (): void => {
      if (directoryScope && directoryScope !== framedDirectoryScope) {
        frameDirectories(directories, 0);
      }
      framedDirectoryScope = directoryScope;
    };
    const pathPairs = new Set(path?.slice(1).map((id, index) => JSON.stringify([id, path[index]].sort())));
    const within = (id: string, directory: string): boolean => {
      const node = nodeCache.get(id);
      return !!node && under(node.directoryPath ?? node.codeRelativePath, directory);
    };
    updateAttention = (): void => {
      // Hover is a temporary look at a file's actual connections, including a
      // file outside the retained scope. Leaving restores the current pins,
      // directories or path; it never restores a snapshot from graph entry.
      const hovered = hoveredId;
      const attention = hovered ? new Set([hovered]) : hasAttention ? retained : null;
      const hoveredDirectory = hovered ? nodeCache.get(hovered)?.directoryPath : undefined;
      const directoryAttention = hoveredDirectory ?? (hovered ? undefined : focusedDirectory ?? undefined);
      if (hoveredDirectory !== undefined) {
        for (const node of graphNodes) {
          if (under(node.directoryPath ?? node.codeRelativePath, hoveredDirectory)) attention!.add(node.id);
        }
      } else if (hovered) {
        for (const link of dataForGraph.links) {
          const a = resolveLinkEndpoint(link.source), b = resolveLinkEndpoint(link.target);
          if (a === hovered || b === hovered) { attention!.add(a); attention!.add(b); }
        }
      }
      // Accessor setters rebuild native materials/geometries. A force or
      // camera edit with identical attention needs no appearance update.
      const nextAttention = JSON.stringify([
        attention ? [...attention].sort() : null,
        hovered,
        path ?? null,
        directoryAttention ?? null,
        state.spatialLayout
      ]);
      if (attentionSettings === nextAttention) return;
      attentionSettings = nextAttention;
      forceGraphInstance?.nodeColor(node => {
        const color = NODE_COLORS[(node.archetype ?? "").toLowerCase()] ?? "#888888";
        return attention && !attention.has(node.id) ? `${color}33` : color;
      });
      forceGraphInstance?.linkColor(link => {
        const a = resolveLinkEndpoint(link.source), b = resolveLinkEndpoint(link.target);
        const visible = hovered ? a === hovered || b === hovered
          : path?.length ? pathPairs.has(JSON.stringify([a, b].sort())) : !attention || (attention.has(a) && attention.has(b));
        // Containment is the structure itself, drawn as a line; a reference revealed in the structure layout reads
        // against the tree rather than as the faint web of the connections layout.
        if (link.kind === "containment") return `rgba(233, 152, 77, ${visible ? 0.35 : 0.08})`;
        if (link.kind === "related-doc") return `rgba(153, 102, 204, ${visible ? 0.4 : 0.04})`;
        return state.spatialLayout === "structure" ? `rgba(255, 255, 255, ${visible ? 0.5 : 0})` : `rgba(255, 255, 255, ${visible ? 0.2 : 0.025})`;
      });
      forceGraphInstance?.linkVisibility(link => {
        if (state.spatialLayout !== "structure" || link.kind === "containment") return true;
        // In the structure layout a reference is drawn on demand: for the hovered file, within and out of the hovered
        // hub's subtree, among the retained files, and along a path.
        const a = resolveLinkEndpoint(link.source), b = resolveLinkEndpoint(link.target);
        if (hoveredDirectory !== undefined) return within(a, hoveredDirectory) || within(b, hoveredDirectory);
        if (hovered) return a === hovered || b === hovered;
        if (path?.length) return pathPairs.has(JSON.stringify([a, b].sort()));
        return !!attention && attention.has(a) && attention.has(b);
      });
    };

    if (forceGraphInstance) {
      if (nextMembership !== membership) {
        // Warm up only the first picture. Later membership changes evolve
        // from the visible positions so a type toggle does not jump ahead.
        forceGraphInstance.warmupTicks(0).graphData(dataForGraph);
      }
      membership = nextMembership;
      focusSelection();
      updateAttention();
      updateForces();
      frameDirectory();
      setActive(true);
      return;
    }

    container.dataset.hoveredNode = "false";
    // The constructor declaration erases the instance's generic data types;
    // this boundary supplies the exact node/link types passed to graphData.
    forceGraphInstance = (new ForceGraph3D(container) as unknown as ForceGraph3DInstance<ForceGraphNode, ForceGraphLink>)
      .width(container.clientWidth)
      .height(container.clientHeight)
      .graphData(dataForGraph)
      .warmupTicks(100)
      // The engine stops when the layout has settled, at D3's own minimum alpha, rather than at the library's fifteen
      // seconds after every change.
      .d3AlphaMin(0.001)
      // The alphas the link colours carry are the real ones; the library's default opacity of 0.2 multiplied them.
      .linkOpacity(1)
      // The simulation moves nodes immediately before painting. Track that
      // position in the same frame so the sphere and its projected label agree.
      .onEngineTick(() => { simulationRunning = true; ready = true; container.setAttribute("aria-busy", "true"); frameDirectory(); updateFocus(performance.now()); for (const resolve of readyWaiters.splice(0)) resolve(); })
      .onEngineStop(() => { simulationRunning = false; container.setAttribute("aria-busy", "false"); })
      .nodePositionUpdate((object, _position, node) => {
        nodeObjects.set((node).id, object);
        return false; // The native renderer still owns object placement.
      })
      .onNodeHover(node => { hoveredId = node?.id ?? null; container.dataset.hoveredNode = String(!!node); updateAttention(); })
      .nodeLabel(node => {
        const file = node;
        const label = document.createElement("span");
        label.textContent = file.directoryPath !== undefined
          ? `${file.directoryPath || "Scan root"} · ${file.directoryFileCount} visible files`
          : file.archetype === "related-doc" ? file.name
          : `${file.name} · ${file.publicSymbols.length} public ${file.publicSymbols.length === 1 ? "symbol" : "symbols"}`;
        return label;
      })
      .linkLabel(link => link.kind === "containment" ? "Directory membership"
        : `${link.count} ${link.kind === "related-doc" ? "documentation" : "documented"} ${link.count === 1 ? "reference" : "references"}`)
      .linkWidth(link => link.kind === "related-doc" ? 0.5 : 1);
    updateAttention();
    updateForces();
    membership = nextMembership;
    focusLabel = document.createElement("button");
    focusLabel.className = "force-graph-focus";
    focusLabel.hidden = true;
    focusLabel.addEventListener("click", () => {
      if (focusedDirectory !== null) {
        options.onOpenDirectory(focusedDirectory);
        return;
      }
      const node = focusedId ? nodesById.get(focusedId) : undefined;
      if (node) {
        onFocusNode(node);
        focusSelection(true);
      }
    });
    container.append(focusLabel);
    container.addEventListener("pointerleave", () => { hoveredId = null; container.dataset.hoveredNode = "false"; updateAttention(); });
    container.addEventListener("pointerenter", event => {
      hoveredId = nodeAt(event.clientX, event.clientY) ?? null;
      container.dataset.hoveredNode = String(!!hoveredId);
      updateAttention();
    });
    const interrupt = (): void => { following = false; focusMotion = null; subjectAnchor = null; zoomMotion = null;  };
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
      const id = nodeAt(event.clientX, event.clientY);
      const directory = id ? nodeCache.get(id)?.directoryPath : undefined;
      if (directory !== undefined) options.onOpenDirectory(directory);
      else if (id?.startsWith("related:")) onShowBundledDoc(id.slice("related:".length));
      else if (id) {
        const node = nodesById.get(id);
        if (node) {
          options.onRetainNode(node);
          onFocusNode(node);
          focusSelection(true);
        }
      }
    });
    window.addEventListener("pointerup", () => { press = null; });
    container.addEventListener("wheel", event => {
      if (!forceGraphInstance) return;
      event.preventDefault(); event.stopPropagation();
      const camera = forceGraphInstance.camera();
      const controls = forceGraphInstance.controls() as { target: Vector3 };
      const node = focusedId ? nodeCache.get(focusedId) : null;
      const point = node && Number.isFinite(node.x) ? new Vector3(node.x, node.y, node.z) : controls.target;
      const previous = zoomMotion;
      const delta = wheelPixels(event.deltaY, event.deltaMode, container.clientHeight);
      const next = wheelZoomCamera(previous?.to ?? camera.position, previous?.toTarget ?? controls.target, point, delta);
      interrupt();
      zoomMotion = { started: performance.now(), from: camera.position.clone(), fromTarget: controls.target.clone(),
        to: next.camera, toTarget: next.target };
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
    const files = (instance.graphData().nodes).flatMap(node => {
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

  return { render, setActive, focusDirectory, getSubjectAnchor, placeSubjectAnchor, captureScene, whenReady: () => ready ? Promise.resolve() : new Promise(resolve => readyWaiters.push(resolve)) };
}
