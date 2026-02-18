# packages/shared/src/live-docs/parse.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/parse.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-parse-ts
- Generated At: 2026-02-18T21:27:54.141Z

## Authored
### Purpose
Centralises Live Doc markdown parsing so CLI utilities can obtain consistent metadata, symbol listings, and dependency edges without duplicating regex logic.

### Notes
Outputs workspace-relative paths and filters Live Doc links down to their underlying code artefacts, keeping downstream scripts agnostic of mirror layout conventions.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:54.141Z","inputHash":"f254178c37f1ba3d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ParsedTypeReference` {#symbol-parsedtypereference}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/parse.ts#L15)

##### `ParsedTypeReference` — Summary
Represents a type reference extracted from a Live Doc's Public Symbols section.

##### `ParsedTypeReference` — Remarks
This mirrors the structure rendered by the Live Doc generator when a symbol's
return type, parameter type, extends clause, or implements clause references
another type defined in the workspace. The `targetDocPath` and `targetAnchor`
fields enable navigation in the Explorer's Local Map.

#### `ParsedLiveDoc` {#symbol-parsedlivedoc}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/parse.ts#L51)

##### `ParsedLiveDoc` — Summary
A fully parsed Live Doc, including source path, archetype, symbols, and dependencies.

#### `ParsedSymbolDocumentationEntry` {#symbol-parsedsymboldocumentationentry}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/parse.ts#L61)

##### `ParsedSymbolDocumentationEntry` — Summary
Documentation metadata extracted for a single public symbol within a Live Doc.

#### `ParsedDependency` {#symbol-parseddependency}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/parse.ts#L73)

##### `ParsedDependency` — Summary
A single dependency reference extracted from a Live Doc's Dependencies section.

#### `parseLiveDocMarkdown` {#symbol-parselivedocmarkdown}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/parse.ts#L92)
- Returns: [`ParsedLiveDoc`](#symbol-parsedlivedoc)
- Parameters: `config`: [`LiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)

##### `parseLiveDocMarkdown` — Summary
Parses a Live Documentation markdown file into a structured {@link ParsedLiveDoc} object.

Extracts metadata (code path, archetype, layer), authored and generated sections,
public symbols with their anchors, and dependency links with resolved paths.
Returns `undefined` if the markdown lacks the required `Code Path:` metadata line.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`LiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->
