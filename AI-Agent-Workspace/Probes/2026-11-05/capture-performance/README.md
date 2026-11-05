# Layout capture performance

Current verification evidence from the [November 5 reading repair](../../../ChatHistory/2026/11/2026-11-04.1.record.md#turn-9). This is a measurement-tool repair, with no change to the rendered card or the independent layout model. The final full gate passes 1,570 unit, 115 integration and 303 browser tests, including every layout-lab comparison.

## Failure and cause

The broader focused run passed 25 of 26 browser tests. The repository-chain layout comparison exceeded its unchanged 30-second deadline. The [failure trace](repository-chain-timeout.trace.zip) shows 5.90 seconds waiting for the initial scene, 21.17 seconds in the synchronous capture, and roughly 5.43 seconds in subsequent graph/model computation. The captured 93 cards and 15 labels had no text warnings. The geometry and placement-cost assertions eventually passed during teardown, after the deadline; the test still correctly failed.

Profiling the same scope identified repeated stylesheet invalidation. Each card's independent constant probes were appended, read and removed one at a time, making Chromium recompute styles across the large scene. The repair in [capture.ts](../../../../scripts/layout-lab/capture.ts) adds the probes together, reads their computed values together, then removes them. A pre-existing node-meta probe was also removed because its measured result was immediately discarded.

## Matched capture

Both captures used the same built repository bundle, repository-chain scope and browser environment. Chrome DevTools Protocol performance counters bracketed the capture operation. These are individual measurements, not a statistical performance benchmark. The [measurement record](measurements.json) preserves the numbers and normalized SHA-256.

| Measure | Original capture | Final batched capture |
| --- | ---: | ---: |
| Capture duration | 15.69 s | 6.51 s |
| Style recalculation duration | 12.66 s | 3.85 s |
| Layout duration | 0.409 s | 0.203 s |
| Style recalculations | 1,103 | 452 |
| Layouts | 1,097 | 446 |
| Subsequent model duration | 4.72 s | 4.86 s |

The complete serialized captures are identical after removing **only capturedAt**. User agent, every card, prepared text, labels, fonts, constants, filters and truth measurements remain compared. Both independent model evaluations have no drift or warnings. Raw captures are disposable and are not committed, following the workspace convention.

## Verification

The first batched version passes all 12 existing layout-lab browser cases, including repository and estate scopes, narrower card predictions, coarse-pointer phone geometry and indented code. Removing the unused probe preserves complete capture equality. The final version also passes all 12 cases in 2.8 minutes; the previously failing repository-chain case completes in 17.7 seconds within its original deadline, and the repository five-file comparison takes 18.3 seconds. No deadline, tolerance, fixture or assertion was weakened.

All twelve cases pass again in the complete local gate. The chain comparison takes 11.3 seconds in that run, under the same 30-second deadline, with no text warnings or geometry drift.
