# packages/shared/src/live-docs/adapters/html.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/html.test.ts
- Generated At: 2026-09-27T23:21:30.603Z

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
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:os`
- `node:path`
- [`html.htmlAdapter`](./html.ts.mdmd.md#symbol-htmladapter)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
