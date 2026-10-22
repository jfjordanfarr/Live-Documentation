# scripts/oracle/compare.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/oracle/compare.ts
- Entry: command `oracle:compare` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-10-22T00:39:42.685Z

## Authored
### Purpose
The `oracle:compare` command: runs the shipped generator over a copy of a sample program and lists where the dependency edges of its graph disagree with the program's compiler-derived and hand-verified expectations.

### Notes
- Prints a list, never a score, and exits 0 either way; the integration suite `oracle.test.ts` asserts only that every expected edge is accounted for.
- Reads the adapter's edges from the graph derived from the generated docs (since 2026-09-28). Only dependency-line edges count, not type references, so the measurement is the one recorded in the decisions log.
- Edges the adapter finds between files the compiler never indexed (markup, configuration, scripts) are reported separately as beyond the compiler's view, not as errors.
- A fixture is generated under the product's default configuration as it stands. `fixtureGlobs()`, which rebuilt the default globs from their suffixes and so always equalled them, went on 2026-10-22 with the every-file default ([Turn 8 of the October 21 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Report` {#symbol-report}
- Type: interface
- Source: [source](../../../../scripts/oracle/compare.ts#L32)

##### `Report` — Summary
What the comparison found, bucket by bucket.

#### `compareFixture` {#symbol-comparefixture}
- Type: function
- Source: [source](../../../../scripts/oracle/compare.ts#L181)

##### `compareFixture` — Summary
Runs the generator over a copy of the fixture and reports its disagreements with the oracle files.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path` - `path`
- `node:process` - `process`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`graphFiles.readLiveDocGraph`](../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`generator.generateLiveDocs`](../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`files.HandVerifiedEdge`](./files.ts.mdmd.md#symbol-handverifiededge)
- [`files.HandVerifiedEdges`](./files.ts.mdmd.md#symbol-handverifiededges)
- [`files.readHandVerifiedEdges`](./files.ts.mdmd.md#symbol-readhandverifiededges)
- [`files.readOracleEdges`](./files.ts.mdmd.md#symbol-readoracleedges)
- [`fixture.copyFixture`](./fixture.ts.mdmd.md#symbol-copyfixture)
- [`scip-edges.OracleEdges`](./scip-edges.ts.mdmd.md#symbol-oracleedges) (type-only)
<!-- LIVE-DOC:END Dependencies -->
