/**
 * Force Graph View
 *
 * Renders the 3D force-directed graph view for the Live Docs Explorer using
 * direct instance buffers. Supports Related Documentation overlay nodes when enabled.
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

import { forceSimulation } from "d3-force-3d";
import { Matrix4, PerspectiveCamera, Vector3 } from "three";

import { spatialNodeStyle } from "./forceGraphAppearance";
import { focusedCameraPosition, frameCameraSpheres, screenAnchorTranslation, wheelZoomCamera, type CameraPoint } from "./forceGraphCamera";
import { directoryNodeId, labelNamesOf, spatialGraphOf, type SpatialGraphNode, type SpatialLinkKind } from "./forceGraphData";
import { placeSpatialLabels, type SpatialLabel, type LabelBox } from "./forceGraphLabels";
import { SpatialRenderer } from "./forceGraphRenderer";
import { nextRevealCount, REVEAL, revealOrder } from "./forceGraphReveal";
import { spatialSizeScale } from "./forceGraphSizing";
import { layoutPresetOf } from "../layout-presets";
import { linkPulls, motionForce, placeNewSpheres, spatialNodeRadius, symbolCountOf, type MotionForce, type MotionStart } from "./forceGraphLayout";
import { under } from "./localView/directory-state";
import type { ForceScene } from "./perspectiveTransition";
import { getVisibleConnections, EMPTY_PIN_SET, type PinSet } from "./pin-state";
import type { RelatedDocLink } from "../../shared/staticExplorerData";
import type {
  ExplorerGraphPayload,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../shared/types";
import { requireElement } from "../dom";
import { wheelPixels } from "./wheel";
import type { HistoryMoment } from "../history/moment";
import { composedRenames, hasRenames, NO_RENAMES, rekeyedCaches, renamedId, type Renames } from "../history/rekey";
import { CENTRE_ICON, DIRECTORY_ICON, iconButton, MORE_ICON, PIN_ICON } from "../panels/icon-button";
import { renderSpatialLegend } from "../panels/spatial-legend";
import type { ExplorerState } from "../types";

/**
 * Target milliseconds for the physics part of a frame once the first picture is on screen. A tick that needs more is
 * taken in parts across frames. Drawing and input have their own costs: this target alone is not a frame-time guarantee.
 */
const FRAME_BUDGET = 10;

// ─────────────────────────────────────────────────────────────────────────
// Force Graph Types
// ─────────────────────────────────────────────────────────────────────────

/** A link in the Force Graph between two nodes. */
export interface ForceGraphLink {
  source: string | ForceGraphNode;
  target: string | ForceGraphNode;
  kind: SpatialLinkKind;
  count: number;
  /** The references in which the source uses the target, and those in which the target uses the source. */
  forward: number;
  backward: number;
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
  /** The drawn path's files as the picture shown names them: a moment's names while a moment is shown, asked over its wires (2026-10-30). */
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
  /** Fit the current path or retained scope without changing the exploration. */
  fit(): void;
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

  let forceGraphInstance: SpatialRenderer<ForceGraphNode, ForceGraphLink> | null = null;
  const simulation = forceSimulation<ForceGraphNode>([], 3).stop();
  const nodeCache = new Map<string, ForceGraphNode>();
  const linkCache = new Map<string, ForceGraphLink>();
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
  let membership = "";
  let forceSettings = "";
  let sizeSettings = "";
  let wireWidth: number | undefined;
  let pictureRevision = 0;
  let motionRevision = 0;
  let placedNames = "";
  let attentionSettings = "";
  let focusedId: string | null = null;
  let selectedId: string | null = null;
  let focusedDirectory: string | null = null;
  let explicitDirectoryFocus = false;
  let hoveredId: string | null = null;
  let updateAttention = (): void => {};
  let active = false;
  let animation = 0;
  let focusMotion: { started: number; camera: CameraPoint; target: CameraPoint } | null = null;
  let following = false;
  let framedPicture = "";
  let fittingScope = false;
  let retainedScope = new Set<string>();
  let pathScope: readonly string[] = [];
  let zoomMotion: { started: number; from: CameraPoint; fromTarget: CameraPoint; to: CameraPoint; toTarget: CameraPoint } | null = null;
  let focusLabel: HTMLButtonElement | null = null;
  const nameLabels = new Map<string, HTMLButtonElement>();
  let labelSides = new Map<string, number>();
  let labelSizes = new WeakMap<HTMLButtonElement, { width: number; height: number; text: string }>();
  let labelPriorities = new Map<string, number>();
  let labelNames = new Map<string, string>();
  /** The reveal of the picture (2026-10-28): the order its spheres enter in, the live objects and wires of the whole, and how many have entered. */
  let reveal: { order: string[]; nodes: Map<string, ForceGraphNode>; links: ForceGraphLink[]; shown: number } = { order: [], nodes: new Map(), links: [], shown: 0 };
  // Grow only after the current piece has been drawn. Each piece receives a physics call and a visible frame.
  let spheresOnScreen = 0;
  let scopedNames = false;
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
  function pictureChanged(): void {
    pictureRevision++;
    pointerPickNeeded = true;
  }

