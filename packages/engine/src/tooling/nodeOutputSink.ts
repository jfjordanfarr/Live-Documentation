/**
 * Node disk implementation of {@link OutputSink} (Step 6 of `.mdmd/layer-3/engine-and-hosts.mdmd.md`).
 *
 * @remarks
 * Kept strictly outside the browser scan import graph: `generatorCore.ts`, `graphFilesCore.ts`, and `page-entry.mjs`
 * talk to `OutputSink` alone, while Node facades (`generator.ts`, `graphFiles.ts`) wire this disk sink by default.
 *
 * @module
 */
import * as fs from "node:fs/promises";
import path from "node:path";

import { NODE_FILE_HOST } from "./nodeHost";
import { throwIfMachineFailure } from "./sourceText";
import type { FileHost, OutputSink } from "./workspaceFiles";
import { walkWorkspace } from "./workspaceWalk";

const byCodeUnit = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Removes empty folders left by a deleted doc, stopping before `stopDir`, or at a folder that is gone, holds
 * something, or cannot be read or removed. A failure of any kind, the machine's among them, leaves the folder: this is
 * tidying, no doc and no fact is read from an empty folder, and a run stopped here would pass on a plain second try
 * with nothing mended, since the stale doc is already gone and its folder never visited again; on Windows a folder
 * another program holds (`EBUSY`, `EPERM`) is an ordinary thing to meet (the root's ruling, 2026-11-20).
 */
async function cleanupEmptyParents(startDir: string, stopDir: string): Promise<void> {
  const stop = path.resolve(stopDir);
  const stopPrefix = stop.endsWith(path.sep) ? stop : `${stop}${path.sep}`;
  let current = path.resolve(startDir);

  while (current.startsWith(stopPrefix) && current !== stop) {
    try {
      const entries = await fs.readdir(current);
      if (entries.length > 0) {
        break;
      }
      await fs.rmdir(current);
      current = path.dirname(current);
    } catch {
      break;
    }
  }
}

/**
 * Builds a disk-backed {@link OutputSink}. Folder listing walks through `host` (defaulting to {@link NODE_FILE_HOST})
 * so callers supplying a custom listing host retain full observability of directory walks.
 */
export function createNodeOutputSink(host: FileHost = NODE_FILE_HOST): OutputSink {
  return {
    async readText(absolutePath: string): Promise<string | undefined> {
      try {
        return await fs.readFile(absolutePath, "utf8");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return undefined;
        }
        throw error;
      }
    },

    async writeText(absolutePath: string, content: string): Promise<void> {
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, content, "utf8");
    },

    async removeFile(absolutePath: string, stopDir?: string): Promise<void> {
      await fs.rm(absolutePath, { force: true });
      if (stopDir !== undefined) {
        await cleanupEmptyParents(path.dirname(absolutePath), stopDir);
      }
    },

    async hasDirectory(absolutePath: string): Promise<boolean> {
      try {
        const stats = await fs.stat(absolutePath);
        return stats.isDirectory();
      } catch (error) {
        throwIfMachineFailure(error);
        return false;
      }
    },

    async listFiles(baseLayerRoot: string, extension: string): Promise<string[]> {
      const walked = await walkWorkspace({ workspaceRoot: baseLayerRoot, host });
      if (walked.unreadable.length > 0) {
        throw walked.unreadable[0].error;
      }
      return walked.files
        .filter((entry) => entry.relative.endsWith(extension))
        .map((entry) => entry.absolute)
        .sort(byCodeUnit);
    }
  };
}

/** Default Node disk output sink backed by {@link NODE_FILE_HOST}. */
export const NODE_OUTPUT_SINK: OutputSink = createNodeOutputSink(NODE_FILE_HOST);
