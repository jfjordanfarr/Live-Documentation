# Ledger: owner.md rearranged by subject (2026-11-18)

Old: `git show c5493364:AI-Agent-Workspace/Memory/owner.md` (copied to `owner.old.md` beside this file). New: `owner.new.md`. Built by `build.mjs` here, which moves every old block whole and applies only the edits listed in its `EDITS` table, each asserted to match exactly once. Line numbers below are the old file's.

## Method and checks

- Every old block (200 bullets, 3 bold paragraphs, 3 "Reaffirmed" paragraphs, the opening, the day job and its block quotation, the Copilot note) is used exactly once; the script fails on a block used twice or left out.
- Quotation check (`qc.mjs --list`): old 428 quotations, new 430; missing 0, partial 0, odd quote marks 0. The one quotation in the new that the old does not hold is the owner's of 2026-11-17 (see "Added"), on purpose.
- Link check (`links.mjs`): no link target of the old missing from the new. Every link target in the new resolves to an existing file.
- Word multiset check (`wordcheck.mjs` here): the only words of the old not in the new are those of the edits below (old keep-sentence, 20 × "same turn", the positional "above/below/next", and the reworded bold leads). No line of the new (over 40 characters) appears twice.
- One block quotation in the old (the day job, line 17), carried. Typographic quotations are paired by `qc.mjs` and counted above; single-quoted quotations sit inside entries moved whole and are covered by the word check.

## Sentences or clauses not carried, and why

- Line 3, the old keep-instruction: "Any agent working here keeps this file: when the owner says something that changes how to work with them, add it with the date, in their words where you can." Replaced by the new first paragraph's keep-instruction, which says the same plus "under its subject" and how to mark a replaced stance. The rest of line 3 (the 2026-11-12 cut and `git show 2f88a579`) is carried verbatim.
- Twenty "(date, same turn)" references, which depended on the entry that stood before them, now name the turn with its link: lines 33, 34, 36, 46, 52, 54, 122, 124, 125, 127, 162, 163, 165, 166, 167, 170, 173, 174, 175, 225. Each was checked in the record by grepping for the quotation. **Three corrections came of that:** lines 34 ("font hierarchy", the pedagogical bridge) and 36 ("your eyes needed") are in Turn 1 of the November 15 record, not Turn 5 where the entry before them stood; line 127 ("waaaaaay more committed artifacts") is in Turn 10 of the October 8 session, not Turn 11.
- Positional pointers removed or reworded where the entries now stand together or elsewhere:
  - 34: "(2026-11-03) below." → "(2026-11-03)." (the two entries are now in one group).
  - 46: "(2026-10-01) and … (2026-09-30) below." → "(2026-10-01, under Git, verification and tests) and … (2026-09-30)."
  - 58: "recorded below" → "recorded under pictures".
  - 82: "the Copilot-era entry below on the always-in-context file." → "…, which follows it."
  - 118: "The 2026-09-30 clarification above" → "The 2026-09-30 clarification (Lead developer, linear history, durable provenance)".
  - 125: "The Copilot-era entry below, … is current." → "… which follows, is current."
  - 135: "the rule above that" → "the rule that".
  - 203: "\"Cut, don't boost\" below, which" → "\"Cut, don't boost\", which".
  - 247: "The March antecedent is in the Copilot-era section below." → "The March antecedent follows." (it now does).
  - 255: "Sharpened on 2026-10-30, next." → "…, in the entry before this one."
  - 279: "The result is the section below." → "The result is the Copilot-era section at the end of this file, with the entries from it that now stand under their subjects."
