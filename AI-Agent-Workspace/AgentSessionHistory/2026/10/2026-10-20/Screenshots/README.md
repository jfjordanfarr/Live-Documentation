# Explorer pictures — October 20, 2026

Historical evidence from the [inspect-first implementation](../../ChatHistory/2026/10/2026-10-20.1.record.md#turn-2), captured in installed Chromium. Codex took the pictures up to the Clear-all and Unpin sections during the work; the Claude Code root took the last section's after the independent review. The work they show passed the full gate, 1,318 unit, 111 integration and 177 browser tests, before it was committed.

## Inspection, direct pins and reader layout

The estate opens on GatewayClient.cs at 1600 × 1000 with continuing layout search disabled to isolate the gesture. The capture waits for the initial camera and view transition to stop before measuring inspection. An earlier capture ran during that initial movement; it was replaced after a separate settled browser check and the corrected capture both showed unchanged geometry.

- [Map before inspection](inspect-estate-before.png).
- [Evidence for PaymentResultModel.cs](inspect-estate-evidence.png), without changing GatewayClient.cs as the subject or adding pins.
- [Direct symbol pin in motion](inspect-estate-pin-moving.png).
- [After the direct symbol pin](inspect-estate-symbol-pin.png): only GetPaymentAsync is retained.
- [Phone reader, 390 × 844](inspect-reader-390x844.png).
- [Short landscape reader, 844 × 390](inspect-reader-844x390.png).
- [Reader beside the uncovered map, 900 × 700](inspect-reader-900x700.png).

Root inspected the desktop and narrow/short pictures. The reader covers the canvas; opening it does not resize the canvas. At 390 × 844 and 844 × 390 it covers the viewport and keeps its own Back, Forward and Close controls; the remaining page is inert while that full reader is open. On wider screens the map controls move into the uncovered area. A first real click found the reader covering the perspective control, which prompted that placement correction.

The corrected capture kept every card rectangle and the map DOM identity unchanged through inspection and Back. A shared reload retained subject A, the GetPaymentAsync pin and separately inspected PaymentResultModel symbol B. The reader body measured 690 px tall at phone size and 281 px in the short landscape view, without reducing font size. No page errors were observed. The direct-pin motion had 97 sampled frames, 45 marked moving; its measured row-position range was 0.0000 px horizontally and 0.0017 px vertically.

## 3D actions and perspective continuity

The estate's GatewayClient subject is unchanged while PaymentResultModel is directly pinned and then inspected. The action strip uses the same Pin, Centre and More glyphs as the 2D map, with accessible names and tooltips. These captures replace the provisional text-button strip after root's visual review.

- [Direct actions beside a hovered 3D file](inspect-3d-direct-actions.png).
- [3D evidence over the unchanged scene](inspect-3d-evidence.png).
- [Return to 2D with the subject and evidence retained](inspect-perspective-keeps-evidence.png).
- [The contextual menu](inspect-3d-more.png).
- [The interaction recording at its actual cadence](inspect-3d-journey.webm).
- [Phone controls before responsive changes](inspection-mobile-controls-before.png): a coarse-pointer 390 × 844 viewport at map scale 1. Symbol Pin/More targets are 17 × 17 CSS pixels; header actions are 20 × 20. This is the measured concern raised in [Turn 3](../../ChatHistory/2026/10/2026-10-20.1.record.md#turn-3), not an approved mobile layout.

The observed 3D camera position and matrix were exactly equal before and after inspection. Switching to 2D kept the subject and reader target. A stationary hold opened the menu without an action on release; moving a node changed its actual world position without inspecting or pinning. A keyboard-only More activation initially hid its opener after focus entered the menu. The menu now explicitly retains that action target until closure, and Escape returns focus to its visible button even with the pointer elsewhere.

## Clear-all investigation

[Estate after clearing all pins in 3D](inspect-3d-cleared-estate.png) follows a GetPaymentAsync pin in 2D and a switch to 3D. All 35 native nodes exist throughout; clearing restores normal opacity to all of them. Twenty-two lie within the retained camera frame. This reproduction does not establish the accumulating subset reported by the owner in [Turn 4](../../ChatHistory/2026/10/2026-10-20.1.record.md#turn-4); exact route and full-repository versus sample scope remain to be clarified. The filename describes the observed state, without implying a demonstrated fix.

## Frozen perspective appearance

[The frozen 2D picture used by the perspective transition](inspect-perspective-frozen-styles.png) preserves the native cards, symbols, controls and wires. Root and the delegate inspected this image. The transition copies every computed property, but now reads the native property count once, enumerates by index, removes copied hooks before materializing the large style attribute, and writes the complete declaration block once.

Profiling the 33-card graph neighborhood counted 3,405 descendants and 1,596,945 properties. On the same 843-file bundle, the untraced journey's 3D→2D step changed from 9.42 to 6.17 seconds and 2D→3D from 17.77 to 11.06 seconds; these are measurements of this environment, not a general latency guarantee. The frozen-style check compares all 470 declarations of its representative styled/SVG card against the former browser CSSOM normalization, including quoted-semicolon custom values: zero differences, zero copied IDs or event hooks, and an inert transition layer. The original traced round-trip regression passes in 24.2 seconds under its unchanged 30-second budget. The remaining cost of freezing large scenes is still material.

## Individual Unpin restores the galaxy's normal opacity

A defect resembling the owner's report was reproduced by a different route from Clear all: retain PaymentResultModel in 2D, switch to 3D, mouse-click its Unpin control, then move onto empty canvas. The owner later judged their own route different and asked to re-test it later ([Turn 7](../../ChatHistory/2026/10/2026-10-20.1.record.md#turn-7)); this fix is not a claim to have resolved what they saw.

- [Before the fix](inspect-3d-unpin-hover-before.png): zero pins, all 35 native meshes present, but only three normally opaque. Ordinary mouse-created button focus keeps stale hover dimming alive.
- [After the fix](inspect-3d-unpin-hover-after.png): zero pins and all 35 meshes normally opaque after pointer exit; the button can retain focus without falsely retaining hover attention.

Root inspected both pictures and read both measurement records. The fix preserves deliberate keyboard preview through native focus-visible state and keeps controls reachable independently of mouse hover. Temporary pointer peeks restore the actual keyboard or menu target when they end. These are attention changes; the camera is not automatically reframed by releasing a pin.

## After the independent review (Claude Code)

Taken by the Claude Code root after fixing the review's findings ([the record](../../ChatHistory/2026/10/2026-10-20.1.record.md#independent-review-and-its-fixes)), at 1600 × 1000 on the estate sample.

- [Before a Pin pressed twice](unpin-2d-before.png) and [after it](unpin-2d-after.png): GatewayClient.cs pinned whole and then unpinned by its own card's Pin. The two pictures are the same: the file is still the subject, the tray reads 0 pins, and no card left. Before the fix the Unpin acted as the card's close and left no subject.
- [The 3D hub's action once its directory is open](hub-3d-close-offered.png): after Open on the Portal hub, the strip's first control is pressed and named Close Portal, as the 2D label offers Close for an open directory. The camera has framed Portal's members while the strip stays under the pointer that pressed it, which is the strip's hold-while-aiming rule, not a detachment.
- [Directory controls in their own column, estate](directory-controls-column.png) and [in the repository around generator.ts](directory-controls-repository.png): each membrane's Open and More stand at the right end of its label, as the card actions stand in a card's corner, and the label's text is the name and count alone. Before this, the two buttons stood inside the label's text, which made every label taller and wider than the layout lab's model of it ([the record](../../ChatHistory/2026/10/2026-10-20.1.record.md#the-layout-lab-caught-the-label-buttons)). In the repository picture a long label wraps to two lines beside its controls; the picture's right edge is the camera's entry framing.

## Linked documents through the history (Claude Code)

The scripted history sample at 1600 × 1000 in 3D, Related Docs on, after the history began to keep each commit's authored words ([Turn 9](../../ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)). The sample commits a main file whose doc links the design and a plan not written until step 3, and a legacy helper whose doc links its old notes and is retired with them at step 4.

- [Step 3](history-doc-links-step-3.png): the plan is written, and its purple node joins the design and the old notes; the step panel's Documents linked names main.ts to later.md.
- [Step 4](history-doc-links-step-4.png): the legacy helper's link leaves with it and the main file's doc drops the design, so one document remains; Documents unlinked names both, the old notes marked "not in this bundle" since they are gone today.
- [Reading the design from the panel](history-doc-reader-today-note.png): the reader says "Today's version. The picture shows 2026-01-09, commit ce0ea978." The scrubber ends at the reader's edge with its readout in view; a first look had found the reader covering the scrubber's last ticks and readout.

Root looked at all three. At the last step, which is today, the design reappears: today's bundle keeps the sample's deliberate orphan doc, which links it, the same reason the orphan's own sphere shows only today.
