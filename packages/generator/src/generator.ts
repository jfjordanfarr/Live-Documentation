/**
 * Node-defaulted entry point for the Live Documentation generation pipeline.
 *
 * @remarks
 * Wraps the pure host-driven generator core (`generatorCore.ts`) with Node's disk host (`NODE_FILE_HOST`), grammar
 * loader (`NODE_GRAMMAR_HOST`), git port (`NODE_GIT_HOST`), and ancestor scan probe (`nodeScansAbove`). Browser hosts
 * import `runLiveDocs` from `generatorCore.ts` directly and never pull in Node's git or grammar disk loaders.
 *
 * @module
 */
import * as fs from "node:fs/promises";
import path from "node:path";

import { analyzeSourceFile } from "@live-documentation/engine/live-docs/core";
import { gitIgnored } from "@live-documentation/engine/tooling/gitIgnored";
import { NODE_GIT_HOST } from "@live-documentation/engine/tooling/nodeGitHost";
import { NODE_GRAMMAR_HOST } from "@live-documentation/engine/tooling/nodeGrammars";
import { NODE_FILE_HOST } from "@live-documentation/engine/tooling/nodeHost";
import { normalizeWorkspacePath } from "@live-documentation/engine/tooling/pathUtils";
import { throwIfMachineFailure } from "@live-documentation/engine/tooling/sourceText";
import type { FileHost } from "@live-documentation/engine/tooling/workspaceFiles";

import {
  runLiveDocs,
  scanMarkers,
  type GenerateLiveDocsOptions,
  type LiveDocGeneratorLogger,
  type LiveDocGeneratorResult,
  type SourceReadings
} from "./generatorCore";

export type { GenerateLiveDocsOptions, LiveDocGeneratorLogger, LiveDocGeneratorResult, SourceReadings };

/**
 * Entry point for the Live Documentation generation pipeline on Node.
 *
 * Discovers all workspace files matching the configured globs, analyses each for
 * public symbols and dependencies, and renders deterministic markdown docs under
 * the configured base layer directory. A doc is rewritten only when its generated
 * content changed, and only then does its `Generated At` line move. After a run
 * that writes, the graph index is derived from every doc on disk and written to
 * `<root>/index.json`.
 *
 * Supports `--dry-run` (no writes), `--changed` (process git-dirty sources
 * against full workspace context), and `--include` (explicit file subset)
 * modes. Stale Live Docs whose sources no longer exist are pruned; a
 * changed-only run restricts pruning to changed source paths.
 *
 * Created 2025-11-09; extended with symbol index (2026-01-14), JSON adapter
 * (2026-01-28), cross-platform hash fix (2026-02-03), the entry index behind
 * the `Entry` lines (2026-10-15), and host ports for grammars, git, and outer
 * scans (2026-11-24).
 *
 * @param options - Generation configuration including workspace root, config overrides, and logger.
 */
export async function generateLiveDocs(
  options: GenerateLiveDocsOptions
): Promise<LiveDocGeneratorResult> {
  const baseHost = options.host ?? NODE_FILE_HOST;
  const host: FileHost = {
    ...baseHost,
    grammars: baseHost.grammars ?? NODE_GRAMMAR_HOST,
    git: options.host && "git" in options.host ? options.host.git : NODE_GIT_HOST,
    scansAbove: options.host && "scansAbove" in options.host ? options.host.scansAbove : nodeScansAbove
  };
  return runLiveDocs({ ...options, host, analyze: analyzeSourceFile });
}

/** The ancestor folders that are scans of their own: a docs root or a configuration file of this tool above the workspace. */
async function nodeScansAbove(
  workspaceRoot: string,
  config: { root: string; baseLayer: string; extension: string }
): Promise<string[]> {
  const found: string[] = [];
  let current = path.dirname(workspaceRoot);
  for (let depth = 0; depth < 64 && current !== path.dirname(current); depth += 1) {
    // A folder the scan above has git ignore is no part of that scan's map, so this one does not lie inside it.
    const here = normalizeWorkspacePath(path.relative(current, workspaceRoot));
    if (await isScan(current, config) && !gitIgnored(current, [here])?.has(here)) {
      found.push(current);
    }
    current = path.dirname(current);
  }
  return found;
}

/** Whether a folder above the workspace is a scan of its own; a probe that fails for a cause of the machine's stops the run rather than read as no scan (since 2026-11-20). */
async function isScan(folder: string, config: { root: string; baseLayer: string }): Promise<boolean> {
  const { docsRoot, configurationFile } = scanMarkers(config);
  for (const candidate of [path.join(folder, docsRoot), path.join(folder, configurationFile)]) {
    try {
      await fs.stat(candidate);
      return true;
    } catch (error) {
      throwIfMachineFailure(error);
    }
  }
  return false;
}
