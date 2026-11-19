# Interaction and accessibility: the findings as written, with the checker's verdicts

_Historical record, dated 2026-11-18. The interaction author's findings as that builder wrote them, from its report (the harness refused it the findings file, which was to have been `findings-interaction.md`), written from the code at `4856acf3` with no browser and nothing in the product changed. One line is added after each ranked finding: the verdict of a second builder who checked it against the code and the record the same day. The verdicts in full, with their evidence, are in [verdicts.md](verdicts.md); what the findings came to after checking is in [the README](README.md). The author's text is not corrected here: where it is wrong, the verdict says so, and [Interaction and Accessibility](../../../../../../../.mdmd/layer-2/design-system/interaction-and-accessibility.mdmd.md) carries the correction. Paths are under `packages/explorer/src/client/` unless marked._

## What was read
- **In full:** AGENTS.md; owner.md "Formatting and visual taste" (lines 199–282); `shared/template.html`; `panels/icon-button.ts`, `panels/item-menu.ts`, `errors.ts`; the building-map README (2026-11-15); the first-visit README (2026-11-12); SECURITY.md; the README's Privacy section.
- **In part:**
  - owner.md "How they work", searched for UI entries.
  - The Explorer design, lines 10–109.
  - The decisions log, six decisions whole: One Search; Inspection/Pins/Subject; Reads Only Its Own Site; Clicks Pin What They Name; Descriptions Open on a Tap; Card's Box Never Depends on Zoom.
  - direction.md "Decisions in force" (lines 106–143, each line to 700 characters), plus the touch, mobile, double-activation and one-grammar entries found by search.
  - The World Map plan's T8.
  - In the client: the files and lines cited below, and every stylesheet for states and media queries.
  - The e2e suite, by search; `local-map-keyboard.spec.ts` and `playwright.config.ts` read whole.
- **Not read:** the rest of the Explorer design, the rest of the decisions log, the rest of direction.md, the change-over-time plan.
- No pictures opened.

## Counts
Over the 142 non-test files under `packages/explorer/src`:

| What | Count |
| --- | --- |
| `aria-` attributes | 236, of 22 kinds (`aria-label` 83, `aria-hidden` 42, `aria-pressed` 35, `aria-expanded` 17, `aria-haspopup` 9, `aria-busy` 8, `aria-description` 7, `aria-describedby` 6) |
| Explicit roles | 31, of 21 kinds |
| Live regions | 2 `aria-live`, 3 `role="status"`, 1 `role="alert"` |
| Native `title` tooltips | 90 sites |
| Buttons made by script | 61 sites |
| Pointer listeners | 184 (`click` 106, `pointerdown` 12, `wheel` 6, `contextmenu` 4, `dblclick` 1) |
| `keydown` sites | 23, in 12 files |
| Style rules | `:hover` 68, `:focus-visible` 54, `[aria-pressed]` 12, `:disabled` 10 |
| `@media` queries | 15: widths 480, 600, 760, 768, 850; height 480; `pointer: coarse` once; reduced motion 6 |
| Reduced motion checked in script | 11 places, none in the World Map |
| `localStorage` keys | 4 |
| Browser-suite viewports | 17 sizes (1600×1000 34 uses, 1280×800 27, 390×844 6); Chromium only |
| Keyboard in tests | `keyboard.press` 160 uses in 27 specs; `toBeFocused` 58 uses in 17 specs |

## The ten most important findings

_The author's own summary of the ten; each is checked under its number in the ranked list below._
Paths are under `packages/explorer/src/client/` unless marked.

1. **World Map single-letter shortcuts act from any focus and R throws away the arrangement.** `views/worldMap/controller.ts:1721-1770`. The letters act whenever the World Map is the active view and focus is outside a text field, including on a sidebar button. R calls `resetLayout`, which saves the board's rest positions at once with no undo (`:1961-1965`). This fails WCAG 2.1.4 Character Key Shortcuts (level A). Recommend binding the letters only while focus is inside the board, as the pieces' Enter and Space already are (`:1842`).
2. **A fatal fault shows its stack in a panel left `inert` and `aria-hidden`.** `errors.ts:84-88` only adds the `visible` class. The template (`shared/template.html:564`) and `detailPanel.ts:99-100` make the panel inert, and only `detailPanel.ts:142-143` undoes that. So the stack can be seen but not focused, copied or read by a screen reader. Confirm in a browser.
3. **Some facts live only in a native `title`, which shows to a resting mouse and never on keyboard focus or touch.**
   - A card's test coverage is appended to the card's `title` (`views/localView/card-factory.ts:265`), on a card that is not a tab stop.
   - A 3D seed's group size and a shell's file count are only in the title of its name (`views/forceGraphView.ts:844-853`).
   - The World Map tools' keys are only in their titles (`controller.ts:283`).

   This sits against "a tap, never hover, opens text". Proposed rule: a `title` may only repeat an accessible name or description.