- Bold leads reworded (leads are the root's wording, none a quotation): 304 "**2026-10-02.**" → "**A change with an equivalent result is implementation, not a design question** (2026-10-02)."; 306 "**2026-10-06, the explanations must keep the codebase within their understanding.**" → "**The explanations must keep the codebase within their understanding** (2026-10-06)."; 310 and 311 had no bold lead, their opening clause is now bold; 13 (a "Reaffirmed" paragraph) gains the lead "**In motion, their eye decides.**"; 218 (an indented continuation of the card entry) gains "**A professional game-development background; UX teaching is not engineering teaching** (2026-11-04, said while a card's composition was discussed)." and stands as its own entry.
- Nothing else was cut. No retelling was trimmed: the brief allows it, but every candidate I looked at carried an occasion or a fact, and I kept to the rule "when unsure, keep it". So the file is larger, not smaller (see sizes in the handback).

## Added (all the root's wording)

- The new first paragraph (why, who, what belongs and not, how to keep it, the 2026-11-18 arrangement and its `git show c5493364` pointer, ordering rule).
- One lead sentence for each group of entries (32 of them, beside the three below), saying what the group adds up to. They quote nothing.
- A lead in "Their machine, and reaching them": where an older entry names port 8900 as the place the owner looks (lines 44, 315, 318), the 2026-11-13 entry (line 41) governs. I did not edit those three entries.
- A closing sentence after the Copilot note, saying that its entries now stand under their subjects with their Copilot-era dates.
- **A new entry, at the root's instruction:** "The browser tests run as many at once as the machine reliably tolerates" (2026-11-17, Turn 4 of the November 17 record), quoting "Whatever the system reliably tolerates. I'm just looking to get our iteration speed up." with the root's reading from that turn's work notes (the number is the root's to find and must hold over repeated runs). Placed first; line 313 beneath it.

## Replaced stances marked

- 313, "The browser tests run one at a time" (2026-10-19): marked "(replaced on 2026-11-17 by the entry before)"; words and date whole.
- 120, "No grilling needed" (2026-09-27): marked replaced (qualified 2026-10-01 by line 272, which now stands before it; asked for by name 2026-10-08, as the entry itself says).
- 255, "Explainers, not tutorials on the screen" (2026-09-28): marked "replaced in part on 2026-10-30"; line 256 stands before it.
- 199, the November 8 verdict on the root's eye: a closing parenthesis notes that it is replaced on 2026-11-12 by "Fable's eye is trusted" (line 58, which already said so), and that the entry's rules for pictures stand.
- 315, 44, 318 (port 8900): by the machine part's lead, as above.
- Already marked in the old and left as they were: 144 supersedes the October 8 heuristic; 64 retires low-chatter; 58 supersedes November 8 and October 13; 145 corrected 2026-11-12; 251 corrected 2026-11-16.

## Merges

