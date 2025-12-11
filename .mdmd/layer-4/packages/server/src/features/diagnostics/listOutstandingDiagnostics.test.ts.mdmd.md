# packages/server/src/features/diagnostics/listOutstandingDiagnostics.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/server/src/features/diagnostics/listOutstandingDiagnostics.test.ts
- Live Doc ID: LD-test-packages-server-src-features-diagnostics-listoutstandingdiagnostics-test-ts
- Generated At: 2025-12-11T02:38:00.430Z

## Authored
### Purpose
Validates the server-side snapshot powering the diagnostics tree view by checking artifact lookups and LLMAssessment passthrough, mirroring the Explorer integration in [2025-10-21 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md).

### Notes
- Exercises missing-artifact fallbacks to ensure the UI gracefully handles purged records while still refreshing timestamps deterministically.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:00.430Z","inputHash":"18c393268de885b8"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `DiagnosticRecord`, `GraphStore`
- `node:fs` - `mkdtempSync`, `rmSync`
- `node:os` - `tmpdir`
- `node:path` - `join`
- [`listOutstandingDiagnostics.buildOutstandingDiagnosticsResult`](./listOutstandingDiagnostics.ts.mdmd.md#symbol-buildoutstandingdiagnosticsresult)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/server/src/features/diagnostics: [listOutstandingDiagnostics.ts](./listOutstandingDiagnostics.ts.mdmd.md)
- packages/shared/src: [src/index.ts](../../../../shared/src/index.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
