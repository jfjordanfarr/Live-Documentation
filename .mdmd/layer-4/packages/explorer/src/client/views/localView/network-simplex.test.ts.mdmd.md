# packages/explorer/src/client/views/localView/network-simplex.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/network-simplex.test.ts
- Generated At: 2026-10-05T22:17:15.169Z

## Authored
### Purpose

Holds the network simplex solver to the optimum: enumeration on small instances, the shapes the placement builds, and determinism.

### Notes

The enumeration is over integer positions in a small range, so every instance's true optimum is known; a solver that stopped early or pivoted wrongly would differ from it on some seed.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`network-simplex.Constraint`](./network-simplex.ts.mdmd.md#symbol-constraint)
- [`network-simplex.rankByNetworkSimplex`](./network-simplex.ts.mdmd.md#symbol-rankbynetworksimplex)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
