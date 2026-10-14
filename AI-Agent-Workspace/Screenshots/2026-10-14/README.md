# October 14, 2026 — Pin management in the morning, and the 3D Local Map's two layouts in the afternoon

_The first section: pictures by the root Claude Code agent (Fable 5.1) of the build that passed the full gate on 2026-10-14: 997 unit, 52 integration and all 117 browser tests. The work is Turn 11 of the October 13–14 Codex session, approved by the owner in [the October 14 implementation request](../../ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs) and finished by [the October 14 session](../../ChatHistory/2026/10/2026-10-14.1.record.md) after the Codex harness stopped at its usage limit. The capture scripts that session left in scratch were rerun unchanged against the gated build; the close-up pair was added by this session. [The probe record](../../Probes/2026-10-14/pin-management/README.md) keeps the measurements and the gates._

Every picture is 1600×1000 unless stated, taken in headless Chromium from the repository bundle (651 files) or the estate sample (35 files), with tests shown and assets hidden except where the deck scopes show them. Each was opened and inspected. No page errors were observed in any capture.

## The tray and its releases, 2D

The scene: `processor.ts` selected inside the open `rosetta/src` directory, with its parent `rosetta` also open, `main.ts` pinned whole and processor's `run` pinned, retained in the order rosetta, main.ts, src, run.

| Picture | What it shows |
| --- | --- |
| [01-retained-tray.png](pin-management/01-retained-tray.png) | Relaxed layout with the tray opened from the "4 pins" button at the lower right: four rows newest first, `run`, `src`, `main.ts`, `rosetta`, each with its own release; the directory rows also carry the clear-inside action. The tray overlays the right edge of the map, and the `main.ts` card sits partly under it. |
| [01b-compact-tray.png](pin-management/01b-compact-tray.png) | The same after the Compact icon button, now pressed in the bottom-centre control; the cards pack closer and the tray is unchanged. |
| [02-ancestor-disclosure.png](pin-management/02-ancestor-disclosure.png) | Relaxed again, with the ancestry control of the `src` membrane opened: a popover at viewport text size listing Scan root, tests, integration, programs, typescript and rosetta as an indented stack, each a choice. The single-child chain stays compressed in the membrane's own label. |
| [03-release-parent.png](pin-management/03-release-parent.png) | After releasing `rosetta` from its row: the `src` membrane and the other pins survive, now 3 pins. Releasing a parent no longer cascades to a child opened in its own right. |
| [03b-narrow-tray.png](pin-management/03b-narrow-tray.png) | The same state at 900×700: the tray keeps its rows readable and the path bar wraps above the map. |
| [04-root-landing.png](pin-management/04-root-landing.png) | After Clear all: no retained selections, 0 pins, and the map lands on the scan root's own files and closed child directories, packages, tests, scripts and package.json, without manufacturing a root pin. |
| [04b-root-restored.png](pin-management/04b-root-restored.png) | The root landing after a reload of its own URL: the same picture with the tray closed. |

## Five pins on the deck scopes, 2D

| Picture | What it shows |
| --- | --- |
| [2d-repository-five-pins.png](pin-management/2d-repository-five-pins.png) | This repository's five-file scope from the still-picture deck, zoomed out two steps, with the tray listing its five files as independently releasable rows. |
| [2d-estate-five-pins.png](pin-management/2d-estate-five-pins.png) | The estate's five-file scope the same way. In both, the open tray covers the right-hand part of the map. |

## Directory hubs in 3D

Show Directories on, no pins, each bundle framed by wheel gestures until every sphere is in view. Amber spheres are directory hubs; each file and each child directory has one containment link to its immediate parent, in the simulation whether or not the line is drawn. The close-up pairs were zoomed in by wheel on one hub, the estate's `Portal/Models` and this repository's `packages/explorer/src/client/views/localView`, then the pointer was moved off the map before either picture, so both share one camera.

| State | Estate, 53 nodes with 18 hubs | Repository, 824 nodes with 236 hubs |
| --- | --- | --- |
| Membership lines only on hover or focus: Directory Connections off, the default | [3d-estate-membership-hover-only.png](pin-management/3d-estate-membership-hover-only.png) | [3d-repository-membership-hover-only.png](pin-management/3d-repository-membership-hover-only.png) |
| Membership lines drawn at rest: Directory Connections on | [3d-estate-membership-visible.png](pin-management/3d-estate-membership-visible.png) | [3d-repository-membership-visible.png](pin-management/3d-repository-membership-visible.png) |
| Close up, lines only on hover or focus | [3d-estate-close-membership-hover-only.png](pin-management/3d-estate-close-membership-hover-only.png) | [3d-repository-close-membership-hover-only.png](pin-management/3d-repository-close-membership-hover-only.png) |
| Close up, lines at rest, the same camera | [3d-estate-close-membership-visible.png](pin-management/3d-estate-close-membership-visible.png) | [3d-repository-close-membership-visible.png](pin-management/3d-repository-close-membership-visible.png) |
| A parent hub hovered: recursive membership, `Portal · 11 visible files` and `tests/integration/programs/java/basic/src/com/example · 5 visible files`, the members and child hubs lit and everything else dimmed | [3d-estate-recursive-hover.png](pin-management/3d-estate-recursive-hover.png) | [3d-repository-recursive-hover.png](pin-management/3d-repository-recursive-hover.png) |
| A leaf hub hovered: `Portal/Models · 2 visible files` and `tests/integration/programs/java/basic/src/com/example/data · 2 visible files` | [3d-estate-directory-hover.png](pin-management/3d-estate-directory-hover.png) | [3d-repository-directory-hover.png](pin-management/3d-repository-directory-hover.png) |
| That hub clicked: retained in the tray as a directory row with the clear-inside action, the camera framing the hub with its members, and the context set to the directory | [3d-estate-directory-pin.png](pin-management/3d-estate-directory-pin.png) | [3d-repository-directory-pin.png](pin-management/3d-repository-directory-pin.png) |

