/**
 * Force Graph View
 *
 * Renders the 3D force-directed graph view for the Live Docs Explorer using
 * direct instance buffers. Supports Related Documentation overlay nodes when enabled.
 *
 * Since 2026-10-31 the picture is discovered rather than shown whole (the
 * owner's direction): it holds what a person asked about, the tuning's hops of
 * connections around it with the last hop dimmed as the frontier, and, since
 * 2026-11-02, the seed of every group the hops do not reach, dimmed too, so
 * that no island is more than a click away; a click on a sphere pins it, and
 * the pinned file is asked about, so the picture grows from it, and a second
 * click releases it. With nothing asked about, the layout's start is shown
 * (`forceGraphScope.ts`): in Connections the archipelago, every group's seed
 * and nothing grown; in Structure the root with its children. The whole
 * picture is the root opened, the Whole toggle of the toolbar. Names stand at
 * rest only beside what was asked about and the hovered sphere; the rest are
 * named when their sphere draws at the tuning's `nameAt` (the owner, 2026-11-02:
 * "until _the very last second_"). While a moment of the history is shown, the
 * files the step changed glow or the rest dim, by the tuning.
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
import { directoryNodeId, labelNamesOf, spatialGraphOf, type SpatialGraphData, type SpatialGraphNode, type SpatialLinkKind } from "./forceGraphData";
import { emphasizedSphere, emphasizedWireAlpha, pairKey } from "./forceGraphEmphasis";
import { placeSpatialLabels, type SpatialLabel, type LabelBox } from "./forceGraphLabels";
import { linkPulls, motionForce, placeNewSpheres, spatialNodeRadius, symbolCountOf, type MotionForce, type MotionStart } from "./forceGraphLayout";
import { SPATIAL_DRAG_SLOP, SpatialRenderer } from "./forceGraphRenderer";
import { nextRevealCount, REVEAL, revealCorresponding, revealLayers } from "./forceGraphReveal";
import { componentLandmarks, connectedNeighbours, directoryHubOf, directoryMembersWithinHops, spatialScope, startHops, startOf } from "./forceGraphScope";
import { spatialSizeScale } from "./forceGraphSizing";
import type { ExplorerState } from "../types";
import { under } from "./localView/directory-state";
import type { ForceScene } from "./perspectiveTransition";
import { getVisibleConnections, EMPTY_PIN_SET, type PinSet } from "./pin-state";
import { wheelPixels } from "./wheel";
import type { RelatedDocLink } from "../../shared/staticExplorerData";
import type {
  ExplorerGraphPayload,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../shared/types";
import { requireElement } from "../dom";
import type { HistoryChanges, HistoryMoment } from "../history/moment";
import { parentDirectory } from "./localView/directory-bands";
import { composedRenames, hasRenames, NO_RENAMES, rekeyedCaches, renamedId, type Renames } from "../history/rekey";
import { CENTRE_ICON, DIRECTORY_ICON, iconButton, MORE_ICON, PIN_ICON } from "../panels/icon-button";
import { renderSpatialLegend } from "../panels/spatial-legend";

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
  /** Toggle the file's shared pin, withdrawing its own discovery and subject when released. */
  onToggleNode: (nodeId: string) => void;
  /** Explicit Pin retains even a file already discovered through inspection; Unpin withdraws that file. */
  onTogglePin: (nodeId: string) => void;
  onRecenterNode: (node: ExplorerNodePayload) => void;
  onShowNodeActions: (node: ExplorerNodePayload, symbol: string | undefined, point: { x: number; y: number }, onClose?: () => void) => void;
  onShowDirectoryActions: (directory: string, point: { x: number; y: number }, onClose?: () => void) => void;
  onCentreDirectory: (directory: string) => void;
  /** Toggle local discovery; opening every descendant remains a separate action. */
  onToggleDirectory: (directory: string) => void;
  onOpenDirectory: (directory: string) => void;
  onCloseDirectory: (directory: string) => void;
  /** The drawn path's files as the picture shown names them: a moment's names while a moment is shown, asked over its wires (2026-10-30). */
  getPath?: () => readonly string[] | undefined;
  /** How many files the picture shows of the files the filters allow, told at every change of what is shown (2026-10-31). */
  /** How many files the picture shows of those the filters allow, and among them the groups of two or more files and the lone files (2026-11-02). */
  onShown?: (shown: number, total: number, groups: number, alone: number) => void;
}

