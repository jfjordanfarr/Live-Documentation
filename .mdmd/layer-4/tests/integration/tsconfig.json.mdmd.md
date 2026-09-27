# tests/integration/tsconfig.json

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/tsconfig.json
- Live Doc ID: LD-test-tests-integration-tsconfig-json
- Generated At: 2026-09-27T08:02:42.377Z

## Authored
### Purpose
A `noEmit` TypeScript project that type-checks the integration suites under `tests/integration/` without compiling them; the gate runs it as the "Type-check tests" step in `scripts/verify.mjs`.

### Notes
- Source file: [`tests/integration/tsconfig.json`](../../../../tests/integration/tsconfig.json)
- Extends `tsconfig.base.json` and turns off `composite`, declarations and source maps because nothing is emitted. Fixture sources under `fixtures/` and `benchmarks/fixtures/` are excluded.
- Vitest itself transpiles without type-checking, which is why this project exists. Until 2026-09-27 the same file compiled the suites for the VS Code Electron harness.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T08:02:42.377Z","inputHash":"e4fb28054ad83533"}]} -->
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
