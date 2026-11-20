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
 * ignores whole as empty, and again after it, to judge the files found; where a folder left unread is not ignored whole
 * by the second listing, the walk is made again by it. A file git cannot judge, one reached through a link that git
 * does not ignore to a folder that is not a repository's top, or in a folder holding a `.git` that git could not be
 * asked about or said nothing of, is read; and where git cannot answer in the repository that holds the workspace, the
 * walk is whole and every file found is read. Either is told to `warn` (2026-11-20). A file that lies in no repository,
 * in a workspace that lies in none, is read with nothing to warn of, and each repository within such a workspace judges
 * its own files. A folder whose read fails for a cause of the machine's stops the audit, unless its own repository's
 * git ignores it, when it is passed over as its files would have been. This module was the helpers'
 * first home, under `scripts/`, so that the audits' first change moved no key of the history's cache.
 *
 * The records of the measurements and the cases: the probe of 2026-11-20 under
 * `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/`.
 *
 * @module
 */
import { globSync } from "glob";
import path from "node:path";

import { machineFailure } from "@live-documentation/engine/live-docs/processMark";
import { foldersReadAsEmpty, gitIgnores, type GitUnanswered } from "@live-documentation/engine/tooling/gitIgnored";

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
  // A folder whose read fails for a cause of the machine's, by its workspace-relative path, with the failure.
  let unreadable = new Map<string, NodeJS.ErrnoException>();
  const walk = (unread: ReadonlySet<string> | undefined): Map<string, string> => {
    unreadable = new Map();
    const fs = foldersReadAsEmpty(workspaceRoot, unread ?? new Set(), (error) => {
      if (machineFailure(error) && error.code !== "ENOENT") unreadable.set(path.relative(workspaceRoot, path.resolve(workspaceRoot, error.path ?? "")).split(path.sep).join("/"), error);
    });
    const discovered = new Map<string, string>();
    for (const pattern of patterns) {
      for (const match of globSync(pattern, { cwd: workspaceRoot, ignore: [...ignoreGlobs], nodir: true, dot: true, fs })) {
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
  let discovered = walk(pruning?.folders);
  // Judged by a listing taken after the walk, as discovery judges; where a folder left unread is not ignored whole by
  // it, or it fails, the walk is made again with its folders unread, or whole.
  const judging = pruning && gitIgnores(workspaceRoot, told);
  const unread = [...(pruning?.folders ?? [])];
  if (unread.length > 0 && judging?.answer(unread).ignored.size !== unread.length) discovered = walk(judging?.folders);
  if (!judging && unanswered) {
    warn(`git could not be asked what it ignores in ${workspaceRoot}${pruning ? " after the walk" : ""} (${unanswered.reason}): every file found is audited.`);
  }
  // A folder that cannot be read is passed over where its own repository's git ignores it, as its files would have
  // been; any other stops the audit, keeping the system's failure as its cause (2026-11-20).
  const folders = judging?.answer([...unreadable.keys()]);
  const kept = [...unreadable].find(([relative]) => !folders?.ignored.has(relative));
  if (kept) {
    throw new Error(`cannot read the folder ${path.resolve(workspaceRoot, kept[0])}, whose files the audit would read (${kept[1].message}): make it readable, have git ignore it, or name it in the audit's ignore globs.`, { cause: kept[1] });
  }
  const answer = judging?.answer([...discovered.values()]);
  if (answer && answer.unjudged.size > 0) {
    const [first] = answer.unjudged;
    warn(`git cannot say what it ignores of ${answer.unjudged.size} file(s), such as ${first}, reached through a link to a folder that is not a repository's top, which git does not follow, or in a folder holding a .git that git could not be asked about: they are audited.`);
  }
  return [...discovered.keys()].filter((absolute) => !answer?.ignored.has(discovered.get(absolute) ?? "")).sort();
}
