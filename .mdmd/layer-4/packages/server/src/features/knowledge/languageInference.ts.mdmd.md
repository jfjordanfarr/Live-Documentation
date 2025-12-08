# packages/server/src/features/knowledge/languageInference.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/languageInference.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-languageinference-ts
- Generated At: 2025-12-08T20:03:27.581Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-08T20:03:27.581Z","inputHash":"2ffdf3d95a0f7b9a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DEFAULT_CODE_EXTENSIONS` {#symbol-default_code_extensions}
- Type: const
- Source: [source](../../../../../../../packages/server/src/features/knowledge/languageInference.ts#L6)

#### `DEFAULT_DOC_EXTENSIONS` {#symbol-default_doc_extensions}
- Type: const
- Source: [source](../../../../../../../packages/server/src/features/knowledge/languageInference.ts#L19)

#### `MODULE_RESOLUTION_EXTENSIONS` {#symbol-module_resolution_extensions}
- Type: const
- Source: [source](../../../../../../../packages/server/src/features/knowledge/languageInference.ts#L21)

#### `inferLanguage` {#symbol-inferlanguage}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/languageInference.ts#L36)

##### `inferLanguage` — Summary
Infers the programming language from a code file's extension.

#### `inferDocLanguage` {#symbol-inferdoclanguage}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/languageInference.ts#L61)

##### `inferDocLanguage` — Summary
Infers the document language from a documentation file's extension.

#### `inferScriptKind` {#symbol-inferscriptkind}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/languageInference.ts#L81)
- Returns: `ts.ScriptKind`

##### `inferScriptKind` — Summary
Infers the TypeScript ScriptKind from a file extension.

#### `looksLikeDocsPath` {#symbol-lookslikedocspath}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/languageInference.ts#L102)

##### `looksLikeDocsPath` — Summary
Returns true if a path looks like it belongs to a documentation folder.

#### `inferDocumentLayer` {#symbol-inferdocumentlayer}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/languageInference.ts#L118)
- Returns: [`ArtifactSeed`](../../../../shared/src/inference/fallbackInference.ts.mdmd.md#symbol-artifactseed)

##### `inferDocumentLayer` — Summary
Infers the artifact layer from MDMD metadata or file path conventions.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `ArtifactSeed`
- `node:path` - `path`
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [workspaceIndexProvider.test.ts](./workspaceIndexProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
