# `tests/integration/live-docs/history-workers.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/history-workers.test.ts`
- Generated At: 2026-11-20T09:35:04.707Z

## Authored
### Purpose
The proof that a worker of the history, a process that summarizes change after change with its tree brought forward between them, writes each change's summary as a fresh process in a tree written anew would: over three scripted repositories, every change given to one worker against every change given a worker of its own, summaries and texts byte for byte.

### Notes
- Written 2026-11-20 with the workers ([the record of that day](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-fast/README.md)). A review of the change found that no test held a worker's second change to its own index: the tree's git environment, which the generator's git calls inherit, would ask another change's index silently if carried over. The scripted repositories hold what that would change: documents linked from the docs that come and go, a file git tracks though an ignore file names it, renames onto a dead file's path.
- It reads only the summaries and the texts of the cache; `whole.json` beside them records the run itself.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs`
- `node:os`
- `node:path`
- `node:zlib`
- [`scripted-repository.CHECKED_SCRIPT`](./scripted-repository.ts.mdmd.md#symbol-checked_script)
- [`scripted-repository.COLLISION_SCRIPT`](./scripted-repository.ts.mdmd.md#symbol-collision_script)
- [`scripted-repository.SCRIPT`](./scripted-repository.ts.mdmd.md#symbol-script)
- [`scripted-repository.buildRepository`](./scripted-repository.ts.mdmd.md#symbol-buildrepository)
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
