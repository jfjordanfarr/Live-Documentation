/**
 * What the inspect CLI answers from the history: a file at a commit, the walk
 * from the entries of a commit, and what changed between two commits, in text
 * and JSON, read from `<docsRoot>/history/history.json` (the plan's C9).
 *
 * @remarks
 * Every answer says in its first line, or in its `answeredFrom` field, that it
 * comes from the shape alone: files, their archetypes, symbol counts, entry
 * marks and wires. The symbols themselves, the kinds of the wires and the docs'
 * words were in the docs of that commit, which the history does not keep.
 *
 * @module
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import type { LiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { HISTORY_DIRECTORY, HISTORY_FILE, HISTORY_FORMAT, type CommitInfo, type HistorySequence } from "@live-documentation/engine/live-docs/history/format";
import { changesBetween, entryMarked, fileOfShape, graphOfShape, stepsMatching } from "@live-documentation/engine/live-docs/history/queries";
import { commitAt, seek } from "@live-documentation/engine/live-docs/history/sequence";
import { reachability } from "@live-documentation/engine/live-docs/pathfind";

const SHAPE_ALONE = "from the shape alone: files, their wires, entry marks and linked documents; the symbols and the docs' words of that day are not in the history";

/** A question the history cannot answer as asked, said plainly. */
export class HistoryRefusal extends Error {}

