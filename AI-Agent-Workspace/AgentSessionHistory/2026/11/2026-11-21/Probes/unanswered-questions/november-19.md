# Narrowed: C, the session record of November 19, 2026 (ran to 01:02 UTC on November 21)

Read whole: entries-C.md (all 246 entries, 8 files); owner-messages.md (all 2,414 lines, every day); owner-answers-2026-11-21.md; direction.md lines 1 to 101 and 413 to 421, plus keyword searches; the November 19 summary's Turns 19 to the end; the packet index; record lines 746 to 805 and targeted searches. Code checked: `local-storage.ts:101` (settleHold 0, beyondHops "everything"), no `lateMoves` in `packages/explorer/src`, `.nvmrc` 26, `package.json` Playwright `1.61.1` exactly with the Dependabot hold, `packages/` holds no `cli`, `.claude/` holds no settings file, `browser-lane.mjs` has one queue, `.live-docs.config.json` names the old `ChatHistory/` layout, `press-landing` is not merged into `main`. No git command was refused.

## Counts
raw entries read: 246; distinct items: 104; by status: OPEN 19, DEFAULT-TOOK-EFFECT 20, DEFERRED-BY-OWNER 0, ANSWERED 24, SUPERSEDED 11, NOT-A-QUESTION 30; unsure: 4

**Stale lines found in direction.md** (it contradicts itself or today):
- Line 21 lists three questions as "asked on 2026-11-19 and not answered": the linked server's piece, SQL catalog names, a doc for every picture. All three were answered in Turn 16, and lines 70 to 73 already record those answers.
- Line 21 also says "Not yet known: what may leave that machine", which was answered today. It says "Not yet asked: which of these shapes", but that was asked at 19:00 on November 19 and again at 03:59 on November 20.
- Line 64 lists "whether they want the single-file test page" as unanswered. Turn 7 answered it.
- Line 88 says every brief "opens with the owner's rule, a refusal means stop and report". At 14:30 on November 20 root told the owner the opposite: "You did not say it." The rule is the harness's.

## Still waiting (OPEN, DEFAULT-TOOK-EFFECT, DEFERRED-BY-OWNER)

### The packet for the owner's eye: twelve questions, alternatives built for five
- status: OPEN (each line below). These are not deferred: the packet is the form the owner asked for at Turn 40, and none of the twelve has been answered.
- kind: look-and-feel
- first put: as eleven questions in root's reply to Turn 1 (Nov 19), then as twelve at 03:59 UTC on Nov 20; repeated: about 20 times, last in the summary's table at the close
- root's words: "The packet: twelve questions with pictures and links, and alternatives built for five. Settle Hold (3D, question 1) decides the other red case."
- what stands: today's behaviour on every line. Root's recommendations change a default only on the owner's word, and the trials sit on branches (2D `1e80abce`, 3D `31ebab24`, search-stop `f9fadb75`), none on `main`.
  - 2D 1, should the camera follow what is pinned: root recommends Follows Pins. On `main` the default is By Hand (Tuning → 2D Layout → Framing).
  - 2D 2, the page without its sidebar: root recommends Bare as the default, and yes to the builder's three choices. On `main` the default is Sidebar.
  - 2D 3, Tuning's reset arrow: root recommends keeping the arrow and count as drawn. That is what is on `main`.
  - 2D 4, the history bar's mark for a step off the zoomed range: root first recommended an outward arrowhead. After seeing the alternatives it owned that rule as wrong and recommends the thumb past a break with its date. Today's mark stands.
  - 2D 5, where a gathered line ends when rows are shown: root recommends at its own row. This waits for the search-stop rule; nothing built.
  - 2D 6, one hidden file drawn as a cell: root recommends cells on the name's line when they fit, else beneath. A trial only.
  - 3D 1, Settle Hold: root recommends 0.02. On `main` it is 0. This holds `force-graph-discovery.spec.ts:70` red, and `force-graph-update.spec.ts:140` waits on it too.
  - 3D 2, the pointer's rest in both maps: root recommends one rule, "Touch, then rest". A trial only.
  - 3D 3, `tests · 556` and Drawn Files: root recommends a trial lever, with the default of 1,024 kept "until a built-in card is measured, which only the owner's work machine can show". Today's answer bears on this: "Absolute crap VM. No idea on graphics card".
  - 3D 4, Beyond the Hops: root recommends "Next step". On `main` it is "everything".
  - 3D 5, the palette at first open: root recommends "Vivid kinds". Today's palette stands.
  - Search-stop 1, when the 2D map stops rearranging, and whether a late better arrangement is applied, dropped or offered (the Late Moves lever): the stopping points measured were 46 s, 55 s or today's 73.7 s, at 0.06%, 0.01% or 0% worse. On `main` today's rule stands and late moves are applied; the lever is not on `main`. Related, and not an answer: on Nov 15 (Turn 14) the owner said of the first rearrangement, "Totally worth it for a better layout!"
