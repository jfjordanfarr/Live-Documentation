# The board text: a grammar proposed

_Written 2026-09-28, late evening, after the owner's verdict on [board-file.md](board-file.md) ("Everything else, to me, seems to rock!"), and revised the same evening after their answers to its four forks. A proposal, not a decision, and nothing is built. It is the fifth and last of the growths the vision's step 3 lists: what a person declares about an estate, in one small file._

## The family resemblance

A board is a markdown file in the Live Doc family: a title, a Metadata block, an Authored block of prose, and then strict sections that one module renders and parses, with the same round-trip property the Live Doc grammar has. Two things differ from a file's doc. The strict sections are written by a person, not a generator, so they carry no `LIVE-DOC` markers and lint checks their shape instead of refusing edits. And two of them, Legend and Layout, are also written by the tool: the viewer rewrites them on save the way the generator rewrites a doc, replacing what changed and leaving every other line as it found it.

Every name on the board is an identity. Things are named in backticks, the names are unique, and every other line refers to them by name, so moving a folder changes one `From` line and nothing else.

## What the owner's answers changed

- **Two nouns.** Asked to justify pieces, districts, tunnels and edges: "make the case to me that it should be any more complex than 'Thing' and 'Connection'." The case fails. A district is a thing that holds other things, a tunnel is a connection between two such things, a piece is a thing that holds nothing, and an edge is a connection. The distinctions the four words carried do not vanish; they move into three fields, `Holds`, `Serves` and `From`, and into how the picture draws them: a thing that holds things is drawn as a tinted region around them, a thing that holds nothing as a shape, a connection between two regions as a crossing, and a `Serves` line as doors. The text has two sections of meaning, Things and Connections, and a reader who knows those two words can read all of it.
- **Kinds are free labels, drawn through a legend.** "It just doesn't bother me to have folks define the whole enum set themselves as they need it, a new enum minted each user-defined type is applied... there are so very many different things a directory could be." And: "Plop down a thing representing a directory (or maybe even group of directories?) and give it a shape/icon, and away you go! Throw a label on there of what kind of thing it is (label the shape/icon primitive? maintain a legend?)." So `Kind` is any word a person chooses, the board carries a Legend that maps each kind to one of a small set of shape primitives the tool ships, or to a tint for a thing that holds things, and the tool fills in defaults for the kinds it already knows from manifests. The help control shows the legend.
- **Floors are an arrangement, not a fact.** "The second, most likely." The tool offers to arrange the holding things side by side or stacked, moves what it must, writes only the moved positions, and remembers nothing else. The grammar stays flat: a position is two numbers.
- **Where a board lives is deferred.** "How far can we defer before needing to specify this? This feels somewhat like an implementation detail." It can be deferred until a host has to find a board it was not handed, which is not the first build: the CLI takes a path, VS Code opens a file, an atlas carries the text. A convention or a configuration list is needed only when boards must be discovered, for a bundle that includes every board in a workspace, and that decision can wait for that feature. The one fact fixed now is that a board is a file with no required name.

## The sketch

The estate sample, as a board. Every line below is grammar.

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

### Things

#### `CLOUD`
- Kind: cloud
- Holds: `portal`, `gateway`

#### `ON-PREM`
- Kind: on-prem
- Holds: `hub`, `warehouse`

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

### Connections
- `CLOUD` to `ON-PREM` over `site-to-site VPN`
- `hub` to `warehouse.usp_PostPayment`
- `portal` to `gateway.POST api/payments`

## Legend
- `cloud` as blue
- `on-prem` as orange
- `web` as cube
- `service` as cube
- `database` as drum

