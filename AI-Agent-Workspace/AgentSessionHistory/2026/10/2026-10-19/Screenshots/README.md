# Explorer pictures — October 19, 2026

Historical visual evidence captured from the local build during the [stewardship work](../../ChatHistory/2026/10/2026-10-19.1.record.md#turn-17). The initial stewardship captures use Chromium at 1600 × 1000; later investigations name their viewport sizes below. These record the code and gestures on this date; the current product contract remains in the Explorer design.

## Card ownership and type-reference gestures

- [Before: type-label double-click](ownership-estate-type-label-before.png): the old handler incorrectly made PaymentResultModel.cs the subject from GatewayClient.cs. The owner had already approved removing hidden double-click navigation in the October 14 record’s Turns 9–10.
- [After: type-label double-click](ownership-estate-type-label-after.png): GatewayClient.cs remains the subject; the two pin activations leave one whole-file pin and the evidence panel stays closed.
- [After: type-badge double-click](ownership-estate-type-badge-after.png): the same subject and pin remain, while the badge’s ordinary inspection opens PaymentResultModel.cs in the evidence panel. Inspection and subject are distinct.

These use the built estate sample, with continuing layout search disabled to isolate the gesture. Root viewed all three images before the regression cases were added.

## Rendering lifecycle and motion

The repository’s TypeScript Rosetta neighborhood, pinning Report on models.ts from main.ts:

- [Before the pin](ownership-repository-before-pin.png).
- [During the move](ownership-repository-pin-moving.png).
- [After the pin](ownership-repository-after-pin.png).
- [Recorded journey](ownership-repository-pin-motion.webm).

Continuing search was disabled and movement set to 700 ms for inspection. The page recorded 97 frames, 36 while moving; the clicked models.ts card’s measured position varied by 0.001 px horizontally and 0.002 px vertically during those moving frames. The pin retains one symbol and brings its related files into the scene; the selected subject stays main.ts. Root inspected the before, intermediate and final frames. The full browser suite separately checks wrapper identity and wire attachment through interrupted motion.

## Existing inspection/link mismatch — decision pending

- [Before reload](inspection-before-reload.png): a single return-type badge click leaves GatewayClient.cs as the map subject and opens PaymentResultModel.cs in the evidence panel. The address nevertheless names PaymentResultModel.cs.
- [After reload](inspection-after-reload.png): the same address makes PaymentResultModel.cs the map subject and closes the evidence panel, while retaining the pin.

Root reproduced this on the estate after the reviewer observed the same mismatch on graph.ts/document.ts. This is an unresolved public-state contract, not a claimed repair. The owner is being asked whether shared/reloaded links should restore both the map subject and inspection, or the map subject only with inspection remaining temporary. The shared exploration migration is held at that decision.

## Shared-action preservation baseline

The delegated browser review recorded these existing journeys before the shared-state migration; root reviewed the captures. The migration remains isolated and unverified while the subject/inspection link decision is open.

- [2D type-badge inspection](shared-actions-2d-badge-click.png): graph.ts remains the map subject while document.ts is inspected. Root independently reproduced the reload mismatch above on the estate.
- [3D sphere click in the history sample](shared-actions-history-3d-sphere-click.png): clicking huge.ts pins it and opens its detail panel. The action adds a Back entry.
- [Estate path](shared-actions-estate-path.png): IPaymentHub.cs to GatewayClient.cs, before a directory action.
- [Opening a directory during that path](shared-actions-path-after-open-directory.png): Contracts opens, the path and destination clear, the directory label stays at its prior position, and Back restores the path and its original pin.

Other observed distinctions to preserve: 2D card-title pinning does not open details or add a Back step; the tray’s Show action pans to a retained card without changing the subject, inspected context, URL or pins; historical search can pin a file while retaining the selected historical step. These are baseline observations, not new interaction choices.

## Evidence-reader investigation — Turns 19–20

The owner subsequently accepted preserving the map subject across 2D/3D, restoring explicitly open evidence in shared links, and Back restoring that evidence. They also reopened the panel's purpose and varied-viewport layout. These pictures are an investigation of the existing build, followed by temporary CSS geometry studies in Chromium; no product code or navigation semantics were changed. The earlier pending-decision descriptions above record their date, not the current decision.

The baseline opens PaymentResultModel.cs from GatewayClient.cs's return-type badge in the estate. Root inspected the pictures and DOM geometry at four viewport sizes, with continuing layout search disabled and reduced motion enabled:

- [1440 × 900 baseline](inspection-baseline-1440x900.png): the 361-pixel reader covers the pin-tray button; the main workspace is 1,179 pixels wide.
- [900 × 700 baseline](inspection-baseline-900x700.png): the permanent left navigation leaves 639 pixels for the workspace, of which the reader overlays 361.
- [390 × 844 baseline](inspection-baseline-390x844.png): the permanent left navigation leaves just 129 pixels. The 352-pixel reader extends left of its clipping parent, hiding most of its contents; its close button remains reachable.
- [844 × 390 baseline](inspection-baseline-844x390.png): the header and two-row footer leave a document scroll area only 144 pixels high. Vertical scrolling itself is expected; the issue is how little useful room the shell allocates.

The following are proposed geometry only, retaining the existing panel actions so the layout variable can be compared separately. They do not implement keyboard/focus behavior, portable state, animated opening/closing or a responsive map/navigation shell:

- [Reserved column at 1440 × 900](inspection-prototype-docked-1440x900.png): constrain the map to the room beside the reader and move the pin handle into that room. The map's subject remains in place in this still picture. General camera/anchor continuity through the resize still needs implementation and motion checks.
- [Full reading surface at 390 × 844](inspection-prototype-sheet-390x844.png): the reader covers the viewport instead of being clipped by the map's narrow parent; the existing close action returns to the exploration. This makes the document readable but does not repair the underlying narrow-screen map/navigation layout.
- [Full reading surface at 844 × 390](inspection-prototype-sheet-844x390.png): a smaller header/footer padding and one action row leave 273 pixels for document scrolling, without shrinking the text.

In [Turn 21](../../ChatHistory/2026/10/2026-10-19.1.record.md#turn-21), the owner chose covering part of the unchanged canvas over reserving a column. The reserved-column study remains comparison evidence, not the selected design. A legible overlay at narrow dimensions still needs implementation; these pictures do not establish a responsive product.

The final pair tests the old footer's meaning from a real 3D sphere click:

- [Before “Open in Local Map”](inspection-3d-before-footer.png).
- [After “Open in Local Map”](inspection-3d-after-footer.png).

The action closes the panel while leaving the same 3D subject, representation and URL. It is redundant with closing in this case, not literally a no-op. Root corrected the initial source-review claim after checking the caller's preceding hide operation. In a path or with a different inspected target, the action also exits the path or changes the subject, so deleting it everywhere would discard distinct behavior.
