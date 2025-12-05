# packages/shared/src/live-docs/markdown.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/markdown.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-markdown-ts
- Generated At: 2025-12-05T15:37:25.573Z

## Authored
### Purpose
Renders Live Doc sections with deterministic markers, provenance, and authored-block preservation so generators and lint can round-trip markdown safely.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-15-build-evidence-bridge--lint-pipeline-lines-2641-2960]

### Notes
- Powers the Stage‑0 generator, evidence bridge, and lint flow introduced during the initial Live Docs rollout.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-15-build-evidence-bridge--lint-pipeline-lines-2641-2960]
- Updated in the Stage‑0 recovery to adopt the `.md` extension and lint-friendly import order while keeping authored sections intact.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-15.SUMMARIZED.md#turn-15-shift-live-docs-to-md-outputs-lines-1401-1820]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:25.573Z","inputHash":"debdec33fe42dcaa"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LIVE_DOC_BEGIN_MARKER_PREFIX` {#symbol-live_doc_begin_marker_prefix}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L7)

#### `LIVE_DOC_END_MARKER_PREFIX` {#symbol-live_doc_end_marker_prefix}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L8)

#### `LIVE_DOC_PROVENANCE_MARKER` {#symbol-live_doc_provenance_marker}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L9)

#### `LiveDocRenderSection` {#symbol-livedocrendersection}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L11)

#### `RenderLiveDocOptions` {#symbol-renderlivedocoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L17)

#### `renderLiveDocMarkdown` {#symbol-renderlivedocmarkdown}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L33)
- Parameters: `options`: `RenderLiveDocOptions`

#### `renderBeginMarker` {#symbol-renderbeginmarker}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L72)

#### `renderEndMarker` {#symbol-renderendmarker}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L76)

#### `renderProvenanceComment` {#symbol-renderprovenancecomment}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L80)
- Parameters: `provenance`: [`LiveDocProvenance`](./schema.ts.mdmd.md#symbol-livedocprovenance)

#### `extractAuthoredBlock` {#symbol-extractauthoredblock}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L85)

#### `defaultAuthoredTemplate` {#symbol-defaultauthoredtemplate}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L147)

#### `composeLiveDocPath` {#symbol-composelivedocpath}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L151)

#### `composeLiveDocId` {#symbol-composelivedocid}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L166)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_FILE_EXTENSION`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_file_extension)
- [`schema.LiveDocMetadata`](./schema.ts.mdmd.md#symbol-livedocmetadata) (type-only)
- [`schema.LiveDocProvenance`](./schema.ts.mdmd.md#symbol-livedocprovenance) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../../../server/src/features/live-docs/generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](../../../server/src/features/live-docs/renderPublicSymbolLines.test.ts.mdmd.md)
- [generator.test.ts](../../../server/src/features/live-docs/system/generator.test.ts.mdmd.md)
- [generator.test.ts](./generator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
