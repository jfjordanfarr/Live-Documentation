# scripts/slopcop/markdownLinks.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/slopcop/markdownLinks.ts
- Generated At: 2026-09-28T20:40:08.942Z

## Authored
### Purpose
Detects broken local markdown links for the SlopCop markdown audit by walking inline/reference syntax, resolving targets relative to the workspace, and surfacing line/column diagnostics ([SlopCop rollout](../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-33-symbol-audit-implementation-lines-5161-5900)).

### Notes
- The `slopcop:markdown` CLI and safe-to-commit gate call this helper so human runs, CI, and fixture tests all share the same ignore-glob and severity behaviour ([follow-up configuration pass](../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-34-slopcop-configuration--doc-refresh-lines-5901-6500)).
- Feeds MDMD relationship analysis too—relationship resolvers reuse the detected targets to wire documentation ↔ code edges without reimplementing link parsing ([shared helper extraction](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L23-L33)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MarkdownLinkIssue` {#symbol-markdownlinkissue}
- Type: interface
- Source: [source](../../../../scripts/slopcop/markdownLinks.ts#L13)

##### `MarkdownLinkIssue` — Summary
A broken link detected in a markdown file.

#### `MarkdownLinkAuditOptions` {#symbol-markdownlinkauditoptions}
- Type: interface
- Source: [source](../../../../scripts/slopcop/markdownLinks.ts#L22)

##### `MarkdownLinkAuditOptions` — Summary
Configuration for scanning markdown files for broken local links.

#### `findBrokenMarkdownLinks` {#symbol-findbrokenmarkdownlinks}
- Type: function
- Source: [source](../../../../scripts/slopcop/markdownLinks.ts#L40)
- Returns: [`MarkdownLinkIssue`](#symbol-markdownlinkissue)[]
- Parameters: `options`: [`MarkdownLinkAuditOptions`](#symbol-markdownlinkauditoptions)

##### `findBrokenMarkdownLinks` — Summary
Scans a markdown file for inline and reference-style links whose local
targets cannot be resolved on disk.

External URLs, fragment-only links, and targets matching any
`ignoreTargetPatterns` are skipped, and so is anything inside a fenced
code block or an inline code span, which is an example rather than a link.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
- [`markdownShared.computeLineStarts`](./markdownShared.ts.mdmd.md#symbol-computelinestarts)
- [`markdownShared.extractReferenceDefinitions`](./markdownShared.ts.mdmd.md#symbol-extractreferencedefinitions)
- [`markdownShared.maskCode`](./markdownShared.ts.mdmd.md#symbol-maskcode)
- [`markdownShared.parseLinkTarget`](./markdownShared.ts.mdmd.md#symbol-parselinktarget)
- [`markdownShared.toLineAndColumn`](./markdownShared.ts.mdmd.md#symbol-tolineandcolumn)
<!-- LIVE-DOC:END Dependencies -->
