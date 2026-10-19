# packages/engine/src/live-docs/heuristics/dom.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/heuristics/dom.ts
- Generated At: 2026-10-19T15:06:00.002Z

## Authored
### Purpose
Infers markup dependencies for scripts that query the DOM by element id, connecting those scripts to the nearby pages that declare the ids.

### Notes
- Focuses on `.aspx`, `.cshtml`, `.razor`, and related markup since those show up across the WebForms, Razor, and Blazor fixtures; expanding the directory allowlist keeps the search bounded while still catching host pages.
- The heuristic complements `aspNetMarkupAdapter` by flowing the opposite direction (script → markup); the [inspect integration tests](../../../../../../../tests/integration/live-docs/inspect-cli.test.ts) assert those end-to-end paths.
- In generator runs, `fileIndex` limits nearby markup candidates to files discovery selected before their content is read. An ignored or configured-excluded page cannot produce a link to a Live Doc that will not exist. Standalone analysis without an index keeps the nearby disk search.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `inferDomDependencies` {#symbol-inferdomdependencies}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/heuristics/dom.ts#L42)
- Parameters: `params`: `DomDependencyParams`

##### `inferDomDependencies` — Summary
Scans a code file for `document.getElementById` / `querySelector('#...')`
calls and attempts to locate nearby markup files (`.html`, `.cshtml`, etc.)
that define those DOM IDs, returning dependency entries. With a workspace
file index, only selected markup can become a dependency; without one,
standalone analysis keeps the nearby-file search.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `Dirent` (type-only)
- `node:fs/promises`
- `node:path` - `path`
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->
