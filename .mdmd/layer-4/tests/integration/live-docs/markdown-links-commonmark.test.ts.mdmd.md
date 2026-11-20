# `tests/integration/live-docs/markdown-links-commonmark.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/markdown-links-commonmark.test.ts`
- Generated At: 2026-11-19T22:40:15.202Z

## Authored
### Purpose
The reference implementation, commonmark.js, grades the markdown link rule ([markdownLinks.ts](../../../packages/engine/src/tooling/markdownLinks.ts.mdmd.md)) over whole documents: over every markdown file the repository tracks, the links, images and autolinks the rule reads must be those commonmark.js finds, destination and title, but for a register of named differences, each with its cause. A difference that appears, or one named that disappears, fails.

### Notes
- Written 2026-11-19 at the root's word ([the probe](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/markdown-link-targets/README.md)): the places the rule departs from CommonMark by design (indented code, a fence inside a list or a quote, an HTML block) are where a link that is not a link would be counted as a citation, and a wrong connection is worse than a missing one.
- Its first run, over 2,004 files and 51,823 links, found one difference: a session summary of 2025-12-06 holds a fence indented four spaces under a list item, and the rule read the two example links inside it. The same comparison over the four cold corpora's own markdown, 132 files and 2,990 links, found none. Whether the rule should learn list structure is the root's to decide; until then the register names it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFileSync`
- `node:fs` - `readFileSync`
- `node:module` - `createRequire`
- `node:path` - `path`
- [`markdownLinks.readMarkdownLinks`](../../../packages/engine/src/tooling/markdownLinks.ts.mdmd.md#symbol-readmarkdownlinks)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
