/**
 * What the inspect CLI answers from the history: a file at a commit, the walk
 * from the entries of a commit, and what changed between two commits, in text
 * and JSON, read from `<docsRoot>/history/history.json` (the plan's C9).
 *
 * @remarks
 * Every answer says in its first line, or in its `answeredFrom` field, what it
 * comes from: the walk and what changed between two commits from the shape
 * alone, files, their archetypes, symbol counts, entry marks and wires; a
 * file at a commit and the links between two files or two symbols, since
 * 2026-11-19, from the rows that day's docs listed, which the history carries
 * so that a command prints whatever the page can show of a moment.
 *
 * @module
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import type { LiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { HISTORY_DIRECTORY, HISTORY_FILE, HISTORY_FORMAT, type CommitInfo, type HistorySequence } from "@live-documentation/engine/live-docs/history/format";
import { changesBetween, entryMarked, fileOfShape, graphOfShape, linksBetween, rowsOfFile, stepsMatching, symbolNamed } from "@live-documentation/engine/live-docs/history/queries";
import type { RowLink } from "@live-documentation/engine/live-docs/history/rows";
import { commitAt, momentAt, seek, type Moment } from "@live-documentation/engine/live-docs/history/sequence";
import { sectionsOfDescription } from "@live-documentation/engine/live-docs/history/summary";
import { textInPart, wordsOfFile, wordsPartFile, type WordsPart } from "@live-documentation/engine/live-docs/history/words";
import { reachability } from "@live-documentation/engine/live-docs/pathfind";

const SHAPE_ALONE = "from the shape alone: files, their wires, entry marks and linked documents; the symbols and the docs' words of that day are not in the history";
const ROWS = "from the rows that day's docs listed: symbols, their type references, dependency lines and the links they make; the docs' words are not printed";

/** A question the history cannot answer as asked, said plainly. */
export class HistoryRefusal extends Error {}

/**
 * A file as a history question names it: its workspace-relative path, also when given as its doc's path, with
 * backslashes, or with the docs folder and the doc's suffix in any case.
 */
export function codePathOf(given: string, config: LiveDocumentationConfig): string {
  const normalized = given.replace(/\\/gu, "/").replace(/^(?:\.\/)+/u, "");
  const docsFolder = `${[config.root, config.baseLayer].map((segment) => segment.replace(/^(?:\.\/)+|\/+$/gu, "")).join("/")}/`;
  const folded = normalized.toLowerCase();
  if (folded.startsWith(docsFolder.toLowerCase()) && folded.endsWith(config.extension.toLowerCase())) {
    return normalized.slice(docsFolder.length, -config.extension.length);
  }
  return normalized;
}

/**
 * The file a question names, as the moment holds it: the name as written when the moment holds that file, else the
 * one file it holds whose path differs by case alone, since on Windows a path's case is not the person's to get
 * right; the name as written when none does, so that the answer says the file did not exist. Two files that differ
 * by case alone, as a repository made on Linux may hold, are named back.
 */
export function fileNamedAt(moment: Moment, given: string): string {
  if (moment.shape.files.has(given)) {
    return given;
  }
  const folded = given.toLowerCase();
  const matches = [...moment.shape.files.keys()].filter((codePath) => codePath.toLowerCase() === folded).sort();
  if (matches.length > 1) {
    throw new HistoryRefusal(`${given} names ${matches.length} files that differ only in case at that commit: ${matches.join(", ")}; give one as it is spelled.`);
  }
  return matches[0] ?? given;
}

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

/**
 * What a file was at a commit: whether it existed, its shape, and its wires either way; and, where the history carries
 * them, its rows as its card drew them, each symbol with its kind and type references, its dependency lines, and the
 * links from and to its symbols.
 */
