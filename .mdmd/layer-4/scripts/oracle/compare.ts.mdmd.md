# scripts/oracle/compare.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/oracle/compare.ts
- Generated At: 2026-09-28T16:48:40.850Z

## Authored
### Purpose
The `oracle:compare` command: runs the shipped generator over a copy of a sample program and lists where the dependency edges of its graph disagree with the program's compiler-derived and hand-verified expectations.

### Notes
- Prints a list, never a score, and exits 0 either way; the integration suite `oracle.test.ts` asserts only that every expected edge is accounted for.
- Reads the adapter's edges from the graph derived from the generated docs (since 2026-09-28). Only dependency-line edges count, not type references, so the measurement is the one recorded in the decisions log.
- Edges the adapter finds between files the compiler never indexed (markup, configuration, scripts) are reported separately as beyond the compiler's view, not as errors.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Report` {#symbol-report}
- Type: interface
- Source: [source](../../../../scripts/oracle/compare.ts#L46)

##### `Report` — Summary
What the comparison found, bucket by bucket.

#### `compareFixture` {#symbol-comparefixture}
- Type: function
- Source: [source](../../../../scripts/oracle/compare.ts#L205)

##### `compareFixture` — Summary
Runs the generator over a copy of the fixture and reports its disagreements with the oracle files.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path` - `path`
- `node:process` - `process`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_DEFAULT_GLOBS`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_default_globs)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`graphFiles.readLiveDocGraph`](../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`generator.generateLiveDocs`](../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`fixture.copyFixture`](./fixture.ts.mdmd.md#symbol-copyfixture)
- [`scip-edges.OracleEdges`](./scip-edges.ts.mdmd.md#symbol-oracleedges) (type-only)
<!-- LIVE-DOC:END Dependencies -->
