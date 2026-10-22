# tests/e2e/pin-clicks.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/pin-clicks.spec.ts
- Generated At: 2026-10-22T16:47:58.787Z

## Authored
### Purpose
Exercises the Local Map's explicit interaction grammar: direct Pin controls retain files or symbols, labels and type badges inspect independently, Centre changes the subject, and a finger can pan the map.

### Notes
- Written on 2026-10-15 ([Turn 10](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-10); [the decision](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#clicks-pin-what-they-name-and-the-subject-stays-where-it-is-recorded-2026-10-15)) from the night's click-only journey ([the probe record](../../../../AI-Agent-Workspace/Probes/2026-10-14/pin-clicks/README.md)), which found that the former rules made one pin impossible inside the map. The retention assertions preserve the resulting narrow/add/release/last-symbol fallback policy. The owner later selected independent Inspect and direct Pin in [October 19, Turn 24](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24), implemented and inspected during the [October 20 continuation](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2); the tests now press those explicit controls. The Rosetta sample's `main.ts` and `models.ts` remain the neighboring files.
- The touch drag dispatches pointer events of type touch on the viewport and reads the map's transform, since Playwright's touchscreen taps but does not drag; the browser's own gestures are kept off by the viewport's `touch-action`.
- The estate's GatewayClient method supplies both a label and a resolved return-type badge. Double-clicking either must keep GatewayClient as the subject with no pins added. The label inspects GetPaymentAsync; the badge inspects PaymentResultModel. Both the context line and the card's `local-focus` identity continue to name the map subject. A file-body double-click likewise inspects without performing the optional, unimplemented double-Go shortcut.
- The Knowledge Sources journey opens a distant file's evidence, uses its visible Centre command and pins one chosen symbol directly. This keeps the fast connection-following route while checking that neither inspection nor centring inserts a pin.

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

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../layer-3/architectural-decisions.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
