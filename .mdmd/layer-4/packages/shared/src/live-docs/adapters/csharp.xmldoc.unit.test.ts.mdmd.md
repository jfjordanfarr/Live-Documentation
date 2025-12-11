# packages/shared/src/live-docs/adapters/csharp.xmldoc.unit.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/csharp.xmldoc.unit.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-csharp-xmldoc-unit-test-ts
- Generated At: 2025-12-11T01:40:49.407Z

## Authored
### Purpose
Unit tests for the C# XML documentation parsing module, validating correct extraction of all standard XML doc tags and proper handling of cref syntax, XML entities, and multi-line content.

### Notes
- **70 Tests:** Covers `buildDocumentationFromLines` (the main entry point), plus helper functions like `stripDocCommentMarker`, `extractSingleTagText`, `extractParameterTags`, `extractExceptionTags`, `extractExampleTags`, `extractLinkTags`, `parseXmlAttributes`, `normalizeXmlText`, `decodeXmlEntities`, `normalizeCrefTarget`, `renderCrefText`, `hasStructuredContent`, and `detectUnsupportedTags`.
- **Edge Cases:** Includes tests for multi-line tags, nested XML, empty content, malformed cref targets, and all supported XML entities.
- **Created:** 2025-12-10 during the `csharp.ts` refactoring to ensure the extracted module is test-backed.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T01:40:49.407Z","inputHash":"2b8efa865e0af66c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `./csharp.xmldoc` - `RECOGNIZED_DOC_TAGS`, `buildDocumentationFromLines`, `decodeXmlEntities`, `detectUnsupportedTags`, `extractExampleTags`, `extractExceptionTags`, `extractLinkTags`, `extractParameterTags`, `extractRawDocFragments`, `extractSingleTagText`, `hasStructuredContent`, `normalizeCrefTarget`, `normalizeXmlText`, `parseXmlAttributes`, `renderCrefText`, `stripDocCommentMarker`
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
