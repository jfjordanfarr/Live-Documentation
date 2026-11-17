# packages/explorer/src/client/palette.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/palette.ts
- Generated At: 2026-11-16T21:07:00.198Z

## Authored
### Purpose
Holds every colour the Explorer draws in one typed table, keyed by what each colour means: the ground and its surfaces, lines, the tones of text, what is selected, a connection's two roles (offers, uses), a file's kinds, has-tests, a file changed in the commit shown, the signals, links, the 3D scene and the World Map in its light and dark forms. The build writes the default palette as the custom properties every stylesheet reads; the page applies a palette by name at startup; the 3D map, the 2D wires, the World Map and the transition read it directly. Pure: no DOM.

### Notes
Made in the [November 16 colour pass](../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-16.1.record.md#turn-1), after the owner asked which colours the app uses and what they mean, and from their words of 2025-12-06: "CSS styles declare colors without relying on a common set of theme colors with specific color semantic _meanings_, even though we actually do have a robust system of meaning based on color!". The [colour pass's inventory](../../../../../../AI-Agent-Workspace/Probes/2026-11-16/colour-pass/inventory.md) maps every value here to where it was drawn before; the table replaced the theme stylesheet's literals, the 3D map's `SPATIAL_NODE_STYLES`, the shader's constants and the hard-coded wire colours of the 2D map and the World Map, with today's picture unchanged. `secondValues` holds the places where today draws one meaning in a second colour a person can tell apart (the offering pin's blue beside the offering wire's, among others); a palette that draws each meaning once deletes it. Every value is opaque; opacity is derived where a colour is drawn (`rgba` here; in a stylesheet `rgba(var(--meaning-rgb), alpha)`, from the channels the build writes beside each colour, so that the browser computes, serialises and animates every colour as the legacy `rgba` it was: `color-mix` was tried first and changed how a colour is serialised and interpolated, which the browser specs' colour reader and an animation's mid-frames showed). The palette's name is a viewer's saved setting (`appearance.palette`), not carried in a shared link; whether a link should carry it is a question put to the owner.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Colour` {#symbol-colour}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L15)

##### `Colour` — Summary
A colour, `#rrggbb`.

#### `WorldTints` {#symbol-worldtints}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L18)

##### `WorldTints` — Summary
The tints a World Map region may wear, by the names a board's legend gives them.

#### `WorldForm` {#symbol-worldform}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L28)

##### `WorldForm` — Summary
The World Map in one of its two forms, the white board or the dark one.

#### `Palette` {#symbol-palette}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L64)

##### `Palette` — Summary
One palette: every meaning the Explorer draws in colour.

#### `TODAY` {#symbol-today}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L227)
- Returns: [`Palette`](#symbol-palette)

##### `TODAY` — Summary
The palette drawn until the colour pass: every value as the Explorer drew it on 2026-11-16.

#### `PALETTES` {#symbol-palettes}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L281)

##### `PALETTES` — Summary
The palettes a viewer may choose, by name.

#### `PaletteName` {#symbol-palettename}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L284)

##### `PaletteName` — Summary
A palette's name.

#### `DEFAULT_PALETTE` {#symbol-default_palette}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L287)
- Returns: [`PaletteName`](#symbol-palettename)

##### `DEFAULT_PALETTE` — Summary
The palette drawn when none is chosen.

#### `isPaletteName` {#symbol-ispalettename}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L290)

##### `isPaletteName` — Summary
Whether a saved name is a palette's.

#### `MASK_KEEP` {#symbol-mask_keep}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L293)
- Returns: [`Colour`](#symbol-colour)

##### `MASK_KEEP` — Summary
A cell mask's luminance where the cells stay drawn: not a colour a person sees, and fixed in every palette.

#### `MASK_FADE` {#symbol-mask_fade}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L295)
- Returns: [`Colour`](#symbol-colour)

##### `MASK_FADE` — Summary
A cell mask's luminance where the cells fade, at a field's end.

#### `activePalette` {#symbol-activepalette}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L300)

##### `activePalette` — Summary
The palette in force.

#### `choosePalette` {#symbol-choosepalette}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L303)
- Returns: [`Palette`](#symbol-palette)

##### `choosePalette` — Summary
Puts a palette in force by name, the default for a name no palette has, and returns it.

#### `channels` {#symbol-channels}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L309)

##### `channels` — Summary
A colour's channels, 0 to 255.

#### `rgba` {#symbol-rgba}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L316)

##### `rgba` — Summary
A colour at an opacity, as `rgba(r, g, b, alpha)`, the alpha written as given.

#### `unitChannels` {#symbol-unitchannels}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L322)

##### `unitChannels` — Summary
A colour's channels, 0 to 1, for a shader.

#### `mix` {#symbol-mix}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L325)

##### `mix` — Summary
A colour between two, `t` of the way from `a` to `b`, each channel rounded, as `rgb(r,g,b)`.

#### `customProperties` {#symbol-customproperties}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L338)
- Parameters: `palette`: [`Palette`](#symbol-palette)

##### `customProperties` — Summary
A palette as the stylesheets read it: one custom property for each meaning, named by its place in the table
(`ground.cardHover` is `--ground-card-hover`, `world.dark.tints.blue` is `--world-dark-tints-blue`), and beside it
its channels (`--ground-card-hover-rgb: 47, 47, 51`), from which a stylesheet draws the colour at an opacity as
`rgba(var(--ground-card-hover-rgb), 0.5)`: a colour the browser keeps, computes and animates as it always has.

#### `paletteStylesheet` {#symbol-palettestylesheet}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/palette.ts#L352)
- Parameters: `palette`: [`Palette`](#symbol-palette)

##### `paletteStylesheet` — Summary
The stylesheet that sets a palette's custom properties on the page's root: the build writes the default's.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
