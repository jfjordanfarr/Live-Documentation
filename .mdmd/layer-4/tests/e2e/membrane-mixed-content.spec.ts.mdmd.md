# tests/e2e/membrane-mixed-content.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/membrane-mixed-content.spec.ts
- Live Doc ID: LD-test-tests-e2e-membrane-mixed-content-spec-ts
- Generated At: 2026-03-30T19:28:11.532Z

## Authored
### Purpose

E2E test for the hybrid card-grid layout in mixed-content directories, ensuring files are not crushed when coexisting with subdirectories in the treemap.

### Notes

- Created in [Dev Day 85](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-30.1.md) to regression-test Solution C from Dev Day 83 Turns 3–4 where squarify weighted files at 1 vs directories at N, crushing files to ~1% area.
- Navigates to `features/live-docs` (a known mixed-content directory) and checks for `.membrane__card-grid--hybrid` class.
- Minimum card size assertions (width >30px, height >15px) apply to all visible cards as a universal guardrail.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-30T19:28:11.532Z","inputHash":"db34ffa273acf32c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
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
