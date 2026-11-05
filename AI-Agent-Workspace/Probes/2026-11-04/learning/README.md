# Portrait reading and outward exploration

Implemented and verified November 5, 2026, under the [Turn 8 authorization](../../../ChatHistory/2026/11/2026-11-04.1.record.md#turn-8). The owner selected GPT-6.1 Sol for delegates and gave the root high autonomy. This records the implementation, comparison and verification; owner acceptance is not inferred from the reviewers' preferences.

**Subsequent owner testing:** [Turn 9](../../../ChatHistory/2026/11/2026-11-04.1.record.md#turn-9) reports inaccessible descriptions at useful zoom and cumulative displacement during symbol hovering. Those journeys were not established by the passing gate or these reviews. The [follow-up evidence](../../../Screenshots/2026-11-05/reading-access/README.md) preserves their reproduction and repair work; the results below remain the historical record of this earlier pass.

## Scope and method

The [rubric](../../../Research/2026-11-04-theo-ui-hill-climbing.md#november-4-follow-up-for-this-workspace) covers hierarchy/appeal, reading, controls/state, continuity and relationship interpretation. Baseline is commit e433e484, following the verified portrait integration. Three fresh Sol contexts reviewed the same application from visual, ordinary-navigation and phone/keyboard perspectives, without prior scores, a target score, implementation source or the answer to the cycle question. All reviewers used the supplied pictures; two exercised private Chromium sessions. These are separate contexts of one model, not independent model families.

The fixed captures use 1440×960, 978×768 and 390×844, the same selected subject/reading state, and searchStarts=0 for repeatable arrangements. Interactive review also exercised normal background search. Root's outward capture uses a wheel gesture near the upper-left of the canvas; that camera anchor affects the result, so it is not evidence that every zoom-out gesture produces that composition.

## Baseline findings

The root adopted the following findings after checking the evidence. Grades are the reviewers' reported judgments, not an averaged measurement or a passing gate.

| Dimension | Visual review | Navigation review | Phone and keyboard review |
| --- | ---: | ---: | ---: |
| Hierarchy and appeal | 7 | 7 | 7 |
| Reading | 6 | 6 | 8 |
| Controls and state | 6 | 6 | 7 |
| Continuity | 6, still states only | 7 | 8 |
| Relationship interpretation | 5 | 6 | 6 |

The strong starting point is readable subject prose and useful recorded type links. The substantive weaknesses are tiny repeated controls, phone content behind floating controls, invisible keyboard focus on offscreen neighbors, and return-wire cues whose endpoints are unclear without opening the inspector. Large/dense reading cards need full-text access, and that access works; shared reading and pins survived the exercised reader journey.

The navigation reviewer initially described small-window symbol overlap as a clean-load problem. Follow-up measurement distinguishes it: settled layouts are clear, but a background-search row permutation moves two expanded text blocks through one another. The initial grade is preserved as given; the diagnosis is corrected rather than relabeling that frame as a settled defect.

## First candidate and investigations

- Keyboard focus pans minimally to bring the focused native control into the unobstructed frame. A regression reproduced the baseline failure and passed after the fix, using 100 real Tab steps while checking unchanged exploration state and scale.
- The relationship counts move beside the subject's introduction and open named menus, with ordinary navigation to connected files. Counts still come from the canonical graph. Cycle cues name both endpoints using the ranking's actual return references.
- Portrait controls have larger targets and clearer pressed states. The map ends above the persistent toolbar, so panning can bring lower text into clear space. Reading-scale wires retain their colors without their persistent glow.
- A row-motion trial moved each boxed row as a group. The first opaque full-row treatment hid a rear connection pin; the subsequent text-column-only surface preserves the pin columns while preventing text superposition. The rebuilt refinement passed the focused motion checks.
- The independent layout model was extended to account for the relationship controls above the prose. The original desktop and coarse-pointer phone captures predict narrower cards exactly, including wrapped controls and long names. Capture corrections retain actual word-break seams and intrinsic label heights.

Name-click behavior did not change in this candidate: names still inspect. The subsequent comparison below judges the alternatives in the context of this journey.

## Name action comparison

A separate fresh Sol reviewer exercised three temporary browser variants in the order reading, inspection, pinning, with the same application state and ordinary actions. Accessible names and tooltips followed the trial action. These were ephemeral event bindings, not product settings. All three completed explicit retention, Used by navigation to configuration, and Back with the retained symbol intact. The reviewer did not exercise the dense pathfinding case.

| Name action | Useful result | Consequence |
| --- | --- | --- |
| Inspect, current | Immediate access to complete evidence and Notes. | Repeats some prose beside the card and introduces the separate reader. |
| Pin or unpin | Fast deliberate connection collection. | An exploratory name click changes retained state and path start before the person has learned the subject. |
| Toggle reading | Directly folds/restores a symbol explanation in place. | A file-title click folds away the whole portrait, including its Purpose and relationship navigation. |

Root retains inspection for this pass. The comparison supports further consideration of symbol-name reading, but its file-title consequence and consistency across perspectives remain a genuine design choice. The new explicit relationship controls improve outward navigation without requiring a new name policy. [Selected comparison pictures](../../../Screenshots/2026-11-04/learning/name-actions/README.md) preserve the concrete tradeoffs.

## Evidence

The [picture collection](../../../Screenshots/2026-11-04/learning/README.md) identifies fixed captures, exploratory frames, and motion evidence. During matched review the preserved baseline ran on port 8901; its task-owned server and static copy were removed after review completed. The working candidate remains on port 8900. Disposable capture scripts, observation files and review scratch were removed after their useful inputs, named evidence and findings were preserved.

## First matched review and refinement

Two fresh Sol contexts compared C with A without prior grades or a requested winner. The picture reviewer preferred A’s reading room on laptop/phone and C’s controls; the live reviewer preferred C’s discoverable connected-file lists and working touch pan. The live review initially suspected Escape failed, then corrected that claim through an exact retest showing dismissal and restored focus. Its low continuity grade reflected an immediate Back screenshot; root follow-up distinguishes a transient offscreen return from correct settled restoration.

| Dimension | Picture reviewer C / A | Live reviewer C / A |
| --- | --- | --- |
| Hierarchy and appeal | 7 / 8 | 8 / 7 |
| Reading | 7 / 8 | 8 / 8 |
| Controls and state | 8 / 6 | 8 / 6 |
| Continuity | 8 / 8, still states | 5 / 8, different navigation mechanisms |
| Relationship interpretation | 7 / 7 | 7 / 5 |

These results do not establish uniform improvement. Root refined the tradeoffs: recovered vertical reading space, narrowed row controls enough to preserve names, retained the new navigation and touch access, kept the returning identity visible during movement, and gave cycle labels the actual canonical dependency path.

## Refined comparison

Two further fresh Sol contexts compared the refined D build with A2. Both builds used identical current canonical graph data; A2 keeps the original UI implementation. The visual review inspected A2 then D; the live review used port 8901 then 8900, with private fresh desktop and phone contexts. Neither received earlier scores or a requested winner.

| Dimension | Visual A2 / D | Live A2 / D |
| --- | --- | --- |
| Hierarchy and appeal | 7 / 8 | 7 / 8 |
| Reading | 7 / 7 | 6 / 8 |
| Controls and state | 6 / 8 | 6 / 8 |
| Continuity | 8 / 8, still states | 7 / 8 |
| Relationship interpretation | 6 / 7 | 5 / 9 |

Both prefer D overall. The visual reviewer still sees a cost in initial phone/dense-card reading coverage from the added navigation. The live reviewer finds that cost worthwhile: the connection lists are discoverable, actual touch swipes reach the rest of the card, and the cycle menu supplies the complete three-file explanation. Neither review establishes a universally optimal layout or replaces the owner's eye.

The live reviewer correctly identified the service contract and method signatures, its seven dependencies, its three referring files, and the configuration-to-service reference. In D it could explain the full dependency cycle through the data context, while keeping static references distinct from runtime behavior. The same real touch swipe left the baseline's lower content unreachable in the map but exposed the candidate's lower rows and cycle control. Connected-file navigation and Back restored the expected subject after settling. Full keyboard traversal, physical devices, screen readers, other perspectives and long-session behavior were outside that review's coverage; targeted tests cover some of those separately.

A separate correctness review found no blocker. Its one concrete coordinate concern—comparing a post-layout title position to the previous frame—was corrected and given a browser regression. After the Back transition repair, a per-frame test sees the returning title throughout movement and checks the settled frame against entry; existing interrupted-motion and held-row tests also pass.

## First full gate and repairs

The first full `npm run safe:commit -- --e2e` gate finished on November 5 with 291 browser tests passing and two failing (39.5 minutes, one worker). All 1,570 unit and 115 integration tests, generation and documentation checks passed. All 15 source hashes remained unchanged under manifest SHA-256 `8bb913d0d0ef37673a100ae522b8fec797daa8f54c3c0fc9637b0498fd691b4c`. This is a failed gate, not final verification.

The growing-header case left the title at y=41.5 above the new frame top95 after pinning, throughout its five-second assertion poll. The [failure picture](../../../Screenshots/2026-11-04/learning/issues/full-gate-pin-header.png) preserves the observation. The resize handler compensates for header growth, but the continuing card animation omitted the layer-origin displacement and compensated it again. The repair includes that origin change in the animation's held anchor; the regression now explicitly establishes that the header grows during native movement. It fails against the old bundle and passes after rebuilding. All 20 focused reading/motion/competition checks and two path-header checks pass. Root's [repair pictures](../../../Screenshots/2026-11-04/learning/issues/README.md) and 80 sampled frames show the title remaining at least approximately 8 px below the frame edge. The source review found no remaining blocker.

The second failure was the estate five-file competition fixture's required adoption count. Its initial browser/model geometry agreed exactly and alignments were tried, but none was adopted. Trial inspection found all seven alignment candidates made the initial price worse, the closest by 94; the two additional seed trials were also rejected. Rejecting them is correct under the existing judge. The default fixture retains all agreement checks, and a second case uses the existing lower row-levelness setting (0.25). It adopts twice, with gains 23.75 and 44.75, reduces outline steps from 8 to 6, and lowers price from 42,875.25 to 42,806.75. All six focused simplicity cases pass, including exact browser/model geometry in the additional case. No judge, threshold or original agreement case was removed.

## Final verification

The second full `npm run safe:commit -- --e2e` gate passed: **1,570 unit tests, 115 integration tests and all 294 browser tests** (39.2 minutes for Playwright, one worker). Both previously failing cases pass, including the additional estate adoption case. Generation reports 925 unchanged Live Docs; lint validates all 925 with the existing 53 disconnected-file warnings. Build, lint, documentation-link enforcement and Markdown/asset/symbol audits pass.

All 16 source files match their frozen hashes before and after the run, with no additional changed source. Manifest SHA-256: `161158a29c5deb4e0b7e5b9bfbb72f8273796d2d41d51be3ad130b3b9cd13a29`. The final repair's dependency inspection reaches the same four consumers through three hops. The earlier failed gate and narrower checks above remain distinct evidence; none substitutes for this complete pass.
