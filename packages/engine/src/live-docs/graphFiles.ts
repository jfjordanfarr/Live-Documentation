/**
 * The graph on disk: read from the docs, written to `<root>/index.json`, and
 * read from the scans a board names, one graph per scan, into the estate's.
 *
 * @module
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import { NODE_FILE_HOST } from "../tooling/nodeHost";
import { createNodeOutputSink, NODE_OUTPUT_SINK } from "../tooling/nodeOutputSink";
import { throwIfMachineFailure } from "../tooling/sourceText";
import type { FileHost, OutputSink } from "../tooling/workspaceFiles";
import type { Board } from "./board";
import { folderOf } from "./boardGraph";
import { contains, deriveEstateGraph, type EstateScan } from "./estateGraph";
import type { DocLocation, LiveDocGraph } from "./graph";
import { readLiveDocGraphWithHost, writeLiveDocGraphWithHost } from "./graphFilesCore";

/**
 * Reads every Live Doc under the configured root and derives the graph.
 *
 * A doc the grammar refuses stops the read with its path and line, since a doc
 * nobody may hand-edit can only be malformed by a generator bug.
 */
export async function readLiveDocGraph(args: { workspaceRoot: string; config: DocLocation; host?: FileHost }): Promise<LiveDocGraph> {
  const output = args.host?.output ?? createNodeOutputSink(args.host ?? NODE_FILE_HOST);
  return readLiveDocGraphWithHost({ workspaceRoot: args.workspaceRoot, config: args.config, output });
}

/** What reading an estate found: its graph, the scans it read, and what it found wanting. */
export interface EstateReading {
  graph: LiveDocGraph;
  /** The folders read as scans, from the workspace root with forward slashes; the empty string is the root itself. */
  scans: string[];
  /** A scan that lies inside another, which is not read: the outer scan carries its files. */
  issues: string[];
}

/**
 * Reads the graph of the estate a board describes.
 *
 * @remarks
 * A scan is a folder with docs under the configured root: the workspace root
 * when it has them, and the folder of every thing whose `From` has them. A scan
 * never lies inside another scan, so a folder with docs inside another scan is
 * reported and not read, the outer scan's docs standing for it. The scans are
 * then merged into one graph by {@link deriveEstateGraph}, which links across
 * them what each left unlinked. One scan at the root is today's single graph.
 */
export async function readEstateGraph(args: { workspaceRoot: string; config: DocLocation; board: Board; boardPath: string }): Promise<EstateReading> {
  const workspaceRoot = path.resolve(args.workspaceRoot);
  // A probe that fails for a cause of the machine's is not a folder without docs: the read stops with it rather than
  // leave a scan out of the estate unsaid (since 2026-11-20).
  const hasDocs = async (folder: string): Promise<boolean> => {
    try {
      return (await fs.stat(path.join(workspaceRoot, folder, args.config.root, args.config.baseLayer))).isDirectory();
    } catch (error) {
      throwIfMachineFailure(error);
      return false;
    }
  };
  const candidates = new Set<string>();
  if (await hasDocs("")) {
    candidates.add("");
  }
  for (const thing of args.board.things) {
    const folder = thing.from === undefined ? undefined : folderOf(thing.from, args.boardPath);
    if (folder !== undefined && !candidates.has(folder) && (await hasDocs(folder))) {
      candidates.add(folder);
    }
  }
  const sorted = [...candidates].sort((a, b) => a.length - b.length || (a < b ? -1 : a > b ? 1 : 0));
  const scans: string[] = [];
  const issues: string[] = [];
  for (const folder of sorted) {
    const outer = scans.find((candidate) => contains(candidate, folder));
    if (outer !== undefined) {
      issues.push(`the scan at ${folder} lies inside the scan at ${outer || "the workspace root"} and is not read; a scan never lies inside another scan`);
    } else {
      scans.push(folder);
    }
  }
  if (scans.length === 0) {
    return { graph: await readLiveDocGraph({ workspaceRoot, config: args.config }), scans, issues };
  }
  const read: EstateScan[] = [];
  for (const folder of scans) {
    read.push({ folder, graph: await readLiveDocGraph({ workspaceRoot: path.join(workspaceRoot, folder), config: args.config }) });
  }
  return { graph: deriveEstateGraph(read, args.config), scans, issues };
}

/**
 * Writes the graph to `<root>/index.json`, pretty-printed for readers outside this code base.
 *
 * @returns The workspace-relative path written.
 */
export async function writeLiveDocGraph(graph: LiveDocGraph, workspaceRoot: string, output: OutputSink = NODE_OUTPUT_SINK): Promise<string> {
  return writeLiveDocGraphWithHost(graph, workspaceRoot, output);
}
