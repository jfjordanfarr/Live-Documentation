# Internal Tooling Reference

_Current as of 2026-11-16._

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

Flags: `--e2e` appends an Explorer build and the Playwright suite; `--skip-git-status` skips the clean-tree check, which is what CI does as `npm run ci-check`.

The gate stops at its first red stage, so the stages after it have not run. When that stage is red for a reason apart from the change (a deadline on a slow machine), run the rest one by one (`npm run livedocs`, `lint`, `test:unit`, `test:integration`, `test:e2e`) before landing further work on top; a handful of browser files chosen by hand is not the suite. On 2026-11-13 rounds were landed on browser files chosen by hand, the gate then stopped at a unit deadline before its browser stage, and two more rounds landed on top; the suite, run that night, showed that an afternoon's round had broken the Local Map's layout search. A command started in the background reports its own end; a wait written as `until ! pgrep -f "<its command>"` finds its own shell and never ends (fourteen of them ran for ten hours that day).

### `npm run verify`

Lint, build, type-check, both Vitest projects, and link enforcement, without the rest of the chain.

---

## Tests

| Command                    | What it runs                                                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run test:unit`        | The Vitest `unit` and `unit-serial` projects: `packages/*/src`, `scripts/` and the SlopCop suites; the deadline-bound physics suite runs alone, after the rest |
| `npm run test:integration` | The Vitest `integration` project (`tests/integration/live-docs/`): generator determinism, polyglot fixtures, CLI pathfinding, Rosetta parity, the oracle (~20 s)                           |
| `npm run test:e2e`         | Playwright against the built Explorer, estate and history samples (`tests/e2e/`): every view, explicit changes between 2D and 3D, Back and Forward, the design audit and the still-picture instrument |

Both Vitest projects import TypeScript sources directly, so neither needs a build first. The Playwright specs check each view's plumbing (state in the URL, containment, stable layout, explicit changes between 2D and 3D), not whether the picture is right; the owner said as much on 2026-09-28. Two instruments say a little more: `tests/e2e/design-audit.ts` (2026-09-29) fails a spec when words collide or are cut off, and `tests/e2e/still-picture.ts` (2026-10-01) measures what one picture shows legibly against predictions written in `AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-01/Probes/still-picture-deck.md`. Taste is still judged by eye. The AST accuracy benchmark was retired on 2026-09-27: it scored an inference path the product did not ship, against per-fixture thresholds as low as 5% recall. Its replacement is the oracle below.

**What the browser suite costs, and what changes it** (measured 2026-11-17; [the record of that day](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#work-notes-after-turn-6-what-the-mount-costs-and-what-a-worker-costs)). Its 488 cases are about 88 minutes of case time, one after another, and no file is more than a fourteenth of it. A case is the page doing its own work: a cold load is about a second of the page's main thread, a 2D Local Map picture two to three and a half, so the suite's time follows the product's speed. Three things outside the product change it:

- **The renderer.** A headless Chromium draws WebGL in software unless the container was given the host's graphics card ([the devcontainer's README](../../.devcontainer/README.md#the-hosts-graphics-card-windows-wsl2)). `tests/e2e/browser-launch.ts` launches on the card where it finds one, and the first line of every run names the renderer that drew it; read that line before any of a run's times. On the card the whole suite took 98 minutes at one worker where software took about two hours, and the 3D cases that stood on their time limits pass.
- **The workspace's disk.** Where the workspace is a folder on a Windows drive, each file opened in it costs 4 to 6 ms, and a run spent 54 s finding its cases before `node_modules` was moved to a volume on the container's disk ([the README again](../../.devcontainer/README.md#dependencies-on-the-containers-own-disk)). A search across the whole tree while a browser run is under way slows that run's cases past their limits.
- **Workers.** A browser with its test keeps about a thread and a half busy on the card and two in software, and the machine these numbers come from has ten cores. Four workers stretched every case by half and failed two or three in a hundred on waits that ran out; eight stretched them more than twofold. The suite runs at one worker until a count is found that passes what one worker passes.


The [Explorer remediation checklist](../layer-3/live-documentation-explorer.mdmd.md#remediation-work) records journeys and visual acceptance criteria. Try the relevant journeys in the built page on both the main repository and estate before writing their browser checks. Assert that path results and reverse recovery are rendered and usable in both representations, labels and controls remain readable, and identity survives orbit, zoom, filtering, history and representation changes. Element existence and persisted state alone did not catch the review's failures; DOM collision checks also cannot establish that projected 3D wires look attached to the right spheres. Keep the existing audits and thresholds. Non-finite layout positions must fail measurement, never be reported as settled.

---

## Oracle

The oracle measures the shipped generator against a compiler, which shares no mechanism with it. Both commands take a fixture directory and never write into it except under `expected/`.

| Command                               | What it does                                                                                                                                                                                                                                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run oracle:index -- <fixture>`   | Copies the fixture, runs the SCIP indexer its project file selects (`scip-dotnet`, `scip-go`, `rust-analyzer`, `scip-java`, `scip-typescript`, or `scip-python` for a directory of `.py` files), and writes every compiler-resolved edge to `expected/compiler-edges.json` |
| `npm run oracle:compare -- <fixture>` | Runs the generator over a copy of the fixture and lists every disagreement with `expected/compiler-edges.json` and, if present, `expected/hand-verified-edges.json`. A list, not a score; exit code 0 either way. `--json` for data                                        |

The converter lives in `scripts/oracle/scip-edges.ts` with its unit test beside it.

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
| `npm run build`                           | `tsc` for the engine, the Explorer and the generator; the CLI package is not included                                                             |
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
