# `packages/engine/src/live-docs/discoveryCore.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/discoveryCore.ts`
- Generated At: 2026-11-24T10:31:38.527Z

## Authored
### Purpose
Implements pure host-driven file discovery, prose-document discovery, and workspace symbol/entry indexing over an explicit `FileHost`, consulting `host.git` only when present and otherwise judging through `leaveOut.ts` and the workspace's root `.gitignore` (or an explicit `leaveOut` list) without importing Node's disk or git subprocess modules.

### Notes
- Extracted from `discovery.ts` on 2026-11-24 for Step 8 of [the road to one engine for a page and a command line](../../../../../layer-3/engine-and-hosts.mdmd.md#6-the-road), keeping `gitIgnored.ts`, `gitUtils.ts`, `node:child_process`, `node:process`, and `nodeHost.ts` out of the browser scan bundle.
- Node callers continue using `discovery.ts`, which wraps this module with `NODE_FILE_HOST` and `NODE_GIT_HOST`. When `host.git` is absent and `--changed` is requested, discovery fails clearly rather than touching `child_process`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DiscoverWithHostOptions` {#symbol-discoverwithhostoptions}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/discoveryCore.ts#L47)

##### `DiscoverWithHostOptions` — Summary
Options for discovering target source files and workspace documents through an explicit {@link FileHost}.

#### `DiscoverOptions` {#symbol-discoveroptions}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/discoveryCore.ts#L71)

##### `DiscoverOptions` — Summary
Options for discovering target source files and workspace documents (Node defaults `host` when omitted).

#### `DiscoveredTargets` {#symbol-discoveredtargets}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/discoveryCore.ts#L77)

##### `DiscoveredTargets` — Summary
Result of {@link discoverWorkspaceTargetFilesWithHost}: the kept files and a predicate answering whether a path was left out.

#### `docsRootWithin` {#symbol-docsrootwithin}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discoveryCore.ts#L218)
- Parameters: `config`: [`LiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)

##### `docsRootWithin` — Summary
The configured docs root as a workspace-relative path, however the
configuration spells it (`.mdmd`, `./.mdmd/`, an absolute path), or
`undefined` when it is not a folder within the workspace: the workspace
itself, or somewhere outside it.