/** Public API surface of the Force Graph view. */
export interface ForceGraphViewApi {
  render(): void;
  captureScene(): ForceScene;
  /** Reveal in-scope counterparts before the 2D/3D handoff; changes neither pins nor logical scope. */
  revealForTransition(nodeIds: readonly string[]): void;
  whenReady(): Promise<void>;
  setActive(active: boolean): void;
  getSubjectAnchor(nodeId: string): { x: number; y: number } | null;
  placeSubjectAnchor(nodeId: string, anchor: { x: number; y: number }): void;
  /** Frame a file explicitly, for the retained-item tray, without changing the selected subject. */
  focusNode(nodeId: string): void;
  focusDirectory(directory: string): void;
  /** Fit the current path or retained scope without changing the exploration. */
  fit(): void;
  /** Keep newly opened evidence from covering the file being inspected, without changing its selected identity. */
  keepInspectionVisible(): void;
  /**
   * Show a moment of the history in place of today, or today again (null), re-keying the picture through the renames
   * from the moment shown before; the change is fed at `energy`, or at the tuning's when none is given. Drawn at once
   * when the view is shown, else at its next render.
   */
  setMoment(moment: HistoryMoment | null, renames: Renames, energy?: number, changes?: HistoryChanges | null): void;
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
    onShowBundledDoc
  } = options;

  const currentDirectories = new Set<string>();
  for (const node of graphData.nodes) {
    for (let directory = parentDirectory(node.codeRelativePath); ; directory = parentDirectory(directory)) {
      currentDirectories.add(directory);
      if (!directory) break;
    }
  }

  const emptyHint = document.createElement("div");
  emptyHint.className = "force-graph-empty";
  emptyHint.hidden = true;
  const emptyWords = document.createElement("span"), openDeeper = document.createElement("button");
  openDeeper.type = "button";
  let deeperDirectory: string | null = null;
  let emptyBox = "";
  openDeeper.addEventListener("click", () => { if (deeperDirectory !== null) options.onOpenDirectory(deeperDirectory); });
  emptyHint.append(emptyWords, openDeeper);
  requireElement("view-graph").append(emptyHint);

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
  let historyChanges: HistoryChanges | null = null;
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
  let historyCameraIntent: "scope" | "subject" | null = null;
  let framedPicture = "";
  let fittingScope = false;
  let retainedScope = new Set<string>();
  let pathScope: readonly string[] = [];
  let zoomMotion: { started: number; from: CameraPoint; fromTarget: CameraPoint; to: CameraPoint; toTarget: CameraPoint } | null = null;
  let focusLabel: HTMLButtonElement | null = null;
  const nameLabels = new Map<string, HTMLButtonElement>();
  let labelSides = new Map<string, number>();
  let labelSizes = new WeakMap<HTMLButtonElement, { width: number; height: number; text: string; availableWidth: number }>();
  let labelPriorities = new Map<string, number>();
  let labelNames = new Map<string, string>();
  /** The reveal of the picture (2026-10-28): the order its spheres enter in, the live objects and wires of the whole, and how many have entered. */
  let reveal: { order: string[]; nodes: Map<string, ForceGraphNode>; links: ForceGraphLink[]; shown: number } = { order: [], nodes: new Map(), links: [], shown: 0 };
  // Grow only after the current piece has been drawn. Each piece receives a physics call and a visible frame.
  let spheresOnScreen = 0;
  /**
   * The scope of the picture (2026-10-31): each shown sphere's hop from what was asked about, how many connected spheres
   * each leaves out, and which hop is the frontier, drawn dimmed.
   */
  let scopeHops = new Map<string, number>();
  let scopeBeyond = new Map<string, number>();
  /** The groups shown only by their seed: the seed's id to the group's size in files (2026-11-02). */
  let scopeGroups = new Map<string, number>();
  let frontierHop = Infinity;
  /** Whether a shown sphere is dimmed: at the last hop shown, or an unreached group's seed one past it; never at hop 0. */
  const atFrontier = (id: string): boolean => { const hop = scopeHops.get(id); return hop !== undefined && hop > 0 && hop >= frontierHop; };
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
    const insets = following || !emptyHint.hidden ? cameraInsets() : undefined;
    if (!emptyHint.hidden && insets) {
      const width = forceGraphInstance.width() - insets.left - insets.right;
      const height = forceGraphInstance.height() - insets.top - insets.bottom;
      const key = JSON.stringify([insets, width, height]);
      if (key !== emptyBox) {
        emptyBox = key;
        emptyHint.style.left = `${insets.left + width / 2}px`;
        emptyHint.style.top = `${insets.top + height * .45}px`;
        emptyHint.style.maxWidth = `${Math.max(0, Math.min(440, width - 40))}px`;
      }
    }
    const framingKey = following ? JSON.stringify([pictureRevision, focusedId, focusedDirectory, fittingScope, insets,
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
      const spheres = instance.graphData().nodes.filter(node => (!ids || ids.has(node.id)) && Number.isFinite(node.x))
        .map(node => ({ center: { x: node.x!, y: node.y!, z: node.z! }, radius: spatialNodeRadius(node, state.tuning.forceGraph)
          * spatialSizeScale(controls.target, camera, instance.height(), state.tuning.forceGraph.nodeZoomResistance) }));
      const centered = !fittingScope && focusedDirectory === null && subject && Number.isFinite(subject.x)
        ? { x: subject.x!, y: subject.y!, z: subject.z! } : undefined;
      const framing = camera instanceof PerspectiveCamera
        ? frameCameraSpheres(camera, spheres, { width: instance.width(), height: instance.height(), insets }, 60, centered) : null;
      if (framing) {
        if (!focusMotion) focusMotion = { started: now, camera: { ...instance.cameraPosition() },
          target: { x: controls.target.x, y: controls.target.y, z: controls.target.z } };
        const motion = focusMotion;
        const t = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : Math.min(1, (now - motion.started) / 650);
        const k = 1 - Math.pow(1 - t, 3);
        const mix = (a: CameraPoint, b: CameraPoint): CameraPoint => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k });
        instance.cameraPosition(mix(motion.camera, framing.camera), mix(motion.target, framing.target));
        if (t === 1 && !simulationRunning) following = false;
      } else if (!spheres.length) following = false;
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
    for (const element of document.querySelectorAll<HTMLElement>(".perspective-controls, .pin-tray, .pin-tray-toggle, #detail-panel.visible, .history-scrubber, .history-step-panel, .force-graph-actions, .spatial-wire-tooltip")) {
      const box = element.getBoundingClientRect();
      if (box.width && box.height && getComputedStyle(element).visibility !== "hidden") obstacles.push({ x: box.left - frame.left, y: box.top - frame.top, width: box.width, height: box.height });
    }
    const nameState = JSON.stringify([pictureRevision, focusedId, hoveredId, inspectedActionId,
      state.tuning.forceGraph.nodeZoomResistance, frame.x, frame.y, frame.width, frame.height,
      camera.matrixWorld.elements.map(Math.fround), camera.projectionMatrix.elements.map(Math.fround), instance.controls().target.toArray(), obstacles]);
    if (nameState === placedNames) return;
    placedNames = nameState;
    const candidates: SpatialLabel[] = [];
    const measuring: Array<Omit<SpatialLabel, "width" | "height"> & { label: HTMLButtonElement; name: string }> = [];
    const buttons = new Map<string, HTMLButtonElement>();
    // A directory's framing scope includes its entire subtree, but its deep descendants are not all label priorities.
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
      const priority = node.id === focusedId ? 0 : node.id === hoveredId || node.id === inspectedActionId ? 1 : basePriority;
      // Disclosure follows proximity, at the tuning's size (2026-11-02; six pixels before, which named far too much):
      // resistance changes the sphere's outline, not when a name becomes useful.
      if (priority >= 5 && perspectiveRadius < state.tuning.forceGraph.nameAt) continue;
      const radius = perspectiveRadius * spatialSizeScale(instance.controls().target, camera, frame.height, state.tuning.forceGraph.nodeZoomResistance);
      let label = node.id === focusedId ? focusLabel : nameLabels.get(node.id);
      if (!label) {
        label = document.createElement("button");
        label.type = "button";
        label.className = "force-graph-label";
        label.dataset.nodeId = node.id;
        bindNodeActivation(label);
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
      const more = scopeBeyond.get(node.id);
      const action = currentAction(node.id);
      const retained = action?.kind === "file" && isRetainedFile(action.node.id);
      const discovered = action?.kind === "file" ? state.discovery?.kind === "file" && state.discovery.nodeId === action.node.id
        : action?.kind === "directory" && state.discovery?.kind === "directory" && state.discovery.directory === action.directory;
      const title = (node.directoryPath !== undefined ? `${node.directoryPath || "Scan root"} · ${node.directoryFileCount} visible files`
        : node.id.startsWith("related:") ? `${node.codeRelativePath}${hasBundledDoc(node.id.slice(8)) ? "" : " · not in this bundle"}`
        : `${node.codeRelativePath} · ${count} public ${count === 1 ? "symbol" : "symbols"}`)
        + (scopeGroups.has(node.id) && scopeGroups.get(node.id)! > 1 ? ` · ${scopeGroups.get(node.id)!.toLocaleString("en-US")} files in this group` : "")
        + (more ? ` · ${more} more connected, not shown` : "")
        + (action?.kind === "file" ? ` · ${retained ? "Unpin this file" : discovered ? "Release this discovery" : "Pin this file"}`
          : action?.kind === "directory" ? ` · ${discovered ? "Release this discovery" : "Explore this directory"}` : "");
      if (label.title !== title) label.title = title;
      label.dataset.nodeId = node.id;
      label.dataset.kind = node.directoryPath !== undefined ? "directory" : "file";
      if (action) label.setAttribute("aria-pressed", String(retained || discovered));
      else label.removeAttribute("aria-pressed");
      label.dataset.priority = String(priority);
      label.dataset.context = String(atFrontier(node.id));
      const size = labelSizes.get(label);
      if (!size || size.text !== name || size.availableWidth !== frame.width) label.hidden = false;
      measuring.push({ id: node.id, x, y, radius, priority, label, name });
      buttons.set(node.id, label);
    }
    // Finish all DOM writes before measuring any new name. A large reveal otherwise forces a layout per new label.
    for (const { label, name, ...candidate } of measuring) {
      let size = labelSizes.get(label);
      if (!size || size.text !== name || size.availableWidth !== frame.width) {
        size = { width: label.offsetWidth, height: label.offsetHeight, text: name, availableWidth: frame.width };
        labelSizes.set(label, size);
      }
      candidates.push({ ...candidate, width: size.width, height: size.height });
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
    historyCameraIntent = node ? "subject" : null;
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
    historyCameraIntent = "scope";
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
    historyCameraIntent = "subject";
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

  /** Act on the file at the displayed moment, retaining its historical identity when it no longer exists today. */
  function currentAction(id: string): { kind: "file"; node: ExplorerNodePayload } | { kind: "directory"; directory: string } | null {
    const rendered = nodeCache.get(id);
    if (!rendered || !forceGraphInstance?.hasNode(id)) return null;
    if (rendered.directoryPath !== undefined) {
      const today = moment ? moment.directoryToday(rendered.directoryPath) : rendered.directoryPath;
      return moment || currentDirectories.has(today) ? { kind: "directory", directory: today } : null;
    }
    if (id.startsWith("related:")) return null;
    const todayId = moment ? moment.fileReference(id) : id;
    const node = todayId ? nodesById.get(todayId) : undefined;
    return node ? { kind: "file", node } : null;
  }

  function isRetainedFile(id: string): boolean {
    return (state.pins ?? EMPTY_PIN_SET).entries.some(pin => pin.nodeId === id);
  }

  /** A moving name acts on the node pressed, and ordinary pointer jitter is not a drag or a different target. */
  function bindNodeActivation(button: HTMLButtonElement): void {
    let down: { id: string; pointer: number; x: number; y: number; moved: boolean } | null = null;
    button.addEventListener("pointerdown", event => {
      if (event.button !== 0 || !button.dataset.nodeId) return;
      down = { id: button.dataset.nodeId, pointer: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
      if (event.isTrusted) button.setPointerCapture(event.pointerId);
    });
    button.addEventListener("pointermove", event => {
      if (down?.pointer === event.pointerId && Math.hypot(event.clientX - down.x, event.clientY - down.y) > SPATIAL_DRAG_SLOP) down.moved = true;
    });
    button.addEventListener("pointercancel", () => { down = null; });
    button.addEventListener("click", event => {
      const id = event.detail === 0 ? button.dataset.nodeId : down && !down.moved ? down.id : null;
      down = null;
      if (id) activateNode(id);
    });
  }

  /** Spheres and their keyboard-accessible names perform the same reversible action, including historical files. */
  function activateNode(id: string): void {
    if (id.startsWith("related:")) {
      if (hasBundledDoc(id.slice(8))) onShowBundledDoc(id.slice(8));
    } else {
      const action = currentAction(id);
      if (action?.kind === "directory") options.onToggleDirectory(action.directory);
      else if (action?.kind === "file") options.onToggleNode(action.node.id);
    }
    syncInspectionAction();
    placedNames = "";
    refreshActionStrip();
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
    const worldRadius = spatialNodeRadius(node, state.tuning.forceGraph) * spatialSizeScale(instance.controls().target, camera, instance.height(), state.tuning.forceGraph.nodeZoomResistance);
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
      const pinned = isRetainedFile(action.node.id);
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
    if (fittingScope) return new Set(data.nodes.map(node => node.id));
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
    historyCameraIntent = "scope";
    fittingScope = true;
    following = true;
    focusMotion = null;
    subjectAnchor = null;
    zoomMotion = null;
  }

  /** The rectangular space left by evidence and timeline controls; a full-screen reader leaves framing unchanged. */
  function cameraInsets(): { left: number; right: number; top: number; bottom: number } {
    const frame = requireElement("graph-svg").getBoundingClientRect();
    const inset = { left: 0, right: 0, top: 0, bottom: 0 };
    const reader = document.querySelector<HTMLElement>("#detail-panel.visible");
    if (reader) inset.right = Math.max(0, Math.min(frame.width, reader.offsetWidth));
    const history = document.querySelector<HTMLElement>(".history-step-panel:not([hidden])");
    if (history) inset.left = Math.max(0, history.getBoundingClientRect().right - frame.left);
    if (frame.width - inset.right < 240) inset.right = 0;
    if (frame.width - inset.left - inset.right < 240) inset.left = 0;
    for (const controls of document.querySelectorAll<HTMLElement>(".perspective-controls:not([hidden]), .history-scrubber:not([hidden])")) {
      const box = controls.getBoundingClientRect();
      if (box.width && box.top > frame.top && box.bottom <= frame.bottom + 1) inset.bottom = Math.max(inset.bottom, frame.bottom - box.top);
    }
    return inset;
  }

  function keepInspectionVisible(): void {
    const instance = forceGraphInstance;
    if (!instance || !state.inspection || !active) return;
    const id = state.inspection.kind === "file" ? fileAt(state.inspection.nodeId)
      : state.inspection.kind === "directory" ? directoryNodeId(directoryAt(state.inspection.directory)) : undefined;
    const node = id ? nodeCache.get(id) : undefined;
    if (!node || !Number.isFinite(node.x)) return;
    const insets = cameraInsets();
    const relevant = new Set(retainedScope);
    relevant.add(id!);
    for (const link of instance.graphData().links) {
      const from = resolveLinkEndpoint(link.source), to = resolveLinkEndpoint(link.target);
      if (from === id || to === id) { relevant.add(from); relevant.add(to); }
    }
    const obscured = instance.graphData().nodes.some(member => {
      if (!relevant.has(member.id) || !Number.isFinite(member.x)) return false;
      const at = instance.graph2ScreenCoords(member.x!, member.y!, member.z!);
      return at.x < insets.left + 30 || at.x > instance.width() - insets.right - 30
        || at.y < insets.top + 30 || at.y > instance.height() - insets.bottom - 30;
    });
    if (obscured) fit();
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
    const discovery = state.discovery === undefined ? state.inspection : state.discovery;
    const discoveredFile = discovery?.kind === "file" ? fileAt(discovery.nodeId) : undefined;
    const directoryScope = directories.length && !state.selectedNode && !path?.length ? JSON.stringify(directories) : "";
    container.dataset.directoryScope = directoryScope;
    container.dataset.historyStep = moment ? String(moment.step) : "";

    const includeNode = (node: ExplorerNodePayload): boolean => {
      if (path?.includes(node.id) || subjectAt === node.id || discoveredFile === node.id || pins.entries.some(pin => pin.nodeId === node.id)) {
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
    // What is shown (discovery, the owner's direction of 2026-10-31): what was asked about, directly (the pins, the
    // subject, the inspected file or hub, a path) or as a set (an open directory's files), and the tuning's hops of
    // connections around it, the last hop the frontier; nothing beyond. With nothing asked about, the layout's start.
    const pulls = (link: { kind?: string }): boolean => linkPulls(link, state.spatialLayout);
    const asked = new Set<string>();
    for (const pin of pins.entries) asked.add(pin.nodeId);
    if (subjectAt) asked.add(subjectAt);
    const inspected = discoveredFile
      ?? (discovery?.kind === "directory" && state.spatialLayout === "structure" ? directoryHubOf(data.nodes, directoryAt(discovery.directory)) : undefined);
    if (inspected) asked.add(inspected);
    // An open directory's files are asked about as a set; in the structure layout its hub and every hub under it too,
    // so that the directory stands whole with its tree, the root opened with every hub.
    const members = new Set<string>();
    if (discovery?.kind === "directory" && state.spatialLayout === "connections") {
      const tree = spatialGraphOf(source, includeNode, shownDocLinks, "structure");
      for (const id of directoryMembersWithinHops(tree.nodes, tree.links, directoryAt(discovery.directory), state.tuning.forceGraph.hops)) members.add(id);
    }
    for (const node of data.nodes) {
      if (node.directoryPath === undefined ? directories.some(directory => under(node.id, directory))
        : directories.some(directory => node.directoryPath === directory || under(node.directoryPath!, directory))) members.add(node.id);
    }
    if (path?.length) { asked.clear(); members.clear(); for (const id of path) asked.add(id); }
    const inPicture = new Set(data.nodes.map(node => node.id));
    for (const id of asked) if (!inPicture.has(id)) asked.delete(id);
    const hasQuestion = todayPins.entries.length > 0 || !!subject || directories.length > 0 || !!discovery || !!path?.length;
    if (!hasQuestion) for (const id of startOf(data.nodes, data.links, state.spatialLayout, pulls)) asked.add(id);
    // The hops shown: around a question the tuning's; around a start what the start shows, the archipelago's seeds
    // alone and the root with its children (2026-11-02).
    const hopsShown = hasQuestion ? state.tuning.forceGraph.hops : startHops(state.spatialLayout, state.tuning.forceGraph.hops);
    const scope = spatialScope(data.nodes, data.links, new Set([...asked, ...members]), hopsShown, pulls);
    scopeHops = scope.hops;
    scopeBeyond = scope.beyond;
    scopeGroups = scope.groups;
    frontierHop = hopsShown;
    const hasFrontier = [...scope.hops.keys()].some(atFrontier);
    // Whether any sphere has connections the picture does not show: it wears a ring (the owner's choice of 2026-11-02).
    const hasRings = scope.beyond.size > 0;
    // The repository's groups over its references, whatever the layout: how many, and how many files stand alone.
    const groupSizes = [...componentLandmarks(connectedNeighbours(data.nodes.filter(node => node.directoryPath === undefined && node.archetype !== "related-doc"), data.links, link => linkPulls(link, "connections"))).values()];
    const picture: SpatialGraphData = { nodes: data.nodes.filter(node => scope.hops.has(node.id)),
      links: data.links.filter(link => scope.hops.has(link.source) && scope.hops.has(link.target)) };
    emptyHint.hidden = picture.nodes.length > 0;
    deeperDirectory = !picture.nodes.length && discovery?.kind === "directory" && state.spatialLayout === "connections"
      && filteredNodes.some(node => under(node.id, directoryAt(discovery.directory))) ? discovery.directory : null;
    const directoryFilteredOut = discovery?.kind === "directory"
      && source.nodes.some(node => under(node.id, directoryAt(discovery.directory)))
      && !filteredNodes.some(node => under(node.id, directoryAt(discovery.directory)));
    emptyWords.textContent = deeperDirectory !== null ? "This neighborhood contains folders; its files are deeper inside."
      : directoryFilteredOut ? "No files in this directory match the current filters."
      : !source.nodes.length ? "No files in this graph." : !data.nodes.length ? "No files match the current filters."
      : "No files from this selection are present here.";
    openDeeper.hidden = deeperDirectory === null;
    const deeperPath = deeperDirectory === null ? "" : directoryAt(deeperDirectory);
    openDeeper.textContent = `Open ${deeperPath.split("/").pop() || "Scan root"}`;
    openDeeper.setAttribute("aria-label", `Open ${deeperPath || "Scan root"}`);
    openDeeper.title = `Show every eligible file under ${deeperPath || "the scan root"}`;
    const isFile = (node: SpatialGraphNode): boolean => node.directoryPath === undefined && !node.id.startsWith("related:");
    options.onShown?.(picture.nodes.filter(isFile).length, data.nodes.filter(isFile).length, groupSizes.filter(size => size > 1).length, groupSizes.filter(size => size === 1).length);
    // Keep node data by id and link data by pair across membership changes. Positions and stable instance bindings
    // follow those data objects, including through historical renames; the 2D wires keep their elements the same way.
    const graphNodes: ForceGraphNode[] = picture.nodes.map(node => {
      const cached = nodeCache.get(node.id);
      if (!cached) { nodeCache.set(node.id, node); return node; }
      Object.assign(cached, node);
      // A past moment's count would otherwise stay on the object, since today's payload names its symbols instead.
      if (node.symbolCount === undefined) delete cached.symbolCount;
      return cached;
    });
    const liveNodes = new Map(graphNodes.map(node => [node.id, node]));
    const graphLinks: ForceGraphLink[] = picture.links.map(link => {
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
    const nextMembership = JSON.stringify([graphNodes.map(node => [node.id, symbolCountOf(node), node.directoryPath]),
      picture.links.map(link => [linkKey(link), link.count])]);
    const membershipChanged = nextMembership !== membership;

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
          readyToAnchor: () => reveal.shown >= reveal.order.length,
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
      // A wholly new neighborhood has no meaningful places to preserve. Holding its arbitrary seed makes the
      // field fight its anchors; surviving or previously visited positions still use the normal held update.
      const placed = graphNodes.some(node => Number.isFinite(node.x) && Number.isFinite(node.y) && Number.isFinite(node.z));
      const start: MotionStart = !placed || shownLayout !== null && shownLayout !== state.spatialLayout ? "unfold" : "hold";
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
    /** The pins, what they retain and the subject: the files whose references the structure layout draws at rest. */
    const pinnedScope = new Set<string>(pins.entries.map(pin => pin.nodeId));
    for (const { link } of getVisibleConnections(pins, source.links)) { pinnedScope.add(resolveLinkEndpoint(link.source)); pinnedScope.add(resolveLinkEndpoint(link.target)); }
    if (selectedAt) pinnedScope.add(selectedAt);
    retainedScope = pins.entries.length || directories.length || path?.length ? retained : new Set();
    pathScope = path ?? [];
    for (const node of graphNodes) {
      if (node.directoryPath !== undefined && retainedFiles.some(id => under(id, node.directoryPath!))) retained.add(node.id);
    }
    // The picture enters in pieces (2026-10-28): what a person asked about first, then what the pulling links reach, a
    // share more at every tick, each sphere placed beside what holds it as it enters. A membership change keeps what is
    // shown and carries on from there in the new order; the attention set is in the piece that enters now.
    if (membershipChanged) {
      const kept = reveal.order.slice(0, reveal.shown).filter(id => liveNodes.has(id));
      const keptIds = new Set(kept);
      const layers = revealLayers(graphNodes, graphLinks, { asked, members }, link => linkPulls(link, state.spatialLayout, state.tuning.forceGraph));
      const order = kept.concat(layers.flat().filter(id => !keptIds.has(id)));
      // What was asked about directly is on screen at once, with its first hop when it was asked about directly, so that
      // the 2D picture's neighbourhood crosses into 3D together; the rest, an open directory's files among them, at the pace.
      const entering = [...asked].filter(id => liveNodes.has(id) && !keptIds.has(id)).length;
      const first = (layers[0]?.length ?? 0) + (asked.size ? layers[1]?.length ?? 0 : 0);
      const shown = Math.min(order.length, Math.max(kept.length ? nextRevealCount(kept.length, order.length, state.tuning.forceGraph.revealFrames) : first, kept.length + entering));
      reveal = { order, nodes: liveNodes, links: graphLinks, shown };
    }
    labelNames = labelNamesOf(graphNodes);
    const changedNames = new Set(historyChanges?.changedFiles ?? []);
    const changedNodes = new Set(historyChanges?.changed ?? []);
    if (historyChanges && state.spatialLayout === "structure") {
      for (const path of new Set([...historyChanges.changedFiles, ...historyChanges.deletedFiles])) {
        for (let directory = parentDirectory(path); ; directory = parentDirectory(directory)) {
          changedNames.add(directoryNodeId(directory));
          changedNodes.add(directoryNodeId(directory));
          if (!directory) break;
        }
      }
    }
    // Keep the directories asked about named, not every ancestor of every retained file nor their children. Deeper
    // folders use the same proximity disclosure as files; opening a whole tree must not turn its overview into a wall of paths.
    const directoryRoots = new Set([directoryNodeId(""), ...directories.map(directoryNodeId)]);
    for (const id of asked) if (liveNodes.get(id)?.directoryPath !== undefined) directoryRoots.add(id);
    for (const link of graphLinks) {
      if (link.kind === "containment" && asked.has(resolveLinkEndpoint(link.target))) directoryRoots.add(resolveLinkEndpoint(link.source));
    }
    // Names at rest only beside what was asked about: the pins, the inspected file, a path's ends and, in the tree, the
    // root and the directories opened (2026-11-02, the owner: "we don't draw a node's name (unless hovered over) until
    // _the very last second_"); a path's inner files and a step's changed files keep their names where they fit; the
    // rest, the archipelago's seeds and every landmark among them, are named only on approach, at the tuning's size.
    labelPriorities = new Map(graphNodes.map(node => [node.id,
      pins.entries.some(pin => pin.nodeId === node.id) || node.id === inspected || !hasQuestion && asked.has(node.id) && state.spatialLayout === "structure"
        || node.id === path?.[0] || node.id === path?.[path.length - 1] ? 1
      : state.tuning.history.changeEmphasis !== "none" && changedNames.has(node.id) ? 2
      : node.directoryPath !== undefined ? directoryRoots.has(node.id) ? 1 : 5
      : path?.includes(node.id) ? 3
      : 5]));
    for (const [id, label] of nameLabels) if (!present.has(id)) { label.remove(); nameLabels.delete(id); labelSizes.delete(label); }
    const hasAttention = !!pins.entries.length || !!path?.length || directories.length > 0;
    const rootOverview = directories.includes("");
    // The key says what is drawn: the references and their directions where they are, the path, and the fading.
    renderSpatialLegend(picture, state.tuning.forceGraph.symbolScale, { references: state.spatialLayout === "connections" || hasAttention, path: !!path?.length, faded: !!path?.length, frontier: hasFrontier, rings: hasRings });
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
      // Hover is a temporary look at a file's connections among what is shown. Leaving restores the picture; it never
      // restores a snapshot from graph entry. Since 2026-10-31 nothing fades for standing outside the pins: the picture
      // shows only what was asked about and its hops, and the last hop shown is dimmed as the frontier.
      const hovered = hoveredId;
      // The hover isolates a file and its connections; a drawn path isolates its files; otherwise nothing is faded.
      const attention = hovered ? new Set([hovered]) : path?.length ? new Set(path) : null;
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
      // A force or camera edit with identical attention needs no buffer appearance update. History emphasis is
      // constant within a displayed commit, so its mode and step identify that appearance.
      const emphasis = historyChanges ? state.tuning.history.changeEmphasis : "none";
      const nextAttention = JSON.stringify([
        attention ? [...attention].sort() : null,
        hovered,
        path ?? null,
        directoryAttention ?? null,
        state.spatialLayout,
        rootOverview,
        frontierHop,
        emphasis,
        historyChanges?.step ?? null
      ]);
      if (attentionSettings === nextAttention) return;
      attentionSettings = nextAttention;
      pictureChanged();
      renderSpatialLegend(picture, state.tuning.forceGraph.symbolScale, { references: state.spatialLayout === "connections" || hasAttention || attention !== null, path: !!path?.length, faded: attention !== null || !!path?.length, frontier: hasFrontier, rings: hasRings });
      const frontier = atFrontier;
      forceGraphInstance?.nodeColor((node: ForceGraphNode) => {
        const color = spatialNodeStyle(node.archetype).color;
        // Faded for the hover, with the hovered file and its connections whole even at the frontier; dimmed as the
        // frontier otherwise; and under the history's emphasis glowing or dimmed by the step.
        const alpha = attention ? (attention.has(node.id) ? 1 : 0.2) : frontier(node.id) ? 0.4 : 1;
        if (emphasis === "none") return alpha === 1 ? color : emphasizedSphere(color, alpha, false, "none");
        return emphasizedSphere(color, alpha, changedNodes.has(node.id), emphasis);
      });
      // A ring around every sphere with connections the picture does not show, a click on which shows them: the owner's
      // choice of 2026-11-02, B over A, the frontier's dimming kept and the ring saying where there is more. The ring
      // keeps its strength at the frontier, where it is the cue, and fades with the hover's attention.
      forceGraphInstance?.nodeRing((node: ForceGraphNode) => {
        if (!scopeBeyond.get(node.id)) return null;
        const alpha = attention ? (attention.has(node.id) ? .85 : .15) : .85;
        return emphasizedSphere(spatialNodeStyle(node.archetype).color, alpha, changedNodes.has(node.id), emphasis);
      });
      /** Whether a wire has the picture's attention, whether it is a step of the drawn path, whether it reaches the frontier, and whether the step changed it. */
      const regard = (link: ForceGraphLink): { visible: boolean; onPath: boolean; dimmed: boolean; changed: boolean } => {
        const a = resolveLinkEndpoint(link.source), b = resolveLinkEndpoint(link.target);
        const onPath = !!path?.length && pathPairs.has(JSON.stringify([a, b].sort()));
        const visible = hovered ? a === hovered || b === hovered : path?.length ? onPath : true;
        return { visible, onPath: onPath && visible, dimmed: frontier(a) || frontier(b), changed: !!historyChanges?.changedPairs.has(pairKey(a, b)) };
      };
      forceGraphInstance?.linkColor((link: ForceGraphLink) => {
        const { visible, onPath, dimmed, changed } = regard(link);
        // Containment is the structure itself, drawn as a line; a reference revealed in the structure layout reads
        // against the tree rather than as the faint web of the connections layout. A path's wires are drawn at full
        // strength (2026-10-30), so that the route reads over the web around it. A wire to the frontier is dimmed with it.
        if (link.kind === "containment") return `rgba(233, 152, 77, ${!visible ? 0.08 : dimmed ? 0.15 : 0.35})`;
        if (link.kind === "related-doc") return `rgba(153, 102, 204, ${!visible ? 0.04 : dimmed ? 0.15 : 0.4})`;
        // A document's citation of a file, in the documents' violet lightened toward white, drawn from the document.
        if (link.kind === "cited-by") return `rgba(214, 178, 240, ${!visible ? 0.06 : dimmed ? 0.2 : 0.55})`;
        if (onPath) return "rgba(255, 255, 255, 0.9)";
        if (state.spatialLayout === "structure") return `rgba(255, 255, 255, ${visible ? 0.5 : 0})`;
        // Local wires at .3, the whole-root web at .16, the hovered file's at .5, a wire to the frontier at .12, so the few
        // wires a person is reading stand out. Every reference wire is white: the colour that ran along it from the file
        // that uses to the file that offers (2026-10-30) was withdrawn on 2026-10-31 at the owner's eye, and the hover's
        // words carry the direction. Under the history's emphasis a wire the step added or changed glows with its files.
        const alpha = !visible ? 0.025 : hovered ? 0.5 : dimmed ? 0.12 : rootOverview ? 0.16 : 0.3;
        return `rgba(255, 255, 255, ${emphasis === "none" ? alpha : emphasizedWireAlpha(alpha, changed, emphasis).toFixed(3)})`;
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
        // Among the pinned files and their connections, and the subject; not among an open directory's files, which
        // would draw the whole web over a directory opened whole (discovery, 2026-10-31).
        return pinnedScope.has(a) && pinnedScope.has(b);
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
    const interrupt = (): void => { following = false; historyCameraIntent = null; focusMotion = null; subjectAnchor = null; zoomMotion = null; };
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
        ring: () => null
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
    bindNodeActivation(focusLabel);
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
        options.onTogglePin(action.node.id);
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
      if (press && event.pointerId === press.pointerId && Math.hypot(event.clientX - press.x, event.clientY - press.y) > SPATIAL_DRAG_SLOP) {
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
      activateNode(id);
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
    if (!state.selectedNode || state.discovery) fit();
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
      const radius = spatialNodeRadius(node, state.tuning.forceGraph) * spatialSizeScale(instance.controls().target, camera, rect.height, state.tuning.forceGraph.nodeZoomResistance);
      const edge = point.clone().add(new Vector3(radius, 0, 0).applyQuaternion(camera.quaternion));
      const screenEdge = instance.graph2ScreenCoords(edge.x, edge.y, edge.z);
      return [{ id: node.id, name: node.name, x: rect.left + center.x, y: rect.top + center.y,
        radius: Math.abs(screenEdge.x - center.x), color: typeof colorForNode === "function" ? colorForNode(node) : "#888888" }];
    });
    return { files, links: instance.graphData().links.map(link => ({ source: resolveLinkEndpoint(link.source as string | { id: string }), target: resolveLinkEndpoint(link.target as string | { id: string }) })) };
  }

  function setMoment(next: HistoryMoment | null, renames: Renames, energy?: number, changes: HistoryChanges | null = next): void {
    const intent = historyCameraIntent;
    moment = next;
    historyChanges = changes;
    pendingRenames = composedRenames(pendingRenames, renames);
    pendingEnergy = energy;
    if (active && forceGraphInstance) render();
    if (intent) {
      following = true;
      fittingScope = intent === "scope";
      focusMotion = null;
      subjectAnchor = null;
    }
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
    reveal.shown = nextRevealCount(reveal.shown, reveal.order.length, state.tuning.forceGraph.revealFrames);
    const shown = shownData();
    setPiece(shown);
    // At zero energy nothing moves, while the pieces still enter, placed, one a frame.
    motion.stir();
  }

  function revealForTransition(nodeIds: readonly string[]): void {
    if (!forceGraphInstance || !motion) return;
    const next = revealCorresponding(reveal.order, reveal.shown, new Set(nodeIds));
    if (next.shown === reveal.shown) return;
    Object.assign(reveal, next);
    setPiece(shownData());
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
    simulationRunning = strength > 0 && shown.nodes.length > 0;
    requireElement("graph-svg").setAttribute("aria-busy", String(simulationRunning));
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
    if (!(at > 0) || !instance.graphData().nodes.length) {
      simulationRunning = false;
      container.setAttribute("aria-busy", "false");
      return;
    }
    motion.wake(start);
    simulationRunning = true;
    container.setAttribute("aria-busy", "true");
  }

  return { render, setActive, focusNode, focusDirectory, fit, keepInspectionVisible, getSubjectAnchor, placeSubjectAnchor, captureScene, revealForTransition, setMoment, settle, whenReady: () => ready ? Promise.resolve() : new Promise(resolve => readyWaiters.push(resolve)) };
}
