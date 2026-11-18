# Every colour the Explorer draws, and what each means: an audit, November 16, 2026

_Current as of `main` at `6daa2f70` (the built `dist/explorer` of 15:46 UTC confirmed to ship the values below). A read-only audit by a research builder for the root's colour design pass. No product file was changed._

## Scope and method

- **The product:** the Explorer's client (`packages/explorer/src/client/`, 133 non-test `.ts`/`.css` files), its HTML shell (`packages/explorer/src/shared/template.html`), and the engine's default board legend (`packages/engine/src/live-docs/board.ts:97-106`), which chooses two World Map tints. No CLI under `scripts/live-docs/` or `packages/*` prints ANSI colour (searched for `\x1b[`, `\u001b[`, `\033[`, chalk, picocolors, kleur, styleText: none). There is no favicon and no SVG asset; the shell's icons are `currentColor`.
- **Read in full:** `styles/theme.css`, `styles/graph.css`, `styles/history.css`, `styles/world.css`, `views/forceGraphAppearance.ts`, `views/forceGraphEmphasis.ts`, `views/forceGraphRenderer.ts`, `panels/spatial-legend.ts`, the kind-palette probe's README, the dataviz skill's `validate_palette.js`. **Read in part:** `view-shared.css` (56-571), `local.css` (360-557), `search.css` (84-283), `forceGraphBatches.ts` (140-239, 595-779), `forceGraphView.ts` (1770-1904), `perspectiveTransition.ts` (85-134, 196-354), `worldMap/controller.ts` (170-209, 490-689, 1190-1284, 1938-1965), `card-factory.ts` (355-380, 470-539, 740-815), `connections.ts` (240-356), `connection-geometry.ts` (436-482), `worldMap/model.ts` (1-60, 100-125), `board.ts` (70-109), `template.html` (60-89), the November 15 record (600-689). **Extracted by script, not read:** every colour-bearing declaration of all ten stylesheets with its selector and line (`css-colour-decls.mjs`), and every custom property's declarations and reads (`css-vars.mjs`). **Searched only:** all non-test TS for colour literals, `0x` numbers, `new Color`, `setClearColor`, canvas `fillStyle`/`strokeStyle`, inline `style` colour writes, SVG `fill`/`stroke`/`stop-color`; persistence and tuning for theme or colour settings.
- **Measuring:** distance is Euclidean in OKLab ×100, unsimulated and under the Machado-Oliveira-Fernandes (2009) severity-1.0 protanopia, deuteranopia and tritanopia transforms in linear sRGB: the metric and matrices of the dataviz skill's validator, which is what the November 15 probe used. Its floors: 15 for telling two colours apart with full colour vision, 8 the target (6 the floor) under red-green simulation. CIEDE2000 is given beside every pair as a cross-check. Contrast is WCAG 2.x. "As drawn" values composite a translucent colour over the surface it is drawn on (sRGB source-over); the 3D lighting (Lambert: a sphere ranges from about 60% to 120% of its colour across its face) and shader facing terms are not modelled. No browser was run: every number is computed from source values.

## Counts