#### `discoverWorkspaceTargetFilesWithHost` {#symbol-discoverworkspacetargetfileswithhost}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discoveryCore.ts#L231)
- Parameters: `options`: [`DiscoverWithHostOptions`](#symbol-discoverwithhostoptions)

##### `discoverWorkspaceTargetFilesWithHost` — Summary
Locates workspace files that should receive Live Documentation generation using an explicit {@link FileHost}.
Uses `host.git` when supplied; otherwise judges by the workspace's root `.gitignore` (via `leaveOut.ts`) or an
explicit `options.leaveOut` list.

#### `discoverTargetFilesWithHost` {#symbol-discovertargetfileswithhost}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discoveryCore.ts#L263)
- Parameters: `options`: [`DiscoverWithHostOptions`](#symbol-discoverwithhostoptions)

##### `discoverTargetFilesWithHost` — Summary
Locates workspace files that should receive Live Documentation generation using an explicit {@link FileHost},
returning only the sorted absolute paths.

#### `discoverDocumentsWithHost` {#symbol-discoverdocumentswithhost}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discoveryCore.ts#L273)

##### `discoverDocumentsWithHost` — Summary
Discovers the workspace's prose documents ({@link isDocument}) using an explicit {@link FileHost},
held to the same leave-out, git, and configuration rules as source files.

##### `discoverDocumentsWithHost` — Returns
Workspace-relative paths with forward slashes, sorted.

#### `inWorkspaceOrder` {#symbol-inworkspaceorder}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discoveryCore.ts#L412)
- Returns: `T`[]
- Parameters: `files`: `T`[]

##### `inWorkspaceOrder` — Summary
Files in the order of their workspace-relative paths with forward slashes, by UTF-16 code unit, whatever the platform
spells their absolute paths with: on Windows a backslash sorts after the digits and the capitals, where a slash sorts
before them, so an order of absolute paths put `Shop.Data2\` before `Shop.Data\`, the reverse of Linux. The order is
the one in which files register their symbols, so it must not depend on the platform.

#### `WorkspaceIndexes` {#symbol-workspaceindexes}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/discoveryCore.ts#L466)

##### `WorkspaceIndexes` — Summary
The indexes the first pass builds: the symbols every file publishes, the files manifests declare as entries, and what readers say exists for the tests.

#### `buildWorkspaceIndexes` {#symbol-buildworkspaceindexes}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discoveryCore.ts#L512)

##### `buildWorkspaceIndexes` — Summary
Builds the workspace-wide indexes for cross-Live-Doc resolution in one pass
over the target files.

##### `buildWorkspaceIndexes` — Remarks
The symbol index maps each exported symbol's name (case-sensitive) to its
locations, so that a type reference in one Live Doc links to the type's
definition in another; several files may publish one name. The entry index
maps each file a manifest declares as an entry (a script it runs, a binary,
its main module) to what declares it, so that the file's doc carries the
`Entry` line. The test index gathers what readers say exists for the tests
where no path shows it (each .NET project and whether it is a test project,
Rust's modules compiled for the tests alone, the scripts that create the
procedures of a tSQLt test class), so that the file's doc carries its
`Archetype` by its language's rule of tests. TypeScript and JavaScript files
are read with the built-in parser; every other file is read by its language
adapter.

Whatever a file throws while it is read, a failure of the machine's (too
many open files) or a stack run short, leaves its symbols out and names it in
`unmapped` with the error, which the generator carries to its list of files
it could not map, as it does a throw of its own per-file pass: there a
person's run names the file and goes on, and the history publishes no summary
made with a failure of the machine's. Until 2026-11-20 every throw was
swallowed, and a symbol whose file failed here was linked to the barrel that
re-exports it, with no mark and no warning.

##### `buildWorkspaceIndexes` — Parameters
- `options.docExtension`: File extension for Live Docs (e.g., ".md").
- `options.fileIndex`: The workspace file index, for the adapters that resolve string references.
- `options.liveDocsRoot`: Workspace-relative path to the Live Docs root (e.g., ".live-documentation/source").
- `options.targetFiles`: Absolute paths to all files being processed.
- `options.workspaceRoot`: Absolute path to the workspace root.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`LiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`index.WorkspaceFileIndex`](./adapters/index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`index.analyzeWithLanguageAdapters`](./adapters/index.ts.mdmd.md#symbol-analyzewithlanguageadapters)
- [`archetype.matchesPathPattern`](./archetype.ts.mdmd.md#symbol-matchespathpattern)
- [`compose.anchorReExports`](./compose.ts.mdmd.md#symbol-anchorreexports)
- [`compose.computePublicSymbolHeadingInfo`](./compose.ts.mdmd.md#symbol-computepublicsymbolheadinginfo)
- [`coreConstants.SUPPORTED_SCRIPT_EXTENSIONS`](./coreConstants.ts.mdmd.md#symbol-supported_script_extensions)
- [`coreTypes.DeclaredEntry`](./coreTypes.ts.mdmd.md#symbol-declaredentry) (type-only)
- [`coreTypes.DependencyEntry`](./coreTypes.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`coreTypes.PublicSymbolEntry`](./coreTypes.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`coreTypes.ReExportedSymbolInfo`](./coreTypes.ts.mdmd.md#symbol-reexportedsymbolinfo) (type-only)
- [`coreTypes.ResolvedSymbolLocation`](./coreTypes.ts.mdmd.md#symbol-resolvedsymbollocation) (type-only)
- [`coreTypes.TestFacts`](./coreTypes.ts.mdmd.md#symbol-testfacts) (type-only)
- [`coreTypes.WorkspaceEntryIndex`](./coreTypes.ts.mdmd.md#symbol-workspaceentryindex) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`coreTypes.WorkspaceTestIndex`](./coreTypes.ts.mdmd.md#symbol-workspacetestindex) (type-only)
- [`dependencies.augmentWithReExportedSymbols`](./dependencies.ts.mdmd.md#symbol-augmentwithreexportedsymbols)
- [`dependencies.collectDependencies`](./dependencies.ts.mdmd.md#symbol-collectdependencies)
- [`symbolExtraction.collectExportedSymbols`](./symbolExtraction.ts.mdmd.md#symbol-collectexportedsymbols)
- [`symbolExtraction.inferScriptKind`](./symbolExtraction.ts.mdmd.md#symbol-inferscriptkind)
- [`enginePath.path`](../tooling/enginePath.ts.mdmd.md)
- [`LeaveOut`](../tooling/leaveOut.ts.mdmd.md#symbol-leaveout-interface) (type-only)
- [`leaveOut.LeaveOutInput`](../tooling/leaveOut.ts.mdmd.md#symbol-leaveoutinput) (type-only)
- [`leaveOut.fromGitignores`](../tooling/leaveOut.ts.mdmd.md#symbol-fromgitignores)
- [`leaveOut`](../tooling/leaveOut.ts.mdmd.md#symbol-leaveout-function)
- [`pathUtils.normalizeWorkspacePath`](../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- [`sourceText.decodeSourceText`](../tooling/sourceText.ts.mdmd.md#symbol-decodesourcetext)
- [`sourceText.readSourceText`](../tooling/sourceText.ts.mdmd.md#symbol-readsourcetext)
- [`sourceText.throwIfMachineFailure`](../tooling/sourceText.ts.mdmd.md#symbol-throwifmachinefailure)
- [`workspaceFiles.FileHost`](../tooling/workspaceFiles.ts.mdmd.md#symbol-filehost) (type-only)
- [`workspaceFiles.GitIgnoreAnswer`](../tooling/workspaceFiles.ts.mdmd.md#symbol-gitignoreanswer) (type-only)
- [`workspaceFiles.GitIgnores`](../tooling/workspaceFiles.ts.mdmd.md#symbol-gitignores) (type-only)
- [`workspaceFiles.GitUnanswered`](../tooling/workspaceFiles.ts.mdmd.md#symbol-gitunanswered) (type-only)
- [`workspaceFiles.WorkspaceReads`](../tooling/workspaceFiles.ts.mdmd.md#symbol-workspacereads-interface) (type-only)
- [`workspaceWalk.UnreadableFolder`](../tooling/workspaceWalk.ts.mdmd.md#symbol-unreadablefolder) (type-only)
- [`workspaceWalk.WalkedFile`](../tooling/workspaceWalk.ts.mdmd.md#symbol-walkedfile) (type-only)
- [`workspaceWalk.walkWorkspace`](../tooling/workspaceWalk.ts.mdmd.md#symbol-walkworkspace)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../../../layer-3/engine-and-hosts.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
