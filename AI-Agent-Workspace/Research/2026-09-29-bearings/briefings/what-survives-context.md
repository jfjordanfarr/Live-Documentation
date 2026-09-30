# What the `what-survives` explorer has learned so far (2026-09-29)

You are a reader working for the explorer of the slice `what-survives`. Read the brief first, whole:
`/workspaces/Live-Documentation/AI-Agent-Workspace/Research/2026-09-29-bearings/brief.md`.
Then its reading list (AGENTS.md; `.mdmd/layer-1/vision.mdmd.md`; `AI-Agent-Workspace/Memory/owner.md`, `direction.md`, `ideas.md`;
`AI-Agent-Workspace/ChatHistory/2026/09/2026-09-29.1.md` and `2026-09-29.2.md`). direction.md has a very wide table: read it with
`sed -n '23,52p' AI-Agent-Workspace/Memory/direction.md | sed 's/  */ /g'` so the padding does not flood you.

## The brief's rules bind you too

- You write NOTHING in the repository. No file edits, no `git` command that writes, no `npm` script that generates or builds
  (`npm run build`, `live-docs:generate`, `live-docs:visualize` and the like are forbidden). Read-only commands are fine
  (`git log`, `git show`, `git blame`, `grep`, `wc`, `sed -n`). What you find, you return to me as your final message; that is your only output.
- Never open Claude Code's session logs: nothing under `~/.claude/projects/`, no `.jsonl` file.
- Old certainty is history. What the record decided is dated history or an open question, never a current decision.
- Plain words. No requirement-ID schemes, no emoji, no invented deadlines or estimates.
- The workspace mount is case-insensitive; check a directory listing (`ls`) before saying that a file exists.
- Weigh the owner's words above the agent's. What an agent of the day said it built or measured is a claim; the owner's reaction is the evidence.
- In the 2025 transcripts the owner's turns begin `jfjordanfarr: ` and the agent's `GitHub Copilot: `. In the 2026 Copilot transcripts
  the owner's begin `User: `. The `Summarized/` folder beside each month is an index written by the agent of the day: use it to find a passage, never as a source.
- If you launch subagents of your own, give them the brief, this file, and these rules.

## What the slice is

Not a stretch of the chat record but the repository itself: everything tracked today that predates 2026-09-26 (the day the owner
came back with Claude Code) and has not been rewritten since. For each group of survivors: why was it written (the chat record of the
day it arrived says why), and what in it is true and lives nowhere else. The owner's frame, 2026-09-29: "Much 'baby' remains in files
not-yet-decommissioned, still to be separated from the 'bathwater'."

## The measurement so far

The last commit before the return is `ae216cb5` (2026-04-02). Since then 63 commits (2026-09-26 to 2026-09-29).
At `ae216cb5` there were 1633 tracked files; today 1580. Against that commit, with rename detection and line endings ignored:
620 files deleted, 567 added, 550 renamed, 158 modified, 305 byte-identical (222 of them chat transcripts).

A table of every tracked file outside the chat record is at
`/tmp/claude-1000/-workspaces-Live-Documentation/938ec442-01ad-44ad-bd62-ac7e87a8139d/scratchpad/survey2.tsv`
Columns, tab-separated: status (SAME, MOD, REN = renamed or moved, NEW = arrived since 2026-09-26), path today, path at ae216cb5,
lines added since, lines deleted since, lines in the file today, the commit that first added it (date, hash, subject; followed
through renames), the last commit that touched it.

What it shows, by area (files surviving / lines today / lines added to them since the return):

- `packages/explorer/src/client/` 91 files, 29,458 lines, 322 lines added since. The Explorer client is almost wholly Copilot-era code,
  moved from `packages/scripts/...` but hardly edited. Nine new files (the World Map) add 3,297 lines.
  Arrival: shell and detail panel 2025-11-22; Local Map 2025-12-03 to 12-19; pathfind 2025-12-17; Circuit Board rewrite 2026-03-18;
  Membrane Map 2026-03-24 to 03-31; force graph view file 2026-02-20.