export function emitFileAt(sequence: HistorySequence, step: number, named: string, json: boolean): void {
  const moment = momentAt(sequence, step);
  const codePath = fileNamedAt(moment, named);
  const file = fileOfShape(moment.shape, codePath);
  const rows = rowsOfFile(moment, codePath);
  const commit = commitAt(sequence, step);
  // A file that did not exist is answered from whatever the moment carries; one that did, from its rows when carried.
  const fromRows = file.exists ? rows.carried : moment.rows.size > 0;
  if (json) {
    console.log(JSON.stringify({ kind: "at", answeredFrom: fromRows ? "rows" : "shape", step, commit, file, ...(rows.rows ? { rows: rows.rows, links: { outbound: rows.outbound, inbound: rows.inbound } } : {}) }, null, 2));
    return;
  }
  console.log(`At ${where(sequence, step, commit)}, ${fromRows ? ROWS : SHAPE_ALONE}.`);
  if (!file.exists) {
    console.log(`${codePath} does not exist at ${commit.id.slice(0, 8)}.`);
    return;
  }
  console.log(`${codePath}: ${file.archetype}, ${count(file.symbols ?? 0, "symbol")}${file.entry ? ", an entry" : ""}`);
  if (rows.rows) {
    const own = rows.rows;
    for (const entry of own.entries) {
      console.log(`Entry: ${entry.reason}${entry.command ? ` ${entry.command}` : ""}${entry.symbol ? ` ${entry.symbol}` : ""}${entry.declarer ? `, named in ${entry.declarer}` : ""}`);
    }
    console.log(`Symbols: ${count(own.symbols.length, "symbol")}, in the doc's order`);
    for (const symbol of own.symbols) {
      const flags = symbol.flags.length > 0 ? ` (${symbol.flags.join(", ")})` : "";
      console.log(`  ${symbol.name}  ${symbol.kind}${flags}`);
      for (const reference of symbol.references) {
        const type = `${reference.type}${reference.array ? "[]" : ""}${reference.promise ? " (promise)" : ""}`;
        console.log(`    ${reference.role}${reference.parameter ? ` ${reference.parameter}` : ""}: ${type}${reference.to ? ` -> ${end(reference.to, reference.toSymbol)}` : ""}`);
      }
    }
    console.log(`Dependencies: ${count(own.dependencies.length, "line")}`);
    for (const line of own.dependencies) {
      const marks = [line.kind === "re-export" ? "re-export" : "", line.typeOnly ? "type-only" : "", line.basis ?? ""].filter(Boolean);
      console.log(`  ${line.label}${marks.length > 0 ? ` (${marks.join(", ")})` : ""}${line.to ? ` -> ${end(line.to, line.toSymbol)}` : ""}${line.symbols ? `: ${line.symbols.join(", ")}` : ""}`);
    }
    if (own.reExports.length > 0) {
      console.log(`Re-exports: ${count(own.reExports.length, "anchor")}`);
      for (const entry of own.reExports) console.log(`  ${entry.name}${entry.from ? ` from ${entry.from}` : entry.fromLabel ? ` from ${entry.fromLabel}` : ""}`);
    }
    for (const [heading, links] of [["Links out", rows.outbound ?? []], ["Links in", rows.inbound ?? []]] as const) {
      console.log(`${heading}: ${count(links.length, "link")}`);
      for (const link of links) console.log(`  ${linkWords(link)}`);
    }
  } else {
    for (const [heading, neighbours] of [["Outbound", file.outbound ?? []], ["Inbound", file.inbound ?? []]] as const) {
      console.log(`${heading}: ${count(neighbours.length, "file")}`);
      for (const neighbour of neighbours) {
        console.log(`  ${neighbour.codePath}  ${count(neighbour.count, "reference")}`);
      }
    }
  }
  const documents = file.documents ?? [];
  console.log(`Linked documents: ${count(documents.length, "document")}`);
  for (const document of documents) {
    console.log(`  ${document}`);
  }
  const cited = rows.rows?.citedBy ?? [];
  if (cited.length > 0) {
    console.log(`Cited by: ${count(cited.length, "document")}`);
    for (const document of cited) console.log(`  ${document}`);
  }
}

/**
 * The links at a commit between two files, or two symbols named `path#Symbol` by their anchors or names, in both
 * directions, from the rows the history carries.
 */
export function emitLinksAt(sequence: HistorySequence, step: number, from: { codePath: string; symbol?: string }, to: { codePath: string; symbol?: string }, json: boolean): void {
  const moment = momentAt(sequence, step);
  const commit = commitAt(sequence, step);
  const ends = [from, to].map((named) => {
    const given = { ...named, codePath: fileNamedAt(moment, named.codePath) };
    const rows = moment.rows.get(given.codePath);
    if (!moment.shape.files.has(given.codePath)) {
      throw new HistoryRefusal(`${given.codePath} does not exist at ${commit.id.slice(0, 8)} (${day(commit)}).`);
    }
    if (!rows) {
      throw new HistoryRefusal(`the history does not carry the rows of ${given.codePath}; run \`npm run live-docs:history\` again.`);
    }
    if (given.symbol === undefined) return { codePath: given.codePath };
    const symbol = symbolNamed(rows, given.symbol);
    if (!symbol) {
      throw new HistoryRefusal(`${given.codePath} lists no one symbol ${given.symbol} at ${commit.id.slice(0, 8)}; it lists ${rows.symbols.map((row) => row.name).join(", ") || "none"}.`);
    }
    return { codePath: given.codePath, symbol: symbol.slug };
  });
  const links = linksBetween(moment.rows, ends[0], ends[1]);
  if (json) {
    console.log(JSON.stringify({ kind: "at-links", answeredFrom: "rows", step, commit, from: ends[0], to: ends[1], links }, null, 2));
    return;
  }
  console.log(`At ${where(sequence, step, commit)}, ${ROWS}.`);
  console.log(`Links between ${end(ends[0].codePath, ends[0].symbol)} and ${end(ends[1].codePath, ends[1].symbol)}: ${count(links.length, "link")}`);
  for (const link of links) console.log(`  ${linkWords(link)}`);
}

