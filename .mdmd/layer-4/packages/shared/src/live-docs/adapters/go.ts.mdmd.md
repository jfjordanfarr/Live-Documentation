# packages/shared/src/live-docs/adapters/go.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/go.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-go-ts
- Generated At: 2026-01-30T21:01:46.010Z

## Authored
### Purpose
Go language adapter for Live Documentation generation. Analyzes `.go` source files to extract public symbols (capitalized identifiers per Go convention) and resolve module-relative import dependencies via `go.mod`.

### Notes
- Created during [2026-01-15 dev session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-15.1.md) as part of Go Rosetta fixture implementation
- Uses idiomatic Go package resolution: imports reference directories, not individual files
- Handles both single-line (`import "fmt"`) and grouped (`import ( ... )`) import syntax
- Filters Go standard library packages to avoid false dependencies
- Part of the ongoing effort to expand Live Documentation's polyglot capabilities

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T21:01:46.010Z","inputHash":"0beab12121b32e30"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `goAdapter` {#symbol-goadapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/go.ts#L213)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `existsSync`, `promises`, `readdirSync`
- `node:path`
- [`index.GO_STDLIB_PACKAGES`](../../languages/index.ts.mdmd.md#symbol-go_stdlib_packages)
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
<!-- LIVE-DOC:END Dependencies -->
