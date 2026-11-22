# The stored form as one module: what was built and measured

_Historical record of 2026-11-22, by a builder for the root, on `day/2026-11-22` from `8bc5736cd`. The first milestone adds a package nothing else uses yet, and decides none of the forks at its end. The second milestone, below under its own heading, carries out the root's rulings on them. Links to the tests point to `test/`, where the second milestone moved them._

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

In [`storedForm.test.ts`](../../../../../../../packages/stored-form/test/storedForm.test.ts), nine cases, all passing:
- **Every fact read back.** A made scan holds every field the layout has, each mark set and unset somewhere ([`testScans.ts`](../../../../../../../packages/stored-form/test/testScans.ts)).
- **One byte stream three ways.** Written as facts arrive, in the pieces handed on, and all at once, over three groups of records.
- **Text both ways without loss**, on four scans, an empty one among them.
- **One text for one set of facts.** Nine variants of a valid text are each refused: a space, `4.0`, members reordered and an unknown member, `false` for an absent mark, an escaped letter, a missing final line break, a wrong count, a line after the end, and a path repeated.
- **The graph.** An edge lands only on a scanned file, and a link to a file outside the scan keeps its target and lands nowhere. The quick open answers inbound by name.
- **Going on from a stop**, from cuts at four places, to the same bytes, in the pieces handed on too. A file cut inside its head is refused, as is a finished one.
- **Facts the writer cannot hold are refused**, and the writer goes on: out of path order, `/etc/passwd`, `C:/…`, `c/../d`, a lone surrogate, a `file:` link, a negative number. A string first met in a refused file is numbered afresh in the next.
- **Whole in shape, not in form.** Frames are set down again with their own hashes, so that each mutation reaches the check it is for. A string set down twice, a string never named, a number written longer than it needs, wires the links do not give, a byte after the end, a cut, and a flipped byte are each refused.
- **The module imports nothing.** Its source holds no `import`, `require(`, `process.`, `window.`, `document.`, `eval(` or `new Function`.

In [`storedForm.fuzz.test.ts`](../../../../../../../packages/stored-form/test/storedForm.fuzz.test.ts), the standing fuzzer:
- **800 mutants of two valid files** (3 files, and 300 files across two groups). Each is made from its seed alone by [`mutants.mjs`](../../../../../../../packages/stored-form/test/fuzz/mutants.mjs), in eight kinds: bits flipped, a cut, a count or length that lies, bytes put in, bytes taken out, frames doubled or swapped, noise after the signature, and a bomb.
  - The bomb is a section whose body is a real raw deflate stream of 256 MiB of zeros, about 256 KB stored. Its header claims the original length, or nearly 4 GiB.
- Each mutant is read by `readScan`, `resumeFrom` and, where facts came back, `textOf`, in a worker ([`worker.mjs`](../../../../../../../packages/stored-form/test/fuzz/worker.mjs)). The test stops the worker at ten seconds without an answer.
- The memory each read holds over the worker at rest (heap, ArrayBuffers and external memory, sampled every millisecond and at each await) must stay under 48 MiB plus 64 bytes per byte of input.
- **Result:**
  - 790 refused and 10 read as facts. The 10 are the frame swaps that swapped a frame with itself, so the file was unchanged.
  - No crash, no hang, and no answer that was not facts or a refusal.
  - The most any read held was 12.0 MB, a quarter of its bound.
  - 22 s for the whole case on this machine.
- **Shown red first.** The same case, run once against [a deliberately careless reader](../../../../../../../packages/stored-form/test/fuzz/careless.mjs) that trusts every declared count and length and inflates without a limit, failed:
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

## Second milestone, 2026-11-22: the root's rulings, and the read brought level with JSON's

The root merged the first milestone as `e8320edb5` and ruled on its forks:
- SCIP is not adopted.
- The content is canonical; the compressed bytes are not.
- The link rule is carried and not checked.
- Quick open and whole read both stay. Which a host uses is the wiring's; a file from someone else gets a whole read first.

Three rulings asked for work, and each was done as follows.

### Path order is UTF-8 byte order

- **Why:** a reader in Rust, Go or Python sorts bytes, and so do git's trees. The root: a format "useful to more than one project" must not lean on how JavaScript compares strings.
- **What changed:**
  - `comparePaths` is exported and compares UTF-16 units with one correction: at the first unit that differs, a surrogate sorts after any other unit. That is code point order, which is UTF-8 byte order.
  - Section 2.3 of the specification is rewritten, and section 7.1 says the engine's sink will sort by this comparator, so there is one comparator at the wiring.
  - `scan-of-graph.ts` sorts by it.
