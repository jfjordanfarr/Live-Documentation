# tests/e2e/helpers.ts

## Metadata

- Layer: 4
- Archetype: test
- Code Path: tests/e2e/helpers.ts
- Live Doc ID: LD-test-tests-e2e-helpers-ts
- Generated At: 2026-03-31T15:43:43.523Z

## Authored

### Purpose

Shared Playwright helper library for all Membrane Map E2E spec files, providing navigation, measurement, and assertion utilities that abstract away DOM selectors and evaluation boilerplate.

### Notes

- Created in [Dev Day 85](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-30.1.md) as the foundational helper module for the Playwright E2E test suite.
- `findContainmentViolations()` checks both browse mode (`.membrane > .membrane__content .membrane-card`) and pin-active mode (`.pa-band-membrane > .pin-active-card`), using `:scope >` and `closest()` to skip nested sub-band children.
- `goToMembraneMap()` navigates to `/`, waits for the graph summary, then clicks the Membrane Map nav tab and waits for the browse or pin-active root to appear.
- `pinAllOnCard()` was widened on [Dev Day 86](../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-31.1.md) to find pin-all buttons on both browse-mode cards (`.membrane-card`) and pin-active cards (`.pin-active-card`), enabling multi-focal pinning tests to drive the UI after the initial pin transitions the view.
- Measurement helpers (`measureFontSizes`, `measureOpacities`, `getRect`) run inside `page.evaluate()` to read computed styles directly from the browser context.
- Archetype is `test` since this module only serves test infrastructure; it has no runtime consumers.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-31T15:43:43.523Z","inputHash":"1ca33c5e96fd10ce"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

#### `ContainmentViolation` {#symbol-containmentviolation}

- Type: interface
- Source: [source](../../../../tests/e2e/helpers.ts#L5)

#### `goToMembraneMap` {#symbol-gotomembranemap}

- Type: function
- Source: [source](../../../../tests/e2e/helpers.ts#L14)
- Parameters: `page`: `Page`

##### `goToMembraneMap` — Summary

Navigate to the Membrane Map view and wait for the treemap to render.

#### `expandDirectory` {#symbol-expanddirectory}

- Type: function
- Source: [source](../../../../tests/e2e/helpers.ts#L24)
- Parameters: `page`: `Page`

##### `expandDirectory` — Summary

Click a collapsed membrane tile by its data-id to expand/focus it.

#### `pinAllOnCard` {#symbol-pinalloncard}

- Type: function
- Source: [source](../../../../tests/e2e/helpers.ts#L35)
- Parameters: `page`: `Page`

##### `pinAllOnCard` — Summary

Click the pin-all button on a card identified by data-id.

#### `findContainmentViolations` {#symbol-findcontainmentviolations}

- Type: function
- Source: [source](../../../../tests/e2e/helpers.ts#L53)
- Parameters: `page`: `Page`

##### `findContainmentViolations` — Summary

Bounding-box containment check for all cards within their parent membranes.
Returns violations where a card extends beyond its membrane by > tolerancePx.

#### `formatViolations` {#symbol-formatviolations}

- Type: function
- Source: [source](../../../../tests/e2e/helpers.ts#L142)
- Parameters: `violations`: [`ContainmentViolation`](#symbol-containmentviolation)[]

##### `formatViolations` — Summary

Format containment violations into a readable string.

#### `measureFontSizes` {#symbol-measurefontsizes}

- Type: function
- Source: [source](../../../../tests/e2e/helpers.ts#L157)
- Parameters: `page`: `Page`

##### `measureFontSizes` — Summary

Measure font-size of text elements inside membranes.
Returns a map from selector description to computed font-size in px.

#### `measureOpacities` {#symbol-measureopacities}

- Type: function
- Source: [source](../../../../tests/e2e/helpers.ts#L173)
- Parameters: `page`: `Page`

##### `measureOpacities` — Summary

Get computed opacity for all elements matching a selector.
Returns an array of { id, opacity } objects.

#### `countElements` {#symbol-countelements}

- Type: function
- Source: [source](../../../../tests/e2e/helpers.ts#L189)
- Parameters: `page`: `Page`

##### `countElements` — Summary

Count elements matching a selector.

#### `getRect` {#symbol-getrect}

- Type: function
- Source: [source](../../../../tests/e2e/helpers.ts#L202)
- Parameters: `page`: `Page`

##### `getRect` — Summary

Get the bounding rect of the first element matching a selector.

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- `@playwright/test` - `Page`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->

### Targets

_No targets documented yet_

<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->

### Supporting Fixtures

_No supporting fixtures documented yet_

<!-- LIVE-DOC:END Supporting Fixtures -->
