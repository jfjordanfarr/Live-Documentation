# packages/shared/src/live-docs/schema.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/schema.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-schema-ts
- Generated At: 2026-02-17T21:05:04.437Z

## Authored
### Purpose
Defines the normalized metadata/provenance schema every generated Live Doc must satisfy, enabling lint, manifests, and evidence bridges to operate on consistent shapes.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-13-define-schema--falsifiability-waivers-lines-2161-2380]

### Notes
- Created with the Stage‑0 Live Doc rollout so config, generator, and lint flows share canonical metadata contracts.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-13-define-schema--falsifiability-waivers-lines-2161-2380]
- Hardened during the Stage‑0 refactor when docLoader, manifests, and co-activation analytics began relying on these types.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md#turn-08-begin-refactor--stage-0-extraction-lines-961-1100]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-17T21:05:04.437Z","inputHash":"2094a09dddfaaeb5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDocLayer` {#symbol-livedoclayer}
- Type: type
- Source: [source](../../../../../../packages/shared/src/live-docs/schema.ts#L9)

##### `LiveDocLayer` — Summary
MDMD documentation layer (1–4), corresponding to the progressive
specification hierarchy from vision to implementation.

#### `LiveDocDocstringProvenance` {#symbol-livedocdocstringprovenance}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/schema.ts#L15)

##### `LiveDocDocstringProvenance` — Summary
Tracks whether a Live Doc's docstring sections are in sync with
the current state of the underlying source artifact.

#### `LiveDocGeneratorProvenance` {#symbol-livedocgeneratorprovenance}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/schema.ts#L28)

##### `LiveDocGeneratorProvenance` — Summary
Records which generator tool produced a Live Doc's generated
sections, when, and with what input hash for staleness detection.

#### `LiveDocProvenance` {#symbol-livedocprovenance}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/schema.ts#L45)

##### `LiveDocProvenance` — Summary
Combined provenance payload attached to a Live Doc, recording
both generator history and docstring synchronisation status.

#### `LiveDocMetadata` {#symbol-livedocmetadata}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/schema.ts#L58)

##### `LiveDocMetadata` — Summary
Complete metadata block for a Live Documentation file.

Encoded as YAML frontmatter in the `.mdmd.md` file and parsed
by the graph builder, lint, and inspector CLIs.

#### `LiveDocMetadataInput` {#symbol-livedocmetadatainput}
- Type: type
- Source: [source](../../../../../../packages/shared/src/live-docs/schema.ts#L77)

##### `LiveDocMetadataInput` — Summary
Partial input type for {@link normalizeLiveDocMetadata}, requiring
only `sourcePath` and `liveDocId` while defaulting everything else.

#### `DEFAULT_LIVE_DOC_LAYER` {#symbol-default_live_doc_layer}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/schema.ts#L83)
- Returns: [`LiveDocLayer`](#symbol-livedoclayer)

##### `DEFAULT_LIVE_DOC_LAYER` — Summary
Default documentation layer assigned when none is specified.

#### `normalizeLiveDocMetadata` {#symbol-normalizelivedocmetadata}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/schema.ts#L92)
- Returns: [`LiveDocMetadata`](#symbol-livedocmetadata)
- Parameters: `input`: [`LiveDocMetadataInput`](#symbol-livedocmetadatainput)

##### `normalizeLiveDocMetadata` — Summary
Normalises a partial metadata input into a complete {@link LiveDocMetadata}
object, applying defaults, trimming strings, and normalising paths.

##### `normalizeLiveDocMetadata` — Parameters
- `input`: Partial metadata with at least `sourcePath` and `liveDocId`.

##### `normalizeLiveDocMetadata` — Returns
Fully normalised metadata suitable for YAML frontmatter emission.
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
