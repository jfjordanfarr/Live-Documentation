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
