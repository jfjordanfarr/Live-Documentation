# scripts/doc-tools/enforce-documentation-links.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/doc-tools/enforce-documentation-links.test.ts
- Live Doc ID: LD-test-scripts-doc-tools-enforce-documentation-links-test-ts
- Generated At: 2026-02-03T21:55:41.551Z

## Authored
### Purpose
Proves the documentation-link CLI flags violations and exits with the correct codes in both check and `--fix` modes, preventing regressions when `docs:links:enforce` runs inside safe-commit ([exit-code regression fix](../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-02.SUMMARIZED.md#L68-L86)).

### Notes
- Relocated from the old `__tests__` folder on 2025-11-08 while standardising co-located suites; the rewrite introduced temp workspaces to exercise the CLI end-to-end ([test migration](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-08.md#L4720-L4880)).
- Keeps the CLI contract honest whenever we tweak rule resolution or stream fixes, catching several follow-up adjustments (for example, exporting `runCli` and normalising exit codes on 2025-11-05) before they reached the pipeline ([API hardening](../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-05.SUMMARIZED.md#L70-L86)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.551Z","inputHash":"cf1a795a1a2c53d3"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`documentationLinks.DEFAULT_RULES`](../../packages/shared/src/tooling/documentationLinks.ts.mdmd.md#symbol-default_rules)
- [`enforce-documentation-links.EXIT_CODES`](./enforce-documentation-links.ts.mdmd.md#symbol-exit_codes)
- [`enforce-documentation-links.runCli`](./enforce-documentation-links.ts.mdmd.md#symbol-runcli)
- `vitest` - `afterEach`, `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/tooling: [documentationLinks.ts](../../packages/shared/src/tooling/documentationLinks.ts.mdmd.md), [githubSlugger.ts](../../packages/shared/src/tooling/githubSlugger.ts.mdmd.md), [githubSluggerRegex.ts](../../packages/shared/src/tooling/githubSluggerRegex.ts.mdmd.md), [markdownShared.ts](../../packages/shared/src/tooling/markdownShared.ts.mdmd.md), [pathUtils.ts](../../packages/shared/src/tooling/pathUtils.ts.mdmd.md)
- scripts/doc-tools: [enforce-documentation-links.ts](./enforce-documentation-links.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