4. **Toggles state their state twice: a changing name plus `aria-pressed`.** 2D Pin (`card-factory.ts:191-192`, `:886-888`), 3D Pin and Open (`forceGraphView.ts:1170-1171`, `:1179-1180`), Play and Authors (`history/scrubber.ts:427-428`, `:434-435`). A screen reader says "Unpin index.ts, toggle button, pressed". The pin tray and sidebar change their names and also set `aria-expanded` (`panels/pin-tray.ts:66-67`, `index.ts:1219-1221`). This goes against the ARIA Authoring Practices.
5. **`aria-busy` and `data-building` say different things, and only `aria-busy` reaches assistive technology.**
   - `data-building` means the map refuses input.
   - `aria-busy` means the motion is not yet at rest. It outlasts building by seconds: 1,309 frames against 2 on the estate's seed click.
   - Nothing tells a screen reader that clicks are being refused.
   - Five places write `aria-busy`, and `forceGraphView.ts:2504` leaves out the packing that `:692` counts.
6. **Status messages are not told (WCAG 4.1.3).** "Nothing found" is `role="presentation"` (`search/search-field.ts:116`); the walkthrough's next step is not announced (`controller.ts:2056-2058`); nor is building.
7. **The keyboard cannot turn the 3D camera or pan either map; there is no single-pointer way to turn the 3D camera or move a World Map piece.** This fails WCAG 2.1.1 (A) and 2.5.7 (AA). The World Map's turn buttons show the pattern. Adding controls is a design fork, not a fix.
8. **The focus ring has six forms, and its blue is the "offers" blue.**
   - 1 px rings at `styles/shell.css:426` and `:1030`.
   - An underline with no ring at `styles/history.css:106`.
   - A 1.5 px shadow at `styles/local.css:444`.
   - The World Map's ring in its offers colour at `styles/world.css:455`.
   - The browser's default on the sidebar's small buttons.

   In today's palette, `state.selected` equals `offersPin` (`#0091ff`, `palette.ts:244` and `:280`), so the blue that means "offers" also means focused and on. The colour is the visual half's to resolve.
9. **The same click means "read it" in 2D and "keep it" in 3D, and "pin" means two things.** In the Local Maps a pin retains a file across exploration; on the World Map it keeps a panel open. Each half has its own owner decision, but nothing weighs them against each other, so a person who learned 2D will slip in 3D. No change recommended; the blind playtests should watch for this slip.
10. **A shared link's layout settings and filters probably become the receiver's own.** They are applied at `index.ts:188` and `:208`. The receiver's next change to any filter or Tuning control writes the whole state, sender's values included, into their saved settings (`persistence/local-storage.ts:559-571`). The owner on 2026-11-16: "Opening a sent link shouldn't cause your local settings to change." Confirm in a browser, then put it to the owner.

## The ranked findings
### Indefensible
1. The World Map's letter shortcuts and R (as above).

> **Checker's verdict.** Confirmed, and worse: nothing checks Ctrl, Meta or Alt, so Ctrl+R reloads and also resets and saves the layout, Ctrl+F opens find and also fits, Ctrl+D bookmarks and also switches the theme; a focused `<select>` is not excluded either.

2. The fault panel left inert (as above).

> **Checker's verdict.** Confirmed in code. Whether the panel is visible in that state needs a browser.

3. Facts only in `title` (as above).

> **Checker's verdict.** Partly true. The 3D counts are in the title only (a screen reader gets them as the description). Card coverage: the first three test names are drawn as chips; only the overflow and the paths are title-only. The World tools' keys are refuted: the help panel lists every key (`controller.ts:2018`) and `aria-keyshortcuts` is set (`:284`).

4. Toggles stated twice (as above).

> **Checker's verdict.** Partly true. Confirmed for 2D Pin, 3D Pin and Open, Play and Authors. The disclosure half (pin tray, sidebar) is not an Authoring Practices rule; calling it the same fault overreaches.

5. "Clear all" is named "Clear exploration pins", failing WCAG 2.5.3 Label in Name (`panels/pin-tray.ts:43-44`). Rename it "Clear all pins".

