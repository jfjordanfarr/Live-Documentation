# For readers of the chat record working on the Explorer client (2026-09-29)

You are a reader working for a reader who works for the explorer of the slice `what-survives`.
The repository is /workspaces/Live-Documentation. You work READ-ONLY.

## Read first, whole, in this order

1. `/workspaces/Live-Documentation/AI-Agent-Workspace/Research/2026-09-29-bearings/brief.md` (the brief; its rules bind you)
2. `/tmp/claude-1000/-workspaces-Live-Documentation/938ec442-01ad-44ad-bd62-ac7e87a8139d/scratchpad/context-for-readers.md`
3. This file.
4. The brief's reading list: `AGENTS.md`; `.mdmd/layer-1/vision.mdmd.md`; `AI-Agent-Workspace/Memory/owner.md`, `direction.md`, `ideas.md`
   (direction.md has a very wide table: read lines 23 to 52 with
   `sed -n '23,52p' AI-Agent-Workspace/Memory/direction.md | sed 's/  */ /g'`);
   `AI-Agent-Workspace/ChatHistory/2026/09/2026-09-29.1.md` and `2026-09-29.2.md`.

## Rules (they bind you)

- You write NOTHING in the repository. No file edits, no `git` command that writes, no `npm` script of any kind that generates or builds
  (`npm run build`, `live-docs:generate`, `live-docs:visualize`, tests: all forbidden). Read-only commands are fine
  (`git log`, `git show`, `git blame`, `grep`, `wc`, `sed -n`, `awk`). Your only output is your final report, returned to me.
  Do not write a report file anywhere.
- Never open Claude Code's session logs: nothing under `~/.claude/projects/`, no `.jsonl` file.
- Old certainty is history. What the record decided is dated history or an open question, never a current decision.
- Plain words. No requirement-ID schemes, no emoji, no invented deadlines or estimates.
- Weigh the owner's words above the agent's. What the agent of the day said it built or measured is a claim; the owner's reaction is the evidence.
- In transcripts up to 2025-12-10 the owner's turns begin `jfjordanfarr: `. From 2025-12-11 on (and all of 2026 up to April) they begin `User: `.
  The agent's turns begin `GitHub Copilot: `. The `Summarized/` folder beside each month is an index written by the agent of the day:
  use it to find a passage, never as a source.
- Every quotation carries the transcript's path and the line number where the quoted words are. VERIFY each line number with
  `sed -n 'Np' file` or `grep -n` before you report it; I will check them and a wrong number costs more than a missing quote.
- Quote the owner VERBATIM, typos and all. Do not tidy or paraphrase inside quotation marks. Long owner turns sit on one very long line:
  quote the sentence and give that line's number.

## What I am working on

My group of survivors is the Explorer's browser client as the GitHub Copilot era left it (October 2025 to April 2026), about 20,000 lines under
`packages/explorer/src/client/` (it lived under `packages/shared/src/live-docs/visualizer/` or `packages/scripts/...` before September 2026;
the transcripts use the old paths and names such as "visualizer", "explorer", "Local view", "Local Map", "Circuit view", "Circuit Board",
"Graph view", "force graph", "Knowledge Sources"):

- **The Local Map** (`views/localView/`, `views/connection-geometry.ts`, `views/symbolAnchors.ts`, `views/layoutUtils.ts`, `styles/local.css`,
  `styles/view-shared.css`), built 2025-12-03 to 2025-12-19. A file-scale picture: the focused file's card in the middle, the files it depends
  on in columns on one side and the files that depend on it on the other, symbols as chips or pins on the cards, wires between them.
- **Path mode** (`pathfind.ts`, `styles/pathfind.css`), 2025-12-17 to 2025-12-19: FROM/TO toolbar, multi-hop paths drawn in the Local Map.
- **The Circuit Board** (`views/circuitView/`, `views/squarify.ts`, `styles/circuit.css`), first built November 2025, rewritten 2026-03-18.
- **The force graph** (`views/forceGraphView.ts`, `styles/graph.css`, `panels/tuning.ts`), a 3D force-directed graph.
- **The shell** (`index.ts`, `detailPanel.ts`, `markdown.ts`, `download.ts`, `panels/omnisearch.ts`, `panels/sources-view.ts` = the
  "Knowledge Sources view with health warnings" of 2025-12-16, `persistence/`, `bootstrap/entry-heuristics.ts`, `styles/shell.css`,
  `styles/theme.css`, `styles/sources.css`, and the page template `template.html`).

## Why the owner wants this (their words since returning in September 2026)

- 2026-09-28: "The Local Map is almost certainly the most polished visualization, but the Membrane Map is perhaps the most versatile/capable?
  The most performant and absolutely most useful by far has been the 3D force-directed graph."
- 2026-09-29: "don't get rid of the Local Map yet. It still has a fair bit of hard-earned design intuition and style to teach us." And:
  "the overall visual style and sizing and spacing and coloring shown in the preexisting 'Local Map' should inform a lot of improvements,
  visually and otherwise, to the 'Membrane Map'".
- owner.md says: "Cut, don't boost. 'A master audio producer will prefer to cut frequencies they don't like rather than boost frequencies
  they do like during EQ.' Fade the irrelevant; never highlight the relevant." and "They read designs through exact ASCII diagrams. By their
  own account (2025-12-05) they are borderline aphantasic ... a diagram must be precise down to pin placement."

An agent today can only measure the Membrane Map against the Local Map if the Local Map's design rules can be NAMED, each with the owner's
words behind it. That is the main thing I need: **the design rules the owner asked for or reacted to, in their words, with line numbers.**

## What to bring back from your transcripts

For every passage in your transcripts that bears on the Explorer client (any view, the shell, the page), in the order it happened:

1. **What the owner asked for, verbatim**, with path and line number. Especially anything about: layout (columns, left/right, inputs and
   outputs, order, alignment), cards (what a card shows, header, size, width, padding), pins, ports, chips or symbols on a card and where
   they sit, wires or connectors (routing, curves, trunks, bundling, crossing, colour, thickness, where they attach), hover and click and
   focus behaviour, highlighting, fading or dimming of the unrelated, colours and tokens, fonts and text size, spacing, pan and zoom and
   framing or centring, scroll, performance, accessibility, emoji or icons, ASCII diagrams the owner drew or asked for (say where they are,
   first and last line), screenshots the owner described, and anything they called ugly, wrong, confusing, beautiful or right.
2. **How the owner reacted** to what the agent built (pleased, displeased, corrected), verbatim, with line number. An agent's claim of
   success with no owner reaction is only a claim: say so.
3. **Why each view or feature was written**: the owner's stated reason on the day it arrived.
4. **Rules of working on the UI** the owner set (for example about tests, jsdom, screenshots, pure layout math, headless checks).
5. **Things decided and later reversed** inside your transcripts.
6. Anything the owner said about the force-directed graph, the Circuit Board, path finding between two files, the detail panel, search,
   the Knowledge Sources view, the HTTP server and its endpoints, the static build, the CDN, or sharing a URL.
7. **Surprises**, and anything that contradicts AGENTS.md or the Memory files.

Read your transcripts WHOLE unless I say otherwise; they are long (one line can be several thousand characters), so read in slices with
`sed -n 'A,Bp'` or the Read tool with offset and limit, and do not skip the middle. If you have a tool to launch subagents you may hand a
whole transcript to one, giving it the brief, both context files and these rules.

Return a report of up to about 1,500 words: a dated list of owner quotations with line numbers, each with one line saying what it decided or
reacted to, then what you did not reach. No file. Be exact over being complete.
