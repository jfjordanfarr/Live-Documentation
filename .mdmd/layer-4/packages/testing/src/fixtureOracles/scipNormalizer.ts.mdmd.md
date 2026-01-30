# packages/testing/src/fixtureOracles/scipNormalizer.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/testing/src/fixtureOracles/scipNormalizer.ts
- Live Doc ID: LD-implementation-packages-testing-src-fixtureoracles-scipnormalizer-ts
- Generated At: 2026-01-30T00:04:21.342Z

## Authored
### Purpose
Language-specific normalizers that transform raw SCIP index edges into clean, normalized `expected.json` edges. Each language's SCIP indexer has quirks (cache paths, build artifacts, relation semantics) that need filtering or remapping.

### Notes
Created during [Dev Day 65 (2026-01-29)](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md). Provides the normalization layer between raw SCIP protobuf output and the benchmark-ready edge format. Handles Go's go-build cache paths, C#'s obj/bin directories, TypeScript's node_modules, etc.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T00:04:21.342Z","inputHash":"d50c862e406e5481"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RawScipEdge` {#symbol-rawscipedge}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/scipNormalizer.ts#L18)

##### `RawScipEdge` — Summary
Raw edge extracted from SCIP index before normalization.

#### `NormalizedScipEdge` {#symbol-normalizedscipedge}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/scipNormalizer.ts#L30)

##### `NormalizedScipEdge` — Summary
Normalized edge ready for expected.json output.
Returning null from normalize() means the edge should be skipped.

#### `ScipNormalizer` {#symbol-scipnormalizer}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/scipNormalizer.ts#L46)

##### `ScipNormalizer` — Summary
Language-specific SCIP normalizer interface.

Each language that uses SCIP indexers should implement this interface
to handle its specific quirks:
- Go: filter go-build cache paths, handle same-package test→impl
- C#: filter obj/bin paths, handle assembly references
- TypeScript: filter node_modules paths, handle .d.ts references
- Java: filter target/build paths, handle generated sources

#### `createBaseNormalizer` {#symbol-createbasenormalizer}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/scipNormalizer.ts#L73)
- Returns: [`ScipNormalizer`](../../../shared/src/testing/fixtureOracles/scipNormalizer.ts.mdmd.md#symbol-scipnormalizer)

##### `createBaseNormalizer` — Summary
Creates a base normalizer with common filtering logic.
Language-specific normalizers can extend this.

#### `createGoScipNormalizer` {#symbol-creategoscipnormalizer}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/scipNormalizer.ts#L116)
- Returns: [`ScipNormalizer`](../../../shared/src/testing/fixtureOracles/scipNormalizer.ts.mdmd.md#symbol-scipnormalizer)

#### `createCSharpScipNormalizer` {#symbol-createcsharpscipnormalizer}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/scipNormalizer.ts#L140)
- Returns: [`ScipNormalizer`](../../../shared/src/testing/fixtureOracles/scipNormalizer.ts.mdmd.md#symbol-scipnormalizer)

#### `createTypeScriptScipNormalizer` {#symbol-createtypescriptscipnormalizer}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/scipNormalizer.ts#L164)
- Returns: [`ScipNormalizer`](../../../shared/src/testing/fixtureOracles/scipNormalizer.ts.mdmd.md#symbol-scipnormalizer)

#### `createJavaScipNormalizer` {#symbol-createjavascipnormalizer}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/scipNormalizer.ts#L187)
- Returns: [`ScipNormalizer`](../../../shared/src/testing/fixtureOracles/scipNormalizer.ts.mdmd.md#symbol-scipnormalizer)

#### `createPythonScipNormalizer` {#symbol-createpythonscipnormalizer}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/scipNormalizer.ts#L210)
- Returns: [`ScipNormalizer`](../../../shared/src/testing/fixtureOracles/scipNormalizer.ts.mdmd.md#symbol-scipnormalizer)

#### `getScipNormalizer` {#symbol-getscipnormalizer}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/scipNormalizer.ts#L248)
- Returns: [`ScipNormalizer`](../../../shared/src/testing/fixtureOracles/scipNormalizer.ts.mdmd.md#symbol-scipnormalizer)

##### `getScipNormalizer` — Summary
Get the SCIP normalizer for a given language.
Falls back to base normalizer for unsupported languages.

#### `normalizeScipEdges` {#symbol-normalizescipedges}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/scipNormalizer.ts#L260)
- Returns: [`NormalizedScipEdge`](../../../shared/src/testing/fixtureOracles/scipNormalizer.ts.mdmd.md#symbol-normalizedscipedge)[]
- Parameters: `edges`: [`RawScipEdge`](../../../shared/src/testing/fixtureOracles/scipNormalizer.ts.mdmd.md#symbol-rawscipedge)[]; `normalizer`: [`ScipNormalizer`](../../../shared/src/testing/fixtureOracles/scipNormalizer.ts.mdmd.md#symbol-scipnormalizer)

##### `normalizeScipEdges` — Summary
Process a batch of raw SCIP edges through a normalizer.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
