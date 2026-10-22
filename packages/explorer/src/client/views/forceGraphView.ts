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
 *
 * Since 2026-10-18 the view can show a moment of the history in place of
 * today's docs (the change-over-time plan's C4): the moment's snapshot is the
 * data, its renames re-key the cached spheres and lines so that a renamed file
 * or hub keeps its object under its new id, today's pins, subject and open
 * directories are read where they stand at that moment, and the step is fed
 * through the one update path at the energy asked, zero while a thumb drags.
 */

import ForceGraph3D, { type ForceGraph3DInstance } from "3d-force-graph";
import type { ForceLink } from "d3-force-3d";
import { Box3, PerspectiveCamera, Raycaster, Vector2, Vector3, type Object3D } from "three";

import { focusedCameraPosition, frameCameraSpheres, screenAnchorTranslation, wheelZoomCamera, type CameraPoint } from "./forceGraphCamera";
import { directoryNodeId, spatialGraphOf, type SpatialGraphNode, type SpatialLinkKind } from "./forceGraphData";
import { under } from "./localView/directory-state";
import type { ForceScene } from "./perspectiveTransition";
import type { RelatedDocLink } from "../../shared/staticExplorerData";
import type {
  ExplorerGraphPayload,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../shared/types";
import { requireElement } from "../dom";
import { motionForce, placeNewSpheres, spatialNodeRadius, spatialNodeValue, symbolCountOf, type MotionForce, type MotionStart } from "./forceGraphLayout";
import { getVisibleConnections, EMPTY_PIN_SET, type PinSet } from "./pin-state";
import { wheelPixels } from "./wheel";
import type { HistoryMoment } from "../history/moment";
import { composedRenames, hasRenames, NO_RENAMES, rekeyedCaches, renamedId, type Renames } from "../history/rekey";
import { layoutPresetOf } from "../layout-presets";
import { CENTRE_ICON, DIRECTORY_ICON, iconButton, MORE_ICON, PIN_ICON } from "../panels/icon-button";
import type { ExplorerState } from "../types";

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
  /** Whether today's bundle carries a document, so that a past moment's link to one gone since opens nothing. */
  hasBundledDoc?: (docPath: string) => boolean;
  onShowBundledDoc: (docPath: string) => void;
  /** Inspect a file without changing the map's subject, pins or camera. */
  onFocusNode: (node: ExplorerNodePayload) => void;
  onPressPin: (nodeId: string, symbol: string) => void;
  onReleasePin: (nodeId: string) => void;
  onRecenterNode: (node: ExplorerNodePayload) => void;
  onShowNodeActions: (node: ExplorerNodePayload, symbol: string | undefined, point: { x: number; y: number }, onClose?: () => void) => void;
  onShowDirectoryActions: (directory: string, point: { x: number; y: number }, onClose?: () => void) => void;
  onCentreDirectory: (directory: string) => void;
  onInspectDirectory: (directory: string) => void;
  onOpenDirectory: (directory: string) => void;
  onCloseDirectory: (directory: string) => void;
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
  /** Frame a file explicitly, for the retained-item tray, without changing the selected subject. */
  focusNode(nodeId: string): void;
  focusDirectory(directory: string): void;
  /**
   * Show a moment of the history in place of today, or today again (null), re-keying the picture through the renames
   * from the moment shown before; the change is fed at `energy`, or at the tuning's when none is given. Drawn at once
   * when the view is shown, else at its next render.
   */
  setMoment(moment: HistoryMoment | null, renames: Renames, energy?: number): void;
  /** Feed the standing picture at the tuning's energy, after a drag placed it without a tick. */
  settle(): void;
}

