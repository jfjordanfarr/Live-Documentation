# scripts/slopcop/symbolReferences.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/slopcop/symbolReferences.ts
- Generated At: 2026-11-19T21:25:38.634Z

## Authored
### Purpose
Implements the shared detector SlopCop uses to spot duplicate heading slugs and unresolved anchors across markdown artifacts ([symbol audit rollout](../../../../AI-Agent-Workspace/AgentSessionHistory/2025/10/2025-10-26/2025-10-26.md#L23-L33)).

### Notes
- Exercised via the opt-in `slopcop:symbols` CLI and its integration fixture, which asserts the analyzer raises exit code 3 until the docs are repaired ([fixture validation](../../../../AI-Agent-Workspace/AgentSessionHistory/2025/10/2025-10-25/2025-10-25.md#L6048-L6073)).
- Relies on the vendored GitHub slugger and shared markdown parsing helpers so reported slugs match GitHub’s anchor rules when we fix MDMD/spec links ([slug alignment plan](../../../../AI-Agent-Workspace/AgentSessionHistory/2025/10/2025-10-26/2025-10-26.md#L1089-L1244)).
- Since 2026-11-18 an anchor is looked up among its target's headings even when the target is not one of the audited files: a markdown file the configuration ignores as a source (the session archive's records and summaries) is read for its headings alone and never reported on. Before, such an anchor was skipped, so a link from a governed document into the archive could not fail: one written that day named a heading that stands inside a verbatim block of its target, and passed the gate, and seven older ones in Live Docs' authored notes named headings their summaries no longer had. A citation of a line or a range of lines in such a file (`#L12`, `#L12-L40`), as the transcripts are cited, is held to the file's length and not looked for among its headings ([the notes](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-the-anchor-audit-made-to-read-the-archive)).
- A review of that change the same day found the edges it had left: a citation of lines counted the empty line after a final line break as a line, so `#L4` held in a file of three; a citation with columns (`#L12C3`), which GitHub writes, was looked for as a heading; `#L0` held; an anchor written in HTML (`<a id>`, `<a name>`), which the 2025 transcripts use, was not a target; a fence closed on a line with words after its run; and a link written inside code was checked as a link. Each is mended, with a unit case that failed before.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SymbolIssueKind` {#symbol-symbolissuekind}
- Type: type
- Source: [source](../../../../scripts/slopcop/symbolReferences.ts#L23)

##### `SymbolIssueKind` — Summary
The category of issue found during symbol/anchor auditing.

- `"duplicate-heading"` — two headings in the same file produce the same slug
- `"missing-anchor"` — a link references a `#fragment` that doesn't exist in the target file

#### `SymbolIssueSeverity` {#symbol-symbolissueseverity}
- Type: type
- Source: [source](../../../../scripts/slopcop/symbolReferences.ts#L26)

##### `SymbolIssueSeverity` — Summary
Severity level for a symbol audit issue.

#### `SymbolRuleSetting` {#symbol-symbolrulesetting}
- Type: type
- Source: [source](../../../../scripts/slopcop/symbolReferences.ts#L29)
- Returns: [`SymbolIssueSeverity`](#symbol-symbolissueseverity)

##### `SymbolRuleSetting` — Summary
Tri-state rule setting: `"off"` disables the check entirely.

#### `SymbolReferenceIssue` {#symbol-symbolreferenceissue}
- Type: interface
- Source: [source](../../../../scripts/slopcop/symbolReferences.ts#L37)

##### `SymbolReferenceIssue` — Summary
A single issue discovered by {@link findSymbolReferenceAnomalies}.

Contains enough information for the SlopCop CLI to render human-readable
diagnostics with file path, line/column, and actionable message.

#### `SymbolAuditOptions` {#symbol-symbolauditoptions}
- Type: interface
- Source: [source](../../../../scripts/slopcop/symbolReferences.ts#L56)

##### `SymbolAuditOptions` — Summary
Options for {@link findSymbolReferenceAnomalies}.

##### `SymbolAuditOptions` — Parameters
- `files`: Absolute paths to the markdown files to audit.
- `workspaceRoot`: Absolute path to the workspace root, used for relative link resolution.

#### `findSymbolReferenceAnomalies` {#symbol-findsymbolreferenceanomalies}
- Type: function
- Source: [source](../../../../scripts/slopcop/symbolReferences.ts#L132)
- Returns: [`SymbolReferenceIssue`](#symbol-symbolreferenceissue)[]
- Parameters: `options`: [`SymbolAuditOptions`](#symbol-symbolauditoptions)

##### `findSymbolReferenceAnomalies` — Summary
Scans a set of markdown files for duplicate heading slugs and broken
anchor references.

Heading slugs are computed using GitHub-flavour slugging. The fence parser
respects CommonMark nested code fence rules (a closing fence must be at
least as long as the opening fence, with nothing after it) so headings inside
nested code blocks are correctly ignored. An anchor written in HTML
(`<a id="…">`, `<a name="…">`) outside code is a target too, and a link
written inside code is an example and is not checked.

An anchor is looked up among its target's headings whether or not the target
is one of `files`: a markdown file outside the audit (the session archive's
records and summaries, which the configuration ignores as sources) is read
for its headings alone. Until 2026-11-18 such an anchor was skipped, so a
link from a governed document into the archive could not fail. A citation
of a line or a range of lines (`#L12`, `#L12-L40`), as the archive's
transcripts are cited, is no heading: it holds while its file has that
many lines.

Created 2025-10-25 for the SlopCop symbol auditor; fence parser fixed
2026-02-18 to handle nested fences.

##### `findSymbolReferenceAnomalies` — Parameters
- `options`: Audit configuration including file list and rule overrides.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
- [`GitHubSlugger`](../../packages/engine/src/tooling/githubSlugger.ts.mdmd.md#symbol-githubslugger)
- [`githubSlugger.slugText`](../../packages/engine/src/tooling/githubSlugger.ts.mdmd.md#symbol-slugtext)
- [`markdownLinks.linkPath`](../../packages/engine/src/tooling/markdownLinks.ts.mdmd.md#symbol-linkpath)
- [`markdownShared.computeLineStarts`](./markdownShared.ts.mdmd.md#symbol-computelinestarts)
- [`markdownShared.extractReferenceDefinitions`](./markdownShared.ts.mdmd.md#symbol-extractreferencedefinitions)
- [`markdownShared.fencedLines`](./markdownShared.ts.mdmd.md#symbol-fencedlines)
- [`markdownShared.maskCode`](./markdownShared.ts.mdmd.md#symbol-maskcode)
- [`markdownShared.maskCodeSpans`](./markdownShared.ts.mdmd.md#symbol-maskcodespans)
- [`markdownShared.parseLinkTarget`](./markdownShared.ts.mdmd.md#symbol-parselinktarget)
- [`markdownShared.toLineAndColumn`](./markdownShared.ts.mdmd.md#symbol-tolineandcolumn)
<!-- LIVE-DOC:END Dependencies -->
