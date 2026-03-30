# tests/e2e/membrane-directory-bands.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/membrane-directory-bands.spec.ts
- Live Doc ID: LD-test-tests-e2e-membrane-directory-bands-spec-ts
- Generated At: 2026-03-30T19:28:11.455Z

## Authored
### Purpose

E2E tests for the directory band structure in pin-active mode: band rendering, bare-band styling for LCA-level files, and card-to-band containment.

### Notes

- Created in [Dev Day 85](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-30.1.md) to codify the cross-column directory band system from Dev Day 82 Turns 14–16 (Strategy B+C hybrid).
- Bare-band test validates that LCA-level files use `.pa-band-bare` with no visible border, preventing misleading membrane boundaries (Dev Day 82 Turn 16 fix).
- Orphan card test ensures every `.pin-active-card` is inside either a `.pa-band-membrane` or `.pa-band-bare` container.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-30T19:28:11.455Z","inputHash":"8910ea0b2df3552d"}]} -->
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
