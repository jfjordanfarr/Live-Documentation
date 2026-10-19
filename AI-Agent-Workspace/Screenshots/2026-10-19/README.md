# Explorer pictures — October 19, 2026

Historical visual evidence captured from the local build during the [stewardship work](../../ChatHistory/2026/10/2026-10-19.1.record.md#turn-17). Chromium, 1600 × 1000. These record the code and gestures on this date; the current product contract remains in the Explorer design.

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
