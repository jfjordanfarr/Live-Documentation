# packages/shared/src/live-docs/adapters/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/index.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-index-ts
- Generated At: 2026-02-03T21:55:39.891Z

## Authored
### Purpose
Owns the shared language-adapter registry and `analyzeWithLanguageAdapters`, letting the Live Docs generator dispatch polyglot analysis across the C, C#, Java, Python, Ruby, and Rust bridges envisioned when we stood up the abstraction on Nov 12 <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-12.md#L330-L372>.

### Notes
- Migrated from the server generator into `packages/shared` on Nov 16 so both the CLI and extension consume the same registry surface <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L878-L918>.
- Docstring harnesses for each adapter exercise this entry point, keeping registry coverage visible during the Nov 14 verification sweep <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L2792-L2808>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.891Z","inputHash":"3252a282b43d83f3"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WorkspaceFileIndex` {#symbol-workspacefileindex}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/index.ts#L25)

##### `WorkspaceFileIndex` — Summary
Set of workspace-relative file paths for cross-file reference resolution.

##### `WorkspaceFileIndex` — Remarks
Used by adapters like JSON to resolve string values to known workspace files
without filesystem crawling. The index is built by the discovery phase before
analysis begins.

#### `LanguageAdapter` {#symbol-languageadapter}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/index.ts#L27)

#### `analyzeWithLanguageAdapters` {#symbol-analyzewithlanguageadapters}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/index.ts#L66)

##### `analyzeWithLanguageAdapters` — Summary
Attempts to analyse a source file using the configured language adapters.

##### `analyzeWithLanguageAdapters` — Parameters
- `options.absolutePath`: Absolute path to the source file under inspection.
- `options.fileIndex`: Optional set of workspace file paths for cross-file resolution.
- `options.workspaceRoot`: Workspace root, forwarded to adapters that need relative paths.

##### `analyzeWithLanguageAdapters` — Returns
Analyzer output when an adapter understands the file extension, otherwise `null`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`aspnet.aspNetMarkupAdapter`](./aspnet.ts.mdmd.md#symbol-aspnetmarkupadapter)
- [`c.cAdapter`](./c.ts.mdmd.md#symbol-cadapter)
- [`csharp.csharpAdapter`](./csharp.ts.mdmd.md#symbol-csharpadapter)
- [`css.cssAdapter`](./css.ts.mdmd.md#symbol-cssadapter)
- [`go.goAdapter`](./go.ts.mdmd.md#symbol-goadapter)
- [`html.htmlAdapter`](./html.ts.mdmd.md#symbol-htmladapter)
- [`java.javaAdapter`](./java.ts.mdmd.md#symbol-javaadapter)
- [`json.jsonAdapter`](./json.ts.mdmd.md#symbol-jsonadapter)
- [`powershell.powershellAdapter`](./powershell.ts.mdmd.md#symbol-powershelladapter)
- [`python.pythonAdapter`](./python.ts.mdmd.md#symbol-pythonadapter)
- [`ruby.rubyAdapter`](./ruby.ts.mdmd.md#symbol-rubyadapter)
- [`rust.rustAdapter`](./rust.ts.mdmd.md#symbol-rustadapter)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [aspnet.test.ts](./aspnet.test.ts.mdmd.md)
- [c.docstring.test.ts](./c.docstring.test.ts.mdmd.md)
- [csharp.hangfire.test.ts](./csharp.hangfire.test.ts.mdmd.md)
- [css.test.ts](./css.test.ts.mdmd.md)
- [html.test.ts](./html.test.ts.mdmd.md)
- [java.typeref.test.ts](./java.typeref.test.ts.mdmd.md)
- [json.test.ts](./json.test.ts.mdmd.md)
- [powershell.test.ts](./powershell.test.ts.mdmd.md)
- [python.docstring.test.ts](./python.docstring.test.ts.mdmd.md)
- [python.resolution.test.ts](./python.resolution.test.ts.mdmd.md)
- [python.typeref.test.ts](./python.typeref.test.ts.mdmd.md)
- [ruby.docstring.test.ts](./ruby.docstring.test.ts.mdmd.md)
- [ruby.typeref.test.ts](./ruby.typeref.test.ts.mdmd.md)
- [rust.docstring.test.ts](./rust.docstring.test.ts.mdmd.md)
- [rust.typeref.test.ts](./rust.typeref.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
