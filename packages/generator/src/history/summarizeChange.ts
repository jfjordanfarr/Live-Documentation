/**
 * One change's summary, made by a worker the history command started: the generator run over
 * the change's working tree under the lens's configuration, and the shape of
 * the graph it derived written to the cache.
 *
 * @remarks
 * The history command starts a few processes, each of which summarizes one
 * change at a time, so that no process ever holds more than one graph (the
 * plan's scenario 4: one process holding every snapshot would outgrow a V8
 * heap); until 2026-11-20 it started one process per change ({@link work}
 * says what a process now keeps between changes). The docs are written into the working
 * tree's own docs root, inside the scratch checkout and never into the real
 * one, and the lens's configuration is applied verbatim, so that its docs root
 * is never documented as source.
 *
 * The mirror committed at that change is regenerated in place, as a person's
 * workspace is every day: today's generator writes every generated section
 * afresh and keeps that day's authored words, which is where the doc links of
 * the day are (the owner, 2026-10-18: "just run the latest version of the tool
 * over prior snapshots of the workspace"). Until 2026-10-20 the mirror was
 * deleted first and the authored words lost. A committed doc whose source this
 * run does not document is pruned even when it holds authored words, so that
 * the files and wires of the shape are exactly those of a fresh generation: an
 * orphan kept for its words, or a doc of a file today's lens excludes, never
 * enters the reading. A link counts only when its document stands in the
 * change's tree.
 *
 * Since 2026-11-19 the summary keeps each file's symbol rows and dependency
 * lines and names its prose by hash (see `summary.ts`). Before the generator
 * runs, every doc of the committed mirror is read once for whether its
 * authored block can be read at all: a doc in a form with no `## Authored`
 * heading, as this repository's mirror before 2026-09-27, gets the
 * generator's placeholder, and the summary says "unread" for it rather than
 * pass the placeholder off as that day's words. The texts go to the lens's
 * text store first and the summary, gzipped, is written to a temporary name
 * and renamed into place after, so that a run stopped halfway never leaves a
 * summary the cache would trust nor one that names a text the store lacks.
 * After each change, the process sends the history command its peak resident
 * memory, which sizes the pool.
 *
 * Run as a process, it is a worker (`--worker <git directory> <folder>`), sent its tasks over the channel to the command,
 * since 2026-11-20; before, it took one task from a file and ended.
 *
 * @module
 */

import { glob } from "glob";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getHeapStatistics } from "node:v8";
import { gzipSync } from "node:zlib";

