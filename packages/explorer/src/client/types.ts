import type { ExplorerNodePayload } from "../shared/types";
import type { PaletteName } from "./palette";
import type { ReadingChoice } from "./reading-state";
import type { PinSet } from "./views/pin-state";

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
   * How a card shows its authored text, a comparison the owner asked for on 2026-11-05: "grow" opens a description on a
   * tap and the card grows around its held name; "slot" gives the Purpose and every described symbol a fixed two-line
   * slot cut with an ellipsis, and a tap on the name opens the full text in the reader, so a card's box depends on the
   * file's structure alone, never on what is read or on zoom.
   */
  cardText: "grow" | "slot";
  /**
   * With fixed slots, how a card changes as the map zooms out, a comparison the owner asked for on 2026-11-08: "three",
   * the default since 2026-11-13, three looks (reading, connections, overview), each held at one scale for every zoom
   * inside it, so that a card changes only twice on the way out; "stepped", the card ladder's five bands and eleven held
   * steps.
   */
  zoomLooks: ZoomLooks;
  /**
   * How an opened directory stands: "flow", the default since 2026-11-13, its files in the order the code flows, a file
   * left of the files that use it, one line for each pair of cards where one uses the other, and how its boxes, its files
   * no line joins and its tall ranks stand chosen by the picture's price; "grid", its files about as wide as tall with no
   * line until a file is pinned, the design from 2026-10-07 to 2026-11-13, one choice away.
   */
  directoryLayout: DirectoryLayout;
  /**
   * How a closed directory's box is drawn: "cells", the default since 2026-11-15 (the owner: "Cells is definitely my
   * favorite"), a skin holding a cell for each file and a small skin for each directory inside, as the 3D bag of cells
   * does; "box", the plain box; "stack", the top card of a stack whose edges show how much it holds. Looks only: the
   * box's size and what its controls do are the same in each.
   */
  closedDirectory: ClosedDirectoryLook;
  /**
   * The shape of the skin with cells, three matched variants for the owner's eye (2026-11-15, after "more square-ish?
   * something to look slightly more directory shaped?"): "tab", a folder's silhouette with the name on its tab; "round",
   * the capsule; "square", the same skin with a card's corners.
   */
  closedShape: ClosedDirectoryShape;
  /**
   * What colours the skin's cells: "kind", the default, the colour the 3D map gives a file of that kind (the owner's
   * choice of 2026-11-16, on seeing both: "I _love_ the splash of color those directories provide ... Yeah color for
   * sure!"); or "grey", one grey for all. The colour comes from one place, the 3D map's `spatialNodeStyle`, so that
   * the cells and the spheres change together; each cell says its file's name on hover.
   */
  closedCells: ClosedCellColour;
  /**
   * What a directory drawn only around what the pins need says of the files and directories it does not draw (a trial
   * for the owner's eye, 2026-11-17, after "Could those be represented as cute little cells that could be clicked on to
   * expand them into fuller-sized nodes?"): "count", the default, the words "+2 files" in its handle's line; "cells", a
   * closed directory's own cell for each such file and its small skin for each such directory, which a press pins or
   * opens, beside the name in the handle's line; "under", the same marks as a closed directory's field under the line
   * in the strip's free height at the reading look, the line keeping the count's room for the path, and beside the name
   * from the connections look out, where the held line fills the strip. Looks only: no box or card moves for it.
   */
  hiddenFiles: HiddenFilesLook;
  /**
   * How the camera meets a fresh subject (a link, a search choice, the first open; 2026-11-19): "reading", the subject's
   * card at reading size with its neighbours cut; "then-neighbours", the same and then, once the picture has settled and
   * the rest has passed, an ease back to the neighbours, in three forms by where the cards' look changes, of which
   * "then-neighbours-after", the look changed at rest after the ease, is the default since 2026-11-22; "neighbours", on
   * the neighbours at once. The neighbours' frame is Fit's, held between reading scale and the connections look's
   * farthest press (camera-intent.ts).
   */
  arrival: ArrivalFraming;
  /**
   * Whether an arrival's pull-back waits for the person. "attended", the default since 2026-11-22: once the rest has
   * passed, it goes as soon as neither a pointer brought to the subject's card nor the keyboard's focus is on that card,
   * and stays for as long as either is. "never": it goes when the rest has passed. "pointed", the trial of 2026-11-21:
   * the rest starts again at every frame the pointer stands on the card, so the ease begins a whole rest after it left.
   */
  arrivalWaits: ArrivalWait;
  /**
   * How long, in seconds, an arrival that pulls back stays at reading size once the picture has settled, at the least
   * (the owner's "minimum of N seconds of reading view size time", 2026-11-22; camera-intent.ts, `ARRIVAL_REST_S`).
   */
  arrivalRest: number;
  /**
   * Who frames the camera after an arrival (a trial for the owner's eye, 2026-11-19, Turn 37 of the November 18 record):
   * "hand", the default, the person, with Arrival and the step as they are; "follows", the camera follows the pinned set,
   * newest first, until the person pans or zooms, and Fit gives the following back (camera-intent.ts's pinsFrame).
   */
  framing: CameraFraming;
  /**
   * What the camera frames after a step opens something inside the map (a cell pressed, a directory opened, a neighbour
   * pinned from a card), a trial for the owner's eye (root's brief, 2026-11-21): "least", the default, the scale kept and
   * the least pan that brings the newcomer's start into view, as since 2026-11-19; "whole", the scale kept where the whole
   * newcomer fits, else eased out just far enough to hold it, never past the connections look's farthest press; "lines",
   * the frame Fit would give the newcomer and the cards its lines reach, under the same floor (camera-intent.ts).
   */
  step: StepFraming;
  /**
   * Whether the cut is said at the frame's edges after a step (a trial beside Step, 2026-11-21, default off): at each edge
   * past which what the step opened goes on, an arrow and the count of its cards there, which pans to them when pressed
   * (cut-signs.ts).
   */
  cutCounted: CutCounted;
  /**
   * Whether a 2D wire answers when asked (a trial of 2026-11-21 on strangers' stumble over which way a line runs, on by
   * default since 2026-11-22): a pointer resting on a wire, a press on it or the keyboard's focus fades the others and
   * shows, beside it, which file uses which, what it uses and how many references (wire-answers.ts).
   */
  wireAnswers: WireAnswersChoice;
  /**
   * Small open chevrons on each 2D wire (a trial of 2026-11-21, default none): "along", from what is offered to what uses
   * it, the owner's rule; "against", from the user to what it uses, the dependency arrow's convention, there only to learn
   * which a stranger brings (wire-marks.ts).
   */
  directionMarks: DirectionMarks;
  /**
   * What a way down from the World Map brings to the Local Map (a trial of 2026-11-22, on six strangers who named the
   * chain of systems from the board and none of whom reached a file): "alone", the default, a thing's folder opened and
   * every pin let go, as since the World Map was built; "question", the thing's folder with the files that carry its
   * wires pinned, a wire as the files at its two ends, and two things as the path between their folders, each landing
   * with the board's pin kept for the way back (worldMap/way-down.ts).
   */
  wayDown: WayDown;
  /**
   * Which way the 2D picture reads (2026-11-22, the toolbar's mirror button): the person's own, kept with their other
   * settings and carried by no link, as a palette is not (reading-direction.ts).
   */
  reads: MapReads;
  /**
   * With the three looks, what the overview look draws (a trial for the owner's eye, 2026-11-13): "keep", the default,
   * every card at the size its rows give it, as at the closer looks; "files", every file card in the compact form an
   * opened directory's member has in Flow, one line for each pair of cards where one uses the other, laid out again for
   * those sizes and moved to.
   */
  overviewFiles: OverviewFiles;
  /**
   * With fixed slots and the three looks, what a described row keeps of its description in the connections look,
   * alternatives for the owner's eye (2026-11-13 and 2026-11-15): "hidden", the default, nothing; "first-line", its
   * first line under a name that takes one line there; "line-end" and "line-middle", its first line on every described
   * row, the name held to one line and cut at its end or in its middle, at a seam.
   */
  descriptionsZoomedOut: DescriptionsZoomedOut;
  /** With fixed slots, how many lines of text each symbol's slot holds, filled or not; the default is to be found by eye (2026-11-05). */
  slotLines: number;
  /** With fixed slots, how much names resist the zoom below reading scale: 0 follows the map, 1 holds screen size (2026-11-05). */
  textResistance: number;
  /** With fixed slots, how much a card's buttons and anchor dots resist the zoom: 0 follows the map, 1 holds screen size (2026-11-05). */
  controlResistance: number;
  /**
   * With fixed slots, how much larger than its held size a name may grow on screen into the room its description leaves
   * below reading scale, each name bounded by its own row and the file's by its header (2026-11-05, Turn 11): 1 holds,
   * 1.5 grows by half.
   */
  nameGrowth: number;
  /**
   * How strongly the ranking pulls every file toward the last column: zero ranks by the fewest column spans, a weight
   * above every pair's by longest-chain depth, as before 2026-10-06. A lever of the layout lab.
   */
  rankingPull: number;
  /** Which column a file takes when several cost the same: the one with the fewest other cards, the rightmost, or the leftmost. */
  rankingTie: "fewest" | "right" | "left";
  /**
   * What a reference read backward through a cycle costs a picture, in pixels of wire, a term of the placed price that
   * chooses each cycle's order: zero weighs only the wire, and the higher, the more wire the picture spends to return
   * fewer references (Tuning → 2D Layout → Return Cost, 2026-11-16). Carried by a link.
   */
  returnCost: number;
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
  /**
   * What one pixel of the picture's width costs, in pixels of wire: set against the height's cost, it chooses how an
   * opened directory's closed boxes, its files no line joins and its tall ranks stand in flow order (2026-11-13).
   */
  widthCost: number;
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
  appearance: AppearanceTuning;
}

