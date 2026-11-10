# Current-build aesthetic review — November 10, 2026

Historical review of product source at `291a6c0c` (last product change `add3a341`), requested in [today's root conversation](../../../ChatHistory/2026/11/2026-11-10.1.record.md#turn-1). Root judgment, not owner acceptance. No product design was changed in this review.

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
