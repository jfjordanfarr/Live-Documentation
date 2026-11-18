# packages/explorer/src/client/palette.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/palette.ts
- Generated At: 2026-11-18T22:10:29.371Z

## Authored
### Purpose
Holds every colour the Explorer draws in one typed table, keyed by what each colour means: the ground and its surfaces, lines, the tones of text, what is selected, a connection's two roles (offers, uses), a file's kinds, has-tests, a file changed in the commit shown, the signals, links, the 3D scene and the World Map in its light and dark forms. The build writes the default palette as the custom properties every stylesheet reads; the page applies a palette by name at startup; the 3D map, the 2D wires, the World Map and the transition read it directly. Pure: no DOM.

### Notes
Made in the [November 16 colour pass](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-1), after the owner asked which colours the app uses and what they mean, and from their words of 2025-12-06: "CSS styles declare colors without relying on a common set of theme colors with specific color semantic _meanings_, even though we actually do have a robust system of meaning based on color!". The [colour pass's inventory](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/Probes/colour-pass/inventory.md) maps every value here to where it was drawn before; the table replaced the theme stylesheet's literals, the 3D map's `SPATIAL_NODE_STYLES`, the shader's constants and the hard-coded wire colours of the 2D map and the World Map, with today's picture unchanged. `secondValues` holds the places where today draws one meaning in a second colour a person can tell apart (the offering pin's blue beside the offering wire's, among others); a palette that draws each meaning once deletes it. Every value is opaque; opacity is derived where a colour is drawn (`rgba` here; in a stylesheet `rgba(var(--meaning-rgb), alpha)`, from the channels the build writes beside each colour, so that the browser computes, serialises and animates every colour as the legacy `rgba` it was: `color-mix` was tried first and changed how a colour is serialised and interpolated, which the browser specs' colour reader and an animation's mid-frames showed). The palette's name is a viewer's saved setting (`appearance.palette`), not carried in a shared link; whether a link should carry it is a question put to the owner.

Since [Turns 4 and 5 of the November 16 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-4) a second palette, `proposed`, stands beside Today: root's measured design, in which blue and green belong to the two roles alone, the kinds move off them, what is selected is neutral and every second value equals its meaning, and each World form draws its doors and wires in its own blue and green (`secondValues.world…Wire…`). The owner chose to see it in the software itself, switchable in place: "the user needs to see what their changes did in the application itself, immediately." `choosePalette` tells the views that drew a colour themselves (`whenPaletteChanges`), so that a choice in Tuning re-colours the page at once with nothing moving. What makes a palette valid is a unit test beside it, which Today fails as a stated fact.

A third palette, `vividKinds` ("Vivid kinds" in Tuning), follows from [Turns 7 to 9 of the same record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-8). It is the owner's lean toward "mild color meaning collision", made valid: implementation and test stay near today's blue and green, and the two roles step lighter, so that every pair passes the validity test with no value adjusted. A test file's kind label is the test kind's green; the 2D has-tests mark stays violet. The same turns asked for the marble, and whether files are drawn as marbles (`marblesDrawn`, set by `chooseMarbles`) lives here beside the palette in force. Switching it tells the same listeners, so the views draw again at once, as for a palette, with nothing moving.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Colour` {#symbol-colour}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L16)

##### `Colour` — Summary
A colour, `#rrggbb`.

#### `WorldTints` {#symbol-worldtints}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L19)

##### `WorldTints` — Summary
The tints a World Map region may wear, by the names a board's legend gives them.

#### `WorldForm` {#symbol-worldform}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L29)

##### `WorldForm` — Summary
The World Map in one of its two forms, the white board or the dark one.

#### `Palette` {#symbol-palette}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L65)

##### `Palette` — Summary
One palette: every meaning the Explorer draws in colour.

#### `TODAY` {#symbol-today}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L233)
- Returns: [`Palette`](#symbol-palette)

##### `TODAY` — Summary
The palette drawn until the colour pass: every value as the Explorer drew it on 2026-11-16.

#### `PROPOSED` {#symbol-proposed}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L296)
- Returns: [`Palette`](#symbol-palette)

##### `PROPOSED` — Summary
The palette proposed in the colour pass (2026-11-16, root's design, measured): one hue for one meaning in every view.
Blue and green stay with the two roles and nothing else wears them; the kinds move off them (implementation, the
common case, goes quiet; a test file takes the violet the 2D cards already use for having tests; a document leaves
violet for a paper yellow); what is selected is neutral, so the interface wears no data colour; three quiet tones of
text are lifted to 4.5:1 on a card; the type badges keep only the plain badge's look, since each tells its role by
its icon and rose and amber now belong to the asset and the directory. Every second value equals its meaning, and
each World form draws its doors and its wires in its own blue and green.

#### `VIVID_KINDS` {#symbol-vivid_kinds}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L321)
- Returns: [`Palette`](#symbol-palette)

##### `VIVID_KINDS` — Summary
The proposed palette with the kinds kept near today's blue and green (the owner's earlier lean, made valid by root's
measurement, 2026-11-17): implementation and test near today's colours, the two roles a step lighter so that every
identity still stands apart, and every second value equal to its meaning. A test file's kind label in the details
panel is the test kind's green, as the test sphere is; a 2D card that tests use keeps the has-tests violet.

#### `PALETTES` {#symbol-palettes}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L333)

##### `PALETTES` — Summary
The palettes a viewer may choose, by name.

#### `PaletteName` {#symbol-palettename}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L336)

##### `PaletteName` — Summary
A palette's name.

#### `DEFAULT_PALETTE` {#symbol-default_palette}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L339)
- Returns: [`PaletteName`](#symbol-palettename)

##### `DEFAULT_PALETTE` — Summary
The palette drawn when none is chosen.

#### `isPaletteName` {#symbol-ispalettename}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L342)

##### `isPaletteName` — Summary
Whether a saved name is a palette's.

#### `MASK_KEEP` {#symbol-mask_keep}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L345)
- Returns: [`Colour`](#symbol-colour)

##### `MASK_KEEP` — Summary
A cell mask's luminance where the cells stay drawn: not a colour a person sees, and fixed in every palette.

#### `MASK_FADE` {#symbol-mask_fade}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L347)
- Returns: [`Colour`](#symbol-colour)

##### `MASK_FADE` — Summary
A cell mask's luminance where the cells fade, at a field's end.

#### `activePalette` {#symbol-activepalette}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L353)

##### `activePalette` — Summary
The palette in force.

#### `marblesDrawn` {#symbol-marblesdrawn}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L360)

##### `marblesDrawn` — Summary
Whether files are drawn as marbles (the marble trial, 2026-11-17): each file's colour its kind's glass with veins of
what it offers and what it uses (`marbleOf` in views/forceGraphAppearance.ts). Off until the page applies the
viewer's choice as it starts, which is on unless they turned it off (the default since 2026-11-18).

#### `paletteNamed` {#symbol-palettenamed}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L363)

##### `paletteNamed` — Summary
A palette by name, the default for a name no palette has.

#### `whenPaletteChanges` {#symbol-whenpalettechanges}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L371)
- Parameters: `palette`: [`Palette`](#symbol-palette)

##### `whenPaletteChanges` — Summary
Calls `listener` each time another palette is put in force or the marbles are turned on or off, so that what a script
drew is drawn again as it now should be; returns the unsubscription.

#### `choosePalette` {#symbol-choosepalette}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L377)
- Returns: [`Palette`](#symbol-palette)

##### `choosePalette` — Summary
Puts a palette in force by name, the default for a name no palette has, tells whoever listens if it changed, and returns it.

#### `chooseMarbles` {#symbol-choosemarbles}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L386)

##### `chooseMarbles` — Summary
Turns the marbles on or off, and tells whoever listens to the palette if that changed: the same redraw, nothing moving.

#### `channels` {#symbol-channels}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L393)

##### `channels` — Summary
A colour's channels, 0 to 255.

#### `rgba` {#symbol-rgba}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L400)

##### `rgba` — Summary
A colour at an opacity, as `rgba(r, g, b, alpha)`, the alpha written as given.

#### `unitChannels` {#symbol-unitchannels}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L406)

##### `unitChannels` — Summary
A colour's channels, 0 to 1, for a shader.

#### `mix` {#symbol-mix}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L409)

##### `mix` — Summary
A colour between two, `t` of the way from `a` to `b`, each channel rounded, as `rgb(r,g,b)`.

#### `customProperties` {#symbol-customproperties}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L422)
- Parameters: `palette`: [`Palette`](#symbol-palette)

##### `customProperties` — Summary
A palette as the stylesheets read it: one custom property for each meaning, named by its place in the table
(`ground.cardHover` is `--ground-card-hover`, `world.dark.tints.blue` is `--world-dark-tints-blue`), and beside it
its channels (`--ground-card-hover-rgb: 47, 47, 51`), from which a stylesheet draws the colour at an opacity as
`rgba(var(--ground-card-hover-rgb), 0.5)`: a colour the browser keeps, computes and animates as it always has.

#### `paletteStylesheet` {#symbol-palettestylesheet}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L436)
- Parameters: `palette`: [`Palette`](#symbol-palette)

##### `paletteStylesheet` — Summary
The stylesheet that sets a palette's custom properties on the page's root: the build writes the default's.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
