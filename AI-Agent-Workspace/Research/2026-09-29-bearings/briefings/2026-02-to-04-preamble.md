# Shared preamble for readers of the 2026-02-to-04 slice

You are a reader working for the explorer of the slice `2026-02-to-04` (February to April 2026, the last months of the GitHub Copilot era) of the repository at /workspaces/Live-Documentation.

## Your brief, and its rules bind you too

Read `/workspaces/Live-Documentation/AI-Agent-Workspace/Research/2026-09-29-bearings/brief.md` whole, first. Its rules bind you:

- You write NOTHING to disk. No file edits, no file creation, no `git` command that writes, no `npm` script that generates or builds. Read-only commands only (`git log`, `git show`, `grep`, `ls`, `sed -n`, `cat`). What you found goes only in your final report back to me.
- Never open Claude Code's session logs: nothing under `~/.claude/projects/`, no `.jsonl` files.
- Old certainty is history: report what the record decided as dated history or as an open question.
- Plain words, no requirement-ID schemes of your own, no emoji, no invented deadlines or estimates.
- The workspace mount is case-insensitive: check a directory listing before saying a file exists.
- Weigh the owner's words above the agent's. What the agent of the day said it built or measured is a claim; the owner's reaction is the evidence.
- Do not launch further subagents; do the reading yourself.

Then read the brief's reading list, whole files: `AGENTS.md`, `.mdmd/layer-1/vision.mdmd.md`, `AI-Agent-Workspace/Memory/owner.md`, `direction.md`, `ideas.md`, and `AI-Agent-Workspace/ChatHistory/2026/09/2026-09-29.1.md` and `2026-09-29.2.md`. These are the "after". Read your transcripts against them.

## Transcript format

In these 2026 Copilot transcripts the owner's turns begin `User: ` at the start of a line and the agent's turn begins `GitHub Copilot:`. Most of the bulk is the agent's tool calls and terminal output, which you may read fast; the owner's turns and the agent's prose answers (plans, ASCII diagrams, claims, options offered) are what matter. An index of every owner turn with its line number is already extracted for each transcript at
`/tmp/claude-1000/-workspaces-Live-Documentation/938ec442-01ad-44ad-bd62-ac7e87a8139d/scratchpad/owner-<transcript name>.txt` (for example `owner-2026-03-23.1.txt`). Use it to find your way; it trims code blocks and cuts very long lines, so verify every quote and line number against the raw transcript before you report it. The `Summarized/` folder beside each month is an index written by the agent of the day: use it to find a passage, never as a source.

## What I have learned so far (from reading every owner turn in the slice at headline level)

The slice has three movements.

1. **February: truth and subtraction.** 2026-02-03: the owner catches the agent declaring benchmark failures "expected" by fiat and putting in overrides; "Every mess is our mess"; a devcontainer is built so that SCIP indexers work. 02-15 to 02-18: a JSDoc-on-every-export lint is adopted as a tool to make code "justify its existence" by chat archaeology; the owner decides the product needs no LLM inside it (02-17), the diagnostics subsystem is removed (02-18, 7,328 lines), MDMD is declared a workspace convention and not the product (02-15, 02-23), Spec-Kit is retired (02-23). 02-24 (running on to 03-01): the owner steps back and asks what the product is (a report generator? cards as the universal node? is the server needed?), defends the force graph as the most useful view, adds real use cases (PCI-DSS card data flow at field granularity, Brain Simulator III, a Unity game), and a use-case census is written into `AI-Agent-Workspace/Notes/`.
2. **Early March: static and measured.** The HTTP server is retired for a static site (03-09/10), CI is repaired, a Rosetta parity test lands (03-11), the Circuit Board view gets progressive disclosure (03-17).
3. **Late March to 1 April: the Membrane Map.** Born 03-22 as the unification of Circuit Board (folders) and Local Map (symbol wiring): "as excited about this endeavor as I have been about anything in this project". Built and "playtested" by eye daily from 03-23 to 04-01 with the Local Map as the gold standard; Playwright tests arrive 03-30; it becomes the cold-start default 03-31. On 04-01 an edge-bundling feature is built, judged wrong by eye and reverted, the owner says "I've let this go on autopilot just a little too much", one dimming bug is fixed, and the record stops. The last Copilot-era commit is `ae216cb5` on 2026-04-02. Nothing is committed again until 2026-09-26.

Today (2026-09-29) the owner is back with Claude Code; the Membrane Map is the inside of a thing on the new World Map and is to be "brought to the Local Map's quality in place". So what the owner asked of the Membrane Map and the Local Map in March is a live input, not only history.

Things I already know exist today: `AI-Agent-Workspace/Notes/` (ten files including `user-intent-census.md`, `user-use-case-census.md`, `membrane-map-execution-plan.md`, `product-identity-synthesis.md`, `multi-path-visualization-design.md`, `Project Development Journey.md`); `.mdmd/layer-3/membrane-map.mdmd.md`; `packages/explorer/src/client/views/{circuitView,localView,membraneView,worldMap}`; `tests/e2e/membrane-*.spec.ts`; `eslint-plugin-jsdoc` in `eslint.config.js`; `lz-string` in `packages/explorer/package.json`. Gone: `.github/prompts/`, `packages/server`, `packages/shared`, `packages/scripts`, `packages/extension` (renamed or removed in September 2026).

## What to bring back

A report in plain markdown, returned as your final message (at most about 1,500 words; density over polish), with these parts:

1. **What happened** in your transcripts, in order, and where it turned.
2. **The owner's words, verbatim**, each with transcript file name and line number: the quotes that state a rule, a wish, a taste, a reason, a feeling, a use case or a verdict. Prefer ones not already in `owner.md`, `direction.md`, `ideas.md` or `AGENTS.md`; say when a quote is the origin of something those files state.
3. **Claims and verdicts**: what the agent claimed and how the owner reacted (accepted, disputed, caught out).
4. **Then and now**: for each file, feature, design or idea the record speaks of that matters, whether it exists today (check the listing), and if not, which commit removed it and what that commit said (`git log --diff-filter=D --format="%cs %h %s" -- <path>`, `git log -S`, `git show --stat`). Say where an idea lives today if anywhere (file path).
5. **Candidate baby**: ideas, designs, rules, code or hopes earned here that are missing, thinner or at risk today. **Candidate bathwater** that still survives.
6. **Candidate questions**: before-and-after questions whose answer would change what is built, kept or retired next, or how the owner and agent work together; say who could answer each (the record, the code, a measurement, only the owner).
7. **Contradictions** with `AGENTS.md` or the Memory files, and surprises.
8. **What you did not reach.**

Every claim carries its source: file path and line number. Line numbers must be from the raw transcript, checked.
