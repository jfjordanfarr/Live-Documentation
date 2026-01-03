# packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-views-localview-pan-zoom-test-ts
- Generated At: 2026-01-03T20:41:39.241Z

## Authored
### Purpose
Unit tests for the pan-zoom pure functions. Validates clamp behavior, easing curves, and zoom-at-point calculations including the invariant that the point under the cursor stays fixed during zoom.

### Notes
Created during Dev Day 50 (12/19) to provide coverage for the Phase 4 extraction. Tests mathematical properties rather than DOM behavior, ensuring the pure functions are independently verifiable.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-03T20:41:39.241Z","inputHash":"55053820992c8919"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`pan-zoom.clamp`](./pan-zoom.ts.mdmd.md#symbol-clamp)
- [`pan-zoom.easeOutCubic`](./pan-zoom.ts.mdmd.md#symbol-easeoutcubic)
- [`pan-zoom.zoomAtPoint`](./pan-zoom.ts.mdmd.md#symbol-zoomatpoint)
- [`runtime.LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime) (type-only)
- [`types.MapTransform`](./types.ts.mdmd.md#symbol-maptransform) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/scripts/src/live-docs/explorer/client: [types.ts](../../types.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views/localView: [connections.ts](./connections.ts.mdmd.md), [pan-zoom.ts](./pan-zoom.ts.mdmd.md), [runtime.ts](./runtime.ts.mdmd.md), [state.ts](./state.ts.mdmd.md), [types.ts](./types.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/shared: [types.ts](../../../shared/types.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
