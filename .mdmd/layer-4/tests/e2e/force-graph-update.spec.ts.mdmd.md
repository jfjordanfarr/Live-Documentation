# tests/e2e/force-graph-update.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-update.spec.ts
- Generated At: 2026-10-18T02:59:06.010Z

## Authored
### Purpose
Holds the 3D Local Map's one update path for a membership change to what the update energy says it does, in a real browser, read from the rendered scene: placement alone moves nothing and ticks nothing, the full reheat and the gentle update settle in their own ticks with the gentle one stirring the unchanged spheres less, a born sphere starts beside what it is wired to, and a change keeps the lines' objects. Written for ticket C2 of [the change-over-time plan](../../../layer-3/change-over-time.mdmd.md#open-questions), 2026-10-18.

### Notes
The stage is this repository's bundle in the connections layout at a modest viewport, where Show Tests brings 213 spheres in and out; the estate sample could not serve, since its related-doc links all target Live Docs, which the spatial projection leaves out, so a toggle there changes no membership. The first test opens with the tests hidden at energy zero, so showing them is a change with births: after it every unchanged sphere's rendered position is exactly what it was, the container was never busy, and each born sphere wired only to spheres that already stood stands at the mean of its springs' rest lengths from their mean position, read from the rendered spheres and lines, which is the page's placement rule and not the origin where D3 would seat it; hidden again, nothing else moves. The second opens at energy one, marks every line's object, toggles the tests out and reads the ticks as the frames between the container saying busy and saying settled (`settleTicksOf(1)`, three hundred, with three frames of slack for the library's deferred update and its stopping frame), the unchanged spheres' mean move, and that every line among the spheres that stayed kept its object; then it brings the tests back at full energy, sets the energy to a tenth by the slider under Tuning as a person would (which stirs nothing), toggles them out again and holds the gentle update to two hundred ticks and to less than six tenths of the full reheat's stir (the page measured 0.42 on 2026-10-18; a share not applied would give about 0.9), and the setting to the address and the container's layout settings. The ticks are predicted by the same pure function the page's schedule is built from, so the page and the lab's twin cannot disagree about them without this spec saying so. The Notes first described the estate as the stage, before the builder found it could not serve; corrected the same day.

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
- [`local-storage.getDefaultTuning`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`forceGraphLayout.settleTicksOf`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-settleticksof)
- [`force-graph-observation.engineActivity`](./force-graph-observation.ts.mdmd.md#symbol-engineactivity)
- [`force-graph-observation.markRenderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-markrenderedlinks)
- [`force-graph-observation.markedRenderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-markedrenderedlinks)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-renderedlinks)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
<!-- LIVE-DOC:END Dependencies -->
