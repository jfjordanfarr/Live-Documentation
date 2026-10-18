/**
 * The history control of the 3D Local Map: the scrubber along the bottom and
 * the step panel beside the picture, over the sequence the bundle carries
 * (the change-over-time plan's C4, 2026-10-18). The sequence is fetched only
 * when the control is first opened or an address names a commit, so that a
 * page without history is no slower. The control owns the cursor over the
 * sequence; a move of the thumb materializes the step and hands the view the
 * moment with the renames from the one shown before, at energy zero while the
 * thumb drags and at the tuning's energy when it rests (a settle of the
 * standing picture when the drag ended where it placed it). The last step is
 * today: there the view draws today's docs and the address carries no commit.
 *
 * The ticks come from the engine's `ticksFor` for today's pins, followed
 * through the renames; the tray is told, for each pin, when its thing does not
 * stand at the moment shown. Leaving 3D returns the picture to today and
 * closes the control.
 *
 * @module history-control
 */

import { HISTORY_FORMAT, type HistorySequence } from "@live-documentation/engine/live-docs/history/format";
import { stepsMatching } from "@live-documentation/engine/live-docs/history/queries";
import { commitAt } from "@live-documentation/engine/live-docs/history/sequence";
import { followPath, followPins, ticksFor, type Pins, type Ticks } from "@live-documentation/engine/live-docs/history/ticks";

import { HistoryCursor } from "./cursor";
import type { HistoryMoment } from "./moment";
import type { Renames } from "./rekey";
import { createScrubber } from "./scrubber";
import { snapshotGraphOf } from "./snapshot";
import { createStepPanel } from "./step-panel";
import { stepSummary } from "./step-summary";
import { tickModel } from "./tick-model";
import type { BundledHistory } from "../../shared/staticExplorerData";
import type { ExplorerNodePayload } from "../../shared/types";
import type { HistoryTuning } from "../types";
import type { RetainedItem } from "../views/retained-state";

/** What the control is made with. */
export interface HistoryControlOptions {
  /** Where the scrubber and the panel stand: the 3D view's container. */
  parent: HTMLElement;
  /** The element whose `--history-room` says how much of the bottom the open scrubber takes from the controls over it. */
  room: HTMLElement;
  /** The history the bundle says it carries; undefined when none, and then the control is not offered. */
  bundled: BundledHistory | undefined;
  /** Fetches the sequence. */
  load(): Promise<HistorySequence>;
  /** A sequence fetched before the page started, when the address named a commit. */
  preloaded?: HistorySequence;
  nodesById: ReadonlyMap<string, ExplorerNodePayload>;
  /** Show the moment, or today (null), re-keyed through the renames, fed at the energy, or at the tuning's when none. */
  onMoment(moment: HistoryMoment | null, renames: Renames, energy?: number): void;
  /** Feed the standing picture at the tuning's energy. */
  onSettle(): void;
  /** The commit the address carries changed: the id, or null for today. */
  onCommit(commit: string | null): void;
  onAuthors(shown: boolean): void;
  /** Pin a file of today by its path. */
  onPinFile(path: string): void;
  /** The control opened or closed. */
  onOpenChange(): void;
}

/** What the client tells the control at every change of state. */
export interface HistoryContext {
  /** Whether the 3D Local Map is the view shown. */
  visible: boolean;
  /** Today's pins, for the ticks: the pinned files and the open directories. */
  pins: Pins;
  /** Today's subject, followed with the pins so that the view finds it at the moment. */
  subject: string | null;
  showAuthors: boolean;
  tuning: HistoryTuning;
}

/** The control as the client drives it. */
export interface HistoryControl {
  /** Whether the bundle carries a history at all. */
  readonly available: boolean;
  isOpen(): boolean;
  toggle(): void;
  /** Show the moment an address names, or today for null; opens the control for a commit, loading the sequence first. */
  showCommit(commit: string | null): Promise<void>;
  /** Leaving 3D: the picture returns to today and the control closes. */
  leave(): void;
  sync(context: HistoryContext): void;
  /** Why a retained thing does not stand at the moment shown, or null when it does or today is shown. */
  absence(item: RetainedItem): string | null;
}

/** The space the open scrubber takes from the bottom, beyond its own height. */
const ROOM_GAP = 10;

/** Whether a sequence has the format this client reads. */
export function isHistorySequence(value: unknown): value is HistorySequence {
  return !!value && typeof value === "object" && (value as { format?: unknown }).format === HISTORY_FORMAT;
}

/** Why the history begins where it does, when it is cut there; null when it begins where the repository did. */
export function truncatedWords(sequence: HistorySequence): string | null {
  if (sequence.source.shallow) return "The clone is shallow: what came before this commit is not known.";
  if (sequence.base.commit.id !== sequence.source.knowledgeBegins) return "The export carries the history from this commit on; what came before is not in it.";
  return null;
}

