# scripts/e2e-bundles.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/e2e-bundles.test.ts
- Generated At: 2026-11-19T07:03:51.230Z

## Authored
### Purpose
Tests that [the list of the browser suite's bundles](./e2e-bundles.mjs.mdmd.md) agrees with the npm scripts that build them and with `test:e2e`, and that the check at the suite's start passes bundles built together and refuses the rest.

### Notes
- Written on 2026-11-19 with the list ([Turns 36 and 37 of the November 18 session](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37)). The check's cases build a small site in a temporary folder with file times set by the test: a sample whose script differs and is older is named with the command that rebuilds it; an Explorer older than a change to the client, and a missing sample, are named; a test file's time never counts. With the comparison of the copies skipped on purpose, the case of the older sample failed.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`e2e-bundles.SUITE_BUNDLES`](./e2e-bundles.mjs.mdmd.md#symbol-suite_bundles)
- [`e2e-bundles.refusal`](./e2e-bundles.mjs.mdmd.md#symbol-refusal)
- [`e2e-bundles.staleBundles`](./e2e-bundles.mjs.mdmd.md#symbol-stalebundles)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
