/**
 * The history's scrubber, along the bottom of the 3D Local Map (the plan's
 * C4; the owner, 2026-10-17: "the ability to scrub and have it feel good and
 * useful sounds way more useful" than play). A track with one tick per step
 * from the tick model, the major and minor ticks drawn apart and the quiet
 * ones faint; a thumb; the ruler of dates beneath; the date and the commit's
 * hash read out beside it, and the date and subject spoken as the slider's
 * value; play and pause as a second control, with the speed beside it, since
 * the owner found the step panel "gone too quick to read anything in it at
 * all" and the rate buried in Tuning (2026-10-31); the toggle of the step panel,
 * which holds while the history is open (2026-10-30); and the authors toggle,
 * which rides the address. The slider grammar is on the keys: the arrows move a
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

import type { CommitInfo } from "@live-documentation/engine/live-docs/history/format";

import { findCommits, type HistoryRange } from "./navigation";
import { nextStop, stepAtPosition, type TickModel } from "./tick-model";
import { iconButton } from "../panels/icon-button";
import type { HistoryAxis } from "../types";

/** How near the pointer, in pixels, a step must stand on the date axis to be the one a click or a drag means. */
const POINTER_REACH_PX = 3;

/** What the scrubber draws. */
export interface ScrubberState {
  /** The last step. */
  steps: number;
  step: number;
  range: HistoryRange;
  commits: readonly CommitInfo[];
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
  /** How many steps play passes in a second, for the speed control beside play (2026-10-31). */
  rate: number;
  authors: { carried: boolean; shown: boolean };
  /** Whether the step panel shows. */
  details: boolean;
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
  /** The speed control chose a rate, in steps a second. */
  onRate(rate: number): void;
  onAuthors(shown: boolean): void;
  /** Show or hide the step panel. */
  onDetails(shown: boolean): void;
  onRange(range: HistoryRange | null): void;
}

/** The scrubber as the control drives it. */
export interface Scrubber {
  element: HTMLElement;
  sync(state: ScrubberState): void;
  hide(hidden: boolean): void;
  focus(): void;
  /** Focus the step panel's toggle, as when the panel's own button hid the panel and took the focus with it. */
  focusDetails(): void;
}

/** A window with a column of lines down its left side: the step panel beside the picture. */
const DETAILS_ICON = '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M9.5 4.5v15M5.5 8.5h2M5.5 11.5h2M5.5 14.5h2"/>';
const PLAY_ICON = '<path d="M8 5.5v13l10-6.5Z"/>';
const PAUSE_ICON = '<path d="M8 5.5v13M16 5.5v13"/>';
const AUTHORS_ICON = '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>';

/** The speeds the control offers, in steps a second, with their words; a rate set elsewhere that is not among them is offered as its own option. */
export const PLAY_RATES: ReadonlyArray<readonly [number, string]> = [[0.5, "½ step/s"], [1, "1 step/s"], [2, "2 steps/s"], [4, "4 steps/s"], [8, "8 steps/s"]];

/** The words for a rate: the control's own, or the number for one set in Tuning. */
export const rateWords = (rate: number): string => PLAY_RATES.find(([value]) => value === rate)?.[1] ?? `${rate} steps/s`;

