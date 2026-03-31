# tests/e2e/membrane-card-expand-persistence.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/membrane-card-expand-persistence.spec.ts
- Live Doc ID: LD-test-tests-e2e-membrane-card-expand-persistence-spec-ts
- Generated At: 2026-03-31T15:43:43.553Z

## Authored
### Purpose

Playwright E2E regression suite for `expandedCards` URL-state persistence in the Membrane Map: verifies that expanding a file card writes the card set into the `?s=` compressed URL parameter and that reloading the page restores all previously-expanded cards.

### Notes

- Created on [Dev Day 86](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-31.1.md) as a positive-control test written _before_ the fix — all three scenarios were intentionally red against the unmodified codebase to prove the regression.
- Three scenarios: (1) expanding a card changes the URL, (2) a single expanded card survives `page.reload()`, (3) multiple expanded cards all survive `page.reload()`.
- Targets `packages/server/src/runtime` as the test directory because it is small (two files: `environment.ts` and `environment.test.ts`) and stable, matching the pattern used by the other `membrane-card-interactions.spec.ts` tests.
- After the fix landed in `compressed-url-state.ts` (new `c?` field) and `membraneView/index.ts` (seed from `urlSnapshot.expandedCards`, persist in `persistToUrl()`), all three tests turned green in the same session without modification.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-31T15:43:43.553Z","inputHash":"83d7666b7c77fb10"}]} -->
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
