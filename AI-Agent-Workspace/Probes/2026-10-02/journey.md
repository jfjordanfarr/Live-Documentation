# Overview, interfaces and return

_Design experiment begun October 2, 2026, under [Turn 2's approval](../../ChatHistory/2026/10/2026-10-02.1.record.md#turn-2). This is not an adopted Explorer architecture._

## Question and predictions, before the comparison

Can the same selected file remain recognizable while a force overview makes room for readable interfaces, multiple branches are retained, and the overview returns? The prior handoff's native cards, explicit evidence and pins are the baseline. The new variable is a live three-dimensional overview occupying the main surface and then a context slot, with its layout and camera retained.

Expected benefits: readable cards keep the Local Map's interface grammar; a persistent overview supplies location without requiring simultaneous detail for every neighbor; retained pins survive changes of presentation. Expected costs: a small overview loses readable names, full cards still require travel, a 3D overview can occlude relationships, and simultaneous camera movement and docking may be hard to follow. These are hypotheses to inspect, not score targets.

The matched repository case retains `document.ts`, `graph.ts`, `graphFiles.ts`, `staticExplorerData.ts` and `staticBuilder.ts`. The estate provides a second case around `PaymentService.cs` and the gateway/hub/contracts chain. At both loci: enter from an overview, follow a dependency, retain a second branch, inspect a connection between retained neighbors, change directory scope, recover the prior state and return to the overview. Explicitly count the raw references among retained files; those counts are not interchangeable with aggregated Explorer line counts.

Routing alternatives preserve that same reference set: fixed outer lanes and behind-card paths with foreground pin ends. Bundling alternatives share a lane by file pair or directory pair, with member counts and evidence. A shared segment must not invent connections between its different members. These controls are experimental variables; no default selected here is a product decision.

Truthfulness, reachability, effort/orientation and preference are separate observations. The [research note](../../Research/2026-10-02-graph-readability-and-aesthetic-measures.md) explains why geometry alone cannot settle them. Inspect the actual moving transition, retained identity and camera, rapid reversal, reduced motion and the return journey. Only then write regressions for observed correct behavior.

## What was built and inspected

The disposable page is `AI-Agent-Workspace/tmp/probes/2026-10-02/journey/`, built by `build.cjs` and hosted by `serve.cjs 8884`. It reuses the [October 1 handoff](../2026-10-01/handoff.md)'s native file cards, symbol pins, evidence, history and World Map context. Its new force overview holds one live scene while the enclosing surface docks beside the cards. Selecting a file in the overview first approaches it, then reveals its interfaces. Overview and Read switch presentation without rebuilding that scene. The file browser, named retained-card tabs and explicit Locate/Fit controls provide other ways to reach a subject.

The Folders control aggregates child directories in the overview. Folder spheres stand at the mean position of their members; their names show file counts and their hover text states internal-reference counts. The underlying member lists are retained. Collapsing fits the aggregate view; unfolding restores the prior camera and original file coordinates. Opening a folder changes scope, and Back recovers the prior exploration. This is an aggregation experiment in the overview, not a folder-card replacement for Membrane.

The routing controls apply to exactly the same retained cards and raw references. File and directory bundling here mean shared outer lanes by endpoint pair. Counts open their exact members; sharing a lane does not introduce cross-connections between unrelated members. Behind-card routing uses visible foreground ends at each pin. The two route styles have different tradeoffs, and bundling is disabled when the behind-card style is selected because that combination is not implemented.

Final captures use the repository's 602-file bundle and the 35-file estate. Repository: five retained files, 40 pins, 24 raw references in all four variants. Estate: five retained files, 21 pins, three raw references among them. That estate subset is sparse; it must not be presented as an equally dense stress test. An additional journey keeps those selections while opening `Gateway/Web.config` and `Hub/App.config`, bringing the displayed set to seven files and seven references, then opens the configuration evidence.

## What the pictures and movement reveal

- The interface rows remain readable, but only part of the five-card set fits at once. Tabs and scrolling recover the rest; the overview does not turn offscreen symbols into simultaneous detail.
- Shared lanes reduce the number of distinct upper routes, but can turn a short adjacent connection into a trip up to the lane and back. This is visible in the file/directory alternatives, regardless of any crossing count.
- Paths behind cards leave more empty space around interfaces while concealing part of their course. Foreground pin ends and evidence identify relationships; the interrupted visible route is a real cost.
- The same force scene visibly contracts into the context slot and expands on return. The inspected frame sequence preserves its recognizable constellation. Its opaque surface temporarily covers some emerging cards. Whether that motion helps the owner keep their bearings remains a human judgment.
- The small overview cannot carry all file names. A tightly focused camera also made the first collapsed-directory attempt nearly empty; fitting on collapse and restoring on unfold made the grouping inspectable. The mean-position grouping is a simple experiment, not a general solution to directory placement.
- Two context maps consume sidebar space. This probe retains the prior World Map thumbnail to keep that cost visible. The broad desktop review does not establish phone usability or select a production view architecture.

## Retained evidence

| Capture | What to inspect |
| --- | --- |
| [Initial overview](journey/01-overview.png) | The full repository force scene before reading. |
| [Outer lanes](journey/02-lanes-none.png) | Five retained files; the window is positioned at `graph.ts` while `staticBuilder.ts` remains selected. |
| [Lanes by file](journey/02-lanes-file.png) | The same state, with member counts and longer routes for some adjacent references. |
| [Lanes by directory](journey/02-lanes-folder.png) | The same state, aggregating lane membership by directories. |
| [Behind cards](journey/02-behind-none.png) | The same facts and pins, interrupted visible routes and foreground pin ends. |
| [Collapsed directories](journey/04-folded.png) | Named repository groups at their members' mean positions. |
| [An intermediate frame](journey/05-transition.png) | The overview surface moving across the emerging reading surface. |
| [Returned overview](journey/06-return.png) | The same scene and camera after the round trip. |
| [Motion frames](journey/motion-sheet.png) | Chronological samples from the recording: 20.0, 20.2, 20.4, 20.6 seconds, then 21.6, 21.8, 22.0, 22.2 seconds. |
| [Recorded journey](journey/journey.webm) | Selection, five retained pin sets, route alternatives, evidence, directory collapse and the moving handoff. |
| [Estate retained files](journey/estate-final-reading.png) | The sparser five-file estate case at the final reading position. |
| [Estate directories](journey/estate-folders.png) | The same aggregation mechanism over the estate. |
| [Cross-system configuration](journey/estate-cross-system.png) | The gateway configuration using the hub endpoint, alongside retained branches. |
| [Its evidence](journey/estate-cross-system-evidence.png) | The documented configuration basis, rather than an invented runtime call. |

The [gallery sheet](../../Gallery/sheets/graph-ts-journey-routes.png) compares the four route alternatives at the same state. The [production screenshots](../../Screenshots/2026-10-02/README.md) separately document the Force Graph focus repair.

## Verification and limits

After looking at the first pictures and correcting the initial fit, faint links, hidden bundle counts and collapsed-directory framing, browser checks passed over both datasets. They verify canonical reference membership in each route variant; nonempty paths and foreground ends; exact pin, camera and original-coordinate restoration; complete accounting of internal and inter-group references under directory aggregation; evidence opening the source Live Doc; directory Back; reduced motion; rapid reversal; and dataset switching.

An additional browser walk follows the actual connection-list controls from `graph.ts` through `document.ts`, `graphFiles.ts`, `staticBuilder.ts` and `staticExplorerData.ts`, retaining both branches and opening the latter’s `LiveDocGraph` reference. It ends with the same 40 pins and 24 raw references; this checks the exploration controls independently of the search-based comparison setup.

The final motion sample contains 33 frames and 23 distinct surface scales, with exactly the same camera in every sample and after return. Frame extraction and visual inspection accompany that mechanical check; neither constitutes an owner verdict. The native camera approach can pass behind other spheres, as its retained motion frames show. No collision-free camera path is claimed.

Two test failures corrected during development are worth preserving. The capture script initially used the wrong `staticBuilder.ts` directory; the actual file is under `shared/`. A later assertion assumed both five-file subsets contained more than ten references. Reading the canonical graph established 24 and three respectively; the check now asserts those explicit cases, and the estate cross-system journey is separate. Neither correction changes the input facts.

The production focus repair passed the full `npm run safe:commit -- --e2e` chain: lint with zero errors and 35 existing JSDoc warnings, build, 998 unit tests, 49 integration tests, generation/lint of 602 Live Docs, documentation/asset/heading audits and 73 Playwright tests. The first full run failed on import ordering and unresolved Three.js types; the corrected run declares the already-used runtime directly and supplies its matching declarations. No check was disabled.

The initial overview picture was refreshed after ensuring that unselected nodes begin at full brightness and pinning fades the others. The matched pinned-state route pictures retain their previous styling. The hosted build includes the production focus repair committed as `8fd76252`.

The experiment remains disposable. No existing renderer was replaced, no composite score was introduced, and no visual preference has yet been supplied by the owner.
