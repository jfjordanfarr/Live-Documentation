# Work items

_Current. A trial of 2026-11-20, proposed by root in answer to the owner's ask of that day ([Turn 24 of the November 19 record](../AgentSessionHistory/2026/11/2026-11-19/2026-11-19.1.record.md#turn-24)). The owner's judgment of 2026-11-21 ([Turn 1 of the November 21 record](../AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-1)): "It'll do for now. Not madly in love with it but I think it's a reasonable starting point. Whether or not it should be as simple as markdown files is not yet clear to me." So it stays a trial: no tooling is built on it, and it gives way to something better of the same simplicity. They also found the first board too sure of itself, and it was revised that day: an issue now says what it rests on, and carries no date._

**Why this folder exists.** Until now what is to be done lived as prose in four places: the ranked list in [direction](../Memory/direction.md#next), each summary's unfinished work, the record's Resumption, and the questions waiting on the owner. That served one chat at a time and made the state of a piece of work hard to find: which branch holds it, what is left, what proved it. The owner's words: "some kind of way to track work-item-like things", "potentially as small as markdown but likely needing sliiiightly more formalization than markdown work items", formal "_only in the places where it streamlines and in no places where it slows us down_".

**Who reads it.** The owner, to see where a piece of work stands without reading a record. The root, at the start of a chat and before each brief. A builder, whose brief names one task.

## The form

One file for each **issue**, named in plain words (`readers-on-main.md`); the name is how it is cited, and there are no numbers. An issue is written for the owner: what they get and how they will know. Its **tasks** are written for whoever builds them and live in the same file.

```markdown
---
kind: issue
state: open            # open | active | waiting | done | dropped
milestone: december-showing
order: 10              # the board's order: lower is sooner
opened: 2026-11-20
value: The map does not lie   # the design philosophy's value it serves first, by its title; `none` for a milestone or a matter of process
also: It meets you where you are   # a second value it serves in earnest, if any
---
# What the owner gets, in a sentence

**For the owner.** Why it matters, in their terms.
**Done when.** What can be observed when it is done.
**Rests on.** What is assumed and not yet shown, and what would overturn it.
**Waiting on the owner.** The questions that block it, or "Nothing."

## Tasks

### A task, named in plain words
- state: open          # open | active | review | done | dropped
- holds: the branch, worktree or files where the work stands
- evidence: the commit, the review and the measurement, written when it is done

What is to be done, for the builder, with links to what is already known.
```

What makes it more than a list in a document:

- **The fields are fixed,** so that a small script could check them and print the board below from the files. None is built while the form is on trial; the board is written by hand.
- **Evidence lives on the task.** A handback's commit, its review and its numbers are written on the task it answers, so "is this proven, and by what" has one place. The record still tells the story; the task holds the state.
- **A question for the owner lives on the issue it blocks.** A question that blocks nothing is decided by root's recommendation and said once.
- **One root at a time** writes these files, so they need no locking and no service.

What it does not replace: the record (what was said), the summaries (what happened), [direction](../Memory/direction.md) (what is decided, in the owner's words, subject by subject), [owner.md](../Memory/owner.md).

## The board

The road to the showing at the owner's work on about December 7 or 8, 2026, on their own code: PowerShell 5.1, .NET Framework 4.8 and SQL. The showing is informal by their word of 2026-11-21 ("NOT heavily formal", a "nice to have"), and no corner is cut for it (2026-11-19). The first board gave each issue a date of root's; they are withdrawn, since root's estimates ran late five times in one afternoon and the owner's rule of long standing is that an agent's estimates of time are not to be trusted. The order stands as an order.

**What the owner's answers of 2026-11-21 did to it** ([their words](../AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-1); [what root found on looking](../AgentSessionHistory/2026/11/2026-11-21/Probes/unanswered-questions/README.md)). The first board was written without five facts and guessed at each. Their code is under git in two repositories and under TFS in the rest, so most scans have no git to ask and no history. They would rather open a page than install a package, the page that scans by itself, which the first board set down as "not on this road". Nothing leaves the machine, so the loop of a report pasted back, which two issues rested on, is gone. No scan is large; the machine is weak. Asked whether the page comes before the package, they refused the fork the same day ([Turn 2](../AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)): both, from one architecture if that is possible and elegant; the page alone if not; the command line alone last. They also declined, on purpose, to say which shapes their own code has most of, since breadth is what keeps the design honest, and asked that a person can choose what a scan leaves out before it scans, on either surface ([Turn 3](../AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-3)).

Grouped by the value each issue serves first (the owner, 2026-11-22: "Sure! Metadata's fine :)"); the number is the order across the whole board, lower sooner.

**A person can see it**

| Order | Issue | State | What it rests on |
| --- | --- | --- | --- |
| 15 | [A stranger follows a request from the World Map down to its files](stranger-follows-a-request.md) | active | Thirty-two blind runs of 2026-11-21, by models, mostly on one sample; each stumble to be answered with alternatives tried on strangers |
| 50 | [Several repositories on one map](several-repositories-one-map.md) | open | One command over folders, where the owner pictures a blank board asking for its first scan. Also serves: The map does not lie |

**The map does not lie**

| Order | Issue | State | What it rests on |
| --- | --- | --- | --- |
| 10 | [Their kinds of code read truthfully: the readers on `main`](readers-on-main.md) | active | Three public codebases, too narrow a base by the owner's word; breadth ranks what is mended next. Also serves: It meets you where you are |
| 40 | [Proven on real repositories, on Linux and on Windows](proven-on-real-repositories.md) | open | Stands; its report can no longer be carried home from work. Also serves: It meets you where you are |

**It is yours**

| Order | Issue | State | What it rests on |
| --- | --- | --- | --- |
| 20 | [A scan leaves no trace in the repository it maps](scan-leaves-no-trace.md) | active | The scan writing docs into the folder; and, since 2026-11-21, a person choosing what is left out before the scan by one list, built as a function and a trial page and not yet wired into a scan |

**It meets you where you are**

| Order | Issue | State | What it rests on |
| --- | --- | --- | --- |
| 30 | [The tool arrives as a page and as a command line, from one engine](tool-arrives-on-windows.md) | active | An exploration: one interface the engine reads a folder through, two hosts; a standing check that it runs in a page. Also serves: It is yours; As simple as possible, and no simpler |
| 60 | [The Explorer holds up on a weak machine](explorer-holds-a-large-map.md) | active | Measured on 2026-11-21 without a card: small maps hold, large ones do not. Also serves: A person can see it |

**As simple as possible, and no simpler**

No issue serves it first. [The tool arriving as a page and a command line](tool-arrives-on-windows.md) serves it second: one engine, read through one interface.

**None of the five: a date, and how we work**

| Order | Issue | State | What it rests on |
| --- | --- | --- | --- |
| 70 | [The showing rehearsed, at home and then at work](showing-rehearsed.md) | waiting | A loop that carried a report out of the work machine, which is not allowed |
| 90 | [The work items themselves](work-items.md) | open | The form "will do for now" |

**The values and this board** (2026-11-22). The owner asked for a design philosophy whose values might head the work as epics ([the document](../../.mdmd/layer-1/design-philosophy.mdmd.md#the-values-and-the-work-items) tests that on these nine issues). Root recommended a field on each issue naming the value it serves first, with this board grouped by it, in place of directories; **the owner agreed** ([Turn 2 of the November 22 record](../AgentSessionHistory/2026/11/2026-11-22/2026-11-22.1.record.md#turn-2)): "Sure! Metadata's fine :)". So each issue carries `value`, and `also` where it serves a second in earnest, and the board above is grouped by the first. No issue moved and no link changed.

**Not on this road, and so not begun before it:** the store's change away from a Markdown doc for each file, with the format's research and documents as nodes (though a page that scans would keep a scan's facts in the page, which is that change by another door); a sound way to keep the history's workers; the history taking a parent's summary where nothing read changed; the browser suite's time; the parked trials for the packet beyond what the issues above name; the whole design of open, close and pin. Each is in [the day's summary](../AgentSessionHistory/2026/11/Summarized/2026-11-19.1.SUMMARIZED.md#unfinished-work-in-roots-order) and [direction](../Memory/direction.md#next), and becomes an issue here when it is taken up.
