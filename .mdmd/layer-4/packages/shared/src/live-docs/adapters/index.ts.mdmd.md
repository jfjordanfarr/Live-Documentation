# packages/shared/src/live-docs/adapters/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/index.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-index-ts
- Generated At: 2025-12-05T04:16:19.729Z

## Authored
### Purpose
Owns the shared language-adapter registry and `analyzeWithLanguageAdapters`, letting the Live Docs generator dispatch polyglot analysis across the C, C#, Java, Python, Ruby, and Rust bridges envisioned when we stood up the abstraction on Nov 12 <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-12.md#L330-L372>.

### Notes
- Migrated from the server generator into `packages/shared` on Nov 16 so both the CLI and extension consume the same registry surface <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L878-L918>.
- Docstring harnesses for each adapter exercise this entry point, keeping registry coverage visible during the Nov 14 verification sweep <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L2792-L2808>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:19.729Z","inputHash":"d03d9f17b3fd3723"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LanguageAdapter` {#symbol-languageadapter}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/index.ts#L13)

#### `analyzeWithLanguageAdapters` {#symbol-analyzewithlanguageadapters}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/index.ts#L38)

##### `analyzeWithLanguageAdapters` — Summary
Attempts to analyse a source file using the configured language adapters.

##### `analyzeWithLanguageAdapters` — Parameters
- `options.absolutePath`: Absolute path to the source file under inspection.
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
- [`java.javaAdapter`](./java.ts.mdmd.md#symbol-javaadapter)
- [`powershell.powershellAdapter`](./powershell.ts.mdmd.md#symbol-powershelladapter)
- [`python.pythonAdapter`](./python.ts.mdmd.md#symbol-pythonadapter)
- [`ruby.rubyAdapter`](./ruby.ts.mdmd.md#symbol-rubyadapter)
- [`rust.rustAdapter`](./rust.ts.mdmd.md#symbol-rustadapter)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../../../../server/src/features/live-docs/generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](../../../../server/src/features/live-docs/renderPublicSymbolLines.test.ts.mdmd.md)
- [generator.test.ts](../../../../server/src/features/live-docs/system/generator.test.ts.mdmd.md)
- [aspnet.test.ts](./aspnet.test.ts.mdmd.md)
- [c.docstring.test.ts](./c.docstring.test.ts.mdmd.md)
- [csharp.hangfire.test.ts](./csharp.hangfire.test.ts.mdmd.md)
- [powershell.test.ts](./powershell.test.ts.mdmd.md)
- [python.docstring.test.ts](./python.docstring.test.ts.mdmd.md)
- [ruby.docstring.test.ts](./ruby.docstring.test.ts.mdmd.md)
- [rust.docstring.test.ts](./rust.docstring.test.ts.mdmd.md)
- [core.docstring.test.ts](../core.docstring.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
