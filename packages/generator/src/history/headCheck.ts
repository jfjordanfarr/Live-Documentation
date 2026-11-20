/**
 * The check at the head: the history's last step, replayed through every
 * step from its base, held to the graph read afresh from the Live Docs
 * committed at the commit the history ends at.
 *
 * @remarks
 * The two sides are read apart. The replayed side is the sequence's own: its
 * shape, its rows and the texts its rows name. The committed side is read here
 * straight from each committed doc as the doc reader gives it, field by field:
 * a symbol's heading, anchor, kind, flags, type names and description; a
 * dependency line's label, its qualifiers and the symbols taken; the entries,
 * re-exported anchors, citing documents and authored block; and every link
 * from the graph's resolved edges. None of it passes through the summary or
 * the rows' reading of a summary (`summarizeGraph`, `rowsOfSummary`), nor
 * through the hashes the texts are stored under. Until 2026-11-19 the rows'
 * side ran the committed graph through those very functions, so that a fault
 * in them would have been found on both sides alike.
 *
 * What the two sides still share is the doc reader (`readLiveDocGraph`), which
 * read the generator's docs into the index every summary was made from and
 * reads the committed docs here, and the meaning of the fields compared.
 *
 * @module
 */

import path from "node:path";

import { LiveDocSyntaxError, parseLiveDoc } from "@live-documentation/engine/live-docs/document";
import { deriveLiveDocGraph, linkTarget, type DocLocation, type GraphFile, type LiveDocGraph } from "@live-documentation/engine/live-docs/graph";
import { followLink, historyGit, spawnHistoryGit } from "@live-documentation/engine/live-docs/history/git";
import { compareLinks, linksOf, type FileRows, type RowLink, type Rows } from "@live-documentation/engine/live-docs/history/rows";
import type { Shape } from "@live-documentation/engine/live-docs/history/shape";

/**
 * The graph of the Live Docs committed at a commit, read from git's object store: every file of the commit's tree under
 * the docs root's base layer whose name ends in the docs' extension, a regular or an executable file, or a symbolic link
 * that leads through the commit's own listing to one ({@link followLink}, given the target of every link of the listing,
 * as the history's tree writer gives it), each blob's bytes read as UTF-8 and parsed as `readLiveDocGraph` parses a doc
 * on disk.
 *
 * @remarks
 * Until 2026-11-20 the commit's whole tree was written to a scratch folder for this, as each commit's tree is written
 * for its summary, and the docs read back from the disk: 5 to 7 s of every run at this repository's head, almost all
 * of it the writing of files the check never reads. What the disk could change, the object store does not: a name the
 * tree writer leaves out of a tree (one Windows reserves, a name two entries share on a disk that folds case or
 * normalization, one that is not UTF-8) is read here under its own name, as the commit stores it. The check compares
 * no such file ({@link leftOutAtHead}). For the first form of this reader the independent review of 2026-11-20 found
 * that only the targets of the links among the docs were read, so that a doc that is a link to a link outside the base
 * layer, or reached through a folder that is a link, was taken for a link to nothing.
 *
 * The listing and the batch reader repeat two of `git.ts`'s readers, which this module does not import because that
 * file keys the history's lens and an edit of it would derive every summary again; they are to be folded into it at the
 * next change that moves the lens anyway.
 */
