# `packages/explorer/src/client/detailPanel.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/explorer/src/client/detailPanel.test.ts`
- Generated At: 2026-11-22T07:12:53.642Z

## Authored
### Purpose
Holds the reader's inspected-symbol panel ([detailPanel.ts](detailPanel.ts.mdmd.md), `inspectedSymbolHtml`) to what the doc's reader reads. A name whose written form is quoted or held in a longer backtick fence shows as itself, and a parameter's type links through the reader's handler. An unclosed fence in one section ends with that section.

### Notes
- Written 2026-11-19 ([the probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/markdown-link-targets/README.md)), when the panel stopped rendering `renderSymbolBlocks`, the doc's written form, through the markdown renderer. That form showed a quoted name as `"a\nb"`, quotes and backslash included. The written form keeps changing on the names' branch, so the panel reads the parsed block instead.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.SymbolBlock`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-symbolblock) (type-only)
- [`document.renderSymbolBlocks`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-rendersymbolblocks)
- [`detailPanel.inspectedSymbolHtml`](./detailPanel.ts.mdmd.md#symbol-inspectedsymbolhtml)
- [`markdown.renderMarkdown`](./markdown.ts.mdmd.md#symbol-rendermarkdown)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
