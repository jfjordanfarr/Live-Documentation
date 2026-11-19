/**
 * One change's summary: what the history command's cache keeps of the graph
 * the generator derived at that change, and the format it keeps it in.
 *
 * @remarks
 * Since format 3 (2026-11-19) a summary keeps every fact of each file's doc
 * that is not prose: its archetype and `Entry` lines, its public symbols in
 * the doc's order with their kinds, flags and type references, its
 * dependency lines, its re-exported anchors and the documents that cite it,
 * each reference and line with the file and symbol it resolved to, so that a
 * past moment can be drawn as fully as today's (the owner, 2026-11-18: "all
 * three rungs"). It leaves out each symbol's `Source:` line, whose number
 * moves with nearly every edit above it while the doc's order says the same,
 * and the generated timestamp. The prose itself, a doc's authored block and each symbol's
 * description, is kept once in the lens's text store and named here by the
 * hash of its content, so that a text that stays the same across a thousand
 * changes is stored once. Until format 3 a summary kept a symbol count and an
 * edge count per target and discarded the rest; the counts are now read from
 * the rows (`shapeOfSummary` in `shape.ts`), so the summary holds each fact
 * once.
 *
 * This module is the summarizing process's: whatever it imports decides what
 * a summary says, so the lens's key is made of it (`generatorIdentity.ts`),
 * and it imports from the sequence's modules nothing but types.
 *
 * @module
 */

import { createHash } from "node:crypto";

import type { DocSection } from "../document";
import { linkTarget, resolveDocLink, type EdgeBasis, type GraphEdge, type LiveDocGraph } from "../graph";

/** The version of the format of one change's summary in the cache. */
// 4 since 2026-11-19: a file's `citedBy` holds the citing documents' paths, where 3 held the doc's labels.
export const HISTORY_SUMMARY_FORMAT = "live-docs-history-summary/4";

/** How a type reference stands in its symbol's signature, by the graph's name for the edge it makes. */
export type ReferenceRole = "returns" | "parameter" | "extends" | "implements" | "constraint";

/** One type a symbol's signature names: a `Returns`, `Parameters`, `Extends`, `Implements` or `Constraints` entry. */
export interface RowReference {
  role: ReferenceRole;
  /** For a `parameter`, the parameter's name. */
  parameter?: string;
  /** The type's name as the doc writes it, without its array or promise mark. */
  type: string;
  array?: true;
  promise?: true;
  /** The file the type resolved to, when its doc links it to one that stood at the change; it may be the symbol's own file. */
  to?: string;
  /** The slug of the symbol it names on that file. */
  toSymbol?: string;
}

/** One public symbol of a file, a row of its card, as its doc listed it at the change. */
export interface SymbolRow {
  /** The heading as the doc writes it, as `Widget (interface)`. */
  name: string;
  /** The heading's anchor: the symbol's identity within its file. */
  slug: string;
  kind: string;
  /** The `Type:` line's flags, `default` and `type-only`, when it has any. */
  flags?: string[];
  /** Its type references in the doc's order, when it has any. */
  references?: RowReference[];
  /** The hash of its description in the text store (see `descriptionText`), when it has one. */
  text?: string;
}

/** One `Dependencies` line of a file's doc. */
export interface DependencyRow {
  /** The line's label: a module, `module.symbol`, or an external specifier. */
  label: string;
  kind: "import" | "re-export";
  typeOnly?: true;
  basis?: EdgeBasis;
  /** For an external dependency, the symbols taken from it. */
  symbols?: string[];
  /** The file it resolved to, when it names one that stood at the change. */
  to?: string;
  /** The slug of the symbol it names on that file. */
  toSymbol?: string;
}

/** One `Entry` line of a file's doc: why something outside the code starts it. */
export interface EntryRow {
  reason: string;
  /** For `program`, the symbol that starts it; for `opening`, the opening served. */
  symbol?: string;
  /** For `command`, the script's or binary's name. */
  command?: string;
  /** For `command` and `module`, the manifest that names the file, by its workspace path. */
  declarer?: string;
}

/** One entry of a file's `Re-Exported Symbol Anchors`. */
export interface ReExportRow {
  name: string;
  slug?: string;
  /** The file the symbol comes from, when it is a file that stood at the change. */
  from?: string;
  /** The module as the doc names it, when it names one. */
  fromLabel?: string;
  flags?: string[];
}

