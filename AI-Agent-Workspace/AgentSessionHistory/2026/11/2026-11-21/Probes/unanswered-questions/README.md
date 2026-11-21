# What was put to the owner from November 15 to 19, and what became of it

Historical evidence, gathered on November 21, 2026 at the owner's ask of that day ([Turn 1](../../2026-11-21.1.record.md#turn-1)): "I suspect I've accumulated quite a few decisions/questions that were raised for me and have failed to answer them or allowed defaults (your educated choices) to take effect." They asked for the five days' records to be mined, for the result to be sorted into what "has actually been superseded versus what is still relevant", and for root to investigate the relevant part itself, so as to "see how much churn occurs in these questions, with new findings superseding old ones often."

## How it was done

1. **Readers.** The five session records (2.1 MB) were cut at their headings into twenty chunks of at most 150 KB, long lines folded so that a reader sees every character. Nineteen Sonnet subagents each read one chunk (one read two short ones) under [one brief](brief-for-the-readers.md) and listed every question, reversible call, offer and request for the owner's eye, saying only whether the owner answered inside the chunk. They returned **652 entries**.
2. **Judges.** Three Opus builders at high effort, one for each stretch of days, merged the repeats and gave each distinct item one status with its evidence, under [a second brief](brief-for-the-judges.md). Each had its share of the entries, every message the owner typed in the five days (117, extracted from the records by a script), the owner's answers of November 21, direction's current lists, and leave to search the records and the code. Their lists are kept here as they handed them back: [November 15 to 17](november-15-to-17.md), [November 18](november-18.md), [November 19](november-19.md). The entry numbers they cite are the readers', which were scratch and are not kept.
3. **Root** read the three lists whole, merged what one stretch repeats from another, and looked into the items that still wait: in the code, in the probes of November 19, and by one measurement of its own ([the Explorer without a graphics card](../weak-machine/README.md)).

## The count

| | Nov 15 to 17 | Nov 18 | Nov 19 | All |
| --- | ---: | ---: | ---: | ---: |
| Entries the readers listed | 196 | 210 | 246 | 652 |
| Distinct items after merging repeats | 87 | 90 | 104 | 281 |
| Answered by the owner, in their words | 35 | 26 | 24 | 85 |
| Overtaken before an answer was needed | 11 | 3 | 11 | 25 |
| Never really a question (a status line, a note to self, a step they then did) | 12 | 25 | 30 | 67 |
| A default took effect: no answer came and root's choice stands | 20 | 10 | 20 | 50 |
| Deferred by the owner, to playtests or to pictures | 7 | 13 | 0 | 20 |
| Open: put to them, unanswered, nothing built on a default | 2 | 13 | 19 | 34 |

