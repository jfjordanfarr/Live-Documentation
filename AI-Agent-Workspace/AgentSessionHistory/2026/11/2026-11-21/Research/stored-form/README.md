# In what stored form should a scan's facts be kept?

Historical research of 2026-11-21, by a builder for the root, on branch `stored-form-research` from `70a3b9481`. It changed no product code and decides nothing.

**Status: first milestone, in progress.** Done so far:
- the data's shape;
- the survey of what exists;
- five designs written and measured in Node on two corpora;
- five moments of one repository's history.

Not yet done: the browser measurements (reading and writing in a tab, at full speed and slowed), the HDF5 design, the carrying inside one HTML page, and the comparison table and recommendation. This page will be rewritten when they are done.

## The question, in the owner's words

On 2026-11-19: "Don't just settle for JSON by default. Do a lot of research to choose a format that is going to be right for what we need at scale and prove it by the efficiency gains that are reaped." On 2026-11-20, of the values a format must serve: "Reality will likely push back against us and force us to be unable to maximize all of our values simultaneously."

## 1. The data's shape

Two real scans, each made by today's generator straight from its models, with nothing written into the scanned folder ([`scripts/facts.cjs`](scripts/facts.cjs), the November 19 survey's method):
- **this repository** at `70a3b9481`: 1,134 files;
- **DNN Platform** at `9bc6b06f4f15d11f6e52446505ec3117a7c84200`: 10,776 files, fetched shallow and anonymously.

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
| What changed between two commits | two scans; per file, whether its own facts differ | measured in section 4 |

So three of the four questions read a few percent of the whole, provided the form keeps the adjacency and lets one file's record be found alone. The fourth, at the hub, reads a third.

## 2. What exists

A survey of each candidate's own documentation and published packages was made by one subagent of my tier (general-purpose), and checked in part by running the packages under Node 26 with code generation from strings disallowed, which imitates the page's policy. Its findings, with their sources, will be in section 6. The facts that shape the designs below:

- **HDF5** (`h5wasm`): WebAssembly embedded in its script, 3.55 MB of it, 4.15 MB as script; runs under the page's policy.
  - It stamps object times into the file and offers no way to turn them off: two writes of the same file 1.5 s apart differed in 32 bytes.
  - It cannot compress variable-length strings.
- **SQLite**:
  - `node:sqlite` is built into Node, release candidate in 26; `serialize()` and `deserialize()` arrived in 26.1.0.
  - `sql.js` runs in a page from one script that carries its WebAssembly inline: 688 KB of WebAssembly, 981 KB as script.
- **DuckDB in a page** needs workers and about 36 MB of WebAssembly: ruled out for the page.
- **Parquet**:
  - `hyparquet` reads in pure script (207 KB unminified); `hyparquet-writer` writes.
  - Only Snappy is built in.
- **Arrow** (`apache-arrow`): its writer calls `new Function`, which the page's policy forbids. Its dictionary ids depend on what the process did before, so two writes of the same table can differ.
- **Avro, and Protocol Buffers by reflection**, fail under the policy. Protocol Buffers is "not (and cannot be) canonical" by its own documentation.
- **The browser's own compression** in Chromium is gzip, deflate and raw deflate. Brotli and zstd are not offered by `CompressionStream` in Chrome or Edge.

## 3. The designs measured so far

Each design holds the same facts: every field of every file, and each file's inbound and outbound adjacency. Each is held to the facts it was written from, field by field, after a full read ([`scripts/bench-node.mjs`](scripts/bench-node.mjs) `verify`); every one reads back identical on both corpora. Each design is one module under [`scripts/designs/`](scripts/designs/), and each module runs unchanged in Node and in a page.

- **The baseline, JSON gzipped** ([`d0-json.mjs`](scripts/designs/d0-json.mjs)): the whole graph as one compact JSON text, gzipped by the platform's own compressor. Answering anything reads everything.
- **The press** ([`d1-press.mjs`](scripts/designs/d1-press.mjs)): a binary layout of our own, read with nothing but what a browser already has.
  - A header of offsets.
  - The paths.
  - The adjacency as plain arrays of numbers, used as they lie.
  - Every other string once, most frequent first, in blocks.
  - Each file's record in chunks of 256.
  - Each section is compressed on its own, so a question inflates only what it reads.
