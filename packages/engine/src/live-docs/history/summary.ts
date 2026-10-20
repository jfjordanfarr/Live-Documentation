/**
 * One change's summary: the shape of its graph, as the history command's cache
 * keeps it, read from the graph the generator derived at that change.
 *
 * @module
 */

import type { LiveDocGraph } from "../graph";
import { HISTORY_SUMMARY_FORMAT, type CommitSummary } from "./format";
import { edgeKey, type FileShape, type Shape } from "./shape";

/**
 * The summary of a graph: every file with its archetype, its symbol count and
 * whether its doc carries an Entry line, every directed edge between two
 * different files with the number of the source's references that land on the
 * target, and every link from a file's authored words to a document.
 *
 * @param graph - The graph the generator derived at the change.
 * @param lens - The key of the lens the generator ran under.
 * @param commit - The change's id.
 * @param relatedDocs - The documents a file's authored words link to that stood at the change, by the file's path;
 * the caller reads them with `relatedDocsOf` and the change's tree, which the graph alone cannot see.
 */
export function summarizeGraph(graph: LiveDocGraph, lens: string, commit: string, relatedDocs: ReadonlyMap<string, readonly string[]> = new Map()): CommitSummary {
  const files: CommitSummary["files"] = [];
  const edges: CommitSummary["edges"] = [];
  const docLinks: CommitSummary["docLinks"] = [];
  for (const file of Object.values(graph.files).sort((a, b) => compare(a.codePath, b.codePath))) {
    if (file.archetype === undefined) {
      // The generator writes an archetype on every doc; a doc without one is a generator bug, not a shape to record.
      throw new Error(`${file.docPath} carries no archetype`);
    }
    files.push([file.codePath, file.archetype, file.symbols.length, file.entries.length > 0 ? 1 : 0]);
    const counts = new Map<string, number>();
    for (const edge of file.edges) {
      if (edge.to !== undefined && edge.to !== file.codePath) {
        counts.set(edge.to, (counts.get(edge.to) ?? 0) + 1);
      }
    }
    for (const to of [...counts.keys()].sort(compare)) {
      edges.push([file.codePath, to, counts.get(to)!]);
    }
    for (const doc of [...new Set(relatedDocs.get(file.codePath) ?? [])].sort(compare)) {
      docLinks.push([file.codePath, doc]);
    }
  }
  return { format: HISTORY_SUMMARY_FORMAT, lens, commit, files, edges, docLinks };
}

/** The shape a summary records. */
export function shapeOfSummary(summary: CommitSummary): Shape {
  const files = new Map<string, FileShape>();
  for (const [path, archetype, symbols, entry] of summary.files) {
    files.set(path, { archetype, symbols, entry: entry === 1 });
  }
  const edges = new Map<string, number>();
  for (const [from, to, count] of summary.edges) {
    edges.set(edgeKey(from, to), count);
  }
  const docLinks = new Set<string>(summary.docLinks.map(([from, doc]) => edgeKey(from, doc)));
  return { files, edges, docLinks };
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