- **Red first.** Three cases were written before the comparator changed, and all three failed. The first case's failure was "expected 1 to be -1". They are:
  - `dir/\u{E000}.ts` before `dir/\u{1F600}.ts`, the two orders differing;
  - 20,000 pairs drawn from every range of code points, each held to `Buffer.compare` of the two UTF-8 encodings;
  - the writer, the reader and the text form keeping that order and refusing the other.
- **The three corpora:** none holds a path with a character from U+E000 up (counted: 0 of 1,303, 0 of 41, 0 of 10,777). So their order is unchanged. The graph read back still prints byte for byte as each `index.json`, and every round trip is the same, measured again on all three after the change.

### The text form's bytes are stated by the specification

- **The rules:** section 8.1 now states exactly what is written:
  - the seven short escapes;
  - `\u00` and two lowercase hexadecimal digits for the other controls up to U+001F;
  - everything else literally in UTF-8, by name: `/`, U+007F, the C1 controls, U+2028, U+2029, U+FEFF, and code points above U+FFFF, never as surrogate escapes;
  - numbers in decimal with no sign, point, exponent or leading zero;
  - no whitespace;
  - UTF-8 without a byte-order mark, LF line ends.
  It says these are what ECMAScript's `JSON.stringify` writes, so that a reader in another language need not know it.
- **`scanOfText` and `bytesOfText` now also take bytes**, decoded strictly.
- **Four cases**, each expectation written by hand from the rule, not by a JSON library:
  - 21 characters, each written as the rule says;
  - three numbers;
  - eleven other ways of writing the same text, each refused: `\u0008`, `\/`, `\u007f`, ` `, `é`, a surrogate pair, uppercase hex, `"`, `4e0`, `4.0`, a space;
  - a byte-order mark, a byte of FF, and CR LF, each refused.
