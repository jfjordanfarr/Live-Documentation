# packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-shared-src-testing-fixtureoracles-cfixtureoracle-ts
- Generated At: 2026-02-17T21:05:04.549Z

## Authored
### Purpose
Parses the C benchmark fixtures to infer `#include` and function-call edges so our analyzer’s C pipeline can be diffed against compiler-grounded expectations <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-04.SUMMARIZED.md#turn-34-build-regeneration-cli--overrides-lines-3961-4260>.

### Notes
- Early Nov 5 failures around multi-target call graphs led to tightened edge classification; keep the regression suite handy if new macros or includes expand the surface <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L4240-L4320>.
- Still validated in the Nov 16 unit run, so rerun `npm run test:unit -- cFixtureOracle` after parser or glob changes <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L2928-L2960>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-17T21:05:04.549Z","inputHash":"fb4e8be81b15623d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `COracleEdgeRelation` {#symbol-coracleedgerelation}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L9)

##### `COracleEdgeRelation` — Summary
SCIP-grounded relation taxonomy.
Both includes and function calls map to "references" in the canonical taxonomy.

#### `COracleProvenance` {#symbol-coracleprovenance}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L18)

##### `COracleProvenance` — Summary
Tracks how a C dependency edge was discovered.

- `"source-include"` — resolved from a `#include` directive
- `"function-call"` — detected via a cross-file function call site
- `"manual-override"` — supplied by a human-authored override entry

#### `COracleEdge` {#symbol-coracleedge}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L26)

##### `COracleEdge` — Summary
A directed dependency edge in the C fixture graph.

Includes provenance metadata so benchmark reports can attribute
each edge to its discovery mechanism (include, call, or override).

#### `COracleEdgeRecord` {#symbol-coracleedgerecord}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L42)

##### `COracleEdgeRecord` — Summary
Provenance-free edge record used for serialisation and comparison.

Matches the shape written to `expected.json` benchmark fixtures.

#### `CFixtureOracleOptions` {#symbol-cfixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L51)

##### `CFixtureOracleOptions` — Summary
Configuration for the C fixture oracle graph generator.

#### `COracleOverrideEntry` {#symbol-coracleoverrideentry}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L66)

##### `COracleOverrideEntry` — Summary
A human-authored edge override that supplements auto-detected edges.

Override entries let benchmark authors declare relationships the
heuristic scanner cannot discover (e.g. dlopen, macro-generated calls).

#### `COracleOverrideConfig` {#symbol-coracleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L76)

##### `COracleOverrideConfig` — Summary
Container for manual override edges, typically loaded from an
`overrides.json` file alongside the fixture.

#### `COracleSegmentPartition` {#symbol-coraclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L86)

##### `COracleSegmentPartition` — Summary
Result of partitioning auto-detected edges against manual overrides.

Used by benchmark harnesses to report which overrides were matched
by heuristic discovery and which remain unmatched.

#### `COracleMergeResult` {#symbol-coraclemergeresult}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L103)

##### `COracleMergeResult` — Summary
Full merge result combining auto-detected and manual override edges.

`mergedRecords` is the union used as the ground-truth expected output
when comparing against inference engine results in benchmark tests.

#### `generateCFixtureGraph` {#symbol-generatecfixturegraph}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L155)
- Returns: [`COracleEdge`](#symbol-coracleedge)[]
- Parameters: `options`: [`CFixtureOracleOptions`](#symbol-cfixtureoracleoptions)

##### `generateCFixtureGraph` — Summary
Generates a ground-truth dependency graph for a C fixture directory.

Scans all `.c` and `.h` files under `fixtureRoot`, resolves `#include`
directives to in-tree targets, and detects cross-file function call sites
to produce a complete set of directed edges.

##### `generateCFixtureGraph` — Parameters
- `options`: Fixture root path and optional include/exclude globs.

##### `generateCFixtureGraph` — Returns
Sorted array of edges with provenance metadata.

#### `serializeCOracleEdges` {#symbol-serializecoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L231)
- Parameters: `edges`: [`COracleEdge`](#symbol-coracleedge)[]

##### `serializeCOracleEdges` — Summary
Serialises C oracle edges to a deterministic JSON string.

Strips provenance and sorts by source/target/relation to produce
output suitable for writing to `expected.json` fixture files.

#### `partitionCOracleSegments` {#symbol-partitioncoraclesegments}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L246)
- Returns: [`COracleSegmentPartition`](#symbol-coraclesegmentpartition)
- Parameters: `edges`: [`COracleEdge`](#symbol-coracleedge)[]; `overrides`: [`COracleOverrideConfig`](#symbol-coracleoverrideconfig)

##### `partitionCOracleSegments` — Summary
Partitions auto-detected edges against manual override entries.

Identifies which overrides were independently discovered by the
heuristic scanner and which remain unmatched — useful for auditing
override coverage in benchmark reports.

##### `partitionCOracleSegments` — Parameters
- `edges`: Auto-detected edges from {@link generateCFixtureGraph}.
- `overrides`: Optional manual override configuration.

#### `mergeCOracleEdges` {#symbol-mergecoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L291)
- Returns: [`COracleMergeResult`](#symbol-coraclemergeresult)
- Parameters: `edges`: [`COracleEdge`](#symbol-coracleedge)[]; `overrides`: [`COracleOverrideConfig`](#symbol-coracleoverrideconfig)

##### `mergeCOracleEdges` — Summary
Merges auto-detected edges with manual overrides into a unified ground truth.

The resulting `mergedRecords` array is the canonical expected output
that benchmark tests compare against inference engine results.

##### `mergeCOracleEdges` — Parameters
- `edges`: Auto-detected edges from {@link generateCFixtureGraph}.
- `overrides`: Optional manual override configuration.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `globSync`
- `node:fs` - `fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [cFixtureOracle.test.ts](./cFixtureOracle.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
