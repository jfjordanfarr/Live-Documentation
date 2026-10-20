/**
 * The history's scrubber, along the bottom of the 3D Local Map (the plan's
 * C4; the owner, 2026-10-17: "the ability to scrub and have it feel good and
 * useful sounds way more useful" than play). A track with one tick per step
 * from the tick model, the major and minor ticks drawn apart and the quiet
 * ones faint; a thumb; the ruler of dates beneath; the date and the commit's
 * hash read out beside it, and the date and subject spoken as the slider's
 * value; play and pause as a second control; and the authors toggle, which
 * rides the address. The slider grammar is on the keys: the arrows move a
 * step, Page Up and Page Down between the major ticks, Home and End to the
 * ends. While the thumb drags, the steps it crosses are coalesced into one
 * call per animation frame, so that the thumb never lags the hand; when it
 * rests, one call says so.
 *
 * The left edge is marked truncated when the history begins where the
 * knowledge does rather than where the repository did (scenario 8).
 *
 * @module scrubber
 */

import { nextStop, stepAtPosition, type TickModel } from "./tick-model";
import { iconButton } from "../panels/icon-button";
import type { HistoryAxis } from "../types";

/** What the scrubber draws. */
export interface ScrubberState {
  /** The last step. */
  steps: number;
  step: number;
  model: TickModel;
  axis: HistoryAxis;
  /** Every step's commit date, for the pointer's reading of the track. */
  dates: readonly string[];
  /** The slider's value in words: the date and the commit's subject. */
  valueText: string;
  /** The readout beside the track. */
  date: string;
  hash: string;
  /** The words of the truncated left edge, or null when the history begins where the repository did. */
  truncated: string | null;
  playing: boolean;
  authors: { carried: boolean; shown: boolean };
  /** A word beside the track: the history loading, or a commit the address names that the history lacks. */
  notice: string | null;
}

/** What the scrubber tells. */
export interface ScrubberOptions {
  parent: HTMLElement;
  /** The thumb is moving: show the step, placed without a tick. */
  onScrub(step: number): void;
  /** The thumb rests at the step, or a key moved to it: show it settled. */
  onRest(step: number): void;
  onPlay(playing: boolean): void;
  onAuthors(shown: boolean): void;
}

/** The scrubber as the control drives it. */
export interface Scrubber {
  element: HTMLElement;
  sync(state: ScrubberState): void;
  hide(hidden: boolean): void;
  focus(): void;
}

const PLAY_ICON = '<path d="M8 5.5v13l10-6.5Z"/>';
const PAUSE_ICON = '<path d="M8 5.5v13M16 5.5v13"/>';
const AUTHORS_ICON = '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>';