- **Red first.** The module's writer was swapped for one that escapes U+2028 and writes uppercase hex. Two of the four cases failed, then the writer was restored.
- **Other leans on JavaScript found and rewritten:**
  - **Strings (section 2.2)** were defined as "no lone surrogate", a UTF-16 notion. They are now sequences of Unicode scalar values, decoded strictly by the Unicode Standard's table 3-7. A byte-order mark inside a string is kept as part of it, and equality is of bytes, with no normalization.
  - **Paths' checks (section 2.4)** leaned on regular expressions. They now name the ASCII letters, the case folding of `file:`, and U+0000 by code point. The code checks them in one pass, by character code.
  - **The text export's bound** counted UTF-16 units. It now counts UTF-8 bytes.
  - **The graph (section 5)** was "exactly those of `deriveLiveDocGraph`". The text is now the authority.
    - It says that `toSymbol` comes only with `to` and an anchor.
    - It says that "holds `type-only`" means one qualifier exactly equal.
    - It says that `basis` is the first matching qualifier in their order.
    - Outbound and inbound are in byte order.
    - The order of an object's members is not a fact.
  - **The limits (section 3.5)** now give MiB in bytes, and say that the total is the sum of every frame's raw length, the end's included, checked as headers are hopped.
  - **The counts (section 2.1)** now say which sooner refusals a reader may make (3 bytes a left-out entry, 2 a path, and a frame's count against its raw length), and that none changes which files are accepted.
  - **The document path (section 4.1)** is now stated as a join, not as `docPathOf`.

### `testScans.ts` out of what ships

The tests, the fuzzer and `testScans.ts` moved to `packages/stored-form/test/`, and `src/` holds only the module. The build includes `src/` alone, so `dist/` holds only `storedForm.js` and its declarations. The unit include is `packages/stored-form/test/**/*.test.ts`. Their Live Docs were moved with them, which kept the authored words.

**The package's two suites now run in `unit-serial`.** Going on from four cuts took 4.3 s at a load of 39 and 6.0 s beside the fuzzer, against the five-second deadline. Every case remains, and the deadline is not raised, as the repository does for its other heavy suites.

### Measured in the second milestone

A shared machine at a load of 15 to 47, far above the first milestone's 8. **Every time below is therefore inflated, and is compared only with what was run beside it, interleaved.** Reads are under bare Node 26 running the module's TypeScript source unchanged ([`read-time.mjs`](read-time.mjs)), so no loader is counted. A bare Node process peaks at 42 MB.

**Written as facts arrive, from disk** ([`stream.ts`](stream.ts)). One line per file is read and handed to the writer, and each piece is appended to the file as it is set down. Peaks include about 70 MB of `tsx`.

| | Time | Peak | Bytes |
| --- | ---: | ---: | --- |
| DNN, 10,777 files, three runs | 2.8 to 3.8 s | 194 to 203 MB | 2,167,449, byte for byte the file written all at once |
| Five times DNN, 53,885 files | 9.4 s | 254 MB | 6,180,769 |

The research's streaming press measured 2.3 s and 188 MB at DNN, and 7.5 s and 255 MB at five times.

**The whole read, profiled on DNN.** Before the mends, the profile's self time by function was:
- 14 % decoding strings one call at a time;
- 11 % checking paths: a split and two regular expressions for every target, though the same strings repeat;
- 11 % idle, waiting on inflates and hashes run one after another;
- 7.5 % collecting garbage.

Then three mends, none dropping a check:
1. **Every section is inflated and hashed at once**, on the platform's own threads, before decoding in order.
2. **Each distinct string is checked as a path or a link once**, by its number, rather than at every naming.
3. **A strings section is decoded in one strict call.**
   - A string that begins with a continuation byte is refused. Joined, no sequence can then cross from one string into the next, so strict decoding of the whole means each string is valid.
   - A new case shows a character split across two strings (`C3` and `A9`) refused, as is a byte of `FF`.
   - The paths are built in one reused buffer.

A first try at a fast path for short ASCII strings was slower, because building a string from spread bytes is slow, and was replaced.

**DNN, interleaved runs at a load of about 33:**

| | First answer | Facts read and checked | Facts and the graph | Peak |
| --- | ---: | ---: | ---: | ---: |
| Before the mends | 0.24 to 0.28 s | 1.85 to 2.40 s | not run | 223 to 225 MB |
| After | 0.17 to 0.24 s | **1.33 to 1.49 s** | 1.75 to 1.81 s | 233 to 292 MB |
| `index.json.gz`: inflate and parse, the graph already in it | (all of it first) | | **1.45 to 1.59 s** | 383 to 385 MB |

- **The facts, every check made, now read in about JSON's time or less**, about 35 % sooner than before the mends.
- **The read's peak rose by 10 to 65 MB**, since every section's uncompressed bytes are now held at once until each is read: 8.9 MB of them at DNN, plus the platform's buffers for inflating them together. It is still about two thirds of JSON's.
- **Building the graph costs a further 0.35 s or so.** The whole map with the graph is about 15 to 20 % slower than parsing JSON that already holds it.
- **What is left is chiefly the check against a string stored twice.** It hashes every string into a set: about 120 ms for 109,000 strings at this load, measured alone. That is the price of one form for one set of facts, and it stays.
- The graph could be built only when a consumer asks for it, edges by file; that was not tried.

**Five times DNN**, 53,885 files: the research's construction, each copy's links naming only its own copy. The JSON baseline is `graphOf` printed as the generator prints it ([`index-of.mjs`](index-of.mjs)).

| | Stored form | `index.json` gzipped |
| --- | ---: | ---: |
| On disk | **6.18 MB** | 18.29 MB (compact: 15.43 MB) |
| First answer | **0.37 to 0.50 s** | 6.0 to 6.6 s, all of it first |
| Facts read and checked | 2.9 to 3.5 s | |
| Facts and the graph | 4.4 to 4.5 s | 6.0 to 6.6 s |
| Peak | **533 to 669 MB** | **1,730 MB** |

At fifty thousand files the stored form is a third of the gzipped index. It answers a first question twelve to sixteen times sooner, and its whole map, graph included, comes sooner than JSON's, in under 40 % of the memory.

### The whole unit project, run once

`npm run test:unit`, both the `unit` and `unit-serial` projects, at a load of 16 to 47: 3,619 of 3,620 cases passed, across 238 files.
- **The one that failed** is `generatorIdentity.test.ts`, "names as roots every package the two packages load without declaring it". It timed out at 5.3 s, and took 8.2 s alone at a load of 15.
- **It is not this change.** It reads only the engine's and the generator's sources, which this work does not touch. The configuration already records it as 1.7 s alone and past five seconds at loads of 20 to 40.
- Its deadline was left as it is.

### Still unfinished

- **The browser tab through the lane.** It was not reached in this milestone.
- **Building the graph lazily**, to close the last gap with JSON.
- **The configuration-values audit.**
- **Which left-out reasons the scanner reports.**

### Commands the harness refused this milestone

None.
