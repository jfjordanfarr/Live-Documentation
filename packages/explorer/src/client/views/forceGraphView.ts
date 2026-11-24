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
 * files the step changed glow or the rest dim, by the tuning; since 2026-11-11
 * inside the wrappers too, each change at the innermost thing drawn for it: a
 * dot, or the veiled bubble or skin that holds it (`emphasizeBodies`); since
 * 2026-11-19 what was asked about, a pin or the subject, is never dimmed by it.
 *
 * While the map builds (2026-11-15, the owner's decision), a body packing, the
 * reveal bringing spheres in, a perspective change or the camera's framing
 * flight that goes with them, its nodes take no hover and no click, a press is
 * dropped, and the container's `data-building` says so to the stylesheet; a
 * pointer that has not moved since building began starts nothing until its
 * first move (`forceGraphBuilding.ts`). `aria-busy` still says the settle.
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
 *
 * Since 2026-11-22, a trial for the owner's eye (Tuning's Scan Growth, off by default): the view can be fed today's
 * graph cut to the files a scan has finished so far, step after step through the same update path, so that the picture
 * fills while a person watches and explores (`scanGrowth.ts`, `scanGrowthPlay.ts`). While it is fed so the building
 * rule is suspended: the nodes take hover and press throughout, since the owner asked to explore during a scan of a
 * minute or more, where the rule was made for a transition of a few seconds.
 */

import { forceSimulation } from "d3-force-3d";
import { Matrix4, PerspectiveCamera, Vector3 } from "three";

