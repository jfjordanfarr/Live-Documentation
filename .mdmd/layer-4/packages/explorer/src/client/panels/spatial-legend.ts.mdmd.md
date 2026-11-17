# packages/explorer/src/client/panels/spatial-legend.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/spatial-legend.ts
- Generated At: 2026-11-17T04:51:06.868Z

## Authored
### Purpose
The Local Map's key as rows of a sample and at most two words. It builds the 3D map's rows (the file kinds present, symbol-based body size, counted-reference width, the path, the frontier, rings, wrapped groups, shells, and any document citations or containment wires) from the filtered graph for the moment shown, so the key follows filters and history without implementing another visibility policy; each row's sentence is its tooltip and accessible description and is drawn nowhere. It also fills the 2D key's kinds row from the colours the closed directories' cells are drawn in.

### Notes
Created during the [October 24 Connections review](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-12) to repair the legend mismatch accepted in the [October 23 remediation](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#remediation-work). File colours come from the same table as the renderer. Plain text supplies the names; the decorative swatches are hidden from assistive technology. The rows' words below are those of their day; since 2026-11-16 each is two words at most (the last note). The existing 2D offer/use key remains separate, and neither Local Map key describes another view.

The body-size key is omitted when symbol scaling is disabled. Code-reference width describes the number of documented references represented by a file-pair wire, not its direction or physical length. Since 2026-10-30 the rows are a pure list the view and the unit test share, and they say only what is drawn: the references' width only while reference wires are drawn (on demand in the structure layout), a Path row while a path is, a Dimmed row while the picture ends in a frontier, the last hop of connections shown dimmed, a click on which shows more (2026-10-31, discovery), a Ring row while any sphere wears the ring of connections the picture does not show (2026-11-02), a Faded row while a path or a hover fades the rest (pins faded the rest until that day, when the picture came to hold only what they reach), a folder's size rule when hubs are shown. A direction row, a blue-to-green stroke, stood above the width row for one day and went with the wires' colour on 2026-10-31 ([Turn 1 of the October 31 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-1)). Rows change only when their meanings change, so repeated graph renders do not continually replace the sidebar.

Since 2026-11-05 a Wrapped group row follows the Ring row while any group is drawn wrapped, and the Ring row stands only while a sphere that is not wrapped wears a ring ([Group Wrappers](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences)).

Since 2026-11-05 the key has a row for a directory shell (then "Shell: N files of a directory; click to open it") while any is drawn; the 3D view leaves the shells out of the kinds it reads, since a shell is no kind of file.

Since 2026-11-16 ([Turn 10 of the November 15 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-10)) a row is a sample and at most two words. The owner, of the rows above: "the language on the legend is so cringe ... I still strongly strongly strongly continue to urge to minimize visibile words that come from _us_". A row is now `marks` (each a colour and its words), a `shape` and a `description`: the sentence the row used to draw, which `renderSpatialLegend` writes as the row's `title` and `aria-description`. The kinds are one row with a mark for each kind drawn, in the table's order, each with its one word; every other row has one mark. The words: *Symbols* (was "Size: public symbols" and "Size: file symbols; folders uniform"; the folders' rule is its sentence's second half, said while a folder is drawn), *References* ("Width: references"), *Path*, *Beyond* ("Dimmed: a hop beyond, or another group; click to see more"), *More connected* ("Ring: more connected, not shown; click to see it"), *Wrapped group*, *Directory shell*, *Contains*, *Cites* ("Cites document") and *Cited by* ("Cited by document"). The Faded row and `SpatialLegendDrawn.faded` are deleted: a faded thing says by itself that it is out of attention, the row came and went with every hover, and the path's sentence now says what a path fades. What a press does left the rows for the marks' own tooltips, which the 3D map's names already carried ("Pin this file", "Open this shell", "N more connected, not shown") but for a wrapped group's seed, whose name gained "Open this group and pin this file" that day.

`watchLocalKinds`, of the same day, fills the 2D key's `local-legend-kinds` row where the template has one, which is one line there, kept or left out by the owner's choice between a row of our words and a cell's hover alone. It reads the kinds from the cells the 2D map has drawn (their `fill`, which the map writes from the palette's kinds through `spatialNodeStyles`), counting only a cell that is rendered at the look shown and not drawn in the one grey, so the row holds what is on screen and is empty, which the stylesheet hides, otherwise. It watches the map's element for a closed directory drawn or removed and for a change of look, and draws once a frame at most; the 2D map knows nothing of it. If the owner chooses the hover alone, delete the function, its call in `index.ts`, the template's line, `#local-legend-kinds`'s two rules in `local.css` and the two browser cases that read the row.

