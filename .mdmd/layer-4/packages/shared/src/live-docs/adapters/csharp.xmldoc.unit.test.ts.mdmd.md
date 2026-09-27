# packages/shared/src/live-docs/adapters/csharp.xmldoc.unit.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/csharp.xmldoc.unit.test.ts
- Generated At: 2026-09-27T23:21:30.448Z

## Authored
### Purpose
Unit tests for the C# XML documentation parsing module, validating correct extraction of all standard XML doc tags and proper handling of cref syntax, XML entities, and multi-line content.

### Notes
- **70 Tests:** Covers `buildDocumentationFromLines` (the main entry point), plus helper functions like `stripDocCommentMarker`, `extractSingleTagText`, `extractParameterTags`, `extractExceptionTags`, `extractExampleTags`, `extractLinkTags`, `parseXmlAttributes`, `normalizeXmlText`, `decodeXmlEntities`, `normalizeCrefTarget`, `renderCrefText`, `hasStructuredContent`, and `detectUnsupportedTags`.
- **Edge Cases:** Includes tests for multi-line tags, nested XML, empty content, malformed cref targets, and all supported XML entities.
- **Created:** 2025-12-10 during the `csharp.ts` refactoring to ensure the extracted module is test-backed.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`csharp.xmldoc.RECOGNIZED_DOC_TAGS`](./csharp.xmldoc.ts.mdmd.md#symbol-recognized_doc_tags)
- [`csharp.xmldoc.buildDocumentationFromLines`](./csharp.xmldoc.ts.mdmd.md#symbol-builddocumentationfromlines)
- [`csharp.xmldoc.decodeXmlEntities`](./csharp.xmldoc.ts.mdmd.md#symbol-decodexmlentities)
- [`csharp.xmldoc.detectUnsupportedTags`](./csharp.xmldoc.ts.mdmd.md#symbol-detectunsupportedtags)
- [`csharp.xmldoc.extractExampleTags`](./csharp.xmldoc.ts.mdmd.md#symbol-extractexampletags)
- [`csharp.xmldoc.extractExceptionTags`](./csharp.xmldoc.ts.mdmd.md#symbol-extractexceptiontags)
- [`csharp.xmldoc.extractLinkTags`](./csharp.xmldoc.ts.mdmd.md#symbol-extractlinktags)
- [`csharp.xmldoc.extractParameterTags`](./csharp.xmldoc.ts.mdmd.md#symbol-extractparametertags)
- [`csharp.xmldoc.extractRawDocFragments`](./csharp.xmldoc.ts.mdmd.md#symbol-extractrawdocfragments)
- [`csharp.xmldoc.extractSingleTagText`](./csharp.xmldoc.ts.mdmd.md#symbol-extractsingletagtext)
- [`csharp.xmldoc.hasStructuredContent`](./csharp.xmldoc.ts.mdmd.md#symbol-hasstructuredcontent)
- [`csharp.xmldoc.normalizeCrefTarget`](./csharp.xmldoc.ts.mdmd.md#symbol-normalizecreftarget)
- [`csharp.xmldoc.normalizeXmlText`](./csharp.xmldoc.ts.mdmd.md#symbol-normalizexmltext)
- [`csharp.xmldoc.parseXmlAttributes`](./csharp.xmldoc.ts.mdmd.md#symbol-parsexmlattributes)
- [`csharp.xmldoc.renderCrefText`](./csharp.xmldoc.ts.mdmd.md#symbol-rendercreftext)
- [`csharp.xmldoc.stripDocCommentMarker`](./csharp.xmldoc.ts.mdmd.md#symbol-stripdoccommentmarker)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