/** What a file's doc said at a change, everything but its prose, which is named by hash, and its `Source:` lines. */
export interface SummaryFile {
  path: string;
  archetype: string;
  /** Its `Entry` lines, in the doc's order; empty when nothing outside the code starts it. */
  entries: EntryRow[];
  symbols: SymbolRow[];
  dependencies: DependencyRow[];
  /** Its `Re-Exported Symbol Anchors`, when it re-exports. */
  reExports?: ReExportRow[];
  /**
   * The documents outside the Live Docs whose markdown linked to it, its `Cited By`, by their workspace paths read
   * from the lines' links, when any did. Until format 4 the lines' labels, which write a backtick as an apostrophe. A
   * name holding `#` or a percent-escape is misread (`docs/C#.md` as `docs/C`), since the link is written as a plain
   * path and read here as a browser reads one; the mend waits on the doc reader's, which decodes such a link.
   */
  citedBy?: string[];
  /**
   * The hash of its authored block in the text store, when a doc stood at the change where the lens reads it and its
   * authored block could be read; see {@link AuthoredReading}.
   */
  authored?: string;
  /** Present when a doc stood at the change where the lens reads it and today's reader finds no authored block in it. */
  unread?: true;
}

/** One change's summary as the cache keeps it: `<docsRoot>/history/<lens>/<change>.json.gz`. */
export interface CommitSummary {
  format: typeof HISTORY_SUMMARY_FORMAT;
  /** The lens key the summary was made under. */
  lens: string;
  /** The change summarized. */
  commit: string;
  /** Every file, sorted by path. */
  files: SummaryFile[];
  /** Every link from a file's authored words to a document that stood at the change, sorted: the file's path and the document's. */
  docLinks: Array<[from: string, doc: string]>;
  /**
   * The change's files its working tree did not hold, so that the generator never read them, each with the reason
   * (`WorkingTree.unwritten`); absent when the tree held every file.
   */
  unwritten?: Array<[path: string, reason: string]>;
}

/**
 * What the lens could read of a doc's authored block at a change, by the doc's workspace-relative path: `read` when
 * the doc that stood there has an `## Authored` heading, which the generator carries forward verbatim; `unread` when
 * it stood in a form with none, as this repository's mirror before 2026-09-27 does, so that the block the generator
 * writes is its placeholder and not that day's words. A doc absent from the map did not stand at the change.
 */
export type AuthoredReading = ReadonlyMap<string, "read" | "unread">;

/** A summary and the texts it names by hash, for the caller to put in the text store. */
export interface SummarizedChange {
  summary: CommitSummary;
  /** Every text the summary names, by its hash. */
  texts: Map<string, string>;
}

/**
 * The summary of a graph.
 *
 * @param graph - The graph the generator derived at the change.
 * @param lens - The key of the lens the generator ran under.
 * @param commit - The change's id.
 * @param relatedDocs - The documents a file's authored words link to that stood at the change, by the file's path;
 * the caller reads them with `relatedDocsOf` and the change's tree, which the graph alone cannot see.
 * @param authored - What could be read of each doc's authored block, by doc path; the caller reads the docs that stood
 * at the change before the generator rewrote them. Without it, every doc's block counts as read.
 */