/** The folder the history command writes the sequence and its words store into. */
export function historyFolder(workspaceRoot: string, config: LiveDocumentationConfig): string {
  return path.join(workspaceRoot, config.root, HISTORY_DIRECTORY);
}

/**
 * A file's words at a commit: its authored block and each symbol's description as that day's docs held them, read
 * from the part of the words store beside the sequence for the file's directory; or, where they cannot be read, why.
 */
export async function emitWordsAt(sequence: HistorySequence, step: number, named: string, folder: string, json: boolean): Promise<void> {
  const commit = commitAt(sequence, step);
  const moment = momentAt(sequence, step);
  const codePath = fileNamedAt(moment, named);
  const words = wordsOfFile(moment.rows, codePath);
  if (!words.exists) {
    throw new HistoryRefusal(`${codePath} does not exist at ${commit.id.slice(0, 8)} (${day(commit)}), or the history carries no rows of it.`);
  }
  const partFile = sequence.words ? wordsPartFile(sequence.words, codePath) : undefined;
  let part: WordsPart | undefined;
  if (sequence.words && partFile) {
    part = JSON.parse(await fs.readFile(path.join(folder, sequence.words.folder, partFile), "utf8")) as WordsPart;
  }
  const text = (id: number): string => {
    const found = part ? textInPart(part, id) : undefined;
    if (found === undefined) {
      throw new HistoryRefusal(`the words store beside the history lacks the text ${id} of ${codePath}; run \`npm run live-docs:history\` again.`);
    }
    return found;
  };
  const authored = typeof words.authored === "number" ? { state: "read" as const, text: text(words.authored) } : { state: words.authored === "unread" ? ("unread" as const) : ("none" as const) };
  const descriptions = (words.descriptions ?? []).map((description) => ({ slug: description.slug, name: description.name, sections: sectionsOfDescription(text(description.text)) }));
  if (json) {
    console.log(JSON.stringify({ kind: "at-words", answeredFrom: "words", step, commit, codePath, authored, descriptions }, null, 2));
    return;
  }
  console.log(`At ${where(sequence, step, commit)}, the words of ${codePath} as that day's docs held them.`);
  console.log("Authored:");
  if (authored.state === "read") {
    for (const line of authored.text.split("\n")) console.log(`  ${line}`);
  } else if (authored.state === "unread") {
    console.log(`  Not readable: the doc that stood at ${commit.id.slice(0, 8)} is in a form today's reader finds no authored block in.`);
  } else {
    console.log(`  None: no doc of ${codePath} stood at ${commit.id.slice(0, 8)} where the lens reads the docs.`);
  }
  console.log(`Descriptions: ${count(descriptions.length, "symbol")}`);
  for (const description of descriptions) {
    console.log(`  ${description.name}`);
    for (const section of description.sections) {
      console.log(`    ${section.title}:`);
      for (const line of section.body) console.log(`      ${line}`);
    }
  }
}

function end(codePath: string, symbol?: string): string {
  return symbol === undefined ? codePath : `${codePath}#${symbol}`;
}

function linkWords(link: RowLink): string {
  return `${end(link.from, link.fromSymbol)} -> ${end(link.to, link.toSymbol)}  ${link.kind}${link.count > 1 ? ` x${link.count}` : ""}`;
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
  const list = (heading: string, lines: string[], noun: string, plural?: string): void => {
    console.log(`${heading}: ${count(lines.length, noun, plural)}`);
    for (const line of lines) {
      console.log(`  ${line}`);
    }
  };
  list("Created", changes.born, "file");
  list("Deleted", changes.dead, "file");
  list("Renamed", changes.renamed.map((rename) => `${rename.from} -> ${rename.to}`), "file");
  list("Renamed whole", changes.directoriesRenamed.map((rename) => `${rename.from} -> ${rename.to}`), "directory", "directories");
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

/** A count with its noun, the plural given where adding an s does not make it ("directories"). */
export function count(n: number, noun: string, plural = `${noun}s`): string {
  return `${n} ${n === 1 ? noun : plural}`;
}
