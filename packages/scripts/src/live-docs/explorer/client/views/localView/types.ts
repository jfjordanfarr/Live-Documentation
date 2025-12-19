import type { LocalMapState, PathResult, StateStore, SymbolPin } from "./state";
import type {
  ExplorerGraphPayload,
  ExplorerLinkKind,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../../shared/types";
import type { ExplorerState, TestCoverageMap } from "../../types";

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

export interface LocalEdge {
  sourceId: string;
  targetId: string;
  direction: "outbound" | "inbound";
  kind: ExplorerLinkKind;
  sourceSymbol?: string;
  targetSymbol?: string;
}

export interface LocalSubgraph {
  center: ExplorerNodePayload;
  nodes: ExplorerNodePayload[];
  links: LocalEdge[];
  inboundIds: Set<string>;
  outboundIds: Set<string>;
}

export interface CenterAlignmentGuides {
  anchors: Map<string, number>;
  cardCenters: Map<string, number>;
}

export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface LayoutExtents {
  content: Bounds;
  focus: Bounds | null;
}

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
