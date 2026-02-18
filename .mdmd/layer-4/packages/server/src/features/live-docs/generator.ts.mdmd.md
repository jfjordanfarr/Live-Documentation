# packages/server/src/features/live-docs/generator.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/generator.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-generator-ts
- Generated At: 2026-02-18T21:36:27.396Z

## Authored
### Purpose
Coordinates Live Documentation generation by analyzing source files, merging authored sections, recording provenance, and writing deterministic markdown mirrors for each artifact.

### Notes
- Refactored into a layer-agnostic pipeline to support both Stage‑0 and System docs; see [2025-11-10 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md).
- Exposes `__testUtils` hooks to validate rendering behaviour as documented in [2025-11-08 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:36:27.396Z","inputHash":"c37595544bbb55e7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDocGeneratorResult` {#symbol-livedocgeneratorresult}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/live-docs/generator.ts#L78)

##### `LiveDocGeneratorResult` — Summary
Summary returned by {@link generateLiveDocs} after processing all target files.

The caller uses `written` and `deleted` counts for progress reporting, while
the `files` array gives per-file detail for dry-run previews and CI checks.

#### `generateLiveDocs` {#symbol-generatelivedocs}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/live-docs/generator.ts#L118)
- Parameters: `options`: `GenerateLiveDocsOptions`

##### `generateLiveDocs` — Summary
Entry point for the Live Documentation generation pipeline.

Discovers all workspace files matching the configured globs, analyses each for
public symbols and dependencies, loads the evidence snapshot (coverage +
targets + waivers), and renders deterministic markdown docs under the
configured base layer directory.

Supports `--dry-run` (no writes), `--changed` (process only git-dirty files),
and `--include` (explicit file subset) modes. Stale Live Docs whose source
files no longer exist are pruned automatically (unless `changedOnly` is set).

Created 2025-11-09; extended with symbol index (2026-01-14), JSON adapter
(2026-01-28), and cross-platform hash fix (2026-02-03).

##### `generateLiveDocs` — Parameters
- `options`: Generation configuration including workspace root, config overrides, and logger.

#### `__testUtils` {#symbol-__testutils}
- Type: const
- Source: [source](../../../../../../../packages/server/src/features/live-docs/generator.ts#L822)

##### `__testUtils` — Summary
Internal re-exports exposed solely for unit testing.

Consumers: `renderPublicSymbolLines.test.ts`, `report-precision.ts`.
These functions originate in `@live-documentation/shared/live-docs/core`;
re-exporting them here lets tests import a single module for
generator-adjacent assertions without coupling to shared internals.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:crypto` - `createHash`
- `node:fs/promises`
- `node:path` - `path`
- [`evidenceBridge.CoverageSummary`](./evidenceBridge.ts.mdmd.md#symbol-coveragesummary)
- [`evidenceBridge.EvidenceSnapshot`](./evidenceBridge.ts.mdmd.md#symbol-evidencesnapshot)
- [`evidenceBridge.ImplementationEvidenceItem`](./evidenceBridge.ts.mdmd.md#symbol-implementationevidenceitem)
- [`evidenceBridge.TestEvidenceItem`](./evidenceBridge.ts.mdmd.md#symbol-testevidenceitem)
- [`evidenceBridge.loadEvidenceSnapshot`](./evidenceBridge.ts.mdmd.md#symbol-loadevidencesnapshot)
- [`liveDocumentationConfig.LiveDocumentationArchetype`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationarchetype)
- [`LiveDocumentationConfig`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`core.SourceAnalysisResult`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-sourceanalysisresult)
- [`core.WorkspaceFileIndex`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-workspacefileindex)
- [`core.WorkspaceSymbolIndex`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-workspacesymbolindex)
- [`core.analyzeSourceFile`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-analyzesourcefile)
- [`core.buildWorkspaceSymbolIndex`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-buildworkspacesymbolindex)
- [`core.cleanupEmptyParents`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-cleanupemptyparents)
- [`core.collectDependencies`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-collectdependencies)
- [`core.collectExportedSymbols`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-collectexportedsymbols)
- [`core.computePublicSymbolHeadingInfo`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-computepublicsymbolheadinginfo)
- [`core.directoryExists`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-directoryexists)
- [`core.discoverTargetFiles`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-discovertargetfiles)
- [`core.formatRelativePathFromDoc`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-formatrelativepathfromdoc)
- [`core.hasMeaningfulAuthoredContent`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-hasmeaningfulauthoredcontent)
- [`core.inferScriptKind`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-inferscriptkind)
- [`core.renderDependencyLines`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-renderdependencylines)
- [`core.renderPublicSymbolLines`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-renderpublicsymbollines)
- [`core.renderReExportedAnchorLines`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-renderreexportedanchorlines)
- [`core.resolveArchetype`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-resolvearchetype)
- [`markdown.LiveDocRenderSection`](../../../../shared/src/live-docs/markdown.ts.mdmd.md#symbol-livedocrendersection)
- [`markdown.composeLiveDocId`](../../../../shared/src/live-docs/markdown.ts.mdmd.md#symbol-composelivedocid)
- [`markdown.extractAuthoredBlock`](../../../../shared/src/live-docs/markdown.ts.mdmd.md#symbol-extractauthoredblock)
- [`markdown.renderLiveDocMarkdown`](../../../../shared/src/live-docs/markdown.ts.mdmd.md#symbol-renderlivedocmarkdown)
- [`schema.LiveDocGeneratorProvenance`](../../../../shared/src/live-docs/schema.ts.mdmd.md#symbol-livedocgeneratorprovenance) (type-only)
- [`schema.LiveDocMetadata`](../../../../shared/src/live-docs/schema.ts.mdmd.md#symbol-livedocmetadata) (type-only)
- [`schema.LiveDocProvenance`](../../../../shared/src/live-docs/schema.ts.mdmd.md#symbol-livedocprovenance) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../../../shared/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- [`pathUtils.toWorkspaceFileUri`](../../../../shared/src/tooling/pathUtils.ts.mdmd.md#symbol-toworkspacefileuri)
- [`pathUtils.toWorkspaceRelativePath`](../../../../shared/src/tooling/pathUtils.ts.mdmd.md#symbol-toworkspacerelativepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](./generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](./renderPublicSymbolLines.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
