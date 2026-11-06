# tests/e2e/pin-clicks.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/pin-clicks.spec.ts
- Generated At: 2026-11-06T03:23:54.800Z

## Authored
### Purpose
Exercises the Local Map's explicit interaction grammar: direct Pin controls retain files or symbols, labels and type badges inspect independently, Centre changes the subject, and a finger can pan the map.

### Notes
- Written on 2026-10-15 ([Turn 10](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-10); [the decision](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#clicks-pin-what-they-name-and-the-subject-stays-where-it-is-recorded-2026-10-15)) from the night's click-only journey ([the probe record](../../../../AI-Agent-Workspace/Probes/2026-10-14/pin-clicks/README.md)), which found that the former rules made one pin impossible inside the map. The retention assertions preserve the resulting narrow/add/release/last-symbol fallback policy. The owner later selected independent Inspect and direct Pin in [October 19, Turn 24](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24), implemented and inspected during the [October 20 continuation](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2); the tests now press those explicit controls. The Rosetta sample's `main.ts` and `models.ts` remain the neighboring files.
- The touch drag dispatches pointer events of type touch on the viewport and reads the map's transform, since Playwright's touchscreen taps but does not drag; the browser's own gestures are kept off by the viewport's `touch-action`.
- The estate's GatewayClient method supplies both a label and a resolved return-type badge. Double-clicking either must keep GatewayClient as the subject with no pins added. The label inspects GetPaymentAsync; the badge inspects PaymentResultModel. Both the context line and the card's `local-focus` identity continue to name the map subject. A file-body double-click likewise inspects without performing the optional, unimplemented double-Go shortcut.
- The Knowledge Sources journey opens a distant file's evidence, uses its visible Centre command and pins one chosen symbol directly. This keeps the fast connection-following route while checking that neither inspection nor centring inserts a pin.
- A symbol pin's partners in its own file (2026-11-03, [the owner's question](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-02.1.record.md#turn-14), Turn 14 of the November 2 record): the TypeScript Rosetta sample has no reference within a file, so this test uses the Python sample, where `models.py`'s `create_record` returns its `Record`. The subject is `processor.py`, which uses `Record`, `Report` and `validate_config` but not `create_record`; `main.py` would not do, since it imports `create_record` and the row would show without the rule. Pinning `models.py` whole and narrowing it to `Record` must leave `create_record` neither folded nor muted, draw both laces of the reference, and fold the six fields of `Record` and `Report` behind a `+6 symbols` reveal.

Since [November 5](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-1) a name's click reads its description rather than inspecting. The double-click cases keep their point, that no click on a name adds a pin or moves the subject, and now also assert that the evidence reader stays closed; the recorded-type case still inspects the referenced file.

Since [Turn 11](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11), when Card Text came to default to the fixed-slot composition, this spec pins the growing composition in its init script, since its journeys read that composition's recorded facts and in-place descriptions; the composition not chosen is to be deleted with its spec when the owner decides.

On [Turn 12](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-12--november-6) the pin became `keepGrowingComposition`, which merges the choice into the saved tuning rather than replacing it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`still-picture.keepGrowingComposition`](./still-picture.ts.mdmd.md#symbol-keepgrowingcomposition)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- [`still-picture.panIntoView`](./still-picture.ts.mdmd.md#symbol-panintoview)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../layer-3/architectural-decisions.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
