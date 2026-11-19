# The design system's first pass: what writing the rules down found

_2026-11-19: commit `5a7c78a2` mended plain defects 1, 6 and 11 below, and the World Map's share of 5 (the walkthrough's step is now told in a status region of the map's own). The same commit made the World Map's toolbar one Tab stop with arrow keys (interaction 26), and made its reset undoable by a second press. [Interaction and Accessibility](../../../../../../../.mdmd/layer-2/design-system/interaction-and-accessibility.mdmd.md) records the new statuses._

_Historical record, dated 2026-11-18, written on the night of November 18 to 19. It records what two authors found while writing the Explorer's design system from the code, what a third builder found when checking them, and where that left each finding. Nothing here changed the product. The rules themselves are current documents in [the design system](../../../../../../../.mdmd/layer-2/design-system/design-system.mdmd.md); this folder is the dated list of what those rules could not defend on this day._

_2026-11-19: the shell's accessibility round mended plain defects 2, 4, 7, 9, 10, 12, 13, 14, 16, 17 and 18, defect 3 but for the action button's white on blue, defect 5 for "Nothing found" alone, and defect 8 for Play and Authors alone (`a8dce92a`, `5d60d935`, `16ee9517`, `aacf61d9`; [its pictures](../../Screenshots/shell-accessibility/README.md)). The findings below stand as written that night._

## What was asked, and by whom

