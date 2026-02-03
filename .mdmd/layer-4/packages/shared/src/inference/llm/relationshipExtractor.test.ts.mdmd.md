# packages/shared/src/inference/llm/relationshipExtractor.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/inference/llm/relationshipExtractor.test.ts
- Live Doc ID: LD-test-packages-shared-src-inference-llm-relationshipextractor-test-ts
- Generated At: 2026-02-03T21:55:39.146Z

## Authored
### Purpose
Guards the extractor contract by proving we parse well-formed relationship batches and reject malformed or non-JSON responses before they can reach the ingestion pipeline <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L3668-L3707> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L1782-L1794>.

### Notes
- Extend these cases whenever the extractor schema grows (new fields, stricter validation) so the dry-run fixtures and prompt templates stay synchronized with what the pipeline accepts <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L2457-L2499>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.146Z","inputHash":"82109bfc132b6357"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`relationshipExtractor.RelationshipExtractionPrompt`](./relationshipExtractor.ts.mdmd.md#symbol-relationshipextractionprompt)
- [`RelationshipExtractor`](./relationshipExtractor.ts.mdmd.md#symbol-relationshipextractor)
- [`relationshipExtractor.RelationshipExtractorError`](./relationshipExtractor.ts.mdmd.md#symbol-relationshipextractorerror)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/domain: [artifacts.ts](../../domain/artifacts.ts.mdmd.md)
- packages/shared/src/inference/llm: [relationshipExtractor.ts](./relationshipExtractor.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
