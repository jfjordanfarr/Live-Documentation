import * as fs from "node:fs/promises";
import path from "node:path";

import type { TargetManifest } from "@live-documentation/shared/live-docs/types";

/**
 * Loads the target manifest (`data/live-docs/targets.json`) from
 * the workspace root, returning `undefined` when the file does not exist.
 */
export async function loadTargetManifest(workspaceRoot: string): Promise<TargetManifest | undefined> {
  const manifestPath = path.resolve(workspaceRoot, "data", "live-docs", "targets.json");
  try {
    const raw = await fs.readFile(manifestPath, "utf8");
    return JSON.parse(raw) as TargetManifest;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}
