# packages/shared/src/tooling/markdownShared.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/markdownShared.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-markdownshared-ts
- Generated At: 2026-02-17T21:05:04.696Z

## Authored
### Purpose

Packages the Markdown parsing primitives (reference extraction, line/column math, link target sanitising) that underpin SlopCop’s link and symbol audits so every consumer reports issues with the same coordinates and target strings ([shared helper extraction](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L23-L33)).

### Notes

- Reused by `markdownLinks`, `symbolReferences`, and the SlopCop CLIs to keep lint output consistent during the Oct 2025 symbol-audit rollout ([rollout summary](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-33-symbol-audit-implementation-lines-5161-5900)).
- Relationship rule resolvers leverage the same helpers when translating MDMD links into graph edges, preventing divergent parsing logic in doc-to-code inference ([shared helper extraction](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L23-L33)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-17T21:05:04.696Z","inputHash":"d9d381eb87e23841"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReferenceDefinition` {#symbol-referencedefinition}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/markdownShared.ts#L4)

##### `ReferenceDefinition` — Summary
A markdown reference-link definition (`[id]: url`) parsed from file content.

#### `extractReferenceDefinitions` {#symbol-extractreferencedefinitions}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/markdownShared.ts#L17)

##### `extractReferenceDefinitions` — Summary
Parses all reference-link definitions (`[id]: url`) from markdown content.

##### `extractReferenceDefinitions` — Parameters
- `content`: Raw markdown string.

##### `extractReferenceDefinitions` — Returns
Map from lowercased reference identifier to its definition.

#### `computeLineStarts` {#symbol-computelinestarts}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/markdownShared.ts#L47)

##### `computeLineStarts` — Summary
Computes a sorted array of byte offsets where each line begins.

Used with {@link toLineAndColumn} for efficient offset-to-position lookups.

##### `computeLineStarts` — Parameters
- `content`: Raw file content.

##### `computeLineStarts` — Returns
Array of 0-based byte offsets for each line start.

#### `toLineAndColumn` {#symbol-tolineandcolumn}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/markdownShared.ts#L66)

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
- Source: [source](../../../../../../packages/shared/src/tooling/markdownShared.ts#L96)

##### `parseLinkTarget` — Summary
Extracts the URL portion from a raw markdown link target string,
stripping angle brackets, titles, and trailing whitespace.

Returns `undefined` when the target is empty or whitespace-only.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [documentationLinks.test.ts](./documentationLinks.test.ts.mdmd.md)
- [markdownLinks.test.ts](./markdownLinks.test.ts.mdmd.md)
- [symbolReferences.test.ts](./symbolReferences.test.ts.mdmd.md)
- [enforce-documentation-links.test.ts](../../../../scripts/doc-tools/enforce-documentation-links.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