export async function committedLiveDocGraph(repository: string, commit: string, location: DocLocation): Promise<LiveDocGraph> {
  const listing = await historyGit(["-C", repository, "ls-tree", "-r", "-z", "--full-tree", commit], { cwd: repository });
  const byPath = new Map<string, { mode: string; id: string }>();
  for (const line of listing.split("\0")) {
    if (line === "") continue;
    // Each entry is `<mode> <type> <id>\t<path>`.
    const tab = line.indexOf("\t");
    const [mode, , id] = line.slice(0, tab).split(" ");
    byPath.set(line.slice(tab + 1), { mode, id });
  }
  const folder = `${path.posix.join(location.root, location.baseLayer)}/`;
  const docs = [...byPath].filter(([file]) => file.startsWith(folder) && file.endsWith(location.extension));
  // Every link of the listing, wherever it stands: a link to a doc may lead through others, and through folders that are links.
  const links = [...byPath].filter(([, entry]) => entry.mode === "120000");
  const linkTargets = await readBlobs(repository, [...new Set(links.map(([, entry]) => entry.id))]);
  const targets = new Map(links.map(([file, entry]) => [file, linkTargets.get(entry.id)?.toString("utf8") ?? ""]));
  const blobOf = new Map<string, string>();
  for (const [file, entry] of docs) {
    if (entry.mode === "100644" || entry.mode === "100755") blobOf.set(file, entry.id);
    else if (entry.mode === "120000") {
      const end = followLink(file, byPath, targets);
      if ("file" in end) blobOf.set(file, end.file.id);
    }
  }
  const blobs = await readBlobs(repository, [...new Set(blobOf.values())]);
  const parsed = [...blobOf].map(([docPath, id]) => {
    try {
      return { docPath, doc: parseLiveDoc(blobs.get(id)!.toString("utf8")) };
    } catch (error) {
      // As `readLiveDocGraph` words it: one form for each value, and a doc an earlier generator wrote can hold another.
      throw error instanceof LiveDocSyntaxError ? new Error(`${docPath}: ${error.message}. The grammar reads one form of each value; if the doc was written by an earlier version of the generator, \`live-docs:generate\` rewrites it.`) : error;
    }
  });
  return deriveLiveDocGraph(parsed, location);
}

/** The blobs of the given ids, whole, by id, read by one `git cat-file --batch`. */
async function readBlobs(repository: string, ids: readonly string[]): Promise<Map<string, Buffer>> {
  const found = new Map<string, Buffer>();
  if (ids.length === 0) return found;
  const reader = spawnHistoryGit(["-C", repository, "cat-file", "--batch"], { cwd: repository });
  const chunks: Buffer[] = [];
  let errors = "";
  reader.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
  reader.stderr.setEncoding("utf8");
  reader.stderr.on("data", (text: string) => {
    errors += text;
  });
  reader.stdin.on("error", () => undefined);
  const code = await new Promise<number | null>((resolve, reject) => {
    reader.on("error", reject);
    reader.on("close", resolve);
    reader.stdin.end(ids.map((id) => `${id}\n`).join(""));
  });
  if (code !== 0) throw new Error(`git cat-file failed reading the committed Live Docs (exit ${code}): ${errors.trim() || "no word"}`);
  const all = Buffer.concat(chunks);
  let at = 0;
  for (const id of ids) {
    const lineEnd = all.indexOf(0x0a, at);
    const [answered, type, size] = all.subarray(at, lineEnd).toString("utf8").split(" ");
    if (answered !== id || type !== "blob") throw new Error(`git cat-file answered ${answered} ${type} where the blob ${id} was asked for`);
    found.set(id, all.subarray(lineEnd + 1, lineEnd + 1 + Number(size)));
    at = lineEnd + 1 + Number(size) + 1;
  }
  return found;
}

/** A moment of the history, as replayed: its shape and its rows. */
export interface ReplayedMoment {
  shape: Shape;
  rows: Rows;
}

/**
 * The committed files the check at the head does not compare, each with why: those whose source the head's tree did not
 * hold, by the head summary's own list (`unwritten`). The history never read such a file, and the tree writer leaves
 * out names the committed docs can hold (a name Windows reserves, such as `aux.ts`, on Windows; two names one on a disk
 * that folds case or normalization; a name that is not UTF-8), so comparing them would fail the check where the history
 * is right. The check that read the committed docs from git's object store compared them until the independent review
 * of 2026-11-20; the one before it wrote the head's tree to the same disk, which left the same names out of both sides.
 *
 * A file whose doc alone was left out is compared as any other: the history read its source, so a difference in what
 * the doc alone carries is reported. Until the review's second pass a doc's own path left out passed its whole file
 * over, a symbol the replay had lost included; in the real cases the source and the doc are left out together.
 *
 * The limit: what is passed over comes from the history's own account of what its tree left out. A fault of the tree's
 * writer that drops an entry and reports it is passed over too, though named with its reason in the check's line; that
 * is no weaker than the check before the whole change, which dropped such entries from both sides and said nothing.
 *
 * @param leftOut - Each entry the head's tree did not hold, by its path, with why.
 */
