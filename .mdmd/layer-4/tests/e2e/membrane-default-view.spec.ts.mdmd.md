# tests/e2e/membrane-default-view.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/membrane-default-view.spec.ts
- Live Doc ID: LD-test-tests-e2e-membrane-default-view-spec-ts
- Generated At: 2026-03-31T20:36:07.039Z

## Authored
### Purpose

Playwright E2E regression suite guarding the Membrane Map's promotion to cold-start default view. Verifies that first-time visitors (no localStorage, no URL state) land on the Membrane Map, and that switching to a non-default view (Local Map) writes an explicit `?view=` parameter so the URL remains shareable.

### Notes

- Created on [Dev Day 86](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-31.1.md) alongside the default-view implementation change (Step 11.2 of the Membrane Map execution plan).
- `beforeEach` clears both `localStorage` and `sessionStorage` to simulate a true cold start, isolating the test from cross-session Explorer state.
- Two scenarios: (1) root URL lands on `.membrane-browse-root` with the Membrane nav tab active, (2) clicking the Local Map tab writes `?view=local` — confirming `updateUrlState()` now writes explicit view params for non-default views.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-31T20:36:07.039Z","inputHash":"d08eb3f20d59da69"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
