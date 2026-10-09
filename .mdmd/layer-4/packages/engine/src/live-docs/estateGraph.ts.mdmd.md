# packages/engine/src/live-docs/estateGraph.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/estateGraph.ts
- Generated At: 2026-10-09T20:42:16.232Z

## Authored
### Purpose
The estate's graph: the scans a board names, one graph per folder scanned alone, merged into one graph keyed by each file's path from the estate's root, with what each scan left unlinked matched across scans by what the docs carry. A route call to a route door by the openings module's own matching, an address to an address door exactly, a database object to the object that declares it by schema and name, a project reference kept by name to the project another scan publishes, by its symbol or its file's stem. Each match links the edge and keeps its basis; a name no scan serves stays as it was, a ghost. A route call a scan linked at home, a server's client calling a route its own project also serves, gains the servers other scans publish, while a browser script's call stays at home, as the generator keeps it. One scan at the estate's root is returned as it is. Nothing here reads the file system.

### Notes
- Written on 2026-10-09 as the build of the World Map's first ticket, what a thing is when two directories are opened and no board exists ([Turn 10 of the October 9 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-09.1.record.md#turn-10)), after [the probe](../../../../../../AI-Agent-Workspace/Probes/2026-10-09/two-scans.md) scanned the estate sample's seven things alone and found that eight of the one-scan build's eleven wires crossed by name. The three that did not were two gaps in what the docs wrote, since fixed in the adapters, and the home fallback of `chooseServers` in `openings.ts`, which this module answers at the estate's level rather than in the scan, because a client class built beside its API is as real as a front end proxying to a backend of the same route shape (the owner, Turn 8), and only the estate knows whether a server away exists.
- Routes match by shape, so in an estate where several things serve `GET api/health` a client's call is wired to each, every wire with its basis and evidence, as a single scan already does when several servers match; a declared connection on the board is where a person says which is true. A browser script with an absolute URL into another system of the same route shape stays at home here, the one case the extension rule misses.
- A type reference to a class outside the scan resolves to nothing, so the wires to a shared library carry the project reference alone where one scan over the solution carries every use; `tests/integration/live-docs/estate.test.ts` states that cost. Scanning the solution root and carving it on the board is how a person avoids paying it.
- The reader of the scans, `readEstateGraph` in `graphFiles.ts`, decides which folders are scans and refuses one inside another; this module throws if handed such a pair. Measured by `estateGraph.test.ts` on hand-built scans and by the estate's seven scans in the integration test.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `EstateScan` {#symbol-estatescan}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/estateGraph.ts#L35)

##### `EstateScan` — Summary
One scan of the estate: the folder it covers and the graph its docs derive.

#### `deriveEstateGraph` {#symbol-deriveestategraph}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/estateGraph.ts#L64)
- Returns: [`LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph)
- Parameters: `scans`: [`EstateScan`](#symbol-estatescan)[]; `location`: [`DocLocation`](./graph.ts.mdmd.md#symbol-doclocation)

##### `deriveEstateGraph` — Summary
Joins the scans of an estate into one graph.

##### `deriveEstateGraph` — Parameters
- `location`: Where the docs are, within each scan; the merged graph carries the same.
- `scans`: The scans, none inside another. One scan at the estate's root is returned as it is.

##### `deriveEstateGraph` — Exceptions
- _Unknown_: When two scans share a folder or one lies inside another, which the reader refuses before it comes here.

#### `contains` {#symbol-contains}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/estateGraph.ts#L194)

##### `contains` — Summary
True when `inner` is the same folder as `outer` or lies inside it; the empty folder is the root and contains everything.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`board.DOOR_KINDS`](./board.ts.mdmd.md#symbol-door_kinds)
- [`document.symbolName`](./document.ts.mdmd.md#symbol-symbolname)
- [`graph.DocLocation`](./graph.ts.mdmd.md#symbol-doclocation) (type-only)
- [`graph.GraphEdge`](./graph.ts.mdmd.md#symbol-graphedge) (type-only)
- [`graph.GraphFile`](./graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`graph.LiveDocGraph`](./graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`openings.ADDRESS_KIND`](./openings.ts.mdmd.md#symbol-address_kind)
- [`openings.MANIFEST_KINDS`](./openings.ts.mdmd.md#symbol-manifest_kinds)
- [`openings.PROJECT_KINDS`](./openings.ts.mdmd.md#symbol-project_kinds)
- [`openings.ROUTE_KIND`](./openings.ts.mdmd.md#symbol-route_kind)
- [`openings.SQL_OBJECT_KINDS`](./openings.ts.mdmd.md#symbol-sql_object_kinds)
- [`openings.parseRouteSymbol`](./openings.ts.mdmd.md#symbol-parseroutesymbol)
- [`openings.routesMatch`](./openings.ts.mdmd.md#symbol-routesmatch)
- [`openings.sqlNameMatches`](./openings.ts.mdmd.md#symbol-sqlnamematches)
- [`openings.sqlObjectName`](./openings.ts.mdmd.md#symbol-sqlobjectname-function)
<!-- LIVE-DOC:END Dependencies -->
