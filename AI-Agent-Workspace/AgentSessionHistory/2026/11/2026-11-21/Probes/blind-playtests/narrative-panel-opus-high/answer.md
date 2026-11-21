The project has 1,453 commits (steps 0 to 1452), from 16 Oct 2025 to 21 Nov 2026. It went through two working periods with a six-month gap in between. Most of the commits are in the second period.

**How I got the evidence:** "the card" means the commit card at the top left of the map, which shows the commit's message, date and step number and what it changed. "The footer" means the file and reference counts at the bottom left. "Details" means the window that opens from the card's "…" button. I also used the history's commit search (the magnifier next to the date) to find renames and removals. I only looked at about 30 of the 1,453 steps, so between those points I'm going by commit messages and the change in counts.

**Period 1: start and first build-out (16 Oct – Nov 2025)**
- **Start:** step 0, 16 Oct 2025, "initial commit – everything before speckit.implement run". The card said "7 files and 2 wires", and the footer showed 7 files and 2 references.
- **First big addition:** step 1, the same day, "first run of spec-kit; implementation up to T027". Details showed 34 files created and 27 wires added (41 files in total). The labels on the map were config files plus maintenance.ts, fileMaintenance.ts, changeQueue.ts and runTests.ts.
- **Diagnostics work:** step 22, 22 Oct 2025, "complete US3 triage surfaces". The footer showed 120 files, and the labels were diagnostics files such as publishDocDiagnostics.ts, diagnosticsTree.ts and exportDiagnostics.ts.
- **Growth:** step 54, 2 Nov 2025, footer showed 351 files ("add shared documentation link enforcement tooling"). Step 82, 17 Nov, footer showed 483 files and 1,528 references ("docs: authored sections for all Live Documentation", 142 document links).
- **Rename:** step 100, 22 Nov 2025. The card said "internal package rename transition prefix to `@live-documentation/`" and "28 files, 181 wires" changed, and the footer showed 553 files.

**Period 2: explorer work and cleanup (Dec 2025 – 2 Apr 2026)**
- **Explorer features:** step 176, 19 Dec 2025, "multi-hop path mode". The footer showed 643 files and 3,121 references. Labels included render.ts, connections.ts and controller.ts.
- **Peak before cleanup:** step 215, 18 Jan 2026, footer showed 676 files.
- **Removals (search results):**
  - 15 Dec 2025: unused zod removed.
  - 15 Jan 2026: unused dependencies and GraphStore removed.
  - 27 Jan 2026: self-similarity benchmark mode removed.
  - 30 Jan 2026: rename stripCommentsAndStrings → stripComments.
  - 16–17 Feb 2026: dead types, an orphaned rules/ module, and LLM and telemetry code removed.
- **Biggest cut of this period:** step 242, 18 Feb 2026, "Remove diagnostics subsystem — 38 source files, 7,328 lines". The card showed 40 files changed and the footer dropped to 631 files.
- **Membrane map:** step 266, 31 Mar 2026, with labels membrane.css and membraneView/aggregation.ts. The footer showed 677 files.
- **Last commit of the period:** step 267, 2 Apr 2026, "fix(membrane-map)…".

**The gap (2 Apr – 27 Sep 2026)**
- On the timeline, the marks stop after April and start again in September.
- Searching "2026-04" found only that one 2 Apr commit. "2026-05" and "2026-08" found no commits.
- The next step, 268, is dated 27 Sep 2026: "replace Copilot-era steering with AGENTS.md and a new vision".

**Period 3: reset and restructure (27–28 Sep 2026)**
- **Largest removal in the whole history:** step 273, 27 Sep, "retire the inference path, fixture oracles, system layer, and the tools that graded themselves". Details listed 154 files deleted (from packages/server/src/features/knowledge, live-docs/system and shared/src/inference) and 593 wires removed. The footer went from 677 files at step 268 to 502 here.
- **VS Code extension removed:** step 274, "remove the VS Code extension shell and language server". Details listed 6 deleted files from packages/extension and packages/server, leaving 496 files.
- **Renames:**
  - Step 275, 27 Sep: packages/server → packages/generator. The card said "2 directories renamed whole", and the footer showed 494 files.
  - Step 295, 28 Sep: packages/shared → packages/engine. The card said "153 files… 10 directories renamed whole", and the footer showed 609 files.
  - Same day, per search: packages/scripts → packages/explorer.
- **Another removal:** 29 Sep (search), a button that called the retired server was removed.

**Period 4: the busiest stretch (Oct – 21 Nov 2026)**
About 1,180 of the 1,453 commits fall in these eight weeks, and the pace kept rising:

| Step | Date | Files (footer) | What the map showed |
|---|---|---|---|
| 326 | 29 Sep | 629 | World Map labels (worldMap/controller.ts, world-map.spec.ts) |
| 423 | 3 Oct | 651 | Local Map branches (branch-renderer.ts, card-factory.ts) |
| 501 | 10 Oct | 696 | |
| 582 | 18 Oct | 852 | |
| 643 | 24 Oct | 877 | |
| 695 | 2 Nov | 914 | history-panel.spec.ts, history/navigation.ts |
| 754 | 8 Nov | 947 | |
| 859 | 14 Nov | 965 | |
| 992 | 18 Nov | 1,037 | |
| 1086 | 19 Nov | 1,048 | |
| 1452 | 21 Nov | 1,134 files, 7,260 references | |

- **Pace:** about 590 steps came between 14 and 21 Nov, and about 366 in the last three days alone.
- **Docs move:** step 992, 18 Nov, the agent workspace's history was moved into one directory per dev day ("renames only"), changing 343 document links.
- **Late removals (search):** 18–19 Nov, the marble pattern and the builders' merged worktrees were removed.
- **Latest code work:** step 1444, 20 Nov, which highlighted history-workers.test.ts and live-docs/history.ts.
- **Many recent commits are record-keeping:** many of these commits only record sessions, and their card says "This commit changed nothing the docs could see" (for example steps 501, 582, 754 and 859).

I left the history control at step 22 (22 Oct 2025). I didn't copy anything to the clipboard.
