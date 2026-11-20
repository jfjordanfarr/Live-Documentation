# Work items

_Current. A trial of 2026-11-20, proposed by root in answer to the owner's ask of that day ([Turn 24 of the November 19 record](../AgentSessionHistory/2026/11/2026-11-19/2026-11-19.1.record.md#turn-24)); it is the convention only once they accept it._

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
---
# What the owner gets, in a sentence

**For the owner.** Why it matters, in their terms.
**Done when.** What can be observed when it is done.
**Waiting on the owner.** The questions that block it, or "Nothing."

## Tasks

### A task, named in plain words
- state: open          # open | active | review | done | dropped
- holds: the branch, worktree or files where the work stands
- evidence: the commit, the review and the measurement, written when it is done

What is to be done, for the builder, with links to what is already known.
```

What makes it more than a list in a document:

- **The fields are fixed** and a small script is to check them and print the board below from the files (the first task of [the tracker's own issue](work-items.md)). Until it exists the board is written by hand.
- **Evidence lives on the task.** A handback's commit, its review and its numbers are written on the task it answers, so "is this proven, and by what" has one place. The record still tells the story; the task holds the state.
- **A question for the owner lives on the issue it blocks.** A question that blocks nothing is decided by root's recommendation and said once.
- **One root at a time** writes these files, so they need no locking and no service.

What it does not replace: the record (what was said), the summaries (what happened), [direction](../Memory/direction.md) (what is decided, in the owner's words, subject by subject), [owner.md](../Memory/owner.md).

## The board

The road to the showing at the owner's work on about December 7 or 8, 2026, on their own code: PowerShell 5.1, .NET Framework 4.8 and SQL. The dates are root's targets and not promises; its estimates on 2026-11-20 ran late five times in one afternoon, which is why the work that must be true comes first and the days before the showing are left for what real code turns up.

| Order | Issue | State | Root's target |
| --- | --- | --- | --- |
| 10 | [Their kinds of code read truthfully: the readers on `main`](readers-on-main.md) | open | November 23 |
| 20 | [A scan leaves no trace in the repository it maps](scan-leaves-no-trace.md) | waiting | November 24 |
| 30 | [The tool arrives on a Windows machine and runs there](tool-arrives-on-windows.md) | waiting | November 26 |
| 40 | [Proven on real repositories, on Linux and on Windows](proven-on-real-repositories.md) | open | first table November 25, then standing |
| 50 | [Several repositories on one map](several-repositories-one-map.md) | open | November 30 |
| 60 | [The Explorer holds a large map on a modest machine](explorer-holds-a-large-map.md) | active | November 30 |
| 70 | [The showing rehearsed, at home and then at work](showing-rehearsed.md) | waiting | dry run December 1, first scan at work December 2 or 3 |
| 90 | [The work items themselves](work-items.md) | open | with the first quiet builder |

**Not on this road, and so not begun before it:** the store's change away from a Markdown doc for each file, with the format's research and documents as nodes; the single page that scans by itself; a sound way to keep the history's workers; the history taking a parent's summary where nothing read changed; the browser suite's time; the parked trials for the packet beyond what the issues above name; the whole design of open, close and pin. Each is in [the day's summary](../AgentSessionHistory/2026/11/Summarized/2026-11-19.1.SUMMARIZED.md#unfinished-work-in-roots-order) and [direction](../Memory/direction.md#next), and becomes an issue here when it is taken up.