/** The sequence the history command wrote for this workspace; a refusal naming the command when there is none. */
export async function readHistory(workspaceRoot: string, config: LiveDocumentationConfig): Promise<HistorySequence> {
  const relative = path.posix.join(config.root, HISTORY_DIRECTORY, HISTORY_FILE);
  let text: string;
  try {
    text = await fs.readFile(path.join(workspaceRoot, relative), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
    throw new HistoryRefusal(`No history at ${relative}. Compute it with \`npm run live-docs:history\`, then ask again.`);
  }
  const parsed = JSON.parse(text) as { format?: unknown };
  if (parsed.format !== HISTORY_FORMAT) {
    throw new HistoryRefusal(`${relative} is written in ${String(parsed.format)}, and this inspect reads ${HISTORY_FORMAT}. Run \`npm run live-docs:history\` again.`);
  }
  return parsed as HistorySequence;
}

/** The step of the commit a reference names: a prefix of its id. */
export function resolveStep(sequence: HistorySequence, reference: string): number {
  const steps = stepsMatching(sequence, reference);
  if (steps.length === 1) {
    return steps[0];
  }
  if (steps.length > 1) {
    throw new HistoryRefusal(`${reference} names ${steps.length} commits of the history: ${steps.map((step) => commitAt(sequence, step).id.slice(0, 12)).join(", ")}. Give more of the id.`);
  }
  const first = sequence.base.commit;
  const last = commitAt(sequence, sequence.steps.length);
  throw new HistoryRefusal(
    `no step of the history is at ${reference}; it holds ${sequence.steps.length + 1} commits from ${first.id.slice(0, 8)} (${day(first)}) to ${last.id.slice(0, 8)} (${day(last)}), sampled ${samplingWords(sequence)}, and a commit between two samples is not in it.`
  );
}

/** What a file was at a commit: whether it existed, its shape, and its wires either way. */
export function emitFileAt(sequence: HistorySequence, step: number, codePath: string, json: boolean): void {
  const file = fileOfShape(seek(sequence, step), codePath);
  const commit = commitAt(sequence, step);
  if (json) {
    console.log(JSON.stringify({ kind: "at", answeredFrom: "shape", step, commit, file }, null, 2));
    return;
  }
  console.log(`At ${where(sequence, step, commit)}, ${SHAPE_ALONE}.`);
  if (!file.exists) {
    console.log(`${codePath} does not exist at ${commit.id.slice(0, 8)}.`);
    return;
  }
  console.log(`${codePath}: ${file.archetype}, ${count(file.symbols ?? 0, "symbol")}${file.entry ? ", an entry" : ""}`);
  for (const [heading, neighbours] of [["Outbound", file.outbound ?? []], ["Inbound", file.inbound ?? []]] as const) {
    console.log(`${heading}: ${count(neighbours.length, "file")}`);
    for (const neighbour of neighbours) {
      console.log(`  ${neighbour.codePath}  ${count(neighbour.count, "reference")}`);
    }
  }
  const documents = file.documents ?? [];
  console.log(`Linked documents: ${count(documents.length, "document")}`);
  for (const document of documents) {
    console.log(`  ${document}`);
  }
}

/** What the entries of a commit reach, by the pathfinder over the graph the commit's shape makes. */
export function emitReachableAt(sequence: HistorySequence, step: number, config: LiveDocumentationConfig, maxDepth: number, json: boolean): void {
  const shape = seek(sequence, step);
  const result = reachability(graphOfShape(shape, config), undefined, maxDepth, entryMarked(shape));
  const commit = commitAt(sequence, step);
  // From the shape a start's entry mark is known and its Entry lines are not.
  const starts = result.starts.map((start) => ({ codePath: start.codePath, entry: shape.files.get(start.codePath)?.entry === true, test: start.test }));
  if (json) {
    console.log(JSON.stringify({ kind: "at-reachable", answeredFrom: "shape", step, commit, maxDepth, from: result.from, starts, reached: result.reached, unreachable: result.unreachable, unread: result.unread, testsOnly: result.testsOnly }, null, 2));
    return;
  }
  console.log(`At ${where(sequence, step, commit)}, ${SHAPE_ALONE}.`);
  console.log(`Files a path reaches from the entry points (max depth ${maxDepth}), nearest first.`);
  console.log(`Entry points: ${count(starts.length, "file")}`);
  for (const start of starts) {
    console.log(`  ${start.codePath}  ${[start.entry ? "entry" : "", start.test ? "test" : ""].filter(Boolean).join("; ")}`);
  }
  console.log(`Reached: ${count(result.reached.length, "file")}`);
  for (const file of result.reached) {
    console.log(`  ${file.hops} ${file.hops === 1 ? "hop " : "hops"}  ${file.codePath}`);
  }
  console.log(`Unreachable from any entry: ${count(result.unreachable.length, "file")}`);
  for (const codePath of result.unreachable) {
    console.log(`  ${codePath}  ${shape.files.get(codePath)?.archetype ?? ""}`);
  }
  console.log(`Not read, so neither reached nor unreachable (no reader handles their kind yet): ${count(result.unread.length, "file")}`);
  for (const codePath of result.unread) {
    console.log(`  ${codePath}`);
  }
  console.log(`Reached only from tests: ${count(result.testsOnly.length, "file")}`);
  for (const codePath of result.testsOnly) {
    console.log(`  ${codePath}`);
  }
}

/** What changed from one commit to a later one, each file followed through every rename between. */
export function emitBetween(sequence: HistorySequence, from: number, to: number, json: boolean): void {
  if (to < from) {
    throw new HistoryRefusal(`${commitAt(sequence, to).id.slice(0, 8)} comes before ${commitAt(sequence, from).id.slice(0, 8)} in the history; give the earlier commit first.`);
  }
  const changes = changesBetween(sequence, from, to);
  if (json) {
    console.log(JSON.stringify({ kind: "between", answeredFrom: "shape", fromStep: from, toStep: to, ...changes }, null, 2));
    return;
  }
  console.log(`From ${where(sequence, from, changes.from)} to ${where(sequence, to, changes.to)}, ${SHAPE_ALONE}.`);
  const list = (heading: string, lines: string[], noun: string): void => {
    console.log(`${heading}: ${count(lines.length, noun)}`);
    for (const line of lines) {
      console.log(`  ${line}`);
    }
  };
  list("Created", changes.born, "file");
  list("Deleted", changes.dead, "file");
  list("Renamed", changes.renamed.map((rename) => `${rename.from} -> ${rename.to}`), "file");
  list("Renamed whole", changes.directoriesRenamed.map((rename) => `${rename.from} -> ${rename.to}`), "directory");
  list("Resized", changes.resized.map((file) => `${file.codePath}  ${file.before} -> ${file.after} symbols`), "file");
  list("Wires added", changes.edgesAdded.map((edge) => `${edge.from} -> ${edge.to}`), "wire");
  list("Wires removed", changes.edgesRemoved.map((edge) => `${edge.from} -> ${edge.to}`), "wire");
  list("Documents linked", changes.docLinksAdded.map((link) => `${link.from} -> ${link.doc}`), "link");
  list("Documents unlinked", changes.docLinksRemoved.map((link) => `${link.from} -> ${link.doc}`), "link");
}

function where(sequence: HistorySequence, step: number, commit: CommitInfo): string {
  return `${commit.id.slice(0, 8)} (${day(commit)}, step ${step} of ${sequence.steps.length})`;
}

function day(commit: CommitInfo): string {
  return commit.date.slice(0, 10);
}

function samplingWords(sequence: HistorySequence): string {
  const { rule, n, since } = sequence.source.sampling;
  const words = { "every-commit": "every commit", "every-nth": `one commit in ${n}`, daily: "the last commit of each day", weekly: "the last commit of each week", tags: "at its tags" }[rule];
  return since ? `${words} since ${since}` : words;
}

function count(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}
