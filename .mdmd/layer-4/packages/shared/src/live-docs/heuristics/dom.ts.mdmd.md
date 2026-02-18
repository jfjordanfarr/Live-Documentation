# packages/shared/src/live-docs/heuristics/dom.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/heuristics/dom.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-heuristics-dom-ts
- Generated At: 2026-02-18T21:27:54.101Z

## Authored
### Purpose
Infers markup dependencies for JavaScript that queries the DOM by element id, allowing Live Docs to connect telemetry scripts back to the Razor/WebForms surfaces that seed hidden configuration values.

### Notes
- Focuses on `.aspx`, `.cshtml`, `.razor`, and related markup since those show up across the WebForms, Razor, and Blazor fixtures; expanding the directory allowlist keeps the search bounded while still catching host pages.
- The heuristic complements `aspNetMarkupAdapter` by flowing the opposite direction (script → markup), which is why the LD-402 integration tests assert end-to-end paths rather than relying on this module in isolation.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:54.101Z","inputHash":"1817958e97397a96"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `inferDomDependencies` {#symbol-inferdomdependencies}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/heuristics/dom.ts#L38)
- Parameters: `params`: `DomDependencyParams`

##### `inferDomDependencies` — Summary
Scans a code file for `document.getElementById` / `querySelector('#...')`
calls and attempts to locate nearby markup files (`.html`, `.cshtml`, etc.)
that define those DOM IDs, returning dependency entries.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `Dirent` (type-only)
- `node:fs/promises`
- `node:path` - `path`
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->
