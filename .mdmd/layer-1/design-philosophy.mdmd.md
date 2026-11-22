# Design philosophy

_Current. First minted on 2026-11-22 by the root at the owner's request ([Turn 13 of the November 21 record](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-13)), from the owner's own words as [owner.md](../../AI-Agent-Workspace/Memory/owner.md) keeps them, from [the vision](vision.mdmd.md) and from WCAG's four principles. Its wording is on trial: the owner has not yet corrected it, and a name here stays loose until it has earned itself. [The guide](../../AGENTS.md#design-philosophy) carries the short form; this document carries the reasons._

[The vision](vision.mdmd.md) says what the product is. This says what we value when we have to choose.

## The purpose

**Live Documentation exists so that a person's understanding of their own software does not run away from them.**

The owner, shown the market of tools that make agents faster ([owner.md](../../AI-Agent-Workspace/Memory/owner.md#what-the-tool-has-to-serve), 2026-10-08): "Live Documentation's greatest relative strength is that it exists to **prevent your understanding of complex systems run away on you**"; "In a world of more and ore agent code, _understanding_ is the real bottleneck." And of their own need (2026-09-26): "I just want to be able to show non-software people what I do and they can _see it_ the way I understand it."

Five values serve that purpose. Each is written so that it could stand as the title of a body of work, and each names what it has already decided and what it costs, because a value that has never made us give something up is a slogan.

## The five values

### A person can see it

The map is read at a glance and explored without getting lost, by someone who is not a software person, and it invites them further in.

- **In the owner's words.** "We are trying to build something very very common-sense: we want to be able to look at directories and understand their contents well, especially if those contents have interconnectivity of some kind." "Consistency of view -- the ability to keep one's bearings as they click around." "I do very much want a brand new user to feel the excitement of exploration and discovery." "We should strive heavily to avoid _text authored by us onscreen_."
- **What it has decided.** One meaning for each colour and each side at every scale. Names that are never shrunk to make room. Motion that explains a change of place or scale. The irrelevant faded, never the relevant boosted. Words of our own held to the last second, behind a hover. A finding that someone could not find a thing is a finding about the door, not about them.
- **What it costs.** We leave things unexplained on screen that a paragraph would explain. We spend effort on motion and framing that no test of a still picture rewards.
- **Where its rules live.** [The Explorer's design](../layer-3/live-documentation-explorer.mdmd.md) and [the design system](../layer-2/design-system/design-system.mdmd.md); the guide's Orientation, Legibility and Coherence.

### The map does not lie

Nothing is drawn that the code does not make. What could not be read, was left out or is hidden is said. A suggestion is never a fact until a person accepts it.

- **In the owner's words.** "I'm open to ways to reduce that mess which don't lie to the user, but I'm not open to having the user open the shape of their software and believe it's all fine and dandy when it's not." Of names that cannot be bound for certain: "I'm not gonna even try and guarantee these things get linked together because we're going to get a hailstorm of false positive links to allow that kind of flexibility". Of renames: "Trust what git says." Of an author's reference in a doc comment: "we should honor their word."
- **What it has decided.** Every reader is held to an independent oracle, and nothing grades itself. A name the scan cannot find is shown as a ghost, not guessed at. A cut list says how much it cut. Known differences from a language's own answer are kept in a ledger that fails when one is mended in silence. An ugly system is drawn ugly.
- **What it costs.** Fewer lines on the map than a guess would give. Slow work on readers, one measured language at a time. Things shown as unlinked that we suspect are linked.
- **Where its rules live.** The guide's "One source of facts" and "Causes, not gates"; [the readers' work](../../AI-Agent-Workspace/Work/readers-on-main.md).

### It is yours

Local-first: it runs on your machine from a copy you hold, reads your code as text and never builds or runs it, sends nothing anywhere, and keeps what it makes in files you own. Your word is the truth: what you choose, configure or write is honoured, nothing is applied or overridden in silence, and what it does can be taken back.

- **In the owner's words.** "Tests proving that Live Documentation cannot and will not ever access the internet." "Our software will be beholden to no corporate overlord." "Nothing leaves the machine". "everything happening now is happening on _your_ machine". "The list the user sees for ignore patterns is the source of truth for our software". "are we confident that doing something the user didn't ask for, silently, should be our default?" "we need to ensure that our interactions are reversible. If they are not, then we need to be rethinking a bit."
- **What it has decided.** A page that cannot use the network, held by a test. No protocol door for agents. Nothing built or run of the code it maps. Chosen and not yet built: one HTML file that scans a folder and saves a copy of itself, and no installed app tied to a site; the data kept apart from the program, so that a file from someone else is read and never run; a person choosing what a scan leaves out before it scans, with every change able to be taken back.
- **What it costs.** No account, no sync, no silent update, no telemetry to learn from. Pickers and prompts where an installed program would simply read the disk.
- **Where its rules live.** The guide's "Self-contained page"; [how the tool arrives](../../AI-Agent-Workspace/Work/tool-arrives-on-windows.md); [what a scan leaves out](../../AI-Agent-Workspace/Work/scan-leaves-no-trace.md).

### It meets you where you are

A weak machine, a codebase nobody annotated, a language we did not have in mind. A person at the page, an agent at the command line, a pipeline with nobody watching. Each gets everything, in the form that suits it.

- **In the owner's words.** "We want this to be able to run on absolute garbage, even if some amount of precomputation time with reasonable progress indicators is required to do so." "It is not in my best interest to make only my use case look pristine and then look in disbelief at others who somehow can't get the same level of quality out of the software." "Both need everything we give. They just enjoy it in different formats." "expect there to almost always be _at least two_ ways to do anything in the program". "What if we required less of the end user than that? Can we? How?"
- **What it has decided.** Measurements taken on a slowed machine before a design is believed. Readers ranked by breadth across real codebases, not by the owner's own shapes. A map in 2D where the browser refuses 3D. A useful map from a cold scan, with authoring an addition and never a precondition. Chosen and not yet whole: every page feature with its twin on the command line, which asks nothing in the middle of a run.
- **What it costs.** Nothing that needs a graphics card, an install or a fast disk can be the only way. Any one language improves more slowly than if it were the only one.
- **Where its rules live.** The guide's parity line under "One source of facts"; [the large map on a weak machine](../../AI-Agent-Workspace/Work/explorer-holds-a-large-map.md); [proven on real repositories](../../AI-Agent-Workspace/Work/proven-on-real-repositories.md).

### As simple as possible, and no simpler

One source of facts, one engine, one way of doing each thing. The system itself must stay within its owner's understanding, which is the purpose turned on ourselves.

- **In the owner's words.** “A thing should be as simple as possible, *and no simpler*.” "wherever you see yourself reaching for two implementations to maintain for the same problem, ask whether the right architectural choices have been made." "If we think of code not as an explicit asset but as a liability, code must justify itself." "Better yet, only one pure implementation should underlie both."
- **What it has decided.** Everything shown is derivable from the stored facts, with no side channel. One walk of the graph behind the Explorer's paths and the command line's searches. One list that decides what a scan leaves out, where five layers of precedence stood. Dead code deleted without asking. A guarantee broken twice by review is replaced by a design that does not need it. Chosen and not yet built: one engine reading through one small interface with two hosts, three small functions written twice and nothing else.
- **What it costs.** A quick second copy is refused even when it would ship sooner. Rewrites of things that worked, when a simpler whole has become visible.
- **Where its rules live.** The guide's "Simplest complete, correct form" and "Clean workspace"; [the engine and its hosts](../layer-3/engine-and-hosts.mdmd.md).

## The method: the design is found between them

The values pull against each other, and that is expected. The owner (2026-11-20): "You are listing off important values that we care about maximizing. Reality will likely push back against us and force us to be unable to maximize all of our values simultaneously." And of the layout (2026-11-15): "maximizing competing concerns to produce a good layout _emergently_. That is what I believe is genuinely unique and interesting about our layout strategy".

So a list of values is a set of things to trade, never a set of gates. When two conflict: bend each in turn, follow each bend to its end, measure, choose the form that gives up least, and say which value paid. Uncertainty is healthy here; a design or a name stays on trial until it has earned itself.

Trades already made, each naming the value that paid:

| Between | What happened | Which paid |
| --- | --- | --- |
| A person can see it, and the map does not lie | A tidier picture would hide real wires. The wires stay, and the person narrows the picture by pinning. | Seeing, a little |
| A person can see it, and almost no words of ours | Testers ask for more labels. Words wait for a hover, and guarantees stand only where a person decides to trust. | Explanation |
| It is yours, and it meets you where you are | An installed web app would remember folders and open files by a double click, and is a site dressed as an app. The owner refused it; the single file stays the aim. | Convenience |
| It meets you where you are, and simple | Two surfaces invite two implementations. The design is one engine reading through one small interface with two hosts. | Speed of delivery |
| The map does not lie, and it meets you where you are | More languages, each measured. What a reader gets wrong is ledgered by cause, not hidden. | Coverage claimed |
| A person can see it, and a weak machine | The arrival's zoom-out stalls on a slow machine. It stays a trial until the stall is cured at its cause. | The motion, for now |

## WCAG's four principles, and where they sit

Perceivable, Operable, Understandable and Robust are a law for interfaces. They are how two of the five values are checked, and they apply to all three audiences, not only to a person at the page.

| | A person at the page | An agent at the command line | A pipeline |
| --- | --- | --- | --- |
| **Perceivable** | Readable names, never shrunk; a second sign beside colour; an honest sign of what is hidden | Plain text; bounded output with a count of what was cut | A log of what was read and what was not |
| **Operable** | Two ways to anything, the keyboard among them; reversible; nothing moves under the pointer | No question in the middle of a run; flags and files | Configuration alone |
| **Understandable** | Bearings kept across a change; one meaning per colour and side; few words | Stable shapes; a refusal in one line that says what to do | Exit codes that are a contract |
| **Robust** | 2D where 3D is refused; a weak machine | Any shell, Windows included | The same bytes for the same input |

The first three rows are "A person can see it", widened to every audience; the fourth is "It meets you where you are". The four principles say nothing of whether what is shown is true, whose machine it runs on, or how large the thing itself has grown. So they are a check inside the philosophy and not the whole of it.

## Other ways of cutting it, tried and set aside

- **The four principles as the pillars.** They cover the interface and leave out truth, ownership and size, which are where this product differs from others.
- **By audience** (person, agent, pipeline). An axis every value crosses, as the table above shows, and not a value.
- **A standard list of software qualities** (usability, correctness, security, portability, performance, maintainability, reliability). Complete and generic: it gives no instinct and names no trade. As a cross-check it found nothing unowned: usability is the first value, correctness the second, security and privacy the third, portability and performance the fourth, maintainability the fifth; reliability, such as a stopped scan that resumes, sits under the third and fourth.
- **The seven clusters the owner's own statements fall into** (understanding; honesty; local and yours; reach; orientation; emergence and simplicity; a quiet interface). Orientation and the quiet interface are how a person comes to see, and joined the first value; emergence became the method.

## Design values and working instincts are two lists with one root

How agents work in this workspace is not design philosophy, and the guide keeps it apart: working with the owner, continuity, stewardship. But the same five values, turned on the workspace, are where those rules come from, which is why they have felt of a piece.

| Value | Turned on the product | Turned on the workspace |
| --- | --- | --- |
| A person can see it | The map | Explanations at the owner's level; pictures; links that open the subject |
| The map does not lie | Readers and oracles | Say what was read; evidence; a reply counted as told only when the log shows it |
| It is yours | Local-first, your word honoured | The owner decides the forks; nothing pushed, nothing rewritten |
| It meets you where you are | Any machine, code or audience | Vendor-neutral; a new chat resumes from the record |
| As simple as possible, and no simpler | One of each thing | A clean workspace; a guide that holds only what is always true |

## The values and the work items

The owner's hypothesis (2026-11-22): every issue is "_potentially_ a true child of one of these values", so the values could head the work as epics. Tested on the nine issues of that day:

| Issue | Serves first | And also |
| --- | --- | --- |
| [A stranger follows a request](../../AI-Agent-Workspace/Work/stranger-follows-a-request.md) | A person can see it | |
| [Several repositories on one map](../../AI-Agent-Workspace/Work/several-repositories-one-map.md) | A person can see it | The map does not lie (suggestions, never facts) |
| [The readers](../../AI-Agent-Workspace/Work/readers-on-main.md) | The map does not lie | It meets you where you are (breadth) |
| [Proven on real repositories](../../AI-Agent-Workspace/Work/proven-on-real-repositories.md) | The map does not lie | It meets you where you are |
| [A scan leaves no trace](../../AI-Agent-Workspace/Work/scan-leaves-no-trace.md) | It is yours | |
| [The tool arrives as a page and a command line](../../AI-Agent-Workspace/Work/tool-arrives-on-windows.md) | It meets you where you are | It is yours; as simple as possible |
| [The Explorer holds a large map](../../AI-Agent-Workspace/Work/explorer-holds-a-large-map.md) | It meets you where you are | A person can see it |
| [The showing, rehearsed](../../AI-Agent-Workspace/Work/showing-rehearsed.md) | none: it is a date, crossing all five | |
| [The work items themselves](../../AI-Agent-Workspace/Work/work-items.md) | none: it is how we work | |

The hypothesis holds for product work: seven of nine have a clear first value. The two that do not are a milestone and a matter of process, which are other axes. And four of the seven serve a second value in earnest.

**Root's recommendation, the owner's to decide:** a field on each issue naming the value it serves first, and the board grouped by that field, in place of directories. A directory allows one parent where four issues have two; the milestone and the process issue would need a folder that is no value; and about 160 links in 50 files of the record, Memory and the summaries point at the issues where they stand. If the grouping proves itself on the board, directories can follow.

## What this rests on, and what would correct it

- **Read for it:** every entry's lead in owner.md (249) and in full its sections on what the tool has to serve and what the owner holds about the product, with twelve further entries read for their words; the vision's opening; the guide. Not read again for it: the day records behind those entries, which earlier roots mined.
- **Not yet done:** an independent reader, who has not seen these five, listing every statement of value in the owner's own turns, to find one that fits none of them. That is the test this document owes, by the workspace's own rule that nothing grades itself.
- **The owner corrects it.** These are their values in the root's arrangement. Where a title, a gloss or a trade is wrong, it is changed here and in the guide in the same commit.
