# Screenshots, October 10, 2026

Pictures of the built Explorer taken by the agent after changing it, as [AGENTS.md](../../../AGENTS.md) asks. This folder's pictures belong to [Turn 12 of the October 9 session](../../ChatHistory/2026/10/2026-10-09.1.record.md#turn-12), which continued into October 10: the first drawing of ghosts on the World Map, the owner's word for a call that nothing on the board serves. Every picture is of the estate sample's bundle, `samples/estate/`, built by `npm run live-docs:visualize:estate` from one scan of the sample, at 1,400 by 900 CSS pixels, zoomed in by 1.6 on the hub, whose `App.config` names a staging address of the payment service that no thing listens on.

## A ghost on the World Map

| Capture | State |
| --- | --- |
| [estate-ghost-at-rest.png](estate-ghost-at-rest.png) | At rest. On the hub's wall that faces away from the board's middle, a dashed green door, a door that uses, with a short dashed stub into the air ending in a small empty ring: the staging address, called and unserved. The served doors and the wires are as before; the ghost is drawn as faintly as a thing nobody answers deserves, and reads on a second look. |
| [estate-ghost-pinned.png](estate-ghost-pinned.png) | The ghost pinned. Its panel names the address, calls it a ghost, says it is a call the hub makes that nothing on the board serves and that pointing at the folder that serves it would make it a wire, names `Hub/App.config` as where the call is made, and says its basis, from configuration. The hub's three door labels show, settled off each other and off the names, the ghost's long one among them. |
| [estate-hub-pinned-calls-out.png](estate-hub-pinned-calls-out.png) | The hub pinned. Its panel gained a "calls out to" line between "called by" and "stands on": the address with its basis and the file that names it, then "nothing on the board serves it; a ghost until something does". |

Door labels had never shown on hover before these pictures: the stylesheet hid them and the hover cleared only an inline style, so they stayed hidden, and nobody had seen them collide. They show now, settle like the other movable labels after every hover, and the estate's spec audits them with the hub pinned.

## This repository's board as its delivery shape

Pictures of [Turn 14 of the same session](../../ChatHistory/2026/10/2026-10-09.1.record.md#turn-14): the repository's own bundle, `npm run live-docs:visualize`, over `.mdmd/layer-3/board.mdmd.md` re-authored as the delivery shape the owner chose from [the T2 probe](../../Probes/2026-10-10/delivery-shape.md), the package first, with its unbuilt parts imagined. At 1,600 by 1,000 CSS pixels, the board fitted to the viewport.

| Capture | State |
| --- | --- |
| [repository-board-at-rest.png](repository-board-at-rest.png) | At rest. Fifteen things in two regions. The real ones are solid, drawn from their docs: the engine, the generator and the Explorer, the scripts, the tests, and the sample programs and fixtures carved out of the tests. The eight imagined ones are hollow, dashed and all but unfilled, with their kind under their name and no word for their state: the `live-docs` package, the action, the panel, the three workflows, the Pages site and the registry. Every wire to or from an imagined thing is declared, dashed and green. A region's name now sits just outside its left point, off the feet of the things at its corners. |
| [repository-board-dark.png](repository-board-dark.png) | The same at rest on the dark board. |
| [repository-board-live-docs-pinned.png](repository-board-live-docs-pinned.png) | The imagined package pinned. Its panel says it is imagined with no folder yet and nothing inside to open, calls the engine, the Explorer and the generator, and is called by the action and the panel. Its door labels show on both sides of their doors, which is new: a label crosses to the other side when no step up or down clears it. |
| [repository-board-pages-door-pinned.png](repository-board-pages-door-pinned.png) | The site's address pinned: a door declared on the board that nothing on the board uses, drawn dashed with a blue stub into the air and an empty ring at its end, the mirror of a ghost. Its panel calls it a door declared and says a thing that called it would draw a wire. |
| [repository-board-wanting.png](repository-board-wanting.png) | Not the shipped bundle but a copy of it whose board text was given two faults, a thing whose folder has no docs and a connection to a door nothing serves: the crumbs count "2 wanting" and the help lists both lines as `live-docs:board` would print them. The shipped board has none. |
