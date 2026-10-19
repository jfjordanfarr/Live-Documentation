# packages/engine/src/live-docs/dependencies.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/dependencies.test.ts
- Generated At: 2026-10-19T21:12:55.075Z

## Authored
### Purpose
Proves how a relative import specifier resolves to a workspace file and how the collector distinguishes dynamic imports, namespace re-exports and bare star re-exports.

### Notes
- Written on 2026-09-27 when five of this repository's own docs listed `./csharp.dependencies` and its siblings as external modules: the resolver had read `.dependencies` as an extension and looked for that exact file.
- Each test builds its own temporary workspace, so the cases never depend on the repository's layout.
- The namespace fixture asserts that `export * as Models` publishes `Models` and keeps a file dependency, while only an accompanying bare `export *` republishes the provider's `Item` anchor, even after dependencies are merged.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:os`
- `node:path` - `path`
- [`dependencies.augmentWithReExportedSymbols`](./dependencies.ts.mdmd.md#symbol-augmentwithreexportedsymbols)
- [`dependencies.collectDependencies`](./dependencies.ts.mdmd.md#symbol-collectdependencies)
- [`dependencies.mergeDependencyEntries`](./dependencies.ts.mdmd.md#symbol-mergedependencyentries)
- [`dependencies.resolveDependency`](./dependencies.ts.mdmd.md#symbol-resolvedependency)
- [`symbolExtraction.collectExportedSymbols`](./symbolExtraction.ts.mdmd.md#symbol-collectexportedsymbols)
- `typescript` - `ts`
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
