/**
 * Git-related utilities for Live Documentation.
 *
 * @remarks
 * These utilities support the `--changed` flag in the generator CLI,
 * detecting which files have been modified in the git working tree.
 *
 * @module
 */

import { execFile } from "node:child_process";

import { normalizeWorkspacePath } from "../tooling/pathUtils";

/**
 * Detects files changed in the git working tree, including both paths of a rename.
 *
 * @param workspaceRoot - Absolute path to the scanned workspace, which may lie below Git's repository root
 * @returns Set of workspace-relative paths that have changes
 * @throws When Git cannot report status; an unknown change set is not a clean tree.
 */
export async function detectChangedFiles(workspaceRoot: string): Promise<Set<string>> {
  let stdout: string;
  let prefix: string;
  try {
    ({ stdout } = await execFileAsync("git", ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", "."], {
      cwd: workspaceRoot,
      maxBuffer: 1 << 28
    }));
    const { stdout: rawPrefix } = await execFileAsync("git", ["rev-parse", "--show-prefix"], { cwd: workspaceRoot });
    prefix = normalizeWorkspacePath(rawPrefix.replace(/\r?\n$/u, ""));
  } catch (error) {
    throw new Error(`Cannot use --changed in ${workspaceRoot}: Git status failed: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
  const changed = new Set<string>();
  const withinWorkspace = (repositoryPath: string): string | undefined => {
    if (prefix && !repositoryPath.startsWith(prefix)) return undefined;
    return normalizeWorkspacePath(repositoryPath.slice(prefix.length));
  };
  const records = stdout.split("\0");
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (!record) continue;
    if (record.length < 4 || record[2] !== " ") {
      throw new Error(`Cannot use --changed in ${workspaceRoot}: Git returned a malformed status record.`);
    }
    const destination = withinWorkspace(record.slice(3));
    if (destination) changed.add(destination);
    // Porcelain -z lists the destination first, then the origin for a rename/copy.
    // The origin matters when its old Live Doc must be removed.
    if (/[RC]/u.test(record.slice(0, 2))) {
      if (!records[index + 1]) {
        throw new Error(`Cannot use --changed in ${workspaceRoot}: Git omitted the origin of a rename or copy.`);
      }
      const origin = withinWorkspace(records[index + 1]);
      if (origin) changed.add(origin);
      index += 1;
    }
  }
  return changed;
}

/**
 * Promise wrapper for Node.js execFile.
 *
 * @param command - The command to execute
 * @param args - Command arguments
 * @param options - Execution options: the working directory, the largest output accepted (Node's default is 1 MiB, which a listing of a large repository exceeds), and variables to set in the environment the command inherits
 * @returns Promise resolving to stdout/stderr
 */
export function execFileAsync(
  command: string,
  args: readonly string[],
  options: { cwd: string; maxBuffer?: number; env?: Record<string, string> }
): Promise<{ stdout: string; stderr: string }> {
  const env = options.env ? { ...process.env, ...options.env } : undefined;
  return new Promise((resolve, reject) => {
    execFile(command, args, { cwd: options.cwd, maxBuffer: options.maxBuffer, env }, (error, stdout, stderr) => {
      if (error) {
        let message: string;
        if (error instanceof Error) {
          message = error.message;
        } else if (typeof error === "string") {
          message = error;
        } else {
          try {
            message = JSON.stringify(error);
          } catch {
            message = "Unknown error";
          }
        }

        reject(new Error(message));
        return;
      }

      resolve({ stdout: stdout.toString(), stderr: stderr.toString() });
    });
  });
}
