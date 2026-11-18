# The 3D Local Map's two layouts: the measurements of the structure layout's first build

_Historical record, October 14, 2026, by the root Claude Code agent (Fable 5.1), of the structure layout as first built, before its gate; [the October 14 record](../../../ChatHistory/2026/10/2026-10-14.1.record.md#turn-4) names the commit. The design is the owner's of that afternoon, recorded in [the Explorer design](../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md) and [the decisions log](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-3d-local-map-has-two-layouts-analyzed-connections-and-declared-structure-recorded-2026-10-14); [the screenshot record](../../../Screenshots/2026-10-14/README.md#the-3d-local-maps-two-layouts-the-afternoon-of-october-14) names the pictures._

## What the page measured

[structure-look.json](structure-look.json), read from the rendered meshes through Three's development-tool event, both bundles at 1600×1000 with tests shown and assets hidden:

| Bundle | Files | Hubs | Containment links | Reference pairs in the connections picture | Reference objects at rest in the structure picture | Drawn for a hovered file | Drawn for a hovered parent hub | Root hub's radius | Largest file's radius | Root volume over the sum of the files' | Busy after the switch |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Estate | 35 | 18 | 52 | 60 | 0 | 2 (`Portal/Pages/Default.aspx`) | 13 (`Portal`) | 21.01 | 7.65 | 1.0000000 | 16.1 s |
| Repository | 588 | 178 | 765 | 1,414 | 0 | 9 (`…/warehouse/model/Quantity.java`) | 33 (`…/com/acme/warehouse`) | 55.28 | 19.05 | 1.0000000 | 15.7 s |

The hubs number 178 on this repository where the morning's build inside the connectivity layout had 236: a hub holding nothing but one child hub now collapses into it. The root's volume is the sum of its files' volumes to seven decimals in the spheres themselves, which is the rule the owner asked for: size is exposed surface at every scale. The busy time is the library's cooldown, the same after any reheat; the fold itself is over within about 300 ms in the pictures. No page errors in any capture.

## Two findings while building

- **A spring of strength zero still moved the tree.** The first implementation left every link in the engine's link force and gave the ones that do not pull a strength of zero. The unit test that a reference moves nothing in the structure layout failed: 7.6 units of difference after one tick and 8.4 after three hundred, measured by a scratch probe. D3 counts every link of its force in a node's degree when it splits a spring's motion between its two ends, so a file with many references was sharing its containment spring's motion differently. `pullingLinkForce` now wraps the engine's link force and hands it only the links that pull in the layout, in the page and in the lab alike; the test then passes exactly.
- **A reference hidden at rest has no render object.** The 3D library creates no object for a link whose visibility is false, so the count of reference objects at rest is zero rather than a count of hidden ones, and a search for a connected file to hover must take its candidates from the connections picture read before the switch. The browser spec and the look do.

## The headless twin

The layout lab's `spatial` command grew `--layout connections|structure` in place of the two flags, and its report says of every link whether it pulls in that layout. [Its reports of this afternoon](../layout-lab/) are the estate's five-file scope in both layouts and this repository's in the structure layout, with the lab's default of assets shown: estate structure 53 nodes, 60 reference pairs, 52 containment links, no sphere overlap; repository structure 881 nodes of which 230 hubs, 1,489 reference pairs, 880 containment links, no overlap; estate connections 35 nodes, 60 pairs. The repository report's JSON companion, a megabyte, was not kept; the command reproduces it.

## Open for the owner's eye

- The strength of the containment lines at rest, a third of full, and of the revealed references, half; both read faint in overview and as lines close to.
- The fold's speed, most of it within 300 ms, which is the simulation's own first ticks at full heat.
- The collapsed chains' names, such as `typescript/rosetta`, on the hubs' labels.
- Where the Connections and Structure buttons belong once the controls are consolidated; for now they follow 3D and show only there.
