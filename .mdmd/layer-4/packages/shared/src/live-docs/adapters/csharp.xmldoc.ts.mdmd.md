# packages/shared/src/live-docs/adapters/csharp.xmldoc.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/csharp.xmldoc.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-csharp-xmldoc-ts
- Generated At: 2025-12-11T01:40:49.399Z

## Authored
### Purpose
Parses C# XML documentation comments (`///` lines) into structured `SymbolDocumentation` objects. Handles all standard XML doc tags: `<summary>`, `<param>`, `<typeparam>`, `<returns>`, `<exception>`, `<example>`, `<see>`, `<seealso>`, `<remarks>`, and `<value>`. Extracted from `csharp.ts` on 2025-12-10.

### Notes
- **Extraction Context:** This module was extracted alongside `csharp.dependencies.ts` to reduce `csharp.ts` from 1120 lines to 329 lines, well under the 1000-line threshold.
- **cref Resolution:** The `normalizeCrefTarget` and `renderCrefText` functions handle C# cref syntax (`T:Namespace.Type`, `M:Namespace.Type.Method`, `P:Namespace.Type.Property`) and convert them to human-readable link text.
- **XML Entity Handling:** `decodeXmlEntities` handles `&lt;`, `&gt;`, `&amp;`, `&quot;`, `&apos;`, and numeric character references.
- **Unsupported Tag Detection:** `detectUnsupportedTags` warns when encountering tags not in `RECOGNIZED_DOC_TAGS`.
- **Companion Tests:** See [csharp.xmldoc.unit.test.ts](./csharp.xmldoc.unit.test.ts.mdmd.md) for 70 unit tests.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T01:40:49.399Z","inputHash":"61fb53dc73fad55b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RECOGNIZED_DOC_TAGS` {#symbol-recognized_doc_tags}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.xmldoc.ts#L24)

##### `RECOGNIZED_DOC_TAGS` — Summary
Set of recognized C# XML documentation tags.
Used to detect unsupported tags that may appear in documentation.

#### `buildDocumentationFromLines` {#symbol-builddocumentationfromlines}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.xmldoc.ts#L56)
- Returns: [`SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation)

##### `buildDocumentationFromLines` — Summary
Builds a SymbolDocumentation object from raw XML doc comment lines.

