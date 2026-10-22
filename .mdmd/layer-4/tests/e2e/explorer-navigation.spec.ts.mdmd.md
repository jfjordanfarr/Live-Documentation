# tests/e2e/explorer-navigation.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/explorer-navigation.spec.ts
- Generated At: 2026-10-22T16:47:58.118Z

## Authored
### Purpose

Exercises the three navigable Explorer views and the remembered Local Map representation through real browser journeys, reloads and fresh shared-link recipients.

### Notes

- Created after visually inspecting the [October 12 view consolidation](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-4). Covers old-link migration, directory entry in 3D, shared paths in both representations (asked by the pins and the destination of the address since 2026-10-14) and the landing behavior of bundles with and without boards. Replaces the retired Membrane default-view and stale-link cases with checks against their active successor.
- Navigation assertions read the canonical compressed state and require an explicit Local Map address, rather than depending on loose query parameters beside it. The subject, view and perspective must still survive reload, a recipient with fresh storage, and remembered navigation.
- The reveal test asks the browser to show every element of each view, at both ends, and then requires that nothing which clips has a scroll offset and that the Local Map's card stands where it stood. It failed on the World Map with `#main` scrolled 345 px before the views took `overflow: clip` (2026-10-21, [the work note](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#work-notes-the-gate-and-the-clipped-views)).

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
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
- [`search-bar.pathAddress`](./search-bar.ts.mdmd.md#symbol-pathaddress)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
