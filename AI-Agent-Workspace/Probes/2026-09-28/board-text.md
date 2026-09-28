# The board text: a grammar proposed

_Written 2026-09-28, late evening, after the owner's verdict on [board-file.md](board-file.md) ("Everything else, to me, seems to rock!"). A proposal with its forks marked, not a decision, and nothing is built. It is the fifth and last of the growths the vision's step 3 lists: what a person declares about an estate, in one small file._

## The family resemblance

A board is a markdown file in the Live Doc family: a title, a Metadata block, an Authored block of prose, and then strict sections that one module renders and parses, with the same round-trip property the Live Doc grammar has. Two things differ from a file's doc. The strict sections are written by a person, not a generator, so they carry no `LIVE-DOC` markers and lint checks their shape instead of refusing edits. And one of them, Layout, is also written by the tool: the viewer rewrites that section on save the way the generator rewrites a doc, replacing the numbers and leaving every other line as it found it.

Every name on the board is an identity. Pieces and districts are named in backticks, the names are unique, and every other line refers to them by name, so moving a folder changes one `From` line and nothing else.

## The sketch

The estate sample, as a board. Every line below is grammar; the words on the headings are on trial.

```
# Payments estate

## Metadata
- Layer: 3

## Authored
### Purpose
The consumer payment path from the portal to the ledger, as the business asks about it.

### Notes
The warehouse is imagined until its scripts are in source control.

## Declared

### Pieces

#### `portal`
- Kind: web
- From: `../portal`

#### `gateway`
- Kind: web
- From: `../gateway`

#### `hub`
- Kind: service
- From: `snapshots/hub-2026-09-28`

#### `warehouse`
- Kind: database
- Serves: `usp_PostPayment` (procedure), `dbo.Payments` (table)

### Districts
- `CLOUD` (cloud): `portal`, `gateway`
- `ON-PREM` (on-prem): `hub`, `warehouse`

### Tunnels
- `CLOUD` and `ON-PREM` over `site-to-site VPN`

### Edges
- `hub` calls `warehouse.usp_PostPayment`
- `portal` calls `gateway.POST api/payments`

## Layout
- `CLOUD` at 0, 0 to 8, 4
- `ON-PREM` at 10, 0 to 18, 4
- `portal` at 2, 1
- `gateway` at 5, 1
- `hub` at 12, 2
- `warehouse` at 16, 2
```

## The sections

| Section   | Line                                                          | Meaning                                                                                                                                        | Written by                    |
| --------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Metadata  | `- Layer: 3`                                                  | A board is one layer above a file's doc, which is what this repository's convention calls layer 3 and what the product numbers the same way.    | a person, once                |
| Authored  | `### Purpose`, `### Notes`, prose                             | What the board is for and what a reader must know, as in a file's doc.                                                                        | a person                      |
| Pieces    | `` #### `name` `` then `- Kind:`, `- From:`, `- Serves:`       | A system on the board. `Kind` is one of a closed list. `From` is a folder, live or a snapshot, relative to the board, written as a plain path rather than a link, because a board may name a snapshot that is not beside it and the board's own lint reports that rather than a link audit failing; its docs are found from there. A piece without `From` is imagined. `Serves` declares doors: an opening's name and kind. | a person                      |
| Districts | `` - `NAME` (kind): `piece`, `piece` ``                        | A tint on the board and the pieces in it. The kind picks the tint: `cloud`, `on-prem`, or none. A piece is in at most one district.            | a person                      |
| Tunnels   | `` - `A` and `B` over `technology` ``                          | A declared crossing between two districts, drawn where a wire between them crosses.                                                            | a person                      |
| Edges     | `` - `caller` calls `piece.door` `` or `` - `caller` calls `piece` over `technology` `` | An edge no scan can see, with `declared` as its basis. The door is an opening the target serves or declares; without a door the technology stands in for it. | a person                      |
| Layout    | `` - `piece` at x, y `` and `` - `DISTRICT` at x, y to x, y `` | Where a piece sits on the board plane and the rectangle a district tints, in board units. A piece with no line is placed by the tool and the line written on the next save. | a person or the tool          |

Piece kinds, proposed: `web`, `service`, `program`, `library`, `database`, `person`, and `system` for anything else. The first three and `library` are what a project file already publishes; `database` and `person` are what the picture draws that no manifest names; `system` is the catch-all. Door kinds are the opening kinds the docs already carry: `route`, `address`, `procedure`, `table`, `view`, `function`.

## What lint checks

Names are unique across pieces and districts. Every name a district, tunnel, edge or layout line uses is declared. A piece is in one district at most. A door named on an edge is served by the target, in its docs or its `Serves` line; if it is not, the edge stays and the report says so. A layout rectangle has a positive size. The file round-trips through the renderer byte for byte, as every Live Doc must.

## How a board joins the graph

Each piece's docs are read the way every consumer reads them today: the graph is derived from the docs under the piece's folder, live or snapshot. The estate step is new and small: over all pieces, a call one piece makes (a dependency line with `contract` or `configuration` as its basis, resolved to nothing inside its own folder) is matched to a door another piece serves, by the same rules the openings module already applies within a folder: routes by method and segments, addresses by equality, SQL objects by name. The matches are the wires. Declared edges add wires with `declared` as their basis. What a piece stands on is read from its manifests' docs. Nothing here needs a fact the docs do not carry, which is the rule.

## Drift

A declared kind against a manifest's kind, a declared door against a scanned one, a declared edge whose caller the scan says calls a different piece for the same door: each is drawn as declared and reported, never hidden, as agreed. The report is the owner's nudge: the configuration names one system and the person says another.

## Forks for the owner

- **The words.** Pieces, districts, tunnels, edges, layout; `Kind`, `From`, `Serves`; `calls`, `and ... over`. On trial like the map names.
- **The piece kinds.** The seven above, or fewer, or a different catch-all. `person` is the one worth a thought: an actor with no docs that calls doors, which the business audience may want to see.
- **Floors.** The layout gives a district a rectangle on one plane. For stacking, either a third number on the district line, a floor, or an arrangement the tool applies and then forgets, writing only the moved positions. The second keeps the grammar flat.
- **Where a board lives and how it is found.** Named by the host, a path the CLI takes, the file VS Code opens, the text inside an atlas; or a convention such as any file in the docs root whose Metadata says layer 3; or a list in the configuration. The first is the least machinery.

## Defaults taken, reversible

- Districts are flat, not nested; tunnels are between districts and undirected; edges say only `calls`, with no negations, because a scan is never hidden and a declaration is enough to say what is true.
- `Serves` is allowed on any piece, not only an imagined one, so a person can promise a door a scan cannot see; the report says when the scan disagrees.
- Metadata is the layer line and nothing else; the atlas carries the provenance.
- A piece's folder is any folder whose docs can be found, so a package inside this repository can be a piece of this repository's own board.
