# `packages/stored-form/src/testScans.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/stored-form/src/testScans.ts`
- Generated At: 2026-11-22T01:31:13.857Z

## Authored
### Purpose
Scans made for the stored form's tests: one that holds every field the layout has, each mark set and unset somewhere, and many made deterministically from a seed, with strings that repeat, Unicode, line breaks and links that land nowhere.

### Notes
Test support, built with the package since it imports nothing; nothing but the tests and the fuzzer use it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `everyFact` {#symbol-everyfact}
- Type: function
- Source: [source](../../../../../packages/stored-form/src/testScans.ts#L14)
- Returns: [`Scan`](./storedForm.ts.mdmd.md#symbol-scan)

##### `everyFact` — Summary
A scan of three files that holds every field the layout has, each mark set and unset somewhere.

#### `random` {#symbol-random}
- Type: function
- Source: [source](../../../../../packages/stored-form/src/testScans.ts#L60)

##### `random` — Summary
A small deterministic generator of numbers from a seed (mulberry32).

#### `seededScan` {#symbol-seededscan}
- Type: function
- Source: [source](../../../../../packages/stored-form/src/testScans.ts#L72)
- Returns: [`Scan`](./storedForm.ts.mdmd.md#symbol-scan)

##### `seededScan` — Summary
A scan of `count` files made from a seed: names drawn from a small vocabulary, so strings repeat as real ones do.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`storedForm.Scan`](./storedForm.ts.mdmd.md#symbol-scan) (type-only)
- [`storedForm.StoredFile`](./storedForm.ts.mdmd.md#symbol-storedfile) (type-only)
- [`storedForm.StoredType`](./storedForm.ts.mdmd.md#symbol-storedtype) (type-only)
<!-- LIVE-DOC:END Dependencies -->