/** Make the scrubber under its parent, hidden until synced. */
export function createScrubber(options: ScrubberOptions): Scrubber {
  const element = document.createElement("section");
  element.className = "history-scrubber";
  element.setAttribute("aria-label", "History");
  element.hidden = true;

  const play = iconButton("Play", PLAY_ICON);
  play.className = "history-play";
  play.setAttribute("aria-pressed", "false");
  const previous = iconButton("Previous commit", '<path d="M15 5l-7 7 7 7"/>');
  const next = iconButton("Next commit", '<path d="m9 5 7 7-7 7"/>');
  const playback = document.createElement("div");
  playback.className = "history-playback";
  playback.append(previous, play, next);
  // The speed, in steps a second, beside play: the same setting as Tuning's Play Rate, reachable where play is.
  const rate = document.createElement("select");
  rate.className = "history-rate";
  rate.setAttribute("aria-label", "Playback speed");
  rate.title = "How many steps a second play passes";
  for (const [value, words] of PLAY_RATES) {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = words;
    rate.append(option);
  }

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

  const readout = document.createElement("button");
  readout.type = "button";
  readout.className = "history-readout";
  readout.setAttribute("aria-label", "Find a commit or select a range");
  readout.setAttribute("aria-expanded", "false");
  readout.title = "Find a commit or select a range";
  const date = document.createElement("span");
  date.className = "history-date";
  const hash = document.createElement("code");
  hash.className = "history-hash";
  readout.append(date, hash);
  const entire = iconButton("Show entire history", '<path d="M8 5H4v14h4m8-14h4v14h-4M8 12h8"/>');
  entire.hidden = true;

  const finder = document.createElement("div");
  finder.className = "history-finder";
  finder.hidden = true;
  finder.setAttribute("role", "dialog");
  finder.setAttribute("aria-label", "Find a commit or select a range");
  const query = document.createElement("input");
  query.type = "search";
  query.placeholder = "Commit, date or message";
  query.setAttribute("aria-label", "Find a commit");
  const rangeActions = document.createElement("div");
  rangeActions.className = "history-range-actions";
  const startRange = iconButton("Start range at this commit", '<path d="M9 5H5v14h4m3-7h8m-4-4 4 4-4 4"/>');
  const endRange = iconButton("End range at this commit", '<path d="M15 5h4v14h-4m-3-7H4m4-4-4 4 4 4"/>');
  const rangeLabel = document.createElement("span");
  rangeActions.append(rangeLabel, startRange, endRange);
  const results = document.createElement("div");
  results.className = "history-commit-results";
  finder.append(query, rangeActions, results);
  const notice = document.createElement("span");
  notice.className = "history-notice";
  notice.hidden = true;

  const details = iconButton("Step details", DETAILS_ICON);
  details.className = "history-details";
  details.setAttribute("aria-pressed", "true");

  const authors = iconButton("Show authors", AUTHORS_ICON);
  authors.className = "history-authors";
  authors.setAttribute("aria-pressed", "false");

  const body = document.createElement("div");
  body.className = "history-controls";
  body.append(playback, rate, slider, readout, entire, notice, details, authors);
  element.append(body, finder);
  options.parent.append(element);

  let current: ScrubberState | null = null;
  let drawn = "";
  let limit = 12;

  const closeFinder = (restoreFocus = false): void => {
    finder.hidden = true;
    readout.setAttribute("aria-expanded", "false");
    if (restoreFocus) readout.focus();
  };
  function drawResults(): void {
    if (!current) return;
    rangeLabel.textContent = `${current.range[1] - current.range[0] + 1} of ${current.commits.length} commits`;
    const matches = findCommits(current.commits, query.value);
    const entries = matches.slice(0, limit).map(step => {
      const commit = current!.commits[step];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "history-commit-result";
      button.dataset.step = String(step);
      const meta = document.createElement("span");
      meta.className = "history-commit-meta";
      meta.textContent = `${commit.date.slice(0, 10)} · ${commit.id.slice(0, 8)}`;
      const subject = document.createElement("span");
      subject.textContent = commit.subject;
      button.append(meta, subject);
      button.addEventListener("click", () => { options.onRest(step); closeFinder(true); });
      return button;
    });
    results.replaceChildren(...entries);
    if (!matches.length) results.textContent = "No matching commits";
    if (matches.length > limit) {
      const more = document.createElement("button");
      more.type = "button";
      more.textContent = `Show more (${matches.length - limit} remaining)`;
      more.addEventListener("click", () => { limit += 12; drawResults(); results.querySelectorAll<HTMLButtonElement>(".history-commit-result")[limit - 12]?.focus(); });
      results.append(more);
    }
  }
  readout.addEventListener("click", () => {
    if (!finder.hidden) { closeFinder(); return; }
    options.onPlay(false);
    finder.hidden = false;
    readout.setAttribute("aria-expanded", "true");
    limit = 12;
    drawResults();
    query.focus();
    query.select();
  });
  query.addEventListener("input", () => { limit = 12; drawResults(); });
  query.addEventListener("keydown", event => {
    const first = results.querySelector<HTMLButtonElement>(".history-commit-result");
    if (event.key === "Enter" && first) { event.preventDefault(); first.click(); }
    else if (event.key === "ArrowDown" && first) { event.preventDefault(); first.focus(); }
  });
  finder.addEventListener("keydown", event => { if (event.key === "Escape") { event.stopPropagation(); closeFinder(true); } });
  document.addEventListener("pointerdown", event => {
    if (!finder.hidden && !finder.contains(event.target as Node) && !readout.contains(event.target as Node)) closeFinder();
  });
  startRange.addEventListener("click", () => { if (current) options.onRange([current.step, current.range[1]]); closeFinder(true); });
  endRange.addEventListener("click", () => { if (current) options.onRange([current.range[0], current.step]); closeFinder(true); });
  entire.addEventListener("click", () => { options.onRange(null); track.focus(); });
  previous.addEventListener("click", () => { if (current) options.onRest(Math.max(current.range[0], current.step - 1)); });
  next.addEventListener("click", () => { if (current) options.onRest(Math.min(current.range[1], current.step + 1)); });

  play.addEventListener("click", () => { if (current) options.onPlay(!current.playing); });
  rate.addEventListener("change", () => { const chosen = Number(rate.value); if (Number.isFinite(chosen) && chosen > 0) options.onRate(chosen); });
  details.addEventListener("click", () => { if (current) options.onDetails(!current.details); });
  authors.addEventListener("click", () => { if (current) options.onAuthors(!current.authors.shown); });

  // The keys: a step, a stop, an end; each a rest.
  track.addEventListener("keydown", event => {
    if (!current) return;
    const { step, range: [first, last], model } = current;
    let next: number;
    switch (event.key) {
      case "ArrowLeft": case "ArrowDown": next = Math.max(first, step - 1); break;
      case "ArrowRight": case "ArrowUp": next = Math.min(last, step + 1); break;
      case "PageDown": next = nextStop(model, step, -1); break;
      case "PageUp": next = nextStop(model, step, 1); break;
      case "Home": next = first; break;
      case "End": next = last; break;
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
    // A step within three pixels of the pointer is the one meant: a tick is one or two pixels wide.
    const [first, last] = current!.range;
    return rect.width > 0 ? first + stepAtPosition(current!.dates.slice(first, last + 1), current!.axis, (clientX - rect.left) / rect.width, POINTER_REACH_PX / rect.width) : first;
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

  /** Show the rate: one of the control's own, or the Tuning's as an option of its own, so that the control never lies. */
  function syncRate(value: number): void {
    const wanted = String(value);
    if (![...rate.options].some(option => option.value === wanted)) {
      const option = document.createElement("option");
      option.value = wanted;
      option.textContent = rateWords(value);
      option.dataset.foreign = "true";
      rate.append(option);
    }
    for (const option of [...rate.options]) if (option.dataset.foreign && option.value !== wanted) option.remove();
    if (rate.value !== wanted) rate.value = wanted;
  }

  return {
    element,
    sync(state) {
      current = state;
      drawModel(state);
      track.setAttribute("aria-valuemin", String(state.range[0]));
      track.setAttribute("aria-valuemax", String(state.range[1]));
      track.setAttribute("aria-valuenow", String(state.step));
      track.setAttribute("aria-valuetext", state.valueText);
      thumb.style.left = `${(state.model.positions[state.step] ?? 0) * 100}%`;
      truncated.hidden = state.truncated === null;
      truncated.title = state.truncated ?? "";
      track.classList.toggle("is-truncated", state.truncated !== null);
      ruler.classList.toggle("is-truncated", state.truncated !== null);
      date.textContent = state.date;
      hash.textContent = state.hash;
      previous.disabled = state.step <= state.range[0];
      next.disabled = state.step >= state.range[1];
      play.disabled = state.range[0] === state.range[1];
      readout.disabled = state.commits.length === 0;
      entire.hidden = state.range[0] === 0 && state.range[1] === state.steps;
      entire.title = `Show all ${state.commits.length} commits`;
      if (!finder.hidden) drawResults();
      notice.hidden = state.notice === null;
      notice.textContent = state.notice ?? "";
      play.setAttribute("aria-pressed", String(state.playing));
      play.setAttribute("aria-label", state.playing ? "Pause" : "Play");
      play.title = state.playing ? "Pause" : "Play, one step after another";
      play.querySelector("svg")!.innerHTML = state.playing ? PAUSE_ICON : PLAY_ICON;
      syncRate(state.rate);
      details.setAttribute("aria-pressed", String(state.details));
      authors.hidden = !state.authors.carried;
      authors.setAttribute("aria-pressed", String(state.authors.shown));
      authors.setAttribute("aria-label", state.authors.shown ? "Hide authors" : "Show authors");
      authors.title = state.authors.shown ? "Hide the commits' authors" : "Show the commits' authors";
    },
    hide(hidden) {
      element.hidden = hidden;
      if (hidden) closeFinder();
      if (!hidden && current) {
        // Drawn while hidden, the ruler could not be measured; draw it again now that it has a width.
        drawn = "";
        drawModel(current);
      }
    },
    focus() {
      track.focus();
    },
    focusDetails() {
      details.focus();
    }
  };
}
