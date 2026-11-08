# Skin defaults, Whole and the perspective handoff

_Status: root visual review accepted, November 8, 2026. Two full gates stopped at unit tests. After a pristine control reproduced the history timeout, two measured suites joined the existing isolated stage with all inputs/assertions/deadlines retained. The third full gate passed all 1,718 unit and 115 integration cases, and 328/345 browser cases; all new defaults, Whole and transition regressions passed, but 17 browser failures remain under investigation. This follows the [baseline review](../astra-review/README.md) and the [root's first builder round](../../../ChatHistory/2026/11/2026-11-08.1.record.md#root-review-and-the-first-builder-round); it does not imply owner acceptance or a passing full gate._

The builder captured these pictures in installed Playwright Chromium at 1440×960, based on `5b610371` with the candidate changes described below. The root personally inspected each PNG named here. Browser work was serialized with the root's review. The arrivals use fresh storage and normal layout search; the matched transition frames use a controlled browser clock to inspect the same phases in each direction. They are intermediate drawings, not settled 3D pictures.

## Fresh defaults and Whole

- [Estate Structure](estate-structure.png) and [Connections](estate-connections.png) show Skin and one hop without choosing them in Tuning. The files inside the skins are actually drawn, not inferred from the selected controls.
- [Repository Structure](repository-structure.png) and [Connections](repository-connections.png) show the same defaults on the full repository. Structure remains costly in the software renderer: this fresh capture reported 62.866 seconds to rest, Connections 19.696. These are individual observations, not a controlled performance comparison. The [repository readings](repository-readings.json) retain the settings, scene, counters and measurements.
- [Estate Whole](estate-structure-whole.png) shows all 36 filtered files and 18 directory hubs. With no hidden frontier, no collapsed cell remains. Turning Whole off restores the previous local membership and independent retention. The [estate readings](estate-readings.json) retain the measured journey; their Whole and return times are cumulative from that journey's start, not separate action durations.

The grouped-content count and legend remain known limitations: the footer counts individually exposed nodes and omits the many file marks visibly held inside skins. This round does not claim to resolve that presentation.

## The correspondence defect and the rejected first drawing

Portal contains six closed subfolders in the 2D journey. In Structure with Skin, Models and Pages have real cell hubs, while the other four directories are represented by their sole files. Before the repair, the scene capture omitted the cells and did not reveal/map the sole-file representatives. All six directory names vanished during the switch.

| Direction | Before correspondence repair | First repair, rejected visually |
| --- | --- | --- |
| 2D to 3D | [Missing directory names](portal-before-out.png) | [Names travel, but cells become solid amber disks](portal-amber-out.png) |
| 3D to 2D | [Missing directory names](portal-before-back.png) | [Pages' disk overlaps App_Code's name](portal-amber-back.png) |

The [before readings](portal-before-readings.json) and [first repair readings](portal-amber-readings.json) retain the label identities, opacity and positions. [The source geometry diagnostic](portal-2d-source.png) shows the six folder cards and two explicit files; its dim drawing is not being presented as a normal settled reading picture.

The identity repair captures real Structure cells, reveals already scoped sole-file representatives before capture, and uses canonical containment to match directories to those files in either direction. An exact file card wins over aliases, so two local identities do not create duplicate travelling destinations. The browser regression measures the six labels visibly moving toward and away from their actual projected counterparts; it fails on the saved old asset at App_Code's absent name and passes on the repaired candidate. The original bare-hub journey remains covered with explicit Off settings.

Root rejected the amber disks because a container should remain recognizable as a container. The next candidate projects the actual submitted skin boundary and contained-file marks once, then carries that frozen drawing through the existing transition. This also corrects the old radius proxy's sphere zoom resistance: the actual skins are unresisted. It introduces no new layout or physics.

## Root's normal-clock round trip

The root ran the vector-carrier candidate with an unmodified browser clock and normal layout search, waiting for 2D to settle before starting. [The source](portal-root-source.png) and [returned 2D picture](portal-root-back-rest.png) show the same six closed folders and two explicit files. Portal remains opened, and no file pin or selection is invented. No page error was reported.

| Stage | Into 3D | Returning to 2D |
| --- | --- | --- |
| Early | [Card folding](portal-root-out-1.png) | [Containers and names returning](portal-root-back-1.png) |
| Middle | [Named containers travelling](portal-root-out-2.png) | [Cards unfolding](portal-root-back-2.png) |
| Late | [Names fading near their destinations](portal-root-out-3.png) | [Graph-only wires lingering over restored cards](portal-root-back-3.png) |

[Settled 3D](portal-root-out-rest.png), [raw timing and identity readings](portal-root-motion.json), and [the recorded round trip](portal-root-roundtrip.webm) retain the full journey. The requested phases were 25%, 55% and 80%; the readings give the actual phase immediately before each capture. Screenshots take time, so these are normal-motion samples, not identical-frame comparisons. From the click through capture and settling, the outgoing journey took 9.930 seconds and the return 2.255 seconds in this run. Those are observations of this instrumented journey, not benchmarks.

Root accepted the vector shapes: Models and Pages remain recognizable as containers, their file marks survive, and the other folder identities travel to their sole files. The phase still gathers names closely near the 3D destination while fading them; this is not a claim that the entire transition is collision-free. The complete return also exposed a separate visibility defect: graph-only wires remained over the nearly restored 2D cards, then vanished at handoff. The following correction addresses that defect.

## Accepted corrected journey

The capture now reads only the renderer's submitted visible links. A real source 2D wire keeps its folding bridge; graph-only relations fade with the existing 3D-side phase. The carrier also retains native global file/balloon/skin drawing order and the pending-hull balloon distinction. There is no new layout, routing or transition timing.

Root repeated the complete journey on this corrected build with the normal clock and normal layout search, inspected all nine new PNGs, and accepted the result for the full gate. The source [2D picture](portal-final-source.png), [settled 3D](portal-final-out-rest.png), and [returned 2D](portal-final-back-rest.png) show the unchanged retention. The [final readings](portal-final-motion.json) report no page errors, the same opened Portal directory and no invented file pin or selection. The measured outgoing and return journeys, including captures and settling, were 9.039 and 2.124 seconds; they are not controlled comparisons to the preceding run.

| Stage | Into 3D | Returning to 2D |
| --- | --- | --- |
| Early | [Folding](portal-final-out-1.png) | [Containers returning](portal-final-back-1.png) |
| Middle | [Visible identities and file marks](portal-final-out-2.png) | [Unfolding](portal-final-back-2.png) |
| Late | [Arrival](portal-final-out-3.png) | [Restored cards without stray wires](portal-final-back-3.png) |

[The corrected round-trip recording](portal-final-roundtrip.webm) preserves the motion. The browser regression compares painted Models file marks and its boundary against the actual uploaded geometry and colors, independently of the production projector; it also verifies an empty transition canvas late in this return, where no source 2D wire exists.

## Capture cost and its limits

The [raw capture measurements](capture-cost.json) use separate fresh contexts at 1440×960, first loading settled Structure in 3D, switching to 2D and back. The estate has Portal opened; the repository uses the unselected root start. These measurements set 2D Search Starts to zero to isolate capture/render work; the root's two visual journeys above leave normal search enabled.

| Scene | Body capture into 2D | Body capture into 3D | Observed click to transition, into 2D / 3D |
| --- | ---: | ---: | ---: |
| Estate, Portal opened | 9.4 ms | 13.2 ms | 676 / 384 ms |
| Repository, root start | 143.8 ms | 134.1 ms | 1,420 / 1,290 ms |

The body capture is a real synchronous cost. The larger observed waits include existing asynchronous card copies (262/246 ms on the estate, 734/819 ms on the repository), rendering and browser observation; they are not all blocked main-thread time. Transition drawing setup was 10.7/5.8 ms and 27.0/12.5 ms respectively. No multi-second body-capture stall appeared in these runs. These are individual measurements of the stated subjects, not a general performance guarantee or a matched comparison to the preceding session's different subjects.
