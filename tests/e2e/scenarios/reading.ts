/**
 * What one settled picture of the 2D Local Map says, as data: the middle layer of the scenario suite.
 *
 * A scenario is a map and an address; a reading is what the page shows once it has settled there; judgments are pure
 * functions over readings (`judgments.ts`). This module holds only the reading's shape, so that the judgments and
 * their unit tests can build readings by hand without a browser. The instrument that fills it from the page is
 * `instrument.ts`; it reuses the still-picture instrument's wire and card reading and the design audit's text faults,
 * and adds only what those do not read (directories, lanes, the frame and its edge signs, wire styles, anchors).
 *
 * Every box is in screen pixels (CSS pixels of the page, after the camera's transform), as `getBoundingClientRect`
 * gives it.
 */

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A drawn file card. */
export interface CardRead {
  /** The file's id in the map, the card's `data-id`. */
  id: string;
  box: Box;
  /** The card is the map's subject (`.local-focus`). */
  subject: boolean;
  /** The file is pinned whole or by a symbol (its pin pressed, or a pinned row). */
  pinned: boolean;
  /** The directory band the card stands in directly, by its `data-directory`; "" for the root; null outside any band. */
  directory: string | null;
}

/** A symbol's dot on a card's edge, where its wires meet the card. */
export interface AnchorRead {
  file: string;
  symbol: string;
  /** In the 2D drawing uses enter on the left (`inbound`, a wire from what the row uses) and offerings leave on the right (`outbound`, a wire to what uses the row). */
  side: "inbound" | "outbound";
  /** The dot's centre. */
  x: number;
  y: number;
}

/** What a drawn wire is. */
export type WireKind =
  /** An ordinary route between two cards. */
  | "route"
  /** A short closed shape at one pin, marking a reference drawn no further (a cycle's feedback, the French Corset's stub). */
  | "stub"
  /** A bundle's shared run, drawn beneath the wires it carries. */
  | "run"
  /** A back reference's route, shown on hover only. */
  | "back";

export interface WireRead {
  /** consumer|provider|consumerSymbol|providerSymbol, as the still-picture instrument keys it. */
  key: string;
  consumer: string;
  provider: string;
  kind: WireKind;
  /** The path sampled every 8 px in screen pixels, from its first drawn end to its last. Empty for a wire not sampled. */
  points: Array<[number, number]>;
  /** Which end of `points` sits at the provider's card. */
  providerEnd: 0 | 1;
  /** Samples that fell on a card the wire does not end at. */
  occludedSamples: number;
  /** Samples inside a lane that lies in a directory holding neither end of the wire. */
  foreignLaneSamples: number;
  /** Computed opacity and filter, at rest. */
  opacity: number;
  filter: string;
}

/** One directory as the renderer published it: its segments, column by column, and the cards it holds directly. */
export interface DirectoryRead {
  directory: string;
  /** The enclosing directory's band, or null at the top. */
  parent: string | null;
  /** Whether an outline is drawn for it; the root draws none. */
  drawn: boolean;
  /** Its segments in screen pixels, one per column it spans, in column order. */
  segments: Array<{ column: number; box: Box }>;
  /** The padding a segment keeps around the cards it holds, in screen pixels (the product's inset times the scale). */
  insetPx: number;
}

/** A gap the map reserves for wires passing a column. */
export interface LaneRead {
  box: Box;
  /** The slot lines the router publishes, in the lane's own pixels from its top. */
  slots: number[];
}

/** A text fault the design audit found. */
export interface TextFault {
  kind: "collision" | "cut";
  text: string;
  /** For a collision, the other text. */
  other?: string;
  /** Overlap area in px² for a collision; hidden px for a cut. */
  amount: number;
}

/** The colour facts the tone promises are read from, already reduced to contrast ratios against their surfaces. */
export interface ToneRead {
  /** Contrast of the subject card's file name, a symbol's name and the prose, each against the card. */
  fileName: number | null;
  symbolName: number | null;
  prose: number | null;
  /** Contrast of an opened directory's outline and of a card's border against the map's surface; null without a directory. */
  outline: number | null;
  cardBorder: number | null;
  /** The alpha of an opened directory's fill. */
  outlineFillAlpha: number | null;
  /** The computed colours themselves, for promises of sameness: the subject's file name as drawn at this look (whole or held), a symbol's name, its Purpose and an open description. */
  colours: { fileName: string | null; symbolName: string | null; purpose: string | null; description: string | null };
}

/** A name as drawn: its text and the lines it stands on, top to bottom. */
export interface NameRead {
  text: string;
  lines: string[];
}

export interface Reading {
  /** The scenario's name and the map's base, for reports. */
  scenario: string;
  map: string;
  /** The page's address once settled (path and query, without the origin). */
  address: string;
  viewport: { width: number; height: number };
  /** The frame the map fits into: the edge signs' element, which stands exactly over it. */
  frame: Box;
  /** The whole picture's box, `.local-layout`; null on an empty map. */
  picture: Box | null;
  /** Which edges the map says the picture continues past. */
  edgeSigns: { above: boolean; below: boolean; left: boolean; right: boolean };
  /** The camera's scale. */
  scale: number;
  /** Whether the picture is drawn mirrored, what uses first from the left (the map layer's `data-reads`); absent, as laid out. */
  mirrored?: boolean;
  /** The map's look (`data-look`): reading, connections, overview, or the ladder's band. */
  look: string | null;
  cards: CardRead[];
  anchors: AnchorRead[];
  wires: WireRead[];
  directories: DirectoryRead[];
  lanes: LaneRead[];
  /** The columns of a picture's root (`.local-directory-root > .local-column`): each distinct column's left and the top of its first content. */
  rootColumns: Array<{ x: number; top: number }>;
  /** File and symbol names with the lines they are drawn on. */
  names: NameRead[];
  /** How many text boxes the audit read, so that "no faults" on no text can be told apart. */
  textBoxes: number;
  textFaults: TextFault[];
  tone: ToneRead;
  /** Console errors and uncaught page errors while the scenario loaded and settled. */
  consoleErrors: string[];
  /** Requests the page made to any origin other than its own. */
  offSiteRequests: string[];
  /** The screenshot saved beside this reading, relative to the readings' folder. */
  screenshot: string;
}
