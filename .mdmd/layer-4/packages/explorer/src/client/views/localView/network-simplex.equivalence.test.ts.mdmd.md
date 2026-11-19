# packages/explorer/src/client/views/localView/network-simplex.equivalence.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/network-simplex.equivalence.test.ts
- Generated At: 2026-11-19T18:38:55.415Z

## Authored
### Purpose

Holds the Local Map's placement solver to its oracle: the solver as it stood on 2026-11-19 (`01b32fb0`), kept here and only here, unchanged but for its names. Every change made to `network-simplex.ts` for speed must give the same result as JSON, positions, cost and optimality, since the continuing search compares the pictures those positions make and a different optimum where two are equal would be a different picture.

### Notes

- Two cases: seeded random acyclic systems of 2 to 300 nodes, with some nodes no constraint touches so that the solver's forest has more than one tree, half of them with small separations and weights so that ties abound; and the three real systems of [the fixture](__fixtures__/network-simplex.systems.json.mdmd.md).
- Written on 2026-11-19 in the second leg of the round that ran down four red browser cases on this repository's map, when the profile put three quarters of the five-file scope's continuing search in this solver ([the measurements](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/map-reds/README.md)). Both cases fail when equal entering edges are told apart the other way (checked that day), so the harness sees a different optimum.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `readFileSync`
- `node:path` - `path`
- [`network-simplex.Constraint`](./network-simplex.ts.mdmd.md#symbol-constraint)
- [`network-simplex.Ranking`](./network-simplex.ts.mdmd.md#symbol-ranking)
- [`network-simplex.rankByNetworkSimplex`](./network-simplex.ts.mdmd.md#symbol-rankbynetworksimplex)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
