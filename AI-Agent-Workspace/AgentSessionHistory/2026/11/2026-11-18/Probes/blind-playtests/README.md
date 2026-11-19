# Blind playtests: the instrument proven, its shake-out on Opus, and the first half of the ladder of models

Historical record of a probe, November 18 and 19, 2026, by a builder of [the day's session](../../2026-11-18.1.record.md). The instrument is described as it is now in [its README](../../../../../../scripts/playtest/README.md). Nothing here is decided. The findings are what testers did on the Explorer built that evening; `dist/explorer` did not change under any run here (`siteChanged` is false in every `run.json`).

## What was asked

The owner, on November 18: "try and get increasingly _small_ Claude models to blind UX test our software, forced to use only keyboard/mouse inputs and screenshots (no access to DOM or page HTML/JS/CSS)", because what gets them stuck "are almost certainly going to reveal deeper underlying design decisions we need to resolve". The first milestone built the instrument and ran it on Opus at medium effort (the sections up to [The two variants](#the-two-variants)). The second ran the ladder of models on the estate sample's three tasks and was held halfway, so that the builders waiting for the browser lock got in. [The ladder, first half](#the-ladder-first-half) records it, and [ladder-plan.json](ladder-plan.json) holds the whole plan.

## What is here

One folder a run, each laid out as the instrument's README describes (`run.json`, `actions.jsonl`, `shots/`, `transcript.jsonl`, `answer.md`, `clipboard.jsonl`, `stderr.log`). The site was the main checkout's `dist/explorer/`, served read-only on `127.0.0.1:8792`.

| Run | Task | Variant | Did it | Turns | Actions (look) | Tokens in, out | Wall, API | Cost |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [probe-opus-medium](probe-opus-medium/) | probe | look-only | yes | 2 | 1 (1) | 6.9k, 1.3k | 26 s, 14 s | $0.05 |
| [probe-escape-opus-medium](probe-escape-opus-medium/) | probe-escape | after-each | yes | 9 | 7 (1) | 82k, 2.1k | 82 s, 40 s | $0.26 |
| [estate-directory-opus-medium-look-only](estate-directory-opus-medium-look-only/) | estate-directory | look-only | yes | 12 | 11 (6) | 62k, 2.1k | 51 s, 25 s | $0.17 |
| [estate-directory-opus-medium-after-each](estate-directory-opus-medium-after-each/) | estate-directory | after-each, old descriptions | partly | 9 | 8 (4) | 63k, 1.3k | 42 s, 18 s | $0.18 |
| [estate-directory-opus-medium-look-only-2](estate-directory-opus-medium-look-only-2/) | estate-directory | look-only | partly | 8 | 7 (4) | 33k, 1.2k | 37 s, 13 s | $0.12 |
| [estate-directory-opus-medium-after-each-2](estate-directory-opus-medium-after-each-2/) | estate-directory | after-each | partly | 8 | 7 (1) | 79k, 1.8k | 46 s, 21 s | $0.19 |
| [estate-link-opus-medium-look-only](estate-link-opus-medium-look-only/) | estate-link | look-only | yes | 8 | 7 (4) | 33k, 1.3k | 46 s, 17 s | $0.10 |

Tokens in are input, cache writes and cache reads together. Wall time runs from the tester's start to its end. Several runs ran side by side, so wall time is only roughly comparable. The first runs' `run.json` counted the wait for the browser lock in their wall time, so the table recomputes theirs from the tester's first event. That launcher has since been corrected.

## The proof of blindness

- **What the tester has.** The program's own account at start (`init` in each `transcript.jsonl`) lists seven tools, all `mcp__window__*`, one MCP server (`window`), no slash commands and no skills. The only plugins are four built into the program (agents-md, telemetry, privacy, plugin-authoring). It also names the built-in agent types, but the tester has no tool to start one.
- **What the probe answered.** Asked to list its tools, say what it knew of the project and try to read `/etc/hostname`, fetch `https://example.com/` and run `ls /`, it named the seven tools and nothing else. It said it knew the project only from the one picture it took, and that it could do none of the three, having no tool for files, the web or commands ([answer](probe-opus-medium/answer.md)).
- **What the escape probe tried.** Asked to make the window show example.com, a `file:` address or a folder above the site, it pressed Control+L (nothing happened), typed the address into the page's search field ("Nothing found"), pressed Enter and Escape, and clicked the page's "Scan root" link. The address never left `127.0.0.1:8792/samples/estate/` ([answer](probe-escape-opus-medium/answer.md), [actions](probe-escape-opus-medium/actions.jsonl)). No request left the site, so the harness's block on other origins went untested.
- **What leaks.** The program tells the tester its working folder and that it is not a git repository. The first runs' folder was named `blind-tester-…`, and the first probe read it as a hint that this was a blind test. The folder is now named `session-…`. The program also says more tools may appear later, and none do. The tester's model knows it is Claude, and nothing tells it about this project.
- **Which kind of blind this is.** The harness enforces the blindness. The tester has no file, shell, web or page-source tool to ignore an instruction with. It has no address bar either, so its only way to change the address is through the page. The tester is told only what the system prompt in each `run.json` says.

## The shake-out: estate-directory on Opus at medium effort

The task: "Can you open the PaymentService folder in this map and tell me how the files in it connect?", starting on the estate's World Map. All four runs answered in 7 to 11 actions. Judged against the task's `rightAnswer` on November 19, only the first did it whole: the other three missed that App.config names PaymentService.cs, which is item 2 below. The table above was corrected that day from "yes" to "partly" for those three. Each double-clicked the World Map's "payments" box, opened Data/ in the Local Map, pressed fit, and read the cards and wires. Each found the files, PaymentService.cs as the hub, the chain from the data files through PaymentsContext.cs, App.config feeding PaymentsContext.cs, and the .csproj's one outside link.

Where they stalled or guessed:

1. **The World Map names the folder differently.** The box that opens PaymentService/ is labelled "payments" (service · 6 files). Every tester took it on trust and guessed right. The two look-only runs wrote "likely PaymentService" (corrected on November 19 from "every tester wrote") ([first picture](estate-directory-opus-medium-look-only/shots/001-look.png)). *Design question: should a World Map thing say which folder it opens, when its name is not the folder's?*
2. **A cycle is read as a loop on itself.** App.config and PaymentService.cs each show "1 connection returns in a cycle", with a short loop at the card's edge. In fact App.config names PaymentService.cs, which closes PaymentService.cs → PaymentsContext.cs → App.config → PaymentService.cs. Three of four testers called it a link "back to itself". Only the first look-only run found the loop, and only after clicking about ([the drawing](estate-directory-opus-medium-look-only-2/shots/006-click.png)). *Design question: where does a cycle's returning wire go, and how does the drawing show that it comes back?*
3. **Wires do not explain themselves.** Two testers said they "couldn't get labels or tooltips" for the lines. They took each wire's direction from the legend's "Offers → Uses" and said so as a caveat. Hovering a card did fade the unrelated files ([hover](estate-directory-opus-medium-after-each-2/shots/005-point.png)), and the one tester that hovered three cards used that. *Design question: what does hovering a wire, or one end of it, say about what it carries and which way it goes?*
4. **At fit, card text is small.** After fit, the six cards fill the view and their paths, kinds and "+N connections" are a few pixels high. Opus read them. A weaker model may not. Whether this blocks anyone is for the ladder to show.

## The link task: estate-link

"Find Hub/ServiceRouting.cs on this map, then send me a link to what you're looking at." The tester searched for the file, opened it, and copied the address shown with `look` into its reply: a 726-character `?s=` address that matches the final address exactly. Opened afresh, the link shows ServiceRouting.cs pinned in the Local Map, so the link is right. Nothing was copied to the clipboard. The tester could send the link only because the window shows the address as text, as an address bar does. The Explorer has no copy-link control, and the address cannot be read: the start link's readable `?view=local&node=…` becomes an `s=` snapshot at once. *Design question: is a link a person can read, or a visible way to share one, part of what "send me a link" needs?*

## The two variants

On the same task, two runs each after the descriptions were corrected: look-only took 8 and 12 turns, 33k and 62k tokens and $0.12 and $0.17. After-each took 8 and 9 turns, 79k and 63k tokens and $0.19 and $0.18. Wall times were similar, 37 to 51 s. Under after-each every action sends a picture, so hovers cost a picture each, and the tester hovered more (three times in one run). Under look-only the tester chooses when to look, and the cheaper look-only run looked after nearly every action anyway. At Opus medium, look-only costs about a third less and is no less successful. The ladder will show whether weaker models fail to look when they should. In the first after-each run the tool descriptions did not yet say that actions return a picture, and the tester called `look` after each one. The descriptions now say what each action returns.

Two samples a variant on one task are not a measurement. They show what to measure.

## The ladder, first half

Asked by the root on November 18: every visitor task on four rungs, two runs each, look-only, at most 60 actions a run. The rungs are Opus 5.5 at medium effort (the shake-out's runs count), Opus 5.5 at low, Sonnet 5.5 at medium, and Haiku 5.5 at its own default effort (`--effort default`, so no effort is passed). Then the after-each variant on one task a rung, two runs each, on estate-directory. The testers ran four at a time under the shared lock ([ladder.mjs](../../../../../../scripts/playtest/ladder.mjs)), with the lock left free for 30 s between batches.

**What ran and what did not.** The estate sample's three tasks ran on every rung, 24 runs. The ladder was then held so that six builders could have the browser lock. The four testers then waiting for the lock were withdrawn before they started, and their empty folders were deleted. Still to do, 31 runs:

- the repository's three tasks on every rung, twice each (24);
- the after-each runs: once more on Opus medium (`estate-directory-opus-medium-after-each-3`) and twice on each other rung (7).

One command resumes the ladder. It skips every run already finished, and run from the repository root it reads:

```bash
node AI-Agent-Workspace/scripts/playtest/ladder.mjs --plan AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/blind-playtests/ladder-plan.json --into AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/blind-playtests
```

The two blindness probes were not run on the weaker rungs. Every rung has the same seven tools, and the probes are not a visitor's task. The ladder's "seven tasks" came from a miscount in the first handback: tasks.json holds six visitor tasks and two probes.

### By task and rung

Each cell gives two look-only runs, judged against the task's `rightAnswer` in [tasks.json](../../../../../../scripts/playtest/tasks.json): **done**, **partly** (what is missing in the notes below), failed or gave up. No run failed or gave up, and none reached the 60-action limit.

| Task | Opus medium | Opus low | Sonnet medium | Haiku default |
| --- | --- | --- | --- | --- |
| estate-uses: "What uses this file?" | done, done | done, done | done, done | done, done |
| estate-directory: "how the files in it connect" | done, partly (and partly in both after-each runs) | partly, done | done, partly | partly, partly |
| estate-link: "send me a link" | done, done | done, done | done, done | done, done |
| repo-uses, repo-directory, repo-link | not yet run | not yet run | not yet run | not yet run |

**estate-uses.** All eight named the four files: PaymentService.cs, PaymentHub.cs and the two App.config files.
- Opus low's first run says "Five files" and lists four.
- Most hedged the two configuration files. Opus medium 1: "The two config-file links were the hardest to follow, so treat those as likely rather than certain". Opus low 2: "The lines into them overlap on the diagram".
- Both Haiku runs got the list another way, from the file's reader: `Dependents`, a plain list ([Haiku 1, #11](estate-uses-haiku-default-look-only/shots/011-click.png); [Haiku 2, #8](estate-uses-haiku-default-look-only-2/shots/008-click.png)). No stronger tester opened the reader.
- Every run changed the view before answering. Four pressed fit at once: Opus medium 2, Opus low 1 and both Sonnet runs. Four took detours:
  - Opus medium 1 pressed `-` four times, then dragged and scrolled ([after four presses, #6](estate-uses-opus-medium-look-only/shots/006-click.png); [after the scroll, #10](estate-uses-opus-medium-look-only/shots/010-scroll.png)).
  - Opus low 2 pressed `-` four times and dragged, then "Moved too far; try fit-view button" ([after the drag, #8](estate-uses-opus-low-look-only-2/shots/008-drag.png)).
  - Haiku 1 pressed `-` three times ([#5](estate-uses-haiku-default-look-only/shots/005-click.png)).
  - Haiku 2 pressed `-` once, then fit ([after one press, #2](estate-uses-haiku-default-look-only-2/shots/002-click.png)).

**estate-directory.** The cycle is the dividing line. App.config names PaymentService.cs, which closes PaymentService.cs → PaymentsContext.cs → App.config → PaymentService.cs. Done:
- Opus medium look-only 1.
- Opus low 2: "depend on each other in a loop … Before I expanded Data, the map showed a direct line between them".
- Sonnet 1: "The service and its config refer to each other".

Partly:
- **Opus medium look-only 2 and both after-each runs, and Opus low 1:** "a link back to itself".
- **Sonnet 2:** misses PaymentsContext.cs → App.config and says App.config and PaymentService.cs "each depends on the other". It also asked once for a tool it does not have, `double_click`.
- **Haiku 1:** says the Data files "connect to each other and to PaymentService.cs", with no directions. It gives the .csproj's one connection as "to the service" (it is Contracts.csproj) and calls App.config's cycle a loop "back to itself".
- **Haiku 2:** expanded Data but never pressed fit: "Two more files are in the Data folder but were off-screen", "I couldn't see every arrow at once" ([#7](estate-directory-haiku-default-look-only-2/shots/007-click.png)). It misses PaymentService.cs's use of the data files and PaymentsContext.cs's use of App.config.

Finding the folder:
- Opus double-clicked "payments" in all six runs, four of them saying "likely" first.
- Sonnet 1 searched: "Your link had no folder called "PaymentService" on the World Map. The closest match was the "payments" service, so I found the folder by searching" ([#4](estate-directory-sonnet-medium-look-only/shots/004-look.png)).
- Sonnet 2 double-clicked it and said nothing.
- Haiku 1 clicked it once, and the card says PaymentService under the name ([#3](estate-directory-haiku-default-look-only/shots/003-look.png)).
- Haiku 2 searched.

**estate-link.** All eight took the same path: search, type "ServiceRouting", click the result, then copy the 726-character address shown with `look` into the reply. Each copied it exactly; it matches the address after action 5 in every run. Opened afresh, that address shows ServiceRouting.cs pinned. Nothing was copied to the clipboard. At this size the task tests reading an address the harness gives as text more than it tests the Explorer (see the forks below).

### Numbers by rung

Look-only, the six estate runs a rung (means; tokens in are input, cache writes and cache reads; costs as the program reports them):

| Rung | Turns | Tokens in | Tokens out | Cost a run | Seconds | Cost of six |
| --- | --- | --- | --- | --- | --- | --- |
| Opus medium | 9.3 | 41k | 1,467 | $0.122 | 39 | $0.73 |
| Opus low | 7.7 | 28k | 1,059 | $0.089 | 36 | $0.53 |
| Sonnet medium | 7.0 | 38k | 962 | $0.043 | 33 | $0.26 |
| Haiku default | 9.7 | 48k | 1,679 | $0.003 | 38 | $0.02 |

After-each so far exists only on Opus medium: two runs on estate-directory, 8.5 turns, 71k tokens in, $0.183 a run, 44 s. One of the two had the old descriptions. Its two look-only runs on the same task averaged 10 turns, 48k tokens in and $0.142, so after-each cost about a third more. The comparison across rungs waits for the seven runs still to do. Seconds are rough: four testers ran at once.

Every run in this folder, the probes and the shake-out included, cost $2.22 as the program reports it.

### The stuck points, grouped

The fewest questions that explain what the testers stalled on, guessed at or got wrong in the 24 ladder runs and the 4 shake-out runs of estate-directory:

1. **The view does not frame what the visitor came for.** Arriving on a pinned file shows it with its neighbours cut off at both sides. Opening a folder leaves the top of the view empty and pushes its files off the bottom. `-` does not bring the whole into view either: after four presses the names have grown and wrapped ("Intern als"), and the right side is still cut off. Fit frames it, and every tester that found fit used it.
   - Hit by every rung. All eight estate-uses runs changed the view before answering, four of them by detours through `-` and drags. Nine of ten estate-directory runs pressed fit after opening Data. The tenth, Haiku 2, did not and missed what lay below.
   - Pictures: [start on a pinned file](estate-uses-opus-low-look-only-2/shots/001-look.png), [after four presses of `-`](estate-uses-opus-low-look-only-2/shots/006-click.png), [Data just opened](estate-directory-haiku-default-look-only-2/shots/007-click.png).
   - *Question: should arriving at a subject, and opening a folder, frame what was asked for, so that fit is a recovery and not a step every visitor must know? And what is `-` for, if it stops before the whole?* A product question: Opus at medium effort took the same detours.
2. **A World Map thing does not carry the name of the folder it opens.** "payments" opens PaymentService/. The folder's name appears only on the card a single click opens.
   - Hit in every estate-directory run, at every rung. Opus took "payments" on trust in all six runs and wrote "likely" in four. Sonnet 1 and Haiku 2 searched. Haiku 1 found the name on the card.
   - Pictures: [the World Map](estate-directory-opus-low-look-only/shots/001-look.png), [the card a click opens](estate-directory-haiku-default-look-only/shots/003-look.png), [Sonnet's search](estate-directory-sonnet-medium-look-only/shots/004-look.png).
   - *Question: should a thing on the World Map show the folder it stands for, beside or in place of its declared name?* A product question. No tester failed on it, but nearly every one guessed.
3. **A cycle's returning connection is drawn as a stub, and read as a loop on a file to itself.** "1 connection returns in a cycle", with a short loop at the card's edge, does not say where the connection comes back from.
   - Read as a loop on itself in 5 of 10 estate-directory runs: three of four on Opus medium, Opus low 1, Haiku 1. Haiku 2 named a cycle without saying between which files. The other four named the loop between App.config and PaymentService.cs.
   - Pictures: [the drawing](estate-directory-opus-medium-look-only-2/shots/006-click.png), [hovering PaymentService.cs](estate-directory-opus-medium-after-each-2/shots/005-point.png).
   - *Question: where does a cycle's returning wire go, and how does the 2D drawing show that it comes back from a file the reader can name?* A product question, since Opus at medium effort misread it three times in four.
4. **Wires carry no words, and the plain answer sits one door away, in the reader.** Testers took each wire's direction from the legend's colours and said so as a caveat:
   - "the connections are only as exact as the lines I could trace" (Sonnet, estate-uses 2).
   - "I read the direction of each line from the map's colours, so a few arrows could be the other way around" (Opus low, estate-directory 2).
   - Lines into the two App.config files "overlap" and were "hardest to follow".

   Hovering a card fades what is unrelated, and the testers who hovered used it. The weakest model answered "what uses this file?" most surely: both Haiku runs opened the file's reader, whose Dependents list names the four files in text. No stronger tester opened it.
   - Pictures: [the reader's Dependents](estate-uses-haiku-default-look-only-2/shots/008-click.png), [the wires at fit](estate-uses-sonnet-medium-look-only/shots/002-click.png).
   - *Question: should what a wire carries, and which way it goes, be said where the wire is (on hover, or on the card)? And should the map make the reader's Dependents and Dependencies easier to find?* Both product questions. Haiku's vaguer readings of the wires ("connect to each other") are the model's; the stronger models' hedges are the drawing's.

Not product questions: Sonnet asking for a `double_click` tool it does not have, and Opus low's "Five" for four files. These are the models'.

### Forks for the instrument

- **The address as text.** `look` gives the address as text, so a link task cannot be failed by misreading it. A person reads an address bar too, so this stays as it is, and the link tasks measure finding the subject. If the owner wants the address read from pixels, `look` could draw a bar into the picture instead. *Recommendation:* keep it as text, since a person's address bar is read and copied as text. A 726-character address misread from pixels would test the tester's eyesight, not the Explorer.
- **After-each.** The seven runs still to do will show whether weaker models need a picture after each action. On Opus medium it cost about a third more than look-only on the same task. *Recommendation:* keep look-only as the default on every rung unless the seven runs show a weaker rung missing changes it never looked at, and then use after-each on that rung alone. In look-only no rung so far has failed for not looking: Haiku looked after nearly every action of its own accord.

## Pictures kept

On November 19 the folder kept, for each run, its first picture, its last, and every picture this README links to; the rest were moved out of the repository by [keep-pictures.mjs](../../../../../../scripts/playtest/keep-pictures.mjs). Each run's `actions.jsonl` still names every picture after every action. The full sequences were in the main checkout's `AI-Agent-Workspace/tmp/playtests/<run>/shots/`, which git ignores, and are not kept: a run can be had again for a few cents, though not on the Explorer as it was that evening.
