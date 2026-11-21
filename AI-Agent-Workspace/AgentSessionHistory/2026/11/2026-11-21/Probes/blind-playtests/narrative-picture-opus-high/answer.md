I've walked the history from start to end and am writing up what I found.

# How this project grew, as shown by the map's history control

The history control runs from **2025-10-16 to 2026-11-21**, and the timeline's tick marks fall into two bursts of work with a long pause between them. I couldn't step through every one of the hundreds of steps with the actions I had, so I sampled about 40 points. Each statement below gives the date and short commit code from the control, the counts in the bottom-left footer, and the file names labelled on the map.

**Limits on what I could tell:**
- **Counts can't tell additions from removals.** When the file count jumps I can see that something happened, but not exactly which files came or went.
- **Moves and renames were never shown directly.** No step showed a file moving or changing name. Where I call something a reorganisation, I'm inferring it from counts falling and clusters reshaping.
- **Dates are narrowed, not pinned.** Most changes I place between two sampled steps, not at one exact step.

## Period 1: Setup (Oct 16–17, 2025)
- **First step, 2025-10-16, f7a75fa7:** 7 files, 2 references, 1 group. The only label was `update-agent-context.ps1`, a scaffolding script.
- **Next step, same day, 6bccf94b:** 41 files, 6 groups. A VS Code extension with a backend server appeared at once:
  - packaging and setup: `extension/package.json`, `server/package.json`, `tsconfig.base.json`, `001_init.sql`
  - core code: `graphStore.ts`, `knowledgeGraphBridge.ts`, `changeQueue.ts`, `providerGate.ts`, `configService.ts`, `overrides.ts`, `maintenance.ts`
  - config files: `.eslintrc.cjs`, `.nvmrc`, `.prettierrc`
- **2025-10-17, 3cf24bee:** 54 files, 94 references. Tests arrived (`saveDocumentChange.test.ts`, `publishDocDiagnostics.test.ts`, `markdownWatcher.test.ts`, `fallbackInference.test.ts`) along with `schemaValidator.ts`, `core.ts`, `commands/overrideLink.ts` and `vitest.config.ts`. `eslint.config.js` was labelled, and the old `.eslintrc.cjs` was no longer labelled. That suggests a switch of lint setup, but I didn't confirm the old file was removed.

## Period 2: Fast growth (late Oct to mid-Nov 2025)
- **2025-10-23, fa09c8b1:** 133 files, 7 groups. Labels: `noiseFilter.ts`, `publishCodeDiagnostics.ts`, `settings.ts`, `.specstory/.gitignore`.
- **2025-10-29, 59f78996:** 232 files, 468 references, 12 groups. Labels: `changeProcessor.ts`, `main.ts`, `benchmarkRecorder.ts`, `localOllamaBridge.test.ts`.
- **2025-11-09, 86a74a76:** 446 files, 1,116 references, 28 groups. Benchmarks and quality tooling appeared: `ast-accuracy.json`, `rebuild-stability.json`, `self-similarity/ast-accuracy.json`, `slopcop.config.json`, `safe-to-commit.mjs`, `build-target-manifest.ts`, `lint.ts`, `llmIngestionOrchestrator.test.ts`.
  - The benchmark result files (`ast-accuracy.json`, `rebuild-stability.json`) stay labelled at nearly every later sample through April 2026, so they were updated very often.
- **2025-11-14, 6086294a:** C-language support and sample projects: `basics/src/main.c`, `modular/src/main.c`, `logger.c`, `c.ts`.
- **2025-11-20, c5678a94:** 525 files, 4 groups. PowerShell support: `powershell.ts`, `Inventory.psm1`, `emit-ast.ps1`, `adapters/index.ts`.