- on direction's list: yes (lines 60 to 64)
- raw entries merged: C1#4, 5, 15, 21, 27, 29, 40, 41, 42, 44, 46, 58, 64, 65, 70; C2#4, 16, 21, 26, 39; C4#3; C5#3

### Open, close and pin as one model, and which Back (this absorbs the undo question)
- status: OPEN
- kind: product meaning or behaviour
- first put: undo first at Resumption on Nov 19, then the 18:45 to 19:11 messages; the proposal itself at 04:25 UTC on Nov 20; repeated: about 15 times, last in the summary's table
- root's words: "When you have read it, I need two things: whether the three-state model is the one to build as a trial, and which Back you want tried. ... My recommendation is that Back steps between views and pages of the reader, and everything done to the picture belongs to Undo."
- what stands: nothing built. Back takes back a place, not an act. The owner weighed the second history in Turn 16 (pros and cons) without choosing, and asked for a holistic redesign. That redesign is this proposal (`Probes/open-close-pin/README.md`). It absorbs their September 30 words, "split out the pinning history from the navigation history", the lever for how many unpinned things stay open, and the leftover fork of a sphere's buttons staying under the pointer.
- on direction's list: yes (lines 69, 87)
- raw entries merged: C1#6, 22 (part), 47, 49, 65 (part); C2#40; C3#1, 2, 8, 9, 10, 11, 12; C4#12 (fork); C5#6, 26

### Which shapes the work code has most of (and whether scripts that run their own procedures should move SQL up)
- status: OPEN
- kind: product meaning or behaviour
- first put: 18:45 to 19:11 UTC on Nov 19 ("three questions put to the owner"); repeated: 3 times, last at 03:59 UTC on Nov 20
- root's words: "which shapes it has most of (scripts calling each other's functions, scripts running SQL, user controls, procedures named from C#)"
- what stands: the readers are ranked by root's own order. Today's answers describe the estate (two git websites, TFS for on-prem work, scans at solution level) but do not rank the shapes.
- on direction's list: partly (line 21 says "Not yet asked", which is wrong)
- raw entries merged: C1#48 (part), 56; C2#47 (part)

### Where the Explorer for another folder is built (the builder recommended `dist/maps/<folder name>/`) [unsure]
- status: OPEN [unsure]
- kind: product meaning or behaviour
- first put: Turn 2 quote of root's question (Nov 19, 19:56 UTC message); repeated: 3 times
- root's words: "Where should the Explorer for another folder be built? Today it overwrites this checkout's dist/explorer. The builder recommends dist/maps/<folder name>/, with this repository's own staying where it is. I agree"
- what stands: still overwrites `dist/explorer`; no `dist/maps` anywhere in the code. In Turn 2 the owner asked back what format suits a World Map of many scans. At 21:22 root reframed it as "one Explorer for a board, not for a folder". Today's answers ("each world map object is a recursively scanned directory"; "Each copy of Live Documentation Explorer should be capable of writing a new fresh blank copy") may make the folder question moot.
- on direction's list: yes (line 21)
- raw entries merged: C1#8, 61 (part); C2#7

