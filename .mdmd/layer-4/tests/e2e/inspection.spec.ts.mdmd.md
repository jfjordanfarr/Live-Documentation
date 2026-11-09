# tests/e2e/inspection.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/inspection.spec.ts
- Generated At: 2026-11-06T06:45:45.537Z

## Authored
### Purpose
Current browser journeys for independent evidence reading, map subjects and explicit pins, including sharing, history, keyboard focus and perspective changes.

### Notes

The November 9 UTC reader-arrival repair, following the owner’s [reading feedback](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-08.1.record.md#turn-3-additional-reading-feedback-during-the-review), rounds target offsets down so browser scroll rounding cannot clip the top of a heading. Existing bundled-fragment and Notes/Public Symbols jump journeys require the complete heading to remain visible, including after fragment reload, protecting the same helper outside symbol navigation.

Created after the [October 20 visual playtest](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2) of the owner's approved inspect-first/direct-Pin interaction. The estate's GatewayClient and PaymentResultModel supply different subject and evidence identities, so an accidental recenter or implicit pin cannot pass as a same-file success.

Inspection and evidence-only Back must preserve exact card rectangles and the map DOM, after the entry camera has settled. A direct symbol pin, a followed reader link, reload and a fresh recipient must retain their separate identities. Internals keeps its own endpoint, and centring an already-open directory must clear the former subject. The 3D check observes the actual rendered camera and spheres through Three's development-tool event.

Wide and full-screen readers retain usable keyboard focus, including Back–Forward reopening, and full readers keep their own history controls with an inert background. A real punctuation-heavy provenance link into the bundled November 8 summary checks canonical section targeting and scroll position through reload; simple heading names alone would miss the renderer defect found during review.

Three later checks hold the independent review's findings of 2026-10-20: a file's Pin pressed twice leaves the subject and pins as they were, and closing the reader then finds the opener its own Pin and Unpin rebuilt; one Escape closes only the topmost of the search field, the reader and the World Map's help; and keys typed in the full-screen reader never reach the World Map's shortcuts. With no opener, focus returns to the map, not to a text field.
A bundled document must read as a Live Doc's authored words do: its paragraphs at their size, colour and leading, and none of the decisions log's links in the browser's own colour (2026-10-21, [Turn 2](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-2)). With the class taken off the bundled document's container the check fails at 16 px against 13.
A file's evidence reads Purpose, then its facts, then Notes (the owner's choice, 2026-10-30, [Turn 3](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3)): on `generator.ts`, whose Notes run to about 4,100 characters, the boxes put Purpose above the symbols and the symbols, dependencies, dependents and Cited By above Notes; the jump list names the sections shown in their order; the Notes keep their list and provenance links; and the Notes link brings the Notes heading to the reader's top and focus to it without scrolling the page. The order before that day fails the second comparison.

Since 2026-10-31 the 3D arrival's settle allowance is 25 seconds: the picture enters over the tuning's frames and settles on screen (discovery, [Turn 4 of the October 31 record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-4)).

Since [November 5](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-1) a card's name reads its descriptions, so these journeys open the evidence reader from More → Inspect; the keyboard journeys start at the More button, which the menu returns focus to before the command runs, so that is the opener the reader gives focus back to.

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
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`still-picture.keepGrowingComposition`](./still-picture.ts.mdmd.md#symbol-keepgrowingcomposition)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- [`still-picture.panIntoView`](./still-picture.ts.mdmd.md#symbol-panintoview)
- `three` - `Camera` (type-only)
<!-- LIVE-DOC:END Dependencies -->
