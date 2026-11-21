---
kind: issue
state: open
milestone: december-showing
order: 40
opened: 2026-11-20
---
# Proven on real repositories, on Linux and on Windows

**For the owner.** Your bar, in your words: "I wouldn't dare run anything on that machine until I'm really confident our software has been battle-tested against many others." The runs on real public code so far were one-off, inside probes; nothing on `main` repeats them. This is the evidence you asked for, kept standing.

**Done when.** One command scans a pinned list of public repositories shaped like your work's and writes a table you can read: for each, whether it finished, how long it took, its peak memory under a cap the size of your work machine's, which files could not be mapped and why, and how far each reader agrees with its language's own parser. The same table comes from a Windows runner.

**Rests on.** Public repositories standing in for code nobody here may see. What they lack shows only at the first scan at work, and by the owner's word of 2026-11-21 nothing of that scan can be carried back.

**Waiting on the owner.** Nothing blocks it. Public repositories that resemble your work's, which you offered to look for, join the list as they come.

## Tasks

### The run, as one command over a pinned list
- state: open
- holds: not begun
- evidence:

Begin with the corpora already used: dbatools (1,790 PowerShell scripts), tSQLt, DNN Platform (.NET Framework, 10,776 docs), the second Web Forms application of the .NET record, and utPLSQL. Anonymous shallow clones at pinned commits, nothing of this project in any request. Scheduled in CI and run before a landing of reader code, never on every push.

### A crash becomes a test
- state: open
- holds: not begun
- evidence:

Every failure the run meets is cut to its smallest input and added to the reader's cases, the rule the owner keeps at work: "anything which hurts us sufficiently badly becomes another test case".

### A scan's report that holds no source text
- state: open
- holds: not begun
- evidence:

Counts by language, files not mapped with their reasons, time and memory. **Changed 2026-11-21:** it was to be pasted back from work, and the owner's answer is "Nothing leaves the machine". So it is a report for their own eyes on that machine, shown by the tool where the scan ends, plain enough that they can say in their own words what it found.