export function leftOutAtHead(committed: LiveDocGraph, leftOut: ReadonlyMap<string, string>): Map<string, string> {
  const notCompared = new Map<string, string>();
  for (const file of Object.values(committed.files).sort((a, b) => compare(a.codePath, b.codePath))) {
    const reason = leftOut.get(file.codePath);
    if (reason !== undefined) notCompared.set(file.codePath, reason);
  }
  return notCompared;
}

/**
 * Where a replayed moment differs from a graph derived from committed Live Docs, in words.
 *
 * @param textOf - The text the replayed rows name by an id.
 * @param notCompared - The files left out of the comparison ({@link leftOutAtHead}), with every link to or from them.
 */
export function headDifferences(replayed: ReplayedMoment, committed: LiveDocGraph, textOf: (id: number) => string, notCompared: ReadonlySet<string> = new Set()): string[] {
  const differences: string[] = [];
  const paths = new Set([...Object.keys(committed.files), ...replayed.rows.keys()].filter((file) => !notCompared.has(file)));
  for (const path of [...paths].sort(compare)) {
    const file = committed.files[path];
    const rows = replayed.rows.get(path);
    if (file === undefined) {
      differences.push(`${path} is in the history's last step and no doc of it is committed`);
      continue;
    }
    if (rows === undefined) {
      differences.push(`${path} has a committed doc and is not in the history's last step`);
      continue;
    }
    const expected = wordsOfDoc(file, committed);
    const actual = wordsOfRows(path, rows, replayed.shape, textOf);
    for (const field of Object.keys(expected) as Array<keyof FileWords>) {
      if (expected[field] !== actual[field]) {
        differences.push(`the ${field} of ${path} differ: committed ${expected[field]}, replayed ${actual[field]}`);
      }
    }
  }
  const compared = (link: RowLink): boolean => !notCompared.has(link.from) && !notCompared.has(link.to);
  differences.push(...linkDifferences(linksOfGraph(committed).filter(compared), linksOf(replayed.rows).filter(compared)));
  return differences;
}

/** What is compared of a file, each field written out as JSON. */
interface FileWords {
  archetype: string;
  entries: string;
  symbols: string;
  dependencies: string;
  reExports: string;
  citedBy: string;
  authored: string;
}

/** Each symbol: its heading, anchor, kind, flags, the types its signature names, and its description's sections. */
type SymbolWords = [name: string, slug: string, kind: string, flags: string[], references: ReferenceWords[], sections: Array<{ title: string; body: string[] }>];
/** One type a signature names: its role, its parameter, its name, and whether it is an array or a promise of it. */
type ReferenceWords = [role: string, parameter: string, type: string, array: boolean, promise: boolean];

// A doc's reference lines by the role each of their types plays.
const ROLE = { Returns: "returns", Parameters: "parameter", Extends: "extends", Implements: "implements", Constraints: "constraint" } as const;