export function summarizeGraph(
  graph: LiveDocGraph,
  lens: string,
  commit: string,
  relatedDocs: ReadonlyMap<string, readonly string[]> = new Map(),
  authored?: AuthoredReading
): SummarizedChange {
  const texts = new Map<string, string>();
  const keep = (text: string): string => {
    const hash = textHash(text);
    texts.set(hash, text);
    return hash;
  };
  const files: SummaryFile[] = [];
  const docLinks: CommitSummary["docLinks"] = [];
  for (const file of Object.values(graph.files).sort((a, b) => compare(a.codePath, b.codePath))) {
    if (file.archetype === undefined) {
      // The generator writes an archetype on every doc; a doc without one is a generator bug, not a shape to record.
      throw new Error(`${file.docPath} carries no archetype`);
    }
    // The graph pushes one edge per dependency line, in order, then one per linked type of each symbol, in order.
    const dependencyEdges = file.edges.slice(0, file.dependencies.length);
    const referenceEdges = file.edges.slice(file.dependencies.length);
    let next = 0;
    const symbols = file.symbols.map((symbol): SymbolRow => {
      if (!symbol.slug) {
        throw new Error(`${file.docPath} lists ${symbol.name} without an anchor`);
      }
      const references: RowReference[] = [];
      for (const line of symbol.references) {
        const entries =
          line.role === "Parameters"
            ? line.parameters.flatMap((parameter) => parameter.types.map((type) => ({ type, role: "parameter" as const, parameter: parameter.name })))
            : line.types.map((type) => ({ type, role: ROLE_OF_LINE[line.role], parameter: undefined }));
        for (const { type, role, parameter } of entries) {
          const reference: RowReference = { role, ...(parameter !== undefined ? { parameter } : {}), type: type.name };
          if (type.array) reference.array = true;
          if (type.promise) reference.promise = true;
          if (type.link) {
            Object.assign(reference, target(referenceEdges[next++]));
          }
          references.push(reference);
        }
      }
      return {
        name: symbol.name,
        slug: symbol.slug,
        kind: symbol.kind,
        ...(symbol.flags.length > 0 ? { flags: [...symbol.flags] } : {}),
        ...(references.length > 0 ? { references } : {}),
        ...(symbol.sections.length > 0 ? { text: keep(descriptionText(symbol.sections)) } : {})
      };
    });
    if (next !== referenceEdges.length) {
      throw new Error(`${file.docPath} carries ${referenceEdges.length} reference edges where its symbols link ${next} types`);
    }
    const dependencies = dependencyEdges.map((edge, index): DependencyRow => {
      if (edge.kind !== "import" && edge.kind !== "re-export") {
        throw new Error(`${file.docPath} carries a ${edge.kind} edge where a dependency line was expected`);
      }
      const taken = file.dependencies[index].symbols;
      return {
        label: edge.label,
        kind: edge.kind,
        ...(edge.typeOnly ? { typeOnly: true as const } : {}),
        ...(edge.basis ? { basis: edge.basis } : {}),
        ...(taken && taken.length > 0 ? { symbols: [...taken] } : {}),
        ...target(edge)
      };
    });
    const entries = file.entries.map((entry): EntryRow => ({
      reason: entry.reason,
      ...(entry.symbol ? { symbol: entry.symbol.name } : {}),
      ...(entry.command !== undefined ? { command: entry.command } : {}),
      ...(entry.declarer ? { declarer: entry.declarer.label } : {})
    }));
    const reExports = (file.reExports ?? []).map((entry): ReExportRow => {
      const origin = entry.from ? linkTarget(file.docPath, entry.from.link, graph) : undefined;
      return {
        name: entry.name,
        ...(entry.slug ? { slug: entry.slug } : {}),
        ...(origin && graph.files[origin.codePath] ? { from: origin.codePath } : {}),
        ...(entry.from ? { fromLabel: entry.from.label } : {}),
        ...(entry.flags.length > 0 ? { flags: [...entry.flags] } : {})
      };
    });
    // The citing document's path, which the reader of the summary holds to the bundle's exclusions, read from the
    // link; its label, the path with a backtick written as an apostrophe, is made from it where the rows are read.
    const citedBy = (file.citedBy ?? []).map((entry) => citingPath(file.docPath, entry));
    const reading = authored === undefined ? "read" : authored.get(file.docPath);
    files.push({
      path: file.codePath,
      archetype: file.archetype,
      entries,
      symbols,
      dependencies,
      ...(reExports.length > 0 ? { reExports } : {}),
      ...(citedBy.length > 0 ? { citedBy } : {}),
      ...(reading === "read" ? { authored: keep(file.authored) } : reading === "unread" ? { unread: true as const } : {})
    });
    for (const doc of [...new Set(relatedDocs.get(file.codePath) ?? [])].sort(compare)) {
      docLinks.push([file.codePath, doc]);
    }
  }
  return { summary: { format: HISTORY_SUMMARY_FORMAT, lens, commit, files, docLinks }, texts };
}

const ROLE_OF_LINE = { Returns: "returns", Extends: "extends", Implements: "implements", Constraints: "constraint" } as const;

function target(edge: GraphEdge): Pick<RowReference, "to" | "toSymbol"> {
  return { ...(edge.to !== undefined ? { to: edge.to } : {}), ...(edge.to !== undefined && edge.toSymbol !== undefined ? { toSymbol: edge.toSymbol } : {}) };
}

/**
 * A symbol's description as one text: its `#####` sections as JSON, `[{ title, body }]`, without the symbol's name, so
 * that a symbol renamed with its description unchanged keeps its text; {@link sectionsOfDescription} reads it back.
 */
export function descriptionText(sections: readonly DocSection[]): string {
  return JSON.stringify(sections.map((section) => ({ title: section.title, body: section.body })));
}

/** The sections a description's text holds. */
export function sectionsOfDescription(text: string): DocSection[] {
  return JSON.parse(text) as DocSection[];
}

/** The name of a text in the store: the SHA-256 of its UTF-8 bytes, in hexadecimal. */
export function textHash(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** A `Cited By` line's document by its workspace path, from the line's link, decoded as a browser reads it; its label where the link names nothing in the workspace. */
function citingPath(docPath: string, entry: { label: string; link: string }): string {
  let link = entry.link;
  try {
    link = decodeURIComponent(link);
  } catch {
    // A link that is not well-formed is read as written.
  }
  return resolveDocLink(docPath, link) ?? entry.label;
}
