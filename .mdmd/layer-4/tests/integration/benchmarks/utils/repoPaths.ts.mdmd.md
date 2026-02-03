# tests/integration/benchmarks/utils/repoPaths.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/benchmarks/utils/repoPaths.ts
- Live Doc ID: LD-test-tests-integration-benchmarks-utils-repopaths-ts
- Generated At: 2026-02-03T21:55:46.952Z

## Authored
### Purpose
Locates the repository root for benchmark suites so rebuild and AST accuracy tests can resolve fixtures and dist bundles even when the VS Code harness runs from nested directories ([benchmark harness creation](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-28.md#L3986-L4094)).

### Notes
- Powers the benchmark refactor that unified repo-relative path lookups across `astAccuracy` and `rebuildStability`, eliminating hard-coded dist locations ([refactor recap](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L100-L170)).
- Accepts both historical and current workspace names so the helper survives the repo rename from Copilot Improvement Experiments to Live Documentation ([rename fix](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L215-L253)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:46.952Z","inputHash":"961211f4331b95f6"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `getRepoRoot` {#symbol-getreporoot}
- Type: function
- Source: [source](../../../../../../tests/integration/benchmarks/utils/repoPaths.ts#L8)

#### `resolveRepoPath` {#symbol-resolverepopath}
- Type: function
- Source: [source](../../../../../../tests/integration/benchmarks/utils/repoPaths.ts#L30)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `existsSync`, `readFileSync`
- `node:path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
