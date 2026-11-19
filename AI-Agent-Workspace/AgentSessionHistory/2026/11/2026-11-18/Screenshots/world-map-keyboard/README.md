# The World Map's keyboard round: pictures and the run before

_Historical evidence, taken 2026-11-18 by the builder of the round. The design system's check that found the six defects was asked for in [Turn 14 of the November 18 record](../../2026-11-18.1.record.md#turn-14); what the code does now is in [the controller's Live Doc](../../../../../../../.mdmd/layer-4/packages/explorer/src/client/views/worldMap/controller.ts.mdmd.md)._

**The setup.** This repository's Explorer at 1280 × 800 in headless Chromium, the World Map over this repository's board, built from the round's code. The pictures were taken by a script that drives the page with a real pointer and real keys. Only the tests' handle was used to make the camera instant and to clear the stored layout first.

## The reset and its way back

Before this round, Reset layout (R) threw every position away and saved at once. Now a reset keeps what it discarded until a piece is next moved; until then the same tool, or R, puts it back. The tool's name stays "Reset layout"; it shows pressed while it can put things back, and its tooltip says "Put things back where you had them (R)". A native tooltip is not drawn in a screenshot, so the script printed the state at each picture.

| Picture | What it shows | What I see |
| --- | --- | --- |
| `01-arranged-reset-unpressed.png`, `01-arranged-reset-unpressed-tools.png` | Two pieces moved by hand: `engine` up into the GitHub region's corner, `scripts` down and left. Printed: not pressed, "Reset layout (R)", engine at 6.81, 4.84. | `engine` sits beside `live-docs` among the GitHub pieces, its label crowding theirs; `scripts` stands lower, by `tests`. The reset tool, the curved arrow second from the right, is plain like Fit and Save. |
| `02-reset-pressed.png`, `02-reset-pressed-tools.png` | After a click on Reset layout. Printed: pressed, "Put things back where you had them (R)", engine at 3, 13. | Every piece is back where the board's Layout rests it: `engine` at the left of the repository region, `scripts` under `explorer`. The reset tool is filled with the pressed wash and drawn in the offering blue, the same look as any toggle that is on. |
| `03-put-back-unpressed.png`, `03-put-back-unpressed-tools.png` | After R pressed on the board. Printed: not pressed, "Reset layout (R)", engine back at 6.81, 4.84. | The board is `01` again, piece for piece. The tool is plain again and wears the keyboard's focus ring, since the last act came from a key. |

## The keyboard

| Picture | What it shows | What I see |
| --- | --- | --- |
| `04-toolbar-arrows-ring.png` | The first tool given the keyboard, then the right arrow twice. | The ring stands on the third tool, Look straight down. The other tools are plain. The toolbar is one Tab stop; the arrows move inside it. |
| `05-board-pressed-no-ring.png` | A click on an empty part of the board. The script printed that the view's own element, `.world`, has the keyboard. | No ring around the view and nothing else changed: the board takes the keyboard without showing it, so its letters work after a click. |
| `06-help-open.png` | `?` pressed with the board holding the keyboard. The help button's `aria-expanded` was `true`. | The help panel stands over the right of the board. Its key line now reads "R reset, and again to put back", followed by a sentence saying that the keys work while the board has the keyboard. The panel covers the toolbar, as it did before this round. |

## The cases, against the build before

The six new cases in `tests/e2e/world-map.spec.ts` were run against a bundle built from `533dcbb0`'s World Map source (the round's two source files put back, the Explorer built, the bundle swapped in). All six failed, each for the defect it names:

| Case | Failed on the old build at |
| --- | --- |
| the board's letters act only while the keyboard is on the board | "D from the sidebar": the theme switched to dark with the keyboard on a sidebar link |
| a reset keeps what it discarded | the reset tool had no `aria-pressed` |
| under reduced motion the camera arrives at once | "a quarter turn": one frame after Turn right, the camera had hardly turned |
| the help button says whether the help is open | no `aria-expanded` |
| the walkthrough says each step | no status region in the view |
| the toolbar is one Tab stop | nine tools were Tab stops, not one |

On the round's build the whole spec file ran, and 34 of 35 cases passed. The one failure was "the pinned panel stands beside its piece …": unfolded, the panel's foot stood at 745.6 px against the view's 720. Run twice more on each build, that case passed every time, on the old build and on the round's. So it fails now and then, and this round did not cause it; it is not mended here.

`tests/e2e/inspection.spec.ts` has a case, "one Escape closes only the topmost surface", that opens the World Map's help by pressing `?` while the keyboard is on the page's body. Now that the letters are the board's alone, that press does nothing and the case fails. It belongs to another set of files and is left to the root.
