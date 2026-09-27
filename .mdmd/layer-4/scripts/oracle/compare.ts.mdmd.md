# scripts/oracle/compare.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/oracle/compare.ts
- Live Doc ID: LD-implementation-scripts-oracle-compare-ts
- Generated At: 2026-09-27T10:16:24.357Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T10:16:24.357Z","inputHash":"3dc176d6a5b1979c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Report` {#symbol-report}
- Type: interface
- Source: [source](../../../../scripts/oracle/compare.ts#L46)

##### `Report` — Summary
What the comparison found, bucket by bucket.

#### `compareFixture` {#symbol-comparefixture}
- Type: function
- Source: [source](../../../../scripts/oracle/compare.ts#L185)

##### `compareFixture` — Summary
Runs the generator over a copy of the fixture and reports its disagreements with the oracle files.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:os` - `os`
- `node:path` - `path`
- `node:process` - `process`
- [`generator.generateLiveDocs`](../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_DEFAULT_GLOBS`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_default_globs)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`parse.parseLiveDocMarkdown`](../../packages/shared/src/live-docs/parse.ts.mdmd.md#symbol-parselivedocmarkdown)
- [`scip-edges.OracleEdges`](./scip-edges.ts.mdmd.md#symbol-oracleedges) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Integration Tests
- [oracle.test.ts](../../tests/integration/live-docs/oracle.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
