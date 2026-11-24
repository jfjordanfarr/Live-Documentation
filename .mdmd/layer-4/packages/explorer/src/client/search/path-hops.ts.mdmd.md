# `packages/explorer/src/client/search/path-hops.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/search/path-hops.ts`
- Generated At: 2026-11-24T11:19:16.142Z

## Authored
### Purpose
Computes the shortest distinguishing trailing directory path suffix for colliding filenames on the Local Map path strip so hops that share a basename (such as `PaymentService/App.config` vs `Hub/App.config`, or `Portal/Controllers/PaymentsController.cs` vs `Gateway/Controllers/PaymentsController.cs`) can be told apart at a glance without cluttering uniquely named hops.

### Notes
Added on 2026-11-24 beside mirrored routes and first-card path framing (following [the 2026-11-22 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/2026-11-22.1.record.md#turn-7) and the `way-down` findings where the estate's 12-file strip read `App.config is used by App.config`). Pure and DOM-free so Vitest covers asymmetric depths and root-level collisions directly.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `disambiguateHopContexts` {#symbol-disambiguatehopcontexts}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/search/path-hops.ts#L38)
- Returns: `ReadonlyMap`

##### `disambiguateHopContexts` — Summary
Computes the shortest distinguishing directory suffix for every hop ID in
`ids` whose basename collides with another distinct hop ID in `ids`.

Root-level files colliding with a nested file of the same name are labeled
`"/"`. Unique basenames are omitted from the returned map.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
