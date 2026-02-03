# packages/shared/src/live-docs/adapters/css.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/css.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-css-test-ts
- Generated At: 2026-02-03T21:55:39.764Z

## Authored
### Purpose
Unit test suite for the CSS language adapter, validating dependency extraction from `@import` rules, `url()` references (quoted and bare), and `@font-face` declarations.

### Notes
- Created 2025-12-09 alongside the CSS adapter implementation
- Uses temp directories with real file creation to test path resolution
- Covers server-root-relative path resolution including document root detection in nested project structures
- Tests query string and fragment stripping from asset URLs
- Validates deduplication across quote style variations (`"url"`, `'url'`, `url`)
- Tests external URL filtering and missing file handling (unresolved dependencies)

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.764Z","inputHash":"7500961861ce5ff7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:os`
- `node:path`
- [`css.cssAdapter`](./css.ts.mdmd.md#symbol-cssadapter)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/live-docs: [core.ts](../core.ts.mdmd.md)
- packages/shared/src/live-docs/adapters: [adapters/index.ts](./index.ts.mdmd.md), [css.ts](./css.ts.mdmd.md)
- packages/shared/src/tooling: [pathUtils.ts](../../tooling/pathUtils.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
