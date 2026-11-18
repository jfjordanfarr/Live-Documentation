# Current-build aesthetic review — November 10, 2026

Historical review of product source at `291a6c0c` (last product change `add3a341`), requested in [today's root conversation](../../../ChatHistory/2026/11/2026-11-10.1.record.md#turn-1). Root judgment, not owner acceptance. The original review made no product changes; the follow-up below records the subsequent label-clearance correction.

The weakest part is the middle of the 2D zoom journey. Close reading and the file-level overview each have a recognizable job; the intervening picture spends too much room and attention on controls while losing names. The closed Structure overview is worth protecting. Opening a group needs a more coherent transition and clearer emphasis on the contents just revealed.

## What was actually inspected

Root rebuilt the main and estate static bundles, then drove fresh Chromium contexts at **1440×960, DPR one**, with default preferences, normal layout search and ordinary clocks. The scripts use the real share codec and actual zoom/book/perspective/directory controls. No frozen simulation, injected styles, disabled search or modified product assets were used. Both clients match the final tested JavaScript SHA-256 `7e1654311f63245fb1926c2202d03e6e67b6a1f64240e2a0875e2338c5d7ae48`. All recorded journeys report no page errors.

The main subject is symbolAnchors, retained whole; it was read with all descriptions, none, and a chosen description, then zoomed out eight presses and back. The estate subject is PaymentService, retained whole, on the same outward/return journey. Structure starts at the estate root, opens PaymentService, changes to 2D and back, and then changes to Connections. Root inspected the named pictures below and successive opening frames; the complete recordings are preserved, without a claim to have watched every video frame. This is a desktop review, not a phone, large-estate or performance certification.

[Source/build hashes](source.json), [main observations](main.json), [estate observations](estate.json), [opening observations](structure.json), [corrected perspective observations](transition.json). The two 2D journals record each observed title plan and camera/card bounds. These are observation scripts, not new regression tests.

## Close reading: useful control, an uneven composition

[All descriptions](main-reading.png), [none](main-folded.png), [one](main-subset.png) show that the restored books offer a useful choice. In this journey all three frames have the same subject bounds, approximately 577×692 screen pixels, and search remains settled. Returning from eight zoom-out presses restores the same subject bounds. That predictable geometry is worth preserving.

The all-text card is readable and recognizably explains one file. The folded card exposes the visual price of its fixed slots: it resembles an empty form with separated blue bars. On the [estate reading card](estate-reading.png), absent file/method prose similarly leaves generous blank areas while the class summary is cut after two lines. This does not justify undoing the owner's fixed-box rule or inventing text. It means the composition still needs to work when only a few slots contain prose.

Whole-file retention also gives every row a blue border and gives the whole card a substantial glow. To my eye these repeat the same emphasis and compete with the wires. A quieter retained state is worth comparing after the zoom composition is coherent; it is not a selected style change.

## Middle zoom: the first design target

The [main middle view](main-out-4.png) keeps public rows and several controls large, but truncates normalizeSymbolIdentifier and tryBuildNormalizedKeyFromAnchorKey, with unused description room below each. Internals becomes much smaller than those rows and controls. A row carrying meaningful incoming connections should not become visually negligible while its neighbors retain prominent menus and pins.

The estate shows the same competition particularly clearly. At [three presses](estate-out-3.png) PaymentService's class name becomes “Paym…”. At [four](estate-out-4.png), the same row reads “P…” beside Book, Pin and More, and the file title strands `.cs` on its own line. At [five](estate-out-5.png), fewer controls leave the name more room again. The reader has to identify the same thing repeatedly while merely moving away from it.

This is a priority problem, not just an unfortunate break in one title. The complete connections composition should decide which names and controls earn its available room. Preserve a useful direct action surface, meaningful symbol names and Internals together; a collection of individually held sizes has not made those parts agree.

## Overview: good wiring, strained names

The [main overview](main-out-7.png) and [estate overview](estate-out-7.png) make file-to-file direction easier to follow. Gathering symbol detail into file-level wires serves a clear purpose. That success is separate from the lettering: `symbolAnchors / .ts` and `Payment / Service / .cs` look accidental. At [the next estate step](estate-out-8.png), the title becomes `Paymen / tService / .cs`, and other filenames also break inside words.

The held type is now too large for the width of some receding cards, while their empty lower area cannot supply horizontal room. More local truncation patches are unlikely to produce a coherent zoom journey. I support the previous root's proposed comparison of **reading, connections and overview** as complete appearances, with ordinary proportional scaling between them. Three is a trial count, not a newly accepted requirement. The comparison must keep exact pins, shared reading choices and card geometry, and show outward motion and the return on the same subjects.

## Structure: retain the cells, improve the opening

The [closed estate overview](structure-closed.png) is the strongest composition here. The nested, translucent bodies make relative group size and membership apparent before reading each label. Their spacing is useful and the picture is inviting. Replacing that with bare spheres would lose an already valuable distinction.

The same picture also confirms an existing presentation defect: the footer says **1 of 36 files shown** while many file marks are visibly inside the containers. The legend's uniform-folder size description does not explain those differently sized containers. Counts and keys should explain the picture a person is actually seeing.

Opening PaymentService produces a much harder change. Compare [357 ms after activation](structure-opening-0.png), [687 ms](structure-opening-1.png), and [settled](structure-open.png). Its children spread apart while the surrounding groups enlarge and move substantially, taking several previous landmarks outside the frame. The settled picture is easier to follow than the opening, but the exposed files and their names are very faint beside the still-bright bags of contextual files. The visual emphasis pulls away from what was just opened.

The recorded opening reached the observed settled capture after about seven seconds, **including screenshot work**; this is not a performance benchmark. The samples establish the visible sequence, not the independent contribution of each camera/physics mechanism. A useful next comparison should keep the initial bag and its children recognizable through the move, then evaluate whether reframing and relaxation should happen together or in a different sequence. No force or camera policy is selected by this review.

## Perspective return and Connections

The corrected [2D directory return](structure-to-2d-settled.png) contains Data and the three expected file cards, and the [return to Structure](structure-return-settled.png) keeps the opened directory. It preserves context, though the compact 2D cards spend much of their space on blank interiors and metadata. The [Connections view](connections-settled.png) makes the data-related neighborhood visible, but bright expansion rings and some bags attract more attention than nearby faint file names. That remains part of the mixed-picture readability question.

The first capture procedure used Local Map settling alone. Its [early 2D picture](structure-to-2d.png) actually contains the travelling 3D carrier: the perspective animation had not ended. Root caught this visually, then repeated the journey waiting for the transition to appear and disappear before waiting for destination settling. The first run's `structure-return` and Connections capture are likewise not used to establish a completed round trip. [Corrected observations](transition.json) record zero transition overlays at each final capture. This is a corrected observation procedure, not a claimed product repair.

## Suggested order

1. Compare complete 2D zoom compositions, beginning with the middle view's names, controls and Internals; protect the useful reading and overview endpoints.
2. Compare Structure opening as a full motion sequence, including camera movement, landmark retention and which contents remain legible.
3. Repair the grouped-content count/key discrepancy, and then revisit repeated emphasis and sparse-card presentation within the chosen composition.

The broader newcomer/share journey remains the product horizon. These local changes should make it easier to identify a subject, understand its surroundings and carry that understanding between views.

## Recordings and reproducibility

[Main zoom/reading journey](main-journey.webm), [estate zoom journey](estate-journey.webm), [opening and initial capture attempt](structure-journey.webm), [corrected perspective journey](transition-journey.webm). Unlisted intermediate PNGs were removed after this review; the complete observations and recordings retain the sequences.

The three original scripts are preserved losslessly as [2D review](review.mjs.gz), [Structure opening](structure.mjs.gz) and [corrected perspective capture](transition-check.mjs.gz). Their relative imports resolve from their original `AI-Agent-Workspace/tmp/2026-11-10-review/` location. They import the existing layout-settling helper; the corrected perspective script additionally waits for the actual transition lifecycle. [Capture manifest](captures.json) supplies their hashes and those of the retained evidence.

## Follow-up: rings beside the bags

The owner [noticed rings beside Hub, Gateway, PaymentQuery and PaymentRequest](../../../ChatHistory/2026/11/2026-11-10.1.record.md#turn-3) at the end of the transition recording, apparently after rewrapping. The recorded sequence actually ends by switching to **Connections**, with PaymentService still open; it does not issue Close. That distinction explains a change in grouping, but does not make the picture's ambiguity acceptable.

Root reproduced the exact ending, then separately opened and closed the groups through ordinary controls. [The uploaded identities and closure sequence](rings/replay.json) show:

| Apparent identity | Actual object at the ending |
| --- | --- |
| Hub · 3 | A three-file bag. Its label touches the ring of PaymentResult. |
| Gateway · 3 | A three-file bag. Its label covers the ring of Hub/App.config. |
| PaymentQuery and PaymentRequest | Actual ringed files, each with three additional connected files outside both the visible graph and its bags. |

The three remaining neighbors are IPaymentHub, PaymentsController and HubProxy. Each is the only hidden file in its directory bucket at Shell Depth two, so the current grouping rule does not make a one-file bag. Rings continue to report that omitted connectivity. This is the current experimental directory grouping, not a newly accepted final design.

Structure Close [restores the original six bags](rings/structure-closed-again.png), with no rings. The separate [Hub rewrap](rings/connections-Hub-rewrapped.png) and [Gateway rewrap](rings/connections-Gateway-rewrapped.png) restore those bags and the original five ring owners. Their positions may change as the physics settles; this is membership/representation preservation, not a claim of an identical arrangement.

The [ending picture](rings/recording-ending.png) and [Gateway hover](rings/hover-Gateway.png) expose a real label-placement defect. Gateway's label rectangle contains Hub/App.config's ring center, with a ring outer radius of 17.762 px. Hub's label reaches 0.307 px into PaymentResult's outer ring. Placement uses sphere radii and only named candidates as body obstacles, while the renderer draws rings to 1.6 times the sphere radius. Unnamed visible spheres disappear from the label obstacle set altogether. These measured mismatches make a bag's label appear to identify another file.

The bounded candidate now uses the renderer's shared outer-ring extent and separates visible-body obstacles from eligible names. Name-disclosure thresholds, priority ordering, remembered-side reevaluation and body-free popped-directory captions retain their existing meanings. The [before ending](rings/before-connections-ending.png) and [corrected ending](rings/after-connections-ending.png) keep all nine visible names and identical ring geometry/ownership; Hub clears PaymentResult's ring by 29.382 px and Gateway clears Hub/App.config's by 27.512 px. Root inspected that pair, the [larger repository before](rings/before-main-structure-start.png) and [after](rings/after-main-structure-start.png), and the compact [comparison](rings/comparison.json). The repository retains its four visible names; its own newly documented interfaces change its reference facts, so no whole-image equality is claimed there.

Root independently repeated ordinary opening/closing and the exact perspective sequence on the candidate. All [eight candidate states](rings/root-replay.json) retain the baseline's ring owners, wrapper identities, opened directories and pins, with no page errors. Root inspected the [ending](rings/root-recording-ending.png) and [Gateway rewrapped again](rings/root-connections-Gateway-rewrapped.png), then accepted the correction for browser protection and complete verification. Eleven pure cases and the build pass at the first handback.

The final browser regression retains the exact nine names and five ring owners at both the recorded ending and Gateway rewrap, reading actual uploaded ring geometry independently of label-placement inputs. It passes the candidate in 41.0 seconds. The identical test fails the original client over the same estate data at its intended clearance assertion: alongside Hub and Gateway, PaymentQuery and PaymentRequest each overlap their own outer ring. The candidate's minimum label/ring clearance is 7.000006 px at the ending and 7.000001 px after rewrap. Root checked both final logs, served asset hashes and the final test source. The [focused proof manifest](rings/regression/manifest.json) preserves the reports, raw geometry, failure picture/trace, original client and reproducibility inputs. The [before](rings/label-impact-before.json) and [after](rings/regression/label-impact-after.json) dependency inspections reach the same four files.

[Matched before motion](rings/before-journey.webm), [candidate motion](rings/after-journey.webm), [raw matched observations](rings/readings.json), [matched capture script](rings/label-candidate.mjs.gz), [candidate preservation manifest](rings/candidate-manifest.json) and [root's separate replay script](rings/root-replay.mjs.gz). The root reviewed successive states and pictures, without claiming a frame-by-frame review of every recording. The capture scripts' relative imports resolve from their original `AI-Agent-Workspace/tmp/2026-11-10-rings/` directory.

[Baseline provenance](rings/baseline-manifest.json), [original replay script](rings/replay.mjs.gz), and [label dependency inspection before editing](rings/label-impact-before.json). The script ran as a bundled Node entry (`esbuild`, ESM, Playwright external, `keepNames:false`) so serialized browser callbacks do not depend on tsx's function-name helper. Initial loader failures and the attempt to revisit a caption hidden at the preserved post-Close camera are recorded in the conversation; no product change, forced click or altered clock was used to obtain the baseline.

The initial [shell dependency inspection](rings/shell-impact-before.txt.gz) is also retained. The [cleanup inventory](rings/cleanup.json) records the task scratch files, their preserved equivalents or disposition, and the named unselected intermediate pictures. Both supplied chat exports remain byte-identical to their received captures.

### Complete verification and handoff

The exact `npm run safe:commit -- --e2e` completed with exit code zero: **1,746 unit tests, 115 integration tests and all 359 browser tests passed**. The browser report records zero unexpected, flaky or skipped cases and no report errors; the browser stage took 53.1 minutes on one worker. The new ring-clearance case also passed within that run, in 26.475 seconds, retaining the same names and rings. Source/test hashes stayed frozen throughout. Generation, lint, builds, type checks and documentation/asset/symbol audits all passed.

The [gate manifest](rings/gate/manifest.json), [parsed browser result](rings/gate/gate-browser-summary.json), [complete log](rings/gate/full-gate.log.gz) and [self-contained HTML report](rings/gate/report.html.gz) preserve the result; the log and report are losslessly compressed. [Before](rings/gate/gate-before.json) and [after metadata](rings/gate/gate-after.json) distinguish this November 10 report from the prior November 9 run. Actual [served asset hashes](rings/gate/gate-served-hashes.json) confirm both gate clients match the visually reviewed candidate, SHA-256 `3818b98d50f99e42a624f88d98c944dd133e3531668af8118987a579b0eb50bd`.

[Open the changed label-placement module, pinned in Explorer](http://127.0.0.1:8900/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkR1UEBXAWwDsBxAqARgAYn4BLAFwFMK7DIATABZ4AI0xUAJnygCAHPAAWXNgHNFHAMKoAzhygBWeBR6iAThK4BRMFypUuOnbOOmLDgMpsK%2BBG3ScAJ6yLPBmqADuADJctggOTrIAvvAAZqhm6Fw0FviKRH5UANYykABsrMSKmGaqXFAV8CQIfjpsqLT0kEbEqGS%2BbFSqjPBUqJJcXgBe9ZAiIDqBFKKkHlgIswzwqhZgQVBMAHRMAj0kPh12HB5c%2BDWYHO1UB4cCTdW1XABKEnUH8AR8OEAB7eB5PF5wRCDIoeDhmOyqDj5SBHHr9SQPawOWrBSBbEDcZFcMwvE5NThcSQAIUCAAUyC0RtDigB1NiSZHMsYTABaqFQFC%2BjjYegkWUh8AibAR-MFwraYqoEtRhwAnKNMCYAIL6fEKECKVD4Zz4sKxLjYABiFhMpsaC2ULQAIrcuYJtuF%2BqzcvgSaaFkVBiAkikQKTIKlsDouPAAFZQKMIGPwVBQADaIHTAB0QPhBrnYLm7ugipg6joAPRcYG%2BDIkys6TKV9B%2BK6VvZcCJV9KZbK5RRRTCiLjJw4cHSF3MAKlzAF0QHPRlA85hS%2BXHNXa2gEWZG83W2x253u5Xe1kcgRB8PRzpx854Px06BnpBV%2BuK1u67v9%2BgW22qA4Dsj1Pc9%2ByvIcRzHCcQHgANpxDOckiAA). Its new visible-body type, label type, consuming view and tests are available together. Root verified the normal search-and-pin action against the final preview and inspected [the resulting picture](rings/handoff-labels.png); [the returned address and pin count](rings/handoff.json) and [handoff script](rings/handoff.cjs.gz) are preserved. The corrected [estate motion](rings/after-journey.webm) remains the direct visual comparison with the reported ending.