/** Make the control under the 3D view, its scrubber and panel hidden until opened. */
export function createHistoryControl(options: HistoryControlOptions): HistoryControl {
  const available = options.bundled !== undefined;
  let sequence: HistorySequence | null = options.preloaded ?? null;
  let loading: Promise<HistorySequence> | null = null;
  let cursor: HistoryCursor | null = sequence ? new HistoryCursor(sequence) : null;
  let open = false;
  /** The moment shown; null for today. */
  let moment: HistoryMoment | null = null;
  let placedWithoutTick = false;
  let dragging = false;
  let playing: number | null = null;
  let playingRate = 0;
  let notice: string | null = null;
  let ticksKey = "";
  let ticks: Ticks = { major: [], minor: [] };
  let context: HistoryContext = { visible: false, pins: { files: [], directories: [] }, subject: null, showAuthors: false, tuning: { axis: "steps", granularity: "auto", playRate: 2 } };

  const scrubber = createScrubber({
    parent: options.parent,
    onScrub: step => { dragging = true; scrub(step); },
    onRest: step => { dragging = false; rest(step); },
    onPlay: wanted => { if (wanted) play(); else pause(); },
    onAuthors: shown => options.onAuthors(shown)
  });
  const panel = createStepPanel({ parent: options.parent, onPinFile: path => options.onPinFile(path) });

  function ensureLoaded(): Promise<HistorySequence> {
    if (sequence) return Promise.resolve(sequence);
    loading ??= options.load().then(loaded => {
      if (!isHistorySequence(loaded)) throw new Error(`The history file is not written in ${HISTORY_FORMAT}.`);
      sequence = loaded;
      cursor = new HistoryCursor(loaded);
      notice = null;
      return loaded;
    }).catch((error: unknown) => {
      loading = null;
      notice = error instanceof Error ? error.message : String(error);
      refresh();
      throw error;
    });
    return loading;
  }

  /**
   * The moment at the cursor's step. A file of today is followed back by `followPath`, which stops at its birth, so
   * that a file not yet born is absent even where an earlier file stood at its path; the names are read once per
   * file asked and kept for the moment.
   */
  function momentAt(step: number): HistoryMoment {
    const history = sequence!;
    const at = cursor!;
    const last = at.last;
    const shape = at.shape;
    const files = new Map<string, string | undefined>();
    const directories = new Map<string, string>();
    const known = followPins(history, { files: [], directories: context.pins.directories }, last, step);
    context.pins.directories.forEach((directory, index) => directories.set(directory, known.directories[index]));
    return {
      step,
      commit: commitAt(history, step),
      graph: snapshotGraphOf(shape),
      fileAt(todayPath) {
        if (!files.has(todayPath)) {
          const followed = followPath(history, todayPath, last, step);
          files.set(todayPath, followed.path !== null && shape.files.has(followed.path) ? followed.path : undefined);
        }
        return files.get(todayPath);
      },
      directoryAt(todayDirectory) {
        if (!directories.has(todayDirectory)) directories.set(todayDirectory, followPins(history, { files: [], directories: [todayDirectory] }, last, step).directories[0]);
        return directories.get(todayDirectory)!;
      },
      fileToday(path) {
        const followed = followPath(history, path, step, last);
        return followed.path !== null && options.nodesById.has(followed.path) ? followed.path : null;
      },
      directoryToday(directory) {
        return followPins(history, { files: [], directories: [directory] }, step, last).directories[0];
      }
    };
  }

  /** Move the picture to the step: today's docs at the last step, the moment's snapshot before it. */
  function moveTo(step: number, settle: boolean): void {
    const at = cursor!;
    const renames = at.moveTo(step);
    moment = step === at.last ? null : momentAt(step);
    options.onMoment(moment, renames, settle ? undefined : 0);
    placedWithoutTick = !settle;
  }

  function scrub(step: number): void {
    if (!cursor || step === cursor.step) return;
    moveTo(step, false);
    refresh();
  }

  function rest(step: number): void {
    if (!cursor) return;
    if (step !== cursor.step) moveTo(step, true);
    else if (placedWithoutTick) {
      options.onSettle();
      placedWithoutTick = false;
    }
    options.onCommit(moment ? moment.commit.id : null);
    refresh();
  }

  function play(): void {
    if (!cursor || playing !== null) return;
    if (cursor.step >= cursor.last) rest(0);
    playingRate = context.tuning.playRate;
    playing = window.setInterval(() => {
      if (!cursor) return;
      if (cursor.step >= cursor.last) { pause(); return; }
      rest(cursor.step + 1);
    }, 1000 / playingRate);
    refresh();
  }

  function pause(): void {
    if (playing === null) return;
    window.clearInterval(playing);
    playing = null;
    refresh();
  }

  /** The room the open scrubber takes, set once it has a height. */
  function setRoom(visible: boolean): void {
    options.room.style.setProperty("--history-room", visible ? `${scrubber.element.offsetHeight + ROOM_GAP}px` : "0px");
  }

  function refresh(): void {
    const visible = open && context.visible && available;
    scrubber.hide(!visible);
    panel.hide(!visible || !sequence || !cursor);
    setRoom(visible);
    if (!visible) return;
    if (!sequence || !cursor) {
      scrubber.sync({
        steps: 0, step: 0, model: { granularity: "step", ticks: [], stops: [0], ruler: [] }, axis: context.tuning.axis, dates: [],
        valueText: "", date: "", hash: "", truncated: null, playing: false, authors: { carried: false, shown: false },
        notice: notice ?? "Loading the history"
      });
      return;
    }
    const history = sequence;
    const step = cursor.step;
    const pins = context.pins;
    const key = JSON.stringify([pins.files, pins.directories]);
    if (key !== ticksKey) {
      ticksKey = key;
      ticks = ticksFor(history, pins);
    }
    const dates = [history.base.commit.date, ...history.steps.map(entry => entry.commit.date)];
    const model = tickModel({ dates, ticks, pinned: pins.files.length + pins.directories.length > 0, granularity: context.tuning.granularity, axis: context.tuning.axis });
    const commit = commitAt(history, step);
    scrubber.sync({
      steps: cursor.last,
      step,
      model,
      axis: context.tuning.axis,
      dates,
      valueText: `${commit.date.slice(0, 10)}: ${commit.subject}`,
      date: commit.date.slice(0, 10),
      hash: commit.id.slice(0, 8),
      truncated: truncatedWords(history),
      playing: playing !== null,
      authors: { carried: history.source.authors, shown: context.showAuthors },
      notice
    });
    panel.sync({
      step,
      commit,
      base: step === 0,
      files: cursor.shape.files.size,
      edges: cursor.shape.edges.size,
      showAuthors: context.showAuthors && history.source.authors,
      truncated: truncatedWords(history),
      ...(dragging ? {} : { summary: stepSummary(history, step, cursor.shape, path => options.nodesById.has(path)) })
    });
  }

  function showLoaded(commit: string): void {
    const matches = stepsMatching(sequence!, commit);
    open = true;
    options.onOpenChange();
    if (matches.length !== 1) {
      notice = matches.length === 0 ? `${commit.slice(0, 8)} is not in this history` : `${commit.slice(0, 8)} names ${matches.length} commits of this history`;
      rest(cursor!.last);
      return;
    }
    notice = null;
    rest(matches[0]);
  }

  return {
    available,
    isOpen: () => open,
    toggle() {
      if (!available) return;
      open = !open;
      options.onOpenChange();
      if (open) {
        refresh();
        void ensureLoaded().then(refresh, () => undefined);
        return;
      }
      pause();
      // Closed, the picture is today's again, and the address carries no commit.
      if (cursor && cursor.step !== cursor.last) rest(cursor.last);
      else refresh();
    },
    showCommit(commit) {
      if (!available) return Promise.resolve();
      if (!commit) {
        if (cursor && cursor.step !== cursor.last) rest(cursor.last);
        else refresh();
        return Promise.resolve();
      }
      if (sequence) {
        showLoaded(commit);
        return Promise.resolve();
      }
      open = true;
      options.onOpenChange();
      refresh();
      return ensureLoaded().then(() => showLoaded(commit), () => undefined);
    },
    leave() {
      pause();
      const wasOpen = open;
      open = false;
      notice = null;
      if (cursor && cursor.step !== cursor.last) {
        moveTo(cursor.last, true);
        placedWithoutTick = false;
      }
      options.onCommit(null);
      if (wasOpen) options.onOpenChange();
      refresh();
    },
    sync(next) {
      const rateChanged = playing !== null && next.tuning.playRate !== playingRate;
      context = next;
      if (rateChanged) { pause(); play(); return; }
      refresh();
    },
    absence(item) {
      if (!moment || !cursor) return null;
      if (item.kind === "pin") return moment.fileAt(item.pin.nodeId) === undefined ? "not yet born" : null;
      const directory = moment.directoryAt(item.directory);
      for (const path of cursor.shape.files.keys()) {
        if (directory === "" || path.startsWith(`${directory}/`)) return null;
      }
      return "nothing under it at this commit";
    }
  };
}
