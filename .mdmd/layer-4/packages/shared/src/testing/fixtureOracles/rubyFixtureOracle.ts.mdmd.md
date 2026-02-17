# packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-shared-src-testing-fixtureoracles-rubyfixtureoracle-ts
- Generated At: 2026-02-17T21:05:04.574Z

## Authored
### Purpose
Parses Ruby fixtures with a lightweight AST walk to extract `require` and `include` relationships, giving our polyglot benchmarks compiler-grade edges without depending on MRI internals <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-04.SUMMARIZED.md#turn-34-build-regeneration-cli--overrides-lines-3961-4260>.

### Notes
- Keep the doc-comment scrubbing heuristics aligned with the Ruby fixtures; Nov 14 reviews flagged this module as the place to harden against documentation-induced false positives <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L3008-L3040>.
- Verified in the Nov 16 unit sweep alongside the other fixture oracles, so rerun `npm run test:unit -- rubyFixtureOracle` after meaningful parser changes <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L2928-L2960>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-17T21:05:04.574Z","inputHash":"cfa7ca29ffc1eec9"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RubyOracleEdgeRelation` {#symbol-rubyoracleedgerelation}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L8)

##### `RubyOracleEdgeRelation` — Summary
SCIP-grounded relation taxonomy.
All require relationships map to "references" in the canonical taxonomy.

#### `RubyOracleProvenance` {#symbol-rubyoracleprovenance}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L16)

##### `RubyOracleProvenance` — Summary
Tracks how a Ruby dependency edge was discovered.

- `"require"` — resolved from a `require_relative` statement
- `"manual-override"` — supplied by a human-authored override entry

#### `RubyOracleEdge` {#symbol-rubyoracleedge}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L24)

##### `RubyOracleEdge` — Summary
A directed dependency edge in the Ruby fixture graph.

Includes provenance metadata so benchmark reports can attribute
each edge to its discovery mechanism (require or override).

#### `RubyOracleEdgeRecord` {#symbol-rubyoracleedgerecord}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L40)

##### `RubyOracleEdgeRecord` — Summary
Provenance-free edge record used for serialisation and comparison.

Matches the shape written to `expected.json` benchmark fixtures.

#### `RubyFixtureOracleOptions` {#symbol-rubyfixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L49)

##### `RubyFixtureOracleOptions` — Summary
Configuration for the Ruby fixture oracle graph generator.

#### `RubyOracleOverrideEntry` {#symbol-rubyoracleoverrideentry}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L64)

##### `RubyOracleOverrideEntry` — Summary
A human-authored edge override that supplements auto-detected edges.

Override entries let benchmark authors declare relationships the
heuristic scanner cannot discover (e.g. dynamic requires, metaprogramming).

#### `RubyOracleOverrideConfig` {#symbol-rubyoracleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L74)

##### `RubyOracleOverrideConfig` — Summary
Container for manual override edges, typically loaded from an
`overrides.json` file alongside the fixture.

#### `RubyOracleSegmentPartition` {#symbol-rubyoraclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L84)

##### `RubyOracleSegmentPartition` — Summary
Result of partitioning auto-detected edges against manual overrides.

Used by benchmark harnesses to report which overrides were matched
by heuristic discovery and which remain unmatched.

#### `RubyOracleMergeResult` {#symbol-rubyoraclemergeresult}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L101)

##### `RubyOracleMergeResult` — Summary
Full merge result combining auto-detected and manual override edges.

`mergedRecords` is the union used as the ground-truth expected output
when comparing against inference engine results in benchmark tests.

#### `generateRubyFixtureGraph` {#symbol-generaterubyfixturegraph}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L134)
- Returns: [`RubyOracleEdge`](#symbol-rubyoracleedge)[]
- Parameters: `options`: [`RubyFixtureOracleOptions`](#symbol-rubyfixtureoracleoptions)

##### `generateRubyFixtureGraph` — Summary
Generates a ground-truth dependency graph for a Ruby fixture directory.

Recursively scans all `.rb` files under `fixtureRoot` and resolves
`require_relative` statements to in-tree targets to produce a
complete set of directed edges.

##### `generateRubyFixtureGraph` — Parameters
- `options`: Fixture root path and optional include/exclude path filters.

##### `generateRubyFixtureGraph` — Returns
Sorted array of edges with provenance metadata.

#### `serializeRubyOracleEdges` {#symbol-serializerubyoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L159)
- Parameters: `edges`: [`RubyOracleEdge`](#symbol-rubyoracleedge)[]

##### `serializeRubyOracleEdges` — Summary
Serialises Ruby oracle edges to a deterministic JSON string.

Strips provenance and sorts by source/target/relation to produce
output suitable for writing to `expected.json` fixture files.

#### `partitionRubyOracleSegments` {#symbol-partitionrubyoraclesegments}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L174)
- Returns: [`RubyOracleSegmentPartition`](#symbol-rubyoraclesegmentpartition)
- Parameters: `edges`: [`RubyOracleEdge`](#symbol-rubyoracleedge)[]; `overrides`: [`RubyOracleOverrideConfig`](#symbol-rubyoracleoverrideconfig)

##### `partitionRubyOracleSegments` — Summary
Partitions auto-detected edges against manual override entries.

Identifies which overrides were independently discovered by the
heuristic scanner and which remain unmatched — useful for auditing
override coverage in benchmark reports.

##### `partitionRubyOracleSegments` — Parameters
- `edges`: Auto-detected edges from {@link generateRubyFixtureGraph}.
- `overrides`: Optional manual override configuration.

#### `mergeRubyOracleEdges` {#symbol-mergerubyoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L219)
- Returns: [`RubyOracleMergeResult`](#symbol-rubyoraclemergeresult)
- Parameters: `edges`: [`RubyOracleEdge`](#symbol-rubyoracleedge)[]; `overrides`: [`RubyOracleOverrideConfig`](#symbol-rubyoracleoverrideconfig)

##### `mergeRubyOracleEdges` — Summary
Merges auto-detected edges with manual overrides into a unified ground truth.

The resulting `mergedRecords` array is the canonical expected output
that benchmark tests compare against inference engine results.

##### `mergeRubyOracleEdges` — Parameters
- `edges`: Auto-detected edges from {@link generateRubyFixtureGraph}.
- `overrides`: Optional manual override configuration.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [rubyFixtureOracle.test.ts](./rubyFixtureOracle.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
