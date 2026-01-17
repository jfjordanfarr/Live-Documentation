# packages/server/src/runtime/environment.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/runtime/environment.test.ts
- Live Doc ID: LD-test-packages-server-src-runtime-environment-test-ts
- Generated At: 2026-01-17T19:21:09.990Z

## Authored
### Purpose
Exercises the runtime environment helpers so Live Docs staging and graph persistence remain portable, a unit suite we added while triaging lint evidence debts in [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-22-begin-evidence-triage--add-targeted-tests-lines-4241-4920](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-22-begin-evidence-triage--add-targeted-tests-lines-4241-4920).

### Notes
The cases cover UNC-style URIs, database path defaults, and directory creation on Windows—see [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-08.md#L4492-L4588](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-08.md#L4492-L4588) for the bug report that prompted them. Update these expectations whenever `resolveDatabasePath` or `fileUriToPath` change, otherwise Live Docs lint will flag missing evidence.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-17T19:21:09.990Z","inputHash":"c0ce817e7d05d98f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:os`
- `node:path`
- [`environment.describeError`](./environment.ts.mdmd.md#symbol-describeerror)
- [`environment.ensureDirectory`](./environment.ts.mdmd.md#symbol-ensuredirectory)
- [`environment.fileUriToPath`](./environment.ts.mdmd.md#symbol-fileuritopath)
- [`environment.resolveDatabasePath`](./environment.ts.mdmd.md#symbol-resolvedatabasepath)
- [`environment.resolveWorkspaceRoot`](./environment.ts.mdmd.md#symbol-resolveworkspaceroot)
- `vitest` - `describe`, `expect`, `it`
- `vscode-languageserver/node` - `InitializeParams` (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/settings: [providerGuard.ts](../features/settings/providerGuard.ts.mdmd.md)
- packages/server/src/runtime: [environment.ts](./environment.ts.mdmd.md)
- packages/shared/src/domain: [artifacts.ts](../../../shared/src/domain/artifacts.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