No two entries were fused; no quotation was combined. Entries that tell one subject are set together under one lead:
- Prior art and the archive: 316, 163, 130.
- How they answer: 108, 111, 112, 164, 309, 304.
- Grilling and pressure-testing: 272, 120, 121.
- Pushback and correction: 109 (with its 110 reaffirmation), 117, 294.
- Pictures: 44, 43, 199, 173, 187, 138, 13, 308 (the six dates the brief named for "showing them pictures" are here, bar 2026-11-05's port entry, which is under the machine).
- Designer's eye and trust: 30, 58, 52, 25.
- Understanding: 123, 310, 306, 128. Teaching: 34, 32, 218, 66 (with 68), 64. What a reply carries: 318, 74, 172, 168, 151.
- Root/builder pattern: 195, 191, 317, 193. Delegation: 129, 135, 181, 161, 159. Models: 160, 189, 177, 183.
- Startup: 48, 96, 148, 36. Record: 23, 100, 134, 270. Replies not arriving: 37, 38, 275. Memory horizons: 171, 140, 118, 279. AGENTS.md: 82, 296, 56, 150.
- Commits and git: 113, 116, 106, 114, 295. Gate and CI: 104, 80, new, 313. Time spent proving: 50, 210, 155. Checks: 26, 70, 137. Look then protect: 131, 298, 260. Oracles: 154, 141, 152.

## Moves that differ from the root's design, and why

- **13** ("Reaffirmed in live playback", the owner's eye for temporal behaviour) moved from "What the tool has to serve" to Deciding/pictures: it is about whose eye decides, not what the tool serves. Its history taste ("fireflies", "maximize surprise") rides with it.
- **218** (game-development background) went to Explaining ("what they already know"), not Who they are: its instruction is how to explain to them. Who they are still has their background in 302 and 312.
- **315** (what port 8900 shows without a switch) went to "Their machine, and reaching them", beside 41, which replaced its port.
- **189** (aesthetic judgment wants a vision-capable model) went to Roots/models ("which model for which work") rather than to "whose eye is trusted"; 58 there says what changed.
- **121** (a fixed set of scenarios to pressure-test ideas) stands in Deciding with grilling, where it was said, not in verification; the verification part's "scenarios" are 26 (joint assertions) and the oracles.
- **122** (skills are thirty lines; nothing installed) went to conduct beside 166 (when a library is worth taking), as a stance on what is taken in, rather than with grilling.
- **174** (a hold in a simulation is a workaround) went to Formatting/"How a good picture is found", since it is about the forces that make the picture; it could equally stand under conduct (causes, not workarounds).
- **88** (hold competing design pressures together) is in "How a good picture is found", as the design asked; it also carries the independent-improvement boundary request.
- **260** (design faults under test) moved from Formatting to verification ("look then protect").
- **131** (the tool is a panopticon of itself) went to verification ("look then protect"), not "What the tool has to serve".
- **133** (the Local Map is the teacher) went to Formatting/"Cards and the 2D map".
- **98** (lead developer, linear history, durable provenance) leads conduct, though it also holds git and records facts.
- **64** (low-chatter retired) went to Explaining, as a stance on how much to say.
- **294** (visual disagreements go to the human; text facts may correct the owner) stands with pushback in Deciding, not inside the pictures group.
- **289** (read the whole file) is in conduct as designed; it sits naturally beside 48 (the startup read) too.
- **300** (visual grammar fixed early) went to Colour beside 252 (direction and colour), its first item's later stance. It holds four other items (map not responsive, omnisearch placement, settings sticky across sessions, an entry-point artifact) that are product stances.
- **297** (headless and UI parity) is the only entry left in the Copilot section; no later entry in this file states it (AGENTS.md does).
- **Parts added to the design's Formatting list:** "Presets, knobs and configuration", "An honest picture", "Time and history", "Code written to be read" (230, 250 and 144, the code-readability stances, which I read as the design's "readability of what is written for them"); "interaction" is named "Interaction and orientation", since 247/299/248 lead it.
- "What the tool has to serve" holds 19, 11, 9, 146, 54; 9 and 11 stay paragraphs as they were.

## Product-stance candidates (to move to direction.md some day; none moved)

In "What they hold about the product": 84 (names stay loose), 277 (the word for openings), 119 (no requirement-ID schemes; plain names), 156 (a Live Doc wherever there is authorial decision-making), 157 (assets are content), 170 (an asset is a binary file), 125 and 301 (files on disk, no network; offline), 145 (delivery shape), 124 (zooming as the switch between views), 185 (related means linked), 165 (trust what git says), 220 (less authorial intent; a configured wish never refused silently).

Elsewhere, also product decisions in part: 9 (what the 3D switch is for), 54 (how people arrive; the default first screen), 133 (the Local Map stays until matched), 167 (a history step is a commit, perhaps pinned-salient), 175 (history granularity seam; history in exports optional), 205 (Hops Shown default 1; skins default), 214 (portrait cards), 224 and 226 (3D purpose; discovery default), 228 (linear time default), 252 and 300 (sides and grammar), 253, 254, 263 (World Map board, district colours, floors), 264 (light outside, dark inside), 297 (headless/UI parity).

## Could not place / unsure

- 252 ("Direction and colour") carries no date of its own; it is from the 2026-09-27 batch by position, refined 2026-09-28. Left as written.
- 98 and 104 each mix two subjects (lead developer and records; local gate and repository bloat); each is placed by its lead.
- The "same turn" corrections at 34, 36 and 127 are corrections of fact by the record; the old file never stated those turns, so no dated correction note was added. The root may want one.
- 199's parenthesis names an entry by its lead without quotation marks, to keep the quotation check clean.

# Second pass: tightening the telling (2026-11-18/19)

First pass kept as `owner.pass1.md`. The second pass is `rw.txt`: 121 whole-block rewrites. A rewrite writes the root's words new and draws the owner's words from the block itself: `{q:prefix}` brings in a quotation with its marks, `{l:label}` a link, `{upto:marker}` / `{from:marker}` keep the old text before or after a marker. So no quotation was retyped. `build.mjs` then checks each rewritten block against its first-pass form. Every quotation of any length must be present whole, every link target, every code span and every number outside quotations. The run fails otherwise. One exception was granted: block 34 drops its pointer "It joins "Teach the concepts at the decision point" (2026-11-03)", because that entry now stands directly after it with those words as its lead.

## Sizes

- Whole file: 162,530 (old) → 171,559 (pass 1) → 161,711 bytes (pass 2).
- Telling, meaning everything outside quotation marks and link targets, by `telling.mjs`: 90,744 → 80,212 bytes in pass 2 (−11.6%). That count includes the bold leads (about 11 KB), dates and link labels (about 10 KB), the Copilot note (1.7 KB, kept whole) and the day-job block quotation (0.75 KB, the owner's words but unquoted).

## Checks after pass 2

- `qc.mjs`: old 428 quotations, new 429, missing 0, partial 0, odd 0; one new quotation (the 2026-11-17 entry).
- `allquotes.mjs` (all lengths): 447 old quotations (446 distinct), 0 absent from the new file.
- `links.mjs`: no target lost; every target in the new resolves.
- Words: 1,468 of the old file's 24,706 word tokens are missing from the new. The tokens of quotations that no longer sit inside quotation marks number six ("Teach the concepts at the decision point", the pointer above), and those words still stand as that entry's lead. No other missing token is from a quotation.
- No line of the new appears twice.

## What the rewrites removed (kinds, with examples)

- Retelling of the order of a conversation. Line 27: "Root then said it was parking a trial…; the owner, at once:" became "When root then parked a trial two rounds built on a branch:".
- The account of what the root did, beyond the clause that says why they spoke. Line 48: "The root had told them the startup reading had outgrown one context, having taken… and had cut… on that belief. The owner:" became one clause.
- Sentences beginning "So" that restated the quotation became plain imperatives, with no instruction dropped. Lines 37, 50, 52, 131, 135, 140, 142, 150, 159, 160, 168, 171, 172, 174, 222, 223, 225, 264 and others.
- Attributions said twice ("The owner explains that", "The owner explicitly", "They explicitly request").
- A sentence that was only about one session: line 144, "Broad cleanup is explicitly outside the current pinning session."
- Detail of a mock that adds nothing to the stance: line 43, "a sidebar and two schematic miniatures, one row of theme swatches, … on the key's samples" became "schematic miniatures, theme swatches, the browser's colour picker".
- Line 11 lost the clause "The November 1 wording was interpreted in that earlier context; it was not itself an explicit new instruction for uniform sizing". It now reads "Uniform junction sizes come from their request of October 28, not from these words (attribution clarified …)". This is the same claim, shorter; it is the riskiest single compression.
- Line 66's indented second paragraph (Turn 13) is folded into the entry's single paragraph.
- Three long bold leads were shortened (lines 25, 26, 206).
- Group lead sentences became `####` headings of two to six words. The machine part's port sentence, the product section's line and the Copilot closing line remain sentences, shortened.
- The first paragraph went from about 2,870 to 1,880 characters. Its new last sentence (the 2026-11-12 cut) is verbatim, and it now says that "three links that named the wrong turn were corrected on 2026-11-18". The detail is in the first part of this ledger.
- Doubled stops (`."` followed by `.`) that the rewrites produced are removed by the build.

## Kept on purpose

- Line 252 ("Direction and colour") is left undated; it has no date of its own (by position it belongs to the 2026-09-27 batch, refined 2026-09-28).
- The Copilot note (line 287) is kept whole. So are the corrections (lines 114, 145, 251, 266, 292) and the incident record (line 295).
- Most entries of 300 or fewer characters outside quotations are untouched. They were already tight.

## Why not 140 KB

The quotations (about 37% of the file) and the link targets (about 10%) were not to shrink. After them, about 21 KB of what remains is scaffolding: leads, dates, link labels, the block quotation and the Copilot note. The rest of the telling is now mostly instructions, readings and facts (numbers, files, hashes), which the brief keeps. Rewrites in the third round saved only a few hundred bytes, because their entries had no more retelling to cut. Going further would mean dropping readings or facts, so I stopped at 161.7 KB.

# Third pass: the reader's check applied (2026-11-19)

Source: `check.md` (a fresh reader's pairwise comparison of the 121 rewrites). Every change below went through `rw.txt` or `build.mjs` and the same per-block verifier. Nothing was cut to save bytes.

## The reader's 19 items

| # | Old line | Done |
|---|---|---|
| 1 | 11 | Applied the reader's sentence: they accepted the critique and named the sizing pass themselves; their November 1 sizing sentence was read in the light of October 28 and was not itself an instruction. |
| 2 | 64 | Applied ("permanent"). |
| 3 | 168 | Applied ("ask what would make it showable"), with "So" restored. |
| 4 | 177 | Applied. |
| 5 | 235 | Applied (sizing marked as "also proposed"). |
| 6 | 304 | Applied ("verified", positive form). |
| 7 | 23 | Applied, and "asked which was better" and "woken by hooks or its own keep-warm jobs" restored, so the root's reading about the hook has its antecedent. |
| 8 | 41 | Applied. |
| 9 | 144 | Applied as "Broad cleanup was explicitly outside that day's pinning session." |
| 10 | 164 | Applied, with "So". |
| 11 | 195 | Applied (the first-pass sentence restored). |
| 12 | 197 | Applied. |
| 13 | 29 | Applied ("They:"). |
| 14 | 48 | Applied (the first-pass account restored, then "They:"), plus "In the same turn" and "restated" restored. |
| 15 | 316 | Applied ("the owner:", and the full stop). |
| 16 | 100 | Applied. |
| 17 | 214 | Applied. |
| 18 | 216 | Applied. |
| 19 | 248 | Applied (both halves). |

The reader's ten near misses were all applied: 30 ("no longer", "Said after"), 72 ("Substantial"), 96 ("The owner asked to keep"), 247 ("They warn"), 306 ("A standing ask"), 123 (the two unanswered questions), 66 ("high agency"), 43 ("of the last point"), 211 ("one more reason"), 131 (the full stop).

## Whose instruction it is

The first paragraph now says: "An instruction that follows a quotation without a label is the root's reading of it; the owner's words are those in quotation marks." It adds that a "How to apply" reading is the root's too.

"So" was restored where the instruction goes beyond the quotation: 163, 164, 309, 173, 123, 310, 311, 29, 27, 169, 191, 135, 161, 159, 197, 48 (twice), 36, 37, 171, 140, 141, 174, 223, 226, 224, 225, 220, 168, 172, 50, 52, 131, 142, 150, 160, 264, 205, 206, 256 (twice), 128, 84, 127.

Elsewhere the subject or attribution was restored where the first pass had one:
- 62: "The lead should choose".
- 90: "They expect … and suggest".
- 138: "the agent should".
- 204: the look "is the look to keep and extend".
- 203: "What the day showed beside it".
- 212: "Standing practice:".
- 233: "they prefer".
- 245: "They warn".
- 38: "The agent's part is".
- 151: "the deliverable is".
- 222: "The root answered that".
- 318: "the root links".

Where a quotation follows the root's own action, the speaker is now named: 29, 48 and 316 ("They:" or "the owner:"), and also 27, 191, 199, 206, 256 and 311 ("they:").

## First paragraph

- The ordering sentence now reads as the root asked, plus ", and a Copilot-era entry stands beside the later stance it led to".
- "copying the passage that applies" is restored.
- "three 'same turn' references that pointed at the wrong turn were corrected, now as links".

The file was made to obey the ordering sentence where the reader found it did not:
- "What the tool has to serve" is now one list, newest first (54, 9, 11, 146, 19). The three paragraphs became bullets, with bold leads of the root's (9, 11) and the old clause for 19.
- Deciding/"The designer's eye" now has 25 (2026-11-18) first.
- "How they answer" is newest first (164, 309, 304, 112, 111, 108).
- "Pushback" runs 109, 294 (re-affirmed 2026-10-01), 117.

## Moves

- "Code written to be read" (144, 230, 250) is now a `####` group in the conduct part, after "Code"; the Formatting part no longer has it.
- 315 went to Pictures, after 43.
- 297 went to the product section, first. The Copilot section now holds only its note and a closing sentence.
- 127 went beside 131 in "Look, then protect".
- 300 is split by item, each part with its own date and source line:
  - "Input left, output right" goes to the outer scale, after 252;
  - "not responsive", "Omnisearch" and "Settings sticky" go to "Interaction and orientation";
  - "An entry-point artifact" goes to the product section.
  The build checks the split block as one, so no quotation or source line of 300 can be lost.
- 211 and 212 went to "Time spent proving".
- 28 went to "The startup read", after 36.
- 122 went beside the vendor-neutral path; that group is renamed "AGENTS.md and skills".
- 252 went to "The outer scale and the World Map".

## Replaced stances and tensions

- 120: worded as the reader proposed. "this 2026-09-27 stance is replaced: qualified on 2026-10-01 by the entry before, and asked for by name on 2026-10-08, later in this entry, which governs".
- Port 8900: noted at 44, 318 and 315 themselves ("the port is now the owner's own; see 2026-11-13 under Their machine"). The machine part's lead stays.
- 300 (input left, output right): marked as replaced at the outer scale by 252 (2026-09-28), which now stands directly before it.
- 124: marked out of date since 2026-10-12, when Codex removed the automatic switch, as 224 records.
- 131: marked as qualified on 2026-10-09 by 127, which now follows it.
- Two tensions are stated, not resolved:
  - 129 against the root/builder pattern (2026-11-06) and the 2026-11-18 rule that builders write the code.
  - 56 against 82 and 296 (forever true, against revisit when the model changes).

## Declined or reworded

- 315 went to Pictures rather than "What a reply carries": its first instruction is about what is judged.
- 300 was split, not placed whole.

Nothing else was declined.

## Sizes and checks after the third pass

- Whole file: 164,976 bytes (pass 2: 161,711; pass 1: 171,559; old: 162,530).
- Telling, by `telling.mjs`: 83,465 bytes.
- `qc.mjs`: old 428 quotations, new 429; missing 0, partial 0, odd 0. The one new quotation is the 2026-11-17 entry.
- `allquotes.mjs`: 447 old quotations of any length, 0 absent.
- Quotation tokens outside quotation marks: 6 (the pointer at 34, as before).
- Old word tokens missing: 1,118 of 24,706.
- `links.mjs`: no target lost; all targets resolve.
- No repeated line, and no doubled full stop.
- Bullets: 213. That is 206 plus the four extra parts of 300 and the three converted paragraphs of "What the tool has to serve".
