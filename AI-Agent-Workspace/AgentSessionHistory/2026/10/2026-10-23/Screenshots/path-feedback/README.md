# Shared Local Map path feedback — October 23, 2026

Historical evidence for the first repair approved in [Turn 4](../../../ChatHistory/2026/10/2026-10-23.1.record.md#turn-4), following finding 1 of the [baseline review](../README.md). The root agent personally used the isolated implementation before browser regressions were written, then requested and checked a correction to the answer's size and contrast.

Built main and estate bundles, Chromium at DPR 1. Captures 01–04 and 08–10 are 1600×1000; 05–07 and 11–12 are 1280×800. Main bundle: 866 files, estate: 36. These review bundles omitted history. Search choices, keyboard, ordinary perspective and navigation controls, and copied addresses drove the journeys; no private application state was changed. No page or console errors were reported. These are still captures taken during interactive navigation, not a recorded motion trace or a physics benchmark.

## What the root tried

- On the estate, asked `GatewayClient.cs` → `IPaymentHub.cs` in 3D. The reverse-only answer and its recovery link are visible. Tab from the destination reaches Clear, then the reverse link; Enter draws the four-file route. The report names `IPaymentHub.cs`, `HubProxy.cs`, `PaymentsController.cs` and `GatewayClient.cs` in order. Keyboard activation of the second hop opens its evidence without changing the question or pins.
- Switched that path to 2D and back, then reloaded. The question, four hops and two pins persisted. World Map and Knowledge Sources hid the report while retaining the question; a reload on World Map kept it hidden and returning to Local Map restored it. Keyboard Clear hid the report, kept both pins and returned focus to the destination.
- Asked the disconnected `GatewayClient.cs` → `Default.aspx.cs` question while on World Map. Local Map opened in the remembered 3D representation and visibly reported no path either way.
- On the main repository, asked the thirteen-file route from the estate's `Database/Oracle/CENTRAL.ACCOUNT.sql` to `Portal/Pages/Default.aspx`. At 1280×800 the report uses about 99 pixels of height. The first manual pass visited all thirteen hops and confirmed the fully revealed final button; the last Enter opens the destination's evidence. The input fields retain the endpoint names when the strip scrolls. Switching to 2D and reloading retains the route. The status truthfully identifies the three reverse references omitted by the 2D drawing.
- Repeated the original `generator.ts` → `document.ts` question in the main Structure view. The reverse offer now appears in 3D; keyboard activation draws the two-file path with a readable report in both representations. Opening the resulting copied address in a fresh browser context restored the subject, destination, ordered hops and representation.

The new regression subsequently found that native Tab could leave an intermediate button mostly clipped, despite eventually revealing the final endpoint. Root viewed that failure and replayed the correction: explicit focus reveal brings the whole button into view. The first correction put its focus outline on the viewport edge; an 8px scroll margin now gives the complete indicator room. Root replayed all thirteen Tab stops and inspected the intermediate and final captures after this correction. Captures 11–12 record the corrected follow-up.

The first implementation retained the old faint 11px answer. The root requested a readable scale and contrast before approving the picture; all committed captures below show the corrected 13px status. Ordered hop buttons retain visible focus and their full file paths in accessible names and hover titles. Long routes scroll without consuming the map's height; the report also has a viewport-relative height bound.

This closes the missing path report and recovery surface. It does not establish readable spatial identities, useful camera framing, or truthful wire/legend encodings throughout 3D. The captures still show those separate accepted problems: anonymous spheres, oversized wires, endpoints outside the current frame, and 2D cards clipped by the preserved camera. The report makes the question usable while those repairs remain open.

## Captures

| File | State |
| --- | --- |
| [01-estate-reverse-3d.png](01-estate-reverse-3d.png) | Reverse-only estate answer with visible recovery. |
| [02-estate-success-3d.png](02-estate-success-3d.png) | Four ordered named hops in 3D after reversal. |
| [03-estate-success-2d.png](03-estate-success-2d.png) | Same question and report after switching to 2D. |
| [04-estate-disconnected-3d.png](04-estate-disconnected-3d.png) | Disconnected answer in 3D. |
| [05-long-path-start-3d.png](05-long-path-start-3d.png) | Thirteen-file route at 1280×800; first hops and both endpoint fields. |
| [06-long-path-keyboard-last-3d.png](06-long-path-keyboard-last-3d.png) | Tab reveals the last hop and visible focus. |
| [07-long-path-2d.png](07-long-path-2d.png) | Same long route after switching to 2D. |
| [08-main-reverse-3d.png](08-main-reverse-3d.png) | Original main-repository reverse-only journey, now visible in Structure. |
| [09-main-success-3d.png](09-main-success-3d.png) | Main two-file path after keyboard reversal. |
| [10-main-success-2d.png](10-main-success-2d.png) | Same path and report in 2D. |
| [11-long-path-middle-focus-3d.png](11-long-path-middle-focus-3d.png) | Follow-up: intermediate hop seven and its full focus indicator. |
| [12-long-path-final-focus-3d.png](12-long-path-final-focus-3d.png) | Follow-up: final endpoint after the focus-reveal correction. |
