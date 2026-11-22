# `packages/engine/src/live-docs/adapters/json.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/adapters/json.ts`
- Generated At: 2026-11-22T04:01:36.152Z

## Authored
### Purpose
Polyglot language adapter for JSON files: file-path references in configuration as graph dependencies, key paths as symbols, and a `package.json` as a manifest, whose package is its symbol, whose dependencies link workspace packages by name, and whose scripts, binaries and main module declare the files they start.

### Notes
- Unlike code-oriented adapters, JSON files have no exported symbols; this adapter focuses exclusively on dependency detection.
- Uses a **workspace file index** (built at discovery time) to validate candidate strings against known workspace files, avoiding filesystem crawling and ensuring only tracked files produce dependencies.
- Path resolution strategies: (1) direct workspace-relative match, (2) resolution relative to the JSON file's directory (for `./` and `../` paths), and (3) bare filename lookup in the same directory.
- Skip patterns filter out URLs, version strings, glob patterns, and scoped npm package names to minimize false positives.
- Created 2026-01-15 as part of the JSON Adapter commit, following Option B architecture (generic reference detection with file index validation) per the user's architecture guidance.
- Since 2026-10-15 ([Turn 4](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-15/2026-10-15.1.record.md#turn-4); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)) a manifest declares entries: the workspace file each script runs is the first token of each command (split at `&&`, `||`, `;` and `|`) that names a workspace file and is not a tooling input, flags passed over, so `tsx --tsconfig ./tsconfig.base.json scripts/run.ts` runs the script and `tsc -p tsconfig.json` runs nothing; `bin` and `main` are mapped from their built path to the source through the tsconfig beside the manifest, read with the compiler's own `readConfigFile` and `parseJsonConfigFileContent` so that `extends` holds, a file under `outDir` looked for under `rootDir` (or the package and its `src` without one) with the TypeScript extension that compiles to it. The first run over this repository had taken `src/client/tsconfig.json` for what the explorer's build runs, since a flag had been read as taking the flag after it; the tooling-input rule replaced that guess.
- Since 2026-10-16 the `package.json` branch writes its symbol and dependencies through `manifest.ts`, which the Cargo, pyproject, go.mod and pom adapters share, and links a dependency only to another `package.json` publishing its name, so that a crate or an artifact of the same name is never taken for the package.
- Reads JSON with comments and trailing commas (2026-10-16, [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#c-and-c-read-by-the-grammar-the-include-rule-chosen-by-measurement-and-discovery-that-reads-every-suffix-anywhere-recorded-2026-10-16)): `toStrictJson` drops line and block comments, a comma that only precedes a closing bracket and a byte order mark, leaving strings intact, and the result goes to `JSON.parse`, so a malformed document still fails as it did. TypeScript's own JSON reader was not used: its diagnostics are internal and it reads malformed JSON leniently. One lenient corner: an unterminated block comment at the very end of an otherwise valid document is dropped rather than failing.
- Since 2026-11-19 a key path beneath an empty key keeps its leading `:` (`{"": {"a": 1}}` has the paths `""` and `:a`), apart from a key of its own name, and every sort is `compareText`'s, which no runtime's collation changes. The reading of package scripts through wrapper commands, tried on the history's branch that day, was taken out again; the next note is the round that followed.
- Since 2026-11-19 a script is read as a shell splits it ([the measurement](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/script-entries/README.md)), where before it was cut at its separators alone:
  - quotes keep a word whole;
  - a `#` that begins a word begins a comment;
  - `&` separates commands;
  - a redirection's file (`>`, `<`, `>>`, `&>`, `<<<`) is not a word.

  A quoted word that holds whitespace and names no file is a command line of its own. So the commands that `concurrently`, `start-server-and-test`, `nodemon --exec` and `sh -c` are handed are found without a list of wrappers. In each command, the first file that is not a tooling input is still what the command runs.

  The measurement covered 983 real scripts: this repository's whole history, its samples, and the packages under `node_modules`. On them the change altered no entry of this repository, and elsewhere it removed six false or arguable entries, each a file a redirection writes or reads. Two broader rules were measured there and refused:
  - Taking every word that names a code file found no new start and made 13 false ones, among them minifier outputs and copy targets.
  - Reading a command after a bare `--` gave the same answers on every real script. Its gains and its one false entry came only from constructed cases.

  `filesRunBy`'s remarks list the answers still known to be wrong, and a test pins each one.
- Since 2026-11-21 the tsconfig beside a manifest is read with names taken as written (`useCaseSensitiveFileNames: true` in `compilerPaths`), where before the setting was asked of TypeScript's host on Node, `ts.sys`. Its answer differed between Windows and Linux for the same folder, and in a browser page, where TypeScript has no host, the read threw and the manifest was not mapped: the only difference [the check that the engine runs in a page](../../../../../tests/page-scan/differences.json.mdmd.md) found over every fixture ([the November 21 record, Turn 2](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)). The parse of every tsconfig in this repository and its fixtures gives the same `outDir` and `rootDir` under either setting, and so does a constructed one with capitals in its paths and its `extends`; a test holds the reader to one result with the host as it is, answering that names fold, and absent.
- Since 2026-11-22 the files a package's own name loads are taken as Node takes them (`packageModules`): from `exports` when the manifest has it, for the subpath `.`, written as a string, a list of fall-backs, or conditions, and then `main` is not read, since Node does not read it; from `main` otherwise. The conditions read are those Node matches by default, for a program that imports the package and for one that requires it (`node`, `node-addons`, `import` or `require`, `module-sync`, `default`), and not `types`, which names declarations, nor a bundler's own. A manifest whose `exports` holds patterns alone, as the engine's and the Explorer's do, has no module entry. Before, `main` alone was read, so `packages/stored-form/src/storedForm.ts`, named only as `exports["."].default`, was no entry. `json.exports.test.ts` holds eleven shapes to Node's own resolver, asked both ways. Later the same day, held to Node over every package of this repository's `node_modules` (`tests/integration/live-docs/package-modules.oracle.test.ts`), the reader also follows Node's legacy resolution of `main`. It tries the path `main` names, then that path with `.js`, `.json` or `.node`, then its `index` with each, and last the package's own `index`. The first of these that the listing holds is the entry, so a package with no `main` and an `index.js` has that file as its module. 273 of 281 packages agree, where 229 did.
- Since 2026-11-22 the tsconfig is read through the run's reads, ahead of TypeScript's host, which must answer at once (`compilerPaths`; [the road to one engine for a page and a command line](../../../../../../layer-3/engine-and-hosts.mdmd.md#6-the-road), step 3).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `packageModules` {#symbol-packagemodules}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/json.ts#L136)

##### `packageModules` — Summary
The files a package's own name loads, as Node resolves it, each as the paths Node tries in its order, the first that
is a file being the one: from `exports` when the manifest has it, for the subpath `.` (a string, a list of
fall-backs, or conditions, written under `.` or as the whole of `exports`), one path, and then `main` is not read, as
Node does not read it; otherwise by Node's legacy resolution of `main`: the path it names, then with `.js`, `.json`
or `.node` after it, then its `index` with each of those, and last the package's own `index.js`, `index.json` or
`index.node`, which is all there is to try without `main`. One list for a program that imports the package and one
for a program that requires it, when the two differ. A manifest whose `exports` names no `.`, only patterns such as
`./*`, has no file its name loads.

Until 2026-11-22 only `main` was read, as written, so a package that names its entry in `exports` alone, as
`packages/stored-form` does, had none, nor did one whose `main` leaves off its extension or names a folder, nor one
with no `main`. Held to Node's own resolver over every package of this repository's `node_modules`
(`tests/integration/live-docs/package-modules.oracle.test.ts`).

#### `collectKeyPaths` {#symbol-collectkeypaths}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/json.ts#L673)

##### `collectKeyPaths` — Summary
Every key path in a JSON document, joined with `:` the way `IConfiguration` addresses
nested settings (`Hangfire:Queue`). Arrays are not descended into.

#### `jsonAdapter` {#symbol-jsonadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/json.ts#L687)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `jsonAdapter` — Summary
Language adapter for JSON and JSONC files. Publishes key paths as public symbols and detects file-path references in string values.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `statSync`
- `node:path` - `path`
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`index.WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`manifest.ManifestContext`](./manifest.ts.mdmd.md#symbol-manifestcontext-interface)
- [`manifest.ManifestDependencies`](./manifest.ts.mdmd.md#symbol-manifestdependencies)
- [`manifest.manifestContext`](./manifest.ts.mdmd.md#symbol-manifestcontext-function)
- [`manifest.packageSymbols`](./manifest.ts.mdmd.md#symbol-packagesymbols)
- [`manifest.stringOf`](./manifest.ts.mdmd.md#symbol-stringof)
- [`manifest.tableOf`](./manifest.ts.mdmd.md#symbol-tableof)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`coreTypes.DeclaredEntry`](../coreTypes.ts.mdmd.md#symbol-declaredentry) (type-only)
- [`openings.isToolingFile`](../openings.ts.mdmd.md#symbol-istoolingfile)
- [`processMark.READING_DEPTH`](../processMark.ts.mdmd.md#symbol-reading_depth)
- [`processMark.TREE_DEPTH`](../processMark.ts.mdmd.md#symbol-tree_depth)
- [`processMark.jsonChildren`](../processMark.ts.mdmd.md#symbol-jsonchildren)
- [`processMark.markProcess`](../processMark.ts.mdmd.md#symbol-markprocess)
- [`processMark.nestingBeyondDepth`](../processMark.ts.mdmd.md#symbol-nestingbeyonddepth)
- [`compareText`](../../tooling/compareText.ts.mdmd.md#symbol-comparetext)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- [`sourceText.SourceReads`](../../tooling/sourceText.ts.mdmd.md#symbol-sourcereads)
- [`sourceText.readSourceReading`](../../tooling/sourceText.ts.mdmd.md#symbol-readsourcereading)
- [`sourceText.readSourceText`](../../tooling/sourceText.ts.mdmd.md#symbol-readsourcetext)
- [`sourceText.throwIfMachineFailure`](../../tooling/sourceText.ts.mdmd.md#symbol-throwifmachinefailure)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/openings.mdmd.md`](../../../../../../layer-3/openings.mdmd.md)
- [`.mdmd/layer-3/polyglot-adapters.mdmd.md`](../../../../../../layer-3/polyglot-adapters.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
