# Grading of the account against the narrative playtest key

## A. The claims

| # | Mark | Quoted words |
| --- | --- | --- |
| C1 | partly restated | "First step, 2025-10-16, f7a75fa7: 7 files, 2 references, 1 group. The only label was `update-agent-context.ps1`, a scaffolding script." The count and the scaffolding are right. It does not say the step holds no source, and it misses the feature specification. |
| C2 | restated | "Next step, same day, 6bccf94b: 41 files, 6 groups. A VS Code extension with a backend server appeared at once: … `extension/package.json`, `server/package.json`, … `001_init.sql` … `graphStore.ts`". The shared package is not named, and the SQL schema and graph store are listed without saying they are a database. |
| C4 | absent | none |
| C5 | partly restated | "2025-10-29, 59f78996: … `localOllamaBridge.test.ts`" and "2025-11-09 … `llmIngestionOrchestrator.test.ts`". The files are named, but it never says the product gained a language-model path, and the LLM ingestion is placed two weeks late. |
| C6 | partly restated | "2025-11-09, 86a74a76: … Benchmarks and quality tooling appeared: `ast-accuracy.json`, `rebuild-stability.json`, `self-similarity/ast-accuracy.json`". The benchmark is seen arriving, about ten days late. The expected/inferred pairs in each fixture are not seen. |
| C9 | absent | none. The same commit, 86a74a76, is sampled, but it is described as benchmarks and tooling. The Live Docs generator is never named. |
| C11 | partly restated | "2025-11-14, 6086294a: C-language support and sample projects: … `c.ts`" and "2025-11-20, c5678a94: … PowerShell support: `powershell.ts` … `adapters/index.ts`". Two of the languages are at the right dates. C#, Java, Python, Rust and Ruby are missing, and the one-adapter-per-language pattern is not stated. |
| C13 | absent | none |
| C15 | absent | none |
| C17 | partly restated | "2025-12-19: `ci.yml` (643 files)". CI is seen, about six days late. The configuration file, the security scanning and the CLI package are missing. |
| C18 | absent | none. The account goes from "2025-12-19" to "2026-01-03" without noting the gap. |
| C19 | partly restated | "2026-01-12, 0d89e857: files fell from 671 to 614 and references from 3,483 to 2,375. The central snapshot node was gone … This step removed the snapshot and changed a great deal at once." and "2026-01-13: down to 598 files". The date and the scale of the removal are right. It does not say that the graph store and SQLite went, or that the external index parsers and `data/` went the next day. |
| C20 | absent | none |
| C21 | absent | none. `shared/src/index.ts` is named as labelled on 01-13, but its removal is not reported. |
| C22 | partly restated | "2026-02-20 to 02-23: files dropped from 705 to about 630, so files were removed or merged." A removal is seen at about the right time. It does not say which files went (the LLM code, the diagnostics) or that the extension shrank to one source file. |
| C23 | absent | none |
| C24 | partly restated | "2026-03-29: 662 files. A visual "membrane view" appeared: `membraneView/index.ts`, `membrane.css`". The Membrane Map is right. The browser test suite is placed in October instead (see B). |
| C25 | restated | "Pause (Apr 2 to Sep 27, 2026) … the timeline has no ticks for about six months." and "2026-04-02, ae216cb5: the last step before the pause" |
| C28 | partly restated | "2026-09-29: 628 files and 44 groups, down from 677. Another cleanup". A cleanup after the return is seen, two days late. It does not say that the extension, the benchmark and the reports went, or that the count fell to 496. |
| C29 | absent | none |
| C30 | absent | none |
| C31 | partly restated | "the very next step is **2026-09-27, 29d58b50**. It only touched `settings.json`, and the count was still 677." The right step is identified as changing almost nothing. What the step meant (AGENTS.md and a new vision) is not said. |
| C32 | absent | none |
| C33 | absent | none |
| C35 | contradicted | "2026-11-20, the last few steps: the history feature itself was added: `live-docs/history.ts`, `history/format.ts` …". The account does note "852 on 10-18" but does not tie that jump to the history feature. |
| C37 | partly restated | "Late Sep–Nov 2026: the densest stretch of steps and the largest growth, from 628 to 1,134 files". It also names local-map view files (10-03) and browser tests (10-19). It does not say the Explorer and the browser tests dominate the changes, or that most steps change no drawn file. |
| C38 | absent | none |

