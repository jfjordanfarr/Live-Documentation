# packages/server/src/features/knowledge/scipParser.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/scipParser.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-scipparser-ts
- Generated At: 2025-12-05T04:16:18.341Z

## Authored
### Purpose
Converts Sourcegraph SCIP indexes into external snapshot seeds and link evidence so knowledge feeds can ingest precomputed symbol graphs.

### Notes
- Implemented with the LSIF/SCIP ingestion option detailed in [2025-10-22 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md), landing alongside the auto-detection flow and unit coverage.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:18.341Z","inputHash":"307f8d88e8621805"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SCIPParserOptions` {#symbol-scipparseroptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/scipParser.ts#L11)

#### `SCIPParser` {#symbol-scipparser}
- Type: class
- Source: [source](../../../../../../../packages/server/src/features/knowledge/scipParser.ts#L24)

##### `SCIPParser` — Summary
Parses SCIP (SCIP Code Intelligence Protocol) indexes into ExternalSnapshot format.

SCIP is a language-agnostic protocol for code intelligence developed by Sourcegraph.
Documents contain occurrences (symbol usages) and symbols (definitions/declarations).
Reference: Sourcegraph SCIP protocol repository.

#### `parseSCIP` {#symbol-parsescip}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/scipParser.ts#L202)
- Returns: `ExternalSnapshot`
- Parameters: `scipIndex`: `SCIPIndex`; `options`: `SCIPParserOptions`

##### `parseSCIP` — Summary
Parse SCIP index into an ExternalSnapshot
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `ExternalArtifact`, `ExternalLink`, `ExternalSnapshot`, `SCIPIndex`, `SCIPOccurrence` (type-only)
- `node:url` - `pathToFileURL`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [feedFormatDetector.test.ts](./feedFormatDetector.test.ts.mdmd.md)
- [knowledgeGraphBridge.test.ts](./knowledgeGraphBridge.test.ts.mdmd.md)
- [scipParser.test.ts](./scipParser.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
