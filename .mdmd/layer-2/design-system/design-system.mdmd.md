# The Explorer's Design System

_Current, authored. As of 2026-11-18. This is the way into the folder: why it exists, who it is for, what belongs in it, and what is not written yet._

## Metadata

- Layer: 2
- Audience: builders working on the Explorer; the root agent judging a picture or a journey; the owner; readers of a playtest's findings; outside contributors

## Why this folder exists

The Explorer's design rules were scattered through two months of conversation: a sentence of the owner's here, a measurement there, a decision in the log, a number in a stylesheet. A builder had to work each one out again, and nobody could see which of them had no reason behind it.

The owner asked for them in one place on 2026-11-18 ([Turns 14 to 16 of that day's record](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-14)): "something akin to a design bible for our project", to the standard of "professional design standardization materials that would be typically produced, and to the standard of, a professional who works in UI/UX design." Their reason is the folder's second purpose: "when it comes time to document something (as in: to defend the system as it is on paper), I find things that are indefensible and ultimately in need of change". And the test every rule here must pass: "If we have a standard, why is it that standard? If a reason can't be found, is it a standard we should have or keep?"

So the folder does two jobs. It tells a builder what the product's design rules are, so that new work matches the old without archaeology. And by making each rule give its reason, it shows which parts of the product cannot be defended.

## The parts

| Document | Holds |
| --- | --- |
| [Visual Foundations](visual-foundations.mdmd.md) | Colour and its meanings, type, shape and corner sizes, spacing and sizing, layering, icons, motion, and how each fact on a map is drawn. |
| [Interaction and Accessibility](interaction-and-accessibility.mdmd.md) | What each act of pointer, keyboard and touch means; the states of every control; the keyboard; what assistive technology is told; WCAG 2.2 at level AA, criterion by criterion; target sizes; responsiveness; portability; the words on screen. |

Not written yet:

- **Components.** A page for each recurring part (the file card, the directory handle, the item menu, the pin tray, the toolbars, the search, the reader, the keys, the history scrubber): its anatomy, its states, its sizes, when to use it. The two documents above hold the rules such pages would apply.
- **What only a browser can tell.** Both documents were first written from the code. Contrast as drawn on the screen, target sizes as measured, reflow at 320 px, text at 200%, an automated accessibility check and a screen reader over the main journeys are a second pass; until it is run, an entry that needs it says "not tested".

## How a rule is written

Each rule has six things: its name in a designer's term, defined where it first appears; the rule as a plain sentence; **why**; **where** the product holds it (a token, a file); what **checks** it, or "nothing"; and its **status**: *holds*, *broken* (with the places), or *proposed* (not yet the product's rule).

A reason is one of three kinds, and names its source:

- **Owner:** their stated intent, in their words, with the turn or the Memory entry that holds them.
- **Principle:** a named principle of perception or interaction design, or a criterion of a published standard such as WCAG 2.2.
- **Measured:** a measurement taken on this product, with where it was taken.

A rule for which no reason is found is not written as settled. It is recorded as "no reason found" with a recommendation to keep it, change it or drop it, and it goes to the owner.

## What belongs here, and what does not

**Belongs:** a standing rule of the Explorer's design that holds across views; the tables of values the product draws with (read from the code, with the file each is read from); a rule proposed but not yet built, marked *proposed*.

**Does not belong:**

- what one view shows and how it behaves: [the Explorer design](../../layer-3/live-documentation-explorer.mdmd.md);
- how a rule came about, and what was tried first: [the decisions log](../../layer-3/architectural-decisions.mdmd.md) and [direction](../../../AI-Agent-Workspace/Memory/direction.md);
- a design question still open with the owner: [direction](../../../AI-Agent-Workspace/Memory/direction.md#open-with-the-owner);
- an idea not chosen: [ideas](../../../AI-Agent-Workspace/Memory/ideas.md);
- a list of what is wrong with the product today. That is a dated record, kept with the day's evidence and not here; the first is [the findings of 2026-11-18](../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/design-system/README.md). A rule's own *status* says "broken" and where; the finding says what to do about it.

## Keeping it true

A rule changes here in the same commit as the product change that moves it. A new rule comes with its reason or is marked *proposed*. Colour is the only property whose table is held by a test today (one palette, and a unit test that fails on a colour written outside it); the other tables were counted by hand on 2026-11-18 and will drift until each has the same kind of check, which both documents propose.
