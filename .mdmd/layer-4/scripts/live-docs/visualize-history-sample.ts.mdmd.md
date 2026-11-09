# scripts/live-docs/visualize-history-sample.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/visualize-history-sample.ts
- Entry: command `live-docs:visualize:history-sample` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-09T00:01:56.064Z

## Authored
### Purpose
Builds controlled history bundles through the real history, generator and static Explorer pipeline: the scripted repository and its window, the rename-collision sample, and a separate growth sample with one then 64 TypeScript files and their configuration. The history control's tests do not depend on this repository's ignored history cache.

### Notes
- Built 2026-10-18 for ticket C4 of [the change-over-time plan](../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions), so that `tests/e2e/history-scrubber.spec.ts` does not depend on this repository's own history, which CI does not compute. `npm run live-docs:visualize:history-sample` writes `dist/explorer/samples/history/` and `dist/explorer/samples/history-window/`, and `npm run test:e2e` runs it before Playwright, beside the estate sample's build. The repository is built in a temporary folder by `tests/integration/live-docs/scripted-repository.ts` and removed when the build is done.
- `--collision-output` (2026-10-18) builds the second script's bundle, the rename onto a dead file's path, beside the first script's whole history and its window; one build function serves all three.
- `--growth-output` (November 8, 2026) builds a separate two-commit history dated January 1 and December 1, growing one root-level TypeScript file into a 64-file import chain. The configuration remains part of the normal lens, so canonical membership grows from two to 65 documents. The camera-follow regression keeps its greater-than-tenfold growth, framing and manual-gesture assertions without depending on a machine's repository-history cache. The original samples are unchanged.

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
- [`scripted-repository.GROWTH_CONFIG`](../../tests/integration/live-docs/scripted-repository.ts.mdmd.md#symbol-growth_config)
- [`scripted-repository.GROWTH_SCRIPT`](../../tests/integration/live-docs/scripted-repository.ts.mdmd.md#symbol-growth_script)
- [`scripted-repository.SCRIPT`](../../tests/integration/live-docs/scripted-repository.ts.mdmd.md#symbol-script)
- [`scripted-repository.SCRIPTED_CONFIG`](../../tests/integration/live-docs/scripted-repository.ts.mdmd.md#symbol-scripted_config)
- [`scripted-repository.ScriptedCommit`](../../tests/integration/live-docs/scripted-repository.ts.mdmd.md#symbol-scriptedcommit)
- [`scripted-repository.buildRepository`](../../tests/integration/live-docs/scripted-repository.ts.mdmd.md#symbol-buildrepository)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
