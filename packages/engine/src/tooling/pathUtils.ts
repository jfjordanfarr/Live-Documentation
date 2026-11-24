import path from "./enginePath";

/**
 * A file's path relative to the workspace, with forward slashes, or undefined when it lies outside the workspace or is
 * the workspace itself. A relative `candidate` is taken from the workspace. Until 2026-11-22 the generator made a file
 * URL of the path and read the path back from it before taking it relative, which a page cannot do without Node's
 * `node:url`; the round trip gave back the path it was handed, so the relative path is taken directly.
 */
export function toWorkspaceRelativePath(candidate: string, workspaceRoot: string): string | undefined {
  const relative = path.relative(workspaceRoot, path.resolve(workspaceRoot, candidate));
  if (!relative || relative === ".." || relative.startsWith("../") || path.isAbsolute(relative)) {
    return undefined;
  }

  return normalizeWorkspacePath(relative);
}

/**
 * Normalise a path so directory separators are POSIX-style.
 */
export function normalizeWorkspacePath(candidate: string): string {
  return candidate.replace(/\\/gu, "/");
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
