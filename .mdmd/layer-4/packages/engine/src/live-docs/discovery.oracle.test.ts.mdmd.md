# `packages/engine/src/live-docs/discovery.oracle.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/discovery.oracle.test.ts`
- Generated At: 2026-11-20T11:55:29.902Z

## Authored
### Purpose
Discovery held to a second view of git, not to the listing discovery reads: over thirty small repositories made at random from seeds, with the default glob and no `exclude`, the files discovery documents are exactly the files on the disk, by a plain walk, less what `git status --porcelain -z --ignored -uall` calls ignored and less the documents, and the documents it finds are exactly such documents; over fifteen more with a submodule and a nested repository in them, each repository's files are judged by its own status. A failure names its seed, and `ORACLE_SEED=<n>` runs that seed alone.

### Notes
- Written on 2026-11-20 after an independent review compared discovery with git over 3,700 random repositories by hand and found that `git check-ignore`, which read each path as a wildcard pattern, kept an ignored `a[1].log` beside a tracked `a1.log`; the review's harness was not kept, and this one is ([the review's findings, mended](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#judging-every-path-by-its-name-the-reviews-findings-mended)). Its first oracle was `git ls-files --cached --others --exclude-standard`, close kin of what the code came to read; the same day it was rewritten to hold discovery to `git status` and the disk ([the third form](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#reading-gits-own-listing-the-third-form)).
- The generator makes on purpose what random names never make: beside each name with a wildcard the plain name the wildcard matches as a pattern, tracked more often than not; top-level names beginning with `:`; a tracked `.gitignore` marked skip-worktree and deleted; a file in the place of a tracked folder; a tracked folder whose case differs on the disk where `core.ignorecase` is true. Against the code of the second form, three of the thirty plain seeds and thirteen of the fifteen nested ones are red; none against the third.
- The deviations from git that remain are named in its header: a case twin of a tracked file where `core.ignorecase` is true, a `.GIT` folder in another case, and the files beyond a link to a folder, held by the written cases of `discovery.test.ts` and `gitIgnored.test.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFileSync`
- `node:fs` - `appendFileSync`, `mkdirSync`, `mkdtempSync`, `readdirSync`, `renameSync`, `rmSync`, `statSync`, `unlinkSync`, `writeFileSync`
- `node:os` - `os`
- `node:path` - `path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`discovery.discoverDocuments`](./discovery.ts.mdmd.md#symbol-discoverdocuments)
- [`discovery.discoverTargetFiles`](./discovery.ts.mdmd.md#symbol-discovertargetfiles)
- `vitest` - `afterEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
