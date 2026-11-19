# Ledger: reconciling direction.new.md against the old direction.md

Old text: `AI-Agent-Workspace/Memory/direction.md` (529,176 bytes). Draft: `dir/direction.new.md` (188,798). Result: `dir/direction.reconciled.md` (212,937 bytes, ratio 0.40).

## How the check was read

`memcheck.mjs` pairs straight quotes across the whole text with a 12-character minimum. A short straight quotation ("Bingo", "Next step", "okay?") fails the minimum, so the regex restarts at its closing quote and treats it as an opening one; from there to the next quote mark, the text *between* two quotations is reported as a quotation. Both texts are mostly straight quotes (1,630 in the old, 1,332 in the draft), so most of the four lists were these fragments:

- Of the draft's 89 "quotations not in the old", 87 were text between quotations; 2 were real.
- Of the old's 170 missing plus 92 partial, 244 were fragments; 18 were real.

A corrected check, `dir/work/qc.mjs <old> <new> [--list]`, pairs quotes within each line (every line of these files is a paragraph or bullet), at any length, then keeps those of 12 characters or more; it ignores quote marks inside backticks and compares with `\"` read as `"`. Neither file has a line with an odd number of quote marks. `dir/work/classify.mjs` says how many of memcheck's items are real quotations and how many are fragments. `dir/work/links.mjs` lists each lost link target with its old context.

| | memcheck before | memcheck after | corrected check before | corrected check after |
|---|---|---|---|---|
| new quotations not in the old | 89 | 98 (97 fragments, 1 real) | 2 | 1 |
| old quotations missing | 170 | 160 | 26 | 17 |
| old quotations kept only in part | 92 | 91 | 7 | 0 |
| link targets no longer cited | 227 | 64 | 227 | 64 |

memcheck's first count goes *up* because the added text adds more stretches between quotations. Each of the 17 old quotations still missing is listed below as not the owner's or covered by a fuller form, and the one remaining new quotation is listed under "not quotations". Short quotations (3 to 11 characters) were checked as well: three of the old's are missing ("Files only", a Tuning label; "cites" and "cited by", link labels whose question is answered by the owner's "I'm okay with the distinction existing", which the draft holds).

## Owner's words restored or made whole (15)

1. "worthy effort for tomorrow, perhaps, as we'll get heaps of time back" (the graphics card), under Verification › the gate's time.
2. "a couple of breakpoints" and 3. "came out funky" (2026-11-07, `symbolAnchors.ts`), in the Internals row bullet, with their picture.
4. "sufficiently solid" (2026-11-16, the close), in Replies that did not arrive.
5. "We'll run it when we hit the next dev items." (2026-10-21), in Statistics, audits and practices.
6. "Let's keep working on this until it's stable enough to integrate." (2026-10-21, easing), in Easing until still.
7. "don't implement" (2026-10-20, "admitted" by them), in the history's Their eye bullet, the old phrasing kept.
8. "the symbol buttons too when we can" (2026-11-06, read by a builder), in A priority ladder. See the judgment calls.
9. "I think the only one I might tweak a little as we approach is the blind playtester one (we may want some variants to see how efficiently we can pull off the playtests -- that kind of thing)." in Next, in place of a shorter excerpt.
10. "by default, no. Opening a sent link shouldn't cause your local settings to change." with its full stop, in A link does not carry its sender's palette.
11. "so far it's been through a systematic mechanism that tries to maximize many often-competing signals." (the draft had it without its first five words).
12. "I can't tell a big difference between them and still feel ... (and zoom level)." made one quotation again in Empty room and dead controls; the draft had split it in two. The old also holds the first sentence alone as an excerpt, which stays in the three looks bullet.
13. "I've been noticing that the 2D local map renderer ... I agree that this is unresolved." made one quotation in its old order; the draft had split it and reversed the halves.
14. "there should be a rather tremendous burst of commits beginning at the end of September 2026 and moving into October of 2026" (the draft began at "a rather").
15. “pareto-frontier-like maximum of layout legibility and truthfulness,” with its comma inside the quotation, as the old has it.
Items 12 and 13 were the draft's only joins or splits of a quotation; no quotation was paraphrased.

## Removed: a claim of the owner's voice the old text does not hold (1)

- "Their own words of 2025-12-16 put the default on "the Local Map of the Entry Point of your program"." Neither the phrase nor the date is anywhere in the old file, owner.md, ideas.md, the narrative or `.mdmd`. It may be true; if the root has it from the 2025-12-16 transcript, restore it with the transcript's line link. In its place: "Knowledge Sources informing sooner and inviting less (thin evidence, one stranger each)", which is from the old Open entry.

