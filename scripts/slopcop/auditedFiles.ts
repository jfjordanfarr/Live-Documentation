/**
 * The files an audit reads: what its patterns match in the workspace, less what git ignores, found without reading the
 * folders git ignores whole.
 *
 * @remarks
 * The audits match their patterns over the whole workspace and leave out what git ignores, so that a checkout's ignored
 * copies of the repository, builds and caches are never audited. Until 2026-11-20 the walk read every one of those
 * folders file by file only to throw the files away: in the main checkout, with its builders' worktrees under
 * `.claude/worktrees/`, the markdown audit took 19.5 s where a clean worktree took 2.1 s. Now git is asked what it
 * ignores (`gitIgnores` in the engine, where discovery asks the same) before the walk, which reads the folders it
 * ignores whole as empty, and again after it, to judge the files found. A file git cannot judge, one reached through a
 * link to a folder git does not ignore or in a nested repository git cannot be asked about, is read; and where git cannot answer at
 * all, the walk is whole and every file found is read. This module was the helpers' first home, under `scripts/`, so
 * that the audits' first change moved no key of the history's cache.
 *
 * The records of the measurements and the cases: the probe of 2026-11-20 under
 * `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/`.
 *
 * @module
 */
import { globSync, type FSOption } from "glob";
import path from "node:path";

import { gitIgnores } from "@live-documentation/engine/tooling/gitIgnored";

/**
 * The files the patterns match under `workspaceRoot` and git does not ignore, as absolute paths, sorted; every file
 * they match when git cannot answer. Each pattern is matched by itself, with `ignoreGlobs` left out of the walk, as the
 * audits always matched them.
 */
export function auditedFiles(workspaceRoot: string, patterns: readonly string[], ignoreGlobs: readonly string[]): string[] {
  const walk = (unread: FSOption | undefined): Map<string, string> => {
    const discovered = new Map<string, string>();
    for (const pattern of patterns) {
      for (const match of globSync(pattern, { cwd: workspaceRoot, ignore: [...ignoreGlobs], nodir: true, dot: true, ...(unread ? { fs: unread } : {}) })) {
        const absolute = path.resolve(workspaceRoot, match);
        discovered.set(absolute, path.relative(workspaceRoot, absolute).split(path.sep).join("/"));
      }
    }
    return discovered;
  };
  const pruning = gitIgnores(workspaceRoot);
  let discovered = walk(pruning?.unread);
  // Judged by a listing taken after the walk, as discovery judges; where it fails, the walk is made again whole.
  const judging = pruning && gitIgnores(workspaceRoot);
  if (pruning && !judging) discovered = walk(undefined);
  const ignored = judging?.answer([...discovered.values()]).ignored;
  return [...discovered.keys()].filter((absolute) => !ignored?.has(discovered.get(absolute) ?? "")).sort();
}
