# Many folders, one World Map: a cold run

_Historical record of a probe run on 2026-11-19 at `e566dbb1`, by a builder for the root. It changed no product code, test or design document._

The owner asked on 2026-11-19: "What format is conducive to a user wanting to use the World Map to scan many directories and be able to wire them up out on that playing board?" The design agreed on 2026-10-09 ([the World Map's ticket T1](../../../../../../../.mdmd/layer-3/world-map.mdmd.md#open-questions)) says: opening a directory puts a thing on the board, named after the folder, with its `From` pointing at it, and scans it alone; the engine joins the scans into one graph. Nobody had walked that road as a person with commands, from several folders and no board, to one World Map. This probe walks it, on the estate sample's seven things copied out as seven sibling git repositories. The single-folder road was walked the same morning in [the cold run](../cold-run/README.md); its findings are not repeated here, only where they bite this road differently.

## The answer

**Yes, a stranger gets there today, but only by writing a board by hand from a design document, and only with the board in the folder above the things.** It took ten commands and one hand-written file of 35 lines, after four refusals of the board one line at a time. The World Map that came out drew ten of the sample board's eleven wires. The eleventh is the declared tunnel between two regions, which the smallest board does not declare. Each of the three wires to the shared contracts library carries one edge, where the one-scan build carries 13, 13 and 11. That is the cost the design already states for scans made alone.

- **Nothing makes a thing for you.** No command creates a board or adds a thing to one, so the gesture "point at a folder, get a thing" does not exist yet in any form. The CLI reference does not give the board's grammar either. The stranger has to find it in `.mdmd/layer-3/boards.mdmd.md` or copy the sample's `board.md`.
- **Only one placement of the board works.** With the board in a `maps/` folder beside the things, every `From` points outside the workspace. The board command lists seven "outside the workspace" lines and exits 0. The visualize command says nothing at all and builds a board of seven empty boxes. With the board inside one of the repositories, the thing whose `From` is that repository's own folder (`.`) gets no files, which is a bug. So the board must sit in the common parent, which in a set of sibling repositories belongs to no repository: the board and its configuration have nowhere to be committed.
- **Oracle through a linked server is not joined today.** The `OPENQUERY` script's doc says it depends on an object called `OPENQUERY`; the linked server's name and the query's table are both lost. A door the board declares (`- Serves: \`ORALINK\` (address)`) is drawn, but no scanned call can land on it, because the join never matches what the docs leave unlinked against what the board declares. Only a declared connection reaches it.

## The situation made

In a private scratch folder, the seven folders the sample's board names with a `From` were copied out as siblings, each made a git repository with one commit. `Database/SqlServer` and `Database/Oracle` became `SqlServer` and `Oracle`. There was no board and no `.live-docs.config.json` anywhere.

```
work/
  Contracts/  Gateway/  Hub/  Oracle/  PaymentService/  Portal/  SqlServer/
```

Files: Portal 11, Gateway 5, Contracts 6, Hub 4, PaymentService 6, SqlServer 2, Oracle 1. The tool was this worktree's checkout, built with `npm run build` (70 s at load 17 to 25). Every command ran from the checkout with `npm run -s <script> -- …` and `TMPDIR` inside the scratch folder. Wall time, processor time and the peak memory of the largest child process are from [measure.py](measure.py), since `/usr/bin/time` is not installed here. The machine was shared; the load average is given beside each timing.

## The road, step by step

### 1. Generate each folder alone

```bash
npm run -s live-docs:generate -- --workspace <scratch>/work/Portal
```

and the same for each of the other six. This is what the design says opening a folder does, and the CLI reference's `--workspace` makes it possible. Each printed its file index, its symbol index and a list of the docs it created, ending `Base layer processed 11 file(s): 11 created`.

| Folder | Docs | Doc bytes | Index bytes | Wall | Processor | Peak memory | Load |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Portal | 11 | 12,286 | 31,929 | 3.3 s | 4.8 s | 212 MB | 10.6 |
| Gateway | 5 | 5,514 | 14,786 | 3.9 s | 5.4 s | 211 MB | 10.3 |
| Contracts | 6 | 6,435 | 18,139 | 3.1 s | 4.3 s | 211 MB | 10.3 |
| Hub | 4 | 3,918 | 9,543 | 3.2 s | 4.6 s | 212 MB | 10.2 |
| PaymentService | 6 | 6,846 | 18,147 | 3.5 s | 4.9 s | 211 MB | 10.2 |
| SqlServer | 2 | 1,338 | 2,747 | 2.8 s | 3.7 s | 167 MB | 9.8 |
| Oracle | 1 | 631 | 1,063 | 2.6 s | 3.4 s | 170 MB | 9.7 |
| **All seven** | **35** | **36,968** | **96,354** | **22.4 s** | | **212 MB** | |

Each wrote exactly one folder, `.live-documentation/`, inside the repository it documented: a doc per source file under `source/` and the derived `index.json`. Nothing else in the folder changed. `git status --short` in every one of the seven repositories now shows one line, `?? .live-documentation/`, with no `.gitignore` entry written; with `--untracked-files=all`, Portal shows 12 untracked files. Seven repositories now each carry an untracked folder the person did not ask for by name. Those of the cold run's findings about where the output lands now apply seven times over.

### 2. Ask for the picture of the whole

A stranger who reads that `live-docs:visualize` builds "the World Map when a board is given" and has no board tries the parent folder first.

```bash
npm run -s live-docs:visualize -- --workspace <scratch>/work --output <scratch>/site-try1
```

It succeeded in 2.2 s and wrote 8.2 MB: `Graph: 0 files, 0 edges`, an Explorer with nothing in it. It did not say that seven folders below had docs, nor that a board is what joins them. **Fault 1.**

```bash
npm run -s live-docs:board -- --workspace <scratch>/work
```

`live-docs:board: Name the board file to read; the configuration names none as "board".` A clear message, but it points at a file nothing will make. **Fault 2: no command creates a board or adds a thing to one**, and the CLI reference names the board command without describing what a board contains. Here the stranger has to leave the CLI reference and `--help`: I went to the grammar table in `.mdmd/layer-3/boards.mdmd.md` and the sample's `board.md`.

### 3. Write the smallest board, one refusal at a time

The grammar table says "Every line is optional", so the first try was a title and seven things, each with a `From`. The board command refused it four times, one line each:

1. `board.md: line 3: expected "## Metadata", found "## Declared"`.
2. `board.md: line 6: expected "## Authored", found "## Declared"`.
3. With an empty `## Authored`: `board.md: line 8: the authored block must not start or end with a blank line`. The real fault is that the block is empty; the message describes something else.
4. With one line of prose under `## Authored`: `board.md: line 33: unexpected line undefined under oracle`. The board lacked a `### Connections` section, which must be present and must say `_No connections declared_` when empty. The message prints `undefined` where a line should be, at a line past the end of the file. **Fault 3: what is required is learned by refusal, and two of the four refusals mislead.**

The smallest board accepted is [board-a-parent.md](board-a-parent.md.txt): 35 lines and 376 bytes, of which 14 name the seven things and their folders and the rest is framing the grammar requires.

Two more things a person would type, both refused with a wrong reason:

- `npm run live-docs:board -- board.md --workspace <scratch>/work`: `board.md is outside the workspace <scratch>/work`. The board command resolves its file against the tool's checkout, while `live-docs:visualize -- --board board.md` resolves against the workspace. The message is false as written. **Fault 4.**
- `npm run live-docs:board -- <scratch>/work/board.md`, without `--workspace`: `… is outside the workspace /workspaces/…/agent-…` (the tool's checkout). This is the cold run's default-workspace finding, met here on the board's path instead of the docs'.

### 4. Read the board, then draw it

```bash
npm run -s live-docs:board -- <scratch>/work/board.md --workspace <scratch>/work
```

1.1 s, 83 MB, load 7.8. It printed `Scans (7): Hub, Oracle, Portal, Gateway, Contracts, SqlServer, PaymentService`, then the seven things with their doors, what they stand on and Hub's one ghost (the staging address in its `App.config`), then ten wires:

```
gateway -> contracts  [source]
gateway -> hub  net.tcp://hub.onprem.example:8731/PaymentHub (address)  [configuration]
hub -> contracts  [source]
hub -> payments  net.tcp://payments.onprem.example:8732/PaymentService (address)  [configuration]
payments -> contracts  [source]
payments -> sqlserver  dbo.Payment (table)  [contract]
payments -> sqlserver  dbo.usp_PostPayment (procedure)  [contract]
portal -> gateway  GET api/payments/{paymentId} (route)  [contract]
portal -> gateway  POST api/payments (route)  [contract]
sqlserver -> oracle  CENTRAL.ACCOUNT (table)  [contract]
```

```bash
npm run -s live-docs:visualize -- --workspace <scratch>/work --board board.md --output <scratch>/site-a
```

2.1 s, 82 MB, load 7.5: `Scans: …` (all seven), `Graph: 35 files, 43 edges`, `Board: board.md`, 8.2 MB written in 16 files, of which the data is 60.5 KB and the rest is the Explorer's own code and fonts. With a one-line configuration beside the board, `{ "board": "board.md" }`, the same build runs without `--board`. The CLI reference names the key, "the board the configuration names as `board`", but not the file's shape; the one line was a guess that worked.

### 5. Serve it

`npx http-server <scratch>/site-a -a 127.0.0.1 -p 8766 -c-1`, as the build prints. For the pictures, this probe served its three sites on ports 8930 to 8932 with a small server inside [capture.mjs](capture.mjs).

**The count.** Seven `generate`, one `board` (optional, as a check), one `visualize`, one serve: ten commands. One file written by hand, the board; a configuration is optional. 26 s of the tool's time at load 8 to 14, peak memory 212 MB.

## The three placements of the board

The reference is the sample's own board read over this repository's one-scan docs (`npm run live-docs:board -- tests/integration/programs/csharp/estate/board.md`): eleven wires, the ten above (with 13, 13 and 11 edges on the three wires to contracts) and `CLOUD -> ON-PREM over IPsec tunnel [declared]`.

| Placement | Board | World Map | Wires of the reference's eleven |
| --- | --- | --- | --- |
| (a) Board and configuration in the common parent | [board-a-parent.md](board-a-parent.md.txt) | Yes: seven things, every scan read | 10: all but the tunnel, which needs regions this board does not declare. The three wires to contracts carry 1 edge each, not 13, 13 and 11 |
| (b) Board in a sibling `maps/` folder | [board-b-maps.md](board-b-maps.md.txt), every `From` as `../<folder>` | Seven empty things, no wires | 0 |
| (c) Board inside one repository, Portal | [board-c-inside-portal.md](board-c-inside-portal.md.txt), Portal as `.` and the rest as `../<folder>` | Portal read but owning nothing, the rest outside | 0 |
| (d) The parent generated as one scan, the board as in (a) | the same as (a) | Yes, from the one scan | 10, with the full edge counts; the seven sibling scans are not read |

**(b) in a `maps/` folder.** `live-docs:board` printed `Scans (0): none`, the seven things with their `From` and no files, `Wires (0):`, and seven lines under `Wanting (7):`, each `portal comes from ../Portal, which is outside the workspace`. It exited 0. `live-docs:visualize` printed `Scans: none`, `Graph: 0 files, 0 edges`, `Board: board.md` and success, and nothing about the seven reports. What the page shows is in the pictures below. **Fault 5: a visualize that read nothing the board names succeeds silently.** The design (Boards, Not covered; T11) says a `From` outside the workspace is reported, and it is, but only by the other command.

**(c) inside Portal's repository**, as a person might try who owns one of the repositories and wants the neighbours drawn beside it. `Scans (1): the workspace root`, and then `portal  from : 0 files`, and under Wanting, besides six "outside the workspace", `portal has no docs under ` with nothing after it. **Fault 6, a bug:** a `From` that resolves to the board's own folder becomes the empty path, and `deriveBoardGraph` (`packages/engine/src/live-docs/boardGraph.ts`, line 134) finds a thing's files by `codePath.startsWith(\`${folder}/\`)`, which for the empty path matches no file. The scan at the root is read and then owned by no thing. This also bites the design's own first step whenever the board sits in the first folder opened.

**(d) the parent generated as one scan**, on a copy, after the siblings had their docs. The generator warned seven times, `A scan lies inside this folder at Gateway. This folder's docs are written all the same, but a scan never lies inside another: a board that names both reads only the scan of this folder.` It then wrote 44 docs. Seven of them are docs of the siblings' own `index.json` files (`source/Portal/.live-documentation/index.json.md`, 15 KB and 147 key symbols each). **Fault 7: an outer scan documents an inner scan's derived index as if it were source**, and the board counts it as one of the thing's files (`portal  from Portal: 12 files`). The board then reads ten wires with the full edge counts and lists the seven inner scans under Wanting as not read. This is the design's "scan the solution root and carve it on the board, and nothing is lost", and it holds, at the price of writing every doc twice when the folders already had their own.

### Further faults met on the way

- **A Windows path in `From` is not read (fault 8).** `- From: \`.\Contoso.Hub\`` gives `hub has no docs under .\Contoso.Hub`, though the folder has docs. `From` is read with forward slashes only. A Windows person writes `..\Portal`.
- **A folder name with a dot cannot be a thing's name (fault 9).** `` #### `Contoso.Hub` `` is refused, `expected a thing heading`, without saying why. The grammar allows letters, digits, `_` and `-`, since the first dot of a connection splits thing from door. .NET repositories are commonly named `Company.Product`, so "a thing named after the folder" needs a rule for these names. A folder name with a space (`Payment Service`) worked as a `From`.
- **The parent's configuration decides where every sibling's docs are looked for (fault 10).** With a configuration in the parent saying `"root": ".docs"`, both things were `has no docs under …`, though each folder had its docs under the default `.live-documentation`. A sibling generated with its own configuration, or with none, is invisible to a board read with another, and the report does not say that docs were found elsewhere. This is the design's stated gap (T11: "a thing with a configuration of its own is not read yet"); here is what a person sees of it.
- **Generating a folder before the board knows it gives no hint the other way.** Read before any generation, the board printed `portal has no docs under Portal` for each thing, without suggesting `live-docs:generate -- --workspace <folder>`.

## The pictures

Taken at 1440 by 900 in one browser hold of 12.7 s, after 17 minutes in the lane's queue, by [capture.mjs](capture.mjs). A thing was clicked where the page says it stands. A wire was pinned through the page's own handle, since the page offers no screen point for a wire. [capture-notes.txt](pictures/capture-notes.txt) has each picture's title line and the wires' identities. No board here has a Layout, so every picture shows the tool's own first placement.

**Placement (a), the board in the common parent.**

- [a-1-whole-board.png](pictures/a-1-whole-board.png): "Payments · 7 things", seven grey cubes on a white board, each named with its file count. No kinds were written, so all seven are the same cube. Wrong-looking: the first placement packs the cubes so tightly that they hide one another. Sqlserver's cube stands in front of the lower half of portal's, and oracle's in front of gateway's. Most wires run behind cubes, so portal's two route wires to gateway and the wires to oracle cannot be followed by eye. The footer still says "Context: Scan root" for a graph read from seven scans.
- [a-2-payments-pinned.png](pictures/a-2-payments-pinned.png): payments pinned. The panel reads well: "PaymentService", offers its net.tcp address in `App.config`, calls sqlserver, called by hub, stands on contracts and four packages, "open payments", and "6 files · 23 symbols" folded. Wrong-looking: the address door's label runs off the left edge of the view (`://payments.onprem…`), and the panel covers sqlserver, which payments calls.
- [a-3-wire-hub-payments-pinned.png](pictures/a-3-wire-hub-payments-pinned.png): the wire from hub to payments pinned. "hub calls payments from configuration", the address, `Hub/App.config → PaymentService/App.config`, "1 edge in the docs". Clear. The same door label is still cut at the left edge.
- [a-4-portal-entered.png](pictures/a-4-portal-entered.png): portal entered with a double-click. The Local Map in 2D, a "Portal" membrane holding App_Code, Controllers, Models, Pages, Scripts and Services, with cards for `Portal.csproj` and `Web.config`; "Context: Portal" in the footer and "Portal" in the search box. The thing entered is recognizable. Nothing on this screen shows that the other six things exist, nor the wire out to gateway (`Web.config` says "+2 connections").

**Placement (b), the board in `maps/`.**

- [b-1-whole-board.png](pictures/b-1-whole-board.png): the same seven cubes, each "0 files", solid as if they had been scanned, and "7 wanting" in orange beside the title. No doors, no wires. The footer says "0 files, 0 references".
- [b-2-wanting-listed.png](pictures/b-2-wanting-listed.png): "7 wanting" opens the help, whose Wanting list gives the seven "comes from ../Portal, which is outside the workspace" lines. This is the only place on the page that says why the board is empty, and it does not say what to do.
- [b-3-portal-pinned.png](pictures/b-3-portal-pinned.png): portal pinned: "portal thing, 0 files · 0 symbols". The panel does not say that its folder was not read, or why.

**The declared half, Oracle imagined.**

- [d-1-whole-board.png](pictures/d-1-whole-board.png): oracle is a hollow dashed drum, "database" under its name, the only thing with a kind. It stands close against sqlserver and gateway, and its doors crowd sqlserver's.
- [d-2-sqlserver-pinned.png](pictures/d-2-sqlserver-pinned.png): sqlserver pinned. "calls out to OPENQUERY · from a contract, in dbo.usp_LedgerTotals.sql; ORACLE_CENTRAL..CENTRAL.ACCOUNT · from a contract, in dbo.usp_PostPayment.sql; nothing on the board serves them; a ghost until something does". At the same time the oracle drum beside it offers `CENTRAL.ACCOUNT`. The picture contradicts itself: the panel says nothing serves a name the board's own Oracle serves.
- [d-3-oracle-pinned.png](pictures/d-3-oracle-pinned.png): oracle pinned. "imagined: no folder yet, nothing inside to open", offers `CENTRAL.ACCOUNT`, `ORALINK` and `ledger.entries`, each "declared", "called by sqlserver". The declared wires land on `ORALINK` and `ledger.entries`; the `CENTRAL.ACCOUNT` door's label hangs on the far side with nothing reaching it.

## The declared half: Oracle and a linked server

Oracle is never scanned at the owner's work. [board-declared-oracle.md](board-declared-oracle.md.txt) is board (a) with Oracle's `From` removed, its kind `database`, and three doors declared:

```markdown
#### `oracle`
- Kind: database
- Serves: `CENTRAL.ACCOUNT` (table), `ORALINK` (address), `ledger.entries` (table)

### Connections
- `sqlserver` to `oracle.ORALINK` over `linked server`
- `sqlserver` to `oracle.ledger.entries`
```

To the SqlServer sibling, in the scratch copy only, was added [dbo.usp_LedgerTotals.sql](dbo.usp_LedgerTotals.sql), whose query is `FROM OPENQUERY(ORALINK, 'select account_no, amount from ledger.entries') AS e`, and the folder was generated again.

**What the doc says** ([its copy](dbo.usp_LedgerTotals.sql.doc.txt)): one symbol, `dbo.usp_LedgerTotals`, a procedure at line 3, and one dependency, `` `OPENQUERY` (contract) ``. The SQL reader (`sqlReferences` in `packages/engine/src/live-docs/openings.ts`) blanks every string literal before it looks for names, so the query text inside the quotes, and its `ledger.entries`, is gone before anything reads it. Then `FROM OPENQUERY` matches its pattern for an object after `FROM`, the name stops at the parenthesis, and `OPENQUERY` is kept as an unresolved name, a contract by name. The linked server's name `ORALINK` is in no doc.

**Where the wire goes.** The board prints, on SqlServer, `ghost OPENQUERY (contract) from SqlServer/dbo.usp_LedgerTotals.sql` and `ghost ORACLE_CENTRAL..CENTRAL.ACCOUNT (contract) from SqlServer/dbo.usp_PostPayment.sql`. Of the wires, only the two declared connections reach Oracle:

```
sqlserver -> oracle  ORALINK (address)  over linked server  [declared]
sqlserver -> oracle  ledger.entries (table)  [declared]
```

The scanned wire of placement (a), `sqlserver -> oracle CENTRAL.ACCOUNT (table) [contract]`, is gone, though the imagined Oracle declares `CENTRAL.ACCOUNT` as a door. The script that calls it is now a ghost beside a door of the same name.

**Why.** Two separate gaps, read in the code:

1. **The join never matches a ghost against a declared door.** `deriveEstateGraph` (`estateGraph.ts`) links what one scan left unlinked to the doors other scans publish, and it reads only the docs' symbols. `deriveBoardGraph` (`boardGraph.ts`) makes wires only from edges that already land on a file (line 191), and adds the `Serves` doors to a thing's list after (line 179) without matching anything to them. A declared door is drawn as a promise; a scanned call to it stays a ghost. This holds for every kind of door, not only the linked server.
2. **The SQL reader cannot see a linked server's name in either form.** For a four-part name, `sqlObjectName` keeps the last two parts and a flag that a linked server carries it: `ORACLE_CENTRAL..CENTRAL.ACCOUNT` becomes `central.account`, linked, and the server's name is dropped. For `OPENQUERY`, nothing of the server or the query is read at all.

**Could `ORALINK` be carried as an address door today?** The door is accepted, drawn, and a declared connection lands on it. A scanned call cannot: even if the SQL reader kept `ORALINK`, an edge observed from SQL has the basis `contract`, and `targetsOf` in `estateGraph.ts` matches a contract edge only against route and database object doors; an address door is matched only by an edge from configuration (line 172), and exactly by name.

**The smallest change to the join**, not built:

- In `deriveBoardGraph`, after the ghosts are gathered, match each ghost against the doors other things declare under `Serves`, by the same rules `targetsOf` uses for doors in docs (a database object by schema and name, an address exactly, a route by the openings module's matching), and make a wire with the ghost's basis to that door; the ghost is then no longer a ghost. With that alone, the imagined Oracle's `CENTRAL.ACCOUNT` door catches `usp_PostPayment` again.
- In the SQL reader, read `OPENQUERY(<server>, '<query>')` (and `OPENROWSET`, which has the same shape) before string literals are blanked: the server's name, and the objects the inner query names, as references a linked server carries, the same shape `ORACLE_CENTRAL..CENTRAL.ACCOUNT` already has. Then `ledger.entries` lands on a table door of that name through the first change.

Whether the linked server's name should itself be a door, `ORALINK (address)`, is a design question for the owner, not settled here. The name is the SQL Server instance's own (it lives in `sys.servers`, not in the Oracle database), so a door of that name on Oracle states a fact about the caller's configuration. Carrying the server name would need the SQL reader to keep it and the join to match it, under a basis of its own or as an address, against the doors a board declares. Landing on the table is the smaller step and needs no new rule.

## Disk

Measured, for the whole result of the road in placement (a):

| Where | Files | Bytes |
| --- | ---: | ---: |
| Portal's repository | 12 | 44,215 |
| Gateway's | 6 | 20,300 |
| Contracts' | 7 | 24,574 |
| Hub's | 5 | 13,461 |
| PaymentService's | 7 | 24,993 |
| SqlServer's | 3 | 4,085 |
| Oracle's | 2 | 1,694 |
| The seven together | 42 | 133,322 (37 KB docs, 96 KB indexes) |
| The parent folder | 2 | 400: the board (376) and the configuration (24) |
| The built Explorer | 16 | 8,621,438 (60.5 KB data, the rest the Explorer's code and fonts) |

The per-repository totals are `du -sb` of each `.live-documentation/` folder and include its directories.

**An estimate, scaled by file count** to the largest corpus the cold run measured (DNN Platform, 10,777 docs, 118 MB of docs): at this sample's rate of 3.8 KB a file, docs and index together, 10,777 files would write about 41 MB into the repositories and about 18 MB of Explorer data on top of 8.6 MB of Explorer. That rate is far below DNN's measured 11 KB a doc, because the sample's files are small; the cold run's measured 118 MB of docs and 46 MB of Explorer are the better guide. Splitting a corpus into several scans does not change the docs' size; each scan has an index of its own, and their sum here (96 KB for 35 files) is of the same order as one index. The one-scan comparison (d) is not a clean one, because it also documented the seven inner indexes (its index is 245 KB).

## What one gesture, "point at a folder, get a thing", would have to do

Nothing does any of this today. In order:

1. **Scan the folder alone,** with the configuration the board will read it with, and say where the docs went. Today a person runs `generate` per folder and must keep every folder's configuration in step with the board's, by hand (fault 10).
2. **Find or create the board.** Create it in a folder above every thing it will hold, since a `From` outside the workspace is not read (placement b), with the sections the grammar requires (Metadata, Authored, Things, Connections; fault 3). Say where the board lives when that folder is in no repository.
3. **Add the thing,** named after the folder in a form the grammar accepts (a dot or a space in a folder name needs a rule; fault 9), with a `From` written with forward slashes, relative to the board's folder (fault 8), or `.` when it is the board's own folder (fault 6 must be fixed first).
4. **Refuse or carve when scans would nest.** A folder inside a scan already on the board is a carve, not a scan. A folder that holds scans already on the board would make them unread (case d), and its scan should not document their derived output (fault 7).
5. **Rebuild the map,** and report on the page what the join found wanting, as the board command does (fault 5).

## What was not finished

- The pictures of placement (c) and of case (d) were not taken; their commands' output is above.
- No run on Windows. Faults 8 and 9 are what a Windows .NET estate would meet first, but Windows itself was not tried.
- The two changes to the join and the SQL reader under the declared half are described, not built or tested.
- The estimate of disk is scaled by file count only, as asked.

The scratch folder was removed after the run. Everything kept is in this folder: the four boards, the `OPENQUERY` script and its doc, [measure.py](measure.py), [capture.mjs](capture.mjs) and the pictures.

_The four boards are kept here with `.txt` after their names (added by the root, 2026-11-19): as markdown files in this folder the workspace's own audit read them as documents and warned that a board titled Payments holds a thing named `payments`. Their text is as the builder wrote it._
