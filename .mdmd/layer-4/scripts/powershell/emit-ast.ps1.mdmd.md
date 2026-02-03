# scripts/powershell/emit-ast.ps1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/powershell/emit-ast.ps1
- Live Doc ID: LD-implementation-scripts-powershell-emit-ast-ps1
- Generated At: 2026-02-03T21:55:42.011Z

## Authored
### Purpose
Parse PowerShell source files and emit a compact JSON payload of functions, dot-sources, module references, and comment-based help metadata for the Live Docs adapter.

### Notes
The script targets Windows PowerShell 5.1 compatibility, resolves dot-sourced paths without executing the file, and falls back gracefully when modules are missing. Comment-based help blocks are normalised so synopsis, description, and parameter docs survive round-tripping through JSON. It is invoked by the [`powershellAdapter`](../../packages/shared/src/live-docs/adapters/powershell.ts.mdmd.md#symbol-powershelladapter) and exercised through [`powershell.test.ts`](../../packages/shared/src/live-docs/adapters/powershell.test.ts.mdmd.md) so Live Docs generation and inference stay aligned.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:42.011Z","inputHash":"d293477d8dc93d61"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Resolve-CandidatePath` {#symbol-resolvecandidatepath}
- Type: function
- Source: [source](../../../../scripts/powershell/emit-ast.ps1#L9)

#### `Extract-StringLiterals` {#symbol-extractstringliterals}
- Type: function
- Source: [source](../../../../scripts/powershell/emit-ast.ps1#L43)

#### `Normalize-HelpString` {#symbol-normalizehelpstring}
- Type: function
- Source: [source](../../../../scripts/powershell/emit-ast.ps1#L77)

#### `Convert-CommentHelpInfo` {#symbol-convertcommenthelpinfo}
- Type: function
- Source: [source](../../../../scripts/powershell/emit-ast.ps1#L95)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
