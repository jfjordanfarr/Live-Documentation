# packages/engine/src/live-docs/adapters/powershell.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/powershell.ts
- Generated At: 2026-10-15T15:49:38.997Z

## Authored
### Purpose
Provide the Stage-0 adapter that translates PowerShell scripts and modules into Live Docs symbols and dependency edges.

### Notes
The adapter shells out to the emitter script beside it, `powershell.emit-ast.ps1`, caches per-file payloads, and accepts either `pwsh` or Windows PowerShell.
Dot-sourced paths are normalized to workspace-relative form so downstream graph tooling can reason about cross-script hops, and comment-based help is translated into `symbolDocumentation` summaries and parameter blurbs for downstream renderers.
Runtime extraction depends on [`powershell.emit-ast.ps1`](./powershell.emit-ast.ps1.mdmd.md) to describe PowerShell symbols, references, and help metadata. Until 2026-09-27 the adapter looked for that script inside the workspace being documented, so only this repository, and a fixture that shipped a shim pointing back at it, could analyse PowerShell at all; the emitter is part of the product and ships with the adapter.

- The program's entry point is reported on the analysis result since 2026-10-15 ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)), from which the doc carries `- Entry: program`: every `.ps1` script, since a script is what `pwsh` runs, even one with no functions and no dependencies; a `.psm1` module and a `.psd1` manifest are none.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `powershellAdapter` {#symbol-powershelladapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/powershell.ts#L53)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `powershellAdapter` — Summary
Language adapter for PowerShell (`.ps1`, `.psm1`, `.psd1`). Extracts functions, cmdlets, aliases, and dot-source/`Import-Module` dependencies; a `.ps1` script is the program's entry, a module or manifest is not.
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