## Not quotations (2)

- "no wires until something is pinned": the draft quotes it as a sentence of a later design document, attributed there as an agent's reading of the owner's "the mess of wires should be gone". The old text does not hold the sentence or that provenance; it is the root's addition and is left in. See the judgment calls.
- memcheck's other 97 "new quotations not in the old" are the text between two real quotations (see above), for example `line at the connections look after a second pin ([the probe's last section](...))`, `(2026-09-26). The order was older: on 2025-12-19 the purpose was`, `. Its place at the bottom is a rule:`, `Root's held-row sketches failed:`, `; main thread or worker,`.

## Not the owner's words (13), left out

| Old quotation | Whose |
|---|---|
| "Live Documentation Dev (WSL2 graphics card)" | the devcontainer configuration's name |
| "+2 directories" | a label on the screen (with "+11 files", "+2 files", which are inside the owner's quotation) |
| "Marbles: Off / On" | the Tuning control's label, now superseded by the default |
| "nothing visibly moves" | a builder's measurement phrase; its correction is carried in the building bullet |
| "A ring's hidden neighbourhood inside a connected component is held by experiment 2's directory shells" | a sentence of the Explorer design document |
| "changed nothing the docs could see" | the step panel's words on screen (a known history defect of 2026-11-10) |
| "before it could pass" | the root's own former wording, corrected on 2026-11-08 |
| "branch-renderer / .ts" | a card header as drawn |
| "Width: references" | the legend's label |
| "SBOMs, the first iteration" | a row label of the old file's own forks table (the owner's answer in that row is carried) |
| "should a selected path retain the whole graph as faint context, or show only that path? I recommend preserving the context—the full overview needs to work either way" | the T3 diagnosis agent's question and recommendation; the owner's answer "I agree with your recommendation." is carried with the turn link |
| "write beside the code" | the proposed button's label, root's design |
| "Package Names" | a heading of the decisions log |

## Covered by a fuller quotation (8)

- "symbols with no description shown ... occupy less vertical space on their row" (old, Open) is an excerpt of the 11-13 quotation now whole in Empty room and dead controls.
- "with many different types of files (documentation, assets, tests, implementations)" (old, Open): the fuller form in The clash is "none of the screenshots help me see what a directory with many different types of files looks like (documentation, assets, tests, implementations)". **The old excerpt misquotes itself:** it drops "looks like" between "files" and the parenthesis. The fuller form is kept.
- "within reason" (old, the October 21 entry, lowercase): the root's echo of the owner's ""Within reason", y'know?", which stands whole in Which files get a Live Doc.
- "tree-sitter is the ultimate destination" (old, the October 3 entry): **the old misquotes the owner**; their words, in Oracles and adapters, are "Is tree-sitter the ultimate destination? If so, tree-sitter likely, no?"
- "we may want some variants to see how efficiently we can pull off the playtests" (old, Open): inside the whole quotation now in Next.
- "often take the nits and turn them into "those don't matter anymore". Answering design holistically is, as always, wise." (old, Open): inside the fuller quotation in Blind playtests.
- "the only conflict we need to resolve with the color version is ..." (old, Open): inside "I think the only conflict ..." in The clash.
- "I actually think the "Kept description line" is fine, ... wrap onto a new line" (old, Open): inside the fuller quotation in Descriptions when zoomed out.

## Link targets restored (163 of 227)

Turn links were restored to every stance the draft keeps, and evidence links where they document a decision in force, a trial the owner judged, or something tried and not taken. Examples: the September 30 turns 25, 26, 31, 36, 38, 39, 40, 44 and 45 in One problem across scales; the November 3 turns 1, 3, 4, 5, 6 and 8 with the four reading probes in the hover design's history; the decisions-log sections for the reward, the many-file layout, bundles and lanes, the laces, a card's rows, clicks, the search bar, one walk, entry points, every file's Live Doc, related documents both ways and the formatter; the Internals sketches (`internals-slot`, `internals-held`) and the owner's two pictures of 2026-11-07; `ideas.md#shells-and-bands-not-chosen--november-6-to-7-2026` and `ideas.md#continuous-file-perspectives--october-3-2026`; the 2026-09-27 transcript's line 1245; `board.mdmd.md` (a different file from the draft's `boards.mdmd.md`; both exist).

## Link targets not carried (64)

