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

**Waiting on the owner.** Nothing.

## Tasks

### Which way a line runs, and what it carries
- state: open
- holds: not begun
- evidence:

Every tester asked how a folder's files connect hedged the directions it read from lines and colours, and one had two backwards; all six who traced the payment guessed what the line from SQL Server to Oracle does, three of them wrongly ([the cards](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/estate-trace-sonnet-medium-look-only/shots/009-look.png)). Where a tester read a list in words instead, the reader's Dependents, it was right every time. Recurs from November 19 ("wires say nothing under the pointer").

### The view frames what was asked for
- state: active
- holds: with the playtests' builder since 2026-11-21: each value of the Framing setting tried on strangers beside "By Hand", which stands on `main`
- evidence:

Arriving on a pinned file cuts its neighbours off at both edges ([the picture](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/estate-uses-sonnet-medium-look-only/shots/001-look.png)); opening a folder pushes its files off the right and the bottom ([the picture](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/estate-directory-sonnet-medium-look-only/shots/007-click.png)). Four runs answered from a cut-off view and fell short. Recurs from November 19; then nine of ten testers recovered with fit, now one of four.

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

The history scrubber's first button, drawn as media players draw "to the start", is "Previous marked commit" and moved one step; both narrative testers pressed it first. An address that nothing on the board serves, called "a ghost until something does", read as a fault to both Opus testers ([the card](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/estate-trace-opus-medium-look-only/shots/011-look.png)). The arrow chip on a symbol's row was taken for "who uses this". A click on a thing's name on the World Map does nothing. Opening a folder added pins nobody asked for. The repository's 3D map with its history open has "Scan root" in the search field and "Nothing connects to Scan root" beside it ([the picture](../AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/narrative-picture-opus-high/shots/001-look.png)); being reproduced.

### The hub's code to its configuration: a connection the readers miss
- state: open
- holds: not begun; to be counted again once [the .NET reader is joined](readers-on-main.md)
- evidence:

Found while the task's answer was written from the source. `Hub/PaymentHub.cs` opens a WCF client by a name assembled from a prefix and the request's values, and no connection is drawn to `Hub/App.config`, which declares it; the same pattern with a constant name is read. So on the map the hub's code leads to its routing file and stops. Measured on the day branch, 2026-11-21: of the estate's 20 hand-verified edges 17 are found and 3 are missing (this one; `Default.aspx.designer.cs` to its page; `PostPaymentRow.cs` to the procedure whose columns it holds). The oracle test counts them and cannot fail on a missing one. A hypothesis only, to be measured on real WCF code before it is a rule: the client's contract type names the endpoint as surely as its name does.
