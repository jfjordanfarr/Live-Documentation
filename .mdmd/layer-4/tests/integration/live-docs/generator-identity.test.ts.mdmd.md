# tests/integration/live-docs/generator-identity.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/generator-identity.test.ts
- Generated At: 2026-10-19T19:14:41.534Z

## Authored
### Purpose
Hold the history lens to real Git behavior: this tool's dependency-lock changes invalidate its cache, while unrelated checkout or host-project changes do not.

### Notes
- Bundles the actual generator identity module into an isolated tool checkout at its expected package path, then runs it in Node while Git supplies committed, modified, absent, untracked and ignored lock states. A second repository holds an installed copy to prove its host lock is not treated as the tool's own. The fixture workspaces and bundle are temporary and removed after the suite.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `esbuild` - `build`
- `node:child_process` - `execFileSync`
- `node:fs`
- `node:os`
- `node:path`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`format.GeneratorIdentity`](../../../packages/engine/src/live-docs/history/format.ts.mdmd.md#symbol-generatoridentity) (type-only)
- [`lens.lensOf`](../../../packages/engine/src/live-docs/history/lens.ts.mdmd.md#symbol-lensof)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
