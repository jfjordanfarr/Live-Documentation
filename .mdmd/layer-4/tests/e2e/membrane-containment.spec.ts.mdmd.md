# tests/e2e/membrane-containment.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/membrane-containment.spec.ts
- Live Doc ID: LD-test-tests-e2e-membrane-containment-spec-ts
- Generated At: 2026-03-30T19:28:11.400Z

## Authored
### Purpose

E2E regression test verifying that file cards never overflow their containing directory membranes in either browse mode or pin-active mode.

### Notes

- Created in [Dev Day 85](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-30.1.md) as the first Playwright test for the Membrane Map.
- The pin-active containment test was the only failing test at creation (8.5px right overflow). Root-caused to `.pa-band-inner` grids using fixed `320px` columns inside padded bands; fixed by switching inner grids to `1fr`.
- Uses `findContainmentViolations()` from helpers with a 2px tolerance threshold.
- Coverage intention: regression test to prevent layout overflow bugs from recurring across CSS/renderer changes.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-30T19:28:11.400Z","inputHash":"ff394c2a8f79a88a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`helpers.expandDirectory`](./helpers.ts.mdmd.md#symbol-expanddirectory)
- [`helpers.findContainmentViolations`](./helpers.ts.mdmd.md#symbol-findcontainmentviolations)
- [`helpers.formatViolations`](./helpers.ts.mdmd.md#symbol-formatviolations)
- [`helpers.goToMembraneMap`](./helpers.ts.mdmd.md#symbol-gotomembranemap)
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
