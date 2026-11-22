# Visual Foundations

_Current, authored. As of 2026-11-18. This is the visual half of the Explorer's design system: the standing rules for colour, type, shape, spacing and sizing, layering, icons, motion and the maps' data encodings. Interaction, accessibility, responsiveness and portability, and the words on screen are in [Interaction and Accessibility](interaction-and-accessibility.mdmd.md), next to this file. What it found that cannot yet be defended is in [the findings of 2026-11-18](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/design-system/README.md), and this half's findings as first written, each with a checker's verdict, in [the visual findings](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/design-system/visual.md). Every status below was checked against the code on 2026-11-18 by a reader who had not written it, and corrected where it was wrong._

## Metadata

- Layer: 2
- Audience: builders working on the Explorer; the root agent judging a picture; the owner, learning the vocabulary; outside contributors

## How to read this document

This document gives the product's visual rules in one place, so that a builder can apply them without working each one out again from the record. Writing them down is also how the indefensible ones were found. It describes what the product does and must keep doing. It is not a description of each view (see [the Explorer design](../../layer-3/live-documentation-explorer.mdmd.md)), a history of how each rule arose (see [the decisions log](../../layer-3/architectural-decisions.mdmd.md) and [the colour record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/Probes/colour-pass/history.md)), or a list of open questions (see [direction](../../../AI-Agent-Workspace/Memory/direction.md#open-with-the-owner)).

Each rule carries six things:

- **the designer's term**, defined where it first appears;
- **the rule**, stated as a plain sentence;
- **why**;
- **where** the product keeps it;
- **checked by**: the test or audit that holds it, or "nothing";
- **status**: *holds*; *broken* (with the places); or *proposed*, meaning not yet the product's rule.

A reason, the "why", is one of three kinds, and each names its source:

- **Owner.** The owner's stated intent, quoted, with a link to where it was said.
- **Principle.** A named principle of perception or design, or the criterion of a published standard such as WCAG 2.2.
- **Measured.** A measurement taken on this product, with where it was taken.

A standard with no reason found is not written here as settled. It goes to the findings as "no reason found", with a recommendation to keep, change or drop it.

A principle is cited by its own name. These are the sources for the ones that recur:

- WCAG 2.2 (W3C Recommendation, <https://www.w3.org/TR/WCAG22/>).
- Machado, Oliveira and Fernandes (2009), for simulating colour blindness.
- Munzner, *Visualization Analysis and Design* (2014), ch. 5, for how well each visual channel carries data.
- Ware, *Information Visualization: Perception for Design*, for preattentive features.
- The Gestalt principles as Nielsen Norman Group writes them up (<https://www.nngroup.com/articles/common-region/>).
- Tufte, *The Visual Display of Quantitative Information* (1983), for data-ink.
- Furnas (CHI 1986), for fisheye views, the root of focus plus context.

Published design systems are cited only as practice, never as authority: Material 3, IBM Carbon, Atlassian, Shopify Polaris and GitHub Primer.

**How the token tables stay true.** Every table names the file it is read from. Colours are generated: [`palette.ts`](../../../packages/explorer/src/client/palette.ts) is the one table from meaning to colour. The build writes it as CSS custom properties, one per meaning plus an `-rgb` twin. For example, `ground.cardHover` becomes `--ground-card-hover` and `--ground-card-hover-rgb`. A unit test (`palette.test.ts`, "no colour is written outside the palette") fails if any client file other than the palette writes a colour. No other property has such a source yet: radii, sizes, spacing, layers, durations and icon sizes are literals in the stylesheets and in TypeScript. Their tables below were counted from the code on 2026-11-18 at `4856acf3`, and will rot until a check holds them. The findings propose that check.

---

## Principles

Six principles stand over every foundation. Each foundation's rules apply one or more of them.

**1. Less work for the eye at the same information.** This is the product's definition of aesthetic quality. Whenever two treatments carry the same facts, the one that asks less of the eye wins.

- **Why.** Owner, 2026-10-13: "more-aesthetically-pleasing actually means "less work for the eye and brain to perform while presenting identical information"" ([owner.md](../../../AI-Agent-Workspace/Memory/owner.md#formatting-and-visual-taste)).
- **Where it shows.** Each of the six designer's terms the root taught on 2026-11-15 applies it: type hierarchy, contrast budget, container hierarchy, signifiers, greeking and data-ink ([the designer's reading](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/Screenshots/designer-eye/README.md)).

**2. Cut, don't boost: fade the irrelevant.** Attention is made by lowering everything a person is not looking at, not by raising what they are. The designer's term is **focus plus context**: the focus is kept whole while its context is kept visible but quieter (Furnas's fisheye view).

- **Why.** Owner, 2025-12-03: "it's far better EQ practice to trim what you don't need versus boost what you like". Owner, 2025-12-07: "we definitely have an overall color excess problem". Both are in [owner.md](../../../AI-Agent-Workspace/Memory/owner.md#formatting-and-visual-taste).
- **The limits.** Fading is the default, not a ban. The owner has asked for a glow on a pinned thing and on a commit's changed files. Those two glows are meant to be the exceptions.
- **Status of the limits.** *Broken*: more things glow than the two. A test-backed card glows violet (`styles/view-shared.css:102`, `:309`), the subject card wears a blue glow (`view-shared.css:86`), and there are glows at `view-shared.css:511` (`0 0 6px currentColor`) and `:533` (the Internals pin), on the legend's samples and on the 3D button's cue. See [the glow rule](#glow-as-distinct-from-shadow).
- **Where it shows.** Hovering a symbol in the 2D map fades the other wires to a tenth and leaves the hovered symbol's own wires at their resting strength (`styles/local.css:191–196`).
- **What was asked about is never the irrelevant.** A fade that serves one question never fades the subject of another the person has already asked. The history's step dims what it did not change, and still leaves the pins, the subject and a drawn path's files at their ordinary look. Inside a wrapper, the dot, bubble or skin that stands for one of them keeps its alpha.
  - Why: owner, 2026-11-19, watching a pinned file through the history: "temporal scrubbing wouldn't highlight the pinned note (or wouldn't un-dim it), which made watching the changes as I scrubbed past points it touched difficult" ([Turn 24 of the November 18 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-24)).
  - Where: `views/forceGraphEmphasis.ts` (`emphasizedSphere`'s `asked`, `bodyChanges`' `asked`), fed from the 3D view's one set of what was asked about directly (`views/forceGraphView.ts`, `askedAbout`).
  - Checked by: `forceGraphEmphasis.test.ts` and `tests/e2e/history-emphasis.spec.ts`.
  - Status: holds for the spheres and inside the wrappers. The asked-about file's wires still dim with the unchanged; an open directory, asked about as a set, is not held.
  - In 2D (2026-11-19): under Dim the cards the step left fade to three tenths, save the pins and the subject (`is-history-asked`), and the closed boxes holding no change fade with them (`styles/local.css`, the history block; `views/localView/controller.ts`, `applyHistoryEmphasis`). Checked by `tests/e2e/history-2d.spec.ts` for the boxes; the held cards are checked by eye only.

**3. Colour teaches, and may be quiet or loud on purpose.** A view in which nothing is strong teaches nothing. A choice of strength is defended by what it conveys.

- **Why.** Owner, 2026-11-17: "color is a pedagogical tool that we should not be afraid to use to teach with. If you are a composer, you must permit yourself to use dynamics" ([owner.md](../../../AI-Agent-Workspace/Memory/owner.md#formatting-and-visual-taste)).
- **What the record shows beside it.** The same palette looked "sleek" where its grey was the ground under blue and green accents. It looked "drab" where its grey was the figures themselves. So a view's commonest and largest marks should not be its greyest.

**4. The reader's own words do the talking.** Text drawn by the product is a last resort. File names, symbol names and the reader's descriptions are the type that matters, and the type system exists to rank them.

- **Why.** Owner, 2026-10-30 and 2026-11-16: "Live Documentation should give you the text that you, the author of your files, wrote" ([owner.md](../../../AI-Agent-Workspace/Memory/owner.md#formatting-and-visual-taste)).
- **Where else.** The rules for words on screen are in the interaction half.
- **At a past moment, only that moment's facts.** A card drawn at a moment of the history shows what the history keeps of its file then and nothing of today's: no description, no Read control, no test backing, since those words and facts are today's and the reader would take them for that day's. What is known is said in the card's own quiet form: a file whose rows are not kept counts them, "+3 symbols", as a card counts rows it does not draw, and its title and spoken name say why; "No public symbols" only where the count is nought. The 3D map draws no description at a moment, and the 2D map follows it.
  - Why: the root's review of the first 2D pass, 2026-11-19, where a past card said "No public symbols" of a file that had them and wore today's description as if it were that day's; the owner's standing "honest signs of hidden content" and "our software shuts up and the scanned materials do they talking".
  - Where: `views/localView/card-factory.ts` (`unkeptSymbols`, from the moment's `symbolCount`); `views/localView/controller.ts` (no reading attached at a moment).
  - Checked by: `tests/e2e/history-2d.spec.ts`.
  - Status: holds at file level, the first of the history's three rungs in 2D; the rows as they were and that day's words come with the history that carries them.

**5. Nothing shrinks to make room; held sizes stay held.** On the 2D map a name keeps its size on screen across a zoom step. Where room runs out, the name is cut with an ellipsis or leaves the picture; it is never drawn smaller.

- **Why.** This is the principle of **perceived size constancy**: a thing seen at one size is recognised as the same thing.
  - Owner, 2026-11-05: "hold font sizes relatively steady ... allowing more `...`-like cutoffs to keep the card the same size".
  - Owner, 2026-11-06: the agreed floor of four fifths ([the Explorer design](../../layer-3/live-documentation-explorer.mdmd.md)).
- **Checked by.** `tests/e2e/card-ladder-boxes.spec.ts`, and the design audit's truncation and overlap checks (`tests/e2e/design-audit.ts`).

**6. One source of facts for every visual value.** A value that carries meaning is written once and read everywhere it is drawn.

- **Why.**
  - Owner, 2025-12-06, colours belong in theme variables with semantic meanings (in [the colour record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/Probes/colour-pass/history.md)).
  - The repository's own rule, in AGENTS.md: "One source of facts".
- **Status.** Holds for colour. Proposed for every other property.

---

## Colour

### The model

**Semantic colour** means naming a colour by what it says, not by what it looks like. A **palette** is one table from meanings to colours.

**Tiers.** The product has two tiers, the order design-token practice calls *semantic* and *derived*:

- **Semantic tier.** Each palette entry in [`palette.ts`](../../../packages/explorer/src/client/palette.ts) is a meaning: `role.offers`, `kind.test`, `text.muted`.
- **Derived tier.** A colour drawn at an opacity or mixed toward another is derived from its meaning where it is drawn. It is never stored as a second literal. Examples: `--selected-subtle` and `--wire-opacity` in [`styles/theme.css`](../../../packages/explorer/src/client/styles/theme.css), and `rgba()` and `mix()` in `palette.ts`.

There is no primitive tier (no `blue-500`). That is deliberate: a primitive tier invites reuse of a hue for a second meaning. That reuse is the fault this system exists to prevent.

**Palettes and their status.** Three palettes exist, chosen in Tuning → Colour. The viewer's choice is their own setting and is not carried by a link ([the owner, 2026-11-16](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-3)).

- **Today** is the default (`DEFAULT_PALETTE`, `palette.ts:339`): the colours as drawn before the colour pass.
- **Proposed** is the colour pass's design.
- **Vivid kinds** is the owner's lean, made to pass the floors below.

Which palette becomes the default is open with the owner. Until then, every rule below says how each palette stands against it.

### Grounds and lines (dark interior)

From `palette.ts`, `TODAY.ground` and `TODAY.line`; the three palettes share them. The contrasts are WCAG ratios, measured 2026-11-18 against the page ground `#18181a`. The views do not stand on the page ground: `#main`, which holds every view and the 2D map, is `ground.surface` (`styles/shell.css:150`), so a ratio against the map is a little lower than the one given here (the figure-and-ground rule below gives both).

| Token | Value | Meaning | Contrast to page |
| --- | --- | --- | --- |
| `ground.deep` | `#111111` | Sunken wells (inputs, the history's rate box); and, against the tonal elevation rule below, the ground of nearly every floating panel: the pin tray, the history finder, step panel and step dialog, the ancestry popover, the scrubber, the perspective controls, the item menu and the narrow reader | 1.07 |
| `ground.page` | `#18181a` | The body behind the views (`styles/theme.css:31`) | n/a |
| `ground.surface` | `#1e1e1e` | `#main`, the ground every view stands on, the 2D map included; some fields and panels | 1.06 |
| `ground.raised` | `#1f1f22` | The sidebar (`styles/shell.css:4`); search results | 1.08 |
| `ground.card` | `#232326` | A 2D card | 1.13 |
| `ground.cardHover` | `#2f2f33` | A card under the pointer | 1.33 |
| `ground.control` | `#333333` | A control's resting fill | 1.40 |
| `ground.glass` | `#222225` | Frosted panels, at 0.95 (`--glass`, `styles/theme.css:25`) | |
| `ground.shade` | `#000000` | Shadows and modal backdrops, always at an opacity | |
| `ground.sheen` | `#ffffff` | Faint light washes and hairlines, always at an opacity (`--line-subtle`, hover fills, a membrane's trace of fill) | |
| `line.border` | `#2f2f34` | A panel's border and dividers | 1.33 |
| `line.membrane` | `#3d3d45` | An opened directory's outline on the 2D map | 1.65 |
| `line.interactive` | `#3f3f46` | A control's border, and a 2D card's border (`styles/view-shared.css:65`) | 1.70 |
| `line.hover` | `#777777` | A control's border under the pointer | 3.96 |
| `scene.ground` | `#000011` | The 3D map's space | 1.17 |

**Rule: a lighter surface is a higher one (tonal elevation).** On a dark ground, height is told by lightness: the nearer the viewer, the lighter. This is called **tonal elevation**.

- **Why.** Principle: a shadow barely reads on a near-black ground. Material's dark theme, Carbon's layering model ("one step lighter with each added layer") and Atlassian's elevation guidance all carry height this way.
- **Where.** The tokens are named in that order: deep, page, surface, raised, card, card under the pointer, control.
- **Checked by.** Nothing.
- **Status.** *Broken*, widely. The things that float highest stand on the darkest ground: the pin tray (`styles/local.css:337`), the history finder, step panel and step dialog (`styles/history.css:21, 66, 87`), the ancestry popover (`local.css:352`), the scrubber (`history.css:7`), the perspective controls (`local.css:307`), the item menu (`styles/shell.css:406`) and the narrow reader (`shell.css:442`) are all `ground.deep`, darker than the map's `ground.surface` beneath them. The sidebar is `ground.raised` (`shell.css:4`). Surface and raised stand 1.01 to 1 apart, two tokens the eye cannot tell apart. And the 2D cards, which stand *in* the map, cast a shadow (see [Layering](#layering-and-elevation)). So the product does not carry height by tone: a floating panel is told by its border, its shadow and its sinking below the map's tone, the opposite of this rule. Whether the rule or the product should change is a fork for the owner ([the findings](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/design-system/README.md#the-owners-forks)).

**Rule: a region is ground, a card is figure.**

- **The terms.** **Figure and ground** is the perceptual split between what is looked at and what it stands on.
- **What the rule says.** An opened directory's outline is seen against the map but is no stronger than a card's border, so that the directory is seen without competing with its cards. The outline is `line.membrane` (`#3d3d45`); a card's border is `line.interactive` (`#3f3f46`), not `line.border`. Against the map's ground (`ground.surface`, `#1e1e1e`) they stand at 1.55 and 1.60 to 1, the figures the Explorer design records; against the page ground in the table above, 1.65 and 1.70.
- **Why.** Measured and decided by the root on 2026-11-15: the outline had stood at 1.25 to 1 ([the Explorer design, "Tone on the 2D map"](../../layer-3/live-documentation-explorer.mdmd.md)).
- **Checked by.** `tests/e2e/local-map-tone.spec.ts`, "an opened directory's outline can be seen against the map, is no stronger than a card's border, and is no filled box": it reads both colours from the page and holds the outline at 1.5 or more and no higher than the border.
- **Status.** Holds.

**Rule: bright outside, dark inside.** The World Map defaults to its light form and the Local Maps are dark. A person may set the two apart.

- **Why.** Owner, 2026-09-29: "the world map is bright and the local map is dark by default. I think that is a wonderful juxtoposition and gives one the feeling of inside-versus-outside" ([owner.md](../../../AI-Agent-Workspace/Memory/owner.md#formatting-and-visual-taste)).
- **Where.** `palette.ts`, `world.light` and `world.dark`.
- **Status.** Holds. The owner turned down a single theme page for every view on 2026-11-16: a view's light or dark is that view's own.

### Text tones

From `palette.ts`, `text.*`. The ratios are against a card (`#232326`), measured 2026-11-18, and for the three quiet tones Today took from Proposed on 2026-11-19, measured that day. The use counts are `var(--…)` references in the stylesheets, and a few of them are not words: `history.css:43` paints a tick, `local.css:243` an icon, `shell.css:277` a background.

| Token | Today | Ratio | Proposed and Vivid | Uses | Meaning |
| --- | --- | --- | --- | --- | --- |
| `text.strong` | `#ffffff` | 15.67 | same | | Headings and strong names in panels |
| `text.normal` | `#e4e4e4` | 12.33 | same | | Body text |
| `text.secondary` | `#cccccc` | 9.76 | same | | Secondary text |
| `text.cardFileName` | `#f2f2f2` | 14.00 | same | | A 2D card's file name |
| `text.cardSymbolName` | `#ededed` | 13.39 | same | | A symbol's name on a card |
| `text.cardProse` | `#b0b0b0` | 7.23 | same | | Purpose and descriptions on a card |
| `text.panelMuted` | `#9ca3bc` | 6.25 | same | 26 | Quiet panel text, and the search's Ctrl+P hint on its keycap |
| `text.muted` | `#939393` | 5.10 | same | 31 | Paths, counts, metadata; the sidebar's section labels, the search's placeholder, "Nothing found" and the search clear's × (until 2026-11-19 `#888888`, 4.42) |
| `text.subtle` | `#8a8a8a` | 4.54 | same | 2 | Quieter still (until 2026-11-19 `#777777`, 3.50) |
| `text.panelSubtle` | `#828a9a` | 4.52 | same | 19 | The panels' quietest text (until 2026-11-19 `#6c7484`, 3.34) |
| `text.disabled` | `#666666` | 2.73 | same | 0 | A disabled control, exempt from contrast. Until 2026-11-19 it drew five live words and signs; since then it draws nothing, and `palette.test.ts` ("the disabled tone") allows it only on a disabled control's selector |
| `text.onSelected` | `#ffffff` | 3.23 on `#0091ff` | `#111318` on `#f2f2f2` | 3 | Words on a selected fill |

**Rule: words stand at 4.5 to 1 or better (text contrast).**

- **The rule.** Every word a person must read stands at 4.5 to 1 against what is behind it, or 3 to 1 if it is large. Large means at least 24 px, or at least 18.66 px and bold.
- **Why.** Principle: WCAG 2.2 success criterion 1.4.3, Contrast (Minimum), level AA. A disabled control is exempt.
- **Checked by.**
  - Unit level: `palette.test.ts` ("a valid palette") holds every text tone at 4.5 to 1 on a card in every palette. Today's palette is excused exactly its nine identity distances and nothing else, so its words are held too (since 2026-11-19). "The disabled tone" allows `text.disabled` only on a selector of a disabled control (`:disabled`, `[disabled]`, `[aria-disabled="true"]`) and in no script.
  - Page level: `local-map-tone.spec.ts`, `labels-and-controls.spec.ts` and `shell-accessibility.spec.ts` ("the words the sidebar and the search draw stand at 4.5 to 1, and the clear's glyph at 3 to 1"), using `tests/e2e/contrast.ts`.
- **Status.** Holds for the text tones in every palette since 2026-11-19, when Today took Proposed's `muted`, `subtle` and `panelSubtle` (5.10, 4.54 and 4.52 on a card; they had stood at 4.42, 3.50 and 3.34). `text.muted` still falls under 4.5 on a card under the pointer (4.34) and on a control (4.11).

  *Broken* in every palette: `button.action-btn` draws bold white words on `#0091ff` at 3.23 to 1 (`styles/view-shared.css:343–351`). Today's blue is the owner's choice of palette.

  Mended on 2026-11-19: `text.disabled` had drawn five live words and signs that are not disabled controls, at 2.30 to 2.90. The sidebar's section labels, the search's placeholder, "Nothing found" and the clear's × now take `text.muted` (5.35 to 5.43 on their grounds), and the Ctrl+P hint takes `text.panelMuted` (5.27 on its keycap, where muted stands at 4.30). The clear no longer fades to 0.7, so its glyph clears WCAG 1.4.11's 3 to 1.

**Rule: hierarchy by value on a card.** On a 2D card, rank is told by lightness because the sizes are fixed by the card's fits:

- the file's name is brightest;
- a symbol's name is a step below;
- the prose is a clear step down.

**Value**, in the designer's sense, is lightness. See [Typography](#typography) for the rest of the hierarchy.

- **Why.**
  - Owner, 2026-11-15: they named "font hierarchy" among the nits.
  - Measured by the root the same day: every text was then one grey, and a 12 px description stood larger than its 11 px name ([the designer's reading, item 1](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/Screenshots/designer-eye/README.md)).
- **Where.** `text.cardFileName`, `text.cardSymbolName` and `text.cardProse`.
- **Checked by.** `local-map-tone.spec.ts`.
- **Status.** Holds.

### Identity colours: a connection's role and a file's kind

From `palette.ts`. **Identity colours** are hues that tell one category from another.

| Meaning | Token | Today | Proposed | Vivid kinds | Drawn as |
| --- | --- | --- | --- | --- | --- |
| What offers | `role.offers` | `#38bdf8` | `#23a1ef` | `#1bc3f3` | 2D wire's start, 2D pin, marble's blue vein, World door |
| What uses | `role.uses` | `#34d399` | `#5ee7b5` | `#24fcba` | 2D wire's end, 2D pin, marble's green vein, World door |
| Implementation | `kind.implementation` | `#0091ff` | `#a8b2c3` | `#0c84fa` | 3D sphere or marble glass, 2D cell, keys |
| Test | `kind.test` | `#28a745` | `#8a5cff` | `#0a8e00` | the same |
| Asset | `kind.asset` | `#e83e8c` | `#db547e` | `#db547e` | the same |
| Document | `kind.document` | `#9966cc` | `#f1d96e` | `#f1d96e` | the same, and its 3D wires |
| Directory | `kind.directory` | `#e9984d` | `#e9984d` | `#e9984d` | 3D hub and containment line |
| Has tests (2D card) | `hasTests.mark` | `#8a5cff` | `#8a5cff` | `#8a5cff` | halo, border and chip |
| Changed in this commit | `history.changed` | `#ffffff` | `#ffffff` | `#ffffff` | the changed sphere under Glow |
| The 3D button's cue | `signal.cue` | `#e9b86d` | `#e9b86d` | `#e9b86d` | an amber rise on the 3D button; on the 2D map, what it counts: a returning connection's laces and route, a forward wire that doubles back |

Today also draws a second value for some meanings in `secondValues`: the 2D pins `#0091ff` and `#00d3aa` beside the wires' colours, and the subject card's ring. Proposed and Vivid set every second value to its meaning. The light World's pressed tool cannot be its meaning, a fill under a dark icon, so it is drawn from it as the dark World draws its own: the light form's blue at 16% over the white board (`#d7e7f2`). Until 2026-11-19 `errorWash`, `pathFoundWash` and `worldLightPressed` kept Today's values against the palette's comment; `palette.test.ts` now holds all three in both palettes.

**Rule: blue offers, green uses, at every scale.** What an interface offers is blue. What uses it is green. A 2D wire runs from blue at its offering end to green at its using end.

- **Why.** Owner. The first use of the two hues was the owner's, on 2025-12-03: "We should see the green dots of symbols being connected back to their inbound dependencies and we should see blue dots of symbols connecting outward to their outbound dependencies." The same day they left the hues to the agent and asked only for consistency: "However you want to color code that (which is green versus which is blue) is A-okay by me, but stick to it: Input = left, Output = Right." On the word for what a thing exposes, 2026-09-29: "Offers!! I Like that!" All three are in [the colour record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/Probes/colour-pass/history.md). So the owner's reason is for one meaning per hue kept at every scale; which hue is which they delegated.
- **Where.**
  - `role.*`.
  - The wire's gradient in `views/localView/connections.ts`.
  - `--wire-opacity: 0.7` in `styles/theme.css:16`.
  - The marble's veins in `views/forceGraphAppearance.ts`.
- **Checked by.** `palette.test.ts` ("draws the 2D and World wires in the roles' colours"), and `spatial-legend.spec.ts` for the keys.
- **Status.** Holds.
- **Do and don't.**
  - *Do* carry the roles into the 3D map, while marbles are drawn (Tuning → Colour → Marbles → On; off by default since 2026-11-19), through the marble's veins, which are a file's own share of offering and using.
  - *Don't* colour a 3D wire by direction. That was tried on 2026-10-30 and withdrawn at the owner's eye the next day: on a dense web, "too many connectors drawn ... to confer any ability for the end user to understand what color means on any one connector".

**Rule: a file's kind is told by colour, in both maps.** In the 3D map and in a closed directory's cells in the 2D map, a file's colour is its kind.

- **Why.** Owner, 2026-11-17, weighing "drab", "loss of category information via color" and "mild color meaning collision": "I still aesthetically lean towards "mild color meaning collision" as the better of the 3 options" ([direction](../../../AI-Agent-Workspace/Memory/direction.md#open-with-the-owner)). A 3D map without strong colour was refused.
- **Where.** `kind.*`, read by `spatialNodeStyles()` in `views/forceGraphAppearance.ts`.
- **Checked by.** `closed-directory-looks.spec.ts` ("a cell takes its file's kind's colour") and `spatial-legend.spec.ts`.
- **Status.** Holds.

**Rule: one hue answers one question.** No two meanings that can stand in one view share a colour or sit near one. This is semantic colour in the strict sense.

- **Why.** Principle: hue is the strongest channel for telling categories apart (Munzner's ranking of identity channels). It only works if each hue has one meaning to learn. This is also why the owner wants colours "colored by salient information that their eyes can learn and adjust to" ([the colour record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/Probes/colour-pass/history.md)).
- **Status.** *Broken* under Today:
  - `#0091ff` is the implementation kind, the offering pin, and the selected, active and focused state.
  - Green is both the using pin and the test kind.
  - The has-tests violet stands 8.7 from the document kind's violet.

  *Broken* under Proposed, too:
  - The has-tests mark and the test kind are one colour, `#8a5cff` (`palette.ts:250, 299`). The palette's comment says this is meant ("a test file takes the violet the 2D cards already use for having tests"): the two meanings are near kin. If the product means it, the rule as written is wrong for them and should say that kin meanings may share a hue; that is for the owner.
  - The document kind's yellow stands 8.6 from the cue's amber.

  *Broken in every palette*: the 3D button's cue, amber `#e9b86d`, stands 7.5 from the directory kind's orange `#e9984d`, and both are drawn on the 2D map (`styles/local.css:321, 536`).

  Vivid kinds clears the distance floors below. The owner accepts a *mild* likeness between a kind's colour and a role's as the least bad option so far, not as the answer.

**Rule: identity colours clear the distance floors.**

- **The rule.** Any two identity colours that can stand in one view are at least **15 apart in OKLab × 100** for full colour vision, and at least **8 apart** under simulated protanopia and deuteranopia (full severity). Each also stands at **3 to 1** against the page, a card and the 3D ground.
- **The terms.** **OKLab** is a colour space whose distances follow perceived difference. **Protanopia** and **deuteranopia** are the two red-green colour blindnesses, which together affect about 8% of men.
- **Why.**
  - Principle: WCAG 1.4.11, Non-text Contrast (AA), asks 3 to 1 of graphics needed to understand content.
  - Distinguishability floors are practitioner heuristics, not a standard. Petroff's published sets use comparable minimum distances (CAM02-UCS 16 to 20).
  - Measured: the floors are the colour pass's proposal ([how distances were measured](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/Probes/colour-pass/README.md#how-distances-were-measured)).
- **Where.** `shortfalls()` in `palette.test.ts`.
- **Checked by.** `palette.test.ts`, "a valid palette".
- **Status.**
  - Holds for Proposed: closest pairs 15.2 and 8.5.
  - Holds for Vivid kinds: 15.9 and 9.3.
  - Broken for Today, the default: the offering pin and implementation are 0.0 apart, and a test and a directory are 2.5 apart under protanopia.

**Rule: the interface wears no data colour (neutral chrome).**

- **The rule.** What is selected, active, pressed or focused is drawn in a neutral, so that every hue on the screen is information.
- **The term.** **Chrome** is the interface around the data.
- **Why.** Principle: in a picture made of data, chrome in a data hue reads as data. Carbon's data-visualisation guidance and the colour pass both state it.
- **Where.** `state.selected`: `#0091ff` in Today, `#f2f2f2` in Proposed and Vivid kinds.
- **Checked by.** Nothing.
- **Status.** *Proposed.* Broken under Today, where the chrome's blue is the product's most-used colour (94 readings of `var(--state-selected)` on 2026-11-18; the colour pass counted 90), and 17 focus rings are drawn in it.

**Rule: white is the event.**

- **The rule.** The changed file of the history step shown is white on dark (under Glow), and nothing else of its size is.
- **Why.** Owner, 2026-10-31: "it should be obvious what is actually changing as a commit is walked by during history playback" ([Turn 8 of the October 31 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-31/2026-10-31.1.record.md#turn-8); `views/forceGraphEmphasis.ts` quotes it in its head comment).
- **Status.** Holds in the default mode, Dim, where a changed file keeps its colour and the others lose four fifths.
- **At the innermost thing drawn, in both maps.** A change is shown on the smallest thing the picture draws for the changed file: its sphere, dot or card where one is drawn, else the bubble, skin or closed box that holds it. In 2D a changed card wears the history's white edge under Glow, and a closed directory holding a file the step changed or deleted wears it on its border or drawn outline (`styles/local.css`, the history block). The cells inside a closed box are not lit one by one; the box stands for them.
  - Why: owner, 2026-11-11, of the 3D bubbles: "I don't see any of the nodes deep inside the bubbles lighting up when they were affected by a commit" ([Turn 6 of the November 10 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-10/2026-11-10.1.record.md#turn-6)); carried into 2D when the history came to it ([Turn 34 of the November 18 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-34)).
  - Checked by: `tests/e2e/history-emphasis.spec.ts` (3D) and `tests/e2e/history-2d.spec.ts` (2D boxes).
- **Where it is weak.** Every 3D reference wire is also white (`scene.wire`, `views/forceGraphView.ts:1895–1902`). Among marbles, under Glow, the white ball reads "unpainted" rather than lit ([the defaults round](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/defaults-round/README.md)). See the findings.

**Rule: amber is the one warning hue the chrome keeps.**

- **The rule.** The 3D button's cue, that connections run backward in the 2D map, is amber, and so is each connection it counts where the 2D map draws it: a returning connection's laces and its route, and a forward wire whose route doubles back. Errors are red.
- **Why.** Owner, 2026-11-02: they asked for the 3D button to light on a file with many returning connections (the Explorer design, "The 3D button's cue"). Owner, 2026-11-19, of the button lit over a picture whose returning wires they could not find: "We should probably use that alert color to call attention to the specific wires which are violating the left/right arrangement rule." ([Turn 23 of the November 18 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-23)). The withdrawal of colour by direction on 3D wires (2026-10-31) was of a dense web; the 2D map draws few such connections.
- **Where.** `signal.cue` and `signal.error`; the laces' fill in `views/localView/connections.ts`, the route's and a doubling wire's stroke in `styles/local.css`. The count and the marks share one test, so the button and the map cannot disagree.
- **Checked by.** `backward-cue.spec.ts`; `returning-connections.spec.ts` (the laces and the route) and `local-map-branches.spec.ts` (a doubling wire).
- **Status.** Holds.

### Strength: opacity that carries meaning

Each value below is a meaning, not decoration. Values are read from the files named.

| Where | State | Value | Source |
| --- | --- | --- | --- |
| 2D map | a wire at rest | 0.7 | `styles/theme.css:16` (`--wire-opacity`) |
| 2D map | rows and cards unrelated to the hovered symbol | 0.5 (Tuning, `hoverDimSymbols`) | `persistence/local-storage.ts:58`; `styles/local.css:178, 200, 211` |
| 2D map | wires unrelated to the hovered symbol | 0.1 (Tuning, `hoverDimConnections`) | `persistence/local-storage.ts:59`; `styles/local.css:195` |
| 2D map | a closed directory's cells at rest | 0.5, whole under pointer or focus | `styles/local.css:420, 430, 435` (`--cells-quiet`) |
| 3D map | a sphere outside the hovered file's reach | 0.2 | `views/forceGraphView.ts:1860` |
| 3D map | a sphere at the frontier, beyond the hops | 0.4 (a wrapper 0.6) | `views/forceGraphView.ts:1854, 1860` |
| 3D map | a reference wire: local, whole root, hovered, to the frontier, hidden, on a path | 0.3, 0.16, 0.5, 0.12, 0.025, 0.9 | `views/forceGraphView.ts:1895–1901` |
| 3D map | containment and document wires: shown, dimmed, hidden | 0.35, 0.15, 0.08 and 0.4, 0.15, 0.04 | `views/forceGraphView.ts:1891–1892` |
| 3D map | a reference wire in the Structure layout | 0.5 | `views/forceGraphView.ts:1896` |
| 3D map | a cited-by wire: shown, dimmed, hidden | 0.55, 0.2, 0.06 | `views/forceGraphView.ts:1894` |
| 3D history | an unchanged sphere or wire under Dim | loses 0.8 of its alpha | `views/forceGraphEmphasis.ts:26` |
| 3D history | a changed wire under Glow | 0.85 | `views/forceGraphEmphasis.ts:28` |

**Rule: nothing is drawn above rest.**

- **The rule.** A hover or a pin fades what is unrelated. Nothing related is raised above how it stands at rest.
- **Why.** Owner, under principle 2. Measured by the root on 2026-11-15: a wire's bloom came from its glow, not its opacity, and lighting a hovered wire broke the oldest rule of the 2D map ([the Explorer design, "Tone on the 2D map"](../../layer-3/live-documentation-explorer.mdmd.md)).
- **Checked by.** `local-map-tone.spec.ts`.
- **Status.** Holds in the 2D map.
- **The two exceptions the owner asked for.**
  - A path's wires at 0.9 in 3D: owner, 2026-10-30, a path reads over its web.
  - The glow on a pinned row or file (`--offers-pin-glow`).

### Glow, as distinct from shadow

**Rule: a shadow says height, a glow says meaning.** A shadow is offset and black. A glow is centred (`0 0 Npx`) and wears a meaning's colour. The two are never used for each other's job.

- **Why.** Principle: one visual variable, one job (Bertin). Here a glow is a meaning's halo, never a depth cue.
- **Where.**
  - Glows: `--offers-pin-glow` and `--uses-pin-glow` (`styles/theme.css:10–11`), `--has-tests-glow` (`theme.css:21`), and `--backward-glow` (`styles/local.css:321–324`).
  - Shadows: see [Layering](#layering-and-elevation).
- **Checked by.** Nothing.
- **Status.** *Broken.*
  - A glow is not always centred. The has-tests glow is offset, `0 12px 24px` (`styles/view-shared.css:102`) and `0 3px 6px` (`:309`), and the subject card wears an offset blue one, `0 12px 30px` in the selected colour (`:86`). These are coloured shadows: they do a shadow's job and a glow's at once.
  - More things glow than the two the owner asked for (principle 2): besides those three, `0 0 6px currentColor` (`view-shared.css:511`), the Internals pin (`:533`), the legend's samples (`0 0 5px`) and the 3D button's cue.
  - For the has-tests glow the record gives no reason (see the findings).

---

## Typography

### What is in use: type

Counted from the stylesheets on 2026-11-18. Every word on screen is set in CSS; no canvas draws text in its own font.

- **Families:** 5 `font-family` values, one of them `inherit`, and three more stacks written inside `font` shorthands in `styles/world.css` (`:35, 285, 438, 469, 538, 750`). So three proportional stacks and four monospace ones:
  - `"Segoe UI", sans-serif` is the body and the symbol labels (`styles/theme.css:33`, `styles/view-shared.css:137`);
  - the World Map's `system-ui, -apple-system, "Segoe UI", sans-serif` (`world.css:35`) and `system-ui, sans-serif`;
  - `"Fira Code", "Consolas", monospace`: Knowledge Sources;
  - `'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace`: the symbol badge;
  - bare `monospace`: the type badge, the search shortcut and the Tuning readouts;
  - the World Map's `ui-monospace, Consolas, monospace`.
- **Sizes:** 16 distinct values in 172 declarations, from 8 to 28 px (recounted 2026-11-19, after the reader's headings became relative).
  - 13 px: 43; 12 px: 40; 11 px: 33; 10 px: 17. These four carry 133 of the 172.
  - 14 px: 10; 15 px: 7; 16 px: 3; 18 px: 4; 9 px: 3; 22 px: 2.
  - 8, 17 and 28 px: 1 each.
  - The rest are relative: `1em`, `0.9em`, `0.95em`, and `calc(1em + 1px)` to `calc(1em + 3px)` for the reader's headings.
- **Weights:** 4 values. 600 in 23 places, 500 in 9, 400 in 5, `bold` (700) in 4.
- **Line heights:** 22 distinct values. The commonest are 1.5 (8), 1.4 (4), 1.65 (4), 1.55 (3) and 1.6 (3); the rest are fixed pixel lines on the 2D map, set from its layout.
- **Letter spacing:** 10 distinct values, in em and in px.
- **Case and style:** `uppercase` in 15 places, all section labels; `italic` in 6.

### Rules for type

**Rule: rank is told by value first, then weight, then size (type hierarchy).**

- **The term.** **Type hierarchy** is the order in which the eye meets text.
- **The rule.** Where sizes are fixed by layout, as on a 2D card, rank is carried by value. Weight comes next. Size is used only where the layout leaves it free.
- **Why.**
  - Owner, 2026-11-15, "font hierarchy".
  - Measured: the card's sizes are held by its fits, so value is the free channel ([the designer's reading](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/Screenshots/designer-eye/README.md)).
- **The card's ranks.**
  - File name: 13 px, bold, `#f2f2f2`.
  - Symbol name: 11 px, `#ededed`.
  - Description: 12 px, `#b0b0b0`.
  - Path: 10 px, `text.muted`.
- **Checked by.** `local-map-tone.spec.ts`.
- **Status.** Holds by value on the card. A description is still a pixel larger than the name it describes. That is the accepted cost of the fits, and it is why the value step is large: 7.23 against 13.39 to 1.

  The reader's headings are sized from the prose they head since 2026-11-19: `calc(1em + 3px)`, `+ 2px`, `+ 1px` and `1em` for h1, h2, h3 and h4 to h6 (`styles/shell.css`, `.reader-prose`). In the panel beside the map that is 16, 15, 14 and 13 px over a 13 px body, as before; in the reading dialog, 18, 17, 16 and 15 px over 15 px. Until then the dialog's h3 stood at 14 px, smaller than the body under it. Checked by `shell-accessibility.spec.ts` ("no heading in the reading dialog is smaller than the prose it heads"). The headings still step by one pixel, which is the type scale's open question below.

**Rule: a container's name is never smaller than its contents' names.**

- **The rule.** A directory's name is drawn no smaller on screen than the file names inside it, at every zoom. From the connections look outward, the whole handle is held at the file names' size.
- **Why.**
  - Principle: a map sets a country's name larger than its cities'.
  - Measured by the root on 2026-11-15: an opened directory's label had shrunk to 6 px beside file names held at 13 px ([the Explorer design, "A directory's handle, at every zoom"](../../layer-3/live-documentation-explorer.mdmd.md)).
  - The owner's remark of that day, that directories in the 2D map "still aren't exceptionally _useful_ (interaction-wise) at high zoom-outs because there are no buttons to interact with at that distance" ([Turn 1 of the November 15 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)), is about controls, not the size of a name; it is the reason for the handle's target below, not for this rule.
- **Where.** `views/localView/directory-handle.ts` (`HANDLE_LINE = 15`) and `styles/local.css:383–399`.
- **Checked by.** `closed-directory-looks.spec.ts` and `directory-handle.test.ts`.
- **Status.** Holds.

**Rule: held sizes step by 1.2 and stay within four fifths.**

- **The rule.** On the 2D map a held size changes only at a zoom step. Each step is a zoom of 20 %, four steps to a doubling (`STEP_RATIO = 1.2`, `views/localView/ladder-steps.ts:17–18`), so a held size on screen lies between 0.87 and 1.15 of its reading size. The first step holds reading size for every closer zoom, so zooming in never shrinks anything.
- **Why.**
  - Owner, 2026-11-06: breakpoints over per-frame scaling, with "Clamps as in "prevent runaway goofy rendering results that emerge from extreme inputs"" ([Turn 19 of the November 5 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-19--november-6)); the agreed floor of four fifths.
  - Principle: perceived size constancy (principle 5).
- **Checked by.** `ladder-steps.test.ts` and `card-ladder-boxes.spec.ts`.
- **Status.** Holds.

**Rule: a 3D name appears at the last second, then keeps its size.**

- **The rule.** A file's name in the 3D map is drawn when its sphere is drawn at 18 px (Name At, a Tuning lever), on hover, or for things the person asked about. A drawn name keeps its reading size.
- **Why.** Owner, 2026-11-02: "we don't draw a node's name (unless hovered over) until _the very last second_ ... our current system is overexcited to draw text".
- **Where.** `persistence/local-storage.ts:99` (`nameAt: 18`) and `views/forceGraphLabels.ts`.
- **Checked by.** `forceGraphLabels.test.ts`.
- **Status.** Holds.

**Rule: italic stands for what is not drawn.**

- **The rule.** Italic marks text that speaks of something not itself on screen:
  - a placeholder (`.pin-tray-absent`);
  - a summary of more (`.search-row--apart`, the destination's files no path connects; the search's counts of what its limits leave out left italic words for an arrow and a number on 2026-11-21, `.search-fold`);
  - a status (`.loading-indicator`);
  - where a file lives (`.node-directory`);
  - the Internals row, a file's private implementation summarised in one row.
- **Why.** Owner, 2026-11-07, of the Internals row's "dashed, italic quiet": "'As Built' is by far the most aesthetically pleasing so far" ([owner.md](../../../AI-Agent-Workspace/Memory/owner.md#formatting-and-visual-taste)). The other five uses fit the same reading. No source states the general rule.
- **Checked by.** Nothing.
- **Status.** *Proposed*, as the reading that makes the six uses one rule.

**Proposed rules, not yet the product's.**

- **A named type scale.** The product's sizes step by single pixels: 10, 11, 12, 13, 14, 15 and 16. Steps that close make no scale the eye can learn. A type scale gives each step a role (caption, label, body, title, heading) and a ratio between steps.
  - **Why.** Principle: hierarchy is read from differences, and a difference the eye cannot see is no difference (Tufte's smallest effective difference, applied to size). Material 3 and Carbon each publish a named scale with its roles.
  - **What to do.** The findings give the roles the product's sizes already fall into, and a scale that keeps the map's held sizes.
- **Two weights for words, three at most.** Regular (400) for reading and semibold (600) for names and headings. 500 only where a third step is defended. `bold` and 600 are not both used for one role.
  - **Why.** Principle: Carbon ships three weights and keeps semibold off long text.
  - **Today.** `.node-title` is `bold` while a closed directory's name is 600 (`styles/view-shared.css:107`, `styles/local.css:484`).
- **The smallest word is 11 px in the chrome.** No word a person must read is set under 11 px. A decorative marker may be smaller.
  - **Why.** WCAG sets no minimum size. Material's smallest role is 11 px and Carbon's 12 px.
  - **Today.** 9 px words exist: the type badge (`view-shared.css:470`) and the search row badge (`search.css:244`).
- **One family stack for each voice.** One proportional stack that reads well on every platform, and one monospace stack.
  - **Why.** Measured: off Windows, `"Segoe UI", sans-serif` falls to whatever generic sans the system has. The 2026-11-15 pictures had to borrow Segoe UI's metrics to judge widths.
  - **Today.** Three proportional stacks and four monospace ones (above). The World Map already uses a system stack, `system-ui, -apple-system, "Segoe UI", sans-serif` (`styles/world.css:35`), so the product holds both answers at once.

---

## Shape

### What is in use: shape

The values of `border-radius` in the stylesheets on 2026-11-18: 14 distinct values in 107 declarations.

| Value | Uses | Where, by role |
| --- | --- | --- |
| 4px | 35 | Buttons and inputs; badges; the pinned row's highlight |
| 6px | 16 | The 2D file card (`.node-card`, `view-shared.css:66`); toolbars of controls; the search input; World tools |
| 50% | 15 | Circles: anchor dots, legend samples, the history thumb, round buttons |
| 8px | 11 | Floating surfaces: menus, search results, the pin tray, the history panels, World help and tour |
| 3px | 9 | Small inline controls: a row's Pin and More, the directory handle, `kbd`, the type badge |
| 2px | 4 | Hairline marks: a slider track, a checkbox tick, a legend sample |
| 12px | 4 | Large containers: the reading card, the closed directory box, the directory ancestor preview, the Knowledge Sources panel |
| 5px | 3 | A focus outline's shape round a 4px thing; a directory cell; the reading counts |
| 999px | 3 | Pills: the view toolbar, the filter toggles; the ring around a cell under the pointer |
| 10px | 3 | The reading dialog; the has-tests halo; the closed directory's tab shape |
| 0, 9px, 24px, `7px 7px 3px 7px` | 1 each | A cell; the ancestry bar; the round closed shape; the ancestor tab |

### Rules for shape

**Rule: a card's corners are rounded.** A 2D file card has rounded corners.

- **Why.** Owner, 2026-11-04: "I cannot stress enough how "Card" really does carry the semantics of trading/playing cards" ([Turn 15 of the November 3 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-03/2026-11-03.1.record.md#turn-15--november-4)). A playing card's rounded corner is part of how it is recognised; that reading is the author's, not the owner's.
- **Status.** Holds at 6px.

**Rule: a circle is a thing, a pill is a choice.** `50%` draws a circle, which is a mark standing for a thing: an anchor dot, a cell, a legend sample. `999px` draws a pill, which is a control holding a set of choices: the view toolbar, the filter toggles.

- **Why.** Principle: shape similarity groups like with like (Gestalt similarity). The owner's "bags of cells" made the round mark the file's sign.
- **Status.** *Broken.* Controls are drawn as circles too: the zoom buttons (`styles/view-shared.css:324`) and the World Map's help button (`styles/world.css:461–464`) are `50%`, and the shape table above counts "round buttons" among its circles. The ring drawn around a cell in a handle under the pointer is `999px` (`styles/local.css:440`), which on a cell's square box is a circle; a directory's cell has a 5px ring (`local.css:441`). The product's practice may be the simpler statement: a single round thing, mark or button, is a circle, and a row of choices is a pill. Which statement the product keeps is in the findings.

**Proposed rules, not yet the product's.**

- **A radius scale of five steps and full.** Hairline 2, control 4, surface 8, container 12, and full (a circle or a pill). Each surface takes the step of its role, not of its size.
  - **Why.** Principle: Material 3 and Atlassian each publish a short named scale. A role-based scale makes the corner itself say "control", "panel" or "container".
  - **Today.** Four values sit outside that scale: 3, 5, 6 and 10 px.
- **Nested corners are concentric.** Where a rounded thing sits inside another with padding *p*, the outer radius is the inner radius plus *p*, and the inner radius is never larger than the outer.
  - **Why.** Principle: concentric corners keep the gap between two edges even (practitioner convention, as Cloud Four writes it up). Uneven gaps are "work for the eye" under principle 1.
  - **Checked by.** Nothing.

---

## Spacing and sizing

### What is in use: spacing and sizing

Counted from the stylesheets on 2026-11-18:

- **padding:** 82 distinct values in 180 declarations.
- **margin:** 50 in 167.
- **gap:** 24 in 92 by the first count; 22 in 85 by a second count of `gap` alone, which suggests the first also counted `row-gap` and `column-gap`. The two counts were not reconciled; until a check holds them, take the gap figures as approximate.

The gaps, by frequency in the first count: 6 (16), 4 (14), 12 (12), 8 (11), 10 (10), 2 (5), 14 (3), 24 (2), 20 (2), 3 (2), 28 (2), then single uses of 0, 1, 5, 7 and 18 px, and three compound or variable values.

**The 2D map's own geometry is a separate system.** It is measured in map units and held by the layout's unit tests. It is not the chrome's spacing. Its values:

- the column unit, `LAYOUT_UNIT = 64` (`views/localView/branch-renderer.ts:762`);
- the routing lanes, `LANE_PITCH = 7`, `LANE_PADDING = 6` and `LANE_MARGIN = 10` (`views/localView/branch-routing.ts:7–13`);
- the directory handle's line, air and indent, 15, 6 and 16 (`views/localView/directory-handle.ts:17–41`);
- the gap between a name and its controls, `CONTROLS_GAP = 4` (`views/localView/held-lines.ts:82`).

### Rules for spacing and sizing

**Rule: a box never changes size with the zoom.** On the 2D map, a card's and a closed directory's box in map space is fixed. Inside it, each part is bounded by the room of the box it belongs to. Where that room runs out, the part follows the map or leaves the picture.

- **Why.**
  - Owner, 2026-11-05: "keep the card the same size".
  - Owner, 2026-11-06: "things exceeding boundaries at very distant zoom-outs" ([the Explorer design, "The far and overview bands"](../../layer-3/live-documentation-explorer.mdmd.md)).
- **Checked by.** `card-ladder-boxes.spec.ts`, `closed-directory-looks.spec.ts` and the design audit.
- **Status.** Holds.

**Rule: a card is portrait.** The default card composition is taller than wide.

- **Why.** Owner, 2026-11-04: "Prefer portrait in general if the aim is to have Live Documentation look good on many many different screen sizes. Plus, a Card is more portrait." ([Turn 2 of the November 4 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-04/2026-11-04.1.record.md#turn-2)).
- **Status.** Holds.

**Rule: a directory's handle is at least 24 px tall where it is pressed.** Through the reading and connections looks, a directory's handle is pressable over the strip's whole height, at least 24 px on screen.

- **Why.** Principle: Fitts's law. Also WCAG 2.2 success criterion 2.5.8, Target Size (Minimum), level AA, which asks 24 by 24 CSS px. Owner, 2026-11-15: directories "still aren't exceptionally _useful_ (interaction-wise) at high zoom-outs because there are no buttons to interact with at that distance" ([Turn 1 of the November 15 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)).
- **Status.** Holds through the reading and connections looks. At the overview look the handle is 21 to 12 px tall, held as tall as the strip allows. Target sizes as a whole belong to the interaction half.

**Proposed rule: one spacing scale for the chrome.** Every padding, margin and gap in the panels, toolbars and dialogs takes a step of 0, 2, 4, 6, 8, 12, 16, 24, 32 or 40 px.

- **Why.** Principle: a constrained scale makes equal relationships look equal, and it is what Carbon (2, 4, 8, 12, 16, 24, 32, 40, …), Atlassian (which includes 6) and Polaris publish.
- **Today.** Measured on the gaps: most already fall on this scale (69 of 92 by the first count, 59 of 85 by the second). The rest are 10, 14, 18, 20, 28, 1, 3, 5 and 7.
- **Not covered.** The map's own geometry, above, is not under this rule.

---

## Layering and elevation

### What is in use: layering

**`z-index`:** 22 distinct values in 44 declarations, falling into two bands:

| Band | Values | What stands there |
| --- | --- | --- |
| Inside a view | −1, 1, 2, 3, 4, 5, 6, 20, 28, 30 | Highlights under their rows; the 3D label layer; the wires layer; anchor dots and hubs; the World's HUD, help, evidence and tour |
| The application | 100, 104, 105, 106, 110, 160, 200, 300, 999, 1000, 1200 | The sidebar and controls (100); the 2D-to-3D transition and the history step panel (104, `styles/history.css:66`); the history scrubber and the perspective controls (105); the pin tray (106); the scrubber while its finder is open (110, `history.css:10`); the view toolbar (160); the detail panel and search results (200); the search bar (300); the reading dialog and its backdrop (1000 and 999), and the narrow reader (1000); a card's menu (1200) |

There are ties at 100: the sidebar, the controls, the path report and the directory ancestor preview. Whether any two of them overlap in one stacking context was not checked. The detail panel is declared at 200 (`styles/shell.css:301`) and again at 1000 (`shell.css:440`); the second is inside the narrow-screen media query, where the reader becomes the full-screen modal, so it is deliberate, not a conflict.

**Shadows:** 36 distinct `box-shadow` values in 44 declarations. Of those, 16 are elevation shadows: offset, black at 0.2 to 0.6. The others are glows and stacked-card edges.

**Frosted panels:** backdrop blur at three values: 8, 10 and 14 px.

### Rules for layering

**Rule: elevation is told by tone first, shadow second.** See the tonal elevation rule under [Grounds and lines](#grounds-and-lines-dark-interior). A shadow is added only to what floats over the map (menus, panels, dialogs), never to what stands in it.

- **Why.** Principle: Material's dark theme and Carbon's layering. On `#18181a` a black shadow has little room to read.
- **Checked by.** Nothing.
- **Status.** *Broken*, in both halves. Tone does not carry height (the floating panels stand on `ground.deep`, under [tonal elevation](#grounds-and-lines-dark-interior)), and a map card casts an elevation shadow at rest: `.node-card` has `0 2px 6px` black at 0.28 (`styles/view-shared.css:70`), never overridden (the only `box-shadow: none` rules are at `styles/local.css:518` and `styles/reading.css:227`). The stacked closed-directory look draws its under-cards as offset solid edges, which are a shape, not a shadow.

**Proposed rule: named layers, not numbers.**

- **The rule.** Every `z-index` is one of a short list of named layers, each a custom property in `styles/theme.css`:
  - `map` (0 to 30, inside a view);
  - `map-overlay` (the controls, the tray, the scrubber);
  - `chrome` (the sidebar, the toolbar);
  - `panel` (detail and search results);
  - `search`;
  - `modal` (the backdrop and the dialog);
  - `menu` (above all).
- **Why.** Principle: Atlassian publishes exactly such a list (card, navigation, dialog, popup, blanket, modal, flag, tooltip). Named layers make "what stands over what" a decision, not a race of numbers.
- **Today.** Measured: ties at 100, and one component at two layers.

**Proposed rule: three elevation shadows.**

| Level | Shadow | For |
| --- | --- | --- |
| raised | `0 2px 6px` black 0.3 | small floating controls |
| floating | `0 8px 24px` black 0.4 | menus, results, the tray |
| modal | `0 12px 40px` black 0.5 | dialogs and panels over the map |

Only the middle one is today's: `0 8px 24px` at 0.4 recurs three times (`styles/history.css:21, 66`; `styles/local.css:337`). The nearest to "raised" is the card's `0 2px 6px` at 0.28 (`view-shared.css:70`), and the nearest to "modal" the step dialog's `0 12px 40px` at 0.6 (`history.css:87`); neither level's value exists as written. Today there are 16 elevation shadows across nine offsets and eight strengths. Among them the World Map's are `0 12px 40px` at 0.22, `0 8px 30px` at 0.18 and `0 2px 10px` at 0.12 (`styles/world.css`).

---

## Iconography

### What is in use: icons

**SVG line icons.** 16 SVG icons on a 24-unit grid (`viewBox="0 0 24 24"`), stroked in `currentColor` with round caps and joins. Their drawn sizes are:

| Size | Where |
| --- | --- |
| 18 px | `iconButton` (`panels/icon-button.ts:7`); the search marker (`shared/template.html:512`) |
| 20 by 16 px | the three view icons (`shared/template.html:28–34`) |
| 14 px | a card's Pin, More, Close, Recentre and Read (`views/localView/card-factory.ts:194–227, 327`; `card-reading.ts:71`; `branch-renderer.ts:687`) |
| 13 px | a symbol row's Pin and More (`card-factory.ts:890, 900`), at stroke 1.7; a directory's controls are held at 13 px by CSS (`styles/local.css:447`) |
| 11 px | the reveal-connections mark (`branch-renderer.ts:1713`) |
| variable | the disclosure chevron (`directory-handle.ts:53`) |

Their strokes are 1.5 (most), 1.6 (the view icons), 1.7 (a symbol row's Pin and More; the reveal mark) and 2.5 (the chevron). More is a filled glyph of three dots. Pin is drawn in three places, and the pin tray's toggle draws a different pin from the other two (`panels/pin-tray.ts:56`, against `PIN_ICON` and `PIN_GLYPH`).

**Text glyphs used as icons.** These render in whatever font the system gives (`template.html` is `packages/explorer/src/shared/template.html`):

- `←` and `→` for Back and Forward (`template.html:20–21, 567–568`);
- `◀` and `▶` for Collapse and Open navigation (`:22`, and `index.ts:1220`, which swaps them);
- `⟲` for Return to reading size (`:560`);
- `+` and `-` for Zoom In and Zoom Out (`:558–559`);
- `×` for Close details (`:571`) and for the search's clear (`:519`);
- `?` for the World Map's help (`views/worldMap/controller.ts:296`);
- `▶` and `▼` in the bundled tree (`panels/sources-view.ts:327, 453`).

**Drawn in CSS.** The history dialog's disclosure is drawn with borders (`styles/history.css:99`), and so is the sidebar's summary marker (`styles/shell.css:1004`).

### Rules for icons

**Rule: a repeated action is an icon with a name.** An action that recurs (Pin, More, Close, Read, Recentre) is drawn as an icon, not a word. It carries an accessible name and a tooltip saying what it does.

- **Why.**
  - Owner, 2026-10-01: "There is no reason for "Release", "Pin All", and "Read" to be buttons with text instead of interactible elements whose aria attributes yield a proper accessible textual equivalent for those who are visually imparied or those who wish to hover for a tooltip." ([Turn 44 of the September 30 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/2026-09-30/2026-09-30.2.record.md#turn-44)).
  - Owner, 2026-10-30: "If you look at a piece of software like Microsoft Teams, you see that everything is an icon ... hovering over any icon gives you a good idea of what it is with a tooltip."
  - Principle: WCAG 4.1.2, Name, Role, Value.
- **Where.** `iconButton` sets `title` and `aria-label` from one label.
- **Checked by.** `labels-and-controls.spec.ts`.
- **Status.** Holds for `iconButton` and the card's controls. The text-glyph buttons are covered in the interaction half and the findings.

**Rule: a directory's sign is a disclosure chevron.** A closed directory's handle is led by a chevron pointing right. An opened one's points down. This is the sign a file tree draws, a **signifier**: the mark that tells a person what an object lets them do.

- **Why.** Principle: Norman's signifier, and convention. The occasion was the owner's finding of 2026-11-15 that there were "no buttons to interact with at that distance" ([the designer's reading, item 4](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/Screenshots/designer-eye/README.md)).
- **Where.** `views/localView/directory-handle.ts:53`.
- **Checked by.** `closed-directory-looks.spec.ts`.
- **Status.** Holds on the map. The bundled tree draws `▶` and `▼`, and the history dialog draws a CSS chevron: three signs for one act.

**Proposed rules, not yet the product's.**

- **One icon family.** Every icon is a 24-grid line drawing in `currentColor` at one stroke weight, and is drawn from one module. No text glyph stands in for an icon.
  - **Why.** Principle: icons of one family read as one system, by Gestalt similarity. A text glyph changes its look with the platform's font.
  - **Today.** More is drawn in five places, Pin in three (with two different drawings), Close in two; ten different text glyphs stand in for icons.
- **Icon sizes on a short scale.** 14 px on the map's cards (held with the card's controls) and 18 px in the chrome, each with the 1.5 stroke. Any other size is stated with its reason.
  - **Today.** Sizes of 11, 13, 14, 18 and 20 by 16 px, and strokes of 1.5 to 1.7, for icons of one family.

---

## Motion

### What is in use: motion

**CSS.** Durations of 100, 120, 150, 160, 180, 200, 250, 300, 400 and 450 ms for transitions, written sometimes in `s` and sometimes in `ms`. Loops of 1.2 s (loading), 1.4 s (the World's flow), 1.6 s (the 3D map building) and 1.8 s (the 3D button's cue, once). Easings are `ease`, `ease-out`, `ease-in`, `ease-in-out`, `linear`, the default, and `cubic-bezier(0.25, 0.8, 0.25, 1)` once (`styles/shell.css:295`).

**TypeScript.**

| Motion | Duration | Source |
| --- | --- | --- |
| 3D zoom step | 180 ms | `views/forceGraphView.ts:712` |
| A wrapper's burst | 250 ms | `views/forceGraphWrappers.ts:329` |
| 2D pan and zoom, eased out cubic | 350 ms | `views/localView/pan-zoom.ts:97` |
| 2D re-layout | 450 ms (Tuning `moveMs`) | `persistence/local-storage.ts:67` |
| World orbit | 520 ms | `views/worldMap/controller.ts:1131` |
| 3D focus | 650 ms | `views/forceGraphView.ts:753` |
| The change between 2D and 3D | 1,400 ms | `views/perspectiveTransition.ts:265` |

### Rules for motion

**Rule: a transition explains a change of place.** Following a connection, changing scale, opening evidence and returning are animated, so that the person keeps their bearings. A change that is not spatial is not animated for its own sake.

- **Why.**
  - Owner, 2026-09-30: "As modern models iterate with screenshots, they cannot feel the sudden hop from connection to connection which could otherwise be mediated with a great transition. Consistency of view -- the ability to keep one's bearings as they click around." ([Turn 16 of the September 30 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/2026-09-30/2026-09-30.2.record.md#turn-16)).
  - Principle: object constancy in animated transitions (Heer and Robertson, 2007).
- **Checked by.** The orientation specs of the interaction half; motion is judged by eye (AGENTS.md, "Look, then protect").
- **Status.** Holds.

**Rule: what enters decelerates, what leaves accelerates.**

- **The rule.** An appearing thing eases out (fast, then settling). A leaving thing eases in. A thing moving within the view eases out.
- **Why.** Principle: Material's emphasized and standard easing, and Carbon's entrance and exit curves. Motion that settles reads as arriving, and motion that speeds up reads as going.
- **Where.**
  - The three looks' appearance and leaving: `styles/reading.css:669–721`, 160 ms, `ease-out` and `ease-in`.
  - The 2D camera: `easeOutCubic`.
- **Status.** Holds where stated. Elsewhere `ease` is used without a stated reason.

**Rule: reduced motion is honoured.**

- **The rule.** When the person asks their system for less motion, a camera move, a re-layout, the transition between maps and the decorative loops arrive at their end state without travel.
- **Why.** Principle: WCAG 2.2 success criterion 2.3.3, Animation from Interactions (AAA), and the `prefers-reduced-motion` media query.
- **Where.**
  - `views/forceGraphView.ts:523, 712, 753`.
  - `views/localView/branch-renderer.ts:435`.
  - `views/perspectiveTransition.ts:90, 188`.
  - `views/forceGraphWrappers.ts:322`.
  - `styles/graph.css:121`, `styles/local.css:325`, `styles/shell.css:215, 451`, `styles/world.css:153`.
  - `styles/reading.css:637` adds motion only under `no-preference`.
- **Checked by.** The interaction half's specs.
- **Status.** Holds where counted. *Broken* on the World Map: its camera tweens (turning, top-down, fit and the walkthrough) travel regardless (`views/worldMap/controller.ts:1107–1124`; no `matchMedia` call anywhere under `views/worldMap`). Small hover lifts such as `.control-btn:hover`'s 2 px were not traced.

**Proposed rule: four durations, named by what they carry.**

| Name | Range | For |
| --- | --- | --- |
| feedback | 100 to 150 ms | hover and press |
| state | 160 to 200 ms | a thing appearing, leaving or changing tone |
| move | 350 to 450 ms | a place within one view |
| journey | 650 to 1,400 ms | a camera's flight, a change of map |

Each motion takes its band's one value, and one unit (ms).

- **Why.** Principle: Material 3 and Carbon each publish named duration tokens by distance and purpose. Measured: today's 17 durations already cluster into these four bands.

---

## Data encodings in the maps

**Visual encoding** is the mapping from a fact to a visual **channel**: position, size, hue, lightness, shape or enclosure. Each channel is good at some kinds of fact and bad at others. Position is best for order and magnitude. Hue is good for categories and poor for amounts. These rankings are Munzner's, after Mackinlay. This table is the product's encoding contract.

| Fact | Channel | Where | Why (source) |
| --- | --- | --- | --- |
| A connection's role, offers or uses | Hue: blue, green | 2D wires, pins and the key; 3D marble veins; World doors | Owner, 2025-12-03 and 2026-09-29 |
| A connection's direction in 2D | Position: uses enter on the left, offerings leave on the right | `judgments.ts`, `usesLeftOfferingsRight` | Owner, 2026-09-28; checked by the scenario suite |
| A file's kind | Hue | 3D sphere and marble glass; 2D cells; both keys | Owner, 2026-11-17 |
| How much a file offers and uses | The share of each vein on the marble, from `marbleAmount` (1 user is a third, 3 two thirds, 7 or more all) | `views/forceGraphAppearance.ts` | Owner, 2026-11-16: "Something that sends more is more blue. Something that receives more is more green"; drawn by default on 2026-11-18 and 19, and since then only with Marbles → On |
| A file's exposed interface | Size of the 3D sphere, sublinear | the 3D map | Owner, 2026-10-13, quoting back the agent's "position suggests coupling, size suggests exposed interface" and answering "Phenomenal. Yeah, we're aligned. Please implement." ([the October 13 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-13/2026-10-13.1.record.md)) |
| Coupling between files | Distance in the 3D layout | the 3D map | The same exchange |
| A reference's weight | Wire width, `1 + 0.375 log2(count)`, at most 3×; a path's wires twice as wide | `views/forceGraphView.ts:1906–1907` | No owner word found; see the findings |
| Containment | Enclosure: a membrane in 2D; a skin, bubble or shell in 3D; a skin with cells for a closed directory | both maps | Principle: Gestalt common region. Owner, 2026-11-07: "cells in an embryo" |
| A file a closed directory holds | A round cell, one size everywhere | 2D cells | Owner, 2026-11-15: "there's a bit in the visuals here that I struggle to understand the meaning of (likely folders in folders)", of smaller marks for inner directories ([Turn 2 of the November 15 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-2)); "one kind of mark at one size" is the Explorer design's wording of the remedy ("How a closed directory looks") |
| Tests cover this file | A violet halo and border on the 2D card | `hasTests.*` | No owner word found for the hue; violet chosen to avoid the roles. Under Proposed it is also the test kind's colour |
| Attention, the frontier, beyond | Lightness and opacity | the table of strengths above | Principle 2 |
| Changed in the commit shown | Lightness: the others dim (Dim, the default), or the changed glow white (Glow) | `views/forceGraphEmphasis.ts` | Owner, 2026-10-31, and the dimming they caught in playback on 2026-11-01 |
| The flow from offers to uses on the World Map | Motion: dashes along the wire, as well as the wire's gradient (except under reduced motion, where the flow stops and the gradient alone is left) | `styles/world.css:143, 153` | Owner, 2026-09-28: "I absolutely adore the motion from outputs to inputs" |

**Rule: an encoding is judged at an ordinary scene's density.** An encoding carried by one wire or one mark is judged on the whole web with nothing pinned, not on the few marks a hover isolates.

- **Why.** Owner, 2026-10-31: "there are simply too many connectors drawn in the average 3D local map scene to confer any ability for the end user to understand what color means on any one connector". And: "we still need to be thinking about how to make this graph more legible. If we want a user to be able to find what they're looking for." ([Turn 1 of the October 31 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-31/2026-10-31.1.record.md#turn-1)).
- **Checked by.** The owner's eye, from pictures of the ordinary scene.
- **Status.** Holds.

**Rule: the picture must not lie about the shape.** A reduction that hides a reference says so and leaves a way back. Any sign of "more" counts only the kinds that are switched on.

- **Why.**
  - Owner, 2026-10-01: "I'm not open to having the user open the shape of their software and believe it's all fine and dandy when it's not."
  - Owner, 2026-11-18: the switches set what a picture counts ([direction](../../../AI-Agent-Workspace/Memory/direction.md)).
- **Checked by.** `forceGraphScope.test.ts`, the closed-directory specs ("veil"), and the design audit.
- **Status.** Holds.

**Rule: what a 3D picture cannot afford to draw it veils, the least important first, and a veil says how many files it hides.** A *veil* is a body drawn as one milky ball with none of its files. A picture draws at most 1,024 files within its skins; past that the bodies farthest from what was asked about are veiled first. Among bodies as far, a directory shell goes before a whole group, the largest shell first; whole groups, the ones a picture shows only by their seed, go the smallest first, so that the main body of a repository keeps its files in sight. A veiled group's name ends with the count of its files, as a shell's does.

- **Why.**
  - Owner, 2026-11-22, shown this repository opening with its largest group, 707 of its files, as the one blank ball of the picture, which the largest-first order of 2026-11-07 gave whenever nothing was asked: "Oh man I know that annoys the heck out of me." And of veiling the smallest first: "Hey if we can remediate and make the picture even more truthful I am stoked!"
  - Principle: *the map does not lie*; what is left out is said, here by the veil and its count.
  - Measured, 2026-11-22, on this repository with nothing asked ([the matched pictures](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Screenshots/veil-order/README.md)): the old order drew 446 files within skins and hid 706 behind one veil; the new draws 1,024 and hides 128 behind 32; a frame while the camera turns took no longer, on the graphics card (45 ms against 47) or with WebGL in software and the processor slowed four times (247 ms against 305, about four frames a second either way).
- **Where.** `views/forceGraphShells.ts` (`DRAWN_FILES`, `pictureVeils`, `veiledUnits`); `views/forceGraphView.ts` (the bodies handed to `pictureVeils`, and a veiled group's name).
- **Checked by.** `views/forceGraphShells.test.ts` ("veils whole groups the smallest first …"); `tests/e2e/force-graph-wrappers.spec.ts` ("the skin shows within each wrapped group every file it holds …": the main body's files drawn, the veiled groups each one veiled ball, a veiled group's name saying its count).
- **Status.** Holds since 2026-11-22. The same measurement found that the budget itself bought no frames at this repository's size, where drawing every file (1,152) veiled nothing and took no longer; whether 1,024 should be raised, or not applied to the start, needs a picture of a few thousand files on a slow machine and is open with the owner. The shells' order beside a pin, the largest first, is as it was.

**Rule: never by colour alone (redundant encoding).**

- **The rule.** Any fact told by hue is also told by a second channel wherever a person is expected to read it.
- **Why.** Principle: WCAG 2.2 success criterion 1.4.1, Use of Color (A).
- **Status by fact.**
  - **Role:** holds. In 2D it is also told by side, left or right. On the marble it is told by hue alone, but the key names it.
  - **Kind:** partly holds. A file's own name usually says its kind: `.test.ts`, `.spec.ts` and `.md` are the reader's own words. Where no name is drawn (a far 3D map, a closed directory's cells), kind is told by hue alone, with the name on hover.
  - **Has tests:** holds. The card's halo comes with a chip that names the tests.

  The findings weigh what this means without proposing a drab map, which the owner refused.

---

## Keeping this document true

Proposed, not built:

- **A token check.** Extend the existing "no colour outside the palette" test (`palette.test.ts`) into one for each property this document tables:
  - radius;
  - font size and weight;
  - z-index;
  - duration;
  - icon size and stroke.

  Each check reads the stylesheets and the TypeScript and fails on a value outside its named list. Each list is defined once, beside the palette, and written into the page as custom properties as the palette is.
- **Generated tables.** The tables in this document would be generated from those lists, in a marked region that only the generator writes, as the Live Docs do. They are hand-kept until then, dated 2026-11-18.

[The findings](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/design-system/README.md) give the order in which these would pay.
