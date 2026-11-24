# `packages/generator/src/generatorCore.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/generator/src/generatorCore.ts`
- Generated At: 2026-11-24T07:54:06.099Z

## Authored
### Purpose
Runs the complete Live Documentation generation pipeline (`runLiveDocs`) over an explicit `FileHost` without pulling in Node's disk, grammar, or git hosts, so both the browser scanning page and Node's `generateLiveDocs` wrapper share one engine implementation.

### Notes
- Extracted from `generator.ts` on 2026-11-24 for Steps 7 and 8 of [the road to one engine for a page and a command line](../../../../layer-3/engine-and-hosts.mdmd.md#6-the-road).
- Registers `host.grammars` when provided, delegates discovery to `discoveryCore.ts`, queries `host.git` only when present, and warns once (`"Whether this folder lies inside another scan cannot be seen from a page."`) when `host.scansAbove` is omitted or returns `undefined`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GenerateLiveDocsOptions` {#symbol-generatelivedocsoptions}
- Type: interface
- Source: [source](../../../../../packages/generator/src/generatorCore.ts#L72)

##### `GenerateLiveDocsOptions` — Summary
Options for the Node-defaulted generator entry point (`generateLiveDocs`).

#### `RunLiveDocsOptions` {#symbol-runlivedocsoptions}
- Type: interface
- Source: [source](../../../../../packages/generator/src/generatorCore.ts#L99)

##### `RunLiveDocsOptions` — Summary
Options for {@link runLiveDocs}: requires an explicit {@link FileHost} and pulls in no Node defaults.

#### `LiveDocGeneratorLogger` {#symbol-livedocgeneratorlogger}
- Type: interface
- Source: [source](../../../../../packages/generator/src/generatorCore.ts#L107)

##### `LiveDocGeneratorLogger` — Summary
Logger interface accepted by the Live Documentation generator.

#### `LiveDocGeneratorResult` {#symbol-livedocgeneratorresult}
- Type: interface
- Source: [source](../../../../../packages/generator/src/generatorCore.ts#L119)

##### `LiveDocGeneratorResult` — Summary
Summary returned by {@link runLiveDocs} and `generateLiveDocs` after processing all target files.

The caller uses `written` and `deleted` counts for progress reporting, while
the `files` array gives per-file detail for dry-run previews and CI checks.

#### `SourceReadings` {#symbol-sourcereadings}
- Type: interface
- Source: [source](../../../../../packages/generator/src/generatorCore.ts#L140)

##### `SourceReadings` — Summary
The files the one reading step read as UTF-16 or as Windows-1252, and those it did not read as text, by source path.

#### `LiveDocWriteKind` {#symbol-livedocwritekind}
- Type: type
- Source: [source](../../../../../packages/generator/src/generatorCore.ts#L147)

##### `LiveDocWriteKind` — Summary
How a target file's Live Doc changed during a run.

#### `LiveDocWriteRecord` {#symbol-livedocwriterecord}
- Type: interface
- Source: [source](../../../../../packages/generator/src/generatorCore.ts#L150)

##### `LiveDocWriteRecord` — Summary
Per-file outcome record emitted by the generator.

#### `scanMarkers` {#symbol-scanmarkers}
- Type: function
- Source: [source](../../../../../packages/generator/src/generatorCore.ts#L163)

##### `scanMarkers` — Summary
What makes a folder a scan of its own, by names alone: a docs root (`<root>/<baseLayer>`) or a configuration file of
this tool in it, named once for the search above the workspace and the search below it ({@link scansWithin}).

#### `runLiveDocs` {#symbol-runlivedocs}
- Type: function
- Source: [source](../../../../../packages/generator/src/generatorCore.ts#L177)
- Parameters: `options`: [`RunLiveDocsOptions`](#symbol-runlivedocsoptions)

##### `runLiveDocs` — Summary
Pure host-driven Live Documentation generation pipeline: discovers files through `options.host`, analyses each for
public symbols and dependencies, renders deterministic markdown docs, prunes stale docs, and derives the graph index.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:path` - `path`
- [`LiveDocumentationConfig`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`liveDocumentationConfig.hasReader`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-hasreader)
- [`liveDocumentationConfig.noReaderHandles`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-noreaderhandles)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`index.WorkspaceFileIndex`](../../engine/src/live-docs/adapters/index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`treeSitter.setGrammarHost`](../../engine/src/live-docs/adapters/treeSitter.ts.mdmd.md#symbol-setgrammarhost)
- [`archetype.BINARY_SNIFF_BYTES`](../../engine/src/live-docs/archetype.ts.mdmd.md#symbol-binary_sniff_bytes)
- [`archetype.hasMeaningfulAuthoredContent`](../../engine/src/live-docs/archetype.ts.mdmd.md#symbol-hasmeaningfulauthoredcontent)
- [`archetype.isBinaryContent`](../../engine/src/live-docs/archetype.ts.mdmd.md#symbol-isbinarycontent)
- [`archetype.resolveArchetype`](../../engine/src/live-docs/archetype.ts.mdmd.md#symbol-resolvearchetype)
- [`compose.composeCitedBy`](../../engine/src/live-docs/compose.ts.mdmd.md#symbol-composecitedby)
- [`compose.composeDependencies`](../../engine/src/live-docs/compose.ts.mdmd.md#symbol-composedependencies)
- [`compose.composeEntries`](../../engine/src/live-docs/compose.ts.mdmd.md#symbol-composeentries)
- [`compose.composeReExports`](../../engine/src/live-docs/compose.ts.mdmd.md#symbol-composereexports)
- [`compose.composeSymbolBlocks`](../../engine/src/live-docs/compose.ts.mdmd.md#symbol-composesymbolblocks)
- [`compose.computePublicSymbolHeadingInfo`](../../engine/src/live-docs/compose.ts.mdmd.md#symbol-computepublicsymbolheadinginfo)
- [`coreTypes.SourceAnalysisResult`](../../engine/src/live-docs/coreTypes.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`coreTypes.WorkspaceEntryIndex`](../../engine/src/live-docs/coreTypes.ts.mdmd.md#symbol-workspaceentryindex) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](../../engine/src/live-docs/coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`coreTypes.WorkspaceTestIndex`](../../engine/src/live-docs/coreTypes.ts.mdmd.md#symbol-workspacetestindex) (type-only)
- [`discoveryCore.buildWorkspaceIndexes`](../../engine/src/live-docs/discoveryCore.ts.mdmd.md#symbol-buildworkspaceindexes)
- [`discoveryCore.discoverDocumentsWithHost`](../../engine/src/live-docs/discoveryCore.ts.mdmd.md#symbol-discoverdocumentswithhost)
- [`discoveryCore.discoverTargetFilesWithHost`](../../engine/src/live-docs/discoveryCore.ts.mdmd.md#symbol-discovertargetfileswithhost)
- [`discoveryCore.discoverWorkspaceTargetFilesWithHost`](../../engine/src/live-docs/discoveryCore.ts.mdmd.md#symbol-discoverworkspacetargetfileswithhost)
- [`discoveryCore.inWorkspaceOrder`](../../engine/src/live-docs/discoveryCore.ts.mdmd.md#symbol-inworkspaceorder)
- [`document.DEFAULT_AUTHORED_BLOCK`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-default_authored_block)
- [`document.LiveDoc`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-livedoc) (type-only)
- [`document.LiveDocSyntaxError`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-livedocsyntaxerror)
- [`document.UNREAD_AUTHORED_BLOCK`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-unread_authored_block)
- [`document.authoredBlockOf`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-authoredblockof)
- [`document.parseLiveDoc`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-parselivedoc)
- [`document.renderLiveDoc`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-renderlivedoc)
- [`graphFiles.readLiveDocGraph`](../../engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`graphFiles.writeLiveDocGraph`](../../engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-writelivedocgraph)
- [`processMark.markProcess`](../../engine/src/live-docs/processMark.ts.mdmd.md#symbol-markprocess)
- [`relatedDocs.DocumentText`](../../engine/src/live-docs/relatedDocs.ts.mdmd.md#symbol-documenttext) (type-only)
- [`relatedDocs.citingDocuments`](../../engine/src/live-docs/relatedDocs.ts.mdmd.md#symbol-citingdocuments)
- [`relatedDocs.isMarkdownDocument`](../../engine/src/live-docs/relatedDocs.ts.mdmd.md#symbol-ismarkdowndocument)
- [`sourceAnalysis.analyzeSourceFile`](../../engine/src/live-docs/sourceAnalysis.ts.mdmd.md#symbol-analyzesourcefile)
- [`leaveOut.LeaveOutInput`](../../engine/src/tooling/leaveOut.ts.mdmd.md#symbol-leaveoutinput) (type-only)
- [`leaveOut`](../../engine/src/tooling/leaveOut.ts.mdmd.md#symbol-leaveout-function)
- [`pathUtils.normalizeWorkspacePath`](../../engine/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- [`pathUtils.toWorkspaceRelativePath`](../../engine/src/tooling/pathUtils.ts.mdmd.md#symbol-toworkspacerelativepath)
- [`sourceText.SourceTextReading`](../../engine/src/tooling/sourceText.ts.mdmd.md#symbol-sourcetextreading) (type-only)
- [`sourceText.readSourceReading`](../../engine/src/tooling/sourceText.ts.mdmd.md#symbol-readsourcereading)
- [`sourceText.throwIfMachineFailure`](../../engine/src/tooling/sourceText.ts.mdmd.md#symbol-throwifmachinefailure)
- [`workspaceFiles.FileHost`](../../engine/src/tooling/workspaceFiles.ts.mdmd.md#symbol-filehost) (type-only)
- [`workspaceFiles.WorkspaceReads`](../../engine/src/tooling/workspaceFiles.ts.mdmd.md#symbol-workspacereads-interface) (type-only)
- [`workspaceFiles.workspaceReads`](../../engine/src/tooling/workspaceFiles.ts.mdmd.md#symbol-workspacereads-function)
- [`workspaceListing`](../../engine/src/tooling/workspaceListing.ts.mdmd.md#symbol-workspacelisting-function)
- [`workspaceWalk.walkWorkspace`](../../engine/src/tooling/workspaceWalk.ts.mdmd.md#symbol-walkworkspace)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../../layer-3/engine-and-hosts.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
