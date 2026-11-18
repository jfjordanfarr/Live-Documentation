# Native portrait reading — November 4, 2026

Current implementation evidence; the full local gate passed. This is root-agent visual judgment, not an owner acceptance record. The [request and implementation record](../../../ChatHistory/2026/11/2026-11-04.1.record.md#turn-2) preserve the portrait preference and the unanswered name-click comparison.

The pictures are from the built native 2D map and its explicit reader, using actual repository documentation. The owner’s shared prototype tabs were preserved. Private Chromium sessions were closed after inspection.

## Pictures and findings

- [First native payment card](first-native-payment.png): rejected. Prose inserted into the flat symbol grid displaced following labels and connection pins. Each symbol now owns a subgrid row, with its text below its name and ports.
- [First corrected narrow card](grid-fixed-narrow.png): rejected as a finished frame. Duplicate directory text and unused spacing left the footer behind the floating controls. Reading cards now omit that duplicate path and use the actual unobstructed frame.
- [Folder-history test's first frame](history-folder-outside-frame.png): the new file reading frame leaves the containing folder's Open action outside the canvas. The old test tried to click that off-screen control directly. Its history assertions remain valid; the journey needs to pan to the control, as a person would.
- [During an automatic row reorder](reading-during-order-change.png): a capture taken before background search finished shows text crossing during a move. It is not a settled layout. Final captures wait for actual search/motion completion, and pointer or keyboard attention to already-open text now pauses further ordering until that attention leaves.
- [Desktop payment card](final-payment-desktop.png): portrait composition with Purpose, the class summary, recorded interface/parameter/return types and file relationship counts. Type names remain navigable. Post/Get have recorded type facts but no invented summaries.
- [Phone payment card](final-payment-phone.png): the card stays within the remaining canvas after the sidebar collapses. Text keeps its reading size. Aggregate height exceeds the frame, so the full-description action appears near the top.
- [Phone full reader](final-payment-reader-phone.png): one ordinary scrolling surface above the unchanged map, with close, section links, existing evidence actions and Markdown download.
- [One explicitly opened symbol](final-structured-symbol.png) and [its full reader](final-structured-reader.png): an unpinned exact symbol can remain open. The final reader includes all its recorded sections, including Parameters; the earlier summary-only reader was rejected during this journey. Soft source wraps form paragraphs, and deliberate reading is not dimmed as an irrelevant row.
- [The reading card's self-reference curves](final-reading-laces.png): at reach 32 and curl 24, the stem stays horizontal to the card edge, then curves outside and returns flush. Wider reading-card padding exposed the old curve beginning too early; the original browser allowance remains unchanged.
- [Folded card](native-payment-folded.png), [one hover preview](native-payment-hover.png) and [outward overview](native-payment-overview.png): the measured transient/zoom journey. These are intermediate motion-study frames; the tests and current code define the final behavior.

## Journeys and verification

Six PaymentService → Post → Get → Post → away cycles restored every card rectangle within 0.006 CSS px, with no page errors. The first zoom/reset attempt failed by 484.07 px because it calibrated against the opening height animation. Waiting for that native move fixed the return; the repeated journey then reported zero difference. An initial phone resize retained the old horizontal position. Tracking the camera’s reading subject through layout improvements fixed that ownership error.

The full-text phone journey opened a modal reader, closed with Escape and returned keyboard focus to the original action. No page errors were observed. The first long-symbol picture exposed soft source lines becoming separate paragraphs and omitted non-Summary sections in the pre-existing reader. Both were corrected before final verification.

The first full local gate passed lint/build/test type-checking, 1,567 unit tests, 115 integration tests and documentation audits, then failed with 260 of 276 browser tests passing. Sixteen failures exposed viewport assumptions, coordinate-unit mistakes, path-orientation defects, the curve intrusion and inadequate waiting for boundary alignment after ordering seeds. Assertions about facts, geometry and retained identity were kept. The pan helper now uses the unobstructed frame and a drag start that permits real progress; the name audit compares fractional dimensions in one coordinate system.

Corrected cases passed across focused reruns. The last one-pixel code-flow mismatch was a line-box difference between a plain font probe and the actual pre/code context; calibration of one short line fixed it, including a blank-line and narrower-width check. The new search/resize, 3D reader restoration, reading-only Close, preview-return and attention-pause cases pass. Final pictures were refreshed and inspected. The frozen full gate passed: **1,568 unit tests, 115 integration tests and all 282 browser tests**, with the browser suite taking 39.2 minutes. All 922 Live Docs were unchanged on generation and validated by lint; Markdown, asset and symbol audits passed. The existing 53 disconnected-file warnings remain. The hashes of all 47 changed source files matched before and after the gate, with no additional source changes.

The layout lab retains its exact pixel checks. It now models per-card typography and padding, mixed-font reading blocks, conditional overflow actions and the reading footer. It calibrates a short line in the real label’s formatting context, independently reflows the actual text with Pretext, and keeps DOM measurements on Chromium’s layout-unit grid. A separate check compares the original capture’s narrower-width prediction with a newly rendered page.

## Remaining design choice

Portrait is the owner’s chosen starting composition. Name clicks still inspect; the proposed consistent pin/unpin action for names remains unanswered. The ordinary evidence panel’s remaining functions have not been retired. The implemented reading surface and full-text dialog are a concrete integration step toward that direction.
