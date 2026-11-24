/**
 * Node-defaulted file discovery and symbol indexing facade for Live Documentation.
 *
 * @remarks
 * Wraps the pure host-driven discovery core (`discoveryCore.ts`) with Node's default disk (`NODE_FILE_HOST`) and git
 * (`NODE_GIT_HOST`) hosts so existing Node callers and tests continue unchanged. Browser hosts import
 * `discoveryCore.ts` directly and never pull in `node:child_process` or `gitIgnored.ts`.
 *
 * @module
 */
import path from "node:path";

import { NODE_GIT_HOST } from "../tooling/nodeGitHost";
import { NODE_FILE_HOST, registerNodeDiskFallback } from "../tooling/nodeHost";
import type { FileHost } from "../tooling/workspaceFiles";
import {
  buildWorkspaceIndexes,
  discoverDocumentsWithHost,
  discoverWorkspaceTargetFilesWithHost,
  docsRootWithin,
  inWorkspaceOrder,
  type DiscoveredTargets,
  type DiscoverOptions,
  type WorkspaceIndexes
} from "./discoveryCore";

registerNodeDiskFallback();

export { buildWorkspaceIndexes, docsRootWithin, inWorkspaceOrder, type DiscoveredTargets, type DiscoverOptions, type WorkspaceIndexes };

/** Applies Node's disk and git hosts whenever the caller omitted them. */
function withNodeDefaults(host?: FileHost): FileHost {
  const base = host ?? NODE_FILE_HOST;
  return {
    ...base,
    git: host && "git" in host ? host.git : NODE_GIT_HOST
  };
}

/**
 * Locates workspace files that should receive Live Documentation generation, returning both the sorted absolute paths
 * and a predicate answering whether an unresolved path was deliberately left out by the scan's active rules.
 */
export async function discoverWorkspaceTargetFiles(options: DiscoverOptions): Promise<DiscoveredTargets> {
  return discoverWorkspaceTargetFilesWithHost({
    ...options,
    workspaceRoot: path.resolve(options.workspaceRoot),
    host: withNodeDefaults(options.host)
  });
}

/**
 * Locates workspace files that should receive Live Documentation generation, returning only the sorted absolute paths.
 *
 * @see discoverWorkspaceTargetFiles
 */
export async function discoverTargetFiles(options: DiscoverOptions): Promise<string[]> {
  return (await discoverWorkspaceTargetFiles(options)).files;
}

/**
 * Discovers the workspace's prose documents, held to the same leave-out, git, and configuration rules as source files.
 *
 * @returns Workspace-relative paths with forward slashes, sorted.
 */
export async function discoverDocuments(
  options: Pick<DiscoverOptions, "workspaceRoot" | "config" | "host" | "reads" | "leaveOut" | "warn">
): Promise<string[]> {
  return discoverDocumentsWithHost({
    ...options,
    workspaceRoot: path.resolve(options.workspaceRoot),
    host: withNodeDefaults(options.host)
  });
}
