# packages/shared/src/testing/fixtureOracles/scipNormalizer.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/testing/fixtureOracles/scipNormalizer.ts
- Live Doc ID: LD-implementation-packages-shared-src-testing-fixtureoracles-scipnormalizer-ts
- Generated At: 2026-01-28T02:55:35.489Z

## Authored
### Purpose
Provides language-specific normalization for SCIP protobuf indexes during benchmark fixture generation. Each supported language has unique artifact path patterns (Go's `go-build` cache, C#'s `obj/` and `bin/` folders, Java's `target/`, etc.) that should be filtered before edges are recorded into `expected.json` fixtures. This abstraction keeps `scip-to-expected.ts` language-agnostic while allowing precise per-language quirks handling.

### Notes
Created during [2026-01-27 Chat 2](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-27.2.md) as part of the Go SCIP migration. The user prompted discussion about architectural concerns rather than cramming all language quirks into `scip-to-expected.ts`.

Key design decisions:
- `isArtifactPath()` — called during edge extraction to filter build artifacts at source
- `normalizeEdge()` — called per-edge for relation or path normalization  
- `postProcess?` — optional final pass for language-specific deduplication

The Go normalizer was the first to be fully exercised (go-rosetta and go-mux fixtures). C# normalizer was developed earlier during Newtonsoft.Json migration. TypeScript, Java, and Python normalizers exist but await their respective SCIP indexers working on Windows.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-28T02:55:35.489Z","inputHash":"335c91a626437749"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RawScipEdge` {#symbol-rawscipedge}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/scipNormalizer.ts#L18)

##### `RawScipEdge` — Summary
Raw edge extracted from SCIP index before normalization.

#### `NormalizedScipEdge` {#symbol-normalizedscipedge}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/scipNormalizer.ts#L30)

##### `NormalizedScipEdge` — Summary
Normalized edge ready for expected.json output.
Returning null from normalize() means the edge should be skipped.

#### `ScipNormalizer` {#symbol-scipnormalizer}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/scipNormalizer.ts#L46)

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
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/scipNormalizer.ts#L73)
- Returns: [`ScipNormalizer`](#symbol-scipnormalizer)

##### `createBaseNormalizer` — Summary
Creates a base normalizer with common filtering logic.
Language-specific normalizers can extend this.

#### `createGoScipNormalizer` {#symbol-creategoscipnormalizer}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/scipNormalizer.ts#L116)
- Returns: [`ScipNormalizer`](#symbol-scipnormalizer)

#### `createCSharpScipNormalizer` {#symbol-createcsharpscipnormalizer}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/scipNormalizer.ts#L140)
- Returns: [`ScipNormalizer`](#symbol-scipnormalizer)

#### `createTypeScriptScipNormalizer` {#symbol-createtypescriptscipnormalizer}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/scipNormalizer.ts#L164)
- Returns: [`ScipNormalizer`](#symbol-scipnormalizer)

#### `createJavaScipNormalizer` {#symbol-createjavascipnormalizer}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/scipNormalizer.ts#L187)
- Returns: [`ScipNormalizer`](#symbol-scipnormalizer)

#### `createPythonScipNormalizer` {#symbol-createpythonscipnormalizer}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/scipNormalizer.ts#L210)
- Returns: [`ScipNormalizer`](#symbol-scipnormalizer)

#### `getScipNormalizer` {#symbol-getscipnormalizer}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/scipNormalizer.ts#L248)
- Returns: [`ScipNormalizer`](#symbol-scipnormalizer)

##### `getScipNormalizer` — Summary
Get the SCIP normalizer for a given language.
Falls back to base normalizer for unsupported languages.

#### `normalizeScipEdges` {#symbol-normalizescipedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/scipNormalizer.ts#L260)
- Returns: [`NormalizedScipEdge`](#symbol-normalizedscipedge)[]
- Parameters: `edges`: [`RawScipEdge`](#symbol-rawscipedge)[]; `normalizer`: [`ScipNormalizer`](#symbol-scipnormalizer)

##### `normalizeScipEdges` — Summary
Process a batch of raw SCIP edges through a normalizer.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