import type { RelatedDocLink } from "../../shared/staticExplorerData";
import type {
  ExplorerGraphPayload,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../shared/types";
import { requireElement } from "../dom";
import type { HistoryChanges, HistoryMoment } from "../history/moment";
import { composedRenames, hasRenames, NO_RENAMES, rekeyedCaches, renamedId, type Renames } from "../history/rekey";
import { layoutSettingsOf } from "../layout-presets";
import { activePalette, marblesDrawn, rgba, whenPaletteChanges, type Colour } from "../palette";
import { CENTRE_ICON, DIRECTORY_ICON, iconButton, MORE_ICON, PIN_ICON } from "../panels/icon-button";
import { renderSpatialLegend } from "../panels/spatial-legend";
import type { ExplorerState } from "../types";
import { marbleCounts, marbleOf, marbleTint, spatialNodeStyle, type Marble, type MarbleCounts } from "./forceGraphAppearance";
import { SPATIAL_RING_OUTER_RADIUS, type SpatialWrapperUnit } from "./forceGraphBatches";
import { buildingPhase, nextBuilding, nodePointer, NOT_BUILDING, type Building } from "./forceGraphBuilding";
import { cornerPanelInsets, focusedCameraPosition, frameCameraSpheres, screenAnchorTranslation, wheelZoomCamera, type CameraPoint } from "./forceGraphCamera";
import { directoryNodeId, labelNamesOf, spatialGraphOf, type SpatialGraphData, type SpatialGraphNode, type SpatialLinkKind } from "./forceGraphData";
import { bodyChanges, deletionHomes, emphasizedSkin, emphasizedSphere, emphasizedUnits, emphasizedWireAlpha, glows, pairKey } from "./forceGraphEmphasis";
import { placeSpatialLabels, type SpatialLabel, type SpatialLabelBody, type LabelBox } from "./forceGraphLabels";
import { linkPulls, motionForce, placeNewSpheres, spatialNodeRadius, symbolCountOf, type MotionForce, type MotionStart, type Placed } from "./forceGraphLayout";
import { SPATIAL_DRAG_SLOP, SpatialRenderer } from "./forceGraphRenderer";
import { nextRevealCount, REVEAL, revealCorresponding, revealLayers } from "./forceGraphReveal";
import { componentLandmarks, connectedNeighbours, directoryHubOf, directoryMembersWithinHops, spatialScope, startHops, startOf, withoutUnreachedSeeds } from "./forceGraphScope";
import { bodySteps, pictureVeils, poppedAfter, releaseOf, shellId, shellPicture, structureCells, structureSpokes, veiledUnits, type BodyBuilding, type DirectoryShell, type Spoke,
  type StructureCell } from "./forceGraphShells";
import { spatialSizeScale } from "./forceGraphSizing";
import { BURST, burstProgress, ringedSpheres, wrappedSeeds, wrapperHull, type GroupShape, type WrapperHull } from "./forceGraphWrappers";
import { parentDirectory } from "./localView/directory-bands";
import { under } from "./localView/directory-state";
import type { ForceScene } from "./perspectiveTransition";
import { getVisibleConnections, EMPTY_PIN_SET, type PinSet } from "./pin-state";
import { NO_REST, restAt, restedOn, type PointerRest } from "./pointerRest";
import { wheelPixels } from "./wheel";

/**
 * Target milliseconds for the physics part of a frame once the first picture is on screen. A tick that needs more is
 * taken in parts across frames. Drawing and input have their own costs: this target alone is not a frame-time guarantee.
 */
const FRAME_BUDGET = 10;

/**
 * Target milliseconds a frame spends building the wrappers' hulls waiting to be drawn, at least one a frame (2026-11-05):
 * a hull costs one to three milliseconds, and this repository's first pinned picture asks for fifty at once.
 */
const WRAPPER_BUDGET = 8;

/**
 * Target milliseconds the frame that names new bodies spends packing them, and each frame after it while the picture
 * waits for the rest (2026-11-07, third round): a body's size is its node's in the field, so the picture that holds it
 * waits until it is packed, the page drawing meanwhile, rather than stalling one frame for the T3 sample's 722 bodies,
 * one to two seconds; a frame packs at least one bubble. Since the picture is built only once every body is packed,
 * how the packing is spread over frames changes nothing of the picture or its motion, only when it begins.
 */
const PACKING_BUDGET = 24;

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
  /** A structure spoke's rest length from its hub's packing, with Group Wrappers on (2026-11-08). */
  rest?: number;
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
  /** How many file-to-file reference links among currently shown files are not drawn as opaque wires in 3D Structure (2026-11-24). */
  onUnshownConnections?: (count: number) => void;
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
  /** Release a transition screen anchor and smoothly frame the 3D subject and neighborhood in the viewport. */
  settleIntoFrame(): void;
  /** Frame a file explicitly, for the retained-item tray, without changing the selected subject. */
  focusNode(nodeId: string): void;
  focusDirectory(directory: string): void;
  /** Fit the current path or retained scope without changing the exploration. */
  fit(): void;
  /** Keep newly opened evidence from covering the file being inspected, without changing its selected identity. */
  keepInspectionVisible(): void;
  /** The room the camera frames the picture in, within the view: beside the reader and clear of the history's controls. */
  cameraRoom(): { left: number; top: number; width: number; height: number };
  /**
   * Show a moment of the history in place of today, or today again (null), re-keying the picture through the renames
   * from the moment shown before; the change is fed at `energy`, or at the tuning's when none is given. Drawn at once
   * when the view is shown, else at its next render.
   */
  setMoment(moment: HistoryMoment | null, renames: Renames, energy?: number, changes?: HistoryChanges | null): void;
  /** The directories the Connections layout has popped open, the view's own memory; none where it draws no shells. */
  poppedGroups(): ReadonlySet<string>;
  /** Wrap every pop but these again, at the next render: Fold others away and Unpin others. */
  keepPoppedGroups(kept: ReadonlySet<string>): void;
  /** The nearest popped directory a file stands inside, or null: what "Wrap this group again" wraps. */
  groupHolding(nodeId: string): string | null;
  /** Wrap a popped directory again, with every pop beneath it, as its chip does. */
  wrapGroup(directory: string): void;
  /** Feed the standing picture at the tuning's energy, after a drag placed it without a tick. */
  settle(): void;
  /**
   * The scan trial (2026-11-22): show today's graph cut to the files a scan has finished so far, or today's whole graph
   * again (null). Drawn at once when the view is shown, else at its next render.
   */
  setArrived(graph: ExplorerGraphPayload | null): void;
  /** Whether a picture waits for its bodies to be packed, so that a feeder of pictures does not ask for the next before this one stands. */
  packing(): boolean;
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
  /** Today's graph cut to the files a scan has finished so far, while the scan trial plays; null otherwise (2026-11-22). */
  let arriving: ExplorerGraphPayload | null = null;
  /**
   * What a person asked about directly and the picture holds, the pins, the subject, the inspected file or hub, a path's
   * files; none while the picture is the layout's start. A step of the history never dims it (2026-11-19).
   */
  let askedAbout: ReadonlySet<string> = new Set();
  let pendingRenames: Renames = NO_RENAMES;
  let pendingEnergy: number | undefined;
  let membership = "";
  let forceSettings = "";
  let sizeSettings = "";
  let wireWidth: number | undefined;
  let reportedUnshown = -1;
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
  /** The spheres that wear a ring: with Group Wrappers Off, those with connections left out; with any wrapper on, none (2026-11-18). */
  let ringed = new Set<string>();
  /** The groups shown only by their seed: the seed's id to the group's size in files (2026-11-02). */
  let scopeGroups = new Map<string, number>();
  let frontierHop = Infinity;
  /**
   * The wrappers, the Group Wrappers experiment (2026-11-05): each wrapped body's phantom packing and hull, by a key of its
   * files and the sizes the tuning gives them, built as the picture asks for them; the nodes wrapped in the picture with
   * their keys, a group's seed or a directory shell; the wrappers bursting open, with the place a popped shell stood; the
   * places the files and shells a pop releases are born at; and the directories popped open, the view's own memory for
   * this experiment rather than the URL's.
   */
  const bodies = new Map<string, { shape: GroupShape; hull?: WrapperHull }>();
  let bodyWork: string[] = [];
  /**
   * The bodies a picture waits for, each part packed, by key (2026-11-07, third round), with the frame that packs on; and
   * the bodies of the bubbles a pop releases, taken from the popped body's packing, by the shell id each becomes.
   */
  let packing = new Map<string, BodyBuilding>();
  let packingFrame = 0;
  let releasedBodies = new Map<string, GroupShape>();
  /** The bodies the picture's budget veils (2026-11-07, third round): their skins show one veiled bubble, not their files. */
  let pictureVeiled = new Set<string>();
  const veiledShown = new WeakMap<GroupShape, SpatialWrapperUnit[]>();
  let wrapped = new Map<string, string>();
  /** A burst's clock starts at the first frame after its pop, since the pop's own render can outlast the burst (found 2026-11-05). */
  const bursts = new Map<string, { started: number | null; key: string; fit: number; place?: Placed }>();
  const bornAt = new Map<string, Placed>();
  let popped = new Set<string>();
  /** The directory shells of the picture, by id, and the names a popped directory keeps, a click on which wraps it again. */
  let shells = new Map<string, DirectoryShell>();
  /** The hidden files the pops show (2026-11-06): with the shells, drawn as bright as a shown file. */
  let released = new Set<string>();
  /**
   * The bubbles of the Structure layout (2026-11-07, the bag of cells), by their hubs' ids: each a hub the picture shows
   * none of whose children it shows, drawn as the body of what stands under its directory. Their pops are the opened
   * directories (`state.openDirectories`, the 2D's and the address's), never the view's own `popped`, the Connections'.
   */
  let cells = new Map<string, StructureCell>();
  /**
   * The files standing in their hubs' places, by id, with the names their hubs' chains give them: a hub at the frontier
   * with one file under it, which no bubble wraps since none may show one cell (the owner, 2026-11-07).
   */
  let loneNames = new Map<string, string>();
  /** Canonical single-file directory hubs replaced by their files in the Structure picture. */
  let directoryRepresentatives = new Map<string, string>();
  /** The bubbles popped for the picture waiting to be built, whose bursts have begun: a burst plays once, however long the wait. */
  let poppingCells = new Set<string>();
  /** The structure layout's spokes with Group Wrappers on (2026-11-08): each child's rest length and place about its hub. */
  let spokesOf: Map<string, Spoke> | null = null;
  /** What each shell's skin shows within it, with its files' colours, by its packing. */
  let shownUnits = new WeakMap<GroupShape, SpatialWrapperUnit[]>();
  // A palette chosen later (the colour pass, 2026-11-16): the files within a skin take their kinds' new colours, the
  // ground, lights and skins theirs, and every sphere, wire, ring and the key are read again. Nothing is laid out
  // again, and the camera and what is pinned stay as they are.
  whenPaletteChanges(() => {
    shownUnits = new WeakMap();
    fileLooks = new Map();
    const instance = forceGraphInstance;
    if (!instance) return;
    emphasizeBodies(instance.graphData().nodes);
    instance.repaint();
    refreshWrappers();
    drawLegend();
    pictureChanged();
  });
  /**
   * The step of the history inside the wrappers (2026-11-11, the owner's "Is it possible to still get the illumination of
   * the changed node even if it's buried deep in the bubbles?"): each wrapped body's units as the step colours them and how
   * its skin carries the step, by the body's node, with the units they were coloured from and what of the step they were
   * coloured for, so that a body is coloured again only when that changes; and the files each packing holds, by path.
   */
  let emphasized = new Map<string, { base: readonly SpatialWrapperUnit[] | undefined; key: string; units: readonly SpatialWrapperUnit[] | undefined; skin: { lit: boolean; alpha: number } }>();
  const bodyMembers = new WeakMap<GroupShape, ReadonlySet<string>>();
  const poppedChips = new Map<string, HTMLButtonElement>();
  /** The radius each popped directory's skin had when it was popped, which its name stands beside (2026-11-07, third round). */
  const poppedSkins = new Map<string, number>();
  let onScreenIds = new Set<string>();
  /** The room each wrapped group's seed keeps in the field, its wrapper's radius; a shell's body is its own radius. */
  let wrapperRoom = new Map<string, number>();
  /** Whether the renderer was last handed wrappers to draw: while off and never on, nothing of this is touched. */
  let wrappersHanded = false;
  let attentionAlpha: (id: string) => number = () => 1;
  let drawLegend = (): void => {};
  /**
   * Whether the picture is wrapped, by the tuning's choice: in the connections layout its unreached groups and its
   * directory shells, and since 2026-11-07 in the structure layout its hubs at the frontier, as bubbles (`cells`).
   */
  const wrapping = (): boolean => state.tuning.forceGraph.groupWrappers !== "off";
  /** Whether the connections layout's shells are drawn, whose pops are the view's own (`popped`). */
  const shelling = (): boolean => wrapping() && state.spatialLayout === "connections";
  const hullOf = (id: string): WrapperHull | undefined => {
    const key = wrapped.get(id) ?? bursts.get(id)?.key;
    return key === undefined ? undefined : bodies.get(key)?.hull;
  };
  /** A wrapped node's body, its packing built from the leaves when the picture names it (2026-11-06, second round). */
  const shapeOf = (id: string): GroupShape | undefined => {
    const key = wrapped.get(id) ?? bursts.get(id)?.key;
    return key === undefined ? undefined : bodies.get(key)?.shape;
  };
  /**
   * How much a wrapper is drawn smaller than its hull: never, since the second round of November 6, when a wrapped
   * group's skin, like a directory shell's, is drawn at its body's true size.
   */
  const fitOf = (id: string): number => bursts.get(id)?.fit ?? 1;
  /**
   * The scan's two counts of every file, for the marbles (2026-11-17): today's, or the moment's of the history shown,
   * never what the picture happens to show, so that a filter such as Show Tests repaints no ball.
   */
  let scanCounts: ReadonlyMap<string, MarbleCounts> = new Map();
  /** Each file's colour and marble under the palette in force and the scan's counts, by id, drawn afresh when either changes. */
  let fileLooks = new Map<string, { color: Colour; marble: Marble | null }>();
  /**
   * How a file or hub is coloured: its kind's colour; or, with the marbles on, a file's far tint, its glass and veins
   * mixed as from far away, with the marble drawn on it at close range. A hub is its kind's colour in both.
   */
  const fileLook = (id: string, archetype: string | undefined): { color: Colour; marble: Marble | null } => {
    let look = fileLooks.get(id);
    if (!look) {
      const marble = marblesDrawn() ? marbleOf(id, archetype, scanCounts) : null;
      fileLooks.set(id, look = { color: marble ? marbleTint(marble.glass, marble) : spatialNodeStyle(archetype).color, marble });
    }
    return look;
  };
  /** What a wrapped body's skin shows within it: every file, in its kind's colour, and every inner bubble. */
  const plainUnitsOf = (id: string): readonly SpatialWrapperUnit[] | undefined => {
    const shape = wrapped.has(id) ? shapeOf(id) : undefined;
    if (!shape?.units) return undefined;
    if (pictureVeiled.has(id)) {
      let veiled = veiledShown.get(shape);
      if (!veiled) veiledShown.set(shape, veiled = veiledUnits(shape));
      return veiled;
    }
    let units = shownUnits.get(shape);
    if (!units) shownUnits.set(shape, units = shape.units.map(unit => {
      if (unit.kind !== "file") return { ...unit, color: undefined };
      const look = fileLook(unit.id, unit.archetype);
      return { ...unit, color: look.color, ...(look.marble ? { marble: look.marble } : null) };
    }));
    return units;
  };
  /** What a wrapped body's skin shows within it, as the step of the history shown colours it (`emphasizeBodies`). */
  const unitsOf = (id: string): readonly SpatialWrapperUnit[] | undefined => {
    const plain = plainUnitsOf(id), coloured = emphasized.get(id);
    return coloured && coloured.base === plain ? coloured.units : plain;
  };
  /** How a wrapped body's skin carries the step of the history shown. */
  const PLAIN_SKIN = { lit: false, alpha: 1 };
  const skinOf = (id: string): { lit: boolean; alpha: number } => emphasized.get(id)?.skin ?? PLAIN_SKIN;
  /** Whether a node stands wrapped now: wrapping, and a group's seed or a directory shell with its hull built. */
  const isWrapped = (id: string): boolean => wrapping() && wrapped.has(id) && !!bodies.get(wrapped.get(id)!)?.hull;
  /** A ring marks connections beyond the picture, the sign of more only while no wrapper is drawn (`ringedSpheres`). */
  const hasRing = (id: string): boolean => ringed.has(id);
  /**
   * Whether a shown sphere is dimmed: at the last hop shown, or an unreached group's seed or a lone file one past it
   * (2026-11-18); never at hop 0. A directory shell and the files a pop shows stand one past the hops too, and are
   * never dimmed for it (2026-11-06): the shell is a body the eye should find at once, and what a pop releases is what was
   * asked to be seen. Nor is a bubble of the structure layout, which stands at the frontier as a shell does (2026-11-07).
   */
  const atFrontier = (id: string): boolean => {
    const hop = scopeHops.get(id);
    return hop !== undefined && hop > 0 && hop >= frontierHop && !shells.has(id) && !released.has(id) && !cells.has(id) && !loneNames.has(id);
  };
  let actionStrip: HTMLDivElement | null = null;
  let actionTargetId: string | null = null;
  let menuTargetId: string | null = null;
  let menuEpoch = 0;
  let inspectedActionId: string | null = null;
  let seenInspectionKey = "";
  /** The node the pointer touches now: it shows at once only that it can be pressed (the cursor, a wrapper's rim). */
  let pointerHoverId: string | null = null;
  /** The wire the pointer touches now, by its key, when it touches no node. */
  let touchedWire: string | null = null;
  /**
   * The pointer's rest (`pointerRest.ts`, 2026-11-19), and the node it has rested on, whose name, actions, lit wires
   * and the fading of the rest show; kept while the pointer crosses to that node's actions.
   */
  let rest: PointerRest = NO_REST;
  let restedId: string | null = null;
  /** A finger on the picture: a touch is deliberate, so what it touches is rested on at once. */
  let touching = false;
  /**
   * The building (2026-11-15, `forceGraphBuilding.ts`): when it began and when its work last stopped, the phase the
   * container shows, whether a perspective change into this view is playing, and whether the pointer has moved since
   * building last began, from where its events last stood.
   */
  let building: Building = NOT_BUILDING;
  let shownBuilding: "idle" | "begun" | "shown" = "idle";
  let transitioning = false;
  let movedSinceBuilding = false;
  let lastPointer: { x: number; y: number } | null = null;
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
  /**
   * Those waiting for the view to be ready: a frame drawn, and no picture waiting for its bodies to be packed, since a
   * picture that waits stands as it was and the perspective transition into it must see the picture it arrives at, not
   * the one before (the root's check of the third round, 2026-11-07).
   */
  const readyWaiters: Array<() => void> = [];
  /** The files a transition asked to reveal while the picture waited for its bodies; revealed once it is built. */
  let pendingReveal: readonly string[] | null = null;
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

  /** Whether the map is building now, as the container shows it. */
  const isBuilding = (): boolean => shownBuilding !== "idle";
  /** What the pointer may begin on a node now (`forceGraphBuilding.ts`). */
  const pointerMay = (): { hover: boolean; press: boolean } => nodePointer({ building: isBuilding(), movedSinceBuilding });

  /**
   * Look at the map's work and show the building it makes: `beginning` when a change of what is shown has just been
   * asked, which begins a building even when its picture is in at once. As building begins, a hover the pointer held
   * ends at once and the pointer counts as still; the wires' hover tooltip is a hover too.
   */
  function updateBuilding(beginning = false): void {
    const now = performance.now(), reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // While a scan fills the picture (the trial of 2026-11-22) the map does not build: every arrival is a change of what
    // is shown, and a rule that refuses the pointer for the length of a scan would refuse the exploring it was asked for.
    const work = !arriving && (beginning || transitioning || packing.size > 0 || reveal.shown < reveal.order.length);
    // The flight is the 650 ms from its start; a camera that follows without one, as when the picture has no room to be
    // framed in, is no flight (a history step built for ever so, measured on the scripted sample).
    const flight = !arriving && following && !!focusMotion && !reduced && now - focusMotion.started < 650;
    building = nextBuilding(building, { work, flight }, now);
    const phase = buildingPhase(building, now);
    if (phase === shownBuilding) return;
    const began = shownBuilding === "idle";
    shownBuilding = phase;
    const container = requireElement("graph-svg");
    if (phase === "idle") delete container.dataset.building;
    else container.dataset.building = phase;
    if (!began) return;
    movedSinceBuilding = false;
    window.clearTimeout(hideActionsTimer);
    overFocusLabel = false;
    pointerOverActions = false;
    releasePointerHover();
  }

  /**
   * Whether the pointer itself moved: a move to a new place, or the first move the page sees. An element moving under a
   * still pointer is given a `pointerover` at the same place, and no move (seen in Chromium on 2026-11-11), so it is none;
   * nor does a `pointerover` stand for the first place, which only a move gives.
   */
  function notePointer(event: PointerEvent): void {
    const at = { x: event.clientX, y: event.clientY };
    if (event.type !== "pointermove" && !lastPointer) return;
    if (!lastPointer || lastPointer.x !== at.x || lastPointer.y !== at.y) movedSinceBuilding = true;
    lastPointer = at;
  }

  /**
   * One application-owned pointer target, coalesced with the existing frame loop as the picture changes. What the
   * pointer touches shows at once only that it can be pressed: the cursor, and a wrapper's rim. Its name, its actions,
   * its lit wires, the fading of the rest and a wire's words wait until the pointer has rested on it (the owner,
   * 2026-11-19: no "random text at me every which way as I scroll my mouse across the screen"); the rest is looked at
   * every frame, since it ripens with time alone.
   */
  function updatePointerHover(): void {
    if (!forceGraphInstance || !pointerPosition || draggingNode || draggingCamera) return;
    // While the map builds, and after it until the pointer moves, nothing under the pointer begins a hover.
    if (!pointerMay().hover) { forceGraphInstance.hideWire(); return; }
    pickPointer();
    rest = restAt(rest, pointerHoverId ?? (touchedWire && `wire:${touchedWire}`), pointerPosition, performance.now());
    settleRest();
  }

  /** What the pointer touches, picked again only when the pointer, the picture or the camera has changed. */
  function pickPointer(): void {
    const instance = forceGraphInstance!, at = pointerPosition!;
    const canvas = instance.renderer().domElement;
    const frame = canvas.getBoundingClientRect();
    const camera = instance.camera();
    camera.updateMatrixWorld();
    const pointed = document.elementFromPoint(at.x, at.y);
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
    const id = onCanvas ? nodeAt(at.x, at.y) ?? null
      : pointed && actionStrip?.contains(pointed) ? actionTargetId
      : pointed instanceof HTMLElement && pointed.matches(".force-graph-focus, .force-graph-label") ? pointed.dataset.nodeId ?? null : null;
    const wire = onCanvas && !id ? instance.wireAt(at.x, at.y) : undefined;
    touchedWire = wire ? linkKey(wire) : null;
    const container = requireElement("graph-svg");
    const hovered = String(!!id);
    if (container.dataset.hoveredNode !== hovered) container.dataset.hoveredNode = hovered;
    if (pointerHoverId === id) return;
    const rim = (pointerHoverId !== null && isWrapped(pointerHoverId)) || (id !== null && isWrapped(id));
    pointerHoverId = id;
    if (rim) { styleWrappers(); pictureChanged(); }
  }

  /** Whether a point is on the way into the actions shown, or on them: the grace that lets a pointer reach them. */
  function nearActions(at: { x: number; y: number }): boolean {
    if (pointerOverActions) return true;
    if (!actionStrip || actionStrip.hidden) return false;
    const box = actionStrip.getBoundingClientRect();
    return at.x >= box.left - 24 && at.x <= box.right + 24 && at.y >= box.top - 32 && at.y <= box.bottom + 32;
  }

  /**
   * Show what the pointer has rested on, and let go at once of what it has left; but a node whose actions the pointer
   * is crossing to keeps them, so that a person heading for Pin, Centre or More reaches them across the gap and over
   * any other sphere on the way.
   */
  function settleRest(): void {
    const rested = touching ? rest.on : restedOn(rest, performance.now());
    if (rested?.startsWith("wire:")) forceGraphInstance?.showWireAt(pointerPosition!.x, pointerPosition!.y);
    else forceGraphInstance?.hideWire();
    const node = rested?.startsWith("wire:") ? null : rested;
    if (node === restedId) return;
    if (node === null && pointerPosition && nearActions(pointerPosition)) return;
    restedId = node;
    window.clearTimeout(hideActionsTimer);
    hoveredId = node ?? menuTargetId ?? keyboardActionTarget();
    updateAttention();
    refreshActionStrip();
  }

  function releasePointerHover(): void {
    forceGraphInstance?.hideWire();
    pointerPosition = null;
    const rim = pointerHoverId !== null && isWrapped(pointerHoverId);
    pointerHoverId = null;
    touchedWire = null;
    rest = NO_REST;
    restedId = null;
    if (rim) styleWrappers();
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

  /**
   * Release a 2D -> 3D transition screen anchor and smoothly frame the 3D subject and neighborhood in the viewport,
   * symmetric with `localView.settleIntoFrame()` on 3D -> 2D so off-center 2D cards never strand the 3D graph in a corner.
   */
  function settleIntoFrame(): void {
    subjectAnchor = null;
    if (!forceGraphInstance) return;
    focusMotion = null;
    framedPicture = "";
    fittingScope = false;
    following = true;
    if (active) updateFocus(performance.now());
  }

  function setActive(value: boolean): void {
    if (value && !active && focusMotion && pausedAt) focusMotion.started += performance.now() - pausedAt;
    // Shown again after a perspective change has played: its spheres enter now, and the building goes on with them.
    if (value && !active) transitioning = false;
    if (!value && active) {
      pausedAt = performance.now();
      zoomMotion = null;
      cancelGesture();
    }
    active = value;
    forceGraphInstance?.setActive(value);
    if (value) {
      if (!animation && forceGraphInstance) animation = requestAnimationFrame(animateFocus);
      // A picture waiting for its bodies packs on while the view is shown.
      if (!packingFrame && packing.size) packingFrame = requestAnimationFrame(packOn);
    } else {
      cancelAnimationFrame(animation);
      animation = 0;
      cancelAnimationFrame(packingFrame);
      packingFrame = 0;
    }
  }

  function animateFocus(): void {
    animation = 0;
    const instance = forceGraphInstance;
    if (!active || !instance) return;
    if (simulationRunning && motion) {
      simulation.tick();
      if (motion.revision !== motionRevision) { motionRevision = motion.revision; pictureChanged(); }
      // How many substeps the motion has taken, a settle's own measure, which no longer counts in frames (2026-11-19).
      const substeps = String(Math.floor(motion.evaluations));
      const container = requireElement("graph-svg");
      if (container.dataset.motionSubsteps !== substeps) container.dataset.motionSubsteps = substeps;
    }
    ready = true;
    requireElement("graph-svg").setAttribute("aria-busy", String(simulationRunning || packing.size > 0));
    frameDirectory();
    buildBodies();
    advanceBursts();
    instance.updateControls();
    updateFocus(performance.now());
    updateBuilding();
    instance.draw(pictureRevision);
    updatePointerHover();
    spheresOnScreen = instance.graphData().nodes.length;
    grow();
    if (!packing.size) for (const resolve of readyWaiters.splice(0)) resolve();
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
        .map(node => ({ center: { x: node.x!, y: node.y!, z: node.z! }, radius: Math.max(spatialNodeRadius(node, state.tuning.forceGraph)
          * spatialSizeScale(controls.target, camera, instance.height(), state.tuning.forceGraph.nodeZoomResistance), isWrapped(node.id) ? hullOf(node.id)!.radius * fitOf(node.id) : 0) }));
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
    const labelBodies: SpatialLabelBody[] = [];
    const measuring: Array<Omit<SpatialLabel, "width" | "height"> & { label: HTMLButtonElement; name: string }> = [];
    const buttons = new Map<string, HTMLButtonElement>();
    // A directory's framing scope includes its entire subtree, but its deep descendants are not all label priorities.
    const projection = new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    const point = new Vector3(), projected = new Vector3(), edge = new Vector3();
    const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const sphereScale = spatialSizeScale(instance.controls().target, camera, frame.height, state.tuning.forceGraph.nodeZoomResistance);
    for (const node of instance.graphData().nodes) {
      if (!Number.isFinite(node.x)) continue;
      point.set(node.x!, node.y!, node.z);
      projected.copy(point).applyMatrix4(projection);
      const x = (projected.x + 1) * frame.width / 2, y = (1 - projected.y) * frame.height / 2;
      if (projected.z < -1 || projected.z > 1) continue;
      edge.copy(point).addScaledVector(right, spatialNodeRadius(node, state.tuning.forceGraph)).applyMatrix4(projection);
      const perspectiveRadius = Math.abs(edge.x - projected.x) * frame.width / 2;
      const basePriority = labelPriorities.get(node.id) ?? 5;
      const priority = node.id === focusedId ? 0 : node.id === hoveredId || node.id === inspectedActionId ? 1 : basePriority;
      // A shell is drawn at its body's size, whatever the zoom's resistance does to a sphere. A ring belongs to the
      // same visible identity and extends beyond its sphere; use the renderer's outer edge for both label clearances.
      const radius = (node.shellFiles !== undefined ? perspectiveRadius
        : perspectiveRadius * sphereScale)
        * (hasRing(node.id) ? SPATIAL_RING_OUTER_RADIUS : 1);
      // Bodies reserve room even without an eligible name, including a body whose edge enters the viewport.
      if (x + radius < 0 || y + radius < 0 || x - radius > frame.width || y - radius > frame.height) continue;
      labelBodies.push({ id: node.id, x, y, radius, priority });
      if (x < 0 || y < 0 || x > frame.width || y > frame.height) continue;
      // Disclosure follows proximity, at the tuning's size (2026-11-02; six pixels before, which named far too much):
      // resistance changes the sphere's outline, not when a name becomes useful.
      if (priority >= 5 && perspectiveRadius < state.tuning.forceGraph.nameAt) continue;
      let label = node.id === focusedId ? focusLabel : nameLabels.get(node.id);
      if (!label) {
        label = document.createElement("button");
        label.type = "button";
        label.className = "force-graph-label";
        label.dataset.nodeId = node.id;
        bindNodeActivation(label);
        label.addEventListener("pointerenter", () => { if (!pointerMay().hover) return; overFocusLabel = true; window.clearTimeout(hideActionsTimer); });
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
      const title = (node.shellFiles !== undefined ? `${node.codeRelativePath || "Scan root"} · ${node.shellFiles.toLocaleString("en-US")} files`
        : node.directoryPath !== undefined ? `${node.directoryPath || "Scan root"} · ${node.directoryFileCount} visible files`
        : node.id.startsWith("related:") ? `${node.codeRelativePath}${hasBundledDoc(node.id.slice(8)) ? "" : " · not in this bundle"}`
        : `${node.codeRelativePath} · ${count} public ${count === 1 ? "symbol" : "symbols"}`)
        + (scopeGroups.has(node.id) && scopeGroups.get(node.id)! > 1 ? ` · ${scopeGroups.get(node.id)!.toLocaleString("en-US")} files in this group` : "")
        + (more ? ` · ${more} more connected, not shown` : "")
        + (action?.kind === "file" ? ` · ${retained ? "Unpin this file" : discovered ? "Release this discovery" : isWrapped(node.id) ? "Open this group and pin this file" : "Pin this file"}`
          : action?.kind === "directory" ? ` · ${cells.has(node.id) ? "Open this directory" : discovered ? "Release this discovery" : "Explore this directory"}`
          : action?.kind === "shell" ? " · Open this shell" : "");
      if (label.title !== title) label.title = title;
      label.dataset.nodeId = node.id;
      label.dataset.kind = node.shellFiles !== undefined ? "shell" : node.directoryPath !== undefined ? "directory" : "file";
      if (action) label.setAttribute("aria-pressed", String(retained || discovered));
      else label.removeAttribute("aria-pressed");
      label.dataset.priority = String(priority);
      label.dataset.context = String(atFrontier(node.id));
      const size = labelSizes.get(label);
      if (!size || size.text !== name || size.availableWidth !== frame.width) label.hidden = false;
      measuring.push({ id: node.id, x, y, radius, priority, label, name });
      buttons.set(node.id, label);
    }
    // A popped directory keeps its name, dimmed, at the centroid of what it released, a click on which wraps it again
    // (2026-11-05). Since the third round of 2026-11-07 the name stands beside the skin the directory had, as a file's
    // beside its sphere, that skin's radius about that centroid, so that it no longer lands on the bubble it released,
    // whose own name stood beside it at nearly one place, and the names of directories popped one inside another stand
    // apart at their skins' sizes. What it released is the hidden files the pops show and the shells under it, never a
    // file the picture showed anyway, which may stand anywhere in it.
    for (const [directory, chip] of poppedChips) if (!shelling() || !popped.has(directory)) { chip.remove(); poppedChips.delete(directory); }
    if (shelling()) for (const directory of [...popped].sort()) {
      const beneath = instance.graphData().nodes.filter(node => Number.isFinite(node.x) && under(node.codeRelativePath, directory));
      const releasedHere = beneath.filter(node => released.has(node.id) || node.shellFiles !== undefined);
      const inside = releasedHere.length ? releasedHere : beneath;
      if (!inside.length) continue;
      let sx = 0, sy = 0, sz = 0;
      for (const node of inside) { sx += node.x!; sy += node.y!; sz += node.z!; }
      point.set(sx / inside.length, sy / inside.length, sz / inside.length);
      projected.copy(point).applyMatrix4(projection);
      const x = (projected.x + 1) * frame.width / 2, y = (1 - projected.y) * frame.height / 2;
      if (projected.z < -1 || projected.z > 1 || x < 0 || y < 0 || x > frame.width || y > frame.height) continue;
      edge.copy(point).addScaledVector(right, poppedSkins.get(directory) ?? 0).applyMatrix4(projection);
      const radius = Math.abs(edge.x - projected.x) * frame.width / 2;
      let chip = poppedChips.get(directory);
      if (!chip) {
        chip = document.createElement("button");
        chip.type = "button";
        chip.className = "force-graph-label";
        chip.dataset.kind = "popped";
        chip.dataset.context = "true";
        chip.dataset.directory = directory;
        const whole = directory || "Scan root";
        chip.title = `${whole} · opened · Wrap its files again`;
        chip.setAttribute("aria-label", `Wrap ${whole} again`);
        chip.addEventListener("click", event => { if (event.detail === 0 || !isBuilding()) wrapShell(directory); });
        container.append(chip);
        poppedChips.set(directory, chip);
      }
      const name = directory.split("/").pop() || "Scan root", id = `popped:${directory}`;
      if (chip.textContent !== name) { chip.textContent = name; labelSizes.delete(chip); }
      const size = labelSizes.get(chip);
      if (!size || size.text !== name || size.availableWidth !== frame.width) chip.hidden = false;
      measuring.push({ id, x, y, radius, clear: 0, priority: 4, label: chip, name });
      buttons.set(id, chip);
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
    const placements = placeSpatialLabels(candidates, { width: frame.width, height: frame.height }, obstacles, labelSides, labelBodies);
    labelSides = new Map([...placements].map(([id, box]) => [id, box.side]));
    for (const label of [focusLabel, ...nameLabels.values()]) {
      const id = label.dataset.nodeId ?? "";
      label.hidden = buttons.get(id) !== label || !placements.has(id);
    }
    for (const [directory, chip] of poppedChips) chip.hidden = !placements.has(`popped:${directory}`);
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
  function currentAction(id: string): { kind: "file"; node: ExplorerNodePayload } | { kind: "directory"; directory: string } | { kind: "shell"; directory: string } | null {
    const rendered = nodeCache.get(id);
    if (!rendered || !forceGraphInstance?.hasNode(id)) return null;
    const shell = shells.get(id);
    if (shell) return { kind: "shell", directory: shell.directory };
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
      // The keyboard's activation stays live while the map builds; the pointer's is dropped (2026-11-15).
      const id = event.detail === 0 ? button.dataset.nodeId : down && !down.moved && !isBuilding() ? down.id : null;
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
      if (action?.kind === "file" && isWrapped(id) && !isRetainedFile(action.node.id)) popWrapper(id);
      if (action?.kind === "shell") popShell(action.directory);
      // A bubble of the structure layout opens its directory, as a shell pops (2026-11-07); a hub explores its own.
      else if (action?.kind === "directory" && cells.has(id)) options.onOpenDirectory(action.directory);
      else if (action?.kind === "directory") options.onToggleDirectory(action.directory);
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

  /**
   * Keep the accessible controls with the sphere while the simulation or camera moves: a thing's actions go with what
   * they act on, except under the pointer or an open menu, where they stand still on the screen so that a settling
   * sphere does not pull a control away from a person aiming at it. Keyboard focus is no place on the screen, and goes
   * with the control; a control holding it is not hidden from under it. Until 2026-11-20 keyboard focus held the actions
   * still on the screen too, so that the camera's flight left them behind over whatever it brought under them: Centre
   * on in the reader gives focus back to More, and the file it centred came to rest under its own actions, which hid
   * its name.
   */
  function positionActionStrip(): void {
    if (!actionStrip || !actionTargetId || !forceGraphInstance) return;
    if (draggingNode || draggingCamera) { actionStrip.hidden = true; return; }
    if (!actionStrip.hidden && (menuTargetId || pointerOverActions)) return;
    const focusHeld = !actionStrip.hidden && actionStrip.contains(document.activeElement);
    const node = nodeCache.get(actionTargetId);
    if (!node || !Number.isFinite(node.x) || !Number.isFinite(node.y) || !Number.isFinite(node.z)) {
      if (!focusHeld) actionStrip.hidden = true;
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
      if (!focusHeld) actionStrip.hidden = true;
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
    const id = menuTargetId ?? (held ? actionTargetId : keyboardActionTarget() ?? restedId ?? inspectedActionId ?? (document.activeElement === focusLabel ? focusedId : null));
    const action = id ? currentAction(id) : null;
    if (!id || !action) {
      actionStrip.hidden = true;
      actionTargetId = null;
      return;
    }
    actionTargetId = id;
    actionStrip.hidden = false;
    primaryAction.dataset.kind = action.kind === "shell" ? "directory" : action.kind;
    // A shell offers its pop alone: it is no file to centre on, and its directory's actions stand on the directory.
    centreAction.hidden = moreAction.hidden = action.kind === "shell";
    if (action.kind === "shell") {
      const name = action.directory || "Scan root";
      actionStrip.setAttribute("aria-label", `Actions for the shell of ${name}`);
      primaryAction.setAttribute("aria-label", `Open the shell of ${name}`);
      primaryAction.setAttribute("aria-pressed", "false");
      primaryAction.title = "Open this shell into its files and the shells of its subdirectories";
    } else if (action.kind === "directory") {
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
      if (restedId || pointerOverActions || overFocusLabel) return;
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

  /**
   * The rectangular space left by evidence and timeline controls; a full-screen reader leaves framing unchanged. The
   * history's step panel, in the top left corner, takes the room beside it, or, where too little would be left there,
   * the room above its lower edge (`cornerPanelInsets`, 2026-11-11, when the panel became a few lines high).
   */
  function cameraInsets(): { left: number; right: number; top: number; bottom: number } {
    const frame = requireElement("graph-svg").getBoundingClientRect();
    const inset = { left: 0, right: 0, top: 0, bottom: 0 };
    const reader = document.querySelector<HTMLElement>("#detail-panel.visible");
    if (reader) inset.right = Math.max(0, Math.min(frame.width, reader.offsetWidth));
    if (frame.width - inset.right < 240) inset.right = 0;
    for (const controls of document.querySelectorAll<HTMLElement>(".perspective-controls:not([hidden]), .history-scrubber:not([hidden])")) {
      const box = controls.getBoundingClientRect();
      if (box.width && box.top > frame.top && box.bottom <= frame.bottom + 1) inset.bottom = Math.max(inset.bottom, frame.bottom - box.top);
    }
    const history = document.querySelector<HTMLElement>(".history-step-panel:not([hidden])");
    if (history) {
      const box = history.getBoundingClientRect();
      Object.assign(inset, cornerPanelInsets({ width: frame.width - inset.right, height: frame.height - inset.bottom }, { right: box.right - frame.left, bottom: box.bottom - frame.top }));
    }
    return inset;
  }

  /** The room the camera frames the picture in, within the view: what the evidence and the history's controls leave uncovered. */
  function cameraRoom(): { left: number; top: number; width: number; height: number } {
    const frame = requireElement("graph-svg").getBoundingClientRect(), inset = cameraInsets();
    return { left: inset.left, top: inset.top, width: frame.width - inset.left - inset.right, height: frame.height - inset.top - inset.bottom };
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
      if (restedId) restedId = renamedId(restedId, pendingRenames);
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
    const source = moment?.graph ?? arriving ?? graphData;
    // The marbles' counts are the scan's: a moment of the history has its own, and the files within the skins take them.
    const counts = marbleCounts(source);
    if (counts !== scanCounts) { scanCounts = counts; fileLooks = new Map(); shownUnits = new WeakMap(); }
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
    // The files a scan has finished so far, while the scan trial plays: what a test and a person's tools can read.
    if (arriving && !moment) container.dataset.scanArrived = String(arriving.nodes.length); else delete container.dataset.scanArrived;

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
    // The bag of cells (2026-11-07): in the structure layout with Group Wrappers on, an opened directory is asked about as
    // its hub alone, so that it stands with its hops around it, its files and its subdirectories' bubbles, as the 2D opens
    // a directory one level deep, and the start stands with it; what lies deeper stands in the bubbles (`cells`).
    const cellsMode = wrapping() && state.spatialLayout === "structure";
    // Whole is the scan root opened: unlike an ordinary bubble, it asks for every filtered file and hub.
    const wholeRoot = directories.includes("");
    if (cellsMode && !wholeRoot) for (const directory of directories) {
      const hub = directoryHubOf(data.nodes, directory);
      if (hub) members.add(hub);
    }
    else for (const node of data.nodes) {
      if (node.directoryPath === undefined ? directories.some(directory => under(node.id, directory))
        : directories.some(directory => node.directoryPath === directory || under(node.directoryPath!, directory))) members.add(node.id);
    }
    if (path?.length) { asked.clear(); members.clear(); for (const id of path) asked.add(id); }
    const inPicture = new Set(data.nodes.map(node => node.id));
    for (const id of asked) if (!inPicture.has(id)) asked.delete(id);
    const hasQuestion = todayPins.entries.length > 0 || !!subject || (directories.length > 0 && (!cellsMode || wholeRoot)) || !!discovery || !!path?.length;
    const absentRequest = hasQuestion && asked.size === 0 && members.size === 0;
    askedAbout = hasQuestion ? new Set(asked) : new Set();
    if (!hasQuestion) for (const id of startOf(data.nodes, data.links, state.spatialLayout, pulls)) asked.add(id);
    // The hops shown: around a question the tuning's; around a start what the start shows, the archipelago's seeds
    // alone and the root with its children (2026-11-02).
    const hopsShown = hasQuestion ? state.tuning.forceGraph.hops : startHops(state.spatialLayout, state.tuning.forceGraph.hops);
    // Beyond the Hops at the next step, a trial (2026-11-18, the horizon): with wrappers on in the connections layout while
    // something is asked about, the unreached groups' seeds are not drawn and the shells hold only the files one step
    // past what stands (`nextStepFiles`). The start, the structure layout and Group Wrappers Off are as before.
    const horizon = hasQuestion && wrapping() && state.spatialLayout === "connections" && state.tuning.forceGraph.beyondHops === "next-step";
    const reached = spatialScope(data.nodes, data.links, new Set([...asked, ...members]), hopsShown, pulls);
    const scope = horizon ? withoutUnreachedSeeds(reached, hopsShown) : reached;
    // While a scan fills the picture, a group's seed is whichever of its files is the most connected so far, so a group
    // changes its seed as it grows and two groups become one under a third file. The new seed is born where the group
    // stood, at the seed that held the most room among its files, and not outside the mass as a stranger is.
    if (arriving) for (const [seed, files] of scope.groupFiles) {
      if (onScreenIds.has(seed) || bornAt.has(seed)) continue;
      let stood: ForceGraphNode | undefined, room = -1;
      for (const file of files) {
        const node = onScreenIds.has(file) ? nodeCache.get(file) : undefined;
        if (!node || !Number.isFinite(node.x) || !Number.isFinite(node.y) || !Number.isFinite(node.z)) continue;
        const held = wrapperRoom.get(file) ?? 0;
        if (held > room) { stood = node; room = held; }
      }
      if (stood) bornAt.set(seed, { x: stood.x!, y: stood.y!, z: stood.z! });
    }
    // The wrappers (2026-11-05): in the connections layout, by the tuning's choice, every group the picture shows only by
    // its seed, of two files or more, and, inside the groups it shows in part, the directory shells of the files it leaves
    // out, each one body of the picture with its members' references bundled into its wires; the files a pop releases
    // join the picture one past the hops shown, as the unreached groups' seeds stand. Each body's packing is built once
    // for its files and sizes before the picture that names it, and its hull a few a frame after (`buildBodies`); the
    // page's timeline measures this partition as "live-docs:shells" and each frame's hulls as "live-docs:wrapper-hulls".
    // In the structure layout (2026-11-07) the bodies are the bubbles of its hubs at the frontier (`cells`), packed alike.
    const building = performance.now();
    const nextWrapped = new Map<string, string>();
    const shellNodes: SpatialGraphNode[] = [];
    let shellWires: SpatialGraphData["links"] = [];
    if (wrapping()) {
      const tuning = { ...state.tuning.forceGraph }, sizes = JSON.stringify([tuning.nodeSize, tuning.symbolScale]);
      const byId = new Map(data.nodes.map(node => [node.id, node]));
      const keyOf = (files: readonly string[]): string => `${sizes}\0${files.map(file => `${file}\u0001${byId.has(file) ? symbolCountOf(byId.get(file)!) : 0}`).join("\0")}`;
      const named: Array<{ id: string; key: string; files: readonly string[]; centre?: string; directory?: string }> = [];
      let held: ReturnType<typeof shellPicture> | null = null, heldCells: StructureCell[] = [], lone: ReturnType<typeof structureCells>["lone"] = [];
      if (cellsMode) {
        // The structure layout's bubbles (2026-11-07): one hub tree, no islands and no shells. A hub that was a bubble
        // and stands open now, its directory opened, pops: what its skin showed enters where the skin showed it, its
        // subdirectories' bubbles with their packings, so that the pop waits for nothing.
        // An absent request keeps the scope's dim root marker, without turning it into a container of unrelated files.
        if (!absentRequest) {
          ({ cells: heldCells, lone } = structureCells(data.nodes, data.links, new Set(scope.hops.keys())));
          const still = new Set(heldCells.map(cell => cell.id));
          for (const id of cells.keys()) if (!still.has(id) && scope.hops.has(id)) popCell(id);
        }
        for (const cell of heldCells) named.push({ id: cell.id, key: `cell\0${cell.directory}\0${keyOf(cell.files)}`, files: cell.files, directory: cell.directory });
      } else {
        for (const seed of wrappedSeeds(scope.groups)) {
          const files = scope.groupFiles.get(seed) ?? [];
          named.push({ id: seed, key: `group\0${seed}\0${keyOf(files)}`, files, centre: seed });
        }
        held = shellPicture({ nodes: byId, links: data.links, shown: new Set(scope.hops.keys()), hidden: scope.hidden,
          depth: tuning.shellDepth, popped, beside: scope.beside, reach: horizon ? "next-step" : "everything",
          bundles: link => pulls(link) && link.kind !== "related-doc" && link.kind !== "cited-by" });
        for (const shell of held.shells) named.push({ id: shell.id, key: `shell\0${shell.directory}\0${keyOf(shell.files)}`, files: shell.files, directory: shell.directory });
      }
      // A body's packing is built from the leaves before the picture that names it, since its radius is its node's size in
      // the field (2026-11-07, third round): what fits in the frame's budget at once, the rest a few bubbles a frame while
      // the picture waits, as it stands, and this render returns. A bubble a pop releases is the shell of its directory
      // packed as the popped body packed it, so a pop waits for nothing.
      const next = new Map<string, BodyBuilding>();
      for (const body of named) {
        if (bodies.has(body.key) || next.has(body.key)) continue;
        const kept = releasedBodies.get(body.id), files = kept && new Set(body.files);
        if (kept && files && kept.members.length === files.size && kept.members.every(member => files.has(member.id))) {
          bodies.set(body.key, { shape: kept });
          continue;
        }
        next.set(body.key, packing.get(body.key) ?? bodySteps(body.id, body.files.flatMap(file => byId.get(file) ?? []), tuning, body.centre, body.directory));
      }
      packing = next;
      releasedBodies = new Map();
      if (!packBodies()) {
        pendingEnergy = energy;
        container.setAttribute("aria-busy", "true");
        updateBuilding(true);
        if (!packingFrame) packingFrame = requestAnimationFrame(packOn);
        return;
      }
      const hulling = performance.now();
      for (const body of named) {
        nextWrapped.set(body.id, body.key);
        const built = bodies.get(body.key)!;
        // While a scan fills the picture, a group that gains a file is a new body: its skin is built before the frame
        // that would draw it without one, within the frame's share for hulls, so that a growing skin does not blink.
        if (arriving && !built.hull && isWrapped(body.id) && performance.now() - hulling < WRAPPER_BUDGET) built.hull = wrapperHull(built.shape, built.shape.margin ?? 0);
        if (!built.hull && !bodyWork.includes(body.key)) bodyWork.push(body.key);
      }
      if (held) {
        shellWires = held.wires;
        released = new Set(held.released);
        scopeHops = new Map(scope.hops);
        // What a pop shows, and the lone files (2026-11-18): the only file of a directory beyond the hops, which makes no
        // shell, stands for itself where its shell would stand, one past the hops, dimmed as the frontier is since it is
        // not among what a pop shows, and a press on it pins it as a press on any dimmed sphere asks about it. Until then
        // it was not drawn, and its shown neighbour wore a ring for it.
        for (const id of [...held.released, ...held.lone]) scopeHops.set(id, hopsShown + 1);
        scopeBeyond = held.beyond;
        shells = new Map(held.shells.map(shell => [shell.id, shell]));
        cells = new Map(); loneNames = new Map(); directoryRepresentatives = new Map(); spokesOf = null;
        for (const shell of held.shells) {
          const body = bodies.get(nextWrapped.get(shell.id)!)!.shape;
          scopeHops.set(shell.id, hopsShown + 1);
          shellNodes.push({ id: shell.id, name: shell.name, codePath: shell.directory, codeRelativePath: shell.directory,
            docPath: "", docRelativePath: "", archetype: "shell", shellFiles: shell.files.length, shellBody: body.radius, publicSymbols: [], dependencies: [], dependents: [], missingDependencies: [] });
        }
      } else {
        // A bubble is its hub's node, at its body's size and named by what it holds; its skin says there is more.
        shells = new Map(); released = new Set(); poppingCells = new Set();
        cells = new Map(heldCells.map(cell => [cell.id, cell]));
        scopeHops = new Map(scope.hops);
        for (const cell of heldCells) {
          const hub = byId.get(cell.id)!;
          hub.shellFiles = cell.files.length;
          hub.shellBody = bodies.get(nextWrapped.get(cell.id)!)!.shape.radius;
        }
        // A hub of one file is that file, at the hub's hop and on its wire, named by the hub's chain and its own name.
        loneNames = new Map();
        directoryRepresentatives = new Map(lone.map(({ hub, file }) => [hub, file]));
        for (const { hub, file, parent } of lone) {
          scopeHops.set(file, scopeHops.get(hub)!);
          scopeHops.delete(hub);
          loneNames.set(file, `${byId.get(hub)!.name}/${byId.get(file)?.name ?? file}`);
          if (parent !== undefined && scopeHops.has(parent)) shellWires.push({ source: parent, target: file, kind: "containment", count: 1, forward: 1, backward: 0 });
        }
        scopeBeyond = new Map([...scope.beyond].filter(([id]) => !cells.has(id) && !loneNames.has(id) && scopeHops.has(id)));
        // Each open hub packed with its children about it, a bubble at its body's size, apart by the link gap: the spokes (2026-11-08).
        spokesOf = structureSpokes([...data.links, ...shellWires], new Set(scopeHops.keys()), id => spatialNodeRadius(byId.get(id)!, tuning), tuning.linkGap);
      }
    } else {
      cancelPacking();
      scopeHops = scope.hops;
      scopeBeyond = scope.beyond;
      shells = new Map(); released = new Set(); cells = new Map(); loneNames = new Map(); directoryRepresentatives = new Map(); spokesOf = null;
    }
    ringed = ringedSpheres(scopeBeyond, state.tuning.forceGraph.groupWrappers);
    scopeGroups = scope.groups;
    frontierHop = hopsShown;
    wrapped = nextWrapped;
    // Each body's hop from what was asked about, for the picture's budget: a wrapped group's seed stands at its own hop;
    // a shell at the nearest hop of a shown file its wires join, or one past a shell's that joins it, or none.
    const bodyHop = new Map<string, number>();
    for (const id of wrapped.keys()) if (!shells.has(id) && scope.hops.has(id)) bodyHop.set(id, scope.hops.get(id)!);
    const between: Array<[string, string]> = [];
    for (const wire of shellWires) {
      const [a, b] = [wire.source, wire.target];
      for (const [shell, other] of [[a, b], [b, a]] as const) {
        if (!shells.has(shell)) continue;
        if (shells.has(other)) between.push([shell, other]);
        else if (scope.hops.has(other)) bodyHop.set(shell, Math.min(bodyHop.get(shell) ?? Infinity, scope.hops.get(other)!));
      }
    }
    for (let settled = false; !settled;) {
      settled = true;
      for (const [shell, other] of between) {
        const through = bodyHop.get(other);
        if (through !== undefined && through + 1 < (bodyHop.get(shell) ?? Infinity)) { bodyHop.set(shell, through + 1); settled = false; }
      }
    }
    pictureVeiled = pictureVeils([...wrapped].map(([id, key]) => {
      const shape = bodies.get(key)!.shape;
      // A whole group is one the picture shows only by its seed: the start's largest is its main body, veiled last.
      return { id, files: shape.files ?? 0, drawn: shape.units?.filter(unit => unit.kind === "file").length ?? 0, hop: bodyHop.get(id), whole: !shells.has(id) && !cells.has(id) };
    }));
    const wanted = new Set(wrapped.values());
    bodyWork = bodyWork.filter(key => wanted.has(key)).sort((a, b) => (bodies.get(a)!.shape.files ?? 0) - (bodies.get(b)!.shape.files ?? 0) || (a < b ? -1 : a > b ? 1 : 0));
    if (wrapped.size) performance.measure("live-docs:shells", { start: building });
    emphasizeBodies(data.nodes);
    // A wrapped group's seed keeps its body's room in the field, its own sphere or its group's volume and a wrapper's
    // padding, known before its hull is built, so that no wrapper covers another or what is shown and the room does not
    // change when the hull arrives; the hull is drawn to fit it.
    const roomTuning = state.tuning.forceGraph, nodeOf = new Map(data.nodes.map(node => [node.id, node]));
    const room = new Map([...wrapped.keys()].filter(id => !shells.has(id) && !cells.has(id)).map(id => [id, Math.max(nodeOf.has(id) ? spatialNodeRadius(nodeOf.get(id)!, roomTuning) : 0, shapeOf(id)?.radius ?? 0)]));
    const roomChanged = JSON.stringify([...room]) !== JSON.stringify([...wrapperRoom]);
    wrapperRoom = room;
    const hasFrontier = [...scopeHops.keys()].some(atFrontier);
    // The repository's groups over its references, whatever the layout: how many, and how many files stand alone.
    const groupSizes = [...componentLandmarks(connectedNeighbours(data.nodes.filter(node => node.directoryPath === undefined && node.archetype !== "related-doc"), data.links, link => linkPulls(link, "connections"))).values()];
    const picture: SpatialGraphData = { nodes: [...data.nodes.filter(node => scopeHops.has(node.id)), ...shellNodes],
      links: [...data.links.filter(link => scopeHops.has(link.source) && scopeHops.has(link.target)), ...shellWires] };
    // A scan that has finished no file yet shows no absence: its own sign says what it is doing.
    emptyHint.hidden = picture.nodes.length > 0 || (!!arriving && !moment);
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
    const isFile = (node: SpatialGraphNode): boolean => node.directoryPath === undefined && node.shellFiles === undefined && !node.id.startsWith("related:");
    options.onShown?.(picture.nodes.filter(isFile).length, data.nodes.filter(isFile).length, groupSizes.filter(size => size > 1).length, groupSizes.filter(size => size === 1).length);
    // Keep node data by id and link data by pair across membership changes. Positions and stable instance bindings
    // follow those data objects, including through historical renames; the 2D wires keep their elements the same way.
    const graphNodes: ForceGraphNode[] = picture.nodes.map(node => {
      const cached = nodeCache.get(node.id);
      if (!cached) { nodeCache.set(node.id, node); return node; }
      Object.assign(cached, node);
      // A past moment's count would otherwise stay on the object, since today's payload names its symbols instead.
      if (node.symbolCount === undefined) delete cached.symbolCount;
      // A hub that was a bubble of the structure layout and stands open now is a hub again, at a hub's size (2026-11-07).
      if (node.shellFiles === undefined) { delete cached.shellFiles; delete cached.shellBody; }
      return cached;
    });
    const liveNodes = new Map(graphNodes.map(node => [node.id, node]));
    // A shell a pop releases is born at the centroid of its files' places in the popped wrapper; one wrapped again, at
    // the centroid of its files where they stood. So is a bubble of the structure layout that no bubble's place names, a
    // subdirectory of one file, which its parent's packing held as that file (2026-11-07).
    for (const shell of [...shells.values(), ...cells.values()]) {
      if (onScreenIds.has(shell.id) || bornAt.has(shell.id)) continue;
      let sx = 0, sy = 0, sz = 0, count = 0;
      for (const file of shell.files) {
        const at = bornAt.get(file) ?? (onScreenIds.has(file) ? nodeCache.get(file) : undefined);
        if (!at || !Number.isFinite(at.x) || !Number.isFinite(at.y) || !Number.isFinite(at.z)) continue;
        sx += at.x!; sy += at.y!; sz += at.z!; count++;
      }
      if (count) bornAt.set(shell.id, { x: sx / count, y: sy / count, z: sz / count });
    }
    // A containment spoke of the bag of cells is as long as its hub's packing holds the child from it (2026-11-08).
    const restOf = (link: { kind: string; source: string | { id: string }; target: string | { id: string } }): number | undefined => {
      if (!spokesOf || link.kind !== "containment") return undefined;
      const spoke = spokesOf.get(resolveLinkEndpoint(link.target));
      return spoke && spoke.hub === resolveLinkEndpoint(link.source) ? spoke.rest : undefined;
    };
    const graphLinks: ForceGraphLink[] = picture.links.map(link => {
      const cached = linkCache.get(linkKey(link)), rest = restOf(link);
      if (!cached) {
        if (rest !== undefined) (link as ForceGraphLink).rest = rest;
        linkCache.set(linkKey(link), link);
        return link;
      }
      if (rest !== undefined) cached.rest = rest; else delete cached.rest;
      cached.count = link.count; cached.forward = link.forward; cached.backward = link.backward;
      // A kept link's ends are the live objects for its ids, never an object a rename or a death left behind in the
      // cache, which D3 would keep as the end once resolved: a line to it leads nowhere (found 2026-10-18).
      cached.source = liveNodes.get(resolveLinkEndpoint(link.source)) ?? link.source;
      cached.target = liveNodes.get(resolveLinkEndpoint(link.target)) ?? link.target;
      return cached;
    });
    // A history step may change only a file's exposed surface. Its physical size belongs to the field's
    // input too, even when every node and wire keeps its identity.
    const nextMembership = JSON.stringify([graphNodes.map(node => [node.id, symbolCountOf(node), node.directoryPath, node.shellFiles, node.shellBody]),
      picture.links.map(link => { const rest = restOf(link); return rest === undefined ? [linkKey(link), link.count] : [linkKey(link), link.count, rest]; })]);
    const membershipChanged = nextMembership !== membership;

    /** Build the field again when the forces' settings changed; unfold at full strength for a change of the forces alone, since a membership change is fed at the update energy instead. */
    const updateForces = (reheat: boolean): void => {
      const instance = forceGraphInstance!;
      const { updateEnergy, settleHold, linkWidth, nodeZoomResistance, wireZoomResistance, groupWrappers, shellDepth, scanGrowth, scanPace, structureLines, ...forces } = state.tuning.forceGraph;
      // The energy feeds the next membership change and the Settle Hold the next settle; neither changes a force.
      void updateEnergy; void settleHold;
      // The scan trial feeds the picture what it shows; it changes no force.
      void scanGrowth; void scanPace;
      // Structure Lines controls visibility/attention of file references in 3D Structure without altering physics.
      void structureLines;
      // What is wrapped changes what is shown, which the membership carries; a wrapper's room is its seed's clearance.
      void groupWrappers; void shellDepth;
      void nodeZoomResistance; void wireZoomResistance; // Appearance does not change the layout's physical sizes.
      pointerPickNeeded = true;
      // The layout settings as a shared link carries them, the wrappers' look among them (2026-11-06).
      container.dataset.layoutSettings = JSON.stringify(layoutSettingsOf(state.tuning).forceGraph);
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
          // A wrapped group's seed keeps the room its wrapper takes, so that no wrapper covers another or what is shown.
          clearance: node => wrapperRoom.get(node.id),
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
    if (restedId && !present.has(restedId)) restedId = null;
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
      // What a pop releases, the popped shell's files and its subdirectories' shells, or a shell wrapped again, enters at
      // once where the skin showed it (2026-11-06), so that the pop removes the skin and leaves standing what was inside.
      const born = layers.flat().filter(id => !keptIds.has(id) && bornAt.has(id));
      const bornIds = new Set(born);
      const order = kept.concat(born, layers.flat().filter(id => !keptIds.has(id) && !bornIds.has(id)));
      // What was asked about directly is on screen at once, with its first hop when it was asked about directly, so that
      // the 2D picture's neighbourhood crosses into 3D together; the rest, an open directory's files among them, at the pace.
      const entering = [...asked].filter(id => liveNodes.has(id) && !keptIds.has(id)).length;
      const first = (layers[0]?.length ?? 0) + (asked.size ? layers[1]?.length ?? 0 : 0);
      const shown = Math.min(order.length, Math.max(kept.length ? nextRevealCount(kept.length, order.length, state.tuning.forceGraph.revealFrames) : first, kept.length + born.length + entering));
      reveal = { order, nodes: liveNodes, links: graphLinks, shown };
    }
    labelNames = labelNamesOf(graphNodes);
    // A shell is named by its directory's last name and the files it holds (2026-11-05).
    for (const node of graphNodes) if (node.shellFiles !== undefined) labelNames.set(node.id, `${node.name} · ${node.shellFiles.toLocaleString("en-US")}`);
    for (const [id, name] of loneNames) labelNames.set(id, name);
    // A group the picture's budget veils is named with the files its veil hides, as a shell is (2026-11-22): a veil is
    // an honest sign only if it says how many.
    for (const id of pictureVeiled) {
      const files = scopeGroups.get(id);
      if (files !== undefined && !shells.has(id) && !cells.has(id)) labelNames.set(id, `${labelNames.get(id) ?? id} · ${files.toLocaleString("en-US")}`);
    }
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
    const rootOverview = directories.includes("");
    const pathPairs = new Set(path?.slice(1).map((id, index) => JSON.stringify([id, path[index]].sort())));
    const isReferenceLink = (link: ForceGraphLink): boolean =>
      link.kind !== "containment" && link.kind !== "related-doc" && link.kind !== "cited-by";
    const isReferenceVisible = (link: ForceGraphLink, hovered: string | null, hoveredDirectory: string | undefined): boolean => {
      if (state.spatialLayout !== "structure" || link.kind === "containment") return true;
      // Hovering a directory hub highlights its subtree's containment without enabling zero-alpha ghost reference wires (2026-11-24).
      if (hoveredDirectory !== undefined) return false;
      const a = resolveLinkEndpoint(link.source), b = resolveLinkEndpoint(link.target);
      if (isReferenceLink(link)) {
        const mode = state.tuning.forceGraph.structureLines;
        if (mode === "none") return false;
        if (hovered) return a === hovered || b === hovered;
        if (mode === "hover-file") return false;
        if (path?.length) return pathPairs.has(JSON.stringify([a, b].sort()));
        // Among the pinned files and their connections, and the subject; not among an open directory's files, which
        // would draw the whole web over a directory opened whole (discovery, 2026-10-31).
        return pinnedScope.has(a) && pinnedScope.has(b);
      }
      if (hovered) return a === hovered || b === hovered;
      if (path?.length) return pathPairs.has(JSON.stringify([a, b].sort()));
      return pinnedScope.has(a) && pinnedScope.has(b);
    };
    const referenceCounts = (hovered: string | null, hoveredDirectory: string | undefined): { opaque: number; unshown: number } => {
      let opaque = 0, unshown = 0;
      for (const link of graphLinks) {
        if (!isReferenceLink(link)) continue;
        const a = resolveLinkEndpoint(link.source), b = resolveLinkEndpoint(link.target);
        const nodeA = liveNodes.get(a), nodeB = liveNodes.get(b);
        if (!nodeA || !nodeB || !isFile(nodeA) || !isFile(nodeB)) continue;
        const visible = isReferenceVisible(link, hovered, hoveredDirectory);
        const onPath = !!path?.length && pathPairs.has(JSON.stringify([a, b].sort()));
        const attended = hovered ? a === hovered || b === hovered : path?.length ? onPath : true;
        if (visible && (state.spatialLayout !== "structure" || onPath || attended)) opaque++;
        else if (state.spatialLayout === "structure") unshown++;
      }
      return { opaque, unshown };
    };
    const reportUnshown = (count: number): void => {
      if (count === reportedUnshown) return;
      reportedUnshown = count;
      options.onUnshownConnections?.(count);
    };
    // The key says what is drawn: References only when at least one opaque file-to-file reference wire is drawn on screen
    // (2026-11-24), Path when path wires are drawn, and the fading, rings, wrapped groups and shells as drawn.
    const initialHoverDir = hoveredId ? nodeCache.get(hoveredId)?.directoryPath : undefined;
    let opaqueReferences = referenceCounts(hoveredId, initialHoverDir).opaque;
    reportUnshown(state.spatialLayout === "structure" ? referenceCounts(hoveredId, initialHoverDir).unshown : 0);
    const keyed: SpatialGraphData = { nodes: picture.nodes.filter(node => node.shellFiles === undefined), links: picture.links };
    drawLegend = (): void => renderSpatialLegend(keyed, state.tuning.forceGraph.symbolScale, { references: opaqueReferences > 0,
      path: !!path?.length && (state.spatialLayout !== "structure" || state.tuning.forceGraph.structureLines === "on-demand"), frontier: hasFrontier, rings: ringed.size > 0,
      wrapped: [...wrapped.keys()].some(id => !shells.has(id) && !cells.has(id) && isWrapped(id)), shells: [...shells.keys(), ...cells.keys()].some(isWrapped),
      // The files a skin draws within it, as cells, are files of the picture too, and their kinds are keyed with the spheres'.
      inside: state.tuning.forceGraph.groupWrappers === "skin" ? [...new Set([...wrapped.keys()].filter(isWrapped)
        .flatMap(id => (pictureVeiled.has(id) ? [] : shapeOf(id)?.units ?? []).filter(unit => unit.kind === "file").map(unit => unit.archetype ?? "")))] : [] });
    drawLegend();
    frameDirectory = (): void => {
      if (directoryScope && directoryScope !== framedDirectoryScope) {
        focusedDirectory = directories[0] ?? null;
        fit();
      }
      framedDirectoryScope = directoryScope;
    };
    updateAttention = (): void => {
      // Hover is a temporary look at a file's connections among what is shown. Leaving restores the picture; it never
      // restores a snapshot from graph entry. Since 2026-10-31 nothing fades for standing outside the pins: the picture
      // shows only what was asked about and its hops, and the last hop shown is dimmed as the frontier.
      const hovered = hoveredId;
      const structureLines = state.tuning.forceGraph.structureLines;
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
      } else if (state.spatialLayout === "structure" && structureLines !== "on-demand" && path?.length) {
        // Without path chords across the tree, keep each path file's ancestor directory hubs lit so the tree shows where the path lives.
        for (const fileId of path) {
          const filePath = nodeCache.get(fileId)?.codeRelativePath ?? fileId;
          for (let directory = parentDirectory(filePath); ; directory = parentDirectory(directory)) {
            attention!.add(directoryNodeId(directory));
            if (!directory) break;
          }
        }
      }
      const counts = referenceCounts(hovered, hoveredDirectory);
      opaqueReferences = counts.opaque;
      reportUnshown(state.spatialLayout === "structure" ? counts.unshown : 0);
      // A force or camera edit with identical attention needs no buffer appearance update. History emphasis is
      // constant within a displayed commit, so its mode and step identify that appearance.
      const emphasis = historyChanges ? state.tuning.history.changeEmphasis : "none";
      const nextAttention = JSON.stringify([
        attention ? [...attention].sort() : null,
        hovered,
        path ?? null,
        directoryAttention ?? null,
        state.spatialLayout,
        structureLines,
        opaqueReferences,
        rootOverview,
        frontierHop,
        emphasis,
        historyChanges?.step ?? null,
        [...askedAbout].sort()
      ]);
      if (attentionSettings === nextAttention) { drawLegend(); return; }
      attentionSettings = nextAttention;
      pictureChanged();
      drawLegend();
      const frontier = atFrontier;
      // A wrapper takes its seed's attention: faded for the hover; dimmed as another group, though less than a sphere, since a veil
      // already starts faint and at a sphere's 0.4 the unreached groups' wrappers all but vanished (2026-11-05).
      attentionAlpha = id => attention ? (attention.has(id) ? 1 : 0.2) : frontier(id) ? 0.6 : 1;
      styleWrappers();
      forceGraphInstance?.nodeColor((node: ForceGraphNode) => {
        const color = fileLook(node.id, node.archetype).color;
        // Faded for the hover, with the hovered file and its connections whole even at the frontier; dimmed as the
        // frontier otherwise; and under the history's emphasis glowing or dimmed by the step, save that what was asked
        // about is never dimmed by it (2026-11-19).
        const alpha = attention ? (attention.has(node.id) ? 1 : 0.2) : frontier(node.id) ? 0.4 : 1;
        if (emphasis === "none") return alpha === 1 ? color : emphasizedSphere(color, alpha, false, "none");
        return emphasizedSphere(color, alpha, changedNodes.has(node.id), emphasis, askedAbout.has(node.id));
      });
      // A marble is drawn on every file it colours, faded and dimmed with it, save where the step glows a changed file
      // white, which replaces it (the marble trial, 2026-11-17).
      forceGraphInstance?.nodeMarble((node: ForceGraphNode) => {
        const { marble } = fileLook(node.id, node.archetype);
        return marble && !(glows(emphasis) && changedNodes.has(node.id)) ? marble : null;
      });
      // With Group Wrappers Off, a ring around every sphere with connections the picture does not show, a click on which
      // shows them: the owner's choice of 2026-11-02, B over A, the frontier's dimming kept and the ring saying where there
      // is more. The ring keeps its strength at the frontier, where it is the cue, and fades with the hover's attention.
      // With any wrapper on there is none (2026-11-18): the wrappers and shells say what is held back.
      forceGraphInstance?.nodeRing((node: ForceGraphNode) => {
        if (!hasRing(node.id)) return null;
        const alpha = attention ? (attention.has(node.id) ? .85 : .15) : .85;
        return emphasizedSphere(spatialNodeStyle(node.archetype).color, alpha, changedNodes.has(node.id), emphasis, askedAbout.has(node.id));
      });
      /** Whether a wire has the picture's attention, whether it is a step of the drawn path, whether it reaches the frontier, and whether the step changed it. */
      const regard = (link: ForceGraphLink): { visible: boolean; onPath: boolean; dimmed: boolean; changed: boolean } => {
        const a = resolveLinkEndpoint(link.source), b = resolveLinkEndpoint(link.target);
        const onPath = !!path?.length && pathPairs.has(JSON.stringify([a, b].sort()));
        const pathTreeSpoke = link.kind === "containment" && state.spatialLayout === "structure" && structureLines !== "on-demand" && !hovered && !!path?.length && !!attention && attention.has(a) && attention.has(b);
        const visible = hovered ? a === hovered || b === hovered : path?.length ? (onPath || pathTreeSpoke) : true;
        return { visible, onPath: onPath && visible, dimmed: frontier(a) || frontier(b), changed: !!historyChanges?.changedPairs.has(pairKey(a, b)) };
      };
      forceGraphInstance?.linkColor((link: ForceGraphLink) => {
        const { visible, onPath, dimmed, changed } = regard(link), { kind, scene } = activePalette();
        // Containment is the structure itself, drawn as a line; a reference revealed in the structure layout reads
        // against the tree rather than as the faint web of the connections layout. A path's wires are drawn at full
        // strength (2026-10-30), so that the route reads over the web around it. A wire to the frontier is dimmed with it.
        if (link.kind === "containment") return rgba(kind.directory, !visible ? 0.08 : dimmed ? 0.15 : 0.35);
        if (link.kind === "related-doc") return rgba(kind.document, !visible ? 0.04 : dimmed ? 0.15 : 0.4);
        // A document's citation of a file, in the documents' violet lightened toward white, drawn from the document.
        if (link.kind === "cited-by") return rgba(scene.citedBy, !visible ? 0.06 : dimmed ? 0.2 : 0.55);
        if (onPath) return rgba(scene.wire, 0.9);
        if (state.spatialLayout === "structure") return rgba(scene.wire, visible ? 0.5 : 0);
        // Local wires at .3, the whole-root web at .16, the hovered file's at .5, a wire to the frontier at .12, so the few
        // wires a person is reading stand out. Every reference wire is white: the colour that ran along it from the file
        // that uses to the file that offers (2026-10-30) was withdrawn on 2026-10-31 at the owner's eye, and the hover's
        // words carry the direction. Under the history's emphasis a wire the step added or changed glows with its files.
        const alpha = !visible ? 0.025 : hovered ? 0.5 : dimmed ? 0.12 : rootOverview ? 0.16 : 0.3;
        return rgba(scene.wire, emphasis === "none" ? alpha : emphasizedWireAlpha(alpha, changed, emphasis).toFixed(3));
      });
      // A common scale for every wire; reference counts retain their relative weight while camera motion and spring
      // stretch change no base width, and a path's wires are twice as wide. Zoom resistance controls the projection.
      forceGraphInstance?.linkWidth((link: ForceGraphLink) => state.tuning.forceGraph.linkWidth * (regard(link).onPath ? 2 : 1)
        * (link.kind === "related-doc" || link.kind === "cited-by" ? 0.5 : link.kind === "containment" ? 1 : Math.min(3, 1 + 0.375 * Math.log2(Math.max(1, link.count)))));
      forceGraphInstance?.linkVisibility((link: ForceGraphLink) => isReferenceVisible(link, hovered, hoveredDirectory));
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
      if (membershipChanged) { feed(); updateBuilding(true); }
      else if (roomChanged && motion) {
        // A change of room alone rearranges the whole: held from where the spheres stood, their tethers fought the
        // wrappers' room, so that switching Off to Skin at rest took a minute to fall still against some 25 s unfolding (2026-11-05).
        motion.invalidate();
        if (simulationRunning) motion.wake("unfold"); else move(state.tuning.forceGraph.updateEnergy, "unfold");
      }
      frameDirectory();
      refreshWrappers();
      setActive(true);
      return;
    }

    let press: { x: number; y: number; id: string | undefined; pointerId: number; button: number; held: boolean; dropped: boolean } | null = null;
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
        nodeColor: node => fileLook(node.id, node.archetype).color,
        marble: node => fileLook(node.id, node.archetype).marble,
        linkColor: () => rgba(activePalette().scene.wire, 0.16),
        linkWidth: () => state.tuning.forceGraph.linkWidth,
        linkVisible: () => true,
        arrowLength: link => link.kind === "related-doc" || link.kind === "cited-by" ? 4 : 0,
        ring: () => null,
        sphere: node => node.shellFiles === undefined
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
      onDragEnd: () => { draggingNode = false; pointerPickNeeded = true; refreshActionStrip(); move(1, "hold"); },
      // A sphere is not grabbed while the map builds: the press turns the camera instead (2026-11-15).
      grabs: () => !isBuilding()
    });
    updateAttention();
    updateForces(true);
    setPiece(firstPiece);
    refreshWrappers();
    simulation.tick(REVEAL.warmup);
    shownLayout = state.spatialLayout;
    membership = nextMembership;
    focusLabel = document.createElement("button");
    focusLabel.type = "button";
    focusLabel.className = "force-graph-focus";
    focusLabel.hidden = true;
    bindNodeActivation(focusLabel);
    focusLabel.addEventListener("pointerenter", () => { if (!pointerMay().hover) return; overFocusLabel = true; window.clearTimeout(hideActionsTimer); refreshActionStrip(); });
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
    // A node's actions act on the pointer's press only while the map is not building; on the keyboard's, always.
    const refused = (event: MouseEvent): boolean => event.detail !== 0 && isBuilding();
    primaryAction.addEventListener("click", event => {
      event.stopPropagation();
      if (refused(event)) return;
      const action = actionTargetId ? currentAction(actionTargetId) : null;
      if (action?.kind === "shell") popShell(action.directory);
      else if (action?.kind === "directory") {
        if (state.openDirectories?.has(action.directory)) options.onCloseDirectory(action.directory);
        else options.onOpenDirectory(action.directory);
      } else if (action?.kind === "file") {
        if (isWrapped(actionTargetId!) && !isRetainedFile(action.node.id)) popWrapper(actionTargetId!);
        options.onTogglePin(action.node.id);
      }
      refreshActionStrip();
    });
    centreAction.addEventListener("click", event => {
      event.stopPropagation();
      if (refused(event)) return;
      const action = actionTargetId ? currentAction(actionTargetId) : null;
      if (action?.kind === "directory") options.onCentreDirectory(action.directory);
      else if (action?.kind === "file") options.onRecenterNode(action.node);
      refreshActionStrip();
    });
    moreAction.addEventListener("click", event => {
      event.stopPropagation();
      if (!actionTargetId || refused(event)) return;
      const rect = moreAction!.getBoundingClientRect();
      showActions(actionTargetId, { x: rect.left + rect.width / 2, y: rect.bottom });
    });
    actionStrip.append(primaryAction, centreAction, moreAction);
    actionStrip.addEventListener("pointerenter", () => { if (!pointerMay().hover) return; pointerOverActions = true; window.clearTimeout(hideActionsTimer); refreshActionStrip(); });
    actionStrip.addEventListener("pointerleave", () => { pointerOverActions = false; deferHoverExit(); });
    actionStrip.addEventListener("focusin", focusActions);
    actionStrip.addEventListener("focusout", () => { requestAnimationFrame(refreshActionStrip); deferHoverExit(); });
    container.append(actionStrip);

    container.addEventListener("pointerleave", releasePointerHover);
    // Seen before any name's or the actions' own pointer events, whatever the target.
    container.addEventListener("pointermove", notePointer, true);
    container.addEventListener("pointerover", notePointer, true);
    container.addEventListener("pointerenter", event => {
      pointerPosition = { x: event.clientX, y: event.clientY };
      pointerPickNeeded = true;
      touching = event.pointerType === "touch";
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
      // A press while the map builds is dropped, never kept for later: it acts on no node and may still turn the camera.
      // Once built, a press is the pointer's own act, as a move is.
      const may = pointerMay().press;
      if (may) movedSinceBuilding = true;
      press = { x: event.clientX, y: event.clientY, id: may ? nodeAt(event.clientX, event.clientY) : undefined,
        pointerId: event.pointerId, button: event.button, held: false, dropped: !may };
      const started = press;
      if (started.button === 0 && started.id && currentAction(started.id)) {
        holdTimer = window.setTimeout(() => {
          if (press !== started || activePointers.size !== 1 || isBuilding()) return;
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
      // The offer is kept while the pointer crosses the small gap above a sphere to its actions: `settleRest`.
    });
    // Resolve each press against the uploaded instances, including fast clicks and touch taps
    // that have never produced a hover frame.
    container.addEventListener("pointerup", event => {
      window.clearTimeout(holdTimer);
      if (!press || press.held || activePointers.size !== 1 || event.pointerId !== press.pointerId
        || event.button !== press.button || event.target !== forceGraphInstance?.renderer().domElement) return;
      // A press that the map began building under, or that was made while it built, does nothing.
      if (press.dropped || !pointerMay().press) return;
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
      if (event.pointerType === "touch" || event.type === "pointercancel") { touching = false; releasePointerHover(); }
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
    updateBuilding(true);
  }

  function captureScene(): ForceScene {
    if (!forceGraphInstance) return { files: [], links: [] };
    const instance = forceGraphInstance;
    const camera = instance.camera();
    camera.lookAt((instance.controls() as { target: Vector3 }).target);
    camera.updateMatrixWorld();
    const rect = requireElement("graph-svg").getBoundingClientRect();
    const colorForNode = instance.nodeColor();
    const bodyStarted = performance.now();
    const bodyCarriers = cells.size ? instance.captureBodies(new Set(cells.keys())) : null;
    if (cells.size) performance.measure("live-docs:capture-bodies", { start: bodyStarted });
    const files = (instance.graphData().nodes).flatMap(node => {
      if (!Number.isFinite(node.x) || shells.has(node.id)) return [];
      const body = bodyCarriers?.get(node.id);
      if (body) return [{ id: node.id, name: node.name, x: rect.left + body.x, y: rect.top + body.y,
        radius: Math.max(0, ...body.boundary.map(point => point.y)), color: activePalette().scene.skin, body }];
      if (cells.has(node.id)) return [];
      const point = new Vector3(node.x, node.y, node.z);
      const depth = point.clone().project(camera).z;
      if (depth < -1 || depth > 1) return [];
      const center = instance.graph2ScreenCoords(point.x, point.y, point.z);
      const radius = spatialNodeRadius(node, state.tuning.forceGraph) * spatialSizeScale(instance.controls().target, camera, rect.height, state.tuning.forceGraph.nodeZoomResistance);
      const edge = point.clone().add(new Vector3(radius, 0, 0).applyQuaternion(camera.quaternion));
      const screenEdge = instance.graph2ScreenCoords(edge.x, edge.y, edge.z);
      return [{ id: node.id, name: node.name, x: rect.left + center.x, y: rect.top + center.y,
        radius: Math.abs(screenEdge.x - center.x), color: typeof colorForNode === "function" ? colorForNode(node) : activePalette().kind.other }];
    });
    return { files, directoryRepresentatives: new Map(directoryRepresentatives), links: instance.captureLinks().map(link => ({ source: resolveLinkEndpoint(link.source as string | { id: string }), target: resolveLinkEndpoint(link.target as string | { id: string }) }))
      .filter(link => !shells.has(link.source) && !shells.has(link.target)) };
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
   * Feed the picture today's graph cut to the files a scan has finished so far, or today's whole graph again (null):
   * a step of the scan trial, through the one update path at the tuning's energy. The camera keeps framing the growing
   * picture, as it keeps a Fit across the history's steps, until a hand takes it.
   */
  function setArrived(next: ExplorerGraphPayload | null): void {
    const intent = historyCameraIntent;
    arriving = next;
    if (active && forceGraphInstance) render();
    // A flight under way is left to end: begun again at every arrival, it would never leave its start.
    if (intent && !following) {
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
    // A file or shell a pop releases enters where the popped wrapper's packing held it (2026-11-05); one already on
    // screen keeps its place.
    for (const node of nodes) {
      const at = bornAt.get(node.id);
      if (!at || onScreenIds.has(node.id)) continue;
      node.x = at.x; node.y = at.y; node.z = at.z;
      bornAt.delete(node.id);
    }
    if (reveal.shown >= reveal.order.length) bornAt.clear();
    const spokes = spokesOf;
    for (const [id, start] of placeNewSpheres(nodes, links, state.tuning.forceGraph, state.spatialLayout, spokes ? child => spokes.get(child) : undefined)) {
      const node = reveal.nodes.get(id)!;
      node.x = start.x; node.y = start.y; node.z = start.z;
    }
    onScreenIds = new Set(nodes.map(node => node.id));
    return { nodes, links };
  }

  /**
   * Colour what each wrapped body shows within its skin, and its skin, by the step of the history shown (2026-11-11): a
   * change is shown at the innermost thing the picture draws for it (`bodyChanges`). A body is coloured again only when
   * what the step changes in it, the mode or the look does, so that a step recolours the bodies it or the step before
   * touched and nothing else: no packing, hull or list of units is built again, and the work is bounded by the units
   * drawn. A file the step deleted is shown in the body of the deepest directory drawn that held it, none when that is a
   * hub drawn as a sphere, which lights by its own emphasis (`deletionHomes`). What was asked about keeps its look within
   * a body as a sphere does (2026-11-19). A skin bursting open keeps what it carried
   * until it is gone. The page's timeline measures this as "live-docs:history-units".
   */
  function emphasizeBodies(nodes: readonly SpatialGraphNode[]): void {
    const changes = historyChanges, mode = changes ? state.tuning.history.changeEmphasis : "none";
    if (!changes || mode === "none") { emphasized = new Map(); return; }
    const started = performance.now();
    const look = state.tuning.forceGraph.groupWrappers;
    const homes = new Map<string, string | null>();
    for (const shell of shells.values()) homes.set(shell.directory, shell.id);
    for (const cell of cells.values()) homes.set(cell.directory, cell.id);
    if (state.spatialLayout === "structure") for (const node of nodes) {
      if (node.directoryPath !== undefined && scopeHops.has(node.id) && !homes.has(node.directoryPath)) homes.set(node.directoryPath, null);
    }
    const gone = deletionHomes(changes.deletedFiles, homes), changed = [...changes.changed];
    const next: typeof emphasized = new Map();
    let coloured = 0, units = 0;
    for (const id of wrapped.keys()) {
      const shape = shapeOf(id);
      if (!shape) continue;
      let members = bodyMembers.get(shape);
      if (!members) bodyMembers.set(shape, members = new Set(shape.members.map(member => member.id)));
      const base = plainUnitsOf(id), deleted = gone.get(id) ?? [];
      const touched = changed.filter(file => file !== id && members.has(file));
      const asked = [...askedAbout].filter(file => members.has(file));
      const key = JSON.stringify([mode, look, touched, deleted, asked]);
      const kept = emphasized.get(id);
      if (kept && kept.base === base && kept.key === key) { next.set(id, kept); continue; }
      // The cloud looks draw nothing within a skin, so the skin is the innermost thing drawn for every change in it.
      const where = bodyChanges(look === "skin" ? base ?? [] : [], members, id, touched, deleted, asked);
      next.set(id, { base, key, units: base && emphasizedUnits(base, where, mode), skin: emphasizedSkin(where, mode) });
      coloured++; units += base?.length ?? 0;
    }
    // A skin bursting open after its pop keeps the step it carried until it is gone.
    for (const id of bursts.keys()) if (!next.has(id) && emphasized.has(id)) next.set(id, emphasized.get(id)!);
    emphasized = next;
    performance.measure("live-docs:history-units", { start: started, detail: { bodies: wrapped.size, coloured, units } });
  }

  /** Pack the bodies the picture waits for, a bubble at a time, within a part of the frame and at least one a frame; whether all are packed. */
  function packBodies(budget = PACKING_BUDGET): boolean {
    const started = performance.now();
    for (const [key, steps] of packing) {
      for (;;) {
        const step = steps.next();
        if (step.done) { bodies.set(key, { shape: step.value }); packing.delete(key); break; }
        if (performance.now() - started >= budget) break;
      }
      if (performance.now() - started >= budget) break;
    }
    if (performance.now() > started) performance.measure("live-docs:body-packing", { start: started });
    return packing.size === 0;
  }

  /** Pack on in the next frame while the picture waits, and build the picture once every body it names is packed. */
  function packOn(): void {
    packingFrame = 0;
    if (!packing.size) return;
    if (!packBodies()) { packingFrame = requestAnimationFrame(packOn); return; }
    render();
    if (!packing.size && pendingReveal) { const ids = pendingReveal; pendingReveal = null; revealForTransition(ids); }
  }

  /** Stop the packing a picture waits for, when wrapping no longer asks for it. */
  function cancelPacking(): void {
    packing = new Map();
    pendingReveal = null;
    cancelAnimationFrame(packingFrame);
    packingFrame = 0;
  }

  /** Build the hulls waiting to be drawn, the smallest first, within a part of the frame and at least one a frame. */
  function buildBodies(budget = WRAPPER_BUDGET): void {
    if (!bodyWork.length) return;
    const started = performance.now();
    do {
      const body = bodies.get(bodyWork.shift()!);
      if (body && !body.hull) body.hull = wrapperHull(body.shape, body.shape.margin ?? 0);
    } while (bodyWork.length && performance.now() - started < budget);
    performance.measure("live-docs:wrapper-hulls", { start: started });
    // Bodies built for files or sizes no longer shown are let go once they outnumber those in use, but not while a picture
    // waits for its own, which are not yet in use.
    if (!packing.size && bodies.size > 64 + 4 * wrapped.size) {
      const used = new Set([...wrapped.values(), ...[...bursts.values()].map(burst => burst.key)]);
      for (const key of [...bodies.keys()]) if (!used.has(key)) bodies.delete(key);
    }
    refreshWrappers();
  }

  /**
   * Where the members of a wrapped body are born when it pops: its packing about the place it stood, at the packing's own
   * size, so that the files are not born on top of one another; an island's skin is drawn to fit its seed's room, a
   * directory shell's at the packing's size, so that its files and its subdirectories' shells stand where its skin showed
   * them (2026-11-06). Born at the size of the skin drawn smaller, the estate's pop of its portal took 19 s to fall still
   * (measured 2026-11-05).
   */
  function releaseAt(key: string, place: Placed, bubbleId: (directory: string) => string = shellId): void {
    const shape = bodies.get(key)?.shape;
    if (!shape) return;
    // Each bubble the skin showed is born as the body of its directory, at its place, its packing the bubble's own, taken
    // from the popped body's rather than packed again (2026-11-07, third round): a shell, or in the structure layout the
    // directory's hub drawn as a bubble.
    const release = releaseOf(shape, place, bubbleId);
    for (const [id, at] of release.born) bornAt.set(id, at);
    for (const [id, body] of release.bodies) releasedBodies.set(id, body);
  }

  /**
   * Pop a bubble of the structure layout (2026-11-07): its directory was opened, so its hub stands open with its files and
   * its subdirectories' bubbles, each born where the skin showed it, and its skin bursts where it stood. A render that
   * waits for other bodies to be packed asks again, and the release is the same; the burst begins once (`poppingCells`).
   */
  function popCell(id: string): void {
    const key = wrapped.get(id), node = nodeCache.get(id);
    if (key === undefined || !node || !Number.isFinite(node.x)) return;
    const place = { x: node.x!, y: node.y!, z: node.z! };
    releaseAt(key, place, directoryNodeId);
    if (!poppingCells.has(id)) burst(id, key, place);
    poppingCells.add(id);
  }

  /** A wrapper bursts open, a tenth larger and fading over a quarter of a second, but not under reduced motion. */
  function burst(id: string, key: string, place?: Placed): void {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) bursts.set(id, { started: null, key, fit: fitOf(id), place });
  }

  /**
   * Begin a wrapped group's pop (2026-11-05): the click that pins its seed bursts its wrapper, and the files that enter
   * fill the shape it held about the seed, which keeps its place.
   */
  function popWrapper(seed: string): void {
    const key = wrapped.get(seed), node = nodeCache.get(seed);
    if (key === undefined || !node || !Number.isFinite(node.x)) return;
    releaseAt(key, { x: node.x!, y: node.y!, z: node.z! });
    bornAt.delete(seed);
    burst(seed, key);
  }

  /**
   * Pop a directory shell open (2026-11-05): it bursts where it stood, its own files enter where its packing held them,
   * and the hidden files of each of its subdirectories become a shell of their own, born at their centroid there: a
   * balloon full of balloons. Its directory keeps a name a click on which wraps it again.
   */
  function popShell(directory: string): void {
    const id = shellId(directory), key = wrapped.get(id), node = nodeCache.get(id);
    const skin = key === undefined ? undefined : bodies.get(key)?.shape.radius;
    if (skin !== undefined) poppedSkins.set(directory, skin);
    if (key !== undefined && node && Number.isFinite(node.x)) {
      const place = { x: node.x!, y: node.y!, z: node.z! };
      releaseAt(key, place);
      burst(id, key, place);
    }
    popped = poppedAfter(popped, directory, true);
    render();
  }

  /** Wrap a popped directory's files again, with every directory popped beneath it. */
  function wrapShell(directory: string): void {
    popped = poppedAfter(popped, directory, false);
    render();
  }

  /** The directories popped open where the picture draws shells; none where it draws none. */
  function poppedGroups(): ReadonlySet<string> {
    return shelling() ? new Set(popped) : new Set();
  }

  /** Keep only these pops, for Fold others away and Unpin others (2026-11-19); drawn at the next render. */
  function keepPoppedGroups(kept: ReadonlySet<string>): void {
    popped = new Set([...popped].filter(directory => kept.has(directory)));
  }

  /** The nearest popped directory a shown file stands inside, whose pop a menu can wrap again; null when none. */
  function groupHolding(nodeId: string): string | null {
    const path = nodeCache.get(fileAt(nodeId) ?? nodeId)?.codeRelativePath;
    if (path === undefined) return null;
    const holding = [...poppedGroups()].filter(directory => under(path, directory));
    return holding.sort((a, b) => b.length - a.length)[0] ?? null;
  }

  /** Advance the wrappers bursting open; one that has burst is gone from the picture. */
  function advanceBursts(): void {
    if (!bursts.size) return;
    const now = performance.now(), reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let done = false;
    for (const [seed, burst] of bursts) {
      burst.started ??= now;
      if (burstProgress(now - burst.started, BURST.duration, reduced) >= 1) { bursts.delete(seed); done = true; }
    }
    if (done) refreshWrappers();
    else { styleWrappers(); pictureChanged(); }
  }

  /**
   * Each wrapper's opacity, as its node's, a bursting one's growth and fading, the hovered or focused node's, for the rim,
   * and how each skin carries the step of the history shown.
   */
  function styleWrappers(): void {
    if (!forceGraphInstance) return;
    const now = performance.now(), reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const burst = (seed: string): number => { const at = bursts.get(seed); return at ? burstProgress(now - (at.started ?? now), BURST.duration, reduced) : 0; };
    forceGraphInstance.wrapperStyle({
      alpha: seed => attentionAlpha(seed) * (1 - burst(seed)),
      scale: seed => fitOf(seed) * (1 + BURST.growth * burst(seed)),
      // The rim is the touched wrapper's own sign that it can be pressed, shown at once; else the rested or focused one's.
      hovered: [pointerHoverId, hoveredId].find(id => id !== null && isWrapped(id)) ?? null,
      popping: new Set(bursts.keys()),
      skin: skinOf
    });
  }

  /** Hand the renderer the wrappers drawn now, those bursting open among them, and restyle them and the key. */
  function refreshWrappers(): void {
    const instance = forceGraphInstance;
    if (!instance || (!wrapping() && !wrappersHanded && !bursts.size)) return;
    const look = wrapping() ? state.tuning.forceGraph.groupWrappers : "off";
    wrappersHanded = look !== "off";
    instance.wrappers([...wrapped.keys(), ...[...bursts.keys()].filter(id => !wrapped.has(id))], hullOf, look, id => bursts.get(id)?.place, unitsOf);
    instance.invalidateAppearance();
    styleWrappers();
    drawLegend();
    pictureChanged();
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
    // A perspective change into this view is playing: the map builds until it has and its spheres have entered.
    transitioning = true;
    updateBuilding(true);
    // A picture waiting for its bodies is not the one these files belong to; they are revealed once it is built.
    if (packing.size) { pendingReveal = nodeIds; return; }
    const next = revealCorresponding(reveal.order, reveal.shown, new Set(nodeIds.map(id => directoryRepresentatives.get(id) ?? id)));
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

  return { render, setActive, focusNode, focusDirectory, fit, keepInspectionVisible, cameraRoom, getSubjectAnchor, placeSubjectAnchor, settleIntoFrame, captureScene, revealForTransition, setMoment, setArrived, packing: () => packing.size > 0, settle, poppedGroups, keepPoppedGroups, groupHolding, wrapGroup: wrapShell, whenReady: () => ready && !packing.size ? Promise.resolve() : new Promise(resolve => readyWaiters.push(resolve)) };
}