### Documents as nodes: whether an unlinked document is drawn, how a document looks in 2D, and what the switch keeps out
- status: OPEN
- kind: product meaning or behaviour
- first put: 00:34 UTC on Nov 20; repeated: 4 times
- root's words: "Should a document nothing links be a node? My recommendation: it gets an entry like every scanned file, and the maps treat it as they treat any other file that connects to nothing."
- what stands: nothing built. In Turn 16 the owner asked this same question back and settled only the principle of the switch ("Folks should be able to configure what file formats and paths they scan"). Root's reading, "Kind is then only a colour and a switch", is not built either.
- on direction's list: partly (line 72 has their counter-question and "to be measured", but not root's recommendation awaiting a yes)
- raw entries merged: C1#23; C2#32, 44; C3#4, 5

### More than one physics step a frame, so a 3D picture settles in fewer frames
- status: OPEN
- kind: look-and-feel
- first put: 05:54 UTC on Nov 20; repeated: 3 times
- root's words: "The physics could take more than one step in a frame that has time to spare. ... That changes how the map feels, so it is yours to choose; I'll bring it as a lever you can try."
- what stands: one step a frame; no lever built
- on direction's list: yes (line 90)
- raw entries merged: C4#2; C5#2

### What a scan does with a submodule's files, with nested repositories, and whom to trust
- status: OPEN
- kind: engine and correctness
- first put: 06:56 UTC on Nov 20; repeated: about 9 times, last in the summary's table
- root's words: "Git will answer inside a submodule whose owner it doesn't trust, by naming the git folder directly. ... Until you decide otherwise, such files are unjudged and warned about."
- what stands on `main` since the landing at 22:09 UTC on Nov 20:
  - Submodule files are scanned, each judged by its own repository's git.
  - Where that git will not answer (an owner it does not trust, a configuration it cannot read, the Windows case-folding case), the files are left unjudged and the run warns.
  - Repositories nested in a workspace that is itself no repository are asked. Root chose to fix this rather than narrow the docs: "One ruling you may want to overturn".
  - A file a submodule tracks can be judged ignored by an ignore rule.
- on direction's list: yes (line 89)
- raw entries merged: C4#4, 9; C5#9, 17 (part), 18, 20, 21, 25; C6#2, 6

### Whether anything should be re-examined after refused commands were reached another way (and root's reading of each case)
- status: OPEN
- kind: process and workspace
- first put: 11:32 UTC on Nov 20; repeated: about 8 times. Root also put its own readings case by case and asked "If you read it differently, say so": the builder's Node install (Nov 19, 19:18), the drafts written with the file tool (08:08), the depth probe (14:11), the tree builder's probe (14:25) and the reviewer who went through the lane (15:37).
- root's words: "Decision for you: do you want anything from that builder re-examined or redone because of this?"
- what stands: nothing re-examined. The briefs now tell a builder to run plain commands one at a time (in AGENTS.md). Turns 19 and 20 asked where the refusals come from and gave no verdict.
- on direction's list: yes (line 88, though it misattributes the rule to the owner)
- raw entries merged: C1#54; C4#6, 7; C5#13, 19, 24, 28, 29; C6#3

### Reading that does not depend on how deep a file nests
- status: OPEN
- kind: engine and correctness
- first put: 14:00 UTC on Nov 20; repeated: 3 times
- root's words: "The full cure is reading that does not depend on stack depth at all; that is a design for the whole generator, and I will bring it to you rather than build it tonight."
- what stands: not designed or costed. The history runs a fresh process for each commit.
- on direction's list: yes (line 91)
- raw entries merged: C4#8; C5#22

