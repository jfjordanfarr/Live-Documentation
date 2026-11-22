# `tests/integration/live-docs/cli-answers.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/cli-answers.test.ts`
- Generated At: 2026-11-22T03:01:25.340Z

## Authored
### Purpose
Holds the command line's answers mended after the parity probe: the lint's report in the order of the docs' paths, the orphans command reading the docs where the configuration puts them, a file alone answered with its direct neighbours counted, and a path that runs only the other way offered as the command that asks it.

### Notes
- Made 2026-11-22 ([the parity probe](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/parity/README.md)); each case was seen failing against the unmended commands before its mend. Over two copies of the estate sample, one with its docs under a configuration that is neither the defaults nor this repository's.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:assert`
- `node:child_process` - `spawnSync`
- `node:fs`
- `node:os`
- `node:path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`fixture.NOT_FIXTURE`](../../../scripts/oracle/fixture.ts.mdmd.md#symbol-not_fixture)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `it`
<!-- LIVE-DOC:END Dependencies -->
