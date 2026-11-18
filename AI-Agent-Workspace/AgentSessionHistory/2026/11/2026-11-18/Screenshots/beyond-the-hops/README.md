# Beyond the Hops: Everything and Next step at one, two and three hops

_Historical evidence, taken 2026-11-18 by the builder of the trial. The trial is described in [the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md); the owner's thought that asked for it is [Turn 10 of the November 18 record](../../2026-11-18.1.record.md#turn-10)._

**The setup.** This repository's Explorer at 1280 × 800, built from the trial's commit with the ring mend under it.
- **Pin:** `packages/engine/src/live-docs/archetype.ts`, Connections.
- **Switches:** Show Tests, Show Related Docs and Show Citing Docs on.
- **Looks:** marbles on, Group Wrappers at Skin, Shell Depth 2.
- **The lever:** Beyond the Hops at "Everything" or "Next step", set in the link.

Each picture is a fresh page; the camera is the page's own fit of what it holds. A fixed camera was not used: the two choices hold pictures of very different sizes, and a camera that fits one leaves the other a speck. The pair at each hop sorts together.

| Picture | What I see |
| --- | --- |
| `hops-1-everything.png` | The pinned cluster and the large `integration · 240` membrane among the 33 wrapped groups of the rest of the repository, scattered around as islands. The picture is mostly membranes. |
| `hops-1-next-step.png` | A tight picture filling the frame: the pin and its seven connections, with nine membranes beside them (`engine · 79`, `explorer/src · 51`, `e2e · 8`, `Scan root · 3` among them) and two lone files. There are no islands; the rest of the repository is not drawn. |
| `hops-2-everything.png` | The two-hop web around the pin, small in the middle of a wide frame. The `integration · 220` membrane hangs below it, and the islands are scattered all around. |
| `hops-2-next-step.png` | The same web, framed large, with twelve membranes at its rim (`integration · 8` now, not 220) and two lone files. The wires are readable. |
| `hops-3-everything.png` | The three-hop web, small in a wide frame, with the islands around it and `integration · 212` beside it. |
| `hops-3-next-step.png` | The three-hop web framed large, with nine membranes at its rim (`integration · 74` among them) and three lone files. |

**Counts**, from the buffers the page draws; each agrees with the bundle reckoned by the page's own pure functions:

| Hops | Beyond the Hops | File spheres (lone among them) | Documents | Membranes: directory + group | Files held in membranes | Files of the scan not in the picture |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Everything | 69 (6) | 1 | 14 + 33 = 47 | 965 | 0 |
| 1 | Next step | 9 (2) | 1 | 9 + 0 = 9 | 184 | 841 |
| 2 | Everything | 253 (4) | 11 | 14 + 33 = 47 | 781 | 0 |
| 2 | Next step | 195 (2) | 11 | 12 + 0 = 12 | 269 | 570 |
| 3 | Everything | 522 (2) | 74 | 11 + 33 = 44 | 512 | 0 |
| 3 | Next step | 467 (3) | 74 | 9 + 0 = 9 | 182 | 385 |

The scan holds 1,034 files with tests shown and assets not. Under Everything every one of them is in the picture, as a sphere or inside a membrane. The unreached seeds are file spheres too, which is why Everything shows more spheres at each hop.

**The page's own measures**, each the sum over that page's life of `performance.measure` entries in milliseconds (a single run, the graphics card drawing):

| Hops | Beyond the Hops | Partition (`live-docs:shells`) | Packing (`live-docs:body-packing`) | Hulls (`live-docs:wrapper-hulls`) | From load to the busy flag down (s) |
| --- | --- | --- | --- | --- | --- |
| 1 | Everything | 6.1 | 93.0 | 50.9 | 7.4 |
| 1 | Next step | 2.7 | 30.3 | 13.2 | 7.2 |
| 2 | Everything | 4.7 | 94.8 | 33.4 | 18.5 |
| 2 | Next step | 6.0 | 51.6 | 15.4 | 17.0 |
| 3 | Everything | 4.3 | 74.6 | 32.3 | 18.5 |
| 3 | Next step | 3.8 | 25.8 | 17.2 | 15.4 |

The partition is a few milliseconds either way. The packing and the hulls take a third to two thirds as long under Next step, because fewer bodies are built. The time to rest is mostly the simulation's and the reveal's, and it changes little.

**`frames/`: the Hops lever moved from 1 to 2 and then to 3 under Next step**, on one page, the camera following as the page does. It is a run of frames, not a clip; the file names say when each was taken.
- `frame-00` is one hop at rest.
- `frame-02` and `frame-04`, one and two seconds after the change to two hops: the `engine` membrane has shrunk to 61 as its files enter as spheres, and `explorer · 122` has formed where `explorer/src · 51` stood, the next ring out.
- `frame-07` is two hops at rest.
- `frame-09` and `frame-11` are one and two seconds after the change to three: the web thickens, and the camera is still drawing back.
- `frame-14` is three hops at rest.

The membranes break as their files become hops and form again one step further out. That is the form-break-re-form the owner asked about.
