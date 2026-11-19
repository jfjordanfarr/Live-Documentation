# `tests/e2e/link-targets.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/link-targets.spec.ts`
- Generated At: 2026-11-19T22:40:14.307Z

## Authored
### Purpose
The browser's proof that the Explorer opens what the engine counted: over the link-targets sample ([its file](../integration/fixtures/link-targets/src/plan.ts.mdmd.md)), every form CommonMark reads for a link whose target holds parentheses opens its document in the reader, the two documents opened are the two the bundle's related documents name, one of them opens on a click, and a docstring line the Live Doc writes behind a backslash is shown without it.

### Notes
- Written 2026-11-19 after looking at the page ([the probe and its matched pictures](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/markdown-link-targets/README.md)). Against the renderer as it stood, six of the seven links were dead text followed by debris such as `.md>)`, only the fully percent-encoded one opened, and the docstring line showed `\####`.
- The sample is built by `npm run live-docs:visualize:link-targets`, one of the suite's bundles ([`e2e-bundles.mjs`](../../scripts/e2e-bundles.mjs.mdmd.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
<!-- LIVE-DOC:END Dependencies -->
