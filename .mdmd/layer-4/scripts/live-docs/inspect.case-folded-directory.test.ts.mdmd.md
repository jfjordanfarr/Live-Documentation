# `scripts/live-docs/inspect.case-folded-directory.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `scripts/live-docs/inspect.case-folded-directory.test.ts`
- Generated At: 2026-11-22T05:38:31.204Z

## Authored
### Purpose
Holds the command line's reading of a directory typed in the wrong case. The test maps a workspace that holds both `src/Pay/` and `src/pay/`, with `src/PaymentService/` beside them. It then asks `inspect --from src/PAY --to src/PaymentService`. The command must not answer for the files of both directories as one end. It must fail and name both spellings. A second case checks that a name matching only one directory in another case is still answered.

### Notes
- Written on 2026-11-22 by the engine review of that day's work ([its record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/engine-review/README.md)). `resolveEnd` in `inspect.ts` folds the case of every path when the typed name matches none as spelled. Seen that day: the command exited 0 with a path from `src/pay/q.ts`, labelled `src/PAY/`. The first case failed when the review committed this file; the second passed. Failing with both names is the reviewer's proposal, which follows "the map does not lie" and the rule that a command never asks a question. The builder who mends the command may choose another honest form, and the case changes with that choice.

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
- [`generator.generateLiveDocs`](../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
