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
