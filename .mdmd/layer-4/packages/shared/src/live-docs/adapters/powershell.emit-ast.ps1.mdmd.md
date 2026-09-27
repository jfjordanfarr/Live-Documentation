# packages/shared/src/live-docs/adapters/powershell.emit-ast.ps1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/powershell.emit-ast.ps1
- Generated At: 2026-09-27T23:21:30.821Z

## Authored
### Purpose
Parse PowerShell source files and emit a compact JSON payload of functions, dot-sources, module references, and comment-based help metadata for the Live Docs adapter.

### Notes
The script targets Windows PowerShell 5.1 compatibility, resolves dot-sourced paths without executing the file, and falls back gracefully when modules are missing. Comment-based help blocks are normalised so synopsis, description, and parameter docs survive round-tripping through JSON. It is invoked by the [`powershellAdapter`](./powershell.ts.mdmd.md#symbol-powershelladapter) beside it and exercised through [`powershell.test.ts`](./powershell.test.ts.mdmd.md). It moved from `scripts/powershell/` on 2026-09-27 so that the adapter ships its own parser instead of expecting one in the workspace it documents.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Resolve-CandidatePath` {#symbol-resolvecandidatepath}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/powershell.emit-ast.ps1#L9)

#### `Extract-StringLiterals` {#symbol-extractstringliterals}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/powershell.emit-ast.ps1#L43)

#### `Normalize-HelpString` {#symbol-normalizehelpstring}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/powershell.emit-ast.ps1#L77)

#### `Convert-CommentHelpInfo` {#symbol-convertcommenthelpinfo}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/powershell.emit-ast.ps1#L95)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
