# `scripts/live-docs/inspect.reverse-path-wording.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `scripts/live-docs/inspect.reverse-path-wording.test.ts`
- Generated At: 2026-11-22T05:57:50.555Z

## Authored
### Purpose
Holds what `inspect --direction both` says when its reverse search finds no path. The test maps a copy of the estate sample. It first checks, with the command line's own neighbours, that `Hub/App.config` uses a file of `PaymentService/` and a file of `Contracts/`. It then asks for the route from `PaymentService` to `Contracts` both ways. The answer must not claim that nothing depends on both ends.

### Notes
- Written on 2026-11-22 by the engine review of that day's work ([its record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/engine-review/README.md#2026-11-22-later-the-second-pass)).
- The reverse search walks from `--from` along what depends on it, looking for `--to`. Finding none means only that `--to` does not depend on `--from`. Yet `emitDualDirectionResult` prints `Nothing that depends on "PaymentService" also depends on "Contracts".`, which the estate sample shows to be false.
- The message is older than that day's work. The day's directories as ends made it name a directory by its last segment. When the review committed the file, the case failed.

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
- [`fixture.NOT_FIXTURE`](../oracle/fixture.ts.mdmd.md#symbol-not_fixture)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