/** Creates the Force Graph (3D) view for the Live Docs Explorer. */
export function createForceGraphView(options: ForceGraphViewOptions): ForceGraphViewApi {
  const {
    state,
    graphData,
    nodesById,
    resolveLinkEndpoint,
    relatedDocLinks,
    hasBundledDoc = () => true,
    onShowBundledDoc,
    onFocusNode
  } = options;

  let forceGraphInstance: ForceGraph3DInstance<ForceGraphNode, ForceGraphLink> | null = null;
  const nodeCache = new Map<string, ForceGraphNode>();
  const linkCache = new Map<string, ForceGraphLink>();
  const nodeObjects = new Map<string, Object3D>();
  // The one force that moves the spheres, the links it builds its springs from, the constant strength it eases at (one for
  // the first picture, a change of the forces and a hand; the update energy from a membership change until the next of
  // those, ticket C2), and the layout last fed, since a new layout unfolds the picture afresh (2026-10-21).
  let motion: MotionForce<ForceGraphNode> | null = null;
  let heldLinks: readonly ForceGraphLink[] = [];
  let strength = 1;
  let shownLayout: string | null = null;
  // The moment of the history shown in place of today, the renames to re-key the caches by before the next render,
  // and the energy that render feeds the change at (ticket C4, 2026-10-18).
  let moment: HistoryMoment | null = null;
  let pendingRenames: Renames = NO_RENAMES;
  let pendingEnergy: number | undefined;
  const raycaster = new Raycaster();
  let membership = "";
  let forceSettings = "";
  let sizeSettings = "";
  let attentionSettings = "";
  let focusedId: string | null = null;
  let selectedId: string | null = null;
  let focusedDirectory: string | null = null;
  let explicitDirectoryFocus = false;
  let hoveredId: string | null = null;
  let updateAttention = (): void => {};
  let active = false;
  let animation = 0;
  let focusMotion: { started: number; camera: CameraPoint; target: CameraPoint; offset: CameraPoint } | null = null;
  let following = false;
  let zoomMotion: { started: number; from: CameraPoint; fromTarget: CameraPoint; to: CameraPoint; toTarget: CameraPoint } | null = null;
  let focusLabel: HTMLButtonElement | null = null;
  let actionStrip: HTMLDivElement | null = null;
  let actionTargetId: string | null = null;
  let menuTargetId: string | null = null;
  let menuEpoch = 0;
  let inspectedActionId: string | null = null;
  let seenInspectionKey = "";
  let pointerHoverId: string | null = null;
  let pointerPosition: { x: number; y: number } | null = null;
  let pointerPickNeeded = false;
  let pickedCamera: number[] = [];
  let pickedProjection: number[] = [];
  let pickedFrame: DOMRect | null = null;
  let pointerOverActions = false;
  let overFocusLabel = false;
  let draggingNode = false;
  let draggingCamera = false;
  let cancelGesture = (): void => {};
  let hideActionsTimer = 0;
  let primaryAction: HTMLButtonElement | null = null;
  let centreAction: HTMLButtonElement | null = null;
  let moreAction: HTMLButtonElement | null = null;
  let pausedAt = 0;
  let subjectAnchor: { x: number; y: number } | null = null;
  let simulationRunning = true;
  let ready = false;
  let framedDirectoryScope = "";
  let frameDirectory = (): void => {};
  const readyWaiters: Array<() => void> = [];
  const linkKey = (link: { kind: string; source: string | { id: string }; target: string | { id: string } }): string =>
    `${link.kind}|${resolveLinkEndpoint(link.source)}|${resolveLinkEndpoint(link.target)}`;

  /** Today's file, by its id, as it stands at the moment shown; today's id when today is shown. */
  const fileAt = (id: string): string | undefined => (moment ? moment.fileAt(id) : id);
  /** Today's directory as it stands at the moment shown. */
  const directoryAt = (directory: string): string => (moment ? moment.directoryAt(directory) : directory);

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

  /** One application-owned pointer target, coalesced with the existing frame loop as the picture changes. */
  function updatePointerHover(): void {
    if (!forceGraphInstance || !pointerPosition || draggingNode || draggingCamera) return;
    const canvas = forceGraphInstance.renderer().domElement;
    const frame = canvas.getBoundingClientRect();
    const camera = forceGraphInstance.camera();
    camera.updateMatrixWorld();
    const pointed = document.elementFromPoint(pointerPosition.x, pointerPosition.y);
    const onCanvas = pointed === canvas;
    if (onCanvas) {
      const unchanged = pickedFrame && pickedFrame.left === frame.left && pickedFrame.top === frame.top
        && pickedFrame.width === frame.width && pickedFrame.height === frame.height
        && camera.matrixWorld.elements.every((value, index) => value === pickedCamera[index])
        && camera.projectionMatrix.elements.every((value, index) => value === pickedProjection[index]);
      if (!pointerPickNeeded && !simulationRunning && unchanged) return;
    }
    pointerPickNeeded = false;
    pickedFrame = onCanvas ? frame : null;
    pickedCamera = camera.matrixWorld.elements.slice();
    pickedProjection = camera.projectionMatrix.elements.slice();
    const id = onCanvas ? nodeAt(pointerPosition.x, pointerPosition.y) ?? null
      : pointed && actionStrip?.contains(pointed) ? actionTargetId
      : pointed === focusLabel ? focusedId : null;
    const container = requireElement("graph-svg");
    const hovered = String(!!id);
    if (container.dataset.hoveredNode !== hovered) container.dataset.hoveredNode = hovered;
    if (pointerHoverId === id) return;
    pointerHoverId = id;
    if (id) {
      window.clearTimeout(hideActionsTimer);
      hoveredId = id;
      updateAttention();
      refreshActionStrip();
    } else {
      deferHoverExit();
    }
  }

  function releasePointerHover(): void {
    pointerPosition = null;
    pointerHoverId = null;
    pointerPickNeeded = false;
    pickedFrame = null;
    hoveredId = menuTargetId ?? keyboardActionTarget();
    requireElement("graph-svg").dataset.hoveredNode = "false";
    updateAttention();
    refreshActionStrip();
  }

  function getSubjectAnchor(nodeId: string): { x: number; y: number } | null {
    const node = nodeCache.get(fileAt(nodeId) ?? nodeId);
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

  function placeSubjectAnchor(todayId: string, anchor: { x: number; y: number }): void {
    if (!forceGraphInstance) return;
    const nodeId = fileAt(todayId) ?? todayId;
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
    explicitDirectoryFocus = false;
    if (focusLabel) {
      focusLabel.textContent = node.name;
      focusLabel.dataset.nodeId = nodeId;
      focusLabel.title = focusedDirectory !== null ? `Inspect ${focusedDirectory || "Scan root"}` : `${node.codeRelativePath} — Show details`;
    }
    // Track a still-running simulation without introducing a second camera flight.
    if (focusLabel) { focusLabel.style.left = `${anchor.x - rect.left}px`; focusLabel.style.top = `${anchor.y - rect.top}px`; }
  }

  function setActive(value: boolean): void {
    if (value && !active && focusMotion && pausedAt) focusMotion.started += performance.now() - pausedAt;
    if (!value && active) {
      pausedAt = performance.now();
      zoomMotion = null;
      cancelGesture();
    }
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
    updatePointerHover();
    animation = requestAnimationFrame(animateFocus);
  }

  function updateFocus(now: number, advanceCamera = true): void {
    if (!active || !forceGraphInstance) return;
    if (syncInspectionAction() || (inspectedActionId && !actionTargetId)) refreshActionStrip();
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
        // A panel or a control standing over the picture (the history's step panel, its scrubber, the tray) covers the
        // point: the label is put away rather than written on their words.
        const frame = forceGraphInstance.renderer().domElement.getBoundingClientRect();
        const over = document.elementFromPoint(frame.left + screen.x, frame.top + screen.y);
        const covered = !!over && over !== focusLabel && !over.closest("#graph-svg");
        focusLabel.hidden = covered || depth < -1 || depth > 1 || screen.x < 0 || screen.y < 0 || screen.x > forceGraphInstance.width() || screen.y > forceGraphInstance.height();
        focusLabel.style.left = `${screen.x}px`;
        focusLabel.style.top = `${screen.y}px`;
      }
    } else if (focusLabel) {
      focusLabel.hidden = true;
    }
    positionActionStrip();
  }

  function focusSelection(force = false): void {
    const node = state.selectedNode;
    if (!force && (node?.id ?? null) === selectedId) return;
    selectedId = node?.id ?? null;
    inspectedActionId = null;
    focusedDirectory = null;
    explicitDirectoryFocus = false;
    focusedId = node ? fileAt(node.id) ?? null : null;
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

  /** A restored inspection offers the same actions without steering the selected subject's camera. */
  function syncInspectionAction(): boolean {
    const key = JSON.stringify([state.inspection, state.selectedNode?.id ?? null, state.spatialLayout, moment?.step ?? null]);
    if (key === seenInspectionKey) return false;
    seenInspectionKey = key;
    const inspection = state.inspection;
    inspectedActionId = inspection?.kind === "file" ? fileAt(inspection.nodeId) ?? null
      : inspection?.kind === "directory" && state.spatialLayout === "structure"
        ? directoryNodeId(directoryAt(inspection.directory)) : null;
    return true;
  }

  function focusDirectory(directory: string): void {
    focusedDirectory = directory;
    explicitDirectoryFocus = true;
    focusedId = state.spatialLayout === "structure" ? directoryNodeId(directoryAt(directory)) : null;
    following = false;
    subjectAnchor = null;
    zoomMotion = null;
    focusMotion = null;
    if (focusLabel) {
      focusLabel.textContent = directory.split("/").pop() || "Scan root";
      focusLabel.title = `Inspect ${directory || "Scan root"}`;
      focusLabel.dataset.nodeId = focusedId ?? "";
      focusLabel.hidden = true;
    }
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 500;
    frameDirectories([directoryAt(directory)], duration);
    updateAttention();
  }

  /** A tray request moves the camera by an explicit action, without making its file the map subject. */
  function focusNode(todayId: string): void {
    const id = fileAt(todayId);
    const node = id ? nodeCache.get(id) : undefined;
    if (!id || !node || node.directoryPath !== undefined) return;
    focusedDirectory = null;
    explicitDirectoryFocus = false;
    focusedId = id;
    following = true;
    subjectAnchor = null;
    zoomMotion = null;
    focusMotion = null;
    if (focusLabel) {
      focusLabel.textContent = node.name;
      focusLabel.title = `${node.codeRelativePath} — Show details`;
      focusLabel.dataset.nodeId = id;
      focusLabel.hidden = true;
    }
    if (active && !animation) animation = requestAnimationFrame(animateFocus);
  }

  /** A historical sphere can act only on the file or directory still present today. */
  function currentAction(id: string): { kind: "file"; node: ExplorerNodePayload } | { kind: "directory"; directory: string } | null {
    const rendered = nodeCache.get(id);
    if (!rendered || !nodeObjects.has(id)) return null;
    if (rendered.directoryPath !== undefined) {
      const today = moment ? moment.directoryToday(rendered.directoryPath) : rendered.directoryPath;
      return graphData.nodes.some(node => under(node.id, today)) ? { kind: "directory", directory: today } : null;
    }
    if (id.startsWith("related:")) return null;
    const todayId = moment ? moment.fileToday(id) : id;
    const node = todayId ? nodesById.get(todayId) : undefined;
    return node ? { kind: "file", node } : null;
  }

  function showActions(id: string, point: { x: number; y: number }): void {
    const action = currentAction(id);
    if (!action) return;
    const epoch = ++menuEpoch;
    menuTargetId = id;
    refreshActionStrip();
    const onClose = (): void => {
      if (epoch !== menuEpoch) return;
      menuTargetId = null;
      refreshActionStrip();
      deferHoverExit();
    };
    if (action.kind === "file") options.onShowNodeActions(action.node, undefined, point, onClose);
    else options.onShowDirectoryActions(action.directory, point, onClose);
  }

  /** Keyboard navigation previews its named target; mouse-created focus only keeps the controls reachable. */
  function keyboardActionTarget(): string | null {
    const focused = document.activeElement;
    if (!(focused instanceof HTMLElement) || !focused.matches(":focus-visible")) return null;
    if (actionStrip?.contains(focused)) return actionTargetId;
    return focused === focusLabel ? focusedId : null;
  }

  function focusActions(): void {
    refreshActionStrip();
    const target = keyboardActionTarget();
    if (target) {
      hoveredId = target;
      updateAttention();
    }
  }

  /** Keep the accessible controls with the sphere while the simulation or camera moves. */
  function positionActionStrip(): void {
    if (!actionStrip || !actionTargetId || !forceGraphInstance) return;
    if (draggingNode || draggingCamera) { actionStrip.hidden = true; return; }
    // A settling sphere must not pull a control away from a person aiming at it or using the keyboard.
    if (!actionStrip.hidden && (menuTargetId || pointerOverActions || actionStrip.contains(document.activeElement))) return;
    const node = nodeCache.get(actionTargetId);
    if (!node || !Number.isFinite(node.x) || !Number.isFinite(node.y) || !Number.isFinite(node.z)) {
      actionStrip.hidden = true;
      return;
    }
    const instance = forceGraphInstance;
    const camera = instance.camera();
    camera.lookAt((instance.controls() as { target: Vector3 }).target);
    camera.updateMatrixWorld();
    const point = new Vector3(node.x, node.y, node.z);
    const depth = point.clone().project(camera).z;
    const screen = instance.graph2ScreenCoords(point.x, point.y, point.z);
    if (depth < -1 || depth > 1 || screen.x < 0 || screen.y < 0 || screen.x > instance.width() || screen.y > instance.height()) {
      actionStrip.hidden = true;
      return;
    }
    actionStrip.hidden = false;
    const worldRadius = spatialNodeRadius(node, state.tuning.forceGraph);
    const edge = point.clone().add(new Vector3(worldRadius, 0, 0).applyQuaternion(camera.quaternion));
    const rim = instance.graph2ScreenCoords(edge.x, edge.y, edge.z);
    const radius = Math.abs(rim.x - screen.x);
    const width = actionStrip.offsetWidth;
    const height = actionStrip.offsetHeight;
    const x = Math.max(width / 2 + 8, Math.min(instance.width() - width / 2 - 8, screen.x));
    const above = screen.y - Math.max(8, radius * 0.7) - height;
    const below = screen.y + Math.max(8, radius * 0.7);
    actionStrip.style.left = `${x}px`;
    actionStrip.style.top = `${Math.max(8, Math.min(instance.height() - height - 8, above >= 8 ? above : below))}px`;
  }

  /** An inspection persists as a named target; a hover is only a temporary offer of actions. */
  function refreshActionStrip(): void {
    if (!actionStrip || !primaryAction || !centreAction || !moreAction) return;
    if (draggingNode || draggingCamera) { actionStrip.hidden = true; return; }
    const held = pointerOverActions || actionStrip.contains(document.activeElement);
    const id = menuTargetId ?? (held ? actionTargetId : keyboardActionTarget() ?? pointerHoverId ?? inspectedActionId ?? (overFocusLabel || document.activeElement === focusLabel ? focusedId : null));
    const action = id ? currentAction(id) : null;
    if (!id || !action) {
      actionStrip.hidden = true;
      actionTargetId = null;
      return;
    }
    actionTargetId = id;
    actionStrip.hidden = false;
    primaryAction.dataset.kind = action.kind;
    if (action.kind === "directory") {
      // Open and Close as the 2D label offers them, by the directory's state.
      const opened = state.openDirectories?.has(action.directory) ?? false;
      actionStrip.setAttribute("aria-label", `Actions for ${action.directory || "Scan root"}`);
      primaryAction.setAttribute("aria-label", `${opened ? "Close" : "Open"} ${action.directory || "Scan root"}`);
      primaryAction.setAttribute("aria-pressed", String(opened));
      primaryAction.title = opened ? "Close this directory; what other pins need stays" : "Open this directory on the map";
      centreAction.setAttribute("aria-label", `Centre on ${action.directory || "Scan root"}`);
      centreAction.title = "Centre the map on this directory";
      moreAction.setAttribute("aria-label", `More actions for ${action.directory || "Scan root"}`);
    } else {
      const pinned = (state.pins ?? EMPTY_PIN_SET).entries.some(pin => pin.nodeId === action.node.id && pin.symbol === "*");
      actionStrip.setAttribute("aria-label", `Actions for ${action.node.name}`);
      primaryAction.setAttribute("aria-label", `${pinned ? "Unpin" : "Pin"} ${action.node.name}`);
      primaryAction.setAttribute("aria-pressed", String(pinned));
      primaryAction.title = pinned ? "Unpin this file" : "Pin this file and its connections";
      centreAction.setAttribute("aria-label", `Centre on ${action.node.name}`);
      centreAction.title = "Make this file the subject";
      moreAction.setAttribute("aria-label", `More actions for ${action.node.name}`);
    }
    moreAction.title = moreAction.getAttribute("aria-label")!;
    actionStrip.dataset.nodeId = id;
    positionActionStrip();
  }

  /** A short exit grace lets a pointer cross from a sphere to its controls without losing them. */
  function deferHoverExit(): void {
    window.clearTimeout(hideActionsTimer);
    hideActionsTimer = window.setTimeout(() => {
      if (pointerHoverId || pointerOverActions || overFocusLabel) return;
      hoveredId = menuTargetId ?? keyboardActionTarget();
      updateAttention();
      refreshActionStrip();
    }, 180);
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
    pointerPickNeeded = true;
    // A moment of the history re-keys the caches through its renames before anything is read from them, so that a
    // renamed file or hub keeps its sphere, its lines and its place under the new id; the hovered and focused ids follow.
    if (hasRenames(pendingRenames)) {
      const moved = rekeyedCaches(nodeCache, linkCache, pendingRenames, linkKey);
      nodeCache.clear();
      for (const [id, node] of moved.nodes) nodeCache.set(id, node);
      linkCache.clear();
      for (const [key, link] of moved.links) linkCache.set(key, link);
      const objects = [...nodeObjects];
      nodeObjects.clear();
      for (const [id, object] of objects) nodeObjects.set(renamedId(id, pendingRenames), object);
      if (hoveredId) hoveredId = renamedId(hoveredId, pendingRenames);
      if (pointerHoverId) pointerHoverId = renamedId(pointerHoverId, pendingRenames);
      if (actionTargetId) actionTargetId = renamedId(actionTargetId, pendingRenames);
      if (menuTargetId) menuTargetId = renamedId(menuTargetId, pendingRenames);
      if (inspectedActionId) inspectedActionId = renamedId(inspectedActionId, pendingRenames);
      if (focusedId) focusedId = renamedId(focusedId, pendingRenames);
    }
    pendingRenames = NO_RENAMES;
    const energy = pendingEnergy;
    pendingEnergy = undefined;
    // The data: the moment's snapshot, or today's docs; today's pins, subject, path and open directories are read where
    // they stand at the moment, and a pin that does not stand there retains nothing.
    const source = moment?.graph ?? graphData;
    const todayPins = state.pins ?? EMPTY_PIN_SET;
    const pins: PinSet = moment
      ? { entries: todayPins.entries.flatMap(pin => { const at = fileAt(pin.nodeId); return at ? [{ ...pin, nodeId: at }] : []; }) }
      : todayPins;
    const subject = state.selectedNode;
    const subjectAt = subject ? fileAt(subject.id) ?? null : null;
    const selectedAt = state.selectedNode ? fileAt(state.selectedNode.id) ?? null : null;
    const path = options.getPath?.()?.flatMap(id => { const at = fileAt(id); return at ? [at] : []; });
    const directories = [...(state.openDirectories ?? [])].map(directoryAt).sort();
    const directoryScope = directories.length && !state.selectedNode && !path?.length ? JSON.stringify(directories) : "";
    container.dataset.directoryScope = directoryScope;
    container.dataset.historyStep = moment ? String(moment.step) : "";

    const includeNode = (node: ExplorerNodePayload): boolean => {
      if (path?.includes(node.id) || subjectAt === node.id || pins.entries.some(pin => pin.nodeId === node.id)) {
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

    const filteredNodes = source.nodes.filter(includeNode);
    // A moment's Related Docs are the links its files' authored words made then, which the history carries since
    // 2026-10-20 (before, a moment drew none); today's are the bundle's, the documents the files cite and the documents
    // that cite them, each kind shown by its own filter (2026-10-22).
    const shownDocLinks = (moment ? moment.relatedDocLinks : relatedDocLinks ?? [])
      .filter(link => link.direction === "cited-by" ? state.filters.showCitingDocs : state.filters.showRelatedDocs);
    const data = spatialGraphOf(source, includeNode, shownDocLinks, state.spatialLayout);
    // The node and link objects are kept by id and by pair across every membership change: a sphere keeps its place and
    // its render object, and the library's data join, which binds a line's object to its datum, keeps the line. Before
    // 2026-10-18 every render handed the library new link objects and it rebuilt every line, 65 to 88 ms a step with 2,650
    // links in the change-over-time probe; the 2D wires keep their elements the same way.
    const graphNodes: ForceGraphNode[] = data.nodes.map(node => {
      const cached = nodeCache.get(node.id);
      if (!cached) { nodeCache.set(node.id, node); return node; }
      Object.assign(cached, node);
      // A past moment's count would otherwise stay on the object, since today's payload names its symbols instead.
      if (node.symbolCount === undefined) delete cached.symbolCount;
      return cached;
    });
    const liveNodes = new Map(graphNodes.map(node => [node.id, node]));
    const graphLinks: ForceGraphLink[] = data.links.map(link => {
      const cached = linkCache.get(linkKey(link));
      if (!cached) { linkCache.set(linkKey(link), link); return link; }
      cached.count = link.count;
      // A kept link's ends are the live objects for its ids, never an object a rename or a death left behind in the
      // cache, which D3 would keep as the end once resolved: a line to it leads nowhere (found 2026-10-18).
      cached.source = liveNodes.get(resolveLinkEndpoint(link.source)) ?? link.source;
      cached.target = liveNodes.get(resolveLinkEndpoint(link.target)) ?? link.target;
      return cached;
    });
    const dataForGraph: ForceGraphData = { nodes: graphNodes, links: graphLinks };
    const nextMembership = JSON.stringify([graphNodes.map(node => node.id), data.links.map(link => [linkKey(link), link.count])]);
    container.dataset.layoutPreset = layoutPresetOf(state.tuning);

    /** Build the field again when the forces' settings changed; unfold at full strength for a change of the forces alone, since a membership change is fed at the update energy instead. */
    const updateForces = (reheat: boolean): void => {
      const instance = forceGraphInstance!;
      const { updateEnergy, ...forces } = state.tuning.forceGraph;
      void updateEnergy; // The energy feeds the next membership change and changes no force.
      container.dataset.layoutSettings = JSON.stringify(state.tuning.forceGraph);
      const nextSettings = JSON.stringify([forces, state.spatialLayout]);
      if (forceSettings === nextSettings) return;
      const subjectId = focusedDirectory !== null
        ? state.spatialLayout === "structure" ? directoryNodeId(directoryAt(focusedDirectory)) : null
        : subjectAt;
      const anchor = subjectId ? getSubjectAnchor(subjectId) : null;
      const tuning = { ...state.tuning.forceGraph };
      const nextSize = JSON.stringify([tuning.nodeSize, tuning.symbolScale]);
      if (sizeSettings !== nextSize) {
        instance.nodeVal(node => spatialNodeValue(node, tuning)).nodeRelSize(tuning.nodeSize);
        sizeSettings = nextSize;
      }
      if (!motion) {
        // The library's own forces give way to the motion, once: its link force stays, pulling nothing, so that every
        // link's ends resolve to their spheres and its line is drawn; the charge and the centring go.
        motion = motionForce<ForceGraphNode>({
          tuning: () => state.tuning.forceGraph,
          layout: () => state.spatialLayout,
          links: () => heldLinks,
          strength: () => strength,
          onStill: () => { forceGraphInstance?.d3AlphaMin(Infinity); }
        });
        instance.d3Force("charge", null);
        instance.d3Force("center", null);
        (instance.d3Force("link") as ForceLink<ForceGraphNode, ForceGraphLink>).strength(0);
        instance.d3Force("motion", motion);
      } else motion.invalidate();
      forceSettings = nextSettings;
      container.dataset.spatialLayout = state.spatialLayout;
      if (reheat) move(1, "unfold");
      if (subjectId && anchor) placeSubjectAnchor(subjectId, anchor);
    };

    /**
     * The one update path for a membership change (a pin, a filter, a directory, a layout, a step of history): the spheres
     * carried, the new ones placed beside what holds them, and the motion eased at the update energy, held from where the
     * spheres stand, or unfolding afresh for a new layout. Only the first picture warms up.
     */
    const feed = (): void => {
      const instance = forceGraphInstance!;
      const start: MotionStart = shownLayout !== null && shownLayout !== state.spatialLayout ? "unfold" : "hold";
      shownLayout = state.spatialLayout;
      heldLinks = graphLinks;
      instance.warmupTicks(0).graphData(dataForGraph);
      move(energy ?? state.tuning.forceGraph.updateEnergy, start);
    };

    // A sphere that was in the picture keeps its place; a new one starts beside what holds it, so that the structure
    // layout folds the network into the tree from where the eye left it and a born file does not fly in from the origin.
    for (const [id, start] of placeNewSpheres(graphNodes, graphLinks, state.tuning.forceGraph, state.spatialLayout)) {
      const node = nodeCache.get(id)!;
      node.x = start.x; node.y = start.y; node.z = start.z;
    }
    const present = new Set(graphNodes.map(node => node.id));
    for (const id of nodeObjects.keys()) if (!present.has(id)) nodeObjects.delete(id);
    if (hoveredId && !present.has(hoveredId)) hoveredId = null;
    if (pointerHoverId && !present.has(pointerHoverId)) pointerHoverId = null;
    if (actionTargetId && !present.has(actionTargetId)) actionTargetId = null;
    if (menuTargetId && !present.has(menuTargetId)) menuTargetId = null;
    if (inspectedActionId && !present.has(inspectedActionId)) inspectedActionId = null;
    if (focusedDirectory !== null && !explicitDirectoryFocus && !state.openDirectories?.has(focusedDirectory)) {
      focusedDirectory = null;
      selectedId = null;
      focusedId = null;
      if (focusLabel) focusLabel.hidden = true;
    }
    if (focusedDirectory !== null) {
      const id = directoryNodeId(directoryAt(focusedDirectory));
      focusedId = state.spatialLayout === "structure" && present.has(id) ? id : null;
      if (focusLabel) {
        focusLabel.dataset.nodeId = focusedId ?? "";
        if (!focusedId) focusLabel.hidden = true;
      }
    } else if (moment) {
      // At a moment of the history the subject is followed where it stands; absent there, nothing is in focus.
      focusedId = subjectAt;
      if (focusLabel) {
        focusLabel.dataset.nodeId = focusedId ?? "";
        if (!focusedId) focusLabel.hidden = true;
      }
    }
    const retained = new Set(pins.entries.map(pin => pin.nodeId));
    for (const { link } of getVisibleConnections(pins, source.links)) {
      retained.add(resolveLinkEndpoint(link.source)); retained.add(resolveLinkEndpoint(link.target));
    }
    for (const node of filteredNodes) if (directories.some(directory => under(node.id, directory))) retained.add(node.id);
    if (selectedAt) retained.add(selectedAt);
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
        // A document's citation of a file, in the documents' violet lightened toward white, drawn from the document.
        if (link.kind === "cited-by") return `rgba(214, 178, 240, ${visible ? 0.55 : 0.06})`;
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
      const membershipChanged = nextMembership !== membership;
      membership = nextMembership;
      focusSelection();
      syncInspectionAction();
      updateAttention();
      refreshActionStrip();
      updateForces(!membershipChanged);
      if (membershipChanged) feed();
      frameDirectory();
      setActive(true);
      return;
    }

    let press: { x: number; y: number; id: string | undefined; pointerId: number; button: number; held: boolean } | null = null;
    let holdTimer = 0;
    const activePointers = new Set<number>();
    const cancelPress = (): void => { window.clearTimeout(holdTimer); press = null; };
    const interrupt = (): void => { following = false; focusMotion = null; subjectAnchor = null; zoomMotion = null; };
    cancelGesture = (): void => {
      cancelPress();
      activePointers.clear();
      draggingNode = false;
      draggingCamera = false;
      releasePointerHover();
    };
    container.dataset.hoveredNode = "false";
    // The constructor declaration erases the instance's generic data types;
    // this boundary supplies the exact node/link types passed to graphData.
    forceGraphInstance = (new ForceGraph3D(container) as unknown as ForceGraph3DInstance<ForceGraphNode, ForceGraphLink>)
      .width(container.clientWidth)
      .height(container.clientHeight)
      .graphData(dataForGraph)
      .warmupTicks(100)
      // The engine runs until the motion finds the spheres still and raises the minimum alpha past any alpha, and not
      // before: the library's fifteen seconds would cut a slow renderer's easing short.
      .d3AlphaMin(0)
      .cooldownTime(Infinity)
      // The alphas the link colours carry are the real ones; the library's default opacity of 0.2 multiplied them.
      .linkOpacity(1)
      // The simulation moves nodes immediately before painting. Track that
      // position in the same frame so the sphere and its projected label agree.
      .onEngineTick(() => { pointerPickNeeded = true; simulationRunning = true; ready = true; container.setAttribute("aria-busy", "true"); frameDirectory(); if (inspectedActionId && !actionTargetId) refreshActionStrip(); updateFocus(performance.now()); for (const resolve of readyWaiters.splice(0)) resolve(); })
      .onEngineStop(() => { simulationRunning = false; container.setAttribute("aria-busy", "false"); })
      // A hand moves the picture at full strength, whatever the last membership change was fed: held where the spheres
      // stood when it took hold, and again where they stand when it lets go.
      .onNodeDrag(() => {
        cancelPress();
        interrupt();
        if (!draggingNode) move(1, "hold");
        draggingNode = true;
        if (actionStrip) actionStrip.hidden = true;
      })
      .onNodeDragEnd(() => { draggingNode = false; pointerPickNeeded = true; refreshActionStrip(); move(1, "hold"); })
      .nodePositionUpdate((object, _position, node) => {
        if (nodeObjects.get(node.id) !== object) pointerPickNeeded = true;
        nodeObjects.set((node).id, object);
        return false; // The native renderer still owns object placement.
      })
      .nodeLabel(node => {
        const file = node;
        const symbols = symbolCountOf(file);
        const label = document.createElement("span");
        label.textContent = file.directoryPath !== undefined
          ? `${file.directoryPath || "Scan root"} · ${file.directoryFileCount} visible files`
          : file.archetype === "related-doc" ? (hasBundledDoc(file.codePath) ? file.name : `${file.name} · not in this bundle`)
          : `${file.name} · ${symbols} public ${symbols === 1 ? "symbol" : "symbols"}`;
        return label;
      })
      .linkLabel(link => link.kind === "containment" ? "Directory membership"
        : link.kind === "related-doc" ? `Cites the document: ${link.count} ${link.count === 1 ? "link" : "links"} in the file's words`
        : link.kind === "cited-by" ? `Cited by the document: ${link.count} ${link.count === 1 ? "link" : "links"} to the file`
        : `${link.count} documented ${link.count === 1 ? "reference" : "references"}`)
      .linkWidth(link => link.kind === "related-doc" || link.kind === "cited-by" ? 0.5 : 1)
      // A citation is drawn from the one who cites to the one cited, so that its direction is read off the line.
      .linkDirectionalArrowLength(link => link.kind === "related-doc" || link.kind === "cited-by" ? 4 : 0)
      .linkDirectionalArrowRelPos(1);
    updateAttention();
    heldLinks = graphLinks;
    shownLayout = state.spatialLayout;
    updateForces(true);
    membership = nextMembership;
    focusLabel = document.createElement("button");
    focusLabel.type = "button";
    focusLabel.className = "force-graph-focus";
    focusLabel.hidden = true;
    focusLabel.addEventListener("click", () => {
      if (focusedDirectory !== null) {
        options.onInspectDirectory(focusedDirectory);
        inspectedActionId = focusedId;
        refreshActionStrip();
        return;
      }
      const action = focusedId ? currentAction(focusedId) : null;
      if (action?.kind === "file") {
        onFocusNode(action.node);
        inspectedActionId = focusedId;
        refreshActionStrip();
      }
    });
    focusLabel.addEventListener("pointerenter", () => { overFocusLabel = true; window.clearTimeout(hideActionsTimer); refreshActionStrip(); });
    focusLabel.addEventListener("pointerleave", () => { overFocusLabel = false; deferHoverExit(); });
    focusLabel.addEventListener("focus", focusActions);
    focusLabel.addEventListener("blur", () => { requestAnimationFrame(refreshActionStrip); deferHoverExit(); });
    container.append(focusLabel);

    actionStrip = document.createElement("div");
    actionStrip.className = "force-graph-actions";
    actionStrip.setAttribute("role", "group");
    actionStrip.hidden = true;
    primaryAction = iconButton("Pin", `<g class="force-graph-file-action">${PIN_ICON}</g><g class="force-graph-directory-action">${DIRECTORY_ICON}</g>`);
    centreAction = iconButton("Centre", CENTRE_ICON);
    moreAction = iconButton("More actions for this file", MORE_ICON);
    moreAction.setAttribute("aria-haspopup", "menu");
    primaryAction.addEventListener("click", event => {
      event.stopPropagation();
      const action = actionTargetId ? currentAction(actionTargetId) : null;
      if (action?.kind === "directory") {
        if (state.openDirectories?.has(action.directory)) options.onCloseDirectory(action.directory);
        else options.onOpenDirectory(action.directory);
      } else if (action?.kind === "file") {
        if ((state.pins ?? EMPTY_PIN_SET).entries.some(pin => pin.nodeId === action.node.id && pin.symbol === "*")) options.onReleasePin(action.node.id);
        else options.onPressPin(action.node.id, "*");
      }
      refreshActionStrip();
    });
    centreAction.addEventListener("click", event => {
      event.stopPropagation();
      const action = actionTargetId ? currentAction(actionTargetId) : null;
      if (action?.kind === "directory") options.onCentreDirectory(action.directory);
      else if (action?.kind === "file") options.onRecenterNode(action.node);
      refreshActionStrip();
    });
    moreAction.addEventListener("click", event => {
      event.stopPropagation();
      if (!actionTargetId) return;
      const rect = moreAction!.getBoundingClientRect();
      showActions(actionTargetId, { x: rect.left + rect.width / 2, y: rect.bottom });
    });
    actionStrip.append(primaryAction, centreAction, moreAction);
    actionStrip.addEventListener("pointerenter", () => { pointerOverActions = true; window.clearTimeout(hideActionsTimer); refreshActionStrip(); });
    actionStrip.addEventListener("pointerleave", () => { pointerOverActions = false; deferHoverExit(); });
    actionStrip.addEventListener("focusin", focusActions);
    actionStrip.addEventListener("focusout", () => { requestAnimationFrame(refreshActionStrip); deferHoverExit(); });
    container.append(actionStrip);

    container.addEventListener("pointerleave", releasePointerHover);
    container.addEventListener("pointerenter", event => {
      pointerPosition = { x: event.clientX, y: event.clientY };
      pointerPickNeeded = true;
    });
    container.addEventListener("pointerdown", event => {
      if (event.target !== forceGraphInstance?.renderer().domElement) return;
      activePointers.add(event.pointerId);
      cancelPress();
      if (activePointers.size > 1) {
        draggingCamera = true;
        interrupt();
        refreshActionStrip();
        return;
      }
      press = { x: event.clientX, y: event.clientY, id: nodeAt(event.clientX, event.clientY),
        pointerId: event.pointerId, button: event.button, held: false };
      const started = press;
      if (started.button === 0 && started.id && currentAction(started.id)) {
        holdTimer = window.setTimeout(() => {
          if (press !== started || activePointers.size !== 1) return;
          started.held = true;
          showActions(started.id!, { x: started.x, y: started.y });
        }, 550);
      }
    }, true);
    container.addEventListener("pointermove", event => {
      pointerPosition = { x: event.clientX, y: event.clientY };
      pointerPickNeeded = true;
      if (press && event.pointerId === press.pointerId && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) {
        interrupt(); cancelPress(); draggingCamera = true; refreshActionStrip();
      }
      // Keep the offer while the pointer crosses the small screen-space gap above a sphere, including a slow crossing.
      if (!pointerHoverId && actionStrip && !actionStrip.hidden) {
        const box = actionStrip.getBoundingClientRect();
        if (event.clientX >= box.left - 24 && event.clientX <= box.right + 24
          && event.clientY >= box.top - 32 && event.clientY <= box.bottom + 32) deferHoverExit();
      }
    });
    // The library dispatches clicks through its throttled hover cache. Resolve
    // a press against the actual rendered node objects instead, including fast
    // clicks and touch taps that have never produced a hover frame.
    container.addEventListener("pointerup", event => {
      window.clearTimeout(holdTimer);
      if (!press || press.held || activePointers.size !== 1 || event.pointerId !== press.pointerId
        || event.button !== press.button || event.target !== forceGraphInstance?.renderer().domElement) return;
      // The sphere pressed is the one acted on: a settling layout can carry it a little way under a still pointer.
      const id = press.id;
      if (press.button === 2) {
        if (id) showActions(id, { x: event.clientX, y: event.clientY });
        return;
      }
      if (press.button !== 0) return;
      if (!id) { inspectedActionId = null; refreshActionStrip(); return; }
      // At a moment of the history a sphere is a thing of that day: a click reaches the file or directory as it stands
      // today, and a thing gone since does nothing here (the step panel says so).
      if (id.startsWith("related:")) {
        inspectedActionId = null;
        if (hasBundledDoc(id.slice("related:".length))) onShowBundledDoc(id.slice("related:".length));
      } else {
        const action = currentAction(id);
        if (action?.kind === "directory") options.onInspectDirectory(action.directory);
        else if (action?.kind === "file") onFocusNode(action.node);
        inspectedActionId = action ? id : null;
      }
      refreshActionStrip();
    });
    const finishPointer = (event: PointerEvent): void => {
      if (event.pointerType === "touch" || event.type === "pointercancel") releasePointerHover();
      if (!activePointers.delete(event.pointerId)) return;
      cancelPress();
      if (activePointers.size === 0) { draggingCamera = false; draggingNode = false; }
      refreshActionStrip();
    };
    window.addEventListener("pointerup", finishPointer);
    window.addEventListener("pointercancel", finishPointer);
    container.addEventListener("lostpointercapture", finishPointer);
    window.addEventListener("blur", cancelGesture);
    window.addEventListener("keydown", event => { if (event.key === "Escape") cancelPress(); });
    // A right press opens on release so a right drag can orbit without opening a menu first.
    container.addEventListener("contextmenu", event => {
      event.preventDefault();
      if (event.target === focusLabel && focusedId) {
        const rect = focusLabel!.getBoundingClientRect();
        showActions(focusedId, { x: rect.left + rect.width / 2, y: rect.bottom });
      }
    });
    container.addEventListener("keydown", event => {
      if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) return;
      const id = actionStrip?.contains(event.target as Node) ? actionTargetId : event.target === focusLabel ? focusedId : null;
      if (!id) return;
      event.preventDefault();
      event.stopPropagation();
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      showActions(id, { x: rect.left + rect.width / 2, y: rect.bottom });
    });
    container.addEventListener("wheel", event => {
      if (!forceGraphInstance) return;
      cancelPress();
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
      pointerPickNeeded = true;
      if (container.clientWidth && container.clientHeight) forceGraphInstance?.width(container.clientWidth).height(container.clientHeight);
    }).observe(container);
    focusSelection();
    syncInspectionAction();
    refreshActionStrip();
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

  function setMoment(next: HistoryMoment | null, renames: Renames, energy?: number): void {
    moment = next;
    pendingRenames = composedRenames(pendingRenames, renames);
    pendingEnergy = energy;
    if (active && forceGraphInstance) render();
  }

  function settle(): void {
    if (forceGraphInstance) move(state.tuning.forceGraph.updateEnergy, "hold");
  }

  /**
   * Begin a motion at this strength, held where the spheres stand or unfolding first, and run the engine until the motion
   * finds them still; at zero nothing moves and the engine stops before its next tick, since the library stops when alpha
   * is below its minimum and nothing is below infinity.
   */
  function move(at: number, start: MotionStart): void {
    const instance = forceGraphInstance;
    if (!instance || !motion) return;
    const container = requireElement("graph-svg");
    strength = at;
    if (!(at > 0)) {
      simulationRunning = false;
      container.setAttribute("aria-busy", "false");
      instance.d3AlphaMin(Infinity);
      return;
    }
    motion.wake(start);
    simulationRunning = true;
    container.setAttribute("aria-busy", "true");
    instance.d3AlphaMin(0).d3ReheatSimulation();
  }

  return { render, setActive, focusNode, focusDirectory, getSubjectAnchor, placeSubjectAnchor, captureScene, setMoment, settle, whenReady: () => ready ? Promise.resolve() : new Promise(resolve => readyWaiters.push(resolve)) };
}
