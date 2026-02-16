# packages/shared/src/live-docs/markdown.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/markdown.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-markdown-ts
- Generated At: 2026-02-16T18:46:25.351Z

## Authored
### Purpose
Renders Live Doc sections with deterministic markers, provenance, and authored-block preservation so generators and lint can round-trip markdown safely.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-15-build-evidence-bridge--lint-pipeline-lines-2641-2960]

### Notes
- Powers the Stage‑0 generator, evidence bridge, and lint flow introduced during the initial Live Docs rollout.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-15-build-evidence-bridge--lint-pipeline-lines-2641-2960]
- Updated in the Stage‑0 recovery to adopt the `.md` extension and lint-friendly import order while keeping authored sections intact.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-15.SUMMARIZED.md#turn-15-shift-live-docs-to-md-outputs-lines-1401-1820]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:46:25.351Z","inputHash":"e0842e3b932151b2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LIVE_DOC_BEGIN_MARKER_PREFIX` {#symbol-live_doc_begin_marker_prefix}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L8)

##### `LIVE_DOC_BEGIN_MARKER_PREFIX` — Summary
Prefix for HTML comments that mark the start of a generated Live Doc section.

#### `LIVE_DOC_END_MARKER_PREFIX` {#symbol-live_doc_end_marker_prefix}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L10)

##### `LIVE_DOC_END_MARKER_PREFIX` — Summary
Prefix for HTML comments that mark the end of a generated Live Doc section.

#### `LIVE_DOC_PROVENANCE_MARKER` {#symbol-live_doc_provenance_marker}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L12)

##### `LIVE_DOC_PROVENANCE_MARKER` — Summary
Prefix for the provenance JSON comment embedded in generated Live Docs.

#### `LiveDocRenderSection` {#symbol-livedocrendersection}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L18)

##### `LiveDocRenderSection` — Summary
A named section of generated content within a Live Doc, rendered between
`LIVE-DOC:BEGIN` and `LIVE-DOC:END` marker comments.

#### `RenderLiveDocOptions` {#symbol-renderlivedocoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L30)

##### `RenderLiveDocOptions` — Summary
Full set of inputs required to render a single Live Doc markdown document.

The authored block is preserved across regeneration; generated sections
(Public Symbols, Dependencies, Observed Evidence) are replaced each run.

#### `renderLiveDocMarkdown` {#symbol-renderlivedocmarkdown}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L53)
- Parameters: `options`: [`RenderLiveDocOptions`](#symbol-renderlivedocoptions)

##### `renderLiveDocMarkdown` — Summary
Renders a complete Live Doc markdown document from its constituent parts.

Produces a deterministic output: Metadata, Authored (preserved), then
Generated sections wrapped in HTML marker comments. A trailing newline
is guaranteed.

#### `renderBeginMarker` {#symbol-renderbeginmarker}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L93)

##### `renderBeginMarker` — Summary
Wraps a section name in the `LIVE-DOC:BEGIN` HTML comment marker.

#### `renderEndMarker` {#symbol-renderendmarker}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L98)

##### `renderEndMarker` — Summary
Wraps a section name in the `LIVE-DOC:END` HTML comment marker.

#### `renderProvenanceComment` {#symbol-renderprovenancecomment}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L103)
- Parameters: `provenance`: [`LiveDocProvenance`](./schema.ts.mdmd.md#symbol-livedocprovenance)

##### `renderProvenanceComment` — Summary
Serialises a {@link LiveDocProvenance} object into a `LIVE-DOC:PROVENANCE` HTML comment.

#### `extractAuthoredBlock` {#symbol-extractauthoredblock}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L115)

##### `extractAuthoredBlock` — Summary
Extracts the `## Authored` section from an existing Live Doc.

Returns the default template (`### Purpose` + `### Notes` placeholders)
when no authored section is found, preserving the regeneration contract
that authored content is never silently lost.

#### `defaultAuthoredTemplate` {#symbol-defaultauthoredtemplate}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L178)

##### `defaultAuthoredTemplate` — Summary
Returns the default authored-section template with placeholder Purpose and Notes headings.

#### `composeLiveDocPath` {#symbol-composelivedocpath}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L189)

##### `composeLiveDocPath` — Summary
Composes the workspace-relative path to a Live Doc markdown file
for a given source artifact.

Joins root, base layer, source path, and the `.mdmd.md` extension
using forward-slash separators for cross-platform determinism.

#### `composeLiveDocId` {#symbol-composelivedocid}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/markdown.ts#L210)

##### `composeLiveDocId` — Summary
Generates a deterministic Live Doc identifier from an archetype and source path.

The ID format is `LD-{archetype}-{kebab-path}`, used as the `liveDocId`
metadata field to uniquely identify each document in the Live Doc graph.
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