- **177 rows** in the table below: **91 fact** (83 live, 8 dead), **30 state** (28 live, 2 dead), **46 surface** (44 live, 2 dead), **10 decoration** (9 live, 1 dead). 14 rows carry meaning by opacity alone.
- **Distinct literal colours in the source:** 186 values (with alpha) on **122 distinct RGB bases**, plus four GLSL colours in the 3D shaders (`#83b9d4`, `#52708a`, `#8bacc7`, `#dbedff`) and values computed at run time (World face shading, `color-mix` stack layers, the transition's background lerp). 57 colour tokens in `theme.css` (9 never read), 12 per theme in `world.css`.

## Findings

### 1. One hex, three meanings; one meaning, four values

**`#0091ff` is the accent, the offering pin and the implementation kind.** `--accent` (`theme.css:7`, 90 reads: pressed, selected, pinned, focus rings, links, history's major ticks); the 2D offering pin, written as `rgba(0,145,255,.4)` (`view-shared.css:200`); and `SPATIAL_NODE_STYLES.implementation` (`forceGraphAppearance.ts:3`), which since November 16 also fills the 2D closed directory's cells. Distance between the offering pin and the implementation kind: **0.0**; as drawn (pin at .4 on a card, cell at .42 on a closed box) **1.9**. The pinned state's glow is the offers token itself (`--color-outbound-glow` at `local.css:251`, `reading.css:235, 274`).

**Offers is drawn in four values, uses in three.** The 2D wire starts in `#38bdf8` (`connections.ts:286`), the 2D pin is `#0091ff`: **12.7** apart, the same meaning failing the floor for telling two colours apart. The using wire ends in `#34d399`, its pin is `#00d3aa`: 2.4 apart, effectively one colour. The World Map's doors are `#0284c7` / `#059669` in its light theme (16.7 and 17.9 from the wires) and the wires' own `#38bdf8` / `#34d399` in its dark theme; the World's wires are hard-coded to the latter in both themes (`worldMap/controller.ts:645`). `theme.css` holds `--wire-offers`/`--wire-uses` with the wire values, but only the legend reads them; `--color-outbound`/`--color-inbound` (the pin values) are declared and read by nothing.

**The 3D map draws no role colour at all.** Its reference wires are white (`forceGraphView.ts:1839-1840`; withdrawn from blue-to-green on 2026-10-31 at the owner's eye, the hover's words carrying direction). So in 3D blue means implementation and green means test with no role colour on screen; the standing rule "keep these meanings across scales" is broken between the maps rather than inside one.

**The prior numbers, re-measured.** 12.7 (offering wire blue vs implementation blue) and 14.3 (using wire green vs test green) are reproduced exactly, unsimulated; their worse red-green values are 12.9 and 14.0, tritan 9.3 and 13.9, CIEDE2000 15.4 and 15.4. "A test and a hub are 2.5 apart under protanopia" is reproduced (2.5 protan; 12.1 deutan; 23.7 unsimulated; as drawn at .75 alpha, **2.0** protan). What the numbers left out: against the *pin* the offering blue is 0.0 from implementation, and the using pin `#00d3aa` is 15.2 from the test green at full strength but **5.6 as drawn**.

**Test has three colours.** Green `#28a745` for a test file's sphere and its 2D cell; violet `#8a5cff` for a card *backed by* tests in 2D (`--color-test-*`, `theme.css:26-32`) and for the details panel's "test" label; and the details panel's test label sits on a *blue* tint (`rgba(100,150,255,.1)`, `shell.css:522`) while its implementation label sits on a *green* one (`rgba(100,200,100,.1)`, `shell.css:516`). In one 2D picture a test file's cell is green while the card it backs glows violet.

**Violet means test-backed in 2D and document in 3D:** `#8a5cff` vs `#9966cc`, **8.7** apart. **The warm family carries five meanings:** the 3D directory hub and containment `#e9984d`; the 2D backward-wires cue on the 3D button `#e9b86d` (7.5 from the hub); the World's declared crossing and missing-folder crumbs `#c17f16` / `#e2b45f` (6.6 from the hub in dark); the World's on-prem tint; the implements type badge `#ffd28c` (7.7 from the cue). **Pink:** asset `#e83e8c`, the extends badge (17.7), the reader's symbol pink `#f0abfc` (23.7), the error `#ff8888` (15.8). **Sky:** the reader's file links `--color-path #7dd3fc` stand 8.3 from the offering wire, the return badge's text 4.5 from it; the 3D skin `#83b9d4` 7.1 from it.

**Type badges reuse the role hues:** return `rgba(0,145,255,.25)` and parameter `rgba(0,211,170,.25)` (`view-shared.css:512, 517`) are the offering and using pins' own RGB. They are keyed only by their tooltips.

### 2. Colour-vision collisions among fact colours

Pairs below 8 under simulation, or below 15 unsimulated (full tables in the appendix):

| Pair | Unsim. | Protan | Deutan | Tritan |
| --- | --- | --- | --- | --- |
| 3D: test vs hub (full / as drawn) | 23.7 / 18.8 | **2.5 / 2.0** | 12.1 / 9.7 | 28.0 |
| 3D: asset vs other (full / as drawn) | 21.5 / 17.0 | 10.1 / 8.2 | **2.2 / 1.5** | 23.9 |
| 3D: test vs asset | 37.6 | 21.4 | **7.8** | 35.2 |
| 3D: implementation vs document | 16.7 | 10.1 | 8.2 | 16.4 |
| 3D: implementation vs test | 29.1 | 27.5 | 28.1 | **6.2** |
| 3D: document vs other | 15.7 | 14.5 | 12.8 | **5.1** |
| 3D as drawn: document vs cited-by arrow | **7.0** | 7.1 | 6.5 | 3.9 |
| 3D as drawn: asset vs white wire | 19.2 | **3.5** | 10.5 | 21.7 |
| 2D as drawn: offering pin vs implementation cell | **1.9** | 2.0 | 1.9 | 1.9 |
| 2D as drawn: asset cell vs other cell | **10.7** | 6.1 | **0.6** | 11.7 |
| 2D as drawn: test cell vs asset cell | 19.0 | 11.1 | **4.3** | 18.1 |
| 2D as drawn: test-backed border vs offering pin | **8.8** | 4.3 | **1.9** | 6.4 |
| 2D as drawn: test-backed border vs implementation cell | **9.1** | 5.6 | **2.3** | 7.3 |
| 2D as drawn: offering wire vs using wire (.7) | **12.4** | 11.8 | 11.6 | **2.3** |
| World: offers vs uses (either theme) | 16.9 | 16.1 | 16.2 | **3.0** |
| World light: uses vs warm | 19.5 | **7.9** | 12.1 | 23.7 |
| World tints, any two (light / dark) | **1.8-5.4 / 1.8-4.2** | down to 0.8 / 0.5 | down to 0.3 / 0.1 | |
| World default tints cloud vs on-prem (light / dark) | **5.3 / 3.7** | 4.5 / 3.2 | 5.2 / 3.8 | 5.4 / 3.7 |

The World's region tints are backgrounds with the region's name drawn beside each, so colour is not their only code; still, no two tints are distinguishable by the skill's floors.

### 3. Undefined and dead

**Read but never declared (colour):** `--color-implementation` and `--color-asset` (`shell.css:514-515, 526-527`, no fallback: the details panel's implementation and asset labels take the inherited text colour, border included; only their tints differ); `--text-primary` (`graph.css:31, 72`, falls back to `#eee`); `--border-color` (`graph.css:33, 57, 74`, falls back to `#555`); `--accent-text` (`reading.css:46`, falls back to `#9ed2fa`); `--text-success` (`search.css:332`, falls back to `#8bd49a`). Fallbacks that never apply because the variable exists: `--bg-surface, #202020` (`graph.css:32, 56`, `local.css:272`), `--text-secondary, #aab` (`graph.css:110, 122`), `--bg-deep, #15191f` (`local.css:444`), `--accent, #0091ff` (`graph.css:81, 128`).

**Declared, never read:** `--color-outbound`, `--color-inbound`, `--bg-overlay`, `--glass-panel`, `--cluster-bg`, `--cluster-border`, `--text-panel` (`theme.css:13, 15, 52, 56, 59, 60, 96`); `--w-shadow` (`world.css:25, 44`, duplicated as `THEMES.shadow` in `controller.ts:192-193`). **Rules nothing triggers:** `.connection-line` and its `--connection-stroke` (`view-shared.css:412-420`), `.badge` (246-253), `.test-backed-shadow` (107-115), `.pulse-highlight` (`shell.css:837-845`), `.reader-prose a.workspace-link` and `--color-workspace` (`shell.css:643`). **Kinds nothing produces:** interface `#ffc107`, configuration `#6c757d`, script `#17a2b8` (`forceGraphAppearance.ts:6-8`). **Dead helper:** `createConnectionGradient` (`connection-geometry.ts:449-482`), a third copy of the wire gradient. **Stale comment:** `connections.ts:277-278` says the gradient matches `--outbound-color`/`--inbound-color`, names that exist nowhere; the colours do not match the pins either.

**Literals that bypass an existing token:** `rgba(0,145,255,a)` written out 16 times outside `theme.css` (8 in `view-shared.css`, 5 in `shell.css`, 3 in `search.css`: pins, badges, rings, focus and endpoint washes), none through a token, beside 5 more of `rgba(0,211,170,a)` and `rgba(0,122,204,a)`; `#0091ff` for the 3D focus outline (`graph.css:45, 86`); `#1e1e1e` (`sources.css:315`); `#f88` inline in `errors.ts:84`; the 2D wires and laces (`connections.ts:286, 337-338`) beside `--wire-offers`/`--wire-uses`; the pins beside the dead `--color-outbound`/`--color-inbound`. Disabled controls fade by five different opacities (.3, .35, .45, .55, .65).

### 4. Where colour lives, and whether anything switches it

- **CSS custom properties** reach the shell, the 2D cards' surfaces and text, the test-backed violet, the pins (as literals), the type badges (as literals), the World's doors, warm, text and surfaces, the history ticks.
- **TypeScript and GLSL, out of a stylesheet's reach:** 34 of the 83 live fact rows, and all of the largest fact surfaces: every 3D sphere, ring, wire, arrow and skin (`forceGraphAppearance.ts`, `forceGraphView.ts:1799-1840, 1899-1900`, `forceGraphEmphasis.ts`, `forceGraphBatches.ts:243-245, 747-771`, `forceGraphRenderer.ts:51-53`); the 2D wires, laces and cell hues (`connections.ts`, `card-factory.ts:515`); the World's district tints, faces, edges, shadows and wires (`worldMap/controller.ts:182-197, 645`); the transition canvas (`perspectiveTransition.ts:100, 264, 279-328`); the legend's samples (`spatial-legend.ts:39, 54-62`).
- **The nearest thing to one colour table** is `SPATIAL_NODE_STYLES`, shared by the 3D spheres, rings and shell dots, the 2D cells, and both legends' kind rows. Nothing unifies TS and CSS colours; the 2D legend reads CSS tokens that the 2D wires do not.
- **Theme switches:** only the World Map has one: `data-theme="dark"` on `.world` (`world.css:31-45`), a "Dark board" toggle (key D, `controller.ts:112, 1758`), stored in `localStorage` as `live-docs.world.theme`, light by default. The shell, both Local Maps and the reader have a single dark theme. No `prefers-color-scheme` anywhere, no `color-scheme` property. Nothing colour-related travels in the share link (`url-state.ts`, `compressed-url-state.ts`, `place.ts` carry no tuning or theme). Tuning holds two colour choices, both per browser: Cells colour (`closedCells`, kind or one grey, default kind, `local-storage.ts:73`) and Changed Files (`changeEmphasis`, glow/dim/both/none, default **dim** since 2026-11-15, `local-storage.ts:101`; `tuning.ts:369` falls back to "glow" for an unrecognised value).

### 5. Contrast

**Text tiers on the dark shell** (on `--bg-deep #111` / `--bg-surface #1e1e1e` / card `#232326`): `--text-active` 18.9/16.7/15.7; `--text` 14.9/13.1/12.3; card names 16.9/14.9/14.0; `--text-secondary` 11.8/10.4/9.8; `--card-prose` 8.7/7.7/7.2; `--text-panel-muted` 7.5/6.7/6.3; accent as text 5.8/5.2/4.9. **Below AA (4.5):** `--text-muted #888` on a card 4.42 (a card's path and meta at 10 px); `--text-subtle #777` 4.2/3.7/3.5; `--text-panel-subtle #6c7484` 4.0/3.6/3.3 (19 reads: column labels, the ruler, search groups and "more" rows, card action icons); `--text-disabled #666` 3.3/2.9/2.7, which also draws the sidebar's section headings ("Legend") and the search placeholder and empty message. Type badges' text 4.0-6.4 on their own tints (the base 3.99 and extends 4.48 at 9 px fail). 3D labels 19.7 (directory 12.0).

**World Map:** light `--w-text` 18.5, `--w-muted` 7.6, `--w-faint` **3.0** on white and 2.4 on the page, `--w-blue` as text **4.1**, `--w-green` 3.8, `--w-warm` as text **3.3** (the missing-folder crumbs at 13 px, crossing tags at 11 px). Dark: everything passes but `--w-faint` 3.3-3.4.

**Fact marks against their surface** (non-text; WCAG 1.4.11 asks 3:1): 2D wires at .7: 4.3-4.9. 2D pins at .4: **1.8** (offers), **2.4** (uses); their rims 2.6 / 3.4. Test-backed border at .45: **1.8**. 2D cells at .42: **1.7-1.9**; their rims at .75: 2.7-3.2 (asset 2.7, other 3.0). 3D spheres at .75 over `#000011`: 3.2 (document) to 5.3 (hub). 3D white wire at .3: **2.5**; whole-root .16: **1.5**; containment **1.9**; cites **1.7**; cited-by 3.9. World light doors 4.1 / 3.8; **World light wires** (hard-coded sky/emerald on white) **2.1 / 1.9**. World dark doors 8.4 / 9.3. Region tints 1.1-1.25 against their board.

### 6. How many fact hues a person must tell apart at once

- **2D Local Map**, default dark look with the Cells look in kinds' colours, at reading size: offers (wire `#38bdf8` and pin `#0091ff`), uses (wire `#34d399` and pin `#00d3aa`), test-backed violet, implementation cell (the pin's own blue), test cell green, asset cell pink and other grey where present, four type badges (blue, teal, pink, amber), and the amber backward cue on the toolbar. **Up to 12 fact meanings in 11 values from 6 hue families**, with the accent's state blue in the same family as offers and implementation. On this repository's composition (implementation and test only, no assets): about 8.
- **3D Local Map**, Structure layout with skins and Related Docs on: six kind hues (implementation, test, asset, document, hub, other), white references and path, orange containment (the hub's hue), violet cites (the document's), lavender cited-by, blue-grey skins, rings in the kind hues; history adds white. **About 11 fact values in 8 families.**
- **World Map**, default legend: offering and using doors and wires (4 values in 2 families), warm crossings and missing folders, the cloud and on-prem tints, the muted stands and strands, white flow. **About 7 values in 5 families**; up to 11 with all six tints.

### 7. Where the root's prior knowledge was wrong or incomplete

1. "Blue offers, green uses ... across scales": true in 2D and the World; **not drawn in 3D**, whose wires are white. And 2D draws each role in two values (offers 12.7 apart).
2. "implementation's blue stands 12.7 from the offering blue": true against the wire; **against the offering pin it is 0.0** (the same `#0091ff`, which is also the accent).
3. "the 2D cards', where a test is violet": violet marks a card **backed by** tests (and the chips naming them); a test file itself is green in 2D now, as a cell. The details panel paints test violet on a blue tint and implementation on a green tint, the 3D map's two hues swapped.
4. "the details panel's, half undefined": exactly two of its three kind colours (`--color-implementation`, `--color-asset`) are undefined; four more colour variables are read and never declared elsewhere (`--text-primary`, `--border-color`, `--accent-text`, `--text-success`), each saved by a fallback.
5. "12.7 / 15 / 2.5": OKLab ×100 (the dataviz validator), Machado 2009 severity 1.0; 15 is the validator's unsimulated floor; 2.5 is protanopia (deuteranopia 12.1).
6. History "Glow = changed files white": Glow is no longer the default; **Dim** is (2026-11-15), keeping the changed files in their kind colour. All four modes act in 3D only; the 2D map shows no history emphasis.
7. Path-finding's "shortest paths merged, near-miss dashed, divergent paths colour-coded": **not built**; no code draws it. Today the 3D map draws the one path white at .9 and twice as wide, fading the rest to .2; the 2D map draws no path colour; the path bar uses the accent.
8. World districts, "light blue for cloud, light orange for on-prem, the owner's convention": it is also the **engine's default legend** (`board.ts:104-105`); four more tints (green, grey, violet, rose) exist for a board's own legend, grey being the fallback. "World Map light, Local Map dark" is the only pairing possible: the Local Map has no light theme.
9. Rings: drawn in the sphere's own kind colour at .85, though the legend samples them in a neutral grey.
10. Not in the brief, found here: the type badges' four hues; the transition's own colours (`#9baec5` for 3D wires that had no 2D counterpart, which turn white when the 3D map takes over; the background landing on `#00000c` where the 3D map is `#000011`); a VS Code blue `#007acc` for the subject card's ring (9.3 from the accent); the teal hover of Knowledge Sources' bundled tree.

### 8. What could not be determined

- The lit appearance of 3D spheres and skins: lighting and the shader's facing and noise terms change the colour across each mark; all 3D numbers are for the flat colour at its base alpha.
- Pixel truth: nothing was sampled from a running page. The cells' box light (`#292929`) is an approximation of a radial gradient.
- Whether `.archetype-stub` ever renders (it needs a doc whose free-text archetype is "stub"), and whether the transition's captured `#0091ff`/`#e9984d` token colour (`perspectiveTransition.ts:100`) is drawn anywhere: the canvas code read draws the 3D file's colour instead.
- The details panel's undefined labels inherit their colour from their ancestors; the body's `--text #e4e4e4` is assumed, not observed.

## The inventory

Grouped by what the colours encode. Class: **fact** encodes something about the software; **state** an interaction state; **surface** structure (backgrounds, borders, text tiers, shadows, lighting); **decoration** no meaning. Paths are under `packages/explorer/src/client/` unless written in full. "Keyed" says where the picture explains the colour: a legend row, a tooltip, the World's help, or nowhere.

### Role of a connection (offers / uses)

| Role | Class | Value(s) as written = normalised | Defined at; how | Used | Means | Views | Keyed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| offers: wire start (2D) | fact | `#38bdf8` = `#38bdf8`<br>opacity 0.7 | `views/localView/connections.ts:286`; TS literal in SVG gradient stops (token --wire-offers at theme.css:21 holds the same value but only the legend reads it) | every .connection-path stroke (gradientFor), bundle runs; 1 drawing site | The offering end of a reference wire; the first tenth pure, then a gradient to the using green. | 2D Local Map | 2D legend: Offers/Uses row (swatch) |
| uses: wire end (2D) | fact | `#34d399` = `#34d399`<br>opacity 0.7 | `views/localView/connections.ts:286`; TS literal in gradient stops (token --wire-uses at theme.css:22 read only by the legend) | every .connection-path stroke; 1 drawing site | The using end of a reference wire. | 2D Local Map | 2D legend: Offers/Uses row (swatch) |
| wire opacity (2D) | surface | <br>opacity 0.7 | `styles/theme.css:23`; --wire-opacity, CSS custom property (opacity number) | 3 (view-shared.css:313, 443; local.css:424) | Every 2D wire drawn at 0.7, never brighter; the legend samples at the same strength. opacity only; value column shows the alpha | 2D Local Map, toolbar/tuning/legend | 2D legend samples drawn at it |
| offers: self-reference lace (2D) | fact | `#38bdf8` = `#38bdf8` | `views/localView/connections.ts:337`; PROVIDER_COLOR (local const), TS literal, inline style.fill | drawLaces polygons | A back reference or cycle's stub at the offering pin, filled in the offering colour. | 2D Local Map | 2D legend: Offers/Uses row |
| uses: self-reference lace (2D) | fact | `#34d399` = `#34d399` | `views/localView/connections.ts:338`; CONSUMER_COLOR (local const), TS literal, inline style.fill | drawLaces polygons | The using pin's lace. | 2D Local Map | 2D legend: Offers/Uses row |
| offers: pin (row dot, 2D) | fact | `rgba(0,145,255,0.4)` = `#0091ff66`<br>rim `#0091ff99` | `styles/view-shared.css:200`; CSS literal (rim rgba(0,145,255,.6) at :201, glow var(--color-outbound-glow) at :202) | .symbol-anchor.outbound, .legend-symbol--outbound | A symbol row's offering dot on the card's right edge (what the file offers leaves on the right). Same hex as --accent and as the 3D implementation kind. | 2D Local Map, toolbar/tuning/legend | 2D legend: Offers/Uses row (dot) |
| uses: pin (row dot, 2D) | fact | `rgba(0,211,170,0.4)` = `#00d3aa66`<br>rim `#00d3aa8c` | `styles/view-shared.css:193`; CSS literal (rim rgba(0,211,170,.55) at :194, glow var(--color-inbound-glow) at :195) | .symbol-anchor.inbound, .legend-symbol--inbound | A symbol row's using dot on the card's left edge. | 2D Local Map, toolbar/tuning/legend | 2D legend: Offers/Uses row (dot) |
| pin base (2D) | fact | `rgba(0,145,255,0.35)` = `#0091ff59` | `styles/view-shared.css:157`; CSS literal (dot rim rgba(0,145,255,.45) :166) | .symbol-anchor, .symbol-anchor.dot | A symbol anchor before its role class: offering blue, faint; overridden by .inbound/.outbound. | 2D Local Map | nowhere |
| file-level hub pin (2D) | fact | `rgba(0,145,255,0.35)` = `#0091ff59`<br>opacity 0.55 | `styles/view-shared.css:176`; CSS literal border + opacity .55 | .symbol-anchor.hub (+ .inbound/.outbound) | A card's file-level end of a gathered or file-level wire, at the card edge; the row-pin colours at 0.55 opacity, drawn only where a wire ends on it. | 2D Local Map | nowhere |
| offers glow (pins; also reused for pinned state) | fact | `rgba(0,145,255,0.4)` = `#0091ff66` | `styles/theme.css:14`; --color-outbound-glow, CSS custom property | 5 (view-shared.css:160, 202; local.css:251; reading.css:235, 274) | Soft 6px glow around offering pins. The same token draws the glow of a pinned row or file (a state). | 2D Local Map | nowhere |
| uses glow (pins) | fact | `rgba(0,211,170,0.4)` = `#00d3aa66` | `styles/theme.css:16`; --color-inbound-glow, CSS custom property | 1 (view-shared.css:195) | Soft glow around using pins. | 2D Local Map | nowhere |
| offers: legend wire swatch | fact | `#38bdf8` = `#38bdf8` | `styles/view-shared.css:312`; --wire-offers / --wire-uses, CSS gradient of tokens | .legend-swatch | The legend's wire: gradient var(--wire-offers) to var(--wire-uses) at --wire-opacity. | toolbar/tuning/legend | is the legend |
| gathered-wire width sample (legend, overview only) | fact | `#38bdf8` = `#38bdf8`<br>opacity 0.7 | `styles/local.css:424`; --wire-offers, CSS sets --legend-color | #local-legend .legend-row--gathered | References row: two bars in the offering blue at wire opacity, saying width = count. | toolbar/tuning/legend | 2D legend: References (shown at overview) |
| offers: door, stub (World) | fact | light `#0284c7` = `#0284c7`<br>dark `#38bdf8` = `#38bdf8` | `styles/world.css:19 (dark :38)`; --w-blue, CSS custom property per theme | 20 (doors, stubs, focus ring, pressed tool, help/tour buttons, evidence links/pinned) | A piece's offering door and a declared door's stub. In the light theme the same token is the World's interactive accent (pressed tools, links, focus ring, pinned panel). fact and state on one token | World Map | World help text: 'blue offers' with a swatch |
| uses: door, stub (World) | fact | light `#059669` = `#059669`<br>dark `#34d399` = `#34d399` | `styles/world.css:18 (dark :37)`; --w-green, CSS custom property per theme | 3 (world.css:194, 204; help swatch) | A piece's using door and a ghost's stub. | World Map | World help text: 'green uses' with a swatch |
| wire gradient (World, both themes) | fact | `#38bdf8` = `#38bdf8` | `views/worldMap/controller.ts:645`; TS literal gradient stops #38bdf8 (0-10%) to #34d399 (90-100%) | every .w-road | A call wire in the air, blue at the offering door to green at the using door; width = count, dashed = declared basis. Hard-coded: the light theme draws the dark theme's light sky/emerald. | World Map | World help: 'blue offers, green uses' |
| flow dashes (World) | fact | `#ffffff` = `#ffffff`<br>opacity 0.5 | `styles/world.css:126`; CSS literal, stroke-opacity .5 | .w-flow | Animated dashes running along a wire from offer to use: direction. | World Map | World help: 'flowing from what is offered to where it is used' |
| transition wire gradient (2D to 3D) | fact | `#38bdf8` = `#38bdf8` | `views/perspectiveTransition.ts:283`; TS canvas gradient #38bdf8 to #34d399; inside links #38bdf8 at .32 (:301) | transition canvas | During the change of perspective, 2D wires fold in the role gradient, then file pairs at .32 in the offering blue. | 2D-3D transition | nowhere |
| transition: 3D link outside the 2D scope | decoration | `#9baec5` = `#9baec5` | `views/perspectiveTransition.ts:301`; TS canvas literal at background*.16 | transition canvas | 3D wires that had no 2D counterpart fade in as blue-grey, then become white when the 3D map draws. | 2D-3D transition | nowhere |
| --color-outbound (dead) **(dead)** | fact | `rgba(0,145,255,0.85)` = `#0091ffd9` | `styles/theme.css:13`; --color-outbound, CSS custom property | 0 | Declared offering colour, never read. | other | nowhere |
| --color-inbound (dead) **(dead)** | fact | `rgba(0,211,170,0.85)` = `#00d3aad9` | `styles/theme.css:15`; --color-inbound, CSS custom property | 0 | Declared using colour, never read. | other | nowhere |
| --connection-stroke (dead rule) **(dead)** | fact | `rgba(0,189,255,0.45)` = `#00bdff73` | `styles/theme.css:17`; --connection-stroke, CSS custom property (+ glow rgba(0,189,255,.2) view-shared.css:419) | 1 (dead rule view-shared.css:415) | Old wire colour for .connection-line, a class nothing creates. | other | nowhere |
| createConnectionGradient defaults (dead) **(dead)** | fact | `#38bdf8` = `#38bdf8` | `views/connection-geometry.ts:466`; TS default parameters #38bdf8 / #34d399 | 0 callers outside its file | A third copy of the wire gradient, exported and used by nothing. | other | nowhere |

### Type-reference badges on symbol rows

| Role | Class | Value(s) as written = normalised | Defined at; how | Used | Means | Views | Keyed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| badge: return type | fact | `rgba(0,145,255,0.25)` = `#0091ff40`<br>text `#64c8ffe6` | `styles/view-shared.css:512`; CSS literal bg; text rgba(100,200,255,.9) :513 | .type-badge-return (card-factory.ts:803) | → badge: the symbol returns a type defined elsewhere (click to inspect it). | 2D Local Map | tooltip 'return: TypeName' |
| badge: parameter type | fact | `rgba(0,211,170,0.25)` = `#00d3aa40`<br>text `#64ffc8e6` | `styles/view-shared.css:517`; CSS literal bg; text rgba(100,255,200,.9) :518 | .type-badge-param | ← badge: the symbol takes a parameter of a type defined elsewhere. | 2D Local Map | tooltip 'param: TypeName' |
| badge: extends | fact | `rgba(255,104,144,0.25)` = `#ff689040`<br>text `#ff96b4e6` | `styles/view-shared.css:522`; CSS literal bg; text rgba(255,150,180,.9) :523 | .type-badge-extends | ⊲ badge: the class extends a type. | 2D Local Map | tooltip 'extends: TypeName' |
| badge: implements | fact | `rgba(255,188,87,0.25)` = `#ffbc5740`<br>text `#ffd28ce6` | `styles/view-shared.css:527`; CSS literal bg; text rgba(255,210,140,.9) :528 | .type-badge-implements | ◇ badge: the class implements an interface. | 2D Local Map | tooltip 'implements: TypeName' |
| badge: base | surface | `rgba(100,100,120,0.4)` = `#64647866`<br>text `#b4b4c8cc` | `styles/view-shared.css:505`; CSS literal bg; text rgba(180,180,200,.8) :506 | .type-badge | A type badge's base look, overridden by every kind class above. | 2D Local Map | nowhere |
| badge: clickable hover glow | state | `currentColor` | `styles/view-shared.css:541`; box-shadow currentColor | .type-badge.clickable:hover | A resolved badge glows in its own colour on hover. | 2D Local Map | nowhere |

### Test-backed (2D cards)

| Role | Class | Value(s) as written = normalised | Defined at; how | Used | Means | Views | Keyed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| test-backed halo fill | fact | `rgba(138,92,255,0.18)` = `#8a5cff2e` | `styles/theme.css:27`; --color-test-bg, CSS custom property | 4 (card ::before, chips, legend, dead .test-backed-shadow) | A card whose file is used by tests: a violet halo 8px around it. | 2D Local Map, toolbar/tuning/legend | 2D legend: Test-backed |
| test-backed border | fact | `rgba(138,92,255,0.45)` = `#8a5cff73` | `styles/theme.css:28`; --color-test-border, CSS custom property | 6 | The test-backed card's border, halo edge, chips' border. | 2D Local Map, toolbar/tuning/legend | 2D legend: Test-backed |
| test-backed glow | fact | `rgba(138,92,255,0.32)` = `#8a5cff52` | `styles/theme.css:29`; --color-test-glow, CSS custom property | 3 | The halo's drop glow. | 2D Local Map, toolbar/tuning/legend | 2D legend: Test-backed |
| test chip text | fact | `#e7e5ff` = `#e7e5ff` | `styles/theme.css:30`; --color-test-text, CSS custom property | 1 (.node-tests__item) | The names of the tests on a test-backed card. | 2D Local Map | 2D legend: Test-backed (tooltip: 'the card names them') |
| tests line text | fact | `#cbc8f8` = `#cbc8f8` | `styles/theme.css:31`; --color-test-text-muted, CSS custom property | 1 (.node-tests) | The tests line's words. | 2D Local Map | nowhere |
| tests label | fact | `#a59fe0` = `#a59fe0` | `styles/theme.css:32`; --color-test-label, CSS custom property | 1 (.node-tests__label) | The 'TESTS' label. | 2D Local Map | nowhere |
| --color-test (full violet) | fact | `rgba(138,92,255,1)` = `#8a5cff` | `styles/theme.css:26`; --color-test, CSS custom property | 2 (shell.css:520-521) | Full-strength violet; read only by the details panel's 'test' kind badge. | reader/details | nowhere |

### Kind of file (archetype) and the 3D hub

| Role | Class | Value(s) as written = normalised | Defined at; how | Used | Means | Views | Keyed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| kind: implementation | fact | `#0091ff` = `#0091ff` | `views/forceGraphAppearance.ts:3`; SPATIAL_NODE_STYLES.implementation, TS table | SPATIAL_NODE_STYLES: 3D spheres (alpha .75), rings, a shell's file dots, 2D closed-directory cells (fill .42 / rim .75), both legends' kind rows | A source file. Same hex as --accent and the 2D offering pin. | 3D Local Map, 2D Local Map, toolbar/tuning/legend, 2D-3D transition | 3D legend kinds row 'Implementation'; 2D legend kinds row while coloured cells are shown |
| kind: test | fact | `#28a745` = `#28a745` | `views/forceGraphAppearance.ts:4`; SPATIAL_NODE_STYLES.test, TS table | SPATIAL_NODE_STYLES: 3D spheres (alpha .75), rings, a shell's file dots, 2D closed-directory cells (fill .42 / rim .75), both legends' kind rows | A test file. | 3D Local Map, 2D Local Map, toolbar/tuning/legend, 2D-3D transition | 3D legend 'Test'; 2D legend kinds row |
| kind: asset | fact | `#e83e8c` = `#e83e8c` | `views/forceGraphAppearance.ts:5`; SPATIAL_NODE_STYLES.asset, TS table | SPATIAL_NODE_STYLES: 3D spheres (alpha .75), rings, a shell's file dots, 2D closed-directory cells (fill .42 / rim .75), both legends' kind rows | An asset file. | 3D Local Map, 2D Local Map, toolbar/tuning/legend, 2D-3D transition | 3D legend 'Asset'; 2D legend kinds row |
| kind: document (Related/Citing Docs) | fact | `#9966cc` = `#9966cc` | `views/forceGraphAppearance.ts:9`; SPATIAL_NODE_STYLES['related-doc'], TS table | 3D spheres; legend; cites wires (forceGraphView.ts:1830) | A document sphere in 3D (shown with Related Docs); its colour also draws the 'Cites' arrows. | 3D Local Map, toolbar/tuning/legend | 3D legend 'Document' |
| kind: directory hub | fact | `#e9984d` = `#e9984d` | `views/forceGraphAppearance.ts:10`; SPATIAL_NODE_STYLES.directory, TS table | 3D hub spheres; legend 'Contains' sample; perspectiveTransition.ts:100 | A directory's hub sphere in the 3D Structure layout; its colour also draws containment lines and the transition's directory token. | 3D Local Map, toolbar/tuning/legend, 2D-3D transition | 3D legend 'Directory' |
| kind: other / unknown | fact | `#888888` = `#888888` | `views/forceGraphAppearance.ts:11`; SPATIAL_NODE_STYLES.other, TS table | fallback of spatialNodeStyle; forceGraphView.ts:2138 | Any archetype the table does not know; also the transition's fallback. | 3D Local Map, 2D Local Map, toolbar/tuning/legend | 3D legend 'Other' (when drawn) |
| kind: interface (dead) **(dead)** | fact | `#ffc107` = `#ffc107` | `views/forceGraphAppearance.ts:6`; SPATIAL_NODE_STYLES.interface, TS table | 0 producers | Listed; nothing produces this archetype. | other | nowhere |
| kind: configuration (dead) **(dead)** | fact | `#6c757d` = `#6c757d` | `views/forceGraphAppearance.ts:7`; SPATIAL_NODE_STYLES.config, TS table | 0 producers | Listed; nothing produces it. | other | nowhere |
| kind: script (dead) **(dead)** | fact | `#17a2b8` = `#17a2b8` | `views/forceGraphAppearance.ts:8`; SPATIAL_NODE_STYLES.script, TS table | 0 producers | Listed; nothing produces it. | other | nowhere |
| 2D cell strength | fact | `rgba(0,145,255,0.42)` = `#0091ff6b`<br>opacity 0.42 | `styles/local.css:492`; fill/stroke written per cell from SPATIAL_NODE_STYLES (card-factory.ts:515), opacities in CSS | .local-cell | A closed directory's cell: its kind's colour at fill .42 and rim .75 over the box's light. value shown for implementation | 2D Local Map | 2D legend kinds row (watchLocalKinds, spatial-legend.ts:109) |
| 2D cell: one grey (Tuning choice) | fact | `#b9c1cc` = `#b9c1cc`<br>rim `#e4e9ef`<br>opacity 0.42 | `styles/local.css:493`; CSS literal fill #b9c1cc .42, stroke #e4e9ef .6 | .local-closed-cells--grey .local-cell | Cells colour = One grey: every cell the same, kind not encoded. | 2D Local Map | kinds row hides itself |
| 2D legend kinds sample | fact | `#0091ff6b` = `#0091ff6b` | `styles/local.css:428`; --legend-color, color-mix of a TS-written custom property | #local-legend-kinds | The 2D kinds row draws each kind as a cell: color-mix 42% fill, 75% rim. | toolbar/tuning/legend | is the legend |
| details panel kind badge: implementation **(undefined variable)** | fact | `rgba(100,200,100,0.1)` = `#64c8641a` | `styles/shell.css:514-516`; --color-implementation (UNDEFINED), CSS var with no declaration and no fallback; literal bg | .archetype-implementation | The details panel's kind label for implementation. Its colour variable is defined nowhere: text and border fall back to the inherited text colour; only a green-tinted background remains. | reader/details | nowhere |
| details panel kind badge: test | fact | `rgba(100,150,255,0.1)` = `#6496ff1a`<br>text `#8a5cff` | `styles/shell.css:520-522`; --color-test, CSS var + literal bg | .archetype-test | Kind label for a test: violet text/border with a blue-tinted background. | reader/details | nowhere |
| details panel kind badge: asset **(undefined variable)** | fact | `rgba(200,150,100,0.1)` = `#c896641a` | `styles/shell.css:526-528`; --color-asset (UNDEFINED), CSS var, no fallback; literal bg | .archetype-asset | Kind label for an asset. --color-asset is defined nowhere; tan-tinted background only. | reader/details | nowhere |
| details panel kind badge: stub / base | surface | `rgba(255,255,255,0.05)` = `#ffffff0d` | `styles/shell.css:500-533`; CSS literal + tokens | .archetype-badge, .archetype-stub | Base badge (bg rgba(255,255,255,.05), --border); 'stub' archetype muted. | reader/details | nowhere |
| transition token: 2D card / closed directory | fact | `#0091ff` = `#0091ff` | `views/perspectiveTransition.ts:100`; TS literals '#0091ff' / '#e9984d' | CardSnapshot.file.color | Captured for each 2D card: #0091ff for any file whatever its kind, the hub orange for a closed directory. The canvas draws the 3D file's own colour, so this is not seen to be drawn. apparently unused | 2D-3D transition | nowhere |

### 3D map: wires and marks

| Role | Class | Value(s) as written = normalised | Defined at; how | Used | Means | Views | Keyed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| reference wire (3D) | fact | `rgba(255,255,255,0.3)` = `#ffffff4d` | `views/forceGraphView.ts:1839-1840`; TS literal rgba strings (initial .16 at :1900) | linkColor accessor | A reference between two files, white; no role colour (withdrawn 2026-10-31, the hover's words carry direction). Alpha: .3 local, .16 whole-root, .5 the hovered file's, .12 to the frontier, .025 out of attention. | 3D Local Map, toolbar/tuning/legend | 3D legend 'References' (white sample; width = count) |
| path wire (3D) | fact | `rgba(255,255,255,0.9)` = `#ffffffe6` | `views/forceGraphView.ts:1833`; TS literal | linkColor | A wire on the path asked for: white .9 at twice the width. | 3D Local Map, toolbar/tuning/legend | 3D legend 'Path' (white bar with glow, shell.css:1130) |
| structure-layout reference (3D) | fact | `rgba(255,255,255,0.5)` = `#ffffff80` | `views/forceGraphView.ts:1834`; TS literal | linkColor | In the Structure layout a reference drawn on demand, white .5. | 3D Local Map | 3D legend 'References' |
| containment line (3D) | fact | `rgba(233,152,77,0.35)` = `#e9984d59` | `views/forceGraphView.ts:1829`; TS literal (the hub's #e9984d) | linkColor | A directory holds the file or directory at the other end; .35, .15 at the frontier, .08 out of attention. | 3D Local Map, toolbar/tuning/legend | 3D legend 'Contains' |
| cites arrow (3D) | fact | `rgba(153,102,204,0.4)` = `#9966cc66` | `views/forceGraphView.ts:1830`; TS literal (the document violet); arrow alpha x3 forceGraphBatches.ts:245 | linkColor + arrows | From a file to a document its words cite; .4/.15/.04; arrowheads at 3x the wire's alpha. | 3D Local Map, toolbar/tuning/legend | 3D legend 'Cites' |
| cited-by arrow (3D) | fact | `rgba(214,178,240,0.55)` = `#d6b2f08c` | `views/forceGraphView.ts:1832`; TS literal; legend #d6b2f0 spatial-legend.ts:62 | linkColor + arrows | From a document to a file its links name: the document violet lightened; .55/.2/.06. | 3D Local Map, toolbar/tuning/legend | 3D legend 'Cited by' |
| sphere base translucency (3D) | surface | <br>opacity 0.75 | `views/forceGraphBatches.ts:243`; TS multiplier | all spheres | Every sphere drawn at alpha .75 so a wire behind shows through. | 3D Local Map | nowhere |
| ring: more connected (3D) | fact | `rgba(0,145,255,0.85)` = `#0091ffd9` | `views/forceGraphView.ts:1812-1816`; TS: emphasizedSphere(kind colour, .85) | nodeRing accessor | A ring round a sphere with connections the picture does not show (press to see them), in the sphere's kind colour at .85 (.15 out of attention). value shown for implementation | 3D Local Map, toolbar/tuning/legend | 3D legend 'More connected' (sample in GREY, not the kind colour) |
| frontier: Beyond (3D) | state | <br>opacity 0.4 | `views/forceGraphView.ts:1805`; TS alpha multiplier | nodeColor; label graph.css:127 | A hop beyond, or another group: sphere alpha .4 (wrappers .6), its label .45. | 3D Local Map, toolbar/tuning/legend | 3D legend 'Beyond' (GREY at .4) |
| attention fade (3D hover/path) | state | <br>opacity 0.2 | `views/forceGraphView.ts:1799,1805,1814`; TS alpha multipliers | nodeColor, nodeRing, wrappers | Out of the hover's or path's attention: spheres at .2, rings .15, wrappers .2. | 3D Local Map | 3D legend 'Path' tooltip: 'What is not on it is faded' |
| legend neutral GREY | decoration | `#aeb8c6` = `#aeb8c6` | `panels/spatial-legend.ts:39`; GREY, TS const | 5 legend rows | The 3D legend's sample colour for rows whose meaning is shape not hue (size, Beyond, ring, wrapped, shell). | toolbar/tuning/legend | is the legend |
| legend white | fact | `#ffffff` = `#ffffff` | `panels/spatial-legend.ts:54-55`; TS literal | 2 legend rows | The 3D legend's References and Path samples. | toolbar/tuning/legend | is the legend |

### 3D map: skins, shells, bubbles

| Role | Class | Value(s) as written = normalised | Defined at; how | Used | Means | Views | Keyed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| skin (balloon) colour | fact | `#83b9d4` = `#83b9d4` | `views/forceGraphBatches.ts:747`; GLSL vec3(0.514,0.725,0.831), lit; alpha 0.05 + 0.22 rim + 0.25 shine (:750-752) | wrapper and balloon shader; transition canvas perspectiveTransition.ts:325; forceGraphView.ts:2128 | A wrapped group or directory shell: its files drawn as one body; faint face-on, denser at its edge; an inner bubble a rim alone; a veiled bubble (files not drawn) milky .42-.62. | 3D Local Map, toolbar/tuning/legend, 2D-3D transition | 3D legend 'Wrapped group' / 'Directory shell' (rgba(131,185,212,.4), shell.css:1138,1140) |
| skin highlight | decoration | `#52708a` = `#52708a` | `views/forceGraphBatches.ts:747`; GLSL vec3(0.32,0.44,0.54) | wrapper shader | The skin's specular highlight, added. | 3D Local Map | nowhere |
| cloud look | fact | `#8bacc7` = `#8bacc7` | `views/forceGraphBatches.ts:757`; GLSL vec3(0.545,0.675,0.78), alpha (.62+.38 noise) x .27 | wrapper shader, transition | The wrappers' alternative 'cloud' look: a fixed mist that veils what is behind. | 3D Local Map, 2D-3D transition | 3D legend wrapped/shell sample (skin colour) |
| hover/focus rim | state | `#dbedff` = `#dbedff` | `views/forceGraphBatches.ts:771`; GLSL vec3(0.86,0.93,1.0), +0.6 alpha | wrapper shader | The wrapper under the pointer or keyboard gains a bright edge. | 3D Local Map | nowhere |
| legend skin sample | fact | `rgba(131,185,212,0.4)` = `#83b9d466` | `styles/shell.css:1138`; CSS literal (also :1140) | .spatial-legend-sample--wrapped/--shell | The legend's wrapped/shell sample. | toolbar/tuning/legend | is the legend |

### History: Changed Files emphasis (3D only)

| Role | Class | Value(s) as written = normalised | Defined at; how | Used | Means | Views | Keyed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| changed: Glow (and Both) | fact | `rgba(255,255,255,1)` = `#ffffff` | `views/forceGraphEmphasis.ts:47`; TS literal; shader mix to vec3(1.0) forceGraphBatches.ts:767 | nodeColor, rings, shell dots, skins | A file the displayed step changed is drawn white, whole; a lit bubble or skin turns white with a bright edge. | 3D Local Map, history | nowhere (Tuning choice 'Changed Files') |
| unchanged: Dim (default, and Both) | fact | <br>opacity 0.2 | `views/forceGraphEmphasis.ts:25,48`; DIM_LOSS, TS const 0.8 | nodeColor, wires, bubbles, skins | Files the step did not change lose 80% of their alpha (the changed keep their kind colour). Default since 2026-11-15. | 3D Local Map, history | nowhere |
| changed wire (Glow) | fact | `rgba(255,255,255,0.85)` = `#ffffffd9` | `views/forceGraphEmphasis.ts:27`; WIRE_GLOW, TS const | linkColor | A wire the step added or changed rises to white .85. | 3D Local Map, history | nowhere |

### 3D map: scene, labels, controls

| Role | Class | Value(s) as written = normalised | Defined at; how | Used | Means | Views | Keyed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3D scene background | surface | `#000011` = `#000011` | `views/forceGraphRenderer.ts:51`; TS setClearColor(0x000011) | renderer | The 3D map's clear colour, a blue-black. | 3D Local Map | nowhere |
| 3D lights | surface | `#cccccc` = `#cccccc` | `views/forceGraphRenderer.ts:53`; TS AmbientLight(0xcccccc), DirectionalLight(0xffffff) | scene | Ambient #cccccc x pi and directional white x .6 pi: a sphere ranges from about 60% to 120% of its colour across its face. | 3D Local Map | nowhere |
| 3D label / tooltip surface | surface | `#080c16e8` = `#080c16e8`<br>rim `#485164` | `styles/graph.css:125`; CSS literal; border #485164 (also :17-18) | .force-graph-label, .spatial-wire-tooltip | Name chips over the 3D map and the wire tooltip. | 3D Local Map | nowhere |
| 3D label text | surface | `#ffffff` = `#ffffff` | `styles/graph.css:16`; --text-primary (UNDEFINED, fallback #eee at :31, :72), CSS literal + undefined var with fallback | tooltip, focus label, action buttons | White text on the chips; the focus chip falls back to #eee through an undefined variable. | 3D Local Map | nowhere |
| 3D focus chip / action strip surface | surface | `#1e1e1e` = `#1e1e1e`<br>rim `#555555` | `styles/graph.css:32`; --bg-surface (fallback #202020 dead), CSS var; border var(--border-color, #555): --border-color UNDEFINED | .force-graph-focus, .force-graph-actions | The focused file's name chip and its action strip. | 3D Local Map | nowhere |
| 3D directory label | fact | `#f4c18d` = `#f4c18d`<br>rim `#6f5237` | `styles/graph.css:126`; CSS literal; border #6f5237 | .force-graph-label[data-kind=directory] | A directory's name chip: warm text and border, the hub's family. | 3D Local Map | nowhere |
| 3D label at frontier | state | <br>opacity 0.45 | `styles/graph.css:127`; CSS opacity | .force-graph-label[data-context=true] | A label of a sphere beyond: opacity .45. | 3D Local Map | nowhere |
| 3D focus outline | state | `#0091ff` = `#0091ff` | `styles/graph.css:45`; CSS literal (bypasses --accent; also :86) | .force-graph-focus/.force-graph-label/.force-graph-actions button :focus-visible | Keyboard focus on a 3D name or action. | 3D Local Map | nowhere |
| 3D action hover | state | `#ffffff1a` = `#ffffff1a` | `styles/graph.css:80`; CSS literal | .force-graph-actions button:hover | Hovered action button. | 3D Local Map | nowhere |
| 3D building sweep | state | `#cccccc` = `#cccccc`<br>opacity 0.7 | `styles/graph.css:110`; --text-secondary (fallback #aab dead), CSS gradient, opacity .7 | #graph-svg::before | While the 3D map builds (after 300 ms): a thin line sweeps along its top edge; static at .45 under reduced motion. | 3D Local Map | aria-busy only |
| transition background lerp | surface | `#00000c` = `#00000c` | `views/perspectiveTransition.ts:264`; TS computed rgb() | transition layer | During the 2D/3D change the layer goes from #1e1e1e to #00000c (the 3D map is #000011, OKLab 1.3 away). | 2D-3D transition | nowhere |
| transition file-name chip | surface | `#15191fe8` = `#15191fe8` | `styles/local.css:550`; CSS literal | .perspective-file-name | Names travelling during the change of perspective. | 2D-3D transition | nowhere |

### 2D map: cards, directories, states

| Role | Class | Value(s) as written = normalised | Defined at; how | Used | Means | Views | Keyed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| card surface | surface | `#232326` = `#232326` | `styles/theme.css:50`; --bg-card via --node-bg, CSS custom property | 10 (--node-bg) + 2 | A file card. | 2D Local Map | nowhere |
| card border | surface | `#3f3f46` = `#3f3f46` | `styles/theme.css:73`; --border-interactive via --node-border, CSS custom property | 5 + 5 | A card's border; buttons' interactive border. | 2D Local Map | nowhere |
| card hover | state | `#2f2f33` = `#2f2f33`<br>rim `#777777` | `styles/theme.css:65`; --node-hover (+ --border-hover #777), CSS custom property | 2 / 1 | Hovered card fill and border. | 2D Local Map | nowhere |
| card shadow | decoration | `rgba(0,0,0,0.28)` = `#00000047` | `styles/view-shared.css:70`; CSS literal | .node-card | Every card's drop shadow. | 2D Local Map | nowhere |
| subject card ring | state | `rgba(0,122,204,0.4)` = `#007acc66` | `styles/view-shared.css:86`; CSS literals rgba(0,122,204,.4/.3), rgba(0,145,255,.22) | .node-card.selected.local-focus (card-factory.ts:106) | The subject (selected) card: accent border 2px, a ring in VS Code's #007acc and a blue glow. | 2D Local Map | nowhere |
| pinned row / file | state | `rgba(0,145,255,0.12)` = `#0091ff1f` | `styles/local.css:250-251`; --accent-subtle + --accent + --color-outbound-glow, CSS tokens | .symbol-pinned, .file-pinned (reading.css:234-235, 274); reading card bg --accent-muted (reading.css:92) | A pinned symbol row or file: accent-subtle fill, 1px accent ring and the OFFERS glow token. | 2D Local Map | nowhere |
| hover dims (2D) | state | <br>opacity 0.5 | `persistence/local-storage.ts:57-58`; --hover-dim-symbols / --hover-dim-connections, TS default written to CSS custom properties (tuning.ts:205-206) | local.css:178-222, 505-522 | Under a symbol or flow hover: other rows/cards at .5 (--hover-dim-symbols), other wires at .1 (--hover-dim-connections). Tuning levers. | 2D Local Map | nowhere |
| muted row (presentation) | state | <br>opacity 0.5 | `styles/local.css:505`; --hover-dim-symbols, CSS opacity | .branch-symbol-muted | A row shown but outside the pinned exploration: .5. | 2D Local Map | nowhere |
| bundle run | fact | <br>opacity 0.45 | `styles/local.css:519`; CSS opacity over the wire gradient | .connection-path.bundle-run | The shared run of a bundle of wires, as wide as their number, at .45. | 2D Local Map | 2D legend 'References' (overview) |
| opened directory membrane | fact | `#3d3d45` = `#3d3d45` | `styles/theme.css:76`; --membrane-outline, CSS custom property; fill #ffffff03 local.css:372 | .local-membrane-shape | An opened directory: an outline around its cards, a step under a card's border; fill almost nothing. | 2D Local Map, 2D-3D transition | nowhere |
| closed directory box (Box look) | fact | `#ffffff05` = `#ffffff05` | `styles/local.css:444`; CSS literal bg; border --border; shadow --bg-deep (fallback #15191f dead) + --border | .local-directory-closed | A closed directory as a plain box with a sheet's offset edge behind it. | 2D Local Map | nowhere |
| closed directory skin (Cells look, default) | fact | `#ffffff30` = `#ffffff30` | `styles/local.css:477`; CSS literals #ffffff30/#ffffff12/#ffffff14/#ffffff06/#ffffff0c (:477, :481, :483, :485, :498) | .local-closed--cells, .local-closed-outline__look | The skin holding cells: border/outline #ffffff30 (#ffffff60 on hover), inset light, radial light from top left. | 2D Local Map | nowhere |
| nested directory skin (cells) | fact | `#ffffff10` = `#ffffff10` | `styles/local.css:494`; CSS literal fill #ffffff10, stroke #ffffff55 | .local-cell-skin | A directory inside a closed directory: a small skin around its cells. | 2D Local Map | hover title names it |
| closed directory stack (Stack look) | fact | `#1d1d1f` = `#1d1d1f` | `styles/local.css:462-466`; --layer-1..3 / --edge-1..3, CSS color-mix of --node-bg/--node-border | .local-closed--stack | 1-3 sheets under the box by how much it holds: layers mixed toward black, edges toward the card. layers #1d1d1f #171719 #121214; edges #393940 #343439 #2f2f33 | 2D Local Map | nowhere |
| cells field-end veil | fact | `#ffffff` = `#ffffff` | `views/localView/card-factory.ts:524-525`; SVG mask (luminance), not a visible colour | fieldMarkup | Where a skin holds more than its room shows, its last cells fade (a mask gradient #fff to #111). | 2D Local Map | nowhere |
| map edge shadows | fact | `#000000a0` = `#000000a0` | `styles/local.css:536-539`; CSS gradients #000000a0 to transparent | .map-edge-* | The picture continues past this edge: a shadow deepening into it. | 2D Local Map | nowhere |
| backward wires cue on the 3D button | fact | `#e9b86d` = `#e9b86d`<br>text `#f2c98a` | `styles/local.css:321-324`; --backward-glow, CSS literals #e9b86d, #f2c98a, #e9b86d5c, #e9b86d8f, #e9b86d24, #e9b86daa | .perspective-controls button.has-backward-wires (index.ts:1009-1020) | In 2D, connections run backward in this scope (explore in 3D): amber border, text and glow; stronger glow and a fill when many; a rise when it appears. | 2D Local Map, toolbar/tuning/legend | tooltip '<n> connections run backward in 2D. Explore this scope in 3D.' |
| internals pseudo-row | fact | `rgba(40,40,50,0.6)` = `#28283299` | `styles/view-shared.css:546`; CSS literals: dashed rgba(100,100,120,.5), text rgba(230,230,240,.95), anchor rgba(80,80,100,.5) dashed rgba(120,120,140,.6) glow rgba(80,80,100,.4) (also reading.css:502-504) | .internals-label/-text/-anchor | A file's private implementation as one dashed grey 'Internals' row and dot. | 2D Local Map | nowhere |
| reading prose link | state | `#9ed2fa` = `#9ed2fa` | `styles/reading.css:46`; --accent-text (UNDEFINED, fallback #9ed2fa), CSS var with fallback; literal at :48 | .local-reading-block a, .local-reading-full | A link inside a card's Purpose or description. | 2D Local Map | nowhere |
| prose faded below reading scale | state | <br>opacity 0.35 | `styles/reading.css:130`; CSS opacity | .local-reading-faded | Below reading size a card's prose fades to .35. | 2D Local Map | nowhere |
| card text: file name | surface | `#f2f2f2` = `#f2f2f2` | `styles/theme.css:91`; --card-file-name, CSS custom property | 3 | A card's file name and a directory's own name. | 2D Local Map | nowhere |
| card text: symbol name | surface | `#ededed` = `#ededed` | `styles/theme.css:92`; --card-symbol-name, CSS custom property | 2 | A symbol's name. | 2D Local Map | nowhere |
| card text: prose | surface | `#b0b0b0` = `#b0b0b0` | `styles/theme.css:93`; --card-prose, CSS custom property | 3 | Purpose and descriptions. | 2D Local Map | nowhere |
| directory ancestor preview | state | `#0091ff` = `#0091ff`<br>opacity 0.5 | `styles/local.css:357`; --accent, CSS var + opacity .5 | .directory-ancestor-preview | Hovering an ancestor previews its extent with a half-opacity accent outline. | 2D Local Map | nowhere |

### Shell: accent, text tiers, surfaces, borders

| Role | Class | Value(s) as written = normalised | Defined at; how | Used | Means | Views | Keyed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| accent | state | `#0091ff` = `#0091ff` | `styles/theme.css:7`; --accent, CSS custom property | 90 | What can be pressed, what is pressed/selected/pinned/active, focus rings, links, history major ticks. Same hex as the offers pin and the implementation kind. | 2D Local Map, 3D Local Map, Knowledge Sources, reader/details, history, toolbar/tuning/legend, search | nowhere |
| accent hover | state | `#0070d4` = `#0070d4` | `styles/theme.css:8`; --accent-hover, CSS custom property | 1 | Hovered primary action button. | reader/details | nowhere |
| accent subtle | state | `rgba(0,145,255,0.12)` = `#0091ff1f` | `styles/theme.css:9`; --accent-subtle, CSS custom property | 19 | Hover/selected/pressed fill. | 2D Local Map, Knowledge Sources, reader/details, history, toolbar/tuning/legend, search | nowhere |
| accent muted | state | `rgba(0,145,255,0.08)` = `#0091ff14` | `styles/theme.css:10`; --accent-muted, CSS custom property | 3 | Fainter hover fill. | 2D Local Map, reader/details | nowhere |
| accent literals bypassing tokens | state | `rgba(0,145,255,0.2)` = `#0091ff33` | `styles/search.css:58`; CSS literals (search.css:58, 247, 410; shell.css:809, 1057, 838; view-shared.css:86, 251) | 8 listed here; 16 with the pins and the return badge | rgba(0,145,255,a) written out instead of a token (16 sites outside theme.css in all, the pins' among them): search focus ring .2, search badge .2, pathfind endpoint .1, symbol-badge border .2, subsection rule .2, subject glow .22, badge border .45, pulse .7. | reader/details, search, toolbar/tuning/legend | nowhere |
| text | surface | `#e4e4e4` = `#e4e4e4` | `styles/theme.css:82`; --text, CSS custom property | 40 | Primary text. | other | nowhere |
| text active | surface | `#ffffff` = `#ffffff` | `styles/theme.css:83`; --text-active, CSS custom property | 23 | Emphasised/active text, headings, search result names. | other | nowhere |
| text secondary | surface | `#cccccc` = `#cccccc` | `styles/theme.css:84`; --text-secondary, CSS custom property | 9 | Paragraphs, reader prose. | reader/details | nowhere |
| text muted | surface | `#888888` = `#888888` | `styles/theme.css:85`; --text-muted, CSS custom property | 27 | Muted labels, a card's path. | other | nowhere |
| text subtle | surface | `#777777` = `#777777` | `styles/theme.css:87`; --text-subtle, CSS custom property | 2 | Stats line, generated-section label. | other | nowhere |
| text disabled | surface | `#666666` = `#666666` | `styles/theme.css:86`; --text-disabled, CSS custom property | 5 | Named 'disabled' but also draws sidebar section headings, search placeholder, shortcut, clear button and empty message. | toolbar/tuning/legend, search | nowhere |
| panel text muted | surface | `#9ca3bc` = `#9ca3bc` | `styles/theme.css:97`; --text-panel-muted, CSS custom property | 25 | Panel labels, directory labels, step meta, closed box text. | 2D Local Map, history, toolbar/tuning/legend, search | nowhere |
| panel text subtle | surface | `#6c7484` = `#6c7484` | `styles/theme.css:98`; --text-panel-subtle, CSS custom property | 19 | Column labels, hints, card action icons, ruler, faint ticks; absent-at-this-moment items. | 2D Local Map, history, toolbar/tuning/legend, search | nowhere |
| panel text (dead) **(dead)** | surface | `#dee3f7` = `#dee3f7` | `styles/theme.css:96`; --text-panel, CSS custom property | 0 | Declared, never read. | other | nowhere |
| page background | surface | `#18181a` = `#18181a` | `styles/theme.css:46`; --bg, CSS custom property | 1 | Body. | other | nowhere |
| deep surface | surface | `#111111` = `#111111` | `styles/theme.css:47`; --bg-deep, CSS custom property | 25 | Headers, footers, menus, popovers, history panels, toolbar strip, inputs. | other | nowhere |
| main surface | surface | `#1e1e1e` = `#1e1e1e` | `styles/theme.css:48`; --bg-surface, CSS custom property (literal copy sources.css:315) | 9 | The view area under the 2D map, inputs, the 3D focus chip. | 2D Local Map, search | nowhere |
| elevated surface | surface | `#1f1f22` = `#1f1f22` | `styles/theme.css:49`; --bg-elevated via --sidebar-bg, CSS custom property | 1 + 3 | Sidebar, search results, map controls. | toolbar/tuning/legend, search | nowhere |
| input / control hover | surface | `#333333` = `#333333` | `styles/theme.css:51`; --bg-input, CSS custom property | 1 | Map control hover. | 2D Local Map | nowhere |
| glass | surface | `rgba(34,34,37,0.95)` = `#222225f2` | `styles/theme.css:55`; --glass, CSS custom property | 3 | Translucent detail panel, toolbar, Knowledge Sources panels (with backdrop blur). | reader/details, Knowledge Sources, toolbar/tuning/legend | nowhere |
| dead surfaces **(dead)** | surface | `rgba(0,0,0,0.5)` = `#00000080` | `styles/theme.css:52,56,59,60`; --bg-overlay, --glass-panel, --cluster-bg, --cluster-border, CSS custom properties | 0 | --bg-overlay rgba(0,0,0,.5), --glass-panel rgba(22,22,27,.92), --cluster-bg rgba(0,145,255,.035), --cluster-border rgba(0,145,255,.1): declared, never read. | other | nowhere |
| border | surface | `#2f2f34` = `#2f2f34` | `styles/theme.css:71`; --border, CSS custom property | 58 | Default separators and panel borders. | other | nowhere |
| border subtle | surface | `rgba(255,255,255,0.06)` = `#ffffff0f` | `styles/theme.css:72`; --border-subtle, CSS custom property | 9 | Very subtle separators (with differing literal fallbacks .04/.05/.06/.1 in sources.css). | Knowledge Sources | nowhere |
| white and black washes | surface | `rgba(0,0,0,0.2)` = `#00000033` | `styles/shell.css:313`; CSS literals (about 35 sites: shell, search, sources, history, reading, graph, local) | ~35 | Panel washes and shadows written as literals: rgba(255,255,255,.03-.08) fills, rgba(0,0,0,.15-.5) and #0006-#0009 shadows, #000a/#0008 dialog backdrops. | other | nowhere |
| button on accent | surface | `#ffffff` = `#ffffff` | `styles/view-shared.css:367`; CSS 'white' literal (also shell.css:277, 999) | 3 | White text/check on an accent button or a checked box. | other | nowhere |

### Reader, details, search, Knowledge Sources

| Role | Class | Value(s) as written = normalised | Defined at; how | Used | Means | Views | Keyed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| file link | state | `#7dd3fc` = `#7dd3fc` | `styles/theme.css:35`; --color-path (+ --color-path-hover #a5f3fc :36), CSS custom property | 5 + 2 | A link to a file in the reader and details (code-path cyan). | reader/details, search | nowhere |
| symbol reference | decoration | `#f0abfc` = `#f0abfc` | `styles/theme.css:37`; --color-symbol, CSS custom property | 1 (.dep-symbol) | A symbol named in a dependency list (pink). | reader/details | nowhere |
| inline code | decoration | `#e8a0ff` = `#e8a0ff` | `styles/theme.css:38`; --color-symbol-muted, CSS custom property | 2 | Inline code in the reader and dependency lists. | reader/details | nowhere |
| workspace link (dead) **(dead)** | decoration | `#c4b5fd` = `#c4b5fd` | `styles/theme.css:39`; --color-workspace, CSS custom property | 1 (dead rule) | Declared for .workspace-link, which nothing creates. | other | nowhere |
| error | fact | `#ff8888` = `#ff8888` | `styles/theme.css:40`; --color-error, CSS custom property (#f88); inline literal errors.ts:84; pathfind error bg rgba(244,67,54,.1) search.css:338 | 3 + 1 | Errors in the details panel and the path finder; the crash stack. | reader/details, search | nowhere |
| path found (success) | fact | `#8bd49a` = `#8bd49a` | `styles/search.css:332`; --text-success (UNDEFINED, fallback #8bd49a), CSS var with fallback; bg rgba(76,175,80,.1) :333 | .pathfind-status.success | The path finder's success line. | search | nowhere |
| search: no path / apart | fact | <br>opacity 0.6 | `styles/search.css:275`; CSS opacity | .search-row.is-apart, .search-group.is-apart | Rows the words match but no path connects: faded .6, names in the subtle tier. | search | nowhere |
| Knowledge Sources tree hover | state | `rgba(0,200,150,0.1)` = `#00c8961a` | `styles/sources.css:413`; CSS literal | .bundled-tree-file:hover | Hovered bundled file: a teal wash with accent text. | Knowledge Sources | nowhere |
| pulse highlight (dead) **(dead)** | state | `rgba(0,145,255,0.7)` = `#0091ffb3` | `styles/shell.css:837-845`; CSS keyframes | 0 | A pulse animation no code applies. | other | nowhere |
| badge (dead) **(dead)** | state | `rgba(0,145,255,0.45)` = `#0091ff73` | `styles/view-shared.css:246-253`; CSS literal | 0 | Generic .badge, which nothing creates. | other | nowhere |
| test-backed shadow element (dead) **(dead)** | fact | `rgba(138,92,255,0.18)` = `#8a5cff2e` | `styles/view-shared.css:107-115`; CSS tokens | 0 | An alternative halo element nothing creates. | other | nowhere |

### History scrubber and step panel

| Role | Class | Value(s) as written = normalised | Defined at; how | Used | Means | Views | Keyed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| major tick | fact | `#0091ff` = `#0091ff` | `styles/history.css:45`; --accent, CSS var | .history-tick.is-major | A step that changed what is pinned or salient. | history | nowhere |
| minor tick | fact | `#9ca3bc` = `#9ca3bc`<br>opacity 0.85 | `styles/history.css:44`; --text-panel-muted, CSS var + opacity .85 | .history-tick.is-minor | A content-only step: panel-muted at .85. | history | nowhere |
| faint tick | fact | `#6c7484` = `#6c7484`<br>opacity 0.45 | `styles/history.css:43`; --text-panel-subtle, CSS var + opacity .45 | .history-tick | Any other step: panel-subtle at .45. | history | nowhere |
| thumb | state | `#ffffff` = `#ffffff` | `styles/history.css:46`; --text-active, --bg-deep, --accent, CSS vars | .history-thumb | The step shown: white dot ringed in deep then accent. | history | nowhere |
| truncated history hatch | fact | `#9ca3bc` = `#9ca3bc` | `styles/history.css:51`; --text-panel-muted, CSS repeating gradient | .history-truncated | The history begins where the knowledge does, not where the repository did. | history | nowhere |
| disabled control | state | <br>opacity 0.35 | `styles/history.css:16`; CSS opacity (five different values) | 5 rules | A disabled scrubber button at .35 (also history back/forward .3, pin tray .45, perspective .55, reading counts .65). | history, toolbar/tuning/legend | nowhere |

### World Map

| Role | Class | Value(s) as written = normalised | Defined at; how | Used | Means | Views | Keyed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| district tint: blue | fact | light `hsl(212 68% 92%)` = `#ddeaf8`<br>dark `hsl(214 32% 13%)` = `#17202c` | `views/worldMap/controller.ts:183`; TINT_COLOURS.blue, TS literal hsl() per theme; nested regions at fill-opacity .85 (:513) | .w-region polygons | A region of kind 'cloud' by the engine's default legend (packages/engine/src/live-docs/board.ts:104), or any kind a board's legend maps to blue. | World Map | nowhere: the region's name is drawn beside it; help says 'A tinted region holds the things inside it' |
| district tint: orange | fact | light `hsl(30 72% 91%)` = `#f9e8d8`<br>dark `hsl(30 12% 13%)` = `#25211d` | `views/worldMap/controller.ts:184`; TINT_COLOURS.orange, TS literal hsl() per theme; nested regions at fill-opacity .85 (:513) | .w-region polygons | A region of kind 'on-prem' by default (board.ts:105), or as a board's legend says. | World Map | nowhere: the region's name is drawn beside it; help says 'A tinted region holds the things inside it' |
| district tint: green | fact | light `hsl(150 45% 90%)` = `#daf1e6`<br>dark `hsl(150 18% 12%)` = `#19241f` | `views/worldMap/controller.ts:185`; TINT_COLOURS.green, TS literal hsl() per theme; nested regions at fill-opacity .85 (:513) | .w-region polygons | A region a board's legend maps to green. | World Map | nowhere: the region's name is drawn beside it; help says 'A tinted region holds the things inside it' |
| district tint: grey | fact | light `hsl(215 12% 91%)` = `#e5e8eb`<br>dark `hsl(215 8% 14%)` = `#212327` | `views/worldMap/controller.ts:186`; TINT_COLOURS.grey, TS literal hsl() per theme; nested regions at fill-opacity .85 (:513) | .w-region polygons | A region whose kind no legend entry tints (the fallback, model.ts:116). | World Map | nowhere: the region's name is drawn beside it; help says 'A tinted region holds the things inside it' |
| district tint: violet | fact | light `hsl(262 55% 93%)` = `#ebe3f7`<br>dark `hsl(262 20% 14%)` = `#221d2b` | `views/worldMap/controller.ts:187`; TINT_COLOURS.violet, TS literal hsl() per theme; nested regions at fill-opacity .85 (:513) | .w-region polygons | A region a board's legend maps to violet. | World Map | nowhere: the region's name is drawn beside it; help says 'A tinted region holds the things inside it' |
| district tint: rose | fact | light `hsl(345 60% 93%)` = `#f8e2e8`<br>dark `hsl(345 18% 14%)` = `#2a1d20` | `views/worldMap/controller.ts:188`; TINT_COLOURS.rose, TS literal hsl() per theme; nested regions at fill-opacity .85 (:513) | .w-region polygons | A region a board's legend maps to rose. | World Map | nowhere: the region's name is drawn beside it; help says 'A tinted region holds the things inside it' |
| piece faces (shaded solid) | surface | light `#98a2b1` = `#98a2b1`<br>dark `#1f2530` = `#1f2530` | `views/worldMap/controller.ts:192-193`; THEMES.faceDark/faceLight, TS literals mixed at run time (mix(), :2240); light end #ffffff / #4a5468 | .w-face | A thing's faces, shaded by the camera between a dark and a light end. light theme #98a2b1..#ffffff, dark #1f2530..#4a5468 | World Map | nowhere |
| piece edges | surface | light `#505c6b` = `#505c6b`<br>dark `#0b0d11` = `#0b0d11` | `views/worldMap/controller.ts:192-193`; THEMES.faceStroke / tankStroke, TS literals (tank dark #6b7a90) | .w-face | Face stroke; a drum's (tank) dashed stroke. | World Map | nowhere |
| imagined thing | fact | <br>opacity 0.08 | `views/worldMap/controller.ts:197`; HOLLOW, TS const fill-opacity .08; shadow x.35 | .w-piece.imagined | A thing with no folder and no docs yet: faces at .08 and dashed edges, faint shadow. | World Map | World help text |
| piece shadow | decoration | `#000000` = `#000000` | `styles/world.css:96`; THEMES.shadow (duplicate of dead --w-shadow world.css:25,44), CSS fill #000 + TS fill-opacity | .w-shadow | A blurred black footprint (.26 light, .55 dark; .6 when floating). | World Map | nowhere |
| warm: declared crossing / wanting | fact | light `#c17f16` = `#c17f16`<br>dark `#e2b45f` = `#e2b45f` | `styles/world.css:21 (dark :40)`; --w-warm, CSS custom property per theme | 5 (.w-tunnel, .w-tunnel-dashed, .w-portal, text.w-tag, .w-wanting) | A declared crossing between regions (sleeve .22 wide, dashed .6, portals, tag text); also the crumbs' list of board names whose folder was not found. | World Map | World help: 'The warm sleeve is a declared crossing' |
| stands on (built on another's code) | fact | light `#4b5563` = `#4b5563`<br>dark `#94a1b3` = `#94a1b3` | `styles/world.css:16 (dark :35)`; --w-muted, CSS custom property (stroke-opacity .55 / .6) | .w-stand, .w-root, .w-ghost-end; muted text (13 uses) | One piece built on another's code: a dotted line on the board; strands under a piece; a ghost door's far end. | World Map | World tour/help |
| spoke: package vs reference | fact | light `#0f141b` = `#0f141b`<br>dark `#e6ebf2` = `#e6ebf2` | `styles/world.css:241,245`; --w-text / --w-faint, CSS custom properties | .w-spoke.package / .reference | Built on view: a package spoke in text colour, a project reference in faint. | World Map | nowhere |
| World text | surface | light `#0f141b` = `#0f141b`<br>dark `#e6ebf2` = `#e6ebf2` | `styles/world.css:15 (dark :34)`; --w-text, CSS custom property | 18 | Names, headings. | World Map | nowhere |
| World muted text | surface | light `#4b5563` = `#4b5563`<br>dark `#94a1b3` = `#94a1b3` | `styles/world.css:16`; --w-muted, CSS custom property | 13 | Sub-labels, zone names, help body. | World Map | nowhere |
| World faint text | surface | light `#8b95a5` = `#8b95a5`<br>dark `#5f6d80` = `#5f6d80` | `styles/world.css:17 (dark :36)`; --w-faint, CSS custom property | 8 | Kinds in token labels, step counters, tiers, close icon. | World Map | nowhere |
| World page | surface | light `#e3e6eb` = `#e3e6eb`<br>dark `#0b0d11` = `#0b0d11` | `styles/world.css:13 (dark :32)`; --w-bg, CSS custom property | 2 | Around the board. | World Map | nowhere |
| World board | surface | light `#ffffff` = `#ffffff`<br>dark `#14171d` = `#14171d` | `styles/world.css:14 (dark :33)`; --w-board, CSS custom property | 3 | The bench the pieces stand on; door fill. | World Map | nowhere |
| World panel | surface | light `#ffffff` = `#ffffff`<br>dark `#161b23` = `#161b23` | `styles/world.css:22 (dark :41)`; --w-panel, CSS custom property | 7 | Tools, help, tour, evidence. | World Map | nowhere |
| World line | surface | light `#c3cad4` = `#c3cad4`<br>dark `#283040` = `#283040` | `styles/world.css:23 (dark :42)`; --w-line, CSS custom property | 10 | Panel borders, bench edge, tool group rules. | World Map | nowhere |
| World text halo | surface | light `rgba(255,255,255,0.9)` = `#ffffffe6`<br>dark `rgba(11,13,17,0.8)` = `#0b0d11cc` | `styles/world.css:24 (dark :43)`; --w-halo, CSS custom property | 1 | A stroke behind board text so it reads over wires. | World Map | nowhere |
| World pressed tool | state | light `#e0f2fe` = `#e0f2fe`<br>dark `rgba(56,189,248,0.16)` = `#38bdf829` | `styles/world.css:20 (dark :39)`; --w-blue-subtle (+ --w-blue), CSS custom property | 1 | A pressed toggle: blue border/text on a blue wash. | World Map | nowhere |
| World hover fade | state | <br>opacity 0.12 | `styles/world.css:325,329,339`; CSS opacity classes .dim/.dim-soft (controller.ts:1192-1278) | applyHover | Hovering or pinning a wire, piece, token, door or region: unrelated wires/tokens at .12, unrelated pieces at .35; 'Built on' fades call wires to .15. | World Map | nowhere |
| World grid | decoration | `rgba(15,20,27,0.05)` = `#0f141b0d` | `styles/world.css:89`; --w-text, CSS stroke-opacity | .w-grid | Snap grid, text colour at .05. | World Map | nowhere |
| World panel shadows | decoration | `rgba(0,0,0,0.22)` = `#00000038` | `styles/world.css:461,482,553,590`; CSS literals | 4 | Help button .12, help/tour .22, evidence .18. | World Map | nowhere |
| World focus ring and pinned panel | state | light `#0284c7` = `#0284c7`<br>dark `#38bdf8` = `#38bdf8` | `styles/world.css:267,444,603`; --w-blue, CSS custom property (same token as the offering door) | .w-focus-ring, :focus-visible, .world-evidence.pinned | Keyboard focus on a piece or tool; a pinned evidence panel's 3px left border. | World Map | nowhere |

## Appendix: measurements

Generated by `colour-measure.mjs` in this folder. "As drawn" rows composite the stated alpha over the stated surface.

### Prior claims re-measured (full-strength values)

| Pair | A | B | OKLab ΔE×100 | protan | deutan | tritan | CIEDE2000 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| wire offers vs kind implementation (claimed 12.7) | `#38bdf8` | `#0091ff` | 12.7 | 12.9 | 13.8 | 9.3 | 15.4 |
| wire uses vs kind test (claimed 14.3) | `#34d399` | `#28a745` | 14.3 | 15.0 | 14.0 | 13.9 | 15.4 |
| kind test vs hub (claimed 2.5 protan) | `#28a745` | `#e9984d` | 23.7 | 2.5 | 12.1 | 28.0 | 45.8 |

### Same meaning, different values

| Pair | A | B | OKLab ΔE×100 | protan | deutan | tritan | CIEDE2000 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| offers: wire vs pin (2D) | `#38bdf8` | `#0091ff` | 12.7 | 12.9 | 13.8 | 9.3 | 15.4 |
| uses: wire vs pin (2D) | `#34d399` | `#00d3aa` | 2.4 | 2.3 | 2.4 | 0.7 | 4.6 |
| offers: World light vs 2D wire | `#0284c7` | `#38bdf8` | 16.7 | 17.3 | 16.8 | 16.3 | 17.9 |
| uses: World light vs 2D wire | `#059669` | `#34d399` | 17.9 | 18.5 | 17.7 | 17.7 | 17.3 |
| test: 3D green vs 2D violet | `#28a745` | `#8a5cff` | 38.6 | 32.6 | 30.1 | 11.9 | 56.6 |
| accent (state) vs pin offers (fact) | `#0091ff` | `#0091ff` | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| selection ring #007acc vs accent | `#007acc` | `#0091ff` | 9.3 | 9.3 | 9.0 | 9.1 | 9.3 |
| reader link cyan --color-path vs wire offers | `#7dd3fc` | `#38bdf8` | 8.3 | 7.1 | 8.6 | 5.3 | 7.3 |

### Different meanings, near or equal values (full strength)

| Pair | A | B | OKLab ΔE×100 | protan | deutan | tritan | CIEDE2000 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| pin offers vs kind implementation | `#0091ff` | `#0091ff` | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| pin uses vs kind test | `#00d3aa` | `#28a745` | 15.2 | 16.2 | 14.9 | 14.6 | 18.5 |
| pin uses vs wire uses (same meaning) | `#00d3aa` | `#34d399` | 2.4 | 2.3 | 2.4 | 0.7 | 4.6 |
| 2D test-backed violet vs 3D document violet | `#8a5cff` | `#9966cc` | 8.7 | 7.6 | 9.2 | 6.7 | 8.7 |
| hub orange vs 2D backward amber | `#e9984d` | `#e9b86d` | 7.5 | 8.3 | 6.3 | 8.0 | 10.7 |
| hub orange vs World warm (dark) | `#e9984d` | `#e2b45f` | 6.6 | 6.7 | 4.5 | 7.0 | 11.7 |
| World warm light vs World warm dark | `#c17f16` | `#e2b45f` | 14.8 | 15.9 | 14.4 | 14.8 | 15.3 |
| type badge extends vs kind asset | `#ff96b4` | `#e83e8c` | 17.7 | 20.0 | 15.0 | 16.8 | 17.9 |
| type badge implements vs backward amber | `#ffd28c` | `#e9b86d` | 7.7 | 8.0 | 7.6 | 6.5 | 6.3 |
| type badge return text vs wire offers | `#64c8ff` | `#38bdf8` | 4.5 | 3.6 | 4.4 | 2.7 | 3.8 |
| type badge param text vs wire uses | `#64ffc8` | `#34d399` | 13.0 | 13.2 | 13.0 | 12.3 | 10.2 |
| cited-by lavender vs document violet | `#d6b2f0` | `#9966cc` | 21.8 | 22.2 | 22.2 | 21.1 | 22.1 |
| skin #83b9d4 vs wire offers | `#83b9d4` | `#38bdf8` | 7.1 | 5.3 | 6.4 | 4.6 | 8.2 |
| skin #83b9d4 vs legend GREY #aeb8c6 | `#83b9d4` | `#aeb8c6` | 5.3 | 2.5 | 4.2 | 7.1 | 11.5 |
| kind other #888888 vs legend GREY #aeb8c6 | `#888888` | `#aeb8c6` | 15.4 | 15.9 | 15.2 | 15.3 | 16.1 |

### 3D kind palette, all pairs (full strength)

| Pair | A | B | OKLab ΔE×100 | protan | deutan | tritan | CIEDE2000 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| implementation vs test | `#0091ff` | `#28a745` | 29.1 | 27.5 | 28.1 | 6.2 | 54.9 |
| implementation vs asset | `#0091ff` | `#e83e8c` | 32.5 | 18.7 | 20.7 | 35.5 | 44.7 |
| implementation vs document | `#0091ff` | `#9966cc` | 16.7 | 10.1 | 8.2 | 16.4 | 28.1 |
| implementation vs hub | `#0091ff` | `#e9984d` | 33.7 | 27.3 | 33.9 | 27.1 | 51.2 |
| implementation vs other | `#0091ff` | `#888888` | 19.4 | 17.6 | 19.8 | 12.8 | 26.3 |
| test vs asset | `#28a745` | `#e83e8c` | 37.6 | 21.4 | 7.8 | 35.2 | 82.3 |
| test vs document | `#28a745` | `#9966cc` | 32.7 | 26.5 | 21.4 | 16.0 | 52.1 |
| test vs hub | `#28a745` | `#e9984d` | 23.7 | 2.5 | 12.1 | 28.0 | 45.8 |
| test vs other | `#28a745` | `#888888` | 17.6 | 12.4 | 8.8 | 11.6 | 27.2 |
| asset vs document | `#e83e8c` | `#9966cc` | 17.3 | 10.2 | 14.2 | 21.3 | 21.7 |
| asset vs hub | `#e83e8c` | `#e9984d` | 22.5 | 23.0 | 15.9 | 14.8 | 42.3 |
| asset vs other | `#e83e8c` | `#888888` | 21.5 | 10.1 | 2.2 | 23.9 | 27.5 |
| document vs hub | `#9966cc` | `#e9984d` | 28.2 | 27.3 | 29.2 | 19.4 | 50.4 |
| document vs other | `#9966cc` | `#888888` | 15.7 | 14.5 | 12.8 | 5.1 | 26.2 |
| hub vs other | `#e9984d` | `#888888` | 17.9 | 13.4 | 17.9 | 19.2 | 27.3 |

### 3D as drawn (alpha .75 over #000011, before lighting), kind pairs and wires

| Pair | A | B | OKLab ΔE×100 | protan | deutan | tritan | CIEDE2000 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| implementation vs test | `#006dc4` | `#1e7d38` | 23.2 | 22.4 | 22.5 | 5.1 | 48.6 |
| implementation vs asset | `#006dc4` | `#ae2f6d` | 26.0 | 15.2 | 16.4 | 28.3 | 39.1 |
| implementation vs document | `#006dc4` | `#734d9d` | 13.3 | 8.3 | 6.5 | 12.9 | 23.4 |
| implementation vs hub | `#006dc4` | `#af723e` | 27.0 | 22.3 | 27.2 | 21.6 | 45.7 |
| implementation vs other | `#006dc4` | `#66666a` | 15.4 | 14.4 | 15.8 | 10.2 | 24.0 |
| implementation vs white wire .3 | `#006dc4` | `#4d4d58` | 17.9 | 18.5 | 17.2 | 15.9 | 24.8 |
| implementation vs containment .35 | `#006dc4` | `#523526` | 26.6 | 28.1 | 25.0 | 24.6 | 38.9 |
| implementation vs cites .4 | `#006dc4` | `#3d295c` | 23.3 | 24.6 | 20.8 | 24.6 | 29.5 |
| implementation vs cited-by .55 | `#006dc4` | `#76628c` | 13.1 | 9.1 | 11.4 | 11.0 | 23.3 |
| implementation vs skin .27 | `#006dc4` | `#233246` | 24.8 | 26.3 | 23.8 | 24.9 | 24.1 |
| test vs asset | `#1e7d38` | `#ae2f6d` | 30.0 | 17.2 | 6.5 | 28.0 | 71.2 |
| test vs document | `#1e7d38` | `#734d9d` | 26.0 | 21.1 | 17.1 | 12.6 | 46.9 |
| test vs hub | `#1e7d38` | `#af723e` | 18.8 | 2.0 | 9.7 | 22.3 | 40.3 |
| test vs other | `#1e7d38` | `#66666a` | 14.1 | 9.9 | 7.1 | 9.3 | 27.1 |
| test vs white wire .3 | `#1e7d38` | `#4d4d58` | 17.9 | 16.3 | 13.1 | 13.3 | 32.7 |
| test vs containment .35 | `#1e7d38` | `#523526` | 22.1 | 21.6 | 16.1 | 22.0 | 39.1 |
| test vs cites .4 | `#1e7d38` | `#3d295c` | 28.9 | 28.0 | 24.2 | 22.0 | 47.3 |
| test vs cited-by .55 | `#1e7d38` | `#76628c` | 20.1 | 14.7 | 11.7 | 11.1 | 40.0 |
| test vs skin .27 | `#1e7d38` | `#233246` | 25.8 | 25.8 | 23.7 | 21.9 | 40.0 |
| asset vs document | `#ae2f6d` | `#734d9d` | 13.7 | 8.0 | 11.1 | 17.0 | 19.1 |
| asset vs hub | `#ae2f6d` | `#af723e` | 18.1 | 18.4 | 12.9 | 11.7 | 37.0 |
| asset vs other | `#ae2f6d` | `#66666a` | 17.0 | 8.2 | 1.5 | 19.0 | 25.2 |
| asset vs white wire .3 | `#ae2f6d` | `#4d4d58` | 19.2 | 3.5 | 10.5 | 21.7 | 25.6 |
| asset vs containment .35 | `#ae2f6d` | `#523526` | 21.8 | 13.0 | 16.6 | 20.5 | 28.9 |
| asset vs cites .4 | `#ae2f6d` | `#3d295c` | 23.4 | 12.3 | 21.4 | 26.5 | 24.9 |
| asset vs cited-by .55 | `#ae2f6d` | `#76628c` | 13.9 | 8.2 | 5.3 | 17.4 | 19.4 |
| asset vs skin .27 | `#ae2f6d` | `#233246` | 27.4 | 12.1 | 21.9 | 30.8 | 34.2 |
| document vs hub | `#734d9d` | `#af723e` | 22.4 | 21.6 | 23.3 | 15.3 | 44.1 |
| document vs other | `#734d9d` | `#66666a` | 12.4 | 11.4 | 10.1 | 4.0 | 22.0 |
| document vs white wire .3 | `#734d9d` | `#4d4d58` | 13.3 | 11.5 | 11.0 | 8.0 | 19.3 |
| document vs containment .35 | `#734d9d` | `#523526` | 20.3 | 20.6 | 19.0 | 14.1 | 33.4 |
| document vs cites .4 | `#734d9d` | `#3d295c` | 17.1 | 16.3 | 16.7 | 16.6 | 15.5 |
| document vs cited-by .55 | `#734d9d` | `#76628c` | 7.0 | 7.1 | 6.5 | 3.9 | 9.9 |
| document vs skin .27 | `#734d9d` | `#233246` | 21.2 | 18.1 | 19.0 | 19.3 | 20.8 |
| hub vs other | `#af723e` | `#66666a` | 14.3 | 10.7 | 14.3 | 15.2 | 26.1 |
| hub vs white wire .3 | `#af723e` | `#4d4d58` | 21.7 | 17.8 | 22.3 | 22.3 | 33.1 |
| hub vs containment .35 | `#af723e` | `#523526` | 25.3 | 23.5 | 25.7 | 25.5 | 26.9 |
| hub vs cites .4 | `#af723e` | `#3d295c` | 32.1 | 29.5 | 33.5 | 30.3 | 46.9 |
| hub vs cited-by .55 | `#af723e` | `#76628c` | 16.2 | 15.1 | 16.9 | 13.0 | 36.1 |
| hub vs skin .27 | `#af723e` | `#233246` | 32.5 | 27.5 | 33.3 | 33.5 | 42.6 |
| other vs white wire .3 | `#66666a` | `#4d4d58` | 9.0 | 8.9 | 9.1 | 8.9 | 9.9 |
| other vs containment .35 | `#66666a` | `#523526` | 16.1 | 17.6 | 15.5 | 16.2 | 21.4 |
| other vs cites .4 | `#66666a` | `#3d295c` | 19.9 | 20.3 | 20.0 | 18.4 | 25.7 |
| other vs cited-by .55 | `#66666a` | `#76628c` | 6.5 | 5.5 | 5.0 | 2.7 | 16.4 |
| other vs skin .27 | `#66666a` | `#233246` | 20.1 | 19.3 | 20.5 | 20.4 | 20.2 |
| white wire .3 vs containment .35 | `#4d4d58` | `#523526` | 8.8 | 9.8 | 8.2 | 8.9 | 18.6 |
| white wire .3 vs cites .4 | `#4d4d58` | `#3d295c` | 11.5 | 11.8 | 11.3 | 9.6 | 17.5 |
| white wire .3 vs cited-by .55 | `#4d4d58` | `#76628c` | 11.9 | 10.8 | 11.1 | 11.0 | 16.3 |
| white wire .3 vs skin .27 | `#4d4d58` | `#233246` | 11.2 | 10.3 | 11.4 | 11.6 | 11.4 |
| containment .35 vs cites .4 | `#523526` | `#3d295c` | 11.7 | 11.5 | 12.1 | 6.6 | 27.3 |
| containment .35 vs cited-by .55 | `#523526` | `#76628c` | 19.5 | 20.5 | 18.8 | 17.5 | 28.8 |
| containment .35 vs skin .27 | `#523526` | `#233246` | 9.8 | 7.1 | 9.6 | 10.9 | 23.7 |
| cites .4 vs cited-by .55 | `#3d295c` | `#76628c` | 20.1 | 20.1 | 20.4 | 20.2 | 19.2 |
| cites .4 vs skin .27 | `#3d295c` | `#233246` | 6.8 | 4.7 | 3.9 | 4.9 | 13.5 |
| cited-by .55 vs skin .27 | `#76628c` | `#233246` | 22.4 | 20.3 | 21.8 | 22.5 | 24.0 |

### 2D as drawn: roles (wires .7 over #1e1e1e, pins .4 over #232326) against kinds (cells .42 over box) and test-backed

| Pair | A | B | OKLab ΔE×100 | protan | deutan | tritan | CIEDE2000 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| wire offers vs wire uses | `#308db7` | `#2d9d74` | 12.4 | 11.8 | 11.6 | 2.3 | 30.6 |
| wire offers vs pin offers | `#308db7` | `#154f7d` | 19.5 | 20.3 | 19.4 | 19.5 | 23.0 |
| wire offers vs pin uses | `#308db7` | `#15695b` | 16.3 | 16.7 | 15.7 | 14.4 | 26.6 |
| wire offers vs cell impl | `#308db7` | `#185583` | 17.6 | 18.3 | 17.5 | 17.6 | 21.1 |
| wire offers vs cell test | `#308db7` | `#295e35` | 21.7 | 22.6 | 20.9 | 19.0 | 38.5 |
| wire offers vs cell asset | `#308db7` | `#793253` | 26.1 | 26.2 | 19.1 | 29.2 | 49.6 |
| wire offers vs cell other | `#308db7` | `#515151` | 20.3 | 21.8 | 18.7 | 21.1 | 27.7 |
| wire offers vs cell grey (choice) | `#308db7` | `#65696d` | 13.3 | 13.6 | 11.5 | 13.9 | 20.9 |
| wire offers vs test-backed border | `#308db7` | `#513d88` | 22.1 | 23.0 | 19.1 | 22.4 | 33.2 |
| wire uses vs pin offers | `#2d9d74` | `#154f7d` | 25.1 | 25.2 | 24.7 | 20.5 | 41.5 |
| wire uses vs pin uses | `#2d9d74` | `#15695b` | 15.8 | 16.3 | 15.6 | 15.2 | 19.7 |
| wire uses vs cell impl | `#2d9d74` | `#185583` | 23.5 | 23.5 | 23.1 | 18.6 | 40.4 |
| wire uses vs cell test | `#2d9d74` | `#295e35` | 19.3 | 20.4 | 18.8 | 19.8 | 22.9 |
| wire uses vs cell asset | `#2d9d74` | `#793253` | 29.7 | 28.5 | 19.4 | 30.0 | 63.3 |
| wire uses vs cell other | `#2d9d74` | `#515151` | 22.1 | 22.7 | 18.9 | 22.0 | 33.0 |
| wire uses vs cell grey (choice) | `#2d9d74` | `#65696d` | 15.7 | 14.6 | 10.9 | 14.8 | 28.3 |
| wire uses vs test-backed border | `#2d9d74` | `#513d88` | 29.5 | 28.9 | 25.2 | 23.6 | 48.3 |
| pin offers vs pin uses | `#154f7d` | `#15695b` | 11.5 | 11.1 | 11.2 | 5.5 | 26.6 |
| pin offers vs cell impl | `#154f7d` | `#185583` | 1.9 | 2.0 | 1.9 | 1.9 | 2.0 |
| pin offers vs cell test | `#154f7d` | `#295e35` | 14.0 | 13.6 | 13.8 | 2.6 | 36.2 |
| pin offers vs cell asset | `#154f7d` | `#793253` | 16.3 | 7.6 | 9.6 | 18.8 | 32.9 |
| pin offers vs cell other | `#154f7d` | `#515151` | 9.8 | 8.1 | 9.9 | 7.3 | 18.4 |
| pin offers vs cell grey (choice) | `#154f7d` | `#65696d` | 13.6 | 11.1 | 14.2 | 11.3 | 18.7 |
| pin offers vs test-backed border | `#154f7d` | `#513d88` | 8.8 | 4.3 | 1.9 | 6.4 | 16.2 |
| pin uses vs cell impl | `#15695b` | `#185583` | 10.7 | 10.2 | 10.3 | 3.7 | 26.0 |
| pin uses vs cell test | `#15695b` | `#295e35` | 5.6 | 6.1 | 5.5 | 4.7 | 11.1 |
| pin uses vs cell asset | `#15695b` | `#793253` | 19.2 | 12.3 | 3.9 | 20.5 | 43.9 |
| pin uses vs cell other | `#15695b` | `#515151` | 8.8 | 6.4 | 3.4 | 9.3 | 21.6 |
| pin uses vs cell grey (choice) | `#15695b` | `#65696d` | 9.2 | 3.1 | 5.0 | 8.7 | 21.5 |
| pin uses vs test-backed border | `#15695b` | `#513d88` | 17.8 | 15.3 | 12.5 | 10.0 | 35.6 |
| cell impl vs cell test | `#185583` | `#295e35` | 13.9 | 13.5 | 13.5 | 2.8 | 36.1 |
| cell impl vs cell asset | `#185583` | `#793253` | 16.5 | 9.1 | 9.3 | 19.2 | 33.9 |
| cell impl vs cell other | `#185583` | `#515151` | 9.7 | 8.5 | 9.6 | 7.6 | 18.4 |
| cell impl vs cell grey (choice) | `#185583` | `#65696d` | 12.3 | 9.7 | 12.8 | 10.0 | 18.0 |
| cell impl vs test-backed border | `#185583` | `#513d88` | 9.1 | 5.6 | 2.3 | 7.3 | 17.2 |
| cell test vs cell asset | `#295e35` | `#793253` | 19.0 | 11.1 | 4.3 | 18.1 | 52.3 |
| cell test vs cell other | `#295e35` | `#515151` | 8.8 | 5.8 | 4.0 | 6.5 | 21.8 |
| cell test vs cell grey (choice) | `#295e35` | `#65696d` | 12.5 | 9.2 | 9.7 | 10.3 | 24.6 |
| cell test vs test-backed border | `#295e35` | `#513d88` | 19.9 | 17.4 | 15.4 | 6.8 | 41.2 |
| cell asset vs cell other | `#793253` | `#515151` | 10.7 | 6.1 | 0.6 | 11.7 | 23.1 |
| cell asset vs cell grey (choice) | `#793253` | `#65696d` | 14.3 | 14.1 | 8.9 | 15.4 | 25.6 |
| cell asset vs test-backed border | `#793253` | `#513d88` | 11.5 | 9.4 | 11.2 | 12.9 | 19.1 |
| cell other vs cell grey (choice) | `#515151` | `#65696d` | 8.5 | 8.7 | 8.4 | 8.4 | 9.0 |
| cell other vs test-backed border | `#515151` | `#513d88` | 12.1 | 11.9 | 11.5 | 3.4 | 23.8 |
| cell grey (choice) vs test-backed border | `#65696d` | `#513d88` | 15.1 | 15.2 | 15.1 | 10.6 | 20.9 |

### World Map, pair by pair

| Pair | A | B | OKLab ΔE×100 | protan | deutan | tritan | CIEDE2000 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| light: offers vs uses | `#0284c7` | `#059669` | 16.9 | 16.1 | 16.2 | 3.0 | 37.5 |
| dark: offers vs uses | `#38bdf8` | `#34d399` | 16.8 | 15.9 | 15.7 | 3.0 | 36.8 |
| light: uses vs warm | `#059669` | `#c17f16` | 19.5 | 7.9 | 12.1 | 23.7 | 41.3 |
| dark: uses vs warm | `#34d399` | `#e2b45f` | 18.1 | 7.3 | 8.8 | 22.7 | 36.0 |
| tint light blue vs orange | `#ddeaf8` | `#f9e8d8` | 5.3 | 4.5 | 5.2 | 5.4 | 16.1 |
| tint light blue vs green | `#ddeaf8` | `#daf1e6` | 3.6 | 3.3 | 2.9 | 1.1 | 13.0 |
| tint light blue vs grey | `#ddeaf8` | `#e5e8eb` | 1.8 | 1.7 | 1.8 | 1.8 | 5.4 |
| tint light blue vs violet | `#ddeaf8` | `#ebe3f7` | 2.4 | 1.3 | 0.3 | 2.8 | 10.6 |
| tint light blue vs rose | `#ddeaf8` | `#f8e2e8` | 4.0 | 2.2 | 2.5 | 5.4 | 15.4 |
| tint light orange vs green | `#f9e8d8` | `#daf1e6` | 4.3 | 2.0 | 2.2 | 5.8 | 16.8 |
| tint light orange vs grey | `#f9e8d8` | `#e5e8eb` | 3.5 | 2.8 | 3.5 | 3.7 | 10.7 |
| tint light orange vs violet | `#f9e8d8` | `#ebe3f7` | 5.1 | 4.9 | 5.2 | 3.0 | 16.0 |
| tint light orange vs rose | `#f9e8d8` | `#f8e2e8` | 3.1 | 2.9 | 2.7 | 1.0 | 11.2 |
| tint light green vs grey | `#daf1e6` | `#e5e8eb` | 2.9 | 2.2 | 1.3 | 2.5 | 11.0 |
| tint light green vs violet | `#daf1e6` | `#ebe3f7` | 5.4 | 4.2 | 3.0 | 3.6 | 20.0 |
| tint light green vs rose | `#daf1e6` | `#f8e2e8` | 5.4 | 2.9 | 0.6 | 5.9 | 24.1 |
| tint light grey vs violet | `#e5e8eb` | `#ebe3f7` | 2.6 | 2.1 | 1.8 | 1.1 | 9.7 |
| tint light grey vs rose | `#e5e8eb` | `#f8e2e8` | 2.8 | 0.8 | 0.8 | 3.6 | 11.2 |
| tint light violet vs rose | `#ebe3f7` | `#f8e2e8` | 2.5 | 2.1 | 2.5 | 2.6 | 7.2 |
| tint dark blue vs orange | `#17202c` | `#25211d` | 3.7 | 3.2 | 3.8 | 3.7 | 11.0 |
| tint dark blue vs green | `#17202c` | `#19241f` | 3.3 | 3.2 | 3.2 | 1.2 | 12.0 |
| tint dark blue vs grey | `#17202c` | `#212327` | 2.4 | 2.0 | 2.5 | 2.5 | 5.1 |
| tint dark blue vs violet | `#17202c` | `#221d2b` | 2.1 | 0.5 | 0.5 | 2.7 | 8.3 |
| tint dark blue vs rose | `#17202c` | `#2a1d20` | 3.9 | 2.3 | 3.2 | 5.1 | 12.7 |
| tint dark orange vs green | `#25211d` | `#19241f` | 2.2 | 0.6 | 0.7 | 2.9 | 9.5 |
| tint dark orange vs grey | `#25211d` | `#212327` | 1.8 | 1.8 | 1.8 | 1.7 | 6.1 |
| tint dark orange vs violet | `#25211d` | `#221d2b` | 3.5 | 3.4 | 3.4 | 1.3 | 11.7 |
| tint dark orange vs rose | `#25211d` | `#2a1d20` | 1.9 | 1.3 | 0.7 | 1.6 | 7.9 |
| tint dark green vs grey | `#19241f` | `#212327` | 2.2 | 1.5 | 1.4 | 1.5 | 9.0 |
| tint dark green vs violet | `#19241f` | `#221d2b` | 4.2 | 3.4 | 2.7 | 2.3 | 16.8 |
| tint dark green vs rose | `#19241f` | `#2a1d20` | 3.9 | 1.7 | 0.1 | 4.4 | 18.1 |
| tint dark grey vs violet | `#212327` | `#221d2b` | 2.5 | 2.4 | 2.0 | 1.6 | 8.3 |
| tint dark grey vs rose | `#212327` | `#2a1d20` | 2.5 | 1.9 | 1.3 | 3.2 | 9.2 |
| tint dark violet vs rose | `#221d2b` | `#2a1d20` | 2.6 | 2.3 | 2.7 | 2.4 | 7.2 |
| tint light blue vs board white | `#ddeaf8` | `#ffffff` | 7.2 | 6.6 | 7.4 | 7.4 | 8.6 |
| tint light orange vs board white | `#f9e8d8` | `#ffffff` | 6.6 | 7.2 | 6.3 | 6.6 | 9.7 |
| tint light green vs board white | `#daf1e6` | `#ffffff` | 6.8 | 5.4 | 6.2 | 6.9 | 11.7 |
| tint light grey vs board white | `#e5e8eb` | `#ffffff` | 7.1 | 6.9 | 7.1 | 7.1 | 5.2 |
| tint light violet vs board white | `#ebe3f7` | `#ffffff` | 7.7 | 7.8 | 7.7 | 7.3 | 11.2 |
| tint light rose vs board white | `#f8e2e8` | `#ffffff` | 7.2 | 7.7 | 6.7 | 7.4 | 11.1 |
| tint dark blue vs board dark | `#17202c` | `#14171d` | 3.9 | 4.2 | 3.8 | 3.9 | 4.5 |
| tint dark orange vs board dark | `#25211d` | `#14171d` | 5.2 | 4.6 | 5.3 | 5.2 | 8.2 |
| tint dark green vs board dark | `#19241f` | `#14171d` | 5.0 | 5.1 | 4.8 | 4.5 | 10.5 |
| tint dark grey vs board dark | `#212327` | `#14171d` | 5.2 | 5.1 | 5.2 | 5.2 | 4.1 |
| tint dark violet vs board dark | `#221d2b` | `#14171d` | 4.3 | 3.7 | 3.9 | 4.1 | 7.9 |
| tint dark rose vs board dark | `#2a1d20` | `#14171d` | 5.1 | 3.5 | 4.9 | 5.7 | 10.1 |

### WCAG contrast

| Foreground | value | on | surface | ratio |
| --- | --- | --- | --- | --- |
| --text | `#e4e4e4` | --bg-deep | `#111111` | 14.85 |
| --text | `#e4e4e4` | --bg-surface | `#1e1e1e` | 13.11 |
| --text | `#e4e4e4` | --bg-card | `#232326` | 12.33 |
| --text | `#e4e4e4` | glass over surface | `#222225` | 12.48 |
| --text-active | `#ffffff` | --bg-deep | `#111111` | 18.88 |
| --text-active | `#ffffff` | --bg-surface | `#1e1e1e` | 16.67 |
| --text-active | `#ffffff` | --bg-card | `#232326` | 15.67 |
| --text-active | `#ffffff` | glass over surface | `#222225` | 15.87 |
| --text-secondary | `#cccccc` | --bg-deep | `#111111` | 11.76 |
| --text-secondary | `#cccccc` | --bg-surface | `#1e1e1e` | 10.38 |
| --text-secondary | `#cccccc` | --bg-card | `#232326` | 9.76 |
| --text-secondary | `#cccccc` | glass over surface | `#222225` | 9.88 |
| --text-muted | `#888888` | --bg-deep | `#111111` | 5.33 |
| --text-muted | `#888888` | --bg-surface | `#1e1e1e` | 4.70 |
| --text-muted | `#888888` | --bg-card | `#232326` | 4.42 |
| --text-muted | `#888888` | glass over surface | `#222225` | 4.48 |
| --text-subtle | `#777777` | --bg-deep | `#111111` | 4.22 |
| --text-subtle | `#777777` | --bg-surface | `#1e1e1e` | 3.72 |
| --text-subtle | `#777777` | --bg-card | `#232326` | 3.50 |
| --text-subtle | `#777777` | glass over surface | `#222225` | 3.54 |
| --text-disabled | `#666666` | --bg-deep | `#111111` | 3.29 |
| --text-disabled | `#666666` | --bg-surface | `#1e1e1e` | 2.90 |
| --text-disabled | `#666666` | --bg-card | `#232326` | 2.73 |
| --text-disabled | `#666666` | glass over surface | `#222225` | 2.76 |
| --text-panel-muted | `#9ca3bc` | --bg-deep | `#111111` | 7.53 |
| --text-panel-muted | `#9ca3bc` | --bg-surface | `#1e1e1e` | 6.65 |
| --text-panel-muted | `#9ca3bc` | --bg-card | `#232326` | 6.25 |
| --text-panel-muted | `#9ca3bc` | glass over surface | `#222225` | 6.33 |
| --text-panel-subtle | `#6c7484` | --bg-deep | `#111111` | 4.02 |
| --text-panel-subtle | `#6c7484` | --bg-surface | `#1e1e1e` | 3.55 |
| --text-panel-subtle | `#6c7484` | --bg-card | `#232326` | 3.34 |
| --text-panel-subtle | `#6c7484` | glass over surface | `#222225` | 3.38 |
| --card-file-name | `#f2f2f2` | --bg-deep | `#111111` | 16.87 |
| --card-file-name | `#f2f2f2` | --bg-surface | `#1e1e1e` | 14.89 |
| --card-file-name | `#f2f2f2` | --bg-card | `#232326` | 14.00 |
| --card-file-name | `#f2f2f2` | glass over surface | `#222225` | 14.17 |
| --card-symbol-name | `#ededed` | --bg-deep | `#111111` | 16.13 |
| --card-symbol-name | `#ededed` | --bg-surface | `#1e1e1e` | 14.24 |
| --card-symbol-name | `#ededed` | --bg-card | `#232326` | 13.39 |
| --card-symbol-name | `#ededed` | glass over surface | `#222225` | 13.55 |
| --card-prose | `#b0b0b0` | --bg-deep | `#111111` | 8.71 |
| --card-prose | `#b0b0b0` | --bg-surface | `#1e1e1e` | 7.69 |
| --card-prose | `#b0b0b0` | --bg-card | `#232326` | 7.23 |
| --card-prose | `#b0b0b0` | glass over surface | `#222225` | 7.32 |
| --accent (as text) | `#0091ff` | --bg-deep | `#111111` | 5.84 |
| --accent (as text) | `#0091ff` | --bg-surface | `#1e1e1e` | 5.16 |
| --accent (as text) | `#0091ff` | --bg-card | `#232326` | 4.85 |
| --accent (as text) | `#0091ff` | glass over surface | `#222225` | 4.91 |
| --color-path | `#7dd3fc` | --bg-deep | `#111111` | 11.33 |
| --color-path | `#7dd3fc` | --bg-surface | `#1e1e1e` | 10.00 |
| --color-path | `#7dd3fc` | --bg-card | `#232326` | 9.40 |
| --color-path | `#7dd3fc` | glass over surface | `#222225` | 9.52 |
| --color-symbol-muted | `#e8a0ff` | --bg-deep | `#111111` | 9.80 |
| --color-symbol-muted | `#e8a0ff` | --bg-surface | `#1e1e1e` | 8.66 |
| --color-symbol-muted | `#e8a0ff` | --bg-card | `#232326` | 8.14 |
| --color-symbol-muted | `#e8a0ff` | glass over surface | `#222225` | 8.24 |
| --color-error | `#ff8888` | --bg-deep | `#111111` | 8.21 |
| --color-error | `#ff8888` | --bg-surface | `#1e1e1e` | 7.25 |
| --color-error | `#ff8888` | --bg-card | `#232326` | 6.81 |
| --color-error | `#ff8888` | glass over surface | `#222225` | 6.90 |
| --color-test-text | `#e7e5ff` | --bg-deep | `#111111` | 15.33 |
| --color-test-text | `#e7e5ff` | --bg-surface | `#1e1e1e` | 13.54 |
| --color-test-text | `#e7e5ff` | --bg-card | `#232326` | 12.72 |
| --color-test-text | `#e7e5ff` | glass over surface | `#222225` | 12.88 |
| --color-test-text-muted | `#cbc8f8` | --bg-deep | `#111111` | 11.83 |
| --color-test-text-muted | `#cbc8f8` | --bg-surface | `#1e1e1e` | 10.44 |
| --color-test-text-muted | `#cbc8f8` | --bg-card | `#232326` | 9.82 |
| --color-test-text-muted | `#cbc8f8` | glass over surface | `#222225` | 9.94 |
| --color-test-label | `#a59fe0` | --bg-deep | `#111111` | 7.76 |
| --color-test-label | `#a59fe0` | --bg-surface | `#1e1e1e` | 6.86 |
| --color-test-label | `#a59fe0` | --bg-card | `#232326` | 6.45 |
| --color-test-label | `#a59fe0` | glass over surface | `#222225` | 6.52 |
| #9ed2fa reading link | `#9ed2fa` | --bg-deep | `#111111` | 11.74 |
| #9ed2fa reading link | `#9ed2fa` | --bg-surface | `#1e1e1e` | 10.36 |
| #9ed2fa reading link | `#9ed2fa` | --bg-card | `#232326` | 9.74 |
| #9ed2fa reading link | `#9ed2fa` | glass over surface | `#222225` | 9.86 |
| #8bd49a pathfind success | `#8bd49a` | --bg-deep | `#111111` | 10.77 |
| #8bd49a pathfind success | `#8bd49a` | --bg-surface | `#1e1e1e` | 9.51 |
| #8bd49a pathfind success | `#8bd49a` | --bg-card | `#232326` | 8.94 |
| #8bd49a pathfind success | `#8bd49a` | glass over surface | `#222225` | 9.05 |
| 3D label #fff | `#ffffff` | 3D label bg | `#070b16` | 19.65 |
| 3D directory label #f4c18d | `#f4c18d` | 3D label bg | `#070b16` | 12.03 |
| history thumb accent | `#0091ff` | --bg-deep | `#111111` | 5.84 |
| backward cue text #f2c98a | `#f2c98a` | --bg-deep | `#111111` | 12.14 |
| type badge return text | `#64c8ffe6` | badge bg (blue .25 on card) | `#1a3f5c` | 5.13 |
| type badge param text | `#64ffc8e6` | badge bg (teal .25 on card) | `#1a4f47` | 6.36 |
| type badge extends text | `#ff96b4e6` | badge bg (pink .25 on card) | `#5a3441` | 4.48 |
| type badge implements text | `#ffd28ce6` | badge bg (amber .25 on card) | `#5a4932` | 5.29 |
| type badge plain text | `#b4b4c8cc` | badge bg (grey .4 on card) | `#3d3d47` | 3.99 |
| World light --w-text | `#0f141b` | board/panel | `#ffffff` | 18.48 |
| World light --w-text | `#0f141b` | page --w-bg | `#e3e6eb` | 14.77 |
| World light --w-muted | `#4b5563` | board/panel | `#ffffff` | 7.56 |
| World light --w-muted | `#4b5563` | page --w-bg | `#e3e6eb` | 6.04 |
| World light --w-faint | `#8b95a5` | board/panel | `#ffffff` | 3.03 |
| World light --w-faint | `#8b95a5` | page --w-bg | `#e3e6eb` | 2.42 |
| World light --w-blue (as text) | `#0284c7` | board/panel | `#ffffff` | 4.10 |
| World light --w-blue (as text) | `#0284c7` | page --w-bg | `#e3e6eb` | 3.27 |
| World light --w-green | `#059669` | board/panel | `#ffffff` | 3.77 |
| World light --w-green | `#059669` | page --w-bg | `#e3e6eb` | 3.01 |
| World light --w-warm (as text) | `#c17f16` | board/panel | `#ffffff` | 3.33 |
| World light --w-warm (as text) | `#c17f16` | page --w-bg | `#e3e6eb` | 2.66 |
| World dark --w-text | `#e6ebf2` | board | `#14171d` | 14.98 |
| World dark --w-text | `#e6ebf2` | panel | `#161b23` | 14.43 |
| World dark --w-muted | `#94a1b3` | board | `#14171d` | 6.84 |
| World dark --w-muted | `#94a1b3` | panel | `#161b23` | 6.59 |
| World dark --w-faint | `#5f6d80` | board | `#14171d` | 3.41 |
| World dark --w-faint | `#5f6d80` | panel | `#161b23` | 3.28 |
| World dark --w-blue (as text) | `#38bdf8` | board | `#14171d` | 8.38 |
| World dark --w-blue (as text) | `#38bdf8` | panel | `#161b23` | 8.07 |
| World dark --w-green | `#34d399` | board | `#14171d` | 9.34 |
| World dark --w-green | `#34d399` | panel | `#161b23` | 8.99 |
| World dark --w-warm (as text) | `#e2b45f` | board | `#14171d` | 9.34 |
| World dark --w-warm (as text) | `#e2b45f` | panel | `#161b23` | 8.99 |

#### Fact marks against their surface (non-text, WCAG 1.4.11 asks 3:1)

| Mark | value | on | surface | ratio |
| --- | --- | --- | --- | --- |
| 2D wire offers (.7) | `#38bdf8b3` | --bg-surface | `#1e1e1e` | 4.47 |
| 2D wire uses (.7) | `#34d399b3` | --bg-surface | `#1e1e1e` | 4.90 |
| 2D wire offers (.7) | `#38bdf8b3` | --bg-card | `#232326` | 4.29 |
| 2D pin offers fill (.4) | `#0091ff66` | --bg-card | `#232326` | 1.83 |
| 2D pin uses fill (.4) | `#00d3aa66` | --bg-card | `#232326` | 2.40 |
| 2D pin offers rim (.6) | `#0091ff99` | --bg-card | `#232326` | 2.57 |
| 2D pin uses rim (.55) | `#00d3aa8c` | --bg-card | `#232326` | 3.39 |
| test-backed border (.45) | `#8a5cff73` | --bg-surface | `#1e1e1e` | 1.80 |
| test chip text #e7e5ff on chip | `#e7e5ff` | chip (.18 violet on card) | `#362d4d` | 10.39 |
| 2D cell impl fill (.42) | `#0091ff6b` | box | `#292929` | 1.84 |
| 2D cell impl rim (.75) | `#0091ffbf` | box | `#292929` | 3.12 |
| 2D cell test fill (.42) | `#28a7456b` | box | `#292929` | 1.90 |
| 2D cell test rim (.75) | `#28a745bf` | box | `#292929` | 3.22 |
| 2D cell asset fill (.42) | `#e83e8c6b` | box | `#292929` | 1.66 |
| 2D cell asset rim (.75) | `#e83e8cbf` | box | `#292929` | 2.68 |
| 2D cell other fill (.42) | `#8888886b` | box | `#292929` | 1.83 |
| 2D cell other rim (.75) | `#888888bf` | box | `#292929` | 2.95 |
| 3D sphere implementation (.75) | `#0091ffbf` | #000011 | `#000011` | 3.94 |
| 3D sphere test (.75) | `#28a745bf` | #000011 | `#000011` | 4.03 |
| 3D sphere asset (.75) | `#e83e8cbf` | #000011 | `#000011` | 3.39 |
| 3D sphere document (.75) | `#9966ccbf` | #000011 | `#000011` | 3.24 |
| 3D sphere hub (.75) | `#e9984dbf` | #000011 | `#000011` | 5.25 |
| 3D sphere other (.75) | `#888888bf` | #000011 | `#000011` | 3.65 |
| 3D sphere interface (.75) | `#ffc107bf` | #000011 | `#000011` | 7.20 |
| 3D sphere config (.75) | `#6c757dbf` | #000011 | `#000011` | 2.89 |
| 3D sphere script (.75) | `#17a2b8bf` | #000011 | `#000011` | 4.14 |
| 3D white wire (.3) | `#ffffff4d` | #000011 | `#000011` | 2.48 |
| 3D whole-root wire (.16) | `#ffffff29` | #000011 | `#000011` | 1.45 |
| 3D containment (.35) | `#e9984d59` | #000011 | `#000011` | 1.88 |
| 3D cites (.4) | `#9966cc66` | #000011 | `#000011` | 1.65 |
| 3D cited-by (.55) | `#d6b2f08c` | #000011 | `#000011` | 3.85 |
| World light door offers | `#0284c7` | board | `#ffffff` | 4.10 |
| World light door uses | `#059669` | board | `#ffffff` | 3.77 |
| World dark door offers | `#38bdf8` | board | `#14171d` | 8.38 |
| World dark door uses | `#34d399` | board | `#14171d` | 9.34 |
| World light tint blue | `#ddeaf8` | board | `#ffffff` | 1.22 |
| World light tint orange | `#f9e8d8` | board | `#ffffff` | 1.20 |
| World light tint green | `#daf1e6` | board | `#ffffff` | 1.19 |
| World light tint grey | `#e5e8eb` | board | `#ffffff` | 1.23 |
| World light tint violet | `#ebe3f7` | board | `#ffffff` | 1.25 |
| World light tint rose | `#f8e2e8` | board | `#ffffff` | 1.23 |
| World dark tint blue | `#17202c` | board | `#14171d` | 1.09 |
| World dark tint orange | `#25211d` | board | `#14171d` | 1.12 |
| World dark tint green | `#19241f` | board | `#14171d` | 1.12 |
| World dark tint grey | `#212327` | board | `#14171d` | 1.14 |
| World dark tint violet | `#221d2b` | board | `#14171d` | 1.09 |
| World dark tint rose | `#2a1d20` | board | `#14171d` | 1.11 |
| World light road start (hard-coded, both themes) | `#38bdf8` | board | `#ffffff` | 2.14 |
| World light road end (hard-coded, both themes) | `#34d399` | board | `#ffffff` | 1.92 |
| World light road start | `#38bdf8` | light region tint blue | `#ddeaf8` | 1.75 |
| World light warm tunnel (.22 stroke) | `#c17f1638` | board | `#ffffff` | 1.27 |
| 2D amber cue border #e9b86d | `#e9b86d` | --bg-deep | `#111111` | 10.38 |
| 2D subject ring (rgba(0,122,204,.4)) | `#007acc66` | --bg-surface | `#1e1e1e` | 1.59 |
| accent as focus ring | `#0091ff` | --bg-card | `#232326` | 4.85 |
| accent as focus ring | `#0091ff` | #000011 (3D) | `#000011` | 6.44 |

### Extra pairs

| Pair | A | B | OKLab ΔE×100 | protan | deutan | tritan | CIEDE2000 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| World light: road start vs door offers | `#38bdf8` | `#0284c7` | 16.7 | 17.3 | 16.8 | 16.3 | 17.9 |
| World light: road end vs door uses | `#34d399` | `#059669` | 17.9 | 18.5 | 17.7 | 17.7 | 17.3 |
| 3D white wire .3 vs 3D path white .9 (as drawn) | `#4d4d58` | `#e6e6e7` | 50.1 | 50.1 | 50.3 | 50.2 | 50.1 |
| 3D sphere impl vs ring impl .85 (same meaning) | `#006dc4` | `#007bdb` | 5.1 | 5.3 | 4.9 | 5.2 | 5.8 |
| 3D impl full vs frontier .4 (as drawn) | `#006dc4` | `#002c58` | 24.7 | 25.9 | 23.9 | 25.1 | 23.5 |
| 3D test full vs frontier .4 (as drawn) | `#1e7d38` | `#0c3221` | 25.0 | 25.7 | 24.2 | 24.1 | 25.9 |
| 3D impl frontier .4 vs test frontier .4 (as drawn) | `#002c58` | `#0c3221` | 11.1 | 10.9 | 11.0 | 3.0 | 29.5 |
| 3D impl faded .2 vs other full (as drawn) | `#001635` | `#66666a` | 31.5 | 30.2 | 32.0 | 30.1 | 29.6 |
| 3D dim (history) impl vs test | `#001635` | `#061919` | 6.1 | 6.1 | 6.2 | 2.0 | 18.2 |
| 2D legend kinds sample vs 3D sphere (impl) | `#124f7f` | `#006dc4` | 13.0 | 13.7 | 12.6 | 12.8 | 12.0 |
| accent vs 3D hub (focus ring on a directory) | `#0091ff` | `#e9984d` | 33.7 | 27.3 | 33.9 | 27.1 | 51.2 |
| --color-symbol #f0abfc vs asset #e83e8c | `#f0abfc` | `#e83e8c` | 23.7 | 26.9 | 20.1 | 25.3 | 25.6 |
| --color-error #ff8888 vs asset #e83e8c | `#ff8888` | `#e83e8c` | 15.8 | 17.3 | 13.3 | 11.9 | 20.1 |
| success #8bd49a vs wire uses | `#8bd49a` | `#34d399` | 6.3 | 1.6 | 3.8 | 6.1 | 8.0 |

### Normalised derived values

- tint light blue: hsl(212 68% 92%) = `#ddeaf8`; dark hsl(214 32% 13%) = `#17202c`
- tint light orange: hsl(30 72% 91%) = `#f9e8d8`; dark hsl(30 12% 13%) = `#25211d`
- tint light green: hsl(150 45% 90%) = `#daf1e6`; dark hsl(150 18% 12%) = `#19241f`
- tint light grey: hsl(215 12% 91%) = `#e5e8eb`; dark hsl(215 8% 14%) = `#212327`
- tint light violet: hsl(262 55% 93%) = `#ebe3f7`; dark hsl(262 20% 14%) = `#221d2b`
- tint light rose: hsl(345 60% 93%) = `#f8e2e8`; dark hsl(345 18% 14%) = `#2a1d20`
- as drawn wireOffers2d: `#308db7`
- as drawn wireUses2d: `#2d9d74`
- as drawn pinOffers2d: `#154f7d`
- as drawn pinUses2d: `#15695b`
- as drawn pinOffersRim: `#0e65a8`
- as drawn pinUsesRim: `#10846f`
- as drawn cellImpl: `#185583`
- as drawn cellTest: `#295e35`
- as drawn cellAsset: `#793253`
- as drawn cellOther: `#515151`
- as drawn cellGrey: `#65696d`
- as drawn testBorder: `#513d88`
- as drawn testHalo: `#312947`
- as drawn sphereImpl: `#006dc4`
- as drawn sphereTest: `#1e7d38`
- as drawn sphereAsset: `#ae2f6d`
- as drawn sphereDoc: `#734d9d`
- as drawn sphereHub: `#af723e`
- as drawn sphereOther: `#66666a`
- as drawn wire3d: `#4d4d58`
- as drawn contain3d: `#523526`
- as drawn cites3d: `#3d295c`
- as drawn citedBy3d: `#76628c`
- as drawn skin3d: `#233246`
- glass over surface: `#222225`; closed box light: `#292929`; 3D label bg: `#070b16`
- skin shine vec3(0.32,0.44,0.54) = `#52708a`; rim vec3(0.86,0.93,1.0) = `#dbedff`; skin vec3(0.514,0.725,0.831) = `#83b9d4`; cloud vec3(0.545,0.675,0.78) = `#8bacc7`
- stack layers color-mix(#232326 82/66/52% with #000): `#1d1d1f`, `#171719`, `#121214`; edges color-mix(#3f3f46 80/60/42% with #232326): `#393940`, `#343439`, `#2f2f33`
- World face shading light: mix(#98a2b1 -> #ffffff); dark: mix(#1f2530 -> #4a5468); tank side at .55 light `#d1d5dc`, top at .9 `#f5f6f7`
- transition background: rgb(30,30,30) `#1e1e1e` -> rgb(0,0,12) `#00000c` (3D clear is `#000011`, ΔE 1.3)
