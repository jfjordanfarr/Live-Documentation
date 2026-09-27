# packages/shared/src/live-docs/adapters/aspnet.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/aspnet.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-aspnet-ts
- Generated At: 2026-09-27T10:16:23.330Z

## Authored
### Purpose
Surfaces script and code-behind dependencies for ASP.NET markup assets so the LD-402 pathfinder can follow telemetry chains that hop between `.js`, `.cshtml`/`.razor`, and generated C# partials.

### Notes
- Covers legacy WebForms `<%@ Page %>` directives alongside Razor/Blazor partial class detection, keeping the same adapter usable across all fixtures exercised in `tests/integration/live-docs/inspect-cli.test.ts`.
- Intentional filesystem probes ensure we only yield dependencies for files that actually exist, preventing noisy edges during Stage-0 regeneration.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T10:16:23.330Z","inputHash":"00372a4d46392484"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `aspNetMarkupAdapter` {#symbol-aspnetmarkupadapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/aspnet.ts#L14)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `aspNetMarkupAdapter` — Summary
Language adapter for ASP.NET markup files (`.aspx`, `.cshtml`, `.razor`, `.ascx`). Extracts `CodeFile`/`CodeBehind` and `<script src>` references as dependencies, and element ids (server controls and plain HTML alike) as public symbols.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`, `statSync`
- `node:path` - `path`
- [`html.extractElementIds`](./html.ts.mdmd.md#symbol-extractelementids)
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [aspnet.test.ts](./aspnet.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
