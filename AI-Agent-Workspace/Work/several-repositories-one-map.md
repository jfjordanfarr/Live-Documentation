---
kind: issue
state: open
milestone: december-showing
order: 50
opened: 2026-11-20
---
# Several repositories on one map

**For the owner.** "What my software systems _actually look like_" is more than one repository: the application, its database repositories, the scripts that run them. The World Map is where that is drawn, and you have said it is "home for the least defined concepts in the whole app". Walked cold on 2026-11-19, the road from several folders to one map took ten commands and a board written by hand that was refused four times ([the run](../AgentSessionHistory/2026/11/2026-11-19/Probes/many-scans/README.md)).

**Done when.** One command, given the folders, makes a map on which each repository is a piece and a connection between two pieces is one the code really makes; a stranger does it without reading a design document.

**Rests on.** One command given several folders. The owner's picture is another: a blank Explorer whose World Map holds one piece "begging to be pointed somewhere, filled with a recursive scan" (2026-11-19), and on 2026-11-21, "I would scope to the solution level for most world map objects, where each world map object is a recursively scanned directory." ([their words](../AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-1)) So a piece is a solution's folder, scanned alone, and the board grows by scans. If the page comes first, the first task below is that page's opening screen and not a command.

**Database projects, asked on 2026-11-21** ([Turn 6](../AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-6)): "what user guidance would you suggest for someone like me who wants to scan database projects? One DB = one scanned object represented in the World Map?" Root's guidance, given that turn and not a decision: yes. A database is the space in which a bare name has one meaning, the SQL reader binds every name in one scan as one database, and a line is drawn only inside one scan; so one database to a scan, alone or with the one application that owns it, and several databases never in one scan until a reader finds their bounds (a database project file is one database; [the readers' next piece](readers-on-main.md)). Between pieces a line is drawn only where the code names the other piece, the third task below. And their ask the same turn: "can we have a button to update all our scanned items if a connection still exists to their directories? That would make the documentation very live indeed!" ([ideas.md](../Memory/ideas.md#the-world-map-and-boards)).

**Waiting on the owner.** Nothing.

**A checkpoint, root's.** If this is not near when the showing comes, the showing rests on each solution's own map, which the issues before this one make true, and this goes on after it. Nothing here is to be built halfway for the date.

## Tasks

### A board made by one command from the folders named
- state: open
- holds: not begun
- evidence:

Each folder scanned alone, as the World Map's plan has said since 2026-10-09 (a piece is what a person puts on the board; opening a directory scans it alone).

### The ten faults of the walked road, in the order met
- state: open
- holds: listed in the run's record
- evidence:

Among them: a `From` of `.` owns no files; a board beside its things reads nothing and shows cubes of "0 files"; a Windows path in `From` is not read; a folder's name with a dot cannot be a piece's name.

### Connections between pieces, by the owner's rule
- state: open
- holds: not begun
- evidence:

No link sooner than "a hailstorm of false positive links". Candidates, each measured on the public corpora first: C# to a stored procedure it names; a PowerShell script to SQL it runs; the linked server's door (with [the readers](readers-on-main.md)).

**The owner's picture of the wiring, 2026-11-21** ([Turn 8](../AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-8)): "we have good intellisense into each scanned object and some recommendations for what symbols and things we think _might_ touch each other (noting that false positives are very high, making intellisense-like suggestions the very best we could do on our own in many cases)". So a person wires and the tool helps: the field completes from what each scan found (recognition over recall), and a candidate is a suggestion shown with the line of code it rests on, drawn only when accepted, as the World Map's design has said since 2026-10-09 ("A suggestion never creates a thing"). Root's reading of where suggestions come from: a ghost in one piece (a name a file uses that its scan cannot find) and a declaration of that name in another. The same suggestions as data from a command, accepted by a line in the board's file, for an agent or a pipeline.

### A first placement that can be read
- state: open
- holds: not begun
- evidence:

With no layout given, the first placement stood two cubes in front of two others with most wires behind them; entering a piece gave no sign of the other six.
