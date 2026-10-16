# tests/integration/programs/go/rosetta/go.mod

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/go/rosetta/go.mod
- Entry: tooling
- Generated At: 2026-10-16T20:40:29.759Z

## Authored
### Purpose
The Go rosetta sample's module file: it names the module `rosetta` and requires nothing. Its presence is what makes `oracle:index` choose scip-go for the sample.

### Notes
- Plain on purpose; it is read by the go.mod adapter as a Live Doc since 2026-10-16 and must not change, since the sample's `expected/compiler-edges.json` is the indexer's output over it and names this file among its documents.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `rosetta` {#symbol-rosetta}
- Type: package
- Source: [source](../../../../../../../tests/integration/programs/go/rosetta/go.mod#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
