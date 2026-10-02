# Explorer pictures, October 2, 2026

_Historical evidence from the built Explorer after the Force Graph focus repair. Captured at 1600×1000 over the repository's 602-file graph. The [session record](../../ChatHistory/2026/10/2026-10-02.1.record.md#turn-2) separates the production repair from the disposable journey experiment._

| Capture | What it shows |
| --- | --- |
| [File focus](force-graph-focus-first.png) | `graph.ts` centered from a requested URL, with its projected label. |
| [Search focus](force-graph-document-focus.png) | `document.ts` after search, with the documentation panel closed. |
| [Native journey](force-graph-journey.webm) | URL focus, a click on the actual sphere, Local Map and return, manual pan, another view round trip, and search for a different file. |
| [Motion frames](force-graph-motion-frames.png) | Chronological frames from that recording: top row at 1.0, 1.2, 1.4 and 1.6 seconds; bottom row at 10.7, 10.9, 11.1 and 11.3 seconds. These expose the approach and another selection, including occlusion by other spheres during the initial flight. |

The camera approaches along the current viewing direction; it does not solve collision-free flight through the graph. The projected label identifies the selected file during the approach. Direct pointer/wheel navigation interrupts automatic tracking, and the settled manual camera survives a view round trip. Four Playwright regressions exercise URLs, the actual sphere's identity, search, filtering, resizing, manual return and reduced motion over the estate. A separate pure geometry suite tests the viewing-direction calculation.

The full verification chain passed 998 unit, 49 integration and 73 Playwright tests. The [probe record](../../Probes/2026-10-02/journey.md) contains the experimental docking and routing evidence; those pictures are not changes to the shipped Explorer.


## Native Force Graph check during the live review

[Assets and related documents enabled](native-force-overlays-review.png) was captured read-only through the owner’s port-8899 server during [Turn 7](../../ChatHistory/2026/10/2026-10-02.1.record.md#turn-7). Purple documentation nodes are present in the shipped renderer; the probe omitted that overlay. This is a diagnostic view around `graph.ts`, not a matched recreation of the owner’s whole-graph picture of the older deployed build or proof that every historical reference survived. Browser status was 200 with no page errors. No product source changed for this capture.

## Native branches and perspective continuity

The [approved native-view pass](../../ChatHistory/2026/10/2026-10-02.1.record.md#turn-8) repairs sample roles and manifest references, extends the existing Local Map, and connects it to the existing Force Graph. These are production views, not the earlier disposable reading-strip probe. Final UI captures use the 609-file repository graph at 1600×1000; the earlier data-only capture uses 606 files.

| Capture | What it shows |
| --- | --- |
| [Restored Rosetta hub](native-rosetta-restored.png) | The repaired catalog as a gray asset connecting sample branches, with blue implementations and purple related documents. All 21 compiler comparison reports remained exactly equal after path rebasing. |
| [Native starting point](local-native-before-pins.png) | The existing Local Map around TypeScript Rosetta's helpers, with its native cards and symbol grammar. |
| [One symbol pin](local-native-one-pin.png) | `format` retained independently; connected files show their relevant rows and counts for undisclosed content. |
| [A retained branch](local-native-branches.png) | Pinning the processor retains the helpers pin, reveals its neighborhood and draws inter-neighbor references. Skipped ranks take exterior routes. The clicked processor remains in place while its surroundings change. |
| [Native Force Graph](native-perspective-graph.png) | The same processor in 3D, at the same screen anchor. Unrelated nodes and connections fade; the graph retains its actual colors and full data. |
| [Return to Local Map](native-perspective-return.png) | Both pins and the selected identity survive the return. |
| [Recorded journey](native-branches-journey.webm) | Pin a helper symbol, retain the processor, switch to the native Force Graph and return. |
| [Transition frames](native-branches-motion-frames.png) | Top row: 2.60, 2.85, 3.10 and 3.35 seconds. Bottom row: 5.90, 6.15, 6.40 and 6.65 seconds. The selected identity stays at the right-hand anchor during the fades. |

The final capture reported no browser errors. Before and after the round trip, the processor title rectangle was `(1220.008, 567.5, 335.656, 15)` pixels; the 3D projection was `(1387.84, 575)`, its center. Browser regressions also sample the anchor during the transition, exercise independent symbol branches and a real neighbor-to-neighbor connection, reload/history, keyboard controls and reduced motion. Camera regressions click the actual sphere while the simulation is running and verify that a settled manual pan survives a view round trip.

This remains a view of the disclosed neighborhood: outside-reference counts include category-filtered endpoints, and long or cyclic connections take exterior routes. Dense branches can extend beyond the viewport and require pan/zoom. The World Map's scope semantics were not redesigned in this pass.

The final interaction review also captured [a referenced type opened from its source pin](native-type-reference-detail.png) and [the estate path opened into branches](native-path-to-branches.png). A type badge first pins its source symbol and then inspects the referenced file, so the next perspective uses that detail target. Pinning within an explicit path clears the old path result when it discloses branches; the clicked row stayed at `(330.780, 563.695)` pixels while the toolbar shrank. The path inputs remain available to ask that question again. Both interactions have browser regressions.

Final verification of the completed pass: `npm run safe:commit -- --e2e` passed **928 unit, 50 integration and 78 browser tests**, with zero broken Markdown links. The original 35 JSDoc warnings remain. The fast sphere-click regression additionally passed ten independent cold starts.
