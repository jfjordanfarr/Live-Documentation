# Interaction and Accessibility

_Current, authored. Written 2026-11-18 from the code at `4856acf3`, read without a browser; where only a browser can tell, the entry says "not tested" and waits for a second pass._

## Metadata

- Layer: 2
- Audience: builders of the Explorer, the root agent judging a picture or a journey, the owner, readers of blind playtests, contributors

This is half of the Explorer's design system: **how the product behaves and whom it serves**. The grammar of pointer, keyboard and touch; the states every control can be in; the keyboard; what assistive technology is told; conformance to WCAG 2.2 at level AA; target sizes; responsiveness; portability; the words on screen; and the feedback the product gives while it works. The other half, colour, type, shape, spacing, layering, iconography, motion curves and data encodings, is [Visual Foundations](visual-foundations.mdmd.md), beside this file.

It states rules. A description of each view is [the Explorer design](../../layer-3/live-documentation-explorer.mdmd.md); how a rule came about is [the decisions log](../../layer-3/architectural-decisions.mdmd.md) and [the owner's Memory](../../../AI-Agent-Workspace/Memory/owner.md); open questions and ideas live in [direction](../../../AI-Agent-Workspace/Memory/direction.md) and [ideas](../../../AI-Agent-Workspace/Memory/ideas.md). What could not be defended when this was written, and what is missing, is in [the dated findings of 2026-11-18](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/design-system/README.md), with this half's findings as first written, each followed by a checker's verdict, in [the interaction findings](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/design-system/interaction.md); a rule here that the product breaks says so in its status and points there. Every entry was checked against the code on 2026-11-18 by a reader who had not written it, and corrected where it was wrong.

### How to read an entry

Each rule has:

- **its name in a designer's words**, defined in a clause the first time it appears;
- **the rule**, as a plain sentence a builder can follow;
- **why**, of three kinds only: the owner's stated intent (their words, with the record), a named principle of interaction design or a criterion of a published standard, or a measurement on this product;
- **where** the product holds it (file and line at `4856acf3`);
- **checked by**: the test that would fail if it broke, or "nothing";
- **status**: *holds*; *broken* (where); or *proposed* (not yet the product's).

Paths are relative to `packages/explorer/src/client/` unless they start with `tests/` or `packages/`.

---

## 1. Principles

Ten rules that everything below applies. Each is the owner's, made precise.

| Principle | The rule | Why |
| --- | --- | --- |
| **Intent, not attention** | Hover and keyboard focus *indicate* (they name, light or dim); only a click, a tap, Enter or Space *changes* the picture. | Owner, 2026-09-28, of the World Map's systems: "clicks on any system should pin the popover and require dismissing (or change its contents when clicking on another system)" ([the black-boxes probe](../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/2026-09-28/Probes/black-boxes.md); `owner.md` heads it "A click pins, a hover peeks"); 2026-11-05: "text expansion does not occur on hover but instead on tap/click ... too difficult and finicky to actually work as a human end user with a computer mouse" ([owner.md, Formatting and visual taste](../../../AI-Agent-Workspace/Memory/owner.md#formatting-and-visual-taste)). Touch screens have no hover, so a meaning bound to hover does not exist for them. |
| **One grammar for every input** | Every meaning has a visible target, activated the same way by a tap, a click or Enter. A gesture (double activation, a drag, a hold, a key) may be a second route, never the only one. | Owner, 2026-10-15, taking the agent's proposal whole: "This sounds great! Let's go ahead and give it a go!" ([Turn 10 of the October 14 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-14/2026-10-14.1.record.md#turn-10); the [decision](../../layer-3/architectural-decisions.mdmd.md), "Clicks Pin What They Name"). WCAG 2.2 SC 2.1.1 Keyboard, SC 2.5.1 Pointer Gestures and SC 2.5.7 Dragging Movements say the same of keyboards, multi-point gestures and drags. |
| **At least two ways** | Anything a person can do, and above all any move between places, has at least two routes. | Owner, 2026-09-29: "expect there to almost always be _at least two_ ways to do anything in the program (a stance I'd most strictly apply to navigation". |
| **Orientation is kept** (*object constancy*: a thing on screen stays recognisably the same thing through a change) | Following a connection, changing scale or perspective, opening evidence and coming back keep the subject recognisable and in place; a transition shows where things went. | Owner, 2026-09-30: "Consistency of view -- the ability to keep one's bearings as they click around" ([Turn 16 of the September 30 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/2026-09-30/2026-09-30.2.record.md#turn-16)); AGENTS.md, "Orientation". |
| **A hidden door is the design's fault** (*discoverability*: whether a person can find that an action exists) | A thing a person can do is visible where they would look for it; if a newcomer does not find it, the door is changed, not the newcomer. | Owner, 2026-11-02 ([owner.md](../../../AI-Agent-Workspace/Memory/owner.md)); Norman's principle of discoverability. |
| **Their words, not ours** | The words on screen are the authors' own, from their files. Ours are names of controls, kept in tooltips and accessible names; a word of ours drawn on screen is the last resort. | Owner, 2026-10-30: "We should strive heavily to avoid _text authored by us onscreen_"; 2026-11-16, of the legend: "minimize visibile words that come from _us_". Nielsen's heuristic of *aesthetic and minimalist design*. |
| **Every claim is a link** (*traceability*) | A panel that states a fact links to where the fact comes from. | Owner, 2026-09-29: "why is that not a hyperlink? My immediate instinct is to attempt to verify." |
| **The picture does not lie** | A reduction that hides something says so (a count, a ring, a fade) and leaves a way back. | Owner, 2026-10-01: "I'm not open to having the user open the shape of their software and believe it's all fine and dandy when it's not." |
| **The page reads only its own site** | Nothing on the page fetches from or sends to another site; a link elsewhere opens only on a person's click. | Decision of 2026-10-21 ([decisions log](../../layer-3/architectural-decisions.mdmd.md), "The Explorer Reads Only Its Own Site"); the owner's ask of 2025-12-14: "Tests proving that Live Documentation cannot and will not ever access the internet." |
| **Say what is happening** (*visibility of system status*, Nielsen's first heuristic) | While the product works it shows that it is working, and it never hands the person the browser's offer to kill the page. | Owner's decision of 2026-10-28 ([direction, Forces, motion and rest](../../../AI-Agent-Workspace/Memory/direction.md#forces-motion-and-rest)); the building sign of 2026-11-15. |

---

## 2. The interaction grammar

*Interaction grammar*: the small set of acts a person can perform and the fixed meaning each act has. A good grammar is learned once and works everywhere; where one act means two things in two places, a person must remember which place they are in (*mode error*).

### 2.1 What each act means, by surface

| Act | 2D Local Map | 3D Local Map | World Map | Reader and panels |
| --- | --- | --- | --- | --- |
| **Hover** | Lights a row's or card's wires and fades the rest; on a returning connection's lace or a card's foot on its returns, lights the whole connection (both laces, its route, both cards); draws no text of its own. A wire the pointer has rested on fades the others and peeks with its words, as the World Map's does (Wire Answers, a trial of 2026-11-21, on by default since 2026-11-22); the pointer can go onto the words (2.2, *content on hover*); a press pins them. | At once, only the pointing hand (and a wrapper's rim) says a sphere can be pressed; once the pointer has rested, names the sphere, offers its actions and fades what it does not touch (see 2.2, *hover intent*); no hover while the map builds (save while the Scan Growth trial fills it, 2.2). | At once, only the pointing hand; once the pointer has rested, peeks: the thing's panel stands beside it until the pointer leaves. | Tooltip (the native `title`) on controls. |
| **Keyboard focus** | Same as hover, a returning connection's lace among the stops, and the camera brings the focused control into the frame. | A name's button takes focus; focus previews as hover does. | Same as hover; a ring on the piece's outline. | Focus ring. |
| **Click or tap on a name** | Opens or folds that name's description (a file's name: Purpose and every description). | Same as a click on its sphere. | A link in a pinned panel: a thing's name pins it, a file opens it in the Local Map. | Follows the link inside the reader. |
| **Click or tap on a body** (card, sphere, piece) | A card's body does nothing; a closed directory's box opens it. | Pins the file; a second click releases it. A directory toggles its discovery. | Pins the piece's panel. | — |
| **Pin** (the pin icon) | Retains a file or symbol and its connections; pressed again releases only what it retained. | The same, from the sphere's actions. | — (the World Map has no Pin control; see 2.3) | The tray lists pins; each row can release or focus. |
| **More, right-click, a stationary hold of 550 ms, the ContextMenu key or Shift+F10** | One menu of the item's commands. | The same menu. | — | A tray entry's More holds Fold others away and Unpin others for that entry. |
| **Open / Close** (directory) | Discloses or withdraws a directory's contents; an opened directory is a pin. | Open: the whole directory; Close: withdraws it. | `open` in a pinned panel enters the thing in the Local Map. | — |
| **Centre** | Makes the item the map's subject. | The same. | — | — |
| **Double activation** | Nothing (omitted on purpose). | Nothing. | Enters the thing (a second route; `open` is the first). | — |
| **Drag** | Pans. | Turns the camera; moving right turns the view left, moving down raises it. | Pans; right-drag or Shift-drag orbits; dragging a piece moves it. | Scrolls. |
| **Wheel** | Zooms about the pointer. | Zooms toward the sphere under the pointer. | Zooms; wheeling in past half the view enters the thing under the pointer. | Scrolls. |
| **Escape** | Closes the surface on top (see 4.3). | Cancels a press; closes the surface on top. | Ends the walkthrough, closes help, lets go of a pin, clears a hover, in that order. | Closes the reader. |

Where each is held: the 2D press, hold and menu in `views/localView/controller.ts:1630-1720`; the 3D press in `views/forceGraphView.ts:2062-2147`; the World Map in `views/worldMap/controller.ts:1700-1866`; the menu in `panels/item-menu.ts`. Checked by `tests/e2e/pin-clicks.spec.ts`, `force-graph-focus.spec.ts`, `inspection.spec.ts`, `local-map-pins.spec.ts`, `world-map.spec.ts`.

### 2.2 The rules of the grammar

**Hover indicates; it never rearranges.** A hover may light, dim or name; it never opens text, moves a card or changes the layout.
- Why: the owner's words of 2026-11-05 (principle *Intent, not attention*); hover does not exist on a touch screen; WCAG 2.2 SC 1.4.13 Content on Hover or Focus.
- Where: `views/localView/card-reading.ts` (descriptions open on a tap only); the decision "Descriptions Open on a Tap, Not on Hover".
- Checked by: `tests/e2e/card-reading.spec.ts`.
- Status: holds in 2D and 3D. The World Map's hover opens a panel beside the piece, which is indication within the rule (it moves nothing), but it is the one hover in the product that draws our text; since 2026-11-19 it waits for the pointer to rest (the next rule).

**A moving pointer shows only that a thing can be pressed; words and fades wait until it rests** (*hover intent*: the pointer's pausing on a thing, read as the wish to know about it, as against its passing over on the way elsewhere; the pause it takes is the *dwell time*).
- Rule: what a moving pointer touches may show at once that it can be pressed, without a word and without changing the rest of the picture: the cursor, and a 3D wrapper's own rim. A name, a sentence, a panel of words, a wire's words and the fading of everything else for the thing's sake wait until the pointer has rested on it for the dwell, 350 ms, within 4 px, and go at once when the pointer is on something else. Every thing waits afresh: a rest on one thing does not let the next show its words without a rest of its own (no "warm tooltip"). Only the pointer's own movement starts a rest again: a picture moving under a still pointer neither starts it again nor ends it, and what stands under the pointer when the dwell is reached is rested on (whether anything may begin while the 3D map builds, and in the drift after it until the pointer moves, is the building rule's). Keyboard focus and a tap are deliberate and wait for nothing. The one grace: a 3D sphere's actions stay while the pointer crosses the gap to them, over anything on the way.
- Why: the owner, 2026-11-19, after blind testers who were models wished that wires and boxes said more under the pointer: "Models live on text. It's natural for them to wish for there to be more. This is a bias we must account for. ... It is possible to take complex stuff and make it intuitive enough that words are only warranted on a modestly long hover or something of the like. What I don't want to have is an application which is shooting random text at me every which way as I scroll my mouse across the screen (which it most certainly does in the 3D local map ...)" ([Turn 22 of the November 18 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-22)); and 2026-11-02: "we don't draw a node's name (unless hovered over) until _the very last second_ ... our current system is overexcited to draw text". Their baseline, Microsoft Teams. *Fade the irrelevant rather than boosting the relevant* (AGENTS.md) is why the at-once sign is the touched thing's own and not a change to the rest. The dwell was chosen from 250, 350 and 500 ms ([the pictures and the frames](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/rested-pointer/README.md)).
- Where: the rule, `views/pointerRest.ts` (`REST_DWELL`, `REST_TOLERANCE`), used by the 3D map (`views/forceGraphView.ts`, `updatePointerHover`, `settleRest`) and the World Map (`views/worldMap/controller.ts`, `lookAtRest`). It stands beside the building rule (`views/forceGraphBuilding.ts`), which says whether a hover may begin at all while the 3D map builds.
- Checked by: `views/pointerRest.test.ts`; `tests/e2e/force-graph-focus.spec.ts` ("a pointer crossing spheres shows only that they can be pressed …"); `world-map.spec.ts` ("a pointer crossing the board peeks at nothing …", "the keyboard on a piece peeks at once …"); the building rule's own `force-graph-building.spec.ts`.
- Status: holds in the 3D map and the World Map since 2026-11-19. **Broken** in 2D, where a hover lights a row's wires and fades the rest at once; it draws no words, so the fade is what remains to wait. A 2D wire holds it (Wire Answers, a trial of 2026-11-21, on by default since 2026-11-22): its words and its fade wait for a rest on it, and a pointer passing over draws nothing (`views/localView/wire-answers.ts`; `tests/e2e/wire-answers.spec.ts`).

**Words shown for a rested pointer can be entered, sent away and relied on to stay** (*content on hover*: WCAG 2.1 success criterion 1.4.13, Content on Hover or Focus, level AA).
- Rule: a panel of words that a rested pointer or the keyboard's focus brings up is, in the criterion's three words, *hoverable*: the pointer can be moved onto it without its going, so its text can be read closely, selected and copied; *dismissible*: Escape takes it away without the pointer or the focus moving, and it stays away until the pointer has been elsewhere; and *persistent*: it stays until the pointer or the focus leaves, it is dismissed, or what it says is no longer true, and no clock takes it away. The way from the thing to its panel is forgiving: the words stay while the pointer is inside the smallest convex shape that holds the point they were asked at and the panel, widened by 10 px. That is the one grace beside the sphere's actions in the rule above, and it is a place, not a delay: a pointer outside that shape is on something else, and the words go at once. The panel stands beside what is pointed at and never on it. A press inside the panel is the panel's: it neither moves the map nor pins nor lets go.
- Why: the owner, 2026-11-22, of a 2D wire's words: "Works fine! Yeah the Wire Answers \"On\" is really awesome. I think the only thing it makes me wish I had is the ability to mouse into those popovers so I can copy some text out. But that's minor and that's just some goodies that only mouse/keyboard folks would really get to enjoy." The criterion asks the same for a reason of its own: a person who reads with the screen magnified must bring the pointer onto the words to see them, and words that come up unasked over what they were reading must be sendable away without moving. The owner's "we need to ensure that our interactions are reversible" is the dismissal.
- Where: the way to a panel, `views/pointerRest.ts` (`onTheWay`, `WAY_SLACK`); the 2D wire's panel, `views/localView/wire-answers.ts` (`keepsWords`, `dismiss`) and `styles/local.css` (`.wire-answer`).
- Checked by: `views/pointerRest.test.ts` ("the way from a thing to the panel of its words"); `tests/e2e/wire-answers.spec.ts` ("hoverable …", "dismissible …", "persistent …").
- Status: holds for the 2D wire's words since 2026-11-22. **Broken** elsewhere, found the same day and not mended, each in a client another piece of work held: the World Map's peek at the pointer's thing follows the pointer at 18 px and takes no pointer, so it cannot be entered (*hoverable* fails), and Escape takes it away but the next movement of the pointer on the same thing brings it back, its rest being kept (*dismissible* in the letter only); it is persistent. It would take the peek standing beside its thing, as the keyboard's peek and the pinned panel already stand (`placeEvidence`, `panelBeside`), taking the pointer, held by `onTheWay`, and kept away after Escape until the pointer has been elsewhere. The 3D map's wire tooltip (`views/forceGraphRenderer.ts`, `showWireAt`) follows the pointer at 12 px, takes no pointer and has no Escape: *hoverable* and *dismissible* fail; it would take the same three things, or the wire's words in a panel of the 2D wire's form. A 3D sphere's name and actions are hoverable by the grace of the rule above and persistent; Escape does not send them away. A card's explanations on hover, a cell's file name, a cut's count and Tuning's sentences are the browser's own `title` tooltips, which the criterion leaves to the browser; what they say must also be reachable without a mouse (11.2).

**Everything of a card takes the pointer before a wire's reach does** (a control is never lost to something that has no box of its own on the screen).
- Rule: a wire's reach for the pointer is wider than the wire, twelve of the screen's pixels at every zoom, so that a wire can be pointed at from far out. That reach holds the pointer only on the map's ground. Where a card, anything in a card, any control or the words' own panel stands at the pointer, it takes the pointer, the press and the hand, and the wire says nothing: a wire's words never cost a reader a control. Of two wires whose reaches hold the pointer, the nearer answers. The keyboard's way to a wire is unchanged: its band is still the wire's focusable, named element.
- Why: the gate of 2026-11-22. The wires are drawn above the cards, and a band that took the pointer took it wherever it lay: pulled back as the arrival leaves the picture, a reach is 36 of the map's units wide, and the More of one card lay under the band of a wire between two other files, so a press on it pinned that wire's words. The root's ruling of that day gives the rule in these words. A cap on the reach would have taken away what makes a wire easy to point at when zoomed out; a layer of bands under the cards would have touched every interactive thing on the map.
- Where: `views/localView/wire-reach.ts` (the wire at a point, by its route), `views/localView/wire-answers.ts` (`bandUnder`, the ground, the hand), `styles/local.css` (`.wire-band`, `.wire-hand`).
- Checked by: `views/localView/wire-reach.test.ts`; `tests/e2e/wire-answers.spec.ts` ("everything of a card takes the pointer before a wire's reach does…").
- Status: holds for the wires' bands since 2026-11-22. A returning connection's lace still takes the pointer itself, as it has since 2026-11-19, over eight units about the lace.

**In 3D, what is seen under the pointer is what is pressed** (*the map does not lie*: a thing a person sees and cannot press is a hidden door).
- Rule: at a point of the 3D map, a press, a hover, a rest, a touch and a drag's grab all take the same thing: the nearest sphere the pointer's ray meets, drawn as itself, wherever a wrapper's translucent skin stands nearer the eye; a wrapper (a wrapped group or a directory shell) takes the point only where the ray meets no sphere, and acts there as its seed. A shell's own files are drawn as its cells, never as spheres, so a shell keeps the rest of its face.
- Why: the root's ruling of 2026-11-23 on the owner's first two values, "a person can see it" and "the map does not lie", and their standing words "A hidden door is the design's fault". A sphere is drawn before the skins and seen through them. Until that day the skin met first took the point: measured, a shell's edge swept before `graph.ts` as a person rested on it just after pressing it, took its actions and faded it under the still pointer, and at the end of the build the same file, plainly seen through the shell, could not be pressed at its centre ([the measurement](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-23/Probes/picking/README.md)). Of the alternatives weighed, keeping what a press took under a pointer that has not moved would have mended the first and not the second.
- Where: `views/forceGraphBatches.ts` (`pickedAt`), asked by `views/forceGraphRenderer.ts` (`nodeAt`), the map's one picker.
- Checked by: `views/forceGraphBatches.test.ts` ("what a press takes where a skin stands before a sphere"); `tests/e2e/force-graph-picking.spec.ts`.
- Status: holds since 2026-11-23.

**A thing's actions go with what they act on, except under the pointer or an open menu** (*common fate*, the Gestalt law that things moving together are seen as one: a control left behind seems to belong to whatever comes under it).
- Rule: a 3D sphere's actions (Pin, Centre, More) stand beside their sphere and move with it as the camera or the picture moves. Under the pointer, or while the menu they opened is open, they stand still on the screen, so that a settling sphere does not pull a control from under a hand aiming at it. Keyboard focus is no place on the screen: actions holding it go with their sphere, and are not hidden from under it. The grace of the rule above, that the actions stay while the pointer crosses the gap to them, stands beside this one.
- Why: *object constancy* (principle *Orientation is kept*) and *common fate*; *pointer cancellation*'s sense for the hold under the pointer, since a target moving under an aimed pointer is missed; focus "never lost to the page" (4.4). A measurement on this product: until 2026-11-20 keyboard focus held the actions still on the screen too, and after Centre on in the reader, which gives focus back to More, the camera's flight brought the centred file to rest under its own actions, which covered it and hid its name ([the run-down](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/landing-reds/README.md#the-focus-case-run-down)). Why the rule of 2026-10-20 had named the keyboard beside the pointer was not recorded.
- Where: `views/forceGraphView.ts` (`positionActionStrip`).
- Checked by: `tests/e2e/force-graph-focus.spec.ts` ("a focused URL centers its node …", after Centre on, where the camera's flight carries the file); the pointer's grace by "a pointer crossing spheres …". Nothing checks a focused strip against its sphere's own settling: after its own Pin a sphere does not move on the screen (measured 0.0 px on the estate sample, 2026-11-20), so that journey cannot tell.
- Status: holds since 2026-11-20. The actions' own Centre pressed with the mouse leaves them under the pointer while their file flies to the centre, until the pointer leaves them; left for the design of open, close and pin, where how a selected thing's actions stand is decided.

**A click acts on what it names, and a second identical click undoes it** (*reversibility*).
- Why: the owner's decisions of 2026-10-15 and 2026-11-02, which [direction](../../../AI-Agent-Workspace/Memory/direction.md#what-it-shows-discovery-groups-and-hops) heads "A click pins, a second releases" (a heading's words, not the owner's); Nielsen's heuristic *user control and freedom*.
- Where: `views/pin-state.ts`; `views/forceGraphView.ts` `activateNode`; a 2D card's `+N symbols` disclosure, which turns into `−N symbols` (accessible name `Fold N symbols`, keyboard focus kept) while expanded so folded rows fold back in one press (`views/localView/branch-renderer.ts`, since 2026-11-24); the World Map's Reset layout, whose second press puts back what the first discarded until a piece is next moved (`views/worldMap/controller.ts:2032-2059`); Tuning's Reset to defaults, the same act for the viewer's settings, whose second press puts them back as they were until a lever is next moved (`panels/tuning-reset.ts`).
- Checked by: `tests/e2e/pin-clicks.spec.ts`, `tests/e2e/unconnected-symbols.spec.ts` (expand and refold round-trip), `force-graph-focus.spec.ts` ("direct labels release independent pins"; "a second directory click withdraws discovery"), `world-map.spec.ts` ("a reset keeps what it discarded until a piece is next moved …"), `tuning-reset.spec.ts` ("… Reset to defaults puts them all back").
- Status: holds. The World Map's reset joined it on 2026-11-19; before, it threw every moved position away with no way back. Tuning's reset was built to it the same night.

**Inspecting, pinning and moving the subject are three separate acts, each with its own control.** In 2D a click inspects, Pin retains, Centre moves the subject; none of the three does another's work.
- Why: owner, 2026-10-19 and 2026-10-20 ([decision](../../layer-3/architectural-decisions.mdmd.md), "Inspection, Pins and the Map Subject Are Separate"): to read one thing without moving the place being explored.
- Status: holds in 2D. In 3D a click on a sphere pins, on purpose (the owner's decision of 2026-11-02); so **the same click on the same file means "read it" in 2D and "keep it" in 3D**. This is recorded, not settled by a reason this document can give; see the findings.

**A press acts on release, and only if the pointer did not travel** (*pointer cancellation*).
- Rule: an action fires on the pointer's release over the target it was pressed on; a move beyond the slop (6 px in 3D, `SPATIAL_DRAG_SLOP` in `views/forceGraphRenderer.ts:13`; 6 px in 2D too, written as a literal in `views/localView/controller.ts:1642`), a second pointer, losing the window or Escape cancels it.
- Why: WCAG 2.2 SC 2.5.2 Pointer Cancellation (a press slid off can be abandoned).
- Checked by: `tests/e2e/force-graph-focus.spec.ts` ("dragging a sphere cancels a held action").
- Status: holds.

**Contextual commands are one list, reached five ways.** More, right-click, a stationary hold of 550 ms, the ContextMenu key and Shift+F10 open the same menu of the item's commands.
- Why: *At least two ways*; the platform conventions for a context menu (Windows: ContextMenu and Shift+F10; touch: long press); WAI-ARIA Authoring Practices, Menu Button pattern.
- Where: `views/localView/controller.ts:1639` and `views/forceGraphView.ts:2084` (the 550 ms hold); `panels/item-menu.ts` (the menu).
- Status: holds in 2D and 3D.

**What releases the others stands in the menu of the thing that stays** (the editor's *Close Others* convention): Fold others away (what is open elsewhere closes, pins stay), then Unpin others (every other pin goes too), beside the thing's own Pin. An item is present only when it would release something, never greyed out; each is one step Back takes back, is said once in the page's status region, and leaves the focus on the control it was chosen from.
- Why: the owner, 2026-11-19: "release everything _except_ what I'm interacting with now"; two strengths of one gesture approved the same night. A step that releases many selections at once must be reversible (*user control and freedom*), and a change made away from the focus is told (WCAG 2.2 SC 4.1.3).
- Where: `views/retained-state.ts` (`releaseOthers`, both strengths); `index.ts` (`othersCommands`, `releaseOthersOf`); `persistence/history.ts` (`stepWithinPlace`, the one entry within a place); `panels/pin-tray.ts` (an entry's More, shown only when it has something to offer).
- Checked by: `views/retained-state.test.ts`, `persistence/history.test.ts`, `tests/e2e/others.spec.ts`.
- Status: holds. Back does not restore the 3D Connections layout's pops, which are the view's own memory and not in the address.

**Double activation is never the only route.**
- Why: a double click has no equivalent on a keyboard and a double tap often zooms on a phone; the decision of 2026-10-15 removed it from the Local Map.
- Status: holds (the World Map's double click has `open` in the pinned panel and the wheel beside it).

**A dragged sphere carries what is tied to it while the hand moves; let go, the picture comes to rest as it does after any change.** (*Direct manipulation*: what a hand moves, and what follows from it, move with the hand and not after a wait.)
- Rule: while a hand holds a sphere of the 3D map the forces run, a frame taking as many whole ticks of the motion as its budget holds, up to eight, so that the files and shells tied to the sphere follow it as it moves; and those tied files and shells, by a pulling wire or a chain of them, let go of where they stood for as long as it is held, following by their ties alone, while every other sphere is still held toward where it stood. The picture is never said to be at rest while a sphere is held; on release it settles as after any change, from where it lies.
- Why: the owner, 2026-11-22: "I notice that the 3D graph stops simulating rather quickly. It's efficient, which is awesome, but the one place I would want that responsiveness back is when I'm clicking and dragging an item and swinging the graph around with me." Measured that day on this repository's map with its most connected file pinned and dragged ([the drag's folder](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Screenshots/drag-live/README.md)): a moving hand moves its sphere at every frame, and every such frame was held to one evaluation of the field, as a frame is when a new piece of the picture arrives, so the tied files had come about a third of their way when the hand arrived. The swing was tried from the same day as Tuning's Drag beside holding every sphere toward where it stood ([the two side by side](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Screenshots/drag-swings/README.md): the group's shells came 0.75 of the hand's way holding ground and 0.87 swinging, and swinging the group arrives as one thing with the hand); the owner, 2026-11-23, having tried both: "I like \"Swings\" a little bettter", and the lever went. Holding ground, the sphere let go was pulled back by its tied files to 0.489 of the hand's way; swinging, it keeps 0.70 ([the measurement](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-23/Probes/landing/README.md)).
- Where: `views/forceGraphLayout.ts` (`motionForce`, `HAND_TICKS`, `tiedTo`); the drag itself, `views/forceGraphRenderer.ts`; `views/forceGraphView.ts` (`onDrag`, `onDragEnd`).
- Checked by: `views/forceGraphLayout.test.ts` ("lets a paced call reach through a tick's substeps while a hand carries a sphere …", "lets what is tied to a held sphere let go of where it stood and swing after the hand …"); `tests/e2e/force-graph-drag.spec.ts`.
- Status: holds since 2026-11-22 for a dragged file's sphere, measured with the files and directory shells tied to it, and swings what is tied to it since 2026-11-23. A wrapped group or a veiled body under the hand was not looked at. Settle Hold is unchanged: it takes hold only with no sphere in a hand. Eight ticks a frame is a starting value for the owner's hand to judge.

**While the 3D map builds, its nodes take no hover and no click; a press made then is dropped, not kept.**
- Why: owner's decision of 2026-11-15 ([building measurements](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/Screenshots/building-map/README.md)): a click on a sphere that has moved under a still pointer acts on the wrong thing.
- Where: `views/forceGraphBuilding.ts`; `views/forceGraphView.ts:2072-2077`.
- Checked by: `tests/e2e/force-graph-building.spec.ts`.
- Status: holds, with one exception on trial since 2026-11-22. While Tuning's Scan Growth (off by default) fills the map, the rule is suspended: nodes take hover and press throughout, and the building sign is not shown, the scan's own sign standing in its place. Why: the owner, 2026-11-21: "I aspire to be able to let users do some exploring in 2D/3D local map _while the scan is happening_ ... I know I said we should ignore user inputs during 3D graph population when going from 2D to 3D, but I've never seen what it would look like to be in the 3D local map _as it is being built from scans_". The rule was made for a build of a few seconds; a scan lasts a minute or more, and a map that refused the pointer for its length would refuse the exploring asked for. What the rule guarded against is then possible again: a press acts on the sphere that stood under the pointer when the button went down (`views/forceGraphView.ts`, the press's own id), so a sphere that slid away before the press is missed, never mistaken; a rest ripens on whatever stands under the pointer when the dwell ends. Seen on this repository that day ([the trial's pictures](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Screenshots/scan-growth/README.md)): a press pins the sphere pressed and a rest names it; framed whole, the picture moves under a still pointer slowly; zoomed in, a named sphere slid some 180 px between two frames four seconds apart, so what a person loses is their place, not their click. Whether the suspension stays is the owner's to decide with the trial. Where: `views/forceGraphView.ts` (`updateBuilding`, `arriving`). Checked by: `tests/e2e/scan-growth.spec.ts`.

**The camera's turn follows the hand inverted** (*orbit convention*): moving the pointer right turns the view left; moving it down raises the camera.
- Why: owner, 2026-09-28 and 2026-09-29: "moving mouse right = rotating left is more natural to end users".
- Status: holds in 3D (the renderer) and the World Map (`views/worldMap/controller.ts`). Checked by nothing named.

**The picture moves on intent, and at most once after it arrives on its own.**
- Rule: zoom never changes a card's box; a pin keeps the acted-on row under the pointer; the continuing layout search may move a drawn picture once to a cheaper one.
- Why: owner, 2026-11-05 ("I really would prefer that the cards don't _themselves_ resize when we zoom out") and 2026-11-16 ("I see the quick initial rearrangement and... no problem!").
- Checked by: `tests/e2e/zoom-looks.spec.ts`, `local-map-row-motion.spec.ts`.
- Status: holds.

**A step from inside the map keeps the camera's scale and brings what it brought into view** (*visual momentum*: each new view carries the eye from the last, so the person never has to search for what they just asked for).
- Rule: after a press inside the 2D map adds to the picture (a cell pinning its file, a directory's skin or closed box opening, a neighbour pinned from a card), the camera holds what was pressed through the re-layout, then, once the picture has settled, pans the least that brings the newcomer wholly inside the frame's padding at the same scale, a card taller than the view at its top; the newcomer wins over what was pressed; its outline is emphasised in the active colour and fades over about a second. Under reduced motion the pan is a cut and the mark only fades. A fresh subject is not a step: Tuning's Arrival frames it.
- Why: owner, 2026-11-18 ("I might wish the camera followed the newly-opened one though, as I quickly lose it"); owner, 2026-10-02 ("if the user's eye is looking at a thing, that thing should stay relatively situated inplace while the world moves around it"), held for what was pressed until the newcomer needs the view.
- Where: `views/localView/camera-intent.ts` (`revealPan`, `STEP_MARK_MS`); `views/localView/controller.ts` (`capturePinChange`, `captureDirectoryChange`, `settleIntoFrame`, `newcomerOf`, `markNewcomer`); `styles/local.css` (`.local-step-mark`).
- Checked by: `tests/e2e/camera-intent.spec.ts`; `views/localView/camera-intent.test.ts`.
- Status: holds since 2026-11-19.

**Under Follows Pins, the camera follows the pinned set until the person takes it, and Fit gives it back** (*user control and freedom*: an automatic camera is welcome only while the person's hand is not on it, and leaving it must cost nothing; *visual momentum* again, since the frame widens to hold the pins already swung along rather than riding away from them).
- Rule: with Tuning's Framing at Follows Pins, the camera frames the subject (while it holds no pin; beside others, its name line), the pins and a directory opened while following, newest first, at the largest scale up to reading size that holds them and no farther than the connections look's last press; the oldest are left out where they do not fit, the newest never; one pin is framed as an arrival frames it; of several, the newest is held whole and the older by their name lines. It re-frames in one ease, longer for longer travel, once the picture has settled after a pin, an opening or a move of the layout; a re-frame the person did not cause never zooms in and never drops a target it can keep, and a change of the pinned set that moves the frame far takes the smooth zoom's path (*smooth zooming and panning*, van Wijk and Nuij). A pin left out says *Outside the frame* in the pin tray, in its name too. The person's pan, wheel, pinch, zoom button, Return to Reading Size or a focus asked on one thing ends the following; Fit, then named Follow pins, resumes it and is pressed while it holds. Under By Hand the step's rule above applies unchanged.
- Why: owner, 2026-11-19 (Turn 37 of the November 18 record): "follow the sucker for a bit if the user hasn't provided input to navigate in any direction (panning, zooming, etc.)", "try to frame every pinned thing as best you can with bias towards most recent items".
- Where: `views/localView/camera-intent.ts` (`pinsFrame`, `keepFrame`, `smoothZoom`, `framingEaseMs`, `poseBetween`); `panels/pin-tray.ts` (the row's words and name); `views/localView/controller.ts` (`framingTargets`, `pinsFraming`, `reframePins`, `easeFollowing`, `setFollowing`); `index.ts` (Fit's state).
- Checked by: `tests/e2e/camera-intent.spec.ts`; `views/localView/camera-intent.test.ts`.
- Status: a trial since 2026-11-19, By Hand the default until the owner has seen it.

### 2.3 Where the same act means different things

These are stated so a builder does not mistake them for accidents. Each is in [the findings](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/design-system/README.md#the-owners-forks) with the choices it leaves the owner.

| Act | Meanings | Recorded as |
| --- | --- | --- |
| A click on a file | 2D: inspect. 3D: pin. | Two decisions, 2026-10-20 and 2026-11-02. |
| The word "pin" | Local Maps: retain a file or symbol and its connections across exploration. World Map: keep one thing's panel open. | No decision names the clash. The Way Down trial (2026-11-22, off by default) joins the two for the length of a way down: what is pinned on the board opens as the Local Map's pins, a thing as the files that carry its calls and a wire as the files at its ends, and stays pinned on the board for the way back ([the Explorer design](../../layer-3/live-documentation-explorer.mdmd.md#independent-exploration)). |
| The wheel | Local Maps: zoom. World Map: zoom, and past half the view, change view. | The World Map's journey into the Local Map is the open ticket T8 of [the World Map plan](../../layer-3/world-map.mdmd.md). |
| Enter on a focused card body | 2D: opens the reader (`views/localView/card-factory.ts:278-282`), where a click on the same body does nothing (`:276`). The card is reachable only by script focus (`tabIndex = -1`, `:100`). | Not recorded. |

---

## 3. The states of every control

*State*: a condition a control is in that the person must be able to see and that assistive technology must be told. A design system names each state once, gives it one look, and maps it to one ARIA attribute.

### 3.1 The states and their one look

| State | Meaning | Look (rule) | ARIA | Where | Status |
| --- | --- | --- | --- | --- | --- |
| **Rest** | Available, untouched. | Quiet: muted icon or text, no border. | — | each component's CSS | holds |
| **Hover** | The pointer is over it. | A subtle fill (`--selected-subtle`) or the border and icon in `--state-selected`. | — | e.g. `styles/local.css:244`, `styles/history.css:12` | holds; two looks (fill or border) by component |
| **Focus-visible** (*the focus ring*: the outline the browser draws only when focus came from the keyboard) | Keyboard focus is here. | A 2 px solid outline in `--state-selected`, offset 2 px. | — | `styles/view-shared.css:431-437` and 50 more `:focus-visible` rules | broken at more than ten places: a 1 px ring (`styles/shell.css:426`, `:1030`); an underline with no ring (`styles/history.css:106`, `styles/shell.css:702–704` the reader's section jumps, `styles/sources.css:139–145` the Sources tree); a border with no ring (`styles/local.css:356` the ancestry chooser's rows, `styles/sources.css:309–312` the export choice); a border with a 0.2 halo (`styles/search.css:56–58`); a 1.5 px shadow (`styles/local.css:444`); the World Map's ring in the offers colour (`styles/world.css:455`); and the browser's own ring on the sidebar's small buttons |
| **Pressed** (*toggle button*: a button that stays on until pressed again) | A toggle is on. | Border and icon in `--state-selected` with the subtle fill. | `aria-pressed="true"` | `styles/local.css:311`, `styles/graph.css:81`, `styles/history.css:14`, `styles/world.css:446` | holds in look; see 5.4 for names |
| **Current** | This is the view you are in. | The navigation item filled. | `aria-current="page"` | `dom.ts:39` | holds |
| **Expanded** | A disclosure is open. | The panel shown. | `aria-expanded` on its opener | pin tray, sidebar, Tuning `<details>`, the World Map's help (`views/worldMap/controller.ts:310-313`, `:2120-2125`) | holds; the World Map's help since 2026-11-19, checked by `world-map.spec.ts` ("the help button says whether the help is open …") |
| **Disabled** | Not available now; or, for the 3D control where the browser refuses WebGL, not offered here (see 10.2). | Faded, default cursor. | `disabled`; `aria-disabled="true"` for a control that is not offered and keeps its focus stop to say why | five rules | broken: five different opacities, 0.3, 0.35, 0.45, 0.55, 0.65 (`styles/shell.css:59`, `styles/history.css:16`, `styles/local.css:335`, `styles/local.css:326`, `styles/reading.css:84`); and since 2026-11-19 Tuning's Reset to defaults draws its glyph in `text.disabled` at full opacity (`styles/shell.css`, `.tuning-reset:disabled`), the palette's tone for a disabled control in place of a fade, which makes a sixth form until one is chosen for all |
| **Building** | The 3D map is placing and framing; nodes refuse input. | After 300 ms a line sweeps along the map's top edge and the cursor waits; still under reduced motion. | none (see 6.4) | `views/forceGraphView.ts:525-537`; `styles/graph.css:99-123` | holds visually; not told to assistive technology |
| **Busy** | The 3D motion has not come to rest. | Nothing on screen. | `aria-busy="true"` on `#graph-svg` | `views/forceGraphView.ts:692`, `:1448`, `:2504`, `:2518`, `:2523` | inconsistent: see 6.4 |
| **Loading** | The bundle is loading. | Three dots where the map will be; "Loading…" in the sidebar's footer. | `role="status"`, named "Loading" | `shared/template.html:534-536`, `:496` | holds; two signs for one state |
| **Empty** | Nothing to show. | Search: "Nothing found". Tray: "No retained selections." Reader: "Click on any node to view details." | — | `search/search-field.ts:116`; `panels/pin-tray.ts:53`; `shared/template.html:574` | words of ours; see 11; the search's "Nothing found" is `text.muted` at 5.35 to 1 and said in the page's status region since 2026-11-19 (it was the disabled grey at 2.86) |
| **Error** | The product cannot go on. | A refusal: one sentence where the map would be. A fault: its stack in the detail panel. | `role="alert"` (refusal, and a fault's message) | `errors.ts` | holds since 2026-11-19: a fault opens the reader reachable (not `inert`, not `aria-hidden`), under the heading "The Explorer stopped", its message an alert above its stack; checked by `tests/e2e/shell-accessibility.spec.ts` ("a fatal fault is shown in a reader a keyboard can reach…"). Before, the stack stood under "Select a Node" in a panel left `inert` and `aria-hidden` |

**Rule: one state, one look, one attribute.** A builder adding a control uses these looks and these attributes and adds no new ones.
- Why: *consistency and standards* (Nielsen's fourth heuristic); WCAG 2.2 SC 4.1.2 Name, Role, Value requires the state to be told, and SC 2.4.7 Focus Visible requires focus to be seen.
- Checked by: nothing checks the looks as a set. `tests/e2e/labels-and-controls.spec.ts` checks pressed state and focus on the 3D toolbar.
- Status: proposed as a rule; broken at the places named in the table.

### 3.2 Which states each component has

"Yes" means the state exists and is shown; "gap" means the component can be in that state and does not show or say it; "—" means the state does not apply.

| Component | Hover | Focus ring | Pressed or current | Disabled | Busy or building | Empty | Error | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sidebar navigation | yes | yes | current | — | — | — | — | `shared/template.html:26-36`, `dom.ts` |
| Sidebar toggle, Back and Forward | yes | the browser's default ring (no rule of ours) | — | yes (0.3) | — | — | — | `styles/shell.css:34-63` |
| Display filters (checkboxes) | browser | browser | checked | — | — | — | — | `shared/template.html:41-58` |
| Map toolbar (2D, 3D, layouts, Fit, Whole, History) | yes | yes | yes | yes (0.55) | gap: the toolbar does not say the map is building | — | — | `styles/local.css:310-326` |
| Zoom controls | yes | yes | — | — | — | — | — | `styles/view-shared.css:321-437` |
| Search fields | — | a border and soft ring | — | — | — | "Nothing found", not announced | absence sentence, by `aria-describedby` | `styles/search.css:56`, `search/search-bar.ts:205-209` |
| Pin tray | yes | yes | expanded | yes (0.45) | — | "No retained selections." | — | `panels/pin-tray.ts`, `styles/local.css:328-335` |
| Card actions and symbol rows | yes | yes | pressed | — | — | — | — | `styles/local.css:243-303` |
| Directory handles and closed boxes | yes | yes (three different forms) | — | — | — | — | — | `styles/local.css:443-455` |
| Tuning controls | browser | browser | — | — | — | — | — | `shared/template.html:91-491`, `panels/tuning.ts` |
| Item menu | yes | 1 px ring | — | — | — | — | — | `styles/shell.css:412-427` |
| Reader | — | yes | — | Back/Forward (0.3) | — | placeholder | fault stack | `shared/template.html:564-579` |
| Keys (legends) | tooltip | — | — | — | — | rows hide | — | `shared/template.html:62-88`, `panels/spatial-legend.ts` |
| History scrubber | yes | yes | play, details, authors | yes (0.35) | — | — | notice line | `history/scrubber.ts`, `styles/history.css` |
| History step panel | yes | yes | — | — | — | "changed nothing the docs could see" | — | `history/step-panel.ts` |
| World Map tools | yes | yes (offers colour) | yes | — | — | — | — | `styles/world.css:417-456` |
| World Map pinned panel | — | yes | — | — | — | — | — | `views/worldMap/controller.ts:1300-1311` |

---

## 4. The keyboard

### 4.1 Tab order

**Rule: the tab order follows the reading order of the screen, top to bottom and left to right: the sidebar, the search, the map's contents, the floating controls, the open reader, then the map's toolbar at the bottom.** The DOM order is that order (`shared/template.html`; the toolbar is appended last to `#main`, `index.ts:600`); nothing sets a positive `tabindex`. Under the Bare frame's trial (2026-11-19, `panels/frame.ts`) the sidebar is not drawn and the order is the crumbs with Back and Forward, the search, the map's contents, the floating controls, the strip, then the key or the Tuning sheet the strip opened, which stand straight after it in the DOM.
- Why: WCAG 2.2 SC 2.4.3 Focus Order.
- Status: holds by construction; not tested as a whole journey. An outsider counted 18 stops before the first map content on the World Map ([first visit](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/first-visit/README.md), finding 17); since 2026-11-19 the World Map's toolbar is one stop where it was nine (see 5.3). There is no skip link (see 7, SC 2.4.1).

**Rule: a group of like items is one stop, and the arrow keys move inside it** (*roving tabindex*: only the current item of a group has `tabindex="0"`, the others `-1`, and the arrows move that zero).
- Where: the hidden-file cells (`views/localView/card-factory.ts:622-690`); the menu (`panels/item-menu.ts:34-45`); search results by `aria-activedescendant` (`search/search-field.ts:173-200`); the scrubber's slider (`history/scrubber.ts:272-283`).
- Why: WAI-ARIA Authoring Practices, "Developing a Keyboard Interface"; it keeps the tab order short.
- Status: holds where used. Cards and their actions are each a stop (Tab walks every card and each action), which a large map makes long; tested by `tests/e2e/local-map-keyboard.spec.ts`.

### 4.2 Shortcuts

| Key | Where | Does | Source |
| --- | --- | --- | --- |
| Ctrl+P, or ⌘+P | everywhere | Focuses the search (replaces the browser's Print), the letter in either case since 2026-11-19, so that Caps Lock does not hand it to Print | `search/search-bar.ts` |
| Enter, Space | a focused control | Activates it; on a World Map piece, pins it and moves focus into its panel | `views/worldMap/controller.ts:1842-1850` |
| Arrows, Home, End | menu, search results, scrubber, cells | Move within the group | 4.1 |
| Page Up, Page Down | the scrubber's slider | The next and previous marked commit, as the coarse buttons beside play do, so that hand and keyboard agree (since 2026-11-19); the arrows, as the fine buttons, a commit; both pass the range's ends, which slide to hold the step | `history/scrubber.ts` |
| Plus, Minus (and `=`, `_`) | the scrubber's slider | Narrow and widen the track's range about the step shown, as the wheel and a pinch do about the pointer (since 2026-11-19), so that what the pointer can do the keyboard can | `history/scrubber.ts`, `history/zoom.ts` |
| ContextMenu, Shift+F10 | a map item | Opens its commands | `views/localView/controller.ts:1670-1679`, `views/forceGraphView.ts:2139-2147` |
| Escape | everywhere | See 4.3 | |
| Q, E, T, F, U, G, D, R, ? | World Map, while focus is inside the board and not in a field; never with Ctrl, ⌘ or Alt held | Turn left, right, top-down, fit, built on, snap, dark, reset the layout (and, pressed again before a piece is moved, put it back), help | `views/worldMap/controller.ts:1771-1799` |

**Rule: a shortcut of one printable character works only while focus is on the surface it acts on, or can be turned off; and a letter with Ctrl, ⌘ or Alt held is the browser's, not ours.**
- Why: WCAG 2.2 SC 2.1.4 Character Key Shortcuts (level A): speech-input users trigger single letters by speaking words. The browser's own shortcuts are Ctrl or ⌘ with a letter.
- Where: the World Map's letters listen on the board's own element, not the window, and pass over Ctrl, ⌘ and Alt and any field (`views/worldMap/controller.ts:1771-1799`, `isField` at `:2303`). The board takes focus from a press on it (`tabIndex = -1`, `:272`), so a person who clicked it finds them working; a press on a tool or a link keeps the focus it gives. Escape alone stays page-wide while the map is the view (`:1750-1765`).
- Checked by: `tests/e2e/world-map.spec.ts` ("the board's letters act only while the keyboard is on the board, never with Ctrl, Meta or Alt …").
- Status: holds since 2026-11-19. Before, the World Map's letters acted whenever it was the active view, from any focus outside an `input` or `textarea`, with Ctrl, ⌘ or Alt held as well: Ctrl+R reloaded the page and also reset and saved the layout, and R discarded every moved position without undo.

**Rule: a shortcut is announced** with `aria-keyshortcuts` and named in its control's tooltip.
- Status: holds for the World Map's tools (`views/worldMap/controller.ts:283-284`), whose help panel also lists every key (`:2018`); and for the search since 2026-11-19: its hint (a `<kbd>` hidden from screen readers) shows the platform's key, "⌘P" on Apple's systems and "Ctrl+P" elsewhere, and its field carries `aria-keyshortcuts` to match (`search/search-bar.ts`); checked by `tests/e2e/shell-accessibility.spec.ts` ("the shortcut's hint names the platform's key, and the field says its shortcut"). Ctrl+P has a recorded reason, "the Explorer's search shortcut since the dialog it replaced" (`search/search-bar.ts:95`).

### 4.3 Escape, in order

*Dismissal order*: when several surfaces are open, Escape closes the topmost one only.

**Rule: one Escape closes one surface, the one on top: a rested pointer's words (the 2D wire's, since 2026-11-22: they stand where the pointer is, over everything), then the search's results, then a menu, then a popover (the ancestry chooser), then a modal dialog or the reader, then the pin tray.** A surface that used an Escape marks it used (`preventDefault`) and those beneath leave it alone.
- Why: WAI-ARIA Authoring Practices for menus, comboboxes and dialogs; the platform's own behaviour for popovers and `<dialog>`.
- Where: `search/search-field.ts:174`, `panels/item-menu.ts:37`, `index.ts:1421-1428`, `panels/pin-tray.ts:83-89`, `history/step-panel.ts:241`; in the World Map, the walkthrough, then help, then the pin, then the hover (`views/worldMap/controller.ts:1750-1765`).
- Checked by: `tests/e2e/inspection.spec.ts`, `search-bar.spec.ts`, `local-map-pins.spec.ts`, `world-map.spec.ts`.
- Status: holds.

### 4.4 Where focus goes

**Rule: focus moves into what opens and returns to what opened it when it closes; never to a text field, never lost to the page.**
- Why: WAI-ARIA Authoring Practices, Dialog (Modal) and Menu Button patterns; WCAG 2.2 SC 2.4.3 Focus Order.

| Opens | Focus goes to | On close, focus returns to | Source | Checked by |
| --- | --- | --- | --- | --- |
| Item menu | its first command | the opener | `panels/item-menu.ts:46-91` | `force-graph-focus.spec.ts` ("keyboard More ... until Escape restores focus") |
| Reader, modal (narrow, or the reading dialog) | its Close | the opener, or the opener rebuilt by a render, else the map | `index.ts:1645-1662`; the Explorer design, "evidence reader" | `inspection.spec.ts` |
| Reader, beside the map (wide) | not traced in the code | the opener | `index.ts:1567` | `inspection.spec.ts:141-145` |
| Pin tray | stays on the toggle | the toggle, if focus was inside | `panels/pin-tray.ts:64-68` | `local-map-pins.spec.ts` |
| World Map piece pinned by keyboard | its panel | the piece, on Escape | `views/worldMap/controller.ts:1849` | `world-map.spec.ts` |
| History step dialog | the native `<dialog>`'s rule | its opener | `history/step-panel.ts:164-241` | `history-panel.spec.ts` |
| World Map help | stays on "?" | — | `views/worldMap/controller.ts:2027-2031` | nothing |
| A 2D Pin or a description opened | stays on the control used | — | the Explorer design, "Native portrait reading" | `card-reading.spec.ts` |

**Rule: a modal surface traps the Tab key inside it and makes the rest of the page `inert`; a non-modal one does neither.** The reader is modal below 760 px wide or 480 px tall and as the reading dialog at every size; beside the map otherwise (`index.ts:267`, `:1645-1662`, `:1429-1441`).
- Why: WCAG 2.2 SC 2.1.2 No Keyboard Trap allows a trap that Escape and Close leave; ARIA's `aria-modal`.
- Status: holds.

**Rule: a view put away is kept and not drawn, and is made inert only once it is not drawn; a view still drawn is never made inert to put it away** (2026-11-22). A view leaves the screen in two steps, the same for every view and one way of doing it (`settleViews` in `dom.ts`, `content-visibility` in `shell.css`): while it is still drawn, fading out or held as the still picture under a change of perspective, it is hidden from assistive technology (`aria-hidden`), takes no pointer (the stylesheet, and the hold's cover) and is given no focus; when its fade is over and no hold keeps it, the stylesheet takes it out of drawing and only then is it made `inert`. The way back mirrors it: a view is made not inert while it is still not drawn, and only then shown (the sidebar's way back to a map of 14,534 elements came to its next frame in 137 to 159 ms so, and in 358 ms shown first).
- Why: making a drawn view inert has the browser work out the style of every element in it again, about 180 ms of each press of 3D on a map of 14,810 elements and as much of a sidebar switch, paid at the next read of a box; a view not drawn costs 3 ms. Measured 2026-11-22, in the session's `Screenshots/arrival-default` record.
- **A reader at the keyboard never has focus standing in a view being put away, and never loses focus to the page by a switch.** Focus that stood in the view leaving goes to the sidebar's control of the view shown. The control that began a change of perspective is disabled through the change and cannot hold the focus, which is lent to the sidebar's control meanwhile and goes back to the control that began the change when it is done, unless the reader moved it. Focus offered to a view not shown, by Tab or otherwise, is given back to where it came from.
- Status: holds, by `force-graph-focus.spec.ts` (a view leaving is not inert while drawn; a Tab during a hold). Not held: focus offered to a held view from outside the page, which has nowhere to be given back to, and a sidebar whose control cannot take focus.

**Rule: the keyboard can reach and operate everything a pointer can** (WCAG 2.2 SC 2.1.1 Keyboard, level A).
- Status: **broken**. Turning the 3D camera and panning either map to an arbitrary place have no key; wires and doors on the World Map are not stops (a gap the Explorer design names); a 3D sphere is reachable only once its name is drawn, or through search. See 7.

---

## 5. Assistive technology

### 5.1 Landmarks

*Landmark*: a region a screen reader lists so that its user can jump to it (main, navigation, search, complementary, region).

**Rule: the page has one `main`, one `navigation` for the views, the `search`, and a `complementary` reader.**
- Why: WCAG 2.2 SC 1.3.1 Info and Relationships and SC 2.4.1 Bypass Blocks (landmarks are one accepted way to bypass).
- Status: holds since 2026-11-19: `#main` is a `<main>`, the three views' buttons stand in `<nav aria-label="Views">`, beside `role="search"`, the reader's `complementary` or `dialog` (`index.ts`, `syncReaderPresentation`) and, inside the reader, its `<nav aria-label="Sections">` (`detailPanel.ts`). A skip link, "Skip to the map", is the first stop of the keyboard, shown only while focused; it moves focus to the views and leaves the address alone (`shared/template.html`, `index.ts`). The sidebar itself is a plain `div`. Under the Bare frame's trial the views' buttons move into the crumbs' menu, inside `<nav aria-label="Places">`, the crumb of the place shown says `aria-current="location"`, and the key and the Tuning sheet are non-modal dialogs named "Key" and "Tuning" whose openers say `aria-expanded`; Escape closes each and returns focus to its opener. Checked by `tests/e2e/shell-accessibility.spec.ts` ("the page has its landmarks, and a skip link…"). The World Map's pinned panel is a `region` named by its thing (`views/worldMap/controller.ts:1307-1308`).

### 5.2 Names and descriptions

*Accessible name*: what a screen reader says a control is. *Accessible description*: the extra sentence it reads after.

**Rule: every control has a name; an icon-only control's name is its tooltip, set once by `iconButton`** (`panels/icon-button.ts`).
- Why: WCAG 2.2 SC 4.1.2; the owner, 2026-10-01: "There is no reason for "Release", "Pin All", and "Read" to be buttons with text instead of interactible elements whose aria attributes yield a proper accessible textual equivalent for those who are visually imparied or those who wish to hover for a tooltip." ([Turn 44 of the September 30 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/2026-09-30/2026-09-30.2.record.md#turn-44)).
- Status: holds across the `aria-label`s written; the zoom buttons have carried a tooltip as well as a name since 2026-11-19 (`shared/template.html`; checked by `tests/e2e/shell-accessibility.spec.ts`). A glyph drawn by CSS `content` joins the name unless it is given empty alternative text (`content: "▶" / ""`): Tuning's heading was named "▶ Tuning" until 2026-11-19 (`styles/shell.css`, `.sidebar-details > summary::before`; checked by `tests/e2e/tuning-reset.spec.ts`).

**Rule: the name contains the words drawn on the control** (*label in name*).
- Why: WCAG 2.2 SC 2.5.3 Label in Name (level A): a speech user says what they see.
- Status: holds for cards ("Open scripts", "+21 connections outside this view") and, since 2026-11-19, for the pin tray's "Clear all", named "Clear all pins" (`panels/pin-tray.ts`; it was "Clear exploration pins"). Checked by `tests/e2e/shell-accessibility.spec.ts` ("a small control keeps 24 by 24 px to press, and a name holds the words a person sees").

**Rule: a description is given by `aria-describedby` pointing at text in the page.**
- Why: `aria-description` is in the ARIA 1.3 draft, not in the ARIA 1.2 recommendation, and screen readers support it unevenly.
- Status: not followed at 7 places that use `aria-description`. This is a choice for robustness across screen readers, not a WCAG failure: the description is still given where the attribute is supported. The places: the legend rows, `shared/template.html:67-85`; `panels/spatial-legend.ts:108`; `views/localView/branch-renderer.ts:662`; `views/localView/card-factory.ts:317`. Tuning does it the standard way (`panels/tuning.ts:453-472`).

### 5.3 Roles in use

Counted in the client source and the template on 2026-11-18: 236 `aria-` attributes of 22 kinds, 31 explicit roles of 21 kinds.

| Pattern (WAI-ARIA Authoring Practices) | Where | Conforms |
| --- | --- | --- |
| Combobox with listbox | the two search fields, `search/search-field.ts:49-76` | yes; the empty result is `role="presentation"` and so is never announced |
| Menu button and menu | More, `panels/item-menu.ts` | yes |
| Toolbar | World Map tools (`views/worldMap/controller.ts:275`), hidden-file cells (`views/localView/card-factory.ts:622`) | yes for the World Map since 2026-11-19: one Tab stop, the arrows (wrapping), Home and End inside it, the tool last used the stop (`views/worldMap/controller.ts:302`, `:1824-1842`); checked by `world-map.spec.ts` ("the toolbar is one Tab stop …") |
| Slider | the scrubber's track, `history/scrubber.ts:131` | yes, with `aria-valuetext` |
| Dialog (modal) | reader, step panel (`<dialog>`), scrubber's finder, ancestry chooser | yes |
| Disclosure | Tuning (`<details>`), pin tray, World Map help | yes |
| Toggle button | toolbars, Pin, Play | see 5.4 |
| Tooltip | the 3D hover, `views/forceGraphRenderer.ts:73` | the only custom tooltip; 90 others are the native `title` |

### 5.4 Toggles: state or name, not both

**Rule: a toggle either keeps its name and says `aria-pressed`, or changes its name and says nothing; never both.**
- Why: WAI-ARIA Authoring Practices, Button pattern: "the label on a toggle does not change when its state changes". With both, a screen reader says "Unpin `index.ts`, toggle button, pressed", which reads as a contradiction.
- Status: **broken** at the 2D file and symbol Pin (`views/localView/card-factory.ts:191-192`, `:886-888`) and the 3D actions (`views/forceGraphView.ts:1170-1171`, `:1179-1180`). Play and Authors hold it since 2026-11-19 (`history/scrubber.ts`): Play shows Play or Pause, so its name changes and it says no `aria-pressed`; Authors shows one drawing, so its name stays "Authors" and its `aria-pressed` speaks (checked by `history-scrubber.spec.ts` and `history-panel.spec.ts`). The pin tray's toggle changes its name and says `aria-expanded` (`panels/pin-tray.ts:66-67`). The sidebar's toggle follows Play's rule since 2026-11-19: its glyph, ◀ or ▶, shows what a press does, so its name changes ("Collapse navigation", "Open navigation") and it says no `aria-expanded` (`index.ts`, `syncSidebarToggle`; checked by `shell-accessibility.spec.ts`). The Authoring Practices' rule is for toggle buttons, not disclosures, so the pin tray's is not the same fault; whether a disclosure's name should also stay fixed is left open.

### 5.5 Live regions and busy

*Live region*: a part of the page whose changes a screen reader speaks without the person moving to it.

| Message | How it is told | Status |
| --- | --- | --- |
| Loading | `role="status"`, named "Loading" | holds |
| A refusal (e.g. opened as a file) | `role="alert"` | holds |
| A path's result | `role="status"`, `aria-atomic` (`shared/template.html:527`) | holds |
| Copied as a declaration | `aria-live="polite"` (`panels/sources-view.ts:198`) | holds |
| Tuning reset to defaults, and put back | "Tuning reset to defaults" and "Tuning put back as you had it", each said once in `#page-status` (`panels/tuning-reset.ts`); checked by `tests/e2e/tuning-reset.spec.ts` | holds since 2026-11-19 |
| No search results | "Nothing found", said once in the page's one polite status region, `#page-status` (`announce.ts`, `search/search-field.ts`); checked by `tests/e2e/shell-accessibility.spec.ts` | holds since 2026-11-19 |
| Others folded or unpinned | What went, counted, said once in `#page-status` ("Unpinned 4 others, folded 2 directories away"; `views/retained-state.ts` `othersReleasedWords`); checked by `tests/e2e/others.spec.ts` | holds since 2026-11-19 |
| A pinned file absent at a historical moment | `aria-describedby` on the field; spoken only on focus | partial |
| The 3D map is building and refuses clicks | not told | broken (SC 4.1.3); `announce.ts` is the module to tell it with |
| The walkthrough's next step | `role="status"` in the World Map's own markup (`views/worldMap/controller.ts:318`, `:2154`); checked by `world-map.spec.ts` ("the walkthrough says each step …") | holds |

**`aria-busy` and `data-building` say two different things.** `data-building` ("begun", then "shown" after 300 ms) means *the map refuses input*: a body is being packed, the reveal is bringing spheres in, the perspective is changing, or the 650 ms framing flight runs. `aria-busy="true"` on `#graph-svg` means *the motion has not come to rest*, which outlasts building by seconds (1,309 frames against 2 on the estate's seed click, [measured 2026-11-15](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/Screenshots/building-map/README.md)). `aria-busy` on a container that is not a live region tells a screen reader to hold its updates and announces nothing; nothing tells a non-sighted person that the map is refusing clicks. Five places write `aria-busy`, and one of them leaves out the packing that two others count (`views/forceGraphView.ts:2504` against `:692`). Tests read `aria-busy` as "settled" and `data-building` as "built" (`tests/e2e/force-graph-building.spec.ts`). Proposal in the findings.

---

## 6. Feedback and orientation

### 6.1 The product says it is working

**Rule: work longer than a moment shows a sign; no sign flashes for work shorter than that.**
- Where: the loading dots, gone before the first view draws (`shared/template.html:533-536`); the 3D building sign, shown only after 300 ms, a lull under 200 ms not ending it (`views/forceGraphBuilding.ts`).
- Why: *visibility of system status*; the 2026-11-15 measurement that a quick update should not flash the sign. A common guideline (Nielsen, *Response Times*) gives 0.1 s as instant, 1 s as the limit of uninterrupted flow and 10 s as the limit of attention.
- Status: holds in 3D. The 2D map's continuing layout search shows no sign while it works; its one rearrangement after arrival is accepted by the owner (2026-11-16). A scan is work of a minute, past the limit of attention, so its sign is the one that counts: under the Scan Growth trial (2026-11-22) the 3D map's top edge says the scan's phase and its counts in the owner's words (11.1) for as long as the picture is partial, and the status region is told each phase once, not each count.

**Rule: the main thread never blocks long enough for the browser to offer to kill the page.** Heavy work runs in slices across frames.
- Why: the owner's decision of 2026-10-28 ([direction, Forces, motion and rest](../../../AI-Agent-Workspace/Memory/direction.md#forces-motion-and-rest)).
- Checked by: nothing measures a long task directly; the 3D specs bound time.
- Status: holds as far as the record shows.

### 6.2 Transitions explain spatial change

*Transition*: animation between two states that shows where each thing went, so the eye need not search again.

**Rule: a change of place, scale or perspective animates what persists from where it was to where it goes; what leaves fades, what arrives grows in; the subject's name stays where it stood.**
- Why: *object constancy*; the owner, 2026-09-30: "As modern models iterate with screenshots, they cannot feel the sudden hop from connection to connection which could otherwise be mediated with a great transition." ([Turn 16 of the September 30 record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/2026-09-30/2026-09-30.2.record.md#turn-16)); AGENTS.md, "Orientation" and "Judge motion and whole journeys".
- Where: `views/perspectiveTransition.ts` (2D to 3D and back), `views/localView/branch-renderer.ts` and `pan-zoom.ts` (2D moves), `views/forceGraphReveal.ts` (3D reveal).
- Checked by: `tests/e2e/local-map-motion.spec.ts`, `perspective-zoom.spec.ts`, `local-map-row-motion.spec.ts`.
- Status: holds for 2D↔3D. The World Map into the Local Map cross-fades with no spatial link ([first visit](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/first-visit/README.md), finding 12), which is ticket T8.

### 6.3 Reduced motion

**Rule: under `prefers-reduced-motion: reduce`, every animation that moves the picture ends at once at its destination, and every decorative animation stops; a still sign replaces a moving one.**
- Why: WCAG 2.2 SC 2.3.3 Animation from Interactions (level AAA, adopted here because the product's motion is large and frequent: a whole map flies); vestibular disorders.
- Where (holds): `views/perspectiveTransition.ts:90`, `:188`; `views/localView/controller.ts:1497`; `views/localView/branch-renderer.ts:435`; `views/localView/pan-zoom.ts:247`; `views/forceGraphView.ts` (6 places); CSS in `styles/shell.css:215`, `:451`, `styles/graph.css:121`, `styles/local.css:325`, `styles/reading.css:637`, `styles/world.css:153`.
- The one fade in its place: the 2D picture mirrored (`views/localView/mirror-motion.ts`) changes behind a fade out and in, with no travel, checked by `tests/e2e/local-map-mirror.spec.ts` ("reduced motion takes the cut whatever the lever says").
- Checked by: 11 cases across `tests/e2e/backward-cue.spec.ts`, `force-graph-focus.spec.ts`, `force-graph-building.spec.ts`, `local-map-motion.spec.ts` and four more.
- Status: holds. The World Map's camera, turning, top-down and up, and the walkthrough, arrives at once since 2026-11-19 (`views/worldMap/controller.ts:1129-1131`), checked by `world-map.spec.ts` ("under reduced motion the camera arrives at once …"); before, it eased regardless.

---

## 7. WCAG 2.2, level AA, criterion by criterion

*WCAG 2.2*: the W3C's Web Content Accessibility Guidelines, version 2.2 (2023), the standard most laws and procurement rules point to. Level AA is the usual target; it includes every level A criterion.

How each was judged: **code** means read from the source here, which can show a fault but rarely prove a pass; **tested** names the spec that holds it; **not tested** means a browser and, where said, a screen reader or a person is needed. "Fails" is written only where the code alone shows it.

| Criterion | Level | Verdict | Where, and how judged |
| --- | --- | --- | --- |
| 1.1.1 Non-text Content | A | Partly | Icons are `aria-hidden` inside named buttons (code). The 2D wires are `role="img"` (`views/localView/connections.ts:614`); the 3D canvas has no text alternative beyond its drawn names. Not tested with a screen reader. |
| 1.2.1–1.2.5 Media | A/AA | Not applicable | No audio or video. |
| 1.3.1 Info and Relationships | A | Meets (code, tested) | Lists, headings, combobox and dialog roles hold (code); `main` and the views' `nav` stand since 2026-11-19 (5.1; `tests/e2e/shell-accessibility.spec.ts`). |
| 1.3.2 Meaningful Sequence | A | Meets (code) | DOM order is reading order. |
| 1.3.3 Sensory Characteristics | A | Partly | The legend explains wires by colour and side (left, right), and since 2026-11-22 names the sides of the picture shown: a mirrored picture's key is drawn mirrored and its words exchange left and right (including transiently mirrored routes since 2026-11-24); the World Map's help says "blue offers, green uses" (code). Not tested. |
| 1.3.4 Orientation | AA | Meets (code) | Nothing locks orientation; `tests/e2e/inspection.spec.ts:295` opens the reader at 390×844 and 844×390. |
| 1.3.5 Identify Input Purpose | AA | Not applicable | No field asks for personal data. |
| 1.4.1 Use of Color | A | Partly | In 2D what offers and what uses differ by side as well as colour (holds); the side is the picture's own, which the toolbar's mirror button exchanges (2026-11-22) and routes asked from the using end mirror transiently (2026-11-24), and the key says which side is which in the picture shown. On the World Map a wire's direction is told by its colour gradient and by the flow's motion along it, with no arrowhead ([first visit](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/first-visit/README.md), finding 19); under reduced motion the flow stops (`styles/world.css:153`) and colour alone is left; the hover's words say it. Owned with [Visual Foundations](visual-foundations.mdmd.md). |
| 1.4.2 Audio Control | A | Not applicable | |
| 1.4.3 Contrast (Minimum) | AA | **Fails** at one place (code), partly tested | `tests/e2e/contrast.ts` measures text against what lies behind it at 4.5:1 in `backward-cue`, `labels-and-controls`, `local-map-path`, `local-map-tone` and `search-bar` specs. Since 2026-11-19 `shell-accessibility` measures the sidebar's section labels and the search's placeholder, hint and "Nothing found" (5.27 to 5.43), which had been in the disabled grey at 2.30 to 2.90, and Today's quiet text tones pass on a card (`palette.test.ts`). The code still shows one failure in every palette: the action button's white on `#0091ff` at 3.23 ([Visual Foundations](visual-foundations.mdmd.md#text-tones)). An outsider read 3.3:1 on a card's directory line on 2026-11-12. |
| 1.4.4 Resize Text | AA | Not tested | Text at 200% zoom has not been tried. |
| 1.4.5 Images of Text | AA | Meets (code) | All text is text; 3D names are DOM buttons. |
| 1.4.10 Reflow | AA | Not tested; likely fails | The map is two-dimensional content, which the criterion exempts; the sidebar, search and reader are not. At 390 px an outsider found the search over the title and the zoom buttons over the footer (first visit, finding 11). Nothing is tested at 320 px. |
| 1.4.11 Non-text Contrast | AA | Partly tested | The search clear's ×, the only sign of its control, is `text.muted` at full opacity since 2026-11-19, 5.43:1, measured against `AA_NON_TEXT` (3:1) by `tests/e2e/shell-accessibility.spec.ts`; it had been the disabled grey at 0.7 opacity. Focus rings, control borders and wires against their ground are not measured. |
| 1.4.12 Text Spacing | AA | Not tested; at risk | Fixed-slot cards cut text with an ellipsis by design; wider spacing cuts more. Whether the full text stays reachable (the reader) is the test. |
| 1.4.13 Content on Hover or Focus | AA | Partly; **fails** in two places (code) | The 2D wire's words are hoverable, dismissible and persistent since 2026-11-22, tested (`tests/e2e/wire-answers.spec.ts`; 2.2, *content on hover*). The World Map's peek at the pointer's thing and the 3D map's wire tooltip follow the pointer and take none, so neither can be entered; the 3D tooltip has no Escape, and the World Map's comes back at the pointer's next movement. Native `title` tooltips are the browser's and outside the criterion. |
| 2.1.1 Keyboard | A | **Fails** (code) | No key turns the 3D camera or pans a map to an arbitrary place; World Map wires and doors are not stops; a 3D sphere without a drawn name is unreachable but by search. |
| 2.1.2 No Keyboard Trap | A | Meets (tested) | The modal reader's trap leaves by Escape and Close (`tests/e2e/inspection.spec.ts`). |
| 2.1.4 Character Key Shortcuts | A | Meets (tested) | The World Map's letters act only while focus is inside the board, never with Ctrl, ⌘ or Alt held (`views/worldMap/controller.ts:1771-1799`; 4.2). |
| 2.2.1 Timing Adjustable | A | Not applicable | No time limits. |
| 2.2.2 Pause, Stop, Hide | A | **Fails** (code) | The World Map's flow along the wires moves for as long as the board is shown, with no control to pause it; only the operating system's reduced-motion setting stops it (`styles/world.css:135`, `:153`). History playback has Pause. |
| 2.3.1 Three Flashes or Below Threshold | A | Not tested; at risk | History playback runs at up to 10 steps a second (`shared/template.html:477`), and each step lights its changed files white against a dimmed scene. Whether the lit area crosses the flash threshold needs measuring. |
| 2.4.1 Bypass Blocks | A | Meets (tested) | Since 2026-11-19 a skip link, "Skip to the map", is the first stop of the keyboard, and `main`, `navigation` and `search` are landmarks (`tests/e2e/shell-accessibility.spec.ts`). |
| 2.4.2 Page Titled | A | Meets (code) | "Live Docs Explorer"; it does not change with the view or subject. |
| 2.4.3 Focus Order | A | Meets (tested in 2D) | `tests/e2e/local-map-keyboard.spec.ts`; 4.4. |
| 2.4.4 Link Purpose (In Context) | A | Meets (code) | Links are names of files, symbols and things. |
| 2.4.5 Multiple Ways | AA | Not applicable as written (a single page); the product holds the owner's stronger rule *At least two ways*. |
| 2.4.6 Headings and Labels | AA | Meets (code) | |
| 2.4.7 Focus Visible | AA | Meets with exceptions (code, partly tested) | 3.1: more than ten focus looks are thinner, of another colour, an underline or a border; the sidebar's Back and Forward have no rule of their own. An outsider found focus visible on every stop tried (first visit, finding 17). |
| 2.4.11 Focus Not Obscured (Minimum) | AA | Meets in 2D (tested) | `tests/e2e/local-map-keyboard.spec.ts` keeps every focused card command inside the unobstructed frame. Not tested in 3D, the World Map or under the open reader. |
| 2.5.1 Pointer Gestures | A | Partly | Pinch has the zoom buttons in 2D (code); 3D is reached by wheel, pinch and Fit. Not tested on touch. |
| 2.5.2 Pointer Cancellation | A | Meets (tested) | 2.2. |
| 2.5.3 Label in Name | A | Meets (code, tested at its one known failure) | "Clear all" is named "Clear all pins" since 2026-11-19 (`panels/pin-tray.ts`; `tests/e2e/shell-accessibility.spec.ts`); it had been "Clear exploration pins". |
| 2.5.4 Motion Actuation | A | Not applicable | |
| 2.5.7 Dragging Movements | AA | **Fails** (code) | Turning the 3D camera has only a drag (the World Map has turn buttons; the 3D map has none); moving a World Map piece has only a drag. |
| 2.5.8 Target Size (Minimum) | AA | Partly tested; likely fails | 8: the search's clear button is 24×24 since 2026-11-19 (`tests/e2e/shell-accessibility.spec.ts`; it was 18×18); in-map controls are 17×17 at map scale 1, and the sidebar's small buttons need a browser. |
| 3.1.1 Language of Page | A | Meets (code) | `lang="en"`. |
| 3.1.2 Language of Parts | AA | Not applicable | Code identifiers are not a human language. |
| 3.2.1 On Focus | A | Meets (code) | Focus previews and brings a control into view; it changes nothing. |
| 3.2.2 On Input | A | Meets (code) | A Tuning control changes the picture it tunes, which is its purpose, not a change of context. |
| 3.2.3 Consistent Navigation | AA | Meets (code) | One sidebar for every view. |
| 3.2.4 Consistent Identification | AA | Meets (code), with one doubt | The two Back buttons are both named "Back" (`shared/template.html:20`, `:567`); only the sidebar's tooltip says "Back to the last place", and the two do different jobs (places against the reader's own history), so the criterion does not bind them. A card's close says "Close this expansion" while every other close says "Close"; whether that is the same function is not settled. |
| 3.2.6 Consistent Help | A | Partly | Help exists in the World Map only (`?`). |
| 3.3.1 Error Identification | A | Meets (code) | The path report says what failed; a refusal says why. |
| 3.3.2 Labels or Instructions | A | Meets (code) | Fields have names and placeholders. |
| 3.3.3 Error Suggestion | AA | Partly | A path is answered whichever way it runs (since 2026-11-22; until then one asked against the drawing failed and offered the reverse question), so the only failed path is one that runs neither way, which says so; an empty search suggests nothing. |
| 3.3.4 Error Prevention (Legal, Financial, Data) | AA | Not applicable | |
| 3.3.7 Redundant Entry | A | Meets (code) | |
| 3.3.8 Accessible Authentication (Minimum) | AA | Not applicable | |
| 4.1.2 Name, Role, Value | A | Partly | 5.2 to 5.4: the 2D and 3D Pin controls state twice (Play and Authors no longer, since 2026-11-19). The fault panel is reachable, and the World Map's help says whether it is open, since 2026-11-19. |
| 4.1.3 Status Messages | AA | **Fails** (code) | 5.5: the 3D map's building is not told. "Nothing found" is, since 2026-11-19, through the page's status region (`announce.ts`), and the walkthrough's steps through the World Map's own. |

*Not tested with assistive technology at all.* No screen reader (NVDA, JAWS, VoiceOver) and no automated checker (axe-core) has been run against the Explorer. The second milestone should run axe-core in Playwright on each view's states, and one screen reader by hand over the journeys of [the first visit](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/first-visit/README.md).

---

## 8. Targets

*Target*: the area a pointer or finger must land on. *Fitts's law*: the time to reach a target grows with its distance and shrinks with its size, so small, far targets are slow and missed.

### 8.1 What the standards and platforms ask

| Source | Minimum |
| --- | --- |
| WCAG 2.2 SC 2.5.8 Target Size (Minimum), AA | 24×24 CSS px, or a 24 px circle around it that touches no other target, or an equivalent control elsewhere that meets it |
| WCAG 2.2 SC 2.5.5 Target Size (Enhanced), AAA | 44×44 CSS px |
| Apple's Human Interface Guidelines | 44×44 pt |
| Material Design | 48×48 dp |

### 8.2 What the owner decided

- **Collapse a card's actions into More only when two buttons on a card cannot be told apart by a tap**; keep a direct Pin wherever actions remain separately tappable (2026-10-20, [direction, The card](../../../AI-Agent-Workspace/Memory/direction.md#the-card-its-box-its-rows-and-its-text)). The measured phone targets that day: 17 px for symbol actions and 20 px for header actions at map scale 1.
- **The phone and touch pass is a pass of its own**, deferred (2026-10-20, Turn 7), widened to what a heavily zoomed-out map can show legibly.

### 8.3 What the product has

| Control | Size | Source | Against 24×24 |
| --- | --- | --- | --- |
| Zoom controls | 36×36 | `styles/view-shared.css:321-323` | meets |
| 3D sphere actions | 32×32 | `styles/graph.css:65-71` | meets |
| Map toolbar | 34 wide, about 32 tall | `styles/local.css:310` | meets (height not measured) |
| World Map tools | 32×30 | `styles/world.css:417-423` | meets |
| World Map help | 30×30 | `styles/world.css:459-464` | meets |
| Scrubber buttons | 32 wide | `styles/history.css:11` | meets (height not measured) |
| Card header actions | 20×20 at map scale 1 | `styles/local.css:263-265` | below |
| Symbol Pin and More | 17×17 at map scale 1 | `styles/local.css:243` | below |
| Directory controls | 17×15 at map scale 1 | `styles/local.css:446` | below |
| Search's clear | 24×24, its glyph 14 px | `styles/search.css` (`.search-clear`) | meets since 2026-11-19 (`tests/e2e/shell-accessibility.spec.ts`); it was 18×18 inside the input, where the spacing exception could not save it |
| Sidebar toggle, Back, Forward | 12 px glyph and 4×8 padding (15 px at 2×6 for some): about 22 to 24 tall, by the font's line height | `styles/shell.css:34-45`, `:52-55` | likely below; needs a browser |
| Under `(pointer: coarse)` | counts 44 tall; card actions 32; symbol actions 26 | `styles/reading.css:101-106` | meets on touch, in the reading look only |

**Rule: a control drawn in screen space (outside the map) is at least 24×24 CSS px.**
- Why: WCAG 2.2 SC 2.5.8; Fitts's law. The map's own controls scale with zoom and are the deferred touch pass's subject; the controls around the map do not scale and have no reason to be small.
- Status: proposed; probably broken at the sidebar's three small buttons. The search's clear meets it since 2026-11-19.

**Rule: a control inside the map is reachable at its reading scale by a route that meets 24×24** (the equivalent-control exception of SC 2.5.8). Today: a symbol can be pinned from a search result row and from More's menu items (about 36 px tall, `styles/shell.css:412-416`), but More itself is 17 px.
- Status: proposed; the touch pass decides the in-map sizes.

---

## 9. Responsiveness

*Responsive design*: one page that rearranges for the room it has. *Breakpoint*: a viewport width or height at which the arrangement changes.

### 9.1 What the product is built and tested for

**Rule: the Explorer is designed for a desktop or laptop window from 1280×800 up, with a mouse or trackpad and a keyboard.** Below that it must remain usable for reading (the reader fills the screen), not for exploring.
- Why: the owner's work is on a desktop; Tuning was accepted as usable at 1280×800 (2026-10-30, the Explorer design's "Tuning is usable at the available size"); the phone and touch pass is deferred by the owner.
- Measured: the browser suite's viewports, counted 2026-11-18 across `tests/e2e/*.ts` (a second, looser count found 1600×1000 38 times, 1280×800 28 and 390×844 7; the order holds): 1600×1000 (34 uses), 1280×800 (27), 1440×960 (20), 1440×900 (18), 1400×900 (8), 390×844 (6, with touch in two), 1800×1100 (5), 900×700 (3), and twelve others once or twice. The Playwright project is Desktop Chrome only (`tests/e2e/playwright.config.ts:64-68`).

### 9.2 What changes when the window is small

| Condition | What changes | Source |
| --- | --- | --- |
| `#main` width ≤ 1015 (≤ 1100 in bare frame) with reader open | zoom controls and pin tray lift above the map toolbar; wider windows keep all three on the bottom bar beside the reader | `styles/shell.css:416-442` |
| width ≤ 850 | the map's toolbar rises above the bottom controls | `styles/local.css:359-361` |
| width ≤ 768, ≤ 480 | Knowledge Sources' padding narrows | `styles/sources.css:14-24` |
| width ≤ 760 | the sidebar overlays the page; the main area keeps a 48 px strip | `styles/shell.css:429-432`; `index.ts:275` |
| width ≤ 760 or height ≤ 480 | the reader fills the screen, modal, with its own Back, Forward and Close | `styles/shell.css:434-449`; `index.ts:267` |
| width ≤ 600 | the map loses height for the zoom controls; reading cards and the reading dialog tighten | `styles/local.css:585-587`; `styles/reading.css:97-99`, `:769-772` |
| `pointer: coarse` | larger reading-look controls | `styles/reading.css:101-106` |

**Rule (proposed): breakpoints are named and few.** Today there are six widths (480, 600, 760, 768, 850 and the 480 height) written as literals in five files, two of them 8 px apart. A design system names them once (for example *narrow* ≤ 600, *compact* ≤ 760) and every rule uses the names. Status: proposed; see the findings.

### 9.3 Deferred by the owner

The phone and touch pass (2026-10-20): in-map target sizes, collapse into More by tap distinction, what a zoomed-out map can show, the World Map's board at phone size (an outsider found it a clump with piled names at 390×844, first visit finding 11). Not a defect of this standard; a pass not yet run.

---

## 10. Portability

### 10.1 The self-contained page

**Rule: the page loads only its own script, styles, images, fonts and data, from its own site; it sends nothing anywhere.**
- Where: the Content-Security-Policy `<meta>` (`shared/template.html:9-10`): `default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'`. Listeners, never inline event attributes; a doc's raw HTML shown as text.
- Why: the decision of 2026-10-21; the owner's ask of 2025-12-14.
- Checked by: `tests/e2e/no-network.spec.ts`, which walks every sample bundle's views and hostile docs and fails on any request to another site and any refusal by the policy.
- Status: holds. `style-src 'unsafe-inline'` remains for the Explorer's own computed positions; the libraries that first needed it are gone (decision update of 2026-10-29). Since 2026-11-19 the comment beside the policy (`shared/template.html`) gives that reason, the Explorer's own style attributes, in place of the libraries that left.

**Rule: opened as a file, the page says in one sentence that it must be served.**
- Where: `errors.ts:21` (`OPENED_AS_FILE`), shown as a refusal with `role="alert"`; the script is a classic deferred script so that it runs from a file at all (`shared/template.html:583-584`).
- Status: holds since 2026-11-12 (first visit, finding 2).

### 10.2 Browsers, rendering and fonts

**Rule: the Explorer runs in a current evergreen browser; it is tested in Chromium only.** The 3D map draws with WebGL and runs in software rendering (SwiftShader) too, slowly; everything else needs no WebGL.
- Status: Firefox and Safari are untested; the reader's `:popover-open` and `<dialog>` and the CSS `:has()` used in `styles/local.css:455` need current engines.

**Rule: a view the browser cannot draw is not offered; its control stays and says why; and a request for it shows the subject in a view the browser can draw** (*graceful degradation*: where a capability is missing, the product keeps every part that does not need it, and says what is missing rather than failing whole).
- Rule: where the browser refuses WebGL (a policy, a driver on its blocklist, a machine without graphics), a request for the 3D map, by a link (`mode=3d` or a shared `?s=`), by the remembered choice, by Back or Forward or by the 3D control, shows the same subject in the 2D map, and the address is rewritten in place to say 2D, as for every other change of view. The 3D control stays on the toolbar, not pressed and unavailable by `aria-disabled` (not `disabled`, which would take its focus stop and with it the explanation a keyboard reaches), its label faded as the toolbar's disabled buttons are but by its colour, so that its focus ring is not faded with it (5.84 to 1 on the toolbar's ground in Today's palette, where the faded ring measured 2.52); its name stays "3D" and its tooltip, which is its accessible description, says "3D needs WebGL, which this browser does not offer" (not "has turned off": a browser may simply have no WebGL to give). Tuning's 3D Layout group is not offered in the same way and with the same words: its heading stays where it stands, a focus stop marked `aria-disabled`, faded by its colour, and a press or Enter opens nothing; its stored settings are left as they are. Tuning's History group, which drives the scrubber both maps share, stays offered. The 2D map's amber cue to the 3D control is not lit there. The remembered choice of 3D in the browser's storage is left as it was, so that the same person still arrives in 3D on a browser that draws it. The 3D-only controls (Connections, Structure, Hops) are absent, as they are in 2D everywhere. Nothing that needs WebGL is created. Asking the browser costs nothing on a 2D arrival: it is asked at the start only when 3D is asked for at the start, at a press of 3D, or once the page is idle after its first picture (within three seconds), and the 3D control and Tuning's group become unavailable then, without a press.
- Why: owner, 2026-11-21, of the machine the tool will be shown on: "Absolute crap VM. No idea on graphics card ... We want this to be able to run on absolute garbage"; 2026-11-02, "A hidden door is the design's fault, not the user's" (principle *A hidden door is the design's fault*: the control stays so that a person can tell that 3D exists and why it is not here); 2026-11-02, "are we confident that doing something the user didn't ask for, silently, should be our default?" (so the fall-back is said, on the control); 2026-09-30, orientation (principle *Orientation is kept*: the person asked for a subject and is shown that subject); 2026-10-30, "We should strive heavily to avoid _text authored by us onscreen_" (so the reason is the control's tooltip and description, never a banner). Measured: on 2026-11-21, in Chromium launched with `--disable-3d-apis`, a link to the 3D map opened "The Explorer stopped" with Three's "Error creating WebGL context." over an empty map, while the 2D map of the same subject worked ([the probe, finding 3](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/weak-machine/README.md)); the mended page in that browser is [pictured](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Screenshots/webgl-refused/README.md).
- Why it is asked late: the root's ruling of 2026-11-21, that the question should cost a 2D visit nothing. Measured that day: asking alone cost the first page of a browser with a graphics card 731 ms (its graphics process starting) and about 50 ms after; on the Explorer's own 2D arrival, asking late brought the first picture about 90 ms sooner on the card and made no measurable difference in software, by the numbers in [the pictures' README](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Screenshots/webgl-refused/README.md#what-the-question-costs-a-2d-visit).
- Where: `views/webgl-support.ts` (`webglOffered`, asked once and held for the page's life, with the context attributes the renderer asks with; `webglKnown`; `perspectiveShown`; `perspectiveRemembered`; `whenIdle`); `index.ts` (the initial perspective, `changePerspective`, `restoreFromUrl`, the remembered navigation, the 3D control in `syncPerspectiveControls`); `styles/local.css` (`.perspective-controls button[aria-disabled="true"]`); `panels/tuning.ts` (`withholdThreeDLayout`) and `styles/shell.css` (`details.tuning-subsection > summary[aria-disabled="true"]`) for Tuning's 3D Layout group.
- Checked by: `views/webgl-support.test.ts`; `tests/e2e/webgl-refused.spec.ts`, which launches its own Chromium without WebGL and walks a 3D link, the remembered choice, Back to a 3D address, a 3D link to a moment of the history, a 2D arrival answered when idle and Tuning's 3D Layout group, on the estate sample, this repository's map and the history sample.
- Status: holds since 2026-11-21. A WebGL context lost in the middle of a session (`webglcontextlost`) is not this rule's: Three stops drawing and draws again when the browser restores the context; one never restored leaves the 3D map blank with its controls standing.

**Rule: layout that a shared link reproduces does not depend on the viewer's fonts.** The app's text is `"Segoe UI", sans-serif` (`styles/theme.css:33`); the World Map's is `system-ui, -apple-system, "Segoe UI", sans-serif` (`styles/world.css:35`). No font is bundled. The 2D cards are measured from the page's own fonts, so one picture can differ between machines; the opened directory's shape is chosen on nominal card sizes so that a link shows two people the same arrangement (2026-11-13, the Explorer design).
- Why: the owner's machine draws Segoe UI and this container's headless browser does not ([owner.md](../../../AI-Agent-Workspace/Memory/owner.md), 2026-11-13).
- Status: holds for the shape; the pixel picture is the viewer's.

### 10.3 What is saved in the browser

All browser storage is `localStorage`, every read and write inside `try`, so a blocked store degrades to defaults.

| Key | Holds | Source |
| --- | --- | --- |
| `live-docs-explorer:ui:v2` | the filters and Tuning settings that differ from the defaults (the palette among them) | `persistence/local-storage.ts:28`, `:559-571` |
| `live-docs-explorer:nav:v1` | view, 2D or 3D, 3D layout, opened directories, subject, reader target, discovery, reading choices | `persistence/local-storage.ts:392`, `:577-596` |
| `<board key>.positions` | where a person moved the World Map's pieces | `views/worldMap/controller.ts:372-392` |
| `live-docs.world.theme` | the World Map's light or dark | `views/worldMap/controller.ts:1939-1949` |

### 10.4 What a shared link carries

**Rule: a link carries the exploration (what is looked at and how it is laid out), never the viewer's look.**
- Carried, in `?s=` (`persistence/compressed-url-state.ts:48-93`): view, 2D or 3D, the 3D layout, subject, reader target, discovery, pins and their order, opened directories, the filters, Related and Citing docs, the path's end, Knowledge Sources' walk, the history's commit and authors, reading choices, and the layout settings (`l`).
- Not carried: the palette and marbles; the World Map's theme and positions.
- Why: owner, 2026-11-16: "by default, no. Opening a sent link shouldn't cause your local settings to change."
- Status: holds for the palette. A link's layout settings and filters are applied over the receiver's (`index.ts:188`, `:208`), and the next time the receiver changes any filter or Tuning control they are written into the receiver's saved settings (`persistence/local-storage.ts:559-571`). Whether that counts as "your local settings" changing is a question in the findings.

### 10.5 Exports

| Export | From | Source |
| --- | --- | --- |
| A doc as Markdown | the reader's footer | `shared/template.html:577`, `download.ts` |
| Layout settings | Tuning | `shared/template.html:490` |
| The panel as JSON; the whole as Markdown | Knowledge Sources | `panels/sources-view.ts` |
| The board text with moved positions | World Map, save board | `views/worldMap/controller.ts:1976-1985` |

All are built in the page and saved through a `blob:` link: no network. Why: owner, 2026-10-03: "just have a JSON export button in the UI ... readily available to the humans with great ease rather than leaving security doors open for agents".

---

## 11. The words on screen

### 11.1 Ours and theirs

**Rule: the words drawn on screen are the authors' (file names, symbol names, Purpose, Notes, commit subjects) or counts; ours are control names in tooltips and accessible names, and a sentence of ours appears only where nothing else can say it: a refusal, an absence, a path's result.**
- Why: the owner's words of 2026-09-30, 2026-10-30 and 2026-11-16 (principle *Their words, not ours*).
- Where ours stand today, drawn: the sidebar's "Live Docs Explorer", "Display", "Show Tests", "Show Assets", "Show Related Docs", "Show Citing Docs", "Legend", "Tuning", the legend's words, the footer's counts and "Context: None" (`shared/template.html:19-497`); the reader's "Select a Node", "Click on any node to view details.", "Download Markdown" (`:570-577`); the search's placeholders; the tray's "Pins", "Clear all", "No retained selections."; the World Map's header counts, help, walkthrough and its "back", "next", "done" and "walk me through it" (`views/worldMap/controller.ts:301`, `:2010-2019`). Tooltips: 90 `title` sites in the client.
- Checked by: nothing; `tests/e2e/design-audit.ts` checks that words do not collide, not that they are needed.
- Status: holds for the maps; the sidebar, reader placeholder and World Map help carry more of ours than the rule allows.
- Allowed by the owner, 2026-11-21, for progress: two lines of ours, in their wording, "Listing Files... ({fileCountSoFar})" and "Reading File Text... ({scannedCount}/{listedCount})", written with the one ellipsis of 11.3. They are words and counts where a line alone cannot say how far a scan has come or that the picture is partial (*the map does not lie*). They stand on the 3D map only while Tuning's Scan Growth trial plays (2026-11-22; `views/scanGrowth.ts`, `progressWords`; `views/scanGrowthPlay.ts`; `styles/graph.css`, `.scan-progress`), and nothing else is added beside them.

### 11.2 Tooltips

**Rule: an icon's tooltip is its name, a verb phrase in sentence case, at most one short sentence; it says what pressing does, not how the control works.**
- Why: the owner's model, Microsoft Teams, "everything is an icon ... hovering over any icon gives you a good idea of what it is with a tooltip" (2026-10-30); Tuning's sentences, which are its descriptions, were accepted on 2026-10-30.
- Status: mostly holds. Long tooltips: "Internal/private implementation — data flows in but isn't exposed as public symbols" (`views/localView/card-factory.ts:864`); "Close this expansion; keep symbols needed by other pins" (`:215`).

**Rule: what a tooltip says is also reachable without a mouse.** A native `title` shows only to a mouse resting on the control, never on keyboard focus or touch; so a tooltip may only repeat the accessible name or description, never carry a fact found nowhere else.
- Why: WCAG 2.2 SC 1.4.13 and SC 2.1.1; the owner, 2026-11-05: "text expansion does not occur on hover but instead on tap/click" ([owner.md](../../../AI-Agent-Workspace/Memory/owner.md#formatting-and-visual-taste); [direction](../../../AI-Agent-Workspace/Memory/direction.md#the-2d-local-map) sums it up as "a tap, never hover, opens text").
- Status: holds where `iconButton` sets both, and for the World Map's tools, whose keys are also in its help panel. *Broken* where a fact lives only in a `title`: the 3D seed's group size and a shell's file count (`views/forceGraphView.ts:844-853`), which a screen reader receives as the description but a sighted keyboard or touch user never sees; a card's test coverage beyond the three test names drawn as chips (`views/localView/card-factory.ts:252-265`); and the legend's sentences. See the findings.

### 11.3 How the product speaks

**Rule: sentence case for every name we write** ("Return to reading size", "Export layout settings").
- Why: one case reads as one voice; sentence case is the convention of most current design systems (Material, Polaris, Carbon).
- Status: proposed; broken at "Zoom In", "Zoom Out", "Show Tests" and its siblings, "Download Markdown", "Select a Node" (Title Case) and the walkthrough's "back", "next", "done" (lower case).

**Rule: an absence or error says what is so and what to do, in one sentence, without blame and without the word "click"**, since the person may tap or press a key.
- Where it holds: "The Explorer cannot load its data when opened as a file; serve its folder with a web server and open that address." (`errors.ts:21`).
- Where it does not: "Click on any node to view details." (`shared/template.html:574`); "Nothing found" offers nothing to do.
- Why: Nielsen's heuristic *help users recognize, diagnose, and recover from errors*; WCAG 2.2 SC 3.3.3 Error Suggestion.

**Rule: one ellipsis, the character `…`.** Holds since 2026-11-19, when "Loading..." (`shared/template.html`) became "Loading…", like "Path to…"; checked by `tests/e2e/shell-accessibility.spec.ts`.

---

## 12. Glossary

| Term | Meaning here |
| --- | --- |
| Accessible name, description | What a screen reader says a control is, and the extra sentence it reads after. |
| Affordance, signifier | What an object lets a person do; the visible cue that tells them so (Norman). |
| Breakpoint | A viewport size at which the arrangement changes. |
| Discoverability | Whether a person can find that an action exists. |
| Disclosure | A control that shows and hides a region (a fold, `<details>`). |
| Dismissal order | Which open surface one Escape closes: the topmost. |
| Fitts's law | Time to reach a target grows with distance and falls with size. |
| Focus ring, focus-visible | The outline drawn when focus came from the keyboard. |
| Inert | Unreachable by keyboard, pointer and assistive technology. |
| Landmark | A page region a screen reader can list and jump to. |
| Live region | A region whose changes a screen reader speaks unprompted. |
| Modal | A surface that blocks the rest of the page until it closes. |
| Mode error | Doing the right act in the wrong mode, because one act means two things. |
| Object constancy | A thing on screen stays recognisably the same through a change. |
| Roving tabindex | One tab stop for a group; the arrows move among its items. |
| Toggle button | A button that stays on until pressed again; its state is `aria-pressed`. |
| Target | The area a pointer or finger must land on. |
