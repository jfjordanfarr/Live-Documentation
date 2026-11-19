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
 * which rides the address. Two pairs of buttons move the thumb, as a
 * microscope's two knobs (2026-11-19): the fine, Previous and Next commit, a
 * step at a time; the coarse, Previous and Next marked commit, between the
 * marks on the track (`stops`). The slider grammar is on the keys: the arrows
 * move a step, Page Up and Page Down as the coarse pair, Home and End to the
 * ends, plus and minus zoom about the step. The buttons and the keys that move
 * by a step or a mark may carry the thumb past an end of the range, which then
 * slides to hold it. Since 2026-11-19 the track zooms: a wheel over the track or
 * its ruler, or a trackpad's pinch, narrows or widens the range about the step
 * under the pointer; a sideways wheel, or Shift with the wheel, slides it; on
 * touch two fingers pinch and slide (`zoom.ts`). The step shown may then stand
 * outside the range, and a mark in the thumb's look at that end of the track
 * slides the range back to hold it. While the thumb drags, the steps it
 * crosses are coalesced into one call per animation frame, so that the thumb
 * never lags the hand; when it rests, one call says so.
 *
 * The left edge is marked truncated when the history begins where the
 * knowledge does rather than where the repository did (scenario 8).
 *
 * @module scrubber
 */

import type { CommitInfo } from "@live-documentation/engine/live-docs/history/format";

import { iconButton } from "../panels/icon-button";
import type { HistoryAxis } from "../types";
import { findCommits, type HistoryRange } from "./navigation";
import { nextStop, stepAtPosition, type TickModel } from "./tick-model";
import { panView, rangeOfView, slideToHold, wheelFactor, zoomView, type View } from "./zoom";

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
  /** A zoom or a pan chose the range the track shows, or the whole (null); play goes on. */
  onView(range: HistoryRange | null): void;
  /** A button or a key moved the thumb by a step or a mark, perhaps past an end of the range, which slides to hold it. */
  onMove(step: number): void;
}

