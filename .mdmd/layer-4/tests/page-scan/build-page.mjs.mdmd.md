# `tests/page-scan/build-page.mjs`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/build-page.mjs`
- Generated At: 2026-11-21T03:40:56.621Z

## Authored
### Purpose
Builds the scanning page: the engine and generator as they stand, bundled by esbuild for a browser with the stand-ins in place of Node's modules and of `glob`, the grammars inlined as gzip in base64, and one inline script admitted by its hash. `npm run e2e:bundles` writes it to `dist/page-scan/`; `bundleScanner` is also the browserless first level of the check.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- The stand-ins are put in place by a plugin rather than esbuild's `alias`, so that a module of the engine or the generator importing any other of Node's modules stops the build with a sentence naming both; a named import of a function a stand-in lacks stops it too (esbuild's own "No matching export"). A package from `node_modules` may import modules without a stand-in (TypeScript does, for its command line); those are left unresolved and listed in `node-needs.json`.
- `adapters/treeSitter.ts` finds its grammars by `__dirname` and `require.resolve`: the build defines the first and injects a counted stand-in for the second, both answering under `ENGINE_ROOT`, and the page puts each grammar at the path the engine computes, so that the engine's choice between its own PowerShell grammar and the bundled ones is made as under Node.
- `inputs.json` holds the digest of every file the page was built from, so that the spec refuses a page built from other sources; esbuild's inputs that are no file (`(disabled):source-map-support`) are left out.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `REPO` {#symbol-repo}
- Type: const
- Source: [source](../../../../tests/page-scan/build-page.mjs#L23)

#### `STAND_INS` {#symbol-stand_ins}
- Type: const
- Source: [source](../../../../tests/page-scan/build-page.mjs#L32)

##### `STAND_INS` — Summary
The stand-in that answers in the page for each of Node's modules the scan's path imports, and for `glob`. A module
of the engine or the generator that imports any other of Node's modules stops the build, naming both: that is a new
dependence on Node, to be given a stand-in and listed. A package from `node_modules` may import others (TypeScript
does, for its command line's file system, which `createSourceFile` never touches); they are left unresolved, so
that a call of one throws in the page, and `node-needs.json` lists them.

#### `GRAMMARS` {#symbol-grammars}
- Type: const
- Source: [source](../../../../tests/page-scan/build-page.mjs#L47)

##### `GRAMMARS` — Summary
The `.wasm` files the readers load, repository-relative: the tree-sitter runtime, the engine's own build of the
PowerShell grammar, and the bundled grammars the other readers name (`readTree("<grammar>", …)`). The page puts each
at `ENGINE_ROOT/<this path>`, which is where the engine looks.

#### `bundleScanner` {#symbol-bundlescanner}
- Type: function
- Source: [source](../../../../tests/page-scan/build-page.mjs#L76)

##### `bundleScanner` — Summary
The bundle of the page's script, built in memory: its text and esbuild's metafile.

#### `bundleInputs` {#symbol-bundleinputs}
- Type: function
- Source: [source](../../../../tests/page-scan/build-page.mjs#L103)

##### `bundleInputs` — Summary
The files a bundle was built from, repository-relative, each with the digest of its bytes, to tell a page built
from other sources. Esbuild also names inputs that are no file (`(disabled):source-map-support`, a module a
package's `browser` field turns off), which are left out.

#### `buildScanPage` {#symbol-buildscanpage}
- Type: function
- Source: [source](../../../../tests/page-scan/build-page.mjs#L108)

##### `buildScanPage` — Summary
Writes `page.html` and `inputs.json` into `out`; returns the page's path.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `esbuild` - `build`
- `node:crypto` - `createHash`
- `node:fs` - `fs`
- `node:module` - `isBuiltin`
- `node:path` - `path`
- `node:url` - `fileURLToPath`, `pathToFileURL`
- `node:zlib` - `gzipSync`
- [`engine-root.ENGINE_ROOT`](./stand-ins/engine-root.mjs.mdmd.md#symbol-engine_root)
<!-- LIVE-DOC:END Dependencies -->
