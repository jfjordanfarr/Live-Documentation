# `packages/stored-form/src/fuzz/mutants.mjs`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/stored-form/src/fuzz/mutants.mjs`
- Generated At: 2026-11-22T01:36:47.574Z

## Authored
### Purpose
Makes one mutant of a valid stored file from a seed alone, so that a failing case is named by its seed and made again from it: eight kinds of mutation, chosen by the seed.

### Notes
Plain JavaScript that imports nothing, loaded by the fuzzer's worker as it stands.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `random` {#symbol-random}
- Type: function
- Source: [source](../../../../../../packages/stored-form/src/fuzz/mutants.mjs#L5)

##### `random` — Summary
A small deterministic generator of numbers from a seed (mulberry32).

#### `mutant` {#symbol-mutant}
- Type: function
- Source: [source](../../../../../../packages/stored-form/src/fuzz/mutants.mjs#L37)

##### `mutant` — Summary
One mutant of `base`, by the seed: a few bits flipped, a cut, a length or count that lies, bytes put in or taken out,
a frame doubled or two swapped, or a section that inflates past what it claims (`bomb`, a raw deflate stream of
hundreds of megabytes of zeros, made once by the caller).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
