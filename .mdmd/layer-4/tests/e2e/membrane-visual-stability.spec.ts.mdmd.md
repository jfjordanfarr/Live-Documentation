# tests/e2e/membrane-visual-stability.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/membrane-visual-stability.spec.ts
- Generated At: 2026-09-27T23:21:32.427Z

## Authored
### Purpose

Pixel-stability regression suite for the Membrane Map's pin-active layout. Catches temporal rendering bugs (e.g., SVG connector lines drawing before pin-active cards settle into their final DOM positions) by comparing screenshots taken before and after a page reload of the same deterministic URL state.

### Notes

- Created on [Dev Day 86](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-31.1.md) at the user's request for a pixel-comparison Playwright test to guard against connector-before-settle races.
- Targets `liveDocumentationConfig.ts` because it has 12 exported symbols and >10 inbound importers, producing a dense pin-active layout with multiple SVG connection paths — ideal for catching subtle layout drift.
- Two scenarios: (1) full viewport pixel comparison — loads a 6-pin URL state, screenshots after settle, reloads, screenshots again, asserts byte-identical PNG buffers; (2) SVG connection assertion — loads a 4-pin state, verifies `.membrane-focal-svg` contains `<path>` elements with non-zero bounding boxes.
- A failed comparison attaches both original PNGs to the Playwright report. Inspect the changed pixels before attributing a mismatch to connector layout: exact image equality also checks browser painting, which can differ even when card, pin and path geometry agree.
- The `waitForPinActiveSettle()` helper polls until `.pin-active-root`, `.pin-active-card[data-id]`, and `.membrane-focal-svg` are all present, then flushes an additional animation frame wait (800ms) for connection-path drawing to complete.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- `lz-string` - `compressToEncodedURIComponent`
<!-- LIVE-DOC:END Dependencies -->