/** How much a press of plus or minus on the slider narrows or widens the range. */
const KEY_ZOOM = 1.5;

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

  // Play shows Play or Pause, so its name changes with what it shows and it carries no pressed state: a screen reader
  // heard "Pause, pressed" (the design system's audit, 2026-11-18). Authors shows one drawing, so its name stays and
  // its pressed state speaks.
  const play = iconButton("Play", PLAY_ICON);
  play.className = "history-play";
  const previous = iconButton("Previous commit", '<path d="M15 5l-7 7 7 7"/>');
  const next = iconButton("Next commit", '<path d="m9 5 7 7-7 7"/>');
  // The coarse pair outside the fine one, in the convention for a skip: a chevron against a bar.
  const previousMark = iconButton("Previous marked commit", '<path d="M17 5l-7 7 7 7M7 5v14"/>');
  const nextMark = iconButton("Next marked commit", '<path d="m7 5 7 7-7 7M17 5v14"/>');
  const playback = document.createElement("div");
  playback.className = "history-playback";
  playback.append(previousMark, previous, play, next, nextMark);
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
  // The step shown, when a zoom has left it outside the range: a mark in the thumb's look at that end of the track, a
  // button that slides the range back to hold it.
  const elsewhere = document.createElement("button");
  elsewhere.type = "button";
  elsewhere.className = "history-elsewhere";
  elsewhere.hidden = true;
  lane.append(ticks, thumb, elsewhere);
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

  const authors = iconButton("Authors", AUTHORS_ICON);
  authors.title = "The commits' authors";
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
  previous.addEventListener("click", () => { if (current) options.onMove(Math.max(0, current.step - 1)); });
  next.addEventListener("click", () => { if (current) options.onMove(Math.min(current.steps, current.step + 1)); });
  previousMark.addEventListener("click", () => { if (current) options.onMove(nextStop(current.model, current.step, -1)); });
  nextMark.addEventListener("click", () => { if (current) options.onMove(nextStop(current.model, current.step, 1)); });
  elsewhere.addEventListener("pointerdown", event => event.stopPropagation());
  // Bringing the step back is a slide of the range alone: a playing history plays on.
  elsewhere.addEventListener("click", () => { if (current) options.onView(slideToHold(current.range, current.step)); });

  play.addEventListener("click", () => { if (current) options.onPlay(!current.playing); });
  rate.addEventListener("change", () => { const chosen = Number(rate.value); if (Number.isFinite(chosen) && chosen > 0) options.onRate(chosen); });
  details.addEventListener("click", () => { if (current) options.onDetails(!current.details); });
  authors.addEventListener("click", () => { if (current) options.onAuthors(!current.authors.shown); });

  // The view a zoom or a pan works from: the fractional view the last gesture left, while the range is still what it
  // rounded to, so that a trackpad's small turns add up; otherwise the range shown.
  let view: View | null = null;
  const viewNow = (): View => {
    const { range, steps } = current!;
    const shown = range[0] === 0 && range[1] === steps ? null : range;
    const rounded = view && rangeOfView(view, steps);
    const same = rounded === null ? shown === null : !!shown && rounded[0] === shown[0] && rounded[1] === shown[1];
    return view && same ? view : [range[0], range[1]];
  };
  const showView = (next: View): void => {
    view = next;
    options.onView(rangeOfView(next, current!.steps));
  };
  const zoomAbout = (focus: number, factor: number): void => showView(zoomView(viewNow(), focus, factor, current!.steps));
  const panBy = (pixels: number): void => {
    const width = lane.getBoundingClientRect().width;
    const [first, last] = viewNow();
    if (width > 0 && pixels) showView(panView([first, last], (pixels / width) * (last - first), current!.steps));
  };
  // The wheel over the track or its ruler: a vertical turn zooms about the step under the pointer, a trackpad's pinch
  // (a wheel with Ctrl held) the same more strongly, a sideways turn or Shift with the wheel slides. The listener is not
  // passive, and the page's own scroll or zoom is prevented only here.
  slider.addEventListener("wheel", event => {
    if (!current || current.steps <= 0) return;
    event.preventDefault();
    const sideways = event.shiftKey ? event.deltaY || event.deltaX : Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0;
    const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? lane.getBoundingClientRect().width : 1;
    if (sideways) panBy(sideways * scale);
    else if (event.deltaY) zoomAbout(stepUnder(event.clientX), wheelFactor(event.deltaY, event.deltaMode, event.ctrlKey));
  }, { passive: false });

  // The keys: a step, a mark, an end, a zoom. A step or a mark may pass an end of the range, which slides to hold it;
  // Home and End go to the range's ends; plus and minus zoom about the step shown.
  track.addEventListener("keydown", event => {
    if (!current) return;
    const { step, steps, range: [first, last], model } = current;
    let next: number;
    switch (event.key) {
      case "ArrowLeft": case "ArrowDown": next = Math.max(0, step - 1); break;
      case "ArrowRight": case "ArrowUp": next = Math.min(steps, step + 1); break;
      case "PageDown": next = nextStop(model, step, -1); break;
      case "PageUp": next = nextStop(model, step, 1); break;
      case "Home": next = first; break;
      case "End": next = last; break;
      case "+": case "=": event.preventDefault(); zoomAbout(step, 1 / KEY_ZOOM); return;
      case "-": case "_": event.preventDefault(); zoomAbout(step, KEY_ZOOM); return;
      default: return;
    }
    event.preventDefault();
    if (next === step) return;
    if (event.key === "Home" || event.key === "End") options.onRest(next);
    else options.onMove(next);
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
  // Two fingers on the track pinch about their middle and slide with it; the first finger's drag rests where it was.
  const touches = new Map<number, number>();
  let pinch: { distance: number; middle: number } | null = null;
  const twoFingers = (): { distance: number; middle: number } => {
    const [a, b] = [...touches.values()];
    return { distance: Math.abs(a - b), middle: (a + b) / 2 };
  };
  track.addEventListener("pointerdown", event => {
    if (!current || event.button !== 0) return;
    if (event.pointerType === "touch") {
      touches.set(event.pointerId, event.clientX);
      if (touches.size > 2) return;
      if (touches.size === 2) {
        event.preventDefault();
        track.setPointerCapture(event.pointerId);
        if (dragging) {
          dragging = false;
          cancelAnimationFrame(frame);
          frame = 0;
          const step = pending ?? current.step;
          pending = null;
          scrubbed = null;
          options.onRest(step);
        }
        pinch = twoFingers();
        return;
      }
    }
    event.preventDefault();
    dragging = true;
    track.setPointerCapture(event.pointerId);
    track.focus({ preventScroll: true });
    pending = stepUnder(event.clientX);
    if (!frame) frame = requestAnimationFrame(flush);
  });
  track.addEventListener("pointermove", event => {
    if (touches.has(event.pointerId)) touches.set(event.pointerId, event.clientX);
    if (pinch && touches.size === 2 && current) {
      const now = twoFingers();
      if (now.distance > 0 && pinch.distance > 0) zoomAbout(stepUnder(now.middle), pinch.distance / now.distance);
      panBy(pinch.middle - now.middle);
      pinch = now;
      return;
    }
    if (!dragging) return;
    pending = stepUnder(event.clientX);
    if (!frame) frame = requestAnimationFrame(flush);
  });
  const release = (event: PointerEvent): void => {
    touches.delete(event.pointerId);
    if (pinch) {
      if (touches.size < 2) pinch = null;
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
      return;
    }
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
      // The step outside the range a zoom left: no thumb on the track, and its mark at the nearer end.
      const outside = state.step < state.range[0] ? "before" : state.step > state.range[1] ? "after" : null;
      thumb.hidden = outside !== null;
      if (!outside) thumb.style.left = `${(state.model.positions[state.step] ?? 0) * 100}%`;
      elsewhere.hidden = outside === null;
      elsewhere.classList.toggle("is-after", outside === "after");
      const elsewhereWords = `Show the current commit, ${state.date}`;
      elsewhere.setAttribute("aria-label", elsewhereWords);
      elsewhere.title = elsewhereWords;
      truncated.hidden = state.truncated === null;
      truncated.title = state.truncated ?? "";
      track.classList.toggle("is-truncated", state.truncated !== null);
      ruler.classList.toggle("is-truncated", state.truncated !== null);
      date.textContent = state.date;
      hash.textContent = state.hash;
      // The step buttons pass the range's ends, sliding it to hold the step, and stop only at the history's.
      previous.disabled = previousMark.disabled = state.step <= 0;
      next.disabled = nextMark.disabled = state.step >= state.steps;
      play.disabled = state.range[0] === state.range[1];
      readout.disabled = state.commits.length === 0;
      entire.hidden = state.range[0] === 0 && state.range[1] === state.steps;
      entire.title = `Show all ${state.commits.length} commits`;
      if (!finder.hidden) drawResults();
      notice.hidden = state.notice === null;
      notice.textContent = state.notice ?? "";
      play.classList.toggle("is-playing", state.playing);
      play.setAttribute("aria-label", state.playing ? "Pause" : "Play");
      play.title = state.playing ? "Pause" : state.model.plays === "stops" ? "Play, one marked commit after another" : "Play, one step after another";
      play.querySelector("svg")!.innerHTML = state.playing ? PAUSE_ICON : PLAY_ICON;
      syncRate(state.rate);
      details.setAttribute("aria-pressed", String(state.details));
      authors.hidden = !state.authors.carried;
      authors.setAttribute("aria-pressed", String(state.authors.shown));
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
