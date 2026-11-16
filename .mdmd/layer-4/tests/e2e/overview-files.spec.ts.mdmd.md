# tests/e2e/overview-files.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/overview-files.spec.ts
- Generated At: 2026-11-13T23:28:50.405Z

## Authored
### Purpose
Browser cases for files only at the 2D Local Map's overview look: with the choice made, every file card is compact with no row laid out and its width and column kept, every wire is a pair's gathered line with Flow's hover, the element under the pointer stays still while the layout changes, zooming back in returns every card to where it stood, Fit pressed twice changes nothing, a link carries the choice only when it is files only, and with reduced motion the new picture stands at once; with the default, and at the connections look, the picture is the cards as they stand.

### Notes
Written with the trial on 2026-11-13 ([November 13, Turn 8](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-13.1.record.md#turn-8)), after its pictures and motion were judged by eye; read on this repository's documentationLinks.ts pinned whole.

Files only is the default of Zoomed Out Fully since 2026-11-15, by the owner's eye and a comparison with the cards' rows drawn as bars ([Turn 1 of that day's record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-1)): the case that read the default as the cards' size now names that choice, and the case of the link opens one that says the cards' size and one that says nothing, where it had opened one that said files only.

Three cases of 2026-11-15 hold what files only draws of a person's pins by name ([Turn 1 of that day's record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-1)): with one symbol pinned and with three on two cards, only those rows are laid out, each drawn with its dots and its name whole beneath its file's name and inside its card, its own wires drawn above the pairs' lines, the 3D button's count of returning connections as at the connections look, and Fit pressed twice framing the same picture; and with three pinned, one press out and back returns every card, row and wire. On the commit before, files only laid out no row and drew no wire of a symbol's own.

The two cases of a person's pins by name also hold, since the same day, that the pinned rows of one card are drawn at one scale ([Turn 1 of that day's record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-1)).

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
- [`still-picture.localMapStill`](./still-picture.ts.mdmd.md#symbol-localmapstill)
<!-- LIVE-DOC:END Dependencies -->
