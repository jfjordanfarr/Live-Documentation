# The stored form as one module: what was built and measured

_Historical record of 2026-11-22, by a builder for the root, on `day/2026-11-22` from `8bc5736cd`. First milestone. It adds a package nothing else uses yet, and decides none of the forks at its end._

## What was asked

The stored form of a scan's facts, built as one module that imports nothing. It is the research's binary layout ("the press") in its resumable, self-naming form, with text exported on demand. These are the requirements the root drew on 2026-11-21 from the owner's words, in [the work item](../../../../../../Work/tool-arrives-on-windows.md#a-scans-facts-in-one-stored-form-written-by-either-host):
- one module, no imports;
- written as facts arrive, and resumable;
- text and binary both ways without loss;
- one form for one set of facts;
- a reader that always finishes, held by a fuzzer;
- every string untrusted;
- each scan saying what it holds and left out;
- a specification a second reader could be written from.

## What was built

- **[`packages/stored-form/src/storedForm.ts`](../../../../../../../packages/stored-form/src/storedForm.ts)** holds the writer as facts arrive (`createWriter`), `resumeFrom`, the quick open (`openScan`), the whole read (`readScan`), the text form both ways (`textOf`, `scanOfText`, `bytesOfText`), and the graph (`graphOf`).
  - It has no import and uses only `CompressionStream`, `DecompressionStream`, `crypto.subtle`, `TextEncoder` and `TextDecoder`.
  - Its build type-checks against the browser's library with no Node types, so a Node-only interface fails the build.
  - It is TypeScript that Node 26 runs unchanged by type stripping. The fuzzer's worker loads it that way.
- **[The specification](../../../../../../../.mdmd/layer-3/stored-form.mdmd.md)**, marked a proposal. It covers:
  - the frames and their limits;
  - every section's grammar, and the canonical rules a reader enforces;
  - the graph's derivation;
  - the order a reader checks in;
  - writing and going on;
  - the text form, line by line;
  - what a consumer owes;
  - stable names.
- **The package** is wired into the workspaces, the root's build (built first) and the unit project of `vitest.config.ts`. Nothing in the engine, the generator or the Explorer imports it.
- **The probe's scripts** beside this record:
  - [`scan-of-graph.ts`](scan-of-graph.ts) turns today's `index.json` into the facts the engine's sink would hand over. Each link gets what it names by the engine's own `linkTarget`.
  - [`measure.ts`](measure.ts) checks and times.

## The layout, in short

```
signature (8 bytes, provisional)  head  (strings? records)*  paths  wires  end
```

- Every section is a frame with a 45-byte header: kind, count, raw length, stored length, and the SHA-256 of its uncompressed bytes. The body is raw deflate.
- Strings are numbered as first met. The strings first met in a group of 256 files are set down just before that group's records, so a cut file is whole up to its last group.
- A link carries what it names (`target`, `anchor`) as the scanner read it. Whether that file was scanned is the graph's to say.
- The paths (front-coded) and the outbound wires are indexes, checked against the records on a whole read.
- The end holds the content's name: the SHA-256 of every frame's hash.

## Measured

**The corpora:**
- This repository's graph is the main checkout's `.mdmd/index.json` as it stood at 00:38 UTC on 2026-11-22.
- The estate sample's and DNN's graphs were made by this repository's generator (`live-docs:generate --workspace`) on copies in the builder's scratch. DNN came from the readers' builder's corpora of 2026-11-21; which commit of DNN they hold was not checked.

Node 26.13.1, a shared machine at a load of 7.5 to 8.9 (20 threads). Each read is a fresh process under `tsx`, three runs each; the peak includes about 70 MB of the loader itself.

| | This repository (1,294 files) | Estate sample (41) | DNN Platform (10,777) |
| --- | ---: | ---: | ---: |
| `index.json` as written (pretty) | 10.92 MB | 174 KB | 65.6 MB |
| `index.json` gzipped | 1.38 MB | 10.4 KB | 3.64 MB |
| `index.json` compact, gzipped | 1.26 MB | 8.8 KB | 3.07 MB |
| **Stored form** | **1.09 MB** (79 % of gzipped) | **7.7 KB** (74 %) | **2.17 MB** (60 %) |
| Text form, and gzipped | 7.09 MB, 1.18 MB | 91 KB, 7.8 KB | 37.2 MB, 2.51 MB |
| Sections inflate to, against the file | 3.3 × | 3.2 × | 4.1 × |
| Written all at once from facts in memory | 0.46 s | 0.05 s | 1.48 s |
| **First answer**, stored: what depends on the most depended-on file, by name | 47 to 73 ms | 32 to 34 ms | **86 to 128 ms** |
| First answer, `index.json.gz`: inflate, parse, look up | 178 to 238 ms | 2.5 to 3.1 ms | **717 to 738 ms** |
| **Whole map**, stored: every fact read and checked, and the graph | 295 to 362 ms | 50 ms | **0.98 to 1.18 s** |
| Whole map, `index.json.gz` | as its first answer | as its first answer | 0.72 to 0.74 s |
| Peak memory, stored, whole map | 109 to 119 MB | 72 to 73 MB | **252 to 255 MB** |
| Peak memory, `index.json.gz` | 122 to 123 MB | 70 to 72 MB | 393 to 438 MB |

