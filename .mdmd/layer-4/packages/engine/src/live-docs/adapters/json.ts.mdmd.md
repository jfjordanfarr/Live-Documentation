# packages/engine/src/live-docs/adapters/json.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/json.ts
- Generated At: 2026-10-22T16:47:51.974Z

## Authored
### Purpose
Polyglot language adapter for JSON files: file-path references in configuration as graph dependencies, key paths as symbols, and a `package.json` as a manifest, whose package is its symbol, whose dependencies link workspace packages by name, and whose scripts, binaries and main module declare the files they start.

### Notes
- Unlike code-oriented adapters, JSON files have no exported symbols; this adapter focuses exclusively on dependency detection.
- Uses a **workspace file index** (built at discovery time) to validate candidate strings against known workspace files, avoiding filesystem crawling and ensuring only tracked files produce dependencies.
- Path resolution strategies: (1) direct workspace-relative match, (2) resolution relative to the JSON file's directory (for `./` and `../` paths), and (3) bare filename lookup in the same directory.
- Skip patterns filter out URLs, version strings, glob patterns, and scoped npm package names to minimize false positives.
- Created 2026-01-15 as part of the JSON Adapter commit, following Option B architecture (generic reference detection with file index validation) per the user's architecture guidance.
- Since 2026-10-15 ([Turn 4](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-4); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)) a manifest declares entries: the workspace file each script runs is the first token of each command (split at `&&`, `||`, `;` and `|`) that names a workspace file and is not a tooling input, flags passed over, so `tsx --tsconfig ./tsconfig.base.json scripts/run.ts` runs the script and `tsc -p tsconfig.json` runs nothing; `bin` and `main` are mapped from their built path to the source through the tsconfig beside the manifest, read with the compiler's own `readConfigFile` and `parseJsonConfigFileContent` so that `extends` holds, a file under `outDir` looked for under `rootDir` (or the package and its `src` without one) with the TypeScript extension that compiles to it. The first run over this repository had taken `src/client/tsconfig.json` for what the explorer's build runs, since a flag had been read as taking the flag after it; the tooling-input rule replaced that guess.
- Since 2026-10-16 the `package.json` branch writes its symbol and dependencies through `manifest.ts`, which the Cargo, pyproject, go.mod and pom adapters share, and links a dependency only to another `package.json` publishing its name, so that a crate or an artifact of the same name is never taken for the package.
- Reads JSON with comments and trailing commas (2026-10-16, [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#c-and-c-read-by-the-grammar-the-include-rule-chosen-by-measurement-and-discovery-that-reads-every-suffix-anywhere-recorded-2026-10-16)): `toStrictJson` drops line and block comments, a comma that only precedes a closing bracket and a byte order mark, leaving strings intact, and the result goes to `JSON.parse`, so a malformed document still fails as it did. TypeScript's own JSON reader was not used: its diagnostics are internal and it reads malformed JSON leniently. One lenient corner: an unterminated block comment at the very end of an otherwise valid document is dropped rather than failing.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `collectKeyPaths` {#symbol-collectkeypaths}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/json.ts#L379)

##### `collectKeyPaths` — Summary
Every key path in a JSON document, joined with `:` the way `IConfiguration` addresses
nested settings (`Hangfire:Queue`). Arrays are not descended into.

#### `jsonAdapter` {#symbol-jsonadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/json.ts#L392)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `jsonAdapter` — Summary
Language adapter for JSON and JSONC files. Publishes key paths as public symbols and detects file-path references in string values.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
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
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/openings.mdmd.md`](../../../../../../layer-3/openings.mdmd.md)
- [`.mdmd/layer-3/polyglot-adapters.mdmd.md`](../../../../../../layer-3/polyglot-adapters.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
