# `scripts/slopcop/markdownLinks.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/slopcop/markdownLinks.ts
- Generated At: 2026-11-19T20:14:19.074Z

## Authored
### Purpose
Detects broken local markdown links for the SlopCop markdown audit by walking inline/reference syntax, resolving targets relative to the workspace, and surfacing line/column diagnostics ([SlopCop rollout](../../../../AI-Agent-Workspace/AgentSessionHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-33-symbol-audit-implementation-lines-51615900)).

### Notes
- The `slopcop:markdown` CLI and safe-to-commit gate call this helper so human runs, CI, and fixture tests all share the same ignore-glob and severity behaviour ([follow-up configuration pass](../../../../AI-Agent-Workspace/AgentSessionHistory/2025/10/Summarized/2025-10-25.SUMMARIZED.md#turn-34-fixture-validation--clarification-lines-59016120)).
- In October 2025 it also fed the MDMD relationship resolvers ([shared helper extraction](../../../../AI-Agent-Workspace/AgentSessionHistory/2025/10/2025-10-26/2025-10-26.md#L23-L33)); those are gone, and the audit's command is its only caller today (checked 2026-11-19).
- Since 2026-11-19 it reads links by CommonMark's rule, the one the engine counts a doc's links by and the Explorer renders them by ([markdownLinks.ts](../../packages/engine/src/tooling/markdownLinks.ts.mdmd.md); [the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/markdown-link-targets/README.md)), in place of a pattern that ended a target at its first `)`, and resolves a target by the rule's `linkPath`, which percent-decodes after the fragment and query are set apart; `decodeURI` had left `%23` and `%3F` encoded, so a link to a file named with `#` or `?` was called broken. A reference to a label no definition names is still reported, as the rule gives them. Over the 1,633 files the audit scans here it checks the same 22,631 paths as before and reports nothing, as before.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MarkdownLinkIssue` {#symbol-markdownlinkissue}
- Type: interface
- Source: [source](../../../../scripts/slopcop/markdownLinks.ts#L9)

##### `MarkdownLinkIssue` — Summary
A broken link detected in a markdown file.

#### `MarkdownLinkAuditOptions` {#symbol-markdownlinkauditoptions}
- Type: interface
- Source: [source](../../../../scripts/slopcop/markdownLinks.ts#L18)

##### `MarkdownLinkAuditOptions` — Summary
Configuration for scanning markdown files for broken local links.

#### `findBrokenMarkdownLinks` {#symbol-findbrokenmarkdownlinks}
- Type: function
- Source: [source](../../../../scripts/slopcop/markdownLinks.ts#L35)
- Returns: [`MarkdownLinkIssue`](#symbol-markdownlinkissue)[]
- Parameters: `options`: [`MarkdownLinkAuditOptions`](#symbol-markdownlinkauditoptions)

##### `findBrokenMarkdownLinks` — Summary
Scans a markdown file for links and images, inline or by reference, whose
local targets cannot be resolved on disk, and for references whose label
no definition names. Links are read by CommonMark's rule, as the engine and
the Explorer read them, so anything inside a fenced code block or an inline
code span is an example rather than a link.

External URLs, autolinks, fragment-only links, and targets matching any
`ignoreTargetPatterns` are skipped.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
- [`markdownLinks.linkPath`](../../packages/engine/src/tooling/markdownLinks.ts.mdmd.md#symbol-linkpath)
- [`markdownLinks.readMarkdownLinks`](../../packages/engine/src/tooling/markdownLinks.ts.mdmd.md#symbol-readmarkdownlinks)
- [`markdownShared.computeLineStarts`](./markdownShared.ts.mdmd.md#symbol-computelinestarts)
- [`markdownShared.toLineAndColumn`](./markdownShared.ts.mdmd.md#symbol-tolineandcolumn)
<!-- LIVE-DOC:END Dependencies -->
