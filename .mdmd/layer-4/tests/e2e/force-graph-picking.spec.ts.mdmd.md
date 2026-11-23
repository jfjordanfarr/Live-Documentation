# `tests/e2e/force-graph-picking.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/force-graph-picking.spec.ts`
- Generated At: 2026-11-23T02:16:52.765Z

## Authored
### Purpose
Holds what a press and a hover take in the 3D map where a wrapper's translucent skin stands before a sphere: the sphere, which is seen through the skin, and the skin's own node only where the pointer's ray meets no sphere ("what is seen is what is pressed", the root's ruling of 2026-11-23).

### Notes
- Created 2026-11-23, after a builder measured why `force-graph-focus.spec.ts`'s first case was sometimes offered the actions of the `packages/explorer` shell after pressing `graph.ts`: the camera's damped turn carried the shell's edge between the eye and the sphere, and the pick rule of the day gave the point to the skin met first ([the measurement and the ruling](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-23/Probes/picking/README.md)).
- The situation is made, at rest and with no race: the estate sample (which does not grow) opened on `PaymentService.cs`, the camera placed on the line from that sphere through the largest shell's centre, beyond the shell. The points are found by reading the ray from the uploaded picture independently of the page's picker (`rayAt` in `force-graph-observation.ts`). The case fails when no point with the skin before the sphere, or no bare point of the skin, is found, so it cannot pass empty.
- It holds four things: the picker gives the sphere there; a rest there offers the sphere's actions and leaves the sphere at least as bright as before; a press there pins it; and on the same skin with no sphere behind, a rest offers the shell's actions and a press pops it. On the rule before the change it failed at the first: "a press at (768.5, 397.2), where shell:Portal/Pages's skin is met at 19.0 and PaymentService/PaymentService.cs at 267.9, takes … Received: shell:Portal/Pages".

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`force-graph-observation.RayReading`](./force-graph-observation.ts.mdmd.md#symbol-rayreading) (type-only)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.rayAt`](./force-graph-observation.ts.mdmd.md#symbol-rayat)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
<!-- LIVE-DOC:END Dependencies -->
