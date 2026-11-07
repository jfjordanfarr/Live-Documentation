/**
 * The card ladder's breakpoints (the owner, 2026-11-06, Turns 17 to 19): the camera's zoom against the calibrated reading
 * scale picks a coarse band, which says what leaves a card, and a fine step, which says how large what stays is drawn.
 * Both are named states with hysteresis, so that the stylesheet is written only when one of them changes and nothing is
 * computed between them; past the first and the last step nothing changes further.
 *
 * @module ladder-steps
 */

/** What a slot card shows, from the closest to the farthest. */
export type LadderBand = "close" | "reading" | "middle" | "far" | "overview";

const BANDS: readonly LadderBand[] = ["overview", "far", "middle", "reading", "close"];
/** A band is re-entered closer only 15 % past its edge, so that a camera resting on one does not chatter. */
export const BAND_MARGIN = 1.15;

/** The zoom between two steps: 20 %, four steps to a doubling, below what the eye reads as a change of size. */
export const STEP_RATIO = 1.2;

/**
 * The last press of each band before the next one out, in Zoom button presses from reading scale (negative closer):
 * the close band ends two presses in, the reading band one press out, the middle band at the fourth, the far band at the
 * sixth (the overview band begins at the seventh since the far bands' review of 2026-11-06, where a file's header held
 * one line and a row's name five letters beside its More while one press farther the file's name stood whole). The
 * bands' places were first set by ratio (2026-11-05, Turn 9): close above 1.3, middle below 0.74, far below 0.45,
 * overview below 0.25.
 */
const BAND_LAST_PRESSES = [6, 4, 1, -2];

/**
 * The ratios at which each band gives way to the next one out. A press out and a press back must show the same band,
 * since returning to a place keeps its picture: with a band entered farther at its edge and re-entered closer only
 * BAND_MARGIN past it, an edge between the press it follows (ratio r) and the next press out (r / STEP_RATIO) serves
 * both directions anywhere between r / STEP_RATIO and r / BAND_MARGIN, and it stands in that window's middle, r over the
 * square root of BAND_MARGIN times STEP_RATIO (about 1.175). The literal edges had stood where the press just closer fell
 * inside the margin, so that one press out was the reading band going out and the middle band coming back.
 */
const BAND_EDGES = BAND_LAST_PRESSES.map(press => STEP_RATIO ** -press / Math.sqrt(BAND_MARGIN * STEP_RATIO));
/** A step is left only a quarter step past its edges, so that a camera resting on one does not chatter. */
export const STEP_HYSTERESIS = 0.25;
/** The first step holds reading size and covers every closer zoom: zooming in never shrinks anything. */
export const FIRST_STEP = 0;
/** The last step, about a sixth of reading scale; farther out the card's held sizes stay and the card shrinks with the map. */
export const LAST_STEP = 10;

/**
 * The band of a zoom ratio, given the band the map shows: farther out at an edge, closer again only past the margin.
 * A ratio that is not a positive number keeps the band.
 */
export function ladderBand(ratio: number, previous: LadderBand): LadderBand {
  if (!Number.isFinite(ratio) || ratio <= 0) return previous;
  let index = BANDS.indexOf(previous);
  while (index > 0 && ratio < BAND_EDGES[index - 1]) index -= 1;
  while (index < BAND_EDGES.length && ratio > BAND_EDGES[index] * BAND_MARGIN) index += 1;
  return BANDS[index];
}

/**
 * The step of a zoom ratio, given the step shown (null before any): step n is centred on STEP_RATIO^-n, covering half a
 * step either side, and the step shown is kept until the ratio passes a quarter step beyond its edges either way. The
 * Zoom buttons move the camera by STEP_RATIO, so each of their steps lands in the middle of the next step, far from an
 * edge (with edges at whole steps, every click landed on one and the step it showed depended on rounding). Ratios closer
 * than the first step's far edge are the first step and farther than the last's near edge the last. A ratio that is
 * not a positive number keeps the step.
 */
export function ladderStep(ratio: number, previous: number | null): number {
  if (!Number.isFinite(ratio) || ratio <= 0) return previous ?? FIRST_STEP;
  // The distance out from reading scale in steps: 0 at reading scale, 1 one step out.
  const out = -Math.log(ratio) / Math.log(STEP_RATIO);
  const clampStep = (step: number): number => Math.min(LAST_STEP, Math.max(FIRST_STEP, step));
  if (previous !== null) {
    const kept = clampStep(previous);
    const low = kept === FIRST_STEP ? -Infinity : kept - 0.5 - STEP_HYSTERESIS;
    const high = kept === LAST_STEP ? Infinity : kept + 0.5 + STEP_HYSTERESIS;
    if (out >= low && out < high) return kept;
  }
  return clampStep(Math.round(out));
}

/** The resistances of Tuning → 2D Layout: 0 follows the map, 1 holds the screen size the step began with. */
export interface LadderResistances {
  textResistance: number;
  controlResistance: number;
}

/** A step's held scales, in the map's own units: what a name and a control are multiplied by while the step holds. */
export interface LadderScales {
  /** A name's held scale below reading scale, before the room it may grow into and Name Growth. */
  text: number;
  /** The node's controls', the row's More's and the anchor dots' held scale, before the stylesheet's ceilings. */
  control: number;
}

/**
 * The held scales of a step: at resistance 1 the reading screen size at the step's centre, STEP_RATIO to the step's
 * power, so that across the step and its margins a held size on screen lies between STEP_RATIO^-0.75 (0.87) and
 * STEP_RATIO^0.75 of its reading size; at 0 the map's own scale. A resistance outside 0 to 1 is read as its nearest end,
 * so no lever makes a runaway.
 */
export function ladderScales(step: number, resistances: LadderResistances): LadderScales {
  const held = (resistance: number): number => {
    const bounded = Number.isFinite(resistance) ? Math.min(1, Math.max(0, resistance)) : 1;
    return STEP_RATIO ** (Math.min(LAST_STEP, Math.max(FIRST_STEP, step)) * bounded);
  };
  return { text: held(resistances.textResistance), control: held(resistances.controlResistance) };
}
