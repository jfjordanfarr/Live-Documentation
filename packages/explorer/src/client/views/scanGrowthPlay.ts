/**
 * Plays the scan trial over the 3D Local Map (2026-11-22, Tuning's Scan Growth, off by default): a clock, the sign that
 * says where the scan stands, and the feeding of the view with today's graph cut to the files that have arrived
 * (`scanGrowth.ts` is the rhythm and the cut; this module is its only caller that touches the page).
 *
 * The owner asked to see the map being built from scans before deciding whether to build it ("I've never seen what it
 * would look like to be in the 3D local map _as it is being built from scans_"). So the play is a look and no scan: it
 * waits as a scan waits, with no file, through the listing and the first pass, then hands the view one more cut of the
 * finished graph whenever the clock has brought new files and the view is not still packing the last, so that a slow
 * frame takes several files at once and none is skipped. Each cut goes through the view's one update path; when the
 * clock runs out the view is handed today's whole graph, the picture the lever's off value shows.
 *
 * The sign is the only thing drawn: the owner's two lines of progress, among the few words of ours they allow on screen.
 * A screen reader is told each phase once, through the page's status region, and not every count.
 *
 * @module scanGrowthPlay
 */

import type { ExplorerGraphPayload } from "../../shared/types";
import { announce } from "../announce";
import type { ScanGrowth, ScanPace } from "../types";
import { arrivedAt, arrivedGraph, firstCommitOrder, pathOrder, progressWords, scanProgress, scanSchedule, type ScanSchedule } from "./scanGrowth";

/**
 * The most of the page's time that taking the scan's arrivals in may use, a quarter: the buffering the owner foresaw
 * ("unless we buffer what we add to the rendered space piecemeal ourselves"). The first look, 2026-11-22, handed the
 * view a cut at every frame, and by eight hundred files of this repository each cut took longer than a frame, so that
 * a pointer's move waited seconds to be answered.
 */
export const FEED_SHARE = 0.25;

/** What the play is made with. */
export interface ScanGrowthPlayOptions {
  /** Where the sign stands: the 3D view's own element. */
  host: HTMLElement;
  /** Today's finished graph. */
  graph: ExplorerGraphPayload;
  /** The trial's order and pace, as Tuning has them now. */
  choice(): { growth: ScanGrowth; pace: ScanPace };
  /** The step of the history at which each of today's files was born; null where the bundle carries no history. */
  births(): Promise<ReadonlyMap<string, number>> | null;
  /** Hand the view the graph as the scan has it so far, or today's whole graph again (null). */
  feed(graph: ExplorerGraphPayload | null): void;
  /** Whether the view still waits for the last picture handed to it. */
  waiting(): boolean;
}

/** The play as the client drives it. */
export interface ScanGrowthPlay {
  /** Begin a scan from its start, by the trial's choice now; nothing when the choice is off or its order is not available. */
  play(): void;
  /** End a scan under way at once: the view is handed today's whole graph and the sign goes. */
  stop(): void;
  playing(): boolean;
}

/** Make the play over a 3D view; nothing is drawn or fed until `play`. */
export function createScanGrowthPlay(options: ScanGrowthPlayOptions): ScanGrowthPlay {
  const sign = document.createElement("div");
  sign.className = "scan-progress";
  sign.hidden = true;
  // The counts change many times a second: a screen reader is told the phases instead (`announce`).
  sign.setAttribute("aria-hidden", "true");
  options.host.append(sign);

  let run: { schedule: ScanSchedule; started: number; order: readonly string[] | null; fed: number; phase: string; rests: number } | null = null;
  let frame = 0;

  const end = (): void => {
    cancelAnimationFrame(frame);
    frame = 0;
    run = null;
    sign.hidden = true;
    sign.textContent = "";
    delete options.host.dataset.scan;
  };

  const tick = (): void => {
    frame = 0;
    const current = run;
    if (!current) return;
    const progress = scanProgress(current.schedule, performance.now() - current.started);
    if (progress.phase !== "done") {
      const words = progressWords(progress);
      if (sign.textContent !== words) sign.textContent = words;
      if (progress.phase !== current.phase) {
        current.phase = progress.phase;
        options.host.dataset.scan = progress.phase;
        announce(words.replace(/\s*\(.*$/, ""));
      }
    }
    // The next cut is handed over only once the last stands, so that a picture still packing its bodies is not asked
    // for another before it has drawn: the files the clock brought meanwhile arrive together.
    const now = performance.now();
    if (current.order && !options.waiting() && now >= current.rests) {
      const count = arrivedAt(current.schedule, progress);
      if (progress.phase === "done") {
        end();
        options.feed(null);
        return;
      }
      if (count !== current.fed) {
        current.fed = count;
        options.feed(arrivedGraph(options.graph, current.order, count));
        // Taking a cut in costs the page more the larger the picture is. The next waits until this one's cost is no
        // more than `FEED_SHARE` of the time since, so that the frames between stay a person's to orbit and point in.
        current.rests = performance.now() + (performance.now() - now) * (1 / FEED_SHARE - 1);
      }
    }
    frame = requestAnimationFrame(tick);
  };

  return {
    play(): void {
      const wasPlaying = !!run;
      end();
      const { growth, pace } = options.choice();
      const ids = options.graph.nodes.map(node => node.id);
      const births = growth === "first-commit" ? options.births() : null;
      if (growth === "off" || !ids.length || (growth === "first-commit" && !births)) {
        if (wasPlaying) options.feed(null);
        return;
      }
      const started: NonNullable<typeof run> = { schedule: scanSchedule(ids.length, pace), started: performance.now(), order: births ? null : pathOrder(ids), fed: 0, phase: "", rests: 0 };
      run = started;
      // The order by first commit is known once the history is read; until then the scan waits, as it waits for its listing.
      void births?.then(steps => { if (run === started) started.order = firstCommitOrder(ids, steps); },
        () => { if (run === started) started.order = pathOrder(ids); });
      sign.hidden = false;
      options.feed(arrivedGraph(options.graph, [], 0));
      tick();
    },
    stop(): void {
      if (!run) return;
      end();
      options.feed(null);
    },
    playing: () => !!run
  };
}
