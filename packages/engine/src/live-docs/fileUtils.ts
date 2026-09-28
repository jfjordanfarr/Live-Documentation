/**
 * File system utilities for Live Documentation.
 *
 * @remarks
 * These utilities handle common file system operations like checking
 * directory existence and cleaning up empty parent directories.
 *
 * @module
 */

import * as fs from "node:fs/promises";
import path from "node:path";

/**
 * Checks if a path is an existing directory.
 *
 * @param candidate - Absolute path to check
 * @returns True if the path exists and is a directory
 */
export async function directoryExists(candidate: string): Promise<boolean> {
  try {
    const stats = await fs.stat(candidate);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Recursively removes empty directories from `startDir` up to (but excluding) `stopDir`.
 *
 * @remarks
 * The walk stops as soon as a directory contains any entries or when the
 * `stopDir` boundary is reached, preventing accidental deletion outside the Live
 * Doc mirror.
 *
 * @param startDir - Directory that was just emptied (for example, a deleted Live Doc path).
 * @param stopDir - Absolute directory boundary that must remain intact.
 */
export async function cleanupEmptyParents(startDir: string, stopDir: string): Promise<void> {
  const stop = path.resolve(stopDir);
  let current = path.resolve(startDir);

  while (current.startsWith(stop) && current !== stop) {
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
