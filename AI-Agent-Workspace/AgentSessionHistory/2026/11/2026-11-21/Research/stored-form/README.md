# In what stored form should a scan's facts be kept?

Historical research of 2026-11-21, by a builder for the root, on branch `stored-form-research` from `70a3b9481`. It changed no product code and decides nothing.

**Status: second milestone, in progress.** Done:
- the Node measurements of all seven forms, at DNN's size and at five times it;
- the tab's at DNN's size for six of them;
- the tab's reads at five times DNN for most of them.

Still waiting for the browser lane when this was written: the indexed ledger in a tab, and HDF5's and the parts' rows at five times. Those rows say "pending".

## The question, in the owner's words

On 2026-11-19: "Don't just settle for JSON by default. Do a lot of research to choose a format that is going to be right for what we need at scale and prove it by the efficiency gains that are reaped." Earlier, the same day: "HDF5 has interested me as a file format in general."

On 2026-11-20, of the values a format must serve: "Reality will likely push back against us and force us to be unable to maximize all of our values simultaneously." And: "Nudge dimensions and requirements to permute the idea space and find those actual interesting local minima that we would think of as logical-endpoint ideas along various logical experiment trajectories."

On 2026-11-21, of the machine: "Absolute crap VM ... 8GB of RAM and a handful of GB of remaining storage". "We want this to be able to run on absolute garbage, even if some amount of precomputation time with reasonable progress indicators is required to do so." Of scale: "over 100k files in just the portion of TFS I have cloned ... tens of thousands of code files sounds reasonable". Of the tool: "Each copy of Live Documentation Explorer should be capable of writing a new fresh blank copy of Live Documentation Explorer, eagerly ready to take in its first scan!" And: "Nothing leaves the machine".

## 1. The answer first: seven forms, what each costs and buys

Each form below holds the same facts: every field of every file of a scan, as today's graph holds them. Each was read back and held to the facts field by field, and every one read back identical. The numbers are for DNN Platform (10,776 files), read in a Chromium tab slowed four times on two processor cores, the nearer of the two conditions to the owner's machine. Five times DNN is in section 6.

