# tests/integration/live-docs/round-trip.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/round-trip.test.ts
- Generated At: 2026-11-19T19:15:16.742Z

## Authored
### Purpose
The property behind "markdown is a lightweight AST": every committed Live Doc of this repository, and every doc the generator writes for the sample programs, parses and renders back to the same bytes.

### Notes
- Added 2026-09-27 with the grammar. A failure names the doc and the line the parser refused, so a generator change that writes something the grammar does not describe is caught before it is committed.
- The sample programs are copied to a temporary workspace before generation, as the oracle does, so no fixture is ever written to.
- Since 2026-11-19 every committed doc is also copied to a temporary workspace with CRLF line endings, as Git for Windows checks a text file out by default, and read into a graph that must equal the one read from the docs as written: a cold run on public PowerShell, .NET and SQL repositories that day found `inspect` and `visualize` stopped at the first doc of such a checkout.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs`
- `node:os`
- `node:path` - `path`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`document.parseLiveDoc`](../../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-parselivedoc)
- [`document.renderLiveDoc`](../../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-renderlivedoc)
- [`graphFiles.readLiveDocGraph`](../../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