**Out of scope (marked no):** C3, C7, C8, C10, C12, C14, C16, C26, C27, C34, C36, C39.

## B. What the account says that the narrative contradicts

1. **When the history feature arrived.**
   - Account: "2026-11-20, the last few steps: the history feature itself was added: `live-docs/history.ts`, `history/format.ts`, `summarizeChange.ts`, `lens.ts`, `regenerate.ts`, `history-workers.test.ts`."
   - Narrative (October 17 to 19): "the history read into a sequence of shapes under one lens and answered headlessly, the update path, and a scrubber in the 3D Local Map … (`7d7a39e6`) … By dawn the wish of December 19 could be used on this repository."
   - The work of November 20 was a speed-up of the existing history: "Workers that live from commit to commit rebuilt the line in 34 minutes".

2. **When the browser tests arrived.**
   - Account: "2026-10-19: browser tests arrived: `playwright.config.ts`, `local-map-branches.spec.ts`, `local-map-presets.spec.ts`."
   - Narrative (March 30 to 31, 2026): "started the Playwright suite with a test meant to fail … By 03-31 there were 29 browser tests".

3. **What February 16 was (weaker).**
   - Account: "2026-02-16: a busy day with many steps: Java support and diagnostics: `heuristics/java.ts`, `tech-debt-detector.ts`". This reads as Java support and diagnostics arriving.
   - Narrative: the Java adapters date from November 2025. February 16 was a deletion pass ("The documentation pass became a deletion engine … fifteen dead domain types from the diagnostics era"), and the diagnostics subsystem was deleted two days later.

## C. The account's other statements that are right as far as the narrative tells

- The `package.json` updates on 2026-01-03, the first step after December 19. These were the Dependabot merges of that day.
- Dev container setup on 2026-02-03. The narrative says "development moved from Windows into a Linux devcontainer" that day.
- `slopcop.config.json` and `safe-to-commit.mjs` present by 2025-11-09. SlopCop and `safe:commit` date from late October.
- New Local Map files on 2026-10-03 (`branches.ts`, `pin-state.test.ts`, `localView/controller.ts`). This matches the Local Map gaining shared pins in early October.
- `history-workers.test.ts` on 2026-11-20. This matches that day's work on history rebuild workers, though not the feature's birth (see B).
- The history runs past the key's end (to 2026-11-21, commit 76f2d8db). This fits the narrative's November 19 rebuild, "the page's history running to the day again".

## D. What the pictures did and did not tell

What the account says about its own limits:

- "I couldn't step through every one of the hundreds of steps with the actions I had, so I sampled about 40 points."
- "**Counts can't tell additions from removals.** When the file count jumps I can see that something happened, but not exactly which files came or went."
- "**Moves and renames were never shown directly.** No step showed a file moving or changing name. Where I call something a reorganisation, I'm inferring it from counts falling and clusters reshaping."
- "**Dates are narrowed, not pinned.** Most changes I place between two sampled steps, not at one exact step."
- "several steps that day showed no labels."

In my words: the account caught changes that show as counts, gaps or a few file names. These were the scaffolding start, the first extension and server step, the six-month pause, the January 12 removal, the arrival of the Membrane view, and a couple of language adapters. It missed nearly every removal's meaning (SQLite, LLM code, diagnostics, the extension, Spec Kit), every move and rename, the births and retirements of the named views (Explorer, World Map, the Circuit Board and Membrane Map retirement), and everything that only commit subjects carry. Its two clear errors come from treating a file being labelled at a sampled step as the moment that file was born.

## E. Counts

| | Restated | Partly restated | Absent | Contradicted | Graded | Score |
| --- | --- | --- | --- | --- | --- | --- |
| Picture | 2 | 10 | 10 | 1 | 23 | 7 / 23 = **0.30** |
| Words | 0 | 1 | 3 | 0 | 4 | 0.5 / 4 = **0.13** |
| Together | 2 | 11 | 13 | 1 | 27 | 7.5 / 27 = **0.28** |
