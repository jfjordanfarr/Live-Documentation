# tests/e2e/explorer-navigation.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/explorer-navigation.spec.ts
- Generated At: 2026-10-14T18:28:00.786Z

## Authored
### Purpose

Exercises the three navigable Explorer views and the remembered Local Map representation through real browser journeys, reloads and fresh shared-link recipients.

### Notes

- Created after visually inspecting the [October 12 view consolidation](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-4). Covers old-link migration, directory entry in 3D, shared paths in both representations (asked by the pins and the destination of the address since 2026-10-14) and the landing behavior of bundles with and without boards. Replaces the retired Membrane default-view and stale-link cases with checks against their active successor.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- `lz-string` - `compressToEncodedURIComponent`
- [`local-storage.PERSISTED_NAV_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_nav_key)
- [`search-bar.pathAddress`](./search-bar.ts.mdmd.md#symbol-pathaddress)
<!-- LIVE-DOC:END Dependencies -->