> **Checker's verdict.** Confirmed.

6. The search's clear button is 18×18 (`styles/search.css:100-104`), a screen-space control below 2.5.8's 24×24. The sidebar's toggle, Back and Forward are probably about 22 px tall (`styles/shell.css:34-45`); confirm.

> **Checker's verdict.** Partly true. The search clear is 18 by 18 and, inside the input, cannot use the spacing exception. The sidebar buttons' height needs a browser; the checker estimates 22 to 24 px.

7. Disabled has five opacities with no reason found: 0.3 (`shell.css:59`), 0.35 (`history.css:16`), 0.45 (`local.css:335`), 0.55 (`local.css:326`), 0.65 (`reading.css:81`).

> **Checker's verdict.** Confirmed.

8. The reader's placeholder "Select a Node" / "Click on any node to view details." (`shared/template.html:570-574`) is our words, says "node" and "click", and may never be shown. Check whether any route shows it, then delete it or say nothing.

> **Checker's verdict.** Partly true. Nothing references the placeholder, but a fatal fault replaces only the panel's body, so "Select a Node" heads the stack.

### Inconsistent

9. `aria-busy` and `data-building` (as above). Keep `aria-busy` as the tests' "settled", written by one function; announce building once, after 300 ms, through a status region.

> **Checker's verdict.** Confirmed; `:2518` also leaves packing out. The 1,309-frame measurement was not rechecked.

10. Six focus rings, and focus blue equal to offers blue (as above).

> **Checker's verdict.** Partly true. The forms named are right, but there are more than six: underline only (`shell.css:702-704`, `sources.css:139-145`, `history.css:106`), border only (`local.css:356`, `sources.css:309-312`), a border with a 0.2 halo (`search.css:56-58`).

11. Click inspects in 2D and pins in 3D; "pin" on the World Map (`controller.ts:1739`, `:2015`) (as above).

> **Checker's verdict.** Confirmed.

12. The wheel changes view only on the World Map (`controller.ts:1703-1712`). Leave it to ticket T8, and record for T8 how often an entry by wheel is followed within seconds by a return.

> **Checker's verdict.** Confirmed.

13. Reduced motion is ignored by the World Map's camera tweens (`controller.ts:1107-1124`).

> **Checker's verdict.** Confirmed: no `matchMedia` call anywhere under `views/worldMap`.

14. Six breakpoints as literals in five files, 760 and 768 only 8 px apart, with 760 and 480 repeated in script (`index.ts:267`, `:275`). No reason found for any value; propose two named sizes.

> **Checker's verdict.** Confirmed.

15. The search hint shows "Ctrl+P" on a Mac (`template.html:507`), the field has no `aria-keyshortcuts`, and the key takes the browser's Print. No reason recorded; recommend keeping it (a developer's quick-open habit) and showing the platform's key.

> **Checker's verdict.** Partly true. "No reason recorded" is refuted: `search-bar.ts:95` gives one ("the Explorer's search shortcut since the dialog it replaced").

16. Two loading signs for one state: the three dots and "Loading..." in the footer (`template.html:496`, `:533-536`).

> **Checker's verdict.** Confirmed.

17. The link leaking layout settings (as above).

> **Checker's verdict.** Confirmed in code; end to end it needs a browser run.

18. On a 2D card's body, Enter opens the reader (`card-factory.ts:278-282`) while a click does nothing (`:276`).

> **Checker's verdict.** Confirmed.

19. Three letter cases in our words (Title Case, sentence case, lower case "back/next/done" at `controller.ts:301`), and "Loading..." beside "Path to…".

> **Checker's verdict.** Confirmed; add "Play Rate" (`template.html:477`).

20. Back is named "Back to the last place" in the sidebar and "Back" in the reader for the same act (WCAG 3.2.4).

> **Checker's verdict.** Refuted, and withdrawn. Both buttons' accessible name is "Back" (`template.html:20`, `:567`); only the sidebar's tooltip differs, and the two do different jobs (place history against reader history), so 3.2.4 does not bind.

### Missing

21. No key to turn or pan and no button to turn the 3D camera (WCAG 2.1.1, 2.5.7). A design fork.

> **Checker's verdict.** Confirmed. "Panning to an arbitrary place" is weak, since 2D focus brings each control into frame.

22. No `<main>`, no `<nav>`, no skip link (`template.html:17`, `:501`).

