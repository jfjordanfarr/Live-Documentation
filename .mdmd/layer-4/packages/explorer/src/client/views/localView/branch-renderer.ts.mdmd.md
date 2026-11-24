# `packages/explorer/src/client/views/localView/branch-renderer.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/localView/branch-renderer.ts`
- Generated At: 2026-11-24T17:39:08.120Z

## Authored
### Purpose

Builds, measures and animates the 2D Local Map's retained branch scene, keeping file cards, directory membranes and symbol rows connected while the layout improves.

### Notes

Current reading-refresh boundary, November 9 UTC, after the root’s normal-default review of the owner’s reading feedback: construction and refresh share one canonical `exploreBranches` call and one row-visibility/emphasis calculation. `refreshReadingPresentation` accepts only fixed-slot changes with identical canonical files, links, member/directory scope and row membership, unchanged actual row visibility, and unchanged Close controls. It updates text, accessible states and row emphasis in place while preserving the stage, learned row order, measured answers and continuing search. Growing text or changed disclosure/retention falls back to the existing structural render. The scope comparison reads the existing canonical Exploration fields; it is not a serialized-object cache or a comparison of raw choices.

- The [November 5 owner test](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-04/2026-11-04.1.record.md#turn-9) found cumulative displacement while hovering between descriptions, despite exact restoration on leaving. A reading visit now retains its initial held element and screen anchor alongside the original scene/camera. Both instant and animated disclosure use that element until the visit ends, independently of later hover-tuning updates to the exploration anchor. This prevents each replacement from treating the previous expansion's displaced row as a new baseline.

The original scene/camera remain available until the return animation completes. Reentering during that return resumes the same visit; it must not adopt the intermediate camera as a new home. The visual probe reproduced almost 397 px of displacement after ten such interruptions when the home was cleared at the start of the return. Instant returns release it immediately, and a genuine action may still supersede it.

The same investigation exposed a rapid zoom reversal during disclosure moving the subject behind the sidebar. When scale changes, the animation rebases its held rectangle and camera/layer baselines before applying the next pose. The rectangle already contains the requested zoom, so the hold corrects only subsequent layout movement; keeping translation while cancelling scale had introduced an unwanted pan. Matched fast and settled input sequences protect this distinction.
- In the [November 4 learning-journey pass](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-04/2026-11-04.1.record.md#turn-8), boxed symbol rows animate as groups. A temporary opaque surface covers only the middle text column, keeping crossing explanations from blending while preserving the moving pins and attached wires. Interrupted renders capture the displayed row positions before clearing previous transforms. Legacy rows with display:contents retain their child movement. The renderer also supplies exact return-reference edges to the card reading menu; it does not derive a second graph.

The same pass's November 5 full gate exposed a coordinate mismatch when pinning grew the search header during native movement. The controller compensated for the moved layer, then the animation's hold compensated again and left the title clipped. The hold now includes the untransformed layer-origin displacement, including the inner status offset, alongside camera displacement. A new held identity resets both baselines together. This preserves deliberate camera movement and the controller's visibility correction; the strengthened header regression fails against the preceding bundle.

Introduced with the native retained-branch implementation in [October 2, Turn 11](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/Summarized/2026-10-02.1.SUMMARIZED.md#turn-11), reusing file cards while retaining independent neighborhoods and every induced relationship. Neighborhoods and explicit paths use this same renderer after the [owner’s October 12 walkthrough](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-12/2026-10-12.1.record.md#turn-3). A path keeps its requested scope and compact relevant rows regardless of exploration pins; its wrapper marks the original hop for navigation and tests.

Directory names inspect evidence; separate Open, Close and More controls request application actions through the controller. They stand beside the label's caption in a column of their own, 18 px and raised 2 px like the ancestry control, never inside the caption: the caption stays the one text flow the layout lab lays out with Pretext, and a button's box in it made the page's labels taller and wider than the lab's text on 2026-10-20 ([the record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-20/2026-10-20.1.record.md#the-layout-lab-caught-the-label-buttons)). A card's symbol reveal changes only its local disclosure, while its outside-connection control explicitly pins the file. This renderer owns construction, layout and motion; the application owns the shared pin and directory transitions used by both map representations. The separation follows [October 19, Turn 24](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-19/2026-10-19.1.record.md#turn-24), continued in [October 20, Turn 2](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-20/2026-10-20.1.record.md#turn-2).

The held identity can be a symbol row as well as a file or directory. `elementHeld` uses the latest acted-on visible row when it survives in the next picture, otherwise its card; directory openings use the label or closed box. A move switches its hold if another item is inspected or its menu is opened during the animation. Holding the row includes its movement within the card, so direct Pin remains under the eye while the surrounding neighborhood and symbol order change. This is the owner's “swing along the monkey bars” requirement from the accepted interaction turn, rather than a second selection or pin state.

Since 2026-10-06 (the layout lab's first milestone) this module is the page's shell around the pure scene of `branch-scene.ts`: it builds the cards once and dresses their hidden rows and notes once, then for each start of the order step (`branch-restarts.ts`: the ranking's order, the previous picture's, and the seeded shuffles the tuning's `orderStarts` asks for) stands each card's rows in that start's order, acts as the scene's measurer (widths at max-content under the card cap; heights, pin offsets and label heights at the widths the columns give, the pins read from the rows as that start stood them), and places exactly; the cheapest picture by the tuning's costs is kept, its sections and lanes are built after the choice, and the laid-out scene is applied to the elements. The root says which start it drew (`data-order-start`), how many were tried (`data-order-starts`), the chosen start's price (`data-order-score`) and how long the layout took (`data-layout-ms`), for the lab's verify pass and the specs; by the page's clock five starts take about a quarter of a second on this repository's five-file scope and half a second on its chain ([Turn 12](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-06/2026-10-06.1.record.md#turn-12)); the layout lab feeds the same scene a measurer made from a capture of the page, so both draw one picture. The layout's dials come from the Local Map's tuning: the ranking's pull and tie rule, the order's sweeps and seed, the symbol order, the column gap, the item gap, the band gap, the membrane's neck and padding, and the card width cap. A pin centred on a half pixel rounds up by a thousandth before rounding, so the placement's input is the same wherever the card stood when measured; the earlier code measured after placing across and rounded on a knife-edge the page's transform could tip either way. What follows describes the picture the shell draws. Places native cards, lanes and the Membrane Map's directory bands on the vertical axis from the exact placement of `branch-placement.ts`, in the order `branch-order.ts` chose, while preserving dependency ranks: every element is positioned absolutely inside the element it belongs to, the columns at their measured widths. Since 2026-10-06 a directory's element is the bounds of its membrane's segments, drawn as nothing; the outline `membrane-outline.ts` traces around the segments is an SVG path inside it, beneath the cards, carrying `data-directory` for the deck; the label stands at the leftmost segment's top, given that segment's width before its height is measured; and the element publishes its segments in `data-segments`, in the picture's pixels, so a test or a reader can check the shape without the drawing. Until 2026-10-05 the picture was a CSS grid whose rows were shared across columns, so no card could be lowered to meet its partner without moving every column; the owner asked for the durable, correct implementation and this is it ([Turn 13](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-05/2026-10-05.1.record.md#turn-13)). It measures in two passes, widths first and heights at those widths, because a card's rows of test names wrap at its column's width and a box's label wraps to nothing in a box not yet given a width; the first draft read 250 px of label into every box's inset. Keeps the band elements nested with their outlines and labels, so the perspective transition finds its shells. The root is the picture itself, a band kept as an element so that the perspective transition has its outermost shell but drawn as nothing, with no box, no padding and no name, as in the Membrane (until 2026-10-05 it was a band labelled "/" with its own padding around everything). Each lane the order reserved is a `.local-pass-through` spacer that the placement sizes as a box whose items are the lane's slots, one per bundle, and that says in `data-slots` where each slot came to rest below its top, so the router can measure the lane and thread the skipped references through its slots (since 2026-10-06; until then the spacer was one rigid item sized to its bundles at pitch): in a directory's stack of files after the named file or above the first, in a directory of directories in a grid row of its own among the subdirectories' rows, and in a column a directory spans with no file of its own as that column's only occupant. Stands each card's symbol rows in the order the branch graph chose, moving the row elements in the card's grid, rows the order does not name after them and Internals last; two symbols may share a normalized name, as graph.ts's LinkTarget and linkTarget do, so a name claims one row per mention, which the first draft got wrong and the alphabetical picture showed. Keeps explicit pins and the selected file legible; other cards can collapse to the rows required by retained symbols. Revealing a card is separate from retaining its interfaces, and closing clears that reveal override. Counts expose symbols and connections outside the current disclosure, and a card touched by a cycle's feedback says how many references read back, since those are drawn only as stubs until hovered (2026-10-05).
- Since 2026-10-07 the renderer keeps a stage across renders (`BranchStage`: the wrappers by file, the sections and spacers by the pose's box key, the outlines, the labels, the pose shown and the move running) and moves the picture from the previous pose to the new over the tuning's `moveMs` instead of redrawing it: `applyPose` sets every element from a pose; `startMove` runs the frames, eased, slides the rows of a card from their old places (`rowOffsets`, `rowMotions`), fades entering and leaving elements, holds the acted-on element still by measuring it on screen each frame, and redraws the wires every frame with the overlay saying `moving` so that the stylesheet drops their glow; `endMove` finishes a move at its destination or leaves an interrupted one where it stands, and a render that interrupts starts from that frame. The held element is measured on screen rather than followed in the pose because the picture root shifts in its container as the picture's size changes; the first try followed the pose alone and the picture crept upward over several moves. The root says `data-moving` while a move runs, for the specs and the tools, and no text announces it (the owner's choices, [Turn 16](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-06/2026-10-06.1.record.md#turn-16)).
- The continuing search (2026-10-07, [Turn 17](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-06/2026-10-06.1.record.md#turn-17)): the first paint's measurer writes the page's answers that no start changes into `PageAnswers` (each card's natural width and height at its column's width, each drawn directory's label height), and `rowsOf` measures each card's rows once at the chosen order; after the first paint the stage's `Search` alternates one ordering start or boundary-alignment proposal per idle moment (`scheduleSearch`, `requestIdleCallback` or a timer), each ordered, planned and placed from the answers through `answersMeasurer` and judged by `branch-search.ts` against the shown picture's own price with its churn against the shown tops; a promising picture has its rows stood on the cards, is measured on the page through `pageMeasurer`, placed and priced exactly; only a strict actual improvement is shown through `showScene`, the same way a render's picture is, moving; the search waits for a move to end and begins afresh on every render; `writeSearch` puts its state on the root (`data-search-status`, `-tried`, `-next`, `-adopted`, `-shown`, `-priced`) and no text announces it. A forced seed searches nothing. `showScene` is the part of a render after the picture is chosen, factored out so that the search's adoption and a render share it.
- Later on 2026-10-07 the root also says the best price the search has found, churn aside (`data-search-best`), and an adopted picture's price as the page measures it becomes the best found as well as the shown price, unless an earlier start priced lower.
- The exploration takes the tuning's `membraneDepth` (2026-10-07), the lab's lever for the membrane rule; at its default of null nothing changes.
- The scene tuning carries the two shape weights, `membraneEvenness` and `rowLevelness`, from the Local Map tuning (2026-10-07).
- Directory disclosure retains the [October 8 design](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#directories-open-and-close-inside-the-local-map-three-states-on-one-scale-recorded-2026-10-08), shown in [that day's pictures](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-08/Screenshots/README.md): a closed box takes a wrapper of the same kind as a card's, by its path, holding `createClosedDirectory`; `dressCards` passes it by. The stage keeps each drawn directory's disclosure, and `fillLabel` refills its retained label with the inspectable name, explicit Open or Close action, More and any hidden-content count. The name and controls share the measured room above the leftmost segment, preserving the owner's concern about unnecessary gaps ([October 7 session, Turn 6](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-07/2026-10-07.1.record.md#turn-6)). Refilling replaces the label's one body action rather than accumulating listeners. Every item's wrapper publishes its column (`data-column`) for the router's bounds, since a closed box has no pin to measure. The earlier name-click-to-open binding belongs to the historical design; names now inspect and the visible Open control changes disclosure.

[The October13 geometry refinement](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-13/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply) keeps all active preferences in the same complete score. Alignment proposals preserve existing flat runs and join one neighboring pair, then regenerate after an accepted picture. Candidate measurements are isolated; a rejected remeasurement restores incumbent rows, widths, labels and pose. Row measurements are taken before animation transforms, use CSS grid tracks rather than protruding glyph rectangles, and preserve the runtime’s exact resolved endpoint identity, including duplicate symbols and asset hubs. Geometry and ordering trial counts are published separately; forced seeds and a disabled continuing search attempt neither kind.
- A card's reveal, "+N symbols", counts the public rows it has folded and not the internals row every card carries, so a file with no public symbols shows no reveal (2026-10-16; found by eye on a reconstruction's cards in [the TH04 probe](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-15/Probes/live-docs-over-th04/README.md), kept by `local-map-directories.spec.ts`).
- `scheduleSearch` schedules a step, and a waiting step runs, only while the map is the view shown and the page visible (`searchAllowed`, 2026-10-16, [the decision](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-local-maps-work-stays-with-the-view-and-the-wires-keep-their-elements-recorded-2026-10-16)): leaving the map pauses the search where it stands and the controller's `show` resumes it, where before the search went on behind another view, its work discarded by the return's render. Kept by `local-map-hidden.spec.ts`.

A card's natural width is read at the browser's 1/64 px unit and taken up to the next whole pixel (`naturalWidthOf`, 2026-10-31), never narrower than the content it holds: `offsetWidth`, rounded to the nearest pixel, gave a card whose path stood 304.08 px wide a 304 px box, and with the seams' `<wbr>` elements each a layout unit wide the path wrapped at a seam, found by the first full gate over the seams ([the work notes of October 31](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-31/2026-10-31.1.record.md#turn-2)).

Since 2026-11-19 a seed's or a join's trial measured on the page keeps the natural widths the search measured last (`tryAdoptPicture`), where every such trial laid the page out at its cards' natural widths to read them again; a cycle's trial, whose cards wear its own feet, still reads them. A natural width depends on what the card holds (its name, the rows it shows and their words, its foot of returning connections), the cap on a card's width and the fonts, which are the system's; within one search the cards change only through a render or `refreshReadingGeometry`, which measure afresh, or a cycle's trial. The suspicion that it also depended on the trial measured before, since the looks `CardReading.measure` leaves on a card (a name cut, a name's held lines, the foot held) are still on it when the next reading of widths sets `max-content`, was refuted on the page: on this repository's five-file scope the 98 cards were read 30 times through the 80-seed search, at the reading look and again with the map zoomed out to the far look (26 of those readings), with those looks present before 986 of the 2,940 readings, and no card's width ever differed between readings, nor from a reading with the looks taken back; the search ended the same, 80 seeds, 231 joins, 29 adoptions, seed 77, 3,197,457, before and after the change ([the measurements](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/map-reds/README.md)).

November 4 adds a disclosure-only geometry transaction over the existing card DOM and frozen row order. It pauses the continuing search, measures new prose, animates height/rows/wires/membranes together and restores the original scene and camera after temporary attention. The displayed placement cost updates with every measured reading scene. Explicit reading rows participate in ordering without being described as pinned relationships. See the [integration record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-04/2026-11-04.1.record.md#turn-2).

Reading measurements keep containers in their existing parents when there is no structural move. Re-appending even the same container blurs a focused descendant in Chromium; avoiding that no-op preserves keyboard reading. Attention to already-open text also pauses further search, without requiring a height change.

On [November 5](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-1) the temporary reading visit left this file with hover reading: the stage's return point, the move's held-element and camera-target overrides and the search's pause on reading attention are gone. `refreshReadingGeometry` keeps one job, remeasuring the same branches after a disclosure change and beginning a fresh competition from the new picture, with the acted-on element held by the ordinary rule. The end of a move also clears the controller's `readingHold`, so a hover that arrives after a tap's move may anchor again.

Since the far bands' round (2026-11-06, [Turn 3](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-06/2026-11-06.1.record.md#turn-3)): a directory label carries its caption in an aria-hidden child, `local-directory-held`, whose `data-held` holds it between left-to-right marks, and its path as its title, for the card ladder's held caption, which is cut at its start so that its last segments and count stay; `roomsOfLabel` measures the label's room at render beside the label heights; `orderRows` tells the card reading how many rows stand above the first pinned one, since the search reorders rows without measuring; and the placement's pins (`anchorCentre`) and the layout search's rows (`rowsOf`) read an anchor dot and a row's children from their boxes as the layout put them, the shift and scale the ladder draws a dot with taken back (`laidOutBox`) and the reading put back on the layout's 1/64 px grid (`onLayoutGrid`), so that a render at any zoom places the cards as a render at reading scale does; a slot card's description slot is hidden rather than taken out below reading scale, so that a row's children are the same in every band. The way there, through the root's reviews of the round: a pin made one press out placed eight cards two or three pixels from where the same pin made at reading scale put them; a repair that read the layout's offsets up to the card's wrapper never took effect, since the wrapper is not among an anchor's offset parents, and every pin was still read from the dot as drawn (112.5 at reading scale, 114.2 one press out); and with the shift taken back, an Internals dot 4292 px down the picture read 4292.4984 for 4292.5, the single-precision noise of a transformed page's boxes, which tipped its half-pixel rounding until the grid removed it. A hub's centring by its own transform is part of where it stands.

Since 2026-11-12 a card's count of connections outside the view, the control that pins the file to reveal them, is drawn as a control (`revealControl`) after a newcomer read the faint line as static text and concluded that the map draws no connections ([the first-visit review](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/first-visit/README.md), finding 3): framed as the directory's Open, by `local.css`, the Pin glyph beside `+21 connections`, its accessible name those words and "outside this view". The root chose the frame over an underlined link the same day, after comparing the two ([the pictures](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/local-map-repairs/README.md)). It keeps the line's box. A pinned file's count of connections hidden by filters stays a plain fact (`hiddenByFilters`).

Since 2026-11-12 the renderer passes Tuning's Opened Directory to the exploration and, where the exploration stands in flow order, asks the scene to stand its columns from the top; a cycle's note counts a pair line by the links it stands for and names its two files, since a pair line names no symbol.

Since 2026-11-13 ([the milestone after Turn 3](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/2026-11-13.1.record.md#turn-3)) a fold or a restore that shortens or lengthens a fixed-slot row goes through `refreshReadingGeometry` without restarting the search: the same scene is laid out again around the acted-on card held still, and the card's height, its rows and its foot (test chips, directory line, counts; `footKeys`) travel together, the foot by its `translate` so that a transform the stylesheet holds it at is kept. Until then a card's foot stood at once where the rows would end and lay over a row still on its way, which the trial of November 10 had shown. The search keeps its progress, but the shown picture is priced again at its new heights (a correction on review, the same day): a search still running would otherwise have judged its next starts against the price of a picture no longer shown, and a shortened card could have let a worse arrangement in.

Since 2026-11-13 ([Turn 8](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/2026-11-13.1.record.md#turn-8)) `refreshReadingGeometry` also serves the overview's files-only trial: a caller may name the element held still (or none, under Fit's own camera move), the move's length, and that the widths measured before stand; a card's width is always measured with its rows laid out, every pin is a node-level hub while files only shows, and the continuing search waits until the rows return.

In the trial's second round (2026-11-14), the way back in from files only grows each card by its rows' grid, clipped below, its foot following in the card's own flow, and keeps the pairs' lines until the move ends; a picture drawn afresh, or laid out again, while files only shows also lays out the picture with its rows once for its size (`rowsPictureOf`), which Fit frames.

Since 2026-11-14 ([Turn 9](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/2026-11-13.1.record.md#turn-9)) `rowsOf`, which caches each card's rows for the search's predictions, reads a row that has a box of its own by that box and only a legacy `display: contents` row through its children. The short row of 2026-11-13 takes its slot out of the layout, so its children no longer filled its 44 px; read through them the row was cached shorter than it stands, every row below it was predicted too high, and the continuing search priced its seeds and alignment trials against pins the page does not have. On the generator's picture no alignment was adopted where the headless command adopts one, which three cases of `local-map-simplicity.spec.ts` showed once the whole browser suite ran. The row's own box is its allotment whatever its children do, so the cache no longer depends on how a row's contents are hidden.

Since 2026-11-15 ([November 15, Turn 1](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)) a drawn directory's label is its handle: one line, a disclosure chevron (down on an opened directory, right on one drawn around what the pins need), the parent's path muted and the directory's own name, then what an encasing directory hides, More and the ancestry control. The chevron and the name are one button, whose press closes or opens the directory and whose focus ring surrounds both; what an encasing directory hides is drawn whole or not at all (`writeCountNeed` reads once what the name and the count need across, and the stylesheet draws the count only where the line's room, written with each pose, holds it); the close cross and the text button "Open" are gone, and the evidence reader is behind More. The label's box is a strip of constant height (`HANDLE_STRIP`), so the page no longer measures a label's text for the layout, and `roomsOfLabel`, which wrote the rooms of a separately held drawing, is deleted: from the middle band out the stylesheet holds the whole line at the file names' size. `applyPose` gives the label its width with each pose: the run of the columns that keep its strip (`stripColumns` of the posed box) whose tops are level (`handleRun`), which outside Flow is the leftmost column.

Since 2026-11-15 ([Turn 1](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)) a card's note on references read back, "N connections return in a cycle", counts the returning references the picture draws at the card, from `returningConnections` with `drawsReference` of [connections.ts](connections.ts.mdmd.md): the same function and the same test the 3D button's number comes from, so the two cannot disagree; the card counts the returns at either of its ends, the button each once. `dressCards` now discloses or hides every card's rows before any card counts, since a return has a row on two cards. A return whose rows the disclosure hides draws no lace and is no longer counted on the card, nor listed in its menu: on branch-renderer.ts opened alone, branch-scene.ts and branches.ts had said 4 where two laces stood, and say 2; the card's "+N symbols" tells the rest until it is shown.

On 2026-11-15 ([November 15, Turn 1](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)) the stage lost its `overlay`: its only use had been to add and remove `moving` on the wires' layer while a move ran, for a stylesheet rule that lightened the wires' drawing then, and the tone round of the same day deleted that rule with the wires' glow.

Since 2026-11-16 ([Turn 5 of the November 15 record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-5)) a cycle's order is a trial of the continuing search. `explorationOf` stands each cycle in the greedy order or in the order this session's search last adopted for it (`cycleMemory`, by the cycle's files and references: a start, not a verdict), and prices nothing before the first draw. The search's `cycleStep` ranks the picture with a cycle in another offered order (`exploreWith`), lays it out in the picture's flow shape from the shown picture's own order, on the cached measurements, and prices it with the two terms a ranking changes (`rankingTerms`), which `searchPrice` adds to every price the search compares; an adopted trial dresses the cards' feet for its returns (`dressReturns`, the feet's part of `dressCards`) before it is measured on the page, and undresses them when the measurement refuses it. With the search off nothing is tried. The cached rows hold the endpoints of the wires the first draw draws; when the search first tries a cycle's order it measures every reference's between two files (`rowsOf` with `everyEndpoint`), a returning one's too, since another order may draw it, so that the first draw reads no endpoint only the search needs (`data-search-endpoints` says which). A trial's prediction stands each card as the trial would dress it (`footedHeights`): a card whose line on returning connections the trial adds, takes away or words anew is as much taller or shorter as that card itself measures, with the page's own element set on it and taken away again (`footChange`). Until 2026-11-17 one foot's room was measured once per search, on the first card without a foot, and used for every card. A foot takes 20 px on some cards and 21 on others; when a new import changed which card came first in `branches.ts`'s own picture, the prediction of its second trial stood 7 px from the layout lab's walk ([the record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#the-direct-measurement-the-round-costs-a-frames-time-with-marbles-off-and-the-four-cases-stood-on-their-limits-already)). Each trial's prices, predicted and, when it went so far, measured, are kept term by term on the root's `data-search-cycle-trials`, which the layout lab's walk is held to. `sceneTuningOf` and `startCostsOf` are the scene's dials and the price's costs from the tuning, shared by the first draw and the search. The adopted picture's `orderScore` is the search's own price, its ranking's terms included, as its prediction `searchPriced` is.

Since 2026-11-16 ([the corrections decided that day](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#work-notes-the-closed-directorys-cells-and-shapes-come-back)) a drawn directory's label is as wide as its handle reaches (`directory-handle.ts`'s `handleReach`): the strip's own columns and, beyond them, the level columns of the membrane in which no card, closed box or inner membrane stands within the strip's height, read from the pose each time it is applied. `writeHandleNeeds` (before, `writeCountNeed`) also writes what the chevron and the directory's own name need across, `--dir-name`, from which the stylesheet brings the held line down in size before the name is cut.

Since 2026-11-18 a drawn directory publishes its inset (`data-inset`, the box's padding and border on each side, in the map's own pixels) beside its segments, so that the browser tests' scenario suite judges every card to stand inside its directory by the padding the map keeps, read from the page, where a test had written 12 px ([the root's ruling on the scenario builder's first handback](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-the-scenario-builders-first-handback)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BranchStage` {#symbol-branchstage}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L41)

##### `BranchStage` — Summary
The branch picture's elements, kept across renders by what each one is: a
card's wrapper by its file, a membrane's section and a lane's spacer by
the pose's box key, a label by its directory. A render builds the cards
afresh for the state it draws, but inside the wrapper that stood for the
file before, so that the picture moves from where it was to where it now
belongs instead of being redrawn (the owner's ask, 2026-10-07). The stage
also carries the continuing search that runs after each picture.

#### `createStage` {#symbol-createstage}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L156)
- Returns: [`BranchStage`](#symbol-branchstage)

##### `createStage` — Summary
A stage for a root that holds nothing yet.

#### `dropStage` {#symbol-dropstage}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L161)
- Parameters: `stage`: [`BranchStage`](#symbol-branchstage)

##### `dropStage` — Summary
Ends whatever move the stage runs, where it stands, and its search; the stage's elements are the caller's to remove.

#### `refreshReadingPresentation` {#symbol-refreshreadingpresentation}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L216)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller); `stage`: [`BranchStage`](#symbol-branchstage)

##### `refreshReadingPresentation` — Summary
Update fixed-slot text and its controls without rebuilding an unchanged scene or restarting its search.

#### `renderBranches` {#symbol-renderbranches}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L338)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller); `stage`: [`BranchStage`](#symbol-branchstage)

##### `renderBranches` — Summary
Render the independently retained branches with the Local Map's cards,
symbol pins and interface colours, placed by the scene of
`branch-scene.ts`: the cards and lanes of every column stand where the
wires between pins are shortest, inside the directory membranes the order
chose, each membrane one segment per column following its members and
drawn as one outline, and each lane as tall as the slots its wires spread.
The exploration is ranked once and ordered from several starts (the
ranking's order, the previous picture's, and seeded shuffles, as
`branch-restarts.ts` names them); each start is measured on the page's
own cards and placed exactly, and the cheapest picture is drawn. This
module builds the cards once, measures them for every start, then builds
the chosen scene's sections and lanes and applies the layout; the elements
keep the names the router, the deck and the perspective transition read.
When the stage already shows a picture, the new one is not applied at once:
every element the two share slides from its old place to its new over the
tuning's move length, the rows of a card with them, what is new fades in
and what is gone fades out, the wires are redrawn every frame, and the card
the person last interacted with is held still on screen by the camera.
After the picture is drawn, the continuing search alternates ordering
starts and boundary joins in idle moments, moving to a better picture.
The layout's dials come from the Local Map's tuning.

#### `refreshReadingGeometry` {#symbol-refreshreadinggeometry}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L537)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller); `stage`: [`BranchStage`](#symbol-branchstage)

##### `refreshReadingGeometry` — Summary
Remeasure an existing scene after a disclosure change without rebuilding cards or changing row order: the zoom
fold or restore, a resize, or an arrival that unfolds. The opened or folded text changes card heights, so the
same branches are laid out again and moved to with the acted-on element held still, and a fresh measured
competition begins from the new picture.

#### `BAND_BORDER` {#symbol-band_border}
- Type: unknown
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L620)

#### `syncHandleParents` {#symbol-synchandleparents}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L829)
- Parameters: `stage`: [`BranchStage`](#symbol-branchstage)

##### `syncHandleParents` — Summary
Re-fit every directory handle's segment-aware parent path after a zoom look or LOD scale change.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.LocalMapTuning`](../../types.ts.mdmd.md#symbol-localmaptuning) (type-only)
- [`branch-alignments.alignmentCandidates`](./branch-alignments.ts.mdmd.md#symbol-alignmentcandidates)
- [`branch-motion.Pose`](./branch-motion.ts.mdmd.md#symbol-pose) (type-only)
- [`branch-motion.boxKeyOf`](./branch-motion.ts.mdmd.md#symbol-boxkeyof)
- [`branch-motion.easeInOutCubic`](./branch-motion.ts.mdmd.md#symbol-easeinoutcubic)
- [`branch-motion.scenePose`](./branch-motion.ts.mdmd.md#symbol-scenepose)
- [`branch-motion.tweenPose`](./branch-motion.ts.mdmd.md#symbol-tweenpose)
- [`branch-placement.BoundaryAlignment`](./branch-placement.ts.mdmd.md#symbol-boundaryalignment) (type-only)
- [`branch-restarts.StartCosts`](./branch-restarts.ts.mdmd.md#symbol-startcosts) (type-only)
- [`branch-restarts.StartSignals`](./branch-restarts.ts.mdmd.md#symbol-startsignals) (type-only)
- [`branch-restarts.candidateStarts`](./branch-restarts.ts.mdmd.md#symbol-candidatestarts)
- [`branch-restarts.layoutStarts`](./branch-restarts.ts.mdmd.md#symbol-layoutstarts)
- [`branch-restarts.pictureScore`](./branch-restarts.ts.mdmd.md#symbol-picturescore)
- [`branch-restarts.scoreOf`](./branch-restarts.ts.mdmd.md#symbol-scoreof)
- [`branch-restarts.signalsOf`](./branch-restarts.ts.mdmd.md#symbol-signalsof)
- [`branch-restarts.startName`](./branch-restarts.ts.mdmd.md#symbol-startname)
- [`branch-restarts.startOrder`](./branch-restarts.ts.mdmd.md#symbol-startorder)
- [`branch-scene.BAND_BORDER`](./branch-scene.ts.mdmd.md#symbol-band_border)
- [`branch-scene.Scene`](./branch-scene.ts.mdmd.md#symbol-scene) (type-only)
- [`branch-scene.SceneBox`](./branch-scene.ts.mdmd.md#symbol-scenebox) (type-only)
- [`branch-scene.SceneMeasurer`](./branch-scene.ts.mdmd.md#symbol-scenemeasurer) (type-only)
- [`branch-scene.ScenePlan`](./branch-scene.ts.mdmd.md#symbol-sceneplan) (type-only)
- [`branch-scene.SceneTuning`](./branch-scene.ts.mdmd.md#symbol-scenetuning) (type-only)
- [`branch-scene.hostOf`](./branch-scene.ts.mdmd.md#symbol-hostof)
- [`branch-scene.layoutScene`](./branch-scene.ts.mdmd.md#symbol-layoutscene)
- [`branch-scene.planBranches`](./branch-scene.ts.mdmd.md#symbol-planbranches)
- [`branch-search.CardRows`](./branch-search.ts.mdmd.md#symbol-cardrows) (type-only)
- [`branch-search.ResolvedPin`](./branch-search.ts.mdmd.md#symbol-resolvedpin) (type-only)
- [`branch-search.RowMeasure`](./branch-search.ts.mdmd.md#symbol-rowmeasure) (type-only)
- [`branch-search.SearchState`](./branch-search.ts.mdmd.md#symbol-searchstate) (type-only)
- [`branch-search.beginSearch`](./branch-search.ts.mdmd.md#symbol-beginsearch)
- [`branch-search.endpointKey`](./branch-search.ts.mdmd.md#symbol-endpointkey)
- [`branch-search.judgeAlignment`](./branch-search.ts.mdmd.md#symbol-judgealignment)
- [`branch-search.judgeStart`](./branch-search.ts.mdmd.md#symbol-judgestart)
- [`branch-search.nextTrialKind`](./branch-search.ts.mdmd.md#symbol-nexttrialkind)
- [`branch-search.pinFor`](./branch-search.ts.mdmd.md#symbol-pinfor)
- [`branch-search.rowBounds`](./branch-search.ts.mdmd.md#symbol-rowbounds)
- [`branches.BranchGraph`](./branches.ts.mdmd.md#symbol-branchgraph) (type-only)
- [`branches.DirectoryDisclosure`](./branches.ts.mdmd.md#symbol-directorydisclosure) (type-only)
- [`branches.Exploration`](./branches.ts.mdmd.md#symbol-exploration) (type-only)
- [`branches.arrangeExploration`](./branches.ts.mdmd.md#symbol-arrangeexploration)
- [`branches.edgeKey`](./branches.ts.mdmd.md#symbol-edgekey)
- [`branches.exploreBranches`](./branches.ts.mdmd.md#symbol-explorebranches)
- [`branches.isClosedDirectory`](./branches.ts.mdmd.md#symbol-iscloseddirectory)
- [`branches.orderExploration`](./branches.ts.mdmd.md#symbol-orderexploration)
- [`card-factory.PIN_GLYPH`](./card-factory.ts.mdmd.md#symbol-pin_glyph)
- [`card-factory.countsOf`](./card-factory.ts.mdmd.md#symbol-countsof)
- [`card-factory.createClosedDirectory`](./card-factory.ts.mdmd.md#symbol-createcloseddirectory)
- [`card-factory.createHiddenCells`](./card-factory.ts.mdmd.md#symbol-createhiddencells)
- [`card-factory.createHiddenField`](./card-factory.ts.mdmd.md#symbol-createhiddenfield)
- [`card-factory.createNodeCard`](./card-factory.ts.mdmd.md#symbol-createnodecard)
- [`card-factory.hasCloseAction`](./card-factory.ts.mdmd.md#symbol-hascloseaction)
- [`card-reading.markFirstPin`](./card-reading.ts.mdmd.md#symbol-markfirstpin)
- [`connections.drawsReference`](./connections.ts.mdmd.md#symbol-drawsreference)
- [`controller.LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller) (type-only)
- [`cycle-trials.CycleTrial`](./cycle-trials.ts.mdmd.md#symbol-cycletrial) (type-only)
- [`cycle-trials.cycleOrdersOf`](./cycle-trials.ts.mdmd.md#symbol-cycleordersof)
- [`cycle-trials.horizontalWire`](./cycle-trials.ts.mdmd.md#symbol-horizontalwire)
- [`cycle-trials.nextCycleTrial`](./cycle-trials.ts.mdmd.md#symbol-nextcycletrial)
- [`cycle-trials.returningLinks`](./cycle-trials.ts.mdmd.md#symbol-returninglinks)
- [`cycle-trials.standingOrders`](./cycle-trials.ts.mdmd.md#symbol-standingorders)
- [`directory-ancestry.ancestryButton`](./directory-ancestry.ts.mdmd.md#symbol-ancestrybutton)
- [`directory-flow.FlowShape`](./directory-flow.ts.mdmd.md#symbol-flowshape) (type-only)
- [`directory-flow.NARROW_SHAPE`](./directory-flow.ts.mdmd.md#symbol-narrow_shape)
- [`directory-flow.ShapeSearch`](./directory-flow.ts.mdmd.md#symbol-shapesearch) (type-only)
- [`directory-flow.isPairLine`](./directory-flow.ts.mdmd.md#symbol-ispairline)
- [`directory-flow.nominalMeasurer`](./directory-flow.ts.mdmd.md#symbol-nominalmeasurer)
- [`directory-flow.searchFlowShape`](./directory-flow.ts.mdmd.md#symbol-searchflowshape)
- [`directory-flow.shapeRecord`](./directory-flow.ts.mdmd.md#symbol-shaperecord)
- [`directory-handle.HANDLE_AIR`](./directory-handle.ts.mdmd.md#symbol-handle_air)
- [`directory-handle.HANDLE_FLOOR`](./directory-handle.ts.mdmd.md#symbol-handle_floor)
- [`directory-handle.HANDLE_HOLD`](./directory-handle.ts.mdmd.md#symbol-handle_hold)
- [`directory-handle.HANDLE_INDENT`](./directory-handle.ts.mdmd.md#symbol-handle_indent)
- [`directory-handle.HANDLE_LINE`](./directory-handle.ts.mdmd.md#symbol-handle_line)
- [`directory-handle.HANDLE_STRIP`](./directory-handle.ts.mdmd.md#symbol-handle_strip)
- [`directory-handle.Standing`](./directory-handle.ts.mdmd.md#symbol-standing) (type-only)
- [`directory-handle.chevronMarkup`](./directory-handle.ts.mdmd.md#symbol-chevronmarkup)
- [`directory-handle.fitParentPath`](./directory-handle.ts.mdmd.md#symbol-fitparentpath)
- [`directory-handle.handleParts`](./directory-handle.ts.mdmd.md#symbol-handleparts)
- [`directory-handle.handleReach`](./directory-handle.ts.mdmd.md#symbol-handlereach)
- [`ladder-rooms.layoutTopOf`](./ladder-rooms.ts.mdmd.md#symbol-layouttopof)
- [`membrane-outline.membranePath`](./membrane-outline.ts.mdmd.md#symbol-membranepath)
- [`overview-files.OVERVIEW_FILES_ATTRIBUTE`](./overview-files.ts.mdmd.md#symbol-overview_files_attribute)
- [`overview-files.OVERVIEW_LINES_ATTRIBUTE`](./overview-files.ts.mdmd.md#symbol-overview_lines_attribute)
- [`overview-files.PictureSize`](./overview-files.ts.mdmd.md#symbol-picturesize) (type-only)
- [`returning-connections.connectionCount`](./returning-connections.ts.mdmd.md#symbol-connectioncount)
- [`returning-connections.returningConnections`](./returning-connections.ts.mdmd.md#symbol-returningconnections-function)
- [`symbol-highlight.attendConnections`](./symbol-highlight.ts.mdmd.md#symbol-attendconnections)
- [`symbol-highlight.releaseConnections`](./symbol-highlight.ts.mdmd.md#symbol-releaseconnections)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`unconnected-symbols.unconnectedRow`](./unconnected-symbols.ts.mdmd.md#symbol-unconnectedrow-function)
- [`unconnected-symbols.unconnectedSymbols`](./unconnected-symbols.ts.mdmd.md#symbol-unconnectedsymbols)
- [`wire-gathering.NODE_HUB`](./wire-gathering.ts.mdmd.md#symbol-node_hub)
- [`wire-gathering.hubLine`](./wire-gathering.ts.mdmd.md#symbol-hubline)
- [`word-seams.countOf`](./word-seams.ts.mdmd.md#symbol-countof)
- [`pin-state.EMPTY_PIN_SET`](../pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.isSymbolPinned`](../pin-state.ts.mdmd.md#symbol-issymbolpinned)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
- [`types.ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
