# tests/e2e/pin-clicks.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/pin-clicks.spec.ts
- Generated At: 2026-10-15T01:42:25.501Z

## Authored
### Purpose
Playwright over this repository's Local Map, clicks alone: a symbol clicked on a neighbour is one pin and the subject stays, drawn whole; a card pins its file whole and its symbols then narrow, add, release and fall back to the whole file; the recentre control makes a neighbour the subject without a pin or the detail panel, and a double-click only pins; the Knowledge Sources route reaches one symbol of a far file in five clicks; and a finger drags the 2D map.

### Notes
- Written on 2026-10-15 ([Turn 10](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-10); [the decision](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#clicks-pin-what-they-name-and-the-subject-stays-where-it-is-recorded-2026-10-15)) from the night's click-only journey ([the probe record](../../../../AI-Agent-Workspace/Probes/2026-10-14/pin-clicks/README.md)), which found that the old rules made one pin impossible inside the map: the tests keep what the owner's rules of that morning give. The rosetta sample's `main.ts` and `models.ts` are the neighbours, as on the bundle's landing.
- The touch drag dispatches pointer events of type touch on the viewport and reads the map's transform, since Playwright's touchscreen taps but does not drag; the browser's own gestures are kept off by the viewport's `touch-action`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->