/**
 * How the page is drawn, the viewer's own (2026-11-16): the palette, by name, and since 2026-11-17 whether files are
 * drawn as marbles. Saved, as every setting is, only when it differs from the default; not carried in a shared link.
 */
export interface AppearanceTuning {
  palette: PaletteName;
  marbles: MarbleChoice;
  frame: FrameChoice;
}

/**
 * What frames the map (a trial, 2026-11-19, the owner's "That would be great!" to a page without its sidebar, judged in
 * the app): the sidebar, today's page, or Bare, where the views are a breadcrumb in the top bar, the legend and the
 * display filters one key opened from the bottom strip, and Tuning a sheet opened from the strip's tuning button. The
 * viewer's own, saved in the browser and never carried by a link.
 */
export type FrameChoice = "sidebar" | "bare";

/** Every frame, in the order the control offers them; the first, the sidebar, is the default. */
export const FRAME_CHOICES: readonly FrameChoice[] = ["sidebar", "bare"];

/**
 * Whether a file is drawn as a marble (a trial, 2026-11-17, the owner's "Do it do it do it do it!!!!" of the November 16
 * record, Turn 9): its kind's colour as glass with veins of the offering blue and the using green, as many as the files
 * that use it and that it uses, in the 3D map's spheres and the 2D map's closed directories' cells; or not. On was the
 * default on 2026-11-18 and 19 (the owner's "I think they are a worthy new default", the November 17 record, Turn 13);
 * Off is again since 2026-11-19, the owner's "for immediate understandability of the system, Marbes Off is superior":
 * one colour meaning across the 3D spheres and the 2D cells, and less fine detail in a view they found "Still quite noisy".
 */
