import type { PinSet } from "./views/pin-state";
import type { ExplorerNodePayload } from "../shared/types";

/** The three navigable Explorer views. Local Map has two representations. */
export type ViewName = "map" | "sources" | "world";

/** The remembered representation of the Local Map. */
export type LocalMapPerspective = "2d" | "3d";

/**
 * How the 3D Local Map places its files: by their analyzed references, the emergent network of what the code does, or by
 * their declared directories, the emergent tree of what the file system says (the owner's distinction, 2026-10-14).
 */
export type SpatialLayout = "connections" | "structure";

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
 * Tuning knobs specific to the two-dimensional Local Map.
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
  /**
   * What a pixel of step between a membrane's neighbouring segments costs the placement, in units of a one-reference
   * wire's pixel: at zero the outline follows its members column by column; higher, it tends to the rectangle around
   * them. The owner's ask of 2026-10-07, that a directory be rewarded for rectangularity, as a lever of the layout lab.
   */
  membraneEvenness: number;
  /**
   * What each nonzero step in a membrane's boundary costs the picture, in equivalent weighted vertical wire pixels:
   * zero gives no preference to fewer steps; higher values favour simpler outlines independently of their evenness.
   */
  membraneSimplicity: number;
  /**
   * What a pixel between the tops of the k-th cards of a membrane's neighbouring columns costs, in the same units: at
   * zero the cards stand where their wires are shortest; higher, they stand in rows, the wires paying (2026-10-07).
   */
  rowLevelness: number;
  /**
   * How many levels of directory below the retained files' common directory are membranes; null for every level. A
   * lever of the layout lab for pricing the membrane rule (2026-10-07): at zero the cards interleave freely.
   */
  membraneDepth: number | null;
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
  forceGraph: ForceGraphTuning;
}

/** The 3D Local Map's packing and stable visual encodings, shared with the headless layout lab. */
export interface ForceGraphTuning {
  /** Preferred surface-to-surface gap for a pair with one documented reference. */
  linkGap: number;
  /** Magnitude of the repulsive force between files. */
  charge: number;
  /** Additional separation around a sphere when resolving overlaps. */
  collisionGap: number;
  /** How quickly the preferred gap falls with log2(reference count); zero ignores coupling. */
  coupling: number;
  /** Radius of a file with no exposed symbols, in layout units. */
  nodeSize: number;
  /** Exponent of symbol count in sphere volume; one gives cube-root radius growth. */
  symbolScale: number;
}

/**
 * Root state object for the Explorer client, managed by
 * `persistence/local-storage.ts` and consumed by every view.
 */
/** The end of a path a person asked for: a file, perhaps one symbol of it, or a directory. The path starts at the newest pin (2026-10-14). */
export type PathDestination =
  | { kind: "file"; nodeId: string; symbol?: string }
  | { kind: "directory"; directory: string };

export interface ExplorerState {
  /** Independent exploration branches, retained across perspectives. */
  pins?: PinSet;
  /** The end of the path asked for, drawn from the newest pin; null or absent when none is asked. */
  destination?: PathDestination | null;
  /** The file or directory the Knowledge Sources panel walks from in place of the entry points; null or absent for the entry points. */
  reachFrom?: PathDestination | null;
  /** The directories opened in the Local Map, retained with the pins (2026-10-08). */
  openDirectories?: ReadonlySet<string>;
  /** Oldest-first identities of retained selections, including directory openings. */
  retentionOrder?: readonly string[];
  view: ViewName;
  perspective: LocalMapPerspective;
  /** The 3D Local Map's layout, remembered like the perspective and carried by shared links. */
  spatialLayout: SpatialLayout;
  selectedNode: ExplorerNodePayload | null;
  focusedNode: ExplorerNodePayload | null;
  filters: ExplorerFilters;
  tuning: TuningConfig;
}

/** Map from implementation file path → covering test node(s). */
export type TestCoverageMap = Map<string, ExplorerNodePayload[]>;
