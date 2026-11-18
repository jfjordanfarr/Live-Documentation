# Pin management: the gates, the first look and the measurements

_Historical record, October 14, 2026, by the root Claude Code agent (Fable 5.1). It closes Turn 11 of the October 13–14 Codex session, whose implementation of [the owner's pin-management design](../../../ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs) was left uncommitted when that harness stopped at its usage limit; [the October 14 record](../../../ChatHistory/2026/10/2026-10-14.1.record.md#turn-2) names the commit that carries the implementation together with this record. The behaviour itself is described in [the Explorer design](../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md); this report records what was verified and measured, not a universal verdict._

## What the Codex session built

A lower-right pin tray listing retained directories, files and symbols newest first, each released on its own, with a clear-inside action on directory rows and Clear all; releasing a directory no longer cascades to a child opened in its own right; with nothing retained, 2D lands on the scan root's own files and closed child directories; Compact and Relaxed as icon buttons with a tuning button, centred beside 2D/3D; an ancestry control on each membrane that unfolds the ancestor choices in a popover at viewport text size; and, in 3D, optional directory hubs behind the Show Directories checkbox, each file and child directory joined to its immediate parent by one containment link in the same degree-normalized spring, with Directory Connections choosing whether those lines are drawn at rest or only on hover and focus. Retention order travels in shared links. Eight new source and test files; the layer-4 mirrors carry their authored sections.

## The first gate and its four corrections

The Codex session's first full `safe:commit -- --e2e` on this work passed lint, builds, 997 unit and 52 integration tests, regeneration without drift and the three audits, and ended 113 of 117 browser tests in 19.6 minutes. The four, and what was done about each at its cause, from [the session's own notes](../../../ChatHistory/2026/10/2026-10-13.1.record.md#first-full-gate-outcome-and-corrections):

| Failing test | Cause and correction |
| --- | --- |
| `explorer-history.spec.ts` › an opened folder is a step back, and pins made in it are not | A stale assertion about the old pin controls, updated to the tray. |
| `explorer-navigation.spec.ts` › old view links migrate, including compressed folders, pins and stale identities | The same; the migration assertions themselves are unchanged. |
| `local-map-branches.spec.ts` › a lane's slots spread to the wires through them where the wires ask | The repository chain scene it measured had changed under it and no longer needed widened slots: 38 lanes, all at their natural pitch. The test now measures the estate's chain, whose 9 lanes include two that do (height 99 with slots at 9 and 89; height 197 with slots at 9, 173, 180 and 187), waits for the settled picture, and keeps every pitch, padding and positive-spread assertion. [lane-candidates.json](lane-candidates.json) is the probe's data for both scenes and [lane-estate-chain.png](lane-estate-chain.png) the estate chain it inspected. |
| `local-map-presets.spec.ts` › packing, advanced edits, export and sharing remain coherent across representations: generator | Exceeded the 30-second limit. Native accessor setters were recreating geometry and materials on every tuning change; unchanged attention and sphere-size settings now keep their accessors, and the publisher page closes once its exported settings and URL are captured instead of rendering on beside the recipient. The test passed in 26.6 seconds with the limit unchanged. |

Those corrections passed in focused reruns; the docs were regenerated and both bundles rebuilt; then the harness stopped. No second full gate had run.

## The second gate, October 14

Run by the October 14 session on the unchanged working tree before any picture was retaken: lint, both bundles and the generator built, test type-checking, 997 unit tests in 102 files, 52 integration tests in 10 files, documentation-link enforcement, 651 Live Docs regenerated with none changed, the markdown audit over 885 files with no broken link, the asset audit and the symbol audit over 882 files with no issue, and all 117 browser tests in 13.9 minutes. Exit 0. No check, threshold or timeout was changed.

## The first look, from the gated build

The scratch scripts of the Codex session were rerun unchanged against the gated build. Seven of its nine final 2D pictures from 05:18 UTC came out byte-identical; `04-root-landing.png` and `2d-repository-five-pins.png` differ in bytes but not in anything the eye finds. Its 3D pictures dated from 03:11 UTC, before the last source edits, so every 3D picture is from the rerun. [The screenshot record](../../../Screenshots/2026-10-14/README.md) names all 23.

[first-look.json](first-look.json): after Clear all on the four-pin scene, the tray reads `0 pins` with no rows and the map shows three closed directories at the root; after reloading that URL, `0 pins` and three directories again; no page errors. The five-file deck scopes list 5 independently releasable entries each, on this repository and the estate.

[spatial-first-look.json](spatial-first-look.json) and [close-look.json](close-look.json), the 3D measurements through Three's development-tool event on the real meshes, in overview and close up:

| Bundle | Nodes | Directory hubs | Visible containment links, lines off → on | Largest sphere movement on toggling | Camera on toggling | Leaf hub hovered | Parent hub hovered |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| Estate | 53 | 18 | 0 → 52 | 0 | unchanged | `Portal/Models`, 2 visible files | `Portal`, 11 visible files |
| Repository | 824 | 236 | 0 → 823 | 0 | unchanged | `tests/integration/programs/java/basic/src/com/example/data`, 2 visible files | `tests/integration/programs/java/basic/src/com/example`, 5 visible files |

Toggling Directory Connections therefore changes only what is drawn, as the design says: the containment links are in the simulation either way. The repository counts are one higher than the Codex session's own 03:11 reading (823 nodes, 822 links) because the bundle gained a file after it.

Decoded in the browser and compared pixel by pixel over the map area, right of the sidebar and below the path bar, the lines at rest change 3,770 of 1,239,500 map pixels on the estate overview (0.30%), 12,997 on the repository overview (1.05%), 43,102 on the estate close-up (3.48%) and 44,134 on the repository close-up (3.56%); the picture pairs are otherwise identical.

## Open for the owner's eye

- **Membership lines at rest or only on hover and focus.** Both are pictured, in overview and close up. In overview they are hard to tell apart; close up the lines at rest are a hub's spokes. The shipped default is off.
- **Recursive membership.** Hovering a parent hub lights its files and child hubs across the subtree and dims the rest; pictured on both bundles. Drawn at rest on the repository, the 823 lines are the same faint web as its code connections.
- **The tray over the map.** The open tray covers the right-hand part of the 2D map; in the four-pin scene the `main.ts` card sits partly under it, and on the dense five-file scopes membranes and cards do. It collapses from the pins button.
- **The ancestor disclosure.** An indented stack in a popover rather than a row of small labels, as the owner asked to try; its look awaits their judgment.
