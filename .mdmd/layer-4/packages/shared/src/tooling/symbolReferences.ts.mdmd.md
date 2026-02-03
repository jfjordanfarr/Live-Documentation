# packages/shared/src/tooling/symbolReferences.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/symbolReferences.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-symbolreferences-ts
- Generated At: 2026-02-03T21:55:41.492Z

## Authored
### Purpose
Implements the shared detector SlopCop uses to spot duplicate heading slugs and unresolved anchors across markdown artifacts ([symbol audit rollout](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L23-L33)).

### Notes
- Exercised via the opt-in `slopcop:symbols` CLI and its integration fixture, which asserts the analyzer raises exit code 3 until the docs are repaired ([fixture validation](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-25.md#L6048-L6073)).
- Relies on the vendored GitHub slugger and shared markdown parsing helpers so reported slugs match GitHub’s anchor rules when we fix MDMD/spec links ([slug alignment plan](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L1089-L1244)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.492Z","inputHash":"7b4ad5e4534371d7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SymbolIssueKind` {#symbol-symbolissuekind}
- Type: type
- Source: [source](../../../../../../packages/shared/src/tooling/symbolReferences.ts#L12)

#### `SymbolIssueSeverity` {#symbol-symbolissueseverity}
- Type: type
- Source: [source](../../../../../../packages/shared/src/tooling/symbolReferences.ts#L13)

#### `SymbolRuleSetting` {#symbol-symbolrulesetting}
- Type: type
- Source: [source](../../../../../../packages/shared/src/tooling/symbolReferences.ts#L14)
- Returns: [`SymbolIssueSeverity`](#symbol-symbolissueseverity)

#### `SymbolReferenceIssue` {#symbol-symbolreferenceissue}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/symbolReferences.ts#L16)

#### `SymbolAuditOptions` {#symbol-symbolauditoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/symbolReferences.ts#L29)

#### `findSymbolReferenceAnomalies` {#symbol-findsymbolreferenceanomalies}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/symbolReferences.ts#L68)
- Returns: [`SymbolReferenceIssue`](#symbol-symbolreferenceissue)[]
- Parameters: `options`: [`SymbolAuditOptions`](#symbol-symbolauditoptions)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
- [`GitHubSlugger`](./githubSlugger.ts.mdmd.md#symbol-githubslugger)
- [`markdownShared.computeLineStarts`](./markdownShared.ts.mdmd.md#symbol-computelinestarts)
- [`markdownShared.extractReferenceDefinitions`](./markdownShared.ts.mdmd.md#symbol-extractreferencedefinitions)
- [`markdownShared.parseLinkTarget`](./markdownShared.ts.mdmd.md#symbol-parselinktarget)
- [`markdownShared.toLineAndColumn`](./markdownShared.ts.mdmd.md#symbol-tolineandcolumn)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [symbolReferences.test.ts](./symbolReferences.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
