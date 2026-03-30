# tests/e2e/membrane-url-state.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/membrane-url-state.spec.ts
- Live Doc ID: LD-test-tests-e2e-membrane-url-state-spec-ts
- Generated At: 2026-03-30T19:28:11.557Z

## Authored
### Purpose

E2E test verifying that page refresh preserves the navigated directory context via URL state persistence.

### Notes

- Created in [Dev Day 85](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-30.1.md) to regression-test the URL state fix from earlier in Dev Day 85, where `parseInitialState` only checked `?view=` and `?node=` params but missed the `?s=` compressed state.
- After drilling into a directory and reloading, asserts the Membrane Map view is restored (not Knowledge Sources) and the directory context is preserved.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-30T19:28:11.557Z","inputHash":"7d4f75ad0092883b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- [`helpers.expandDirectory`](./helpers.ts.mdmd.md#symbol-expanddirectory)
- [`helpers.goToMembraneMap`](./helpers.ts.mdmd.md#symbol-gotomembranemap)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
