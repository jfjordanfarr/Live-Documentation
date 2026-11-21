# Internal Tooling Reference

_Current as of 2026-11-21._

## Metadata

- Layer: 2
- Audience: Contributors

Commands used to **develop** Live Documentation, as opposed to using it. Adopters never need these; the user-facing catalog is the [CLI Reference](../layer-1/guides/cli-reference.mdmd.md). Several of these tools are scheduled for removal or replacement; the order of work is in [the vision](../layer-1/vision.mdmd.md).

---

## Pre-commit gate

### `npm run safe:commit`

Runs, in order:

1. `verify`: ESLint, `tsc` for the packages, a type-check of the test suites, the Vitest `unit` and `integration` projects, documentation link enforcement
2. Live Docs regeneration (`live-docs:generate`)
3. Live Docs lint (`livedocs -- --skip-generate`)
4. SlopCop markdown, asset and symbol audits

Flags: `--e2e` appends `npm run test:e2e`, which builds the suite's bundles and runs the Playwright suite; `--skip-git-status` skips the clean-tree check, which is what CI does as `npm run ci-check`.

The gate stops at its first red stage, so the stages after it have not run. When that stage is red for a reason apart from the change (a deadline on a slow machine), run the rest one by one (`npm run livedocs`, `lint`, `test:unit`, `test:integration`, `test:e2e`) before landing further work on top; a handful of browser files chosen by hand is not the suite. On 2026-11-13 rounds were landed on browser files chosen by hand, the gate then stopped at a unit deadline before its browser stage, and two more rounds landed on top; the suite, run that night, showed that an afternoon's round had broken the Local Map's layout search. A command started in the background reports its own end; a wait written as `until ! pgrep -f "<its command>"` finds its own shell and never ends (fourteen of them ran for ten hours that day).

### `npm run verify`

Lint, build, type-check, both Vitest projects, and link enforcement, without the rest of the chain.

---

## Tests

