# scripts/layout-lab/reading-model.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/reading-model.ts
- Generated At: 2026-11-04T18:23:40.409Z

## Authored
### Purpose
Current standalone model of reading-block text flow from a browser capture.

### Notes
Pretext prepares mixed-font inline runs in the browser and serializes their measurements; this module reflows them without a page. It composes block spacing, list insets, preserved code lines and bounded prose. The existing layout-lab browser checks hold total dimensions and pin positions to the actual page, without relaxing their pixel comparisons.

Introduced during the [November 4 portrait integration](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-2).

The whitespace-preserving path uses Pretext’s prepared pre-wrap text; ordinary mixed-font prose uses rich-inline flow. Code indentation and blank lines are asserted against the supplied text, then its captured model is held to a separately rendered narrower page. See the [integration record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-2).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReadingFlow` {#symbol-readingflow}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/reading-model.ts#L5)

##### `ReadingFlow` — Summary
A normal-flow reading box, with independently prepared mixed-font text and the stylesheet's spacing.

#### `readingHeight` {#symbol-readingheight}
- Type: function
- Source: [source](../../../../scripts/layout-lab/reading-model.ts#L17)
- Parameters: `flow`: [`ReadingFlow`](#symbol-readingflow)

##### `readingHeight` — Summary
Lay out serialized reading text at a new width without a browser, including lists and bounded prose.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@chenglou/pretext` - `PreparedTextWithSegments`, `layout`
- `@chenglou/pretext/rich-inline` - `PreparedRichInline`, `measureRichInlineStats`
<!-- LIVE-DOC:END Dependencies -->
