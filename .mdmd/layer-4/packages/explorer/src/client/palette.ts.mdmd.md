# packages/explorer/src/client/palette.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/palette.ts
- Generated At: 2026-11-19T01:24:59.504Z

## Authored
### Purpose
Holds every colour the Explorer draws in one typed table, keyed by what each colour means: the ground and its surfaces, lines, the tones of text, what is selected, a connection's two roles (offers, uses), a file's kinds, has-tests, a file changed in the commit shown, the signals, links, the 3D scene and the World Map in its light and dark forms. The build writes the default palette as the custom properties every stylesheet reads; the page applies a palette by name at startup; the 3D map, the 2D wires, the World Map and the transition read it directly. Pure: no DOM.

### Notes
Made in the [November 16 colour pass](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-1), after the owner asked which colours the app uses and what they mean, and from their words of 2025-12-06: "CSS styles declare colors without relying on a common set of theme colors with specific color semantic _meanings_, even though we actually do have a robust system of meaning based on color!". The [colour pass's inventory](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/Probes/colour-pass/inventory.md) maps every value here to where it was drawn before; the table replaced the theme stylesheet's literals, the 3D map's `SPATIAL_NODE_STYLES`, the shader's constants and the hard-coded wire colours of the 2D map and the World Map, with today's picture unchanged. `secondValues` holds the places where today draws one meaning in a second colour a person can tell apart (the offering pin's blue beside the offering wire's, among others); a palette that draws each meaning once deletes it. Every value is opaque; opacity is derived where a colour is drawn (`rgba` here; in a stylesheet `rgba(var(--meaning-rgb), alpha)`, from the channels the build writes beside each colour, so that the browser computes, serialises and animates every colour as the legacy `rgba` it was: `color-mix` was tried first and changed how a colour is serialised and interpolated, which the browser specs' colour reader and an animation's mid-frames showed). The palette's name is a viewer's saved setting (`appearance.palette`), not carried in a shared link; whether a link should carry it is a question put to the owner.

Since [Turns 4 and 5 of the November 16 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-4) a second palette, `proposed`, stands beside Today: root's measured design, in which blue and green belong to the two roles alone, the kinds move off them, what is selected is neutral and every second value equals its meaning, and each World form draws its doors and wires in its own blue and green (`secondValues.world…Wire…`). The owner chose to see it in the software itself, switchable in place: "the user needs to see what their changes did in the application itself, immediately." `choosePalette` tells the views that drew a colour themselves (`whenPaletteChanges`), so that a choice in Tuning re-colours the page at once with nothing moving. What makes a palette valid is a unit test beside it, which Today fails as a stated fact.

A third palette, `vividKinds` ("Vivid kinds" in Tuning), follows from [Turns 7 to 9 of the same record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-8). It is the owner's lean toward "mild color meaning collision", made valid: implementation and test stay near today's blue and green, and the two roles step lighter, so that every pair passes the validity test with no value adjusted. A test file's kind label is the test kind's green; the 2D has-tests mark stays violet. The same turns asked for the marble, and whether files are drawn as marbles (`marblesDrawn`, set by `chooseMarbles`) lives here beside the palette in force. Switching it tells the same listeners, so the views draw again at once, as for a palette, with nothing moving.

Since 2026-11-19 Today draws three quiet tones of text at the proposed palette's values: `muted` `#939393`, `subtle` `#8a8a8a`, `panelSubtle` `#828a9a`. As drawn before (`#888888`, `#777777`, `#6c7484`) they stood at 4.42, 3.50 and 3.34 to 1 on a card, under the 4.5 WCAG asks of words, and `subtle` and `panelSubtle` failed on every ground. This was a finding of the design system's audit ([Turn 14 of the November 18 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-14)), and the owner's remark of [Turn 20](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-20), "Dim things are still a bit hard to read." No other colour of Today moved; which palette is the default stays the owner's choice. The same day Proposed and Vivid kinds set `errorWash` and `pathFoundWash` to `signal.error` and `signal.pathFound`, which they had kept at Today's values against their own comment. The light World's pressed tool became its form's blue at 16% over the white board, drawn from its meaning as the dark World's is. The comment now says so rather than claiming every second value equals its meaning. See [the pictures and measures](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/shell-accessibility/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Colour` {#symbol-colour}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L17)

##### `Colour` — Summary
A colour, `#rrggbb`.

#### `WorldTints` {#symbol-worldtints}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L20)

##### `WorldTints` — Summary
The tints a World Map region may wear, by the names a board's legend gives them.

#### `WorldForm` {#symbol-worldform}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L30)

##### `WorldForm` — Summary
The World Map in one of its two forms, the white board or the dark one.

#### `Palette` {#symbol-palette}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L66)

##### `Palette` — Summary
One palette: every meaning the Explorer draws in colour.

#### `TODAY` {#symbol-today}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L238)
- Returns: [`Palette`](#symbol-palette)

##### `TODAY` — Summary
The palette drawn until the colour pass: every value as the Explorer drew it on 2026-11-16, but for three quiet
tones of text (muted, subtle, panelSubtle), which take the proposed palette's values (2026-11-19, the design
system's audit): as drawn before they stood at 4.42, 3.50 and 3.34 to 1 on a card, under the 4.5 WCAG asks of words.

#### `PROPOSED` {#symbol-proposed}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L303)
- Returns: [`Palette`](#symbol-palette)

##### `PROPOSED` — Summary
The palette proposed in the colour pass (2026-11-16, root's design, measured): one hue for one meaning in every view.
Blue and green stay with the two roles and nothing else wears them; the kinds move off them (implementation, the
common case, goes quiet; a test file takes the violet the 2D cards already use for having tests; a document leaves
violet for a paper yellow); what is selected is neutral, so the interface wears no data colour; three quiet tones of
text were lifted to 4.5:1 on a card (today's palette has taken them since 2026-11-19); the type badges keep only the
plain badge's look, since each tells its role by its icon and rose and amber now belong to the asset and the
directory. Every second value equals its meaning, but for the light World's pressed tool, which is drawn from its
meaning as the dark World draws its own: the light form's blue at 16% over its white board. Each World form draws
its doors and its wires in its own blue and green.

#### `VIVID_KINDS` {#symbol-vivid_kinds}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L330)
- Returns: [`Palette`](#symbol-palette)

##### `VIVID_KINDS` — Summary
The proposed palette with the kinds kept near today's blue and green (the owner's earlier lean, made valid by root's
measurement, 2026-11-17): implementation and test near today's colours, the two roles a step lighter so that every
identity still stands apart, and every second value equal to its meaning as in the proposed palette. A test file's
kind label in the details panel is the test kind's green, as the test sphere is; a 2D card that tests use keeps the
has-tests violet.

#### `PALETTES` {#symbol-palettes}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L342)

##### `PALETTES` — Summary
The palettes a viewer may choose, by name.

#### `PaletteName` {#symbol-palettename}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L345)

##### `PaletteName` — Summary
A palette's name.

#### `DEFAULT_PALETTE` {#symbol-default_palette}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L348)
- Returns: [`PaletteName`](#symbol-palettename)

##### `DEFAULT_PALETTE` — Summary
The palette drawn when none is chosen.

#### `isPaletteName` {#symbol-ispalettename}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L351)

##### `isPaletteName` — Summary
Whether a saved name is a palette's.

#### `MASK_KEEP` {#symbol-mask_keep}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L354)
- Returns: [`Colour`](#symbol-colour)

##### `MASK_KEEP` — Summary
A cell mask's luminance where the cells stay drawn: not a colour a person sees, and fixed in every palette.

#### `MASK_FADE` {#symbol-mask_fade}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L356)
- Returns: [`Colour`](#symbol-colour)

##### `MASK_FADE` — Summary
A cell mask's luminance where the cells fade, at a field's end.

#### `MarblePattern (type)` {#symbol-marblepattern-type}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L367)

##### `MarblePattern (type)` — Summary
How a marble's veins wind (a trial, 2026-11-18, the owner's wish that "Minor changes to files produce subtle shifts on
the surface of these little marble planets. Massive changes to files completely changes their patterns"): one pattern
for every file, turned by its path, the default; or bent by a sketch of what its Live Doc lists (views/marbleSketch.ts),
its axis kept by its path. The shares of blue, green and clear glass stay. A third choice, the axis from the sketch
too, was tried the same night and dropped: across files it looked no more varied than the second.

#### `DEFAULT_MARBLE_BEND` {#symbol-default_marble_bend}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L370)

##### `DEFAULT_MARBLE_BEND` — Summary
How far the veins bend from a file's doc at a sketch of unit length, in vanes' periods, until a viewer moves Vein Bend.

#### `activePalette` {#symbol-activepalette}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L376)

##### `activePalette` — Summary
The palette in force.

#### `marblesDrawn` {#symbol-marblesdrawn}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L383)

##### `marblesDrawn` — Summary
Whether files are drawn as marbles (the marble trial, 2026-11-17): each file's colour its kind's glass with veins of
what it offers and what it uses (`marbleOf` in views/forceGraphAppearance.ts). Off until the page applies the
viewer's choice as it starts, which is on unless they turned it off (the default since 2026-11-18).

#### `marblePattern (const)` {#symbol-marblepattern-const}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L389)

##### `marblePattern (const)` — Summary
How the marbles' veins wind (the pattern trial, 2026-11-18): one pattern for every file, turned by its path; or bent by
a sketch of what its Live Doc lists (`doc`).

#### `marbleBend` {#symbol-marblebend}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L392)

##### `marbleBend` — Summary
How far the veins bend from a file's doc (Vein Bend, 2026-11-19), 0 to 1.

#### `paletteNamed` {#symbol-palettenamed}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L395)

##### `paletteNamed` — Summary
A palette by name, the default for a name no palette has.

#### `whenPaletteChanges` {#symbol-whenpalettechanges}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L403)
- Parameters: `palette`: [`Palette`](#symbol-palette)

##### `whenPaletteChanges` — Summary
Calls `listener` each time another palette is put in force, the marbles are turned on or off or their pattern changes, so that what a script
drew is drawn again as it now should be; returns the unsubscription.

#### `choosePalette` {#symbol-choosepalette}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L409)
- Returns: [`Palette`](#symbol-palette)

##### `choosePalette` — Summary
Puts a palette in force by name, the default for a name no palette has, tells whoever listens if it changed, and returns it.

#### `chooseMarbles` {#symbol-choosemarbles}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L418)

##### `chooseMarbles` — Summary
Turns the marbles on or off, and tells whoever listens to the palette if that changed: the same redraw, nothing moving.

#### `chooseMarblePattern` {#symbol-choosemarblepattern}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L425)
- Parameters: `chosen`: [`MarblePattern`](#symbol-marblepattern-type)

##### `chooseMarblePattern` — Summary
Chooses how the marbles' veins wind, and tells whoever listens to the palette if that changed: the same redraw, nothing moving.

#### `chooseMarbleBend` {#symbol-choosemarblebend}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L432)

##### `chooseMarbleBend` — Summary
Sets how far the veins bend from a file's doc, held to 0 to 1, and tells whoever listens to the palette if that changed.

#### `channels` {#symbol-channels}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L440)

##### `channels` — Summary
A colour's channels, 0 to 255.

#### `rgba` {#symbol-rgba}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L447)

##### `rgba` — Summary
A colour at an opacity, as `rgba(r, g, b, alpha)`, the alpha written as given.

#### `unitChannels` {#symbol-unitchannels}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L453)

##### `unitChannels` — Summary
A colour's channels, 0 to 1, for a shader.

#### `mix` {#symbol-mix}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L456)

##### `mix` — Summary
A colour between two, `t` of the way from `a` to `b`, each channel rounded, as `rgb(r,g,b)`.

#### `customProperties` {#symbol-customproperties}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L469)
- Parameters: `palette`: [`Palette`](#symbol-palette)

##### `customProperties` — Summary
A palette as the stylesheets read it: one custom property for each meaning, named by its place in the table
(`ground.cardHover` is `--ground-card-hover`, `world.dark.tints.blue` is `--world-dark-tints-blue`), and beside it
its channels (`--ground-card-hover-rgb: 47, 47, 51`), from which a stylesheet draws the colour at an opacity as
`rgba(var(--ground-card-hover-rgb), 0.5)`: a colour the browser keeps, computes and animates as it always has.

#### `paletteStylesheet` {#symbol-palettestylesheet}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L483)
- Parameters: `palette`: [`Palette`](#symbol-palette)

##### `paletteStylesheet` — Summary
The stylesheet that sets a palette's custom properties on the page's root: the build writes the default's.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-2/design-system/visual-foundations.mdmd.md`](../../../../../layer-2/design-system/visual-foundations.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
