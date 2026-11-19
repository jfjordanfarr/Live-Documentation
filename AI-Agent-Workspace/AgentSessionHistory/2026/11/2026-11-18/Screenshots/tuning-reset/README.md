# Tuning's Reset to defaults, and the count of what differs

_Historical evidence, taken on the night of 2026-11-18 to 19 by the builder of the Tuning reset round. The request was the owner's of 2026-11-19: "There should be a way for me to quickly reset my visual tuning preferences to their default values so that the links you send me are perceived by both of us in the same way" ([Turn 27 of the November 18 record](../../2026-11-18.1.record.md#turn-27))._

**The setup.** This repository's Explorer, built from the branch `tuning-reset` (`npm run build`, `npm run live-docs:generate`, `npm run live-docs:visualize`) and served on port 8823, at device scale 2, on a 1440 × 900 window and a 390 × 844 one. Each address opens the Local Map on `packages/generator/src/generator.ts`. The viewer's saved settings were seeded with three levers moved, in three groups: Marbles off (Colour), Stub Min 20 (2D Wires) and Column Gap 140 (2D Layout). Tuning was opened from its heading, and Colour and 2D Wires unfolded by hand; 2D Layout opens on its own in 2D.

| Picture | What it shows | What I see |
| --- | --- | --- |
| `folded-count-1440.png`, `folded-count-390.png` | Tuning folded, three settings moved. | Beside TUNING stands a "3" in a thin grey ring, in the text's own tone: quiet, but plain at a glance at either width. Nothing else in the sidebar changed. |
| `open-three-changed-1440.png`, `open-three-changed-390.png` | Tuning open, the same three settings. | Reset to defaults, the World Map's curved-arrow glyph in a 28 px square, stands alone at the top right of the section. A small white dot follows Marbles, Stub Min and Column Gap, and the headings COLOUR, 2D WIRES and 2D LAYOUT; no other lever carries one. The dot reads as "this one is not as it came", and it takes no colour that means something else on the page. At 390 px the page's search bar sits over the sidebar's top, so the section's heading and the button are partly under it once the sidebar is scrolled; that is the phone layout's, not this round's (the phone pass is deferred by the owner). |
| `after-reset-1440.png` | Just after a press of Reset. | The count is gone; every dot is gone; Marbles says On, Stub Min 8, Column Gap 100, and the map's columns have closed up to the default gap. The button now stands pressed, in the blue border, glyph and faint fill every pressed toggle wears, and its tooltip says "Put your settings back as you had them". The page's status region says "Tuning reset to defaults" (not drawn). |
| `after-reset-390.png` | The same at 390 px. | The same, with the section's top under the search bar as above. |
| `after-undo-1440.png`, `after-undo-390.png` | Reset pressed again, by Enter from the keyboard. | The three levers are back at Off, 20 and 140, their dots and the "3" back with them, and the button is released again, with the keyboard's focus ring round it. The status region says "Tuning put back as you had it". |

## What was checked beside the pictures

On both windows, read from the page: the count's sentence was "3 settings changed from their defaults"; after the reset the browser kept `{"version":2}`, nothing of tuning; after the undo it kept the three settings again; and after a second reset and a reload, the levers stood at their defaults, the browser kept nothing of tuning, and the button was disabled, with nothing to reset and no reset to take back.
