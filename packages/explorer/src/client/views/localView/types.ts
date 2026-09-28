import type { LocalMapState, PathResult, StateStore, SymbolPin } from "./state";
import type {
  ExplorerGraphPayload,
  ExplorerLinkKind,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../../shared/types";
import type { ExplorerState, TestCoverageMap } from "../../types";

/**
 * Dependency-injection options for constructing a Local Map view.
 *
 * Carries the global explorer state, the full graph, callbacks for node
 * selection/recentering/sidebar-focus, a test-coverage lookup, and a
 * pre-built node-by-ID map for type-reference navigation.
 *
 * @remarks
 * Created 2025-12-04 when the monolithic `localView.ts` was extracted into
 * the `localView/` module. `nodesById` was added on 2025-12-05 to support
 * click-to-navigate type references in the Local Map symbol cards.
 */
export interface LocalViewOptions {
  state: ExplorerState;
  graphData: ExplorerGraphPayload;
  resolveLinkEndpoint: (endpoint: ExplorerLinkPayload["source"]) => string;
  onSelectNode: (node: ExplorerNodePayload) => void | Promise<void>;
  onRecenterNode: (node: ExplorerNodePayload) => void | Promise<void>;
  onFocusSidebar: (node: ExplorerNodePayload) => void | Promise<void>;
  testCoverage: TestCoverageMap;
  /** Map of node IDs to node payloads for type reference navigation. */
  nodesById: Map<string, ExplorerNodePayload>;
}

/**
 * Public contract the Local Map exposes to the parent Explorer application.
 *
 * Originally provided core rendering and zoom controls. Extended on
 * 2025-12-19 with multi-hop path mode methods (`addPinToPath`,
 * `removePinFromPath`, `setActivePath`, `getActivePath`), an observable
 * `localMapState` store, and a `dispose()` cleanup method.
 */
export interface LocalViewApi {
  render(): void;
  drawConnections(): void;
  highlightSelection(): void;
  zoomIn(): void;
  zoomOut(): void;
  resetZoom(): void;
  
  /** Observable state store for multi-hop visualization. */
  readonly localMapState: StateStore<LocalMapState>;
  
  /** Adds a pin to the multi-hop path at a specific hop index. */
  addPinToPath(nodeId: string, symbol: string, hopIndex: number): void;
  
  /** Removes pins from the path starting at a specific hop index. */
  removePinFromPath(fromHopIndex: number): void;
  
  /** Gets the current pinned path. */
  getPinnedPath(): SymbolPin[];
  
  /** 
   * Sets the active path for path-mode rendering.
   * Pass null to exit path mode and return to exploration mode.
   */
  setActivePath(path: PathResult | null): void;
  
  /** Gets the current active path, or null if in exploration mode. */
  getActivePath(): PathResult | null;
  
  /** Cleanup method to unsubscribe from state store. */
  dispose(): void;
}

/**
 * A directed edge in the local subgraph, annotated with direction relative
 * to the center (focus) node.
 *
 * `direction` is `"outbound"` when the center node depends on the target,
 * and `"inbound"` when the source depends on the center node. This drives
 * column placement and connection-line coloring (inbound = teal, outbound
 * = amber).
 *
 * @remarks
 * Created 2025-12-04 during Local Map modularization.
 */
export interface LocalEdge {
  sourceId: string;
  targetId: string;
  direction: "outbound" | "inbound";
  kind: ExplorerLinkKind;
  sourceSymbol?: string;
  targetSymbol?: string;
}

/**
 * Alias for LocalEdge - used in subgraph contexts.
 */
export type LocalSubgraphLink = LocalEdge;

/**
 * The 1-hop neighborhood of the center node, partitioned into inbound
 * (upstream) and outbound (downstream) ID sets.
 *
 * Built by `createLocalSubgraph()` and consumed by the render pipeline
 * to lay out the three-column Local Map view.
 */
export interface LocalSubgraph {
  center: ExplorerNodePayload;
  nodes: ExplorerNodePayload[];
  links: LocalEdge[];
  inboundIds: Set<string>;
  outboundIds: Set<string>;
}

/**
 * Captures per-symbol anchor positions and card vertical centers in the
 * center column, enabling SVG Bezier connection lines to align precisely
 * with symbol dots.
 *
 * `anchors` maps `symbolSlug` to a Y-coordinate, while `cardCenters`
 * maps `nodeId` to the vertical midpoint of its card element.
 *
 * @remarks
 * Created 2025-12-04 during the SVG Bezier connector work. Used by
 * `collectCenterAlignmentGuides()` and `lookupCenterAnchorPosition()`.
 */
export interface CenterAlignmentGuides {
  anchors: Map<string, number>;
  cardCenters: Map<string, number>;
}

/**
 * Axis-aligned bounding rectangle in pixel coordinates, used for DOM
 * measurement of cards, columns, and the overall layout container.
 */
export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/**
 * The measured bounding boxes of the Local Map layout, used by
 * `fitMapToContent()` to compute an initial pan/zoom that frames all
 * visible content.
 *
 * `focus` is nullable because the center card may not yet be in the DOM
 * at measurement time (e.g. during initial render before the selected
 * node's card mounts).
 */
export interface LayoutExtents {
  content: Bounds;
  focus: Bounds | null;
}

/**
 * Pan/zoom state for the Local Map viewport.
 *
 * `x` and `y` are the CSS translate offsets (in pixels), and `k` is the
 * scale factor. Consumed by `updateMapTransform()`, `animateMapTransform()`,
 * and `zoomAtPoint()` to apply affine transforms to the map container
 * and its SVG connection overlay.
 */
export interface MapTransform {
  x: number;
  y: number;
  k: number;
}

/**
 * Column role for anchor registration disambiguation.
 * Uses semantic names (upstream/downstream) instead of spatial (left/right)
 * to future-proof for multi-hop graph expansion.
 * 
 * - `upstream`: Dependencies column (data flows FROM these nodes)
 * - `center`: Focus/selected node column
 * - `downstream`: Dependents column (data flows TO these nodes)
 */
export type ColumnRole = "upstream" | "center" | "downstream";
