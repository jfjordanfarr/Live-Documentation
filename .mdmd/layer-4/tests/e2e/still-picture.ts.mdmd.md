# tests/e2e/still-picture.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/still-picture.ts
- Generated At: 2026-10-01T15:18:24.216Z

## Authored
### Purpose

The still-picture instrument: six quantized measures of one Explorer view in one state, each taken against the graph the bundle carries rather than against what the view chose to draw, so that no view can score by drawing less. The deck that defines the measures, and holds the predictions written before this module existed, is [the still-picture deck](../../../../AI-Agent-Workspace/Probes/2026-10-01/still-picture-deck.md).

### Notes

- A fact is one reference in the Explorer's link payload, keyed by consumer, provider and the normalized symbols on each end; the facts in scope are those with both ends in a named set of files, the same denominator for every view.
- Wires are read from the DOM by the `data-source-id`, `data-target-id`, `data-source-symbol` and `data-target-symbol` attributes the Local Map and the Membrane Map stamp on every path and stub; the Membrane stamps them in flow orientation (provider first), which `ViewReading.sourceIs` undoes.
- Legible means inside the frame (`#main`), uncovered at the label's center by `elementFromPoint`, and at least `READING_PX` tall as rendered. The 9 px line is a parameter of the deck, the same for every view.
- Occlusion samples each wire every 8 px along its length and asks whether the topmost element there belongs to a card the wire does not end at. Pans are real mouse drags that end at rest, so a view with inertia does not keep sliding. A gesture never scrolls a clipped container; it pans until the target is in the frame, counting each pan.
- Built on 2026-10-01 after the owner's go-ahead in [Turn 4](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-4); its first run found and the session fixed a clipped Membrane symbol name and an 862 px jump of the Local Map's subject on pinning a symbol.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `READING_PX` {#symbol-reading_px}
- Type: const
- Source: [source](../../../../tests/e2e/still-picture.ts#L26)

##### `READING_PX` — Summary
The smallest rendered font that counts as readable, in CSS pixels. A parameter of the deck, the same for every view.

#### `Fact` {#symbol-fact}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L34)

##### `Fact` — Summary
One reference between two files, in the graph's orientation: the consumer uses the provider's symbol.

#### `factKey` {#symbol-factkey}
- Type: const
- Source: [source](../../../../tests/e2e/still-picture.ts#L44)

#### `loadGraph` {#symbol-loadgraph}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L52)
- Parameters: `page`: `Page`

##### `loadGraph` — Summary
The bundle a page serves, projected the way the client projects it.

#### `factsInScope` {#symbol-factsinscope}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L62)
- Returns: [`Fact`](#symbol-fact)[]
- Parameters: `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload)

##### `factsInScope` — Summary
The references with both ends in the scope, merged by endpoints and symbols.

#### `consumersOf` {#symbol-consumersof}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L92)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload)

##### `consumersOf` — Summary
The files that use `symbol` of `file`, the answer a journey must reach.

#### `displayNames` {#symbol-displaynames}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L104)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload); `files`: `Iterable`

##### `displayNames` — Summary
For each file, its symbols' display names keyed by their normalized form, so a wire's symbol finds its row.

#### `membranePinAllUrl` {#symbol-membranepinallurl}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L123)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload)

##### `membranePinAllUrl` — Summary
The address of the Membrane Map with every symbol of every file in the set pinned, at the default camera.

#### `membraneBrowseUrl` {#symbol-membranebrowseurl}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L140)

##### `membraneBrowseUrl` — Summary
The address of the Membrane Map browsing the folder of `file`, with the file selected and nothing pinned.

#### `localMapUrl` {#symbol-localmapurl}
- Type: const
- Source: [source](../../../../tests/e2e/still-picture.ts#L149)

#### `forceGraphUrl` {#symbol-forcegraphurl}
- Type: const
- Source: [source](../../../../tests/e2e/still-picture.ts#L151)

#### `ViewReading` {#symbol-viewreading}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L156)

##### `ViewReading` — Summary
How a view's DOM is read: where its wires, cards, rows and names are, and which way its wires are stamped.

#### `LOCAL_MAP` {#symbol-local_map}
- Type: const
- Source: [source](../../../../tests/e2e/still-picture.ts#L177)
- Returns: [`ViewReading`](#symbol-viewreading)

#### `MEMBRANE_MAP` {#symbol-membrane_map}
- Type: const
- Source: [source](../../../../tests/e2e/still-picture.ts#L199)
- Returns: [`ViewReading`](#symbol-viewreading)

#### `WireReading` {#symbol-wirereading}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L224)

##### `WireReading` — Summary
What the page reports about one wire.

#### `PictureReading` {#symbol-picturereading}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L241)

##### `PictureReading` — Summary
What the page reports about the picture as a whole.

#### `readPicture` {#symbol-readpicture}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L251)
- Parameters: `page`: `Page`; `view`: [`ViewReading`](#symbol-viewreading)

##### `readPicture` — Summary
Reads the wires, cards and camera of a view as drawn now.

#### `LegibilityScore` {#symbol-legibilityscore}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L349)

#### `scoreLegibility` {#symbol-scorelegibility}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L366)
- Returns: [`LegibilityScore`](#symbol-legibilityscore)
- Parameters: `picture`: [`PictureReading`](#symbol-picturereading)

##### `scoreLegibility` — Summary
Test 1 and test 5: the facts in scope against the wires drawn.

#### `OcclusionScore` {#symbol-occlusionscore}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L397)

#### `scoreOcclusion` {#symbol-scoreocclusion}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L405)
- Returns: [`OcclusionScore`](#symbol-occlusionscore)
- Parameters: `picture`: [`PictureReading`](#symbol-picturereading)

##### `scoreOcclusion` — Summary
Test 2: wires that cross a card they do not end at.

#### `TextScore` {#symbol-textscore}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L417)

#### `scoreText` {#symbol-scoretext}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L425)
- Parameters: `page`: `Page`; `view`: [`ViewReading`](#symbol-viewreading)

##### `scoreText` — Summary
Test 3: the design audit over the view's text.

#### `dragBy` {#symbol-dragby}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L478)
- Parameters: `page`: `Page`; `view`: [`ViewReading`](#symbol-viewreading)

##### `dragBy` — Summary
Pans the view by dragging an empty spot of it with the mouse, as a person would; the drag stays inside the frame.

#### `RouteScore` {#symbol-routescore}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L495)

#### `scoreRoutes` {#symbol-scoreroutes}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L505)
- Parameters: `page`: `Page`; `view`: [`ViewReading`](#symbol-viewreading)

##### `scoreRoutes` — Summary
Test 4: the shape of every wire across six pans by mouse, translation removed.

#### `Journey` {#symbol-journey}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L533)

#### `Box` {#symbol-box}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L549)

#### `boxOf` {#symbol-boxof}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L557)
- Parameters: `page`: `Page`

##### `boxOf` — Summary
The screen box of the first element the selector names, or null.

#### `centerDistance` {#symbol-centerdistance}
- Type: const
- Source: [source](../../../../tests/e2e/still-picture.ts#L566)

#### `Move` {#symbol-move}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L570)

##### `Move` — Summary
What one move of a journey cost: the gestures it took, counting the pans that brought the target into the frame, and the short side of the target hit.

#### `gesture` {#symbol-gesture}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L579)
- Parameters: `page`: `Page`; `view`: [`ViewReading`](#symbol-viewreading)

##### `gesture` — Summary
Clicks the element as a person would: never by scrolling a clipped container, but by panning the view until the
target is inside the frame, each pan a gesture, then clicking its center. Reports the short side of the target's box.

#### `legibleNames` {#symbol-legiblenames}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L602)
- Parameters: `page`: `Page`; `view`: [`ViewReading`](#symbol-viewreading)

##### `legibleNames` — Summary
How many of the files' names are legible on their cards now: in frame, uncovered, at reading size.

#### `backEnabled` {#symbol-backenabled}
- Type: const
- Source: [source](../../../../tests/e2e/still-picture.ts#L627)

#### `Scoreboard` {#symbol-scoreboard}
- Type: interface
- Source: [source](../../../../tests/e2e/still-picture.ts#L631)

#### `scoreboardTable` {#symbol-scoreboardtable}
- Type: function
- Source: [source](../../../../tests/e2e/still-picture.ts#L649)

##### `scoreboardTable` — Summary
The scoreboard of one bundle as a markdown table, one row per view, one column per number the deck defines.
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
<!-- LIVE-DOC:END Dependencies -->
