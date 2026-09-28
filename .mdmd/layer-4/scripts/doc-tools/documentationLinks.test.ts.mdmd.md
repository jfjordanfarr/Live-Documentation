# scripts/doc-tools/documentationLinks.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/doc-tools/documentationLinks.test.ts
- Generated At: 2026-09-28T01:00:43.427Z

## Authored
### Purpose
Exercises the documentation link engine end-to-end—parsing anchors, resolving code targets, formatting comments, and running enforcement—to guard the pipeline that keeps breadcrumb comments synchronized.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-02.SUMMARIZED.md#turn-14-documentation--fixture-repairs]

### Notes
- Uses on-disk fixture workspaces so enforcement logic covers backlink detection, rule scoping, and `--fix` behaviour before the CLI wires it into `safe:commit`.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-02.SUMMARIZED.md#turn-15-benchmark-pipeline--cli-test-stabilization]

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`documentationLinks.DEFAULT_RULES`](./documentationLinks.ts.mdmd.md#symbol-default_rules)
- [`documentationLinks.DocumentationDocumentAnchors`](./documentationLinks.ts.mdmd.md#symbol-documentationdocumentanchors)
- [`documentationLinks.formatDocumentationLinkComment`](./documentationLinks.ts.mdmd.md#symbol-formatdocumentationlinkcomment)
- [`documentationLinks.parseDocumentationAnchors`](./documentationLinks.ts.mdmd.md#symbol-parsedocumentationanchors)
- [`documentationLinks.resolveCodeToDocumentationMap`](./documentationLinks.ts.mdmd.md#symbol-resolvecodetodocumentationmap)
- [`documentationLinks.runDocumentationLinkEnforcement`](./documentationLinks.ts.mdmd.md#symbol-rundocumentationlinkenforcement)
- `vitest` - `afterEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
