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

import { linkTarget, type GraphFile, type LiveDocGraph } from "@live-documentation/engine/live-docs/graph";
import { compareLinks, linksOf, type FileRows, type RowLink, type Rows } from "@live-documentation/engine/live-docs/history/rows";
import type { Shape } from "@live-documentation/engine/live-docs/history/shape";

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
