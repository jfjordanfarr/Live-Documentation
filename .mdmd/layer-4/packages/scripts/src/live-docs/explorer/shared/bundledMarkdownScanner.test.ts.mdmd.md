# packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-shared-bundledmarkdownscanner-test-ts
- Generated At: 2026-09-27T02:38:09.669Z

## Authored
### Purpose
Proves that `scanAndBundleMarkdown` bundles every markdown file a Live Doc links to by default, and that `exclude` patterns keep a file out of both the bundle and the related-document links, so an excluded file can never surface as a node the Explorer cannot open.

### Notes
- Builds a real temporary workspace on disk (a Live Doc, a README, and a file inside a chat archive) rather than mocking the filesystem, because the scanner's relative-path resolution is the part most likely to break
- The exclusion case is the guard for the `bundleExclude` config field introduced on 2026-09-27 to keep this repository's chat archive out of the public Explorer bundle

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T02:38:09.669Z","inputHash":"378eb7d7b0c15640"}]} -->
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

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/scripts/src/live-docs/explorer/shared: [bundledMarkdownScanner.ts](./bundledMarkdownScanner.ts.mdmd.md), [staticExplorerData.ts](./staticExplorerData.ts.mdmd.md), [types.ts](./types.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
