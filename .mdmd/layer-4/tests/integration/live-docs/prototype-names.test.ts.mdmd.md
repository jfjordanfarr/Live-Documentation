# `tests/integration/live-docs/prototype-names.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/prototype-names.test.ts`
- Generated At: 2026-11-22T05:46:19.900Z

## Authored
### Purpose
Holds that files named as the members every plain JavaScript object inherits (`__proto__`, `constructor`, `toString`, `hasOwnProperty`) are files like any other. It generates a folder holding them and a configuration that names each, then checks that each is in the graph with its edge in, in the index on disk, and answered by the inspect command: from them, into them, reachable and on a path. It also checks that a name no file has, though every object has it (`valueOf`), is refused.

### Notes
- Written on 2026-11-22 at root's ask, after the stored form's reviewer broke the module's copy of the graph's keying with a file named `__proto__`. Before the mend the folder could not be mapped at all: the graph read the plain object's prototype as a file already there, and generation threw "two docs describe __proto__". The graph's table of files now holds no key but its files' paths (`graphFilesByPath`, `fileAt` and `withFilesByPath` in `graph.ts`).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`graphFiles.readLiveDocGraph`](../../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
