# packages/engine/src/live-docs/adapters/powershell.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/powershell.ts
- Generated At: 2026-09-27T23:21:30.859Z

## Authored
### Purpose
Provide the Stage-0 adapter that translates PowerShell scripts and modules into Live Docs symbols and dependency edges.

### Notes
The adapter shells out to the emitter script beside it, `powershell.emit-ast.ps1`, caches per-file payloads, and accepts either `pwsh` or Windows PowerShell.
Dot-sourced paths are normalized to workspace-relative form so downstream graph tooling can reason about cross-script hops, and comment-based help is translated into `symbolDocumentation` summaries and parameter blurbs for downstream renderers.
Runtime extraction depends on [`powershell.emit-ast.ps1`](./powershell.emit-ast.ps1.mdmd.md) to describe PowerShell symbols, references, and help metadata. Until 2026-09-27 the adapter looked for that script inside the workspace being documented, so only this repository, and a fixture that shipped a shim pointing back at it, could analyse PowerShell at all; the emitter is part of the product and ships with the adapter.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `powershellAdapter` {#symbol-powershelladapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/powershell.ts#L53)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `powershellAdapter` — Summary
Language adapter for PowerShell (`.ps1`, `.psm1`, `.psd1`). Extracts functions, cmdlets, aliases, and dot-source/`Import-Module` dependencies.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFile`
- `node:path` - `path`
- `node:util` - `promisify`
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.SymbolDocumentationParameter`](../core.ts.mdmd.md#symbol-symboldocumentationparameter) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->
