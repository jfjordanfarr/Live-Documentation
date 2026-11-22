# `packages/stored-form/test/testScans.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/stored-form/test/testScans.ts`
- Generated At: 2026-11-22T02:13:56.357Z

## Authored
### Purpose
Scans made for the stored form's tests: one that holds every field the layout has, each mark set and unset somewhere, and many made deterministically from a seed, with strings that repeat, Unicode, line breaks and links that land nowhere.

### Notes
Test support, kept in `test/` beside the tests since 2026-11-22 so that the package ships only the module (the root's ruling of that day); nothing but the tests and the fuzzer use it, and it imports nothing of ours.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `everyFact` {#symbol-everyfact}
- Type: function
- Source: [source](../../../../../packages/stored-form/test/testScans.ts#L14)
- Returns: [`Scan`](../src/storedForm.ts.mdmd.md#symbol-scan)

##### `everyFact` — Summary
A scan of three files that holds every field the layout has, each mark set and unset somewhere.

#### `random` {#symbol-random}
- Type: function
- Source: [source](../../../../../packages/stored-form/test/testScans.ts#L60)

##### `random` — Summary
A small deterministic generator of numbers from a seed (mulberry32).

#### `seededScan` {#symbol-seededscan}
- Type: function
- Source: [source](../../../../../packages/stored-form/test/testScans.ts#L72)
- Returns: [`Scan`](../src/storedForm.ts.mdmd.md#symbol-scan)

##### `seededScan` — Summary
A scan of `count` files made from a seed: names drawn from a small vocabulary, so strings repeat as real ones do.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`storedForm.Scan`](../src/storedForm.ts.mdmd.md#symbol-scan) (type-only)
- [`storedForm.StoredFile`](../src/storedForm.ts.mdmd.md#symbol-storedfile) (type-only)
- [`storedForm.StoredType`](../src/storedForm.ts.mdmd.md#symbol-storedtype) (type-only)
<!-- LIVE-DOC:END Dependencies -->
