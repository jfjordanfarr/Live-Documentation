# tests/e2e/local-map-corset.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-corset.spec.ts
- Generated At: 2026-10-06T01:30:53.719Z

## Authored
### Purpose

Holds the French Corset's laces closed on the card in a real browser: every self-reference drawn as a lace at each of its pins that leaves the pin, reaches out a little way and returns to the card's edge, in both the selected file's drawer and the retained exploration's.

### Notes

Reads every `polygon.self-loop` and every pin from the page, matches each lace to its pin by file, side and normalized symbol (the nearest such pin, since graph.ts's LinkTarget and linkTarget share a name), takes the map's scale from the pin's rendered diameter, and asserts that the lace's near edge sits at the pin's own x within two pixels, that it reaches out between 12 and 45 px, that it passes its pin's row and turns no further than 40 px along the edge. The retained case also finds the pin of graph.ts that carries the most laces and requires more than one: a bracket, where the straight stubs of 2026-10-05 met as a chevron the owner read as an arrowhead ([Turn 14](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-14), [Turn 15](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-15)). Written 2026-10-06 after the laces were judged by eye in the pictures under `AI-Agent-Workspace/Screenshots/2026-10-06/`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`symbolAnchors.normalizeSymbolIdentifier`](../../packages/explorer/src/client/views/symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
- [`still-picture.localMapUrl`](./still-picture.ts.mdmd.md#symbol-localmapurl)
- [`still-picture.localRetainUrl`](./still-picture.ts.mdmd.md#symbol-localretainurl)
<!-- LIVE-DOC:END Dependencies -->
