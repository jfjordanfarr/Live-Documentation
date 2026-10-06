# scripts/layout-lab/card-model.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/layout-lab/card-model.test.ts
- Generated At: 2026-10-06T20:39:25.797Z

## Authored
### Purpose

Holds the card model's parts that need no page: chip wrapping, synthesized text heights, pin resolution and the point-in-polygon test.

### Notes

A row of chips wraps as a flex row does, a line as tall as its tallest chip; a text the page never showed takes one line until its words overflow; a wire's pin resolves by name, normalized name, the direction's default or the card's middle, and a collapsed row's pin resolves to none; a stepped membrane tells inside from outside. The text layout itself is held to the page by the drift spec, not here, since Pretext's preparation needs a canvas.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Capture`](./capture.ts.mdmd.md#symbol-capture) (type-only)
- [`card-model.CardMetrics`](./card-model.ts.mdmd.md#symbol-cardmetrics-interface)
- [`card-model.chipsHeight`](./card-model.ts.mdmd.md#symbol-chipsheight)
- [`card-model.resolvePin`](./card-model.ts.mdmd.md#symbol-resolvepin)
- [`card-model.synthesizedHeight`](./card-model.ts.mdmd.md#symbol-synthesizedheight)
- [`signals.insidePolygon`](./signals.ts.mdmd.md#symbol-insidepolygon)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