> **Checker's verdict.** Partly true. The reader has a `<nav aria-label="Sections">` (`detailPanel.ts:415`, `:638`).

23. No polite status region for news a sighted person reads (4.1.3).

> **Checker's verdict.** Confirmed.

24. The World Map's flow along the wires never pauses unless the operating system asks for reduced motion (WCAG 2.2.2, `styles/world.css:135`, `:153`).

> **Checker's verdict.** Confirmed.

25. No measurement that history playback, up to 10 steps a second (`template.html:477`), stays under the flash threshold (WCAG 2.3.1).

> **Checker's verdict.** Confirmed (an absence). Whether playback crosses the threshold needs a browser.

26. The World Map's help button has no `aria-expanded` or `aria-controls` (`controller.ts:2027-2031`), and its `role="toolbar"` has no arrow-key movement (`:275-291`).

> **Checker's verdict.** Confirmed.

27. `aria-description`, an ARIA 1.3 draft attribute, is used at 7 places. Use `aria-describedby`, as Tuning does.

> **Checker's verdict.** Confirmed. It is not a WCAG failure.

28. Only Chromium is tested.

> **Checker's verdict.** Confirmed.

29. No axe-core run and no screen-reader pass. axe-core would be one new development dependency, a choice for you and the owner.

> **Checker's verdict.** Confirmed.

30. No test at 320 px wide or at 200% text.

> **Checker's verdict.** Confirmed.

31. The README's Privacy section says there are no install scripts; SECURITY.md says esbuild runs a `postinstall`.

> **Checker's verdict.** Confirmed.

### Standards with no reason found

| Standard | Recommendation |
| --- | --- |
| 550 ms hold (two literals) | Keep; it is near the platforms' long press. Make it one constant. |
| 6 px drag slop | Keep. |
| 300 ms and 200 ms building timings | Keep; the 2026-11-15 measurement is their reason. Write it beside them. |
| Five disabled opacities | Drop to one. |
| Six breakpoints | Two named sizes. |
| Focus ring variants | Drop them. |
| `aria-pressed` plus a changing name | Drop one of the two. |
| Ctrl+P | Keep, showing the platform's key. |
| Title Case | Sentence case. |

**Keeping the tables true** (proposed, none built)
- **Grammar:** one Playwright spec that walks the grammar table's rows on the estate sample.
- **States:** a Playwright pass reading each control's computed focus outline and disabled opacity, expecting one value each.
- **Toggles:** a pass expecting every `aria-pressed` control's name to stay the same when pressed.
- **Names and roles:** axe-core rules `label-content-name-mismatch`, `button-name`, `aria-allowed-attr`, `landmark-one-main`, `target-size`.
- **Shortcuts:** a World Map spec pressing the letters with focus on a sidebar button and expecting nothing to change.
- **Escape:** one spec that opens every surface and presses Escape until none is open.
- **Breakpoints:** a unit test parsing every `@media` and `matchMedia` string, expecting only the named sizes.
- **Storage and links:** a unit test listing `CompressedPayload`'s keys and the persisted keys against the standard's table, or a generated region in the standard.
- **Reduced motion:** a spec in each view, the World Map included, expecting no transform to change between two frames after an act.
- **Words:** a review-time list of every string of ours drawn on screen (a count, not a gate).

## Forks the author decided, and why
- **No outside research subagent.** I cited WCAG 2.2, the ARIA Authoring Practices, Nielsen and the platform guidelines from my own knowledge, to stay inside the time and avoid an extra agent.
- **Findings first, not fixes.** Owner decisions that the product follows but that clash with each other (the click in 2D against 3D, "pin" on the World Map, the wheel's entry into a view) are written as recorded facts and inconsistencies, not proposed for change.
- **Target sizes are split in two.** Controls outside the map get a proposed 24×24 floor now. Controls inside the map are left to the owner's deferred touch pass.
- **"Fails" only where the code shows it.** Everything else in the WCAG table is "not tested" or "partly", for the browser milestone.
- **The visual half owns colour.** The focus colour and the World Map's colour-only wire direction are noted and pointed to Visual Foundations.

## Unfinished
- The findings file itself (above).
- Everything marked "confirm": the fault panel's inertness, the sidebar buttons' size, the link's settings leaking into saved settings, whether the reader's placeholder is ever shown.
- The WCAG rows marked "not tested", the flash measurement, an axe-core run and a screen-reader walk.
- No screenshots were looked at; the states matrix (3.2) should be checked against pictures of each component in each state.

## Subagents used
None.
