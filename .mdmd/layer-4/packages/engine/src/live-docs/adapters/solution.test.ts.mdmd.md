# packages/engine/src/live-docs/adapters/solution.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/adapters/solution.test.ts
- Generated At: 2026-11-19T20:42:50.732Z

## Authored
### Purpose
Keeps the solution reader's behaviour: a `.sln` with CRLF endings links its projects, one of them named in another case as Windows allows, keeps a missing one by name and skips a solution folder; a `.slnx` links projects inside and outside a folder element.

### Notes
- The file index stands for a Windows checkout, so the case test needs no case-insensitive disk.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:os`
- `node:path`
- [`index.analyzeWithLanguageAdapters`](./index.ts.mdmd.md#symbol-analyzewithlanguageadapters)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
