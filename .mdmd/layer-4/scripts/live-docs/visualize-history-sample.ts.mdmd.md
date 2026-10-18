# scripts/live-docs/visualize-history-sample.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/visualize-history-sample.ts
- Entry: command `live-docs:visualize:history-sample` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-10-18T21:08:49.542Z

## Authored
### Purpose
Builds the static Explorer over the scripted repository of the history command's integration test, with its history computed, as two bundles, the whole history and a window of its last commits, so that the history control can be looked at and tested over a sequence that is not this repository's own and is the same on every machine.

### Notes
- Built 2026-10-18 for ticket C4 of [the change-over-time plan](../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions), so that `tests/e2e/history-scrubber.spec.ts` does not depend on this repository's own history, which CI does not compute. `npm run live-docs:visualize:history-sample` writes `dist/explorer/samples/history/` and `dist/explorer/samples/history-window/`, and `npm run test:e2e` runs it before Playwright, beside the estate sample's build. The repository is built in a temporary folder by `tests/integration/live-docs/scripted-repository.ts` and removed when the build is done.
- `--collision-output` (2026-10-18) builds the second script's bundle, the rename onto a dead file's path, beside the first script's whole history and its window; one build function serves all three.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:os`
- `node:path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`staticBuilder.buildStaticExplorer`](../../packages/explorer/src/shared/staticBuilder.ts.mdmd.md#symbol-buildstaticexplorer)
- [`generator.generateLiveDocs`](../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`computeHistory`](../../packages/generator/src/history/computeHistory.ts.mdmd.md#symbol-computehistory)
- [`scripted-repository.COLLISION_CONFIG`](../../tests/integration/live-docs/scripted-repository.ts.mdmd.md#symbol-collision_config)
- [`scripted-repository.COLLISION_SCRIPT`](../../tests/integration/live-docs/scripted-repository.ts.mdmd.md#symbol-collision_script)
- [`scripted-repository.SCRIPT`](../../tests/integration/live-docs/scripted-repository.ts.mdmd.md#symbol-script)
- [`scripted-repository.SCRIPTED_CONFIG`](../../tests/integration/live-docs/scripted-repository.ts.mdmd.md#symbol-scripted_config)
- [`scripted-repository.ScriptedCommit`](../../tests/integration/live-docs/scripted-repository.ts.mdmd.md#symbol-scriptedcommit)
- [`scripted-repository.buildRepository`](../../tests/integration/live-docs/scripted-repository.ts.mdmd.md#symbol-buildrepository)
<!-- LIVE-DOC:END Dependencies -->
