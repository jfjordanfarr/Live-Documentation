# 3D identities and framing — October 23, 2026

Historical evidence for the identity/framing pass approved in [Turn 5](../../../ChatHistory/2026/10/2026-10-23.1.record.md#turn-5). The owner chose prioritized names with more revealed as space permits, then included rendering performance when wider framing exposed its cost.

These six captures answer three concrete questions: what can a person identify on arrival, can they recover after moving the camera, and can they recognize a path in the scene? Chromium, 1280×800, DPR 1. The before renderer is commit `d0110c4e`; the after renderer is this pass. Both main pictures use the same 872-file graph JSON. Both estate pictures use its 36-file graph. Main carries the earlier 616-commit history; the owner's interrupted rebuild has not been rerun here.

| Capture | What to compare or try |
| --- | --- |
| [01-generator-before.png](01-generator-before.png) | Direct arrival on `packages/generator/src/generator.ts`: only the subject is named; enlarged wires leave most neighbours offscreen. |
| [02-generator-after.png](02-generator-after.png) | The same arrival frames the subject's immediate neighbourhood and names the relevant files where text fits. |
| [03-portal-before.png](03-portal-before.png) | `Portal` opened in Structure: the retained scope is visible, but its hubs and files have no persistent names. |
| [04-portal-after.png](04-portal-after.png) | The same scope has directory and file identities, at reading size, with context faded. |
| [05-portal-fit-after-orbit.png](05-portal-fit-after-orbit.png) | Left-drag orbit, wheel away, then **Fit current scope**. Fit keeps the new bearing and the same retained Portal scope. Names remain subject to space and occlusion; this is not a promise to show every name at once. |
| [06-estate-named-path.png](06-estate-named-path.png) | The four-file `IPaymentHub.cs` → `GatewayClient.cs` route, asked through the ordinary search fields, with its endpoints and hops named in the scene and report. |

The root agent inspected these pictures and used the page's search, directory inspection, layouts, camera gestures and Fit. Inspection keeps the map question and camera; labels provide the same actions as spheres. The initial unselected scene also fits once, while later manual gestures end automatic following. The comparison pictures are still evidence; the focus, directory, identity and perspective regressions exercise motion and operability separately.

Names keep their reading size. The subject, explicit pins and path endpoints take priority, followed by retained directories/files and nearby context. Full paths and symbol/member counts remain in titles; duplicate basenames get distinguishing suffixes. Collision placement avoids other names, equally important sphere discs, panels and controls and prefers the previous side of a sphere when it still fits.

Wider framing required rendering work: native sphere/tube shapes are instanced with their original sizes and material rules, offscreen tubes are culled using their width and direction, and an unchanged WebGL picture is retained. Picking and dragging still use the original objects. Potential energy is calculated when requested; every force pair, integration step and stopping criterion remains. The work record gives the measurements and failed approaches. A blank idle canvas found during playtesting now has a compositor-pixel regression, since correct geometry alone did not prove that anything remained painted.

This pass does not settle dependency direction, the mismatched legend, depth/line treatment, coarse close-up sphere silhouettes, bottom help, 2D initial clipping, or the other open items in the [remediation checklist](../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#remediation-work).

Verification: `npm run safe:commit -- --e2e` passed on the intended changes in an isolated checkout: 1,384 unit tests, 113 integration tests and all 197 browser checks (25.2 minutes for the final browser run). The separate devcontainer edits and lock file were left in the shared checkout; the verification graph has 871 files, while the pictured shared graph has 872. All 21 changed source/test files match between the checkouts. The network watcher was corrected to use the configured server origin after its hardcoded port blocked that server itself; its cross-site and CSP assertions remain intact.
