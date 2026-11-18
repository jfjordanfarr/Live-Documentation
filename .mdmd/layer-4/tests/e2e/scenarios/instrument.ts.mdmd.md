# tests/e2e/scenarios/instrument.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/scenarios/instrument.ts
- Generated At: 2026-11-18T19:06:10.585Z

## Authored
### Purpose
The one instrument that reads the settled 2D Local Map into a reading, with a screenshot saved beside it so an eye can confirm the reading means what it says.

### Notes
It reuses the still-picture instrument's `readPicture` for wires and cards (whose wire reading gained each wire's kind, opacity and filter for it, 2026-11-18) and the design audit for collisions and cut text, and reads itself only what neither reads: the frame and its edge signs, each card's state and directory, the dots, the directories' segments and insets, the lanes, the root's columns, the lines each name stands on, and the colours. It refuses to report rather than lie: its two readings of the cards must agree, and every directory must publish its inset (`data-inset`, which the branch renderer publishes since [the root's rulings on the scenario builder's first handback](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-the-scenario-builders-first-handback)), since a missing inset would let every card pass as inside. [the frame they accepted](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#roots-reply-to-turn-11-as-delivered) warns that the instrument can lie, which is why it stays small. `watchPage` collects console errors and requests to other sites from before the address opens.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PageWatch` {#symbol-pagewatch}
- Type: interface
- Source: [source](../../../../../tests/e2e/scenarios/instrument.ts#L24)

##### `PageWatch` — Summary
What a page did while a scenario loaded: errors it logged and requests it made off its own site.

#### `watchPage` {#symbol-watchpage}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/instrument.ts#L30)
- Returns: [`PageWatch`](#symbol-pagewatch)
- Parameters: `page`: `Page`

##### `watchPage` — Summary
Starts watching a page before it opens the scenario's address.

#### `readSettled` {#symbol-readsettled}
- Type: function
- Source: [source](../../../../../tests/e2e/scenarios/instrument.ts#L194)
- Parameters: `page`: `Page`

##### `readSettled` — Summary
Reads the settled Local Map: waits until it is still, moves the pointer off the map, reads, and saves the screenshot
at `shotPath`. `names` is the bundle's display names per file (`displayNames` of the still-picture instrument), by
which a wire's symbol finds its row.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page` (type-only)
- `node:fs` - `fs`
- `node:path` - `path`
- [`contrast.backdrop`](../contrast.ts.mdmd.md#symbol-backdrop)
- [`contrast.contrastRatio`](../contrast.ts.mdmd.md#symbol-contrastratio)
- [`contrast.parseColour`](../contrast.ts.mdmd.md#symbol-parsecolour)
- [`design-audit.overlapsAmong`](../design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](../design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](../design-audit.ts.mdmd.md#symbol-truncations)
- [`reading.Box`](./reading.ts.mdmd.md#symbol-box) (type-only)
- [`Reading`](./reading.ts.mdmd.md#symbol-reading) (type-only)
- [`reading.TextFault`](./reading.ts.mdmd.md#symbol-textfault) (type-only)
- [`still-picture.LOCAL_MAP`](../still-picture.ts.mdmd.md#symbol-local_map)
- [`still-picture.localMapStill`](../still-picture.ts.mdmd.md#symbol-localmapstill)
- [`still-picture.readPicture`](../still-picture.ts.mdmd.md#symbol-readpicture)
<!-- LIVE-DOC:END Dependencies -->
