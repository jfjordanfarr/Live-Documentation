# tests/e2e/still-picture.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/still-picture.ts
- Generated At: 2026-10-06T16:47:49.787Z

## Authored
### Purpose

The still-picture instrument: quantized measures of one Explorer view in one state, each taken against the graph the bundle carries rather than against what the view chose to draw, so that no view can score by drawing less. The six tests of the first deck (legible facts, occlusion, text faults, route invariance, hidden facts, the journey) and the nine of the expanded deck (crossings, shared channels, flow, folder adjacency and legibility, symbols shown, references hidden among the cards drawn, churn under one gesture, and the tour), and since 2026-10-05 a sixteenth, wires drawn through a directory that holds neither of their ends, and a seventeenth, the total drawn length of the wires, the owner's reward for the Local Map. The deck that defines the measures, and holds the predictions written before the code existed, is [the still-picture deck](../../../../AI-Agent-Workspace/Probes/2026-10-01/still-picture-deck.md); the pure geometry under the expanded measures is `still-picture-geometry.ts`.

### Notes

- A fact is one reference in the Explorer's link payload, keyed by consumer, provider and the normalized symbols on each end; the facts in scope are those with both ends in a named set of files, the same denominator for every view.
- Wires are read from the DOM by the `data-source-id`, `data-target-id`, `data-source-symbol` and `data-target-symbol` attributes the Local Map and the Membrane Map stamp on every path and stub; the Membrane stamps them in flow orientation (provider first), which `ViewReading.sourceIs` undoes. A wire the page holds but does not show (the Local Map's back route before a hover) is not read, and a stub polygon is flagged `stub` so a rule about routes can leave it out while the deck's counts keep it (2026-10-05).
- Legible means inside the frame (`#main`), uncovered at the label's center by `elementFromPoint`, and at least `READING_PX` tall as rendered. The 9 px line is a parameter of the deck, the same for every view.
- Occlusion samples each wire every 8 px along its length and asks whether the topmost element there belongs to a card the wire does not end at. Pans are real mouse drags that end at rest, so a view with inertia does not keep sliding. A gesture never scrolls a clipped container; it pans until the target is in the frame, counting each pan.
- The page reading also returns each wire's whole path sampled every 8 px, which end of it sits at the provider (weighed against every card of the provider and of the consumer, since a view may draw one file as two cards), the union of its four endpoint texts, and each card with its folder, whether that folder is legible on the card or on the container drawn around it (`ViewReading.folderText`, `folderContainer`), and how many of its symbol rows are legible.
- The foreign-directory measure takes each wire's samples over its whole path, in or out of the frame, against the regions a view draws for a directory, the boxes around its cards (`ViewReading.folderBox`) or, where a view draws a directory as an outline, the fill of its shape (`ViewReading.folderShape`, read by `isPointInFill`; the Local Map's membranes since 2026-10-06), each carrying `data-directory`: a sample inside a region whose directory holds neither the consumer nor the provider, by path, is foreign; samples that fall in a lane the view reserved (`ViewReading.lane`) are counted apart, since a lane placed in a foreign directory is a layout fault the Local Map's rule forbids, while a curve across a directory that spans a gutter is a cost to read. A view without lanes reports none.
- The length measure sums every drawn wire's path length in screen pixels at the view's scale, stubs left out, and reports the mean; the owner named the total length of connectors across a frame as the Local Map's reward on 2026-10-05, so the deck reads it rather than assumes it. Since 2026-10-06 it also reports the horizontal and the vertical parts, each wire's summed over its samples, because the two halves answer to different levers: the ranking and the column widths set the horizontal, the order and the placement the vertical.
- Churn compares the cards' boxes before and after one gesture; the tour plans from the picture as it stands, then makes each pan by mouse and counts what actually became legible, so a plan the view does not honour shows as a difference. A drag starts from an empty spot the whole drag fits from, so one planned pan is one drag.
- Built on 2026-10-01 after the owner's go-ahead in [Turn 4](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-4); its first run found and the session fixed a clipped Membrane symbol name and an 862 px jump of the Local Map's subject on pinning a symbol. Expanded the same evening under [Turn 8](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-8).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `READING_PX` {#symbol-reading_px}
- Type: const
- Source: [source](../../../../tests/e2e/still-picture.ts#L42)

##### `READING_PX` — Summary
The smallest rendered font that counts as readable, in CSS pixels. A parameter of the deck, the same for every view.

#### `Fact` {#symbol-fact}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L50)

##### `Fact` — Summary
One reference between two files, in the graph's orientation: the consumer uses the provider's symbol.

#### `factKey` {#symbol-factkey}
- Type: const
- Source: [source](../../../../tests/e2e/still-picture.ts#L60)

#### `loadGraph` {#symbol-loadgraph}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L68)
- Parameters: `page`: `Page`

##### `loadGraph` — Summary
The bundle a page serves, projected the way the client projects it.

#### `factsInScope` {#symbol-factsinscope}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L78)
- Returns: [`Fact`](#symbol-fact)[]
- Parameters: `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload)

##### `factsInScope` — Summary
The references with both ends in the scope, merged by endpoints and symbols.

#### `consumersOf` {#symbol-consumersof}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L108)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload)

##### `consumersOf` — Summary
The files that use `symbol` of `file`, the answer a journey must reach.

#### `displayNames` {#symbol-displaynames}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L120)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload); `files`: `Iterable`

##### `displayNames` — Summary
For each file, its symbols' display names keyed by their normalized form, so a wire's symbol finds its row.

#### `symbolCounts` {#symbol-symbolcounts}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L137)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload)

##### `symbolCounts` — Summary
How many public symbols each file has, the denominator of the symbols-shown measure.

#### `membranePinAllUrl` {#symbol-membranepinallurl}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L146)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload)

##### `membranePinAllUrl` — Summary
The address of the Membrane Map with every symbol of every file in the set pinned, at the default camera.

#### `membraneBrowseUrl` {#symbol-membranebrowseurl}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L163)

##### `membraneBrowseUrl` — Summary
The address of the Membrane Map browsing the folder of `file`, with the file selected and nothing pinned.

#### `localMapUrl` {#symbol-localmapurl}
- Type: const
- Source: [source](../../../../tests/e2e/still-picture.ts#L172)

#### `localRetainUrl` {#symbol-localretainurl}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L175)

##### `localRetainUrl` — Summary
The address of the Local Map with every file of the set retained whole, the first as the subject, at the view's own fit.

#### `forceGraphUrl` {#symbol-forcegraphurl}
- Type: const
- Source: [source](../../../../tests/e2e/still-picture.ts#L179)

#### `ViewReading` {#symbol-viewreading}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L184)

##### `ViewReading` — Summary
How a view's DOM is read: where its wires, cards, rows and names are, and which way its wires are stamped.

#### `LOCAL_MAP` {#symbol-local_map}
- Type: const
- Source: [source](../../../../tests/e2e/still-picture.ts#L215)
- Returns: [`ViewReading`](#symbol-viewreading)

#### `MEMBRANE_MAP` {#symbol-membrane_map}
- Type: const
- Source: [source](../../../../tests/e2e/still-picture.ts#L241)
- Returns: [`ViewReading`](#symbol-viewreading)

#### `WireReading` {#symbol-wirereading}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L269)

##### `WireReading` — Summary
What the page reports about one wire.

#### `CardReading` {#symbol-cardreading}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L303)

##### `CardReading` — Summary
What the page reports about one card.

#### `PictureReading` {#symbol-picturereading}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L316)

##### `PictureReading` — Summary
What the page reports about the picture as a whole.

#### `readPicture` {#symbol-readpicture}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L328)
- Parameters: `page`: `Page`; `view`: [`ViewReading`](#symbol-viewreading)

##### `readPicture` — Summary
Reads the wires, cards and camera of a view as drawn now.

#### `LegibilityScore` {#symbol-legibilityscore}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L523)

#### `scoreLegibility` {#symbol-scorelegibility}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L540)
- Returns: [`LegibilityScore`](#symbol-legibilityscore)
- Parameters: `picture`: [`PictureReading`](#symbol-picturereading)

##### `scoreLegibility` — Summary
Test 1 and test 5: the facts in scope against the wires drawn.

#### `OcclusionScore` {#symbol-occlusionscore}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L571)

#### `scoreOcclusion` {#symbol-scoreocclusion}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L579)
- Returns: [`OcclusionScore`](#symbol-occlusionscore)
- Parameters: `picture`: [`PictureReading`](#symbol-picturereading)

##### `scoreOcclusion` — Summary
Test 2: wires that cross a card they do not end at.

#### `ForeignScore` {#symbol-foreignscore}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L591)

#### `scoreForeign` {#symbol-scoreforeign}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L603)
- Returns: [`ForeignScore`](#symbol-foreignscore)
- Parameters: `picture`: [`PictureReading`](#symbol-picturereading)

##### `scoreForeign` — Summary
Test 16: wires drawn through a directory that holds neither of their ends, over the whole path, and the part of it that lies in lanes.

#### `LengthScore` {#symbol-lengthscore}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L615)

#### `scoreLength` {#symbol-scorelength}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L627)
- Returns: [`LengthScore`](#symbol-lengthscore)
- Parameters: `picture`: [`PictureReading`](#symbol-picturereading)

##### `scoreLength` — Summary
Test 17: the total drawn length of the wires, the owner's reward for the Local Map (2026-10-05): the shorter, the fewer turns and extensions.

#### `wireLegible` {#symbol-wirelegible}
- Type: const
- Source: [source](../../../../tests/e2e/still-picture.ts#L636)

##### `wireLegible` — Summary
The legibility of one wire by the deck's full definition.

#### `ExpandedScore` {#symbol-expandedscore}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L647)

#### `scoreExpanded` {#symbol-scoreexpanded}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L661)
- Returns: [`ExpandedScore`](#symbol-expandedscore)
- Parameters: `picture`: [`PictureReading`](#symbol-picturereading)

##### `scoreExpanded` — Summary
Tests 7 to 12 over one picture; `counts` is the graph's public symbol count per file.

#### `HiddenScore` {#symbol-hiddenscore}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L692)

#### `scoreHiddenAmongDrawn` {#symbol-scorehiddenamongdrawn}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L700)
- Returns: [`HiddenScore`](#symbol-hiddenscore)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload); `picture`: [`PictureReading`](#symbol-picturereading)

##### `scoreHiddenAmongDrawn` — Summary
Test 13: test 5 with the scope widened to whatever the view drew.

#### `scoreHops` {#symbol-scorehops}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L707)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload); `picture`: [`PictureReading`](#symbol-picturereading)

##### `scoreHops` — Summary
Which hops of a chain are legible: a hop is legible when any reference between its two files is.

#### `ChurnScore` {#symbol-churnscore}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L716)

#### `scoreChurn` {#symbol-scorechurn}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L728)
- Returns: [`ChurnScore`](#symbol-churnscore)

##### `scoreChurn` — Summary
Test 14: what one gesture did to every card.

#### `cardBoxes` {#symbol-cardboxes}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L751)
- Parameters: `page`: `Page`; `view`: [`ViewReading`](#symbol-viewreading)

##### `cardBoxes` — Summary
The screen box of the first card of each file.

#### `TextScore` {#symbol-textscore}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L764)

#### `scoreText` {#symbol-scoretext}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L772)
- Parameters: `page`: `Page`; `view`: [`ViewReading`](#symbol-viewreading)

##### `scoreText` — Summary
Test 3: the design audit over the view's text.

#### `dragBy` {#symbol-dragby}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L831)
- Parameters: `page`: `Page`; `view`: [`ViewReading`](#symbol-viewreading)

##### `dragBy` — Summary
Pans the view by dragging an empty spot of it with the mouse, as a person would; the drag stays inside the frame.

#### `RouteScore` {#symbol-routescore}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L848)

#### `scoreRoutes` {#symbol-scoreroutes}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L858)
- Parameters: `page`: `Page`; `view`: [`ViewReading`](#symbol-viewreading)

##### `scoreRoutes` — Summary
Test 4: the shape of every wire across six pans by mouse, translation removed.

#### `TourScore` {#symbol-tourscore}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L884)

#### `runTour` {#symbol-runtour}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L904)
- Parameters: `page`: `Page`; `view`: [`ViewReading`](#symbol-viewreading)

##### `runTour` — Summary
Test 15: plan the tour from the picture as it stands, then make the pans by mouse and count what became legible.
The camera is left where the tour ends.

#### `Journey` {#symbol-journey}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L940)

#### `ChainJourney` {#symbol-chainjourney}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L957)

##### `ChainJourney` — Summary
The chain scope's journey: from A's single-file state to a picture in which the hops are legible.

#### `Box` {#symbol-box}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L973)

#### `boxOf` {#symbol-boxof}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L981)
- Parameters: `page`: `Page`

##### `boxOf` — Summary
The screen box of the first element the selector names, or null.

#### `centerDistance` {#symbol-centerdistance}
- Type: const
- Source: [source](../../../../tests/e2e/still-picture.ts#L990)

#### `Move` {#symbol-move}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L994)

##### `Move` — Summary
What one move of a journey cost: the gestures it took, counting the pans that brought the target into the frame, and the short side of the target hit.

#### `gesture` {#symbol-gesture}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L1003)
- Parameters: `page`: `Page`; `view`: [`ViewReading`](#symbol-viewreading)

##### `gesture` — Summary
Clicks the element as a person would: never by scrolling a clipped container, but by panning the view until the
target is inside the frame, each pan a gesture, then clicking its center. Reports the short side of the target's box.

#### `legibleNames` {#symbol-legiblenames}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L1026)
- Parameters: `page`: `Page`; `view`: [`ViewReading`](#symbol-viewreading)

##### `legibleNames` — Summary
How many of the files' names are legible on their cards now: in frame, uncovered, at reading size.

#### `backEnabled` {#symbol-backenabled}
- Type: const
- Source: [source](../../../../tests/e2e/still-picture.ts#L1051)

#### `Scoreboard` {#symbol-scoreboard}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L1055)

#### `scoreboardTable` {#symbol-scoreboardtable}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L1089)

##### `scoreboardTable` — Summary
The scoreboard of one bundle as a markdown table, one row per view, one column per number the deck defines.

#### `expandedTable` {#symbol-expandedtable}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L1132)

##### `expandedTable` — Summary
The expanded measures of one bundle as a second table, one row per view.

#### `chainTable` {#symbol-chaintable}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L1164)

##### `chainTable` — Summary
The chain journeys of one bundle as a table.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page` (type-only)
- `lz-string` - `compressToEncodedURIComponent`
- [`symbolAnchors.normalizeSymbolIdentifier`](../../packages/explorer/src/client/views/symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
- [`graph.explorerGraphOf`](../../packages/explorer/src/shared/graph.ts.mdmd.md#symbol-explorergraphof)
- [`StaticExplorerData`](../../packages/explorer/src/shared/staticExplorerData.ts.mdmd.md#symbol-staticexplorerdata) (type-only)
- [`types.ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`design-audit.describeFaults`](./design-audit.ts.mdmd.md#symbol-describefaults)
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
- [`still-picture-geometry.AdjacencyScore`](./still-picture-geometry.ts.mdmd.md#symbol-adjacencyscore)
- [`still-picture-geometry.ChannelScore`](./still-picture-geometry.ts.mdmd.md#symbol-channelscore)
- [`still-picture-geometry.CrossingScore`](./still-picture-geometry.ts.mdmd.md#symbol-crossingscore)
- [`still-picture-geometry.Polyline`](./still-picture-geometry.ts.mdmd.md#symbol-polyline)
- [`still-picture-geometry.TourFact`](./still-picture-geometry.ts.mdmd.md#symbol-tourfact)
- [`still-picture-geometry.TourPan`](./still-picture-geometry.ts.mdmd.md#symbol-tourpan)
- [`still-picture-geometry.crossings`](./still-picture-geometry.ts.mdmd.md#symbol-crossings)
- [`still-picture-geometry.flowOf`](./still-picture-geometry.ts.mdmd.md#symbol-flowof)
- [`still-picture-geometry.folderAdjacency`](./still-picture-geometry.ts.mdmd.md#symbol-folderadjacency)
- [`still-picture-geometry.planTour`](./still-picture-geometry.ts.mdmd.md#symbol-plantour)
- [`still-picture-geometry.sharedChannels`](./still-picture-geometry.ts.mdmd.md#symbol-sharedchannels)
<!-- LIVE-DOC:END Dependencies -->
