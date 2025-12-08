# packages/server/src/features/knowledge/feedFormatDetector.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/feedFormatDetector.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-feedformatdetector-ts
- Generated At: 2025-12-07T21:41:17.676Z

## Authored
### Purpose
Detects and parses static knowledge feed payloads (ExternalSnapshot, LSIF, SCIP) so bridge ingestion can normalise third-party exports, completing the parser suite landed in [2025-10-22 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md).

### Notes
- Prefers deterministic snapshot parsing before falling back to language-server formats, reflecting the LSIF/SCIP integration tuning captured in [2025-10-30 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T21:41:17.676Z","inputHash":"b1495e1e6d9a2a15"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FeedFormat` {#symbol-feedformat}
- Type: type
- Source: [source](../../../../../../../packages/server/src/features/knowledge/feedFormatDetector.ts#L8)

#### `FormatDetectionResult` {#symbol-formatdetectionresult}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/feedFormatDetector.ts#L10)

#### `detectFormat` {#symbol-detectformat}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/feedFormatDetector.ts#L18)
- Returns: [`FormatDetectionResult`](#symbol-formatdetectionresult)

##### `detectFormat` — Summary
Detect the format of a knowledge feed file by inspecting its content structure

#### `ParseFeedFileOptions` {#symbol-parsefeedfileoptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/feedFormatDetector.ts#L113)

#### `parseFeedFile` {#symbol-parsefeedfile}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/feedFormatDetector.ts#L124)
- Parameters: `options`: [`ParseFeedFileOptions`](#symbol-parsefeedfileoptions)

##### `parseFeedFile` — Summary
Parse a knowledge feed file into ExternalSnapshot format,
automatically detecting LSIF, SCIP, or native ExternalSnapshot formats
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `ExternalSnapshot`, `LSIFEntry`, `SCIPIndex` (type-only)
- `node:fs` - `promises`
- [`lsifParser.LSIFParserOptions`](./lsifParser.ts.mdmd.md#symbol-lsifparseroptions)
- [`lsifParser.parseLSIF`](./lsifParser.ts.mdmd.md#symbol-parselsif)
- [`scipParser.SCIPParserOptions`](./scipParser.ts.mdmd.md#symbol-scipparseroptions)
- [`scipParser.parseSCIP`](./scipParser.ts.mdmd.md#symbol-parsescip)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [feedFormatDetector.test.ts](./feedFormatDetector.test.ts.mdmd.md)
- [knowledgeGraphBridge.test.ts](./knowledgeGraphBridge.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
