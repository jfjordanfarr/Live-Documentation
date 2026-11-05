# tests/e2e/local-map-row-motion.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-row-motion.spec.ts
- Generated At: 2026-11-04T23:30:42.541Z

## Authored
### Purpose
Protects the legibility of expanded symbol text during real background-search row permutations, including motion cleanup.

### Notes
Introduced during the November 4 review after an intermediate Get/Post crossing was initially mistaken for a settled overlap. It records browser frames, requires an actual permutation and overlapping text boxes, and checks that the foreground text surface prevents superposition; a separate stationary case verifies the fixture without background search. See [the authorization and findings](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-8).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->
