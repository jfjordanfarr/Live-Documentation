# The brief for the explorations of 2026-09-29

_The one brief given to every explorer of the chat record on 2026-09-29, and by them to every subagent they launched. Each explorer was told only which slice was theirs. The brief is kept as it was given; it decides nothing._

You are exploring the history of a software repository for its owner, and you have room to follow what you find. Work in /workspaces/Live-Documentation.

## Why this exploration exists

The repository is Live Documentation: it turns a folder of source files into a map a person can look at. Its one human, the owner, built it with GitHub Copilot from October 2025 to April 2026, stopped, and came back on 2026-09-26 with Claude Code. Both eras are recorded as chat transcripts inside the repository. The owner wants bearings on both eras before the next stretch of development. In their words, 2026-09-29:

> Reconstructing those chat logs will give us a wealth of context with which, after you come back having completed the task, will inspire some excellent subagent explorations that are enriched with historical context, such that we will be able to get a really wonderful set of bearings on the copilot era and the claude code era.

> You're in a really exciting workspace doing really exciting stuff. I just don't think you know how much yet. Much "baby" remains in files not-yet-decommissioned, still to be separated from the "bathwater".

> Having reconstructed the chats, questions about before-and-after should sharpen in a way that subagents could answer.

Asked to name a file or an idea that would aim the search, they declined on purpose: "Naming none and letting the subagent get inspired to itself spawn subagents is better than anything I can offer". Asked which question mattered most: "Explore and find good questions".

So nobody has told you what to find. Your job is to find what is worth asking and what is worth keeping.

## Read first, whole files

1. `AGENTS.md`
2. `.mdmd/layer-1/vision.mdmd.md`
3. `AI-Agent-Workspace/Memory/owner.md`, `direction.md` and `ideas.md` (direction.md holds a very wide table; read all of it)
4. `AI-Agent-Workspace/ChatHistory/2026/09/2026-09-29.1.md` and `2026-09-29.2.md` (short)

These are the "after": where the project stands and what the owner has said since returning. Read your slice against them.

## The slices

Seven explorers, each told which of these is theirs. The name is the name of the report file.

| Name              | The slice                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `2025-10`         | October 2025: `AI-Agent-Workspace/ChatHistory/2025/10/`, 15 transcripts, 4.4 MB. The first month |
| `2025-11`         | November 2025: `AI-Agent-Workspace/ChatHistory/2025/11/`, 22 transcripts, 5.2 MB                 |
| `2025-12`         | December 2025: `AI-Agent-Workspace/ChatHistory/2025/12/`, 34 transcripts, 4.2 MB                 |
| `2026-01`         | January 2026: `AI-Agent-Workspace/ChatHistory/2026/01/`, 17 transcripts, 3.6 MB                  |
| `2026-02-to-04`   | February to April 2026: `2026/02/`, `03/` and `04/`, 23 transcripts, 4.8 MB. The last months     |
| `claude-code-era` | September 2026, the Claude Code sessions and what they changed                                   |
| `what-survives`   | Not the record but the repository: what is tracked today and predates 2026-09-26                 |

**`claude-code-era`.** Read `AI-Agent-Workspace/ChatHistory/2026/09/2026-09-26.1.md` and `2026-09-27.1.md` whole (355 KB together), then the commits since 2026-09-26 (`git log --since=2026-09-26 --stat`), the records under `AI-Agent-Workspace/Probes/` and `AI-Agent-Workspace/Research/`, and the decisions log `.mdmd/layer-3/architectural-decisions.mdmd.md`. Your "before" is the Copilot era: `AI-Agent-Workspace/Notes/` holds that era's own censuses of the owner's intent, and the transcripts from October 2025 to April 2026 are there to check them against. Look hard at what September deleted, what reason each commit gave, and whether the reason holds against the record.

**`what-survives`.** Everything tracked today that predates 2026-09-26 and has not been rewritten since: code, tests, scripts, configuration, authored docs, `AI-Agent-Workspace/Notes/`, the README. `git log --diff-filter=A --format="%cs %h %s" -- <path>` says when a file arrived; the chat record of that day says why. For each group of survivors, find why it was written and what in it is true and lives nowhere else.

## How to work

- You may launch your own subagents, and they may launch theirs, if you have the tool for it. A transcript runs from 100 KB to 570 KB, so you cannot hold your slice in your own context: hand whole transcripts to readers, tell each what you have learned so far and why the owner wants this, and ask for the owner's words verbatim with line numbers. Give every subagent the reading list above and the rules below. If you cannot launch subagents, read in slices and say in your report what you did not reach.
- Depth where the story turns beats even coverage.
- In the 2025 transcripts the owner's turns begin `jfjordanfarr: ` and the agent's `GitHub Copilot: `. In the 2026 Copilot transcripts the owner's begin `User: `. The `Summarized/` folder beside each month is an index written by the agent of the day: use it to find a passage, never as a source.
- Follow a thread wherever it goes: other months, the code, `git log` and `git show`, the authored docs under `.mdmd/`, `AI-Agent-Workspace/Notes/`. When the record speaks of a file, find out whether it still exists, and if it does not, which commit removed it and what that commit said.
- Weigh the owner's words above the agent's. What an agent of the day said it had built or measured is a claim; the owner's reaction to it is the evidence.

## What to bring back

Write one file, `AI-Agent-Workspace/Research/2026-09-29-bearings/<the name of your slice>.md`, for a reader who has not seen your slice. In it:

1. **The story of the slice**, in about a page: what the owner was reaching for, what was built, where it turned, how it felt to them.
2. **Good questions.** The before-and-after questions your slice raises, best first, ten at most. A good question is one whose answer would change what is built, kept or retired next, or how the owner and the agent work together. For each: why it matters, what evidence raised it, and who can answer it (the record, the code, a measurement, or only the owner).
3. **What looks like baby.** Ideas, designs, rules, code or hopes that were earned in your slice and are missing, thinner or at risk in the repository today. Say where each lives now, if anywhere.
4. **What looks like bathwater** and still survives.
5. **Surprises**, and anything in the Memory files or `AGENTS.md` that your slice contradicts.

Every claim carries its source: a markdown link to the file, relative to your report, with the line number in words, for example `[2025-12-05.md](../../ChatHistory/2025/12/2025-12-05.md), line 1234`. Quote the owner verbatim, with the date. Links must resolve; the repository audits them.

Then return a final message of at most 400 words: your three best questions, your three best finds, and what you did not reach.

## Rules

- Write only your own report file. Change nothing else: no edits, no `git` command that writes, no `npm` script that generates or builds.
- Never open Claude Code's session logs (anything under `~/.claude/projects/`, the `.jsonl` files). The transcripts under `AI-Agent-Workspace/ChatHistory/2026/09/` are the record of those sessions.
- Old certainty is history. Write what the record decided as dated history or as an open question, never as a current decision.
- Plain words: no requirement-ID schemes, no emoji, no invented deadlines or estimates.
- The workspace mount is case-insensitive; check a directory listing before saying that a file exists.
