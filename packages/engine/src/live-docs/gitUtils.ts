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
 * Detects files that have been changed in the git working tree.
 *
 * @param workspaceRoot - Absolute path to the repository root
 * @returns Set of workspace-relative paths that have changes
 */
export async function detectChangedFiles(workspaceRoot: string): Promise<Set<string>> {
  try {
    const { stdout } = await execFileAsync("git", ["status", "--porcelain"], {
      cwd: workspaceRoot
    });
    const changed = new Set<string>();
    for (const rawLine of stdout.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line) {
        continue;
      }
      const entry = parsePorcelainLine(line);
      if (entry) {
        changed.add(entry);
      }
    }
    return changed;
  } catch {
    return new Set<string>();
  }
}

/**
 * Parses a git status --porcelain line to extract the file path.
 *
 * @remarks
 * Handles renamed/copied files by extracting the destination path.
 *
 * @param line - A line from `git status --porcelain` output
 * @returns The normalized workspace-relative path, or undefined if invalid
 */
export function parsePorcelainLine(line: string): string | undefined {
  if (line.length < 4) {
    return undefined;
  }

  const status = line.slice(0, 2);
  const pathPart = line.slice(3).trim();
  if (!pathPart) {
    return undefined;
  }

  if (status.startsWith("R") || status.startsWith("C")) {
    const arrowIndex = pathPart.indexOf("->");
    if (arrowIndex >= 0) {
      const renamed = pathPart.slice(arrowIndex + 2).trim();
      return renamed ? normalizeWorkspacePath(renamed) : undefined;
    }
  }

  return normalizeWorkspacePath(pathPart);
}

/**
 * Promise wrapper for Node.js execFile.
 *
 * @param command - The command to execute
 * @param args - Command arguments
 * @param options - Execution options (cwd is required)
 * @returns Promise resolving to stdout/stderr
 */
export function execFileAsync(
  command: string,
  args: readonly string[],
  options: { cwd: string }
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(command, args, { cwd: options.cwd }, (error, stdout, stderr) => {
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
