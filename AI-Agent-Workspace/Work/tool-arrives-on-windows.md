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
- holds: the function is on the day branch since 2026-11-21 (four legs, the last merged as `3e8813006`; [its record](../AgentSessionHistory/2026/11/2026-11-21/Probes/leave-out/README.md)): new files only, nothing of Node, nothing calling it yet, git's own answer its oracle for `.gitignore` and Microsoft's open-source client's for `.tfignore`; a folder's own ignore files are asked for when something inside it is decided, which is what a walk that lists lazily needs. Wiring it into discovery waits for the interface above. How a person sees and changes the choice is designed with [the scan that leaves no trace](scan-leaves-no-trace.md#choosing-what-a-scan-leaves-out-before-it-scans-on-either-surface)
- evidence:

### A scan's facts in one stored form, written by either host
- state: active
- holds: its research leg with a builder since 2026-11-21, on a branch `stored-form-research` (designs that differ in kind, each measured on real facts; no product code); the build itself is [the store's trial](../Memory/direction.md#engine-and-docs), given leave on 2026-11-19 and ordered after the readers' landing
- evidence:

The owner's bar for the form (2026-11-19): "Don't just settle for JSON by default. Do a lot of research to choose a format that is going to be right for what we need at scale and prove it by the efficiency gains that are reaped." The values that research trades, as listed then: read by the Explorer's page with no network and nothing installed; read and written by Node on Windows with nothing compiled; the same bytes for the same facts; a question answered without reading the whole. Since 2026-11-21 there is one more: written by a page, and carried inside the one HTML file that page saves. The command line keeps the facts in a folder that ignores itself, the page keeps them in itself, and Markdown is exported from either, one way, when a person asks.

**The research, three legs (2026-11-21, [its account](../AgentSessionHistory/2026/11/2026-11-21/Research/stored-form/README.md), merged into the day branch as `323828e41` and `eb7be2344`, its second leg read whole by root and its third by its changes; the choice is the owner's, put to them at 05:26 UTC, not made).** Seven forms holding the same facts, each read back identical field by field. The numbers that bear on the owner's machine are a Chromium tab slowed four times on two cores, on DNN (10,776 files) and on DNN repeated five times (53,880 files, which flatters forms that keep each string once):

| Form | Opens, DNN: first answer, whole map | Opens, five times DNN: first answer, memory | Saved page, DNN | Written as a scan goes, five times DNN | Read without our tool |
| --- | --- | --- | ---: | --- | --- |
| JSON, gzipped (today's index) | 3.2 s | 25.8 s, 1.3 GB | 3.65 MB | cannot | yes, unzipped |
| A binary layout of our own ("the press") | 0.15 s, 2.2 s | 1.0 s, 351 MB | 2.83 MB | 46 s, 305 MB | no |
| SQLite | 1.6 s, 5.0 s | 7.2 s, 819 MB | 6.19 MB | 132 s, 854 MB in a page; 28 s, 92 MB on disk in Node | yes, any SQLite tool |
| Sorted lines of text, one gzip | 1.8 s, 2.4 s | 12.2 s, 1.3 GB | 3.74 MB | 60 s, 314 MB | yes, `grep` and `diff` |
| The lines in gzip pieces with an index | 0.08 s, 15.7 s | 0.6 s, then 1.7 GB for the whole map, with its simplest reader | 3.98 MB | not finished in a tab | yes, `zcat`, `grep`, `diff` |
| Parts named by their hash | 0.17 s, 27 s | 0.9 s, 166 s for the whole map | 6.50 MB | not finished in a tab | partly |
| HDF5 | 0.8 s, 2.6 s, after 6.7 s for its 5.6 MB library to be ready | 1.5 s, 395 MB | 8.82 MB | cannot, as built | yes, HDF5 tools |

What it settled: JSON and the plain lines are out at fifty thousand files (1.3 GB to read in a tab). HDF5, which the owner named, writes different bytes for the same facts every time and weighs 5.6 MB in a page. SQLite is the best form on the command line alone (fastest read in place, least memory to write, a stopped scan kept to the last 512 files) and the worst to write in a page. Node and Chromium write byte for byte the same file for every form but SQLite (six header bytes) and HDF5, and "the same bytes" as the record uses it is met by naming a form's content with a hash. SQLite's three reasons for leaving in January 2026 were each tested: the duplication expires if it is the one store, its consumer's end does not apply to derived facts, and the native module's pain expired with Node's built-in. Five commits of history held as one file of lines and each step's changed lines take 1.92 MB against 5.16 MB as five JSON files.

**The third leg, the two finalists each at its best** (a tab slowed four times on two cores, taken in one hold of the browser):

| | The binary layout, made resumable | The indexed lines of text, with a careful reader |
| --- | --- | --- |
| DNN, 10,776 files: first answer, whole map, memory | 0.2 s, 2.0 s, 215 MB | 0.17 s, 7.0 s, 250 MB |
| Five times DNN: first answer, whole map, memory | 0.83 s, 11.0 s, 350 MB | 0.26 s, 27.6 s, 537 MB |
| A walk of the wires, five times DNN | 13 ms | 1.8 s (it keeps no array of them; adding one is untried) |
| Saved page, five times DNN | about 10 MB | about 20 MB |
| Read without our tool | no | `zcat`, `grep`, `diff` |

Most of what the indexed lines cost in the second leg was their simplest reader's (1.7 GB became 537 MB, 69 s became 27.6 s); what remains is the form's: every line is JSON to parse. The binary layout was made resumable and self-naming for 6 to 10 % more bytes: each section labelled, the footer a hash of its content.

**A page that keeps a scan, and saves itself, is shown possible.** A page opened from disk put each finished piece into IndexedDB as the scan went (no more memory, at most 15 % more time). The browser was closed at sixty percent; a new browser found 6,400 of DNN's files in 3.4 s (32,512 of the larger corpus's in 4.1 s) and finished to the same bytes an unstopped scan writes, in Node or in a page. The page then built a copy of itself with the facts inside in under half a second at 53,880 files (10 MB), and the copy opened from disk and answered. Not measured: writing into a folder the person picks (its dialog cannot be driven), IndexedDB's allowance on a machine with a few gigabytes free, a browser killed outright.

**For the engine's sink,** written into [the design](../../.mdmd/layer-3/engine-and-hosts.mdmd.md): facts handed over in path order, the engine owing a bound on how far out of order its readers finish (a wait of about five hundred files costs 20 to 55 MB; a sort at the end holds the whole scan); and each file's dependents built after the last file.

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