Since [the November 16 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-16.1.record.md#turn-4) the 3D key's row of kinds also names the kinds of the files drawn as cells within wrapped groups and directory shells (`inside`), which are no spheres: on the tidepool sample's Structure the bags held the tests and assets and the key named neither. The 2D key's row reads each cell's `data-kind` and draws again when the palette changes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SpatialLegendDrawn` {#symbol-spatiallegenddrawn}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/spatial-legend.ts#L7)

##### `SpatialLegendDrawn` — Summary
What the 3D picture draws beyond its data: the key says only what is on screen (2026-10-30).

#### `SpatialLegendMark` {#symbol-spatiallegendmark}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/spatial-legend.ts#L29)

##### `SpatialLegendMark` — Summary
A sample of the key and the words beside it, two at most.

#### `SpatialLegendRow` {#symbol-spatiallegendrow}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/spatial-legend.ts#L40)

##### `SpatialLegendRow` — Summary
One row of the key (2026-11-16): the sample the stylesheet draws from its shape, the mark's words, and the sentence
that says what the mark means, which is drawn nowhere: a pointer reads it as the row's tooltip and assistive
technology as its description. A row samples one mark; the kinds' row alone has a mark for each kind drawn, each
with its one word.

#### `spatialLegendRows` {#symbol-spatiallegendrows}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/spatial-legend.ts#L50)
- Returns: [`SpatialLegendRow`](#symbol-spatiallegendrow)[]
- Parameters: `graph`: [`SpatialGraphData`](../views/forceGraphData.ts.mdmd.md#symbol-spatialgraphdata); `drawn`: [`SpatialLegendDrawn`](#symbol-spatiallegenddrawn)

##### `spatialLegendRows` — Summary
The rows of the key for a filtered graph at the moment shown, in reading order; pure, so that a test can read them.

#### `renderSpatialLegend` {#symbol-renderspatiallegend}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/spatial-legend.ts#L97)
- Parameters: `graph`: [`SpatialGraphData`](../views/forceGraphData.ts.mdmd.md#symbol-spatialgraphdata); `drawn`: [`SpatialLegendDrawn`](#symbol-spatiallegenddrawn)

##### `renderSpatialLegend` — Summary
Describe the spatial map's filtered, current-moment encodings without changing its geometry or attention.

#### `watchLocalKinds` {#symbol-watchlocalkinds}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/spatial-legend.ts#L121)

##### `watchLocalKinds` — Summary
The 2D map's kinds (2026-11-16): the template's `local-legend-kinds` row, where the template has one, holds a mark
for each kind whose colour a closed directory's cells are drawn in, and stands empty, which the stylesheet hides,
while no coloured cell is drawn. The kinds are read from the cells themselves, whose kinds the 2D map writes and whose
colours this key shares with it: a cell hidden at the look shown, or drawn in the one grey, counts for nothing. A
palette chosen later draws the row again in its colours.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](../dom.ts.mdmd.md#symbol-requireelement)
- [`palette.activePalette`](../palette.ts.mdmd.md#symbol-activepalette)
- [`palette.marblesDrawn`](../palette.ts.mdmd.md#symbol-marblesdrawn)
- [`palette.whenPaletteChanges`](../palette.ts.mdmd.md#symbol-whenpalettechanges)
- [`forceGraphAppearance.spatialNodeStyle`](../views/forceGraphAppearance.ts.mdmd.md#symbol-spatialnodestyle-function)
- [`forceGraphAppearance.spatialNodeStyles`](../views/forceGraphAppearance.ts.mdmd.md#symbol-spatialnodestyles)
- [`forceGraphData.SpatialGraphData`](../views/forceGraphData.ts.mdmd.md#symbol-spatialgraphdata) (type-only)
- [`template.local-legend-kinds`](../../shared/template.html.mdmd.md#symbol-local-legend-kinds)
- [`template.map-container`](../../shared/template.html.mdmd.md#symbol-map-container)
<!-- LIVE-DOC:END Dependencies -->
