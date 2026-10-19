# tests/e2e/pin-clicks.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/pin-clicks.spec.ts
- Generated At: 2026-10-16T21:50:08.451Z

## Authored
### Purpose
Playwright over the Local Map's click grammar: symbols and cards pin what they name without moving the subject, the explicit recentre control moves it, type badges inspect referenced files, and a finger drags the 2D map.

### Notes
- Written on 2026-10-15 ([Turn 10](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-10); [the decision](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#clicks-pin-what-they-name-and-the-subject-stays-where-it-is-recorded-2026-10-15)) from the night's click-only journey ([the probe record](../../../../AI-Agent-Workspace/Probes/2026-10-14/pin-clicks/README.md)), which found that the old rules made one pin impossible inside the map: the tests keep what the owner's rules of that morning give. The rosetta sample's `main.ts` and `models.ts` are the neighbours, as on the bundle's landing.
- The touch drag dispatches pointer events of type touch on the viewport and reads the map's transform, since Playwright's touchscreen taps but does not drag; the browser's own gestures are kept off by the viewport's `touch-action`.
- The estate's GatewayClient method supplies both a label and a resolved return-type badge. Double-clicking either must keep GatewayClient as the Local Map subject while two clicks leave one whole-file pin; only the badge opens PaymentResultModel in the detail panel. The context line names the inspected file, so the test reads the card's `local-focus` class for the subject. This regression follows a visual check of the type-reference gesture.

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
- [`still-picture.panIntoView`](./still-picture.ts.mdmd.md#symbol-panintoview)
<!-- LIVE-DOC:END Dependencies -->
