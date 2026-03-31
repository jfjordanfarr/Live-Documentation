# tests/e2e/membrane-visual-stability.spec.ts

## Metadata

- Layer: 4
- Archetype: test
- Code Path: tests/e2e/membrane-visual-stability.spec.ts
- Live Doc ID: LD-test-tests-e2e-membrane-visual-stability-spec-ts
- Generated At: 2026-03-31T19:12:05.914Z

## Authored

### Purpose

Pixel-stability regression suite for the Membrane Map's pin-active layout. Catches temporal rendering bugs (e.g., SVG connector lines drawing before pin-active cards settle into their final DOM positions) by comparing screenshots taken before and after a page reload of the same deterministic URL state.

### Notes

- Created on [Dev Day 86](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-31.1.md) at the user's request for a pixel-comparison Playwright test to guard against connector-before-settle races.
- Targets `liveDocumentationConfig.ts` because it has 12 exported symbols and >10 inbound importers, producing a dense pin-active layout with multiple SVG connection paths — ideal for catching subtle layout drift.
- Two scenarios: (1) full viewport pixel comparison — loads a 6-pin URL state, screenshots after settle, reloads, screenshots again, asserts byte-identical PNG buffers; (2) SVG connection assertion — loads a 4-pin state, verifies `.membrane-focal-svg` contains `<path>` elements with non-zero bounding boxes.
- The `waitForPinActiveSettle()` helper polls until `.pin-active-root`, `.pin-active-card[data-id]`, and `.membrane-focal-svg` are all present, then flushes an additional animation frame wait (800ms) for connection-path drawing to complete.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-31T19:12:05.914Z","inputHash":"0ac819125bfc0f64"}]} -->
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
