# tests/e2e/membrane-focus-layout.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/membrane-focus-layout.spec.ts
- Live Doc ID: LD-test-tests-e2e-membrane-focus-layout-spec-ts
- Generated At: 2026-03-30T19:28:11.482Z

## Authored
### Purpose

E2E test validating that the focused directory in browse mode occupies the majority of viewport width, confirming the weight-boosting focus-aware layout over the rejected CSS-transform zoom approach.

### Notes

- Created in [Dev Day 85](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-30.1.md) to regression-test the focus-aware layout from Dev Day 80 Turns 25–26.
- Measures the largest visible membrane rect after drilling into a directory and asserts it occupies >50% of viewport width.
- The 50% threshold is conservative; the actual focus weight-boost typically yields 70–80% width dominance.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-30T19:28:11.482Z","inputHash":"67f40e31ffdcd383"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- [`helpers.expandDirectory`](./helpers.ts.mdmd.md#symbol-expanddirectory)
- [`helpers.getRect`](./helpers.ts.mdmd.md#symbol-getrect)
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
