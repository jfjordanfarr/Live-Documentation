# tests/e2e/membrane-dimming.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/membrane-dimming.spec.ts
- Live Doc ID: LD-test-tests-e2e-membrane-dimming-spec-ts
- Generated At: 2026-03-30T19:28:11.428Z

## Authored
### Purpose

E2E tests for the layered opacity dimming model in pin-active mode, validating the 4-step algorithm: baseline dim, pinned/connected undim, pin-all active state, and connected endpoint marking.

### Notes

- Created in [Dev Day 85](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-30.1.md) to regression-test the complete dimming model rewrite from Dev Day 84 Turn 6.
- Baseline test checks unpinned rows have opacity ≤ 0.4 and pinned/connected rows have opacity ≥ 0.9.
- Pin-all active state test verifies `.membrane-card__pin-all--active` class appears on the pinned card's button.
- Connected endpoint test validates `.membrane-card__symbol-row--connected` and `.membrane-card__symbol-row--pinned` classes appear correctly.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-30T19:28:11.428Z","inputHash":"1229176746c658aa"}]} -->
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
- [`helpers.measureOpacities`](./helpers.ts.mdmd.md#symbol-measureopacities)
- [`helpers.pinAllOnCard`](./helpers.ts.mdmd.md#symbol-pinalloncard)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
