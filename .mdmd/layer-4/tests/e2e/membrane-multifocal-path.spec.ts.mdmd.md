# tests/e2e/membrane-multifocal-path.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/membrane-multifocal-path.spec.ts
- Live Doc ID: LD-test-tests-e2e-membrane-multifocal-path-spec-ts
- Generated At: 2026-03-31T20:36:07.167Z

## Authored
### Purpose

Playwright E2E regression suite covering multi-focal pinning and path-as-pins rendering in the Membrane Map. Fills the Step 10.5 gap identified in the execution plan where these two Step 7 visual features were only covered by pure-function unit tests.

### Notes

- Created on [Dev Day 86](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-31.1.md) during E2E coverage expansion (Step 10.5 of the Membrane Map execution plan).
- Two scenarios: (1) UI-driven multi-focal — expands `packages/server/src/runtime`, pins both `environment.ts` and `environment.test.ts`, asserts both cards have active pin-all buttons and no path-breadcrumb UI appears; (2) URL-seeded path-as-pins — loads a compressed `?s=` URL with a 3-hop path payload, asserts breadcrumb hop labels render in order, all three path nodes appear as pin-active cards, and the shared ancestor membrane (`packages/server/src`) is restored.
- The `buildStateUrl()` helper mirrors `snapshotToPayload()` from `compressed-url-state.ts` in a minimal form, producing a valid v1 compressed payload for test seeding.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-31T20:36:07.167Z","inputHash":"ee7a9701471d9c02"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- `lz-string` - `compressToEncodedURIComponent`
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