What the eye finds, for the owner's choice between the two membership-line variants: in overview the two are hard to tell apart in either bundle, because the containment lines are drawn as faint lines like the code connections; the measured difference is 0 against 52 visible containment links on the estate and 0 against 823 on the repository, with no sphere moved and the camera unchanged. Close up, the lines at rest read as a hub's spokes to its files and to its child hubs. Recursive membership on hover reads clearly on both bundles because nothing else is lit; drawn at rest, the repository's 823 lines are the same faint web as its code connections. Counted in the browser from the pictures themselves, the lines at rest change 0.30% of the estate's map pixels and 1.05% of the repository's in overview, and about 3.5% of either close up.

## The 3D Local Map's two layouts, the afternoon of October 14

_Pictures of the structure layout's first build, taken by the root Claude Code agent (Fable 5.1) with a script of its own against both bundles served from `dist/explorer`, before the full gate; the gate's browser spec reads the same meshes. The design is the owner's of this afternoon ([Turns 3 and 4 of the record](../../ChatHistory/2026/10/2026-10-14.1.record.md#turn-3)): the directory hubs out of the connectivity layout and into a layout of their own, the emergent tree of what the file system declares beside the emergent network of what the code does. [The probe record](../../Probes/2026-10-14/structure-layout/README.md) keeps the measurements._

Every picture is 1600×1000, tests shown, assets hidden, no pins. Amber spheres are directory hubs, blue files, green tests. "Framed" means wheel gestures until every sphere is in view, the pointer then moved off the map.

| State | Estate, 35 files | Repository, 588 files |
| --- | --- | --- |
| The connections layout, framed: the references pull and are drawn | [3d-estate-connections.png](structure-layout/3d-estate-connections.png) | [3d-repository-connections.png](structure-layout/3d-repository-connections.png) |
| The first frame after the Structure button: the hubs appear inside the cloud of files, each at the centroid of its members, the files where they stood | [3d-estate-switch-0000ms.png](structure-layout/3d-estate-switch-0000ms.png) | [3d-repository-switch-0000ms.png](structure-layout/3d-repository-switch-0000ms.png) |
| 300 ms after the click: the tree has largely formed from there | [3d-estate-switch-0300ms.png](structure-layout/3d-estate-switch-0300ms.png) | [3d-repository-switch-0300ms.png](structure-layout/3d-repository-switch-0300ms.png) |
| 700 ms, 1.5 s and 3 s after: the settling | [700 ms](structure-layout/3d-estate-switch-0700ms.png), [1.5 s](structure-layout/3d-estate-switch-1500ms.png), [3 s](structure-layout/3d-estate-switch-3000ms.png) | [700 ms](structure-layout/3d-repository-switch-0700ms.png), [1.5 s](structure-layout/3d-repository-switch-1500ms.png), [3 s](structure-layout/3d-repository-switch-3000ms.png) |
| The structure layout, framed: every file hangs from its directory's hub and every hub from its parent's, each hub sized by what it holds; no reference drawn at rest | [3d-estate-structure.png](structure-layout/3d-estate-structure.png) | [3d-repository-structure.png](structure-layout/3d-repository-structure.png) |
| A file hovered, its references drawn and the rest dimmed: `Default.aspx` with two, `Quantity.java` with nine | [3d-estate-structure-file-hover.png](structure-layout/3d-estate-structure-file-hover.png) | [3d-repository-structure-file-hover.png](structure-layout/3d-repository-structure-file-hover.png) |
| A parent hub hovered, its subtree lit and the references within and out of it drawn: `Portal · 11 visible files` with thirteen, the Java warehouse's package with thirty-three | [3d-estate-structure-hub-hover.png](structure-layout/3d-estate-structure-hub-hover.png) | [3d-repository-structure-hub-hover.png](structure-layout/3d-repository-structure-hub-hover.png) |
| That hub clicked: retained in the tray, the camera framing its members, the references among them drawn | [3d-estate-structure-hub-retained.png](structure-layout/3d-estate-structure-hub-retained.png) | [3d-repository-structure-hub-retained.png](structure-layout/3d-repository-structure-hub-retained.png) |
| The way back, 300 ms and 1.5 s after the Connections button: the hubs gone and the same files unfolding into the network | [300 ms](structure-layout/3d-estate-unfold-0300ms.png), [1.5 s](structure-layout/3d-estate-unfold-1500ms.png) | [300 ms](structure-layout/3d-repository-unfold-0300ms.png), [1.5 s](structure-layout/3d-repository-unfold-1500ms.png) |

[controls-structure.png](structure-layout/controls-structure.png) is the bottom-centre control in 3D: Compact and Relaxed, the tuning button, 2D and 3D, then the two new buttons, Connections and Structure, with Structure pressed.

What the eye finds: the fold is fast, most of the motion over within 300 ms, and the picture then settles slowly through the library's fifteen-second cooldown. The containment lines are drawn at a third of full strength and read faint in overview; close to, as the retained-hub pictures show, they read as the tree. On this repository the structure layout reads as clusters, one per directory, about the root's hub. The revealed references of a hovered file read in overview only by the files they light; the hub pictures show them as lines.
