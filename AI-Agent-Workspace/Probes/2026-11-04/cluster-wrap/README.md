# A wrapped 3D component

Historical appearance and reveal probe, November 4, 2026, prompted by [Turn 16](../../../ChatHistory/2026/11/2026-11-03.1.record.md#turn-16--november-4). The owner imagines a mesh around a hidden emergent cluster, perhaps cloud-like or warbling, opening like a canvas around a connected flock of balloons and possibly revealing further wrappers. The live page, preparation source and generated snapshot remain disposable under ignored `dist/explorer/probes/cluster-wrap/`. No product grouping or rendering policy has changed.

## What existed before

Targeted searches of the preserved archive, probe/research records and current code found the [October 6 request](../../../ChatHistory/2026/10/2026-10-06.1.record.md) around line 891 for genuine membrane strain and shrink-wrapping, but no retained experiment implementing this 3D discovery envelope. That is the extent of the search claim, not proof that no related wording exists anywhere.

The current [scope computation](../../../../packages/explorer/src/client/views/forceGraphScope.ts) walks neighborhoods from retained subjects and adds seeds for unreached components. A ring means omitted neighbors. Ordinary frontier neighborhoods can overlap, while a disconnected component has unambiguous membership. The [renderer](../../../../packages/explorer/src/client/views/forceGraphBatches.ts) already packs spheres, wires, arrows and rings into shared instance batches, and the [view](../../../../packages/explorer/src/client/views/forceGraphView.ts) feeds only shown nodes into simulation. One mesh does not automatically remove a rendering, layout or picking bottleneck.

## One actual group, three appearances

The preparation uses the standalone estate's canonical graph, the production connectivity predicate and the existing headless physics. Its largest component contains 30 files and 57 reference pairs, with the payment service as its seed. It settled in 416 ticks; preparation measured 58 ms on this machine. This is one small isolated component, not a large-graph benchmark or a promise of the exact positions it would take beside every other group.

All three appearances enclose that same frozen layout with one padded **convex hull** containing 50 vertices. A convex hull bridges concavities and empty space between branches: it is a simple outer envelope, not a tightly concave shrink-wrap. The padding encloses the file spheres as well as their centers. Material changes preserve the viewpoint and group membership.

| Appearance | What it offers | Tradeoff to judge |
| --- | --- | --- |
| [Translucent skin](skin.png) | A readable boundary and continuous surface. | Can look like glass or packaging; it conceals interior structure. |
| [Taut cage](cage.png) | Explicit mesh shape and a light visual footprint. | Its mesh edges must not be mistaken for dependency wires. |
| [Clouded shell](cloud.png) | A softer, less definite surface. | Less precise boundary information; atmosphere is not evidence of uncertainty. |

[Unwrapping](unwrapped.png) fades the envelope with a small outward lift and reveals the same file positions and real wires. It does not rerun the physics, explode the files or simulate cloth. Optional subtle motion is a visual invitation, not measured physical uncertainty, and respects reduced-motion preferences. The material experiment is intentionally separate from recursive grouping.

The [Gallery sheet](../../../Gallery/sheets/wrapped-estate-component.png) places the materials and their shared contents together.

## Questions the experiment does not settle

### Owner's first playtest, November 4

In [Turn 17](../../../ChatHistory/2026/11/2026-11-03.1.record.md#turn-17--november-4), the owner favors clouded shell for reducing line density, with translucent skin also favored because it invites popping open. The cage's mesh lines add visual noise. They confirm that a ring is not necessarily a disjoint group and suggest beginning from what is irrelevant to the current pins' hop chains: preserve understandable structure without demanding every file be shown. Whether wrappers serve background simplification, delightful discovery or both remains unchosen.

Root suggests a cloud at rest with a smooth rim on hover/focus as a future comparison; it has not been built or selected. In [Turn 18](../../../ChatHistory/2026/11/2026-11-03.1.record.md#turn-18--november-4), the owner recalls a talk about layered armor meshes avoiding intersections, tentatively associated with Kingdom Come: Deliverance. The talk's identity has not been verified. The useful analogy is geometry and occlusion; root distinguishes those from graph membership and real boundary references, which should remain correct regardless of layout quality. The owner reaffirms the card as immediate integration work and wants these side ideas retained.

### Open technical questions

- A ring's hidden neighborhood is not necessarily a disjoint bag. If two frontier files both reach the same hidden file, independent wrappers can claim it twice. Recursive refinement needs a grouping/ownership policy and a representation of cross-group relationships.
- An exact future silhouette requires positions for hidden members. Computing their complete layout can spend the work that discovery currently avoids. A cache, a coarser layout or an explicitly approximate envelope has different costs and meanings.
- A transparent, detailed or continuously animated surface can itself be expensive. Current instancing already limits draw-call overhead. Measure prepared vertices, picking, physics, GPU work and idle behavior separately before claiming a speedup.
- The first prototype unwraps the whole component. A hierarchy that reveals only the next useful level, and transitions from those groups into particular file cards, remains future design.

## Verification

The root inspected all three materials and the opened graph, including the softer cloud revision. Eight open/close cycles returned to identical canvas pixels with motion off. Material switching preserved the view; direct shell click, keyboard activation, orbiting without an accidental open, sharing/reload and reduced-motion checks passed without page or console errors. A focused follow-up passed orbiting out and back to the starting pixel, plus touch opening and closing, so a gesture is not mistaken for a click solely because its endpoints coincide. The final cloud-material cleanup also passed an open/close smoke check.

The first preparation attempt omitted the required connectivity predicate and failed with `TypeError: pulls is not a function`; using the same predicate as the production view corrected it. No product gate or production source was altered for this throwaway.
