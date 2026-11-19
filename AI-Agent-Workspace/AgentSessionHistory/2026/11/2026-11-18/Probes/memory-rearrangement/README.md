# The Memory documents rearranged by subject: the method, the checks and the ledgers

Historical record of a piece of work, November 18 to 19, 2026 (UTC), by the root of [the day's session](../../2026-11-18.1.record.md) and its helpers. What the Memory documents are now is in the documents themselves; this folder says how each was rearranged, what was checked, and what was not carried over.

## What was asked

The owner, in [Turns 11 to 13](../../2026-11-18.1.record.md#turn-11): to improve the guide and the Memory documents by "compressing them in a way which reduces their context occupancy while losing as little information as possible (or even _gaining_ important information!)", preferably by an approach that "takes the information and rearranges it into new cleaner arrangements which result in the same understanding or better, but wildly more efficiently, and in ordering and grouping which meets the audience where it's at"; and to know, before touching a file, why it exists, who it is for, and what should and should not go into it.

An earlier cut, on November 12, was restored at the owner's word the same day ("So much of success is just knowing what we have and haven't already discussed"). Measured afterwards, that cut of `owner.md` had kept 45 of 381 quotations. Hence the rule here: nothing of the owner's is dropped or reworded.

## The method, as it settled

1. **The three answers first,** per file: why it exists, who reads it and when, what belongs. They were put to the owner, who corrected one ([Turn 13](../../2026-11-18.1.record.md#turn-13)).
2. **An arrangement designed by the root** from a whole read: by subject, each subject leading with what stands now, then the owner's words dated with their turns, then what was tried and not taken, then what is open.
3. **A mechanical check, both ways,** of every quotation and every link target ([qc.mjs](qc.mjs), [links.mjs](links.mjs), written by a helper). It pairs quotation marks within a line and ignores marks inside code; the root's first check paired them across the whole text and reported mostly the stretches between quotations.
4. **A ledger** of everything not carried over and why.
5. **Fresh readers,** each given one part of the old file and the whole of the new, deciding entry by entry: carried; carried, weaker; changed; missing; rightly left. This is the step that sees what no script can: a stance reported without quotation marks, a number, a thing tried and why it failed.
6. **Their sentences applied** by the helper that knew the draft, each checked against the old text first.
7. **The result read whole by the root,** who then brings it level with the day and puts it in place in one commit. The old text stays in git.

What the root learned on the way: its own first draft, written from a whole read, lost 26 quotations and stated three things wrongly; the helpers' diligence found them. The idea of the arrangement was the root's part and the lossless execution was theirs. And step 7 is not a formality: of two entries the readers found missing, the helper applied one and reported both, and the root's read caught the other.

One error went through all seven steps and was caught an hour after the file was in place: a reader offered a sentence saying a feature was not built, taken from a line of the decisions log older than the build; the helper checked it against the old text, which did not contradict it; the root did not know better. The reader checking `ideas.md`, which looked each landed idea up in the commits, found it (`df9aa90e`). So for the files that follow: a sentence that says what is built is checked against the code and the commits, not only against the text it replaces.

## `direction.md`

| | Bytes | Quotations | Link targets |
| --- | --- | --- | --- |
| Before (`git show c4780415:AI-Agent-Workspace/Memory/direction.md`) | 529,176 | 819 | 437 |
| The root's draft | 188,798 | | |
| After the quotations were reconciled | 212,937 | | |
| After the readers' lists were applied | 231,849 | | |
| In place, brought level with November 18 | 240,217 | 707 | |

The file is 45% of what it was. It was three current sections over a dated record of 142 entries in the order things happened, with a table of 27 answers whose cells were padded with 91 KB of spaces; it is now one account by subject.

- **Quotations:** 15 of the old text's are absent, none of them the owner's own words left out by choice: 13 are labels, headings or another agent's words, and the rest are covered by a fuller quotation that stands. 17 stand that the old text lacks: one of the owner's of December 16, 2025, found in its transcript (a gain), and 16 of November 18 from Turns 11 to 20.
- **The five readers** (their lists: [A](direction-readers/A.md), [B](direction-readers/B.md), [C](direction-readers/C.md), [D](direction-readers/D.md), [E](direction-readers/E.md); the links inside the sentences they offered were written for the Memory folder and are re-pointed here so that they resolve): of 333 entries, 231 carried, 72 carried with a part gone, 3 changed, 2 missing, 26 rightly left. No reader found a decision of the owner's lost, or a question that would be put to them again. What had gone thin was what had been measured and what had been tried. 94 of their items were applied, 8 of them reworded, 6 declined with reasons.
- **Link targets:** 61 of the old text's are no longer cited, listed by kind in the ledger: session summaries and work notes whose substance is told under its subject, screenshot folders and probes of superseded states, three turns that hold no stance.
- **One inbound link breaks,** from the November 15 record to the old heading "Answers at forks"; records are left as written. The headings `Next` and `Open with the owner`, which 31 links point at, are kept.
- **[The ledger](direction-ledger.md)** holds all of this item by item, with the helper's judgment calls and the root's rulings on them.

## `owner.md`

| | Bytes | Quotations |
| --- | --- | --- |
| Before (`git show c5493364:AI-Agent-Workspace/Memory/owner.md`) | 162,530 | 428 |
| First pass: every entry moved whole to its subject | 171,559 | 430 |
| Second pass: the telling tightened | 161,711 | 429 |
| Third pass: a fresh reader's 19 corrections applied | 164,976 | 429 |
| In place, with two entries from the night's turns | 167,214 | 441 |

**This file did not shrink, and that is the finding.** 37% of it is the owner's quoted words and 10% link targets, neither of which may shrink; what remains is readings, instructions, facts and the entries' leads. Its editor tightened the telling by 11.6% and a fresh reader then found that 19 of the 121 tightened entries had lost or shifted something, most often by turning "So …", which marked the root's inference from a quotation, into a bare instruction that reads as the owner's. Putting those right gave back most of the saving. The lesson: in a file that is mostly quotation, the words around a quotation are what say whose inference follows it, and they are not padding.

**Its gain is arrangement.** It had grown by accretion: 200 entries under four headings, newest first for a stretch and oldest first after, some under the wrong heading (the machine's load under visual taste), one subject told in five places. It is now by subject: who they are; what the tool has to serve; how they work with an agent, in seven parts with named groups (deciding with them, explaining and teaching, how the lead developer conducts the work, roots and builders, sessions and records, their machine, git and tests); taste, in ten parts; what they hold about the product; and the Copilot era's note, its entries moved beside the later stances they led to. A stance that replaced another stands first with the older one beneath, marked. The three linked headings keep their words.

- **How it was made safe:** the editor's build moves each old entry whole by script and applies only listed rewrites, each verified to keep every quotation, link, code span and number of its entry ([its ledger](owner-ledger.md)). No quotation of any length is absent (447 checked). 13 stand that the old lacks: one of November 17 and 12 from the night's Turns 11 to 18, each found word for word in the record.
- **The fresh reader's check** ([its list](owner-check.md)): 102 of 121 rewritten entries kept their meaning; 6 changed, 6 weaker, 7 with the speaker blurred; the stated ordering untrue in four groups; five entries where a reader briefing a builder would not look; three replaced stances unmarked. All applied.
- **The root read the result whole** before it replaced anything.
- **Left for another pass:** the thirteen entries under "What they hold about the product", and about twenty more that are partly product decisions, are candidates to move to `direction.md`.

## The other files

`ideas.md` was in its last pass when this was written, and the narrative not begun; their ledgers join this folder as each lands.
