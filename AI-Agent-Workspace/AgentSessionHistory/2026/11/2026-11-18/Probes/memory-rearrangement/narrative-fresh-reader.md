# Fresh reader's check of the retold stretch (September 26 to November 18, 2026)

Written 2026-11-19 by an independent reader. Nothing in the repository was changed.

## What was read, and how

- **Read in full, in order:** the NEW stretch, `joined.final.md` (all 149 lines, eleven chapters), and the OLD stretch, `old-stretch.md` (all 375 lines, thirty-six chapters, read in four ranges to its end).
- **Read in part:** `narrative.new.md` lines 180 to 188 (the join with the March–April chapter) and 334 to 408 (the join with "Harnesses and models", "Where the rules came from" and "About this account"). The editors' `JOIN-NOTES.md`.
- **Searched only, not read in full:** `direction.md`, `owner.md`, `ideas.md` (about 110 phrases from the old chapters grepped across all three); the session records and summaries (each sampled quotation located by script, then the doubtful ones read in place, with the speaker heading above each match checked); the code under `packages/` and `scripts/`, `AGENTS.md`, `.devcontainer/devcontainer.json`, and git (`git log`, `git show`, `git branch -a`, `git ls-tree`).
- Also checked: all 213 links in the new stretch resolve to an existing file and heading anchor (script, 0 broken).

---

## 1. A turning point lost

**None found.** For every turn of direction, standing rule or change in how owner and agents work that the old chapters tell and the new ones drop, I grepped the three Memory files and found it held there. Checked among others: the "reliable panopticon" and "at least two ways to do anything" wants, "not the responsibility of the Explorer to hide that ugliness", neutral pronouns, fixing false statements in the record on sight, "provide me with hyperlinks which work", "self-called-internals to the bottom", the Research folder's origin, "Panels of LLM judges", the renderer as a standalone thing, the dev-day-chat boundary, the prompt-cache reason for the gate's length, "We keep chat histories for a reason", Matt Pocock's grilling and SCENARIOS, Unity, tidepool, the README's reimagining, the strangers who went to the World Map ("that's how it fits"), light/dark per view and palette per app, XHigh instead of Max after the lost replies, "Crowding the pinned item", the granularity seam, the 3D click that pins and releases, and the still-pointer settlement.

Three reversals are held in Memory but the narrative tells the earlier rule and not its reversal, so a reader of the narrative alone takes the earlier rule as standing. They are listed under heading 4 (S4, S5) with text to add; they are not counted here because Memory holds them.

---

## 2. A claim of state that is wrong today

Checked: **105 claims**. All 72 distinct commit hashes cited resolve, and each subject fits its sentence except as noted below. The other 33 claims checked against code or git: the estate graph still keyed by path from the estate's root (`packages/engine/src/live-docs/estateGraph.ts`, lines 5 to 8); memory prediction and headless RAM budget still unbuilt (no such code); `approximation` default 0.3 and range capped at 0.5, 10 ms frame budget; 457 Live Docs at `986fe8e2` (440 under layer-4 plus 17 elsewhere; 627 before `ca655066`); about 92,000 lines deleted (18,131 + 73,413 + 869); `1e36b33e` deleting 16,229 lines; AGENTS.md 3,411 to 1,683 words at `9cdefee9`; direction.md about 376 KB to 29 KB and owner.md to about a sixth on November 12; the Roots and builders paragraph entering AGENTS.md in `e104f9fa` and the worktree-reset note in `51eec0c3`; the pedagogical-bridge sentence cut in `06f94c84` and restored in `cb53d7c7` (November 15); `8376288b` raising gravity 0.01 to 0.025 and tether 0.01 to 0.02; Whole replacing Compact and Relaxed; `inspect --groups`; `Cited By`; ESLint 10; the page's CSP; Flow, the three looks and marbles as defaults; first-line and cells as Tuning choices; the GPU recipe for WebGL only and the agents' folders and node_modules on volumes; the branch `trial/still-pointer` existing; `af98a5e0` being the narrative's first commit; the subagent ceiling of three in AGENTS.md; the uncached-history measurement still a standing ask in direction.md.

Wrong or doubtful:

**2a. Doubtful: a hash attached to the wrong half of a sentence.** Chapter "A card that keeps its box, roots and builders, and cells in an embryo", sentence beginning "With one Sol builder it flipped the chosen defaults." The text reads "Six Portal names vanished in the switch once their folders became cells, and a first repair drew amber disks that the root refused (`54f90f80`)." `54f90f80` ("Preserve grouped Explorer views across navigation") is the landed round: Skin and one hop as defaults, the corrected cross-perspective journey and the contained-sphere renderer, with 345 of 350 browser cases. It does not contain the amber disks the root refused. Proposed:

> With one Sol builder it flipped the chosen defaults. That uncovered journeys no one had taken with them on. Six Portal names vanished in the switch once their folders became cells, and a first repair drew amber disks that the root refused; the defaults and the repaired journeys landed with five browser cases still red (`54f90f80`).

