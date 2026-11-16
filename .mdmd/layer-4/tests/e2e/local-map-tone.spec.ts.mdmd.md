# tests/e2e/local-map-tone.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-tone.spec.ts
- Generated At: 2026-11-15T23:13:58.625Z

## Authored
### Purpose

Browser regressions for tone on the 2D Local Map, read from the colours the browser computed: a card's text in three tones with names leading the prose, each legible against the card by the shared contrast helper; no wire glowing, at rest, kept by a hover or dimmed by one, and a wire a hover keeps drawn exactly as a wire at rest; an opened directory's outline seen against the map and no stronger than a card's border, its fill still a trace; and each sample of the 2D legend drawn in the colours, at the opacity and at the size of the mark it names.

### Notes

Written in the tone round of 2026-11-15 ([Turn 1 of that day's record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-1); the owner's "font hierarchy" among "more little nits than we can count"). Every case fails on the code before the round, `cb53d7c7`: the symbol's name and the prose were one grey; every wire glowed, and a hovered row's wires were drawn at 1, above the 0.7 of a wire at rest; the outline's contrast against the map was 1.25, under the 1.5 asked; and the legend's wire samples were another blue and green, its dots 10 px and its test-backed sample gold. The round's first form lit a hovered wire whole with the glow; the root corrected it the same day by the owner's oldest rule of this map, to fade the irrelevant rather than boost the relevant, so the wire cases hold that nothing is drawn above rest. The legend's case compares each sample with the mark as drawn in the page (a wire's gradient stops, a row's dot, a test-backed card and its halo) and names no colour itself, so it holds whatever the theme becomes. The cases use the estate sample, and this repository's `word-seams.ts` for a test-backed card, which the estate has none of.

Files only is the default of Zoomed Out Fully since 2026-11-15, by the owner's eye and a comparison with the cards' rows drawn as bars ([Turn 1 of that day's record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-1)): the case of a pinned symbol's own wires at the overview chooses "Cards keep their size", since files only draws no row and so no wire of a symbol's own.

Since 2026-11-16 ([Turn 10 of the November 15 record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-10)) the legend's wire is one sample between the two roles' dots, so the last case reads the wire's two ends from the sample's gradient where it read a sample for each end; what it compares, the ends' colours, the opacity, the absence of a glow, the thickness and the dots, is unchanged.

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
- [`contrast.AA_SMALL_TEXT`](./contrast.ts.mdmd.md#symbol-aa_small_text)
- [`contrast.backdrop`](./contrast.ts.mdmd.md#symbol-backdrop)
- [`contrast.contrastRatio`](./contrast.ts.mdmd.md#symbol-contrastratio)
- [`contrast.parseColour`](./contrast.ts.mdmd.md#symbol-parsecolour)
- [`still-picture.localMapStill`](./still-picture.ts.mdmd.md#symbol-localmapstill)
<!-- LIVE-DOC:END Dependencies -->