/** A committed doc's fields, read from the doc reader's model. */
function wordsOfDoc(file: GraphFile, graph: LiveDocGraph): FileWords {
  const symbols = file.symbols.map((symbol): SymbolWords => {
    const references: ReferenceWords[] = [];
    for (const line of symbol.references) {
      if (line.role === "Parameters") {
        for (const parameter of line.parameters) {
          for (const type of parameter.types) references.push([ROLE.Parameters, parameter.name, type.name, type.array === true, type.promise === true]);
        }
      } else {
        for (const type of line.types) references.push([ROLE[line.role], "", type.name, type.array === true, type.promise === true]);
      }
    }
    return [symbol.name, symbol.slug ?? "", symbol.kind, [...symbol.flags], references, symbol.sections.map((section) => ({ title: section.title, body: [...section.body] }))];
  });
  const dependencies = file.dependencies.map((line) => [
    line.label,
    line.qualifiers.includes("re-export") ? "re-export" : "import",
    line.qualifiers.includes("type-only"),
    line.qualifiers.find((qualifier) => qualifier === "contract" || qualifier === "configuration") ?? "",
    line.symbols ?? []
  ]);
  const reExports = (file.reExports ?? []).map((entry) => {
    const origin = entry.from ? linkTarget(file.docPath, entry.from.link, graph) : undefined;
    return [entry.name, entry.slug ?? "", origin && graph.files[origin.codePath] ? origin.codePath : "", entry.from?.label ?? "", [...entry.flags]];
  });
  return {
    archetype: JSON.stringify(file.archetype ?? ""),
    entries: JSON.stringify(file.entries.map((entry) => [entry.reason, entry.symbol?.name ?? "", entry.command ?? "", entry.declarer?.label ?? ""])),
    symbols: JSON.stringify(symbols),
    dependencies: JSON.stringify(dependencies),
    reExports: JSON.stringify(reExports),
    citedBy: JSON.stringify((file.citedBy ?? []).map((entry) => entry.label)),
    authored: JSON.stringify(file.authored)
  };
}

/** The same fields of a file's replayed rows, each text read by its id. */
function wordsOfRows(path: string, rows: FileRows, shape: Shape, textOf: (id: number) => string): FileWords {
  const symbols = rows.symbols.map((symbol): SymbolWords => [
    symbol.name,
    symbol.slug,
    symbol.kind,
    [...symbol.flags],
    symbol.references.map((reference): ReferenceWords => [reference.role, reference.parameter ?? "", reference.type, reference.array === true, reference.promise === true]),
    symbol.text === undefined ? [] : (JSON.parse(textOf(symbol.text)) as Array<{ title: string; body: string[] }>)
  ]);
  return {
    archetype: JSON.stringify(shape.files.get(path)?.archetype ?? ""),
    entries: JSON.stringify(rows.entries.map((entry) => [entry.reason, entry.symbol ?? "", entry.command ?? "", entry.declarer ?? ""])),
    symbols: JSON.stringify(symbols),
    dependencies: JSON.stringify(rows.dependencies.map((line) => [line.label, line.kind, line.typeOnly === true, line.basis ?? "", line.symbols ?? []])),
    reExports: JSON.stringify(rows.reExports.map((entry) => [entry.name, entry.slug ?? "", entry.from ?? "", entry.fromLabel ?? "", [...(entry.flags ?? [])]])),
    citedBy: JSON.stringify(rows.citedBy),
    authored: typeof rows.authored === "number" ? JSON.stringify(textOf(rows.authored)) : rows.authored
  };
}

/** Every link between two different files of a graph, read from its resolved edges, counted by ends and kind. */
function linksOfGraph(graph: LiveDocGraph): RowLink[] {
  const counted = new Map<string, RowLink>();
  for (const file of Object.values(graph.files)) {
    for (const edge of file.edges) {
      if (edge.to === undefined || edge.to === file.codePath) continue;
      const link: RowLink = { from: file.codePath, ...(edge.from !== undefined ? { fromSymbol: edge.from } : {}), to: edge.to, ...(edge.toSymbol !== undefined ? { toSymbol: edge.toSymbol } : {}), kind: edge.kind, count: 0 };
      const key = [link.from, link.fromSymbol ?? "", link.to, link.toSymbol ?? "", link.kind].join("\0");
      const existing = counted.get(key) ?? link;
      existing.count += 1;
      counted.set(key, existing);
    }
  }
  return [...counted.values()].sort(compareLinks);
}

function linkDifferences(expected: readonly RowLink[], actual: readonly RowLink[]): string[] {
  const words = (link: RowLink): string => `${link.from}${link.fromSymbol ? `#${link.fromSymbol}` : ""} -${link.kind}-> ${link.to}${link.toSymbol ? `#${link.toSymbol}` : ""} x${link.count}`;
  const want = new Set(expected.map(words));
  const have = new Set(actual.map(words));
  return [...[...want].filter((link) => !have.has(link)).map((link) => `the link ${link} is missing`), ...[...have].filter((link) => !want.has(link)).map((link) => `the link ${link} was not expected`)];
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
