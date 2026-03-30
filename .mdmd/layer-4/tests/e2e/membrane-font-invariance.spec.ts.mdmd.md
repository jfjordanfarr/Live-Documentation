# tests/e2e/membrane-font-invariance.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/membrane-font-invariance.spec.ts
- Live Doc ID: LD-test-tests-e2e-membrane-font-invariance-spec-ts
- Generated At: 2026-03-30T19:28:11.508Z

## Authored
### Purpose

E2E test asserting that font sizes remain constant when drilling into directories, the defining correctness signal for focus-aware layout over CSS-transform zoom.

### Notes

- Created in [Dev Day 85](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-30.1.md) to codify the user's key quality requirement from Dev Day 80 Turn 26: "We will know we're doing the 'progressive zoom' correctly when the font does not resize across zooms."
- Measures median font size of `.membrane__label, .membrane-card__header` before and after directory expansion, tolerating ±1px for rounding.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-30T19:28:11.508Z","inputHash":"810660ef4e38535a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- [`helpers.expandDirectory`](./helpers.ts.mdmd.md#symbol-expanddirectory)
- [`helpers.goToMembraneMap`](./helpers.ts.mdmd.md#symbol-gotomembranemap)
- [`helpers.measureFontSizes`](./helpers.ts.mdmd.md#symbol-measurefontsizes)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
