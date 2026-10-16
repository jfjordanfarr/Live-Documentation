# packages/engine/src/live-docs/adapters/treeSitter.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/adapters/treeSitter.test.ts
- Generated At: 2026-10-16T21:23:38.161Z

## Authored
### Purpose
Proves where the loader takes each grammar from: the PowerShell grammar the engine builds parses a comma list of bare words, a bare word that begins with a variable (as an argument and as a dot-source's path) and `using` statements before a param block without an ERROR node, which the bundled grammar cannot; and a grammar the engine does not build, Python's, still comes from the bundle.

### Notes
- Written on 2026-10-16 with the engine's own PowerShell grammar ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#powershell-read-by-a-grammar-of-our-own-measured-against-powershells-own-parser-recorded-2026-10-16)). With the built wasm moved aside, so that the bundled grammar loads, its three PowerShell tests fail; the grammar's own corpus, run by `build.sh`, holds the trees in detail.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`treeSitter.SyntaxNode`](./treeSitter.ts.mdmd.md#symbol-syntaxnode)
- [`treeSitter.parseSource`](./treeSitter.ts.mdmd.md#symbol-parsesource)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
