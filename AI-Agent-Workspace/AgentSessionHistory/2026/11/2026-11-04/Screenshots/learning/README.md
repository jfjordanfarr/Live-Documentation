# Portrait learning journey comparison

Implementation evidence, verified November 5, 2026. See [the experiment](../../../Probes/2026-11-04/learning/README.md) for methods, findings and the passing full gate. A is the original e433e484 baseline; C is the first reviewed candidate. The captures record observed states and reviews, without inferring owner acceptance. Seven byte-identical B captures were consolidated into C; B retains only its distinct exploratory frames.

| State | Baseline A | Candidate C |
| --- | --- | --- |
| Desktop subject | [Payment](A/payment-desktop.png) | [Payment](C/payment-desktop.png) |
| Small laptop | [Payment](A/payment-laptop.png) | [Payment](C/payment-laptop.png) |
| Phone subject | [Payment](A/payment-phone.png) | [Payment](C/payment-phone.png) |
| Phone full reader | [Reader](A/payment-phone-reader.png) | [Reader](C/payment-phone-reader.png) |
| Outward wheel gesture | [Overview](A/payment-outward.png) | [Overview](C/payment-outward.png) |
| Reset to reading | [Return](A/payment-return.png) | [Return](C/payment-return.png) |
| Dense file | [Pathfinding](A/pathfind-desktop.png) | [Pathfinding](C/pathfind-desktop.png) |
| Exact symbols | [Pathfinding](A/pathfind-symbol.png) | [Pathfinding](C/pathfind-symbol.png) |

The same fixtures, viewport sizes and deterministic initial arrangement are used for A, B and C. The outward picture uses a wheel gesture near the upper-left of the canvas; compare that same gesture, not an inferred automatic overview command. The phone captures use touch/coarse-pointer emulation.

Capture inputs are explicit: PaymentService is the selected file with no pins or reading overrides; the dense file is the engine's pathfind.ts with no pins or overrides; the exact-symbol case has no selected file, pins Walk (interface) and walk (function), and explicitly opens Walk (interface). Tests are shown; assets, related docs and citing docs are hidden. All captures use 2D. The outward gesture is wheel deltaY=650 at canvas screen point (280,110), followed by Reset Zoom for the return frame. Desktop is 1440×960, laptop 978×768, and phone 390×844.

Additional first-candidate pictures: [connected-file menu](B/payment-connections.png), [ordinary inspector at 900×700](B/payment-inspector.png). [Motion trials](B-motion/README.md) distinguish the rebuilt full-row treatment from the later private CSS preview and its remaining verification.

[Earlier B reset frame](B/payment-return.png) is retained separately because it is not byte-identical to C.

## Refined matched comparison

A2 uses the original UI with D's canonical graph snapshot; D uses the refined UI. Both graph-data files have SHA-256 `8f07b707a9cfec876d70e1db9d19188efc059e7357a86f5c2d4b4eac5851009a`. This separates UI changes from the repository's newly documented tests and dependencies. Reading text sizes are preserved; D recovers space from the first candidate's header and row-control layout. These matched captures precede the full gate's header-motion repair; its additional moving and settled pictures are labelled in the investigation collection below.

| State | Original UI A2 | Refined D |
| --- | --- | --- |
| Desktop subject | [Payment](A2/payment-desktop.png) | [Payment](D/payment-desktop.png) |
| Small laptop | [Payment](A2/payment-laptop.png) | [Payment](D/payment-laptop.png) |
| Phone subject | [Payment](A2/payment-phone.png) | [Payment](D/payment-phone.png) |
| Phone full reader | [Reader](A2/payment-phone-reader.png) | [Reader](D/payment-phone-reader.png) |
| Outward wheel gesture | [Overview](A2/payment-outward.png) | [Overview](D/payment-outward.png) |
| Reset to reading | [Return](A2/payment-return.png) | [Return](D/payment-return.png) |
| Dense file | [Pathfinding](A2/pathfind-desktop.png) | [Pathfinding](D/pathfind-desktop.png) |
| Exact symbols | [Pathfinding](A2/pathfind-symbol.png) | [Pathfinding](D/pathfind-symbol.png) |

[Name-action prototypes](name-actions/README.md) and [investigation frames](issues/README.md) retain the genuine alternatives and corrected diagnoses.

Final live-review evidence adds [the complete cycle explanation on phone](D/payment-cycle-phone.png), [lower content reached by touch](D/payment-after-touch.png), and [the restored subject after Back](D/payment-after-back.png). These come from the independent review's private browser; the root inspected the cycle picture and checked the reported facts against the canonical graph.
