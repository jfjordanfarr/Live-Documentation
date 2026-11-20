# `packages/engine/src/live-docs/discovery.oracle.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/discovery.oracle.test.ts`
- Generated At: 2026-11-20T11:09:11.793Z

## Authored
### Purpose
Discovery held to git itself: over thirty small repositories made at random from seeds, with the default glob and no `exclude`, the files discovery documents are exactly what `git ls-files --cached --others --exclude-standard` lists, less the documents and what is not on the disk, and the documents it finds are exactly the documents git lists. A failure names its seed, and `ORACLE_SEED=<n>` runs that seed alone.

### Notes
- Written on 2026-11-20 after an independent review compared discovery with git over 3,700 random repositories by hand and found that `git check-ignore`, which read each path as a wildcard pattern, kept an ignored `a[1].log` beside a tracked `a1.log`; the review's harness was not kept, and this one is ([the review's findings, mended](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#judging-every-path-by-its-name-the-reviews-findings-mended)).
- Beside each name with a wildcard it puts the plain name the wildcard matches as a pattern, tracked more often than not: without that, the first thirty seeds all passed against the code before; with it, seven of thirty are red there, and none against the mended code.
- Left out, as its comment says, since git lists no file of theirs one by one: submodules, nested repositories and links to folders, held by the written cases of `discovery.test.ts` and `gitIgnored.test.ts`; and a case twin of a tracked file where `core.ignorecase` is true, which git takes for the tracked file itself, and a `.GIT` folder.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFileSync`
- `node:fs` - `appendFileSync`, `existsSync`, `mkdirSync`, `mkdtempSync`, `rmSync`, `unlinkSync`, `writeFileSync`
- `node:os` - `os`
- `node:path` - `path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`discovery.discoverDocuments`](./discovery.ts.mdmd.md#symbol-discoverdocuments)
- [`discovery.discoverTargetFiles`](./discovery.ts.mdmd.md#symbol-discovertargetfiles)
- `vitest` - `afterEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