### Whether this repository's history may use `--keep-workers`, and whether to build the checking process that would make kept workers sound
- status: OPEN
- kind: engine and correctness
- first put: 19:51 UTC on Nov 20; repeated: 4 times
- root's words: "may this repository's own history be made with `--keep-workers` ... And should I build the sound version next: a small checking process, run without the optimizing compilers, that parses each file once?"
- what stands: one fresh worker a commit by default. The flag is off, and its code stays on `main` with the depth check, serving only the flag (decisions log, 2026-11-20).
- on direction's list: yes (line 92)
- raw entries merged: C7#6, 8, 14

### A file nested near the stack's limit has no single reading: refuse it by a fixed rule, or run the summarizing processes single-threaded?
- status: OPEN
- kind: engine and correctness
- first put: 20:31 UTC on Nov 20; repeated: 3 times
- root's words: "Should a file at the stack's edge be refused by a fixed rule?"
- what stands: the cache keeps whatever the first run produced. Neither way is measured.
- on direction's list: yes (line 93)
- raw entries merged: C7#4, 9

### Must a press return "at once" whatever the picture's size?
- status: OPEN
- kind: product meaning or behaviour
- first put: 19:21 UTC on Nov 20; repeated: 3 times
- root's words: "should a press return \"at once\" whatever the picture's size?"
- what stands: the bound is unchanged and the case is red on `main`. Root is building to "any size": the mend is on `press-landing`, not merged, and it makes the transition's first frame later.
- on direction's list: yes (line 94)
- raw entries merged: C7#5, 10

### What an `exclude` pattern means (`**/x/**` misses a top-level `x`; `?` is unescaped)
- status: OPEN
- kind: engine and correctness
- first put: work notes at about 17:08 UTC on Nov 20, put to the owner at 22:14; repeated: 3 times
- root's words: "Should `exclude` patterns behave as ordinary globs?"
- what stands: both behaviours left as they are
- on direction's list: yes (line 95)
- raw entries merged: C7#3, 11

### Should the timeline show "not read at this commit" where a file could not be mapped, instead of a removal and a return?
- status: OPEN
- kind: product meaning or behaviour
- first put: work notes under Turn 20, put to the owner at 15:52 UTC on Nov 20; repeated: 2 times
- root's words: "The timeline itself still shows an unread file as removed at that commit and back at the next. Showing \"not read here\" instead would change the stored timeline format and what the Explorer draws, so I have left it for you to decide."
- what stands: shown as removed, then back. Two list files tell the cases apart.
- on direction's list: **no** (it is only in the summary's table; it dropped off direction)
- raw entries merged: C6#8; C7#1

### The history takes a parent's summary where nothing the scan reads changed [unsure]
- status: OPEN [unsure]
- kind: engine and correctness
- first put: work notes under Turns 21 to 23; told at 22:49 UTC on Nov 20; repeated: 2 times
- root's words: "The history could reuse a parent's summary when nothing it reads changed, about three fifths of a rebuild. It is an idea only and would need its own review."
- what stands: not built. It is ranked in Next (line 9).
- on direction's list: yes (line 80)
- raw entries merged: C7#18; C8#13

### One digest at each landing, decision or fault, instead of a message for every handback
- status: OPEN
- kind: process and workspace
- first put: work notes under Turns 21 to 23; put at 22:49 UTC on Nov 20; repeated: 2 times
- root's words: "I report too often while you're away... I'd send one digest per landing, decision or fault of mine."
- what stands: no rule written. "digest" appears nowhere in AGENTS.md or the recording convention.
- on direction's list: yes (line 81)
- raw entries merged: C7#19; C8#10

### Two kinds of hold in the browser lane (a quiet one for timings and the browser, a plain one for correctness tests)
- status: OPEN
- kind: machine and environment
- first put: as above; repeated: 2 times
- root's words: "One queue for everything... I'd keep an exclusive hold for timings and the browser, and let plain correctness tests run alongside each other."
- what stands: one queue (`scripts/browser-lane.mjs`)
- on direction's list: yes (line 82)
- raw entries merged: C7#20; C8#11

