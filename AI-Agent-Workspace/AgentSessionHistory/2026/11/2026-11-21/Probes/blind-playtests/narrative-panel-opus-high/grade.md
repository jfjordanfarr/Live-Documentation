# Grading the explorer's account against the narrative playtest key

## A. Grades for the picture and words claims

Not graded (marked "no"): C3, C7, C8, C10, C12, C14, C16, C26, C27, C34, C36, C39.

| Claim | Mark | Quoted words from the account |
| --- | --- | --- |
| C1 | partly restated | "step 0, 16 Oct 2025, "initial commit – everything before speckit.implement run". The card said "7 files and 2 wires", and the footer showed 7 files and 2 references." (The count and timing are right, but it never says what the seven files were or that there was no source.) |
| C2 | partly restated | "step 1, the same day, "first run of spec-kit; implementation up to T027". Details showed 34 files created and 27 wires added (41 files in total)." (It finds the first build at the right moment, but not that it was an extension, a language server and a shared library with SQLite.) |
| C4 | absent | none |
| C5 | absent | none (the LLM code appears only at its removal in February) |
| C6 | absent | none |
| C9 | absent | none (step 82 on 17 Nov, "authored sections", is a different event) |
| C11 | absent | none |
| C13 | absent | none |
| C15 | partly restated | "Period 2: explorer work and cleanup (Dec 2025 – 2 Apr 2026)"; "Explorer features: step 176, 19 Dec 2025, "multi-hop path mode"… Labels included render.ts, connections.ts and controller.ts." (December Explorer work is there; the Local Map, the static site and the growth of `packages/scripts` are not.) |
| C17 | absent | none |
| C18 | absent | none |
| C19 | partly restated | "15 Jan 2026: unused dependencies and GraphStore removed." (Right change, near the right date; it misses the 58-file cut on 01-12, the SCIP/LSIF removal, `data/` vanishing, and the meaning.) |
| C20 | absent | none |
| C21 | absent | none |
| C22 | restated | "16–17 Feb 2026: dead types, an orphaned rules/ module, and LLM and telemetry code removed."; "step 242, 18 Feb 2026, "Remove diagnostics subsystem — 38 source files, 7,328 lines". The card showed 40 files changed" |
| C23 | absent | none |
| C24 | partly restated | "Membrane map: step 266, 31 Mar 2026, with labels membrane.css and membraneView/aggregation.ts." (It shows the view exists in late March, but not when it was built or that browser tests arrived.) |
| C25 | restated | "The gap (2 Apr – 27 Sep 2026)… the marks stop after April and start again in September"; "step 267, 2 Apr 2026, "fix(membrane-map)…"" |
| C28 | restated | "Largest removal in the whole history: step 273, 27 Sep… 154 files deleted… The footer went from 677 files at step 268 to 502 here."; "step 274, "remove the VS Code extension shell and language server". Details listed 6 deleted files… leaving 496 files." |
| C29 | absent | none |
| C30 | absent | none |
| C31 | restated | "The next step, 268, is dated 27 Sep 2026: "replace Copilot-era steering with AGENTS.md and a new vision"." |
| C32 | partly restated | "326 \| 29 Sep \| 629 \| World Map labels (worldMap/controller.ts, world-map.spec.ts)" (The World Map files are seen a day later, but it does not say they arrived as a new view.) |
| C33 | absent | none |
| C35 | partly restated | "695 \| 2 Nov \| 914 \| history-panel.spec.ts, history/navigation.ts" (History files are seen two weeks after they arrived, with no statement that they arrived.) |
| C37 | partly restated | "Period 4: the busiest stretch… About 1,180 of the 1,453 commits fall in these eight weeks"; "many of these commits only record sessions, and their card says "This commit changed nothing the docs could see"" (The record-only commits and the volume are there; the work gathering on the Explorer and the browser tests is not.) |
| C38 | absent | none |

## B. What the account says that the narrative contradicts

- **The account:** "Biggest cut of this period: step 242, 18 Feb 2026, "Remove diagnostics subsystem — 38 source files…" The card showed 40 files changed" (the period is Dec 2025 – 2 Apr 2026).
  **The narrative:** "Commit `0d89e857` deleted the SQLite graph store, the ripple analyzer, the `graph:*` tools and most of the language server: 200 files and 68 thousand lines" on 2026-01-12. The key says that step "removes 58 drawn files", which is more than the 18 Feb cut.

Nothing else in the account conflicts with the narrative.

## C. Other statements, correct as far as the narrative tells

- `packages/server` became `packages/generator` on 27 Sep, and `packages/shared` became `packages/engine` and `packages/scripts` became `packages/explorer` on 28 Sep (narrative: `cad63bdd`, `690f5d27`, `d23a6f90`).
- The internal packages were renamed to the `@live-documentation/` prefix on 22 Nov 2025 (narrative: "The npm scope became `@live-documentation/*` that night", 11-21).
- The October 2025 work was on diagnostics (step 22, "complete US3 triage surfaces"), which fits the Link-Aware Diagnostics period.
- Dead types and an orphaned rules module were removed in mid-February 2026 (narrative: the dead diagnostics-era types and the rules module that carried MDMD into the product).
- A button that called the retired server was removed on 29 Sep (narrative: the client's calls to the removed server's endpoints were still there in September).
- The session archive was moved into one directory per dev day on 18 Nov 2026.
- The marble pattern was removed on 18–19 Nov 2026.
- History-worker work landed on 20 Nov 2026.

## D. What the pictures did and did not tell

What the account says about its own evidence:
- "'the card' means the commit card at the top left of the map, which shows the commit's message, date and step number and what it changed. 'The footer' means the file and reference counts at the bottom left."
- "I also used the history's commit search (the magnifier next to the date) to find renames and removals."
- "I only looked at about 30 of the 1,453 steps, so between those points I'm going by commit messages and the change in counts."
- "On the timeline, the marks stop after April and start again in September."
- "their card says "This commit changed nothing the docs could see""

The account caught changes that cards and counts make loud: the large deletions of February and September 2026, the six-month gap, package renames, and the many commits that touched only the record. It missed nearly every arrival, because it sampled about 30 steps and searched for removals. Gone are the extension, server and SQLite at the start, the LLM path, the benchmark fixtures, the language adapters, the Explorer's birth, CI and the CLI, the Rosetta samples, tree-sitter and the compiler answers, and the October retirement of two views. It also says nothing about which directories drew the work in each period.

## E. Counts

| | Restated | Partly restated | Absent | Contradicted | Graded | Score |
| --- | --- | --- | --- | --- | --- | --- |
| Picture | 3 | 8 | 12 | 0 | 23 | 7 / 23 = 0.30 |
| Words | 1 | 0 | 3 | 0 | 4 | 1 / 4 = 0.25 |
| Together | 4 | 8 | 15 | 0 | 27 | 8 / 27 = 0.30 |
