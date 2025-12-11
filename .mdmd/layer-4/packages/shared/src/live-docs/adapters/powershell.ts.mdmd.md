# packages/shared/src/live-docs/adapters/powershell.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/powershell.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-powershell-ts
- Generated At: 2025-12-11T02:38:01.971Z

## Authored
### Purpose
Provide the Stage-0 adapter that translates PowerShell scripts and modules into Live Docs symbols and dependency edges.

### Notes
The adapter shells out to `scripts/powershell/emit-ast.ps1`, caches per-file payloads, and accepts either `pwsh` or Windows PowerShell.
Dot-sourced paths are normalized to workspace-relative form so downstream graph tooling can reason about cross-script hops, and comment-based help is translated into `symbolDocumentation` summaries and parameter blurbs for downstream renderers.
Runtime extraction depends on [`scripts/powershell/emit-ast.ps1`](../../../../../scripts/powershell/emit-ast.ps1.mdmd.md) to describe PowerShell symbols, references, and help metadata.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.971Z","inputHash":"139bbb13ba61ff5e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `powershellAdapter` {#symbol-powershelladapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/powershell.ts#L52)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)
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

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [powershell.test.ts](./powershell.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
