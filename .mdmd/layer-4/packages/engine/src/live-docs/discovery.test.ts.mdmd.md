# `packages/engine/src/live-docs/discovery.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/discovery.test.ts`
- Generated At: 2026-11-24T07:54:04.185Z

## Authored
### Purpose
Discovery's product rules over a temporary workspace: every file read by default, hidden ones and ones no reader handles among them; `.git`, `node_modules`, the docs root, lock files and documents never, whatever a configured glob or an include names, a source file whose name only looks like a document's (`license.ts`, `readme-generator.ts`) being read; `.gitignore` honoured except for a file git tracks, the docs root derived from the configuration in any spelling, and `exclude` by path or glob.

### Notes
- Written 2026-10-16 with the suffix-anywhere defaults ([Turn 9 of the October 15 session](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-15/2026-10-15.1.record.md#turn-9)); the tracked-file case initialises a git repository in the temporary workspace.
- The every-file default and the documents rule came on 2026-10-22 ([Turn 8 of the October 21 session](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-21/2026-10-21.1.record.md#turn-8)); breaking either the rule or the document-name pattern fails both of the first two cases.
- `inWorkspaceOrder` (2026-11-19) is held to one order of files whether their absolute paths are spelled with slashes or backslashes, where an order of the absolute paths reverses `Data/` and `DataAccess/`, `Shop.Data/` and `Shop.Data2/`.
- The folders git ignores whole (2026-11-20): cases with their lists written out, each one where a wrong shortening of the walk would find another list (a folder holding a tracked file, each kind of excludes file, nested repositories and worktrees, odd names, git's case rule, a submodule, a link to a folder, a folder beginning with `:`, a workspace inside an ignored folder), and one that counts the folders read through the walk's file system, so that the shortening itself is held. They passed on the discovery before the change as on the one after, but the count, which is red without the shortening ([the probe of 2026-11-20](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#the-cases-and-the-tests-that-hold-them)). The same day, after a review, the cases where git refused a path (a submodule, a link, a name beginning with `:`) were rewritten to git's answer by name, and cases came for names a tracked file's wildcard pattern matches, two folders differing in case alone, and the warning of the files git cannot judge; each was red against the code before, and `discovery.oracle.test.ts` holds discovery to git over random repositories ([the review's findings, mended](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#judging-every-path-by-its-name-the-reviews-findings-mended)). With the third form, the same day, the submodule's case became a submodule's and a nested repository's files judged each by its own git, and one case came for a git whose listing fails, after which the walk is whole and the root `.gitignore` alone judges; each was red against the second form. After that form's review, the case of the `GIT_*_PATHSPECS` variables, which could not fail, went; the failing listing is tried before the walk and after it; and cases came for a folder a build makes during the walk, judged by the listing taken after it, and for the warning of both walks, documents included, of a nested repository git cannot be asked about ([its review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#the-review-of-the-third-form-mended)) ([the third form](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#reading-gits-own-listing-the-third-form)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFileSync`, `spawnSync`
- `node:fs` - `nodeFs`
- `node:fs/promises`
- `node:module` - `syncBuiltinESMExports`
- `node:os`
- `node:path` - `path`
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput) (type-only)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`discovery.buildWorkspaceIndexes`](./discovery.ts.mdmd.md#symbol-buildworkspaceindexes)
- [`discovery.discoverDocuments`](./discovery.ts.mdmd.md#symbol-discoverdocuments)
- [`discovery.discoverTargetFiles`](./discovery.ts.mdmd.md#symbol-discovertargetfiles)
- [`discovery.discoverWorkspaceTargetFiles`](./discovery.ts.mdmd.md#symbol-discoverworkspacetargetfiles)
- [`discovery.inWorkspaceOrder`](./discovery.ts.mdmd.md#symbol-inworkspaceorder)
- [`discoveryCore.discoverWorkspaceTargetFilesWithHost`](./discoveryCore.ts.mdmd.md#symbol-discoverworkspacetargetfileswithhost)
- [`processMark.machineFailure`](./processMark.ts.mdmd.md#symbol-machinefailure)
- [`gitIgnored.gitIgnores`](../tooling/gitIgnored.ts.mdmd.md#symbol-gitignores-function)
- [`workspaceFiles.FileHost`](../tooling/workspaceFiles.ts.mdmd.md#symbol-filehost) (type-only)
- [`workspaceFiles.FolderEntries`](../tooling/workspaceFiles.ts.mdmd.md#symbol-folderentries) (type-only)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->
