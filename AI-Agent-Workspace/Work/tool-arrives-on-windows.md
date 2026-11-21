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

**Rests on.** An exploration, not a decision: that the engine can read a folder through one small interface (list once, read a file, write) with two hosts behind it, Node and the browser's directory handle. For it: [on 2026-11-19](../AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md) the unchanged generator, with stand-ins for Node's file system, wrote in a page what Node writes. Against calling it done: two days later that probe no longer built until its stand-ins were given three more answers ([the scan in a tab](../AgentSessionHistory/2026/11/2026-11-21/Probes/scan-in-a-tab/README.md)), so stand-ins drift and only a standing check keeps a page running. Not in a page whatever is built: anything that runs git (a repository's history, changed-only runs), which stays the command line's and reaches the page as facts already computed. And what either host writes is not the Markdown doc per file that the command line writes today: by the owner's leave of 2026-11-19 a scan's facts are to be tried as data with Markdown exported on demand, which root's first picture of this architecture left out and the owner caught ([their words](../AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-4): "Wasn't that piece going to change?"). In a page the facts can only be data held in the page, so the store's trial and the page are one move. What would overturn it: a reader that cannot be given its files through the interface without a second copy of its logic, or a scan in a tab too slow on a weak machine to be borne with a progress indicator.

**Waiting on the owner.** Nothing.

## Tasks

### A check that the engine, bundled for a browser, maps what Node maps
- state: done
- holds: on the day branch since 2026-11-21 (`8f4a86d2e`, merged as `a95f93b91`); `main` receives it with the day's merge. Its builder is mending the one cause of difference it found and drafting the interface's design
- evidence: [the builder's account](../AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md); root ran the browser-free tests (3 files, 10 tests) and the 45 browser cases again and all pass

All 45 sample folders, which between them reach every one of the 19 readers, are mapped in a real Chromium page and under Node with the same clock and compared file by file: 43 identical, and the two that differ (six files) share one cause in the engine, a question put to TypeScript's host on Node that a page cannot answer and that Windows and Linux answer differently. That cause was mended the same day (`7e9dbdae5`: names are read as written), and since then all 45 are identical and the ledger of differences is empty. Over the 45 the page took 6.3 s where Node took 9.6 s. Three guards now stand: the bundle refuses any Node module the scan imports that has no stand-in; a committed list says what the scan needs of Node, and changes to it show in review; the ledger of differences fails on a new difference and on a listed one that has gone. What the scan needs of Node today is 36 modules, 13 of them only for paths: in order of use, path arithmetic, 2,163 synchronous is-a-file probes, 2,144 file reads, and five walks of the folder for each scan.

### The engine reads a folder through one interface
- state: open
- holds: designed and not begun; it waits for [the readers' join](readers-on-main.md), which holds every reader's file
- evidence: [the design, as a proposal](../../.mdmd/layer-3/engine-and-hosts.mdmd.md), drafted by the page check's builder from every call it counted and corrected by root: what the host gives (a listing of names, a file's bytes, its first bytes), what it takes (the facts, and word of how far the scan has come), what the engine builds once over them, what cannot cross into a page, the road in nine steps each deleting a stand-in, and the alternatives

List once, read a file's bytes, is-a-file answered from the listing, write. It carries with it the task of reading each file once (today a file is read about four times in a scan, and each of nine walks lists the folder again). The check above is its oracle: a stand-in is deleted each time the engine stops needing it, and the interface is whole when none is left.

### What a scan leaves out is chosen on the listing, before anything is read
- state: active
- holds: the function itself with a builder since 04:39 UTC on 2026-11-21, on the branch `page-check`: new files only, nothing of Node, git's own answer its oracle for `.gitignore`, `.tfignore`'s unsaid rules sought in Microsoft's open-source client; its record to come at `AgentSessionHistory/2026/11/2026-11-21/Probes/leave-out/`. Wiring it into discovery waits for the interface above. How a person sees and changes the choice is designed with [the scan that leaves no trace](scan-leaves-no-trace.md#choosing-what-a-scan-leaves-out-before-it-scans-on-either-surface)
- evidence:

### A scan's facts in one stored form, written by either host
- state: active
- holds: its research leg with a builder since 2026-11-21, on a branch `stored-form-research` (designs that differ in kind, each measured on real facts; no product code); the build itself is [the store's trial](../Memory/direction.md#engine-and-docs), given leave on 2026-11-19 and ordered after the readers' landing
- evidence:

The owner's bar for the form (2026-11-19): "Don't just settle for JSON by default. Do a lot of research to choose a format that is going to be right for what we need at scale and prove it by the efficiency gains that are reaped." The values that research trades, as listed then: read by the Explorer's page with no network and nothing installed; read and written by Node on Windows with nothing compiled; the same bytes for the same facts; a question answered without reading the whole. Since 2026-11-21 there is one more: written by a page, and carried inside the one HTML file that page saves. The command line keeps the facts in a folder that ignores itself, the page keeps them in itself, and Markdown is exported from either, one way, when a person asks.

**The research's first leg (2026-11-21, commit `72832287e` on its branch, read by root; the browser leg follows and its lean is not adopted).** On DNN, 10,776 files and 39.0 MB as compact JSON: strings repeat heavily (475,296, of which 109,035 are distinct), the median file has no wire in or out while the hub has 632 dependents, and three of the four real questions read a few percent of the whole. Five designs, each read back identical field by field and written twice to the same bytes, in Node:

| Design | On disk | First answer, cold | What it buys |
| --- | ---: | ---: | --- |
| JSON, gzipped | 2.74 MB | 1,913 ms | the baseline; any answer reads everything |
| A binary layout of our own | 2.21 MB | 117 ms | smallest; read with nothing but a browser's built-ins |
| SQLite, by Node's built-in module | 29.6 MB | 95 ms from memory, 20 ms read in place | a person can query it without our tool; 688 KB of WebAssembly in a page |
| Sorted lines of text, one fact a line, gzipped | 2.80 MB | 820 ms | `grep` and `diff` work on it; five commits of history held as one file plus each step's changed lines take 1.92 MB against 5.16 MB as five JSON files |
| The lines cut into parts named by their hash | 4.87 MB | 83 ms | unchanged parts held once across moments, which saved 25 % where line changes saved 63 % |

HDF5, which the owner named, fails two values by measurement: it stamps times into the file (32 bytes differ between two writes of the same facts) and cannot compress strings of varying length. SQLite's three reasons for leaving in January 2026, tested against today: it duplicated the docs (expires if it is the one store), its consumer went away (does not apply to derived facts), and its native module broke on Windows (expired: Node's own needs nothing compiled). Added to the next leg from the owner's words of the day: a size five times DNN's, slowed in a tab; whether each design can be written as facts arrive one file at a time; what a stopped scan leaves; and what "the same bytes" is for now that the stored form is not committed.

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

Since 2026-11-21 it has a second reason: this Linux's MSBuild cannot evaluate the owner's kind of project. Asked for each project's references, it answers for 50 of DNN's 84 project files and 21 of mojoPortal's 25; every one it stops on is an old-style web project importing Visual Studio's `Microsoft.WebApplication.targets`, which the SDK on Linux does not ship, or an import Windows finds only because it ignores case. So the C# graders can hold the reader to MSBuild's own reading of those projects only on Windows.

Under Windows PowerShell 5.1 and Node 26: a checkout with CRLF line endings, a script saved as UTF-16, a path with a space, a long path, names that differ by case alone refused. It makes real the nine checks [the Windows record](../AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md) says only a Windows machine can make.