| Form | What it is | Opens on a weak machine: first answer, then the whole map | Saved page carries | Write in a slowed tab, as facts arrive: time, peak memory | Read without our tool | A closed tab or stopped scan |
| --- | --- | --- | --- | --- | --- | --- |
| **JSON, gzipped** (today's index, the baseline) | one text, compressed | 3.2 s, then nothing more | 3.65 MB | cannot: every file's dependents must be known first. All at once: 11.5 s, 625 MB | yes, after unzipping (any editor, `jq`, PowerShell) | nothing is left |
| **The press** | our own binary layout: a table of where things are, the wires as plain arrays of numbers, each section compressed on its own | **0.15 s**, then 1.7 to 2.2 s | **2.83 MB** | **8.7 s, 243 MB** | no: needs our reader | prefix left; readable only if each section is given a small label (not built) |
| **The database** (SQLite) | tables of files, symbols, dependencies and edges | 1.6 s, then 5.0 s | 6.19 MB, of which 0.99 MB is the SQLite engine | 17.2 s, 317 MB (in a tab the database is in memory, whole) | **yes, with any SQLite tool**; in Node it is read in place on disk | on disk (the command line): everything up to the last 512 files. In a tab: nothing |
| **The ledger** | one fact per line, sorted by path, gzipped | 1.8 s, then 2.4 s | 3.74 MB | 15.4 s, 227 MB | **yes, with `grep`, `diff`, any editor** after unzipping | on disk: all but the last few dozen files |
| **The store of parts** | the ledger cut by directory, each part named by its fingerprint | 0.17 s, but the whole map 27 s | 6.50 MB | 47.3 s, 196 MB | yes, part by part, with our small reader | each finished directory, if parts are kept as files |
| **The indexed ledger** (built last) | the ledger in gzip pieces of 256 files, each piece's header saying where it lies, then each file's dependents as lines | pending in the tab; in Node 0.11 s to the first answer (the plain ledger's is 0.82 s), then 1.1 s | 3.98 MB | pending in the tab; in Node 2.4 s, 245 MB | **yes, with `zcat`, `grep`, `diff`**, as the ledger | **every finished piece is whole and readable**, in a page or in Node |
| **HDF5** (the owner's) | the press's sections held as HDF5 datasets | 0.82 s, then 2.6 s | 8.82 MB, of which 5.6 MB is its library | cannot, as built. All at once: 20.0 s, 384 MB | **yes, with HDF5 tools** (h5py, HDFView) | not measured |

What the columns mean:
- **Opens on a weak machine** is the time from the page's data to the answer of "what depends on `Globals.cs`" (632 files), and then to every fact of every file, as the Explorer loads a map today.
- **Saved page carries** is the bytes of a page holding the facts and the code that reads them: what a person saves, mails or keeps.
- **Write as facts arrive** is the engine handing each file's facts over one at a time, the way the proposal for the engine and its hosts has it. The figure is the whole tab's peak memory at the write's end. An empty page holding the reader stands at about 190 MB of that.

What the table says, in plain words:
- **JSON loses on every count but one.** It is slowest to open, cannot be written as facts arrive, and leaves nothing behind when a scan stops. What it keeps is that a person can read it.
- **The press opens twenty times faster than JSON and carries the smallest page.** Written as facts arrive, it takes about as little memory in a tab as any form: 243 MB, against the ledger's 227 and the parts' 196. What it gives up is that a person can read it without our tool.
- **The ledger keeps what the Markdown was best at:** `grep` and `diff` work on it. At DNN's size it is about JSON's size and opens about twice as fast. At five times DNN its reader, as built, needs 1.3 GB in a tab, as JSON does.
- **The database opens about twice as fast as JSON and answers questions in SQL with tools a person may have.** In a page it costs a megabyte of engine, and memory the size of the database.
- **The indexed ledger, built last, keeps `grep` and answers as fast as the press.** Every finished piece survives a stopped scan. Loading its whole map costs what the plain ledger's does. Its tab numbers are pending.
- **The store of parts is the form for many moments and many scans.** It is not the form for loading one map whole in a page.
- **HDF5 writes different bytes each time** for the same facts, because it stamps times into the file and h5wasm offers no way to turn that off.

## 2. The values, and what each form bends

The owner's values, as the brief listed them (the eighth was the Markdown's strength), and one the root added for a stopped scan. "Bent" means the form gives up some of the value to buy another.

| Value | JSON | Press | Database | Ledger | Indexed ledger | Parts | HDF5 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Read by the page with nothing installed | holds | holds, 11 KB of reader | bent: 0.99 MB of WebAssembly engine | holds, 10 KB | holds, 12 KB | holds, 13 KB | bent: 5.6 MB of WebAssembly library |
| 2. Node on Windows, nothing compiled | holds | holds | holds: `node:sqlite` is built in (release candidate in Node 26) | holds | holds | holds | holds: WebAssembly |
| 3. Same bytes for the same facts | holds, and the same in Node and Chromium | holds, and the same in Node and Chromium | bent: the same within one engine; 6 header bytes differ between Node's and the page's engine | holds, and the same in Node and Chromium | holds in Node; the tab pending | holds, and the same in Node and Chromium | **bent**: two writes differ |
| 4. A question without reading the whole | **bent**: everything is inflated and parsed | holds | holds; in Node truly, pages read from disk; in a page the whole is in memory | bent: the whole is inflated, but not parsed | holds | holds | holds |
| 5. Written by a page and carried in one HTML file | holds, all at once | holds, as facts arrive | holds, in memory | holds, as facts arrive | holds, as facts arrive | holds, as facts arrive | holds, all at once |
| 6. The weak machine (bytes, memory, time to open) | worst | best | largest on disk (10 times the press), middling to open | middling at DNN, 1.3 GB to read at five times | about the ledger's size; pending in the tab | largest page | small file, heavy page (5.6 MB of library) |
| 7. Many scans, many moments | one file each, nothing shared | one file each | one file each, or several attached in one SQL session | one file each; history as line deltas, the best measured | as the ledger | one pool, unchanged parts once | groups in one file |
| 8. Usable without our tool | yes | **bent**: no | yes, with any SQLite tool | yes, best | yes, as the ledger | partly | yes, with HDF5 tools |
| (root's) A stopped scan can go on | no | not as built | yes, on disk | yes, on disk, read by Node | **yes, every finished piece**, in a page or in Node | yes, if parts are files | not measured |

## 3. The data's shape

Two real scans, each made by today's generator straight from its models, with nothing written into the scanned folder ([`scripts/facts.cjs`](scripts/facts.cjs), the November 19 survey's method):
- **this repository** at `70a3b9481`: 1,134 files;
- **DNN Platform** at `9bc6b06f4f15d11f6e52446505ec3117a7c84200`: 10,776 files, fetched shallow and anonymously.

A third, **five times DNN**, is DNN's facts repeated under five folders, each copy wired only inside itself ([`scripts/scale.mjs`](scripts/scale.mjs)): 53,880 files, 199 MB as compact JSON. It is not a real repository. Its strings repeat across the copies more than five real solutions' would, which flatters every form that keeps each string once (the press, the database, HDF5); its numbers say so where they are used.

Measured by [`scripts/shape.mjs`](scripts/shape.mjs); the raw numbers are in [`results/shape-dnn.json`](results/shape-dnn.json) and [`results/shape-self.json`](results/shape-self.json).

| | This repository | DNN |
| --- | ---: | ---: |
| Files | 1,134 | 10,776 |
| Public symbols | 4,244 | 41,618 |
| Docstring sections under them | 3,155 | 44,183 |
| Dependency lines | 7,667 | 31,071 |
| Edges (dependencies and type references) | 9,375 | 44,598 |
| File-to-file wires (the adjacency) | 3,047 | 24,948 |
| As one compact JSON text | 6.98 MB | 39.0 MB |

**Where the bytes are in DNN's JSON:**
- edges, 25 %;
- symbols' names, kinds and lines, 17.5 %;
- docstrings, 11.2 %;
- the adjacency lists, 9 %;
- dependency lines, 8.7 %;
- type references, 6.1 %;
- the doc path, which is derivable from the file's path, 2.9 %.

In this repository the written words (the authored block) are the largest part, 28 %. In DNN they are 2.7 % (the two placeholder texts).

**Strings repeat, a great deal.** DNN's facts hold 475,296 strings. Only 109,035 are distinct: 15.3 MB of string bytes, of which 5.8 MB are distinct.

**Paths share their beginnings.** Sorted, each path shares 77 % of its bytes with the one before it. For example, `DNN Platform/Library/Common/Globals.cs` follows `DNN Platform/Library/Common/FileItem.cs`.

**The kinds are small vocabularies:**
- 28 symbol kinds (method 16,937, property 10,049, class 3,651 …);
- 7 edge kinds (import 31,066, parameter 9,183, returns 2,344 …);
- 3 archetypes;
- 11 docstring section titles.

**The graph is sparse and lopsided.**
- The median file has no inbound wire and no outbound wire; 6,563 of 10,776 have nothing depending on them.
- The most depended-on file (`DNN Platform/Library/Common/Globals.cs`) has 632.
- The median file has one public symbol; the largest has 524.

**What the real questions read**, against the whole (DNN):

| Question | What it reads | Share of the whole |
| --- | --- | ---: |
| What depends on this file | the file's inbound list and the paths it names | 44 KB with a stored inbound list. Without one, every edge's target: 8.4 % |
| What is reachable from here | the outbound lists of the 1,208 files the walk reaches from an import controller | 1.3 % |
| The Local Map of one file | the whole record of the file and of each file wired to it | a typical file, 5 records; the hub, 661 records and 32 % |
| What changed between two commits | two scans; per file, whether its own facts differ | section 10 |

So three of the four questions read a few percent of the whole, provided the form keeps the adjacency and lets one file's record be found alone. The fourth, at the hub, reads a third.

## 4. What exists

A survey of each candidate's own documentation and published packages was made by one subagent of my tier (general-purpose). It checked some claims by running the packages under Node 26 with code generation from strings disallowed, which imitates the page's policy. The facts that shaped the designs:

- **HDF5** (`h5wasm` 0.10.3, libhdf5 2.0.0): its WebAssembly is embedded in its script, 3.55 MB of it; as bundled here the page's script is 5.6 MB. It runs under the page's policy.
  - It stamps object times into the file, and h5wasm offers no switch to turn them off (HDF5's own `H5Pset_obj_track_times` is not exposed).
  - It refuses to compress variable-length strings, so strings must be stored as bytes.
- **SQLite**:
  - `node:sqlite` is built into Node: added in 22.5, without a flag since 22.13, a release candidate since 25.7. Its `serialize()` and `deserialize()` arrived in 26.1.0.
  - `sql.js` 1.17 runs in a page from one script that carries its WebAssembly inline: 688 KB of WebAssembly, 0.99 MB as script.
  - SQLite's own WebAssembly build (879 KB) can be handed its bytes only through an option its documentation says it does not support.
- **DuckDB in a page** needs workers and about 36 MB of WebAssembly: ruled out for the page. DuckDB on a person's machine can query Parquet, CSV, JSON lines and SQLite files, so it matters as a tool a person may have.
- **Parquet**:
  - `hyparquet` reads in pure script (207 KB unminified); `hyparquet-writer` writes.
  - Only Snappy compression is built in.
  - Not measured here; see section 12.
- **Arrow** (`apache-arrow` 21.2): its writer calls `new Function`, which the page's policy forbids. Its dictionary ids depend on what the process did before, so two writes of the same table can differ.
- **Avro, and Protocol Buffers by reflection**, fail under the policy. Protocol Buffers is "not (and cannot be) canonical" by its own documentation.
- **The browser's own compression** in Chromium is gzip, deflate and raw deflate. Brotli and zstd are not offered by `CompressionStream` in Chrome or Edge.
- **Measured here:**
  - Chromium 149's `DecompressionStream` refuses two gzip members one after the other ("Failed to fetch"), as Node 26's does ("Trailing junk"). So a page cannot read a file made of several gzip pieces without a table of where each begins.
  - IndexedDB opens in a page opened from disk.

## 5. The forms

Each form is one module under [`scripts/designs/`](scripts/designs/), and each runs unchanged in Node and in a page, using only what both have (`CompressionStream`, `DataView`, `TextDecoder`, `crypto.subtle`), except where it names a library.

- **JSON gzipped** ([`d0-json.mjs`](scripts/designs/d0-json.mjs)): today's index as one compact text, gzipped. Answering anything reads everything.
- **The press** ([`d1-press.mjs`](scripts/designs/d1-press.mjs)): a binary layout of our own.
  - A table of where every section lies.
  - The paths.
  - The adjacency as plain arrays of 32-bit numbers, used as they lie.
  - Every other string once, in blocks of 4,096.
  - Each file's record in chunks of 256, its strings named by number.
  - Each section is compressed on its own, so a question inflates only what it reads.
  - **Written as facts arrive** ([`d1s-press-stream.mjs`](scripts/designs/d1s-press-stream.mjs)): a string takes its number when it is first met, each block and chunk is compressed and set down as it fills, and the table is written last, as a footer. This is *smaller* than the first version, which numbered strings most frequent first: 2.11 MB against 2.21 MB on DNN. Strings first met together are stored together, and compress better so.
- **The database** ([`sqlite-core.mjs`](scripts/designs/sqlite-core.mjs)): an SQLite file whose tables are files, symbols, dependencies and edges, indexed on what an edge points at. A symbol's type references and docstring are JSON in a column.
  - Written and read by `node:sqlite` in Node ([`d2-sqlite-node.mjs`](scripts/designs/d2-sqlite-node.mjs)), whole from memory or in place on disk ([`d2-sqlite-disk.mjs`](scripts/designs/d2-sqlite-disk.mjs)).
  - Written and read by sql.js in a page ([`d2-sqlite-page.mjs`](scripts/designs/d2-sqlite-page.mjs)), carried gzipped since an SQLite file is mostly the slack of its pages (29.6 MB raw, 3.9 MB gzipped on DNN).
- **The ledger** ([`ledger-core.mjs`](scripts/designs/ledger-core.mjs), [`d3-ledger.mjs`](scripts/designs/d3-ledger.mjs)): one fact per line, sorted by path, each line a JSON array that begins with the path, the whole gzipped. For example, `["DNN Platform/Library/Common/Globals.cs","G",3,"import",…]` is one edge.
  - What depends on a file is every edge line naming it, so `grep` finds it.
  - The `diff` of two ledgers is the change in the facts.
  - It stores no adjacency: the wires are read from the edge lines.
- **The store of parts** ([`d4-parts.mjs`](scripts/designs/d4-parts.mjs)): the ledger cut by directory, each part named by the SHA-256 of its lines. One file holds many moments or many scans, with every unchanged part once.
- **The indexed ledger** ([`d6-ledger-indexed.mjs`](scripts/designs/d6-ledger-indexed.mjs)), built late in this leg when the measurements pointed at it. It is the ledger's lines written as a run of gzip pieces, one per 256 files.
  - Each piece carries in its gzip header (the optional "extra" field, which `gunzip` ignores) its compressed length, the first path it holds, and how many files.
  - After the files' pieces come pieces of lines such as `["DNN Platform/Library/Common/Globals.cs","I",[…the 632 files that depend on it…]]`.
  - To `zcat`, `gzip -d` and `grep` the file is one text; `gzip -t` passes it.
  - A page hops from header to header without inflating anything, then inflates only the pieces a question needs.
- **HDF5** ([`hdf5-core.mjs`](scripts/designs/hdf5-core.mjs), with [`d5-hdf5-node.mjs`](scripts/designs/d5-hdf5-node.mjs) and [`d5-hdf5-page.mjs`](scripts/designs/d5-hdf5-page.mjs)): the press's own sections held as named HDF5 datasets, each chunked and deflated by HDF5's filter.
  - HDF5, not our layout, provides the container, its table of contents and the partial reads.
  - The wires are four arrays of numbers that any HDF5 tool shows as they are.

## 6. Measurements

All measurements were taken on a shared machine of 20 threads, at a load of 6 to 16. The tab's conditions are those of [the scan in a tab](../../Probes/scan-in-a-tab/README.md): headless Chromium 149, the page opened from disk under a policy of one hashed script plus `'wasm-unsafe-eval'` and no network, a fresh browser per run, and "slowed" meaning `Emulation.setCPUThrottlingRate` 4 with the whole browser held to two cores (`taskset -c 0,1`). Every page's data is carried inline as base64; getting it out took 5 to 50 ms everywhere (`Uint8Array.fromBase64`).

Each table is printed from the raw results by `node scripts/tables.mjs results`.

### DNN in a tab (10,776 files)

| Form | Saved page | Of which the reader | First answer, full speed | First answer, slowed | Hub's Local Map, slowed | Whole map, slowed | Tab's peak memory |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| JSON gzipped | 3.65 MB | 5 KB | 634 ms | 3.2 s | 5 ms | (in the first) | 327 MB |
| Press | 2.96 MB | 11 KB | 37 ms | 160 ms | 1.7 s | 1.7 s | 215 MB |
| Press, written as facts arrive | 2.83 MB | 12 KB | 36 ms | 152 ms | 1.8 s | 2.2 s | 215 MB |
| Database (sql.js) | 6.19 MB | 989 KB | 335 ms | 1.6 s | 1.7 s | 5.0 s | 349 MB |
| Ledger | 3.74 MB | 10 KB | 396 ms | 1.8 s | 0.8 s | 2.4 s | 381 MB |
| Parts | 6.50 MB | 13 KB | 31 ms | 166 ms | 9.8 s | 27 s | 443 MB |
| HDF5 | 8.82 MB | 5.6 MB | 109 ms | 815 ms | 2.7 s | 2.6 s | 231 MB |
| Indexed ledger | 3.98 MB | 12 KB | pending | pending | pending | pending | pending |

The parts' whole map is slow in a page because the browser's own decompressor is started once per part (2,087 parts here), and each start costs time a slowed tab feels. The press starts it about 50 times.

### Writing in a tab, DNN, slowed (pending rows are still running)

| Form | All at once: time, tab's peak | As facts arrive: time, tab's peak |
| --- | --- | --- |
| JSON gzipped | 11.5 s, 625 MB | cannot |
| Press | 10.3 s, 427 MB | 8.7 s, **243 MB** |
| Database (sql.js) | 12.2 s, 483 MB | 17.2 s, 317 MB |
| Ledger | 11.9 s, 659 MB | 15.4 s, 227 MB |
| Parts | 49.4 s, 382 MB | 47.3 s, **196 MB** |

The parts are slow to write in a tab for the reason they are slow to read there: about two thousand small compressions, and as many SHA-256s through `crypto.subtle`, each a wait.

### Five times DNN in a tab, slowed (53,880 files)

This is the root's test of growth: a form fine at ten thousand files that needs gigabytes at fifty thousand is out.

| Form | Saved page | First answer | Hub's Local Map | Whole map | Tab's peak reading | Write as facts arrive: time, peak | Write all at once: time, peak |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| JSON gzipped | 18.3 MB | **25.8 s** | 6 ms | (in the first) | **1,309 MB** | cannot | pending |
| Press | 9.20 MB | 1.1 s | 3.4 s | 17.8 s | 347 MB | (as below) | pending |
| Press, written as facts arrive | 9.10 MB | 1.0 s | 1.8 s | 13.0 s | 351 MB | 45.9 s, 305 MB | (not this way) |
| Database (sql.js) | 27.1 MB | 7.2 s | 2.4 s | 26.0 s | 819 MB | **132 s, 854 MB** | pending |
| Ledger | 18.8 MB | **12.2 s** | 1.6 s | 11.1 s | **1,298 MB** | 59.5 s, 314 MB | pending |
| Parts | 33.2 MB | pending | pending | pending | pending | more than 160 s: cut by the lane's five-minute hold before it finished | pending |
| HDF5 | 15.5 MB | 1.5 s | 1.9 s | 13.0 s | 395 MB | (cannot, as built) | pending |
| Indexed ledger | 20.0 MB | pending | pending | pending | pending | pending | (not this way) |

**What grows out of proportion, read in a tab at five times DNN:**
- **JSON:** 26 s to the first answer and 1.3 GB, because it must inflate and parse everything first.
- **The ledger, as its reader is built:** 12 s and 1.3 GB. The reader holds the whole text as one string and indexes its lines.
  - A ledger compressed in ranges of lines, as the press compresses its chunks, would not need that.
  - But then it is no longer one gzip that a person unzips and greps.
- **The press:** 1 s to the first answer and about 350 MB, from a page of 9.1 MB. HDF5, which holds the press's own sections, grows the same way (1.5 s, 395 MB), from a page of 15.5 MB.
- **The database:** 7 s and 819 MB, the database whole in the tab's memory.
- **Writing as facts arrive grows gently for the press and the ledger:** about 310 MB at five times DNN, against about 235 MB at DNN.
- **The database written in a tab does not grow gently:** 317 MB at DNN, 854 MB and more than two minutes at five times. In a page the whole database lives in the WebAssembly memory and is copied out whole at the end. In Node, on disk, the same writing takes 92 MB.

### Node, DNN and five times DNN

Each read is cold, in a fresh process, the median of three. "Write peak" here is with the whole graph already in memory, from parsing a 39 MB or 199 MB JSON file. The fair comparison of writing is the next table.

| Form | DNN: on disk | DNN: first answer | DNN: whole map | 5×: on disk | 5×: first answer | 5×: whole map | 5×: read peak |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| JSON gzipped | 2.74 MB | 1.9 s | (in the first) | 13.75 MB | 7.0 s | (in the first) | 1,258 MB |
| Press | 2.21 MB | 117 ms | 0.43 s | 6.89 MB | 238 ms | 2.4 s | 388 MB |
| Press, as facts arrive | 2.11 MB | 165 ms | 0.65 s | 6.81 MB | 445 ms | 3.9 s | 388 MB |
| Database, whole in memory | 29.6 MB | 95 ms | 0.65 s | 149 MB | 443 ms | 3.3 s | 927 MB |
| Database, in place on disk | 29.6 MB | **20 ms** | 0.58 s | 149 MB | **162 ms** | 4.0 s | 636 MB |
| Ledger | 2.80 MB | 820 ms | 0.57 s | 14.08 MB | 4.1 s | 3.0 s | 1,230 MB |
| Parts | 4.87 MB | 83 ms | 1.6 s | 24.91 MB | 340 ms | 13.1 s | 896 MB |
| Indexed ledger | 2.98 MB | 106 ms | 1.1 s | 15.00 MB | **164 ms** | 9.7 s | **1,548 MB** |
| HDF5 | 2.41 MB | 214 ms | 0.55 s | 7.46 MB | 379 ms | 2.9 s | 404 MB |

HDF5 wrote different bytes on its two writes, on every corpus; every other form wrote the same bytes twice.

The indexed ledger answers a question as fast as the press: "what depends on" is one line in one piece. Loading its whole map costs what the plain ledger costs, since every line is JSON to parse: 1.5 GB at five times DNN as its reader is built, against the press's 388 MB. Its reader is the simplest that works. It finds a file's lines by searching a piece's text, which also makes the hub's Local Map slow (2.0 s at DNN against the press's 0.3 s); a reader that indexed each piece once would do better, and was not built.

### Writing in Node as facts arrive, against all at once

From a file of one line per file ([`scripts/run-stream.mjs`](scripts/run-stream.mjs)), so that the input itself is never whole in memory. Node's own reading of the lines stands at about 70 MB of each figure.

| Form | DNN, all at once | DNN, as facts arrive | 5×, all at once | 5×, as facts arrive |
| --- | --- | --- | --- | --- |
| JSON gzipped | 2.5 s, 376 MB | cannot | 8.1 s, 1,372 MB | cannot |
| Press | 2.7 s, 269 MB | 2.3 s, 188 MB | 8.1 s, 564 MB | 7.5 s, **255 MB** |
| Database, on disk | 2.3 s, 288 MB | 2.8 s, **76 MB** | 8.5 s, 1,033 MB | 27.7 s, **92 MB** |
| Ledger | 2.4 s, 461 MB | 2.6 s, 146 MB | 22.2 s, 1,623 MB | 25.6 s, 185 MB |
| Parts | 3.2 s, 344 MB | 3.9 s, 252 MB | 25.6 s, 910 MB | 15.8 s, 418 MB |
| Indexed ledger | (not this way) | 2.4 s, 245 MB | (not this way) | 11.5 s, 460 MB |

Every output was read back identical to the facts. The ledger and the parts wrote the same bytes both ways; the press and the database differ between the two ways by design (section 5).

**How each grows from DNN to five times DNN, written as facts arrive:**
- **The database on disk barely grows** (76 to 92 MB): its rows go to disk as they come.
- **The ledger barely grows** (148 to 185 MB): it keeps nothing but the compressor's window.
- **The press grows a little** (195 to 255 MB): it keeps every distinct string, the paths and the wires until the end.
- **The parts grow most** (252 to 418 MB): they keep every directory still open, and every wire.

Written all at once, every form needs the whole graph in memory first: 0.6 to 1.6 GB at five times DNN in Node. JSON needs 1.4 GB at that size and cannot do otherwise.

## 7. Facts arriving one file at a time

The proposal for the engine and its hosts (`.mdmd/layer-3/engine-and-hosts.mdmd.md` on the day branch) has the engine hand each file's facts to a sink the host supplies, yielding between files so that a progress bar can move. What each form needs of that sink:

| Form | Written as facts arrive? | What it holds until the end | What it needs of the order |
| --- | --- | --- | --- |
| JSON | **no**: each file's record holds its dependents, known only at the end. A second pass over a spilled copy would work, at the cost of writing everything twice | everything | none |
| Press | **yes**, as built here, with strings numbered as first met. The first version, numbering them most frequent first, needs two passes: every record held (in Node 269 MB against 188 at DNN, 564 against 255 at five times) or read twice. That bought nothing: the one-pass file is 4.5 % smaller | every distinct string (5.8 MB on DNN), the paths, the wires as numbers | path order, so that its sections are sorted; otherwise a sort of the path table at the end |
| Database | **yes** | nothing on disk; in a page, the whole database in memory | none: a file's number is given when its path is first met, even as an edge's target |
| Ledger | **yes**, and its bytes are the same as written all at once (checked by hash, in Node and in the tab) | nothing but the compressor's window | **path order, strictly**. Otherwise its lines must be sorted at the end: all held, or sorted runs merged |
| Parts | **yes**, the same bytes as all at once | each directory still open, and the wires | path order, or files grouped by directory |
| Indexed ledger | **yes**; its dependents' pieces are written at the end | the current 256 files' lines, the paths, the wires | path order, as the ledger |
| HDF5 | **no**, as built: h5wasm writes one dataset at a time from a whole array. HDF5 can extend chunked datasets, which was not tried | everything | none |

**Where this research meets the proposal's sink.** It does not contradict it, with two conditions the proposal does not yet state:
- **The order in which facts arrive matters** to three of the forms: in path order. If the engine hands files over in the order its readers finish them, the ledger and the press each need a sort at the end, and the ledger then holds everything.
- **A file's dependents are known only at the end.** A sink that answers "what depends on this" must build that list itself after the last file. Every form here does so from the outbound wires, which it keeps as numbers. The `Cited By` side, a document's links to a file, has the same property.

## 8. A stopped scan

**This value is the root's, not the owner's, and is ranked below theirs.** A scan of tens of thousands of files on a weak machine may be closed mid-way. Each form, stopped after 60 % of DNN's files ([`scripts/stopped.mjs`](scripts/stopped.mjs)):

- **The database on disk** (the command line) keeps every batch committed before the stop: 6,144 of the 6,465 files handed over, with batches of 512. The open batch is rolled back when the file is next opened. The scan can go on after the last path held.
- **The ledger on disk**, appended to as it is made, holds a prefix of the gzip stream. Node's zlib reads it back up to the cut: 6,376 of the 6,465 files whole, the rest still in the compressor's window when it stopped. The scan can go on after the last whole file. A page's `DecompressionStream` refuses a cut stream; the reading back is Node's.
- **The indexed ledger**, appended to as it is made, holds every finished piece whole: 6,400 of the 6,465 files handed over, in 25 pieces. It is a valid gzip file as it stands: `gunzip` reads it, and so does our reader, which hops its headers. The scan can go on after the last piece, in a page as in Node, since no cut stream need be inflated.
- **The press**, appended to as it is made, holds its compressed sections but not the footer that says where they are. As built, it cannot be read. A label of a few bytes before each section (its kind and length) would make it readable and resumable. Not built.
- **The parts** hold each finished directory, whole and named, if each part is written as a file of its own. In one file they are as the press.
- **JSON** holds nothing until the end.
- **In a tab**, every form lives in the page's memory and is lost when the tab closes, unless the page sets it down as it goes. A page opened from disk can open IndexedDB (measured). A Chromium page can also write into a folder a person picked, after asking (not measured here). The forms that can be set down in pieces are the ledger, the press and the parts. The database in a page cannot: sql.js holds it whole, and saving it means exporting it whole each time.

## 9. "The same bytes for the same facts": what for, and who meets it

**What the record says it is for.** The value is the root's, offered on 2026-11-20 among four things "any format must do": "3. The same facts give the same bytes, so runs can be compared." The owner's answer made the four values to be traded, not gates. The root's own note the same night: "bending 'the same bytes' admits containers that are compared by content".

What comparing runs means here, read in the record and the code:
- **The history's proofs** compare two derivations of one repository by `cmp` and `diff -r`: a run that continues against one made whole.
- **The caches** are keyed by what made them (the lens: the generator's code and the configuration), not by their output's bytes.
- **The text store** names each text by the hash of its content.
- **Tests and the oracles** compare facts field by field.

None of these needs one form's file to be identical on two hosts. All need a cheap, certain way to say that two scans hold the same facts. **So the value is met by any form whose content can be named**, by a hash over its facts in a canonical text or over its uncompressed sections, with the compression only a wrapping. It would need the file itself identical only if the file were committed and diffed, or shared and checked by its hash, and nothing derived is committed now.

**Measured, DNN's facts written in Node 26 and in Chromium 149:**
- **JSON, the press (both ways of writing it), the ledger and the parts:** byte for byte the same file in both. Both link Chromium's fork of zlib (Node reports `1.3.2.1-motley`), and a sample of the same input gave the same raw deflate and gzip bytes in both. That is a fact of today's builds, not a promise. A Node built against another zlib could differ, so the rule that survives is to name the content.
- **The facts' hash** over the canonical text, read back from each of the eleven files written in the tab and in Node: the same for every form, `884045c3…`.
- **The database:** node:sqlite and sql.js write files of the same length, 29,560,832 bytes, differing in 6 bytes of the header: the change counter, the schema cookie, and the version of the library that last wrote it ([`results/sqlite-hosts-dnn.json`](results/sqlite-hosts-dnn.json)). The pages are the same. Written as facts arrive, the database differs from the one written all at once, since a file's number is then given in the order paths are met. Within one way of writing and one engine, two writes were the same.
- **HDF5:** two writes of the same facts gave different files, on every corpus in Node and twice in the tab. The facts' hash read back from both tab writes is the same `884045c3…`.

**Judged against that purpose:**
- JSON, the press, the ledger and the parts meet it fully.
- The database meets it once the header is left out of the comparison, or by naming its content.
- HDF5 meets it only by naming its content, since its own file can never be compared.

## 10. Many moments of one folder, and many scans

Five commits of this repository between November 18 and 21 (`0e88714c8`, `cfe683fc5`, `44fc8028a`, `682ec1a55`, `70a3b9481`), each scanned by today's generator over that commit's tree, which is the history's one lens. Measured by [`scripts/history.mjs`](scripts/history.mjs), raw numbers in [`results/history.json`](results/history.json).

| Held as | Bytes for all five |
| --- | ---: |
| Five JSON files, gzipped | 5.16 MB |
| Five press files | 4.65 MB |
| Five ledgers | 5.37 MB |
| One ledger, then each step's lines added and removed | **1.92 MB** |
| One file of parts, each distinct part once (76 % of the 1,355 parts named were shared) | 3.89 MB |

All four forms gave the same answer to "what changed between the first and the last": 99 files born, 3 deleted, 197 changed. The parts answered by reading 72 of 273 parts, and the ledger by comparing lines.

Directory parts share three quarters of themselves, yet save only a quarter of the bytes. A directory that changed is stored whole again, and each part is compressed without the others' context. The ledger's line deltas save twice as much.

**What becomes of today's history.** The history's sequence (`live-docs-history/3`) is already a form of its own: paths interned once, each step a delta, a keyframe every 256 steps, the words in a store by directory. It is derived from per-commit summaries, not from the stored facts, so every form here leaves it as it is.
- The ledger would let a history be its first moment and then line deltas. That is the same idea as the sequence, in text.
- The parts would let the per-commit summaries and the text store become one pool.
- Neither is needed to choose the stored form.

**Many scans on one board.** A scan's facts stay inside the scan, the trial's ruling, so a board names several files. Each form composes them its own way:
- JSON and the press: one file per scan, nothing shared.
- The database: several files attached in one SQL session, queried together.
- The ledger: concatenated, if the scan's name is put before each path.
- The parts: one pool, sharing only files that are byte for byte alike, such as a library vendored into two solutions.
- HDF5: groups in one file.

## 11. What was tried before: SQLite, and whether its reasons still hold

SQLite was this product's graph store and was removed in three commits: on 2026-01-12 (`0d89e857`), its schema on 01-13 (`cb35a274`), and its last script on 01-15 (`59665f98`). The decisions log records "replaced by the mirror itself; 'Live Docs ARE the database.'" The session of 01-12 gives the reasons:

1. **It duplicated the docs.** In the agent's words that day, on the path the owner took: "Two systems: generation pipeline + SQLite graph. Duplicated edge knowledge." It also held a second, hard-coded idea of what a code file is: the owner asked, "one would supposedly need _two separate configurations_ to determine what is and what is not a code file, no?" **Expired for a form that is the one store with Markdown only exported.** It would hold again if Markdown stayed a store beside it.
2. **Its consumer went away.** The ripple analyzer and the persisted acknowledgements ended when the owner asked: "could detection of link breakages -- broken links between files (let's say that the user changes the name on a CSS file depended on by an HTML file) be **stateless**? If so, the entire question about persistence becomes moot." **Does not apply.** The stored facts are derived, not a person's state. Every form here is a cache that must prove itself fresh, which the trial already gives up: the 2026-09-28 reason that the index "is not a cache".
3. **The native module.** In October 2025 `better-sqlite3` was built for the wrong runtime, and it crashed Windows tests under parallel workers ("No concurrency in the unit tests, no more problems", 2025-10-25). **Expired for Node.** `node:sqlite` is part of Node, with nothing compiled. In a page, sql.js is 0.99 MB of script.

What still counts against SQLite today, measured:
- its file is ten times the press's on disk;
- in a page it is held whole in memory and cannot be set down in pieces;
- its engine is the largest reader after HDF5's;
- its header differs between engines.

What counts for it:
- the fastest first answer of any form when read in place on disk;
- writing in the least memory;
- the most resilient to a stopped scan;
- a person can query it with tools they may have.

## 12. What could not be established

- **The owner's machine.** The slowed tab ranks the forms; it does not predict that VM, and the machine here was shared at loads of 6 to 16.
- **A real corpus five times DNN.** The five-times corpus repeats DNN, which flatters the forms that keep each string once.
- **Parquet**, measured, and a columnar form queryable by DuckDB. It was surveyed only. Its pure-script writer has Snappy compression only, which `DecompressionStream` cannot inflate, so a page would also carry a Snappy decoder.
- **HDF5 written as facts arrive** (chunked datasets extended one file at a time), and HDF5 in a tab at five times DNN. The latter is pending.
- **A Chromium page writing progressively into IndexedDB** or a picked folder, and reading it back after a closed tab. Only that IndexedDB opens was measured.
- **The press made resumable** by labelling its sections. This is an argument, not built.
- **The indexed ledger in a tab**, slowed, at DNN and at five times. It was built last and was still waiting for the browser lane at this writing.
- **Parts and the forms written all at once, in a tab at five times DNN.** Their runs were cut by the lane's five-minute hold, or given up to make room for the indexed ledger's. Node's figures at that size stand in.
- **Windows itself.** Every run was Linux. Nothing here depends on the file system's case or on native code, except `node:sqlite`, which ships inside Node.

## 13. Recommendation (the builder's, apart from the findings)

A few rows of the tab measurements were still pending when this was written. None of them can change the press's numbers, which are in. The root has not adopted this.

**What I would choose:**
- **The press, written as facts arrive, as the stored form in both hosts.** It is the one form whose numbers stay in proportion at five times DNN in a slowed tab:
  - 1 s to the first answer;
  - about 350 MB to read;
  - about 300 MB to write;
  - a page of 9.1 MB for 53,880 files.

  It needs no library. Its bytes are the same in Node and Chromium. What it bends is the eighth value: a person cannot read it without our tool.
- **Two small additions to it, neither built:**
  - a label of a few bytes before each section, so that a stopped scan's prefix can be read and continued;
  - the hash of its uncompressed sections in its footer, so that it names its content and two scans compare without inflating them.
- **The indexed ledger as the one-way export**, the form a person can `zcat`, `grep` and `diff`. A person who wants the facts as text gets them in one file. "What depends on X" is one line of it, and a stopped export leaves every finished piece readable. The ledger is also the history's natural delta form: 1.92 MB for five moments against 5.16 MB.
- **One stored form, not two.** Keeping the press and a ledger both as stores, each fresh, would be the duplication SQLite was removed for in January.

**The near rival: the indexed ledger as the stored form itself.** Built last in this leg, it did what I hoped in Node:
- the first answer as fast as the press (106 ms at DNN, 164 ms at five times);
- a stopped scan resumable from every finished piece, in a page as in Node;
- `grep` intact.

What it did not do is load a whole map cheaply. Every line is JSON to parse: 1.1 s and 544 MB at DNN, 9.7 s and 1.5 GB at five times in Node, against the press's 0.4 s and 2.4 s. The Explorer loads a whole map today, so the press stays my choice. Its numbers in a slowed tab are pending, and a better reader could narrow the gap.

**What would overturn the choice:**
- **The owner ranking "usable without our tool" above the time and memory of loading a whole map.** Then the indexed ledger is the stored form: about 40 % larger than the press at DNN, as quick to a first answer, resumable, and readable, at the cost of the whole map's load.
- **The Explorer ceasing to load whole maps**, reading one neighbourhood at a time instead. Then the indexed ledger's weak point no longer matters, and it should be the stored form.
- **Only the command line mattering.** Then the database is the stored form: the fastest first answer read in place, the least memory to write, resumable, and queryable in SQL.
- **The engine unable to hand facts over in path order.** That costs the press a sort of its path table at the end, and costs the ledger a sort of everything.

## 14. Files, and how to run everything again

From the repository root after `npm ci` and `npm run build`, with the scratch folder `<S>` holding the corpora. Trial libraries go in `<S>/libs`: `npm install sql.js@1.17.0 h5wasm@0.10.3`.

| Step | Command |
| --- | --- |
| Facts of a folder | `node scripts/facts.cjs <folder> <S>/facts/<corpus>.json` |
| Five times DNN, and the one-line-per-file inputs | `node scripts/scale.mjs <S>/facts/dnn.json 5 <S>/facts/dnn5.json`; `node scripts/scale.mjs --ndjson <S>/facts/<corpus>.json <S>/ndjson/<corpus>.ndjson` |
| Shape and subjects | `node scripts/shape.mjs <S>/facts/<corpus>.json <S>/facts/<corpus>.shape.json` |
| Node: write twice, verify, read cold | `node scripts/run-node.mjs <S>/facts <S>/out results/node.json [designs]` (for HDF5, set `H5WASM` to h5wasm's `dist/node/hdf5_hl.js` and `H5DIR` to a scratch folder) |
| Node: written as facts arrive, against all at once | `node scripts/run-stream.mjs <S>/ndjson <S>/stream results/stream-node.json <corpus> [<facts.json>]` |
| Five moments of history | `node scripts/history.mjs results/history.json <moment.json> …` |
| A stopped scan | `node scripts/stopped.mjs sqlite <ndjson> <db>`, then `salvage-sqlite <db>`; `node scripts/stopped.mjs ledger <ndjson>` |
| The two SQLite engines | `node scripts/sqlite-hosts.mjs <S>/facts/dnn.json <S>/libs/node_modules/sql.js` |
| The pages | `node scripts/page/build-pages.mjs <S>/pages <S>/libs/node_modules/sql.js/dist/sql-wasm-inline.js <corpus> <S>/out` |
| A tab | `node scripts/browser-lane.mjs --label stored-form -- [taskset -c 0,1] node <this folder>/scripts/page/measure.mjs <rate> read:<page>:<shape.json> write:<page>:<ndjson>:<stream\|gather> platform:<page>` |
| The tables | `node scripts/tables.mjs results` |

The raw results are in [`results/`](results/): `node.json`, `node-hdf5.json`, `node-indexed.json`, `stream-node.json` (the indexed ledger's two writes as facts arrive are in `stream-indexed.jsonl`), `history.json`, `sqlite-hosts-dnn.json`, `stopped.jsonl`, and `tab-*.jsonl`, one line per tab run. The tab's files hold every run made, including the lane's own lines.
