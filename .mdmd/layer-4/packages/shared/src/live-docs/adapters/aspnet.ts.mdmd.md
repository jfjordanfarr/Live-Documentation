# packages/shared/src/live-docs/adapters/aspnet.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/aspnet.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-aspnet-ts
- Generated At: 2025-12-05T15:37:25.351Z

## Authored
### Purpose
Surfaces script and code-behind dependencies for ASP.NET markup assets so the LD-402 pathfinder can follow telemetry chains that hop between `.js`, `.cshtml`/`.razor`, and generated C# partials.

### Notes
- Covers legacy WebForms `<%@ Page %>` directives alongside Razor/Blazor partial class detection, keeping the same adapter usable across all fixtures exercised in `tests/integration/live-docs/inspect-cli.test.ts`.
- Intentional filesystem probes ensure we only yield dependencies for files that actually exist, preventing noisy edges during Stage-0 regeneration.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:25.351Z","inputHash":"f6cb1e25f4146116"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `aspNetMarkupAdapter` {#symbol-aspnetmarkupadapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/aspnet.ts#L12)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`, `statSync`
- `node:path` - `path`
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
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
