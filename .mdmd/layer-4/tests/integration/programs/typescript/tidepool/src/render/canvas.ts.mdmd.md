# tests/integration/programs/typescript/tidepool/src/render/canvas.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/typescript/tidepool/src/render/canvas.ts
- Generated At: 2026-11-16T20:15:26.576Z

## Authored
### Purpose
Paints the pool on the page's canvas: the sand, the water at the tide's level, each creature from the sprite sheet, and the player's hand.

### Notes
- Part of the tidepool sample, written on 2026-11-16 for the colour pass ([the sample's README](../../../../../../../../../tests/integration/programs/typescript/tidepool/README.md), [the record](../../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-1)), at the owner's request to see "what a directory with many different types of files looks like (documentation, assets, tests, implementations)" ([2026-11-15](../../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-11)). Its authored words in the sample's own mirror link to two documents, for Show Related Docs; the canvas test in `tests/` imports it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `drawPool` {#symbol-drawpool}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/typescript/tidepool/src/render/canvas.ts#L8)
- Parameters: `context`: `CanvasRenderingContext2D`; `pool`: [`Pool`](../pool.ts.mdmd.md#symbol-pool)

##### `drawPool` — Summary
Paints the pool: sand, the water at its level, every creature, and the player's hand.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Pool`](../pool.ts.mdmd.md#symbol-pool) (type-only)
- [`palette.ROCK`](./palette.ts.mdmd.md#symbol-rock)
- [`palette.SAND`](./palette.ts.mdmd.md#symbol-sand)
- [`palette.waterFor`](./palette.ts.mdmd.md#symbol-waterfor)
- [`sprites.frameFor`](./sprites.ts.mdmd.md#symbol-framefor)
- [`sprites.spriteSheet`](./sprites.ts.mdmd.md#symbol-spritesheet)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`tests/integration/programs/typescript/tidepool/docs/design.md`](../../../../../../../../../tests/integration/programs/typescript/tidepool/docs/design.md)
<!-- LIVE-DOC:END Cited By -->
