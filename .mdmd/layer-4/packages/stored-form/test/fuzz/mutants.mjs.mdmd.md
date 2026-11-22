# `packages/stored-form/test/fuzz/mutants.mjs`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/stored-form/test/fuzz/mutants.mjs`
- Generated At: 2026-11-22T05:54:03.163Z

## Authored
### Purpose
Makes one mutant of a valid stored file from a seed alone, so that a failing case is named by its seed and made again from it: eight kinds of mutation, chosen by the seed.

### Notes
Plain JavaScript, loaded by the fuzzer's worker as it stands. Since 2026-11-22 it has a second stage, on every odd seed but a bomb's: one section's uncompressed bytes changed in one of nine ways and the file set down again with every hash right, so that the mutant reaches the section's grammar. It is the independent review's raw-section fuzzer, taken in, and for it the module takes Node's zlib and hashes, as test support may.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `random` {#symbol-random}
- Type: function
- Source: [source](../../../../../../packages/stored-form/test/fuzz/mutants.mjs#L13)

##### `random` — Summary
A small deterministic generator of numbers from a seed (mulberry32).

#### `mutant` {#symbol-mutant}
- Type: function
- Source: [source](../../../../../../packages/stored-form/test/fuzz/mutants.mjs#L45)

##### `mutant` — Summary
One mutant of `base`, by the seed: a few bits flipped, a cut, a length or count that lies, bytes put in or taken out,
a frame doubled or two swapped, or a section that inflates past what it claims (`bomb`, a raw deflate stream of
hundreds of megabytes of zeros, made once by the caller).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `createHash`
- `node:zlib` - `deflateRawSync`, `inflateRawSync`
<!-- LIVE-DOC:END Dependencies -->