### The owner's exports filed once, at the close [unsure]
- status: OPEN [unsure]
- kind: process and workspace
- first put: as above; repeated: 2 times
- root's words: "Your exports. Each save is a prefix of the next, and I hashed and filed every one. I'd file once at the close."
- what stands: unknown whether the practice changed. The November 19 close filed one export.
- on direction's list: yes (line 83)
- raw entries merged: C7#21; C8#12

### The design system's fifteen forks (carried from November 18)
- status: OPEN
- kind: look-and-feel
- first put: Nov 18 record (00:16 to 00:41 UTC on Nov 19); carried at 03:59 UTC on Nov 20 and in the summary's table
- root's words: "the design system's fifteen forks, each with my recommendation."
- what stands: the documents describe today's product; no fork applied
- on direction's list: yes (lines 27, 60)
- raw entries merged: C2#51

### Does "never rewrite a commit" cover redoing a merge on a scratch branch a minute old?
- status: DEFAULT-TOOK-EFFECT
- kind: process and workspace
- first put: work notes on the proof branch; told at 18:11 UTC on Nov 20; repeated: 3 times
- root's words: "I redid one merge on a minute-old scratch branch because its message claimed too much. Do you read \"never rewrite a commit\" more strictly than that?"
- what stands: root's narrower reading (the rule protects commits the owner might already have). AGENTS.md is unchanged. Today's git answer does not address this. It does say they personally "merge ... without squashing or rebasing".
- on direction's list: **no** (only in the summary's table)
- raw entries merged: C7#2

### A deny rule for `git push`, and allow rules the owner could add
- status: DEFAULT-TOOK-EFFECT
- kind: machine and environment
- first put: 14:30 UTC on Nov 20 (the reply to Turn 19); repeated: once
- root's words: "The documentation says a hard guarantee needs a deny rule. Whether to add one for `git push` is your decision; I have not touched any setting."
- what stands: no setting; `.claude/` holds no settings file. Root pushes nothing by its own practice.
- on direction's list: **no**
- raw entries merged: C5#34, 35

### Root's calls told to the owner, never answered, standing today (each its own item, each DEFAULT-TOOK-EFFECT)
Each line gives the call, then its kind, then where it stands today, then whether direction.md carries it, then the raw entries.

- **A real history failure on Pages deploys the site, then ends the run red.** Process. Stands as chosen. Direction: yes (line 62). C1#33; C2#48.
- **A C map does not draw "uses a definition" links**, ranked low. Engine. Stands as chosen. Direction: yes (line 99). C1#34; C2#49.
- **The two archive filing calls** (the Antigravity captures, and two exports refiled to their day). Process. Stand as filed. Direction: no. C1#35; C2#50.
- **The guide's corrected sentence on filename case** (`ff3a5d40`). Process. In AGENTS.md. Direction: no. C1#11, 59.
- **"Here" means the nearest folder upward holding `.live-docs.config.json`.** Product. On `main` via the engine round (`86ba38c3`). Direction: no (line 21 records it as a ruling). C1#60; C2#9.
- **A group of small visible choices:** titles and `Code Path` in code spans (on `main`, 1,091 docs moved); `~/` with no link when two web projects hold a path; a table made in a procedure's body; a plain small label for a docstring's heading. Engine and look. The `~/` rule is on the .NET branch `32d03c79`, not `main`. Direction: no. C1#17; C2#6, 26 (part).
- **The names' rulings:** one form for each value; no older form read (run `generate` first); control characters and line separators quoted; the CommonMark parser as oracle. Engine. Engine round. Direction: no. C1#55, 66.
- **The script-entry rule withdrawn on a measurement**, replaced by today's rule read through a tokenizer. Engine. Engine round. Direction: no (line 34 records it). C1#45.
- **PowerShell "loaded, else unique"**, a library script is not a program, a manifest read as a barrel. Engine. On branch `29b3bb24`, not `main`. Direction: no (line 21 records it). C1#57.
- **A partial class's halves link only where one names a member the other declares**, with the host configuration and procedure forks. Engine. On branch `32d03c79`. Direction: no. C1#63, 69.
- **The configuration names the archive's old layout too, and `bundleExclude` is out of the cache key.** Engine. On `main` (`.live-docs.config.json` lines 10 and 11). Direction: no. C1#38.
- **Playwright held at exactly 1.61.1** until newer Chromium reaches the graphics card. Machine. In `package.json` and `dependabot.yml`. Direction: no (line 16 cites it, not as a question). C4#5; C5#8.
- **A sphere's buttons go with their sphere**, except under the pointer or an open menu (the keyboard half dropped). Look. On `main` as `7997ffdd`. Direction: no. C4#12; C5#5.
- **The history key narrowed to what the summarizing code can load; `core.ignorecase` keyed; the installation compared with the lock.** Engine. Landed 22:09 UTC on Nov 20. Direction: no. C4#10; C5#15, 30; C6#5.
- **The scan's rulings:** judged by git's own listing; an ignored folder never read; adapter caches scoped to a run with the workarounds deleted; the sixth round's rules. Engine. Landed 22:09 UTC on Nov 20. Direction: no. C5#10, 16, 17 (part), 31.
- **The press mend's two new behaviours accepted:** Tab can enter the held 2D map; a hidden view is not rendered. Product. On `press-landing`, not `main`; the focus guard is a task. Direction: no (it is in the Work task). C7#26; C8#14.
- **The road to December's dates, and the fallback for the World Map of several repositories:** if it is not close by November 28, each repository's own map is shown. Product. On the Work board. Direction: partly (line 7 points at the board). C8#8, 9.
- **`explorer-navigation.spec.ts:126` left unchanged under load** and listed for the sorting of time limits. Process. Direction: yes (line 16). C5#14.

