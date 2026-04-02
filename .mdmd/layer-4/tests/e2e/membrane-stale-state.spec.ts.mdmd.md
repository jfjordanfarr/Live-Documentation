# tests/e2e/membrane-stale-state.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/membrane-stale-state.spec.ts
- Live Doc ID: LD-test-tests-e2e-membrane-stale-state-spec-ts
- Generated At: 2026-04-01T23:35:44.434Z

## Authored
### Purpose

Playwright E2E regression suite proving the Membrane Map degrades gracefully when compressed `?s=` URL state references nodes, directories, or pins that no longer exist in the current static explorer bundle — validating the `scrubSnapshot()` guard added in Dev Day 86.

### Notes

- Created in [Dev Day 86](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-31.1.md) as part of the stale-URL-state scrubbing feature (Option A from the three-option plan).
- Crafts deliberately stale `?s=` URLs by building `CompressedPayload` objects with fake node IDs via `lz-string`, then navigates to them and asserts the view falls through to browse mode or drops invalid entries rather than showing empty/broken chrome.
- Four scenarios: all-stale directories → root browse fallback; all-stale pins → browse mode (no empty pin-active chrome); mixed valid + stale pins → pin-active with only valid pin; stale expandedCards → silently ignored, cards render collapsed.
- Uses `window.__staticExplorerDataPromise` to discover a real node ID at runtime for the mixed-pin test, avoiding hardcoded node IDs that could themselves become stale.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-04-01T23:35:44.434Z","inputHash":"a74ec1b03bd68563"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- `lz-string` - `compressToEncodedURIComponent`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
