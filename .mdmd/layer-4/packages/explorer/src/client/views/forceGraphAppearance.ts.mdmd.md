# `packages/explorer/src/client/views/forceGraphAppearance.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/forceGraphAppearance.ts`
- Generated At: 2026-11-22T07:12:54.500Z

## Authored
### Purpose
Pairs each kind of file the spatial maps colour with the word the keys give it, its colour read from the palette in force, so that the spheres, the 2D cells and both keys describe the same kinds. Unknown and absent kinds share a neutral fallback.

Since the marble trial it also says how a file looks drawn as a marble: its kind's colour as glass, veined with the offering blue by how many other files of the scan use it and with the using green by how many it uses. It counts both from a graph's links (`marbleCounts`), gives a file its two shares (`marbleShares`, `fileShares`), its far tint, the three mixed in linear light (`marbleTint`), and a seed from its id that turns its pattern (`marbleSeed`). It also holds the shader chunks the 3D map's spheres and the files inside directory shells use to draw the veins up close. The 3D view, the 2D map's closed directories and the 3D key all read these.

### Notes
Extracted from `forceGraphView.ts` during the [October 24 Connections review](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-24/2026-10-24.1.record.md#turn-12). The [October 23 review](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-23/Screenshots/README.md) had found that the sidebar described offer/use colours while the spatial map coloured whole files by archetype. These colours retain their existing meaning; they do not describe dependency direction. Since the [November 16 colour pass](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-1) the colours live in the palette (`palette.ts`), and the three kinds that nothing produces (interface, configuration, script) are gone.

The marble is the owner's design, from [Turns 7 to 9 of the November 16 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-7). Under the proposed palette the 3D map had drawn no blue or green at all, and its commonest ball had turned grey, which the owner found "very very drab". Colouring a ball blue, grey or green by its share of being used and using was "too naive": "Admixtures of green and blue; marbles in a galaxy, zoomable-into ... Something that sends more is more blue. Something that receives more is more green." Root's answer kept the kind as the glass, and the owner's reply to it was "Do it do it do it do it!!!!" It is a trial behind Tuning's Marbles choice, off by default. Its constants were settled by eye in the real Explorer and are held by measured facts in `palette.test.ts`. The amount curve is log2(1 + n) / log2(8). Each vein may take 0.6 of a ball on quiet glass, the two together 0.9, so that some glass always remains, and each 0.15 on a test's, an asset's or a document's glass. Root's starting values were log2(1 + n) / log2(16) and 0.45. On the first look at this repository's whole 3D picture, they left the commonest balls a pale grey-aqua: half the files are used by two or fewer and use one or none. 0.15 is the most that keeps the tinted kinds nearer their own glass than any other kind's from far away; at 0.45 a test full of both veins reads as implementation. A document's citations give it no veins, since blue and green stand for a file's references alone, and a document's citations are drawn in their own colour.

Since 2026-11-17 every shader chunk stands inside `#ifdef MARBLES`, which a material defines only while marbles are drawn. Compiled in and skipped by a test inside the shader, the pattern cost a frame's time with no marble drawn: this repository's 3D picture drew at 4.4 frames a second on the software renderer the browser tests run on, where it draws at 5.3 without it ([the measurement](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#the-direct-measurement-the-round-costs-a-frames-time-with-marbles-off-and-the-four-cases-stood-on-their-limits-already)). Compiled out, the two are level. `palette.test.ts` holds every chunk to its guard.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SpatialKind` {#symbol-spatialkind}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L14)

##### `SpatialKind` — Summary
A kind the maps colour.

#### `SpatialNodeStyle (interface)` {#symbol-spatialnodestyle-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L17)

##### `SpatialNodeStyle (interface)` — Summary
A kind's colour and its word.

#### `spatialNodeStyles` {#symbol-spatialnodestyles}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L27)

##### `spatialNodeStyles` — Summary
The file kinds the spatial maps colour, in the keys' order, one object each for as long as a palette is in force.

#### `spatialKindOf` {#symbol-spatialkindof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L38)
- Returns: [`SpatialKind`](#symbol-spatialkind)

##### `spatialKindOf` — Summary
The kind an archetype is drawn as; an unknown or absent one is `other`.

#### `spatialNodeStyle (function)` {#symbol-spatialnodestyle-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L44)
- Returns: [`SpatialNodeStyle`](#symbol-spatialnodestyle-interface)

##### `spatialNodeStyle (function)` — Summary
Unknown or absent file kinds receive the same neutral colour in the picture and key.

#### `MarbleCounts (interface)` {#symbol-marblecounts-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L59)

##### `MarbleCounts (interface)` — Summary
How many other files of the scan use a file, and how many it uses: facts of the whole scan, never of what is shown.

#### `MarbleShares (interface)` {#symbol-marbleshares-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L62)

##### `MarbleShares (interface)` — Summary
How much of a ball each vein takes, 0 to 1 each and never more than 1 together: blue for what it offers, green for what it uses.

#### `Marble` {#symbol-marble}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L65)
- Extends: [`MarbleShares`](#symbol-marbleshares-interface)

##### `Marble` — Summary
A file drawn as a marble: its glass, its veins' shares, and the number from its id that turns its pattern.

#### `marbleAmount` {#symbol-marbleamount}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L72)

##### `marbleAmount` — Summary
How much of its veins a count of files gives a ball: 1 a third, 3 two thirds, 7 or more all. Half this repository's
files are used by two or fewer and use one or none, so the curve rises early: on the first look at the whole picture,
with 15 files for all, the commonest balls read as a pale grey-aqua (2026-11-17).

#### `MARBLE_VEINS` {#symbol-marble_veins}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L79)

##### `MARBLE_VEINS` — Summary
The most of a ball each vein may take: on quiet glass, and on a tinted kind's glass (a test, an asset, a document)
less, so that its kind still reads from far away (measured in the tests beside this); and the most the two take
together, so that some glass always remains, the two keeping their proportion when held to it.

#### `marbleShares (function)` {#symbol-marbleshares-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L85)
- Returns: [`MarbleShares`](#symbol-marbleshares-interface)
- Parameters: `kind`: [`SpatialKind`](#symbol-spatialkind); `counts`: [`MarbleCounts`](#symbol-marblecounts-interface)

##### `marbleShares (function)` — Summary
A ball's two shares, from its kind and its counts.

#### `marbleTint` {#symbol-marbletint}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L98)
- Returns: [`Colour`](../palette.ts.mdmd.md#symbol-colour)
- Parameters: `shares`: [`MarbleShares`](#symbol-marbleshares-interface); `palette`: [`Palette`](../palette.ts.mdmd.md#symbol-palette)

##### `marbleTint` — Summary
The colour a marble reads as from far away: its glass and its two veins mixed in linear light by their shares, as the
eye averages a ball too small to tell its bands apart. A ball with no veins is its glass exactly.

#### `marbleSeed` {#symbol-marbleseed}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L107)

##### `marbleSeed` — Summary
A number in [0, 1) from a file's id, the same on every page and every load, which turns its marble's pattern.

#### `marbleCounts (function)` {#symbol-marblecounts-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L120)
- Returns: `ReadonlyMap`

##### `marbleCounts (function)` — Summary
Each file's two counts in a scan's graph, by id: the other files that use it, and the other files it uses, each file
counted once whatever the number of references between the two. Read from the links, each from the file that uses to
the file that offers, so that a moment of the history, whose files carry no dependency lines, counts as today does.

#### `fileShares` {#symbol-fileshares}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L144)
- Returns: [`MarbleShares`](#symbol-marbleshares-interface)
- Parameters: `counts`: `ReadonlyMap`

##### `fileShares` — Summary
A file's two shares from its kind and the scan's counts. A document's citations are not counted: they are drawn as
citations, in their own colour, and the offering blue and the using green are a file's references alone, so that a
document is its yellow glass.

#### `marbleOf` {#symbol-marbleof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L150)
- Returns: [`Marble`](#symbol-marble)
- Parameters: `counts`: `ReadonlyMap`; `palette`: [`Palette`](../palette.ts.mdmd.md#symbol-palette)

##### `marbleOf` — Summary
A file's marble under the palette in force; null for what is no file, a directory's hub.

#### `MARBLE_VERTEX_PARS` {#symbol-marble_vertex_pars}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L171)

##### `MARBLE_VERTEX_PARS` — Summary
The marble in a sphere's shaders: the vertex's attributes and what it hands on, and the fragment's pattern. A ball's
pattern stands in its own unit sphere, `MARBLE_LOCAL`, a direction the including shader defines, so that it turns with
nothing and never swims as the camera moves. Three vanes wind round an axis its seed chooses, warped; across a vane
the offering blue, then the using green, then clear glass, each as wide as its share, the two colours side by side and
never blended at close range. Each edge is filtered over the pixel's own footprint, read from the screen's
derivatives, and the whole pattern gives way to the far tint (the instance colour) as a vane's period nears a few
pixels, so that a distant ball is one steady colour and never shimmers. A small highlight makes the ball read as
glass, fading as the pattern does. With no marble (`spatialMarbleVeins.w` zero) none of this runs.

Every chunk stands inside `#ifdef MARBLES`, and a material defines that only while marbles are drawn: with marbles
off its shaders are, to the compiler, the ones it had before marbles. A test inside the shader is not enough. The
software renderer the browser tests run on shades several pixels at once and pays for the three varyings on every
pixel and for much of the code a test skips: this repository's picture drew at 4.4 frames a second with the pattern
compiled in and no marble drawn, where it draws at 5.3 without (2026-11-17).

#### `MARBLE_VERTEX` {#symbol-marble_vertex}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L180)

##### `MARBLE_VERTEX` — Summary
The vertex's hand-on of a marble's glass and veins.

#### `MARBLE_FRAGMENT_PARS` {#symbol-marble_fragment_pars}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L190)

##### `MARBLE_FRAGMENT_PARS` — Summary
The fragment's declarations and the pattern.

#### `MARBLE_COLOUR` {#symbol-marble_colour}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L225)

##### `MARBLE_COLOUR` — Summary
The fragment's colour, after the instance colour (the far tint) is read into `diffuseColor`.

#### `MARBLE_SHINE` {#symbol-marble_shine}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphAppearance.ts#L231)

##### `MARBLE_SHINE` — Summary
The glass's highlight, added to the light the ball sends out, where the pattern is drawn.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`palette.Colour`](../palette.ts.mdmd.md#symbol-colour) (type-only)
- [`Palette`](../palette.ts.mdmd.md#symbol-palette) (type-only)
- [`palette.activePalette`](../palette.ts.mdmd.md#symbol-activepalette)
- [`palette.channels`](../palette.ts.mdmd.md#symbol-channels)
<!-- LIVE-DOC:END Dependencies -->
