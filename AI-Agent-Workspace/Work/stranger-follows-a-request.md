---
kind: issue
state: active
milestone: december-showing
order: 15
opened: 2026-11-21
---
# A stranger follows a request from the World Map down to its files

**For the owner.** This is your own use of the tool: showing colleagues on a shared screen how a payment travels, "the consumer payment portal talks to its API, to the WCF router on-prem over a tunnel, to the WCF service, to the databases". On 2026-11-21 six blind testers were asked exactly that of the estate sample ([the record](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/README.md#task-1-estate-trace-the-owners-own-journey)). All six gave the chain of systems in the right order. None named a file, because none went below the World Map, and the two strongest read a staging address as a fault in the payment's path.

**Done when.** Blind testers given that task, and the same question of two public codebases of other shapes, name the pieces in order at the grain of files, and none reports a fault that is not in the source.

**Rests on.** Thirty-two runs by models, on one build, most of them on one sample. Models "live on text" (your caution of 2026-11-19), so a stumble is counted from what a tester did and got wrong and never from what it wished for; a person may stumble elsewhere. The order of the tasks below is the order in which strangers stumbled, most often first, and is a reading of those runs, not a decision of what to build: each is to come to you as pictures of alternatives tried on strangers, the form you asked for on 2026-11-19.

**Waiting on the owner.** Their eye on two trials, neither blocking the work: which Step value is the default (root recommends With Its Lines), and which of the three arrivals. Both are live in their preview under Tuning → 2D Layout.

## Tasks

### Which way a line runs, and what it carries
- state: open
- holds: not begun
- evidence:

Every tester asked how a folder's files connect hedged the directions it read from lines and colours, and one had two backwards; all six who traced the payment guessed what the line from SQL Server to Oracle does, three of them wrongly ([the cards](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/estate-trace-sonnet-medium-look-only/shots/009-look.png)). Where a tester read a list in words instead, the reader's Dependents, it was right every time. Recurs from November 19 ("wires say nothing under the pointer").

### The view frames what was asked for
- state: active
- holds: three levers tried on strangers on 2026-11-21 (Framing, Arrival, Step) and a fourth built and not yet tried (Cut Counted); four faults of the camera mended in the default on the way; the defaults of Arrival and Step wait on the owner's eye
- evidence: [Framing tried on strangers](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/README.md#framing-tried-on-strangers), sixteen runs beside the eight under "By Hand": neither following value changes the first picture a stranger meets, and both take away the press that recovered the whole, since Fit becomes "Follow pins" and, pressed on one subject, changes nothing a person can see ([By Hand after Fit](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/estate-uses-sonnet-medium-look-only/shots/004-click.png), [Follows Pins after the same press](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/estate-uses-sonnet-medium-follows-pins/shots/004-click.png)). Six of eight testers pressed it and found the picture unchanged. Root's reading: "By Hand" stays the default; Framing is not the lever for the arrival. Then [Arrival tried on strangers](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/README.md#arrival-tried-on-strangers), twenty runs: arriving on the neighbours in place of reading size shows the whole neighbourhood at once and still readable on the estate ([the picture](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/estate-uses-sonnet-medium-arrival-neighbours/shots/001-look.png)), and all eight testers answered "what uses this file" rightly in five to seven actions, where reading size gave three of four in five to twelve; what it costs is the card's own words, which are no longer drawn, and on a file of this repository the picture becomes a map of where the file sits ([the picture](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/repo-uses-haiku-default-arrival-neighbours/shots/001-look.png)). Every tester handed the whole went straight to the reader's list in words and none read the drawing. The folder task is untouched by either setting: its cut-off picture comes from opening a folder inside the one asked for, which is a step and not an arrival. Root's reading: the owner's direction of 2026-11-04 (a link "can begin with one deliberately framed card") stands as the default, the two arrivals go to their eye side by side, and the open design is what a step frames.

Arriving on a pinned file cuts its neighbours off at both edges ([the picture](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/estate-uses-sonnet-medium-look-only/shots/001-look.png)); opening a folder pushes its files off the right and the bottom ([the picture](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/estate-directory-sonnet-medium-look-only/shots/007-click.png)). Four runs answered from a cut-off view and fell short. Recurs from November 19; then nine of ten testers recovered with fit, now one of four.

**What a step frames: alternatives set down by root on 2026-11-21, none built.** Today a step keeps the scale and pans the least distance that brings the opened folder's label and first row into view (the rule of 2026-11-19, after your "I might wish the camera followed the newly-opened one though, as I quickly lose it"). On the estate that shows `PaymentService/Data` opened with `Payment.cs` cut at the bottom and the file everything runs to, `PaymentService.cs`, cut at the right edge ([the picture](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/estate-directory-sonnet-medium-arrival-then-neighbours/shots/007-click.png)). Two principles pull against each other: *object constancy*, that what was pressed stays where it was and the size it was, so a person keeps their place; and *visibility of the result*, that what a press produced is on screen whole. Four ways to settle them, to be built as one lever and tried on strangers on the estate's folder, this repository's and a larger one, counted by answers read from a cut-off view:

1. *As now*: the scale kept, the least pan, the label and first row.
2. *Whole when it fits, out when it does not*: the scale kept where the opened folder fits whole at it; otherwise eased out just far enough to hold it whole, never past the scale at which names still read (the floor the Arrival lever uses), what was pressed kept still.
3. *The folder with what it connects to*: eased to the opened folder and the cards its lines reach, the frame Fit gives.
4. *The camera as now, and the cut said*: at each edge where the opened folder goes on beyond the window, a count of what lies there, which pans to it when pressed; nothing moves that the person did not move.

**Built as a trial and looked at, 2026-11-21** ([the pictures](../AgentSessionHistory/2026/11/2026-11-21/Screenshots/step-framing/README.md), on the day branch since `bb7615967`): Tuning → 2D Layout → **Step**, with *Least Pan* (the default, as now), *Whole* (the second above) and *With Its Lines* (the third). Root's eye on nine pictures: on the estate, With Its Lines shows `Data`, `App.config` and `PaymentService.cs` whole with every line of the step at nine tenths of reading size ([Least Pan](../AgentSessionHistory/2026/11/2026-11-21/Screenshots/step-framing/estate-data--least--rest.png), [With Its Lines](../AgentSessionHistory/2026/11/2026-11-21/Screenshots/step-framing/estate-data--lines--rest.png)), and answers the stumble; Whole buys little there. On a folder too large for any frame, this repository's `live-docs/history`, both new values are worse than what they replace: they throw the camera out to a third of reading size and still cut the folder ([Whole](../AgentSessionHistory/2026/11/2026-11-21/Screenshots/step-framing/repo-history--whole--rest.png)). So the second round: never ease out for a newcomer the floor cannot hold; a nearer bound for a step than for an arrival, tried; and the fourth above, the cut said at each edge, built as a lever of its own, since it complements any camera rule and is what the too-large folder needs. The second round is merged (`c5458a329`): an ease happens only where it delivers the whole, so the too-large folder keeps its scale under every value with its label and first row brought in ([the picture](../AgentSessionHistory/2026/11/2026-11-21/Screenshots/step-framing/repo-history--least--rest.png)); a nearer bound for a step was not compared, since no folder tried falls between the two bounds. The cut said at each edge is built as a lever of its own, **Cut Counted**, off by default (merged `ad4af67ff`; the counts reported wrong were a misread log, and a real fault in where a press lands was found and mended instead). On the too-large folder it says 27 above, 31 to the right and 4 below, each an arrow and a number at its edge's middle ([the picture](../AgentSessionHistory/2026/11/2026-11-21/Screenshots/step-framing/cut-counted--history--rest.png)), and a press brings the nearest card cut at that edge whole into view at the same scale ([after one press](../AgentSessionHistory/2026/11/2026-11-21/Screenshots/step-framing/cut-counted--history--after-press.png)). Root's eye: it reads at a glance and is the honest sign of hidden content the too-large folder lacked. Three things it does not yet do well: a card that lies up and to the right is counted at both edges, so the numbers sum to 62 for a folder of 32 cards, which counting each card at the edge it lies farthest past would mend; a control at an edge's middle can sit over a card's own controls; and reaching 27 cards one press at a time is slow. Not yet tried on strangers.

**Step tried on strangers, 2026-11-21** ([the record](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/README.md#step-tried-on-strangers), twenty runs on the build of 07:01 UTC). On the estate's folder, With Its Lines gave four of four testers the whole step after `Data/` opened ([the picture](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/estate-directory-haiku-default-step-lines/shots/007-click.png)) and none moved the camera; they answered in 5 to 9 actions. Least Pan gave none of four the whole: `App.config` now cut at the top under the search bar and `PaymentService.cs` still cut at the right ([the picture](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/estate-directory-haiku-default-step-least/shots/007-click.png)); three of the four pressed Fit and read names at about 9 px. No answer changed: all eight are partly right, for the cycle's returning line and the directions read from colours, which are other tasks of this issue. On this repository no step a tester took differed between the two values, the one large folder opened being beyond the floor, so the lever is unmeasured there. The instrument shows a tester only where a camera's move ends, so whether the ease itself loses a person's place is for a person's eye. Root's recommendation, the owner's eye deciding: With Its Lines as the default, since it does what Least Pan does wherever the floor cannot hold the whole and ends the cut view wherever it can.

Three faults of the camera were found and mended on the way, each the code falling short of its written rule, and they change the default: a folder chosen in the search stood centred on its name with the upper half of the window empty and is now framed by its whole box ([the picture after](../AgentSessionHistory/2026/11/2026-11-21/Screenshots/step-framing/estate-data--before.png)); the folder a search opened stood in for the next step's newcomer; an opened folder's first row was read from above its label. A fourth, mended in the second round: a directory opened by the handle on its label was not counted a step, and stayed cut at the window's edge.

### The way down from the World Map keeps the request in view
- state: open
- holds: not begun
- evidence:

No tester pressed a card's "open". The one that went to the Local Map found the estate's six folders closed, with dots inside and no line between them ([the picture](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/estate-trace-haiku-default-look-only/shots/005-click.png)), said it "doesn't show the request path", and turned back. The request, plain on the World Map, is not drawn at the scale a person lands on below it.

### A folder reached by its own name
- state: open
- holds: not begun
- evidence:

The World Map's box for `PaymentService/` says "payments". And a search for a folder's whole path lists its files under a heading that is the path, with no row for the folder itself ([the picture](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/repo-directory-haiku-default-look-only-2/shots/006-look.png)), under a field that says "Search files, symbols and directories": that part is a defect.

### A cycle's returning line
- state: open
- holds: not begun
- evidence:

The short loop and "1 connection returns in a cycle" on two cards read as a file linked to itself, or to its neighbour both ways; no tester named the cycle through the third file. Unchanged since November 19, after the returning connections were redrawn.

### Small signs misread
- state: open
- holds: not begun
- evidence:

The history scrubber's first button, drawn as media players draw "to the start", is "Previous marked commit" and moved one step; both narrative testers pressed it first. An address that nothing on the board serves, called "a ghost until something does", read as a fault to both Opus testers ([the card](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/estate-trace-opus-medium-look-only/shots/011-look.png)). The arrow chip on a symbol's row was taken for "who uses this". A click on a thing's name on the World Map does nothing. Opening a folder added pins nobody asked for. The repository's 3D map with its history open has "Scan root" in the search field and "Nothing connects to Scan root" beside it ([the picture](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/narrative-picture-opus-high/shots/001-look.png)); [reproduced](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/README.md#scan-root-reproduced-what-the-history-button-does): pressing History with nothing asked opens the whole by pinning the scan's root, and the search bar then treats the root as it treats any newest pin.

### The hub's code to its configuration: a connection the readers miss
- state: open
- holds: not begun; to be counted again once [the .NET reader is joined](readers-on-main.md)
- evidence:

Found while the task's answer was written from the source. `Hub/PaymentHub.cs` opens a WCF client by a name assembled from a prefix and the request's values, and no connection is drawn to `Hub/App.config`, which declares it; the same pattern with a constant name is read. So on the map the hub's code leads to its routing file and stops. Measured on the day branch, 2026-11-21: of the estate's 20 hand-verified edges 17 are found and 3 are missing (this one; `Default.aspx.designer.cs` to its page; `PostPaymentRow.cs` to the procedure whose columns it holds). The oracle test counts them and cannot fail on a missing one. A hypothesis only, to be measured on real WCF code before it is a rule: the client's contract type names the endpoint as surely as its name does.
