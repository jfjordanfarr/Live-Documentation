# packages/shared/src/tooling/symbolReferences.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/tooling/symbolReferences.ts
- Live Doc ID: LD-implementation-packages-shared-src-tooling-symbolreferences-ts
- Generated At: 2026-02-18T21:27:54.442Z

## Authored
### Purpose
Implements the shared detector SlopCop uses to spot duplicate heading slugs and unresolved anchors across markdown artifacts ([symbol audit rollout](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L23-L33)).

### Notes
- Exercised via the opt-in `slopcop:symbols` CLI and its integration fixture, which asserts the analyzer raises exit code 3 until the docs are repaired ([fixture validation](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-25.md#L6048-L6073)).
- Relies on the vendored GitHub slugger and shared markdown parsing helpers so reported slugs match GitHub’s anchor rules when we fix MDMD/spec links ([slug alignment plan](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L1089-L1244)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:54.442Z","inputHash":"ba71d7150e7195f4"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SymbolIssueKind` {#symbol-symbolissuekind}
- Type: type
- Source: [source](../../../../../../packages/shared/src/tooling/symbolReferences.ts#L18)

##### `SymbolIssueKind` — Summary
The category of issue found during symbol/anchor auditing.

- `"duplicate-heading"` — two headings in the same file produce the same slug
- `"missing-anchor"` — a link references a `#fragment` that doesn't exist in the target file

#### `SymbolIssueSeverity` {#symbol-symbolissueseverity}
- Type: type
- Source: [source](../../../../../../packages/shared/src/tooling/symbolReferences.ts#L21)

##### `SymbolIssueSeverity` — Summary
Severity level for a symbol audit issue.

#### `SymbolRuleSetting` {#symbol-symbolrulesetting}
- Type: type
- Source: [source](../../../../../../packages/shared/src/tooling/symbolReferences.ts#L24)
- Returns: [`SymbolIssueSeverity`](#symbol-symbolissueseverity)

##### `SymbolRuleSetting` — Summary
Tri-state rule setting: `"off"` disables the check entirely.

#### `SymbolReferenceIssue` {#symbol-symbolreferenceissue}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/symbolReferences.ts#L32)

##### `SymbolReferenceIssue` — Summary
A single issue discovered by {@link findSymbolReferenceAnomalies}.

Contains enough information for the SlopCop CLI to render human-readable
diagnostics with file path, line/column, and actionable message.

#### `SymbolAuditOptions` {#symbol-symbolauditoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/tooling/symbolReferences.ts#L51)

##### `SymbolAuditOptions` — Summary
Options for {@link findSymbolReferenceAnomalies}.

##### `SymbolAuditOptions` — Parameters
- `files`: Absolute paths to the markdown files to audit.
- `workspaceRoot`: Absolute path to the workspace root, used for relative link resolution.

#### `findSymbolReferenceAnomalies` {#symbol-findsymbolreferenceanomalies}
- Type: function
- Source: [source](../../../../../../packages/shared/src/tooling/symbolReferences.ts#L104)
- Returns: [`SymbolReferenceIssue`](#symbol-symbolreferenceissue)[]
- Parameters: `options`: [`SymbolAuditOptions`](#symbol-symbolauditoptions)

##### `findSymbolReferenceAnomalies` — Summary
Scans a set of markdown files for duplicate heading slugs and broken
anchor references.

Heading slugs are computed using GitHub-flavour slugging. The fence parser
respects CommonMark nested code fence rules (a closing fence must be at
least as long as the opening fence) so headings inside nested code blocks
are correctly ignored.

Created 2025-10-25 for the SlopCop symbol auditor; fence parser fixed
2026-02-18 to handle nested fences.

##### `findSymbolReferenceAnomalies` — Parameters
- `options`: Audit configuration including file list and rule overrides.
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