import { isMediaAsset, type LiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { runtimeFaulted } from "@live-documentation/engine/live-docs/adapters/treeSitter";
import { matchesPathPattern } from "@live-documentation/engine/live-docs/archetype";
import { docsRootWithin } from "@live-documentation/engine/live-docs/discovery";
import { execFileAsync } from "@live-documentation/engine/live-docs/gitUtils";
import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";
import { openGitStore } from "@live-documentation/engine/live-docs/history/git";
import { summarizeGraph, type AuthoredReading } from "@live-documentation/engine/live-docs/history/summary";
import { putTexts } from "@live-documentation/engine/live-docs/history/textStore";
import type { WorkingTree, WorkingTreeOptions } from "@live-documentation/engine/live-docs/history/versionControl";
import { relatedDocsOf } from "@live-documentation/engine/live-docs/relatedDocs";

import { generateLiveDocs } from "../generator";

/** What one process is asked to do. */
export interface SummaryTask {
  /** The change's working tree: the workspace's root inside it. */
  tree: string;
  /** The configuration the summary is made under, `summarizedConfiguration` of the lens's, applied verbatim. */
  configuration: LiveDocumentationConfig;
  /** The lens's key, recorded in the summary. */
  lens: string;
  /** The change's id. */
  commit: string;
  /** Where the summary goes, gzipped. */
  summaryPath: string;
  /** The lens's text store, where the texts the summary names go. */
  textStore: string;
  /** Where the full graph index goes, gzipped, when the cache keeps it. */
  indexPath?: string;
  /** The change's files its working tree does not hold, and why, which the summary records. */
  unwritten?: Array<{ path: string; reason: string }>;
  /** Whether the repository matches names without regard to case, as the lens keyed it; the worker's trees answer with it. */
  ignoresCase?: boolean;
}

/**
 * Generates the change's docs in its working tree and writes its summary, and its index when asked, unless
 * `publishable` says no once the generator has run: then nothing of the change is written, neither a text nor the
 * summary nor the index.
 *
 * @param warn - Where each line the generator warns goes, for the history command to gather across the changes.
 * @param publishable - Asked once the generator has run, before anything is written: whether what it derived may be kept.
 * @returns Whether the summary was written.
 */
export async function summarizeChange(task: SummaryTask, warn: (line: string) => void, publishable: () => boolean): Promise<boolean> {
  // The configuration the summary is made under (`summarizedConfiguration`), as the command hands it: with no bundle
  // exclusion, so that every linked and citing document is kept and the exclusions are applied where summaries are read.
  const { tree, configuration } = task;
  const authored = await authoredReading(tree, configuration);
  const result = await generateLiveDocs({
    workspaceRoot: tree,
    config: configuration,
    keepAuthoredStaleDocs: false,
    logger: { info: () => undefined, warn, error: warn }
  });
  if (!publishable()) return false;
  // A change with no file the globs match has no docs and no index: its shape is empty.
  const indexText = result.index ? await fs.readFile(path.join(tree, result.index), "utf8") : undefined;
  const graph: LiveDocGraph = indexText
    ? (JSON.parse(indexText) as LiveDocGraph)
    : { root: configuration.root, baseLayer: configuration.baseLayer, extension: configuration.extension, files: {} };
  const standing = await standingFiles(tree, task.unwritten ?? []);
  const { summary, texts } = summarizeGraph(graph, task.lens, task.commit, standingRelatedDocs(graph, standing, configuration), authored);
  if (task.unwritten && task.unwritten.length > 0) {
    summary.unwritten = task.unwritten.map((entry): [string, string] => [entry.path, entry.reason]);
  }
  await putTexts(task.textStore, texts);
  await writeInPlace(task.summaryPath, gzipSync(JSON.stringify(summary)));
  if (task.indexPath) {
    await writeInPlace(task.indexPath, gzipSync(indexText ?? JSON.stringify(graph)));
  }
  return true;
}

/**
 * What the history asks of a change's tree written at `tree`: every name stands, and every file holds its content but
 * one kind. A file is written empty only when the configuration's `exclude` names it (by discovery's own rule,
 * `matchesPathPattern`), it lies outside the docs root (discovery's `docsRootWithin`), which the generator reads and
 * rewrites whatever `exclude` says, and it is an image, a font or a recording (`isMediaAsset`), whose bytes no reader
 * reads whatever names it: an import of a picture or a resolver's probe finds the name, as over a checkout. Any other
 * file is written whole, since a reader may open any text file another file names (the C reader opens whatever an
 * include names, `.def` and `.inc` among them, though no reader handles those kinds on their own). A symbolic link at
 * or above the docs root is not written even as a copy, and the docs root is where the generator writes, which a tree
 * brought forward puts right whole.
 *
 * Until a review of 2026-11-19 the excluded files were left out altogether, on the strength of one measurement over
 * this repository that the summarizing process opened none; for a few hours after, every excluded file no reader
 * handles was written empty, until the review's second pass found the C reader opening such files. Until 2026-11-20 it
 * lay in `regenerate.ts`, whose process wrote every tree.
 */
export function treeOptions(configuration: LiveDocumentationConfig, tree: string): WorkingTreeOptions {
  const docsRoot = docsRootWithin(tree, configuration);
  const inDocsRoot = (file: string): boolean => docsRoot !== undefined && (file === docsRoot || file.startsWith(`${docsRoot}/`));
  return {
    contentless: (file) => !inDocsRoot(file) && isMediaAsset(file) && configuration.exclude.some((pattern) => matchesPathPattern(file, pattern)),
    ...(docsRoot !== undefined ? { docsRoot } : {})
  };
}

/**
 * What can be read of the authored block of each doc of the mirror committed at the change, by its workspace-relative
 * path, read before the generator rewrites the mirror: a doc with an `## Authored` heading, which the generator carries
 * forward verbatim whether or not the rest of it meets today's grammar, is `read`; one without is `unread`.
 */
async function authoredReading(tree: string, configuration: LiveDocumentationConfig): Promise<AuthoredReading> {
  const pattern = path.posix.join(configuration.root, configuration.baseLayer, "**", `*${configuration.extension}`);
  // `dot`, since a hidden file's doc lives under a hidden path segment, as `readLiveDocGraph` reads them.
  const docs = await glob(pattern, { cwd: tree, nodir: true, dot: true, posix: true, windowsPathsNoEscape: true });
  const reading = new Map<string, "read" | "unread">();
  for (const doc of docs) {
    const text = await fs.readFile(path.join(tree, doc), "utf8");
    reading.set(doc, AUTHORED_HEADING.test(text) ? "read" : "unread");
  }
  return reading;
}

// The heading `authoredBlockOf` looks for, under which the generator carries a doc's authored words forward.
const AUTHORED_HEADING = /^## Authored[ \t]*$/mu;

/**
 * The files that stand in the change's tree, by their repository-relative paths, read from the tree's own listing
 * (its index, which the history command made from the change's tree and named in this process's environment): a
 * regular file stands, and so does a symbolic link the tree writer wrote as a copy of the file it leads to, which is
 * every link not named unwritten; a submodule does not, nor any entry the tree did not hold (`unwritten`).
 *
 * The listing, not the disk, so that whether a linked document stood depends on the commit alone. Every name of the
 * tree is written, so on a disk that tells case apart the two agree; on one that folds case or Unicode form, as macOS's
 * and Windows's do, the disk would find `Docs/Design.md` for a link to `docs/design.md`, and the listing does not.
 * That holds of this question only: the generator's own resolution of an import still asks the disk. Until 2026-11-19
 * the disk was asked here (`stat`, then `isFile`).
 */
export async function standingFiles(tree: string, unwritten: ReadonlyArray<{ path: string }>): Promise<Set<string>> {
  const { stdout } = await execFileAsync("git", ["ls-files", "--stage", "-z"], { cwd: tree, maxBuffer: 1 << 30 });
  const notWritten = new Set(unwritten.map((entry) => entry.path));
  const standing = new Set<string>();
  for (const entry of stdout.split("\0")) {
    // Each entry is `<mode> <id> <stage>\t<path>`.
    const tab = entry.indexOf("\t");
    if (tab < 0) continue;
    const mode = entry.slice(0, entry.indexOf(" "));
    const file = entry.slice(tab + 1);
    if ((mode === "100644" || mode === "100755" || mode === "120000") && !notWritten.has(file)) standing.add(file);
  }
  return standing;
}

/** Each file's related documents, every one the docs link to with no bundle exclusion, that stand as files in the change's tree. */
function standingRelatedDocs(graph: LiveDocGraph, standing: ReadonlySet<string>, configuration: LiveDocumentationConfig): Map<string, string[]> {
  const related = new Map<string, string[]>();
  for (const file of Object.values(graph.files)) {
    const present = relatedDocsOf(file, graph, configuration.bundleExclude).filter((document) => standing.has(document));
    if (present.length > 0) {
      related.set(file.codePath, present);
    }
  }
  return related;
}

async function writeInPlace(target: string, content: string | Uint8Array): Promise<void> {
  const temporary = `${target}.${process.pid}.partial`;
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(temporary, content);
  await fs.rename(temporary, target);
}

/** What the history command asks of a worker: one change summarized, its tree written or brought forward by the worker. */
export type WorkerTask = Omit<SummaryTask, "tree" | "unwritten">;

/** What a worker answers for each task. */
export interface WorkerReport {
  /** The worker's peak resident memory since it began, in bytes: what one lane of the pool holds. */
  peakMemory: number;
  /** The entries of the change's tree the worker did not write, and why; the summary says they were not read. */
  unwritten: Array<{ path: string; reason: string }>;
  /** What the generator warned, a line each. */
  warned: string[];
  /** Whether the tree was brought forward from the worker's last change, rather than written anew. */
  broughtForward: boolean;
  /** Why the tree was written anew, where it was (`WorkingTree.writtenAnew`): said on the change's line, and counted. */
  writtenAnew?: string;
  /**
   * Whether anything has thrown in this process while a tree-sitter tree was taken, read or released (`runtimeFaulted`),
   * after which no parser of the process is known sound: the command ends the worker (`regenerate.ts`).
   */
  runtimeFaulted: boolean;
  /**
   * Whether the change's summary and texts were written. A worker whose runtime faulted during a change after its first
   * writes nothing of it, and the command gives the change to a fresh worker; a worker's first change is what a fresh
   * process makes, and is written whatever it is.
   */
  published: boolean;
  /** The memory the worker holds once the change is done, resident, in bytes, by which the command bounds a worker. */
  heldMemory: number;
  /** The share of its JavaScript heap's limit the worker holds once the change is done, by which the command bounds a worker too. */
  heapShare: number;
}

/**
 * A worker: a process the history command starts once, which summarizes changes one at a time as it is sent them, in a
 * tree it keeps under `folder`, written for its first change and brought forward from each change to the next in the
 * same folder (`WorkingTree.bringTo`), so that a change costs what differs from the worker's last one, not a process
 * and a tree of its own. The repository is named by its git directory, `store`, which the command found in the
 * person's environment: the worker's own is bare, and git, asked to look for a repository there, could not see the
 * person's `safe.directory` (`openGitStore`).
 *
 * @remarks
 * Until 2026-11-20 every change had a process of its own, and the history command wrote every tree on its own main
 * thread, which was what a rebuild waited for; the record of that day (`Probes/history-rebuild-fast`) measures both.
 * What a process keeps from one summary to the next, each by name (that record, its section on the independent
 * review, and section 7 of `Probes/history-rebuild-speed` beside it):
 * - the tree's git variables, which the generator's git calls inherit without naming them (`gitIgnored`,
 *   `gitIgnoresCase`, {@link standingFiles}): set from the tree's environment just before the summary, and those same
 *   names removed just after, so that no tree is written with another's, and no change is summarized with another's
 *   index;
 * - the language adapters' caches of what they read of a file, by absolute path: each lives for one generation, cleared
 *   when a run with another file index begins, so the tree's one folder name for the worker's life meets no fact of
 *   another change (until the review, the folder was renamed for every change and the worker ended after a hundred);
 * - a grammar's load: kept when it succeeds, dropped when it fails, so that the next file asks again (until the review,
 *   a failed load was kept and the worker ended after any change in which a file failed);
 * - the parsers, sound unless something threw while a tree was taken, read or released (`readTree`), since the
 *   runtime's one WebAssembly module restores none of its state: a change in which that happened, after the worker's
 *   first, is not written, the worker saying so before anything of it reaches the cache (`published`), and the command
 *   ends the worker and gives the change to a fresh one, whose first change is what a fresh process makes and is
 *   written whatever it is (until the review's fourth round the change was written and the worker ended after it, and
 *   only a `RuntimeError` thrown inside a parse was seen);
 * - the temporary names of the summary and the texts, by the process's id: one task at a time, the next sent only
 *   when this one has answered;
 * - the peak memory, sent as the process's own since it began, which is what a lane of the pool holds;
 * - whatever else grows with each change, unfound (the review's fourth round): the memory the worker holds after each
 *   change is sent, and the command replaces a worker that holds more than its share (`regenerate.ts`).
 * The working folder is the command's and never a tree, so nothing of the worker's holds a tree's folder open between
 * tasks.
 */
function work(store: string, folder: string): void {
  const trees = openGitStore(store);
  let tree: WorkingTree | undefined;
  const summarize = async (task: WorkerTask): Promise<WorkerReport> => {
    const first = tree === undefined;
    // One name for the worker's life, six characters long, so that a fresh folder beside it is named as long (`git.ts`).
    const options = { ...treeOptions(task.configuration, tree?.root ?? path.join(folder, "tree00")), ...(task.ignoresCase !== undefined ? { ignoresCase: task.ignoresCase } : {}) };
    tree = tree === undefined ? await trees.workingTree(task.commit, path.join(folder, "tree00"), options) : await tree.bringTo(task.commit, options);
    const warned: string[] = [];
    let published: boolean;
    const { environment } = tree;
    Object.assign(process.env, environment);
    try {
      // Each line of a warning counts on its own, trimmed, as each line of a process's own output did until 2026-11-20.
      const warn = (message: string): void => {
        warned.push(...message.split("\n").map((line) => line.trim()).filter(Boolean));
      };
      // A fault carried from an earlier change could make a summary a fresh process would not; one in the first is a fresh process's own.
      published = await summarizeChange({ ...task, tree: tree.root, ...(tree.unwritten.length > 0 ? { unwritten: tree.unwritten } : {}) }, warn, () => first || !runtimeFaulted());
    } finally {
      for (const name of Object.keys(environment)) delete process.env[name];
    }
    // The peak as the operating system counts it, since the process began; `maxRSS` is in kibibytes.
    return { peakMemory: process.resourceUsage().maxRSS * 1024, unwritten: tree.unwritten, warned, broughtForward: tree.broughtForward, ...(tree.writtenAnew !== undefined ? { writtenAnew: tree.writtenAnew } : {}), runtimeFaulted: runtimeFaulted(), published, ...heldMemory() };
  };
  // One task at a time: the command sends the next only when this one has answered.
  process.on("message", (task: WorkerTask) => {
    summarize(task).then(
      (report) => process.send?.(report),
      (error: unknown) => {
        process.stderr.write(`${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`);
        process.exit(1);
      }
    );
  });
  // The command ends a worker by closing the channel between them.
  process.on("disconnect", () => process.exit(0));
}

/** What the worker holds now: its resident memory, and the share of its heap's limit its heap holds. */
function heldMemory(): Pick<WorkerReport, "heldMemory" | "heapShare"> {
  const { rss, heapUsed } = process.memoryUsage();
  return { heldMemory: rss, heapShare: heapUsed / getHeapStatistics().heap_size_limit };
}

if (require.main === module) {
  const [mode, store, folder] = process.argv.slice(2);
  if (mode !== "--worker" || store === undefined || folder === undefined) {
    process.stderr.write("usage: summarizeChange --worker <git directory> <folder>\n");
    process.exit(2);
  }
  work(store, folder);
}
