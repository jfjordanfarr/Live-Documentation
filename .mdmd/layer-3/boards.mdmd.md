# Boards

## Metadata

- Layer: 3
- Audience: Contributors

_Current as of 2026-10-09._

## Authored

### Purpose

Describe the board text: what a person declares about an estate, in one small markdown file in the Live Doc family, and how it joins the docs to give the World Map its things, doors and wires. This landed on 2026-09-28 as the last of the five growths the vision's step 3 lists, the same evening the owner set its shape: two nouns, kinds as free labels drawn through a legend, floors as an arrangement the tool forgets, and where a board lives deferred to the host that opens it. The proposal it was built from, with the owner's words, is the probe record's [board-text.md](../../AI-Agent-Workspace/Probes/2026-09-28/board-text.md); what is traded around and who writes positions is weighed in [board-file.md](../../AI-Agent-Workspace/Probes/2026-09-28/board-file.md).

### The model

- **A board is a markdown file** with a title, a Metadata block whose `Layer` is one above a file's doc, an Authored block, and strict sections that `board.ts` renders and parses with the same round-trip property the Live Doc grammar has. A person writes the strict sections, so they carry no `LIVE-DOC` markers and lint checks their shape instead of refusing edits.
- **Two nouns.** A thing is anything on the board: a system with a folder of docs, a database, a person, a region that holds other things, or something imagined and not yet built. A connection is a wire a person declares between two things. The distinctions the picture draws come from three fields: `Holds`, the things inside this one, which is drawn around them; `Serves`, the doors a thing promises whether or not a scan finds them; and `From`, the folder its docs come from, absent on an imagined thing.
- **Every name is an identity.** Things are named once, in backticks, and every other line refers to them by name, so moving a folder changes one `From` line and nothing else.
- **A kind is any word**, drawn through the Legend: a shape for a thing that holds nothing, `cube`, `tile`, `drum`, `figure`, `sheet` or `cloud`, and a tint for a thing that holds things, `blue`, `orange`, `green`, `grey`, `violet` or `rose`. The tool knows defaults for the kinds manifests publish, `web`, `service` and `program` as a cube and `library` as a tile, and for `database`, `person`, `cloud` and `on-prem`; a legend line overrides or adds, and the help control shows the legend.
- **Layout is positions only**, two numbers per thing in board units, written by a person or by the tool on save. A thing that holds things needs none; its region is drawn around what it holds. Stacking regions as floors is an arrangement the tool applies and then forgets, writing only the moved positions.

### The grammar

| Section     | Line                                                                                | Meaning                                                                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Metadata    | `- Layer: 3`                                                                        | One above a file's doc.                                                                                                                                                   |
| Authored    | `### Purpose`, `### Notes`, prose                                                   | What the board is for and what a reader must know, as in a file's doc.                                                                                                    |
| Things      | `` #### `name` `` then `- Kind:`, `- From:`, `- Serves:`, `- Holds:`, in that order | A name of letters, digits, `_` and `-`; a kind of the same characters; a plain path in backticks; doors as `` `name` (kind) ``; held names in backticks. Every line is optional. |
| Connections | `` - `a` to `b` ``, `` - `a` to `b.door` ``, either with `` over `technology` ``     | A connection with `declared` as its basis. The door is an opening the target serves or declares. The thing's name holds no dot, so the first dot splits thing from door.   |
| Legend      | `` - `kind` as word ``                                                              | A shape or a tint the tool ships. The section is absent when empty.                                                                                                       |
| Layout      | `` - `name` at x, y ``                                                              | Two numbers, decimals allowed, in canonical form. The section is absent when empty.                                                                                       |

An empty Things or Connections section says so, `_No things declared_` or `_No connections declared_`, as a Live Doc says `_No public symbols detected_`.

### What lint checks

Names are unique. Every name a `Holds`, a connection or a layout line uses is declared. A thing is held by at most one other, and holds nothing that leads back to it. A door's kind is an opening kind. A legend word is a shape or a tint. The layout names each thing once. A connection does not join a thing to itself. What needs the docs is checked where the board meets the graph, and reported rather than refused: a `From` that resolves to no docs, a `From` outside the workspace, a declared door nothing serves.

### Where a board meets the graph

`boardGraph.ts` joins a parsed board to the graph derived from the workspace's docs:

- **Files.** A doc belongs to the thing whose folder contains it, the deepest folder winning, so a thing nested inside another keeps its own files. `From` paths resolve against the board's folder.
- **Doors.** A thing serves the public symbols of its files whose kind is an opening kind, `route`, `address`, `procedure`, `table`, `view` or `sql-function`, and then the doors its `Serves` line promises, without repeats.
- **Wires.** An edge from a file of one thing to a file of another is a wire between the two, grouped by the door it lands on and the basis it was observed with, and counted. This is what Structurizr calls an implied relationship. A declared connection is a wire of its own with `declared` as its basis and the technology it names.
- **Standing on and ghosts.** What a thing stands on is what its manifests name and no doc answers to, read from the manifests' edges. A ghost is what a thing's files name under a basis that nothing on the board serves, a route, an address or a database object, one per name and basis with the files that name it: the owner's word (2026-10-09) for a call whose other half is not on the board, a line without a link on the doc that the estate's graph matches when another scan serves it.
- **Kinds.** A kind is the person's label. The manifest's kind is only the default when none is given, so kinds do not drift.