The owner asked for it on 2026-11-18 ([Turns 14 to 16 of the day's record](../../2026-11-18.1.record.md#turn-14)): "something akin to a design bible for our project", to the standard of "professional design standardization materials that would be typically produced, and to the standard of, a professional who works in UI/UX design." Their reason: "when it comes time to document something (as in: to defend the system as it is on paper), I find things that are indefensible and ultimately in need of change". And the test for every rule: "If we have a standard, why is it that standard? If a reason can't be found, is it a standard we should have or keep?"

## How it was done

1. **Two authors**, each a builder (Opus, high effort) in a worktree of its own, wrote one document each from the code at `4856acf3`, the record and the owner's Memory, **without a browser, a build or a test run**: [Visual Foundations](../../../../../../../.mdmd/layer-2/design-system/visual-foundations.mdmd.md) and [Interaction and Accessibility](../../../../../../../.mdmd/layer-2/design-system/interaction-and-accessibility.mdmd.md). Each reported its findings: 26 visual, 31 interaction, 57 in all. The harness would not let either write its findings file, so both came back inside the builders' reports; they are kept here in full as [visual.md](visual.md) and [interaction.md](interaction.md).
2. **One checker**, a third builder that had written neither, checked every finding, table and quotation against the code at `e5b42a35` (no client file had changed since `4856acf3`) and the record, recomputing contrast, OKLab and colour-blind distances with throwaway scripts. Its verdicts: **41 confirmed, 15 partly true, 1 refuted**, and **13 new findings** the authors had missed (its table numbers them 1 to 15; three of the fifteen restate parts of earlier findings). Eight rules the visual document marked as holding were false in the code, and fourteen quotations given as the owner's were paraphrases, Memory headings, other people's words or misdated. Its table, copied whole, is [verdicts.md](verdicts.md); each finding in visual.md and interaction.md is followed by its verdict in a line.
3. **A correction pass**, a fourth builder, put the documents right against the checker's report, checking each correction against the source first. What it changed, and what it found beyond the checker, is under [Corrections made after checking](#corrections-made-after-checking).

## The findings, as they stand after checking

### Plain defects

The product breaks a rule it already states, or a WCAG 2.2 AA criterion, and the mend needs no decision of the owner's. The checker's ranking, the most harmful to a visitor first. Paths are under `packages/explorer/src/client/` unless marked.

1. **The World Map's letter shortcuts act from anywhere, and with Ctrl held** (interaction 1, new 7). From any focus outside a text field, Q, E, T, F, U, G, D, R and ? act on the board; R throws away every moved piece at once; Ctrl+R reloads and also resets and saves the layout, Ctrl+F opens find and also fits, Ctrl+D bookmarks and also switches the theme. WCAG 2.1.4. *Mend:* act only when focus is inside the board, with no Ctrl, ⌘ or Alt held, and skip `select` and `[contenteditable]`; a `world-map.spec` case. *File:* `views/worldMap/controller.ts`.
2. **The disabled grey draws live words** (new 1). The sidebar's section labels, the search's placeholder, "Nothing found", the Ctrl+P hint (2.30 to 1 at worst) and the search clear's ×, in every palette. WCAG 1.4.3 and 1.4.11. *Mend:* draw them in a tone that passes, such as `text.panelMuted` (6.56 to 1 on raised). *Files:* `styles/shell.css:920`; `styles/search.css:62, 80, 111, 281`.
3. **Words under 4.5 to 1 under Today, the default palette** (visual 2). `text.subtle` and `text.panelSubtle` everywhere, `text.muted` on a card, and the action button's white on blue. WCAG 1.4.3. *Mend:* lift those tones as Proposed already does, and set the button's words on a fill that passes. *Files:* `palette.ts` (`TODAY.text`), `styles/view-shared.css:343-351`. It touches the default-palette fork below, and comes free if Vivid kinds becomes the default.
4. **A fatal fault leaves its panel inert, under the heading "Select a Node"** (interaction 2 and 8). The stack cannot be focused, copied or read aloud. *Mend:* `reportFatalExplorerError` clears `inert` and `aria-hidden` and sets a heading. *File:* `errors.ts`.
5. **Status messages are not announced** (interaction 6 and 23). "Nothing found", the 3D map's building and the walkthrough's next step. WCAG 4.1.3. *Mend:* one polite `role="status"` region; drop `role="presentation"` from "Nothing found". *Files:* `search/search-field.ts:116`, `packages/explorer/src/shared/template.html`, `views/worldMap/controller.ts`.
6. **The World Map's camera ignores reduced motion** (interaction 13). *Mend:* make `tween` instant under `prefers-reduced-motion: reduce`. *File:* `views/worldMap/controller.ts:1107`.
7. **"Clear all" is named "Clear exploration pins"** (interaction 5). WCAG 2.5.3. *Mend:* name it "Clear all pins". *File:* `panels/pin-tray.ts:44`.
8. **Toggles that change their name and also say `aria-pressed`** (interaction 4). A screen reader says "Unpin index.ts, toggle button, pressed". *Mend:* keep the name fixed and let `aria-pressed` say the state; the visible tooltip may still change. *Files:* `views/localView/card-factory.ts`, `views/forceGraphView.ts`, `history/scrubber.ts`.
9. **The search clear is 18 by 18** (interaction 6). WCAG 2.5.8. *Mend:* a 24 by 24 hit area. *File:* `styles/search.css:100-104`.
10. **No main landmark, no navigation landmark, no skip link** (interaction 22). WCAG 1.3.1, 2.4.1. *Mend:* make `#main` a `<main>`, put the view buttons in a `<nav>`, add a skip link. *File:* `template.html`.
11. **The World Map's help does not say it is open** (interaction 26). *Mend:* `aria-expanded` and `aria-controls`. *File:* `views/worldMap/controller.ts:296, 2025`.
12. **A heading smaller than its body in the reading dialog** (new 5, visual 6). Body 15 px, h3 14 px. *Mend:* set the dialog's headings in `em`. *File:* `styles/reading.css:742-745`.
13. **The README says there are no install scripts; SECURITY.md says esbuild runs one** (interaction 31). *File:* `README.md:132`.
14. **The contrast helper's comment misstates large text** (visual 4). *File:* `tests/e2e/contrast.ts:11`.
15. **Dead side-column rules** (visual 14). *Mend:* delete them, and the dead 0.4 fallback. *File:* `styles/local.css:209-212`.
16. **Three second values not set to their meaning in Proposed and Vivid kinds** (new 6): `errorWash`, `pathFoundWash`, `worldLightPressed`. *File:* `palette.ts`.
17. **A stale comment on the page's security policy** (new 12). It still says inline styles are allowed for three 3D libraries removed on 2026-10-29. *File:* `template.html:6-8`.
18. **The search hint shows "Ctrl" on a Mac** (interaction 15). *Mend:* show the platform's key and add `aria-keyshortcuts`. *Files:* `template.html:507`, `search/search-bar.ts`.

### The owner's forks

Each of these changes how the product looks or behaves, so it is the owner's to choose. They are written for someone who is not a designer: what a visitor sees today, the choices, and what each costs.

1. **Which palette is the default.** *Today:* the Explorer opens in "Today", the colours as they were before the colour pass, which the product's own palette test names invalid: an offering pin and an implementation file are the same blue, and for a red-green colour-blind visitor a test file and a directory look alike. *Choices:* keep Today and write its failures down; make **Vivid kinds** (your own lean, made to pass every floor) the default; or Proposed, which you found "very very drab" in 3D. *Cost:* Vivid kinds changes every colour a little and fixes the contrast defects at once; Today keeps the look and keeps the failures.
2. **The scales.** *Today:* 16 font sizes a pixel apart, 14 corner radii, 16 different shadows, icons at five sizes in two families (line drawings and typed characters), 17 durations in two units, and three spellings of the body font. A visitor sees no single wrong thing; they see a product whose parts were made at different times. *Choices:* adopt short named scales (for example corners of 2, 4, 8 and 12 px and round; four motion speeds) and move every value to its nearest step; or keep the values and only name them. *Cost:* adopting changes many small things at once and wants pictures for your eye first; naming alone keeps the drift.
3. **How a floating panel shows that it floats.** *Today:* the pin tray, the history panels, the item menu and the narrow reader are darker than the map beneath them, while the 2D cards, which sit in the map, cast a shadow. The rule written down (lighter is higher; no shadow on map cards) says the opposite. *Choices:* lift the floating panels to a lighter ground and take the cards' shadow away; or keep the product's way and rewrite the rule as "a floating panel is told by its border and shadow". *Cost:* the first changes the look of every panel; the second accepts a convention most dark-theme design systems do not use.
4. **The glows.** *Today:* a test-backed card glows violet from below, and the card you are centred on glows blue from below; you asked for glows only on pinned things and changed files. *Choices:* keep them; make them centred halos like the pin glow; or drop them and let the border and chip carry "has tests". *Cost:* dropping makes the map quieter but the subject a little harder to spot; keeping breaks "fade, don't boost".
5. **Two colour clashes.** *Today:* the amber of the 3D button's cue is close to the orange of a directory, in every palette, and both appear on the 2D map; under Proposed, a test file and a card that has tests share one violet. *Choices:* move the cue's amber; and either give "has tests" its own hue or write that near kin may share one. *Cost:* small; each wants a picture.
6. **Circle or pill.** *Today:* round dots stand for things, but the zoom buttons and the World Map's help button are round too. *Choices:* write the rule as the product does it ("a single round thing is a circle, a row of choices is a pill"), or make round buttons rounded squares. *Cost:* the first is a sentence; the second is a visible change to two controls.
7. **Turning the 3D camera without a drag, and moving a World piece without a drag.** *Today:* only a drag turns the 3D camera, and no key does; only a drag moves a piece on the World Map. A keyboard or switch user cannot. WCAG 2.1.1 and 2.5.7. *Choices:* add turn buttons and arrow keys to the 3D map, as the World Map already has; add a "move" mode with keys for a piece; or accept the failure for now. *Cost:* new controls on screen, against your wish for few.
8. **A pause for the World Map's flowing wires.** *Today:* the dashes flow for as long as the board is shown, unless the operating system asks for less motion. WCAG 2.2.2. *Choices:* a pause control; or stop the flow by itself after five seconds. *Cost:* a control, or a board that goes still.
9. **The card's body.** *Today:* in 2D, a click on a card's body does nothing, but Enter on it opens the reader. *Choices:* make the click open the reader too; or drop Enter. *Cost:* the first adds a meaning to the commonest click on the map; the second removes a keyboard route.
10. **Two loading signs.** *Today:* while the page loads, three dots stand where the map will be and the sidebar's footer says "Loading...". *Choices:* keep one. *Cost:* none to speak of.
11. **Our words and their case.** *Today:* our own words come in Title Case ("Show Tests", "Download Markdown"), sentence case and lower case ("back", "next", "done"), and fifteen section labels are set in capitals. *Choices:* sentence case everywhere and fewer of our words; or keep them. *Cost:* small text changes; deciding which of our words to cut is the larger part.
12. **Whether a shared link changes the receiver's settings.** *Today:* a link carries the sender's layout settings and filters; the next time the receiver touches any filter or Tuning control, the sender's values are saved as the receiver's own. You said "Opening a sent link shouldn't cause your local settings to change." *Choices:* treat layout and filters as part of what a link shows, never saved; or as settings, never carried. *Cost:* the first needs the page to tell "this link's view" from "my settings".
13. **What a click means across the maps, and entering by the wheel.** *Today:* a click on a file reads it in 2D and pins it in 3D; "pin" on the World Map keeps a panel open, not a file; and only the World Map changes view when you wheel into a thing (ticket T8). Each is your earlier decision; nothing weighs them against each other. *Choices:* leave them and let the blind playtests watch for slips; or bring them to one meaning. *Cost:* changing any one undoes a decision you made.
14. **White as the history's lit file.** *Today:* under Glow, a changed file turns white, the same white as every 3D wire, and among marbles it reads as unpainted. *Choices:* keep white; or light the marble in its own colours with a halo. *Cost:* a picture first; Dim, the default, is untouched.
15. **Rounder directory corners.** *Today:* a closed directory's corners are 12 px, a file card's 6 px, side by side. No reason was found. *Choices:* say that a rounder corner means "container" and keep it; or match the card. *Cost:* a picture.

### No reason found

Each of these is a standard the product follows for which neither document found a reason. The author's recommendation is given for each, as keep, change or drop.

| Standard | Recommendation |
| --- | --- |
| "Segoe UI" as the only named face in the main stylesheets (the World Map already uses a system stack) | Change to a system stack, after the layout lab confirms the cards' fits under each platform's metrics. |
| The has-tests glow | Change or drop: show the owner a picture without it (fork 4). |
| The has-tests hue | Keep only if near kin may share a hue (fork 5); the record gives no owner word for violet. |
| A wire's width by reference count, `1 + 0.375 log2(count)` capped at 3 | Keep, and write its reason (a sublinear magnitude encoding) into the Explorer design. |
| Uppercase, tracked section labels | Change: give them to the audit of our words; any that survive get one style. |
| The hover lift with `transition: all` | Change `all` to the properties meant. (The author quoted the owner for this; the words were the root's reading.) |
| 6 px card corners against 12 px directory corners | Ask the owner (fork 15). |
| Italic for what is not drawn | Kept as a *proposed* reading that makes six uses one rule; the owner praised one of them. |
| The 550 ms hold, written twice | Keep; it is near the platforms' long press. Make it one constant. |
| The 6 px drag slop, written in 2D and in 3D | Keep, as one constant. |
| The 300 ms and 200 ms building timings | Keep; the 2026-11-15 measurement is their reason. Write it beside them. |
| Five disabled opacities (0.3 to 0.65) | Drop to one. |
| Six breakpoints, two of them 8 px apart | Change to two named sizes. |
| The focus-ring variants | Drop them for the one ring. |
| `aria-pressed` with a changing name | Drop the changing name (plain defect 8). |
| Title Case | Change to sentence case (fork 11). |

Ctrl+P, listed by the interaction author as having no reason, has one: "the Explorer's search shortcut since the dialog it replaced" (`search/search-bar.ts:95`).

## Corrections made after checking

The fourth builder checked each of the checker's points against the source before writing it; where the checker and the source disagreed, the source won.

- **Withdrawn:** interaction finding 20 (Back named two ways), the World tools' keys in interaction 3, the disclosure half of interaction 4, "no reason recorded" for Ctrl+P, and "broken" for `aria-description`, which is no WCAG failure.
- **Statuses changed to broken in Visual Foundations:** tonal elevation; no shadow on map cards; a glow is centred; nothing else glows; a circle is a thing and a pill a choice; one hue per meaning under Proposed (and the cue's amber in every palette); every second value set to its meaning; the disabled grey as exempt. Also broken where they had been left out: reduced motion on the World Map; the type hierarchy in the reading dialog.
- **The figure-and-ground rule**, a catch of the root's. The document said the opened directory's outline stood at "1.55 against 1.60" while its own table gave 1.65 and 1.33. Both were true of different things. The table measured against the page ground and gave `line.border`, which is a panel's border, not a card's. The tone spec (`tests/e2e/local-map-tone.spec.ts`) compares the outline, `line.membrane`, with a card's actual border, `line.interactive`, against the ground the map stands on, `#main`'s `ground.surface`: 1.55 and 1.60, as the Explorer design records. The rule now says so.
- **Found beyond the checker:**
  - The grounds table said the 2D map stands on `ground.page`; it stands on `ground.surface` (`#main`, `styles/shell.css:150`), and `ground.page` is only the body behind it. So the floating panels on `ground.deep` sit two steps below the map they float over.
  - "Size suggests exposed interface" and "position suggests coupling", which the checker passed as the owner's words, are the agent's, which the owner quoted back on 2026-10-13 and approved: "Phenomenal. Yeah, we're aligned. Please implement."
  - "to prevent runaway goofy rendering results", which the checker passed, adds a word inside the quotation; the owner wrote "prevent runaway goofy rendering results that emerge from extreme inputs" (Turn 19 of the November 5 record).
  - The has-tests violet shared with the test kind under Proposed is deliberate, by the palette's own comment; so it is a fork about the rule's wording as much as a defect.

## What was not checked, and what only a browser can tell

**Not checked by anyone:** the interaction document's state matrix (its section 3.2), row by row; the counts of ARIA attributes and roles (the checker found 19 role kinds where the author found 21); the letter-spacing line numbers; most WCAG rows marked "Meets (code)"; the 1,309-frame measurement; whether the first-visit and defaults-round findings say what is cited; whether each cited spec tests what is claimed (the files exist); the 0.87 to 1.15 held-size range; whether the z-index ties at 100 overlap in one stacking context; the World Map's SVG strokes, the 3D sphere's size curve and most of the marble's constants.

**Only a browser can tell:** contrast as drawn on screen, over real backgrounds and blends; whether the fault panel is visible when inert; the sidebar buttons' real height; a shared link's settings leaking into the receiver's, end to end; whether history playback at 10 steps a second crosses the flash threshold; reflow at 320 px and text at 200 %; an automated check (axe-core) and a screen reader over the main journeys; and every judgement of the eye, such as white reading as unpainted among marbles. Nothing in this pass was looked at in a browser.
