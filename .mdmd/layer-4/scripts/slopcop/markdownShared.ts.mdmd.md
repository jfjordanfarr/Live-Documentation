# scripts/slopcop/markdownShared.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/slopcop/markdownShared.ts
- Generated At: 2026-09-28T20:40:08.951Z

## Authored
### Purpose

Packages the Markdown parsing primitives (reference extraction, line/column math, link target sanitising) that underpin SlopCop’s link and symbol audits so every consumer reports issues with the same coordinates and target strings ([shared helper extraction](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L23-L33)).

### Notes

- Reused by `markdownLinks`, `symbolReferences`, and the SlopCop CLIs to keep lint output consistent during the Oct 2025 symbol-audit rollout ([rollout summary](../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-33-symbol-audit-implementation-lines-5161-5900)).
- Relationship rule resolvers leverage the same helpers when translating MDMD links into graph edges, preventing divergent parsing logic in doc-to-code inference ([shared helper extraction](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L23-L33)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReferenceDefinition` {#symbol-referencedefinition}
- Type: interface
- Source: [source](../../../../scripts/slopcop/markdownShared.ts#L4)

##### `ReferenceDefinition` — Summary
A markdown reference-link definition (`[id]: url`) parsed from file content.

#### `extractReferenceDefinitions` {#symbol-extractreferencedefinitions}
- Type: function
- Source: [source](../../../../scripts/slopcop/markdownShared.ts#L17)

##### `extractReferenceDefinitions` — Summary
Parses all reference-link definitions (`[id]: url`) from markdown content.

##### `extractReferenceDefinitions` — Parameters
- `content`: Raw markdown string.

##### `extractReferenceDefinitions` — Returns
Map from lowercased reference identifier to its definition.

#### `maskCode` {#symbol-maskcode}
- Type: function
- Source: [source](../../../../scripts/slopcop/markdownShared.ts#L48)

##### `maskCode` — Summary
The content with every fenced code block and inline code span replaced by
spaces of the same length, so that an offset into the result is an offset
into the original. Markdown inside code is literal text: a link or a heading
written there is an example, not a link or a heading. The fence rules are
CommonMark's, as the symbol audit applies them: a run of three or more
backticks or tildes opens a block, and only a run of the same character at
least as long closes it.

#### `computeLineStarts` {#symbol-computelinestarts}
- Type: function
- Source: [source](../../../../scripts/slopcop/markdownShared.ts#L87)

##### `computeLineStarts` — Summary
Computes a sorted array of byte offsets where each line begins.

Used with {@link toLineAndColumn} for efficient offset-to-position lookups.

##### `computeLineStarts` — Parameters
- `content`: Raw file content.

##### `computeLineStarts` — Returns
Array of 0-based byte offsets for each line start.

#### `toLineAndColumn` {#symbol-tolineandcolumn}
- Type: function
- Source: [source](../../../../scripts/slopcop/markdownShared.ts#L106)

##### `toLineAndColumn` — Summary
Converts a 0-based byte offset to a 1-based line and column number
using a precomputed line-start array.

##### `toLineAndColumn` — Parameters
- `index`: 0-based byte offset.
- `lineStarts`: Array from {@link computeLineStarts}.

##### `toLineAndColumn` — Returns
1-based `{ line, column }` position.

#### `parseLinkTarget` {#symbol-parselinktarget}
- Type: function
- Source: [source](../../../../scripts/slopcop/markdownShared.ts#L136)

##### `parseLinkTarget` — Summary
Extracts the URL portion from a raw markdown link target string,
stripping angle brackets, titles, and trailing whitespace.

Returns `undefined` when the target is empty or whitespace-only.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