export type MarbleChoice = "off" | "on";

/** Every marble choice, in the order the control offers them; the first, off, is the default. */
export const MARBLE_CHOICES: readonly MarbleChoice[] = ["off", "on"];

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

/**
 * How the files a step of the history changed are told apart in the 3D picture while the history is shown (the owner's
 * ask of 2026-10-31): the changed spheres glow, the unchanged ones dim, both, or neither. While the history plays, the
 * emphasis holds for the whole displayed commit, in playback and at rest; the next commit replaces the changed set.
 */
export type ChangeEmphasis = "glow" | "dim" | "both" | "none";

/** Every emphasis, in the order the control offers them. */
export const CHANGE_EMPHASES: readonly ChangeEmphasis[] = ["glow", "dim", "both", "none"];

/** The levers of the history's scrubber, the view's half of the granularity seam (2026-10-18), and the picture's emphasis on a step's changes (2026-10-31). */
export interface HistoryTuning {
  axis: HistoryAxis;
  granularity: HistoryGranularity;
  /** How many steps play passes in a second. */
  playRate: number;
  /** How a step's changed files are told apart in the picture. */
  changeEmphasis: ChangeEmphasis;
}

/**
 * How the 3D Local Map wraps the files it does not show (an experiment, 2026-11-05): not at all, the default; or, in a
 * translucent skin, a cloud, or a cloud that gains a smooth rim on hover or keyboard focus, a disconnected group it shows
 * only by its seed and, inside a group it shows in part, the hidden files of each directory as a shell.
 */
