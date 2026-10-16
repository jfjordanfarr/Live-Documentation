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
 * The files git tracks, as workspace-relative paths, so that discovery keeps a
 * tracked file the `.gitignore` would otherwise drop: git itself ignores a
 * tracked file's ignore rules, and a file committed on purpose (a
 * `.vscode/settings.json` under an ignored `.vscode/`) is part of the
 * repository. Empty when the workspace is not a git repository or git is not
 * available, in which case the `.gitignore` is the only word.
 *
 * @param workspaceRoot - Absolute path to the repository root
 */
export async function listTrackedFiles(workspaceRoot: string): Promise<Set<string>> {
  try {
    const { stdout } = await execFileAsync("git", ["ls-files", "-z"], { cwd: workspaceRoot, maxBuffer: 64 * 1024 * 1024 });
    const tracked = new Set<string>();
    for (const entry of stdout.split("\0")) {
      if (entry) {
        tracked.add(normalizeWorkspacePath(entry));
      }
    }
    return tracked;
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
 * @param options - Execution options: the working directory, and the largest output accepted (Node's default is 1 MiB, which a listing of a large repository exceeds)
 * @returns Promise resolving to stdout/stderr
 */
export function execFileAsync(
  command: string,
  args: readonly string[],
  options: { cwd: string; maxBuffer?: number }
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(command, args, { cwd: options.cwd, maxBuffer: options.maxBuffer }, (error, stdout, stderr) => {
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
