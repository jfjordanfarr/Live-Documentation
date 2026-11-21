# Narrowed: B, the November 18 record (session ran to the afternoon of November 19)

Read whole: entries-B.md (210 entries, six parts), owner-messages.md (every owner block; the long pasted container logs skimmed, they hold no words of the owner's), owner-answers-2026-11-21.md, direction.md lines 1 to 101 and 413 to 421, the design-system probe README, the packet README with its 2d/ and 3d/ READMEs in part, the Nov 18 summary's open ends. Code and git searched by keyword only. No git command was refused.

Two owner sayings cover many items below. **Turn 40 (Nov 19, 15:30 UTC)**, in reply to the summary's list of unanswered questions: "Questions like this (there are many in the list) are much more readily answerable repeatedly with: Screenshots to compare / Hyperlinks and instructions if necessary to try it / Blind tester agents who are working off of screenshots they generate". Cited below as "Turn 40". **The packet** (`2026-11-19/Screenshots/owner-packet/`) was built for twelve of them; being in it answers nothing.

## Counts
raw entries read: 210; distinct items: 90; by status: OPEN 13, DEFAULT-TOOK-EFFECT 10, DEFERRED-BY-OWNER 13, ANSWERED 26, SUPERSEDED 3, NOT-A-QUESTION 25; unsure: 3

## Still waiting (OPEN, DEFAULT-TOOK-EFFECT, DEFERRED-BY-OWNER)

### The design system's fifteen forks, one list with root's recommendation for each
- status: DEFERRED-BY-OWNER [unsure: fork 2 was really answered on Nov 16, see below]
- kind: look-and-feel
- first put: Nov 19 00:16 to 00:41 UTC, "Root's messages of 00:16 to 00:41 UTC on November 19"; repeated: about 5 times (Resumption, the summary's table), last in the summary's "Asked of the owner and not answered"
- root's words: "what you don't mention stands as recommended" (the list's own rule). The owner never replied to the list itself; Turn 40 answered the summary table that carried it.
- what stands today: **none of the fifteen recommendations is built.** The design-system docs still mark the rules "Broken" pending the owner (`visual-foundations.mdmd.md:148`, `:483`). Fork by fork, in the delivered numbering (the probe README's own numbers in brackets):
  1. Default palette, Vivid kinds [1]: not answered; `palette.ts:347` still has `DEFAULT_PALETTE = "today"`. **In the packet** (3D q5).
  2. A shared link changing the receiver's saved settings, fix it [12]: **the owner had answered this on Nov 16, Turn 3:** "by default, no. Opening a sent link shouldn't cause your local settings to change." No fix found in git or code. This is owed work, not a question. Not in the packet.
  3. Turning the 3D camera with arrow keys [7]: not built. Close to the directional-focus proposal below. Not in the packet.
  4. A pause for the World Map's flowing wires [8]: not built. Not in the packet.
  5. Dropping the two glows [4]: not built (glows still "Broken"). Not in the packet.
  6. Named scales, corners first [2]: not built. Not in the packet.
  7. One loading sign, keep the dots [10]: `template.html:533` still says "Loading…". Not in the packet.
  8. Sentence case [11]: not built. Not in the packet.
  9. Drop Enter on a card's body [9]: `card-factory.ts:279` still opens the reader. Not in the packet.
  10. Moving the cue's amber [5]: not built. (Separately, `28950af7` coloured what the 3D cue counts, from the owner's Turn 23.) Not in the packet.
  11. Rewriting the circle/pill rule [6]: rule still "Broken". Not in the packet.
  12. Writing down a reason for the round directory corners [15]: not written. Not in the packet.
  13. Rewriting the rule that floating panels are lighter [3]: still "Broken". Not in the packet.
  14. A click reads a file in 2D and pins it in 3D, leave it [13]: **partly overtaken.** On Nov 20 (Turn 16 of the Nov 19 record) the owner wrote of the 3D click: "Probably not. We probably need to go back to the UX drawing board and be holistic with respect to "Open/Close" and "Pin" states." That led to the open/close/pin proposal (direction line 87). Not in the packet.
  15. White as the history's lit file [14], and the defaults round's "Glow: a changed file is a flat grey ball among marbles" (Nov 18, merged here): **partly overtaken** by Marbles Off as the default (Turn 29), so the clash only shows with Marbles On. Direction line 60 still carries the grey ball. Not in the packet.
  Also merged: the "No reason found" table (keep/change/drop for the owner, Turn 16 work notes) and the 57 findings "to rank". The packet itself says the other fourteen forks are left out "because an alternative has to be built before there is anything to compare".
- on direction's list: yes (line 60; line 27)
- raw entries merged: B-01#8, B-03#13, B-03#20, B-03#23, B-04#5 to B-04#19

### Settle Hold, the trial for the 3D map's long settle
- status: DEFERRED-BY-OWNER
- kind: look-and-feel
- first put: Nov 19, Turn 37 work notes and "Root's replies to Turn 37" (12:56); repeated: 4, last in the summary table
- root's words: "the question for the owner's eye is whether the held rest is a good picture and whether the motion's end reads as natural, which only motion on their own machine shows."
- what stands today: `settleHold: 0` (`persistence/local-storage.ts:101`). `force-graph-discovery.spec.ts:70` stays red, its bound untouched. **In the packet** (3D q1; root recommends 0.02). Merged here: the glide that goes on after the building sign has gone (Nov 18).
- on direction's list: yes (line 62)
- raw entries merged: B-01#7, B-03#22, B-05#36, B-05#38, B-06#24

### Framing: Follows Pins against Out To Files, and whether a new pin pulls back a camera the person has taken
- status: DEFERRED-BY-OWNER
- kind: look-and-feel
- first put: Nov 19 04:53, "Root's replies to Turn 37"; repeated: 6, last the 07:59 tour and the summary table
- root's words: "Neither is clearly right; once it is on your port, your eye decides." / "One choice I made that you may want reversed: after you take the camera by hand, a new pin does not pull it back into following."
- what stands today: By Hand is the default (`FRAMINGS[0]="hand"`). The named case (a cell pressed on `pathfind.ts`) still leaves the subject out. **In the packet** (2D q1, including "the undecided half"; root recommends Follows Pins after two mends).
- on direction's list: yes (line 62)
- raw entries merged: B-01#6, B-05#27, B-05#28, B-06#2, B-06#3, B-06#19

### Beyond the Hops: should "Next step" become the 3D default?
- status: DEFERRED-BY-OWNER
- kind: product meaning or behaviour
- first put: Nov 18, "Root's reply to Turn 10" (the trial); repeated: 6, last "Root's report on the rings' mend and the horizon's trial" (20:30) and the summary table
- root's words: "My read: at one hop, Next step is the better picture of a pin, and I'd make it the default if you agree once you've used it. It stays a lever until then."
- what stands today: `beyondHops: "everything"`. **In the packet** (3D q4; root recommends Next step, with the hops that were asked for drawn bright).
- on direction's list: yes (line 60)
- raw entries merged: B-01#11, B-03#1, B-03#2, B-03#7, B-03#10

### The ring mend's edge cases: documents beyond the hops, the Structure hub at the frontier, a lone file dim in Connections and bright in Structure
- status: DEFERRED-BY-OWNER
- kind: look-and-feel
- first put: Nov 18 17:55, "Root's messages on the rings' builder"; repeated: 6, last the summary table
- root's words: "Documents: nothing of their own (new). ... The last one is the real choice, and yours to overrule when you see the pictures. The alternatives are keeping the ring for that one case, or membranes of documents."
- what stands today: no sign on any of the three. **In the packet** (3D q4, "Three smaller things"; root now recommends a sign for each, e.g. the hub carrying `live-docs · 127`). The owner's Turn 9 (only kinds that are switched on are counted) and Turn 10 (the horizon) answered what is switched off and the wider question, not these three cases.
- on direction's list: partly (line 60 says "the ring's mend"; the three cases are named only in the summary table)
- raw entries merged: B-01#12, B-01#13, B-02#12, B-02#14, B-03#3, B-03#9

### The ring mend itself: no rings, no "More connected" row, the tooltip's count for hidden documents
- status: DEFAULT-TOOK-EFFECT
- kind: look-and-feel
- first put: Nov 18 17:46, "Root's messages on the rings' builder"; repeated: 5, last "Root's report on the rings' mend" (20:30)
- root's words: "the mend under the owner's grant of design freedom, shown and theirs to overrule"
- what stands today: on `main` since Nov 18. The tooltip keeps "N more connected, not shown". The documents-on and documents-off pair of pictures was made.
- on direction's list: yes (line 60, "the ring's mend")
- raw entries merged: B-01#17, B-01#41, B-02#11, B-02#13, B-02#15, B-03#8

### The Bare frame (no sidebar): whether it becomes the default, its builder's three choices, its gaps
- status: DEFERRED-BY-OWNER (Turn 40 names this one)
- kind: look-and-feel
- first put: Nov 19 06:26, Turn 37 work notes; repeated: 8, last in Turn 40's own quote
- root's words: "The Bare frame: three choices its builder made (Frame not counted as a changed setting; checkboxes in the key in place of legend rows as switches; a directory's crumb does what Centre does)."
- what stands today: Sidebar is the default (`FRAME_CHOICES[0]`). **In the packet** (2D q2). There root says choice (b) "was my mistake", because the key and the sidebar use the same checkboxes, and recommends Bare as the default "once two signs have a home". Merged here: the item-by-item plan for retiring the sidebar from Turn 34, which the trial carries out.
- on direction's list: yes (line 62)
- raw entries merged: B-05#14, B-05#31, B-05#32, B-05#33, B-05#34, B-06#11, B-06#12, B-06#13, B-06#14

### The pointer's rest: whether a bare sphere feels dead, the 350 ms delay, and whether the 2D map should wait too
- status: DEFERRED-BY-OWNER (Turn 40 names this one)
- kind: look-and-feel
- first put: Nov 19, Turn 37 work notes; repeated: 4, last in Turn 40's quote
- root's words: "350 ms was reasoned from frame counts, not compared by eye with 250 and 500; whether a bare sphere with only the pointing hand feels dead is for the owner's eye." / "I'd rather you try the rest in 3D first and say whether you want it in 2D too."
- what stands today: the rest rule in 3D and on the World Map only. **In the packet** (3D q2), with an alternative of one rule for both maps on a builder's branch.
- on direction's list: yes (line 62)
- raw entries merged: B-05#24, B-06#6, B-06#18

### Tuning's reset: a curved arrow with no word; does it read as undo?
- status: DEFERRED-BY-OWNER (Turn 40 names this one)
- kind: look-and-feel
- first put: Nov 19 02:53, the design of Reset to Defaults; repeated: 4, last in Turn 40's quote
- root's words: "The button is a curved arrow with no word, which could read as 'undo'. I'll confirm when it is on your port."
- what stands today: as built (`21866052` to `e7321333`). **In the packet** (2D q3). Its recommendation was corrected after the reversibility survey: now a second history beside Back.
- on direction's list: yes (line 62)
- raw entries merged: B-04#39, B-05#23, B-06#4, B-06#5

### The history track's zoom: the mark for a step outside the range is drawn like the thumb
- status: DEFERRED-BY-OWNER
- kind: look-and-feel
- first put: Nov 19 05:30, "Root's replies to Turn 37"; repeated: 2, last the summary table
- root's words: "It is drawn like the thumb itself; tell me if you can tell the two apart."
- what stands today: as built. **In the packet** (2D q4; root: "not as drawn"; four alternative marks are on a branch).
- on direction's list: yes (line 62)
- raw entries merged: B-05#25, B-06#8

### The Flow price's nominal hub, and whether a gathered line should end in the rows it stands for
- status: DEFERRED-BY-OWNER
- kind: look-and-feel
- first put: Nov 19 05:46, Turn 37 work notes; repeated: 2, last the summary table
- root's words: "Two choices wait for you, with pictures; neither blocks anything. One is a detail of how the layout prices a directory's shape. The other is whether a gathered line should fan out into the rows it stands for when those rows are showing."
- what stands today: the hub at the name; a gathered line does not end in its rows. **In the packet** (2D q5; root recommends building the alternative).
- on direction's list: yes (line 62)
- raw entries merged: B-05#26, B-06#9

### `tests · 556` shown as a closed veil: raise the 1,024-file drawing limit now that a graphics card draws
- status: DEFERRED-BY-OWNER
- kind: product meaning or behaviour
- first put: Nov 19 11:12, "Root's replies to Turn 37"; repeated: 2
- root's words: "your Structure start now shows tests · 556 as a veil. That limit was chosen for software rendering and may be worth raising now the graphics card is used."
- what stands today: the limit is unchanged. **In the packet** (3D q3; root recommends a trial that opens it, then measuring). An alternative is on a branch.
- on direction's list: yes (line 62)
- raw entries merged: B-05#35, B-06#23

### A single undrawn file is one small dim cell where "+1 file" used to be words
- status: DEFERRED-BY-OWNER
- kind: look-and-feel
- first put: Nov 18, "Root's two messages while the defaults builder ran"; repeated: 2, last 23:31 and the summary table
- root's words: "a single cell under a name (one undrawn file) is a small dim dot that is easy to miss, where "+1 file" used to be words."
- what stands today: as built. **In the packet** (2D q6; root recommends "cells that follow the name on its own line").
- on direction's list: partly (line 64 counts "a card's cells" among the packet's trials; line 60 says only that the defaults were liked)
- raw entries merged: B-03#12, B-03#25

### Hidden Files defaults to "Cells under name" (not beside), and old links now open with it
- status: DEFAULT-TOOK-EFFECT
- kind: look-and-feel
- first put: Nov 18, "Root's message on the evening's gate and the defaults round"; repeated: 3
- root's words: "I chose that one of the two cell variants; it is yours to reverse."
- what stands today: `HIDDEN_FILES_LOOKS[0]="under"`. A link without the setting reads it as the default (`layout-presets.ts` comment). The owner liked the cells ("The cells are delightful!", Turn 20) but never chose between the two variants.
- on direction's list: partly (line 60, "the two new defaults themselves they have seen and liked")
- raw entries merged: B-02#19, B-03#11, B-03#14

### Should the history's mark on a changed file say how much changed?
- status: OPEN
- kind: product meaning or behaviour
- first put: Nov 19 03:04, "Root, 03:04:26 UTC"; repeated: 3, last "Root's reply to Turn 28"
- root's words: "It could also say how much changed, by brightness or size, if the history carried lines added and removed per commit. I have not built this; it is the direction I would try next."
- what stands today: nothing built. The owner, Turn 28: "Still not sure. I feel a little uncertain on which way to go on this as of yet." That is not an answer. The packet says it was left out.
- on direction's list: partly (line 29, under Next; and the summary table)
- raw entries merged: B-04#43, B-05#2

### How a whole-file pin ("I eat the whole file") is told from a flow pin ("I am involved in some way")
- status: OPEN
- kind: look-and-feel
- first put: Nov 18 Resumption; Nov 19 Turn 23 work notes ("goes to the owner as alternatives"); repeated: 2
- root's words: "How the two meanings are told apart is not built yet: it comes back as facts and a cost, and goes to the owner as alternatives."
- what stands today: nothing built. The alternatives were never brought, and the packet says it was left out. The owner raised it in Turn 23.
- on direction's list: partly (line 199, a subject line: "Open with the owner, not yet put"; not in lines 54 to 101)
- raw entries merged: B-01#3, B-04#27

### The scenario table's measurement, and which old cases to convert next
- status: OPEN
- kind: process and workspace
- first put: Nov 18, "Your scenario suite: the count"; repeated: 2
- root's words: "For now the gate's time comes down through workers; conversions follow case by case once you've seen the measurement."
- what stands today: no conversions. Direction Next item 3: "The owner was shown the measurement on 2026-11-18 and has not answered."
- on direction's list: yes (line 60)
- raw entries merged: B-01#14, B-02#6

### The C-family maps miss what the compiler records as a use of a definition (15 edges on each of the C and C++ samples), and a header's include guard is listed as a symbol
- status: OPEN
- kind: engine and correctness
- first put: Nov 18 19:13, "Root's message on the scenario table's measurement"; repeated: 4
- root's words: "So I am writing an allowance after all, a narrow and visible one. Behind it is a real gap in the C-family maps ... That is yours to rank."
- what stands today: two named, dated known-gap exceptions are frozen in the scenario table. This reversed root's 17:39 promise to write no allowance. The include guard is unchanged.
- on direction's list: yes for the gap (line 99); the include guard only in a subject line (377)
- raw entries merged: B-01#15, B-03#4, B-03#5, B-03#6

### Should a real failure of the history end the Pages run red?
- status: DEFAULT-TOOK-EFFECT
- kind: process and workspace
- first put: Nov 19, "Root's replies to Turn 37" (the builder's green); reversed by root at 11:35; repeated: 2
- root's words: "That is the builder's choice, in line with 'the site always deploys'; tell me if you would rather a broken history fail the whole job."
- what stands today: the site deploys, then the run ends red (root's reversal).
- on direction's list: yes (line 62, "Still not answered")
- raw entries merged: B-06#22

### Try the World Map's keyboard, and its reset that a second press takes back
- status: DEFERRED-BY-OWNER (Turn 40, as a matter of how eye questions come)
- kind: look-and-feel
- first put: Nov 19 01:43, "Root, 01:43:07 UTC"; repeated: 1
- root's words: "drag two pieces, then press Reset layout: everything returns and the button stays lit. Press it again and your arrangement comes back. The letter keys now work only after you click the board."
- what stands today: as built (`f2e1e7a1` to `11416679`). Not in the packet.
- on direction's list: yes (line 60)
- raw entries merged: B-04#31

### A cycle's returning connection: route drawn over the top of the cards
- status: DEFAULT-TOOK-EFFECT
- kind: look-and-feel
- first put: Nov 19 00:41, "Item 3 needs a design round with real alternatives"; repeated: 2, last "Returning connections is on your port now"
- root's words: "Point at either curl: the amber route should run over the top of the cards, with both cards lit."
- what stands today: merged (`924bec80`, "a cycle's return read as one connection"; `64ce63ff`). The owner never said whether it works. Direction's subject line 199 still calls this "In flight, not landed", which is stale.
- on direction's list: partly (subject line 199 only)
- raw entries merged: B-04#22, B-06#10

### Retiring the Detail Panel: a home on the map for each thing it shows
- status: OPEN
- kind: product meaning or behaviour
- first put: Nov 19 04:13, "Root's reply to Turn 34, the design"; repeated: 1
- root's words: "Lists of uses: the search field ("what uses X" becomes a query)... Long notes: the card's closest zoom... I'd keep a dialog only for overflow"
- what stands today: nothing built. Turn 35 answered only the rungs and the sidebar lever.
- on direction's list: partly (line 34, Next: "Not decided: where the reader's lists and long text go")
- raw entries merged: B-05#13

### The World Map's moment as a date across several repositories
- status: OPEN
- kind: product meaning or behaviour
- first put: Nov 19, "Root's reply to Turn 34"; repeated: 1
- root's words: "Across several repositories a commit means nothing, so the moment should be a date. Each scanned thing resolves it to its own latest commit on or before that date"
- what stands today: nothing built.
- on direction's list: partly (line 34)
- raw entries merged: B-05#12

### Moving focus by direction with the arrow keys, built first (what a gamepad would stand on)
- status: OPEN
- kind: product meaning or behaviour
- first put: Nov 19, "Root's reply to Turn 34"; repeated: 1
- root's words: "What has no home is moving focus by direction... I'd build that first, for arrow keys. It helps keyboard users immediately and is the piece a controller would stand on."
- what stands today: nothing built. Related to design fork 3.
- on direction's list: partly (line 34)
- raw entries merged: B-05#15

### Six verbs for the whole interface (closer/further, follow, keep/let go, when, find, back)
- status: OPEN
- kind: product meaning or behaviour
- first put: Nov 19, "Root's reply to Turn 34"; repeated: 1
- root's words: "The verbs. Closer / further (zoom), follow (a wire), keep / let go (pin, fold), when (the moment), find, and back."
- what stands today: nothing built. The rule beside it, our words only on a rested hover, in a menu or in a sheet, was already the owner's (Turn 22). The verbs were never answered.
- on direction's list: **no** (no hit for "verbs" anywhere in direction.md, and not in the summary's "proposals heard")
- raw entries merged: B-05#16

### Comparing playtest variants for cost against what each finds
- status: OPEN
- kind: process and workspace
- first put: Nov 18, Work notes Turns 2 to 4; repeated: 1
- root's words: "Root's reading of that, to be put to them when the instrument is built and not before: more than one way of running a tester, compared for what each costs against what it finds."
- what stands today: the instrument is built (`626a4821`), but no comparison of variants was put to the owner.
- on direction's list: partly (line 25 quotes the owner's wish only)
- raw entries merged: B-01#33

### A costed design for analysing each distinct version of a file once (the history's rebuild in minutes)
- status: OPEN (root owes it)
- kind: engine and correctness
- first put: Nov 19, Turn 37 work notes, answering the owner's "How do we mitigate these costs and risks?"; repeated: 3, last 11:16
- root's words: "I'll bring it as a costed design, with a proof that the output stays identical, before anything is built."
- what stands today: not brought. It was narrowed on Nov 19: the index-pass probe ruled out a store of per-version results "(at most 4 to 5 s ...)". Direction Next still names "a file's analysis kept by its bytes and reused".
- on direction's list: partly (lines 13 and 34, under Next)
- raw entries merged: B-05#37, B-06#21

### Whether the owner deleted the D:\ folder, the exited container `kind_goldstine` and its `node_modules` volume
- status: OPEN [unsure]
- kind: machine and environment
- first put: Nov 18, "Root's reply to Turn 1" (keep it for now); then "What you can delete now"; repeated: 3
- root's words: "The new copy carries the whole gate, so these can go: the folder on `D:\`; the exited container `kind_goldstine`; that container's `node_modules` volume... I can't see Docker from in here, so check the names in Docker Desktop."
- what stands today: unknown. No owner word that it was done, and no later mention in either record.
- on direction's list: no
- raw entries merged: B-01#28, B-01#40, B-02#1

### Moving part-specific guidance out of AGENTS.md (the Explorer section first), each move shown to the owner as a small difference
- status: OPEN [unsure: it was root's promise rather than a question]
- kind: process and workspace
- first put: Nov 18, Work notes Turn 13 and reply of 23:31; repeated: 2, last in the Resumption
- root's words: "When its turn comes, each move of part-specific guidance, such as the Explorer's design and verification... comes to you as a small difference"
- what stands today: not done. The Explorer section is still in AGENTS.md, and since `55cb5477` it points at the design system. No difference was shown.
- on direction's list: no
- raw entries merged: B-01#18, B-03#18

### Two observations of October 14 never answered (the open pin tray covers the 2D map's right side; the ancestor disclosure is an indented stack in a popover)
- status: OPEN
- kind: look-and-feel
- first put: Oct 14 (re-found Nov 18, "Work notes, the first handbacks of the evening's helpers"); repeated: 1
- root's words: "The two missing: those history defects, and two observations of October 14 put to the owner and never answered."
- what stands today: nothing built. **The line is in "Small questions never answered" twice, word for word** (a duplicate to remove).
- on direction's list: yes
- raw entries merged: B-04#4

### Root's rulings on the archive beyond the confirmed convention: the Antigravity captures filed into their days, and two late-named exports into their dev day
- status: DEFAULT-TOOK-EFFECT
- kind: process and workspace
- first put: Nov 18 16:34, "Two rulings for you to correct"; repeated: 4
- root's words: "I overrode the builder on two points, both from the convention you confirmed"
- what stands today: as filed.
- on direction's list: partly (subject line 407 and the summary table; it has fallen off "Open with the owner")
- raw entries merged: B-01#43, B-01#44, B-02#2, B-02#3

### The guide's sentence that builders write and debug the permanent code
- status: DEFAULT-TOOK-EFFECT
- kind: process and workspace
- first put: Nov 18 23:3x, Work notes Turn 19 and "Root's messages after Turn 20"; repeated: 2
- root's words: "the guide's "Roots and builders" gained one sentence (`e5b42a35`); strike it if it says more than you meant"
- what stands today: in AGENTS.md "Roots and builders" (since widened).
- on direction's list: no
- raw entries merged: B-03#26, B-04#2

### Playtest testers get a seventh action, moving the pointer without clicking
- status: DEFAULT-TOOK-EFFECT
- kind: process and workspace
- first put: Nov 18, "Your three wishes"; repeated: 1
- root's words: "One change to the playtest plan you accepted: testers get a seventh action, moving the pointer without clicking."
- what stands today: in the instrument ("pointing is root's addition").
- on direction's list: partly (line 25)
- raw entries merged: B-04#3

### The test-speed plan: a second pass at one worker for cases that need the machine, no time limit changed, three workers measured later
- status: DEFAULT-TOOK-EFFECT
- kind: process and workspace
- first put: Nov 18 17:21, "Root's messages on the second pass"; repeated: 4
- root's words: "My plan changes no time limit. I mark the few cases that need the machine to themselves and run them in a second pass at one worker, inside the same gate."
- what stands today: the two-pass runner, plus the tags and the halved seeds where trials confirmed them. Three workers have not been measured.
- on direction's list: partly (Next item 2)
- raw entries merged: B-01#22, B-02#5, B-02#16, B-02#18

### The scenario builder's eight forks, the token rule, and the membrane's inset published as a data attribute
- status: DEFAULT-TOOK-EFFECT
- kind: engine and correctness
- first put: Nov 18, "Work notes, the scenario builder's first handback" and "Your scenario suite: the count"; repeated: 3
- root's words: "One product line I allowed: the page will publish the membrane's inset as a data attribute, so the law reads it from the page and the test holds no pixel literal."
- what stands today: `branch-renderer.ts:986` sets `dataset.inset`. The rulings stand. Root noted "zoom not in the address" as a product idea.
- on direction's list: no
- raw entries merged: B-02#7, B-02#8, B-02#9

### Ubuntu stays a disk; the container is the workshop
- status: DEFAULT-TOOK-EFFECT
- kind: machine and environment
- first put: Nov 18, Work notes Turn 1; repeated: 1
- root's words: "The distribution stays a disk. Installing Node, the six language toolchains and the indexers in it would make it a second environment to keep up"
- what stands today: as set up (AGENTS.md: the working copy is on the container's Linux volume).
- on direction's list: no
- raw entries merged: B-01#24

## Overtaken (SUPERSEDED)
| Item | First put | What overtook it, and where |
| --- | --- | --- |
| "Is this cycle stub what you meant on November 13?" and the cycle's pictures (B-01#4, B-01#9, B-04#25, B-04#26) | Nov 19 01:01, root's reply to Turns 21 and 22 | The owner answered with defects in place of a yes or no (Turn 23: whole-file pins kept tiny, a row hover not lighting its wires, the cue not pointing at wires, "French Corset"). Root established the same hour that it is the corset; the returning-connections round then merged (`924bec80`). |
| Stop at tall marks only, or at all marks a pinned file touched? (B-04#33, B-04#36) | Nov 19, "History and the pinned file" | The owner's coarse-and-fine "microscope" knobs (Turn 25), built on `main` as `df64d4f3` to `e4df3103` with the track zoom (`7ade8a6c`). Root's two-knob design stands by default. |
| The cells' slow first frame: keep the 500 ms bound and the default (B-03#21) | Nov 18, Work notes, the defaults round's gate | Mended at its cause (`09823d2c`: one observer where 38 had each forced a layout; direction line 15). |

## Answered (ANSWERED)
| Item | First put | The owner's words, day and turn |
| --- | --- | --- |
| Remove the eight superseded history caches (B-01#1, B-06#1) | Nov 18 Resumption; Nov 19 05:12 | "I mean yeah, for sure. Any reason we wouldn't?" (Nov 19, Turn 40) |
| Should the marbles go back to flat colour too? (B-01#2, B-05#3) | Nov 19, reply to Turn 28 | "for immediate understandability of the system, Marbes Off is superior." (Turn 29) |
| Build nothing more on texture; the probe's sheets; the stranger's test; how a Live Doc would carry text shape (B-01#5, B-04#34, B-04#35, B-04#37, B-04#42) | Nov 19 02:5x to 03:04 | "Fair." (Turn 28), to "Build nothing more on texture". The page idea is in ideas.md. |
| The marble pattern: from the doc's facts or the file's contents; try the trial (B-01#10, B-04#1, B-04#28, B-04#29) | Nov 18 23:46, Turn 20 work notes | "even a small change in a file produce a _perceptible_ difference" / "(or the resultant markdown file it created, but preferably the scanned file)" (Turn 24) |
| Keep the From Its Doc marble lever? (B-04#41, B-05#1) | Nov 19 03:04 | "Your preference. I believe the "marble" case is another one of "if we do this, we have to do this all the way"" (Turn 28). Removed. |
| Open the next dev day with a packet for the eye (B-01#16, B-06#31) | Nov 19, after Turn 40 | "I suspect that would be reasonable for us to start the next dev day chat with." (Turn 40). Built Nov 19. |
| The session-history convention and the blind-playtest plan (B-01#23, B-01#29, B-01#30) | Nov 18, reply to Turn 1 | "I'm totally onboard with your proposal for both of these." (Turn 3) |
| A hook for copying and a scribe trial for summaries (B-01#34, B-01#35) | Nov 18, reply to Turns 2 to 5 | "Nah... It sounds to me like our current setup is optimal for simplicity and efficacy." (Turn 6) |
| Raise the container's npm (B-02#4) | Nov 18 16:50 | "Any reason not to raise it? Raising it sounds fine." (Turn 8) |
| The six Memory files' purposes, retelling the narrative more coarsely, the order (B-03#15, B-03#16, B-03#17) | Nov 18, reply to Turns 11 and 12 | "Otherwise, I think your plan is solid." (Turn 13), with the AGENTS.md purpose corrected |
| Arrival: build the alternative and test it; whether "Reading, Then Neighbours" becomes the default; the testers' runs of three values (B-01#21, B-04#20, B-04#23, B-05#19, B-05#21, B-05#22) | Nov 19 00:41 | "It might be jarring to always start at the zoom required to center the card... perhaps that's a reasonable best-of-both-worlds default?" (Turn 22); then "the stutter... was jarring. I think a holistic framing approach... might be the best of both worlds" (Turn 37), which led to Framing. The Arrival lever is still in code (`types.ts:394`, reading size the default), a leftover trial. |
| A World Map box names its folder; a 2D wire says "X uses Y" under the pointer (B-04#21) | Nov 19 00:41 | "words are only warranted on a modestly long hover or something of the like." (Turn 22); root withdrew the always-on words |
| Names and sentences wait for a rested pointer; the 3D map's instant names are a defect (B-04#24) | Nov 19 01:01 | Same Turn 22 ("What I don't want to have is an application which is shooting random text at me"); built |
| The page's frame and the cells' speed (B-04#30) | Nov 19 01:43 | "Looking better!" / "Awesome!" (Turn 24) |
| The narrative-restating playtest (B-04#38) | Nov 19, reply to Turns 25 and 26 | "What a slick experiment! Hah!" (Turn 27). Not yet run. |
| Unpin others, Fold others away, Wrap this group again (B-05#4 to B-05#7, B-06#15) | Nov 19, replies to Turns 31 and 32 | "Oh man that sounds absolutely awesome." (Turn 33) |
| 2D history: rung 1 next; rung 3 to be built rather than skipped (B-05#8, B-05#10) | Nov 19, reply to Turn 34 | "Yeah, all three rungs... we should." (Turn 35) |
| The sidebar-free frame behind a lever (B-05#9) | same | "That would be great!" (Turn 35) |
| While scrubbing: cheap while dragging, settle at rest (B-05#11) | same | "A good cheap default for now. We might revisit later." (Turn 35) |
| Builders carry on past the window; root's reading of the night's rules (B-05#17, B-05#18) | Nov 19 04:2x | "I'm okay to let the builders do a little damage tonight" (Turn 36); "Very very correct. The builders don't even need to know about the time limit." (Turn 37) |
| Try the cell press's camera (B-05#20) | Nov 19, replies to Turn 36 | "it might be wise to follow the sucker for a bit if the user hasn't provided input" (Turn 37) |
| Should Clear all pins match the new actions? (B-05#29, B-06#30) | Nov 19, Turn 37 notes | "we need to ensure that our interactions are reversible. If they are not, then we need to be rethinking a bit." (Turn 40) |
| December: this repository or the work's own code? (B-06#16) | Nov 19 07:59 | "My work's own code, most likely. Powershell 5.1 stuff, .NET Framework 4.8 stuff, SQL stuff." (Turn 40) |
| Don't stop the container until root is ready (B-06#27) | Nov 19 14:31 | "I won't restart the container until your work is done." (Turn 40) |
| Which machine, what may leave it, and does .NET 4.8 build there for the C# indexer? (B-06#29, B-06#32) | Nov 19, close | "I would scan my own work from my own dev machine at work" (Nov 19 record, Turn 2); "Nothing leaves the machine" (the owner, 2026-11-21). The .NET question is superseded: "the shipped C# reader is tree-sitter and needs no build" (direction line 21). |
| Node 22 to 26 (B-02#20) | Nov 18, reply to Turn 8 (held back) | "Hahaha yeah we just bumped recently but obviously that's fine." (Nov 19 record, Turn 2). Done. |

## Not questions
- B-01#19, B-01#42: the "also owed" list, and whether to unwrap old summaries. Only ever in work notes and the Resumption, never put to the owner. **Still undone:** seven summaries (2025-12-06.3, 12-07.1/.2/.3, 12-08.1, 2026-01-09.1, 01-30.1) still open with a code fence.
- B-01#20: the owner's wishes, queued by root (dimmed text; the marble pattern)
- B-01#25, B-01#27: paste the log or start a new chat (done)
- B-01#26: the move-to-wsl script removed
- B-01#31, B-01#36, B-01#45, B-01#48: root's order of the day
- B-01#32: the build mended and the gate started early
- B-01#37: earlier summaries written by another model
- B-01#38: the session-history builder started
- B-01#39: a reminder to push
- B-01#46, B-01#47: the harness's "· summary" rows; a README sentence owed
- B-02#10: the design audit's blind spot mended
- B-02#17: the 2D drawing cost, owed by root
- B-02#21: allowScripts needed before npm 12
- B-03#19: where the design system lives
- B-03#24: the six-hour plan for builder lanes
- B-03#27: the builders' findings awaiting review
- B-04#32: accessibility leftovers, queued (white on blue is fork 1)
- B-04#40: rebuild the history on the port (overtaken)
- B-05#30: the wrap chip still cannot be found; queued
- B-05#39, B-06#25: the history data lands with its mends deferred
- B-06#7: try the row hover's regression fix
- B-06#17: three ways to shrink the freeze, root's to choose
- B-06#20: split the history's rows if opening is slow
- B-06#26: explain the Pages change before the push
- B-06#28: write only what is read, an engine-round task

## Unsure
- **The design system's fifteen forks.** DEFERRED-BY-OWNER rests on Turn 40 replying to the summary table that carried the forks. If the root reads Turn 40 as covering only questions for the eye, forks 2, 3, 4, 7, 8, 9 (behaviour, accessibility, words) are OPEN. Fork 2 is answered in substance by Nov 16 Turn 3 and is owed work. To settle it: whether the root counts the forks among "Questions like this".
- **The D:\ folder and the old container.** I would need the owner's word, or Docker's list, to know whether they were deleted.
- **The AGENTS.md moves shown as small differences.** This was root's promise, not a question. Whether it counts as raised for the owner is the root's call. Nothing was moved or shown.
