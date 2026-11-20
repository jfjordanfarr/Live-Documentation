# Open, close and pin: one grammar for both maps

_A proposal written by the root on 2026-11-20 UTC, for the owner. Nothing here is built and nothing here is a decision. It answers [Turn 16](../../2026-11-19.1.record.md#turn-16): "We probably need to go back to the UX drawing board and be holistic with respect to \"Open/Close\" and \"Pin\" states." Read for it: the sources linked below, each at the place linked; no code was run._

## The proposal in one sentence

**A click opens what is closed and selects what is open; it never lets go. Pin keeps. × lets go. Undo takes back the last thing you did.**

The rest of this page says what that changes, what it costs, and what else could be chosen.

## What the record already holds

| When | Where | What was decided | In whose words |
| --- | --- | --- | --- |
| 2026-10-20 | 2D | A click on a card inspects; pinning is a separate button. | Root's proposal; the owner: "Yep. I agree with that." ([direction](../../../../../../Memory/direction.md#pins-clicks-search-and-paths)) |
| 2026-11-02 | 3D | A click pins a file; the next click on it releases. | The owner asked for less than was built: "even if a click does not cause a node to be pinned in the 3D Local Map, that at least a _subsequent click_ on a node can in some way _release_ it from the network ... I just want to be able to add and subtract things from the set of pins I'm trying to look at rather quickly." Making the click a real pin was the agent's choice ([the record](../../../2026-11-01/2026-11-01.1.record.md#turn-7--reversible-contributions-to-the-explored-network)). |
| 2026-11-19 | both | Fold others away and Unpin others, two strengths of one gesture. | The owner: "Oh man that sounds absolutely awesome." ([Turn 33](../../../2026-11-18/2026-11-18.1.record.md#turn-33)) |
| 2026-11-19 | both | A thing that leaves the picture by itself: not built. | The owner: "I would not copy it verbatim or literally but I would let it haunt me for quite some time." (the same turn) |

Four findings stand beside those decisions:

1. **The same click means two things.** On a file it means "read it" in 2D and "keep it" in 3D. [The design system](../../../../../../../.mdmd/layer-2/design-system/interaction-and-accessibility.mdmd.md#23-where-the-same-act-means-different-things) records this as a clash it cannot give a reason for. A designer calls the result a *mode error*: a person must remember which map they are in to know what a click will do.
2. **In 3D the strongest hold is the one a stray click removes.** Five of six strangers sent to a pinned file began by clicking its sphere. The click took the pin off and replaced the whole picture ([the packet, question 2](../../Screenshots/owner-packet/3d/README.md)). They clicked to ask about the thing, not to let it go.
3. **The product has three strengths of holding, never named, and they are spread over different kinds of thing.** A file can only be pinned. A directory can only be opened. The one-slot preview exists only in 3D, as its "discovery" ([Turn 32](../../../2026-11-18/2026-11-18.1.record.md#turn-32)).
4. **Nothing lets go.** Every step of an exploration in 3D is a durable pin, so the picture only grows, and 12 of 73 interactions cannot be taken back at all ([the survey](../reversibility/README.md)).

## What is being traded

Each of these is the owner's, and no design gives all of them in full.

- **Add and subtract quickly** (2026-11-02, above).
- **Read one thing without moving the place being explored** (2026-10-20), and "swing along the monkey bars" of connections without losing one's bearings.
- **The first thing a person tries must not cost them the picture** (the strangers, 2026-11-19).
- **Every act can be taken back** (2026-11-19: "we need to ensure that our interactions are reversible").
- **The address is the thing you share.** A copied link or a bookmark returns to exactly what was on screen (Turn 16's "cons").
- **Few presses of the browser's Back to leave the page** (Turn 16's "pro").
- **Almost none of our own words on screen,** and no meaning that exists only on hover, since a touch screen has no hover.

## The three states

Every thing on either map is in one of three states. These are the owner's own words for them.

| State | What it means | A file in 2D | A file in 3D | A directory or group |
| --- | --- | --- | --- | --- |
| **Closed** | It is there, and shows nothing of itself. | A cell inside its directory. | A dim sphere beyond the hops. | A closed box (2D); a bubble or shell (3D). |
| **Open** | It shows itself and what it connects to. It stays until you close it or fold it away. | A card, with its connections drawn. | A lit sphere, with its hop of neighbours. | An opened box; a popped bubble. |
| **Pinned** | Open, and kept. It survives Fold others away, and no click removes it. | The same card, its pin pressed, a row in the tray. | The same sphere with its pin mark, a row in the tray. | The same, in the tray. |

This is the editor's model the owner raised on 2026-11-19: a closed file, an open tab, a pinned tab. Today "open" and "pinned" are the same thing for a file (only pins exist) and for a directory (only opening exists). The proposal gives every kind of thing both.

## What each act does

| You do this | To a closed thing | To an open thing | To a pinned thing |
| --- | --- | --- | --- |
| **Click or tap it** | Opens it. | Selects it: its name and actions show and its connections light. Nothing leaves. | The same as open: selects it. |
| **Press its pin** | Opens and pins it. | Pins it. | Unpins it. It stays open. |
| **Press its ×** (or Delete with it selected) | — | Closes it. | Unpins and closes it. |
| **Fold others away,** from its menu | — | Every other open thing closes. Pins stay. | The same. |
| **Unpin others,** from its menu | — | Every other thing closes, pins too. | The same. |
| **Undo** (a curved arrow, and Ctrl+Z) | Takes back the last act, whichever it was. | | |

Selecting is what a rested pointer does in 3D today, made to stay until the next click or Escape. That gives a touch screen its way to ask "what is this?", which it lacks today: a tap on a 3D sphere can only pin or unpin.

**One difference between the maps remains, on purpose.** In 2D a neighbour's card that another file brought into the picture already shows its name and rows, so it counts as open, and a click selects it. In 3D a neighbour at the edge of the hops is a dim sphere that shows nothing, so it counts as closed, and a click opens it. The reason is the decision of 2026-10-20: a 2D card is something you read, and a click that rearranged the map under a reader was what that decision removed. To grow from a 2D neighbour's card you press its pin, as today.

## One journey, today and under the proposal

A stranger opens a link to the 3D map with `archetype.ts` pinned, and wants to know what it is connected to.

| Step | Today | Proposed |
| --- | --- | --- |
| Clicks the sphere in the middle. | The pin comes off. The picture is replaced by the map's start. | The sphere is selected: its name, its actions and its lit connections. Nothing else changes. |
| Clicks a dim neighbour, `compose.ts`. | It is pinned. Its own neighbours appear. | It opens. Its own neighbours appear. |
| Clicks a second neighbour, `core.ts`. | Pinned too. The picture now holds three pins' worth of files. | It opens. Whether `compose.ts` stays open is the number in the next section. |
| Wants `compose.ts` kept. | It already is, like everything else touched. | Presses its pin. |
| Wants to tidy up. | Unpins each by hand, or Unpin others. | Fold others away: only the pins remain. |
| Regrets the last step. | Back, if the step happened to be one Back remembers. | Undo. |

## How many open things are kept

The editor's open tab "eventually disappears" once it is old. On 2026-11-19 the root advised against copying that, because a thing that leaves a map by itself costs a person their bearings, and the owner chose to let it haunt.

The three states give it a form that a person causes and can see: **a limit on how many things stay open without being pinned.** When one more is opened, the oldest open thing closes. Pinned things never count and never close.

| Open Things Kept | What exploring feels like |
| --- | --- |
| **1** | The editor's preview tab, and today's 3D "discovery" for every kind of thing. The picture is your pins plus the one thing you are looking at. Each click swings to the next bar. |
| **A few** (3, say) | The last few steps stay as a trail behind you. |
| **All** | Today's growth: everything opened stays until you fold it away. |

This is one lever in Tuning, so the owner can feel each value. No value is recommended before that; root's guess is that 1 will suit the 3D map and All the 2D map, where two directories are often opened to compare them.

## Undo, and the browser's Back

**What undo is.** Every act in the table above is one step of one history kept by the page. Undo takes the last step back and Redo puts it forward again. They stand as a pair of curved arrows, the sign Tuning's reset already uses, with Ctrl+Z and Ctrl+Shift+Z.

**The address stays the thing you share.** Every act rewrites the address in place, as a pin does today, and an undo rewrites it too. A copied link carries the picture as it stands and a bookmark returns to it. This is true of every alternative on this page. The list of past steps is not in a link, as the browser's own history is not.

**What Back does is a separate choice,** with three answers:

| | The browser's Back does this | Presses of Back to leave | What it costs |
| --- | --- | --- | --- |
| **As today** | Steps through places: each view, subject, opened directory and page of the reader. | One for every such move. | Nothing new. Opening a directory stays a Back step while opening a file is an Undo step, though the proposal makes them the same act. |
| **Views and reading only** (root's recommendation) | Steps between views and between pages of the reader. Everything done to the picture is Undo's. | One for each view or page visited. | A person who pressed Back to close a directory must learn Undo. |
| **Back leaves** | Leaves the Explorer in one press. The page's own arrows walk its history. | One. | The mouse's side button and Alt+← stop working inside the page, against what people expect of a web page. |

## What today's mechanisms become

| Today | Under the proposal |
| --- | --- |
| A file's pin, however made (the Pin button, a 3D click, a cell, a search result) | Pinned, when made by the pin or by choosing a search result. Open, when made by a click on a closed thing. |
| A symbol's pin (2D) | Unchanged: a pin narrowed to rows of its file. |
| An opened directory, which the tray counts as a pin | Open. Pinned only if its pin is pressed. |
| A popped 3D bubble, remembered only by the view and lost on reload | Open, and carried in the address like every other open thing. |
| The 3D "discovery", one slot | Open, with Open Things Kept at 1. |
| The subject (Centre) | Unchanged, and still its own control. |
| "Pin" on the World Map, which keeps a piece's panel showing | Select. The word pin then means one thing everywhere. |
| A click on a 2D card's body, which does nothing while Enter opens the reader | Select, by click and by Enter alike. |

## The alternatives

**A. Click selects, pin adds: the 2D rule in both maps.** Two states only, closed and pinned. A click never changes what is in the picture, anywhere.
- *For it:* the simplest grammar, and the safest for a stranger.
- *Against it:* growing the 3D picture takes two presses for every step (select, then pin), which gives up "add and subtract quickly". Nothing ever lets go by itself, so the crowding stays.

**B. The proposal: click opens, pin keeps.** Three states, with the limit as a lever.
- *For it:* one click still grows the 3D picture; a click never destroys; pin comes to mean more than "is in the picture"; the haunting gets a form to try.
- *Against it:* a third state to draw and to learn, and the largest build of the three: the pins' state, both maps' presses, the tray, the address and the page's history all change.

**C. Today's rules, with the dangerous clicks guarded.** A click on a pinned sphere that is the subject, or the last pin, shows its actions and does not release it. Clear all pins always becomes a step that can be taken back.
- *For it:* the smallest change, and the strangers' loss is ended.
- *Against it:* it keeps two meanings for one click and adds an exception to the 3D one. The owner asked for a holistic answer, and this is a patch.

**A variant of B to try beside it:** a second click on an *open* thing closes it, as on 2026-11-02, while a pinned thing is still safe from any click. It subtracts in one press. But a tap then cannot ask what an open thing is, and a stranger's click on an open sphere still removes something.

**Root's recommendation: B,** tried against its variant and at each value of the limit, with Back for views and reading only.

## What it would change in earlier decisions

- **2026-11-02, "a click pins, a second releases" (3D).** A click would open, not pin, and a second click would select, not release. What the owner asked for that day, adding and subtracting quickly, is kept by the one-press open and by ×, Delete, Fold others away and Undo.
- **"An opened directory is a pin"** (2026-10-14, the tray counts them). An opened directory would be open, and in the tray only when pinned.
- **Back skips pins** (2026-09-30: "Remember that we can split out the pinning history from the navigation history"). This builds that second history, which was never built, and under the recommendation moves opened directories and the subject into it.
- **2026-10-20, inspect first in 2D,** is kept, and its body click gains the meaning it lacks today.

## Not settled, and what a trial must show

- **How open is told from pinned at a glance,** in both maps, without words. The pin mark exists; whether an open thing needs a sign of its own is a question for pictures.
- **Where × stands on a 3D sphere,** among the three actions that appear on a rest, and whether Delete alone would do.
- **Whether the limit should count directories and files together.**
- **What a link from before the change opens as.** The likely answer is that its pins stay pins and its opened directories arrive open.
- **Whether strangers stop losing the picture,** by the same blind test that found the fault.

**How it would be built:** as a trial behind levers, with today's behaviour the default until the owner has tried it: Clicks (Today, Opens And Selects, and the variant), Open Things Kept, and the Undo pair. It touches the same files as the four picture trials still parked from 2026-11-19, so it is built after they have landed or been dropped.
