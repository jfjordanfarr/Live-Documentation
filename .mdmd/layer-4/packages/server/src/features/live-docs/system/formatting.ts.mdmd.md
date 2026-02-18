# packages/server/src/features/live-docs/system/formatting.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/formatting.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-formatting-ts
- Generated At: 2026-02-18T21:27:52.563Z

## Authored
### Purpose
Number and statistical formatting utilities for System-layer Live Documentation output. Ensures consistent display of numbers, percentages, and p-values in generated markdown.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring
- Handles edge cases like `NaN`/`Infinity` by returning safe defaults (`"0"`, `"n/a"`)
- `formatPValue()` uses scientific notation for very small values, trims trailing zeros for readability

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:52.563Z","inputHash":"e06b09e9630bff34"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `formatNumber` {#symbol-formatnumber}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/formatting.ts#L6)

##### `formatNumber` — Summary
Rounds a number and formats it with locale-aware thousand separators (`en-US`).

#### `formatMean` {#symbol-formatmean}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/formatting.ts#L14)

##### `formatMean` — Summary
Formats a number with a fixed number of decimal digits (default 1).

#### `formatPercent` {#symbol-formatpercent}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/formatting.ts#L22)

##### `formatPercent` — Summary
Multiplies by 100 and appends `%`, with configurable decimal precision (default 1).

#### `formatPValue` {#symbol-formatpvalue}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/formatting.ts#L39)

##### `formatPValue` — Summary
Formats a p-value for human-readable display.

Values below `1e-4` use scientific notation; values at exactly `0` render
as `<1e-12`; `null` and non-finite inputs yield `"n/a"`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](./generator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
