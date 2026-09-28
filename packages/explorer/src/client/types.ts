import type { ExplorerNodePayload } from "../shared/types";

/**
 * Names of the four main Explorer views.
 *
 * - `"circuit"` — treemap / circuit-board overview
 * - `"map"` — 3-column Local Map (inbound → node → outbound)
 * - `"graph"` — force-directed D3 graph
 * - `"sources"` — knowledge-sources health list
 *
 * Created 2025-11-22 with the initial Explorer scaffold.
 */
export type ViewName = "circuit" | "map" | "graph" | "sources" | "membrane";

/** Toggle flags for the Explorer filter panel. */
export interface ExplorerFilters {
  showTests: boolean;
  showAssets: boolean;
  showRelatedDocs: boolean;
}

/**
 * Cubic-Bézier connection path tuning parameters.
 * Exposed in the Explorer tuning panel (2025-12-05, commit `9047949`).
 */
export interface BezierTuning {
  stubFactor: number;
  stubMin: number;
  stubMaxOffset: number;
  verticalOffset: number;
}

/**
 * Tuning knobs specific to the Local Map (3-column) view.
 * Includes self-loop rendering and hover/pin collapse behaviour
 * added 2025-12-07 (commit `a99ac04`) and 2025-12-17 (commit `f373c45`).
 */
export interface LocalMapTuning {
  columnGap: number;
  hoverDimSymbols: number;
  hoverDimConnections: number;
  /** How much self-loop "French Corset" strokes taper (0=no taper, 1=full taper to half width) */
  selfLoopTaper: number;
  /** Collapse (hide) unrelated symbols when hovering a symbol row */
  collapseOnHover: boolean;
  /** Collapse (hide) unrelated symbols when a symbol is pinned */
  collapseOnPin: boolean;
}

/** Aggregate tuning configuration threading through into every Explorer view. */
export interface TuningConfig {
  bezier: BezierTuning;
  localMap: LocalMapTuning;
}

/**
 * Root state object for the Explorer client, managed by
 * `persistence/local-storage.ts` and consumed by every view.
 */
export interface ExplorerState {
  view: ViewName;
  selectedNode: ExplorerNodePayload | null;
  focusedNode: ExplorerNodePayload | null;
  filters: ExplorerFilters;
  tuning: TuningConfig;
}

/** Map from implementation file path → covering test node(s). */
export type TestCoverageMap = Map<string, ExplorerNodePayload[]>;

/** Pan/zoom transform for the Circuit Board (treemap) view. */
export interface CircuitTransform {
  x: number;
  y: number;
  k: number;
}

/**
 * Tree node representing a directory in the workspace.
 * Built by the Circuit Board view to lay out the treemap hierarchy.
 */
export interface DirectoryNode {
  name: string;
  path: string;
  children: Map<string, DirectoryNode>;
  nodes: ExplorerNodePayload[];
}
