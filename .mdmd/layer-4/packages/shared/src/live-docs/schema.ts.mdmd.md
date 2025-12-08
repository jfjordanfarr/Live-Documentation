# packages/shared/src/live-docs/schema.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/schema.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-schema-ts
- Generated At: 2025-12-07T21:41:19.434Z

## Authored
### Purpose
Defines the normalized metadata/provenance schema every generated Live Doc must satisfy, enabling lint, manifests, and evidence bridges to operate on consistent shapes.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-13-define-schema--falsifiability-waivers-lines-2161-2380]

### Notes
- Created with the Stage‑0 Live Doc rollout so config, generator, and lint flows share canonical metadata contracts.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-13-define-schema--falsifiability-waivers-lines-2161-2380]
- Hardened during the Stage‑0 refactor when docLoader, manifests, and co-activation analytics began relying on these types.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md#turn-08-begin-refactor--stage-0-extraction-lines-961-1100]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T21:41:19.434Z","inputHash":"ddff0599bf0a61d4"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDocLayer` {#symbol-livedoclayer}
- Type: type
- Source: [source](../../../../../../packages/shared/src/live-docs/schema.ts#L5)

#### `LiveDocDocstringProvenance` {#symbol-livedocdocstringprovenance}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/schema.ts#L7)

#### `LiveDocGeneratorProvenance` {#symbol-livedocgeneratorprovenance}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/schema.ts#L13)

#### `LiveDocProvenance` {#symbol-livedocprovenance}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/schema.ts#L21)

#### `LiveDocMetadata` {#symbol-livedocmetadata}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/schema.ts#L26)

#### `LiveDocMetadataInput` {#symbol-livedocmetadatainput}
- Type: type
- Source: [source](../../../../../../packages/shared/src/live-docs/schema.ts#L41)

#### `DEFAULT_LIVE_DOC_LAYER` {#symbol-default_live_doc_layer}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/schema.ts#L46)
- Returns: [`LiveDocLayer`](#symbol-livedoclayer)

#### `normalizeLiveDocMetadata` {#symbol-normalizelivedocmetadata}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/schema.ts#L48)
- Returns: [`LiveDocMetadata`](#symbol-livedocmetadata)
- Parameters: `input`: [`LiveDocMetadataInput`](#symbol-livedocmetadatainput)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`liveDocumentationConfig.LiveDocumentationArchetype`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationarchetype) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../../../server/src/features/live-docs/generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](../../../server/src/features/live-docs/renderPublicSymbolLines.test.ts.mdmd.md)
- [generator.test.ts](../../../server/src/features/live-docs/system/generator.test.ts.mdmd.md)
- [generator.test.ts](./generator.test.ts.mdmd.md)
- [schema.test.ts](./schema.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