/** Make the scrubber under its parent, hidden until synced. */
export function createScrubber(options: ScrubberOptions): Scrubber {
  const element = document.createElement("section");
  element.className = "history-scrubber";
  element.setAttribute("aria-label", "History");
  element.hidden = true;

  const play = iconButton("Play", PLAY_ICON);
  play.className = "history-play";
  play.setAttribute("aria-pressed", "false");

  const slider = document.createElement("div");
  slider.className = "history-slider";
  const track = document.createElement("div");
  track.className = "history-track";
  track.setAttribute("role", "slider");
  track.setAttribute("tabindex", "0");
  track.setAttribute("aria-label", "Step of the history");
  track.setAttribute("aria-valuemin", "0");
  // A history cut at its beginning gets a hatched band before its first tick; the lane with the ticks and the thumb,
  // and the ruler beneath, start after it, so that the beginning reads as the edge of what is known.
  const truncated = document.createElement("span");
  truncated.className = "history-truncated";
  truncated.hidden = true;
  const lane = document.createElement("div");
  lane.className = "history-lane";
  const ticks = document.createElement("div");
  ticks.className = "history-ticks";
  const thumb = document.createElement("div");
  thumb.className = "history-thumb";
  lane.append(ticks, thumb);
  track.append(truncated, lane);
  const ruler = document.createElement("div");
  ruler.className = "history-ruler";
  slider.append(track, ruler);

  const readout = document.createElement("span");
  readout.className = "history-readout";
  const date = document.createElement("span");
  date.className = "history-date";
  const hash = document.createElement("code");
  hash.className = "history-hash";
  readout.append(date, hash);
  const notice = document.createElement("span");
  notice.className = "history-notice";
  notice.hidden = true;

  const authors = iconButton("Show authors", AUTHORS_ICON);
  authors.className = "history-authors";
  authors.setAttribute("aria-pressed", "false");

  element.append(play, slider, readout, notice, authors);
  options.parent.append(element);

  let current: ScrubberState | null = null;
  let drawn = "";

  play.addEventListener("click", () => { if (current) options.onPlay(!current.playing); });
  authors.addEventListener("click", () => { if (current) options.onAuthors(!current.authors.shown); });

  // The keys: a step, a stop, an end; each a rest.
  track.addEventListener("keydown", event => {
    if (!current) return;
    const { step, steps, model } = current;
    let next: number;
    switch (event.key) {
      case "ArrowLeft": case "ArrowDown": next = Math.max(0, step - 1); break;
      case "ArrowRight": case "ArrowUp": next = Math.min(steps, step + 1); break;
      case "PageDown": next = nextStop(model, step, -1); break;
      case "PageUp": next = nextStop(model, step, 1); break;
      case "Home": next = 0; break;
      case "End": next = steps; break;
      default: return;
    }
    event.preventDefault();
    if (next !== step) options.onRest(next);
  });

  // The pointer: the steps crossed are coalesced into one call per frame; the release is the rest.
  let dragging = false;
  let pending: number | null = null;
  let scrubbed: number | null = null;
  let frame = 0;
  const stepUnder = (clientX: number): number => {
    const rect = lane.getBoundingClientRect();
    return stepAtPosition(current!.dates, current!.axis, rect.width > 0 ? (clientX - rect.left) / rect.width : 0);
  };
  const flush = (): void => {
    frame = 0;
    if (pending !== null && pending !== scrubbed) {
      scrubbed = pending;
      options.onScrub(pending);
    }
  };
  track.addEventListener("pointerdown", event => {
    if (!current || event.button !== 0) return;
    event.preventDefault();
    dragging = true;
    track.setPointerCapture(event.pointerId);
    track.focus({ preventScroll: true });
    pending = stepUnder(event.clientX);
    if (!frame) frame = requestAnimationFrame(flush);
  });
  track.addEventListener("pointermove", event => {
    if (!dragging) return;
    pending = stepUnder(event.clientX);
    if (!frame) frame = requestAnimationFrame(flush);
  });
  const release = (event: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    cancelAnimationFrame(frame);
    frame = 0;
    const step = pending ?? current?.step ?? 0;
    pending = null;
    scrubbed = null;
    options.onRest(step);
  };
  track.addEventListener("pointerup", release);
  track.addEventListener("pointercancel", release);

  /** Redraw the ticks and the ruler when the model changed; hide the ruler labels that would land on their neighbours. */
  function drawModel(state: ScrubberState): void {
    const key = JSON.stringify([state.model.ticks, state.model.ruler]);
    if (key === drawn) return;
    drawn = key;
    ticks.replaceChildren(...state.model.ticks.map(tick => {
      const mark = document.createElement("span");
      mark.className = `history-tick is-${tick.weight}`;
      mark.dataset.step = String(tick.step);
      mark.style.left = `${tick.position * 100}%`;
      mark.title = tick.steps === 1 ? `Step ${tick.step}` : `Steps to ${tick.step}, ${tick.steps} of them`;
      return mark;
    }));
    ruler.replaceChildren(...state.model.ruler.map(label => {
      const mark = document.createElement("span");
      mark.className = "history-ruler-label";
      mark.dataset.step = String(label.step);
      mark.dataset.position = String(label.position);
      mark.textContent = label.text;
      return mark;
    }));
    placeRuler();
  }

  /**
   * Place the ruler's labels at the ruler's width: each at its position, the last drawn ending at the track's right
   * edge if it would pass it, and any that would land on its neighbour hidden. Run again whenever the width changes,
   * as when the reader opens beside the scrubber and the scrubber steps aside for it (2026-10-20).
   */
  function placeRuler(): void {
    const edge = ruler.getBoundingClientRect();
    let right = -Infinity;
    for (const label of ruler.querySelectorAll<HTMLElement>(".history-ruler-label")) {
      label.hidden = false;
      label.style.left = `${Number(label.dataset.position) * 100}%`;
      const box = label.getBoundingClientRect();
      // A label past the track's right edge is drawn ending at it.
      if (edge.width > 0 && box.right > edge.right) {
        label.style.left = `${Math.max(0, edge.width - box.width)}px`;
      }
      const placed = label.getBoundingClientRect();
      if (placed.left < right + 6) label.hidden = true;
      else right = placed.right;
    }
  }
  let rulerWidth = 0;
  new ResizeObserver(() => {
    const width = ruler.getBoundingClientRect().width;
    if (width === rulerWidth) return;
    rulerWidth = width;
    placeRuler();
  }).observe(ruler);

  return {
    element,
    sync(state) {
      current = state;
      drawModel(state);
      track.setAttribute("aria-valuemax", String(state.steps));
      track.setAttribute("aria-valuenow", String(state.step));
      track.setAttribute("aria-valuetext", state.valueText);
      thumb.style.left = `${(state.model.ticks.find(tick => tick.step === state.step)?.position ?? (state.steps > 0 ? state.step / state.steps : 0)) * 100}%`;
      truncated.hidden = state.truncated === null;
      truncated.title = state.truncated ?? "";
      track.classList.toggle("is-truncated", state.truncated !== null);
      ruler.classList.toggle("is-truncated", state.truncated !== null);
      date.textContent = state.date;
      hash.textContent = state.hash;
      notice.hidden = state.notice === null;
      notice.textContent = state.notice ?? "";
      play.setAttribute("aria-pressed", String(state.playing));
      play.setAttribute("aria-label", state.playing ? "Pause" : "Play");
      play.title = state.playing ? "Pause" : "Play, one step after another";
      play.querySelector("svg")!.innerHTML = state.playing ? PAUSE_ICON : PLAY_ICON;
      authors.hidden = !state.authors.carried;
      authors.setAttribute("aria-pressed", String(state.authors.shown));
      authors.setAttribute("aria-label", state.authors.shown ? "Hide authors" : "Show authors");
      authors.title = state.authors.shown ? "Hide the commits' authors" : "Show the commits' authors";
    },
    hide(hidden) {
      element.hidden = hidden;
      if (!hidden && current) {
        // Drawn while hidden, the ruler could not be measured; draw it again now that it has a width.
        drawn = "";
        drawModel(current);
      }
    },
    focus() {
      track.focus();
    }
  };
}
