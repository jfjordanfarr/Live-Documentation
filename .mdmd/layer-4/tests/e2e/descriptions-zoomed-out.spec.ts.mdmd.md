# tests/e2e/descriptions-zoomed-out.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/descriptions-zoomed-out.spec.ts
- Generated At: 2026-11-16T04:49:28.334Z

## Authored
### Purpose
Current. Protects Descriptions Zoomed Out in the browser, under this machine's font lines and Segoe UI's line metrics, on `scripts/doc-tools/documentationLinks.ts` three presses out. With "first-line", only a described name on one line keeps a line, under its name and at its size, cut with an ellipsis; no card box and no name's lines change, no text collides, and the overview look is the same as without it. With "line-end" and "line-middle", every described row keeps its line, its name is on one line and, where cut, cut as the value says (in the middle only at the name's seams, by the spec's own reading of a seam; behind a leading ellipsis only where its first and last pieces do not fit its room together, and then with as many last pieces as fit; at its end only where not even its last piece fits), its whole name stays its accessible name and tooltip, no box and no row's place changes against Hidden, and no text collides. The file's own line stands under the file's name where its Purpose is on; a card whose file's book is folded, its symbols' descriptions folded with it, keeps no line of any kind while the cards beside it keep theirs. With half the descriptions folded, every described row still keeps its line, a folded row has none and is not cut in drawing, and the heads stand at even gaps.

### Notes
Written on 2026-11-14 after the pictures were judged by eye ([Turn 7 of the November 13 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/2026-11-13.1.record.md#turn-7); [the pictures](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/Screenshots/descriptions-zoomed-out/README.md)).

Extended on 2026-11-15 ([Turn 1 of the November 15 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1); [the pictures](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/Screenshots/descriptions-kept/README.md)) for the two values in which every described row keeps its line, the file's own line and the half-folded card. A link that carries state says the default for what it does not say, so every case's link carries the value it tests. The cases do not hold that a wire's end stands where it stood under Hidden: a kept line is part of its row's head, the heads are spaced evenly with it, and a head's dots and wire ends stand with the head.

Since 2026-11-16 ([Turn 1 of the November 15 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)), a design change: the middle cut's cases count what the subject's twelve cut names draw, nine with both ends about the ellipsis, three with their end behind a leading ellipsis (`DocumentationLinkViolation`, `DocumentationDocumentAnchors`, `DocumentationAnchorSummary`) and none cut at its end, where those three were cut at their end before.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Browser`, `Page`, `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`still-picture.LOCAL_MAP`](./still-picture.ts.mdmd.md#symbol-local_map)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->
