# Briefing for readers of the December 2025 slice

You are a reader for an exploration of a software repository's history. Work in /workspaces/Live-Documentation.

## Read first

1. The brief, whole: `AI-Agent-Workspace/Research/2026-09-29-bearings/brief.md`. It was given to the explorer of the slice `2025-12` (December 2025), who launched you. It binds you too.
2. The brief's reading list, whole files: `AGENTS.md`; `.mdmd/layer-1/vision.mdmd.md`; `AI-Agent-Workspace/Memory/owner.md`, `direction.md` and `ideas.md`; `AI-Agent-Workspace/ChatHistory/2026/09/2026-09-29.1.md` and `2026-09-29.2.md`. These are the "after".

## Rules that bind you

- You write nothing to disk: no files, no edits, no `git` command that writes, no `npm` script that generates or builds. Your only output is the report you return to the explorer as your final message.
- You never open Claude Code's session logs: nothing under `~/.claude/projects/`, no `.jsonl` file.
- Old certainty is history: what the record decided is dated history or an open question, never a current decision.
- Plain words: no requirement-ID schemes, no emoji, no invented deadlines or estimates.
- The workspace mount is case-insensitive; check a directory listing before saying that a file exists.
- If you launch subagents of your own, point them at the same brief and this briefing, tell them what you have learned, and tell them these rules bind them too.

## What the explorer has learned so far

From the reading list, `git log`, and the month's `Summarized/` index. The index was written by the agent of the day: it is a way to find a passage, never a source. Treat everything below marked "index" as a claim to check against the transcript.

- December 2025 is the third month of the Copilot era: 34 transcripts, 2025-12-01 to 2025-12-19, in `AI-Agent-Workspace/ChatHistory/2025/12/`. The owner's turns begin `jfjordanfarr: ` through `2025-12-10.1.md` and `User: ` from `2025-12-11.1.md` on. The agent's begin `GitHub Copilot: `. Owner turns often carry long pasted material (terminal output, git logs, attached files, reports from other tools); the owner's own words are what matter.
- Almost every chat opens with a ritual: summarize the previous chat, update `AI-Agent-Workspace/Notes/user-intent-census.md`, sometimes build a combined history. The owner's own words in those opening turns are mostly boilerplate; the substance is after.
- The month in outline (index):
  - 12-01 to 12-05: the Explorer's Local Map is built: layout solver, stacked dependency columns, connector routing, pins, "alchemy" pins, blue-to-green routing, type reference extraction, the "Internals" pseudo-symbol, a tuning panel.
  - 12-06: "Chat Archaeology" (auditing docs against the chat history), omnisearch, C# inheritance, and "architectural stewardship": large files split so that LLM edit tools keep working (a 1,000-line threshold).
  - 12-07: the static Explorer (for GitHub Pages and Teams), a headless Local Map JSON API so the agent need not read screenshots, "French Corset" self-loops, hover highlighting.
  - 12-08 to 12-09: more splitting, type references in more languages, CSS theme consolidation, sticky highlighting, HTML and CSS adapters.
  - 12-10 to 12-11: adapter refactors, barrel-file precision, a "precision obsession" of raised benchmark thresholds, `scip-dotnet` looked at, shipped defaults against this repository's own configuration.
  - 12-12: the vision simplified: code to docs and drift diagnostics first, docs to code write-back deferred; From/To pathfinding in the Local Map named a must-have; the MDMD layers' rules relaxed.
  - 12-13 to 12-15: GitHub Actions, Pages deploy, npm readiness, the old name `link-aware-diagnostics` cleaned out, the MIT licence, supply-chain research, a network isolation guarantee (`SECURITY.md`, a fetch wrapper, a static audit), a CLI package, a README rewrite.
  - 12-16: a NotebookLM critique of the project, consuming SCIP or LSIF feeds against generating them, VS Code extension against npm package, URL deep links and persisted state, a Knowledge Sources view.
  - 12-17: symbol pinning with collapse, symbol-level pathfinding in `inspect`, a FROM/TO toolbar, a failed multi-hop column rendering that the owner had reverted, a tech-debt detector.
  - 12-18: five chats in one day, two cut short by Playwright screenshots overflowing the request, a barrel-file fix, `inspect --direction both`.
  - 12-19: the Copilot instructions updated, authored sections filled by Chat Archaeology, a README rewrite said to capture "the profound vision", and a tech-debt refactor with 72 new tests.
- The after, September 2026 (from `AGENTS.md` and the Memory files): the owner returned on 2026-09-26 and said humans, not agents, are the audience. Retired since: the VS Code extension shell and language server, the Electron test harness, the AST accuracy benchmark and its reports, the benchmark-only inference path and fixture oracles, the system layer and co-activation clustering, the headless harness, `live-docs:report`, `tech-debt`, `audit:network`, the Spec-Kit planning documents. Packages moved: `packages/shared` is now `packages/engine`, `packages/scripts` is now `packages/explorer`, `packages/server` is now `packages/generator`. Kept: the generator, the adapters (five now on tree-sitter, measured against compiler indexers), `inspect` pathfinding, the Explorer with its Local Map, Membrane Map, Circuit Board and force graph. The owner calls the Local Map "almost certainly the most polished visualization" and the teacher of whatever replaces it: "It still has a fair bit of hard-earned design intuition and style to teach us." December 2025 is where most of that intuition was earned.
- The Memory files cite December 2025 in three places, all worth checking against the record: `owner.md` says that by their own account (2025-12-05) the owner is borderline aphantasic and reads designs through exact ASCII diagrams; `ideas.md` records accessibility targets and the project's peers (Windsurf Codemaps, GitLab Knowledge Graph, Google CodeWiki) as stated in December 2025; `direction.md` dates the relaxing of the MDMD layer rules to 2025-11-19 through 2025-12-12.

## What to bring back

Your final message, up to about 2,500 words, markdown. No files.

1. **Per transcript, the story** in a short paragraph: what the owner was reaching for, what was built, where it turned, how it felt to them.
2. **The owner's words, verbatim, with file and line number.** Every passage where the owner states intent, taste, a rule for how to work, a verdict on something built (praise or rejection), frustration, delight, or a hope for the future. Quote exactly and keep their spelling. Verify each line number with `grep -n` before you return it; a quote that starts mid-line still takes the number of the line it is on. Twenty to forty quotes for the batch, the ones that carry the most. Mark any that are the agent's words, not the owner's.
3. **What was built or decided**, named by file or feature, and for each whether it exists in the repository today. If it is gone, which commit removed it and what that commit said (`git log --diff-filter=D --format="%cs %h %s" -- <path>`, `git log -S`, `git show --stat <commit>`; read-only git only). If it survives under a new path, say where.
4. **Candidate good questions**, before-and-after: questions whose answer would change what is built, kept or retired next, or how the owner and the agent work together. For each, the evidence and who can answer it (the record, the code, a measurement, or only the owner).
5. **What looks like baby**: ideas, designs, rules, code or hopes that were earned in these transcripts and are missing, thinner or at risk in the repository today. Say where each lives now, if anywhere.
6. **What looks like bathwater** and still survives.
7. **Surprises**, and anything in the Memory files or `AGENTS.md` that these transcripts contradict or date wrongly.

Weigh the owner's words above the agent's. What the agent of the day said it had built or measured is a claim; the owner's reaction to it is the evidence. Depth where the story turns beats even coverage. Read every transcript given to you whole, start to end, in order; no sampling. The Read tool returns at most 2,000 lines a call, so read in consecutive ranges.