- **The database** ([`sqlite-core.mjs`](scripts/designs/sqlite-core.mjs)): an SQLite file whose tables are files, symbols, dependencies and edges, with an index on what an edge points at.
  - The small nested parts (a symbol's type references and docstring) are JSON in a column.
  - Written and read by `node:sqlite`. It is read either whole from memory, or in place on disk, where a question touches only the pages it needs.
- **The ledger** ([`ledger-core.mjs`](scripts/designs/ledger-core.mjs), [`d3-ledger.mjs`](scripts/designs/d3-ledger.mjs)): one fact per line, sorted by path, each line a JSON array that begins with the path, gzipped. For example, `["DNN Platform/Library/Common/Globals.cs","G",3,"import",…]` is one edge.
  - What depends on a file is every edge line naming it, so `grep` finds it.
  - The `diff` of two ledgers is the change in the facts.
- **The store of parts** ([`d4-parts.mjs`](scripts/designs/d4-parts.mjs)): the ledger cut by directory.
  - Each part is named by the SHA-256 of its lines, so one file holds many moments or many scans with every unchanged part once.
  - Two moments that name the same part need not read it to know its files did not change.

The numbers are in [`results/node.json`](results/node.json) (`node scripts/run-node.mjs <facts folder> <work folder> results/node.json`).

**DNN in Node 26, each a fresh process.** Each read was taken three times and the median kept. The machine was shared, at a load of 7 to 16.

| Design | On disk | Gzipped | Write | Write's peak memory | Same bytes twice | First answer, cold | Reachable | Hub's Local Map | Whole graph | Peak memory reading |
| --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: |
| JSON gzipped | 2.74 MB | 2.73 MB | 1.9 s | 400 MB | yes | 1,913 ms | 9 ms | 2 ms | (in the first) | 300 MB |
| Press | 2.21 MB | 2.21 MB | 2.1 s | 281 MB | yes | 117 ms | 3 ms | 310 ms | 432 ms | 206 MB |
| Database, read whole from memory | 29.6 MB | 3.86 MB | 1.1 s | 333 MB | yes | 95 ms | 10 ms | 167 ms | 647 ms | 293 MB |
| Database, read in place on disk | 29.6 MB | 3.86 MB | (the same) | | yes | 20 ms | 8 ms | 209 ms | 575 ms | 234 MB |
| Ledger | 2.80 MB | 2.80 MB | 1.3 s | 507 MB | yes | 820 ms | 153 ms | 242 ms | 568 ms | 372 MB |
| Parts | 4.87 MB | 3.78 MB | 3.0 s | 296 MB | yes | 83 ms | 2 ms | 1,296 ms | 1,571 ms | 502 MB |

How the columns are measured:
- **First answer** is reading the file, opening it and answering "what depends on `Globals.cs`" (632 files).
- **The hub's Local Map** is the whole records of the 661 files wired to it.
- **The whole graph** is every field of every file, as the Explorer loads it today.

The press's and the parts' first answers include about 70 to 140 ms that Node's web streams spend on their first use, which the page will show differently.

## 4. Many moments of one folder

Five commits of this repository between November 18 and 21 (`0e88714c8`, `cfe683fc5`, `44fc8028a`, `682ec1a55`, `70a3b9481`), each scanned by today's generator over that commit's tree, which is the history's one lens. Measured by [`scripts/history.mjs`](scripts/history.mjs), raw numbers in [`results/history.json`](results/history.json).

| Held as | Bytes for all five |
| --- | ---: |
| Five JSON files, gzipped | 5.16 MB |
| Five press files | 4.65 MB |
| Five ledgers | 5.37 MB |
| One ledger, then each step's lines added and removed | **1.92 MB** |
| One file of parts, each distinct part once (76 % of the 1,355 parts named were shared) | 3.89 MB |

All four designs gave the same answer to "what changed between the first and the last": 99 files born, 3 deleted, 197 changed.

The surprise so far: directory parts share three quarters of themselves, yet save only a quarter of the bytes. A directory that changed is stored whole again, and each part is compressed without the others' context. The ledger's line deltas save twice as much.
