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
 * one; the mirror committed at that change is removed first, so that neither
 * its docs, made by the generator of that day, nor their authored blocks enter
 * the reading, and the lens's configuration is applied verbatim, so that its
 * docs root is never documented as source. A summary is written to a
 * temporary name and renamed into place, so that a run stopped halfway never
 * leaves a summary the cache would trust.
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
  const docsRoot = path.resolve(tree, configuration.root);
  await fs.rm(path.join(docsRoot, configuration.baseLayer), { recursive: true, force: true });
  const result = await generateLiveDocs({
    workspaceRoot: tree,
    config: configuration,
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
  await writeInPlace(task.summaryPath, JSON.stringify(summarizeGraph(graph, task.lens, task.commit)));
  if (task.indexPath) {
    await writeInPlace(task.indexPath, gzipSync(indexText ?? JSON.stringify(graph)));
  }
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
