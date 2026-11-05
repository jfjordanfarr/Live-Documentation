# Reading access and hover stability

Current verified repair, following the owner's [November 5 testing feedback](../../../ChatHistory/2026/11/2026-11-04.1.record.md#turn-9). The full local gate passes 1,570 unit, 115 integration and 303 browser tests; all ten source/test/config hashes remain unchanged through it. The baseline is commit 30aeaf8b. Its passing tests and earlier model reviews did not cover reading requests while overview suppression was active, or uninterrupted hover displacement. This evidence establishes the exercised behavior, not owner acceptance.

## Reading at a working zoom

Root used private Chromium pages at 900×700 and 1440×960, with the payment service selected, no initial pins or reading overrides, 2D, and background search disabled. Two Zoom Out presses followed by one Zoom In produce approximately 0.833 of the initial reading scale. Each step settles for this comparison; rapid reversals are investigated separately below.

| Viewport | Baseline after attempted reading and pinning | Candidate with a fresh pin |
| --- | --- | --- |
| 900×700 | [Descriptions unavailable](baseline-inaccessible-900.png) | [Descriptions available](candidate-pin-900.png) |
| 1440×960 | [Descriptions unavailable](baseline-inaccessible-1440.png) | [Descriptions available](candidate-pin-1440.png) |

At 900×700, the initial expanded card is 669 px tall against a 581 px map frame. At scale 0.833333, the baseline suppresses every description: hover, two book presses and a pin cannot reveal it. Its book can say Fold with pressed=true and expanded=false. The candidate previews the hovered symbol, opens all file descriptions on the first book press, and folds on the second. The opened file is 557.5 px tall at that same scale. Pinning adds a header row and reduces the available frame to 536 px, so the full-reader action and panning remain useful; this does not claim that every expanded card fits every frame.

At 1440×960, the blocked baseline scale is 1.04355: text would not be intrinsically tiny. The gate was relative to the earlier reading fit. The candidate opens the requested text at that scale too. Pin comparisons use equivalent open intent: the baseline's two book presses leave saved reading open, while the candidate's fresh visit has the open pin default. A deliberately saved Fold remains separate from retention and is not overridden by a new pin.

Root also inspected final hover-only pictures at [900×700](candidate-hover-900.png) and [1440×960](candidate-hover-1440.png). The class explanation is visible inside the map at the same blocked scales, without pinning or opening every description. The comparison waits for both camera and disclosure to settle before each zoom input; a first quick capture that waited only for layout readiness stayed at the initial fitted scale and was replaced rather than mislabelled as overview evidence.

## Uninterrupted alternation

Root began with descriptions deliberately folded, then moved the real pointer between the service class and Post, or between the exact Walk interface and walk function. The latter scenario has those two symbols pinned and no selected file. At 1440×960 and scale 1.45, every target is checked against the actual pointer hit; no automatic scrolling or corrective pan is used during the sequence.

| Subject | Baseline first pair | Baseline last reachable state | Candidate first pair | Candidate after 20 pairs |
| --- | --- | --- | --- | --- |
| Payment service | [First pair](baseline-payment-first-pair.png) | [Walked below the frame](baseline-payment-last-pair.png) | [First pair](candidate-payment-first-pair.png) | [Stable title](candidate-payment-last-pair.png) |
| Walk / walk | [First pair](baseline-walk-first-pair.png) | [Walked below the frame](baseline-walk-last-pair.png) | [First pair](candidate-walk-first-pair.png) | [Stable title](candidate-walk-last-pair.png) |

The service's baseline title moves from y=348.925 to 509.377 and then 669.828; the next Post target is at y=970 and unreachable after five successful visits. Walk/walk moves from y=299.625 to 661.4, with the next target below the map after nine visits. Leaving restores the original frame, which explains why the old test passed. The baseline's last picture therefore shows its last reachable target, not the same final target as the successful candidate sequence.

The candidate completes all 40 visits for each pair. The service title remains at y=348.925, and the pathfinding title at y=299.625. Its camera may compensate for a different layout, but each repeated target reproduces its own geometry; there is no accumulated displacement. Root inspected the baseline failures and candidate endpoints.

## Faster interaction and genuine actions

Sequential private-browser checks cover both click and hover anchor tuning at 100 ms per visit, longer than hover intent but shorter than the disclosure animation. Selected pictures are [service/click](rapid-payment-click.png), [service/hover](rapid-payment-hover.png), [Walk/click](rapid-walk-click.png), and [Walk/hover](rapid-walk-hover.png). Forty visits per case keep the title stable; the largest observed title range is approximately 0.0015 px.

Some rapidly aimed label positions moved before pointer dispatch. Event capture establishes that the displayed description matches the symbol actually hit; this is not reported as a lost disclosure event. Settled alternation checks the intended target, while rapid checks use the actual hit. [Opening a symbol menu](preview-symbol-menu.png) and ordinary inspection/pinning were also exercised during preview; a real action takes ownership of its clicked context.

## Interrupting the return and zoom

