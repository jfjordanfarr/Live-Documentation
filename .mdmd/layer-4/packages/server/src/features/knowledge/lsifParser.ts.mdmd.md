# packages/server/src/features/knowledge/lsifParser.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/lsifParser.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-lsifparser-ts
- Generated At: 2025-11-24T15:19:58.671Z

## Authored
### Purpose
Transforms newline-delimited LSIF dumps into external snapshots with artifact entries and cross-file reference links so non-live index data can seed the knowledge graph.

### Notes
- Built during the LSIF/SCIP ingestion effort captured in [2025-10-22 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md), landing alongside auto-detection and bridge wiring.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.671Z","inputHash":"7ec97b075744f93e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LSIFParserOptions` {#symbol-lsifparseroptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/lsifParser.ts#L13)

#### `LSIFParser` {#symbol-lsifparser}
- Type: class
- Source: [source](../../../../../../../packages/server/src/features/knowledge/lsifParser.ts#L26)

##### `LSIFParser` — Summary
Parses LSIF (Language Server Index Format) dumps into ExternalSnapshot format.

LSIF is a newline-delimited JSON format where each line is a vertex or edge.
We extract documents as artifacts and definition/reference relationships as links.
Reference: LSIF specification (Language Server Index Format).

#### `parseLSIF` {#symbol-parselsif}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/lsifParser.ts#L282)

##### `parseLSIF` — Summary
Parse LSIF content into an ExternalSnapshot
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `ExternalArtifact`, `ExternalLink`, `ExternalSnapshot`, `LSIFDocument`, `LSIFEntry`, `LSIFRange`, `ParsedLSIFIndex` (type-only)
- `node:url` - `fileURLToPath`, `pathToFileURL`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [feedFormatDetector.test.ts](./feedFormatDetector.test.ts.mdmd.md)
- [knowledgeGraphBridge.test.ts](./knowledgeGraphBridge.test.ts.mdmd.md)
- [lsifParser.test.ts](./lsifParser.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