## Layout
- `portal` at 2, 1
- `gateway` at 5, 1
- `hub` at 12, 2
- `warehouse` at 16, 2
```

## The sections

| Section     | Line                                                                            | Meaning                                                                                                                                                                                                                                                                             | Written by           |
| ----------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Metadata    | `- Layer: 3`                                                                    | A board is one layer above a file's doc, which is what this repository's convention calls layer 3 and what the product numbers the same way.                                                                                                                                         | a person, once       |
| Authored    | `### Purpose`, `### Notes`, prose                                               | What the board is for and what a reader must know, as in a file's doc.                                                                                                                                                                                                             | a person             |
| Things      | `` #### `name` `` then `- Kind:`, `- From:`, `- Serves:`, `- Holds:`             | Anything on the board. `Kind` is any word. `From` is a folder, live or a snapshot, as a plain path relative to the board, and its docs are found from there; a thing with neither `From` nor `Holds` is imagined. `Serves` declares doors, an opening's name and kind. `Holds` names the things inside this one, which is drawn around them. | a person             |
| Connections | `` - `a` to `b` `` or `` - `a` to `b.door` ``, either with `` over `technology` `` | A connection no scan can see, with `declared` as its basis. The door is an opening `b` serves or declares; between two things that hold things it is drawn where wires cross.                                                                                                       | a person             |
| Legend      | `` - `kind` as shape `` or `` - `kind` as tint ``                               | How a kind is drawn: a shape for things that hold nothing, a tint for things that hold things. Kinds the tool knows have defaults; a line here overrides or adds.                                                                                                                    | a person or the tool |
| Layout      | `` - `name` at x, y ``                                                          | Where a thing sits on the board plane, in board units. A thing with no line is placed by the tool and the line written on the next save. A thing that holds things needs no line; its region is drawn around what it holds.                                                          | a person or the tool |

`From` is a plain path rather than a link because a board may name a snapshot that is not beside it, and the board's own lint reports that rather than a link audit failing.

## Shapes and tints

Starter sets, shipped with the tool and extended by shipping more, never by network:

- Shapes: `cube` for something that runs, `slab` for something that is only stood on, `drum` for something that stores, `figure` for a person, `sheet` for content and assets, `cloud` for something outside anyone's folder. The default for an unknown kind is `cube`.
- Tints: `blue`, `orange`, `green`, `grey`, `violet`, `rose`, each drawn light on the white board and deep on the dark one. The default for an unknown kind is `grey`.
- Defaults the tool knows: `web`, `service`, `program` as `cube`; `library` as `slab`; `database` as `drum`; `person` as `figure`; `cloud` as `blue`; `on-prem` as `orange`, which are the owner's colours at their firm.

The legend is what the help control shows, so the picture always has its key, which is the one rule every notation in the survey agreed on.

## What lint checks

Names are unique. Every name a `Holds`, a connection or a layout line uses is declared. A thing is held by at most one other, and a thing does not hold itself through any chain. A door named on a connection is served by its target, in its docs or its `Serves` line; if it is not, the connection stays and the report says so. A `From` that resolves to nothing is reported, not refused, because an atlas may carry it. A legend line names a known shape or tint. The file round-trips through the renderer byte for byte, as every Live Doc must.

## How a board joins the graph

Each thing's docs are read the way every consumer reads them today: the graph is derived from the docs under its folder, live or snapshot. The estate step is new and small: over all things, a call one makes (a dependency line with `contract` or `configuration` as its basis, resolved to nothing inside its own folder) is matched to a door another serves, by the rules the openings module already applies within a folder: routes by method and segments, addresses by equality, SQL objects by name. The matches are the wires. Declared connections add wires with `declared` as their basis. What a thing stands on is read from its manifests' docs. Nothing here needs a fact the docs do not carry, which is the rule.

## Drift

A declared door against a scanned one, or a declared connection whose source the scan says reaches a different thing for the same door: each is drawn as declared and reported, never hidden, as agreed. Kinds no longer drift: a kind is the person's label, and the manifest's kind is only the default when none is given.

## Deferred

- How a board is found when no host names it: a convention or a configuration list, decided with the feature that needs it.
- The words in the vision's picture, piece, district, tunnel and wire, would become thing, region, crossing and wire to match the text; to be changed when the World Map is built, unless the owner wants it sooner.

## Defaults taken, reversible

- Connections are written `to`, with the door on the target and `over` optional; a connection between two holding things needs no door and is drawn as a crossing. No negations, because a scan is never hidden and a declaration is enough to say what is true.
- `Serves` is allowed on any thing, not only an imagined one, so a person can promise a door a scan cannot see; the report says when the scan disagrees.
- Metadata is the layer line and nothing else; the atlas carries the provenance.
- A thing's folder is any folder whose docs can be found, so a package inside this repository can be a thing on this repository's own board, and a thing may hold things that have folders, which is the owner's "group of directories".