After the first repair, an initial 14-cycle probe with only 100 ms of expansion found a small 0.171 px residual for the service and no residual for Walk; its redundant still pictures were removed after preserving those measurements. A stronger sequence lets each expansion finish, leaves to the sidebar for 20 ms, then reenters during the return. Ten interruptions leave the service almost 397 px lower after settling ([failure](interrupted-return-payment-settled-expansion.png)), with all actual pointer hits confirmed. This failure was observed in the first candidate, not attributed to the original owner report; its targeted regression passes the original baseline. The repair retains the original home until its return completes, rather than adopting an intermediate camera as the next home. The [repaired sequence](interrupted-return-payment-repaired.png) returns to the original title y=348.925 and camera after the same ten interruptions.

A rapid two-Out/one-In reversal during disclosure put the subject behind the sidebar ([failure picture](rapid-zoom-subject-offscreen.png), [failure trace](rapid-zoom-subject-offscreen.trace.zip)). The motion hold had retained the zoom's translation while cancelling its scale effect. The candidate now rebases its held anchor to the already-zoomed picture before applying the next layout frame. Three matched trials per build confirm the difference: the old rapid sequence puts the title at x=72.576 behind the sidebar, while the new sequence puts it at x=375.496 inside the frame beginning at x=261. The new rapid result matches the settled control within approximately 0.001 px. An initially locator-paced regression did not overlap zoom with disclosure reliably; genuine clicks at the premeasured visible controls reproduce the old failure without adding an arbitrary delay.

| Zoom sequence | Original build | Repaired build |
| --- | --- | --- |
| Rapid reversal during disclosure | [Subject behind sidebar](rapid-zoom-8901.png) | [Subject remains in frame](rapid-zoom-8900.png) |
| Same inputs, each allowed to settle | [Settled control](settled-zoom-8901.png) | [Settled control](settled-zoom-8900.png) |

## Verification status

The TypeScript build and editor diagnostics pass. The full reading spec passes all 17 cases (nine new and eight existing); the original tests and 0.1 px restoration threshold remain unchanged. Seven new regressions fail on the original bundle: four uninterrupted hover cases, two overview-access cases and rapid zoom reversal. The interrupted-return case protects the defect exposed in the first repair, without falsely claiming an original-baseline failure. Root then strengthened the inward-zoom assertion to use a small step below automatic restoration and replaced a literal tuning-storage version with the current constants; both updated viewport cases pass. Generation processed 925 documents, with two updated and 923 unchanged.

The adjacent motion, learning, keyboard, row-motion and layout-lab run initially passes 25 of 26 cases. The repository-chain comparison times out at the existing 30-second deadline: its trace shows a 93-card capture taking 21.17 seconds, followed by matching geometry assertions after the deadline. [Profiling and batching independent style probes](../../../Probes/2026-11-05/capture-performance/README.md) cuts matched capture time from 15.69 to 6.51 seconds with identical output except timestamp. The final layout suite passes all 12 existing cases. No tolerance, fixture or deadline has been changed.

The first full gate passes generation, lint, build and test type-checking, then stops with 1,568 unit tests passing and two pre-existing physics cases exceeding five seconds. An isolated normal-coverage run still times out on one case, so full-suite contention alone is not treated as the cause. Profiling finds inactive pair work and unnecessary farthest-corner tests in the octree walk. Two bounded optimizations preserve bit-for-bit forces, stiffness, overlaps, worst overlap and lazy energy across 48 matched scenarios, including partitioned evaluation. The focused physics/layout run passes all 64 cases; the star takes 0.237 seconds versus 4.300 seconds in the original isolated run, and the exact-tree comparison 2.937 seconds versus its earlier 5.293-second timeout. These are individual timing observations, not a statistical benchmark.

Subsequent complete unit runs on the same optimized source still time out on exact tree with the default 19 workers (7.710 seconds) and four workers (5.753 seconds). One worker passes all 1,570 tests, with exact tree at 4.117 seconds and star at 0.256 seconds. Root adopts one worker only for the unit project; all checks and five-second deadlines remain. The cost is material: the serialized control takes 661.60 seconds, versus 153.83 seconds for the failing four-worker run. [The configuration note](../../../../.mdmd/layer-4/vitest.config.ts.mdmd.md) preserves that tradeoff.

The second complete `npm run safe:commit -- --e2e` gate exits 0: generation, Live Doc validation, ESLint, package builds, test type-checking, 1,570 unit tests, 115 integration tests, all documentation/asset/symbol audits and all 303 browser tests pass. The final unit phase takes 637.42 seconds, integration 113.18 seconds and browser verification 42.1 minutes. All seventeen reading tests and twelve layout-lab cases pass in that full run; the formerly timed-out chain comparison takes 11.3 seconds under its original 30-second limit. All ten frozen source/test/config hashes and their exact changed-file scope match afterward.

## Supplemental 3D look

After the full gate, root opened the rebuilt estate payment-service neighborhood in a private 1280×900 Chromium page and inspected the [unfolding](physics-estate-unfolding.png) and [settled](physics-estate-settled.png) pictures. The initial geometry sample contained 11 nodes; the settled scene contains 19, and all 11 initially sampled nodes moved. The renderer submitted 187 frames before reporting settled. Positions remain finite and the page reports no errors. The screenshots occur after their respective geometry reads, so the unfolding picture is not claimed to show exactly the first sample's membership. This supplements the exact numeric comparisons and full browser motion regressions; it does not claim that every neighboring sphere fits the focused frame.

The first scratch invocation lacked the tsx compiled-name helper used by the imported observer. It stopped before producing these pictures; rerunning with the layout lab's existing helper corrected the instrumentation without any product or policy change. Both private browsers were closed.
