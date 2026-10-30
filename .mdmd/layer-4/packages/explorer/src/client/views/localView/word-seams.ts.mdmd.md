# packages/explorer/src/client/views/localView/word-seams.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/word-seams.ts
- Generated At: 2026-10-30T19:08:33.746Z

## Authored
### Purpose
Where a name may break across lines, as a pure rule the Local Map's cards and directory labels render as soft breaks: after a slash, a dot, a hyphen or an underscore and at a camel hump, with no segment under two characters and no tail under three, so that a name too wide for its box wraps at a seam of its own rather than at whatever letter the box ran out at; beside it, a count joined to its agreeing unit by a no-break space, so that "+33 files" never breaks between the number and the word and one symbol reads "+1 symbol".

### Notes
Written 2026-10-30 for the Explorer checklist's item "Labels and controls have room to work", from the October 23 review's finding 14 ("LiveDocGeneratorResul" with its "t" on the next line, capture 14) and finding 16 ("+1 symbols"), under the plan the owner accepted at [Turn 3 of the October 30 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3). The layout's column widths are unaffected: `branch-scene.ts` measures each card at max-content, which soft breaks do not change; only a name inside a box narrower than itself wraps differently, at the seams `seamsOf` names, with the stylesheets' `overflow-wrap: break-word` as the last resort for a seamless word wider than its box. `seamBefore` is the browser check's judge of where a line may start. `setSeamedText` in `dom.ts` writes the segments with `<wbr>` between them.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `seamsOf` {#symbol-seamsof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/word-seams.ts#L15)

##### `seamsOf` — Summary
The name cut at its seams, in order; joined, the segments are the name again. An empty name has no segments.

#### `seamBefore` {#symbol-seambefore}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/word-seams.ts#L34)

##### `seamBefore` — Summary
Whether a line may begin at this index of the name: at a seam, or after a space the browser breaks at anyway.

#### `countOf` {#symbol-countof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/word-seams.ts#L46)

##### `countOf` — Summary
A count and its unit as one word, joined by a no-break space so that "+33 files" never breaks between the number
and the word (capture 15 of the October 23 review), the unit agreeing with the count: "1 symbol", "2 symbols".
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