**2b. Doubtful: true today but read as the state of things.** Chapter "Three looks, a cut undone, strangers, and pictures shown rather than asked", sentence beginning "Their third wish, ways for a still pointer to behave". "It stayed on the branch `trial/still-pointer`" is true (the branch exists), but the question was settled on November 15 and a different behaviour landed on `main` as `7f3e4160` (2026-11-16, "Hold a 3D map's nodes still to the pointer while the map builds, and say that it is building"). The new stretch never says so. Fix under S5 below.

No claim was found wrong outright.

---

## 3. A quotation that is not in its source

Sample: **285 quotations checked word for word, about 272 of them the owner's**, by script against the record and turn (or transcript line) the sentence cites, with the misses read in place. Per chapter (total / owner's): 1: 27/26; 2: 33/31; 3: 21/20; 4: 21/21; 5: 6/6; 6: 24/21; 7: 41/41; 8: 14/14; 9: 37/36; 10: 25/23; 11: 37/35. All five editors' chapters are covered. One mismatch of wording and four of location:

**3a. Wording.** Chapter "A card that keeps its box…", sentence beginning "At the owner's insistence the 3D wrappers came back too." The text says: `"That's -- sorry that's really really the point. The idea is to abstract a crapton of nodes into fewer ungulfing 'nodes'"`. The source (2026-11-05.1.record.md, Turn 11, line 440) says: `fewer ungulfing "nodes" (meshes that wrap those nodes)`, with double quotes. Replace with:

