# packages/explorer/src/client/styles/local.css

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/styles/local.css
- Generated At: 2026-09-27T23:21:27.560Z

## Authored
### Purpose

Styles specific to the Local Map view: the placed cards, directory membranes and explicit perspective controls, symbol-row hover states, and connection anchor geometry that enables the directional blue-to-green connector routing.

### Notes

- Extracted from monolithic `styles.css` on [2025-12-04](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/12/Summarized/2025-12-04.SUMMARIZED.md) (Turn 19) as part of the CSS decomposition (`4504d36a`).
- The 3-column local layout with per-symbol rail ordering was first implemented on [2025-11-24](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/11/Summarized/2025-11-24.SUMMARIZED.md) (Turns 15–17) and later extended to support multi-hop pathfinding columns.
- The many-file layout's rules sit at the end: directory bands as subgrids with their lanes (`.local-pass-through`) as plain spacers the router measures, a back reference's route hidden until highlighted, and a bundle's shared run (`.bundle-run`) drawn beneath its wires at reduced opacity so the wires stay the thing read (2026-10-05). The placed layout (`.local-placed`, the same day) turns the grid into a block in which every membrane, card and lane is absolutely positioned from the placement. Since 2026-10-06 a directory's element (`.local-directory-band`) is the bounds of its membrane, drawn as nothing, and `.local-membrane` inside it is the outline, one segment per column joined through the gutters, beneath the cards; the padding between the outline and its members and the stroke are numbers the renderer lays out, not CSS.
- `.connections-layer.moving .connection-path { filter: none }` (2026-10-07): while the branch picture moves, the wires are redrawn every frame and go without their glow, whose drop-shadow filters cost more than the rest of a frame together (six frames a second with them, sixty without, measured headless on 31 cards and 172 wires); the glow returns at rest.
- A bundle's shared run dims under a hover since 2026-10-07. Its own opacity rule, written after the hover's dimming rule at equal specificity, had outranked it, so the runs stood out as the thick bright lines of a picture otherwise dimmed; the owner reported it from the hosted build ([Turn 4 of the October 7 session](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-07/2026-10-07.1.record.md#turn-4)), and a rule of higher specificity now dims the run with the wires it carries.
- `.local-file-recentre` (2026-10-15, [Turn 10](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-14/2026-10-14.1.record.md#turn-10)): the card's recentre control in the close button's style, 20 px each, in the close's corner when the card has no close and beside it when it does. The title's right padding is the same on every card, room for both, since the layout lab lays the title out with one padding constant read from the page; a padding that varied by card made a 212 px card's title wrap and the lab's model drift by one line.
- A membrane's label is one text flow since 2026-10-08: the name (which opens the directory while it is encasing), then the count of what it hides or the X that closes it, inline, so that the label wraps as the one text the layout lab models from its capture; and `.local-directory-closed` is a closed directory's box, in the membrane's style with a second outline behind it saying it holds more (../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-08/Screenshots/README.md).

`--history-room` on `#main` (2026-10-18, the plan's C4) lifts the perspective controls and the pin tray above the open history scrubber by its height; `.pin-tray-absent` is the faint word beneath a pin that does not stand at the moment shown.

Two rules that moved the perspective controls and the pin tray aside when the detail panel was open (`#detail-panel.visible ~ .perspective-controls`, `~ .pin-tray`) were deleted on 2026-10-18: the panel is a child of the views container and the controls and the tray are children of its parent, so the sibling selectors never matched, which the C4 builder noticed while placing the history scrubber.

The pin tray’s transparent positioning wrapper does not receive pointer input; its panel and toggle do. This keeps the adjacent representation/history controls usable when the tray expands above its narrower toggle. The 3D toolbar’s hop selector has the same readable size and focus outline as its buttons.

The card's title button is `.local-file-name` since [November 5](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-1), when a file's name began to open its descriptions rather than inspect; the rule is otherwise the one that dressed `.local-file-inspect`.

Since [Turn 12](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-12--november-6) the map's viewport is a compositor layer (`will-change: transform`), so that a zoom or a pan is one transform of a rastered layer rather than a repaint of every card and wire on the main thread.

Since 2026-11-06 ([Turns 17 to 19](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-17--november-6)) `#map-viewport` is a compositor layer only while the camera moves (`.camera-moving`, set by the controller): kept always, as Turn 12 made it, the layer was rastered once and stretched by the GPU, the blur close up and the aliasing far out the owner showed.

Since the far bands' round (2026-11-06, [Turn 3](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-06/2026-11-06.1.record.md#turn-3)) a directory label holds its caption from the middle band out: the caption in the layout keeps the label's height and turns transparent, its name still taking the keyboard, and the generated content of an aria-hidden child, `local-directory-held`, draws the caption on one line at the controller's held scale (first the label's own generated content, with an alternative text of "", which browsers before Firefox 128 and Safari 17.4 reject as a whole declaration; moved to the child in the root's fourth review), bounded by the label's height below the caption and its width beside the label's buttons (across the whole label once they leave at the far band), right to left so that a cut falls at its start and keeps the last segments and the count of what is not drawn.

Since the far bands' second milestone (2026-11-06) a node-level hub is drawn only where a wire of the band shown ends on it, which the wires' drawing marks (`hub-ends-wire`), and the legend's row for the wires' width ("Width: references" then, *References* since 2026-11-16) is shown only while the map shows the overview band, by the map's `data-lod`.

The Closed Directory trial's three looks (2026-11-13) are drawn here, beside the box's own rules, in neutral hues only ([Turn 7 of the November 13 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/2026-11-13.1.record.md#turn-7)).

Since 2026-11-15 ([November 15, Turn 1](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)) the directory's label is drawn here as its handle: one line laid out at its own size in the strip's width divided by the held scale and drawn scaled from its top left, so its chevron, name and More are held together at the file names' size from the middle band out and nothing is measured for it; the parent's path is cut first and from its start, the count of what is hidden goes next and whole (the button's line wraps, and only its first row shows), and the directory's own name is cut last, in the tone round's `--card-file-name`. Only the line's parts take the pointer, so the empty strip beside them still pans the map; the button's pressable area is padded to the strip's whole height over its own width. The closed box's name gains its chevron, and the focus ring of its handle is drawn around the whole box, which is what a press opens.

The 3D button's cue (2026-11-15, [Turn 1](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)): `has-backward-wires` gives the button an amber border, an amber label and a soft glow through `--backward-glow`; `[data-backward="many"]` deepens the glow and tints the face; `.backward-rising` plays one 1.8 s swell of the glow, none under `prefers-reduced-motion`. Amber is neither the pressed blue nor the focus ring's. The rule of 2026-11-02, an amber border and a 2 px ring at a fifth of its strength, was too faint to be called a glow.

The tone round of 2026-11-15 ([Turn 1 of that day's record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)): a hover boosts nothing. A hovered symbol's wires had been drawn whole, at 1 where a wire at rest is 0.7; the dimming rule now leaves them alone, as Flow's hover always left a hovered card's lines, and only fades the others (the owner's rule since December 2025, to fade the irrelevant rather than boost the relevant). With no wire glowing, the rule that took the glow from the wires while the picture moves went; `branch-renderer.ts` still sets `moving` on the wires' layer, which nothing reads now. A symbol's name takes the theme's `--card-symbol-name`, and an opened directory's outline its `--membrane-outline`, where the page's default border on the map's surface could hardly be seen.

Since 2026-11-15's second milestone ([November 15, Turn 1](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)) the skin with cells is drawn in three shapes, the folder's tab by an outline of its own with the skin's light clipped to it, a cell takes the fill written on it for its file's kind unless one grey is chosen, and the folded membrane's rules are deleted.

Since 2026-11-16 ([Turn 10 of the November 15 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-10)) `#local-legend-kinds`, the 2D legend's kinds row, is not drawn while it is empty, which it is whenever no closed directory's coloured cell is on screen, and its samples are drawn as the cells are, at a cell's fill and stroke strengths.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