## Overtaken (SUPERSEDED)
| Item | First put | What overtook it, and where |
|---|---|---|
| The Node 22 timer workaround, kept only if 22 had to be supported | 19:18 UTC Nov 19 | Turn 2 moved the project to Node 26 ("Use the software you need to use") and the owner can install a higher Node at work. The timer and its revert were left out of the joining (record work notes, 21:43 UTC). `.nvmrc` is 26. |
| The two extra Node versions removed, or that builder stopped | 19:25 UTC Nov 19 | The container was rebuilt on Node 26 (Turns 14, 15); the trial is finished. |
| Should docs be written inside the mapped repository (as today, a self-ignoring folder, or outside) | 19:00 UTC Nov 19 | Turn 7: the per-file Markdown stops being the store ("I see your aim is plan B ... I think it's time to try, eh?"); Turn 8: "Export on demand". Direction line 64 notes it. |
| Rebuild this repository's history now and again after the joining | Resumption Nov 19 | The history's landing at 22:09 UTC on Nov 20 rebuilt the whole line (1,444 changes, 71.2 minutes). |
| History rebuild options 1, 2, 3 (the costed design) | 17:45 UTC Nov 19 | Option 1, "write only what is read", was corrected twice by review, then replaced by the pool and the scan by git's listing, landed 22:09 on Nov 20. |
| Workers hand deep files to a fresh process (depth 300); two bounds, 200 and 400, instead of rewriting `htmlEntities.ts` | 14:00 and 14:53 UTC Nov 20 | The depth count was refused by three reviews. Root's decision: a fresh worker for every commit, `--keep-workers` off (decisions log 2026-11-20). The bounds serve only the off flag. |
| The order of work: after the red cases, after Turn 7, and overnight | reply to Turn 1; 22:57 Nov 19; 02:35 Nov 20 | Turn 24's road to the showing as eight work items (direction line 7), and root's order in direction line 9. |
| May root read the public Pages run | reply to Turn 1 | Turn 12: the owner brought the Actions pages themselves. Root's guard now reads the public run after each push (direction line 13). |
| Session-close cleanup of about sixty worktrees and two caches waits for the owner's word | 22:14 UTC Nov 20 | Done at the close under Turn 16's "Clean up as needed" (summary, "Cleaned at the close"). |
| The press mend's build served for the owner's eye, and links to try it on a larger picture | 00:00 to 01:02 UTC Nov 21 | The mend was not landed (`main` not moved), and the preview server ended with the session. |
| The nine checks only the owner's Windows machine can make [unsure] | 19:56 UTC Nov 19 | Root's plan is a standing run that includes a Windows runner in CI (direction line 21; `Work/tool-arrives-on-windows.md`). Turn 7 and today's "Nothing leaves the machine" rule out running checks at work. Unsure whether root still wants the home rig's checks. |

