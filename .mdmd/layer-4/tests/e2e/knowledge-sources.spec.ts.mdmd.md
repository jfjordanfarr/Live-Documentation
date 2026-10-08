# tests/e2e/knowledge-sources.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/knowledge-sources.spec.ts
- Generated At: 2026-10-08T16:40:19.943Z

## Authored
### Purpose
Holds the Knowledge Sources panel to the graph index on both bundles: the files row, the first most-used file with its users and symbols named, the count and the full listing of what nothing references, a file's name going to the detail panel without leaving the panel, the design audit over the panel's words, and the panel's facts downloaded as JSON with the index's counts in them. Each expectation is computed again from `explorer-data.json` in the spec, independently of the panel's module.

### Notes
- Written on 2026-10-08 with the panel's rewrite ([the dead code sweep](../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md)). The audit's selectors name leaf spans (`.sources-title`, `.sources-group-name`, `.sources-directory-name`, `.sources-file`, `.sources-count`), not headings or summaries whole, since a heading and the count inside it are two words on one line, not a collision; and the audit learned the same day that a closed `details` hides its content.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`design-audit.describeFaults`](./design-audit.ts.mdmd.md#symbol-describefaults)
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
<!-- LIVE-DOC:END Dependencies -->
