/**
 * The files an audit reads: what its patterns match in the workspace, less what git ignores, found without reading the
 * folders git ignores whole.
 *
 * @remarks
 * The audits match their patterns over the whole workspace and then ask git which of the files found it ignores
 * (`gitIgnored`), so that a checkout's ignored copies of the repository, builds and caches are never audited. Until
 * 2026-11-20 the walk read every one of those folders file by file only to throw the files away: in the main checkout,
 * with its builders' worktrees under `.claude/worktrees/`, the markdown audit took 19.5 s where a clean worktree took
 * 2.1 s. Now git is asked once, before the walk, for the folders it ignores whole (`foldersGitIgnoresWhole`), and the
 * walk reads each of those folders as empty (`foldersReadAsEmpty`). What the audit reads is the same by construction:
 * every file under such a folder is untracked and ignored, so the filter that follows the walk would have dropped it.
 *
 * Two rules keep that true where it would not otherwise hold, for git refuses the whole question (`gitIgnored` is
 * then `null`, and the audit reads every file the walk found) when one path it is given lies inside a submodule, passes
 * through a link to a folder, or begins with a `:` git reads as pathspec magic. A pattern is walked this way only when
 * it is a leading `**` and one name (`walksNoLinkToAFolder`), under which glob follows no link to a folder; and when
 * git refuses the files of the shortened walk, the walk is made again in full and judged as before. A submodule never
 * lies in a folder git ignores whole, since its folder is tracked, so git refuses the full walk as it refused the short
 * one; and the folders whose own paths git could refuse are never among those it ignores whole. The helpers live with
 * `gitIgnored` in the engine, where discovery shortens its walks the same way; this module was their first home, under
 * `scripts/`, so that the audits' change moved no key of the history's cache.
 *
 * The records of the measurements and the cases: the probe of 2026-11-20 under
 * `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/`.
 *
 * @module
 */
import { globSync, type FSOption } from "glob";
import path from "node:path";

import {
  foldersGitIgnoresWhole,
  foldersReadAsEmpty,
  gitIgnored,
  walksNoLinkToAFolder,
  withoutGitIgnored
} from "@live-documentation/engine/tooling/gitIgnored";

/**
 * The files the patterns match under `workspaceRoot` and git does not ignore, as absolute paths, sorted; every file
 * they match when git cannot answer. Each pattern is matched by itself, with `ignoreGlobs` left out of the walk, as the
 * audits always matched them.
 */
export function auditedFiles(workspaceRoot: string, patterns: readonly string[], ignoreGlobs: readonly string[]): string[] {
  const folders = foldersGitIgnoresWhole(workspaceRoot);
  if (folders.size > 0) {
    const files = matching(workspaceRoot, patterns, ignoreGlobs, foldersReadAsEmpty(workspaceRoot, folders));
    const relative = files.map((file) => path.relative(workspaceRoot, file).split(path.sep).join("/"));
    const ignored = gitIgnored(workspaceRoot, relative);
    if (ignored) {
      return files.filter((_file, index) => !ignored.has(relative[index]));
    }
    // Git refused one of the paths, and refuses the same path in the full walk: there every file found is read.
  }
  return withoutGitIgnored(workspaceRoot, matching(workspaceRoot, patterns, ignoreGlobs, undefined));
}

/** The files each pattern matches, as absolute paths, sorted; a pattern that passes no link is walked on `unread`. */
function matching(workspaceRoot: string, patterns: readonly string[], ignoreGlobs: readonly string[], unread: FSOption | undefined): string[] {
  const discovered = new Set<string>();
  for (const pattern of patterns) {
    const matches = globSync(pattern, {
      cwd: workspaceRoot,
      ignore: [...ignoreGlobs],
      nodir: true,
      dot: true,
      ...(unread && walksNoLinkToAFolder(pattern) ? { fs: unread } : {})
    });
    for (const match of matches) {
      discovered.add(path.resolve(workspaceRoot, match));
    }
  }
  return Array.from(discovered).sort();
}
