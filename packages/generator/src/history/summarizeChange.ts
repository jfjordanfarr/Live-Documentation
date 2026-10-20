/**
 * One change's summary, made in a process of its own: the generator run over
 * the change's working tree under the lens's configuration, and the shape of
 * the graph it derived written to the cache.
 *
 * @remarks
 * The history command starts one process per change so that no process ever
 * holds more than one graph (the plan's scenario 4: one process holding every
 * snapshot would outgrow a V8 heap). The docs are written into the working
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
 * change's tree. A summary is written to a temporary name and renamed into
 * place, so that a run stopped halfway never leaves a summary the cache would
 * trust.
 *
 * Run as a process, it takes one argument, the task as JSON.
 *
 * @module
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

import type { LiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";
import { summarizeGraph } from "@live-documentation/engine/live-docs/history/summary";
import { relatedDocsOf } from "@live-documentation/engine/live-docs/relatedDocs";

import { generateLiveDocs } from "../generator";

/** What one process is asked to do. */
export interface SummaryTask {
  /** The change's working tree: the workspace's root inside it. */
  tree: string;
  /** The lens's configuration, applied verbatim. */
  configuration: LiveDocumentationConfig;
  /** The lens's key, recorded in the summary. */
  lens: string;
  /** The change's id. */
  commit: string;
  /** Where the summary goes. */
  summaryPath: string;
  /** Where the full graph index goes, gzipped, when the cache keeps it. */
  indexPath?: string;
}

/** Generates the change's docs in its working tree and writes its summary, and its index when asked. */
export async function summarizeChange(task: SummaryTask): Promise<void> {
  const { tree, configuration } = task;
  const result = await generateLiveDocs({
    workspaceRoot: tree,
    config: configuration,
    keepAuthoredStaleDocs: false,
    // What the generator warns goes to stderr, one line each, for the history command to gather across the changes.
    logger: {
      info: () => undefined,
      warn: (message) => process.stderr.write(`${message}\n`),
      error: (message) => process.stderr.write(`${message}\n`)
    }
  });
  // A change with no file the globs match has no docs and no index: its shape is empty.
  const indexText = result.index ? await fs.readFile(path.join(tree, result.index), "utf8") : undefined;
  const graph: LiveDocGraph = indexText
    ? (JSON.parse(indexText) as LiveDocGraph)
    : { root: configuration.root, baseLayer: configuration.baseLayer, extension: configuration.extension, files: {} };
  await writeInPlace(task.summaryPath, JSON.stringify(summarizeGraph(graph, task.lens, task.commit, await standingRelatedDocs(graph, tree, configuration))));
  if (task.indexPath) {
    await writeInPlace(task.indexPath, gzipSync(indexText ?? JSON.stringify(graph)));
  }
}

/** Each file's related documents, as the bundle reads them, that stand as files in the change's tree. */
async function standingRelatedDocs(graph: LiveDocGraph, tree: string, configuration: LiveDocumentationConfig): Promise<Map<string, string[]>> {
  const standing = new Map<string, Promise<boolean>>();
  const stands = (document: string): Promise<boolean> => {
    let answer = standing.get(document);
    if (!answer) {
      answer = fs.stat(path.join(tree, document)).then((stat) => stat.isFile(), () => false);
      standing.set(document, answer);
    }
    return answer;
  };
  const related = new Map<string, string[]>();
  for (const file of Object.values(graph.files)) {
    const documents = relatedDocsOf(file, graph, configuration.bundleExclude);
    const present = (await Promise.all(documents.map(async (document) => ((await stands(document)) ? document : null)))).filter((document): document is string => document !== null);
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

if (require.main === module) {
  summarizeChange(JSON.parse(process.argv[2]) as SummaryTask).catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`);
    process.exitCode = 1;
  });
}
