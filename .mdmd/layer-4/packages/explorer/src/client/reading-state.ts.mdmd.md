# packages/explorer/src/client/reading-state.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/reading-state.ts
- Generated At: 2026-11-04T15:03:15.945Z

## Authored
### Purpose
Current implementation. Keeps deliberate description choices separate from retained connections, so a shared view can read an unpinned file or fold a pinned one.

### Notes
An exact symbol override wins over the whole-card choice, then the pin-derived default. Whole-card actions replace symbol overrides. Temporary hover is absent from this state. Missing symbols are dropped rather than rebound to similarly named declarations.

Introduced during the [November 4 portrait integration](../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-2).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReadingChoice` {#symbol-readingchoice}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/reading-state.ts#L2)

##### `ReadingChoice` — Summary
Deliberately opened or folded descriptions, independent of retained connections and temporary hover.

#### `descriptionIsOpen` {#symbol-descriptionisopen}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/reading-state.ts#L10)

##### `descriptionIsOpen` — Summary
An explicit symbol choice wins over its card's choice, which wins over the pin-derived default.

#### `chooseReading` {#symbol-choosereading}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/reading-state.ts#L17)
- Returns: [`ReadingChoice`](#symbol-readingchoice)[]

##### `chooseReading` — Summary
A deliberate whole-card action replaces its individual overrides; a symbol action changes only that symbol.

#### `readingFiles` {#symbol-readingfiles}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/reading-state.ts#L25)

##### `readingFiles` — Summary
Files explicitly kept available to read, without retaining any of their neighbors.

#### `releaseReading` {#symbol-releasereading}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/reading-state.ts#L30)
- Returns: [`ReadingChoice`](#symbol-readingchoice)[]

##### `releaseReading` — Summary
Remove a closed card's deliberate reading choices; this changes no pins or other cards.

#### `readReadingChoices` {#symbol-readreadingchoices}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/reading-state.ts#L35)
- Returns: [`ReadingChoice`](#symbol-readingchoice)[]

##### `readReadingChoices` — Summary
Validate externally stored choices, preserving exact headings and the last choice for each target.

#### `scrubReadingChoices` {#symbol-scrubreadingchoices}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/reading-state.ts#L50)
- Returns: [`ReadingChoice`](#symbol-readingchoice)[]
- Parameters: `nodes`: `ReadonlyMap`

##### `scrubReadingChoices` — Summary
Drop stale file or symbol choices without turning them into a different reading target.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
