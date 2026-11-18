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

## The whole overview looked at for the orphans (November 2, the next session)

Taken by the Claude Code root agent (Fable 5.1) for [Turn 1 of the November 2 session](../../ChatHistory/2026/11/2026-11-02.1.record.md#turn-1), where the owner reported that the islands and orphans were still hard to find. The committed client of `c91c019d` over this repository's bundle (built 08:11 UTC), served locally and opened headlessly at 1440 × 960: `?view=local&mode=3d&layout=connections`, the first picture settled, then Show all files, pictured after 400 seconds of the software renderer, at which point the page still reported itself busy, so this is the picture mid-settle, not at rest.

- [repository-whole-overview-software-renderer-400s.png](repository-whole-overview-software-renderer-400s.png): all 914 files. Read from the uploaded instances at the moment of the picture: the 52 single files draw at 1.4 to 6.7 px radius, the same as the main component's leaves (p50 2.4 px); 31 of them project outside the main component's silhouette on screen, with a median clearance of 26 px; 14 are named, because a component's landmark has name priority, and 38 are not, their names colliding at the rim; nothing on screen says which named spheres are islands. Their world radius at this moment is a median 964 units against the headless rest of 1,353, so they were still migrating outward from their birth near the origin. The measurements, headless and on the page, are in [the session record](../../ChatHistory/2026/11/2026-11-02.1.record.md#turn-1).

## The scope grammar built (November 2, the second session)

Taken by the Claude Code root agent (Fable 5.1) after the build of [Turns 1 to 4 of the November 2 record](../../ChatHistory/2026/11/2026-11-02.1.record.md#turn-1), on this repository's bundle served locally, in headless Chromium at 1440 × 960, before the browser suite ran. The software renderer draws about nine frames a second, so a settle here takes several times what a GPU takes; each caption says whether the picture is at rest.

- [repository-archipelago-start.png](repository-archipelago-start.png): the Connections start with nothing asked about, the archipelago: every group's seed, its most connected file, nothing grown, no wire, no name at rest; "94 of 914 files shown · 42 groups, 52 alone" in the sidebar. At rest in 1.8 seconds.
- [repository-main-seed-hovered.png](repository-main-seed-hovered.png): the largest group's seed hovered: its name appears, and its title says how many files are in its group.
- [repository-main-seed-pinned.png](repository-main-seed-pinned.png): the same seed clicked, so pinned: its group grown by two hops, the second dimmed, and every other group's seed standing dimmed beyond, one click away; the sidebar's "n of 914 files shown".
- [repository-whole-after-180s-software-renderer.png](repository-whole-after-180s-software-renderer.png): the Whole toggle pressed from the pinned picture: all 914 files, the islands and the lone files born on the outside of the mass and standing around it as the clusters at the rim, the pin the one name. After 180 seconds of the software renderer and still moving; the headless twin comes to rest in 461 ticks.
- [toolbar-whole-toggle.png](toolbar-whole-toggle.png): the toolbar, with the Whole toggle in the group where Compact and Relaxed stood.
- [repository-structure-start-names-at-18px.png](repository-structure-start-names-at-18px.png): the Structure start, the root with its children; the root named as asked about and two files named because their spheres draw past the Name At lever's 18 px at this closeness; the rest unnamed. At rest in 4.6 seconds.
- [knowledge-sources-groups.png](knowledge-sources-groups.png): the Groups section of Knowledge Sources, the groups of two or more largest first with their seed as a link into the 3D map and their file count, "862 files in 42 groups; 53 files alone" over the whole scan.
- [repository-2d-whole-around-generator.png](repository-2d-whole-around-generator.png): the 2D Local Map with the Whole toggle pressed around a selected file: the root opened, its own level drawn around the retained branches. The 2D meaning of Whole is the root opening the map already had; the owner's guess at it is in [ideas](../../Memory/ideas.md#asked-for-or-loved-by-the-owner), and whether this is that is for their eye.

## The ring (November 2, the second session's evening, pictured November 3 UTC)

Taken by the Claude Code root agent (Fable 5.1) after the build of B from [Turns 9 and 10 of the November 2 record](../../ChatHistory/2026/11/2026-11-02.1.record.md#turn-9): a ring on every sphere that has connections not shown, the frontier's dimming kept. This repository's bundle and the estate sample's, served locally, in headless Chromium at 1440 × 960; the close-ups are the same page at two or three device pixels to the CSS pixel, clipped. The software renderer draws about nine frames a second; each caption says whether the picture is at rest.

- [ring-archipelago.png](ring-archipelago.png): the Connections start, the archipelago: 94 spheres, the 42 seeds of the groups ringed and the 52 lone files bare, nothing grown. At rest in 1.8 seconds. The legend's last row reads "Ring: more connected, not shown; click to see it".
- [ring-archipelago-close.png](ring-archipelago-close.png): the same picture at three to one around the largest group's seed: the ring stands off the sphere by a gap and is as wide as the gap, at every size of sphere; a bare sphere is a lone file.
- [ring-seed-hovered-close.png](ring-seed-hovered-close.png): that seed hovered: its ring and name full, the other rings faded with the rest of the picture; the hover's title says "16 public symbols · 466 files in this group · 51 more connected, not shown".
- [ring-seed-pinned.png](ring-seed-pinned.png): the seed clicked, so pinned: its group grown by two hops, 203 spheres, with 86 rings, every one on a dimmed sphere: the frontier, whose connections past the second hop are not shown, and the other groups' seeds. No ring stands on a full sphere, since a sphere within the hops has every connection shown. At rest in 65 seconds.
- [ring-seed-pinned-close.png](ring-seed-pinned-close.png): the pinned picture at three to one around the pin: the full spheres of the first hop bare among the ringed, dimmed frontier.
- [ring-legend.png](ring-legend.png): the legend of a grown picture, with Width, Dimmed and the Ring row.
- [ring-estate-seed-pinned.png](ring-estate-seed-pinned.png): the estate sample with its largest group's seed pinned: 19 of 36 files, seven ringed, the names of the first hop standing. At rest in 9 seconds.
- [ring-frontier-close.png](ring-frontier-close.png) and [ring-frontier-hovered-close.png](ring-frontier-hovered-close.png): a ringed frontier sphere of the estate, Hub/App.config, at two to one, bare and then hovered, when its title says "1 more connected, not shown".

The pictures are the owner's to judge: B was their lean, not their choice. The specs that keep the ring are `tests/e2e/force-graph-discovery.spec.ts` (every rendered sphere ringed exactly when the scope counts connections beyond it, at the start and after a pin) and `tests/e2e/spatial-legend.spec.ts` (the row).
