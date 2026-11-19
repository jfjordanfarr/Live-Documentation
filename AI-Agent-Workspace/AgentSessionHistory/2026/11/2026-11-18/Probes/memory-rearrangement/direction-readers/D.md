# D: old direction.md lines 360 to 474 (October 23 back to September 26, 2026, the dated record's October 12 to 23 entries and the embedded "as of 2026-11-02" Next block) against direction.reconciled.md

I read all of `direction.reconciled.md` (lines 1 to 347) and every line of the old file from 360 to 474: 60 entries (53 dated paragraphs, the italic "As of 2026-11-02" block at 466, and the six bullets at 468 to 473). The part ends at the October 12 entries. The September entries the brief names come after line 474, under "The September 2026 reframe", and are not in this range. I checked a few facts against `architectural-decisions.mdmd.md`, `change-over-time.mdmd.md`, `owner.md` and `packages/explorer/src/client/persistence/local-storage.ts` to see where they are kept now.

## Items not plainly carried

### 366, 370, 374: "October 22, the related documents run both ways, and the formatter decided" / "October 22, the 3D defaults kept" / "October 21, the 3D picture eases until still, tethered"
**Verdict:** carried, weaker.
**Absent:** the values the owner called "solid", the fact that the Fable probe's recommendation was not adopted, the probe's reasons and its answer on framing. The Easing bullet says the subagent "did" the tuning and "recommended gravity 0.05 and tether 0.03". It does not say this was not adopted, so a reader can take the probe's numbers as the defaults. The "Not too tight" bullet does not say that the picture the owner found too tight was gravity 0.05 under the older motion.
**Paste:** "The defaults the owner called 'solid' (2026-10-22) were update energy 1, tether 0.01 and gravity 0.01. The Fable probe's gravity 0.05 and tether 0.03 were not adopted (still so on 2026-10-23, [the plan's C5](../../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md)). Its reasons: under the motion of 2026-10-21, gravity 0.01 leaves the camera inside a picture 3,754 units across with 39% of the spheres on screen, because the picture now rests 1.8 to 1.9 times as wide as the frozen one 0.01 was chosen on. The owner's 'too tight' of 2026-10-18 was gravity 0.05 under the older motion, whose rest was 1.8 times smaller. On framing the first picture, the probe answered yes, once, when the unfolding picture calms and the tether takes hold, since the library's camera grows with the cube root of the file count and the picture grows faster. The shipped values are now gravity 0.025, tether 0.02 and spring 0.5 (`local-storage.ts`): neither the owner's nor the probe's, and whose choice they were should be stated." (Also add the probe's answer to the Small questions line "Whether the first 3D picture frames itself once".)
**Belongs under:** The 3D Local Map › Forces, motion and rest (the Easing bullet and the Now line).
Also from 366, minor: "The history's sequence carries a document's forward links alone until it learns the other direction." This is a known limit not stated anywhere I found. **Belongs under:** The history, or the Related documents bullet.

### 380: "October 20, first visual response and mobile constraint"
**Verdict:** carried, weaker (the number is gone).
**Paste:** "Measured on 2026-10-20: at map scale 1 a phone's targets are 17 px for symbol actions and 20 px for header actions."
**Belongs under:** 2D Local Map › The card › Touch targets.

### 408: "On generation, the owner asked to measure what the shortcut saves…"
**Verdict:** carried, weaker (the owner's stance is gone).
**Paste:** "The owner challenged retiring `--changed` on the strength of its 1.67 s saving on this small repository; the larger corpus's nine seconds supported keeping incremental performance as a goal, with CI burden, reusable analysis and the single-file export to be weighed together (2026-10-19, Turns 6 and 7)."
**Belongs under:** Engine and docs › Generation.
**Why it matters:** without this, a root reading "saved 1.67 s, invalidation incomplete" could propose deleting the shortcut, which the owner has already argued against.

### 428: "October 16, the owner's answers on change over time, and two gos"
**Verdict:** changed (a date only).
**Wrong:** the new file puts "That was a quick mysery hahahahaha! …" under "Every change takes the gentle update (2026-10-17)". It was said on 2026-10-16 ([Turn 3 of the October 16 record](../../../../../../../AgentSessionHistory/2026/10/2026-10-16/2026-10-16.1.record.md#turn-3)), answering the change-over-time question of feeding the running simulation.
**Paste:** "On feeding the running simulation (2026-10-16, Turn 3): …"
**Belongs under:** Forces, motion and rest › Every change takes the gentle update.

### 434: "October 15, clicks pin what they name…"
**Verdict:** carried, weaker; low weight.
**Paste:** "The three rules behind the accidental pins were the agent's readings, on 2026-10-03, of the owner's words."
**Belongs under:** Pins, clicks, search and paths › Click retains; close prunes.
This is the same lesson the new file keeps for "no wires until something is pinned".

### 446: "October 14, pin management landed"
**Verdict:** missing; small.
**Absent:** two observations put to the owner for judgment and never answered.
**Paste:** "Put to the owner on 2026-10-14 and never answered: the open pin tray covers the right-hand part of the 2D map; the ancestor disclosure is an indented stack in a popover."
**Belongs under:** Small questions never answered.
The entry's other open items are superseded: recursive membership on 236 hubs, by uniform folders and bubbles; membership lines at rest are already in Small questions.

### 448: "October 14 implementation authorized"
**Verdict:** carried, weaker; low weight.
**Paste:** "Any ancestor labels must withstand the future unification of text sizes (2026-10-14)."
**Belongs under:** Directories › Ancestors and a handle that stays in view.

### 460: "October 13 Local Map legibility"
**Verdict:** carried, weaker.
**Absent:** the owner lifted their own parking of 2026-10-08 on 2026-10-13. The Parked line says further layout optimization was parked on 2026-10-08 and "reopened in part by the grant of 2026-11-15". That reads as if it stayed parked until November.
**Paste:** "…(2026-10-08; set aside by the owner for the session of 2026-10-13, [Turn 1](../../../../../../../AgentSessionHistory/2026/10/2026-10-13/2026-10-13.1.record.md#turn-1), and reopened in part by the grant of 2026-11-15)."
**Belongs under:** Next › Parked by the owner.

## Things in the new file's treatment of these subjects that could mislead

- **Easing until still.** "which a vision-capable subagent … could do; it did …, recommended gravity 0.05 and tether 0.03" reads as if the delegated tuning settled the defaults. It did not. See 366/370/374 above.
- **Forces' Now line.** "Gravity toward each group's own centroid (0.2, agent-selected)": in the code, 0.2 is `componentSeparation`. The gravity lever is 0.025. The old file (line 298) words it the same way, so this is inherited. Worth a check when the Now line is touched.
- **Small questions, "the Centre action … have no record".** The source, the November 12 record, means the Centre action's motion (the jump). The Local Map's recentre control itself has a record: the owner took it whole on 2026-10-15 ("This sounds great! Let's go ahead and give it a go!", carried under One grammar for every input), and on 2026-10-20 the old file says "visible Centre/Open remains available". Suggested wording: "the Centre action's motion".

## Rightly left (5)

- **386** (October 20 bootstrap handoff): superseded by the inspect-first landing, `708f0cfa`.
- **400** (the October 19 stewardship forks): answered in 396, and the answer is carried.
- **412** (implementation status, October 19): landings. The hosted history is carried in the History Now line; FIRE and the sixth control in Easing.
- **414** (October 19 bootstrap handoff): superseded. The serialized-tests rule is told and lifted under Workers.
- **468** (the "Done" list): its home is the vision's status.

Also rightly left, inside entries counted as carried:
- the gate counts and commit hashes;
- the C-ticket telling (TFVC is in `change-over-time.mdmd.md`);
- the never-documented examples and "secrets came off the list" (in the decisions log's alternatives);
- the formatter's 402 of 425 and the TypeScript 7 facts (decisions log);
- the preference of 2026-10-23 that the agent's rebuilds replace the shared preview, superseded by owner.md's preview rule of 2026-11-13;
- the open items of 442 and 452, superseded by Structure's uniform folders and bubbles and by the archipelago start.

## Counts

| Verdict | Entries |
|---|---|
| Carried | 45 |
| Carried, weaker | 8 (366, 370, 374, 380, 408, 434, 448, 460) |
| Changed | 1 (428, a date) |
| Missing | 1 (446) |
| Rightly left | 5 |
| **Total** | **60** |

## Judgment

The substance of this period survived well. Every decision and every owner quotation I checked is in the new file, mostly with its turn link and correct date. That includes:
- inspect-first and the direct Pin;
- one search and one walk;
- the destination field;
- the clicks rule;
- the pin tray;
- the Structure layout;
- reachable;
- the documented-file rule;
- Cited By;
- the formatter;
- no network;
- linear time;
- the tether;
- the history's picks and forks;
- the views' names;
- scrolling;
- Relaxed and Compact, and their replacement.

A root that had read only the new file would act differently in one place: the 3D defaults. It could not tell whose gravity and tether values stand. It could also cite the owner's "too tight" against a gravity that was measured under a different motion, or re-run the tuning probe to answer the first-picture framing question the probe already answered. Two smaller cases: it could propose retiring `--changed` against the owner's stated challenge, and it could put the October 14 tray observations to the owner as new. I found no question in these subjects that the new file presents as open when the owner has already answered it.