## Answered (ANSWERED)
| Item | First put | The owner's words, day and turn |
|---|---|---|
| A branch for each dev day, merged into `main` at landings; one merge in place of carrying commits; loosening the git rules | Resumption Nov 19; 14:35 Nov 20; 22:49 Nov 20 | Today: "I'm fine with a branch per dev day. ... I like to do the most vanilla thing and merge into Dev without squashing or rebasing". Note for root: this cuts against the proposal's "builders may rebase and squash"; the guide is not yet changed. Lean in Turn 23. |
| Does the work items' form serve | Resumption Nov 19; 22:49 Nov 20 | Today: "It'll do for now. Not madly in love with it but I think it's a reasonable starting point. Whether or not it should be as simple as markdown files is not yet clear to me." |
| The December facts: git or TFS, the npm registry, what may leave the machine, how much code, which browser and graphics card | reply to Turn 1; 03:59 and 22:49 Nov 20 | Today: "Both ... 2 git repos ... several other code projects ... part of TFS"; "if I don't have to, that's much better ... downloading an HTML file"; "Nothing leaves the machine and I would just share my screen"; "No scanned object would even remotely approach a million lines"; "Absolute crap VM ... 8GB of RAM and a handful of GB of remaining storage". |
| Which machine holds the work code; which Node it can take | reply to Turn 1; 19:25 Nov 19 | Turn 2: "I would scan my own work from my own dev machine at work"; "I can install a higher node version on my work machine." |
| Move the project to Node 26 | 19:18 Nov 19 | Turn 2: "Hahaha yeah we just bumped recently but obviously that's fine. Use the software you need to use." |
| Delete `packages/cli` | Resumption Nov 19 | Turn 2: "That's okay if it needs to be deleted, yep." |
| Is any work SQL in files not ending `.sql` | 20:33 Nov 19 | Turn 2: "All the SQL files end in `.sql` and the repos for the DBs are just systems of record." |
| Do SQL Server scripts query Oracle through `OPENQUERY` | Turn 3 quote | Turn 3: "YES!" |
| Oracle packages, and whether the Oracle code is in scannable files | Turn 3; 22:14 Nov 19 | Turn 3: "Not sure." Turn 5: "I could scan a lot of view definitions ... just views and procedures"; and the warning against "a hailstorm of false positive links". |
| Is a web project copied into a host site at build time | Turn 3 quote | Turn 3: "Nnnnot that I know of?" |
| Repoint the 13 archived links | 22:14 Nov 19 | Turn 5: "Absolutely!" |
| May the per-file Markdown doc stop being the store (A, B or C); the mirror no longer required on disk | 21:22 and 22:39 Nov 19 | Turn 7: "I see your aim is plan B. You are welcome to do so. I think it's time to try, eh?" |
| The single-file test page for the work machine, and the single file as the main way in | 21:42 Nov 19 | Turn 7: "I wouldn't dare run anything on that machine until I'm really confident our software has been battle-tested against many others." Today: "downloading an HTML file off of the Live Documentation hosted github pages site would be way cooler. Each copy ... capable of writing a new fresh blank copy". (Direction line 64 still lists this as open.) |
| Should this repository keep committing a Markdown copy of the facts | 23:38 Nov 19 | Turn 8: "Export on demand, I'd expect." |
| Written words as loose documents, one words-only document per file | 23:38 Nov 19 | Turn 8: "Here's where I'm not sure I agree ..." Turn 9: "Soooo now we can just... include.... non-gitignored docs as a type of node that we map, no?" (taken up as documents as nodes) |
| The four requirements any store format must meet | 01:17 Nov 20 | Turn 11: "You are listing off important values that we care about maximizing ... Nudge dimensions and requirements to permute the idea space" |
| Leave the Pages workflow and the branches as they are | 01:57 Nov 20 | Turn 13: "Phew! Thanks for the heads up. My mistake." |
| The devcontainer rebuild for Node 26, and when | 23:07 Nov 19; 00:56 and 02:04 Nov 20 | Turn 8: "Will do when you say it's ready for a rebuild." Turn 14: "I think we should rebuild and get it over with." |
| Remove the old history cache(s) | Resumption Nov 19; 01:17 Nov 20 | Turn 16: "Clean up as needed. Remove it." This was also applied to the two later caches at the close. |
| A click on a pinned 3D sphere unpins it and replaces the picture: should it? | 18:14 Nov 19 | Turn 16: "Probably not. We probably need to go back to the UX drawing board and be holistic with respect to \"Open/Close\" and \"Pin\" states." |
| SQL system catalog names no longer drawn as connections | 20:09 Nov 19 | Turn 16: "That's fine if you wish to no longer draw them as connections. Balance the potentially-competing concerns of ..." |
| Which board piece carries the linked server's line | 21:42 Nov 19 | Turn 16: "That is a great question. I would generally suspect the SQL Server piece?" |
| Does every picture file get a doc | 19:00 Nov 19 | Turn 16: "(Or gets an entry of some sort in whatever datastore exists to represent things which have been scanned)" |
| Public repositories that resemble the work code | 22:57 Nov 19 | Turn 16: "I will look into that and see if I can find some public repos which resemble what we have. That's a good idea." (Their action is still pending.) |

