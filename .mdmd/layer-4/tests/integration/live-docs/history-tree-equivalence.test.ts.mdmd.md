# tests/integration/live-docs/history-tree-equivalence.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/history-tree-equivalence.test.ts
- Generated At: 2026-11-19T19:17:28.359Z

## Authored
### Purpose
The proof of the history's tree rule, with the whole tree as the oracle: over every sample workspace of the integration tests, each top-level folder excluded in turn, the docs the generator writes over the tree the history writes (every name standing, an excluded file no reader reads empty) must equal, byte for byte, those it writes over the whole tree under the same configuration.

### Notes
- Written 2026-11-19 on the coordinator's ruling after the [independent review](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/engine-round-review/README.md) of the engine round: existence exact for every path, content exact for every file a reader can read. Seen red both ways: with the files no reader reads left out instead of written empty (`programs/typescript/tidepool`), and with every excluded file written empty, a reader or none (`fixtures/include-dirs`, `programs/python/ledger`).
- A probe with a hook on node's file reads over the same samples found that no reader opened the content of a file the tree wrote empty (100 exclusions over 43 samples, 34 files written empty).
- The last case holds that some file was written empty, so that the equality held over the rule and not around it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFileSync`
- `node:fs`
- `node:os`
- `node:path`
- [`LiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`git.writeStoredTree`](../../../packages/engine/src/live-docs/history/git.ts.mdmd.md#symbol-writestoredtree)
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`regenerate.treeOptions`](../../../packages/generator/src/history/regenerate.ts.mdmd.md#symbol-treeoptions)
- [`scripted-repository.FIXTURE_GIT_ENV`](./scripted-repository.ts.mdmd.md#symbol-fixture_git_env)
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
