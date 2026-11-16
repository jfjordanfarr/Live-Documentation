# tests/e2e/local-map-overview.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-overview.spec.ts
- Generated At: 2026-11-06T20:08:52.740Z

## Authored
### Purpose

Browser regressions for the 2D Local Map's overview band and farthest zoom: one gathered wire per pair of files each way, hub to hub, its count and width and accessible name, nothing else drawn without a pin; the closer band's wires restored on coming back in; a pinned symbol's own wires from its row's dots above the gathered ones; the legend's width row only there; and Zoom Out stopping where the whole of a large map stands in the frame, beyond the last step, or at the last step for a small map, the button disabled and the wheel stopped there too.

### Notes

Written in the far bands' second milestone (2026-11-06), from the root's brief and its amendments of the same day ([Turn 3](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-3) gave the go-ahead): a silent row draws nothing at the overview band, its dots included, so that a wire ends on a dot only on a pinned row and on its file's hub otherwise. The cases walk the still picture out to the far band's last step and one press farther, compare the wires before and after a round trip to the hundredth of a pixel, and pin the subject's first symbol row, which the arrival frames at its title whatever the picture holds.

Since the three looks became Zoom Looks' default on 2026-11-13 ([Turn 3 of that day's record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-13.1.record.md#turn-3)) the spec reads the default, whose overview look draws the overview band's drawing, except the case of a small map stopping at the ladder's last step, which chooses the ladder whose step it reads; a case of its own holds the same far limit in the three looks, in the overview look. Run in the three looks, the pinned symbol's case found its wire starting 1.47 px from its dot at rest, past its 1 px bound: the wires were drawn the frame after the change of look, where the travelling dot stood at its first frame, and not again. The controller now draws them again when the change's animations end, and the case is unchanged.

Files only is the default of Zoomed Out Fully since 2026-11-15, by the owner's eye and a comparison with the cards' rows drawn as bars ([Turn 1 of that day's record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-1)): this spec holds the overview of cards that keep their size (one gathered wire a pair, a pinned symbol's own wires, the far limit), so every case of it now chooses "Cards keep their size" in the remembered tuning rather than rely on the default.

Since 2026-11-16 ([Turn 10 of the November 15 record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-10)) the legend's row at the overview band reads *References*, and the case reads its sentence, "Width: the number of references between two files.", from the row's tooltip.

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
- [`ladder-steps.LAST_STEP`](../../packages/explorer/src/client/views/localView/ladder-steps.ts.mdmd.md#symbol-last_step)
- [`ladder-steps.STEP_RATIO`](../../packages/explorer/src/client/views/localView/ladder-steps.ts.mdmd.md#symbol-step_ratio)
- [`wire-gathering.GATHERED_WIDTH`](../../packages/explorer/src/client/views/localView/wire-gathering.ts.mdmd.md#symbol-gathered_width)
- [`still-picture.localMapStill`](./still-picture.ts.mdmd.md#symbol-localmapstill)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
