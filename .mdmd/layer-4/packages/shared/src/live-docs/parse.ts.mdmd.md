# packages/shared/src/live-docs/parse.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/parse.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-parse-ts
- Generated At: 2025-12-11T02:38:02.168Z

## Authored
### Purpose
Centralises Live Doc markdown parsing so CLI utilities can obtain consistent metadata, symbol listings, and dependency edges without duplicating regex logic.

### Notes
Outputs workspace-relative paths and filters Live Doc links down to their underlying code artefacts, keeping downstream scripts agnostic of mirror layout conventions.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:02.168Z","inputHash":"b179d694ecedab25"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ParsedTypeReference` {#symbol-parsedtypereference}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/parse.ts#L16)

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

#### `ParsedSymbolDocumentationEntry` {#symbol-parsedsymboldocumentationentry}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/parse.ts#L60)

#### `ParsedDependency` {#symbol-parseddependency}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/parse.ts#L71)

#### `parseLiveDocMarkdown` {#symbol-parselivedocmarkdown}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/parse.ts#L83)
- Returns: [`ParsedLiveDoc`](./parse.d.ts.mdmd.md#symbol-parsedlivedoc)
- Parameters: `config`: [`LiveDocumentationConfig`](../config/liveDocumentationConfig.d.ts.mdmd.md#symbol-livedocumentationconfig)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_FILE_EXTENSION`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_file_extension) (type-only)
- [`liveDocumentationConfig.LiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->
