# Why the T3 3D view freezes

Historical investigation, 2026-10-27, following the owner's reproduction in [Turn 6](../../../ChatHistory/2026/10/2026-10-27.1.record.md#turn-6). These are measurements of the current implementation and one isolated naming prototype. No product source or bundle has changed in this investigation.

## What the two-file question actually asks the renderer to do

The saved T3 guide state names two files, with tests and assets hidden. The 3D renderer nevertheless constructs **21,720 nodes and 72,137 links**. Its `includeNode` function keeps the selected/path/pinned exceptions and applies the file-type filters, then includes every other file. The path becomes a set for attention and framing: unrelated nodes and wires fade, but remain in the simulation. See [the renderer's data selection](../../../../packages/explorer/src/client/views/forceGraphView.ts#L786) and [its retained/path attention](../../../../packages/explorer/src/client/views/forceGraphView.ts#L931).

This is why requesting a short path does not reduce the physical workload to two nodes. It is an existing view semantic, not an accidental loss of the path URL. Changing it to bounded path membership would change what the view shows.

## Three costs before a useful picture

| Operation | Measured result | Evidence boundary |
| --- | --- | --- |
| Disambiguate names for the filtered graph | 17.2 seconds in the parity run | Current algorithm on all 21,720 nodes in Node; a separate phase run took 17.4 seconds. |
| First sampled browser work after choosing 3D | At least 95% of the 25.4-second CPU sample in name disambiguation | Source-map attribution to renderer lines 945, 947 and 951. The probe stopped while that work was still active. |
| One force evaluation at the initial full-graph positions | 2.23 seconds; 235,868,340 pairs checked | The actual `SpatialField.forces` implementation, with the saved Compact tuning. |
| First complete simulation tick | 33.84 seconds; 15 force evaluations | The actual headless layout/motion modules with D3's initial placement, including first-tick setup and adaptive steps. |
| Initial hidden warmup | 100 synchronous ticks configured | Code inspection, not a measured complete warmup duration. |

The [naming loop](../../../../packages/explorer/src/client/views/forceGraphView.ts#L945) scans all nodes repeatedly for each filename and each candidate path suffix. This is avoidable repeated work.

The [physics pair loop](../../../../packages/explorer/src/client/views/forceGraphPhysics.ts#L129) compares every sphere with every other. The saved `chargeRange` is zero, meaning unbounded repulsion. The adaptive integrator may evaluate the field several times inside one outer tick to retain numerical stability. Disabling those checks would change correctness rather than solve the scaling problem.

The renderer requests [up to 100 warmup ticks](../../../../packages/explorer/src/client/views/forceGraphView.ts#L1065). The installed `three-forcegraph` 1.43.5 executes those ticks in a synchronous loop before finishing its update (`dist/three-forcegraph.mjs`, lines 1159–1161). The page cannot update its scene or handle ordinary input while this main-thread task runs. Even removing the naming cost would therefore leave substantial work blocking the first picture.

The one-tick cost must not be multiplied by 100 and presented as a completion estimate: later ticks have different positions, stiffness and substep counts. What is established is that a single initial tick is already far beyond an interactive budget.

## One exact optimization demonstrated separately

A diagnostic prototype counts basenames and path suffixes once, then finds the same shortest distinguishing suffix for each file. On all 21,720 current nodes it produced **zero differing labels**, in **111.9 milliseconds**, compared with **17,217.3 milliseconds** for the existing repeated scans. This is a concrete candidate for removing the first bottleneck while preserving names. It remains outside product source and needs its edge cases and regression coverage before shipping.

## What this means for the repair

These findings do not establish a fundamental browser or WebGL limit. The measured blockage begins in our own CPU work before scene creation, followed by a quadratic force calculation and synchronous hidden warmup. Replacing the renderer or removing source files would not address the demonstrated causes.

A complete repair needs indexed name preparation, startup that can yield and be cancelled, and physics whose cost scales to the full graph. Moving the current exact calculation to a worker alone would improve responsiveness but leave its total cost. The existing exact field and finite/stability checks should remain reference evidence when evaluating a faster calculation; no gate, relationship or failure should be hidden to obtain a pass.

The owner has been asked whether a path-selected 3D view should preserve the whole graph as faint context or show only the path as 2D does. The recommendation is to preserve the context and solve the scaling problem: narrowing path requests alone would leave the full overview unusable. This is an open design fork, not a selected replacement.

## Reproduction and source trail

[Structured measurements](3d-startup-measurements.json) retain counts, phase timings, tuning, dependency inspection, browser attribution, runtime versions and limitations. The [raw browser CPU profile](3d-startup.cpuprofile) is preserved. The ignored operational folder `AI-Agent-Workspace/tmp/t3-3d-startup-2026-10-27/` holds the diagnostic scripts and full output; these read the existing T3 bundle, never execute T3 provider code and do not mutate the product.

The repository's inspect CLI finds the inbound path `forceGraphPhysics.ts → forceGraphLayout.ts → forceGraphView.ts → index.ts`, matching the ownership described by the Live Docs. Read the [physics Live Doc](../../../../.mdmd/layer-4/packages/explorer/src/client/views/forceGraphPhysics.ts.mdmd.md) for the origin of the exact conservative field and its stability controls. The earlier delivery's full suite remains the last source verification; a new full suite has not been run for this read-only investigation.

[Open the physics file pinned in this repository’s 2D Explorer](http://localhost:8080/?s=N4IgbiBcDMA0IDsogA4EMDGBrNBzApgM4D0%2BAHigDYD2ATvrcYbRsRpQJb4IAuxYXAO4kAZnQz4A4rTQoAFgAU5AT0IcMhAHQ9CIeByigkkVJhwES5KnQZMWbTtz4D8w4mJZSZ8pavVadEABfeBQoAG0jZHRsPCJSChp6RmZWdi5efiFRcS9ZRRU1DW1deF0TACpggF0goA).
