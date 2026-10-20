# packages/explorer/src/shared/bundledMarkdownScanner.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/shared/bundledMarkdownScanner.test.ts
- Generated At: 2026-10-20T21:28:56.197Z

## Authored
### Purpose
Proves that `bundleRelatedDocs` bundles each linked document once while keeping every link to it, files it in the tree, and drops a link to a document that cannot be read, so the Explorer never shows a related document it cannot open.

### Notes
- Builds a real temporary workspace on disk (a Live Doc, a README, and a file inside a chat archive) rather than mocking the filesystem, because the scanner's relative-path resolution is the part most likely to break
- The exclusion case, the guard of the `bundleExclude` field introduced on 2026-09-27 to keep this repository's chat archive out of the public bundle, moved on 2026-10-20 to the engine's `relatedDocs.test.ts` with the rule ([Turn 9](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `fs/promises`
- `os`
- [`bundledMarkdownScanner.bundleRelatedDocs`](./bundledMarkdownScanner.ts.mdmd.md#symbol-bundlerelateddocs)
- `path`
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
