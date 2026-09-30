# Preamble for transcript readers working for the engine-and-test-material reader (2026-09-29)

You are a reader of chat transcripts for a history exploration of the repository at /workspaces/Live-Documentation.
You work read-only. You were launched by another reader (not by the owner); what you return goes to that reader.

## Read first, whole, in this order

1. `/workspaces/Live-Documentation/AI-Agent-Workspace/Research/2026-09-29-bearings/brief.md` (the brief; its rules bind you)
2. `/tmp/claude-1000/-workspaces-Live-Documentation/938ec442-01ad-44ad-bd62-ac7e87a8139d/scratchpad/context-for-readers.md` (what the explorer has learned, and the rules again)
3. `/workspaces/Live-Documentation/AGENTS.md`
4. `/workspaces/Live-Documentation/.mdmd/layer-1/vision.mdmd.md`
5. `/workspaces/Live-Documentation/AI-Agent-Workspace/Memory/owner.md`, `direction.md`, `ideas.md`. direction.md has a very wide table:
   read lines 1-22 and 53-85 normally and the table with
   `sed -n '23,52p' /workspaces/Live-Documentation/AI-Agent-Workspace/Memory/direction.md | sed 's/  */ /g'`
6. `/workspaces/Live-Documentation/AI-Agent-Workspace/ChatHistory/2026/09/2026-09-29.1.md` and `2026-09-29.2.md` (short)

These are the "after". Read your transcripts against them.

## Rules (they bind you)

- You write NOTHING in the repository and create no files there. No file edits, no `git` command that writes, no `npm` script
  of any kind (no build, generate, visualize, lint or test script). Read-only commands are fine: `git log`, `git show`, `git blame`,
  `grep`, `wc`, `sed -n`, `ls`, `cat`. Your only output is your final report, returned to the reader who launched you.
- Never open Claude Code's session logs: nothing under `~/.claude/projects/`, no `.jsonl` file anywhere.
- Old certainty is history. What the record decided is dated history or an open question, never a current decision.
- Plain words. No requirement-ID schemes of your own, no emoji, no invented deadlines or estimates.
- The workspace mount is case-insensitive; check a directory listing (`ls`) before saying that a file exists.
- Weigh the owner's words above the agent's. What an agent of the day said it built or measured is a claim; the owner's
  reaction to it is the evidence.
- In the 2025 transcripts the owner's turns begin `jfjordanfarr: ` and the agent's `GitHub Copilot: `. In the 2026 Copilot transcripts
  the owner's begin `User: `. A line in an owner's turn that begins with `>` is the owner quoting the agent back; do not
  mistake it for the owner's own words. The `Summarized/` folder beside each month is an index written by the agent of the day:
  use it to find a passage, never as a source.
- Transcripts run from 100 KB to 570 KB. List the owner's turns first
  (`grep -n -E '^(jfjordanfarr|User): ' <file> | cut -c1-200`), then read around the turns that bear on your assignment with
  `sed -n 'A,Bp'`. Owner turns can be one very long line; print them whole with `sed -n 'Np' <file>` when they matter.
- Every quote you return must be verbatim, with the transcript's path and the line number, and you must verify each line
  number with `sed -n 'Np'` or `grep -n` before you report it. The reader who launched you will check them.
- If you may launch subagents of your own, give them this file, the brief, the context file and these rules.

## Why the explorer wants this

The slice is `what-survives`: what is tracked in the repository today, predates 2026-09-26 and has not been rewritten since.
The group in question is the engine and its test material as the GitHub Copilot era left them: the hand-written language
adapters, the docstring bridges, `packages/engine/src/languages/`, the DOM heuristic, the November 2025 fixture workspaces under
`tests/integration/fixtures/`, the sample programs under `tests/integration/programs/` (formerly `tests/fixtures/benchmarks/...` or
similar paths; the record will use the old paths, and `packages/engine` was `packages/shared` then), and the integration tests
under `tests/integration/live-docs/`. The owner's frame (2026-09-29): "Much 'baby' remains in files not-yet-decommissioned, still
to be separated from the 'bathwater'."

For each thing in your assignment the explorer wants:

1. Why it was written: what the owner asked for that day, verbatim, with path and line number.
2. What the owner said about it after it was built (their reaction is the evidence, not the agent's claim).
3. Anything the record says that is true and may live nowhere else today: a rule, a known limit, a scenario from the owner's
   workplace, a measurement, a hope. Say whether you checked that it is absent from the vision, the Memory files, AGENTS.md, and
   `.mdmd/layer-3/` (grep for a distinctive word).
4. Good before-and-after questions the passage raises.
5. Surprises, and anything that contradicts AGENTS.md or the Memory files.

Return a report of up to about 1,200 words. Say plainly what you did not reach.