About eighteen of the 104 items in the last three rows are one item counted in two stretches (the packet's twelve questions stand once under November 19 and ten times under November 18), so about eighty-five distinct things still wait in some way.

What the count shows about how the questions were put, which is root's to mend and not the owner's:

- **Asking again in place of looking beneath.** Each of the six small questions of November 15 was put seven to nine times over three days before the owner said they were "not to be put one by one".
- **A third of what was listed was never a question.** Sixty-seven items were status lines and notes that a reader could not tell from a question, which is how they read to the owner too.
- **Questions that were root's own to decide.** Most of the engine questions of the night of November 20 (how the history's workers are kept, what is done with a file at the stack's edge) change nothing a person sees, and the guide gives them to the lead developer.
- **The lists root kept were wrong in places.** The judges found nine statements in direction.md that contradicted the record or the code; they are corrected, each with its date.

## The churn, by example

- **Marbles.** Asked for on November 16, a "worthy new default" on November 18, off by default on November 19 by the owner's own reversal, the pattern trial built in three passes and removed within the same night.
- **Where the tool runs.** Both blanks proposed on October 3; the package first on October 10; "the tool still needs this checkout" on October 27; the single page measured and recommended on November 19; set down as "not on this road" on November 20; the owner's stated preference on November 21.
- **What "write only what is read" means.** Ruled by root on November 19, corrected by one review, corrected again by a second, replaced by a different design on November 20.
- **Files only against faint bars.** Promised to the owner as a pair to choose from on November 15; decided by root the same night; the bars removed before the owner saw them.
- **The kept description line.** Root meant to drop it; the owner called it "fine"; four values were built; the owner has never chosen among them and Hidden stands.
- **A count of a file's nesting.** Five hours of mending under three reviews; replaced in half an hour by measuring the plain alternative.

## What still waits, under the decisions beneath it

The owner's own rule for a long list of small questions (2026-11-18) is that it is "a sign to look for the decision under them, not to ask again". Root's grouping, with what it found on looking into each; the item-by-item evidence is in the three lists.

### 1. Where the tool runs, and where a scan's facts live

*Beneath:* the single page that scans; where another folder's Explorer is built; whether docs are written into the mapped repository; a scan that leaves no trace; how the tool arrives on Windows; the store's change and its format; the nine checks only a Windows machine can make; what a blank Explorer opens on.

*Found:* the owner's answers of November 21 point one way. Most of their code is under TFS, with no git to ask what is ignored and no history to read, which removes the command line's main advantage there. They would rather download a page than install a package. Nothing may leave the machine. [The probe of November 19](../../../2026-11-19/Probes/execution-surface/README.md) had already run the unchanged generator in a page with output identical to Node's. Read in the code on November 21: without git, discovery leaves out only `.git`, `node_modules`, the docs root, lock files and documents, and reads a root `.gitignore` if there is one; nothing reads a `.tfignore`, and a .NET solution's `bin`, `obj` and `packages` folders would be mapped. *Not known:* how long a scan takes in a tab on that machine; what its browser allows; whether a page's data block holds a large map comfortably. This is one decision, the owner's, and it is put to them as a fork: the page first and the package second, reversing October 10.

### 2. What a scan takes in

*Beneath:* submodules and nested repositories; what an `exclude` pattern means; documents as nodes, and whether an unlinked one is drawn; assets that outnumber code; an entry for every scanned file; the C maps' missing use of a definition; a header's include guard listed as a symbol; assets named from TypeScript; which shapes the owner's code has most of.

*Found:* the owner's principle is already given ("why should the scan ignore them if git won't? Should it be optional/configurable? Yes!"), so most of these are root's to settle by measurement on real repositories. One fact only the owner has was asked twice and never answered: which shapes their code has most of. And one gap fell off every list: an asset named from TypeScript draws no connection.

### 3. Open, close and pin, and what can be taken back

*Beneath:* a click on a pinned sphere; undo and the browser's Back; Clear all pins; the twelve interactions that cannot be taken back; the chip that wraps a group again; a click that reads in 2D and pins in 3D; Enter on a card's body; a whole-file pin against a flow pin; Tuning's reset arrow; the pin tray over the map; the six verbs; moving focus by direction.

*Found:* one proposal on paper since November 20, unread ([the proposal](../../../2026-11-19/Probes/open-close-pin/README.md)). Read afresh, it is sound in what it removes (a click never lets go) and leaves one thing it set out to cure: a click on a neighbour would still select in 2D and grow the picture in 3D. The reason given is the decision of October 20, and two things built since (a re-layout that moves and holds the card acted on; a camera that steps the least distance) may have weakened that reason. It cannot be judged from a page of words by anyone, the owner least; it needs a trial and strangers.

### 4. What the page promises on a weak machine

*Beneath:* Settle Hold; more than one physics step a frame; a round on the forces; a press that returns at once at any size; the limit of 1,024 drawn files; the pointer's rest; how the building state feels; when the 2D map stops rearranging; the look change's freeze; the cost of a scrub.

*Found:* every one of these was weighed on a machine with a graphics card and twenty threads. [Opened without a card and slowed](../weak-machine/README.md), a map the size of the estate sample holds up; this repository's own map gives two to five frames a second; and a browser that refuses WebGL gets a dead page on any 3D link. So the order of these questions changes: the 2D map's continuing search and the 3D map's cost a frame matter more on the owner's machine than how a settle ends, and the owner's "precomputation time with reasonable progress indicators" is a design direction none of the trials took.

### 5. How the maps look, and their small defaults

*Beneath:* the closed directory's shape and its farthest look; the description line when zoomed out; cells three presses out; the single cell; Dim; the word "Beyond"; the key's row for kinds; Return Cost's value; the far view's switch; the palette at first open; a light ground; the Bare frame; Framing; Beyond the Hops; the history's mark off its range; a gathered line's end; thirteen of the design system's fifteen forks; the ladder's and the grid's deletion; slot against grow.

*Found:* the largest group by count and the smallest by consequence. The owner deferred it twice, to blind playtests on small models and to pictures with links; the packet of November 19 covers twelve of them and waits. The playtest ladder's second half and the narrative task have been one command away since November 19 and were never run.

### 6. How the history is computed

*Beneath:* kept workers and a checking process; a file at the stack's edge; reading that does not depend on nesting; a parent's summary taken where nothing read changed; each version of a file analysed once; a failed history ending the Pages run red; "not read at this commit" in the timeline.

*Found:* all but the last change nothing a person sees and are the lead developer's, to be settled by measurement and independent review. The last is a question of what the timeline shows, and waits with the history's next round.

### 7. How the work is done

*Beneath:* a branch for each dev day (answered); the work items' form (answered: on trial); one digest in place of many messages; two kinds of hold in the lane; exports filed once; a deny rule for `git push`; whether anything is re-examined after refused commands; guidance moved out of the guide; the folder on `D:\`.

*Found:* root's own to carry out, but for two that touch the owner's machine and harness (a deny rule for `git push`; whether the old folder on `D:\` and its container were deleted).
