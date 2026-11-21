---
kind: issue
state: active
milestone: december-showing
order: 30
opened: 2026-11-20
---
# The tool arrives as a page and as a command line, from one engine

**For the owner.** You asked for a page that can write a page: downloaded as one HTML file, pointed at a folder, and able to save a fresh blank copy of itself, "eagerly ready to take in its first scan". Asked on 2026-11-21 whether that page should come before the package, you refused the fork ([their words](../AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)): "With really awesome architecture, this shouldn't feel like a death sentence to switch between one and another (CLI versus browser window). Explore the possibility space that enables both if possible and elegant with great architecture. If not possible, explore the possibility space of what can be done with a page. If not enough is possible, then fall back to CLI." Your work browser is "Chromium-based. Edge or Chrome.", which can pick a folder, read it and write beside it.

**Done when.** One HTML file, opened from disk in Edge or Chrome on a machine that has never seen this repository, maps a folder a person picks, shows the map, and saves a blank or a filled copy of itself; the command line maps the same folder to the same facts; and a check fails the day the two would differ.

**Rests on.** An exploration, not a decision: that the engine can read a folder through one small interface (list once, read a file, write) with two hosts behind it, Node and the browser's directory handle. For it: [on 2026-11-19](../AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md) the unchanged generator, with stand-ins for Node's file system, wrote in a page what Node writes. Against calling it done: two days later that probe no longer built until its stand-ins were given three more answers ([the scan in a tab](../AgentSessionHistory/2026/11/2026-11-21/Probes/scan-in-a-tab/README.md)), so stand-ins drift and only a standing check keeps a page running. Not in a page whatever is built: anything that runs git (a repository's history, changed-only runs), which stays the command line's and reaches the page as facts already computed. What would overturn it: a reader that cannot be given its files through the interface without a second copy of its logic, or a scan in a tab too slow on a weak machine to be borne with a progress indicator.

**Waiting on the owner.** Nothing.

## Tasks

### A check that the engine, bundled for a browser, maps what Node maps
- state: active
- holds: with a builder since 2026-11-21, on a branch `page-check` cut from the day branch; tests and a build script only, no change to the engine
- evidence:

Every fixture family mapped twice, in a real Chromium page and under Node, and the docs and index compared; the stand-ins count each call the engine makes of them by kind and by calling module, which is the living inventory of what the interface must cover. Where the page differs today the difference is listed with its cause, and the list can only shrink.

### The engine reads a folder through one interface
- state: open
- holds: not begun; waits for [the readers' join](readers-on-main.md), which holds every reader's file
- evidence:

List once, read a file's bytes, is-a-file answered from the listing, write. It carries with it the task of reading each file once (today a file is read about four times in a scan, and each of nine walks lists the folder again). The check above is its oracle: a stand-in is deleted each time the engine stops needing it, and the interface is whole when none is left.

### What a scan leaves out is chosen on the listing, before anything is read
- state: open
- holds: not begun; designed with [the scan that leaves no trace](scan-leaves-no-trace.md#choosing-what-a-scan-leaves-out-before-it-scans-on-either-surface)
- evidence:

### One page that scans, shows the map and saves a copy of itself
- state: open
- holds: not begun
- evidence:

The Explorer and the engine in one file under a policy that admits one hashed script; a folder picked; progress shown while it scans; the facts kept in the page; a blank copy and a filled copy saved. The same file is what the command line writes, filled, so there is one page and two ways to fill it.

### A package that holds the built Explorer
- state: open
- holds: not begun
- evidence:

The command line without this checkout: its size on disk measured against a small disk; no compiler needed on the machine; the binary's name and commands as carried into [the board's design notes](../../.mdmd/layer-3/board.mdmd.md) when `packages/cli` was deleted.

### A Windows job in CI that walks the road
- state: open
- holds: not begun
- evidence:

Under Windows PowerShell 5.1 and Node 26: a checkout with CRLF line endings, a script saved as UTF-16, a path with a space, a long path, names that differ by case alone refused. It makes real the nine checks [the Windows record](../AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md) says only a Windows machine can make.