export type GroupWrappers = "off" | "skin" | "cloud" | "cloud-rim";

/** Every wrapper choice, in the order the control offers them. */
export const GROUP_WRAPPERS: readonly GroupWrappers[] = ["off", "skin", "cloud", "cloud-rim"];

/**
 * What the 3D Local Map draws of the files beyond the hops shown, with Group Wrappers on in the Connections layout while
 * something is asked about (a trial, 2026-11-18): everything, today's picture and the default, every other file of a
 * group shown in part held in a shell and every unreached group's seed standing past the hops; or the next step, the
 * horizon, only the files one step past what stands in the picture, in shells or alone, and nothing farther until a step
 * brings it to the edge (`forceGraphShells.ts`).
 */
export type BeyondHops = "everything" | "next-step";

/** Every choice of what stands beyond the hops, the default first, in the order the control offers them. */
export const BEYOND_HOPS: readonly BeyondHops[] = ["everything", "next-step"];

/**
 * Whether the 3D Local Map, opened with nothing asked about, plays a scan (a trial for the owner's eye, 2026-11-22: "let
 * users do some exploring in 2D/3D local map _while the scan is happening_"): off, the picture as it is and the
 * default; or the finished graph's files arriving one by one after a scan's waits, in path order, as a scan finishes
 * them, or in the order the history says they were first committed (`views/scanGrowth.ts`). Nothing is scanned: the
 * bundle's finished graph is fed in a scan's rhythm, so that the look can be judged before the engine is changed.
 */
export type ScanGrowth = "off" | "path" | "first-commit";

/** Every choice of the scan trial, the default first, in the order the control offers them. */
export const SCAN_GROWTHS: readonly ScanGrowth[] = ["off", "path", "first-commit"];

/** The rhythm the scan trial plays at: the one measured on this repository, or four times slower, as on a weak machine. */
export type ScanPace = "measured" | "slower";

/** Every pace of the scan trial, the default first, in the order the control offers them. */
export const SCAN_PACES: readonly ScanPace[] = ["measured", "slower"];

/** How a slot card changes as the 2D map zooms out: the card ladder's steps, or the three looks of the 2026-11-10 trial. */
export type ZoomLooks = "stepped" | "three";

/**
 * Every Zoom Looks choice, in the order the control offers them, the default first: the three looks since 2026-11-13,
 * when the owner asked that what they judge be what the build shows without a switch; the ladder's steps one choice away.
 */
export const ZOOM_LOOKS: readonly ZoomLooks[] = ["three", "stepped"];

/** How an opened directory stands in the 2D map: the flow order and pair lines first tried on 2026-11-12, or the grid. */
export type DirectoryLayout = "grid" | "flow";

/**
 * Every Opened Directory choice, in the order the control offers them, the default first: Flow since 2026-11-13, when
 * the owner had found it better "in basically every place I look" and asked that what they judge be what the build
 * shows without a switch; the grid one choice away.
 */
export const DIRECTORY_LAYOUTS: readonly DirectoryLayout[] = ["flow", "grid"];

/** How a closed directory's box is drawn in the 2D map: a skin with cells, the plain box, or a stack. */
export type ClosedDirectoryLook = "cells" | "box" | "stack";

/** Every Closed Directory choice, in the order the control offers them; the first, the skin with cells, is the default. */
export const CLOSED_DIRECTORY_LOOKS: readonly ClosedDirectoryLook[] = ["cells", "box", "stack"];

/** The shape of a closed directory's skin with cells: a folder's silhouette, the capsule, or a card's corners. */
export type ClosedDirectoryShape = "tab" | "round" | "square";

