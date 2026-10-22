# tests/e2e/knowledge-sources.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/knowledge-sources.spec.ts
- Generated At: 2026-10-22T01:06:10.592Z

## Authored
### Purpose
Holds the Knowledge Sources panel to the graph index on both bundles: file and use counts, declared entry points, reachability, unreferenced files, explicit starting points and the exported facts. Independently recomputes the graph expectations, audits the panel's text geometry, and verifies that inspecting a named file preserves the surrounding exploration.

### Notes
- Written on 2026-10-08 with the panel's rewrite ([the dead code sweep](../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md)). The audit's selectors name leaf spans (`.sources-title`, `.sources-group-name`, `.sources-directory-name`, `.sources-file`, `.sources-count`), not headings or summaries whole, since a heading and the count inside it are two words on one line, not a collision; and the audit learned the same day that a closed `details` hides its content.
- A named file is checked through the reader's displayed path and portable inspection target. The Knowledge Sources view, map subject, retained pins and context label must remain unchanged, following the [accepted separation of reading from exploration](../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-19.1.SUMMARIZED.md#turn-24).
- Since 2026-10-22 ([Turn 8 of the October 21 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)) the files nothing reaches are split by the engine's registry of what a reader handles (`noReaderHandles`), the one piece of the expectations not recomputed here, since it is a definition: the panel's "Not read" list and its count, the unreachable count without them, from the entries and from a chosen file, and the export's `unread`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`liveDocumentationConfig.noReaderHandles`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-noreaderhandles)
- [`design-audit.describeFaults`](./design-audit.ts.mdmd.md#symbol-describefaults)
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
<!-- LIVE-DOC:END Dependencies -->
