# The shell's accessibility round: the frame, the search, the reader, the tray, the text tones

_Historical evidence, taken on the night of 2026-11-18 to 19 by the builder of the shell's accessibility round. The defects come from the design system's audit, which the owner asked for in [Turn 14 of the November 18 record](../../2026-11-18.1.record.md#turn-14) ("to defend the system as it is on paper"). On the text tones there is also the owner's [Turn 20](../../2026-11-18.1.record.md#turn-20): "Dim things are still a bit hard to read."_

**The setup.** This repository's Explorer at 1440 × 900, device scale 2. The "before" pictures come from the main checkout's bundle, built from the same client source as `533dcbb0`. The "after" pictures come from this round's build (`npm run build`, `npm run live-docs:visualize`). Each address opens the Local Map on `packages/explorer/src/client/errors.ts`.

## Before and after

| Picture | What it shows | What I see |
| --- | --- | --- |
| `sidebar-before.png`, `sidebar-after.png` | The sidebar at rest. | DISPLAY, LEGEND and TUNING are a step lighter: `--text-muted`, 5.35:1 on the sidebar, where the disabled grey stood at 2.86. The stats line at the foot (`--text-subtle`) is lighter too: 4.76:1 against 3.67. Nothing moved. |
| `card-before.png`, `card-after.png` | A 2D card at reading size. | The path under the name (`--text-muted`) goes from 4.42 to 5.10:1, and the directory line in italics at the foot from 3.50 to 4.54. The step is small to the eye: the words read as the same quiet grey, only firmer. Every other colour is unchanged. |
| `panel-before.png`, `panel-after.png` | The reader panel for `errors.ts`. | The CODE and GENERATED labels and the section labels are a touch lighter. Nothing else changed: the panel's words were already above the floor. |
| `search-empty-before.png`, `search-empty-after.png` | The search field at rest. | The placeholder now reads clearly (5.43:1, was 2.90). The Ctrl+P keycap is drawn in the panels' blue-grey (5.27:1 on its sheen, was 2.30); the plain muted grey stands at only 4.30 there. |
| `search-nothing-before.png`, `search-nothing-after.png` | A search that finds nothing. | "Nothing found" is legible at 5.35:1, where it stood at 2.86. The page's status region now also says it once to a screen reader, which no picture shows. |
| `pin-tray-after.png` | The pin tray, open. | It looks as before. The button still says "Clear all", and its accessible name is now "Clear all pins", which holds the words shown. |

## States this round added

| Picture | What it shows | What I see |
| --- | --- | --- |
| `skip-link-focused.png` | The first Tab on the page. | "Skip to the map" stands at the sidebar's top left in a blue focus ring. While it has focus it covers "Live Docs", the first line of the title; on the next Tab it slides away. |

Not pictured: the clear's 24 px target, the fatal fault in the reader, and the dialog's headings. The machine's browser lock was held by a gate when they were due. `tests/e2e/shell-accessibility.spec.ts` measures all three on the page.

## Measures

- **Contrast**, from the palette's values and checked by `tests/e2e/shell-accessibility.spec.ts` on the page:

  | Text | Before | After |
  | --- | --- | --- |
  | Section labels on the sidebar | 2.86 | 5.35 |
  | Search placeholder | 2.90 | 5.43 |
  | "Nothing found" | 2.86 | 5.35 |
  | Ctrl+P hint on its sheen | 2.30 | 5.27 |
  | Clear glyph (drawn at 0.7 opacity before) | about 2.3 | 5.43 |
- **Today's quiet tones on a card:**
  - `muted`: 4.42 before, 5.10 after;
  - `subtle`: 3.50 before, 4.54 after;
  - `panelSubtle`: 3.34 before, 4.52 after.
- **The search's clear:** 18 × 18 px before, 24 × 24 px after, with its glyph still 14 px.
- **Headings in the reading dialog,** over prose at 15 px:
  - before: 16, 15, 14 and 15 px;
  - after: 18, 17, 16 and 15 px.