**Checked on each corpus, all true:**
- The graph read back from the stored form (`graphOf`) equals the `index.json` it was made from, field by field. **Printed as the generator prints it, it is byte for byte that `index.json`.** The engine resolved every link with its own rule, so this holds the stored targets against an independent derivation.
- Binary → text → binary gives the same bytes.
- Text → binary → text gives the same text.
- The text reads back.

**What the numbers say:**
- **At DNN's size the stored form is 60 % of today's gzipped index.** It answers a first question six to eight times sooner, and reads the whole map in about 60 % of the memory.
- **Its whole read is slower than parsing the JSON** (about 1.1 s against 0.73 s at DNN), because it checks everything: every section's hash, every string's first-met order, every path, every wire against the records.
  - Before a change made during this milestone, every field built its refusal message as it went. That made the whole read about half again as slow. This repository's whole read went from 450 to 590 ms to 295 to 362 ms.
  - Where else the time goes was not profiled. The research's press, which checked nothing, read DNN whole in 0.43 to 0.65 s.
- **On a tiny scan the stored form loses** (32 ms against 3 ms on the estate sample). The streams and hashing cost a fixed start, under any scan's size.
- **The inflation the reader's memory bound rests on is 3.2 to 4.1 times** on real scans. The bound allows 64 times and a mebibyte.

Not measured: a browser tab, which was not reached in this milestone; five times DNN; and writing as facts arrive in a fresh process from facts on disk. The unit tests hold that the streaming writer gives the same bytes as writing all at once.

## The tests, and what each proves

In [`storedForm.test.ts`](../../../../../../../packages/stored-form/src/storedForm.test.ts), nine cases, all passing:
- **Every fact read back.** A made scan holds every field the layout has, each mark set and unset somewhere ([`testScans.ts`](../../../../../../../packages/stored-form/src/testScans.ts)).
- **One byte stream three ways.** Written as facts arrive, in the pieces handed on, and all at once, over three groups of records.
- **Text both ways without loss**, on four scans, an empty one among them.
- **One text for one set of facts.** Nine variants of a valid text are each refused: a space, `4.0`, members reordered and an unknown member, `false` for an absent mark, an escaped letter, a missing final line break, a wrong count, a line after the end, and a path repeated.
- **The graph.** An edge lands only on a scanned file, and a link to a file outside the scan keeps its target and lands nowhere. The quick open answers inbound by name.
- **Going on from a stop**, from cuts at four places, to the same bytes, in the pieces handed on too. A file cut inside its head is refused, as is a finished one.
- **Facts the writer cannot hold are refused**, and the writer goes on: out of path order, `/etc/passwd`, `C:/…`, `c/../d`, a lone surrogate, a `file:` link, a negative number. A string first met in a refused file is numbered afresh in the next.
- **Whole in shape, not in form.** Frames are set down again with their own hashes, so that each mutation reaches the check it is for. A string set down twice, a string never named, a number written longer than it needs, wires the links do not give, a byte after the end, a cut, and a flipped byte are each refused.
- **The module imports nothing.** Its source holds no `import`, `require(`, `process.`, `window.`, `document.`, `eval(` or `new Function`.

In [`storedForm.fuzz.test.ts`](../../../../../../../packages/stored-form/src/storedForm.fuzz.test.ts), the standing fuzzer:
- **800 mutants of two valid files** (3 files, and 300 files across two groups). Each is made from its seed alone by [`mutants.mjs`](../../../../../../../packages/stored-form/src/fuzz/mutants.mjs), in eight kinds: bits flipped, a cut, a count or length that lies, bytes put in, bytes taken out, frames doubled or swapped, noise after the signature, and a bomb.
  - The bomb is a section whose body is a real raw deflate stream of 256 MiB of zeros, about 256 KB stored. Its header claims the original length, or nearly 4 GiB.
- Each mutant is read by `readScan`, `resumeFrom` and, where facts came back, `textOf`, in a worker ([`worker.mjs`](../../../../../../../packages/stored-form/src/fuzz/worker.mjs)). The test stops the worker at ten seconds without an answer.
- The memory each read holds over the worker at rest (heap, ArrayBuffers and external memory, sampled every millisecond and at each await) must stay under 48 MiB plus 64 bytes per byte of input.
- **Result:**
  - 790 refused and 10 read as facts. The 10 are the frame swaps that swapped a frame with itself, so the file was unchanged.
  - No crash, no hang, and no answer that was not facts or a refusal.
  - The most any read held was 12.0 MB, a quarter of its bound.
  - 22 s for the whole case on this machine.
- **Shown red first.** The same case, run once against [a deliberately careless reader](../../../../../../../packages/stored-form/src/fuzz/careless.mjs) that trusts every declared count and length and inflates without a limit, failed:
  - it hung at seed 67, so 68 findings were received where 800 were expected;
  - over seeds 0 to 19 it crashed on cuts, noise, bytes put in and a lying stored length;
  - it held 1,558 and 1,559 MB on the two bombs;
  - it took six mutants for facts that the module refuses (seeds 2, 6, 8, 14, 17 and 18);
  - it hung at seed 19.
