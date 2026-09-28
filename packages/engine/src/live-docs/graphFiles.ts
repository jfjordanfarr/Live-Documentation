/**
 * The graph on disk: read from the docs, written to `<root>/index.json`.
 *
 * @module
 */

import { glob } from "glob";
import { promises as fs } from "node:fs";
import path from "node:path";

import { LiveDocSyntaxError, parseLiveDoc } from "./document";
import { GRAPH_INDEX_FILE, deriveLiveDocGraph, type DocLocation, type LiveDocGraph } from "./graph";

/**
 * Reads every Live Doc under the configured root and derives the graph.
 *
 * A doc the grammar refuses stops the read with its path and line, since a doc
 * nobody may hand-edit can only be malformed by a generator bug.
 */
export async function readLiveDocGraph(args: { workspaceRoot: string; config: DocLocation }): Promise<LiveDocGraph> {
  const workspaceRoot = path.resolve(args.workspaceRoot);
  const pattern = path.posix.join(args.config.root, args.config.baseLayer, "**", `*${args.config.extension}`);
  const absolutePaths = await glob(pattern, { cwd: workspaceRoot, absolute: true, nodir: true, windowsPathsNoEscape: true });
  const docs = await Promise.all(
    absolutePaths.map(async (absolutePath) => {
      const docPath = path.relative(workspaceRoot, absolutePath).split(path.sep).join("/");
      const text = await fs.readFile(absolutePath, "utf8");
      try {
        return { docPath, doc: parseLiveDoc(text) };
      } catch (error) {
        throw error instanceof LiveDocSyntaxError ? new Error(`${docPath}: ${error.message}`) : error;
      }
    })
  );
  return deriveLiveDocGraph(docs, args.config);
}

/**
 * Writes the graph to `<root>/index.json`, pretty-printed for readers outside this code base.
 *
 * @returns The workspace-relative path written.
 */
export async function writeLiveDocGraph(graph: LiveDocGraph, workspaceRoot: string): Promise<string> {
  const relative = path.posix.join(graph.root, GRAPH_INDEX_FILE);
  const absolute = path.resolve(workspaceRoot, relative);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, `${JSON.stringify(graph, null, 2)}\n`, "utf8");
  return relative;
}
