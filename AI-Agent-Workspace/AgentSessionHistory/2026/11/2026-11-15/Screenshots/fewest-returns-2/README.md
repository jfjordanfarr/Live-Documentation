# A return as one term of the price: pictures

_Historical evidence, taken 2026-11-16 for the second milestone of the round of [Turn 5 of the November 15 record](../../2026-11-15.1.record.md#turn-5): a cycle's order chosen by the ranking's own price, a return costing the Return Cost more than its columns ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md))._

Every picture is a file opened alone in the 2D Local Map (`/?view=local&node=<file>`) or the opened `localView` directory, at 1440 by 900 with the page's default tuning, after the Fit control, cropped to the map. "Greedy" is the bundle built at `3f734433`, the ranking's greedy order; "fewest" the first milestone's build, every cycle returning the fewest references; "cost 2" this milestone's ranking at a return cost of 2; "default" this milestone's ranking at the default, 0.25. Each sheet stands two pictures side by side, greedy on the left.

| Pictures | What they are for |
| --- | --- |
| `greedy-against-fewest-sheet-01.png` … `-17.png` | The 34 pictures the fewest-returns order changed, two to a sheet in the order of the measurement's table: the reading of each (better, mixed, neutral, only scores better) in [the measurement](../../Probes/fewest-returns-2/README.md) comes from these. |
| `greedy-against-cost-2-sheet-01.png`, `-02.png` | `branch-scene.ts`, `branches.ts` and the `localView` directory at a cost where the ranking keeps an order that returns more references than the greedy order (the page draws 4 → 6, 4 → 4 and 10 → 11): each is narrower with shorter wires, and reads better. |
| `greedy-against-default-sheet-01.png`, `-02.png`, and `whole-greedy-*.png`, `whole-default-*.png` | The four pictures of the first milestone at the default. |
| `greedy-against-default-registry.png` | `adapters/index.ts` at the default, the picture on the wrong side: 22 drawn returns where there were 34, but its adapters stand in one column of eighteen and the fitted picture is a narrow tower too small to read. It reads worse. |
| `return-cost-lever.png` | The Return Cost slider in Tuning → 2D Layout. |

At the default, in my reading:

- `branch-renderer.ts` (8 → 6 drawn returns): reads better. `controller.ts`, which uses the subject six times, stands to its right; the fan into the subject is gathered and the long wires are gone. The two small cards past the subject still look a little stranded.
- `adapters/manifest.ts` (1 → 0): reads better. Four columns instead of six, every adapter in one column right of the manifest, and the 3D button no longer lights.
- `live-docs/core.ts` (7 → 6): mixed. Not the fewest-returns order but one on the way to it, which the price finds cheaper: `adapters/index.ts` stands left of `core.ts` and most adapters fall into one tall column, so far fewer wires cross the picture, but the tall column shrinks the fitted picture.
- `adapters/powershell.ts` (2 → 2): unchanged, as it should be. Returning one reference fewer would cost two columns, and the default prices a return at a quarter of a column; it leaves the greedy order only at a cost above 20.
