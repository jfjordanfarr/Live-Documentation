# tests/integration/vscode/tsconfig.json

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/vscode/tsconfig.json
- Live Doc ID: LD-test-tests-integration-vscode-tsconfig-json
- Generated At: 2026-02-03T21:55:51.446Z

## Authored
### Purpose
Provide the TypeScript compilation contract for the VS Code harness bootstrap so the UI-driven integration tests stay aligned with the shared runtime documented in [`Integration Testing Architecture`](../../../../../.mdmd/layer-3/testing-integration-architecture.mdmd.md).

### Notes
- Source file: [`tests/integration/vscode/tsconfig.json`](../../../../../tests/integration/vscode/tsconfig.json)
- Extends `tsconfig.base.json` to emit CommonJS output into `tests/integration/vscode/dist` for the harness loader.
- Shares module resolution targets with [`tests/integration/tsconfig.json`](../tsconfig.json.mdmd.md) while omitting Mocha typing to keep the VS Code runner lean.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:51.446Z","inputHash":"0bf9a3e8b052cec9"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
