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
 * The step panel can be hidden, by its own button or the scrubber's toggle,
 * while the scrubber stays; the choice holds while the history is open, and an
 * opened history shows the panel again (2026-10-30). It is not in the address.
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
import { changeAt, commitAt, seek } from "@live-documentation/engine/live-docs/history/sequence";
import { followPath, followPins, ticksFor, type Pins, type Ticks } from "@live-documentation/engine/live-docs/history/ticks";

import { HistoryCursor } from "./cursor";
import { historicalDirectories, historicalNode, historicalOrigin, referenceAt, referenceFor } from "./file-identity";
import type { HistoryChanges, HistoryMoment } from "./moment";
import { rangedTickModel, type HistoryRange } from "./navigation";
import { NO_RENAMES, type Renames } from "./rekey";
import { createScrubber } from "./scrubber";
import { relatedDocLinksOf, snapshotGraphOf } from "./snapshot";
import { createStepPanel } from "./step-panel";
import { stepSummary } from "./step-summary";
import type { BundledHistory } from "../../shared/staticExplorerData";
import type { ExplorerNodePayload } from "../../shared/types";
import type { HistoryTuning } from "../types";
import { pairKey } from "../views/forceGraphEmphasis";
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
  /** Selection lookup: current files plus validated historical identities. The canonical current graph stays separate. */
  nodesById: Map<string, ExplorerNodePayload>;
  /** Show the moment, or today (null), re-keyed through the renames, fed at the energy, or at the tuning's when none. */
  onMoment(moment: HistoryMoment | null, renames: Renames, energy?: number, changes?: HistoryChanges | null): void;
  /** Feed the standing picture at the tuning's energy. */
  onSettle(): void;
  /** The commit the address carries changed: the id, or null for today. */
  onCommit(commit: string | null): void;
  onAuthors(shown: boolean): void;
  /** Pin a file of today by its path. */
  onPinFile(path: string): void;
  /** Whether today's bundle carries a document, which the step panel can then open. */
  hasDocument(path: string): boolean;
  /** Read a document the bundle carries, by its path. */
  onReadDocument(path: string): void;
  /** The control opened or closed. */
  onOpenChange(): void;
  /** The scrubber's own speed control chose a rate, in steps a second (2026-10-31). */
  onPlayRate(rate: number): void;
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
  /** Stop playback for deliberate investigation without closing the timeline or changing its moment. */
  pause(): void;
  /** Make room for an evidence reader while keeping the scrubber available. */
  hideDetails(): void;
  /** Bring a retained file to the nearest moment in which it exists, keeping its identity. */
  showFile(id: string): void;
  /** Show the moment an address names, or today for null; opens the control for a commit, loading the sequence first. */
  showCommit(commit: string | null): Promise<void>;
  /** Leaving 3D: the picture returns to today and the control closes. */
  leave(): void;
  sync(context: HistoryContext): void;
  /** Why a retained thing does not stand at the moment shown, or null when it does or today is shown. */
  absence(item: RetainedItem): string | null;
  /** Load the needed history before restoring references, including Back after reloading a place without history. */
  restoreReferences(ids: readonly string[], needsMoment?: boolean): Promise<void>;
  /** Whether a directory is known in this history, even if it has no files at the displayed moment. */
  hasDirectory(directory: string): boolean;
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
  let knownDirectories = sequence ? historicalDirectories(sequence) : new Set<string>();
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
  /** Whether the step panel shows; hidden by a person's choice, it is shown again when the history is next opened. */
  let detailsShown = true;
  let range: HistoryRange | null = null;
  let emphasizedStep: number | null = null;
  const todayIds = new Set([...options.nodesById.values()].filter(node => node.docPath).map(node => node.id));
  let ticksKey = "";
  let ticks: Ticks = { major: [], minor: [] };
  let context: HistoryContext = { visible: false, pins: { files: [], directories: [] }, subject: null, showAuthors: false, tuning: { axis: "time", granularity: "auto", playRate: 2, changeEmphasis: "glow" } };

  const scrubber = createScrubber({
    parent: options.parent,
    onScrub: step => { pause(); dragging = true; scrub(step); },
    onRest: step => { pause(); dragging = false; rest(step); },
    onPlay: wanted => { if (wanted) play(); else pause(); },
    onRate: rate => options.onPlayRate(rate),
    onAuthors: shown => options.onAuthors(shown),
    onDetails: shown => { detailsShown = shown; refresh(); },
    onRange: next => { pause(); range = next; refresh(); }
  });
  const panel = createStepPanel({
    parent: options.parent,
    onChooseFile: (path, step) => {
      pause();
      rest(step);
      options.onPinFile(registerFile(path, step));
    },
    hasDocument: path => options.hasDocument(path),
    onReadDocument: path => options.onReadDocument(path),
    onHide: () => {
      detailsShown = false;
      refresh();
      // The button that had the focus is gone with the panel: the focus goes to the toggle that brings it back.
      scrubber.focusDetails();
    },
    // Reading the whole step stops on it; closing the dialog does not play on (2026-11-11).
    onOpenStep: () => pause()
  });

  /** Register a past-only file for shared selection without adding it to today's graph or inventing old prose. */
  function registerFile(path: string, step: number): string {
    const id = referenceFor(sequence!, path, step, path => todayIds.has(path));
    if (!todayIds.has(id)) {
      const graph = moment?.step === step ? moment.graph : snapshotGraphOf(seek(sequence!, step));
      const node = graph.nodes.find(file => file.id === path);
      if (node) {
        const existing = options.nodesById.get(id);
        if (existing) Object.assign(existing, node, { id });
        else options.nodesById.set(id, { ...node, id });
      }
    }
    return id;
  }

  function ensureLoaded(): Promise<HistorySequence> {
    if (sequence) return Promise.resolve(sequence);
    loading ??= options.load().then(loaded => {
      if (!isHistorySequence(loaded)) throw new Error(`The history file is not written in ${HISTORY_FORMAT}.`);
      sequence = loaded;
      knownDirectories = historicalDirectories(loaded);
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
    const references = new Map<string, string>();
    const directories = new Map<string, string>();
    const known = followPins(history, { files: [], directories: context.pins.directories }, last, step);
    context.pins.directories.forEach((directory, index) => directories.set(directory, known.directories[index]));
    // What the step changed, for the picture's emphasis (2026-10-31): the files born, renamed, resized, re-kinded, their
    // entry or content changed, and the files whose references came, went or changed, at both ends; and the pairs whose
    // wire came or changed. The base changed nothing.
    const change = changeAt(history, step);
    const changed = new Set<string>();
    const changedFiles = new Set<string>();
    const changedPairs = new Set<string>();
    if (step > 0) {
      for (const [path] of change.born) changed.add(path);
      for (const [, to] of change.renamed) changed.add(to);
      for (const [path] of change.resized) changed.add(path);
      for (const [path] of change.rekinded) changed.add(path);
      for (const [path] of change.entries) changed.add(path);
      for (const path of change.touched) changed.add(path);
      for (const path of changed) changedFiles.add(path);
      for (const [from] of [...change.edgesAdded, ...change.edgesChanged, ...change.edgesRemoved]) changedFiles.add(from);
      for (const [from, to] of [...change.edgesAdded, ...change.edgesChanged]) { changed.add(from); changed.add(to); changedPairs.add(pairKey(from, to)); }
      for (const [from, to] of change.edgesRemoved) { changed.add(from); changed.add(to); }
      for (const [from] of [...change.docLinksAdded, ...change.docLinksRemoved]) { changed.add(from); changedFiles.add(from); }
    }
    return {
      step,
      commit: commitAt(history, step),
      graph: snapshotGraphOf(shape),
      relatedDocLinks: relatedDocLinksOf(shape),
      changed,
      changedFiles,
      deletedFiles: new Set(change.dead),
      changedPairs,
      fileAt(todayPath) {
        if (!files.has(todayPath)) {
          const followed = referenceAt(history, todayPath, step);
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
        return followed.path !== null && todayIds.has(followed.path) ? followed.path : null;
      },
      fileReference(path) {
        if (!references.has(path)) references.set(path, registerFile(path, step));
        return references.get(path)!;
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
    publishMoment(renames, settle ? undefined : 0);
    placedWithoutTick = !settle;
  }

  /** The current graph and the displayed commit's changes have different lifetimes at the last step. */
  function publishMoment(renames: Renames, energy?: number): void {
    emphasizedStep = open && context.visible && cursor ? cursor.step : null;
    const changes = emphasizedStep === null ? null : moment ?? momentAt(emphasizedStep);
    options.onMoment(moment, renames, energy, changes);
  }

  function scrub(step: number): void {
    if (!cursor || step === cursor.step) return;
    moveTo(step, false);
    refresh();
  }

  function rest(step: number): void {
    if (!cursor) return;
    if (range && (step < range[0] || step > range[1])) range = null;
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
    if (cursor.step >= (range?.[1] ?? cursor.last)) rest(range?.[0] ?? 0);
    playingRate = context.tuning.playRate;
    playing = window.setInterval(() => {
      if (!cursor) return;
      if (cursor.step >= (range?.[1] ?? cursor.last)) { pause(); return; }
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
    const nextEmphasis = open && context.visible && cursor ? cursor.step : null;
    if (nextEmphasis !== emphasizedStep) publishMoment(NO_RENAMES);
    const visible = open && context.visible && available;
    scrubber.hide(!visible);
    panel.hide(!visible || !sequence || !cursor || !detailsShown);
    setRoom(visible);
    if (!visible) return;
    if (!sequence || !cursor) {
      scrubber.sync({
        steps: 0, step: 0, range: [0, 0], commits: [], model: { granularity: "step", positions: [], ticks: [], stops: [0], ruler: [] }, axis: context.tuning.axis, dates: [],
        valueText: "", date: "", hash: "", truncated: null, playing: false, rate: context.tuning.playRate, authors: { carried: false, shown: false }, details: detailsShown,
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
      if (!pins.files.length && !pins.directories.length) ticks = ticksFor(history, pins);
      else {
        // Each past-only pin has its own anchor; comparing its raw path against today's files confuses path reuse.
        const groups = new Map<number, { files: string[]; directories: string[] }>();
        const at = (step: number) => groups.get(step) ?? groups.set(step, { files: [], directories: [] }).get(step)!;
        if (pins.directories.length) at(cursor.last).directories.push(...pins.directories);
        for (const id of pins.files) {
          const origin = historicalOrigin(history, id);
          at(origin?.step ?? cursor.last).files.push(origin?.path ?? id);
        }
        const major = new Set<number>(), minor = new Set<number>();
        for (const [step, group] of groups) {
          const found = ticksFor(history, group, step);
          found.major.forEach(tick => major.add(tick));
          found.minor.forEach(tick => minor.add(tick));
        }
        ticks = { major: [...major].sort((a, b) => a - b), minor: [...minor].filter(tick => !major.has(tick)).sort((a, b) => a - b) };
      }
    }
    const dates = [history.base.commit.date, ...history.steps.map(entry => entry.commit.date)];
    const shownRange: HistoryRange = range ?? [0, cursor.last];
    const model = rangedTickModel({ dates, ticks, pinned: pins.files.length + pins.directories.length > 0, granularity: context.tuning.granularity, axis: context.tuning.axis }, shownRange);
    const commit = commitAt(history, step);
    scrubber.sync({
      steps: cursor.last,
      step,
      range: shownRange,
      commits: [history.base.commit, ...history.steps.map(entry => entry.commit)],
      model,
      axis: context.tuning.axis,
      dates,
      valueText: `${commit.date.slice(0, 10)}: ${commit.subject}`,
      date: commit.date.slice(0, 10),
      hash: commit.id.slice(0, 8),
      truncated: shownRange[0] === 0 ? truncatedWords(history) : null,
      playing: playing !== null,
      rate: context.tuning.playRate,
      authors: { carried: history.source.authors, shown: context.showAuthors },
      details: detailsShown,
      notice
    });
    // A hidden panel is drawn when it is shown again.
    if (!detailsShown) return;
    panel.sync({
      step,
      commit,
      base: step === 0,
      files: cursor.shape.files.size,
      edges: cursor.shape.edges.size,
      showAuthors: context.showAuthors && history.source.authors,
      truncated: truncatedWords(history),
      ...(dragging ? {} : { summary: stepSummary(history, step, cursor.shape, path => todayIds.has(path)) })
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
    hasDirectory: directory => knownDirectories.has(directory),
    isOpen: () => open,
    pause,
    hideDetails() { detailsShown = false; refresh(); },
    showFile(id) {
      if (!sequence || !cursor) return;
      pause();
      const followed = referenceAt(sequence, id, cursor.step);
      const step = followed.path !== null ? cursor.step : followed.step > cursor.step ? followed.step : Math.max(0, followed.step - 1);
      open = true;
      options.onOpenChange();
      rest(step);
    },
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
      detailsShown = true;
      range = null;
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
      detailsShown = true;
      range = null;
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
      if (!cursor || !sequence) return null;
      if (item.kind === "pin") {
        if (!moment && todayIds.has(item.pin.nodeId)) return null;
        const followed = referenceAt(sequence, item.pin.nodeId, cursor.step);
        if (followed.path !== null && cursor.shape.files.has(followed.path)) return null;
        return followed.step > cursor.step ? "not yet created" : `deleted at ${commitAt(sequence, followed.step).id.slice(0, 8)}`;
      }
      if (!moment) return [...todayIds].some(path => item.directory === "" || path.startsWith(`${item.directory}/`)) ? null : "nothing under it today";
      const directory = moment.directoryAt(item.directory);
      for (const path of cursor.shape.files.keys()) {
        if (directory === "" || path.startsWith(`${directory}/`)) return null;
      }
      return "nothing under it at this commit";
    },
    async restoreReferences(ids, needsMoment = false) {
      if (!sequence && available && (needsMoment || ids.some(id => id.startsWith("history:")))) await ensureLoaded();
      if (!sequence) return;
      for (const id of ids) if (!options.nodesById.has(id)) {
        const node = historicalNode(sequence, id);
        if (node) options.nodesById.set(id, node);
      }
    }
  };
}