/** Every shape, in the order the control offers them; the first is the default until the owner chooses. */
export const CLOSED_DIRECTORY_SHAPES: readonly ClosedDirectoryShape[] = ["tab", "round", "square"];

/** What colours a skin's cells: each file's kind, as in the 3D map, or one grey. */
export type ClosedCellColour = "kind" | "grey";

/** Every cell colouring, in the order the control offers them; the first is the default. */
export const CLOSED_CELL_COLOURS: readonly ClosedCellColour[] = ["kind", "grey"];

/**
 * What a drawn directory's handle says of what it does not draw: the count's words; a cell for each beside its name; or, at the
 * reading look, a cell for each under its name, in the strip's free height, and beside it from the connections look out.
 */
export type HiddenFilesLook = "count" | "cells" | "under";

/**
 * Every Hidden Files choice, in the order the control offers them; the first, Cells under name, is the default since
 * 2026-11-18, when the owner asked that the defaults reflect the cells' pictures (the November 17 record, Turn 13) and
 * root chose which of the two cell values. The count was the default before.
 */
export const HIDDEN_FILES_LOOKS: readonly HiddenFilesLook[] = ["under", "cells", "count"];

/**
 * How the 2D camera meets a fresh subject: at reading size, at reading size and then on the neighbours, or on the
 * neighbours. The pull-back to the neighbours has two more forms beside it, trials of 2026-11-21 for the owner's eye on
 * its motion: "then-neighbours-after" holds the cards' look through the ease and changes it once at rest at the end;
 * "then-neighbours-before" changes it at rest before the ease begins (camera-intent.ts, `arrivalLookChange`).
 */
export type ArrivalFraming = "reading" | "then-neighbours" | "then-neighbours-after" | "then-neighbours-before" | "neighbours";

/**
 * Whether an arrival's pull-back waits for the person: "attended", after the rest at reading size (Tuning's Arrival
 * Rest) it goes as soon as neither the pointer nor the keyboard's focus is on the subject's card, and stays while either
 * is; "never", it goes when the rest has passed; "pointed", the trial of 2026-11-21, the rest starts again at every frame
 * the pointer stands on the card (camera-intent.ts, `arrivalReleased`).
 */
export type ArrivalWait = "attended" | "never" | "pointed";

/**
 * Every Arrival Waits choice, in the order the control offers them; the first is the default: "attended" since
 * 2026-11-22, the owner's "ensure a minimum of N seconds of reading view size time, then permit immediate zoom-out when
 * pointer exits node". Never was the default before.
 */
export const ARRIVAL_WAITS: readonly ArrivalWait[] = ["attended", "never", "pointed"];

/**
 * Every Arrival choice, in the order the control offers them; the first is the default: the pull-back with its look
 * changed at rest after it since 2026-11-22, the owner's choice by eye among the three forms ("\"Reading, Then
 * Neighbours, Look After\""). Reading size was the default before.
 */
export const ARRIVALS: readonly ArrivalFraming[] = ["then-neighbours-after", "reading", "then-neighbours", "then-neighbours-before", "neighbours"];

/**
 * Who frames the 2D camera: the person by hand, or the camera following the pins until the person takes it; "follows-files",
 * a matched alternative for the owner's eye (root's ruling, 2026-11-19), follows as far out as the overview look when every
 * target is a whole-file pin.
 */
export type CameraFraming = "hand" | "follows" | "follows-files";

/** Every Framing choice, in the order the control offers them; the first, by hand, is the default until the owner has seen the other. */
export const FRAMINGS: readonly CameraFraming[] = ["hand", "follows", "follows-files"];

/**
 * What the 2D camera frames after a step: the newcomer's start by the least pan, the newcomer whole, or the newcomer
 * with what its lines reach (a trial, 2026-11-21; a fourth value, the least pan with the cut counted at the edges, is to
 * follow).
 */
export type StepFraming = "least" | "whole" | "lines";

/** Every Step choice, in the order the control offers them; the first, the least pan, is the default until the owner has seen the others. */
export const STEPS: readonly StepFraming[] = ["least", "whole", "lines"];

/** Whether the cut is said at the edges after a step: off, the default, or on (a trial, 2026-11-21). */
export type CutCounted = "off" | "on";

