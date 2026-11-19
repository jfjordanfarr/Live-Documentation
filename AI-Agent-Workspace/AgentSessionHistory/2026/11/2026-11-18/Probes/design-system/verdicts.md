# Verdicts on the design-system findings (checked 2026-11-18)

Checked against `main` at `e5b42a35`. No client file changed since `4856acf3`, the commit both documents were written from (`git diff --stat 4856acf3 HEAD -- packages/explorer` shows only `tests/e2e/force-graph-building.spec.ts`). Paths are under `packages/explorer/src/client/` unless marked. V = the visual report's 26 findings, I = the interaction report's 31 ranked findings. Numbers were recomputed with throwaway Node scripts (WCAG contrast; OKLab x100 with the Machado matrices copied from `palette.test.ts`; a CSS declaration tally of the ten stylesheets). No browser, build or test suite was run.

## Counts

| | Confirmed | Partly | Refuted | Needs a browser (whole finding) |
| --- | --- | --- | --- | --- |
| Visual (26) | 18 | 8 | 0 | 0 |
| Interaction (31) | 23 | 7 | 1 | 0 |
| **All 57** | **41** | **15** | **1** | **0** |

Parts that only a browser can settle are named in the rows (I2, I6, I17, I25, V5).

## Visual findings

| # | Claim | Verdict | Evidence, and my numbers beside the report's |
| --- | --- | --- | --- |
| V1 | Default palette is the one its own test names invalid | Confirmed | `palette.ts:339` `DEFAULT_PALETTE = "today"`; `palette.test.ts:180-185`. Recomputed: Today offering pin vs implementation 0.0, test vs directory 2.5 (protanopia). Proposed closest 15.2 / 8.5; Vivid 15.9 / 9.3: all match. |
| V2 | Words under 4.5:1 under Today (muted 27, subtle 2, panelSubtle 19, white on #0091ff) | Partly | Ratios on a card match exactly (4.42, 3.50, 3.34, 3.23). But the ratios are against a card only. `text.muted` passes on every panel ground: 4.64 on raised (sidebar, `shell.css:4`), 4.70 on surface, 5.33 on deep; it fails on a card (4.42: `.node-path` `view-shared.css:117`, `.node-meta` :197), card-hover 3.76, control 3.56. So "27 places" overstates the failures. `text.subtle` and `text.panelSubtle` fail on every ground (best 4.22 and 4.02 on deep): confirmed. Some counted "places" are not text: `history.css:43` (a tick's background), `local.css:243` (an icon's colour), `shell.css:277` (`text.onSelected` as a background). `button.action-btn` white on `#0091ff` 3.23, bold at 12-14 px (`view-shared.css:343-351`, `sources.css:352-355, 508-513`): confirmed. Hover `#0070d4` gives 4.92. |
| V3 | One blue is selected, implementation and offering pin; 17 focus-ring rules | Confirmed | `palette.ts:244, 247, 280`. `grep` finds 17 `outline: 2px solid var(--state-selected)` and 94 reads of `var(--state-selected)` (the colour pass said 90). |
| V4 | `contrast.ts` comment misstates large text | Confirmed | `tests/e2e/contrast.ts:11`: "under 18 px, or under 14 px bold". WCAG's large text is 18 pt (24 px) or 14 pt bold (about 18.66 px). Only `AA_SMALL_TEXT = 4.5` is exported. |
| V5 | White is both the changed file and every 3D wire | Confirmed in code | `palette.ts:251, 260`; `views/forceGraphView.ts:1896-1903`. That white "reads as unpainted" is a judgement of the eye, taken from the defaults round's pictures. I did not view them. |
| V6 | Type: 16 sizes, 1 px heading steps, h1-h3 at 1em in the dialog, bold beside 600, three monospace stacks | Partly | Counts match: 16 sizes in 173 declarations, 4 weights in 41. The reader's steps are 16/15/14/13 over 13 (`shell.css:578-605`). On the reading card h1-h3 are 1em (`reading.css:47`). The dialog claim is wrong, and the truth is worse. `reading.css:745` sets only h4-h6 to 1em. The dialog sets its body to 15 px (`reading.css:742-744`) while h1-h3 keep 16/15/14 px, so **h3 is smaller than the body text and h2 the same size**. Families are miscounted. The 5 `font-family` values include `inherit`. The `font` shorthands in `world.css:35, 285, 438, 469, 538, 750` add `system-ui, -apple-system, "Segoe UI", sans-serif`, `system-ui, sans-serif` and `ui-monospace, Consolas, monospace`. So there are 3 proportional stacks and 4 monospace ones. |
| V7 | 14 radii; file card 6 px, directory box 12 px | Confirmed | Tally: 14 distinct in 107 declarations, with per-value counts as the table gives them. `view-shared.css:66` is 6 px and `local.css:482` is 12 px. |
| V8 | 16 elevation shadows, nine offsets | Partly | 36 distinct `box-shadow` values in 44 declarations: confirmed. Table rows: the World's 0.18 is `0 8px 30px`, not `0 12px 40px`. The World's `0 2px 10px` at 0.12 is missing. |
| V9 | 22 z-indexes; ties at 100; `#detail-panel` at two layers | Partly | 22 values in 44 declarations (one is `inherit`). The ties at `shell.css:8`, `view-shared.css:250`, `search.css:298` and `local.css:357` are confirmed; I did not show that any two of them overlap. The detail panel's 1000 (`shell.css:440`) sits inside `@media (max-width:760px),(max-height:480px)`: the narrow, full-screen modal reader. It is deliberate, not a conflict. |
| V10 | Two icon families, 5 sizes, 4 strokes; More in 5 places, Pin in 2, Close in 2; three disclosure signs; `#sidebar-toggle` lacks `aria-label` | Partly | Text glyphs, sizes, More's five copies and the three disclosure signs: confirmed. `card-factory.ts:890, 900` (13 px at stroke 1.7) are a symbol row's Pin and More, not a directory's. The directory's controls are 13 px by CSS (`local.css:447`). Pin is drawn in three places, and the pin tray's toggle uses a different drawing (`pin-tray.ts:56`, path `m9 3 6 0…`, unlike `PIN_ICON`/`PIN_GLYPH` `M8 3h8…`). `#sidebar-toggle` lacks `aria-label` only in the markup. `index.ts:1221` sets it, and `:282` calls that at start, so the claim is refuted at runtime. |
| V11 | 17 durations, 7 easings, two units; one cubic-bezier; hover fades at 0.15 s / 120 ms / 0.18 s | Confirmed | CSS durations 100-450 ms: ten, in both `s` and `ms`. `shell.css:295`, `local.css:173`, `local.css:435`, `view-shared.css:381`. |
| V12 | Spacing: 82 paddings; 69 of 92 gaps on the scale | Partly | Paddings: 82 distinct with longhands, 180 declarations, and margins 50/167: match. Gaps: I count 22 distinct `gap` values in 85 declarations, and 59 single values on the scale. The report probably counted `row-gap`/`column-gap` too. The point stands; the numbers are not reproducible as stated. |
| V13 | `ground.surface` and `ground.raised` stand 1.02:1 apart | Confirmed | 1.014:1 (1.01), and 0.8 apart in OKLab x100. |
| V14 | Card fade has two fallbacks; 0.4 is dead | Confirmed, and more | `local.css:178, 200` against `:211`; `local-storage.ts:58`; `controller.ts:546`. More: the whole rule at `local.css:209-212` (`.local-column[data-position="left"/"right"]`) is dead. The only writer, `branch-renderer.ts:344`, sets `"center"`. |
| V15 | Letter spacing in two units | Confirmed | 10 values in 16 declarations: 5 in em, 5 in px. |
| V16 | "Segoe UI" the only named face | Partly | It is the only one in `theme.css:33` and `view-shared.css:137`. The World Map names `system-ui, -apple-system, "Segoe UI"` (`world.css:35`), so a system stack already exists in the product. |
| V17 | The has-tests glow has no recorded reason | Confirmed in code | `view-shared.css:102` (`0 12px 24px`) and `:309`. I did not search the record exhaustively for a reason. |
| V18 | Wire width `1 + 0.375 log2(count)`, capped at 3 | Confirmed | `views/forceGraphView.ts:1907`. |
| V19 | Uppercase labels in 15 places | Confirmed | 15. |
| V20 | Hover lift with `transition: all`, against the owner's rule "Hover may indicate, it should not rearrange" | Partly | The code is confirmed: `view-shared.css:334, 340` and `shell.css:97`. **The quotation is not the owner's.** In `owner.md:208` it is "The root's reading: … hover may indicate, it should not rearrange". |
| V21 | No token list or check for anything but colour | Confirmed | Only `palette.test.ts:359-388` exists. |
| V22 | 9 px words | Confirmed | `view-shared.css:470`, `search.css:244`. |
| V23 | No rule for nested corners | Confirmed | (absence) |
| V24 | No named layers or elevations | Confirmed | (absence) |
| V25 | Kind told by hue alone where no name is drawn | Confirmed as description | `local.css:536` gives cells `--kind-*`. The protanopia distance of 2.5 is recomputed. |
| V26 | Only the World Map has a light form | Confirmed | `palette.ts:265-277`. |

## Interaction findings

| # | Claim | Verdict | Evidence |
| --- | --- | --- | --- |
| I1 | The World Map's letters act from any focus; R throws the arrangement away; fails 2.1.4 | Confirmed, and worse | `views/worldMap/controller.ts:1721-1768`: a window listener that skips only `input` and `textarea`. `resetLayout` saves at once (`:1961-1965`). **New:** nothing checks `ctrlKey`, `metaKey` or `altKey`. So Ctrl+R reloads the page and also resets and saves the layout; Ctrl+F opens find and also fits; Ctrl+D bookmarks and also switches the theme. A focused `<select>` (Tuning) is not excluded either. |
| I2 | A fatal fault shows its stack in a panel left `inert` and `aria-hidden` | Confirmed in code | `errors.ts:81-88` only adds `visible`; `template.html:564` and `detailPanel.ts:99-100` set `inert`; only `reveal()` (`detailPanel.ts:141-145`) clears it. Whether the panel is visible in that state needs a browser. |
| I3 | Facts live only in `title` (card coverage, 3D counts, the World tools' keys) | Partly | The 3D counts are in the title only (`forceGraphView.ts:844-853`). A screen reader still receives them as the description, but a sighted keyboard or touch user does not. Card coverage: the first three test names are drawn as chips (`card-factory.ts:252-262`); only the overflow and the paths are title-only (`:264-265`). **The World tools' keys are refuted:** the help panel lists every key (`controller.ts:2018`), and `aria-keyshortcuts` is set (`:284`). |
| I4 | Toggles state twice (a changing name plus `aria-pressed`) | Partly | Confirmed for 2D Pin (`card-factory.ts:191-192, 886-888`), 3D Pin and Open (`forceGraphView.ts:1170-1171, 1179-1180, 853`), and Play and Authors (`history/scrubber.ts:427-428, 434-435`). The APG Button pattern says the label must not change. The disclosure half (`pin-tray.ts:66-67`, `index.ts:1219-1221`) is not an APG rule; calling it "the same fault" overreaches. |
| I5 | "Clear all" is named "Clear exploration pins" (fails 2.5.3) | Confirmed | `panels/pin-tray.ts:43-44`. |
| I6 | Search clear 18 by 18; sidebar buttons about 22 tall | Partly | The search clear is 18 by 18 (`search.css:100-104`). It sits inside the input, so 2.5.8's spacing exception cannot save it: confirmed. The sidebar buttons are 12 px at 4/8 padding and 15 px at 2/6 (`shell.css:34-45, 52-55`). Their height depends on the font's line height and needs a browser; my estimate is 22-24 px. |
| I7 | Five disabled opacities | Confirmed | `shell.css:59` .3, `history.css:16` .35, `local.css:335` .45, `local.css:326` .55, `reading.css:81` .65. |
| I8 | The reader's placeholder may never be shown | Partly | Nothing in the client references `.detail-placeholder` or "Select a Node". But `errors.ts:81-88` replaces only the body, so a fatal fault shows **"Select a Node" as the heading over the stack**. |
| I9 | `aria-busy` and `data-building` mean different things; `:2504` leaves out packing | Confirmed | `forceGraphView.ts:534-535` and 692, 1448, 2504, 2518, 2523. `:2518` also leaves packing out. I did not check the 1,309-frame measurement. |
| I10 | Focus has six forms, and its blue is the offers blue | Partly | The forms named are confirmed. There are more than six. Underline only, no ring: `shell.css:702-704` (`.reader-jump`), `sources.css:139-145` (Sources tree), `history.css:106`. Border only, no ring: `local.css:356` (`.directory-ancestor`), `sources.css:309-312` (`.export-select`). Border with a 0.2 halo: `search.css:56-58`. |
| I11 | A click inspects in 2D and pins in 3D; "pin" means two things | Confirmed | `forceGraphView.ts:1057-1067` (`onToggleNode`); `controller.ts:1739` and the World's pin. |
| I12 | Wheel changes view only on the World Map | Confirmed | `worldMap/controller.ts:1703-1712` (`maybeEnter`). |
| I13 | The World Map's tweens ignore reduced motion | Confirmed | `controller.ts:1107-1124`: only `this.instant`, a hook (`:2115`). No `matchMedia` call anywhere under `views/worldMap`. |
| I14 | Six breakpoints in five files | Confirmed | `sources.css:14, 20`; `reading.css:94, 751`; `shell.css:429, 434`; `local.css:359, 585`; `index.ts:267, 275`. |
| I15 | Ctrl+P shown on a Mac; no `aria-keyshortcuts`; no reason recorded | Partly | `template.html:507`; `search-bar.ts:95-101` (Ctrl or Meta). The only `aria-keyshortcuts` are in the World Map. "No reason recorded" is refuted: `search-bar.ts:95` gives one ("the Explorer's search shortcut since the dialog it replaced"). |
| I16 | Two loading signs | Confirmed | `template.html:496, 533-536`. |
| I17 | A link's layout and filters become the receiver's saved settings | Confirmed in code | `index.ts:188, 208`; `local-storage.ts:556-571` writes the whole `state.filters`/`state.tuning` minus defaults. It needs a browser run to see it end to end. |
| I18 | Enter on a card body opens the reader; a click does nothing | Confirmed | `card-factory.ts:276, 278-282`; `tabIndex = -1` at `:100`. |
| I19 | Three letter cases; "Loading..." beside "Path to…" | Confirmed | `controller.ts:301`; `template.html:496, 516`. Add "Play Rate" (`template.html:477`). |
| I20 | Back is "Back to the last place" in the sidebar and "Back" in the reader (fails 3.2.4) | **Refuted** | Both buttons' accessible name is "Back" (`template.html:20` `aria-label="Back"`, `:567`). Only the sidebar's tooltip differs. The two also do different jobs (place history against reader history), so 3.2.4 does not bind. |
| I21 | No key to turn or pan, no button to turn the 3D camera (2.1.1, 2.5.7) | Confirmed | There is no arrow-key handler in the 3D view or the World Map (`grep ArrowLeft`). "Panning to an arbitrary place" is weak, since 2D focus brings each control into frame (`controller.ts:1680-1686`). |
| I22 | No `<main>`, no `<nav>`, no skip link | Partly | `template.html:17, 501`; no skip link. But the reader has `<nav class="reader-jumps" aria-label="Sections">` (`detailPanel.ts:415, 638`). |
| I23 | No polite status region | Confirmed | Live regions are only `controller.ts:568`, `template.html:527, 534`, `sources-view.ts:86, 198` and `errors.ts:76`. |
| I24 | The World Map's flow never pauses (2.2.2) | Confirmed | `world.css:143` runs infinite; it stops only at `:153`. |
| I25 | No flash measurement for 10 steps a second | Confirmed (absence) | `template.html:477`, max 10. Whether it crosses the threshold needs a browser. |
| I26 | World help has no `aria-expanded`; its toolbar has no arrow keys | Confirmed | `controller.ts:296-298, 2025-2029`, `:275-291`. |
| I27 | `aria-description` used 7 times | Confirmed | `template.html` has 4, plus `spatial-legend.ts:108`, `branch-renderer.ts:662` and `card-factory.ts:317`. This is not a WCAG failure. |
| I28 | Only Chromium is tested | Confirmed | `tests/e2e/playwright.config.ts:64-68`. |
| I29 | No axe-core run | Confirmed | No `axe` in any `package.json`. |
| I30 | No test at 320 px wide or 200% text | Confirmed | Nothing found. |
| I31 | README says there are no install scripts; SECURITY says esbuild has a `postinstall` | Confirmed | `README.md:132` against `SECURITY.md:55`. |

## New findings the authors missed

1. **`text.disabled` (#666666) draws live words, and the standard calls it "a disabled control (exempt)".** None of its five uses is a disabled control:
   - the sidebar's section labels, 10 px uppercase (`shell.css:920`), 2.86:1 on raised;
   - the search placeholder (`search.css:62`), 2.90:1;
   - "Nothing found" (`search.css:281`), 2.86:1;
   - the Ctrl+P hint (`search.css:80`), 2.30:1;
   - the search clear's × glyph (`search.css:111`), 2.90:1, under 1.4.11's 3:1.

   These fail 1.4.3 or 1.4.11 in every palette, since Proposed does not lift this tone.
2. **Tonal elevation is broken, though the standard says it holds.** Floating panels stand on `ground.deep` (#111111), darker than the page:
   - the pin tray (`local.css:337`);
   - the history finder, step panel and step dialog (`history.css:21, 66, 87`);
   - the ancestry popover (`local.css:352`);
   - the scrubber (`history.css:7`);
   - the perspective controls (`local.css:307`);
   - the narrow reader (`shell.css:442`).

   The sidebar is `ground.raised` (`shell.css:4`), although the table says surface is "Sidebars and panels".
3. **2D cards cast an elevation shadow at rest.** `.node-card` has `0 2px 6px` black at 0.28 (`view-shared.css:70`). No override exists; the only `box-shadow: none` rules are at `local.css:518` and `reading.css:224`. This refutes "Map cards cast no elevation shadow at rest". The author's own shadow table lists this shadow.
4. **Offset "glows", and more glows than the two exceptions.**
   - The has-tests glow is offset: `0 12px 24px` (`view-shared.css:102`) and `0 3px 6px` (`:309`).
   - The subject card wears a blue offset glow, `0 12px 30px` (`view-shared.css:86`).
   - Further glows: `0 0 6px currentColor` (`:511`), the internals pin (`:533`), the legend (`0 0 5px`) and the backward cue.

   This breaks both "a glow is centred" and "nothing else glows", which the standard marks as holding.
5. **In the reading dialog a heading is smaller than its body.** The body is 15 px and h3 is 14 px (see V6).
6. **"One hue answers one question" is broken under Proposed, though the standard says Proposed keeps it.**
   - `hasTests.mark` equals `kind.test`, both #8a5cff (`palette.ts:250, 299`).
   - The cue's amber (`#e9b86d`) stands 7.5 from the directory's orange (`#e9984d`) in every palette. Both are on the 2D map (`local.css:321, 536`).
   - Under Proposed the cue stands 8.6 from the document's yellow.
   - Under Today, has-tests violet stands 8.7 from the document's violet.
7. **Proposed and Vivid kinds do not set every second value to its meaning.** `errorWash` (#f44336), `pathFoundWash` (#4caf50) and `worldLightPressed` (#e0f2fe) keep Today's values. This contradicts the standard and `palette.ts:294`.
8. **The World Map's letters fire with modifiers held and inside a `<select>`** (see I1).
9. **Two different Pin drawings** (see V10).
10. **The circle-and-pill rule contradicts the standard's own radius table.** The zoom buttons (`view-shared.css:324`) and the World help (`world.css:461-464`) are 50% circles, but they are controls.
11. **The standard misstates the ladder.** It says "Each step is one fifth of a doubling"; the code says "four steps to a doubling" (`ladder-steps.ts:17`).
12. **The standard's proposed elevation levels are not today's values.** "raised `0 2px 6px` 0.3" and "modal `0 12px 40px` 0.5" exist nowhere in the stylesheets. Only `0 8px 24px` at 0.4 recurs, three times, so "the three the stylesheets already use most" is false.
13. **Text glyphs the icon inventory leaves out:**
    - `+` and `-` (zoom, `template.html:558-559`);
    - `×` (search clear, `:519`);
    - `?` (World help, `controller.ts:296`);
    - `▶`/`◀` (the collapsed sidebar, `index.ts:1220`).
14. **A stale comment.** `template.html:6-8` says that inline styles are allowed because three 3D libraries inject them. The decisions log's October 29 update (`.mdmd/layer-3/architectural-decisions.mdmd.md:229`) removed those libraries.
15. **The 2D drag slop is also 6 px** (`localView/controller.ts:1642`). The interaction standard names it for 3D only.

## False or altered quotations

None was invented outright. Every one below changes words, attributes someone else's words to the owner, or gets the date wrong.

| Document | As quoted | What the source says |
| --- | --- | --- |
| Visual, icons rule | Owner 2026-10-01: "recognizable icons over repeated visible “Release”, “Pin All” and “Read” button text, with accessible names and hover explanations" | This is `owner.md:268`'s paraphrase ("The owner explicitly prefers…"). The owner's words (`2026-09-30.2.record.md:2342`): "There is no reason for "Release", "Pin All", and "Read" to be buttons with text instead of interactible elements whose aria attributes yield a proper accessible textual equivalent for those who are visually imparied or those who wish to hover for a tooltip." The substance is faithful; the wording is not the owner's. |
| Interaction 5.2 | the owner's "icons with accessible names and hover explanations" | This is a "Steering checkpoint — authored" line by an agent (`2026-09-30.2.record.md:2369`). |
| Visual, card is portrait | portrait works "across many screen sizes" | Owner (`2026-11-04.1.record.md:97`): "look good on many many different screen sizes". |
| Visual and interaction, motion | the owner's "screenshot-only iteration misses sudden hops that a meaningful transition could mediate" | `owner.md:247`'s paraphrase ("They warn that…"). These are not the owner's words; I found them nowhere in the record. |
| Visual, encoding judged at density | "the test of a 3D picture is whether a person can find a thing in it" | `owner.md:223`'s heading. The owner: "If we want a user to be able to find what they're looking for." |
| Visual, encoding table | Owner 2026-11-15 and 16: "one kind of mark at one size" | These are the Explorer design's words (`live-documentation-explorer.mdmd.md:128, 134`) and the code's, not the owner's. |
| Visual, container name rule | Owner 2026-11-15: directories "are not useful" zoomed out | Owner (`2026-11-15.1.record.md:29`): "still aren't exceptionally _useful_ (interaction-wise) at high zoom-outs because there are no buttons to interact with at that distance". The quotation is stronger than what was said, and it is used for a rule about name size that the remark is not about. |
| Visual, card corners | "trading/playing-card semantics" | Owner (`2026-11-03.1.record.md:1009`): "carry the semantics of trading/playing cards". Near-verbatim. |
| Interaction, principle 1 | Owner 2026-09-28: "A click pins, a hover peeks" | `owner.md:258`'s heading. The owner: "clicks on any system should pin the popover and require dismissing…". |
| Interaction 2.2 | owner, 2026-10-15 and 2026-11-02 ("a click pins and a second releases") | A summary line in `direction.md:122`, not the owner's words. |
| Interaction 11.2 | the owner's "a tap, never hover, opens text" | A summary in `direction.md:116`. |
| Visual handback V20 | "The owner's rule (2026-11-05): 'Hover may indicate, it should not rearrange'" | `owner.md:208`: "The root's reading: … hover may indicate, it should not rearrange". |
| Visual, white is the event | Owner, **2026-11-01**: "it should be obvious…" | The quotation stands, but the head comment the standard cites dates it 2026-10-31 (`views/forceGraphEmphasis.ts:2`). |
| Visual, blue offers | Owner 2025-12-03: "stick to it" | The words stand. In context (colour-pass `history.md:37`): "However you want to color code that (which is green versus which is blue) is A-okay by me, but stick to it: Input = left, Output = Right". The owner delegated the hue and demanded consistency. That supports "at every scale" but not blue for offers as such. |

These quotations check out word for word (some dates follow `owner.md`, which differs by a day from the file names of the session records):
- "less work for the eye…"
- "far better EQ practice…"
- "overall color excess problem"
- "pedagogical tool… dynamics"
- "the text that you, the author of your files, wrote"
- "hold font sizes relatively steady…"
- "wonderful juxtoposition…"
- "Offers!! I Like that!"
- "too many connectors drawn…"
- "I still aesthetically lean…" (in `direction.md:60`)
- "colored by salient information…"
- "we don't draw a node's name…"
- "'As Built' is by far…"
- "Microsoft Teams… tooltip"
- "Consistency of view…"
- "runaway goofy rendering results"
- "a Card is more portrait"
- "keep the card the same size"
- "things exceeding boundaries…"
- "sends more is more blue…"
- "size suggests exposed interface"
- "position suggests coupling"
- "absolutely adore the motion…"
- "cells in an embryo"
- "fine and dandy"
- "very very drab"
- "preserve color information…" (cut short)
- "by default, no. Opening a sent link…"
- "text expansion does not occur on hover…"
- "This sounds great!" (`direction.md:434`, not the decisions log the standard cites)
- "at least two ways…"
- "We should strive heavily…"
- "minimize visibile words…"
- "why is that not a hyperlink?…"
- "Tests proving…"
- "moving mouse right = rotating left…"
- "I really would prefer that the cards don't…"
- "I see the quick initial rearrangement and... no problem!"
- "just have a JSON export button…"

Rules the documents themselves mark as having no reason found:
- **Visual:**
  - "Segoe UI" alone;
  - the has-tests glow, and the has-tests hue;
  - the wire-width constants;
  - uppercase, tracked labels;
  - the hover lift with `transition: all`;
  - 6 px card corners against 12 px directory corners.

  Italic is "proposed".
- **Interaction:**
  - the 550 ms hold;
  - the 6 px slop;
  - the 300 and 200 ms building timings;
  - the five disabled opacities;
  - the six breakpoints;
  - the focus-ring variants;
  - `aria-pressed` with a changing name;
  - Ctrl+P, which in fact has a reason in `search-bar.ts:95`;
  - Title Case.

## Wrong table rows

**Visual, grounds** (against the page `#18181a`; the report's figure, then mine):
- `ground.deep`: 1.10, actually 1.07.
- `line.interactive`: 1.71, actually 1.70.
- `line.hover`: 3.85, actually 3.96.
- `scene.ground`: 1.18, actually 1.17.
- Surface and raised: "1.02", actually 1.01.
- Meanings: `ground.deep` is also every floating panel's ground (new finding 2). `ground.surface` is not the sidebar's ground; that is `ground.raised`.
- Omitted: `ground.glass`, `ground.shade`, `ground.sheen`.

**Visual, text tones:**
- `text.disabled` is described as "A disabled control": wrong (new finding 1).
- The use counts include non-text uses: `history.css:43`, `local.css:243`, `shell.css:277`.

**Visual, identity colours:** every value is right. The sentence "Proposed and Vivid set every second value to its meaning" is wrong (new finding 7).

**Visual, strength:** it omits the structure layout's reference wires at 0.5, and cited-by wires at 0.55, 0.2 and 0.06 (`forceGraphView.ts:1893-1895`).

**Visual, typography:**
- "Families: 5 values" counts `inherit` and misses the `world.css` shorthand stacks.
- The 13 px icon row names the wrong control.
- "one fifth of a doubling" is wrong.

**Visual, gaps:** the counts do not reproduce (22 distinct in 85 declarations by my tally).

**Visual, z-index:**
- 1000 is also the narrow detail panel.
- 104 is also the history step panel (`history.css:66`).
- 110 (the scrubber with its finder open, `history.css:10`) is listed but not described.

**Visual, the proposed elevation table:** two of its three values do not exist (new finding 12).

**Visual, icon sizes:** "13 px: a closed directory's Pin and More (`card-factory.ts:890, 900`)" names a symbol row's controls.

**Interaction 3.1, focus-visible:** "broken at 5 places" is an undercount (I10).

**Interaction 5.1:** it omits the reader's `<nav>`.

**Interaction 7, WCAG table:**
- **3.2.4** is wrong (I20).
- **1.4.3** should list the `text.disabled` words, which the code shows failing.
- **1.4.11 "Not tested"**: the code alone shows the search clear glyph at 2.90.
- **1.4.1 World Map**: the flow's motion also tells direction, except under reduced motion.

**Interaction 4.2, the shortcut row:** it omits the modifier problem.

**Interaction 2.2, slop:** it is 6 px in 2D as well.

**Interaction 9.1:** the viewport counts are approximately right. My loose tally finds 1600×1000 38 times, 1280×800 28 and 390×844 7.

**Rows I checked and found right:**
- the radius table;
- the TypeScript motion table and every constant cited (`STEP_RATIO`, `HANDLE_*`, `LANE_*`, `LAYOUT_UNIT`, `CONTROLS_GAP`, `nameAt`, `moveMs`, the hover dims, `DIM_LOSS`, `WIRE_GLOW`);
- the 8.3 target sizes;
- the CSP string;
- the storage keys;
- the shortcut letters;
- the order in which Escape closes surfaces;
- every spec and unit-test file cited (all exist).

## How far the documents can be trusted as descriptions

- **Interaction and Accessibility** is reliable on code facts:
  - its line references land;
  - its targets, CSP, storage and shortcut tables are right.

  It errs where it reaches past the code. That is I20, the World tools' keys in I3, the undercounted focus forms, and four quotations that are summaries.
- **Visual Foundations** is accurate on counts and colour values. It is unreliable where it says "Holds". Of the rules I tested, these marked "Holds" are false in the code:
  - tonal elevation;
  - no shadow on map cards;
  - glow distinct from shadow;
  - nothing else glows;
  - circle against pill;
  - "Proposed keeps each meaning on its own colour";
  - every second value set to its meaning;
  - `text.disabled` as exempt.

  Six of its owner quotations are paraphrases or someone else's words.

## Sorted

**Plain defects, the most harmful to a visitor first.** Each has its mend in a line.

1. **World Map letter shortcuts (I1 and new finding 8).** Act only when focus is inside `.world` and no Ctrl, Meta or Alt is held, and skip `select` and `[contenteditable]`. File: `views/worldMap/controller.ts` (plus a `world-map.spec` case).
2. **`text.disabled` on live words (new finding 1).** Draw the section labels, placeholder, "Nothing found", hint and clear glyph in a tone that passes, such as `text.panelMuted` (6.56 on raised). Files: `styles/shell.css:920` and `styles/search.css:62, 80, 111, 281`.
3. **Words under 4.5:1 in Today (V2).** Lift `text.subtle` and `text.panelSubtle`, and `text.muted` on cards, as Proposed already does, and set the action button's words on a fill that passes. Files: `palette.ts` (`TODAY.text`), `view-shared.css:343-351`. This one touches the default-palette fork: if Vivid becomes the default, it comes free.
4. **The fatal fault left inert (I2, and I8's heading).** Have `reportFatalExplorerError` clear `inert` and `aria-hidden` and set a heading. File: `errors.ts`.
5. **Status messages are not announced (I6/I23).** Add one polite `role="status"` region for "Nothing found", building and the walkthrough's step, and drop `role="presentation"`. Files: `search/search-field.ts:116`, `template.html`, `worldMap/controller.ts`.
6. **The World Map ignores reduced motion (I13).** Make `tween` instant under `prefers-reduced-motion: reduce`. File: `worldMap/controller.ts:1107`.
7. **Label in name (I5).** Name the button "Clear all pins". File: `panels/pin-tray.ts:44`.
8. **Toggles stated twice (I4).** Keep the name fixed and let `aria-pressed` say the state. Files: `card-factory.ts`, `forceGraphView.ts` and `history/scrubber.ts`. The visible tooltip may still change.
9. **Search clear target (I6).** Give it a 24 by 24 hit area. File: `search.css:100-104`.
10. **Landmarks and a skip link (I22).** Make `#main` a `<main>`, put the view buttons in a `<nav>`, and add a skip link. File: `template.html`.
11. **World help disclosure (I26).** Add `aria-expanded` and `aria-controls`. File: `worldMap/controller.ts:296, 2025`.
12. **Heading smaller than its body in the reading dialog (new finding 5).** Set the dialog's headings in `em`. File: `reading.css:742-745`.
13. **The README's install-script claim (I31).** File: `README.md:132`.
14. **The contrast helper's comment (V4).** File: `tests/e2e/contrast.ts:11`.
15. **Dead side-column rules (V14).** Delete them. File: `local.css:209-212`.
16. **Second values not set to their meaning in Proposed and Vivid (new finding 7).** File: `palette.ts`.
17. **Stale CSP comment (new finding 14).** File: `template.html:6-8`.
18. **Ctrl+P shows "Ctrl" on a Mac (I15).** Write the platform's key into the hint and add `aria-keyshortcuts`. Files: `template.html:507`, `search-bar.ts`.

**The owner's forks.** Each mend changes how the product looks or behaves.

- **The default palette (V1, V3).** Choices: Today, or Vivid kinds.
- **The scales (V6-V8, V10-V12, V15, V16, V19, V22).** Type, radius, shadow, icon family, duration and spacing scales, and Segoe UI against a system stack: pictures for the owner first.
- **Tonal elevation (new findings 2 and 3).** Floating panels stand on `ground.deep`, and map cards cast a shadow. Choices: raise the panels to raised or card tone, or redefine the rule.
- **Glows (new finding 4, V17).** The has-tests and subject-card glows: keep, make centred, or drop.
- **Colour clashes (new finding 6).** The cue's amber against the directory's orange, and has-tests sharing the test kind's violet in Proposed.
- **Keyboard and single-pointer routes (I7/I21).** The 3D orbit and moving a World piece need added controls.
- **The World flow (I24).** It needs a pause control, or must stop on its own after 5 s.
- **The card body (I18).** Enter opens the reader while a click does nothing: make the click open it too, or drop Enter.
- **Two loading signs (I16).**
- **Sentence case and our words (I19, V19).**
- **The link writing a sender's layout into saved settings (I17).** Is a link's layout a "local setting"?
- **Click and pin across the maps, and the wheel's entry (I11, I12, ticket T8).**
- **Glow as white (V5).**
- **Directory corners rounder than file corners (V7).**

**The standard's fault.** The documents must change.

- Every "Holds" refuted above.
- Every altered quotation.
- The I20 row (3.2.4).
- The World tools' keys in I3.
- Treating `aria-description` as broken, which overreaches, since it is no WCAG failure.
- The disclosure half of I4.
- The wrong table rows.
- "One fifth of a doubling".
- The proposed elevations that are said to exist but do not.
- The undercounted focus forms.
- The missing font stacks.
- "Named breakpoints" and the "no reason found" rules: these stay in the standard as open, not settled.

## What I did not check

- The interaction standard's state matrix (3.2), row by row.
- The aria counts (236 attributes of 22 kinds) and the role-kind count. I count 31 roles but 19 kinds with my pattern.
- The px lines given for letter spacing.
- Most "Meets (code)" WCAG rows beyond those named.
- The 1,309-frame measurement.
- Whether the first-visit and defaults-round README findings say what is cited.
- Whether each cited spec tests what is claimed. I only confirmed that the files and three test names exist.
- The 0.87-1.15 held-size range.
- `owner.md`'s dates against the session file names (they differ by a day for September quotes).
- Whether the ties at z-index 100 overlap in one stacking context.
- Any picture, and anything at runtime.