- A second standing case holds that the fuzzer finds the careless reader out in at least two ways, so the first case stays a test that can fail.

## The history's cache key

**Not moved.** The key's lock half is computed by `lockIdentity` in `packages/generator/src/history/generatorIdentity.ts`, from the lock's entries for the packages the summarizing process can load. It was `697191d3f844372b` before the package was added and after `npm install` wrote it into the lock. The code half was `5b1c8f445d32d867` both times, and `modified` stayed `null`.
- The new entries (`packages/stored-form`, and its link under `node_modules/@live-documentation/`) are reached from neither the engine nor the generator.
- The package's `tsconfig.json` does not extend `tsconfig.base.json`, which keys the lens, so that file was left untouched.

The history was not rebuilt.

## Forks decided here, and why

- **The content is canonical; the compressed bytes are not.** A reader checks every uncompressed section, its hash and every canonical rule, and the content's name is over the uncompressed hashes.
  - Making the stored bytes canonical too would mean recompressing every section on every read, a write's time. It would also tie the format to one deflate implementation's exact output, which no standard fixes.
  - Two readers cannot be shown two maps this way: any valid file inflates to exactly one content, and that content has one form.
  - What it gives up: two writers with different zlibs can write different files for the same facts, with the same name.
- **Links carry what they name, not whether it was scanned.** At the time a file is handed over, the files after it are not known. So the record keeps the scanner's reading of each link (path and anchor), and the graph decides landing after the last file.
  - This carries one fact more than `index.json`: what a link to an unscanned file names. That is the beginning of a ghost.
  - The layout cannot check that reading without a second copy of the engine's link rule (see the forks left).
- **Inbound wires are not stored**, only outbound, since one is the other turned around: about 1 ms at DNN's size.
- **A file-level bound on inflation, 64 times the file and a mebibyte**, besides deflate's own 1,032 per stored byte.
  - Without it, a 64 KB file of zeros inflating 1,000 times could hold 30 million empty facts, gigabytes.
  - Real scans inflate 3.2 to 4.1 times.
  - Paths are bounded by the strings' length, and the text export by the bound too, since a name held once can be named many times.
- **A refused file leaves the writer as it was**, so a host can list it as left out and go on.

## Forks left to the root

- **Borrowing an existing model's shape.** One general-purpose subagent of my tier read SCIP (`scip.proto`, `docs/DESIGN.md`, the symbol grammar), with LSIF and Kythe for contrast. Its findings, in short:
  - SCIP calls itself "a transmission format", "not meant as a storage format".
  - It records file-to-file dependencies only as occurrences with positions, which we do not make.
  - Protobuf "is not (and cannot be) canonical".
  - It has no slot for entries, authored words, cited-by, re-exports, layer, archetype, qualifiers or "listed, nothing detected".
  - Its `project_root` is an absolute path.
  - Its symbol grammar (`<scheme> <manager> <package> <version> <descriptors>`, descriptors told apart by suffix) is stable because it is built from names, not positions.
  - **Its advice, which I share:** do not adopt the format. Consider its symbol grammar as the shape of a symbol's stable name, and write a lossy SCIP export later if wanted. Kythe's open fact-and-edge vocabulary fits our variety of facts better than SCIP's fixed messages, but it too hangs off byte offsets.
  - The subagent read through a fetch tool that summarizes pages, so its quotations are short. It found no SCIP text on untrusted indexes and none promising symbol strings stable.
- **Stable names** (the specification, section 10):
  - a file is its path;
  - a symbol is its path and slug;
  - a scan is its content's name, which names a moment, so a plan that outlives rescans joins to the folder.
  - A rename makes a ghost; nothing in the layout follows one.
- **The link rule.** Should the format carry, or verify, the link rule?
- **The name, the extension, the signature and the text's first line.** All provisional: `FPK` and `fact-pack` are placeholders.
- **Whole read against a quick open.** "One form for one set of facts" is enforced in full only by a whole read. A quick answer checks only what it read: the headers, the name, the head, the paths and the wires, each against its hash. That is what buys the first answer in a tenth of the whole read's time.
- **Two implementations of the edge listing.** `graphOf` repeats the engine's `deriveLiveDocGraph` for edges, measured equal on three corpora. When wired, one of them goes.

## Unfinished

- The browser tab measurement, through the lane.
- Five times DNN.
- Writing as facts arrive from facts on disk, timed and with its peak, against the research's figures.
- A profile of the whole read.
- An audit of what the readers take from configuration values (the work item's "staging address").
- What reasons the scanner reports as left out, which is the wiring's to decide.

## Commands the harness refused

Two commands were refused as too complex to verify that they stay in the worktree, and neither named git:
- a heredoc writing a script that imports the history's identity module;
- an inline Python script.

Each was rewritten as a file written with the file tools, then run by a plain command.
