# packages/shared/src/live-docs/adapters/html.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/html.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-html-test-ts
- Generated At: 2025-12-11T02:38:01.932Z

## Authored
### Purpose
Unit test suite for the HTML language adapter, validating dependency extraction from HTML elements including stylesheets, scripts, images, srcset, video/audio sources, and poster attributes.

### Notes
- Created 2025-12-09 as part of HTML/CSS adapter implementation
- Uses temp directories with real file creation to test path resolution
- Covers server-root-relative path resolution including document root detection in nested project structures
- Validates the `public/` folder heuristic for finding document roots in typical web project layouts
- Tests external URL filtering (http, https, protocol-relative, data URIs)
- Tests deduplication of repeated references and srcset multi-URL parsing

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.932Z","inputHash":"3b5011a4bdb0dfd0"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`html.htmlAdapter`](./html.ts.mdmd.md#symbol-htmladapter)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/live-docs: [core.ts](../core.ts.mdmd.md)
- packages/shared/src/live-docs/adapters: [adapters/index.ts](./index.ts.mdmd.md), [html.ts](./html.ts.mdmd.md)
- packages/shared/src/tooling: [pathUtils.ts](../../tooling/pathUtils.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
