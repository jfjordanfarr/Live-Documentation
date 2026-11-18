# Zoom composition and directory opening — November 9 UTC

_Historical observations during the November 8 dev-day chat, responding to [Turn 2](../../../ChatHistory/2026/11/2026-11-08.1.record.md#turn-2) and the [reading-control clarification](../../../ChatHistory/2026/11/2026-11-08.1.record.md#turn-3-additional-reading-feedback-during-the-review). The zoom and pop are the committed product at 54f90f80; the reading-control pictures are the candidate reviewed before integration. Three zoom appearances are a proposed trial, not an adopted redesign._

The root drove ordinary button/wheel, book, link and directory actions in Chromium at 1440×960, DPR one. Initial layout search was allowed to finish and normal preferences remained enabled. No camera/scene freeze, route substitution or modified clock was used. [Source provenance](source-provenance.json) distinguishes main and the reading candidate. Root viewed the representative middle/overview frames and reading/pop pictures discussed below; the complete recordings are preserved, not claimed as a frame-by-frame video review. The integrated browser was first opened at its actual 1094×683 viewport; its screenshot tool returned no image payload to this runner, so these controlled local captures supply the visual evidence.

## What makes the zoom feel busy

Five content bands and eleven held-size states currently overlap. Every zoom button advances one size state, while the broad content band may change on that press or elsewhere during wheel motion. File-name wrapping, control placement, symbol text and content disclosure can therefore change separately. On the estate, the subject's exact header plans are:

| Presses out | Band | Drawn name | Picture |
| --- | --- | --- | --- |
| 2 | middle | PaymentService.cs | [Frame](estate-out-02.png) |
| 3 | middle | PaymentService / .cs | [Frame](estate-out-03.png) |
| 4 | middle | Payment / Se… | [Frame](estate-out-04.png) |
| 5 | far | Payment / Service.… | [Frame](estate-out-05.png) |
| 6 | far | Payment / Servi… | [Frame](estate-out-06.png) |
| 7 | overview | Payment / Service / .cs | [Frame](estate-out-07.png) |
| 8 | overview | Payme / nt / Service / .cs | [Frame](estate-out-08.png) |

The [repository at middle scale](repository-out-04.png) keeps its public names large while the Internals label shrinks and names truncate beside empty description space. At [overview](repository-out-07.png), rows disappear and filenames become the main reading surface, including an isolated extension. These pictures support the owner's observation of repeated unexpected recomposition; they do not establish a regression against an unbuilt month-old version.

The [real wheel readings](root-review.json) contain 192 samples and 54 different camera scales. One observed crossing reaches step five while still in the middle band, displaying “Payment / …”; 37 ms later the far band at that same size state displays “Payment / Service.…”. The camera eases while these discrete choices change. The wheel observer reads actual text-child transforms. The earlier button-run JSON font estimates measured the label button, omitting its transformed child, and are explicitly disqualified as rendered-font measurements; their recorded header strings, bands, geometry and pictures remain valid. These instrumented journeys are not performance benchmarks.

Root recommends comparing three complete compositions—reading, connections, overview—with the whole card scaling between rare state changes. That trades some intermediate text size for a steadier composition. Important design constraints remain: meaningful direct actions, recognizable names, honest hidden-content indications and independent shareable reading choices. No new breakpoints, font policy, row aggregation or layout repacking is selected by this report.

## Reading choices in the candidate

The root independently used the restored books to [fold all prose](root-reading-none.png) and [retain one description](root-reading-subset.png), then opened the resulting address in a fresh recipient context. The pinned reading-state subject remains 290×693 map units with a whole-card fold and an exact-symbol open override. A [reader link to chooseReading](root-symbol-reader.png) puts that canonical heading at the top of the same file reader. No page errors occurred. This is the bounded reading repair, distinct from the proposed zoom redesign; the builder's separate evidence covers reload, Back, empty slots, compact-neighbor disclosure and same-name symbols.

The final root pass after the in-place refresh again shows [none](root-final-reading-none.png), [one description](root-final-reading-subset.png) and the [exact reader heading](root-final-reader.png). Root viewed all three. [The observations](root-final-reading.json) preserve identical map-unit dimensions and row order, all nine card/row identities, unchanged search counters and keyboard focus after both book actions, with no page errors. The actual served client hash is recorded there. Its [script](reading-final.mjs.gz) ran through the TypeScript import loader; the first plain-Node invocation stopped at module resolution before opening a browser. The earlier fresh-recipient share journey and the builder's independent regressions remain separate evidence.

## Final links on main

After the complete gate passed, root opened all four [handoff links and their recorded states](../../../Probes/2026-11-09/reading-verification/teaching-links.json) in fresh recipient contexts on main8900 and viewed the resulting [controls](teaching-controls.png), [subset](teaching-subset.png), [none](teaching-none.png), [exact new helper in the reader](teaching-textRefresh.png) and [map after closing it](teaching-textRefresh-closed.png). Every address carries its intended whole-file pin, and there are no page errors. Card Text remains a local preference; the shared links carry the reading choices in either composition.

The first scratch script incorrectly waited for background search completion while the full reader was open. Source inspection confirms that full reading deliberately pauses that search. The corrected [script](teaching-links.mjs.gz) checks the exact reader heading first, then closes it and verifies that the search resumes from zero tried to sixteen/settled. This is a corrected observation procedure, not a product or gate change. In the JSON, state and heading describe the initial linked view, while `pageUrl` records the final URL after the journey, including closing the reader in that one case.

The controls picture also retains a separate visible nit: raw JSDoc `{@link ...}` text in some canonical summaries. This round does not reinterpret those source-doc tokens or claim to fix all on-card typography.

## Directory opening

The estate [before opening PaymentService](root-pop-before.png), [first captured movement](root-pop-0.png), [later movement](root-pop-2.png) and [settled result](root-pop-settled.png) show files spreading out while much of the surrounding picture also changes. The complete captured opening reaches rest in 6.752 seconds, including screenshot work. Recorded frame times are 306, 642, 1,063, 1,709 and 2,735 ms after activation; these are actual capture times, not claims of precisely scheduled frames. Source inspection separately confirms concurrent camera following and fitting on an opened directory. The camera's and force field's visual contributions have not been measured separately.

Root's recommendation is to compare the opening as a complete journey before changing damping or forces. The owner's observation that a pin exposes bare directory junctions is retained; this review does not reject Structure bags or propose wrapping already exposed children again.

## Complete captured sequences

[Repository recording](repository-roundtrip.webm), [estate recording](estate-roundtrip.webm), [reading/wheel/pop recording](root-review.webm). [Repository observations](repository-readings.json), [estate observations](estate-readings.json), [root review observations](root-review.json).

The original [button-journey script](zoom-journey.mjs.gz) and [root wheel/reading/pop script](root-review.mjs.gz) are preserved losslessly with [source hashes](capture-scripts.json). These are source captures: their relative imports refer to the original `AI-Agent-Workspace/tmp/2026-11-09-zoom-review/` location, and their ports identify the builds recorded above.

| Direction and press | Repository | Estate |
| --- | --- | --- |
| out, 0 | [Frame](repository-out-00.png) | [Frame](estate-out-00.png) |
| out, 1 | [Frame](repository-out-01.png) | [Frame](estate-out-01.png) |
| out, 2 | [Frame](repository-out-02.png) | [Frame](estate-out-02.png) |
| out, 3 | [Frame](repository-out-03.png) | [Frame](estate-out-03.png) |
| out, 4 | [Frame](repository-out-04.png) | [Frame](estate-out-04.png) |
| out, 5 | [Frame](repository-out-05.png) | [Frame](estate-out-05.png) |
| out, 6 | [Frame](repository-out-06.png) | [Frame](estate-out-06.png) |
| out, 7 | [Frame](repository-out-07.png) | [Frame](estate-out-07.png) |
| out, 8 | [Frame](repository-out-08.png) | [Frame](estate-out-08.png) |
| out, 9 | [Frame](repository-out-09.png) | [Frame](estate-out-09.png) |
| out, 10 | [Frame](repository-out-10.png) | [Frame](estate-out-10.png) |
| back, 7 | [Frame](repository-back-07.png) | [Frame](estate-back-07.png) |
| back, 5 | [Frame](repository-back-05.png) | [Frame](estate-back-05.png) |
| back, 4 | [Frame](repository-back-04.png) | [Frame](estate-back-04.png) |
| back, 2 | [Frame](repository-back-02.png) | [Frame](estate-back-02.png) |
| back, 1 | [Frame](repository-back-01.png) | [Frame](estate-back-01.png) |
| back, 0 | [Frame](repository-back-00.png) | [Frame](estate-back-00.png) |

Additional root captures: [first wheel movement](root-wheel-out-first.png), [second wheel movement](root-wheel-out-second.png), [wheel return](root-wheel-return.png), [pop frame1](root-pop-1.png), [pop frame3](root-pop-3.png), [pop frame4](root-pop-4.png).
