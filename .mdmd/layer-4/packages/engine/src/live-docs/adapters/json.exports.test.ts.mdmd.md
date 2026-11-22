# `packages/engine/src/live-docs/adapters/json.exports.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/adapters/json.exports.test.ts`
- Generated At: 2026-11-22T03:13:20.198Z

## Authored
### Purpose
Holds the reader of `package.json` to Node's own resolver for the files a package's name loads. Each of eleven manifest shapes is installed as a package under `node_modules` in a folder of its own, with every file it names written. Node is then asked to resolve the package's name, by `require.resolve` and by `import.meta.resolve` in a process of its own. The reader must declare as module entries exactly the files Node gives. The shapes run from `main` alone, through `exports` as a string, under `.`, as conditions and as fall-backs, to the shapes that load nothing: a condition only a bundler matches, `.` not exported, and patterns alone.

### Notes
- Written on 2026-11-22, when root found that `packages/stored-form`, which names its entry only as `exports["."].default`, was no entry in this repository's docs, because the reader read `main` alone. Seven of the eleven cases failed with the reader as it was, and all pass with it mended. The test of this repository's entries (`tests/integration/live-docs/repository-entries.test.ts`) holds the same fact for `packages/stored-form/src/storedForm.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs`
- `node:module` - `createRequire`
- `node:os`
- `node:path`
- `node:url` - `fileURLToPath`
- [`json.jsonAdapter`](./json.ts.mdmd.md#symbol-jsonadapter)
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
