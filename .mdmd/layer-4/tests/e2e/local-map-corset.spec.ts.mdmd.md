# tests/e2e/local-map-corset.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-corset.spec.ts
- Generated At: 2026-10-07T01:30:18.678Z

## Authored
### Purpose

Holds the French Corset's laces to the owner's picture in a real browser: every self-reference drawn as a lace at each of its pins that leaves the pin, sweeps past the card's edge, turns toward its partner's row and comes back to be cut flush by the card's edge, in both the selected file's drawer and the retained exploration's; and holds the laces' dials in the tuning panel to the shape they name as they move.

### Notes

Reads every `polygon.self-loop`, every pin and every card from the page, each lace's outline mapped to page pixels through its rendered box and the map's scale read from the viewport's transform (the pin's rendered diameter, which the first version divided by 12, is 14 CSS px with its border); matches each lace to its pin by file, side and normalized symbol, the pin on whose row the lace starts, since graph.ts's LinkTarget and linkTarget share a name and a lace's end lies nearer another row; and asserts that the lace's far end sits on its card's edge within 0.75 px, the curl from the pin's row within 1.5 px of the dial, that it reaches the dial's reach beyond the edge (a pin's nested laces each a pitch further), that over the card it is only its stem at the pin's row, and that it passes its pin's row. The retained case also finds the pin of graph.ts that carries the most laces and requires more than one: a bracket, where the straight stubs of 2026-10-05 met as a chevron the owner read as an arrowhead ([Turn 14](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-14), [Turn 15](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-15)). The dials test turns the reach and the curl and holds the whole shape to them, and again after a reload. Written 2026-10-06 after the laces were judged by eye; rewritten 2026-10-07 for the cut, after the owner's marked-up picture ([Turn 14](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-14)). The pictures are under `AI-Agent-Workspace/Screenshots/2026-10-06/` and `2026-10-07/`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`local-storage.getDefaultTuning`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`types.LocalMapTuning`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-localmaptuning) (type-only)
- [`connection-geometry.LACE_PITCH`](../../packages/explorer/src/client/views/connection-geometry.ts.mdmd.md#symbol-lace_pitch)
- [`symbolAnchors.normalizeSymbolIdentifier`](../../packages/explorer/src/client/views/symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
- [`still-picture.localMapUrl`](./still-picture.ts.mdmd.md#symbol-localmapurl)
- [`still-picture.localRetainUrl`](./still-picture.ts.mdmd.md#symbol-localretainurl)
<!-- LIVE-DOC:END Dependencies -->
