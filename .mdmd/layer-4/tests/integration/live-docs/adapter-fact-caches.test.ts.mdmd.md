# `tests/integration/live-docs/adapter-fact-caches.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/adapter-fact-caches.test.ts`
- Generated At: 2026-11-20T14:49:09.635Z

## Authored
### Purpose
Holds C's and Rust's caches of a file's facts (`factsCache` in `c.ts` and `rust.ts`) to one generation each. A history worker generates change after change in one folder. A file there is rewritten in place with its modification time held, as a coarse disk or a fast writer can leave it. The second generation in the same process must derive the graph a fresh process derives in a fresh folder.

### Notes
- Written on 2026-11-20 after a review found these two caches held by no test. With `factsCache.clear()` removed from both `beginRun`s, the six cache cases of `history-workers.test.ts` stayed green, since they hold C's folder listings and Rust's packages. Here, the C case and the Rust case each failed on its final comparison, the C workspace holding no Rust and the Rust workspace no C.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:os`
- `node:path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`graph.LiveDocGraph`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
