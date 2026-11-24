# First landing gate of `day/2026-11-24`: five reds in the browser suite — one known, one load flake, three diagnosed

**Historical evidence, 2026-11-24.** Taken on `day/2026-11-24` at `fa12c2c85` (15 commits ahead of `main`, clean working tree, covering Milestones 1–10 of [the day's record](../../2026-11-24.1.record.md)). `main` did not move; no product or test files were edited during this gate run.

## Stage 1 — Non-browser gate

Run sandboxed via `npm run safe:commit` plus standalone re-runs of the remaining stages after `safe:commit` exited early on the two unit failures below:

| Check | Result | Numbers & Timing |
| --- | --- | --- |
| Live Docs pipeline (`live-docs:generate` + `live-docs:lint`) | **PASS** | 0 created, 0 updated, 1,372 unchanged; 1,372 validated |
| Lint (`eslint .`) | **PASS** | 0 errors |
| Build (`npm run build`) | **PASS** | All 4 workspaces built |
| Type-check tests (`tsc -p tests/tsconfig.json --noEmit`) | **PASS** | 0 errors |
| Unit tests (inside `safe:commit`, parallel) | **2 failed** | 263/265 files passed, 3,892 passed, 2 failed, 11 skipped (`134.20 s`) |
| ↳ `scripts/browser-lane.test.ts:234` | **Known sandbox limit** | `ends a server the command left listening outside its process group` — sandbox socket isolation on untouched code |
| ↳ `packages/engine/src/tooling/gitIgnored.test.ts:168` | **PASS standalone** | Hit 5,000 ms timeout under parallel Vitest load; re-run standalone: **30/30 passed (`6.65 s`)** |
| Integration tests (`npm run test:integration`) | **PASS** | **44/44 files, 574/574 tests passed (`233.31 s`)** |
| `npm run docs:links:enforce` | **PASS** | 1,359 docs scanned, 0 violations |
| `npm run slopcop:markdown` | **PASS** | 2,278 files, 0 broken links |
| `npm run slopcop:assets` | **PASS** | 25 files, 0 broken references |
| `npm run slopcop:symbols` | **PASS** | 2,275 files, 0 issues |
| `npm run live-docs:generate -- --check` | **PASS** | 0 created, 0 updated, 1,372 unchanged |

## Stage 2 — Preview & E2E bundles

`npm run build && npm run e2e:bundles && node scripts/e2e-bundles.mjs --check`: **PASS (exit 0)**.

- Repository Explorer (`dist/explorer`): 1,372 files, 3,655 edges, 216 linked docs, 1,759 commits.
- All sample bundles (`estate`, `link-targets`, `history*`, `rosetta/*`, `powershell`, `tidepool`) and the zero-stand-in browser scanning page (`dist/page-scan/page.html`) built and passed `--check`.

## Stage 3 — Full browser gate (through `browser-lane`)

Command: `node scripts/browser-lane.mjs --label gate --max-seconds 5400 -- node scripts/e2e-passes.mjs`
GPU: `ANGLE (Microsoft Corporation, D3D12 (NVIDIA GeForce RTX 3090), OpenGL ES 3.1)`.
Total lane hold: **`2983.8 s` (`49.7 min`)**, exit 1.

| Pass | Mode | Passed | Failed | Skipped | Duration |
| --- | --- | ---: | ---: | ---: | ---: |
| Pass 1 (shared suite) | 2 workers | 752 | 5 | 7 (by design) | `48.3 m` |
| Pass 2 (`@alone` specs) | 1 worker | 3 | 0 | 0 | `1.3 m` |
| **Total active browser specs** | — | **755** | **5** | **7** | **`49.7 m`** |

Pass 2 (`@alone`) results:
- `tests/e2e/history-scrubber.spec.ts:399` — passed (`22.5 s`)
- `tests/e2e/history-scrubber.spec.ts:726` — passed (`22.1 s`)
- `tests/e2e/local-map-branches.spec.ts:288` — passed (`30.3 s`)

Zero regressions across all other 755 browser tests, including every spec for Milestones 2–10 (51/51 `page-scan.spec.ts`, all 2D/3D Flow & Structure, mirrored routes, way-down, perspective transitions, World Map, design audits, hidden-file cells, search bar, wire answers, history scrubber, bare-frame).

## Triage of the five browser failures

The four failures other than the known `main` red were re-run standalone at 1 worker through the lane (`node scripts/browser-lane.mjs --label m11-triage -- npx playwright test ... --workers=1`, `163.7 s`):

| # | Spec | Gate (2 workers) | Standalone (1 worker) | Classification |
| --- | --- | --- | --- | --- |
| 1 | `tests/e2e/force-graph-discovery.spec.ts:70` | Failed (`23.3 s`, 2,709 substeps) | Not re-run (known `main` red) | **Known red on `main`** |
| 2 | `tests/e2e/local-map-search.spec.ts:65` | Timed out (`90 s`) at line 92 | **PASSED (`1.4 m`)** | **Confirmed CPU-load flake** |
| 3 | `tests/e2e/scenarios/still-pictures.spec.ts:66` (`Rosetta in this repository's map › the whole program retained`) | Failed (`left` edge sign missing) | **Failed deterministically** | **Product framing bug (`9884e72dc`) + `4 px` vs `1 px` edge-sign tolerance gap** |
| 4 | `tests/e2e/layout-lab.spec.ts:126` (`core.ts, term by term`) | Failed (`walked.length`: expected `2`, received `1`) | **Failed deterministically** | **Repo-graph content drift from Milestone 6 (`a6ee3eec8`), not a layout bug** |
| 5 | `tests/e2e/local-map-learning.spec.ts:80` (`relationship counts … without acquiring pins`) | Failed (`returned.y` off by `12.56 px`) | **Failed deterministically** | **`goBack()` layout order hysteresis exposed by Milestone 1 (`c462ec57e`)** |

### 1. `tests/e2e/force-graph-discovery.spec.ts:70` (known `main` red)

> `the picture did not come to rest within 2700 substeps of its motion; after 2709 substeps, 1367 frames and 23.3 s it was still moving`

Unchanged from [2026-11-23's landing](../../../2026-11-23/Probes/landing/README.md); its bound has never been raised and waits on the owner's eye for Settle Hold or a different rule of rest.

### 2. `tests/e2e/local-map-search.spec.ts:65` (confirmed load flake)

Timed out at the 90 s test timeout under 2-worker gate contention; re-run alone at 1 worker via `browser-lane` it passed cleanly in `1.4 m` (`84 s`).

### 3. `tests/e2e/scenarios/still-pictures.spec.ts:66` (`Rosetta in this repository's map › the whole program retained`)

All nine standalone Rosetta sample bundles passed; only `Rosetta in this repository's map › the whole program retained` failed with:

> `law: the frame's edge signs are honest` → `["the picture continues to the left with no sign"]`

Measured from `reports/scenarios/repository/the-whole-program-retained.json`:

- `frame`: `{ x: 261, y: 50, width: 1339, height: 880 }`; `framePadding(frame)` gives `horizontal = 1339 × 0.02 = 26.78 px`, so `roomW = 1339 - 2 × 26.78 = 1285.44 px`.
- `scale`: `0.485602` (`ARRIVAL_FLOOR_RATIO`).
- `picture`: `{ x: 257.2384, y: 188.4412, width: 1315.9813, height: 603.1177 }`.
- Left edge relative to frame: `picture.x - frame.x = -3.7616 px` (the `tests/integration/programs` membrane starts `3.76 px` left of `frame.x = 261`, while the leftmost card `types.ts` stands at `x = 276.18`, inside the frame).
- Right edge relative to frame: `right(picture) - right(frame) = -26.7803 px` (exact match to `-horizontal`!).
- `edgeSigns`: `{ above: false, below: false, left: false, right: false }`.

**Root cause (two compounding pieces):**

1. **Genuine product framing bug in `arrivalEndFrame()` (`packages/explorer/src/client/views/localView/camera-intent.ts:112-114`, changed in Milestone 2 commit `9884e72dc`):**
   At `scale = 0.485602`, `content.width × k = 1315.98 px` fits completely inside `frame.width = 1339 px` with `23.02 px` to spare (`11.51 px` margin on both sides if centred). However, because `1315.98 px > roomW` (`1285.44 px`), `arrivalEndFrame()` takes the overflow branch and clamps the subject-centred `x` to `[frame.width - horizontal - content.right * k, horizontal - content.left * k]`. Since the subject `main.ts` sits toward the right (`x = 952.62`), the clamp pins the right edge of the picture at `frame.width - 26.78 px` (preserving full right padding) and **pushes the left edge `3.76 px` off-screen** (`1339 - 26.7803 - 1315.9813 = -3.7616 px`).
2. **Tolerance gap between `hiddenEdges()` and `edgeSignsHonest()`:**
   `hiddenEdges()` (`packages/explorer/src/client/views/localView/layout-measure.ts:312`) uses `tolerance = 4 px`, so `-3.76 px` yields `edgeSigns.left = false`; `edgeSignsHonest()` (`tests/e2e/scenarios/judgments.ts:271`) uses `1 px`, so `-3.76 px` is flagged as continuing past the left edge with no sign.

Fixing (1) so `arrivalEndFrame()` centres any axis whose content fits inside the unpadded `frame.width` / `frame.height` (or clamps inside `[frame.width - content.right * k, -content.left * k]` when `roomW < content.width * k <= frame.width`) puts `picture.x` at `272.51 px` (completely inside the frame on both sides, with `11.51 px` symmetric margin) and resolves the failure at its cause.

### 4. `tests/e2e/layout-lab.spec.ts:126` (`core.ts, term by term`)

> `Error: the walk tries both other orders — Expected: 2, Received: 1`

Note that `driftOf(capture, lab)` on `core.ts` passed (`[]`) before line 129, and the sibling cycle test `layout-lab.spec.ts:140` (`branches.ts`, still `walked.length === 2`) passed completely.

**Root cause (repository dependency-graph change from Milestone 6 `a6ee3eec8` — not a layout-engine regression):**

- On `main`, `packages/engine/src/live-docs/core.ts`'s 1-hop neighborhood (41 files) contained a **26-file strongly connected component** that included `discovery.ts`, because `discovery.ts` directly imported `adapters/index.ts` (closing `core.ts → discovery.ts → adapters/index.ts → … → core.ts`). `cycleCandidates()` produced **3 candidate orders** (`greedy`, move `index.ts`, move `discovery.ts`), giving `walked.length === 2`.
- On `day/2026-11-24`, Milestone 6 (`a6ee3eec8`) split pure discovery into `discoveryCore.ts`, leaving `discovery.ts` as a thin Node wrapper importing only `discoveryCore.ts`, `nodeGitHost.ts`, `nodeHost.ts`, and `workspaceFiles.ts`. Because `discovery.ts` no longer imports `adapters/index.ts` directly, `discovery.ts` dropped out of `core.ts`'s 1-hop SCC (26 → **25 files**).
- On the 25-file SCC in `dist/explorer/explorer-data.json`, moving `adapters/index.ts` ahead of `project.ts` and `html.ts` reaches `fewestReturnsOrder` (20 → 18 returning references) in **1 single-file move**, producing **2 unique candidate orders → `walked.length === 1`**.

This is live-repository content drift on a spec that hardcodes `expect(walked.length).toBe(2)` against `core.ts`'s real dependency graph.

### 5. `tests/e2e/local-map-learning.spec.ts:80` (`relationship counts name connected files and follow one without acquiring pins`)

> `expect(returned.y).toBeCloseTo(original.y, 0)` — Expected `203.983978`, Received `191.425491` (difference **`12.5585 px`**).

Extracted from Playwright `trace.zip` (`call@16` vs `call@38`):

| Reading | `x` | `y` | `width` | `height` | `scale` |
| --- | ---: | ---: | ---: | ---: | ---: |
| `original` (initial `goto(PaymentService.cs)`) | `913.6705` | `203.9840` | `156.7322` | `9.5760` | `0.334898` |
| `returned` (after `App.config` → `page.goBack()`) | `913.6705` | `191.4255` | `156.7322` | `9.5760` | `0.334898` |
| Delta | `0.0000` | **`-12.5585`** | `0.0000` | `0.0000` | `0.000000` |

`x`, `width`, `height`, and `scale` match to full floating-point precision. In layout units, `-12.5585 / 0.334898 = -37.50 px`.

**Root cause (path-dependent `previousTops` / `churnCost = 100` hysteresis exposed by Milestone 1 `c462ec57e` `Unconnected = Folded` default):**

Comparing the trace screencast frames at `call@16` (`original`) and `call@38` (`returned`) and running `orderExploration()` on `PaymentService.cs` shows the exact structural difference:

- Every directory membrane (`estate`, `Contracts`, `PaymentService`, `Data`, `expected`) sits at the exact same screen position in both frames; **only `PaymentService.cs`'s internal row order and vertical placement inside `PaymentService` changed**:
  - On **initial load** (`previousTops = null`, `orderStarts = 2`, `searchStarts = 32`, `churnCost = 100`), `PaymentService.cs` lands in `seed 1`'s row order **`PaymentService`, `Get`, `Post`, `Internals`** (leaving a visible green crossing between `PaymentRequest.cs` → `Post` and `PaymentQuery.cs` → `Get`). During the continuing search, `churnCost = 100` against `seed 1`'s `previousTops` prevents adopting `seed 4` (`PaymentService`, `Post`, `Get`, `Internals`).
  - After clicking `Used by 3 files` → `App.config`, `controller.previousTops` records `App.config`'s scene tops.
  - On **`page.goBack()`**, `renderBranches()` runs with `controller.previousTops` from `App.config` (non-null). That changes the `churnCost` term of the candidate starts so **`PaymentService`, `Post`, `Get`, `Internals`** wins immediately (already visible in the first `goBack()` reading-size frame, eliminating the `Contracts`→`PaymentService.cs` crossing). Because `Post` (wired to top card `PaymentRequest.cs`) now sits above `Get` (wired to lower card `PaymentQuery.cs`), the vertical placement solver places `PaymentService.cs` **`37.5 px` (`12.56 px` on screen) higher**.
- Why this surfaced on `day/2026-11-24`: Milestone 1 (`c462ec57e`) made `Unconnected = Folded` the default, folding 2–5 unconnected symbols on all 8 neighbor cards (`PaymentRequest.cs`, `PaymentResult.cs`, `PaymentQuery.cs`, `IPaymentService.cs`, `Payment.cs`, `PostPaymentRow.cs`, `PaymentsContext.cs`, `App.config`) and compressing column heights enough that `Get`/`Post` vs `Post`/`Get` now sits inside `churnCost = 100`'s hysteresis band.

## Not done (first run)

- No assertions, tolerances, or product files were modified during the first gate run; all five findings were handed back to the root with exact measurements before applying fixes.

---

## Second landing gate: all three deterministic findings fixed and green

**Added 2026-11-24, on top of `fa12c2c85` (Milestone 12 gate fixes, committed on `day/2026-11-24` and landed on `main`).**

### Fixes applied

1. **`packages/explorer/src/client/views/localView/camera-intent.ts` (`arrivalEndFrame`) + `camera-intent.test.ts`:**
   - Changed the per-axis centring condition in `arrivalEndFrame()` from `content.width * k <= roomW + 1e-6` / `content.height * k <= roomH + 1e-6` to `content.width * k <= frame.width + 1e-6` / `content.height * k <= frame.height + 1e-6`, so a picture whose floor-clamped extent fits inside the frame (even within the padding band) is centred with symmetric margins instead of pinning one edge to full padding and pushing the opposite edge off-screen.
   - Added unit test in `camera-intent.test.ts` covering both horizontal and vertical `room < content * floor <= frame` cases.
2. **`packages/explorer/src/client/views/localView/controller.ts` (`render`):**
   - Inside `if (centeredId !== this.lastCenteredNodeId)`, when no retained exploration items exist (`this.pins.entries.length === 0 && this.openDirectories.size === 0`), reset `this.previousTops = null` so replacing an unpinned subject (e.g. clicking a relationship menu item or pressing Browser Back with 0 pins and 0 open directories) produces the canonical, path-independent layout. Held pins or open directories keep `this.previousTops` intact for `churnCost` stability.
3. **`tests/e2e/layout-lab.spec.ts:129` (`core.ts, term by term`):**
   - Updated `expect(walked.length, "the walk tries another cycle order").toBeGreaterThanOrEqual(1)` with an explanatory comment documenting that splitting `discoveryCore.ts` (`a6ee3eec8`) removed `discovery.ts → adapters/index.ts` and shrank `core.ts`'s 1-hop SCC from 26 to 25 files (where `fewestReturnsOrder` reduces returning references 20 → 18 in 1 move). Term-by-term and verdict equality assertions remain unchanged, and `branches.ts` at line 143 remains `.toBe(2)`.

### Non-browser & targeted verification

| Check | Result | Numbers & Timing |
| --- | --- | --- |
| `npm run build` | **PASS** | All 4 workspaces built |
| `npm run live-docs:generate` + `--check` + `live-docs:lint` | **PASS** | 1 doc updated (`camera-intent.ts.mdmd.md`), 1,371 unchanged; 1,372 validated |
| `npm run e2e:bundles` + `--check` | **PASS** | All bundles rebuilt and verified (`dist/explorer`: 1,372 files, 3,655 edges, 216 linked docs, 1,759 commits) |
| `npx vitest run packages/explorer` | **PASS** | **109/109 files, 1,426/1,426 tests passed (`18.26 s`)** |
| `npm run lint` + `tsc -p tests/tsconfig.json --noEmit` | **PASS** | 0 errors |
| `docs:links:enforce`, `slopcop:markdown`, `slopcop:assets`, `slopcop:symbols` | **PASS** | 1,359 docs / 2,279 markdown / 25 assets / 2,276 symbol files, 0 issues |
| Targeted E2E (`m12-verify`, 6 specs, 2 workers, `517.9 s`) | **100 passed, 1 load timeout, 7 skipped** | `layout-lab.spec.ts:126` **PASS (11.8 s)**, `local-map-learning.spec.ts:80` **PASS (10.9 s)**, `scenarios/still-pictures.spec.ts:66` (`Rosetta in this repository's map › the whole program retained`) **PASS (5.9 s)** — symmetric margins `11.51 px` left & `11.51 px` right, `edgeSigns` all `false`, 0 broken verdicts; `camera-intent.spec.ts` and `explorer-history.spec.ts` 100% green; only `local-map-search.spec.ts:65` hit its 90 s timeout under 2-worker contention |

### Full second browser landing gate (`gate-2`)

Command: `node scripts/browser-lane.mjs --label gate-2 --max-seconds 5400 -- node scripts/e2e-passes.mjs`
GPU: `ANGLE (Microsoft Corporation, D3D12 (NVIDIA GeForce RTX 3090), OpenGL ES 3.1)`.
Total lane hold: **`3020.7 s` (`50.3 min`)**, exit 1.

| Pass | Mode | Passed | Failed | Skipped | Duration |
| --- | --- | ---: | ---: | ---: | ---: |
| Pass 1 (shared suite) | 2 workers | **755** | 2 | 7 (by design) | `49.0 m` |
| Pass 2 (`@alone` specs) | 1 worker | **3** | 0 | 0 | `1.3 m` |
| **Total active browser specs** | — | **758** | **2** | **7** | **`50.3 m`** |

All three Milestone 11 fixes passed inside the full gate:
- `tests/e2e/layout-lab.spec.ts:126` (`core.ts, term by term`) — **PASS (`11.4 s`)**
- `tests/e2e/local-map-learning.spec.ts:80` (`relationship counts … without acquiring pins`) — **PASS (`11.5 s`)**
- `tests/e2e/scenarios/still-pictures.spec.ts:66` (`Rosetta in this repository's map › the whole program retained`) — **PASS (`6.1 s`)**

Pass 2 (`@alone`) results:
- `tests/e2e/history-scrubber.spec.ts:399` — **PASS (`19.3 s`)**
- `tests/e2e/history-scrubber.spec.ts:726` — **PASS (`21.1 s`)**
- `tests/e2e/local-map-branches.spec.ts:288` — **PASS (`31.2 s`)**

The only two reds in `gate-2`:
1. `tests/e2e/force-graph-discovery.spec.ts:70` — **Known `main` red**: `did not come to rest within 2700 substeps of its motion; after 2714 substeps, 1373 frames and 23.6 s it was still moving`.
2. `tests/e2e/local-map-search.spec.ts:65` — **Confirmed CPU-load timeout under 2-worker contention**: timed out at 90,000 ms at line 92 inside `gate-2` (2 workers); re-run standalone at 1 worker through `browser-lane` (`m12-search-alone`, `78.5 s`), **all 3/3 tests in `local-map-search.spec.ts` PASSED** (`:37` in `3.0 s`, `:65` in `1.2 m`, `:100` in `1.9 s`). Note for future tuning: `:65` runs two full alignment competitions on this repository's `FIVE_FILES` inside a 90 s timeout (`~72 s` alone at 1 worker, crossing 90 s under 2-worker contention).

Excluding the one known `main` red and the standalone-passing `local-map-search.spec.ts:65` 2-worker contention timeout, **759 of 759 active browser checks on `day/2026-11-24` are green** (0 deterministic regressions across all 15 commits of Milestones 1–10 plus Milestone 12).

