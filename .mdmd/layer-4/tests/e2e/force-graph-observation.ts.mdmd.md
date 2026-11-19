# `tests/e2e/force-graph-observation.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/force-graph-observation.ts`
- Generated At: 2026-11-19T21:10:21.177Z

## Authored
### Purpose
Observes the GPU instance geometry, picking identities and camera actually drawn by the spatial-view browser regressions.

### Notes
Introduced for the owner's [October 14 pin-management request](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-13/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs), extracting shared observation from the focus regression. It listens to Three's development-tool event and reads the actual scene and DOM; it adds no product endpoint or browser-global application API.

For the [October 29 direct renderer](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-29/2026-10-29.1.record.md#turn-10), identity comes from the instance picking index, while positions, sphere radii, alpha and wire widths come from uploaded attributes and geometry. Wire ends are the transformed unit-axis endpoints. It therefore observes rendered buffers independently of the application's layout estimates. The prior October 23 implementation read those buffers through native mesh proxies; those per-node/per-wire proxies are now gone.

Actual draws and aria-busy transitions are recorded separately. A draw is not assumed to be a complete physics tick: large evaluations span animation frames. Stable wire-to-buffer bindings and their mesh identities can be marked through a WeakMap and checked across membership changes and historical renames. The idle-picture spec separately checks compositor pixels so an unpainted canvas cannot pass as a correctly idle renderer.

The [projected-wire regressions](force-graph-wires.spec.ts.mdmd.md) isolate one actual uploaded wire, preserve its width/colour/alpha, place its endpoints at controlled camera-relative depths and read GPU pixels before restoring every changed buffer value and visibility. This checks resistance, clipping and caps at multiple pixel densities without predicting shader output from application state. Sphere sizing likewise comes from geometry and uploaded matrices. The renderedPieces observation records each membership as it is submitted, including a piece visible for only one frame, for [the reveal spec](force-graph-reveal.spec.ts.mdmd.md).

Since November 13, 2026, `cameToRest` waits for the picture to come to rest under two bounds, for the two cases that wait for this repository's own whole 3D picture: [the update spec's motion case](force-graph-update.spec.ts.mdmd.md) and [the discovery spec's archipelago case](force-graph-discovery.spec.ts.mdmd.md). The engine takes one physics step per drawn frame and the gate's software renderer draws about four frames a second, so a settle's seconds measure the machine as much as the picture: the same commit settled in 111 s one night and 154 to 158 s the next. The wait ends when `aria-busy` says still or when the frames drawn since it began reach the case's bound, whichever comes first. The bound in frames is a hard expectation and answers whether the picture came to rest at all ("the picture did not come to rest within N drawn frames; after F frames and T s it was still moving"). The clock, the seconds each wait allowed before, is a soft expectation ("… the clock allows S s. Slow, not broken"), so a slow machine still turns the case red, by the clock alone, after the case has gone on to check the picture at rest. `caseClock` keeps a case's own former timeout as the same kind of soft expectation at its end, leaving the hard timeout as a net for a page that stops drawing. The clock stays red on a slow day on purpose: the owner, offered the frame bound in place of the clock, kept both: "I personally like that this keeps going red because it literally makes the perf a red-hot sticking point", and "A is a good idea though. I just don't want to see that urgency of bad perf going away" ([Turn 3 of the November 12 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/2026-11-12.1.record.md#turn-3)). Each settle writes one line beginning `came to rest?` to the test's output, and each case one beginning `case clock:`; the `list` reporter prints a test's output as it comes, so the gate's log carries the frames, seconds and frame rate of every settle (annotations would reach only the HTML report).

**The bound counts substeps since 2026-11-19.** Until then a drawn frame took one evaluation of the field, a substep of the motion, so a bound in frames was a bound on the picture alone. Since the pacing let a frame take as many of a tick's substeps as fit in its ten milliseconds, frames to rest depend on the machine: the discovery case's grown group rested in 2,638 frames on a quiet machine and crossed its 2,700 at a load of 21. The motion force now counts its evaluations of the field (`MotionForce.evaluations`), the 3D map says the count on its container as `data-motion-substeps`, and `cameToRest` bounds that count where it bounded frames, at the same numbers, its soft clock unchanged; its line gives substeps and frames. Measured with the new unit and the callers' bounds in [the settle-sooner evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/settle-sooner/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `observeGraph` {#symbol-observegraph}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L25)
- Parameters: `page`: `Page`

##### `observeGraph` — Summary
Observe the actual buffers submitted to Three; no predicted layout or shader formula is read.

#### `renderedPieces` {#symbol-renderedpieces}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L95)
- Parameters: `page`: `Page`

##### `renderedPieces` — Summary
Memberships actually submitted, including pieces painted for a single frame.

#### `engineActivity` {#symbol-engineactivity}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L100)
- Parameters: `page`: `Page`

##### `engineActivity` — Summary
Actual draws and the container's busy/settled transitions, not animation-callback counts.

#### `cameToRest` {#symbol-cametorest}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L119)
- Parameters: `page`: `Page`

##### `cameToRest` — Summary
Wait for the picture to come to rest, bounded twice. The seconds a settle takes measure the machine as much as the
picture: the gate's software renderer draws this repository's whole picture at about four frames a second. The bound
in substeps of the motion, counted from the wait's start as the page says them (`data-motion-substeps`), says whether
the picture came to rest at all: past it, it is not coming to rest, however fast the machine. Until 2026-11-19 the
bound counted drawn frames, when a frame took one substep; a frame now takes as many as fit in its ten milliseconds,
so frames to rest depend on the machine and substeps do not, and each bound keeps its number in the new unit. The
clock, the case's seconds as they stood before the bound, is a soft expectation: a slow settle fails the case, as the
owner wants performance kept a red-hot sticking point (2026-11-12), and the case goes on to check the picture at
rest, so a red result says by itself whether the picture was wrong or the machine was slow. Each settle writes one
line to the test's output, which the gate's `list` reporter prints.

#### `caseClock` {#symbol-caseclock}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L143)

##### `caseClock` — Summary
A case's own clock, kept as a soft expectation at its end: the case's alarm on performance, apart from its hard
timeout, which is only a safety net for a page that stops drawing. Call it at the case's start; call what it returns
at the case's end.

#### `markRenderedLinks` {#symbol-markrenderedlinks}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L153)
- Parameters: `page`: `Page`

##### `markRenderedLinks` — Summary
Mark stable wire-to-buffer bindings so updates can prove they retained surviving identities.

#### `markedRenderedLinks` {#symbol-markedrenderedlinks}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L166)
- Parameters: `page`: `Page`

##### `markedRenderedLinks` — Summary
Surviving wires retain both their binding and GPU batch, including across historical renames.

#### `renderedNodes` {#symbol-renderednodes}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L183)
- Parameters: `page`: `Page`

##### `renderedNodes` — Summary
Read identity from the picking index and geometry/alpha/positions from the actual uploaded instances.

#### `renderedLinks` {#symbol-renderedlinks}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L216)
- Parameters: `page`: `Page`

##### `renderedLinks` — Summary
Read each wire's uploaded axis, base width, alpha, colour and visibility beside its documented relationship
identity. The axis runs between the two spheres' drawn surfaces (2026-10-30), in the picture's units and on the
screen. The colour is the one RGB the shader draws the whole wire in (the flow number that ran a gradient along it
was withdrawn with the gradient, 2026-10-31).

#### `referenceWire` {#symbol-referencewire}
- Type: const
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L252)

##### `referenceWire` — Summary
Whether a wire is a documented reference between two files, rather than containment or a document's citation.

#### `clearStroke` {#symbol-clearstroke}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L259)
- Parameters: `page`: `Page`

##### `clearStroke` — Summary
A point on a reference wire where a hover reaches the wire and nothing else: the middle of the longest stroke on
screen whose middle stands clear of every sphere, inside the canvas, and on the bare canvas rather than a name or a
control, since a sphere or a label under the pointer takes the hover instead.

#### `renderedBodyCarriers` {#symbol-renderedbodycarriers}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L273)
- Parameters: `page`: `Page`

##### `renderedBodyCarriers` — Summary
Read skin vertices and interior marks from uploaded geometry, independently of transition capture/projection code.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`
- [`forceGraphBatches.SpatialDrawEntry`](../../packages/explorer/src/client/views/forceGraphBatches.ts.mdmd.md#symbol-spatialdrawentry) (type-only)
- `three` - `BufferGeometry`, `Camera`, `InstancedMesh`, `Mesh`, `Scene`, `Vector3`, `WebGLRenderer` (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
