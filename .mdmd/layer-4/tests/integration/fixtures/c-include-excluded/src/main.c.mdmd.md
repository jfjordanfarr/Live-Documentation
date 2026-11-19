# `tests/integration/fixtures/c-include-excluded/src/main.c`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/fixtures/c-include-excluded/src/main.c`
- Entry: program [`main`](#symbol-main)
- Generated At: 2026-11-19T22:40:14.939Z

## Authored
### Purpose
A C program that takes its table and its colours from files a generator would write, `gen/table.def` and `gen/colours.inc`, by `#include`: the case in which the history's tree must hold an excluded file's content though no reader handles its kind, since the C reader opens whatever an include names.

### Notes
- Written 2026-11-19 from the second pass of the independent review of the history engine's round: with `gen/` excluded, writing `.def` and `.inc` empty lost the symbols `main.c` takes from them. `history-tree-equivalence.test.ts` excludes each top-level folder of this sample in turn.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../tests/integration/fixtures/c-include-excluded/src/main.c#L5)

##### `main` — Summary
Looks every colour up in the table.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`colours`](../gen/colours.inc.mdmd.md)
- [`table.table_lookup`](../gen/table.def.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
