# `tests/integration/live-docs/history-tree-equivalence.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/history-tree-equivalence.test.ts`
- Generated At: 2026-11-22T07:12:59.822Z

## Authored
### Purpose
The proof of the history's tree rule, with the whole tree as the oracle: over every sample workspace of the integration tests, each top-level folder excluded in turn, the docs the generator writes over the tree the history writes (every name standing, an excluded image, font or recording empty) must equal, byte for byte, those it writes over the whole tree under the same configuration.

### Notes
- Written 2026-11-19 on the coordinator's ruling after the [independent review](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/engine-round-review/README.md) of the engine round: existence exact for every path, content exact for every file a reader can read. Seen red both ways: with the files no reader reads left out instead of written empty (`programs/typescript/tidepool`), and with every excluded file written empty, a reader or none (`fixtures/include-dirs`, `programs/python/ledger`).
- A probe with a hook on node's file reads over the same samples found that no reader opened the content of a file the tree wrote empty (100 exclusions over 43 samples, 34 files written empty, under the first rule). That holds of these samples only: the review's second pass found the C reader opening an excluded `.def` an include names, which no sample held until `fixtures/c-include-excluded` was added, red under that rule and green under the present one, which empties only images, fonts and recordings.
- What it cannot see: links, exclusions narrower than a top-level folder, warnings (its logger is silent), and what the summarizing process adds after the generator.
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
- [`LiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`git.writeStoredTree`](../../../packages/engine/src/live-docs/history/git.ts.mdmd.md#symbol-writestoredtree)
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`summarizeChange.treeOptions`](../../../packages/generator/src/history/summarizeChange.ts.mdmd.md#symbol-treeoptions)
- [`scripted-repository.FIXTURE_GIT_ENV`](./scripted-repository.ts.mdmd.md#symbol-fixture_git_env)
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
