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
 * all, the walk is whole and every file found is read. Either is told to `warn` (2026-11-20), but where git says the
 * workspace lies in no repository. This module was the helpers' first home, under `scripts/`, so
 * that the audits' first change moved no key of the history's cache.
 *
 * The records of the measurements and the cases: the probe of 2026-11-20 under
 * `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/`.
 *
 * @module
 */
import { globSync, type FSOption } from "glob";
import path from "node:path";

import { gitIgnores, type GitUnanswered } from "@live-documentation/engine/tooling/gitIgnored";

/**
 * The files the patterns match under `workspaceRoot` and git does not ignore, as absolute paths, sorted; every file
 * they match when git cannot answer. Each pattern is matched by itself, with `ignoreGlobs` left out of the walk, as the
 * audits always matched them.
 */
export function auditedFiles(
  workspaceRoot: string,
  patterns: readonly string[],
  ignoreGlobs: readonly string[],
  warn: (message: string) => void = (message) => console.warn(message)
): string[] {
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
  let unanswered: GitUnanswered | undefined;
  const told = (why: GitUnanswered): void => {
    unanswered = why;
  };
  const pruning = gitIgnores(workspaceRoot, told);
  let discovered = walk(pruning?.unread);
  // Judged by a listing taken after the walk, as discovery judges; where it fails, the walk is made again whole.
  const judging = pruning && gitIgnores(workspaceRoot, told);
  if (pruning && !judging) discovered = walk(undefined);
  if (!judging && unanswered && !unanswered.noRepository) {
    warn(`git could not be asked what it ignores in ${workspaceRoot}${pruning ? " after the walk" : ""} (${unanswered.reason}): every file found is audited.`);
  }
  const answer = judging?.answer([...discovered.values()]);
  if (answer && answer.unjudged.size > 0) {
    const [first] = answer.unjudged;
    warn(`git cannot say what it ignores of ${answer.unjudged.size} file(s), such as ${first}, reached through a link to a folder that is not a repository's top, which git does not follow, or in a folder holding a .git that git could not be asked about: they are audited.`);
  }
  return [...discovered.keys()].filter((absolute) => !answer?.ignored.has(discovered.get(absolute) ?? "")).sort();
}
