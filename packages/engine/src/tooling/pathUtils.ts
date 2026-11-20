import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * Convert a file URI into a workspace-relative path using POSIX-style separators.
 * Returns undefined when the URI is outside the workspace or cannot be resolved.
 */
export function toWorkspaceRelativePath(uri: string, workspaceRoot: string): string | undefined {
  if (!uri.startsWith("file://")) {
    return undefined;
  }

  let filePath: string;
  try {
    filePath = path.resolve(fileURLToPath(uri));
  } catch {
    return undefined;
  }

  const relative = path.relative(workspaceRoot, filePath);
  if (!relative || relative.startsWith("..")) {
    return undefined;
  }

  return normalizeWorkspacePath(relative);
}

/**
 * Resolve a workspace-relative path (or absolute path) to a file URI.
 */
export function toWorkspaceFileUri(workspaceRoot: string, candidate: string): string {
  const resolved = path.isAbsolute(candidate)
    ? candidate
    : path.resolve(workspaceRoot, candidate);
  return pathToFileURL(resolved).toString();
}

/**
 * Normalise a path so directory separators are POSIX-style.
 */
export function normalizeWorkspacePath(candidate: string): string {
  return candidate.split(path.sep).join("/");
}

/**
 * The failures of a disk that mean it cannot hold a name or a path, rather than that it failed: a name too long, a name
 * it does not accept, a name that is already another's by its own rule of names, a path through something that is not a
 * folder. The history's tree writer leaves out and names an entry that meets one (`history/git.ts`), and any other
 * failed system call is the machine's, not the file's (`machineFailure`, `live-docs/processMark.ts`). Kept here, the one
 * light module both reach, since 2026-11-20: before, each held a copy, and `processMark.ts` loads TypeScript, which the
 * history command's own process otherwise never loads.
 */
export const NAME_FAILURES: ReadonlySet<string> = new Set(["ENAMETOOLONG", "EILSEQ", "EINVAL", "EEXIST", "ENOTDIR", "EISDIR", "ELOOP"]);
