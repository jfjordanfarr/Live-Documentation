# tests/e2e/local-map-overview-names.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-overview-names.spec.ts
- Generated At: 2026-11-15T23:13:58.112Z

## Authored
### Purpose

A browser regression for a file's name in the overview look of a card that keeps its size: read from its drawn lines and its drawn scale, it is not broken inside a word while a smaller size, down to the connections look's, would keep its pieces whole, and it is never drawn above the look's size or below that floor.

### Notes

Written on 2026-11-15 ([Turn 1 of that day's record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-1)) as the third case of `local-map-overview-bars.spec.ts`, beside two cases for a second answer to the blank overview card: each silent row drawn as a faint bar where its name stood. The owner's eye and a comparison on three subjects chose files only, which became the default of Zoomed Out Fully that day; the bars and their two cases were removed, and the spec renamed for what it still holds ([the comparison's pictures](../../../../AI-Agent-Workspace/Screenshots/2026-11-15/tone-and-greeking/README.md)). The case chooses "Cards keep their size", since the default now collapses the cards. Where a name may break is the audit's own word on seams, independent of the code, as `zoom-looks.spec.ts` words it. On the commit before the fitting, `b956e179`, it fails: `approximation.ts` broke as "approxim" at the look's 3.6. A name may also be smaller because its room is short, which the case does not judge.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`still-picture.localMapStill`](./still-picture.ts.mdmd.md#symbol-localmapstill)
<!-- LIVE-DOC:END Dependencies -->
