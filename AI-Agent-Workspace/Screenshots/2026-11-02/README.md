# November 2, 2026 — 3D exploration repairs and comparisons

Historical browser evidence for [Turns 6–7 of the November 1–2 session](../../ChatHistory/2026/11/2026-11-01.1.record.md#turn-6--november-2-the-3d-exploration-pass). Captured in private Chromium contexts at 1440 × 960. The owner's shared page was not driven. Final verification: `npm run safe:commit -- --e2e` passed with 1,541 unit tests, 113 integration tests and all 265 browser tests (35.4 minutes for Playwright), plus builds, lint and documentation audits. The session record preserves the earlier failures and their corrections; pictures alone do not establish that result.

## Orbit

The whole estate, Connections, default controls, four positions reached by real pointer orbit gestures. The baseline client is `b67c3433`; the second run uses the shared orbit-target sizing reference. Layout coordinates were unchanged in both runs. The old draw changed some sphere world radii by 19.74%; the new draw changed none. [Uploaded-buffer measurements](../../Probes/2026-11-02/exploration/README.md) accompany these pictures. Recordings retain the motion for human review; stills alone do not establish how an animation feels.

| Position | Baseline | Shared reference |
| --- | --- | --- |
| Start | [baseline 0](baseline-estate-orbit-0.png) | [shared 0](shared-target-estate-orbit-0.png) |
| First orbit | [baseline 1](baseline-estate-orbit-1.png) | [shared 1](shared-target-estate-orbit-1.png) |
| Second orbit | [baseline 2](baseline-estate-orbit-2.png) | [shared 2](shared-target-estate-orbit-2.png) |
| Third orbit | [baseline 3](baseline-estate-orbit-3.png) | [shared 3](shared-target-estate-orbit-3.png) |
| Recording | [baseline video](baseline-estate-orbit.webm) | [shared-reference video](shared-target-estate-orbit.webm) |

These early orbit captures precede the label-disclosure repair below.

## Reversible exploration

- [Two independent pins](pins-two-independent.png): GatewayClient and the isolated Estate solution file. Blue label borders identify the retained files. This capture exposed incomplete framing, subsequently corrected so explicit Fit includes every shown node.
- [Orphan released](pins-orphan-released.png): clicking the solution's name removes its pin and sphere, preserving GatewayClient's neighborhood. The same remaining set is portable into 2D.
- [Directory discovered](directory-discovered.png): clicking Contracts reveals its local neighborhood and reader without opening the subtree as a retained directory.
- [Directory released](directory-released.png): a second click withdraws that discovery and reader; the default Structure neighborhood can still contain Contracts. This is not an exclusion filter. The pointer is still over the released directory, so temporary hover emphasis remains.

## Names and gravity comparison

- [Gravity 0.025 with improved names](estate-gravity-0.025.png): the original force model, with names for both isolated files and readable nearby context. The earlier orbit screenshots show the naming problem before repair.
- [Gravity 0.005](estate-gravity-0.005.png): a rejected comparison. More separation alone makes isolated files travel farther and compresses the connected work on screen when fitting everything. The lower gravity is not a selected default. Headless reports for both pictured settings and 0.001 are in the [probe](../../Probes/2026-11-02/exploration/README.md).

## Backward-wire cue

[Controlled backward arrangement](backward-route-cue-injected.png): a test stylesheet displaces a real consumer card to the left of its providers, and the ordinary packing control redraws the actual routes. Three backward ordinary connections trigger the static outline on 3D. Removing the displacement and restoring the packing clears it. This demonstrates detection and presentation, not reproduction of the owner's still-uncaptured natural case. Self loops and intentional feedback stubs are excluded.

## Components and the complete directory journey

The [Turn 8 continuation](../../ChatHistory/2026/11/2026-11-01.1.record.md#turn-8--continue-until-the-directory-exploration-journey-is-ready-for-new-users) compares component-centroid gravity without inventing centers or hiding relationships. [Zero](estate-components-0.png), [0.5](estate-components-0.5.png) and [0.8](estate-components-0.8.png) are trials, **not the selected default**. The final default is 0.2: stronger separation used excessive screen space or failed the existing re-easing stability contract. [The probe](../../Probes/2026-11-02/exploration/README.md) preserves the measurements and rejected experiments.

The repository's [10-second](repository-diagnostic-0.png), [20-second](repository-diagnostic-1.png) and [30-second](repository-diagnostic-2.png) diagnostics use separation zero and are still moving. The [0.5 early](repository-components-0.5-growing.png) and [later](repository-components-0.5-later.png) captures show the stronger trial's emerging components, not a final idle picture. Software rendering dominates this environment's frame time; these are not claims of fluid large-scene animation.

The nine-state estate journey uses the selected 0.2 and preserves Portal independently of the root overview and isolated file. No selected file is required for either perspective transition. [The recording](directory-journey.webm) retains the full gesture sequence; [its states and renderer](../../Probes/2026-11-02/exploration/directory-journey.json) report no page errors. These captures precede the later toolbar hop selector and pin-only anchor repair.

| Capture | What it shows |
| --- | --- |
| [01 — directory in 2D](journey-01-directory-2d.png) | Portal retained, its direct files and closed subdirectories. |
| [02 — correspondence](journey-02-directory-transition.png) | Closed folders become their actual Structure hubs. |
| [03 — Structure](journey-03-directory-structure.png) | The directory neighborhood, no selected subject. |
| [04 — Connections](journey-04-directory-connections.png) | Same retained directory, references instead of containment. |
| [05 — whole overview](journey-05-whole-overview.png) | All 36 files, including the isolated solution file, and a quieter reference web. |
| [06 — local scope plus orphan](journey-06-local-with-orphan-pin.png) | Root opening withdrawn; Portal and the independent orphan remain. |
| [07 — reverse transition](journey-07-return-transition.png) | Unmatched closed folders fade as complete boxes, without phantom name tokens. |
| [08 — retained 2D](journey-08-retained-2d.png) | Portal plus the solution file carried into the detailed representation. |
| [09 — orphan released](journey-09-orphan-released.png) | Second click removes only that pin's contribution. |

[One isolated file](single-orphan.png) settles at a useful size. [Temporary Portal discovery in Connections](discovered-directory-connections.png) shows sixteen files beside the reader without retaining its subtree. [The actual pointer check](../../Probes/2026-11-02/exploration/direct-interaction-check.json) covers small hand jitter and a name moved between press and release.

## T3: discover, narrow, retain, change perspective

The canonical T3 analysis is unchanged: 28,145 files and 81,634 edges. Only its Explorer client was rebuilt. The [first journey record](../../Probes/2026-11-02/exploration/t3-first-journey.json) separates useful navigation from the dense scenes it exposed. [The recording](t3-directory-journey.webm) includes those problems, pauses and continuing motion; it is not a curated success reel.

| Capture | What it shows |
| --- | --- |
| [Fresh Structure](t3-01-fresh-structure.png) | 118 files with apps, packages, scripts and other root landmarks, replacing the old default knot. |
| [Apps](t3-02-apps-discovery.png) | Five discoverable application directories and their reader. |
| [Server](t3-03-server-discovery.png) | Still-moving 100-file discovery, with clipped context; this prompted Fit on directory discovery. |
| [Source](t3-04-source-discovery.png) | Broad source discovery; 805 files is still too much for a useful local question. |
| [MCP Structure](t3-05-mcp-discovery.png) | 91 files after narrowing to MCP; the reader exposes a service name without prior search knowledge. |
| [MCP Connections, two hops](t3-06-mcp-connections.png) | The 1,242-file white knot that prompted ordinary toolbar access to Hops shown. |
| [MCP Connections, one hop](t3-07-mcp-one-hop.png) | 116 files, using the new visible selector and preserving directory discovery. |
| [Service, one hop](t3-08-service-one-hop.png) | 33 files around the service found through the directory reader. |
| [Before pin-only anchor repair](t3-return-before-pin-anchor.png) | Correct membership but an unhelpful near-empty 2D arrival; retained as the rejected behavior. |
| [Service retained in 2D](t3-09-service-retained-2d.png) | Latest repeat of the pin-only handoff. |
| [Return to 3D](t3-10-service-return-3d.png) | Same retained service and one-hop neighborhood. |

The [final journey state](../../Probes/2026-11-02/exploration/t3-final-journey.json) records pins, settings, actual submitted files and page errors. Neither this trial nor the estate turns a thousand-file picture into an explanation: directory discovery and explicit context reduction are the useful entrances.

[The first estate journey recording](directory-journey-before-transition-repair.webm), captured at 04:46 UTC before the reverse-transition repair, preserves the moving folder-name fault that led to the later correction. The 06:00 recording above is the repeated journey after that repair. This earlier recording is comparison evidence, not the final behavior.

## History and the open pin tray

[History beside an open tray](history-and-open-pins.png) and [history closed with the tray still open](history-closed-with-open-pins.png) follow the final hit-target repair. The tray's positioning rectangle is transparent and must not intercept the History button beside its narrow toggle; only its actual panel and toggle receive input. [The pointer check](../../Probes/2026-11-02/exploration/tray-hit-target.json) records that the real button is hit, history closes, the pin panel stays open and no page error occurs. The second picture intentionally names the deleted pin's absence today.
