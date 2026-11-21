# `tests/page-scan/node-needs.mjs`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/node-needs.mjs`
- Generated At: 2026-11-21T03:40:56.658Z

## Authored
### Purpose
Reads what of Node the scan's path needs from the scanning bundle: which engine and generator modules are in it and what each imports, from esbuild's metafile, and which members of each module each names, from its syntax tree with the binder's own symbols. `--write` writes `node-needs.json` for review.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- It replaces the hand count of November 19's Part 1. The two accounts are held together: where esbuild and the syntax tree disagree on what a module imports of Node, it throws rather than guess.
- Names are resolved by symbol, so a parameter called `path` is not read as the module; a global (`process`, `Buffer`, `__dirname`, `require`) is a name bound to nothing in the module. Members of namespaces (`fs.promises`, `path.posix`) are read one level further.
- TypeScript's `ts.sys`, its host over Node's file system, exists only where TypeScript runs under Node; a module's use of it is listed under `hostedByNode`, since it is a dependence on Node no stand-in answers. It was the cause of every difference the check found on its first runs, in `adapters/json.ts`, until the engine stopped asking it later that day; the section stays, empty, so that a new use shows as a changed file.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `NEEDS_FILE` {#symbol-needs_file}
- Type: const
- Source: [source](../../../../tests/page-scan/node-needs.mjs#L23)

#### `namedMembers` {#symbol-namedmembers}
- Type: function
- Source: [source](../../../../tests/page-scan/node-needs.mjs#L72)

##### `namedMembers` — Summary
Each of Node's modules (and `glob`) a module imports by name, with the members of each it names; and the globals
of Node it names. A name is the module's only where it is bound to the import, by the binder's own symbols, so that
a parameter called `path` is not read as the module; a global is a name bound to nothing in the module.

#### `nodeNeedsOf` {#symbol-nodeneedsof}
- Type: function
- Source: [source](../../../../tests/page-scan/node-needs.mjs#L117)

##### `nodeNeedsOf` — Summary
The list, from a metafile of the scanning page's bundle.

#### `nodeNeeds` {#symbol-nodeneeds}
- Type: function
- Source: [source](../../../../tests/page-scan/node-needs.mjs#L161)

##### `nodeNeeds` — Summary
The list for the engine as it stands.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:module` - `isBuiltin`
- `node:path` - `path`
- `node:url` - `fileURLToPath`, `pathToFileURL`
- [`build-page.REPO`](./build-page.mjs.mdmd.md#symbol-repo)
- [`build-page.STAND_INS`](./build-page.mjs.mdmd.md#symbol-stand_ins)
- [`build-page.bundleScanner`](./build-page.mjs.mdmd.md#symbol-bundlescanner)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->
