# packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.test.ts
- Live Doc ID: LD-test-packages-shared-src-testing-fixtureoracles-csharpfixtureoracle-test-ts
- Generated At: 2026-02-03T21:55:40.947Z

## Authored
### Purpose
Proves the C# oracle correctly distinguishes runtime versus type-only `using` directives and honors overrides, keeping regenerated graphs faithful to the curated diagnostics fixtures <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L3220-L3270>.

### Notes
- Captured the Nov 6 failure around duplicate edges and now safeguards the fix; the suite has been green through the Nov 16 unit run <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L3588-L3776> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L2928-L2960>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:40.947Z","inputHash":"44ab989c22d8dc4b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`csharpFixtureOracle.CSharpFixtureOracleOptions`](./csharpFixtureOracle.ts.mdmd.md#symbol-csharpfixtureoracleoptions)
- [`csharpFixtureOracle.CSharpOracleEdge`](./csharpFixtureOracle.ts.mdmd.md#symbol-csharporacleedge)
- [`csharpFixtureOracle.CSharpOracleEdgeRecord`](./csharpFixtureOracle.ts.mdmd.md#symbol-csharporacleedgerecord)
- [`csharpFixtureOracle.CSharpOracleOverrideConfig`](./csharpFixtureOracle.ts.mdmd.md#symbol-csharporacleoverrideconfig)
- [`csharpFixtureOracle.generateCSharpFixtureGraph`](./csharpFixtureOracle.ts.mdmd.md#symbol-generatecsharpfixturegraph)
- [`csharpFixtureOracle.mergeCSharpOracleEdges`](./csharpFixtureOracle.ts.mdmd.md#symbol-mergecsharporacleedges)
- [`csharpFixtureOracle.partitionCSharpOracleSegments`](./csharpFixtureOracle.ts.mdmd.md#symbol-partitioncsharporaclesegments)
- [`csharpFixtureOracle.serializeCSharpOracleEdges`](./csharpFixtureOracle.ts.mdmd.md#symbol-serializecsharporacleedges)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/testing/fixtureOracles: [csharpFixtureOracle.ts](./csharpFixtureOracle.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