  /** Pick the actual uploaded sphere, including a press with no preceding hover frame. */
  function nodeAt(clientX: number, clientY: number): string | undefined {
    return forceGraphInstance?.nodeAt(clientX, clientY)?.id;
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
      if (!pointerPickNeeded && unchanged) return;
    }
    pointerPickNeeded = false;
    pickedFrame = onCanvas ? frame : null;
    pickedCamera = camera.matrixWorld.elements.slice();
    pickedProjection = camera.projectionMatrix.elements.slice();
    const id = onCanvas ? nodeAt(pointerPosition.x, pointerPosition.y) ?? null
      : pointed && actionStrip?.contains(pointed) ? actionTargetId
      : pointed instanceof HTMLElement && pointed.matches(".force-graph-focus, .force-graph-label") ? pointed.dataset.nodeId ?? null : null;
    if (onCanvas && !id) forceGraphInstance.showWireAt(pointerPosition.x, pointerPosition.y);
    else forceGraphInstance.hideWire();
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
    forceGraphInstance?.hideWire();
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
    forceGraphInstance?.setActive(value);
    if (value) {
      if (!animation && forceGraphInstance) animation = requestAnimationFrame(animateFocus);
    } else {
      cancelAnimationFrame(animation);
      animation = 0;
    }
  }

  function animateFocus(): void {
    animation = 0;
    const instance = forceGraphInstance;
    if (!active || !instance) return;
    if (simulationRunning && motion) {
      simulation.tick();
      if (motion.revision !== motionRevision) { motionRevision = motion.revision; pictureChanged(); }
    }
    ready = true;
    requireElement("graph-svg").setAttribute("aria-busy", String(simulationRunning));
    frameDirectory();
    instance.updateControls();
    updateFocus(performance.now());
    instance.draw(pictureRevision);
    updatePointerHover();
    spheresOnScreen = instance.graphData().nodes.length;
    grow();
    for (const resolve of readyWaiters.splice(0)) resolve();
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
    const framingKey = following ? JSON.stringify([pictureRevision, focusedId, focusedDirectory, fittingScope,
      pathScope, [...retainedScope], state.tuning.forceGraph.nodeZoomResistance, forceGraphInstance.width(), forceGraphInstance.height(),
      forceGraphInstance.camera().matrixWorld.elements.map(Math.fround)]) : "";
    if (following && advanceCamera && (framingKey !== framedPicture || !focusMotion || now - focusMotion.started < 650)) {
      framedPicture = framingKey;
      const instance = forceGraphInstance;
      const camera = instance.camera();
      const controls = instance.controls() as { target: Vector3 };
      camera.lookAt(controls.target);
      camera.updateMatrixWorld();
      const subject = focusedId ? nodeCache.get(focusedId) : undefined;
      const ids = pathScope.length || retainedScope.size || focusedId || focusedDirectory !== null ? framingIds() : null;
      const point = new Vector3();
      const spheres = instance.graphData().nodes.filter(node => (!ids || ids.has(node.id)) && Number.isFinite(node.x))
        .map(node => ({ center: { x: node.x!, y: node.y!, z: node.z! }, radius: spatialNodeRadius(node, state.tuning.forceGraph)
          * spatialSizeScale(point.set(node.x!, node.y!, node.z), camera, instance.height(), state.tuning.forceGraph.nodeZoomResistance) }));
      const centered = !fittingScope && focusedDirectory === null && subject && Number.isFinite(subject.x)
        ? { x: subject.x!, y: subject.y!, z: subject.z! } : undefined;
      const framing = camera instanceof PerspectiveCamera
        ? frameCameraSpheres(camera, spheres, { width: instance.width(), height: instance.height() }, 100, centered) : null;
      if (framing) {
        if (!focusMotion) focusMotion = { started: now, camera: { ...instance.cameraPosition() },
          target: { x: controls.target.x, y: controls.target.y, z: controls.target.z } };
        const motion = focusMotion;
        const t = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : Math.min(1, (now - motion.started) / 650);
        const k = 1 - Math.pow(1 - t, 3);
        const mix = (a: CameraPoint, b: CameraPoint): CameraPoint => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k });
        instance.cameraPosition(mix(motion.camera, framing.camera), mix(motion.target, framing.target));
        if (t === 1 && !simulationRunning) following = false;
      }
    }
    const node = focusedId ? nodeCache.get(focusedId) : undefined;
    if (node && Number.isFinite(node.x) && Number.isFinite(node.y) && Number.isFinite(node.z)) {
      const point = node as ForceGraphNode & CameraPoint;
      const camera = forceGraphInstance.camera();
      camera.lookAt((forceGraphInstance.controls() as { target: Vector3 }).target);
      camera.updateMatrixWorld();
      if (subjectAnchor && advanceCamera) alignSubject(point);
    }
    positionActionStrip();
    positionNames();
  }

  /** Project the names at reading size, placing the important identities before contextual names. */
  function positionNames(): void {
    const instance = forceGraphInstance;
    if (!instance || !focusLabel) return;
    const container = requireElement("graph-svg");
    const frame = container.getBoundingClientRect();
    const camera = instance.camera();
    camera.lookAt((instance.controls() as { target: Vector3 }).target);
    camera.updateMatrixWorld();
    const obstacles: LabelBox[] = [];
    for (const element of document.querySelectorAll<HTMLElement>(".perspective-controls, .pin-tray, .pin-tray-toggle, #detail-panel.visible, .history-scrubber, .history-step-panel, .force-graph-actions")) {
      const box = element.getBoundingClientRect();
      if (box.width && box.height && getComputedStyle(element).visibility !== "hidden") obstacles.push({ x: box.left - frame.left, y: box.top - frame.top, width: box.width, height: box.height });
    }
    const nameState = JSON.stringify([pictureRevision, focusedId, hoveredId, inspectedActionId, scopedNames,
      state.tuning.forceGraph.nodeZoomResistance, frame.x, frame.y, frame.width, frame.height,
      camera.matrixWorld.elements.map(Math.fround), camera.projectionMatrix.elements.map(Math.fround), obstacles]);
    if (nameState === placedNames) return;
    placedNames = nameState;
    const candidates: SpatialLabel[] = [];
    const buttons = new Map<string, HTMLButtonElement>();
    const neighbours = focusedId ? framingIds() : null;
    const projection = new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    const point = new Vector3(), projected = new Vector3(), edge = new Vector3();
    const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    for (const node of instance.graphData().nodes) {
      if (!Number.isFinite(node.x)) continue;
      point.set(node.x!, node.y!, node.z);
      projected.copy(point).applyMatrix4(projection);
      const x = (projected.x + 1) * frame.width / 2, y = (1 - projected.y) * frame.height / 2;
      if (projected.z < -1 || projected.z > 1 || x < 0 || y < 0 || x > frame.width || y > frame.height) continue;
      edge.copy(point).addScaledVector(right, spatialNodeRadius(node, state.tuning.forceGraph)).applyMatrix4(projection);
      const perspectiveRadius = Math.abs(edge.x - projected.x) * frame.width / 2;
      const basePriority = labelPriorities.get(node.id) ?? 5;
      const priority = node.id === focusedId ? 0 : node.id === hoveredId || node.id === inspectedActionId ? 1
        : neighbours?.has(node.id) ? Math.min(3, basePriority) : basePriority;
      // Disclosure still follows proximity; resistance changes the sphere's outline, not when names become useful.
      if (priority >= 5 && perspectiveRadius < (scopedNames ? 14 : 6)) continue;
      if (scopedNames && priority === 4 && perspectiveRadius < 9) continue;
      const radius = perspectiveRadius * spatialSizeScale(point, camera, frame.height, state.tuning.forceGraph.nodeZoomResistance);
      let label = node.id === focusedId ? focusLabel : nameLabels.get(node.id);
      if (!label) {
        label = document.createElement("button");
        label.type = "button";
        label.className = "force-graph-label";
        label.dataset.nodeId = node.id;
        label.addEventListener("click", () => {
          const id = label!.dataset.nodeId!;
          if (id.startsWith("related:")) {
            if (hasBundledDoc(id.slice(8))) onShowBundledDoc(id.slice(8));
          } else {
            const action = currentAction(id);
            if (action?.kind === "directory") options.onInspectDirectory(action.directory);
            else if (action?.kind === "file") onFocusNode(action.node);
            inspectedActionId = action ? id : null;
          }
          refreshActionStrip();
        });
        label.addEventListener("pointerenter", () => { overFocusLabel = true; window.clearTimeout(hideActionsTimer); });
        label.addEventListener("pointerleave", () => { overFocusLabel = false; deferHoverExit(); });
        label.addEventListener("focus", focusActions);
        label.addEventListener("blur", () => { requestAnimationFrame(refreshActionStrip); deferHoverExit(); });
        container.append(label);
        nameLabels.set(node.id, label);
      }
      const name = labelNames.get(node.id) ?? node.name;
      if (label.textContent !== name) { label.textContent = name; labelSizes.delete(label); }
      const count = symbolCountOf(node);
      const title = node.directoryPath !== undefined ? `${node.directoryPath || "Scan root"} · ${node.directoryFileCount} visible files`
        : node.id.startsWith("related:") ? `${node.codeRelativePath}${hasBundledDoc(node.id.slice(8)) ? "" : " · not in this bundle"}`
        : `${node.codeRelativePath} · ${count} public ${count === 1 ? "symbol" : "symbols"}`;
      if (label.title !== title) label.title = title;
      label.dataset.nodeId = node.id;
      label.dataset.kind = node.directoryPath !== undefined ? "directory" : "file";
      label.dataset.priority = String(priority);
      label.dataset.context = String(scopedNames && priority >= 4);
      let size = labelSizes.get(label);
      if (!size || size.text !== name) {
        label.hidden = false;
        size = { width: label.offsetWidth, height: label.offsetHeight, text: name };
        labelSizes.set(label, size);
      }
      candidates.push({ id: node.id, x, y, radius, priority, ...size });
      buttons.set(node.id, label);
    }
    const placements = placeSpatialLabels(candidates, { width: frame.width, height: frame.height }, obstacles, labelSides);
    labelSides = new Map([...placements].map(([id, box]) => [id, box.side]));
    for (const label of [focusLabel, ...nameLabels.values()]) {
      const id = label.dataset.nodeId ?? "";
      label.hidden = buttons.get(id) !== label || !placements.has(id);
    }
    for (const item of candidates) {
      const box = placements.get(item.id);
      if (!box) continue;
      const label = buttons.get(item.id)!;
      label.hidden = false;
      if (label === focusLabel) {
        label.style.left = `${item.x}px`;
        label.style.top = `${item.y}px`;
        label.style.transform = `translate(${box.x - item.x}px, ${box.y - item.y}px)`;
      } else {
        label.style.transform = `translate(${box.x}px, ${box.y}px)`;
      }
    }
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
    fittingScope = false;
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
    fittingScope = false;
    following = true;
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
    fittingScope = false;
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
    if (!rendered || !forceGraphInstance?.hasNode(id)) return null;
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
    return focused.matches(".force-graph-focus, .force-graph-label") ? focused.dataset.nodeId ?? null : null;
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
    const worldRadius = spatialNodeRadius(node, state.tuning.forceGraph) * spatialSizeScale(point, camera, instance.height(), state.tuning.forceGraph.nodeZoomResistance);
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

  /** The requested file's immediate neighbourhood, or the explicit recovery scope. */
  function framingIds(): Set<string> {
    const data = forceGraphInstance?.graphData();
    if (!data) return new Set();
    if (pathScope.length) return new Set(pathScope);
    if (fittingScope && retainedScope.size) return retainedScope;
    if (focusedDirectory !== null) return new Set(data.nodes.filter(node =>
      under(node.directoryPath ?? node.codeRelativePath, directoryAt(focusedDirectory!))).map(node => node.id));
    if (focusedId) {
      const ids = new Set([focusedId]);
      for (const link of data.links) {
        const a = resolveLinkEndpoint(link.source), b = resolveLinkEndpoint(link.target);
        if (a === focusedId || b === focusedId) { ids.add(a); ids.add(b); }
      }
      return ids;
    }
    return new Set(data.nodes.map(node => node.id));
  }

  function fit(): void {
    fittingScope = true;
    following = true;
    focusMotion = null;
    subjectAnchor = null;
    zoomMotion = null;
  }

  function render(): void {
    const container = requireElement<HTMLDivElement>("graph-svg");
    placedNames = "";
    pointerPickNeeded = true;
    // A moment of the history re-keys the caches through its renames before anything is read from them, so that a
    // renamed file or hub keeps its sphere, its lines and its place under the new id; the hovered and focused ids follow.
    if (hasRenames(pendingRenames)) {
      const moved = rekeyedCaches(nodeCache, linkCache, pendingRenames, linkKey);
      nodeCache.clear();
      for (const [id, node] of moved.nodes) nodeCache.set(id, node);
      linkCache.clear();
      for (const [key, link] of moved.links) linkCache.set(key, link);
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
    // The data: the moment's snapshot, or today's docs; today's pins, subject and open directories are read where they
    // stand at the moment, and a pin that does not stand there retains nothing. The path is already the moment's.
    const source = moment?.graph ?? graphData;
    const todayPins = state.pins ?? EMPTY_PIN_SET;
    const pins: PinSet = moment
      ? { entries: todayPins.entries.flatMap(pin => { const at = fileAt(pin.nodeId); return at ? [{ ...pin, nodeId: at }] : []; }) }
      : todayPins;
    const subject = state.selectedNode;
    const subjectAt = subject ? fileAt(subject.id) ?? null : null;
    const selectedAt = state.selectedNode ? fileAt(state.selectedNode.id) ?? null : null;
    const path = options.getPath?.();
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
    // Keep node data by id and link data by pair across membership changes. Positions and stable instance bindings
    // follow those data objects, including through historical renames; the 2D wires keep their elements the same way.
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
      cached.count = link.count; cached.forward = link.forward; cached.backward = link.backward;
      // A kept link's ends are the live objects for its ids, never an object a rename or a death left behind in the
      // cache, which D3 would keep as the end once resolved: a line to it leads nowhere (found 2026-10-18).
      cached.source = liveNodes.get(resolveLinkEndpoint(link.source)) ?? link.source;
      cached.target = liveNodes.get(resolveLinkEndpoint(link.target)) ?? link.target;
      return cached;
    });
    // A history step may change only a file's exposed surface. Its physical size belongs to the field's
    // input too, even when every node and wire keeps its identity.
    const nextMembership = JSON.stringify([graphNodes.map(node => [node.id, symbolCountOf(node), node.containedSymbolCounts]),
      data.links.map(link => [linkKey(link), link.count])]);
    const membershipChanged = nextMembership !== membership;
    container.dataset.layoutPreset = layoutPresetOf(state.tuning);

    /** Build the field again when the forces' settings changed; unfold at full strength for a change of the forces alone, since a membership change is fed at the update energy instead. */
    const updateForces = (reheat: boolean): void => {
      const instance = forceGraphInstance!;
      const { updateEnergy, linkWidth, nodeZoomResistance, wireZoomResistance, ...forces } = state.tuning.forceGraph;
      void updateEnergy; // The energy feeds the next membership change and changes no force.
      void nodeZoomResistance; void wireZoomResistance; // Appearance does not change the layout's physical sizes.
      pointerPickNeeded = true;
      container.dataset.layoutSettings = JSON.stringify(state.tuning.forceGraph);
      if (wireWidth !== linkWidth) {
        // The widths are the attention's to set, with the path's emphasis; a changed scale is a change of attention.
        wireWidth = linkWidth;
        attentionSettings = "";
        updateAttention();
      }
      const nextSettings = JSON.stringify([forces, state.spatialLayout]);
      if (forceSettings === nextSettings) return;
      const subjectId = focusedDirectory !== null
        ? state.spatialLayout === "structure" ? directoryNodeId(directoryAt(focusedDirectory)) : null
        : subjectAt;
      const anchor = subjectId ? getSubjectAnchor(subjectId) : null;
      const tuning = { ...state.tuning.forceGraph };
      const nextSize = JSON.stringify([tuning.nodeSize, tuning.symbolScale]);
      if (sizeSettings !== nextSize) {
        instance.nodeRadius((node: ForceGraphNode) => spatialNodeRadius(node, tuning));
        pictureChanged();
        sizeSettings = nextSize;
      }
      if (!motion) {
        // The page resolves endpoints when feeding the graph. A zero-strength link force would still walk every
        // wire on every partial physics tick, although the motion is the only force allowed to move a sphere.
        motion = motionForce<ForceGraphNode>({
          tuning: () => state.tuning.forceGraph,
          layout: () => state.spatialLayout,
          links: () => heldLinks,
          strength: () => strength,
          // A picture still part way through its reveal is not still: the rest enters first.
          onStill: () => { if (reveal.shown === reveal.order.length) simulationRunning = false; },
          onNodes: () => { pictureChanged(); },
          // A whole tick at a call until the first picture has warmed up hidden; a part within the frame's budget after.
          budget: () => ready ? FRAME_BUDGET : undefined
        });
        simulation.force("motion", motion);
      } else motion.invalidate();
      forceSettings = nextSettings;
      container.dataset.spatialLayout = state.spatialLayout;
      if (reheat) move(1, "unfold");
      if (subjectId && anchor) placeSubjectAnchor(subjectId, anchor);
    };

    /**
     * The one update path for a membership change (a pin, a filter, a directory, a layout, a step of history): the spheres
     * carried, the piece that enters now placed beside what holds it, and the motion eased at the update energy, held
     * from where the spheres stand, or unfolding afresh for a new layout; the rest of the picture enters a share at a
     * tick (`grow`). Only the first picture warms up.
     */
    const feed = (): void => {
      const start: MotionStart = shownLayout !== null && shownLayout !== state.spatialLayout ? "unfold" : "hold";
      shownLayout = state.spatialLayout;
      const shown = shownData();
      setPiece(shown);
      move(energy ?? state.tuning.forceGraph.updateEnergy, start);
    };
    const present = new Set(graphNodes.map(node => node.id));
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
    retainedScope = pins.entries.length || directories.length || path?.length ? retained : new Set();
    pathScope = path ?? [];
    for (const node of graphNodes) {
      if (node.directoryPath !== undefined && retainedFiles.some(id => under(id, node.directoryPath!))) retained.add(node.id);
    }
    scopedNames = !!subjectAt || retained.size > 0;
    // The picture enters in pieces (2026-10-28): what a person asked about first, then what the pulling links reach, a
    // share more at every tick, each sphere placed beside what holds it as it enters. A membership change keeps what is
    // shown and carries on from there in the new order; the attention set is in the piece that enters now.
    if (membershipChanged) {
      const attention = new Set(retained);
      if (subjectAt) attention.add(subjectAt);
      const kept = reveal.order.slice(0, reveal.shown).filter(id => liveNodes.has(id));
      const keptIds = new Set(kept);
      const order = kept.concat(revealOrder(graphNodes, graphLinks, attention, link => linkPulls(link, state.spatialLayout, state.tuning.forceGraph)).filter(id => !keptIds.has(id)));
      const entering = [...attention].filter(id => liveNodes.has(id) && !keptIds.has(id)).length;
      const shown = Math.min(order.length, Math.max(kept.length ? nextRevealCount(kept.length, order.length, REVEAL.share, REVEAL.least) : REVEAL.first, kept.length + entering));
      reveal = { order, nodes: liveNodes, links: graphLinks, shown };
    }
    labelNames = labelNamesOf(graphNodes);
    labelPriorities = new Map(graphNodes.map(node => [node.id,
      pins.entries.some(pin => pin.nodeId === node.id) || node.id === path?.[0] || node.id === path?.[path.length - 1] ? 1
      : node.directoryPath !== undefined && retained.has(node.id) ? 2
      : retained.has(node.id) ? 3 : node.directoryPath !== undefined ? 4 : 5]));
    for (const [id, label] of nameLabels) if (!present.has(id)) { label.remove(); nameLabels.delete(id); labelSizes.delete(label); }
    const hasAttention = !!pins.entries.length || !!path?.length || directories.length > 0;
    // The key says what is drawn: the references and their directions where they are, the path, and the fading.
    renderSpatialLegend(data, state.tuning.forceGraph.symbolScale, { references: state.spatialLayout === "connections" || hasAttention, path: !!path?.length, faded: hasAttention });
    frameDirectory = (): void => {
      if (directoryScope && directoryScope !== framedDirectoryScope) {
        focusedDirectory = directories[0] ?? null;
        fit();
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
        for (const link of graphLinks) {
          const a = resolveLinkEndpoint(link.source), b = resolveLinkEndpoint(link.target);
          if (a === hovered || b === hovered) { attention!.add(a); attention!.add(b); }
        }
      }
      // A force or camera edit with identical attention needs no buffer appearance update.
      const nextAttention = JSON.stringify([
        attention ? [...attention].sort() : null,
        hovered,
        path ?? null,
        directoryAttention ?? null,
        state.spatialLayout
      ]);
      if (attentionSettings === nextAttention) return;
      attentionSettings = nextAttention;
      pictureChanged();
      renderSpatialLegend(data, state.tuning.forceGraph.symbolScale, { references: state.spatialLayout === "connections" || attention !== null, path: !!path?.length, faded: attention !== null });
      forceGraphInstance?.nodeColor((node: ForceGraphNode) => {
        const color = spatialNodeStyle(node.archetype).color;
        return attention && !attention.has(node.id) ? `${color}33` : color;
      });
      /** Whether a wire has the picture's attention, and whether it is a step of the drawn path. */
      const regard = (link: ForceGraphLink): { visible: boolean; onPath: boolean } => {
        const a = resolveLinkEndpoint(link.source), b = resolveLinkEndpoint(link.target);
        const onPath = !!path?.length && pathPairs.has(JSON.stringify([a, b].sort()));
        const visible = hovered ? a === hovered || b === hovered : path?.length ? onPath : !attention || (attention.has(a) && attention.has(b));
        return { visible, onPath: onPath && visible };
      };
      forceGraphInstance?.linkColor((link: ForceGraphLink) => {
        const { visible, onPath } = regard(link);
        // Containment is the structure itself, drawn as a line; a reference revealed in the structure layout reads
        // against the tree rather than as the faint web of the connections layout. A path's wires are drawn at full
        // strength (2026-10-30), so that the route reads over the web around it.
        if (link.kind === "containment") return `rgba(233, 152, 77, ${visible ? 0.35 : 0.08})`;
        if (link.kind === "related-doc") return `rgba(153, 102, 204, ${visible ? 0.4 : 0.04})`;
        // A document's citation of a file, in the documents' violet lightened toward white, drawn from the document.
        if (link.kind === "cited-by") return `rgba(214, 178, 240, ${visible ? 0.55 : 0.06})`;
        if (onPath) return "rgba(255, 255, 255, 0.9)";
        if (state.spatialLayout === "structure") return `rgba(255, 255, 255, ${visible ? 0.5 : 0})`;
        // The whole web at .16 when nothing has the attention; the hovered file's wires at .5 and the retained set's at
        // .3 when something has, so that the few wires a person is reading show their colours (2026-10-30).
        return `rgba(255, 255, 255, ${!visible ? 0.025 : hovered ? 0.5 : attention ? 0.3 : 0.16})`;
      });
      // A common scale for every wire; reference counts retain their relative weight while camera motion and spring
      // stretch change no base width, and a path's wires are twice as wide. Zoom resistance controls the projection.
      forceGraphInstance?.linkWidth((link: ForceGraphLink) => state.tuning.forceGraph.linkWidth * (regard(link).onPath ? 2 : 1)
        * (link.kind === "related-doc" || link.kind === "cited-by" ? 0.5 : link.kind === "containment" ? 1 : Math.min(3, 1 + 0.375 * Math.log2(Math.max(1, link.count)))));
      forceGraphInstance?.linkVisibility((link: ForceGraphLink) => {
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
      membership = nextMembership;
      // Cached data objects can carry new sizes or archetypes even when attention is unchanged.
      forceGraphInstance.invalidateAppearance();
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
    const firstPiece = shownData();
    forceGraphInstance = new SpatialRenderer(container, {
      style: {
        radius: node => spatialNodeRadius(node, state.tuning.forceGraph),
        nodeColor: node => spatialNodeStyle(node.archetype).color,
        linkColor: () => "rgba(255, 255, 255, 0.16)",
        linkWidth: () => state.tuning.forceGraph.linkWidth,
        linkVisible: () => true,
        arrowLength: link => link.kind === "related-doc" || link.kind === "cited-by" ? 4 : 0,
        // A reference wire's colour runs from the file that uses, green, to the file that offers, blue; a pair that
        // uses each other is green at both ends; the other kinds keep their own colour (2026-10-30).
        linkFlow: link => link.kind === "containment" || link.kind === "related-doc" || link.kind === "cited-by" ? 2
          : link.forward && link.backward ? 0 : link.forward ? 1 : -1
      },
      resistance: () => ({ nodes: state.tuning.forceGraph.nodeZoomResistance, wires: state.tuning.forceGraph.wireZoomResistance }),
      linkLabel: link => {
        if (link.kind === "containment") return "Directory membership";
        if (link.kind === "related-doc") return `Cites the document: ${link.count} ${link.count === 1 ? "link" : "links"} in the file's words`;
        if (link.kind === "cited-by") return `Cited by the document: ${link.count} ${link.count === 1 ? "link" : "links"} to the file`;
        // Which file uses which, each direction with its count (2026-10-30).
        const nameOf = (endpoint: string | ForceGraphNode): string => { const id = resolveLinkEndpoint(endpoint); return labelNames.get(id) ?? nodeCache.get(id)?.name ?? id; };
        const uses = (user: string, offerer: string, count: number): string => `${user} uses ${offerer}: ${count} ${count === 1 ? "reference" : "references"}`;
        return [link.forward ? uses(nameOf(link.source), nameOf(link.target), link.forward) : "",
          link.backward ? uses(nameOf(link.target), nameOf(link.source), link.backward) : ""].filter(Boolean).join("; ");
      },
      onDrag: () => {
        pictureChanged(); cancelPress(); interrupt();
        if (!draggingNode) move(1, "hold");
        draggingNode = true;
        if (actionStrip) actionStrip.hidden = true;
      },
      onDragEnd: () => { draggingNode = false; pointerPickNeeded = true; refreshActionStrip(); move(1, "hold"); }
    });
    updateAttention();
    updateForces(true);
    setPiece(firstPiece);
    simulation.tick(REVEAL.warmup);
    shownLayout = state.spatialLayout;
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
    // Resolve each press against the uploaded instances, including fast clicks and touch taps
    // that have never produced a hover frame.
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
      const label = event.target instanceof HTMLElement && event.target.matches(".force-graph-focus, .force-graph-label") ? event.target : null;
      if (label?.dataset.nodeId) {
        const rect = label.getBoundingClientRect();
        showActions(label.dataset.nodeId, { x: rect.left + rect.width / 2, y: rect.bottom });
      }
    });
    container.addEventListener("keydown", event => {
      if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) return;
      const id = actionStrip?.contains(event.target as Node) ? actionTargetId : event.target instanceof HTMLElement && event.target.matches(".force-graph-focus, .force-graph-label") ? event.target.dataset.nodeId : null;
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
      labelSizes = new WeakMap();
      if (container.clientWidth && container.clientHeight) forceGraphInstance?.width(container.clientWidth).height(container.clientHeight);
    }).observe(container);
    focusSelection();
    if (!state.selectedNode) fit();
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
      const radius = spatialNodeRadius(node, state.tuning.forceGraph) * spatialSizeScale(point, camera, rect.height, state.tuning.forceGraph.nodeZoomResistance);
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

  /**
   * The piece of the picture currently shown: the spheres that have entered, in the order the picture lists them, and
   * the wires among them. A sphere that was in the picture keeps its place; a new one starts beside what holds it, so
   * that the structure layout folds the network into the tree from where the eye left it and a born file does not fly
   * in from the origin.
   */
  function shownData(): ForceGraphData {
    const shown = new Set(reveal.order.slice(0, reveal.shown));
    const nodes = [...reveal.nodes.values()].filter(node => shown.has(node.id));
    const links = reveal.links.filter(link => shown.has(resolveLinkEndpoint(link.source)) && shown.has(resolveLinkEndpoint(link.target)));
    for (const link of links) {
      link.source = reveal.nodes.get(resolveLinkEndpoint(link.source))!;
      link.target = reveal.nodes.get(resolveLinkEndpoint(link.target))!;
    }
    for (const [id, start] of placeNewSpheres(nodes, links, state.tuning.forceGraph, state.spatialLayout)) {
      const node = reveal.nodes.get(id)!;
      node.x = start.x; node.y = start.y; node.z = start.z;
    }
    return { nodes, links };
  }

  /**
   * The next piece enters, once the last is on screen: a share more of the spheres, placed beside what holds them, and the
   * motion counts stillness afresh and runs on. A piece a frame, whatever the motion's ticks take: headlessly a piece
   * enters a tick, which is the same while a tick fits a frame, and at sizes where a tick spans frames the page's picture
   * is in sooner than the twin's while its motion catches up, paced within the frame's budget (2026-10-28).
   */
  function grow(): void {
    const instance = forceGraphInstance;
    if (!instance || !motion || reveal.shown >= reveal.order.length || spheresOnScreen !== reveal.shown) return;
    reveal.shown = nextRevealCount(reveal.shown, reveal.order.length, REVEAL.share, REVEAL.least);
    const shown = shownData();
    setPiece(shown);
    // At zero energy nothing moves, while the pieces still enter, placed, one a frame.
    motion.stir();
  }

  function settle(): void {
    if (forceGraphInstance) move(state.tuning.forceGraph.updateEnergy, "hold");
  }

  /** Apply one revealed piece to the force and the instance buffers without creating scene objects. */
  function setPiece(shown: ForceGraphData): void {
    heldLinks = shown.links;
    simulation.nodes(shown.nodes);
    forceGraphInstance!.setData(shown);
    simulationRunning = strength > 0;
  }

  /**
   * Begin a motion at this strength, held where the spheres stand or unfolding first, and run the engine until the motion
   * finds them still; at zero nothing moves and only the placed picture is drawn.
   */
  function move(at: number, start: MotionStart): void {
    const instance = forceGraphInstance;
    if (!instance || !motion) return;
    const container = requireElement("graph-svg");
    strength = at;
    if (!(at > 0)) {
      simulationRunning = false;
      container.setAttribute("aria-busy", "false");
      return;
    }
    motion.wake(start);
    simulationRunning = true;
    container.setAttribute("aria-busy", "true");
  }

  return { render, setActive, focusNode, focusDirectory, fit, getSubjectAnchor, placeSubjectAnchor, captureScene, setMoment, settle, whenReady: () => ready ? Promise.resolve() : new Promise(resolve => readyWaiters.push(resolve)) };
}
