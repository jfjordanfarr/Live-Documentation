# tests/e2e/membrane-card-interactions.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/membrane-card-interactions.spec.ts
- Live Doc ID: LD-test-tests-e2e-membrane-card-interactions-spec-ts
- Generated At: 2026-03-30T19:28:11.377Z

## Authored
### Purpose

E2E tests for Membrane Map card interaction behaviors: collapsed default state, click-to-expand, pin-all button presence, and test-backed gold styling.

### Notes

- Created in [Dev Day 85](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-30.1.md) to codify card behaviors established across Dev Days 83–84.
- Tests that cards are collapsed by default (Dev Day 83 Turn 5): no symbol rows visible, `--collapsed` class present.
- Validates pin-all button is present on every card at all times (Dev Day 84 Turn 7), not just as a transitional control.
- Test-backed gold border styling test verifies `.membrane-card--test-backed` class on test files like `environment.test.ts`.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-30T19:28:11.377Z","inputHash":"50b377d9b13c7749"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- [`helpers.countElements`](./helpers.ts.mdmd.md#symbol-countelements)
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