/** Every Cut Counted choice, in the order the control offers them; the first, off, is the default until the owner has seen the other. */
export const CUT_COUNTED: readonly CutCounted[] = ["off", "on"];

/** Whether a 2D wire answers a rested pointer, a press and the keyboard's focus: on or off. */
export type WireAnswersChoice = "off" | "on";

/**
 * Every Wire Answers choice, in the order the control offers them; the first is the default: on since 2026-11-22, by the
 * owner's eye ("Yeah the Wire Answers \"On\" is really awesome"). Off was the default while it was a trial of 2026-11-21.
 */
export const WIRE_ANSWERS: readonly WireAnswersChoice[] = ["on", "off"];

/** The way a 2D wire's marks point: none drawn, along the owner's rule, or against it (a trial, 2026-11-21). */
export type DirectionMarks = "none" | "along" | "against";

/** Every Direction Marks choice, in the order the control offers them; the first, none, is the default. */
export const DIRECTION_MARKS: readonly DirectionMarks[] = ["none", "along", "against"];

/** What a way down from the World Map brings: the thing's folder alone, or the question asked on the board (a trial, 2026-11-22). */
export type WayDown = "alone" | "question";

/** Every Way Down choice, in the order the control offers them; the first, the folder alone, is the default until the owner has seen the other. */
export const WAY_DOWNS: readonly WayDown[] = ["alone", "question"];

/**
 * Which way a 2D picture reads (2026-11-22): what offers first from the left, the rule since December 2025, or what
 * uses first, the same picture mirrored. The colours never change with it.
 */
export type MapReads = "offersFirst" | "usesFirst";

/** Both ways a 2D picture reads; the first is the default. */
export const MAP_READS: readonly MapReads[] = ["offersFirst", "usesFirst"];

/**
 * What the 2D map's overview look draws: files only, as in Flow, or cards at their size. Files only was a trial of
 * 2026-11-13 and is the default since 2026-11-15, by the owner's eye and a comparison with the cards' rows drawn as bars.
 */
export type OverviewFiles = "keep" | "files";

/** Every Zoomed Out Fully choice, in the order the control offers them, the default first. */
export const OVERVIEW_FILES: readonly OverviewFiles[] = ["files", "keep"];

/**
 * What a described row keeps of its description in the connections look: nothing; its first line where its name leaves
 * room, taking one line (the 2026-11-13 trial); or its first line on every described row, the name held to one line
 * and cut with an ellipsis at its end, or in its middle at a seam, where it does not fit (2026-11-15, after the owner's
 * "the only reason it doesn't look quite as good ... is because the symbol name itself is willing to wrap onto a new
 * line").
 */
export type DescriptionsZoomedOut = "hidden" | "first-line" | "line-end" | "line-middle";