### Several scans, one graph

Since 2026-10-09 a thing may come from a folder scanned alone, with docs of its own under the configured root ([the World Map's first ticket](world-map.mdmd.md#open-questions)). `readEstateGraph` in `graphFiles.ts` reads the scans a board names, the workspace root when it has docs and the folder of every thing whose `From` has them, and `estateGraph.ts` merges them into one graph keyed by each file's path from the workspace root. What a scan left unlinked because the other side was out of its sight is then matched across scans by what the docs carry: a route call to a route door by the openings module's own matching, an address to an address door exactly, a database object to its declaration by schema and name, a project reference kept by name to the project another scan publishes. A route call a scan linked at home, a server's client calling a route its own project also serves, gains the servers other scans publish; a browser script's call stays at home. A scan never lies inside another scan: a folder with docs inside another scan is reported and not read, the outer scan standing for it, and the generator warns when a run would nest. One scan at the root is the single graph of before, so a board over one workspace reads as it did. The join is unchanged by all this; it reads one graph and one board. [The probe](../../AI-Agent-Workspace/Probes/2026-10-09/two-scans.md) that settled the shape scanned the estate sample's seven things alone and compared the wires with the one-scan build's; `tests/integration/live-docs/estate.test.ts` keeps that comparison, with its one stated cost: a type reference to a class outside the scan resolves to nothing, so the wires to a shared library carry the project reference alone where one scan carries every use. Scan the solution root and carve it on the board, and nothing is lost.

### Measured against

The estate sample's board, `tests/integration/programs/csharp/estate/board.md`: nine things, two of them regions, and one declared tunnel. The integration test generates the docs over a copy of the fixture, joins the board to them and checks that every remote hand-verified edge appears as a wire between the two things that hold its files. All six do, as five pairs of things with their doors, two routes, two addresses, a procedure and two tables, and their bases. The board reads eleven wires in all: those seven, three to the shared contracts library from source, and the tunnel. This repository's own board, `.mdmd/layer-3/board.mdmd.md`, is read by the same test against the committed docs and by `npm run live-docs:board`: seven things and ten wires, all from source.

### Not covered

- Snapshots, and a `From` outside the workspace, which is reported; a thing's docs come from a scan at or below the workspace root, read with the one configuration given, so a thing with a configuration of its own is not read yet (T11 of the World Map's plan).
- Wires between regions implied from their members, and what a closed region shows on its boundary. [A survey](../../AI-Agent-Workspace/Research/2026-09-28-groups-and-nested-boards.md) of how canvases and diagram tools collapse groups was gathered for it: every one derives a closed box's wires from its children and stores nothing, and none closes a group because the camera moved.
- The Explorer writes Layout only by download: a moved thing is kept in the browser's storage, and "save board" hands back the text with its Layout rewritten. The Legend is not written yet, nor the single self-saving file that carries a board with its docs and provenance, nor the import that brings a returned file home with the difference shown. The proposal is the probe record's board-file.md.
- A board as a thing on another board, which the owner called a stretch goal.
- How a board is found when no host names it: a path the CLI takes, the file VS Code opens, the text inside a bundle, until a feature needs more.
- The vision's picture still says piece, district, tunnel and wire; thing, region, crossing and wire would match the text, to be changed when the World Map is built.

## System References

### Components

- [packages/engine/src/live-docs/board.ts](../layer-4/packages/engine/src/live-docs/board.ts.mdmd.md)
- [packages/engine/src/live-docs/boardGraph.ts](../layer-4/packages/engine/src/live-docs/boardGraph.ts.mdmd.md)
- [packages/engine/src/live-docs/estateGraph.ts](../layer-4/packages/engine/src/live-docs/estateGraph.ts.mdmd.md)
- [packages/engine/src/live-docs/graphFiles.ts](../layer-4/packages/engine/src/live-docs/graphFiles.ts.mdmd.md)
- [scripts/live-docs/board.ts](../layer-4/scripts/live-docs/board.ts.mdmd.md)

### Related

- [Openings](openings.mdmd.md), whose kinds are the door kinds
- [Architectural Decisions](architectural-decisions.mdmd.md), under "The Board Text"
- [The vision](../layer-1/vision.mdmd.md), under "The picture" and step 3
- [This repository's board](board.mdmd.md)
- [The World Map's plan](world-map.mdmd.md), the design in progress that this grammar serves

## Evidence

- [packages/engine/src/live-docs/board.test.ts](../layer-4/packages/engine/src/live-docs/board.test.ts.mdmd.md)
- [packages/engine/src/live-docs/boardGraph.test.ts](../layer-4/packages/engine/src/live-docs/boardGraph.test.ts.mdmd.md)
- [tests/integration/live-docs/board.test.ts](../layer-4/tests/integration/live-docs/board.test.ts.mdmd.md)
- [packages/engine/src/live-docs/estateGraph.test.ts](../layer-4/packages/engine/src/live-docs/estateGraph.test.ts.mdmd.md)
- [tests/integration/live-docs/estate.test.ts](../layer-4/tests/integration/live-docs/estate.test.ts.mdmd.md)