> The owner: "That's -- sorry that's really really the point. The idea is to abstract a crapton of nodes into fewer ungulfing \"nodes\"" ([Turn 11](../../../../../2026/11/2026-11-05/2026-11-05.1.record.md#turn-11)).

**3b. Location and case.** Same chapter, sentence beginning "The owner said why they had believed in hover." Both "itself would not resize" and "an adequate even amount of space" are in **Turn 1** (record line 36), not near the Turn 3 the next sentence cites, and the source has a capital: "An adequate even amount of space would be allocated for each symbol on the card". Replace with:

> The owner said why they had believed in hover ([Turn 1](../../../../../2026/11/2026-11-05/2026-11-05.1.record.md#turn-1)). They had pictured a card that "itself would not resize", where "An adequate even amount of space would be allocated for each symbol on the card", with an ellipsis where the text ran out.

**3c. Location.** Chapter "Three looks, a cut undone…", sentence beginning "Their third wish". "with my own eyes and hands" is in Turn 6 of the November 10 record (line 1131); the sentence's only citation is Turn 7. Replace "to try "with my own eyes and hands", was built" with:

> to try "with my own eyes and hands" ([Turn 6](../../../../../2026/11/2026-11-10/2026-11-10.1.record.md#turn-6)), was built

**3d. Location.** Chapter "Reading apart from keeping…", sentence beginning "The owner also asked for stewardship of the module boundaries". "jagged quality" is in Turn 15 of the October 19 record (line 972); the sentence's citation is Turn 14. Replace "expecting "jagged quality" in the tests as well." with:

> expecting "jagged quality" in the tests as well ([Turn 15](../../../../../2026/10/2026-10-19/2026-10-19.1.record.md#turn-15)).

**3e. Location (soft).** Chapter "The eye over the scoreboard…", sentence beginning "Separate scans were chosen". "Let's start with separate and see if pain brings us over" is in Turn 2 of the October 9 record (line 107), while the only turn named in the sentence is Turn 6. Replace the parenthesis with:

> ("Let's start with separate and see if pain brings us over", Turn 2)

Not a quotation but the same kind: in the same chapter, "after the owner found thousands of uncommitted files" is Turn 6 of the October 3 record ("HOLY CRAP I'VE GOT 3K+ UNCOMMITTED FILES!", line 409), while the sentence cites Turn 3.

---

## 4. Seams

**S1. Two chapters disagree on a date.** "Wires that resist zoom, and the newcomer's journey found unfinished", sentence beginning "The pass kept count-weighted strokes": "it repaired the numerical instability found on October 23, the NaN hub". The chapter before tells it found on October 22 by Fable's tuning probe (`6505766a`, dated 2026-10-22), and the old October 23 chapter calls it "reported the previous evening". Replace with:

> it repaired the numerical instability found on October 22, the NaN hub,

**S2. A reference to something not told.** "Three views, the next big thing…", sentence beginning "The click rules written from their own October 3 words could not do it". The October 3 telling in the chapter before mentions only the docs session; the Codex session that wrote the click rules (click retains, an X that prunes) is not told. Replace the October 3 sentence in "The eye over the scoreboard…" (beginning "On October 3 a docs-only session") with:

> On October 3 two sessions ran at once by design: a Codex one set the Explorer's clicks from the owner's words, a click to retain and an X to prune, while a docs-only one made agents readers of what a person exports from the page and settled, after the owner found thousands of uncommitted files, that a file which looks like a viewer must not write uninvited ([2026-10-03.2.record](../../../../../2026/10/2026-10-03/2026-10-03.2.record.md#turn-3)).

**S3. A reference to something not told.** "No text of ours, discovery by hops…", sentence beginning "The September rule of explainers behind a question mark became this". No September chapter, old or new, tells such a rule. Replace with:

> Explainers had been allowed behind a question mark since September 28; now the question mark may exist, but it is never the fix.

**S4. A rule told without its reversal.** "Three views, the next big thing…" tells the owner's "Too complex. E2E playwright must be serialized" (October 19). On November 17 they lifted it (owner.md line 250, direction.md line 337), and the old chapter told that; the new "A freer hand, a marble…" mentions only that the root "measured … the workers". After "went only from two hours to 98 minutes." insert:

> For it the owner lifted their rule of October 19 that the browser tests run one at a time: "Whatever the system reliably tolerates. I'm just looking to get our iteration speed up" ([Turn 4](../../../../../2026/11/2026-11-17/2026-11-17.1.record.md#turn-4)).

**S5. A decision left on a branch in the telling.** The November 10 telling ends the still-pointer trial on `trial/still-pointer` (see 2b). The November 15 chapter does not tell that the owner then settled the question and it landed on `main`. After the first paragraph of "A freer hand, a marble…" insert:

> Once they understood the still-pointer question they settled it in a message: the map says it is building and takes no hover or click on a node meanwhile, "replaced only when it's not good enough" ([Turn 4](../../../../../2026/11/2026-11-15/2026-11-15.1.record.md#turn-4)); it landed so on `main` (`7f3e4160`), and the November 10 branch stays as the trial it superseded.

**S6. The same quotation at both sides of the join.** The March–April chapter (narrative.new.md line 185) ends by quoting "I haven't been in this repo for months due to some burnout on it" (2026-09-26.1, line 12) as the owner's reason, and "The return" opens at once by quoting the same line in full. This was already true of the old file, so the retelling did not cause it. Proposed opening for "Baby and bathwater, the board, and a record of what was said":

> The owner came back on 2026-09-26 in Claude Code, on Opus 5.5 and from that evening Fable 5.1, wanting to "be a good steward of this workspace": "This code project was created to be a showcase of what could be accomplished with the pinnacle of frontier models... _at the time_. Their quirks -- the harness quirks -- all of that -- gone. Totally gone ... Can you explore a while and tell me what's the baby and what's the bathwater?" ([2026-09-26.1](../../../../../2026/09/2026-09-26/2026-09-26.1.md), lines 12 to 16).

Also looked for and not found: the same event told twice in two chapters; two chapters disagreeing about a model or who did what (models checked against each record's header for October 20, 21, 22, 23, 24, 28, 30, 31 and November 2 to 17); a chapter whose start does not follow its neighbour's end. The other cross-references resolve ("the rule of December", "the wish of December 19", "the owner's 0.01 of October 18", "since October 24", "the question first put to the owner on October 30", "proposed on November 8", "their sentence of November 6", "The Fable root of November 10"), and so does the closing section's "the chapter of October 12 to 19".

---

## 5. Words attributed to the wrong speaker

**None found.** For every sampled quotation I checked the speaker heading above its match in the record or transcript ("### User", "**Owner…**", "## Owner ·" against "## Claude (…)", "Root's reply", "Assistant — reply"). All owner-attributed quotations sit in the owner's text. Two in the November 5 and October 24 records sit under root-written labels but are fairly told: "Immediate files + subfolders, each counted once" is an option the owner *chose* (and the text says "chose"), and "The archipelago with skins" is the owner quoting the root's caption. The agents' words are attributed to agents: "A system is a folder…" (Fable, line 378), "One grammar for every input, not two" (the recovered Turn 9 reply, October 14), "the signature of a gesture fighting the layout", "a shortest import path is not a call trace", "we can share a useful explanation…", "You're reading it right…", "the fragility comes from where the expected values live…", "slightly busier, not clearer". "pre-existing and unrelated to my changes" is the agent's, quoted back by the owner. "a card catalogue, not a map" is correctly the stranger agent's.

---

## What I did not check

- The figures the editors flagged as unchecked (T3's 21,720 spheres and 236 million pairs, the October 28 memory figures, 177 colours, 8.7 s against 78 s, 4.3 times, "a fifth more references", the six lost replies, the September adapter scores and "8 to 17 of 20") were not recomputed.
- The roughly 10 percent of quotations outside my sample, and inner punctuation (case, italics, ellipsis spacing) beyond the five cases above.
- Whether each commit's whole diff matches everything a sentence says of it; I checked subjects, and the bodies or diffs only for `e104f9fa`, `51eec0c3`, `54f90f80`, `8376288b`, `add3a341` and `1225bfd7` (whose message does not mention the 842 removed outputs. They were untracked files, so no commit records them).
- The parts of `narrative.new.md` outside lines 180 to 188 and 334 to 408, including whether "Harnesses and models" now has the rows `JOIN-NOTES.md` asks for (October 28, 30 and 31).
- Behaviour in the running Explorer: no build or browser was used.