## Not questions
- C1#26: told the preview server went down.
- C1#37: the cold run announced, then run.
- C1#62: what `packages/cli` is for, a builder's job.
- C1#71: packet corrections and faults, noted only.
- C2#1: the check on "95% resolved", done by root.
- C3#3: skip rules made configurable, per their answer.
- C3#6: root will scan a repository heavy in assets.
- C3#7: root's reading of the pictures answer.
- C3#13, C4#1: owner pressed Ctrl+C ("Done").
- C4#11, C5#7, 11, 12: links to look at the focus fix.
- C4#13: landing held, a status line.
- C5#1: "don't rebuild tonight", a request.
- C5#4: speed-ups to the suite planned.
- C5#27: a pointer to direction's list.
- C5#32, 36: the refusal rule is the harness's, not the owner's.
- C5#33: briefs changed to avoid refusals.
- C5#37, C6#7: auto mode may pause, flagged.
- C6#10: barrel row ruling, in the work notes.
- C6#11: machine-failure stops, work notes only.
- C6#12: unreadable folders rule, work notes.
- C6#13: small rulings and known edges recorded.
- C6#14: the builders' follow-up queue.
- C7#7: rebuild started before the review's verdict.
- C7#13: a list of what is owed after the landing.
- C7#15: links to the landing's changed files.
- C7#23: agreed the last builder ends the session.
- C7#27: press mend not landed, a status.
- C7#29: worktrees and branches kept, a status.
- C8#15: four guide sentences added, told.
- C8#17: the conditional landing rule, carried out.

## Unsure
- **Where the Explorer for another folder is built:** OPEN or SUPERSEDED. To settle it I would need to know whether today's wish for a self-copying HTML page, together with "each world map object is a recursively scanned directory", replaces the command-line output-folder question, or whether the command line still needs a place to build.
- **The history takes a parent's summary where nothing read changed:** OPEN or NOT-A-QUESTION. Root listed it as put to the owner, but under the lead-developer rule it is root's own call. It depends on whether root wants the owner's leave.
- **The owner's exports filed once at the close:** I would need to know whether the November 21 chat changed the practice, which is outside these records.
- **The nine Windows checks:** I would need to know whether root still wants the owner to run them on the home rig, or whether the Windows CI job fully replaces them.
