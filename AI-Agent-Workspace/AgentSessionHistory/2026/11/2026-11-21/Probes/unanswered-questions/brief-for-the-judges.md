# Brief: from a raw list of things put to the owner, find what is still open

You are a builder for the root agent of the Live Documentation repository (`/workspaces/Live-Documentation`). This is a reading and judging job: you change no file of the repository, run no git command that changes anything, start no browser and no build. You write exactly one output file, in the scratch folder named at the end. The repository guide's start-of-chat reading is the root's, not yours; read what this brief names.

## What the owner asked for, in their words (2026-11-21)

> "I suspect I've accumulated quite a few decisions/questions that were raised for me and have failed to answer them or allowed defaults (your educated choices) to take effect. It would be very helpful to me if you could dispatch some builders to mine the November 15th, 16th, 17th, 18th, and 19th chat logs to attempt to bubble up to _you_ everything I failed to answer ... and then you mine the bubbled-up list for what has actually been superseded versus what is still relevant."

And why: "I want you to see how much churn occurs in these questions, with new findings superseding old ones often."

Small models have already read the five days' records chunk by chunk and listed every question, reversible call, offer and request for the owner's eye they found: 652 raw entries, heavily repeated (the root re-listed open questions many times). Each entry says only whether the owner answered **inside that chunk**. Your job is the part that needs the five days in view: merge the repeats, and for each distinct item establish what became of it.

## Your inputs

1. **Your share of the raw entries** (named at the end). Read it whole.
2. **Every message the owner typed in the five days, verbatim:** `/tmp/claude-1000/-workspaces-Live-Documentation/1501b25e-9b79-43c7-b25c-c8b29500c331/scratchpad/mine/owner-messages.md` (117 messages, about 150 KB). Read it whole, to its last line; it is how you find an answer given on a later day or in passing. Lines beginning `>` are the owner quoting the root.
3. **What the owner answered today:** `.../scratchpad/mine/in/owner-answers-2026-11-21.md`.
4. **The root's own current list and state:** `AI-Agent-Workspace/Memory/direction.md`. Read lines 1 to 101 in full ("Next" and "Open with the owner"; some lines are very long, so read in small ranges and check you reached line 101) and its last section, "Small questions never answered" (from line 413). Search the rest by keyword when you need to know what was decided or built on a subject; each subject's section leads with a bold **Now.** paragraph that says how things stand.
5. **The records themselves**, when an entry's quote is too thin to judge: `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-1{5..9}/2026-11-1{5..9}.1.record.md`. Search them for the entry's quote; do not read them whole (they total 2 MB). The day's summaries are at `AI-Agent-Workspace/AgentSessionHistory/2026/11/Summarized/`.
6. **The code**, only to check whether a thing asked about still exists (a Tuning lever, a trial, a default): search `packages/explorer/src` and `packages/engine/src`. `git log --oneline -S'<text>'` and `git log --oneline -- <path>` are fine; run git commands plainly, one at a time, never chained or piped (the harness refuses those; if a command is refused, do without it and say so in your report, never reach it another way).

## How to judge an item

Give each distinct item exactly one status:

- **ANSWERED**: the owner's own words, in any of the five days or today, address it. Quote them, with day and turn. A reaction that does not choose ("I'll get to these", "Still not sure") is not an answer.
- **SUPERSEDED**: the thing asked about no longer exists or no longer matters, because of a later decision, a later build or removal, or a later finding. Say what superseded it and where (a later owner turn, a line of direction.md, a commit, a code search that finds the lever gone). This is the churn the owner wants to see, so be exact about what overtook what.
- **DEFAULT-TOOK-EFFECT**: no answer came and the root's choice is what stands in the product or the process today. Say what the default was and, if you can find it, where it landed. Include items from lists the owner answered "by exception" and passed over: the owner's own rule of 2026-10-16 is that what they pass over in such a reply stands, and today they are asking to see exactly those.
- **DEFERRED-BY-OWNER**: the owner said not now, or how they want it brought instead. Two such sayings cover many items; quote whichever applies: on 2026-11-18 (Turn 13 of the November 17 record) that six small visual questions are "not to be put one by one" and that blind playtests on small models should reveal "deeper underlying design decisions"; on 2026-11-19 (Turn 40 of the November 18 record) that questions for their eye come as "Screenshots to compare", "Hyperlinks and instructions if necessary to try it" and "Blind tester agents", not as sentences in a list.
- **OPEN**: put to the owner, not answered, not overtaken, and nothing has been built on a default: it still waits.
- **NOT-A-QUESTION**: the miner listed something that was never put to the owner for a decision (a status line, a note the root wrote to itself, the root asking the owner to do a mechanical step that they then did).

Rules of evidence. Do not infer an answer from silence. Do not call something superseded because it is old. When two entries are about the same thing asked at different times, they are one item; when a later asking narrowed or changed the question, say how it changed. If you cannot settle an item, give your best status and mark it `unsure` with what you would need to know. A wrong "ANSWERED" or "SUPERSEDED" hides something from the owner; when the evidence is thin, prefer OPEN or DEFAULT-TOOK-EFFECT and say why.

Also say, for each item that is OPEN, DEFAULT-TOOK-EFFECT or DEFERRED-BY-OWNER, whether direction.md's "Open with the owner" section (lines 54 to 101) or its "Small questions never answered" section carries it today: `yes`, `partly` or `no`. An item that fell off that list is among the most useful things you can find.

## Output

One Markdown file. Keep it compact: the root will read all of it.

```
# Narrowed: <your share>

## Counts
raw entries read: N; distinct items: M; by status: OPEN a, DEFAULT-TOOK-EFFECT b, DEFERRED-BY-OWNER c, ANSWERED d, SUPERSEDED e, NOT-A-QUESTION f; unsure: u

## Still waiting (OPEN, DEFAULT-TOOK-EFFECT, DEFERRED-BY-OWNER)

### <the item in plain words, one line>
- status: <one of the three> [unsure]
- kind: look-and-feel | product meaning or behaviour | engine and correctness | process and workspace | machine and environment
- first put: <day, record heading>; repeated: <how many times, last where>
- root's words: "<the clearest verbatim asking, up to 300 characters>"
- what stands today: <the default in force, or "nothing built">, with where you saw it
- on direction's list: yes | partly | no
- raw entries merged: <FILE-id#n, ...>

## Overtaken (SUPERSEDED)
| Item | First put | What overtook it, and where |

## Answered (ANSWERED)
| Item | First put | The owner's words, day and turn |

## Not questions
<a short list of FILE-id#n with five words each>

## Unsure
<each unsure item, what you would need to know>
```

Reply to the root with: the output path, the counts line, and the titles of the unsure items. Do not paste the file.

## Scratch

Your own scratch folder, if you need one, is `/tmp/claude-1000/-workspaces-Live-Documentation/1501b25e-9b79-43c7-b25c-c8b29500c331/scratchpad/mine/narrowed/work-<your share's letter>/`; remove it when you finish and nothing else. Do not touch the other files under `scratchpad/mine/`.