### Turn links whose turn holds no stance the new text carries (3)
- `2026-11-13.1.record.md#turn-1` (the owner shown two sessions' changes; no words of theirs at it in the old text)
- `2026-11-13.1.record.md#turn-6` (the old says "no owner turn": the card round's work notes)
- `2026-10-05.1.record.md#turn-2` (root's state check before the layout pass)

### Session summaries, `AgentSessionHistory/2026/*/Summarized/` (12)
`2026-11-16.1#open-ends-and-handoff`, `2026-11-15.1`, `2026-11-13.1` and `#open-ends-and-handoff`, `2026-11-12.1`, `2026-11-10.1`, `2026-11-07.1`, `2026-11-01.1`, `2026-10-30.1` and `#open-ends-and-handoff`, `2026-10-19.1#outcomes-and-open-work`, `2026-10-17.1#outcomes-and-open-work`. They set the order of past sessions; the head of the new file sends readers to the summaries.

### Work notes and gate notes in records (17)
- 2026-11-18: `#work-notes-the-first-whole-run-of-the-two-passes`, `#work-notes-the-first-whole-gate-in-the-new-container`, `#work-notes-the-session-history-round-landed`, `#work-notes-the-dependency-round-landed` (landings and gates; the evening's gate and the two-worker measurement are carried).
- 2026-11-17: `#work-notes-turn-15` (the building case first seen; the draft cites the later reading of it).
- 2026-11-16: `#the-direct-measurement-...-on-their-limits-already`, `#the-second-gate-on-the-marble-round-and-the-round-committed`, `#the-cells-trials-last-handback-...` (the probe link carries the trial).
- 2026-11-08: `#gate-five-complete-focused-observation-before-integration`; 2026-11-07: `#source-reconciliation-and-final-handover--november-8-2026`.
- 2026-10-29: `#verified-outcome`; 2026-10-21: `#assistant--delivered-turn-10-reply-recovered-2026-10-22` (the two questions put that night; both answered on 2026-10-22, carried); 2026-10-17: `#work-notes-continued-the-c1-hand-back`, `-c2-hand-back`, `-c4-hand-back` (landings); 2026-10-13: `#closure-by-the-following-session-2026-10-14`.

### Screenshots (20)
- November: `2026-11-08/Screenshots/astra-review`, `switch-motion` (the switch freeze; the `switch-cost` probe is carried); `2026-11-06/Screenshots/far-bands`, `far-zoom-review`, `shell-mesh` (the ladder's far bands and the first mesh, both superseded); `2026-11-04/Screenshots/reading`; `2026-11-03/Screenshots/README.md` (root's review); `2026-11-02/Screenshots/README.md` (estate and T3 evidence of the 3D pass).
- October: `2026-10-23/Screenshots/path-feedback` (root's playtest); `2026-10-15/Screenshots/README.md` and `#the-entry-points-in-the-knowledge-sources-panel-and-the-landing-they-decide`; `2026-10-14/Screenshots/README.md`, `#one-search-bar-...`, `#the-3d-local-maps-two-layouts-...`, `#the-destination-field-offers-only-what-connects-...`; `2026-10-13/Screenshots/README.md` and `presets/README.md` (Compact/Relaxed, replaced by Local/Whole); `2026-10-05/Screenshots/README.md`. All are pictures of a landing whose decision is carried by its decisions-log link.

### Probes (8)
`2026-11-09/Probes/reading-verification`, `2026-11-08/Probes/defaults-verification` (gate verification); `2026-11-02/Probes/e2e-speed` (the one-worker rule's numbers, rule since lifted); `2026-10-29/Probes/t3-freeze/README.md#direct-renderer-trial`, `draw-cost.json`, `sustained-progress.json` (measurements under the T3 turns, which are carried); `2026-10-24/Probes/connections-tuning` (root's tuning by eye, overridden by the owner's defaults); `2026-10-13/Probes/local-map-feedback`, `layout-presets` (Compact/Relaxed, replaced).

### Research (2)
`2026-11-04/Research/theo-ui-hill-climbing.md#november-4-follow-up-for-this-workspace` (the rubric; the file itself is cited); `2026-10-27/Research/t3-code.md`.

### Other (4)
- `../../.mdmd/layer-3/change-over-time.mdmd.md` without an anchor (covered by its `#decisions-so-far` and `#current-delivery-and-remaining-work`).
- `../../tests/e2e/card-ladder-boxes.spec.ts` (a test of the ladder, which is to be deleted).
- `https://github.com/jfjordanfarr/Live-Documentation/actions/runs/39280661169` (one CI run of the hosted history, 2026-10-19).
- `#open-with-the-owner` (an in-file anchor from the old Next; the heading is kept).

## Facts the draft lacks (from Next, Open with the owner, Decisions in force)

Added to the reconciled draft (sure):
1. **Decisions › A case red because the product is slow:** the third clock-bound case since 2026-11-17, `force-graph-reveal.spec.ts`'s membership change, given both bounds. Added to Verification.
2. **Open › The full zoom-out as Flow's look:** a symbol pinned by name stays drawn under its file's name at files only. Added to the zoom's Now.
3. **Open › Descriptions when zoomed out:** "Whether descriptions should instead be asked for from the start is a larger fork the owner has not been put"; the "always" values keep a line on all fourteen rows and cut twelve names; the premise differs from the default's. Added as "Not yet put to them".
4. **Open › A colour system for a file's kind:** implementation is two thirds of the files and its strength fell to a seventh; no vivid colour for implementation keeps the floors (only a pale lilac, dark greens, ochres, one dark blue); Night and Day's choices (implementation cool grey, tests violet, documents paper yellow, floors cleared for red-green vision); "Vivid kinds" as their lean in a form that passes (`#0c84fa`, `#0a8e00`, roles `#1bc3f3`, `#24fcba`); a test and a hub 2.5 apart under protanopia; the 2D cards already draw a test violet; the 3D key lacks rows for kinds only inside bags.
5. **Open › colour:** a faded marble goes plain only if a frame's cost asks.
6. **Open › Beyond the hops:** "Next step" draws a membrane for two or more files of a directory and a lone file as itself.
7. **Open › What a newcomer sees first:** where no board exists, Knowledge Sources informs sooner and invites less.
8. **Next 2 / Open › ladder or looks:** a few narrow cards are cut to an ellipsis; a fold or restore changes height only by the person's act; root's owed measurement in place of the motion block's formulas; the owner's praise of the looks trial's links and motion was not the choice.
9. **Open › Cells for undrawn files:** for their eye also, the marks taking the path's remnant at the connections look.
10. **Open › still pointer:** the busy state's correction (the shells glide below a pixel a frame; busy state roughly honest; the glide is what is slow).
11. **Open › Both blanks:** writing beside the code is gated in Chromium by the browser's own write-permission prompt; the CLI stays the path that writes on purpose.

Corrections of meaning found while there (the draft said something the old does not):
- **One problem across scales:** "directories closed on first encounter" stood under "Tried and unsuccessful". In the old it is the owner's requirement ("Directories must be closed on first encounter"). Fixed.
- **The machine:** "opened the folder "**normally**"". The owner asked *how* to open it "**normally**" and fast. Fixed.
- **The history's standing ask:** "640 commits took about 32 minutes on three workers". The old says 531 of 640 were done at about 32 minutes, with the phases not separated. Fixed.

Not added (judged telling, superseded or done):
- Next 1, 3 and 6: gate counts, red cases by name, commit hashes, "Two workers hold", the 74-against-107-minute gate. Next 4: "through the Windows mount" (the copy has moved).
- Open › Cells for undrawn files: root's design calls before the trial (a directory not drawn as a small folder of cells; a large directory fading its cells, the exact count in the hover; cells quieter than cards). The trial superseded them.
- Open › Rings: whether the 3D key's More connected row goes or stays with the mend. The old leaves it with the mend, and the mend's notes are linked.
- Open › Changed Files mode: root's observation that Glow's white dots are small at the overview and Both reads most plainly (Dim is now the default).
- Open › colour: "What a round would need first" (the tidepool sample now exists). Open › Whether a picture is chosen as it stands: the `localMapStill` measurement (three cards, 192 crossings for 190).
- Old Next 0: "the reader's Dependencies grouped by file" (the draft records it fixed on 2026-11-12).

## Judgment calls I was unsure of

1. **"the symbol buttons too when we can"** (old, 2026-11-06): "the builder's reading of "the symbol buttons too when we can"". The words read as the owner's, quoted by the builder, but the old text does not say so. I kept them as the owner's: "a builder later read "the symbol buttons too when we can" as the Pin held beside More through the middle band (2026-11-06)". If they are the builder's own, they can go.
2. **"no wires until something is pinned"** is kept although the old text holds neither the sentence nor its attribution to a design document. It does not claim the owner's voice. The root should confirm its source.
3. **The 2025-12-16 sentence** was removed (see above).
4. **"worthy effort for tomorrow ..."**: the old gives no date. "Tomorrow" suggests 2026-11-16. I placed it undated beside their 2026-11-17 ask.
5. **The one-worker rule's date:** the draft says 2026-10-18; the old Next said 2026-10-19; the old dated entry is headed October 18 and links Turn 12 of the October 17 record. I left 2026-10-18.
6. **The colour table round** "in flight on 2026-11-16": I could not tell from the old text whether it landed. Written as in flight that day.
7. **What the product is:** to make the quotation whole, the lead-in changed from "Two interests are certain: ... Beside it: ..." to "Two interests are certain, and what it is stays open: ...". This is the old's order of the owner's sentences.
8. **Owner stances from the dated record without quotation marks**, carried with their links: GPT-6.1 Sol named for the hill-climbing subagents (2026-11-04, Turn 7); the stewardship pass's Turns 14 to 17 (2026-10-19); the forks of Turn 18 ("inclined to agree ... asks for enough context"); on 2026-10-07, open ends leaning on the recent. They are reports, not quotations.

## Unfinished

- Step 4 covered the old Next, Open and Decisions sections entry by entry. The dated record (old lines 144 to 475) and the September sections were checked only through the quotation and link lists, not read entry by entry for stances without quotation marks. Some may exist, for example the owner's naming of "absent Force Graph focusing on a file" as a standing defect (2026-10-01, Turn 44 of the September 30 record), which is probably long mended.
- memcheck itself is unchanged. Its counts will stay dominated by fragments until its pairing is fixed; `dir/work/qc.mjs` is a corrected form.

## The five readers' lists applied (2026-11-19)

Result: `dir/direction.patched.md`, 231,849 bytes (ratio 0.438 of the old). `direction.reconciled.md` is left as it was.

Every item was checked against the old text before it was pasted. The readers' sentences were mostly taken as given; where they were reworded, the list below says why.

| | reconciled | patched |
|---|---|---|
| corrected check: new quotations not in old | 1 | 1 ("the Local Map of the Entry Point of your program", the owner's of 2025-12-16, now sourced to the transcript's line 1339: a gain over the old) |
| corrected check: old quotations missing | 17 | 15 ("changed nothing the docs could see" and "Package Names" now carried; the 15 are those listed above as not the owner's or covered by a fuller form) |
| corrected check: old kept in part | 0 | 0 |
| link targets no longer cited | 64 | 61 (the e2e-speed probe, the connections-tuning probe and `t3-freeze/README.md#direct-renderer-trial` restored) |
| memcheck (fragment-ridden) | 98 / 160 / 91 / 64 | 103 / 153 / 96 / 61 |

### Applied, by reader

- **A (Next, Open, Decisions): 18 applied.** All 15 weaker items, the changed date, and misleading notes 3 and 4. Note 3 was that Next's "47 minutes … from about two hours" mixed the whole gate with the browser stage; it now gives 41.9 minutes for the browser stage at two workers against about two hours before the card, and 47 minutes for the whole gate. Note 4: "Slow, not broken" is now marked as the failure message's own words, root's. The workers' price, `@alone` and the owed distinction are under Workers; the five cases on their limits, the 320 frames, and the two history-scrubber cases that passed on the evening of 2026-11-18 are under the red-stays-red bullet and the renderer's lesson.
- **B (old lines 144 to 257): 17 applied.** The known-and-left history defects; the pedagogical bridge's provenance (in How design questions and in The long read); the distribution ruling and the backup warning; the coverage cause; the kernel-time count at Next 4; "sends anything long"; the `rankBranches` cause; a short address leaving Tuning; the churn blind spot; the step panel's pause and the 320 px rule; the looks' transition defects; the camera cause, in Next 4 and in Structure; the browser-wait audit's conclusion; why the held-row sketches failed and what C was; where the 2D search spends its time; the in-between rung; the consolidations' two minutes.
- **C (lines 258 to 359): 17 applied.** All 12 weaker items and all 5 misleading notes. The gravity figure is corrected: gravity 0.025 is checked in `local-storage.ts`, and 0.2 is Group Separation. The standing 3D defaults are named as root's of 2026-10-24. The memory design the owner called "Very reasonable" is spelled out, and Next 6 now points to it. The T3 renderer's numbers come with the t3-freeze probe link. "T3's interactive 3D has not been reviewed" now reads as a review owed since the direct renderer. "Standing grant" now reads as the grant for that pass.
- **D (lines 360 to 474): 13 applied.**
  - The probe's values marked as not adopted, with its reasons, its answer on framing (also added to Small questions), and the values the owner called "solid".
  - The forward-links limit.
  - The phone target sizes.
  - The owner's challenge to retiring `--changed`.
  - The date of "quick mysery" (2026-10-16, Turn 3 of the October 16 record).
  - The three rules read from their words.
  - The October 14 tray observations, added to Small questions.
  - The ancestor labels' warning.
  - The parking lifted on 2026-10-13.
  - "the Centre action's motion".
- **E (lines 475 to 590): 29 applied.** All 23 weaker items and the six misleading notes:
  - line 165's "no wires" reworded, per the root's ruling (below);
  - lines 139 and 141 now name root's standing reading;
  - line 290: the viewer-first order is root's;
  - line 173: "Deepest level available" was put back to the owner and never confirmed;
  - line 297: the package renames are done;
  - line 64: the December ratchet named.

### Changed in wording (8)

- **B238, the in-between rung:** pasted without quotation marks. The old text reports it without quoting the owner, so the reader's quotation marks would have claimed the owner's voice.
- **E479, the animated re-layout:** "in game-frame-like time" without quotation marks; the owner's own quotation with those words stays in the rows bullet.
- **E480:** the reader wrote that the lanes' rigid slots were "mended the same day". The old direction.md says only "proposed as the next pass". The decisions log does record "A Lane Is a Box of Free Slots _(Recorded 2026-10-06)_", so it is written as answered that day, citing the decisions log.
- **D366:** the reader dated "too tight" 2026-10-18. The old (line 366) says "of October 17", and the draft's bullet is dated 2026-10-18 from its turns. The sentence refers to "the picture they had found too tight (above)" without a date.
- **E506:** "symbols pinned on at least two files" (the old says "nodes"; in 2D a node is a file's card).
- **C262:** merged into the existing sentence on the card rather than pasted as two.
- **A3:** the four-worker cost is dated 2026-11-17 from its place in the old Next; the old gives no date of its own.
- **C misleading 4:** "root's, accepted by the owner with the plan of 2026-10-30".

### Declined or left (6)

- **D366's "(still so on 2026-10-23, [the plan's C5])":** not in the old direction.md, and I did not check the plan. The values the code stores now (`local-storage.ts`: gravity 0.025, spring 0.5, tether 0.02, update energy 1, Group Separation 0.2) are given instead, with whose they are.
- **A misleading 2,** `force-graph-building.spec.ts:66` mended in `a91d7f89`: left to the root as instructed; Next item 1 is unchanged.
- **A misleading 1,** owner.md line 313 still says the browser tests run one at a time: outside this file. owner.md needs the lift of 2026-11-17 recorded.
- **A misleading 5,** the Explorer design says Hops Shown is "two by default" (near line 228); the code and this file say 1: outside this file.
- **E's note** that "really impressed" is dated by its turn and not by the day it was said: the reader judged it harmless, and it is left.
- **D's "Centre action's motion":** applied, but it could not be checked against the old text, which holds no source for that line. The draft's Small questions line on the first visit came from elsewhere.

### The root's rulings on my judgment calls, as applied

- **"the symbol buttons too when we can":** the owner's, from Turn 9 of the November 5 record, line 327. Their full sentence: "Making an adjustment to a node (perhaps just at the node level if we're talking prioritization, but the symbol buttons too when we can) should be no more difficult at great distances than it should be close up." The file keeps the old's form with its ellipsis and says the words it leaves out include theirs "the symbol buttons too when we can", which a builder read on 2026-11-06 as the Pin held beside More.
- **"no wires until something is pinned":** quotation marks and the claimed source removed. The sentence now says only what old line 74 supports: an opened directory's cards stand unwired until a pin, an agent's design of 2026-10-07 the owner was never asked about.
- **The Entry Point quotation:** restored exactly from `2025-12-16.1.md` line 1339, linked `#L1339`.
- **The one-worker rule:** "their rule of 2026-10-19 (about 00:08 UTC, the owner's evening of October 18)".
- **The colour table:** landed 2026-11-17 as `c92740ea` (00:34 UTC), `palette.ts` with `palette.test.ts`; the commit says the test fails on any colour literal elsewhere in the client.

### Size

The patched file is 231,849 bytes, about 19 KB more than the reconciled draft and under the 260 KB limit. A's list was complete when the other four were done and is applied above.
