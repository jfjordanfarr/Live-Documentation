/**
 * The files an audit reads: what its patterns match in the workspace, less what git ignores, found without reading the
 * folders git ignores whole.
 *
 * @remarks
 * The audits match their patterns over the whole workspace and then ask git which of the files found it ignores
 * (`withoutGitIgnored`), so that a checkout's ignored copies of the repository, builds and caches are never audited.
 * Until 2026-11-20 the walk read every one of those folders file by file only to throw the files away: in the main
 * checkout, with its builders' worktrees under `.claude/worktrees/`, the markdown audit took 19.5 s where a clean
 * worktree took 2.1 s. Now git is asked once, before the walk, for the folders it ignores whole
 * (`foldersGitIgnoresWhole`), and the walk reads each of those folders as empty (`foldersReadAsEmpty`). What the audit
 * reads is what a full walk's audit reads: git judges every path under such a folder ignored, a path reached through a
 * link included (`gitIgnoreAnswer` in the engine). A file git cannot judge, one reached through a link to a folder git
 * does not ignore, is read, as is every file when git cannot answer at all. The helpers live with `gitIgnoreAnswer` in
 * the engine, where discovery shortens its walks the same way; this module was their first home, under `scripts/`, so
 * that the audits' first change moved no key of the history's cache.
 *
 * The records of the measurements and the cases: the probe of 2026-11-20 under
 * `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/`.
 *
 * @module
 */
import { globSync } from "glob";
import path from "node:path";

import { foldersGitIgnoresWhole, foldersReadAsEmpty, withoutGitIgnored } from "@live-documentation/engine/tooling/gitIgnored";

/**
 * The files the patterns match under `workspaceRoot` and git does not ignore, as absolute paths, sorted; every file
 * they match when git cannot answer. Each pattern is matched by itself, with `ignoreGlobs` left out of the walk, as the
 * audits always matched them.
 */
export function auditedFiles(workspaceRoot: string, patterns: readonly string[], ignoreGlobs: readonly string[]): string[] {
  const unread = foldersReadAsEmpty(workspaceRoot, foldersGitIgnoresWhole(workspaceRoot));
  const discovered = new Set<string>();
  for (const pattern of patterns) {
    for (const match of globSync(pattern, { cwd: workspaceRoot, ignore: [...ignoreGlobs], nodir: true, dot: true, fs: unread })) {
      discovered.add(path.resolve(workspaceRoot, match));
    }
  }
  return withoutGitIgnored(workspaceRoot, Array.from(discovered).sort());
}
