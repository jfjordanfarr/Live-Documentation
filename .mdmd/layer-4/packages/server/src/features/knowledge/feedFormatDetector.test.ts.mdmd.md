# packages/server/src/features/knowledge/feedFormatDetector.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/knowledge/feedFormatDetector.test.ts
- Live Doc ID: LD-test-packages-server-src-features-knowledge-feedformatdetector-test-ts
- Generated At: 2025-12-11T02:38:00.570Z

## Authored
### Purpose
Exercises format detection edge cases for LSIF, SCIP, and ExternalSnapshot payloads to anchor the parser strategy delivered in [2025-10-22 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md).

### Notes
- Asserts precedence rules (ExternalSnapshot over SCIP) and failure paths (legacy static JSON, invalid input) so regressions during the Oct 30 tuning pass would surface immediately ([2025-10-30 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:00.570Z","inputHash":"21411e4d0c46abff"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`feedFormatDetector.detectFormat`](./feedFormatDetector.ts.mdmd.md#symbol-detectformat)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/knowledge: [feedFormatDetector.ts](./feedFormatDetector.ts.mdmd.md), [lsifParser.ts](./lsifParser.ts.mdmd.md), [scipParser.ts](./scipParser.ts.mdmd.md)
- packages/shared/src: [src/index.ts](../../../../shared/src/index.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
