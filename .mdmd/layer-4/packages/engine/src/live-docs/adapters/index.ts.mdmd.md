# packages/engine/src/live-docs/adapters/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/index.ts
- Generated At: 2026-10-16T16:21:40.790Z

## Authored
### Purpose
Owns the shared language-adapter registry and `analyzeWithLanguageAdapters`, letting the Live Docs generator dispatch polyglot analysis across the C, C#, Java, Python, Ruby, and Rust bridges envisioned when we stood up the abstraction on Nov 12 <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-12.md#L330-L372>.

### Notes
- Migrated from the server generator into `packages/engine` on Nov 16 so both the CLI and extension consume the same registry surface <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L878-L918>.
- Docstring harnesses for each adapter exercise this entry point, keeping registry coverage visible during the Nov 14 verification sweep <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L2792-L2808>.
- The registry is exported as `LANGUAGE_ADAPTERS` (2026-10-16) so that `index.test.ts` can hold every adapter's extensions to the configuration's default list.
- An adapter may also name exact `fileNames`, matched before any extension (2026-10-16, with the manifest adapters, [Turn 3 of the October 16 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)): `Cargo.toml`, `pyproject.toml`, `go.mod` and `pom.xml` are known by their names, since their extensions are shared by files that are not manifests. A name is matched exactly, so `cargo.toml` is not read. `index.test.ts` holds the names to the configuration's `LIVE_DOCUMENTATION_SOURCE_FILE_NAMES`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WorkspaceFileIndex` {#symbol-workspacefileindex}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/index.ts#L32)

##### `WorkspaceFileIndex` — Summary
Set of workspace-relative file paths for cross-file reference resolution.

##### `WorkspaceFileIndex` — Remarks
Used by adapters like JSON to resolve string values to known workspace files
without filesystem crawling. The index is built by the discovery phase before
analysis begins.

#### `LanguageAdapter` {#symbol-languageadapter}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/index.ts#L44)

##### `LanguageAdapter` — Summary
Contract for a language-specific source analyser.

Each adapter declares the files it handles, by extension or by exact name,
and provides an `analyze` method that extracts public symbols,
dependencies, and other structured metadata from a single source file. The
adapter registry ({@link analyzeWithLanguageAdapters}) dispatches to the
first adapter whose `fileNames` include the file's name, and otherwise to
the first whose `extensions` include its extension.

#### `LANGUAGE_ADAPTERS` {#symbol-language_adapters}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/index.ts#L74)

##### `LANGUAGE_ADAPTERS` — Summary
Every language adapter, in the order they are asked: the first whose file names include a file's name reads it, else the first whose extensions include its extension.

#### `analyzeWithLanguageAdapters` {#symbol-analyzewithlanguageadapters}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/index.ts#L105)

##### `analyzeWithLanguageAdapters` — Summary
Attempts to analyse a source file using the configured language adapters.

##### `analyzeWithLanguageAdapters` — Parameters
- `options.absolutePath`: Absolute path to the source file under inspection.
- `options.fileIndex`: Optional set of workspace file paths for cross-file resolution.
- `options.workspaceRoot`: Workspace root, forwarded to adapters that need relative paths.

##### `analyzeWithLanguageAdapters` — Returns
Analyzer output when an adapter reads the file by its name or its extension, otherwise `null`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`aspnet.aspNetMarkupAdapter`](./aspnet.ts.mdmd.md#symbol-aspnetmarkupadapter)
- [`c.cAdapter`](./c.ts.mdmd.md#symbol-cadapter)
- [`cargo.cargoAdapter`](./cargo.ts.mdmd.md#symbol-cargoadapter)
- [`csharp.csharpAdapter`](./csharp.ts.mdmd.md#symbol-csharpadapter)
- [`css.cssAdapter`](./css.ts.mdmd.md#symbol-cssadapter)
- [`dotnetConfig.dotnetConfigAdapter`](./dotnetConfig.ts.mdmd.md#symbol-dotnetconfigadapter)
- [`go.goAdapter`](./go.ts.mdmd.md#symbol-goadapter)
- [`gomod.goModAdapter`](./gomod.ts.mdmd.md#symbol-gomodadapter)
- [`html.htmlAdapter`](./html.ts.mdmd.md#symbol-htmladapter)
- [`java.javaAdapter`](./java.ts.mdmd.md#symbol-javaadapter)
- [`json.jsonAdapter`](./json.ts.mdmd.md#symbol-jsonadapter)
- [`pom.pomAdapter`](./pom.ts.mdmd.md#symbol-pomadapter)
- [`powershell.powershellAdapter`](./powershell.ts.mdmd.md#symbol-powershelladapter)
- [`project.projectAdapter`](./project.ts.mdmd.md#symbol-projectadapter)
- [`pyproject.pyprojectAdapter`](./pyproject.ts.mdmd.md#symbol-pyprojectadapter)
- [`python.pythonAdapter`](./python.ts.mdmd.md#symbol-pythonadapter)
- [`ruby.rubyAdapter`](./ruby.ts.mdmd.md#symbol-rubyadapter)
- [`rust.rustAdapter`](./rust.ts.mdmd.md#symbol-rustadapter)
- [`sql.sqlAdapter`](./sql.ts.mdmd.md#symbol-sqladapter)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.WorkspaceSymbolIndex`](../core.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
<!-- LIVE-DOC:END Dependencies -->
