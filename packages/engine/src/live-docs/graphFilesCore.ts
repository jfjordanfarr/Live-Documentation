/**
 * Pure host-driven Live Doc graph reading and writing over an {@link OutputSink}
 * (Step 6 of `.mdmd/layer-3/engine-and-hosts.mdmd.md`).
 *
 * @remarks
 * Imports no `node:fs` and no Node disk host: `generatorCore.ts` calls these functions directly over `host.output`,
 * while `graphFiles.ts` provides Node-defaulted facades (`readLiveDocGraph`, `writeLiveDocGraph`, `readEstateGraph`).
 *
 * @module
 */
import path from "node:path";

import type { OutputSink } from "../tooling/workspaceFiles";
import { LiveDocSyntaxError, parseLiveDoc } from "./document";
import { GRAPH_INDEX_FILE, deriveLiveDocGraph, type DocLocation, type LiveDocGraph } from "./graph";

/**
 * Reads every Live Doc under the configured root through `output` and derives the graph.
 *
 * A doc the grammar refuses stops the read with its path and line, since a doc
 * nobody may hand-edit can only be malformed by a generator bug.
 */
export async function readLiveDocGraphWithHost(args: {
  workspaceRoot: string;
  config: DocLocation;
  output: OutputSink;
}): Promise<LiveDocGraph> {
  const workspaceRoot = path.resolve(args.workspaceRoot);
  const baseLayerRoot = path.resolve(workspaceRoot, args.config.root, args.config.baseLayer);
  const absolutePaths = await args.output.listFiles(baseLayerRoot, args.config.extension);
  const docs = await Promise.all(
    absolutePaths.map(async (absolutePath) => {
      const docPath = path.relative(workspaceRoot, absolutePath).split(path.sep).join("/");
      const text = await args.output.readText(absolutePath);
      if (text === undefined) {
        throw new Error(`Listed Live Doc was not found when reading back: ${docPath}`);
      }
      try {
        return { docPath, doc: parseLiveDoc(text) };
      } catch (error) {
        // One form for each value: a doc written before this version of the generator can hold one it no longer writes.
        throw error instanceof LiveDocSyntaxError
          ? new Error(`${docPath}: ${error.message}. The grammar reads one form of each value; if the doc was written by an earlier version of the generator, \`live-docs:generate\` rewrites it.`)
          : error;
      }
    })
  );
  return deriveLiveDocGraph(docs, args.config);
}

/**
 * Writes the graph to `<root>/index.json` through `output`, pretty-printed for readers outside this code base.
 *
 * @returns The workspace-relative path written.
 */
export async function writeLiveDocGraphWithHost(
  graph: LiveDocGraph,
  workspaceRoot: string,
  output: OutputSink
): Promise<string> {
  const relative = path.posix.join(graph.root, GRAPH_INDEX_FILE);
  const absolute = path.resolve(workspaceRoot, relative);
  await output.writeText(absolute, `${JSON.stringify(graph, null, 2)}\n`);
  return relative;
}
