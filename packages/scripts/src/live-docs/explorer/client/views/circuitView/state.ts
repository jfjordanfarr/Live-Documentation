import type { ExplorerNodePayload } from "../../../shared/types";

/**
 * Immutable state for the Circuit Board progressive disclosure.
 *
 * Tracks which directories are expanded (showing file-level cards)
 * versus collapsed (showing aggregate directory tiles).
 */
export interface CircuitBoardState {
  /** Set of directory paths that the user has expanded to show individual files. */
  readonly expandedDirectories: ReadonlySet<string>;
}

/** Creates a fresh state with all directories collapsed (aggregated view). */
export function createInitialState(): CircuitBoardState {
  return { expandedDirectories: new Set() };
}

/** Returns a new state with the given directory expanded. */
export function expandDirectory(state: CircuitBoardState, directoryPath: string): CircuitBoardState {
  if (state.expandedDirectories.has(directoryPath)) {
    return state;
  }
  const next = new Set(state.expandedDirectories);
  next.add(directoryPath);
  return { expandedDirectories: next };
}

/** Returns a new state with the given directory collapsed. */
export function collapseDirectory(state: CircuitBoardState, directoryPath: string): CircuitBoardState {
  if (!state.expandedDirectories.has(directoryPath)) {
    return state;
  }
  const next = new Set(state.expandedDirectories);
  next.delete(directoryPath);
  return { expandedDirectories: next };
}

/** Returns a new state with all directories at or below the given depth collapsed. */
export function collapseToDepth(state: CircuitBoardState, keepPaths: ReadonlySet<string>): CircuitBoardState {
  const next = new Set<string>();
  for (const path of state.expandedDirectories) {
    if (keepPaths.has(path)) {
      next.add(path);
    }
  }
  if (next.size === state.expandedDirectories.size) {
    return state;
  }
  return { expandedDirectories: next };
}

/** Collapses all expanded directories, returning to full aggregate view. */
export function collapseAll(state: CircuitBoardState): CircuitBoardState {
  if (state.expandedDirectories.size === 0) {
    return state;
  }
  return { expandedDirectories: new Set() };
}

/** Returns true if any directory is currently expanded. */
export function hasExpandedDirectories(state: CircuitBoardState): boolean {
  return state.expandedDirectories.size > 0;
}

/**
 * Builds the breadcrumb trail for a given directory path.
 * Returns an array of { label, path } entries from root to the target.
 *
 * Example: "packages/shared/src" → [
 *   { label: "Root", path: "__root__" },
 *   { label: "packages", path: "packages" },
 *   { label: "shared", path: "packages/shared" },
 *   { label: "src", path: "packages/shared/src" }
 * ]
 */
export function buildBreadcrumbs(directoryPath: string): Array<{ label: string; path: string }> {
  const ROOT_KEY = "__root__";
  const crumbs: Array<{ label: string; path: string }> = [
    { label: "Root", path: ROOT_KEY }
  ];
  if (directoryPath === ROOT_KEY || !directoryPath) {
    return crumbs;
  }
  const segments = directoryPath.split("/").filter(Boolean);
  let accumulated = "";
  for (const segment of segments) {
    accumulated = accumulated ? `${accumulated}/${segment}` : segment;
    crumbs.push({ label: segment, path: accumulated });
  }
  return crumbs;
}

/**
 * Finds the directory path that should be expanded when navigating
 * to a specific node (file) from omnisearch or external link.
 */
export function findContainingDirectory(node: ExplorerNodePayload): string {
  const ROOT_KEY = "__root__";
  const parts = (node.id || "").split("/").filter(Boolean);
  if (parts.length <= 1) {
    return ROOT_KEY;
  }
  return parts.slice(0, -1).join("/");
}
