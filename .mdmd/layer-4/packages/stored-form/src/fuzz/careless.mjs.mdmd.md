# `packages/stored-form/src/fuzz/careless.mjs`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/stored-form/src/fuzz/careless.mjs`
- Generated At: 2026-11-22T01:36:47.568Z

## Authored
### Purpose
A deliberately careless reader of the stored form: it trusts every count and length a file declares, inflates without a limit and reads past a section's end. It exists only so that the fuzz test can show the fuzzer failing a reader that is not careful.

### Notes
Never to be used to read anything.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `readScan` {#symbol-readscan}
- Type: function
- Source: [source](../../../../../../packages/stored-form/src/fuzz/careless.mjs#L19)

#### `resumeFrom` {#symbol-resumefrom}
- Type: function
- Source: [source](../../../../../../packages/stored-form/src/fuzz/careless.mjs#L37)

#### `textOf` {#symbol-textof}
- Type: function
- Source: [source](../../../../../../packages/stored-form/src/fuzz/careless.mjs#L41)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
