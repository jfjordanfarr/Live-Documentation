# packages/shared/src/tooling/markdownShared.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/markdownShared.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-markdownshared-ts
- Generated At: 2026-02-03T21:55:41.351Z

## Authored
### Purpose
Packages the Markdown parsing primitives (reference extraction, line/column math, link target sanitising) that underpin SlopCop’s link and symbol audits so every consumer reports issues with the same coordinates and target strings ([shared helper extraction](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L23-L33)).

### Notes
- Reused by `markdownLinks`, `symbolReferences`, and the SlopCop CLIs to keep lint output consistent during the Oct 2025 symbol-audit rollout ([rollout summary](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-33-symbol-audit-implementation-lines-5161-5900)).
- Relationship rule resolvers leverage the same helpers when translating MDMD links into graph edges, preventing divergent parsing logic in doc-to-code inference ([shared helper extraction](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L23-L33)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.351Z","inputHash":"9c561fc909cc61a5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReferenceDefinition` {#symbol-referencedefinition}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/markdownShared.ts#L1)

#### `extractReferenceDefinitions` {#symbol-extractreferencedefinitions}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/markdownShared.ts#L6)

#### `computeLineStarts` {#symbol-computelinestarts}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/markdownShared.ts#L28)

#### `toLineAndColumn` {#symbol-tolineandcolumn}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/markdownShared.ts#L39)

#### `parseLinkTarget` {#symbol-parselinktarget}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/markdownShared.ts#L63)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [relationshipRuleProvider.test.ts](../rules/relationshipRuleProvider.test.ts.mdmd.md)
- [documentationLinks.test.ts](./documentationLinks.test.ts.mdmd.md)
- [markdownLinks.test.ts](./markdownLinks.test.ts.mdmd.md)
- [symbolReferences.test.ts](./symbolReferences.test.ts.mdmd.md)
- [enforce-documentation-links.test.ts](../../../../scripts/doc-tools/enforce-documentation-links.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
