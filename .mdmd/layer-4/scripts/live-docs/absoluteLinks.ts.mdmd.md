# `scripts/live-docs/absoluteLinks.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/live-docs/absoluteLinks.ts`
- Generated At: 2026-11-19T22:40:13.209Z

## Authored
### Purpose
The links in a Live Doc that leave the repository, to a web address or to a path on a drive, which the docs lint ([lint.ts](lint.ts.mdmd.md)) refuses. Links are read by the markdown link rule ([markdownLinks.ts](../../packages/engine/src/tooling/markdownLinks.ts.mdmd.md)), as the engine reads them.

### Notes
- Taken out of the lint on 2026-11-19 ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/markdown-link-targets/README.md)). The lint's own pattern took a link's shape inside a code span for a link, and so failed another builder's gate on a sentence that only described one. With the rule, a code span or a fenced block holds no link; an autolink is left alone; a reference link counts as its definition's destination; and a destination holding parentheses is read whole. A module of its own, because the lint starts its command when it is loaded.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `AbsoluteLink` {#symbol-absolutelink}
- Type: interface
- Source: [source](../../../../scripts/live-docs/absoluteLinks.ts#L11)

##### `AbsoluteLink` — Summary
A link the lint refuses, and why: to a web address, or to a path on a drive.

#### `absoluteLinks` {#symbol-absolutelinks}
- Type: function
- Source: [source](../../../../scripts/live-docs/absoluteLinks.ts#L17)
- Returns: [`AbsoluteLink`](#symbol-absolutelink)[]

##### `absoluteLinks` — Summary
The doc's links and images, inline or by reference, that name a web address or a drive's path, in order.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`markdownLinks.readMarkdownLinks`](../../packages/engine/src/tooling/markdownLinks.ts.mdmd.md#symbol-readmarkdownlinks)
<!-- LIVE-DOC:END Dependencies -->
