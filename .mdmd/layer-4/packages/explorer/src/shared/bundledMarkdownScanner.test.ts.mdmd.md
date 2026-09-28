# packages/explorer/src/shared/bundledMarkdownScanner.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/shared/bundledMarkdownScanner.test.ts
- Generated At: 2026-09-27T23:21:29.368Z

## Authored
### Purpose
Proves that `scanAndBundleMarkdown` bundles every markdown file a Live Doc links to by default, and that `exclude` patterns keep a file out of both the bundle and the related-document links, so an excluded file can never surface as a node the Explorer cannot open.

### Notes
- Builds a real temporary workspace on disk (a Live Doc, a README, and a file inside a chat archive) rather than mocking the filesystem, because the scanner's relative-path resolution is the part most likely to break
- The exclusion case is the guard for the `bundleExclude` config field introduced on 2026-09-27 to keep this repository's chat archive out of the public Explorer bundle

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `fs/promises`
- `os`
- [`bundledMarkdownScanner.scanAndBundleMarkdown`](./bundledMarkdownScanner.ts.mdmd.md#symbol-scanandbundlemarkdown)
- `path`
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
