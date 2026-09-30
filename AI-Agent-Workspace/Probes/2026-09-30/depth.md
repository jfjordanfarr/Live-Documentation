# Two uses of depth: failed layout experiments

_Historical design record, 2026-09-30. Built by the root Codex agent during [Turns 25–33](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-25). The owner found the pictures substantially worse than the existing visualizations. Neither layout is a replacement candidate; the record preserves the constraints and failures, not a recommendation to finish either implementation._

## The question and the owner's steering

The target was specific: “Keeping the *legibility* of the Local Map cards with the *navigability* of the World Map.” The owner suggested force-positioned cards, quarter-turn or alternative views, and camera-facing objects in a traversable space. They explicitly allowed unification to mean sharing invariants while retaining different modes, or to be abandoned where authoring and interpreting benefit from different views.

They then proposed physically placing subdirectories behind their parent: forward/backward travel might make directory navigation feel like an infinite zoom. They also named its cost immediately: connections to siblings and other branches become harder to draw. Orthographic projection was explicitly relaxed if perspective serves legibility. The Don't Starve comparison was qualified as a warning about disorienting billboard rotations, not a requirement to reproduce those rotations. Directories must be closed when first encountered; seeing through multiple open boundaries was disorienting.

## What was tried

**Wiring depth.** The actual Local Map card factory, graph projection and styles rendered twenty real files from `packages/engine/src/live-docs`. Browser captures at twice display resolution supplied textures and measured pin locations. The selected card used the same factory live in a reading panel. Six-file and twenty-file scenes exposed all public symbols, with respectively 55 and 211 retained graph references among those files. Unavailable source-symbol origins remained file-level references at the existing Internals anchor.

Cards occupied a fixed plane; wire paths were built once in depth behind it. Read, oblique and side cameras viewed identical geometry. Flattening the wires deliberately removed depth for comparison. Panning, orbiting and selecting a symbol did not reroute anything. Depth lanes were arbitrary drawing allocations, not architectural measurements.

This failed as a composition. A side view collapsed several cards onto the same projected edge and lost their identities. The reading panel kept one file readable, but that did not make the relationship picture legible. The initial arbitrary card placement and wiring-depth allocation supplied more space without a useful organization of that space. A camera maneuver had been mistaken for a layout solution.

**Directory depth.** A separate perspective camera approached directory entrances and moved toward their physical contents. The sample began at `packages/engine/src`, whose graph contained 98 files and 191 references crossing its boundary. Entering `live-docs` exposed a scope of 80 files and 166 crossing references. A list retained those external references and their evidence, with navigation to peer directories inside the sample; it did not draw those peers in space.

The first version drew open entrances at successive depths. The owner found it disorienting. The revision kept directories closed, fixed the camera heading, and revealed one entered level. It also limited the scene to four nearby file cards, with all direct files available in the selection control. Twenty files had full native-card textures; other files had name markers and their full live card in the reading panel. These restrictions made it a bounded navigation test, not a complete Local Map alternative. Perspective still shrank distant cards, the arrangement occluded neighbors, and the outside-reference list did not solve spatial understanding of cross-branch connections.

## Verdict and what survives

The owner's [latest reaction](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-33) was clear: “Looks like we've got a high bar to clear on beating the current visualizations!” The agent accepted both as failed layout experiments. The closed-boundary correction is not a new claim of design acceptance.

The following remain useful constraints:

- Camera-only movement must preserve cable routes. This experiment corrected the earlier probe's snapping, but that is a minimum requirement rather than evidence of a good layout.
- Full-card legibility consumes screen area. Depth provides alternate projections and navigation; it does not make arbitrarily many full cards simultaneously readable.
- Shared pin meanings do not require identical object shapes, a shared projection or a single renderer. Unification remains optional.
- Directory ancestry and dependency connectivity are different structures. A pleasing journey down the former can hide the latter. Names and counts in a side list preserve evidence but do not replace a readable relationship picture.
- Closed boundaries and selective disclosure matter. Billboarding preserves text facing, not orientation or comprehension of space.
- Force-positioned cards were suggested but not implemented here. Nothing in these two failed layouts evaluates that possibility or rules out better use of 3D.

## Verification and retained evidence

Focused browser checks passed at phone (390 × 844), tablet (820 × 1180), laptop (1440 × 900) and wall (2560 × 1440) sizes. Six pans left all wire world coordinates unchanged, built no new geometry, and preserved projected path shape after translation was removed. The side camera retained the same geometry. Return restored prior state; flattening preserved edge identities; the larger sample retained twenty files and 211 references. Closed directories withheld children until entered, nested positions remained fixed, and returning restored the previous scope and camera. Reduced motion, help-dialog focus, page errors and page-level horizontal overflow checks also passed.

Those checks did **not** certify label collision, scene readability, real-device comfort or general directory-graph composition. The negative visual verdict stands. No production source changed, and the full repository suite was not repeated for this disposable experiment; the earlier full run is recorded in [the interface probe](interfaces.md#verification-and-captures).

Three stills retain the relevant failures:

- [Side view](depth/01-side.png): fixed wires, collapsed card identities.
- [Open boundaries](depth/02-open-boundaries.png): multiple visible interiors obscure containment.
- [Closed-boundary revision](depth/03-closed-boundaries.png): closure improves disclosure but the file arrangement still fails to explain relationships.

Working source, input card textures and structured checks remain ignored under `AI-Agent-Workspace/tmp/probes/2026-09-30/depth/`. After retaining the three stills above, 32 generated capture files were removed (7,175,796 bytes), including the superseded PNGs, video and intermediate capture page. Its server uses port 8879; the other probes remain separate. The page was not opened as a new review request after the owner rejected the pictures. The data snapshot was built from source commit `93bce24c`. No dependencies or production features were added.
