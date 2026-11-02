# packages/explorer/src/client/views/forceGraphEmphasis.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/forceGraphEmphasis.test.ts
- Generated At: 2026-11-01T22:32:19.508Z

## Authored
### Purpose
Verify that commit emphasis uses immediate white, restores normal colour when a node leaves the changed set, and preserves the chosen background alpha without a temporal ramp.

### Notes
The [November 1 live correction](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-01.1.record.md#turn-3) replaced the original linear-fade assertions. Cases include frontier nodes, all optional emphasis modes, invalid colour input, wire visibility and symmetric pair identity. Browser playback tests measure uploaded colours and alpha at several times within a commit and across its boundary.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`forceGraphEmphasis.dims`](./forceGraphEmphasis.ts.mdmd.md#symbol-dims)
- [`forceGraphEmphasis.emphasizedSphere`](./forceGraphEmphasis.ts.mdmd.md#symbol-emphasizedsphere)
- [`forceGraphEmphasis.emphasizedWireAlpha`](./forceGraphEmphasis.ts.mdmd.md#symbol-emphasizedwirealpha)
- [`forceGraphEmphasis.glows`](./forceGraphEmphasis.ts.mdmd.md#symbol-glows)
- [`forceGraphEmphasis.pairKey`](./forceGraphEmphasis.ts.mdmd.md#symbol-pairkey)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