| Command                    | What it runs                                                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run test:unit`        | The Vitest `unit` and `unit-serial` projects: `packages/*/src`, `scripts/` and the SlopCop suites; the deadline-bound physics suite runs alone, after the rest |
| `npm run test:integration` | The Vitest `integration` project (`tests/integration/live-docs/`): generator determinism, polyglot fixtures, CLI pathfinding, Rosetta parity, the oracle (~20 s)                           |
| `npm run test:e2e`         | `npm run e2e:bundles`, then Playwright against the built Explorer and its estate, history and Rosetta samples (`tests/e2e/`): every view, explicit changes between 2D and 3D, Back and Forward, the design audit and the still-picture instrument |
| `npm run e2e:bundles`      | Builds the Explorer and every sample the browser suite serves, from the one list in `scripts/e2e-bundles.mjs` (below) |

Both Vitest projects import TypeScript sources directly, so neither needs a build first. The Playwright specs check each view's plumbing (state in the URL, containment, stable layout, explicit changes between 2D and 3D), not whether the picture is right; the owner said as much on 2026-09-28. Two instruments say a little more: `tests/e2e/design-audit.ts` (2026-09-29) fails a spec when words collide or are cut off, and `tests/e2e/still-picture.ts` (2026-10-01) measures what one picture shows legibly against predictions written in `AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-01/Probes/still-picture-deck.md`. Taste is still judged by eye. The AST accuracy benchmark was retired on 2026-09-27: it scored an inference path the product did not ship, against per-fixture thresholds as low as 5% recall. Its replacement is the oracle below.

**What the browser suite costs, and what changes it** (measured 2026-11-17; [the record of that day](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#work-notes-after-turn-6-what-the-mount-costs-and-what-a-worker-costs)). Its 488 cases are about 88 minutes of case time, one after another, and no file is more than a fourteenth of it. A case is the page doing its own work: a cold load is about a second of the page's main thread, a 2D Local Map picture two to three and a half, so the suite's time follows the product's speed. Three things outside the product change it:

- **The renderer.** A headless Chromium draws WebGL in software unless the container was given the host's graphics card ([the devcontainer's README](../../.devcontainer/README.md#the-hosts-graphics-card-windows-wsl2)). `tests/e2e/browser-launch.ts` launches on the card where it finds one, and the first line of every run names the renderer that drew it; read that line before any of a run's times. On the card the whole suite took 98 minutes at one worker where software took about two hours, and the 3D cases that stood on their time limits pass. Playwright is pinned at exactly 1.61.1 for it, because the Chromium of Playwright 1.62 and later does not reach the card through Mesa's `d3d12` driver (measured 2026-11-20); the pin is lifted when a later release's browser draws on the card under the suite's launch, as [the devcontainer's README](../../.devcontainer/README.md#the-hosts-graphics-card-windows-wsl2) says how to test.
- **The workspace's disk.** Where the workspace is a folder on a Windows drive, each file opened in it costs 4 to 6 ms, and a run spent 54 s finding its cases before `node_modules` was moved to a volume on the container's disk ([the README again](../../.devcontainer/README.md#dependencies-on-the-containers-own-disk)). A search across the whole tree while a browser run is under way slows that run's cases past their limits.
- **Workers.** A browser with its test keeps about a thread and a half busy on the card and two in software, and the machine these numbers come from has ten cores. Four workers stretched every case by half and failed two or three in a hundred on waits that ran out; eight stretched them more than twofold. Since 2026-11-18 `npm run test:e2e` runs two passes (`scripts/e2e-passes.mjs`): every case at two workers but the few tagged `@alone`, then those at one worker, because their own work nearly fills their time limits and a neighbour pushes them over. No limit was changed for it, and a case earns the tag only by failing at two workers and passing alone. Run directly, `npx playwright test` still uses one worker for every case. Each pass writes its own report (`reports/e2e/`, `reports/e2e-alone/`).


The [Explorer remediation checklist](../layer-3/live-documentation-explorer.mdmd.md#remediation-work) records journeys and visual acceptance criteria. Try the relevant journeys in the built page on both the main repository and estate before writing their browser checks. Assert that path results and reverse recovery are rendered and usable in both representations, labels and controls remain readable, and identity survives orbit, zoom, filtering, history and representation changes. Element existence and persisted state alone did not catch the review's failures; DOM collision checks also cannot establish that projected 3D wires look attached to the right spheres. Keep the existing audits and thresholds. Non-finite layout positions must fail measurement, never be reported as settled.

### The browser lane

One machine runs every builder's browser. Until 2026-11-19 builders shared it by taking `flock -x /tmp/live-docs-browser.lock` round their runs by hand, each with a port of its own; one night of five to eight builders at once ([Turns 36 and 37 of the November 18 session](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-36)) showed seven faults in that, and each piece below answers one or more of them. The owner's aim that night: builders should "quickly hop in a browser, run their testing screenshots, and get back out".

```bash
npm run e2e:bundles                       # build first, outside the lane
node scripts/browser-lane.mjs --label my-round -- npx playwright test --config tests/e2e/playwright.config.ts tests/e2e/no-network.spec.ts
node scripts/browser-lane.mjs --status    # who holds, who waits, for how long
```

- **`node scripts/browser-lane.mjs [--label <who>] [--max-seconds <n>] -- <command…>`** ([its Live Doc](../layer-4/scripts/browser-lane.mjs.mdmd.md)) queues first come, first served, runs the command while holding the lane, and always lets go.
  - *`flock` serves no queue*: one builder held the browser thirty-six minutes while seven waited, and a late arrival was sometimes served first. The lane serves numbered tickets in `/tmp/live-docs-browser-lane/tickets/` in order, and skips a ticket whose process has died.
  - *Holds had no cap.* The cap is 300 s unless `--max-seconds` says otherwise; at the cap the command's process group is ended and the exit is 124.
  - *A cut run read as failures*: a hold too large for its cap was cut mid-run and its remaining cases failed as the server went, which read like 21 failures. The lane's last line after a cut says "CUT", how many of a Playwright run's cases had finished, and that what failed after the cut is the cut.
  - *Servers outlived their holds*: an `npx http-server` kept the lock twenty minutes after its work, and cleanups that ended the `npx` wrapper left the server. Every process the command starts carries the hold's token in its environment, whatever process group it moves to, and the lane ends all of them at the end and logs the ports they held.
  - *Builds inside holds.* Building is not the browser's work: run `npm run build`, `npm run e2e:bundles` or `npm run live-docs:visualize` before the lane, and put only the browser run inside it. The log's `held=` figures show a hold that built.
  - **The older lock.** While builders still take `/tmp/live-docs-browser.lock` by hand, the lane takes it too while holding, and says so when it waits for someone outside the lane, so the two conventions never overlap. Do not put `flock` on that lock inside a lane command: the lane refuses it, since it would wait on the lane until the cap.
  - Each hold appends a line to `/tmp/live-docs-browser-lane/lane.log`: label, seconds waited and held, exit, capped or not, cases finished of those announced, anything left behind with its ports, and the command.
- **`npm run e2e:bundles`** ([`scripts/e2e-bundles.mjs`](../layer-4/scripts/e2e-bundles.mjs.mdmd.md)) builds the Explorer and every sample the suite serves, and `npm run test:e2e` runs it first. *Stale sample bundles*: a check after a landing rebuilt the Explorer and the estate sample but not the history or Rosetta samples, and the history's cases then ran on a page hours old and failed for that alone. At its start the suite now refuses bundles that were not built together from the client as it stands, naming each and this command: every bundle carries its own copy of the client's script, so a sample whose copy differs from the Explorer's was built at another time.
- **The suite's own server** ([`tests/e2e/served-build.ts`](../layer-4/tests/e2e/served-build.ts.mdmd.md)). *Playwright reused whatever answered on its port*, so a builder given a port another builder's server still held would have tested the other's build without a word. The suite now starts its server on a port it finds free; a port named by `LIVE_DOCS_E2E_PORT` that already answers is refused in a plain sentence, unless `LIVE_DOCS_E2E_REUSE=1` asks to use it; and its first global setup proves the server serves this checkout's `dist/explorer` by fetching a file just written there. A builder needs no port of its own for the suite any more; a port is still needed for a page served by hand.
- *Shared scratch names*: two agents wrote a `hold.sh` in one scratch folder and one overwrote the other's. The lane needs no script of one's own to hold the browser; scratch files go in a folder named for their builder.


### The engine in a page

A standing check, since 2026-11-21 ([the record, Turn 2](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), that the engine and generator as they stand, bundled for a browser with stand-ins for Node's modules (`tests/page-scan/stand-ins/`), map a folder inside a real Chromium page to the same Live Docs and index that Node writes, over every sample program and fixture, and that says how far the engine is from needing no stand-ins. Until then nothing said when the engine stopped running in a page: the probe of 2026-11-19 had stopped building two days later. What it found on its first runs is [its evidence](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md). A design in which the engine reads a folder through a small interface of its own, so that the stand-ins are deleted one by one with this check as the judge, is proposed, not built, in [One Engine, Two Hosts](../layer-3/engine-and-hosts.mdmd.md).

| Command | What it does |
| --- | --- |
| `npm run test:integration` (`tests/page-scan/*.test.ts`) | Without a browser: the scanning bundle builds; what of Node the scan's path needs is the committed `tests/page-scan/node-needs.json`; each stand-in answers for exactly that; every reader the engine registers reads some fixture's files |
| `node tests/page-scan/node-needs.mjs [--write]` | Prints what of Node the scan's path needs, read from esbuild's account of the bundle and each module's syntax tree; `--write` writes the committed list, for review |
| `node tests/page-scan/build-page.mjs --out dist/page-scan` | Builds the scanning page; `npm run e2e:bundles` runs it |
| `node scripts/browser-lane.mjs --label <who> -- npx playwright test --config tests/e2e/playwright.config.ts tests/e2e/page-scan.spec.ts` | In Chromium, each fixture scanned in the page opened from disk and under Node, every file compared whole and held to the ledger `tests/page-scan/differences.json`, which fails on a difference it does not list and on a listed one that no longer occurs. Each case's `page-scan.json` keeps the calls made of the stand-ins, the files read and how often, and both times. About 150 s for the 45 cases, and 250 s on a loaded machine, so one hold; `--grep "fixtures/"` and `--grep-invert "fixtures/"` halve it |


---

## Oracle

The oracle measures the shipped generator against a compiler, which shares no mechanism with it. Both commands take a fixture directory and never write into it except under `expected/`.

| Command                               | What it does                                                                                                                                                                                                                                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run oracle:index -- <fixture>`   | Copies the fixture, runs the SCIP indexer its project file selects (`scip-dotnet`, `scip-go`, `rust-analyzer`, `scip-java`, `scip-typescript`, or `scip-python` for a directory of `.py` files), and writes every compiler-resolved edge to `expected/compiler-edges.json`. A C# fixture's project references are MSBuild's own evaluation of each project (`dotnet msbuild -getItem:ProjectReference`, since 2026-11-21), so the .NET SDK is needed for them as for `scip-dotnet`; a project MSBuild cannot evaluate stops the run |
| `npm run oracle:compare -- <fixture>` | Runs the generator over a copy of the fixture and lists every disagreement with `expected/compiler-edges.json` and, if present, `expected/hand-verified-edges.json`. A list, not a score; exit code 0 either way. `--json` for data                                        |

The converter lives in `scripts/oracle/scip-edges.ts` with its unit test beside it.

`tests/integration/live-docs/oracle.test.ts` runs the comparison over every sample program that keeps `expected/compiler-edges.json` and fails on a hand-verified edge the readers miss unless the program's `expected/hand-verified-misses.json` lists it with its cause, and on a listed edge that is drawn again; `oracle:compare` prints each missed edge's cause. The compiler's missing and extra edges are held the same way to `tests/integration/programs/compiler-differences.json`, a ledger by cause the programs share: each cause says what the reader does and what the compiler does, whether it is a gap or a difference of grain, and lists the edges it explains. A reader that comes to draw a listed edge, or stops drawing a listed extra one, removes its entry in the same commit ([the account](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)).

The SQL reader has an oracle of its own, Microsoft's T-SQL parser (ScriptDom, the parser SQL Server's tools use), since 2026-11-19 ([the probe](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)):

| Command | What it does |
| --- | --- |
| `npm run oracle:sql -- <folder>` | Reads every `.sql` file of the folder with ScriptDom through `scripts/oracle/sql-scriptdom.cs` (a .NET file-based program; it needs the .NET SDK, and NuGet on its first run), reads the same files with the SQL adapter, and prints the figures: objects created and found, lines right, dependency lines right, missing and invented, by how each object is used, and the strings the scripts execute. `--only <prefix>` narrows the files, `--sample <n> --seed <s>` reports a seeded draw, `--detail` lists every disagreement, `--json` prints data. A fixture that keeps `expected/sql-scriptdom.json` is read from it without .NET |
| `npm run oracle:plsql -- <folder>` | Grades the SQL reader on the folder's PL/SQL against the ANTLR project's PL/SQL grammar at a pinned commit, built with the machine's Java around `scripts/oracle/PlSqlEmitter.java` (the tool jar and grammar cached, checksummed, under `~/.cache/live-documentation/oracle-plsql`; without Java it says so and exits). SQL*Plus lines are blanked for both readers; the grammar resolves no names, and what it cannot judge is stated at the head of `scripts/oracle/plsql-compare.ts`. `--detail` lists every disagreement, `--json` prints data |
| `npm run oracle:sql -- <fixture> --write` | Keeps ScriptDom's record as the fixture's `expected/sql-scriptdom.json`, which `tests/integration/live-docs/sql-oracle.test.ts` holds the adapter to, against a register of measured misses |
| `npm run oracle:sqlite -- <folder>` | Runs each `.sql` file of the folder alone in an empty SQLite database in memory, through the SQLite Node carries (`node:sqlite`, nothing to install), and sets the tables and views its `main` schema then holds beside what the SQL reader declares; `--detail` lists every difference, `--write` keeps the answer as the folder's `expected/sqlite-schema.json`, which `tests/integration/live-docs/sqlite-oracle.test.ts` holds the reader to. SQLite's spelling alone: no oracle of MySQL's or PostgreSQL's is at hand (since 2026-11-21, [the record](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/README.md)) |

The C# reader is graded on a whole folder by the C# compiler's own binding since 2026-11-21:

| Command | What it does |
| --- | --- |
| `npm run oracle:csharp -- <folder>` | Builds one Roslyn compilation for each project of the folder through `scripts/oracle/csharp-compiler.cs` (a .NET file-based program; it needs the .NET SDK, and NuGet on its first run), each project's references taken from MSBuild's evaluation or, where MSBuild cannot evaluate it, from its XML's elements, said in the report; binds every simple name; reads the same C# files with the C# adapter; and prints the C# file pairs each draws and both, the adapter's own by cause (a namesake, a reference under a condition the default configuration does not meet, the rest) and the compiler's own. `--detail` lists every disagreement, `--json` prints data, `--write` keeps the compiler's record as a fixture's `expected/csharp-compiler.json`, read thereafter without .NET |

The PowerShell reader is graded on a whole folder by PowerShell's own parser since 2026-11-21 ([the account of the grading](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/README.md)); its fixtures are held file by file by `tests/integration/live-docs/powershell-oracle.test.ts`:

| Command | What it does |
| --- | --- |
| `npm run oracle:powershell -- <folder>` | Reads every `.ps1`, `.psm1` and `.psd1` file of the folder with PowerShell's parser through `scripts/oracle/powershell-ast.ps1` (it needs `pwsh`), asks the same pwsh, in a clean session, for the names it answers by itself (`scripts/oracle/powershell-shipped.ps1`: its commands, its functions without a module, its aliases), applies the rules of `scripts/oracle/powershell-wires.ts` to the parser's facts with those names, reads the same files with the PowerShell adapter, and prints the wires (file pairs, by a load or a call), the calls (file, function, defining file) and the programs each side draws, and how many both do. Every file of the folder is the adapter's index, but the version control's folder and a folder of Live Docs. `--detail` lists every disagreement, `--json` prints data |

What it grades is the adapter's reading of the facts and the adapter's fixed list of PowerShell's own names, against the parser and against pwsh. What it cannot grade is the rule which file a call reaches ("loaded, else unique"): both sides hold the same rule, so a wrong rule agrees with itself; nor which files are tests, which both sides take from the product's `resolveArchetype`; nor the names only Windows PowerShell 5.1 answers (`sort`, `curl`, `mkdir`), which the adapter takes from Microsoft's documentation and the pwsh here, 7 on Linux, does not have, so that where they matter the two readings differ by them. A record given in place of a run, as the fixtures' tests give one, is read with the names kept in `scripts/oracle/powershell-shipped.json`. Only the hand reading of 222 sampled wires of 2026-11-19 grades the rule itself ([its rows](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/samples.md)): `npm run oracle:powershell -- <folder> --verdicts <samples.md> --corpus <name>` sets that corpus's rows beside the rule's calls and the adapter's, true wires drawn and missed and false wires spared and drawn, and names the rows it cannot score (the shop's, whose corpus was never committed). The table names the corpora `dbatools`, `al-go`, `azurestack-tools` and `tsqlt`; they are fetched by hand at the commits [the account of the grading](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/README.md) names.

What the comparison grades as a use of an object, and what it sets aside as no object of the folder (common table expressions, a statement's own table sources, temporary tables, SQL Server's system schemas and the `xml` type's methods), is stated once, at the head of `scripts/oracle/sql-compare.ts`. So is how it binds a name, since 2026-11-21 by the order Microsoft documents and not by the product's matching, each sentence quoted with its page: a one-part name in a procedure, function, view or trigger by the module's schema, then `dbo`; elsewhere, in a module's DDL and strings, and in `database..name`, by the user's default schema, taken as `dbo` ([the account](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)).

**What a scan leaves out** (`packages/engine/src/tooling/leaveOut.ts`, since 2026-11-21) has two oracles of its own, both in the `unit` project.
- `leaveOut.oracle.test.ts` asks git itself, `git check-ignore -v -n --no-index`, of trees it makes in fresh repositories.
- `leaveOut.tfvc.test.ts` reads `__fixtures__/tfignore-oracle.json`: the verdicts of Microsoft's own TFVC matcher (Team Explorer Everywhere's, compiled unchanged), recorded by the probe's `record-tfvc-oracle.mjs`. Recording needs Java and Microsoft's sources. Reading needs neither, so the recording is redone only when the trees change, as `oracle:index` is for a compiler's edges.

[The probe](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/leave-out/README.md) says how the TFVC oracle is built and what the function agreed on.

---

## SlopCop audits

Markdown and asset hygiene for every `.md` in the repository. The chat archive, notes and scripts under `AI-Agent-Workspace/` are excluded; its README and `Memory/` are audited. See `slopcop.config.json`.

| Command                    | Checks                                                                    |
| -------------------------- | ------------------------------------------------------------------------- |
| `npm run slopcop:markdown` | Relative links resolve; heading anchors match the configured slug dialect |
| `npm run slopcop:assets`   | HTML and CSS asset references resolve                                     |
| `npm run slopcop:symbols`  | Live Doc symbol anchors are well-formed                                   |

All accept `--json`.

---

## Fixtures

Fixture workspaces live under `tests/integration/fixtures/` (hand-authored scenarios) and `tests/integration/programs/` (per-language sample programs, including the eight Rosetta implementations). They are plain directories that the integration suites and the oracle copy into a temporary workspace; the only thing written back is a fixture's `expected/` directory, by `oracle:index`. See [Sample Programs](../layer-3/sample-programs.mdmd.md).

---

## Other maintainer commands

| Command                                   | Purpose                                                                                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run live-docs:generate -- --dry-run` | Report mirror drift without writing; the cheapest "is the mirror current?" check                                                                  |
| `npm run live-docs:orphans`               | Live Docs whose source file no longer exists. The generator never prunes a doc that has authored content, so run this after deleting source files |
| `npm run build`                           | `tsc` for the engine, the Explorer and the generator                                                                                              |
| `npm run lint`                            | Type-aware ESLint over the configured source and tests. |
| `npm run live-docs:visualize:estate`      | Build the estate sample's Explorer, from a copy of it, into `dist/explorer/samples/estate/`; `test:e2e` runs it before the suite                  |
| `npm run live-docs:visualize:tidepool`    | Build the tidepool sample's Explorer, a small TypeScript game whose directories mix implementation, tests, binary assets and documents, into `dist/explorer/samples/tidepool/`. Not part of the gate |
| `npm run live-docs:visualize:history-sample` | Build the scripted repository's Explorer with its complete history, a last-four-commit window and a symbol-identity collision sample under `dist/explorer/samples/history/`, `history-window/` and `history-collision/`. |

### Local Map layout lab

`npm run layout:lab -- <capture|sweep|restarts|verify> <bundle/scope>` captures a deck scope's cards from the built page, sweeps the pure layout's levers headlessly, compares ordering starts with the page's costs, or verifies a configuration in the page with the deck's instrument. Run reports go to the open dev day's `Probes/layout-lab/` under `AI-Agent-Workspace/AgentSessionHistory/<year>/<month>/<day>/`, the newest day directory that holds a session's record. Page captures are disposable and rebuilt on demand, not committed.

### Contact sheet

`npm run contact:sheet -- --bundle <built bundle> --preset <repository|estate|tidepool> --out <dir>` draws one built Explorer at 1,440 by 900 in a fixed list of views (the 2D map with a directory open at three zooms, a pinned file, both keys, the 3D map at its start, pinned and in Structure with assets and documents, the history's Dim and Glow, the World Map light and dark, the reader and Knowledge Sources; those the bundle cannot show are left out) and writes each picture and `sheet.png`, one image of labelled tiles. `--hook <module>` names a module whose default export runs on each fresh browser context before its page loads, for a saved setting such as a palette; `--label` names the sheet; `--dir` and `--pin` replace a preset's directory and file; `--only` draws named views. Written for the colour pass of 2026-11-16, so that palettes are compared over the same views; its pictures go to scratch or the day's probe folder.

---

## Related

- [AGENTS.md](../../AGENTS.md) — working rules and the commands that matter day to day
- [CLI Reference](../layer-1/guides/cli-reference.mdmd.md) — user-facing commands
