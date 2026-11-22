# `tests/e2e/local-map-mirror.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/local-map-mirror.spec.ts`
- Generated At: 2026-11-22T04:50:14.379Z

## Authored
### Purpose
Holds the 2D Local Map's mirror button to its promises in a browser: a press reflects every card about the subject, which keeps its place, and the button and the key say which way the picture reads; the keyboard presses it; the choice outlasts a reload and is in no address; the mirrored picture keeps every law of the scenario suite with the sides exchanged; and the button is offered only in 2D.

### Notes
- Written 2026-11-22 with the mirror ([the Explorer design](../../../layer-3/live-documentation-explorer.mdmd.md#which-way-the-2d-picture-reads-the-mirror-2026-11-22)). Read on this repository's own map, the pathfinder in focus, which has files on both sides of it.
- Each case was seen failing against a page broken for it, built once with four breaks: the root's reflection taken out of the stylesheet (the press's case failed on a card 1,046 px from its mirrored place, and the laws' case on the law of the sides), the button's explanation reworded (the keyboard's case), the saving left out of the press (the reload's case, on the stored settings) and the button shown in every view (the last case, in 3D).
- The laws' case compares the mirrored picture with the same picture as laid out, law by law, since a subject taller than this window reaches below the frame either way. Its first run found the suite's instrument placing a directory's published segments unreflected, which `scenarios/instrument.ts` now reflects.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- `node:path` - `path`
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`instrument.readSettled`](./scenarios/instrument.ts.mdmd.md#symbol-readsettled)
- [`instrument.watchPage`](./scenarios/instrument.ts.mdmd.md#symbol-watchpage)
- [`judgments.LAWS`](./scenarios/judgments.ts.mdmd.md#symbol-laws)
- [`judgments.routesForward`](./scenarios/judgments.ts.mdmd.md#symbol-routesforward)
- [`judgments.usesLeftOfferingsRight`](./scenarios/judgments.ts.mdmd.md#symbol-usesleftofferingsright)
- [`still-picture.displayNames`](./still-picture.ts.mdmd.md#symbol-displaynames)
- [`still-picture.loadGraph`](./still-picture.ts.mdmd.md#symbol-loadgraph)
- [`still-picture.localMapStill`](./still-picture.ts.mdmd.md#symbol-localmapstill)
<!-- LIVE-DOC:END Dependencies -->