/** Every Descriptions Zoomed Out choice, in the order the control offers them; the first, nothing kept, is the default. */
export const DESCRIPTIONS_ZOOMED_OUT: readonly DescriptionsZoomedOut[] = ["hidden", "first-line", "line-end", "line-middle"];

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
  /** Baseline 3D wire diameter: world units at zero resistance, CSS pixels at the orbit target at full resistance. */
  linkWidth: number;
  /** Zoom compensation: zero preserves perspective, one holds screen radii at the orbit-target plane. */
  nodeZoomResistance: number;
  /**
   * How large a sphere must draw on screen, in pixels of radius, before its name is shown beside it: the names of what
   * was asked about and of the hovered sphere show always, the rest "until _the very last second_" (the owner,
   * 2026-11-02, finding the picture "overexcited to draw text"). Six pixels, unlevered, before.
   */
  nameAt: number;
  /** Zoom compensation: zero preserves perspective, one holds screen widths at the orbit-target plane. */
  wireZoomResistance: number;
  /**
   * How strongly every sphere is drawn toward the picture's centre, in proportion to its distance from it: the restoring
   * force the simulation lacked, so that a picture pushed apart by a reheat returns and two unconnected clusters are not
   * left to repel each other without end (the owner's "weak gravity", 2026-10-17). Zero is no pull.
   */
  gravity: number;
  /** Reduce disconnected groups' common-centre attraction without weakening their internal gravity; zero keeps one global pull. */
  componentSeparation: number;
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
   * zero means none of it. The lever runs to 0.5, the largest setting at which every picture measured came to rest: an
   * approximated field's forces jump where a cell crosses the opening threshold, and at 0.9 most pictures never fell
   * still (the lab's measurement of 2026-10-28).
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
   * How strongly each sphere is also held where it stands once the picture, wholly entered, has calmed, per unit of
   * distance, beside the tether: a trial for the eye of a shorter settle (2026-11-19), zero by default, which is the
   * picture as it was. A calmed picture's spheres went on rearranging slowly against their tethers, this repository's
   * grown discovery group for some 2,450 ticks; held, they slow to a stop near where they stood when it calmed, which is
   * not where the forces would have taken them.
   */
  settleHold: number;
  /**
   * How hard a document's citation of a file pulls the two together in the connections layout, as a share of a
   * documented reference's spring: one pulls like a reference, zero draws the line and moves nothing. The owner asked
   * to see such links pull before deciding whether they should (2026-10-22); a lever lets the eye compare.
   */
  citedByPull: number;
  /**
   * How many hops around what was asked about the picture shows, the last of them dimmed as the frontier: the pins, the
   * subject, the inspected file, an open directory's files and a path, then their connections a hop at a time, and
   * nothing beyond. Two shows a file's connections in full and their connections dimmed, the owner's design of
   * 2026-10-31, "tunable by starting at 2"; one shows only the direct connections, as the frontier.
   */
  hops: number;
  /**
   * How many drawn frames the picture takes to enter, hop by hop, whatever its size, at least one sphere a frame: the
   * pace of the reveal (2026-10-31), so that the structure unfurls before the eye rather than appearing whole.
   */
  revealFrames: number;
  /**
   * How the files the picture does not show are wrapped: a group shown only by its seed in a padded hull of its files,
   * which a click pops open as it pins the seed, and the hidden files of a group shown in part in directory shells, which
   * a click pops open (`forceGraphWrappers.ts`, `forceGraphShells.ts`); off by default, so the picture is as before (2026-11-05).
   */
  groupWrappers: GroupWrappers;
  /**
   * How deep under the scan root the directory shells stand, with Group Wrappers on (experiment 2, 2026-11-05): the files
   * a picture leaves out of a group it shows in part are held by the shell of their directory cut to this many
   * directories, one body each (`forceGraphShells.ts`); a pop opens a shell into its own files and its subdirectories'
   * shells.
   */
  shellDepth: number;
  /**
   * What stands beyond the hops shown, with Group Wrappers on in the Connections layout while something is asked about (a
   * trial, 2026-11-18): everything, today's picture, or the next step alone (`BeyondHops`).
   */
  beyondHops: BeyondHops;
  /** Whether the map opened with nothing asked about plays a scan, and in which order its files arrive (a trial, 2026-11-22; `ScanGrowth`). */
  scanGrowth: ScanGrowth;
  /** The rhythm the scan trial plays at (`ScanPace`). */
  scanPace: ScanPace;
}

/** The end of a path a person asked for: a file, perhaps one symbol of it, or a directory. The path starts at the newest pin (2026-10-14). */
export type PathDestination =
  | { kind: "file"; nodeId: string; symbol?: string }
  | { kind: "directory"; directory: string };

/** The evidence explicitly open in the reader, independent of the Local Map subject and its pins. */
export type InspectionTarget = (
  | { kind: "file"; nodeId: string; symbol?: string }
  | { kind: "bundled-doc"; path: string; fragment?: string }
  | { kind: "directory"; directory: string }
) & { presentation?: "reading" };

/** The latest discovery remains in the map after its evidence closes; a new discovery replaces it and Pin keeps it. */
export type DiscoveryTarget = { kind: "file"; nodeId: string } | { kind: "directory"; directory: string };

/**
 * Root state object for the Explorer client, managed by
 * `persistence/local-storage.ts` and consumed by every view.
 */
export interface ExplorerState {
  /** Deliberate reading overrides, shared independently of pinning; temporary hover is view-local. */
  reading?: readonly ReadingChoice[];
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
  discovery?: DiscoveryTarget | null;
  filters: ExplorerFilters;
  tuning: TuningConfig;
}

/** Map from implementation file path → covering test node(s). */
export type TestCoverageMap = Map<string, ExplorerNodePayload[]>;