##### `buildDocumentationFromLines` — Parameters
- `docLines`: Array of raw comment lines (including /// markers)

##### `buildDocumentationFromLines` — Returns
Parsed documentation object, or undefined if no content

#### `stripDocCommentMarker` {#symbol-stripdoccommentmarker}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.xmldoc.ts#L134)

##### `stripDocCommentMarker` — Summary
Strips the XML doc comment marker (///) from a line.

##### `stripDocCommentMarker` — Parameters
- `line`: Raw source line

##### `stripDocCommentMarker` — Returns
Line without the /// prefix

#### `extractSingleTagText` {#symbol-extractsingletagtext}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.xmldoc.ts#L145)

##### `extractSingleTagText` — Summary
Extracts text content from a single XML tag occurrence.

##### `extractSingleTagText` — Parameters
- `block`: Raw XML doc block
- `tagName`: Name of the tag to extract (e.g., "summary")

##### `extractSingleTagText` — Returns
Normalized text content, or undefined if not found

#### `extractParameterTags` {#symbol-extractparametertags}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.xmldoc.ts#L163)
- Returns: [`SymbolDocumentationParameter`](../core.ts.mdmd.md#symbol-symboldocumentationparameter)[]

##### `extractParameterTags` — Summary
Extracts parameter or typeparam documentation tags.

##### `extractParameterTags` — Parameters
- `block`: Raw XML doc block
- `tagName`: Either "param" or "typeparam"

##### `extractParameterTags` — Returns
Array of parsed parameter documentation

#### `extractExceptionTags` {#symbol-extractexceptiontags}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.xmldoc.ts#L186)
- Returns: [`SymbolDocumentationException`](../core.ts.mdmd.md#symbol-symboldocumentationexception)[]

##### `extractExceptionTags` — Summary
Extracts exception documentation tags.

##### `extractExceptionTags` — Parameters
- `block`: Raw XML doc block

##### `extractExceptionTags` — Returns
Array of parsed exception documentation, sorted by type

#### `extractExampleTags` {#symbol-extractexampletags}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.xmldoc.ts#L215)
- Returns: [`SymbolDocumentationExample`](../core.ts.mdmd.md#symbol-symboldocumentationexample)[]

##### `extractExampleTags` — Summary
Extracts example documentation tags.

##### `extractExampleTags` — Parameters
- `block`: Raw XML doc block

##### `extractExampleTags` — Returns
Array of parsed examples with optional code blocks

#### `extractLinkTags` {#symbol-extractlinktags}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.xmldoc.ts#L249)
- Returns: [`SymbolDocumentationLink`](../core.ts.mdmd.md#symbol-symboldocumentationlink)[]

##### `extractLinkTags` — Summary
Extracts <see> and <seealso> link tags.

##### `extractLinkTags` — Parameters
- `block`: Raw XML doc block

##### `extractLinkTags` — Returns
Array of deduplicated, sorted links

#### `extractRawDocFragments` {#symbol-extractrawdocfragments}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.xmldoc.ts#L308)

##### `extractRawDocFragments` — Summary
Extracts raw documentation fragments like <inheritdoc> and <include>.

##### `extractRawDocFragments` — Parameters
- `block`: Raw XML doc block

##### `extractRawDocFragments` — Returns
Array of raw tag strings

#### `detectUnsupportedTags` {#symbol-detectunsupportedtags}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.xmldoc.ts#L332)

##### `detectUnsupportedTags` — Summary
Detects XML tags that are not in the recognized set.

##### `detectUnsupportedTags` — Parameters
- `block`: Raw XML doc block

##### `detectUnsupportedTags` — Returns
Array of unrecognized tag names

#### `parseXmlAttributes` {#symbol-parsexmlattributes}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.xmldoc.ts#L355)

##### `parseXmlAttributes` — Summary
Parses XML attributes from a tag fragment.

##### `parseXmlAttributes` — Parameters
- `fragment`: Raw attribute string (e.g., 'cref="Foo" name="bar"')

##### `parseXmlAttributes` — Returns
Object mapping attribute names to values

#### `normalizeXmlText` {#symbol-normalizexmltext}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.xmldoc.ts#L372)

##### `normalizeXmlText` — Summary
Normalizes XML documentation text into readable plain text.
Converts inline tags, handles code blocks, and cleans up whitespace.

##### `normalizeXmlText` — Parameters
- `value`: Raw XML content

##### `normalizeXmlText` — Returns
Cleaned, normalized text

#### `decodeXmlEntities` {#symbol-decodexmlentities}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.xmldoc.ts#L436)

##### `decodeXmlEntities` — Summary
Decodes common XML entities to their character equivalents.

##### `decodeXmlEntities` — Parameters
- `value`: String with XML entities

##### `decodeXmlEntities` — Returns
Decoded string

#### `normalizeCrefTarget` {#symbol-normalizecreftarget}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.xmldoc.ts#L451)

##### `normalizeCrefTarget` — Summary
Normalizes a cref target by stripping prefixes and converting syntax.

##### `normalizeCrefTarget` — Parameters
- `value`: Raw cref value (e.g., "T:MyNamespace.MyClass")

##### `normalizeCrefTarget` — Returns
Normalized reference (e.g., "MyNamespace.MyClass")

#### `renderCrefText` {#symbol-rendercreftext}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.xmldoc.ts#L475)

##### `renderCrefText` — Summary
Renders a cref target as display text, optionally with custom inner text.

##### `renderCrefText` — Parameters
- `cref`: The cref target
- `inner`: Optional custom display text

##### `renderCrefText` — Returns
Formatted reference text

#### `hasStructuredContent` {#symbol-hasstructuredcontent}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.xmldoc.ts#L490)
- Parameters: `doc`: [`SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation)

##### `hasStructuredContent` — Summary
Checks if a documentation object has any structured content.

##### `hasStructuredContent` — Parameters
- `doc`: Documentation object to check

##### `hasStructuredContent` — Returns
True if any documentation fields are populated
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`core.SymbolDocumentationExample`](../core.ts.mdmd.md#symbol-symboldocumentationexample) (type-only)
- [`core.SymbolDocumentationException`](../core.ts.mdmd.md#symbol-symboldocumentationexception) (type-only)
- [`core.SymbolDocumentationLink`](../core.ts.mdmd.md#symbol-symboldocumentationlink) (type-only)
- [`core.SymbolDocumentationLinkKind`](../core.ts.mdmd.md#symbol-symboldocumentationlinkkind) (type-only)
- [`core.SymbolDocumentationParameter`](../core.ts.mdmd.md#symbol-symboldocumentationparameter) (type-only)
<!-- LIVE-DOC:END Dependencies -->
