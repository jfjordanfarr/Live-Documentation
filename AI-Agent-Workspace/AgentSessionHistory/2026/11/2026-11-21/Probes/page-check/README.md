# The engine in a page, held by a standing check

Historical evidence, taken on November 21, 2026 by a builder for the root, on branch `page-check` from `501a993f2`. It records what the standing check that the engine runs in a browser page found on its first runs. The check itself is permanent and current: its files are under `tests/page-scan/` and `tests/e2e/page-scan.spec.ts`, its commands are in [the internal tooling reference](../../../../../../../.mdmd/layer-2/internal-tooling.mdmd.md#the-engine-in-a-page). Nothing here changed the engine, the generator or the Explorer.

Why it exists, in the owner's words of [Turn 1](../../2026-11-21.1.record.md#turn-1) and [Turn 2](../../2026-11-21.1.record.md#turn-2) of that day: "Each copy of Live Documentation Explorer should be capable of writing a new fresh blank copy of Live Documentation Explorer, eagerly ready to take in its first scan!", and "With really awesome architecture, this shouldn't feel like a death sentence to switch between one and another (CLI versus browser window)." [The probe of November 19](../../../2026-11-19/Probes/execution-surface/README.md) had bundled the unchanged engine into a page through stand-ins for Node's modules and found its output identical to Node's on the estate sample. Two days later it no longer built: `tooling/gitIgnored.ts` had come to import `node:process` and to call `fs.lstatSync` and `fs.statSync` with `{ throwIfNoEntry: false }`, and nothing said so. The check is that probe made permanent, over every family of code the tool reads, and made to speak when the engine moves.

## What the check is

1. **Without a browser** (`npm run test:integration`): the scanning bundle builds from the engine as it stands with exactly the stand-ins the check ships; what of Node the scan's path needs, read from esbuild's own account of the bundle (its metafile) and each module's syntax tree, is the committed `tests/page-scan/node-needs.json`; each stand-in answers for exactly the members that list names; and every reader the engine registers reads files of some fixture.
2. **In Chromium** (`tests/e2e/page-scan.spec.ts`, through the lane): each of the 45 sample programs and fixtures is copied outside every git repository, handed to the page opened from `file://` through its `<input webkitdirectory>`, and scanned; then Node's generator scans the same copy in a process of its own. Both are given the same clock, and every file each wrote is compared whole.
3. **A ledger** (`tests/page-scan/differences.json`): a difference it does not list fails the case, and so does a listed one that no longer occurs.

## The fixtures

Run of 03:36 UTC, 45 cases, all passing with the ledger, 150.9 s held in the lane at one worker; the machine's load average was about 8 to 10, shared with three other builders. A second run at 03:50, with the integration suite running beside it, passed too in 250.4 s: the whole set fits one hold of five minutes, though not by much on a loaded machine; `--grep "fixtures/"` and `--grep-invert "fixtures/"` halve it. "Page s" and "Node s" are `generateLiveDocs` from its call to its return, the folder already in memory in the page and on disk for Node. "Read" counts the files the page's scan read through the stand-in for `fs`, the docs it read back to build the index among them, and the reads of them; "most" is the most any one file was read.

| Fixture | Files | Written, page / Node | Result | Page s | Node s | Read | Reads | Most |
| --- | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: |
| c/basics | 5 | 6 / 6 | identical | 0.13 | 0.19 | 10 | 26 | 5 |
| c/modular | 8 | 9 / 9 | identical | 0.16 | 0.26 | 16 | 43 | 5 |
| c/rosetta | 12 | 13 / 13 | identical | 0.24 | 0.33 | 24 | 64 | 5 |
| cpp/rosetta | 12 | 13 / 13 | identical | 0.24 | 0.31 | 24 | 64 | 5 |
| csharp/basic | 7 | 8 / 8 | identical | 0.18 | 0.24 | 14 | 41 | 5 |
| csharp/estate | 38 | 37 / 37 | identical | 0.32 | 0.47 | 74 | 201 | 5 |
| csharp/rosetta | 13 | 14 / 14 | identical | 0.20 | 0.29 | 26 | 77 | 5 |
| csharp/webforms | 7 | 8 / 8 | identical | 0.16 | 0.24 | 14 | 38 | 5 |
| fixtures/blazor-telemetry | 4 | 5 / 5 | identical | 0.14 | 0.19 | 8 | 22 | 5 |
| fixtures/c-include-excluded | 4 | 4 / 4 | identical | 0.10 | 0.15 | 7 | 12 | 4 |
| fixtures/csharp-advanced-symbols | 13 | 10 / 10 | identical | 0.19 | 0.24 | 22 | 58 | 5 |
| fixtures/csharp-reflection | 2 | 3 / 3 | identical | 0.10 | 0.13 | 4 | 12 | 5 |
| fixtures/entry-points | 11 | 11 / 12 | 4 files differ (ledger) | 0.09 | 0.17 | 21 | 51 | 4 |
| fixtures/include-dirs | 13 | 13 / 13 | identical | 0.13 | 0.19 | 25 | 65 | 5 |
| fixtures/link-targets | 5 | 1 / 1 | identical | 0.05 | 0.11 | 5 | 9 | 4 |
| fixtures/manifests | 17 | 18 / 18 | identical | 0.20 | 0.27 | 34 | 83 | 6 |
| fixtures/powershell-compendium | 7 | 8 / 8 | identical | 0.13 | 0.20 | 14 | 35 | 4 |
| fixtures/queue-worker | 4 | 5 / 5 | identical | 0.11 | 0.18 | 8 | 23 | 5 |
| fixtures/razor-appsettings | 4 | 5 / 5 | identical | 0.13 | 0.22 | 8 | 22 | 5 |
| fixtures/slopcop-assets | 15 | 16 / 16 | identical | 0.08 | 0.13 | 30 | 42 | 4 |
| fixtures/slopcop-symbols | 5 | 3 / 3 | identical | 0.06 | 0.11 | 7 | 13 | 4 |
| fixtures/spa-runtime-config | 3 | 4 / 4 | identical | 0.07 | 0.16 | 6 | 15 | 4 |
| fixtures/webforms-appsettings | 4 | 5 / 5 | identical | 0.14 | 0.22 | 8 | 22 | 5 |
| go/depot | 15 | 15 / 15 | identical | 0.17 | 0.32 | 29 | 84 | 30 |
| go/rosetta | 9 | 10 / 10 | identical | 0.17 | 0.32 | 18 | 53 | 20 |
| java/basic | 6 | 7 / 7 | identical | 0.16 | 0.17 | 12 | 25 | 4 |
| java/rosetta | 13 | 14 / 14 | identical | 0.21 | 0.26 | 26 | 53 | 4 |
| java/service | 9 | 10 / 10 | identical | 0.13 | 0.21 | 18 | 37 | 4 |
| java/warehouse | 13 | 13 / 13 | identical | 0.23 | 0.26 | 25 | 50 | 4 |
| powershell/rollout | 10 | 10 / 10 | identical | 0.17 | 0.25 | 19 | 46 | 4 |
| python/basics | 3 | 4 / 4 | identical | 0.09 | 0.13 | 6 | 12 | 3 |
| python/ledger | 15 | 15 / 15 | identical | 0.18 | 0.27 | 29 | 58 | 4 |
| python/pipeline | 6 | 7 / 7 | identical | 0.11 | 0.14 | 12 | 24 | 3 |
| python/rosetta | 8 | 9 / 9 | identical | 0.15 | 0.21 | 16 | 32 | 3 |
| ruby/basic | 5 | 6 / 6 | identical | 0.06 | 0.10 | 10 | 25 | 4 |
| ruby/cli | 6 | 7 / 7 | identical | 0.05 | 0.12 | 12 | 30 | 4 |
| ruby/rosetta | 8 | 9 / 9 | identical | 0.06 | 0.12 | 16 | 40 | 4 |
| rust/analytics | 6 | 7 / 7 | identical | 0.13 | 0.20 | 12 | 26 | 5 |
| rust/basics | 4 | 5 / 5 | identical | 0.10 | 0.13 | 8 | 18 | 5 |
| rust/rosetta | 9 | 10 / 10 | identical | 0.13 | 0.19 | 18 | 38 | 5 |
| rust/stockroom | 11 | 11 / 11 | identical | 0.15 | 0.21 | 21 | 43 | 5 |
| typescript/basic | 6 | 7 / 7 | identical | 0.07 | 0.14 | 12 | 30 | 4 |
| typescript/layered | 7 | 8 / 8 | identical | 0.09 | 0.20 | 14 | 35 | 4 |
| typescript/rosetta | 9 | 10 / 10 | identical | 0.17 | 0.29 | 18 | 45 | 4 |
| typescript/tidepool | 53 | 38 / 39 | 2 files differ (ledger) | 0.18 | 0.36 | 90 | 185 | 7 |
| **all 45** | **444** | | **43 identical** | **6.31** | **9.61** | **850** | **2,027** | |

Times are context, not a comparison of engines: the page's folder was already in memory, and each figure is one run on a shared machine. Files a fixture keeps for the oracle (`expected/`) and build outputs are not copied, as `scripts/oracle/fixture.ts` copies fixtures for every other suite.

**Which fixture reaches which reader** (`tests/page-scan/fixtures.test.ts`). All nineteen registered readers are reached; none is missing.

| Reader | Fixtures |
| --- | --- |
| aspnet-markup | csharp/estate, csharp/webforms, fixtures/blazor-telemetry, razor-appsettings, webforms-appsettings |
| c-basic (C and C++) | c/basics, c/modular, c/rosetta, cpp/rosetta, fixtures/c-include-excluded, include-dirs |
| cargo | rust/analytics, basics, rosetta, stockroom, fixtures/manifests |
| csharp | the four csharp programs and six fixtures |
| css | typescript/tidepool, fixtures/entry-points, slopcop-assets |
| dotnet-config | csharp/estate, csharp/webforms, fixtures/webforms-appsettings |
| dotnet-project | the four csharp programs |
| go, go-mod | go/depot, go/rosetta, fixtures/manifests |
| html | typescript/tidepool, fixtures/slopcop-assets |
| java, maven-pom | the four java programs, fixtures/manifests |
| json-config | sixteen fixtures, the c, cpp and typescript programs among them |
| powershell-basic | powershell/rollout, fixtures/powershell-compendium |
| pyproject | python/ledger, fixtures/manifests |
| python | the four python programs, fixtures/manifests |
| ruby-basic | the three ruby programs |
| rust | the four rust programs, fixtures/manifests |
| sql | csharp/estate alone |

TypeScript and JavaScript, which the compiler reads rather than a registered reader, are read in the four typescript programs and eight fixtures. Images, fonts, recordings, `.sln`, `.def` and `.inc` files reach no reader and get docs without symbols, in the page as under Node.

## The differences, and their one cause

**Later on 2026-11-21, mended in the engine.** At the root's ruling, `compilerPaths` reads names as they are written on every machine (`useCaseSensitiveFileNames: true`) and no longer asks `ts.sys`. Every tsconfig in this repository and its fixtures parses to the same `outDir` and `rootDir` under either setting. A Vitest case of the JSON reader failed on the host being absent before the mend and passes after it. The spec then failed on all six entries as gone, they were taken out, and all 45 folders map identically in the page and under Node (141.4 s held). `hostedByNode` in the needs list is empty. What follows is the state of the first runs.

Six, in two fixtures, all in the ledger, all of one cause in the engine:

| Fixture | File | What differs |
| --- | --- | --- |
| fixtures/entry-points | `workspace/package.json.md` | written under Node only |
| fixtures/entry-points | `workspace/src/cli.ts.md` | no line `Entry: command demo of workspace/package.json` in the page |
| fixtures/entry-points | `workspace/src/lib.ts.md` | no line `Entry: module of workspace/package.json` in the page |
| fixtures/entry-points | `index.json` | no node for `workspace/package.json`, nor its entries |
| typescript/tidepool | `package.json.md` | written under Node only |
| typescript/tidepool | `index.json` | no node for `package.json` |

**The cause.** The reader of `package.json` looks for a `tsconfig.json` beside it (`compilerPaths` in `adapters/json.ts`) and builds TypeScript's configuration host with `useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames`. `ts.sys` is TypeScript's host over Node's file system, which TypeScript builds only when it finds itself under Node. In a page it is undefined, the read throws "Cannot read properties of undefined (reading 'useCaseSensitiveFileNames')", and the generator names `package.json` as a file it could not map. Every other difference follows: no doc, no index node, and no entries for the files the manifest names. No stand-in can answer it, since it is not an import of Node's but a member of a package that exists only under Node; the needs list carries it under `hostedByNode`. What the engine would need: the one setting of its own, chosen where the scan knows the folder (case folds on Windows and macOS, not on Linux; a page cannot ask), in place of TypeScript's host. Then the six entries would no longer occur and the check would fail until they are taken out.

**No difference was a stand-in's fault on the final run.** On the first run every C# file failed in the page ("both async and sync fetching of the wasm failed"): the stand-in for `web-tree-sitter` looked for the runtime's own `.wasm` at another path than the one the page put it at. That was mended in the stand-in, and the estate went from 21 differences to none.

## What of Node the scan's path needs

From `tests/page-scan/node-needs.json` as committed: 36 modules of the engine and generator in the bundle reach Node; 13 of them only for `node:path`. The history engine (`live-docs/history/`, `generator/src/history/`) is not in the bundle at all.

| Module | Needs, `path` aside |
| --- | --- |
| engine/src/tooling/gitIgnored.ts | `child_process` spawnSync; `fs` lstatSync, readdir, readdirSync, statSync; `process` env, nextTick |
| engine/src/tooling/pathUtils.ts | `url` fileURLToPath, pathToFileURL |
| engine/src/tooling/sourceText.ts | `fs` promises.readFile |
| engine/src/live-docs/discovery.ts | `glob`; `fs/promises` readFile, stat |
| engine/src/live-docs/graphFiles.ts | `glob`; `fs` promises.mkdir, readFile, stat, writeFile |
| engine/src/live-docs/dependencies.ts | `fs/promises` stat |
| engine/src/live-docs/heuristics/dom.ts | `fs/promises` readdir |
| engine/src/live-docs/gitUtils.ts | `child_process` execFile; the global `process.env` (only `--changed` reaches it) |
| engine/src/live-docs/adapters/treeSitter.ts | `fs` statSync; the globals `__dirname` and `require.resolve` |
| engine/src/live-docs/adapters/json.ts | `fs` readFileSync, statSync; TypeScript's `ts.sys.useCaseSensitiveFileNames` |
| adapters csharp.ts, go.ts, java.ts | `glob`; `fs` promises.stat |
| adapters rust.ts | `glob`; `fs` promises.access, promises.stat |
| adapters c.ts, python.ts | `fs` readdirSync, statSync (c.ts also promises.stat) |
| adapters aspnet.ts | `fs` promises.stat, statSync |
| adapters css.ts, html.ts, ruby.ts | `fs` statSync |
| adapters csharp.dependencies.ts, project.ts | `fs` promises.stat |
| generator/src/generator.ts | `glob`; `fs/promises` mkdir, open, readFile, readdir, rm, rmdir, stat, writeFile |

`path` is named by all 36 for 14 members: basename, dirname, extname, isAbsolute, join, relative, resolve, sep, and through `path.posix` basename, dirname, extname, isAbsolute, join, normalize. TypeScript, bundled for `createSourceFile`, imports `fs`, `path`, `os`, `crypto`, `perf_hooks` and `inspector` for its command line's host; the first two reach the stand-ins and the rest are left unresolved, and none was called.

**The calls the scans made**, summed over the 45 fixtures (each case's `page-scan.json` has its own): `path.relative` 6,800, `path.join` 5,974, `path.resolve` 3,820, `path.dirname` 3,496, `path.basename` 2,736, `fs.statSync` 2,163, `fs.promises.readFile` 2,144, `path.extname` 2,047, `fs.promises.stat` 742, `fs.lstatSync` 685, `path.isAbsolute` 624, `fs.readdir` (the callback form, through the `fs` discovery hands glob) 556, `fs.promises.mkdir` and `writeFile` 457 each, `url.pathToFileURL` and `fileURLToPath` 414 each, `fs.promises.open` 412, `glob.glob` 225 (five a scan), `path.normalize` 180, `web-tree-sitter.Language.load` 36, `Parser.init` 33, `fs.readdirSync` 33, `fs.promises.readdir` 26, `fs.promises.access` 15. As the page loads, before any scan, `adapters/treeSitter.ts` makes four more to find its grammars: `path.resolve`, `path.join`, `path.dirname` and `require.resolve`, once each (`callsOnLoading`). Never called on these folders: `fs.readFileSync` (the throw above comes first), `fs.promises.rm` and `rmdir` (nothing stale to prune), `process.nextTick`, and `child_process` altogether: in a folder with no `.git` anywhere the engine asks git nothing, in the page or under Node.

Of the 850 files read, 457 were read once (the docs read back for the index, mostly), 120 three times, 175 four, 85 five; `go.mod` was read 30 times in go/depot and 20 in go/rosetta, once for each Go file.

## Against the hand count of November 19

- **Gone from the scan's path:** `existsSync`, and the question to git: on November 19 discovery asked `git check-ignore` once in the page; now a folder in no repository asks nothing.
- **New:** `node:process`, `lstatSync`, `statSync` with `throwIfNoEntry: false`, and a callback `fs.readdir` with `readdirSync`, all in `gitIgnored.ts`, whose `foldersReadAsEmpty` hands glob a file system of its own. The probe's stand-in for `glob` ignored that, so the page would not have walked through it; this check's stand-in walks through it, as glob does. Also new: `fs.promises.access` (rust.ts), `readFileSync` (json.ts), `fs/promises` `readdir` (heuristics/dom.ts), `fs.promises.open` (the generator's binary sniff).
- **Not in the hand count at all:** `ts.sys`, a reach into Node through TypeScript rather than through an import, and the only cause of a difference today.
- **Reads:** November 19 found dbatools' readers reading each file about four times. Here the source files are read three to five times each.

## How each assertion was shown red

- A function added to the stand-in for `fs` and not listed: "fs.mjs exports existsSync, which the scan's path does not name: remove it".
- `lstatSync` taken out of `gitIgnored.ts`'s entry in the committed list: "the scan's path needs other things of Node than node-needs.json says".
- `url` taken out of the build's stand-ins: the build refused, "packages/engine/src/tooling/pathUtils.ts imports node:url, which the scanning page has no stand-in for".
- A doc altered in the page (csharp/basic): an `unlisted` difference, "## Generated (altered in the page)".
- A ledger entry that does not occur (csharp/basic): a `gone` entry.
- A stand-in changed after the page was built: every case refused, "The scanning page was not built from the sources on disk (tests/page-scan/stand-ins/calls.mjs changed)".
