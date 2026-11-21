---
kind: issue
state: waiting
milestone: december-showing
order: 30
opened: 2026-11-20
---
# The tool arrives on a Windows machine and runs there

**For the owner.** You will run it yourself on a work machine with little disk and memory, under Windows PowerShell 5.1. Today the tool is this checkout: packed by itself it installs at 100 MB, generates docs, and cannot build the Explorer, which is compiled from source on the user's machine ([what a typical user would run](../AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)). Nothing of ours has ever run on Windows itself; every Windows fault found so far was found by imitation.

**Done when.** On a Windows machine that has Node and has never seen this repository, one archive and one command produce a folder's map and open it, and a Windows job in CI does the same on every landing.

**Rests on.** A package installed with Node and one command. The owner's answer of 2026-11-21 ([their words](../AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-1)) is that the registry can be reached "but if I don't have to, that's much better. Like downloading an HTML file off of the Live Documentation hosted github pages site would be way cooler. Each copy of Live Documentation Explorer should be capable of writing a new fresh blank copy of Live Documentation Explorer, eagerly ready to take in its first scan!" [Measured on 2026-11-19](../AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md): the unchanged generator ran in a page and wrote what Node writes. If the page comes first, this issue becomes that page, and the package serves what a page cannot do: a git repository's history, and automation.

**Waiting on the owner.** Whether the page comes first and the package second, which reverses their order of 2026-10-10. The machine is a VM of 8 GB with a few GB of disk; which browser it has, and what that browser allows, is not known.

## Tasks

### A package that holds the built Explorer
- state: open
- holds: not begun
- evidence:

Its size on disk measured against a small disk; no compiler needed on the machine; the binary's name and commands as carried into [the board's design notes](../../.mdmd/layer-3/board.mdmd.md) when `packages/cli` was deleted.

### One command: map this folder and open it
- state: open
- holds: not begun
- evidence:

The stranger's road of the cold run took nine stumbles, mended on 2026-11-19; this is that road made one step, with the output going where [the scan leaves no trace](scan-leaves-no-trace.md).

### A Windows job in CI that walks the road
- state: open
- holds: not begun
- evidence:

Under Windows PowerShell 5.1 and Node 26: a checkout with CRLF line endings, a script saved as UTF-16, a path with a space, a long path, names that differ by case alone refused. It makes real the nine checks [the Windows record](../AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md) says only a Windows machine can make.
