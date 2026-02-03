# packages/server/src/features/live-docs/system/formatting.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/formatting.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-formatting-ts
- Generated At: 2026-02-03T21:55:37.847Z

## Authored
### Purpose
Number and statistical formatting utilities for System-layer Live Documentation output. Ensures consistent display of numbers, percentages, and p-values in generated markdown.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring
- Handles edge cases like `NaN`/`Infinity` by returning safe defaults (`"0"`, `"n/a"`)
- `formatPValue()` uses scientific notation for very small values, trims trailing zeros for readability

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:37.847Z","inputHash":"ef26f0f5af5c4897"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `formatNumber` {#symbol-formatnumber}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/formatting.ts#L5)

#### `formatMean` {#symbol-formatmean}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/formatting.ts#L12)

#### `formatPercent` {#symbol-formatpercent}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/formatting.ts#L19)

#### `formatPValue` {#symbol-formatpvalue}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/formatting.ts#L30)
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