- `packages/engine/src/live-docs/` 44 surviving files, 14,110 lines, 526 added since; 36 new files, 10,248 lines (tree-sitter adapters,
  grammar, graph index, openings, boards). Survivors include the hand-written C, Ruby, PowerShell, ASP.NET, HTML, CSS, JSON adapters,
  the docstring bridges (`python.docstring.ts` 921 lines, `csharp.xmldoc.ts` 510), `heuristics/dom.ts`, `archetype.ts`, `symbolExtraction.ts`,
  `dependencies.ts`, `discovery.ts`, `jsDoc.ts`, `gitUtils.ts`.
- `packages/engine/src/languages/` 12 files, 1,285 lines, from 2026-01-29 ("LanguageSyntax interface"), untouched.
- `scripts/slopcop/`, `scripts/doc-tools/` from October and November 2025, near untouched. `scripts/live-docs/*.ts` heavily cut
  (lint.ts lost 242 lines, generate.ts 126, run-all.ts 171), `scripts/safe-to-commit.mjs` lost 186, `scripts/verify.mjs` 158.
- `tests/e2e/` 13 Membrane Map Playwright specs from 2026-03-30/31, lightly edited.
- `tests/integration/fixtures/` 61 files byte-identical (blazor-telemetry, csharp-advanced-symbols, csharp-reflection,
  powershell-compendium, queue-worker, razor-appsettings, slopcop-assets, slopcop-symbols, spa-runtime-config, webforms-appsettings).
- `tests/integration/programs/` 164 files moved, none edited (the sample programs and the Rosetta programs in eight languages, from
  2025-11-01 and 2026-01-14/16); 114 new (the estate, oracle expectations).
- `AI-Agent-Workspace/Notes/` 10 files, 5,003 lines, 506 KB, byte-identical: the Copilot era's own censuses and design notes.
- `README.md` 210 of 215 lines predate the return. `SECURITY.md` about half. `.mdmd/layer-1/guides/` four guides, about two thirds old.
  `.mdmd/layer-3/membrane-map.mdmd.md` 207 of 242 lines old; `slopcop.mdmd.md` all old; `live-documentation-explorer.mdmd.md` half old.
- `.mdmd/layer-4/` 301 generated docs existed before (their authored Purpose and Notes sections were written in the Copilot era); 292 are new.
- Configuration: `.devcontainer/`, `.github/workflows/` (ci, codeql, npm-audit, pages), `dependabot.yml`, `eslint.config.js`, `.prettierrc`,
  `slopcop.config.json`, `symbol-coverage.ignore.json`, `.vscode/settings.json`, `packages/cli/` (from 2025-12-15, "pre-publish prep").

## What the owner has said since returning that bears on survivors

- The Local Map (file-scale view from December 2025) is "almost certainly the most polished visualization"; it "still has a fair bit of
  hard-earned design intuition and style to teach us" and is the teacher for the Membrane Map (2026-09-28, 2026-09-29).
- The Membrane Map "is perhaps the most versatile/capable"; the force graph "the most performant and absolutely most useful by far".
- The Playwright suite: "I didn't feel that the UI had been fully understood/worked-out enough to make totally useful playwright tests."
- Humans are the audience now, not agents; the README still speaks the older language ("AI-Ready", agent-steering files).
- The chat archive stays "until modernization effort complete"; before deleting a file, read the record of why it was written.
- Ideas without a home are in `AI-Agent-Workspace/Memory/ideas.md`; the decisions log is `.mdmd/layer-3/architectural-decisions.mdmd.md`.

## What I need back from you

For your group of survivors, as a final message to me (not a file):

1. Why each was written: the day it arrived, what the owner asked for that day, in their words, verbatim, with the transcript path and line number.
2. What in it is true today and lives nowhere else (not in the vision, Memory files, decisions log, or current layer-3 docs). Be specific:
   name the idea, rule, measurement, design or code, and cite the file and line.
3. What in it is false or stale today, and whether anything still depends on it (imports, tests, scripts, links).
4. Good before-and-after questions it raises: ones whose answer would change what is built, kept or retired next.
5. Surprises, and anything that contradicts AGENTS.md or the Memory files.

Every claim carries a source: an absolute or repository-relative path and a line number. Quote the owner verbatim with the date.
Verify line numbers with `grep -n` or `sed -n` before you report them; I will check them. Depth where the story turns beats even coverage.
Say plainly what you did not reach.
