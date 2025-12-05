# packages/shared/src/live-docs/heuristics/dom.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/heuristics/dom.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-heuristics-dom-ts
- Generated At: 2025-12-05T04:16:19.926Z

## Authored
### Purpose
Infers markup dependencies for JavaScript that queries the DOM by element id, allowing Live Docs to connect telemetry scripts back to the Razor/WebForms surfaces that seed hidden configuration values.

### Notes
- Focuses on `.aspx`, `.cshtml`, `.razor`, and related markup since those show up across the WebForms, Razor, and Blazor fixtures; expanding the directory allowlist keeps the search bounded while still catching host pages.
- The heuristic complements `aspNetMarkupAdapter` by flowing the opposite direction (script → markup), which is why the LD-402 integration tests assert end-to-end paths rather than relying on this module in isolation.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:19.926Z","inputHash":"56dd51a5ec8a53c0"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `inferDomDependencies` {#symbol-inferdomdependencies}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/heuristics/dom.ts#L33)
- Parameters: `params`: `DomDependencyParams`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `Dirent` (type-only)
- `node:fs/promises` - `fs`
- `node:path` - `path`
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../../../../server/src/features/live-docs/generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](../../../../server/src/features/live-docs/renderPublicSymbolLines.test.ts.mdmd.md)
- [generator.test.ts](../../../../server/src/features/live-docs/system/generator.test.ts.mdmd.md)
- [aspnet.test.ts](../adapters/aspnet.test.ts.mdmd.md)
- [c.docstring.test.ts](../adapters/c.docstring.test.ts.mdmd.md)
- [csharp.hangfire.test.ts](../adapters/csharp.hangfire.test.ts.mdmd.md)
- [powershell.test.ts](../adapters/powershell.test.ts.mdmd.md)
- [python.docstring.test.ts](../adapters/python.docstring.test.ts.mdmd.md)
- [ruby.docstring.test.ts](../adapters/ruby.docstring.test.ts.mdmd.md)
- [rust.docstring.test.ts](../adapters/rust.docstring.test.ts.mdmd.md)
- [core.docstring.test.ts](../core.docstring.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
