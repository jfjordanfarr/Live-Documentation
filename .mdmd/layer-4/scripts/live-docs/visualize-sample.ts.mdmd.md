# scripts/live-docs/visualize-sample.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/visualize-sample.ts
- Generated At: 2026-09-29T14:19:43.867Z

## Authored
### Purpose
Builds the static Explorer over one of the sample programs under `tests/integration/programs`, with Live Docs generated into a temporary copy of it, so that the World Map and the inside of a thing can be looked at and tested over a shape that is not this repository's own. The sample itself is never written to, and the copy is removed when the build is done. `npm run live-docs:visualize:estate` runs it over the estate with its board into the bundle's `samples/estate/`, and the Playwright suite builds both bundles first.

### Notes
- Written on 2026-09-29 for the design audit ([Turn 48](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-48)), so that the estate sample is audited in the same suite as this repository, served by the suite's own server.
- The copy's docs are generated fresh with the oracle's fixture globs, so they carry the generator's placeholders in their authored sections: the authored content the sample's docs have in this repository's mirror (`.mdmd/layer-4/tests/integration/programs/`) does not reach the sample's bundle, and a reader of the estate's Explorer sees the generator's pending placeholder on every file (35 of them on 2026-10-08). Carrying a sample's authored docs into its bundle is a gap.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`staticBuilder.buildStaticExplorer`](../../packages/explorer/src/shared/staticBuilder.ts.mdmd.md#symbol-buildstaticexplorer)
- [`generator.generateLiveDocs`](../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`compare.fixtureGlobs`](../oracle/compare.ts.mdmd.md#symbol-fixtureglobs)
- [`fixture.copyFixture`](../oracle/fixture.ts.mdmd.md#symbol-copyfixture)
<!-- LIVE-DOC:END Dependencies -->
