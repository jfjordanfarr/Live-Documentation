# November 2, 2026 — 3D exploration baseline

Historical measurements for the [November 1–2 review, Turns 6–7](../../../ChatHistory/2026/11/2026-11-01.1.record.md#turn-6--november-2-the-3d-exploration-pass). The initial measurements precede the design selection; the later sections identify the selected 0.2 component-separation default and its limits.

[The baseline measurements](./baseline-measurements.json) were calculated using the product's graph construction, filters, starting nodes, hop scope and sizing functions against the built repository, estate and T3 bundles. The compiled baseline is `b67c3433`. Default filters show tests, hide assets and related documents; default discovery is two hops. Components are undirected components of the eligible file dependency graph. The built repository contains 914 files; 913 survive these filters.

| Bundle | Eligible files | Components | Isolated files | Components reached from default start | Isolates reached |
| --- | ---: | ---: | ---: | ---: | ---: |
| Repository | 913 | 94 | 52 | 1 | 0 |
| Estate | 36 | 4 | 2 | 1 | 0 |
| T3 | 27,823 | 6,369 | 5,689 | 1 | 0 |

No disconnected file was removed from the canonical graph. A hop walk from one component cannot discover another. The repository starts at its declared Explorer entries; estate starts at PaymentService; T3 has no declared entry and falls back to a highly connected vendored file. This establishes the reachability limitation, not the best presentation for other components.

The orbit sample uses a perspective camera with 50° vertical field of view, an 800-pixel viewport and fixed radius 1,000 around the origin, looking at a world point `(0, 0, 500)`. Default node resistance is 0.3 and wire resistance 0.9. Between the front and back of that orbit the point's world-space node multiplier changes from 0.851 to 1.183 and wire multiplier from 0.615 to 1.654, despite unchanged zoom. This is a constructed measurement of the old per-point depth compensation, not browser animation evidence. A shared reference at the camera's orbit target is the next experiment.

## Rendered orbit and click checks

The [baseline uploaded buffers](baseline-rendered-orbit.json) and [shared-reference buffers](shared-target-rendered-orbit.json) come from the actual Three batches during four estate camera positions reached by pointer gestures. Baseline maximum radius changes across the three moves were 8.30%, 14.31% and 19.74%; with the shared target each was zero. Every layout coordinate remained unchanged in both runs. Neither page reported a JavaScript error. The [pictures and recordings](../../../Screenshots/2026-11-02/README.md) retain the visible comparison.

[The click check](click-check.json) records that withdrawing Estate.sln's pin removes it while preserving GatewayClient and its dependency neighborhood. This is one journey, not the complete regression suite.

## Existing-force comparison

[The comparison table](gravity-comparison.json) and full coordinates below use the existing force model with gravity 0.025, 0.005 and 0.001. Whole estate has 36 files; the repository five-file discovery report has 397 shown files. All six settled within the 3,000-tick budget with no sphere overlaps. The report uses the layout lab's existing scope semantics, not a claim that its five-file attention is identical to every page entry.

| Scope | 0.025 | 0.005 | 0.001 |
| --- | --- | --- | --- |
| Estate, whole | [report](estate-five-gravity-0.025.json) | [report](estate-five-gravity-0.005.json) | [report](estate-five-gravity-0.001.json) |
| Repository, five-file report | [report](repository-five-gravity-0.025.json) | [report](repository-five-gravity-0.005.json) | [report](repository-five-gravity-0.001.json) |

**Visual finding:** simply reducing global gravity is insufficient. In the estate comparison, isolates move farther away and fitting the picture makes connected work smaller. Keep the existing force defaults. Component separation and improving complex connected scenes remain open; no new force model is selected by these measurements.

## Component-centroid gravity trials and selected balance

[The comparison](component-comparison.json) measures zero, 0.5 and 0.8 separation of component centroids from origin gravity, leaving internal gravity unchanged. Full reports retain [estate zero](estate-component-separation-0.json), [estate 0.5](estate-component-separation-0.5.json), [estate 0.8](estate-component-separation-0.8.json), [repository zero](repository-component-separation-0.json), [repository 0.5](repository-component-separation-0.5.json) and [repository 0.8](repository-component-separation-0.8.json). All settle with no body overlaps; enclosing component spheres are a conservative diagnostic, not the visual goal. These early whole-scope runs asked about every file directly, rather than revealing the root's files as members.

The corrected member-reveal runs are [zero](repository-members-0.json) and [0.5](repository-members-0.5.json): 421 and 458 ticks. [The single-case retry summary](members-comparison.json) contains 0.5; the earlier combined run saved zero before exit 143 and is not claimed to have finished both. The report now starts hops at actual pins, without the accidental extra hop through their retained neighborhood.

[The stability sweep](separation-stability.json) checks how far a settled picture moves when eased again. The selected default is **0.2**, an agent judgment under the owner's November 2 continuation grant. Its recorded 0.936% move satisfies the existing one-percent contract; 0.25–0.5 exceed it. 0.5 and 0.8 are rejected defaults despite stronger separation. Ten-quiet-tick and residual-force anchoring experiments were rejected too; they are not in the final implementation. Kept corrections require completed reveal before cold anchoring and include sphere extents in the settling reference, including a lone orphan.

## Browser cost and end-user journeys

[The browser profile](repository-browser-profile.json) and [frame comparison](repository-frame-cost.json) identify native canvas readback/compositing as the dominant cost in this SwiftShader environment. Over equal five-second windows, normal / names hidden / canvas hidden / normal drew 9 / 10 / 123 / 11 frames. Hiding either layer was diagnostic only; neither was adopted. An opaque-canvas option experiment was removed because Three still requested an alpha-capable context and no improvement was established. Temporary raw profiling traces were not product outputs.

[The estate journey](directory-journey.json) preserves independent Portal retention through overview, orphan pinning, local return, both perspective transitions and release. [The direct interaction check](direct-interaction-check.json) verifies small pointer jitter and a name moved between press and release. [The first T3 journey](t3-first-journey.json) records the new directory-first entrance and the dense scenes it exposed; [the repeated T3 journey](t3-final-journey.json) records explicit hop reduction, a discovered service and its shared pin across 2D/3D. [Pictures and recordings](../../../Screenshots/2026-11-02/README.md) name which states are trials, still moving or superseded. Final test outcomes belong to the root session record, not these measurements.

[The pin-tray pointer check](tray-hit-target.json) repeats the history-control interaction that the full suite caught: the transparent positioning wrapper must not intercept a control beside its toggle. The actual hit is History, its click closes history and the pin panel remains open, with no page error. The [paired captures](../../../Screenshots/2026-11-02/README.md#history-and-the-open-pin-tray) retain the visible states.
