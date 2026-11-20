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

import { spawn } from "node:child_process";
import path from "node:path";

import { LiveDocSyntaxError, parseLiveDoc } from "@live-documentation/engine/live-docs/document";
import { execFileAsync } from "@live-documentation/engine/live-docs/gitUtils";
import { deriveLiveDocGraph, linkTarget, type DocLocation, type GraphFile, type LiveDocGraph } from "@live-documentation/engine/live-docs/graph";
import { followLink } from "@live-documentation/engine/live-docs/history/git";
import { compareLinks, linksOf, type FileRows, type RowLink, type Rows } from "@live-documentation/engine/live-docs/history/rows";
import type { Shape } from "@live-documentation/engine/live-docs/history/shape";

/**
 * The graph of the Live Docs committed at a commit, read from git's object store: every file of the commit's tree under
 * the docs root's base layer whose name ends in the docs' extension, a regular or an executable file, or a symbolic link
 * that leads through the commit's own listing to one ({@link followLink}, as the history's tree writer follows it), each
 * blob's bytes read as UTF-8 and parsed as `readLiveDocGraph` parses a doc on disk.
 *
 * @remarks
 * Until 2026-11-20 the commit's whole tree was written to a scratch folder for this, as each commit's tree is written
 * for its summary, and the docs read back from the disk: 5 to 7 s of every run at this repository's head, almost all
 * of it the writing of files the check never reads. What the disk could change, the object store does not: a name the
 * disk takes for another's (two docs whose names differ by case alone, on a disk that folds case) or one it cannot
 * hold is read here under its own name, as the commit stores it. The generator writes no such names.
 */
export async function committedLiveDocGraph(repository: string, commit: string, location: DocLocation): Promise<LiveDocGraph> {
  const asStored = { GIT_NO_REPLACE_OBJECTS: "1" };
  const listing = (await execFileAsync("git", ["-C", repository, "ls-tree", "-r", "-z", "--full-tree", commit], { cwd: repository, maxBuffer: 1 << 30, env: asStored })).stdout;
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
  const links = docs.filter(([, entry]) => entry.mode === "120000");
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
  const reader = spawn("git", ["-C", repository, "cat-file", "--batch"], { cwd: repository, stdio: ["pipe", "pipe", "pipe"], env: { ...process.env, GIT_NO_REPLACE_OBJECTS: "1" } });
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
 * Where a replayed moment differs from a graph derived from committed Live Docs, in words.
 *
 * @param textOf - The text the replayed rows name by an id.
 */
export function headDifferences(replayed: ReplayedMoment, committed: LiveDocGraph, textOf: (id: number) => string): string[] {
  const differences: string[] = [];
  const paths = new Set([...Object.keys(committed.files), ...replayed.rows.keys()]);
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
  differences.push(...linkDifferences(linksOfGraph(committed), linksOf(replayed.rows)));
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
