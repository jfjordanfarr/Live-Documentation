# packages/scripts/src/live-docs/explorer/client/styles.css

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/styles.css
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-styles-css
- Generated At: 2026-03-09T21:20:31.765Z

## Authored
### Purpose

CSS entry point for the Explorer client. Contains only `@import` statements that aggregate the domain-specific stylesheets from `styles/`, establishing the load order: theme variables first, then shell layout, shared view primitives, and finally per-view styles.

### Notes

- Created [2025-11-22](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-24.SUMMARIZED.md) as a monolithic stylesheet (`f1e2dec0`).
- Decomposed into `styles/` on [2025-12-04](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-04.SUMMARIZED.md) (Turn 19–20) after exceeding the 1000-line file-size threshold. The user identified it as "a big big big source of trouble" and the CSS was split into domain-specific files: theme, shell, view-shared, circuit, local, graph (`4504d36a`).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-09T21:20:31.765Z","inputHash":"5cf8a4bbebbe841f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`circuit`](./styles/circuit.css.mdmd.md)
- [`graph`](./styles/graph.css.mdmd.md)
- [`local`](./styles/local.css.mdmd.md)
- [`pathfind`](./styles/pathfind.css.mdmd.md)
- [`shell`](./styles/shell.css.mdmd.md)
- [`sources`](./styles/sources.css.mdmd.md)
- [`theme`](./styles/theme.css.mdmd.md)
- [`view-shared`](./styles/view-shared.css.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
