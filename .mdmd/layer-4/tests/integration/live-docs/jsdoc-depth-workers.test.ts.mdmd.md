# `tests/integration/live-docs/jsdoc-depth-workers.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/jsdoc-depth-workers.test.ts`
- Generated At: 2026-11-22T07:12:59.932Z

## Authored
### Purpose
Holds that a JSDoc comment nested between a fresh process's limit and a warm worker's gets the summary a fresh process makes of its change alone. Two commits: forty files of JSDoc and type tuples 150 deep warm a worker's parser, then a change removes them and adds a JSDoc tuple 650 deep. The history command runs once with one worker and once with a worker per change, and every summary must be the same; the fresh worker's must name the file not mapped, or the case would show nothing.

### Notes
- Written on 2026-11-20 from an independent reviewer's run with real workers: `ts.forEachChild` never reaches a node's JSDoc, so the reading depth's measure counted the tuple 5, and the warm worker published the file unmarked. Seen red with the measure's JSDoc walk taken out: the warm summary held `src/doc.ts`, the fresh one named it unmapped. The record is the third round of [the probe's record](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-speed/depth-probe.md).
- On the reviewer's second look the case also asserts the one-worker run's line that its worker was marked for a file nested beyond the reading depth. Without it the case would stay green with the JSDoc walk removed on a Node that warms less, where both workers leave the file out. Seen red on that line with the walk taken out.
- Takes about 8 s.

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
- [`scripted-repository.ScriptedCommit`](./scripted-repository.ts.mdmd.md#symbol-scriptedcommit) (type-only)
- [`scripted-repository.buildRepository`](./scripted-repository.ts.mdmd.md#symbol-buildrepository)
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