## Period 3: One file at the centre (about Nov 14, 2025 to Jan 9, 2026)
- **What it looked like:** from Nov 14 the map became a star centred on one node. Hovering over it on 2026-01-09 showed `data/graph-snapshots/workspace.snapshot.json`, which pointed at nearly every file.
- **Effect on groups:** the footer showed only 4 groups on Nov 20, Dec 7, Dec 19 and Jan 9, down from 28 earlier.
- **Other changes in this period:**
  - **2025-12-07:** `workspaceIndexProvider.ts` and `system/generator.ts` (592 files)
  - **2025-12-19:** `ci.yml` (643 files)
  - **2026-01-03:** updates to `package.json` files (676 files)

## Period 4: Cleanup and reorganisation (Jan 12–13, 2026)
- **2026-01-12, 0d89e857:** files fell from 671 to 614 and references from 3,483 to 2,375. The central snapshot node was gone and groups rose to 34. Many nodes lit up at once, with labels `main.ts`, `bootstrap.json`, `lsifParser.ts`, `linkInference.ts` and `visualize-circuit.ts`. This step removed the snapshot and changed a great deal at once.
- **2026-01-13:** down to 598 files, with `shared/src/index.ts` and `sources-view.ts` labelled.

## Period 5: More languages and the UI (late Jan to early Apr 2026)
- **2026-01-30:** 703 files. Labels for more languages: `languages/csharp.ts`, `heuristics/go.ts`, `adapters/python.ts`, `adapters/c.ts`.
- **2026-02-03:** dev container setup (`devcontainer.json`, `post-create.sh`, `verify.mjs`).
- **2026-02-16:** a busy day with many steps:
  - Java support and diagnostics: `heuristics/java.ts`, `tech-debt-detector.ts`
  - C# and C pieces: `adapters/csharp.ts`, `aspnet.ts`, `cFunctions.ts`
  - local view: `localView/runtime.ts`, `local-storage.ts`
- **2026-02-20 to 02-23:** files dropped from 705 to about 630, so files were removed or merged. Labels included `openapi.yaml`, `download.ts` and `dataLoader.ts`.
- **2026-03-29:** 662 files. A visual "membrane view" appeared: `membraneView/index.ts`, `membrane.css`, `focal-overlay.ts`, `detailPanel.ts`.
- **2026-04-02, ae216cb5:** the last step before the pause, at 677 files.

## Pause (Apr 2 to Sep 27, 2026)
- **What it looked like:** the timeline has no ticks for about six months.
- **Where it ended:** the very next step is **2026-09-27, 29d58b50**. It only touched `settings.json`, and the count was still 677.

## Period 6: Rebuild and fastest growth (Sep 29 to Nov 21, 2026)
- **2026-09-29:** 628 files and 44 groups, down from 677. Another cleanup, and several steps that day showed no labels.
- **2026-10-03:** 651 files. A new local map view: `branch-renderer.ts`, `branches.ts`, `perspectiveGeometry.ts`, `card-factory.ts`, `localView/controller.ts`, `pin-state.test.ts`.
- **Mid-October growth:** 692 files on 10-15, then **852 on 10-18**.
- **2026-10-19:** browser tests arrived: `playwright.config.ts`, `local-map-branches.spec.ts`, `local-map-presets.spec.ts`.
- **Growth by date:**

| Date | Files |
|---|---|
| 2026-10-24 | 877 |
| 2026-11-02 | 914 |
| 2026-11-08 | 947 |
| 2026-11-16 | 975 |
| 2026-11-19 | 1,093 |

- **2026-11-20, the last few steps:** the history feature itself was added: `live-docs/history.ts`, `history/format.ts`, `summarizeChange.ts`, `lens.ts`, `regenerate.ts`, `history-workers.test.ts`.
- **Final step, 2026-11-21, 76f2d8db:** 1,134 files, 7,260 references, 44 groups.

## Where the work gathered
The timeline's ticks bunch up in three places:
- **Oct–Nov 2025:** the fastest early growth, from 7 to about 525 files.
- **Jan–Mar 2026:** language support and the UI.
- **Late Sep–Nov 2026:** the densest stretch of steps and the largest growth, from 628 to 1,134 files.

At the end, most files sit in one dense central cluster on the map, with smaller satellite clusters around it.

I didn't copy anything to the clipboard.
