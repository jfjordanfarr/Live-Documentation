# tests/e2e/history-scrubber.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/history-scrubber.spec.ts
- Generated At: 2026-10-22T16:47:58.297Z

## Authored
### Purpose
Holds the history of the 3D Local Map over the scripted sample's two bundles: the control and the scrubber's ticks, the keyboard grammar, a renamed file and its hub keeping their objects and places, a death shown as a death with "gone since", a pin not yet born said in the tray and its birth the one major tick, the address carrying the commit and the authors toggle, a drag placing every step without a tick and the rest settling, the window's truncated beginning, the Knowledge Sources line, and the design audit over each state.

### Notes
- Written 2026-10-18 for ticket C4 of [the change-over-time plan](../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions), after the looking ([the pictures](../../../../AI-Agent-Workspace/Screenshots/2026-10-18/history/README.md)). The bundles are `samples/history/` and `samples/history-window/`, built by `npm run live-docs:visualize:history-sample` from `tests/integration/live-docs/scripted-repository.ts`; the commits are read from each bundle's own history file, the spheres and lines from the rendered scene through `force-graph-observation.ts`, and the update energy is zero in the address so that a step moves a sphere only by what the step says. Its first run found a pinned file that was also the subject read as absent at its own step, a misalignment in the control's precomputed names, fixed that hour.

The ninth test (2026-10-18) walks the rename-onto-a-dead-path sample from its beginning to today and back, holding that the renamed file's sphere is its own and stands where it stood, and that every rendered line begins and ends on a rendered sphere, by the instrument's line ends against the spheres' world positions; it failed before the view's caches gave a contested key to the renamed object and re-resolved every kept line's ends ([Turn 8](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-8)).

Since 2026-10-20 ([Turn 9](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) a test steps through the sample with Related Docs on: the documents each moment draws, the links the panel names at the plan's birth and the helper's retirement, a document gone today said so and not openable, the reader's note that it reads today's version, and the scrubber clear of the reader.

The resize-only step also has a drawing assertion: the util file grows from two to three public symbols in the uploaded sphere geometry, while zero update energy preserves positions and the links retain their bindings. This caught a stale-size cache during [the direct-renderer work](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-29.1.record.md#turn-12); checking the history panel alone had not tested the picture.

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
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`design-audit.describeFaults`](./design-audit.ts.mdmd.md#symbol-describefaults)
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
- [`force-graph-observation.engineActivity`](./force-graph-observation.ts.mdmd.md#symbol-engineactivity)
- [`force-graph-observation.markRenderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-markrenderedlinks)
- [`force-graph-observation.markedRenderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-markedrenderedlinks)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-renderedlinks)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
