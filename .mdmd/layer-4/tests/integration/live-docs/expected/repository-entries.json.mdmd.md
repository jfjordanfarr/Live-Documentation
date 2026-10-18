# tests/integration/live-docs/expected/repository-entries.json

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/expected/repository-entries.json
- Generated At: 2026-10-18T00:53:22.656Z

## Authored
### Purpose
The hand's reading of this repository's own entry points, with the reasons as the docs write them, and of what should be reached: the expectation `repository-entries.test.ts` compares the committed docs against.

### Notes
- Written by hand on 2026-10-15 from the manifests' scripts, `bin` and `main`, the configuration's `entryPoints` and the kinds of file a tool reads ([Turn 4](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-4)); tests are entries by their archetype and are not listed. A doc of this repository's own code with an `Entry` line this list does not name is a finding, in the tool or in the hand; when the code changes, this list changes by a reading, never by copying the tool's output.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `convention` {#symbol-convention}
- Type: key

#### `entries` {#symbol-entries}
- Type: key

#### `entries:.devcontainer/devcontainer.json` {#symbol-entriesdevcontainerdevcontainerjson}
- Type: key

#### `entries:.live-docs.config.json` {#symbol-entrieslive-docsconfigjson}
- Type: key

#### `entries:.vscode/settings.json` {#symbol-entriesvscodesettingsjson}
- Type: key

#### `entries:eslint.config.js` {#symbol-entrieseslintconfigjs}
- Type: key

#### `entries:package.json` {#symbol-entriespackagejson}
- Type: key

#### `entries:packages/cli/package.json` {#symbol-entriespackagesclipackagejson}
- Type: key

#### `entries:packages/cli/src/index.ts` {#symbol-entriespackagesclisrcindexts}
- Type: key

#### `entries:packages/cli/tsconfig.json` {#symbol-entriespackagesclitsconfigjson}
- Type: key

#### `entries:packages/engine/package.json` {#symbol-entriespackagesenginepackagejson}
- Type: key

#### `entries:packages/engine/tsconfig.json` {#symbol-entriespackagesenginetsconfigjson}
- Type: key

#### `entries:packages/explorer/package.json` {#symbol-entriespackagesexplorerpackagejson}
- Type: key

#### `entries:packages/explorer/src/client/index.ts` {#symbol-entriespackagesexplorersrcclientindexts}
- Type: key

#### `entries:packages/explorer/src/client/styles.css` {#symbol-entriespackagesexplorersrcclientstylescss}
- Type: key

#### `entries:packages/explorer/src/client/tsconfig.json` {#symbol-entriespackagesexplorersrcclienttsconfigjson}
- Type: key

#### `entries:packages/explorer/tsconfig.json` {#symbol-entriespackagesexplorertsconfigjson}
- Type: key

#### `entries:packages/generator/package.json` {#symbol-entriespackagesgeneratorpackagejson}
- Type: key

#### `entries:packages/generator/src/generator.ts` {#symbol-entriespackagesgeneratorsrcgeneratorts}
- Type: key

#### `entries:packages/generator/tsconfig.json` {#symbol-entriespackagesgeneratortsconfigjson}
- Type: key

#### `entries:scripts/doc-tools/enforce-documentation-links.ts` {#symbol-entriesscriptsdoc-toolsenforce-documentation-linksts}
- Type: key

#### `entries:scripts/layout-lab/lab.ts` {#symbol-entriesscriptslayout-lablabts}
- Type: key

#### `entries:scripts/live-docs/board.ts` {#symbol-entriesscriptslive-docsboardts}
- Type: key

#### `entries:scripts/live-docs/find-orphans.ts` {#symbol-entriesscriptslive-docsfind-orphansts}
- Type: key

#### `entries:scripts/live-docs/generate.ts` {#symbol-entriesscriptslive-docsgeneratets}
- Type: key

#### `entries:scripts/live-docs/history.ts` {#symbol-entriesscriptslive-docshistoryts}
- Type: key

#### `entries:scripts/live-docs/inspect.ts` {#symbol-entriesscriptslive-docsinspectts}
- Type: key

#### `entries:scripts/live-docs/lint.ts` {#symbol-entriesscriptslive-docslintts}
- Type: key

#### `entries:scripts/live-docs/run-all.ts` {#symbol-entriesscriptslive-docsrun-allts}
- Type: key

#### `entries:scripts/live-docs/visualize-sample.ts` {#symbol-entriesscriptslive-docsvisualize-samplets}
- Type: key

#### `entries:scripts/live-docs/visualize-static.ts` {#symbol-entriesscriptslive-docsvisualize-staticts}
- Type: key

#### `entries:scripts/oracle/compare.ts` {#symbol-entriesscriptsoraclecomparets}
- Type: key

#### `entries:scripts/oracle/index-fixture.ts` {#symbol-entriesscriptsoracleindex-fixturets}
- Type: key

#### `entries:scripts/oracle/powershell-ast.ps1` {#symbol-entriesscriptsoraclepowershell-astps1}
- Type: key

#### `entries:scripts/safe-to-commit.mjs` {#symbol-entriesscriptssafe-to-commitmjs}
- Type: key

#### `entries:scripts/slopcop/check-asset-paths.ts` {#symbol-entriesscriptsslopcopcheck-asset-pathsts}
- Type: key

#### `entries:scripts/slopcop/check-markdown-links.ts` {#symbol-entriesscriptsslopcopcheck-markdown-linksts}
- Type: key

#### `entries:scripts/slopcop/check-symbols.ts` {#symbol-entriesscriptsslopcopcheck-symbolsts}
- Type: key

#### `entries:scripts/verify.mjs` {#symbol-entriesscriptsverifymjs}
- Type: key

#### `entries:slopcop.config.json` {#symbol-entriesslopcopconfigjson}
- Type: key

#### `entries:tests/e2e/playwright.config.ts` {#symbol-entriestestse2eplaywrightconfigts}
- Type: key

#### `entries:tests/integration/tsconfig.json` {#symbol-entriestestsintegrationtsconfigjson}
- Type: key

#### `entries:tsconfig.base.json` {#symbol-entriestsconfigbasejson}
- Type: key

#### `entries:tsconfig.json` {#symbol-entriestsconfigjson}
- Type: key

#### `entries:vitest.config.ts` {#symbol-entriesvitestconfigts}
- Type: key

#### `reachedThroughDynamicImport` {#symbol-reachedthroughdynamicimport}
- Type: key

#### `reachedThroughDynamicImport:packages/explorer/src/shared/buildAssets.ts` {#symbol-reachedthroughdynamicimportpackagesexplorersrcsharedbuildassetsts}
- Type: key

#### `unreachableByHand` {#symbol-unreachablebyhand}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`staticBuilder`](../../../../packages/explorer/src/shared/staticBuilder.ts.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
