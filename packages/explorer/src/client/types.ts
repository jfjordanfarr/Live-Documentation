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
  /** Whether the 3D Local Map draws the documents the files' authored words cite. */
  showRelatedDocs: boolean;
  /** Whether the 3D Local Map draws the documents whose own links cite the files, their `Cited By` sections (2026-10-22). */
  showCitingDocs: boolean;
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
  history: HistoryTuning;
}

/**
 * Which ticks the history's scrubber draws and the step key moves between: every step; one per day, week or month
 * (UTC), the period's last step; the salient steps alone; or an automatic choice by the number of steps, so that a
 * five-commit repository shows five ticks and a long history shows months (the view's half of the plan's C14, 2026-10-18).
 */
export type HistoryGranularity = "auto" | "step" | "day" | "week" | "month" | "salient";

/** Every granularity, in the order the control offers them. */
export const HISTORY_GRANULARITIES: readonly HistoryGranularity[] = ["auto", "step", "day", "week", "month", "salient"];

/** How the scrubber lays its steps out: evenly by step, or by date, where a quiet stretch reads as a gap (scenario 14). */
export type HistoryAxis = "steps" | "time";

/** The levers of the history's scrubber, the view's half of the granularity seam (2026-10-18). */
export interface HistoryTuning {
  axis: HistoryAxis;
  granularity: HistoryGranularity;
  /** How many steps play passes in a second. */
  playRate: number;
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
  /** Baseline 3D wire diameter: world units at zero resistance, CSS pixels at full resistance. */
  linkWidth: number;
  /** Compensation for perspective sizing: zero preserves it, one holds node screen radii constant. */
  nodeZoomResistance: number;
  /** Compensation for perspective sizing: zero preserves it, one holds wire screen widths constant. */
  wireZoomResistance: number;
  /**
   * How strongly every sphere is drawn toward the picture's centre, in proportion to its distance from it: the restoring
   * force the simulation lacked, so that a picture pushed apart by a reheat returns and two unconnected clusters are not
   * left to repel each other without end (the owner's "weak gravity", 2026-10-17). Zero is no pull.
   */
  gravity: number;
  /**
   * How far a sphere's repulsion reaches, in layout units; zero is unbounded, the library's default. A bound keeps far
   * clusters from pushing on one another while the springs and the collision still shape the near picture.
   */
  chargeRange: number;
  /**
   * How far the repulsion may be approximated to keep a large picture quick: the opening ratio of Barnes and Hut's octree
   * sum, zero for the exact sum over every pair, larger for faster and less exact. The exact sum costs the square of the
   * spheres, 2.2 seconds an evaluation at the T3 bundle's 21,720 (2026-10-27); the owner decided on 2026-10-28 that an
   * approximation may be the default with the exact sum kept as the oracle, and named the lever for what it adds, so that
   * zero means none of it.
   */
  approximation: number;
  /**
   * How hard a wire's spring pulls its two files together, as a multiple of D3's own rule, which gives each link one
   * over the smaller of its two ends' link counts, so that a file with many wires is pulled less by each. One is the
   * picture as it was before this lever existed; zero lets every wire go slack. The owner's ask of 2026-10-18, to tune
   * the pull between connected neighbours by eye against the pull to the centre.
   */
  linkStrength: number;
  /**
   * How hard a change to what is shown (a filter, a pin, a layout, a step of history) moves the picture: the constant
   * strength its motion eases at, as a share of the forces, until the spheres are still. One is the forces as they are,
   * a fraction the same pull more gently and so for longer, and zero places the new spheres and moves nothing. The lever
   * of ticket C2 of the change-over-time plan (2026-10-18), a strength with no cooling since 2026-10-21, when it was a
   * reheat's alpha; the first picture, a hand and a change of the forces always move at full strength.
   */
  updateEnergy: number;
  /**
   * How strongly each sphere is held to where it stood when the picture last began to move, per unit of distance: the
   * tether that brings a large picture to rest, since without it a file attached to nothing or a branch turning about its
   * joint drifts on for thousands of ticks, and that keeps a person's bearings through a change. Zero leaves the forces
   * alone to decide. The owner's choice of 2026-10-21, to tune by eye.
   */
  tether: number;
  /**
   * How hard a document's citation of a file pulls the two together in the connections layout, as a share of a
   * documented reference's spring: one pulls like a reference, zero draws the line and moves nothing. The owner asked
   * to see such links pull before deciding whether they should (2026-10-22); a lever lets the eye compare.
   */
  citedByPull: number;
}

/** The end of a path a person asked for: a file, perhaps one symbol of it, or a directory. The path starts at the newest pin (2026-10-14). */
export type PathDestination =
  | { kind: "file"; nodeId: string; symbol?: string }
  | { kind: "directory"; directory: string };

/** The evidence explicitly open in the reader, independent of the Local Map subject and its pins. */
export type InspectionTarget =
  | { kind: "file"; nodeId: string; symbol?: string }
  | { kind: "bundled-doc"; path: string; fragment?: string }
  | { kind: "directory"; directory: string };

/**
 * Root state object for the Explorer client, managed by
 * `persistence/local-storage.ts` and consumed by every view.
 */
export interface ExplorerState {
  /** Independent exploration branches, retained across perspectives. */
  pins?: PinSet;
  /** The end of the path asked for, drawn from the newest pin; null or absent when none is asked. */
  destination?: PathDestination | null;
  /** The file or directory the Knowledge Sources panel walks from in place of the entry points; null or absent for the entry points. */
  reachFrom?: PathDestination | null;
  /** The commit of the history the 3D Local Map shows, carried by the address; null or absent for today (2026-10-18). */
  historyCommit?: string | null;
  /** Whether the history's step panel names each commit's author; a toggle that rides the address (the plan's C8). */
  showAuthors?: boolean;
  /** The directories opened in the Local Map, retained with the pins (2026-10-08). */
  openDirectories?: ReadonlySet<string>;
  /** Oldest-first identities of retained selections, including directory openings. */
  retentionOrder?: readonly string[];
  view: ViewName;
  perspective: LocalMapPerspective;
  /** The 3D Local Map's layout, remembered like the perspective and carried by shared links. */
  spatialLayout: SpatialLayout;
  selectedNode: ExplorerNodePayload | null;
  inspection: InspectionTarget | null;
  filters: ExplorerFilters;
  tuning: TuningConfig;
}

/** Map from implementation file path → covering test node(s). */
export type TestCoverageMap = Map<string, ExplorerNodePayload[]>;
