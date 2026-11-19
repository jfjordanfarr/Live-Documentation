# Visual foundations: the findings as written, with the checker's verdicts

_Historical record, dated 2026-11-18. The visual author's findings file exactly as that builder wrote it (the harness refused it the file, so it came back inside the builder's report; it was to have been `findings-visual.md`), with one line added after each numbered finding: the verdict of a second builder who checked it against the code and the record the same day. The verdicts in full, with their evidence, are in [verdicts.md](verdicts.md); what the findings came to after checking is in [the README](README.md). The author's text is not corrected here: where it is wrong, the verdict says so, and [Visual Foundations](../../../../../../../.mdmd/layer-2/design-system/visual-foundations.mdmd.md) carries the correction._

## The author's text

_Historical record, dated 2026-11-18. Written by a builder at the root's request, after the owner asked for design-system documentation of a professional standard, with an answer to "why?" for every standard ([Turns 14 to 16 of the November 18 record](../../2026-11-18.1.record.md#turn-14)). It reads the product at `4856acf3` and changes nothing in it. The standard itself is [Visual Foundations](../../../../../../../.mdmd/layer-2/design-system/visual-foundations.mdmd.md); this is the list of what it could not defend._

### What was read

**In full:**
- `AGENTS.md`
- the section "Formatting and visual taste" of [owner.md](../../../../../../Memory/owner.md#formatting-and-visual-taste)
- the sections "Open with the owner" (as far as each subject bore on colour, type and motion) and "Decisions in force" of [direction.md](../../../../../../Memory/direction.md#open-with-the-owner)
- the colour pass README ([2026-11-16](../../../2026-11-16/Probes/colour-pass/README.md))
- the designer's reading ([2026-11-15](../../../2026-11-15/Screenshots/designer-eye/README.md))
- the kind-palette probe ([2026-11-15](../../../2026-11-15/Screenshots/kind-palette/README.md))
- the defaults round ([2026-11-18](../../Screenshots/defaults-round/README.md))
- `palette.ts`, `styles/theme.css`, and `panels/icon-button.ts`
- `palette.test.ts`, lines 90–186
- the head of `tests/e2e/contrast.ts`

**In part:**
- the header-order README (its six principles)
- [the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md): its paragraphs on 3D names, the card ladder, the far bands, the closed directory, the directory handle and tone
- `views/forceGraphView.ts`, lines 1835–1914, and its camera motions
- the head of `views/forceGraphEmphasis.ts`
- `views/forceGraphAppearance.ts`, lines 1–80
- `tests/e2e/design-audit.ts` and `tests/e2e/scenarios/judgments.ts`, their heads and exports

**Counted by script, not read line by line:**
- every declaration in the eleven stylesheets (about 214 KB)
- the numeric constants of `views/`, `views/localView/` and `panels/`
- every 24-grid SVG in the client and in `template.html`

These scripts were throwaway and are not kept.

**Not read:**
- the colour pass's `inventory.md` and `history.md`. Their conclusions are taken from its README, which the root checked.
- the decisions log in full. Its headings carry no visual rule beyond those cited.
- the World Map's TypeScript
- any picture. No browser was run.

**Outside research.** One subagent of the builder's tier ran generic web queries on:
- how Carbon, Material 3, Polaris, Atlassian and Primer structure their foundations
- the W3C design tokens format
- type, spacing and radius scales
- WCAG 2.2's contrast, focus and motion criteria
- colour-vision deficiency practice
- Munzner, Bertin, Ware and the Gestalt principles

It corrected two premises:
- WCAG 2.2's 2.4.11 is Focus Not Obscured (Minimum); Focus Appearance is 2.4.13, at level AAA.
- The W3C design tokens format reached a stable version, 2025.10, on 2025-10-28. It is a Community Group report, not a W3C standard.

### The counts

Each entry gives distinct values, then the number of declarations or uses in brackets.

**Colour**
- One source, `palette.ts`, with 3 palettes. A test fails if any other client file writes a colour.
- No hex, rgb or hsl literal appears in any stylesheet. All 119 colour expressions in the CSS are `rgba(var(--…-rgb), α)` taken from the palette.
- The colour pass inventoried 177 colours before that consolidation.

**Text tones under 4.5:1 on a card, in Today (the default):**
- `text.muted` 4.42 (27 places)
- `text.subtle` 3.50 (2)
- `text.panelSubtle` 3.34 (19)
- `text.onSelected` on `state.selected` 3.23 (3)

**Type:**
- font size 16 (173), of which 10, 11, 12 and 13 px carry 134
- weight 4 (41)
- family 5 (14), three of them monospace stacks
- line height 22 (46)
- letter spacing 10 (16)
- uppercase in 15 places, italic in 6

**Shape:** border radius 14 (107).

**Spacing:** padding 82 (180), margin 50 (167), gap 24 (92). 69 of the 92 gaps fall on the proposed scale.

**Layering:**
- z-index 22 (44)
- box shadow 36 (44), of which 16 are elevation shadows: nine offsets, eight strengths
- backdrop blur 3

**Opacities that carry meaning:**
- 2D: wires at rest 0.7; unrelated symbols 0.5, or 0.4 in a fallback; unrelated wires 0.1; cells at rest 0.5.
- 3D spheres and wrappers: 1, 0.6, 0.4, 0.2.
- 3D wires: 0.9, 0.5, 0.3, 0.16, 0.12, 0.025; containment and document wires 0.04 to 0.4.
- History: Dim's loss of 0.8; Glow's 0.85.
- CSS `opacity`: 25 distinct values (60), most of them states.

**Motion:**
- CSS transitions: 10 durations, 7 easings, in two units (s and ms)
- 4 loops
- TypeScript motions: 7 durations, from 180 to 1,400 ms
- reduced motion honoured in 10 places

**Icons:**
- 16 SVG icons on the 24 grid, at 5 sizes (11, 13, 14, 18, and 20 by 16 px) with 4 stroke weights
- 7 text characters standing in for icons
- 3 kinds of disclosure sign
- the More glyph drawn in 5 places, Pin in 2, Close in 2

### Findings, ranked

Ranked by how much each costs a reader and how plainly no reason supports it.

#### Indefensible

**1. The default palette is the one the product's own test names invalid.**
- **Evidence.**
  - `DEFAULT_PALETTE` is `"today"` (`packages/explorer/src/client/palette.ts:339`).
  - The palette's own test states as a fact that Today fails the floors (`palette.test.ts:180–185`):
    - the offering pin and implementation are 0.0 apart
    - a test and a directory are 2.5 apart under protanopia, where 8 is the floor
- **Background.** The owner's stated lean exists as **Vivid kinds** and passes every floor (`palette.test.ts:167–178`). That lean is kinds near today's blue and green, with the colour collision mild. They have seen Proposed in the app ("very very drab" in 3D), but have not been asked to choose Vivid kinds as the default.
- **Act.** The root asks the owner which palette is the default:
  - Vivid kinds, their own lean made valid; or
  - Today, kept knowingly, with its failures written down.

  The builder does not decide it.

> **Checker's verdict.** Confirmed. Today's offering pin against implementation 0.0, test against directory 2.5 under protanopia; Proposed's and Vivid kinds' closest pairs recomputed as stated.

**2. Words below 4.5:1 under the default palette.**
- **Evidence.** Measured 2026-11-18 with WCAG's formula against `ground.card` `#232326`:

  | Token | Colour | Ratio | Places |
  | --- | --- | --- | --- |
  | `text.muted` | `#888888` | 4.42 | 27 |
  | `text.subtle` | `#777777` | 3.50 | 2 |
  | `text.panelSubtle` | `#6c7484` | 3.34 | 19 |

  - The bold white words of `button.action-btn` on `#0091ff` stand at 3.23 (`styles/view-shared.css:343–351`), well under 4.5. At their size they are not large text.
  - On `ground.surface` `#1e1e1e`, muted is 4.70 and subtle 3.72.
- **Act.**
  - Proposed already lifts the three tones (to `#939393`, `#8a8a8a`, `#828a9a`) and puts dark words on a neutral selected fill. Vivid kinds inherits both.
  - So the decision in finding 1 fixes this, unless Today stays. If it stays, lift the three tones in Today alone.

> **Checker's verdict.** Partly true. The ratios on a card are exact (4.42, 3.50, 3.34, 3.23). But `text.muted` fails only on a card or lighter: on the panels' grounds it passes (4.64 raised, 4.70 surface, 5.33 deep), so "27 places" overstates the failures. `text.subtle` and `text.panelSubtle` fail on every ground. Some counted places are not text (`history.css:43`, `local.css:243`, `shell.css:277`).

**3. The interface wears a data colour.**
- **Evidence.**
  - `state.selected` is `#0091ff` in Today (`palette.ts:244`). That is the same hex as `kind.implementation` (`palette.ts:247`) and the offering pin (`secondValues.offersPin`, `palette.ts:280`).
  - That one colour draws the focus ring (17 rules of `outline: 2px solid var(--state-selected)`), the selected and active fills, the subject card's ring and the history's major ticks.
- **Why it matters.** One blue is read as three things: this is selected, this is an implementation file, this end offers. The designer's term is **neutral chrome**: the interface's own controls carry no data colour.
- **Act.**
  - It falls with finding 1: Proposed and Vivid make the selected state `#f2f2f2`.
  - When it goes neutral, check the focus ring's contrast. `#f2f2f2` on a card is about 14:1, so it holds.

> **Checker's verdict.** Confirmed. 94 reads of `var(--state-selected)`, not 90; 17 focus-ring rules.

**4. The contrast checker misstates "large text".**
- **Evidence.** `tests/e2e/contrast.ts:11` reads "The smallest ratio WCAG AA accepts for text under 18 px, or under 14 px bold". WCAG's large text is 18 *points* (24 CSS px), or 14 points bold (about 18.66 px).
- **Effect.**
  - Today the module exports only the 4.5 threshold and every spec applies it, so no case has passed wrongly.
  - A spec that later adds a 3:1 tier from this comment would accept 18–23 px text at 3:1.
- **Act.** Correct the comment, and name the large-text sizes beside the constant.

> **Checker's verdict.** Confirmed.

**5. White is both the event and every 3D wire.**
- **Evidence.**
  - `history.changed` and `scene.wire` are both `#ffffff` (`palette.ts:251, 260`).
  - Every reference wire in the 3D map is drawn white (`views/forceGraphView.ts:1895–1902`).
  - Under Glow a changed file turns white. Among marbles, the defaults round saw it read "as something of another make rather than as a lit file", "more as 'unpainted' than as 'glowing'", with no row for it in the key ([the defaults round](../../Screenshots/defaults-round/README.md)).
- **Act.**
  - No change while Dim is the default.
  - If Glow keeps its place as a choice, consider a lit marble instead: its own colours at full strength, with a halo. That would carry the owner's wish to "preserve color information about what kind of node has changed while also attracting the eye" (direction, Changed Files).
  - Show it to the owner as a picture first.

> **Checker's verdict.** Confirmed in code. That the white reads as unpainted is a judgement of the eye, taken from the defaults round's pictures, which the checker did not view.

#### Inconsistent

**6. Type: sixteen sizes in single-pixel steps, four weights, five families.**
- **Evidence.**
  - Sizes: 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 22 and 28 px, plus 0.9em, 0.95em and 1em.
  - The document reader steps its headings by one pixel each: h1 16, h2 15, h3 14, h4–h6 13 (`styles/shell.css:588–605`), over a 13 px body (`shell.css:578`).
  - In the reading dialog and on the reading card, h1–h3 are `1em`, the body's own size (`styles/reading.css:47, 745`). Headings there are told apart by weight 600 alone.
  - Two weights for the same role. `bold` is used for `.node-title` (`view-shared.css:107`), the sidebar header (`shell.css:70`), the context bar (`shell.css:133`) and the action button (`view-shared.css:351`). Every other name and heading is 600, including a directory's name (`local.css:484`). So a file's name and its directory's name are drawn at two weights.
  - Three monospace stacks:
    - `"Fira Code", "Consolas", monospace` (`sources.css:156, 190, 432, 498, 522`)
    - `'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace` (`shell.css:802`)
    - `monospace` (`search.css:79`, `shell.css:862`, `view-shared.css:477`)
- **Act.**
  - Name the roles the sizes already serve, then collapse each role to one size:
    - caption 10 (badges, rulers, counts; today 9 and 10)
    - label 11 (card symbol names, metadata)
    - small body 12 (notes, rows, legend)
    - body 13 (panels, prose, names)
    - reader body 15
    - title 18 (today 16 to 18)
    - display 22 or 28, one of them
  - Give the reader's headings a ratio: about 1.2 (13, 16, 19, 23), or weight plus space if the size must stay.
  - Two weights only, 400 and 600. `bold` becomes 600.
  - One monospace stack.
  - The 2D map's held sizes are not touched; they follow the ladder.

> **Checker's verdict.** Partly true. The counts are right. The dialog claim is wrong, and the truth is worse: `reading.css:745` sets only h4 to h6 to 1em, while the dialog's body is 15 px, so h1 to h3 keep 16, 15 and 14 px and an h3 is smaller than the body text. Families: the five values include `inherit`, and `world.css`'s `font` shorthands add a `system-ui` stack and a `ui-monospace` stack: three proportional stacks and four monospace.

**7. Corner radius: fourteen values where five roles serve.**
- **Evidence.**
  - Off a 2, 4, 8, 12 and full scale: 3 px (9 places), 5 px (3), 6 px (16), 10 px (3), and 9 px, 24 px and `7px 7px 3px 7px` once each.
  - A 2D file card is 6 px (`view-shared.css:66`); the reading card is 12 px (`reading.css:61`); a closed directory is 12 px (`local.css:482`). So a directory is rounder than the file card beside it.
- **No reason found** in the record read for the 6 against 12. "Cells" and "skins" argue for a softer directory, but no one said so.
- **Act.**
  - Adopt the scale.
  - 6 px card and toolbar corners go to 8 (they are surfaces) or 4 (they are controls).
  - 3 px goes to 2 or 4, by role.
  - Ask the owner whether a directory's rounder corner is meant to say "container". If not, align it with the file card.

> **Checker's verdict.** Confirmed.

**8. Shadows: sixteen elevation shadows in nine offsets and eight strengths.**
- **Evidence.**

  | Offset and blur | Strengths | Where |
  | --- | --- | --- |
  | `0 8px 24px` | 0.4 | `history.css:21, 66`; `local.css:337` |
  | `0 8px 24px` | 0.533 | `local.css:352` |
  | `0 8px 28px` | 0.4 | `shell.css:407` |
  | `0 10px 30px` | 0.35 | `shell.css:234` |
  | `0 10px 40px` | 0.5 | `search.css:151` |
  | `0 12px 40px` | 0.6 | `history.css:87` |
  | `0 12px 40px` | 0.22 and 0.18 (World) | `world.css:493, 564, 601` |
  | `0 4px 12px` | 0.6 | `graph.css:59` |
  | `0 2px 5px` | 0.3 | `view-shared.css:333` |
  | `0 2px 6px` | 0.28 | `view-shared.css:70` |
  | `2px 0 5px` | 0.2 | `shell.css:9` |
  | `-5px 0 20px` | 0.5 | `shell.css:302` |
- **Act.** Three named levels: raised, floating and modal. The World's light form keeps lighter strengths of its own, since its ground is white.

> **Checker's verdict.** Partly true. In the table, the World's 0.18 shadow is `0 8px 30px`, not `0 12px 40px`, and the World's `0 2px 10px` at 0.12 is missing.

**9. Layers: twenty-two z-index values, ties, and one panel at two layers.**
- **Evidence.**
  - Four things tie at 100: `#sidebar` (`shell.css:8`), `#controls` (`view-shared.css:250`), `.path-report` (`search.css:298`) and `.directory-ancestor-preview` (`local.css:357`).
  - `#detail-panel` is given 200 (`shell.css:301`) and 1000 (`shell.css:440`).
  - 104, 105, 106 and 110 differ by one, so their order is a race of increments.
- **Act.**
  - Named layers, as custom properties.
  - Before renaming, read which `#detail-panel` rule wins in which state.

> **Checker's verdict.** Partly true. The ties at 100 hold (whether any two overlap was not checked). The detail panel's 1000 (`shell.css:440`) is inside the narrow-screen media query: the deliberate full-screen modal reader, not a conflict.

**10. Icons: two families, five sizes, four strokes, one drawing in five places.**
- **Evidence.**
  - **Text characters as icons** render in the platform's font and weight, unlike the line icons beside them:
    - `←`, `→`, `◀`, `⟲` and `×` in `shared/template.html:20–22, 560, 567–568, 571`
    - `▶` and `▼` in `panels/sources-view.ts:327, 453`
  - **Sizes and strokes.** Sizes are 11, 13, 14 and 18 px, and 20 by 16 px for the view icons, which are not square. Strokes are 1.5, 1.6, 1.7 and 2.5. The directory card's controls are 13 px at stroke 1.7 (`card-factory.ts:890, 900`), beside the file card's 14 px at 1.5 (`card-factory.ts:194–227`).
  - **The same drawing in several places:**
    - More: `icon-button.ts:24`, `branch-renderer.ts:687`, `card-factory.ts:208, 327, 900`
    - Pin: `icon-button.ts:18`, `card-factory.ts:75`
    - Close: `icon-button.ts:12`, `card-factory.ts:217`
  - **Three disclosure signs:** the chevron SVG (`directory-handle.ts:53`), `▶`/`▼` (Sources), and a CSS border chevron (`history.css:99`, `shell.css:1004`).
- **Act.**
  - One icon module and one family.
  - Replace the text characters with line icons, keeping their accessible names.
  - One disclosure chevron.
  - 14 px on cards and 18 px in the chrome, both at stroke 1.5. A size off the scale states its reason.
  - Note for the interaction half: `#sidebar-toggle` has a `title` but no `aria-label` (`template.html:22`).

> **Checker's verdict.** Partly true. The 13 px Pin and More at `card-factory.ts:890, 900` are a symbol row's, not a directory's. Pin is drawn in three places, and the pin tray's drawing differs (`pin-tray.ts:56`). `#sidebar-toggle` lacks `aria-label` only in the markup: `index.ts:1221` sets it at start.

**11. Motion: seventeen durations, seven easings, two units.**
- **Evidence.**
  - `cubic-bezier(0.25, 0.8, 0.25, 1)` appears once (`shell.css:295`), against `ease` and `ease-out` everywhere else.
  - The hover opacity fade has three durations: 0.15 s for symbols (`local.css:173`), 120 ms for cells (`local.css:435`), and 0.18 s for the wires layer (`view-shared.css:381`).
- **Act.**
  - Four named bands: feedback, state, move, journey.
  - One unit.
  - Entering eases out and leaving eases in, as the three looks already do (`reading.css:656–703`).

> **Checker's verdict.** Confirmed.

**12. Spacing: eighty-two paddings.**
- **Evidence.** Off a 0, 2, 4, 6, 8, 12, 16, 24, 32, 40 scale, the gaps alone hold:
  - 10 (10 places), 14 (3), 20 (2), 28 (2), 3 (2)
  - 1, 5, 7 and 18, once each
- **Act.** Adopt the scale for the chrome only. The map's own geometry stays its own, since the layout lab measures it: lane pitch 7, handle air 6, unit 64.

> **Checker's verdict.** Partly true. The paddings and margins match; the gap counts do not reproduce (22 distinct values in 85 `gap` declarations, 59 on the scale; the first count probably included `row-gap` and `column-gap`).

**13. Two ground tokens no eye can tell apart.**
- **Evidence.** `ground.surface` `#1e1e1e` and `ground.raised` `#1f1f22` (`palette.ts:235`) stand 1.02:1 apart.
- **Act.** Either they are one step, so merge them; or they are two, so separate them by a visible step. For scale, Carbon's one grey step on dark is about 1.15:1.

> **Checker's verdict.** Confirmed: 1.014 to 1, shown as 1.01.

**14. The card fade has two fallbacks.**
- **Evidence.**
  - `var(--hover-dim-symbols, 0.5)` at `local.css:178, 200, 558, 565`, but `var(--hover-dim-symbols, 0.4)` for side-column cards at `local.css:211`.
  - The default is 0.5 (`persistence/local-storage.ts:58`), and the controller always sets the variable (`views/localView/controller.ts:546`).
  - So the 0.4 is dead code, but it suggests a second strength that does not exist.
- **Act.**
  - One fallback, 0.5.
  - Check whether the `.local-column[data-position]` rules (`local.css:209–212`) still match anything since the branch renderer replaced the columns.

> **Checker's verdict.** Confirmed, and more: the whole rule at `local.css:209-212` is dead, since its only writer (`branch-renderer.ts:344`) sets `"center"`.

**15. Letter spacing in two units.**
- **Evidence.** In em: 0.08em (5 places), 0.04em (2), 0.02em, 0.06em, 0.14em. In px: 0.5px (2), 1px, 1.2px, 0.2px, 0.3px (`shell.css:464, 545, 562, 727`; `view-shared.css:211, 527`).
- **Act.** Tracking in em only, with one value for the uppercase labels.

> **Checker's verdict.** Confirmed.

#### No reason found

**16. "Segoe UI" as the only named face** (`theme.css:33`, `view-shared.css:137`).
- **Evidence.** Off Windows it falls back to the system's generic sans. The 2026-11-15 pictures had to borrow Segoe UI's metrics over Liberation Sans to judge widths.
- **Recommend: change** to a system stack, for example `system-ui, "Segoe UI", -apple-system, Roboto, sans-serif`. Do this only after the layout lab confirms the cards' fits hold under each platform's metrics. The fits measure text, so the risk is real, but it can be measured.

> **Checker's verdict.** Partly true. It is the only face named in `theme.css:33` and `view-shared.css:137`, but the World Map already uses a `system-ui` stack (`world.css:35`).

**17. The has-tests glow** (`0 12px 24px var(--has-tests-glow)` at `view-shared.css:102`, and `0 3px 6px` at `:309`).
- **Evidence.** The owner asked for glows on pinned things and on changed files. No record read asks for one on tested cards, and the halo and border already carry the fact.
- **Recommend:** show the owner a picture without the glow, under the "fade, don't boost" principle.

> **Checker's verdict.** Confirmed in code. The record was not searched exhaustively for a reason.

**18. A wire's width by reference count:** `1 + 0.375 log2(count)`, capped at 3× (`views/forceGraphView.ts:1907`).
- **Evidence.** This is a reasonable sublinear encoding of magnitude (Munzner: length and width carry magnitude). No owner word or measurement was found for its constants.
- **Recommend: keep**, and record it in the Explorer design with its reason.

> **Checker's verdict.** Confirmed.

**19. Uppercase, tracked section labels** (15 places, including `local.css:48, 138`; `reading.css:53`; `search.css:165, 199`).
- **Evidence.** Common practice for small labels, but these labels are words of ours, and the owner's rule is to cut such words before styling them.
- **Recommend:** hand them to the interaction half's audit of words. Any label that survives gets one style.

> **Checker's verdict.** Confirmed.

**20. Hover lifts.**
- **Evidence.**
  - `.control-btn:hover` moves 2 px (`view-shared.css:340`), with `transition: all 0.2s` (`view-shared.css:334`, `shell.css:97`).
  - The owner's rule (2026-11-05): "Hover may indicate, it should not rearrange". A 2 px lift indicates, but `transition: all` animates any property that changes, layout included.
- **Recommend:** change `all` to the properties actually meant.

> **Checker's verdict.** Partly true. The code is confirmed. The quotation is not the owner's: `owner.md:208` gives it as "The root's reading: … hover may indicate, it should not rearrange".

#### Missing

**21. A token list and a check for every property but colour.** This is the root of findings 6 to 15. `palette.test.ts:359–` already proves the pattern for colour; extend it:
- Define the radius, type, z-index, duration and icon lists once, beside the palette, and write them into the page as custom properties.
- Add a unit test that reads every stylesheet and client module and fails on any value outside its list.
- Generate the standard's tables from the same lists, into a generated region.

This keeps the standard true by construction, as AGENTS.md's "One source of facts" asks.

> **Checker's verdict.** Confirmed.

**22. The smallest word.**
- **Evidence.** No rule exists. Words are set at 9 px in the type badge (`view-shared.css:470`) and the search row badge (`search.css:244`), and their contents are the reader's own type names.
- **Propose:** 11 px in the chrome for any word a person must read. Material's smallest role is 11 px and Carbon's is 12. The map's held sizes keep their own rule.

> **Checker's verdict.** Confirmed.

**23. Nested corners.**
- **Evidence.** No rule exists.
- **Propose:** outer radius = inner radius + padding (practitioner convention). Without it, the gaps between concentric edges are uneven, which is visible work for the eye.

> **Checker's verdict.** Confirmed (an absence).

**24. Named layers and named elevations.** See findings 8 and 9.

> **Checker's verdict.** Confirmed (an absence).

**25. A second channel for a file's kind where no name is drawn.**
- **Evidence.**
  - WCAG 1.4.1 asks that colour not be the only means of conveying information.
  - Wherever a file's name is drawn, the kind is already told twice: `.test.ts`, `.spec.ts` and `.md` are the reader's own words.
  - In a far 3D map and in a closed directory's cells, it is hue alone, with the name on hover and the key beside it.
  - For the commonest colour blindness, Today's test and directory are 2.5 apart; Vivid kinds' closest pair is 9.3.
- **Propose: no change of channel yet.**
  - The owner refused a 3D map without strong colour.
  - A palette that passes the floors (finding 1) is the first remedy.
  - Any second channel, such as a shape or a texture on the marble's glass, is a picture for the owner's eye, judged at the density of an ordinary scene. It is not a rule this builder sets.

> **Checker's verdict.** Confirmed as a description; the protanopia distance of 2.5 recomputed.

**26. A light form for the Local Maps.**
- **Evidence.** Only the World Map has one (`palette.ts`, `world.light`). The owner's default is "bright outside, dark inside", and a person may set the two apart, but the Local Maps have no light grounds to set.
- **Propose:** nothing here. The owner's pass on how a person customises the look owns it.

> **Checker's verdict.** Confirmed.

### What the standard holds that is sound

Listed so that the findings above are not read as the whole. Each of these holds, each has a reason, and most have a check:
- one table of colours by meaning, and the test that forbids any other
- blue offers and green uses, at every scale
- kinds told by colour
- the distance floors, under Proposed and Vivid kinds
- hierarchy by value on a card
- figure and ground between a region and a card
- fade, don't boost, with its two exceptions the owner asked for
- held sizes in steps of 1.2, within four fifths
- a container's name no smaller than its contents' names
- 3D names at the last second
- boxes that never resize with zoom
- tonal elevation
- reduced motion
- the encoding contract of the maps

### Unfinished

- **No pictures.** The proposed scales were not drawn. A second milestone could show the type scale, radius scale and icon family on the reading card and panels, beside today's, for the owner's eye.
- **Not traced:** the World Map's SVG geometry (strokes 1 to 16 in `world.css`), the 3D sphere's size curve, and the marble's constants beyond the head of `forceGraphAppearance.ts`.
- **Not fully measured:** non-text contrast (WCAG 1.4.11). It was measured only for the 2D pins and cells, from the colour pass. A closed directory's cell at its resting half strength over a card is about 2.2:1 for Today's implementation blue. Whether a cell at rest is "required to understand" the picture is a judgment for the owner, since it tells what a directory holds.
