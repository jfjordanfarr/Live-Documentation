# packages/shared/src/tooling/documentationLinks.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/tooling/documentationLinks.test.ts
- Live Doc ID: LD-test-packages-shared-src-tooling-documentationlinks-test-ts
- Generated At: 2026-02-03T21:55:41.240Z

## Authored
### Purpose
Exercises the documentation link engine end-to-end—parsing anchors, resolving code targets, formatting comments, and running enforcement—to guard the pipeline that keeps breadcrumb comments synchronized.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-02.SUMMARIZED.md#turn-14-documentation--fixture-repairs]

### Notes
- Uses on-disk fixture workspaces so enforcement logic covers backlink detection, rule scoping, and `--fix` behaviour before the CLI wires it into `safe:commit`.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-02.SUMMARIZED.md#turn-15-benchmark-pipeline--cli-test-stabilization]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.240Z","inputHash":"81a67a0ba2960a92"}]} -->
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

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/tooling: [documentationLinks.ts](./documentationLinks.ts.mdmd.md), [githubSlugger.ts](./githubSlugger.ts.mdmd.md), [githubSluggerRegex.ts](./githubSluggerRegex.ts.mdmd.md), [markdownShared.ts](./markdownShared.ts.mdmd.md), [pathUtils.ts](./pathUtils.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
