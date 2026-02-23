# packages/server/src/features/knowledge/languageInference.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/languageInference.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-languageinference-ts
- Generated At: 2026-02-23T21:32:13.000Z

## Authored
### Purpose
Language and file type inference for the knowledge layer. Maps file extensions to programming languages, document formats, and TypeScript ScriptKind values for parsing. Also identifies documentation folders via path heuristics.

### Notes
- Extracted 2025-12-08 from `workspaceIndexProvider.ts` during the refactoring session
- `inferLanguage()` returns language IDs matching VS Code's language identifiers
- `inferScriptKind()` enables correct TypeScript parser configuration per file type
- `looksLikeDocsPath()` uses regex heuristics to detect docs/documentation folders

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-23T21:32:13.000Z","inputHash":"b328092f21ddc3c7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DEFAULT_CODE_EXTENSIONS` {#symbol-default_code_extensions}
- Type: const
- Source: [source](../../../../../../../packages/server/src/features/knowledge/languageInference.ts#L7)

##### `DEFAULT_CODE_EXTENSIONS` — Summary
File extensions recognised as code artifacts during workspace scanning.

#### `DEFAULT_DOC_EXTENSIONS` {#symbol-default_doc_extensions}
- Type: const
- Source: [source](../../../../../../../packages/server/src/features/knowledge/languageInference.ts#L21)

##### `DEFAULT_DOC_EXTENSIONS` — Summary
File extensions recognised as documentation artifacts during workspace scanning.

#### `MODULE_RESOLUTION_EXTENSIONS` {#symbol-module_resolution_extensions}
- Type: const
- Source: [source](../../../../../../../packages/server/src/features/knowledge/languageInference.ts#L24)

##### `MODULE_RESOLUTION_EXTENSIONS` — Summary
Extensions to attempt when resolving bare module specifiers.

#### `inferLanguage` {#symbol-inferlanguage}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/languageInference.ts#L39)

##### `inferLanguage` — Summary
Infers the programming language from a code file's extension.

#### `inferDocLanguage` {#symbol-inferdoclanguage}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/languageInference.ts#L64)

##### `inferDocLanguage` — Summary
Infers the document language from a documentation file's extension.

#### `inferScriptKind` {#symbol-inferscriptkind}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/languageInference.ts#L84)
- Returns: `ts.ScriptKind`

##### `inferScriptKind` — Summary
Infers the TypeScript ScriptKind from a file extension.

#### `looksLikeDocsPath` {#symbol-lookslikedocspath}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/languageInference.ts#L105)

##### `looksLikeDocsPath` — Summary
Returns true if a path looks like it belongs to a documentation folder.

#### `inferDocumentLayer` {#symbol-inferdocumentlayer}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/languageInference.ts#L124)
- Returns: [`ArtifactSeed`](../../../../shared/src/inference/fallbackInference.ts.mdmd.md#symbol-artifactseed)

##### `inferDocumentLayer` — Summary
Infers the artifact layer from metadata or file path conventions.

Supports both the default Live Docs layout (`.live-documentation/source/`)
and the MDMD-convention layout (`.mdmd/layer-N/`).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path`
- [`fallbackInference.ArtifactSeed`](../../../../shared/src/inference/fallbackInference.ts.mdmd.md#symbol-artifactseed)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->
