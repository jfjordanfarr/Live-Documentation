import type { PinSet } from "./views/pin-state";
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
export type ViewName = "circuit" | "map" | "graph" | "sources" | "membrane" | "world";

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
  /** How far beyond its card's edge a lace sweeps before it turns back, in CSS pixels (2026-10-06, re-based on the edge 2026-10-07). */
  laceReach: number;
  /** How far along the card's edge from its pin's row a lace returns, toward its partner's row, where the card's edge cuts it. */
  laceCurl: number;
  /** A lace's width where it leaves the pin. */
  laceWidth: number;
  /** Collapse (hide) unrelated symbols when hovering a symbol row */
  collapseOnHover: boolean;
  /** Collapse (hide) unrelated symbols when a symbol is pinned */
  collapseOnPin: boolean;
  /**
   * How many references may skip columns or read against them before the Local
   * Map says the picture is dense and the Force Graph may read better (2026-10-05).
   */
  strainNudge: number;
  /** How a card's symbol rows stand (2026-10-05). */
  symbolOrder: SymbolOrder;
  /** How long the picture takes to move from one arrangement to the next, in milliseconds; zero jumps (2026-10-07). */
  moveMs: number;
  /**
   * How many seeded starts the continuing search may try after the first paint, one per idle moment, beyond those the
   * first paint tried; zero turns the search off (2026-10-07).
   */
  searchStarts: number;
  /**
   * How many starts in a row may fail to better the best picture found, churn aside, before the search settles until the
   * picture is drawn anew.
   */
  searchPatience: number;
  /** Which card a move holds still on screen: the one last clicked, or the one last clicked or hovered (2026-10-07). */
  holdStill: "click" | "hover";
  /**
   * How strongly the ranking pulls every file toward the last column: zero ranks by the fewest column spans, a weight
   * above every pair's by longest-chain depth, as before 2026-10-06. A lever of the layout lab.
   */
  rankingPull: number;
  /** Which column a file takes when several cost the same: the one with the fewest other cards, the rightmost, or the leftmost. */
  rankingTie: "fewest" | "right" | "left";
  /** How many left-and-right sweeps the ordering tries. */
  orderSweeps: number;
  /**
   * A seed for one shuffled starting order of the ordering's sweep, tried alone; null tries the ranking's order, the
   * previous picture's and `orderStarts` seeded shuffles, and keeps the cheapest picture.
   */
  orderSeed: number | null;
  /**
   * How many seeded starts the ordering tries before the first picture, beside the ranking's order and the previous
   * picture's (2026-10-06); two since the search follows the first picture (2026-10-07).
   */
  orderStarts: number;
  /** What one crossing of the order's own count costs when a start's picture is priced, in pixels of wire. */
  crossingCost: number;
  /** What one pixel of the picture's height costs when a start's picture is priced, in pixels of wire. */
  heightCost: number;
  /** What one pair of cards swapped against the previous picture costs when a start's picture is priced, in pixels of wire; a slider since 2026-10-07. */
  churnCost: number;
  /** The room between neighbouring cards and lanes of a column, in CSS pixels. */
  itemGap: number;
  /** The room between sibling membranes' segments in a column they share. */
  bandGap: number;
  /** The least overlap of a membrane's segments in neighbouring columns, the corridor that joins them. */
  membraneNeck: number;
  /** The room between a membrane's outline and its members, which also rounds its corners. */
  membranePadding: number;
  /** A card may be no wider than this; null for as wide as its content asks. */
  cardMaxWidth: number | null;
}

/**
 * How a card's symbol rows stand: where their wires lead, which the many-file
 * layout chooses and the single-file view cannot; alphabetically; or as the
 * Live Doc lists them, the order of appearance in the file.
 */
export type SymbolOrder = "layout" | "alphabetical" | "appearance";

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
  /** Independent exploration branches, retained across perspectives. */
  pins?: PinSet;
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
