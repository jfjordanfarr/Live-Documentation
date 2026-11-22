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

## Third milestone, 2026-11-22: the second reader's findings answered, and the documentation relation

[The second reader's record](../stored-form-second-reader/README.md) and both blind readers' `questions.md` were read whole. The day's tip, `201fdfcc7`, was merged in first. Each finding is answered below in that record's order. "The text" is [the specification](../../../../../../../.mdmd/layer-3/stored-form.mdmd.md).

### Finding by finding

1. **The text export's bound.** The text gains the module's rule, in section 3.5 beside the sections' bound.
   - A reader that writes the text may refuse to when the names it would write exceed `64 × file length + 1 MiB`. The names are counted in UTF-8 bytes: each string, once for every time a record names it.
   - It must say it refuses the text, not the file. Such a file is valid: it is read, answered from, given its graph and its name, and only its text is not offered.
   - Writing the text anyway is right too.
   - So the text requires a file within the bound to be written as text, and allows both answers past it. Both blind readers (who write it) and the module (which refuses) are right.
   - The module was already doing this, so nothing in it changed.
2. **The wires' grammar.** Now `n:count [ first gapMinusOne{n−1} ]`, the bracket present only when n is at least 1. It also says that a file with no wires is the one byte `00`.
3. **Rules the module enforced and the text never stated.** Each is now stated:
   - **No byte after a section's last item:** a general rule in section 3.2 for all six sections.
   - **What makes a text valid beyond its form:** section 8. Every check made on the facts applies, which makes a valid text exactly the text a reader writes for some valid file. The inflation bound is excluded from these checks, since it depends on the writer.
   - **The order of a file's lines, and which are required:** section 8.
     - `file` and `authored` come exactly once.
     - Then entries, symbols and dependencies.
     - Then `cited-by` and `re-exports` at most once each, present by their marks even when empty.
     - The head's lines come first and the end last, and any other line is refused.
   - **Which members are always present:** section 8 lists them all, and the members present by a mark.
   - **The enumerations' words:** section 4.3, with roles capitalised and kept apart from the graph's edge kinds. Section 8 also maps the two grammars' field names.
   - **Which links make wires:** section 4.5 now says by section 5's rule. Only dependencies' and types' targets make wires. Not entries, cited-by, re-exports, sources or documentation references.
   - **What `extension` may hold:** decided. No `/`, no `\` and no NUL; it may be empty. I found no reason for a backslash or a NUL in an extension: it ends every document path, a backslash puts the document in another folder on Windows, and no file system's names hold a NUL. **The module changed:** it now refuses both, in the writer and in the reader. The case was seen failing first ("holds no slash, backslash or NUL" red, then green).
   - **"The declared length of the strings sections":** the sum of every strings frame's `rawLength` from the headers, as both blind readers chose. It is said that no valid file fails the check.
4. **Storability and the compressor.** The bound stays reckoned from the compressed file, since that is what keeps a reader's cost bounded by the file it is handed.
   - The text now says plainly that near the bound whether a set of facts can be stored depends on the writer, and that no reader's verdict on a given file does.
   - It also says why a compressor-free bound was not chosen: it would not bound what a reader of a small file must inflate.
5. **Code the text names.** Every mention of the module's functions, its tests, the engine, `JSON.stringify`, `CompressionStream` and the platforms' versions is now a sentence marked **Provenance**. A line at the top says no rule rests on one.
6. **The brief's gaps** (exit status) are not the specification's, and were left.

**The Go reader's further questions:**
- **The name from the headers, or by inflating the end** (section 3.4):
  - A reader **must** inflate the end, check it against its hash and compare it with the name.
  - It **may** first check, from headers alone, that the end's header hash is the SHA-256 of the name.
  - That header check alone never stands in for inflating, since it does not check the end's stored bytes. Both hold for a correct writer's file.
- **Raw deflate's corner cases** (section 3.2): the text names them: incomplete or over-subscribed Huffman codes, distance codes 30 and 31, length codes 286 and 287, and bits after the final block.
  - It states the guarantee. Every section's content is hashed, so two correct readers can never be shown two maps from one file, only a map and a refusal.
  - Whether zlib and Go's `compress/flate` split on any of these is **unmeasured**. Building such streams by hand was not cheap enough for this milestone.
  - One stream with its last byte's high bit set was accepted by Node's zlib with the same output. Whether that bit was padding was not established.
- **The drive rule's cost** (section 2.4): `a:b.txt` at the scanned folder's top, or anything inside a top folder named `c:…`, cannot be stored. A scanner leaves it out and lists it, with its reason. Only a path's first two characters are tested, so `src/a:b.txt` is stored.
- **The order sids are first met** (section 4.2): the layout's record order is now named, apart from the text's line order.
- **`[array]` and `[promise]`** are marks and carry no bytes (section 4.3).
- **The file length** in the bound is the whole input's, signature included (section 3.5).

### The blind readers' refusal cases, in the package

`packages/stored-form/test/storedForm.blind.test.ts` holds the kinds from their own tests that the package's unit cases and fuzzer did not already make, each named after the blind reader's file. The module refused every one of them before they came here, so they could not be seen failing. They are kept so that it goes on refusing them:
- a trailing byte in the head, strings, paths and wires;
- `wires-n0-with-first` and `wires-self`;
- `head-version-2` and `head-count-1`;
- `kind-7` and `strings-count-0`;
- `records-file-mark-bit-4`;
- `paths-not-longest-shared` and `paths-repeat`;
- `root-absolute`, `root-trailing-slash` and `extension-slash`;
- `zlib-wrapped` and `after-deflate-end`;
- a wrong end count, and a raw length longer than its stream;
- texts with `no-authored`, `entry-before-authored`, `symbol-before-entry`, `two-cited-by`, an unknown line and `member-twice`.

### The documentation relation

The engine's graph at the tip gains `documentation` (with `documentedBy` on the target). These are the declarations a symbol's documentation names, read from its `Links` section's lines and held apart from the edges.

**The fork, decided here.** Those lines are written in the engine's markdown grammar. To derive the relation without calling the engine, the module would have to re-implement that grammar: a second copy of it.
- Instead, each symbol now carries `documentation`: the scanner's reading of each reference (name, element, link, and what the link names, as for every other link), beside the verbatim lines.
- This is ruling 3's principle: carried as the scanner read it, not checked, and said so.
- The relation's rule is the text's own (section 5): an item for each reference whose target is a scanned file, `documentedBy` turned around and never the file itself, and never an edge or a wire.
- The layout gains one list per symbol (`docReference`, section 4.3), and the text form gains a `documentation` member on every symbol.
- The layout's version stays 1, since nothing has been written by anyone else.
- The probe's `scan-of-graph.ts` makes the reading with the engine's own `readDocumentationReference` and `linkTarget`, as the sink would.

**Red first:** a case of `graphOf` and the text form was written before the module carried the list. It failed ("expected undefined to deeply equal …"), then passed. The case covers a reference landing, one to a file outside the scan, one to the file itself, and one unlinked.

**Measured again on the three corpora**, regenerated by the tip's generator:

| Corpus | Files | Documentation references, in files | `documentedBy` entries | Stored, against `index.json` gzipped | Graph prints byte for byte as `index.json` | Bytes → text → bytes, text → bytes → text |
| --- | ---: | --- | ---: | --- | --- | --- |
| This repository | 1,325 | 17, in 3 | 8 | 1.11 MB against 1.41 MB | yes | yes, yes |
| Estate sample | 41 | 1, in 1 | 1 | 7.8 KB against 10.5 KB | yes | yes, yes |
| DNN | 10,777 | 5,637, in 1,586 | 1,313 | 2.24 MB against 3.79 MB | yes | yes, yes |

### What held

All of these passed:
- `npm run lint` and `npm run build`;
- the three audits and `docs:links:enforce`;
- the package's cases and fuzzer;
- the whole unit project, run once: 3,670 of 3,670 cases in 241 files.

### Not reached in this milestone

- **The graph built only when asked.** It is the last 15 to 20 % of the whole read with the graph, and was not built.
- **The browser tab through the lane.** Not run.

### Commands the harness refused in the third milestone

One: a heredoc that appended a test case and ran an inline Python edit, refused as too complex to verify that it stays in the worktree. It did not name git. The same edits were made with the file tools.

## Fourth milestone, 2026-11-22: one fact held twice, measured; the blind cases seen failing; the graph built as asked; the tab

The third milestone's merge, `6da0f7817`, was merged in first. Every corpus was regenerated at that state.

### 1. A symbol's documentation references, held twice: measured, and kept

The root's hypothesis was this: if every line of the sections the scanner reads references from is exactly the composer's line for some reading (name, element, link), the reading alone could stand for them. [`links-lines.ts`](links-lines.ts) measured it. For each line, it asks whether `documentationReferenceLine(readDocumentationReference(line))` is that line, using the engine's own reader and composer:

| Corpus | Sections | Lines | The composer's line for a reading | Not | Reference lines with the author's words |
| --- | ---: | ---: | ---: | --- | ---: |
| This repository | 24 | 43 | 42 (17 linked, 25 unlinked) | 1, a plain path: `- ../../docs/registry.md — Widget architecture` | 6 |
| Estate | 1 | 1 | 1 | 0 | 0 |
| DNN | 5,305 | 7,842 | 7,805 (5,637 linked, 2,168 unlinked) | 37: 35 web links (`- [url](url)`), 2 plain names (`- CreateValidID`) | 40 |

**The hypothesis is wrong, on two counts:**
- 38 lines are other kinds the composer writes into the same section (its `href` and plain cases), which no reference reading holds.
- 46 reference lines carry the author's words after ` — `. The (name, element, link) reading lacks them, and the stored `documentation` does not keep them.

No line of any corpus ran on over a second line, though the composer can write one.

So both are kept, as the brief rules for this case. The specification (section 4.3) now says:
- why, with these counts;
- that a viewer shows the lines and the graph reads the references;
- that a disagreement between them is the scanner's fault, which a reader cannot see.

**What a check of agreement would cost:** little time (7,842 lines on DNN), but a second implementation of the scanner's documentation grammar in every reader. That is why it is not made.

**A fork left to the root:** the reading could be grown to hold every kind of line the composer writes there: a reference with its words, a web link, a plain name. The lines would then be held once, the way type references are, with the composer writing them on the engine's side. On these corpora the three kinds cover every line. It means the format carrying the whole shape of that section, multi-line words included. I did not build it, since it changes the format, and the blind readers go out next.

### 2. The blind cases, each seen failing

[`check-removal.mjs`](check-removal.mjs) takes each check out of the module once, runs the blind cases, and restores the module. Its results are in [`check-removal.json`](check-removal.json).

**The first run found six checks whose cases did not fail when the check was out**, because a second check caught the same file:

| Check taken out | What still refused its case |
| --- | --- |
| A wire is never the file's own (`wires-self`) | The records-against-wires comparison |
| A frame's kind is defined (`kind-7`) | The frames' order |
| A strings frame holds a string (`strings-count-0`) | The frames' order |
| The paths are in strict order (`paths-repeat`) | The records-against-paths comparison |
| The authored line is required, and at most one cited-by line (`no-authored`, `entry-before-authored`, `two-cited-by`) | The text written again and compared |
| The deflate stream's end, on the writing side | The inflater's own reading side |

As written, those cases proved only the pair of checks.

**The rewrite.** Every case now asks for the words of the refusal its own check gives, and two bundled tests were split into one per file. `paths-differ-from-records` was added for the one check no blind case reached. The text order cases were also tied to "a file's lines begin with its file line", which the first list had not taken out.

**The second run:** with its check out, each of the 26 binary and text cases fails. "An inflater's error is a refusal", taken out on both sides, fails `zlib-wrapped` and `after-deflate-end`.

**One check still has no case:** the writing side of the deflate stream's end. Node's inflater reports a stream with bytes after its end on the reading side too, so no file can show that check alone. It is kept for an inflater that reports on one side only.

### 3. The graph built only when asked

`graphViewOf` gathers in one pass what every file's part needs of the others: its inbound and its documented-by, both from the targets alone. It builds each file's part only when asked for it. `graphOf` is now that view asked for every file, so there is still one implementation.

| DNN, interleaved runs at a load of 3.6 | First answer | Facts read and checked | The graph as asked (index, and the hub's Local Map) | The whole graph | Peak |
| --- | ---: | ---: | ---: | ---: | ---: |
| Stored form | 76 to 83 ms | 553 to 595 ms | **620 to 645 ms** | 732 to 753 ms | 249 to 291 MB |
| `index.json.gz`: inflate and parse, the graph already in it | (all of it first) | | **600 to 664 ms** | | 393 to 394 MB |

**Built as asked, the stored form now reads DNN in JSON's time**, every check made. It gives its first answer eight times sooner, in about 70 % of the memory. A consumer that asks for every file pays about 0.1 s more, building what JSON had already spelled out.

On all three corpora the graph still prints byte for byte as each `index.json`, and both round trips are exact. They were measured again after the change.

### 4. The tab

[`tab.mjs`](tab.mjs) builds a page holding DNN's stored form (2.24 MB) as base64 in a block the browser does not run, and the module's built script inline and unchanged. The page is 3.05 MB. It is opened from disk under a policy of one hashed script and no network, and is read by headless Chromium through the lane: two holds, of 1.3 s and 4.8 s.

| DNN in a tab | First answer | Facts read and checked | The graph as asked | The whole graph | JS heap |
| --- | ---: | ---: | ---: | ---: | ---: |
| Full speed | 55 ms | 394 ms | 434 ms | 559 ms | 60 MB |
| Slowed four times | 224 ms | 2.27 s | 2.53 s | 3.25 s | 58 MB |

The research's slowed tab took 3.2 s for JSON on DNN, but it also held the browser to two cores (`taskset -c 0,1`), and this run did not. So the two are not quite one condition, and a JSON page was not run beside this one.

### What held in the fourth milestone

All of these passed:
- `npm run lint` and `npm run build`;
- the three audits and `docs:links:enforce`;
- `live-docs:generate` and its `--check`;
- the package's 48 cases, its fuzzer among them;
- the whole unit project, run once: 3,679 of 3,679 cases in 242 files.

### Commands the harness refused in the fourth milestone

None.

## Fifth milestone, 2026-11-22, first leg: the review's plain faults mended, the text against the module, and the links measured

I merged the day's tip (`46e13bf60`), then the reviewer's branch (`418c0b821`), both without conflict. [The review's record](../stored-form-review/README.md) and its test file were read whole first. The review's own words and cases were left as they were.

### B. The plain faults, mended

Each mend was checked against the reviewer's case, and no case was touched.
- **1 and 2, the text export.** The text is now written line by line and counted as it is written, in UTF-8 bytes, line breaks included. Before each line is built, the bytes its path and names will take are counted, so no line is built past the bound. There is no spread call. The text's bound is now on the text itself (section 3.5), which ends both breaks.
- **3, the graph's sorts.** Wires, inbound and documented-by are now file numbers sorted as numbers. Each target is looked up once by its path, so no path is compared twice.
- **4, the whole read.** It now inflates each section only when it reads it, after the checks on every section before it. Each frame's count is also checked against what its raw length can hold, from the header alone and before anything is inflated: a string takes 1 byte, a record 7, a path 2, a file's wires 1. Section 2.1 lists these.
- **6, the end line.** It is now written again and compared, as every other line is.
- **7, names an object's prototype answers.** The graph's files are keyed in an object without a prototype. A new case holds that `__proto__`, `constructor`, `toString` and `hasOwnProperty` are files like any other, each wired, and that a path no file has answers nothing. It failed against the module before this mend and passes now.
- **8, the section limit.** A text's facts are now sized into the sections the layout would hold, by its own grammar and compressed by nobody. Section 8's list of what makes a valid text names this.

**The review's cases:** 13 of its 15 that failed now pass. The two still failing are A's:
- the memory a byte of the file costs once its facts are built (finding 5);
- the fuzzer reaching a section's grammar (finding 12, which is F).

The three corpora were checked again after B. On each, the graph read back prints byte for byte as its `index.json`, and both round trips are exact:

| Corpus | Files | Stored | `index.json` gzipped |
| --- | ---: | ---: | ---: |
| This repository | 1,336 | 1,125,106 B | 1,424,603 B |
| Estate | 41 | 7,841 B | 10,526 B |
| DNN | 10,777 | 2,238,231 B | 3,790,747 B |

**What B4 costs.** At a load of 20, interleaved, DNN's facts took 3.2 to 3.3 s against JSON's 2.2 to 2.7 s. The last milestone's concurrent inflation had made them 553 to 595 ms against 600 to 664 ms on a quiet machine. Inflating strictly in order, as B4 asks, gives that lead back.
- **Not yet measured:** the same on a quiet machine.
- **A fork for the root:** a window of a few sections inflated ahead would bound the wasted work by a constant number of sections, and keep most of the concurrency.

### E. The text against the module

Section 5 now says **every dependency makes an edge**, with a link or not. One without a link has no `link` and no `to`. The section keeps a note of the earlier sentence and its cost: a reader built from it gave 6,576 fewer edges on DNN.

The two text refusals that named the wrong line now name the right one:
- a line not written as the text form writes it is named by its own number, not by the line after its block;
- a line after the end line is named by its own number.

### H. What was read blind

The specification's opening paragraph now says which text was read blind, and when:
- the text as it stood at 02:56 UTC;
- not what came after: the documentation references, the extension's rule, and this day's later mends;
- a second reading runs on the text of 04:40, and a third follows once the format rests.

### A. The cost guarantee

Section 6's sentence on cost is now marked in the text as not holding and under redesign. The marking names the review's five breaks, the four now mended, and the two designs to be measured. **Neither design is measured yet.**

### C. A link and what it names: measured

[`link-facts.ts`](link-facts.ts) measured every link field of the three corpora against the engine's rule, `linkTarget`, given the head's location:

| Corpus | Links that carry a target | Stored equals the engine's rule | Given no target | Deriving every target | File with targets → without |
| --- | ---: | ---: | ---: | ---: | --- |
| This repository | 9,153 | 9,153 | 0 | 43 ms | 1,125,085 → 1,105,803 B (−1.7 %) |
| Estate | 177 | 177 | 0 | 1 ms | 7,840 → 7,528 B (−4.0 %) |
| DNN | 48,689 | 48,689 | 0 | 269 ms | 2,238,226 → 2,124,866 B (−5.1 %) |

**What the agreement means:** the probe's sink makes its targets with that same rule, so the agreement holds by construction. What the numbers show is that every link derives. A real sink's agreement can be measured only once the two are wired.

**What deriving costs.** 269 ms on DNN with the engine's functions as written, which build a document path for each link. Links repeat within a folder, so a cache by folder and link would cut it; that was not measured.

**The fork, with its numbers:**
- **Derive.** One fact in one place, and the file 1.7 to 5.1 % smaller. The rule (the markdown link rule's fragment, query and percent-decoding, the folding of `.` and `..`, the docs' prefix and the case-folded extension) goes into the module and the specification in full.
- **Store both, and refuse a file where they differ.** The reader carries the same rule, and the file keeps the extra 1.7 to 5.1 %.

Both need the rule in the reader, so the numbers favour deriving, as the root leans. It is not built yet: it changes the format, and is the next leg's first work.

### D. What the link fields hold

On the three corpora, the fields that carry a target hold only relative paths (8,142, 177, 45,122) and fragments of the document itself (1,011, 0, 3,567).
- **No link field holds a scheme**, so every web link is in documentation lines, which are words. That confirms the root's expectation.
- **The fields that carry no target hold relative paths and fragments too:** sources (3,917, 105, 39,086), cited-by, entries' declarers and symbols, and re-exports' origins.

**The brief's rule cannot be taken as written.** "Nothing climbing above the docs' root" would refuse every source link and every cited-by link, since those climb out of the documents to the scanned folder's own files. The rule to state and measure is **nothing climbing above the scanned folder**, along with no scheme and no NUL. It has not yet been measured, nor refused anything.

The page's handling of bidirectional controls in a name has not yet been looked at.

### What held in this leg

All of these passed:
- `npm run lint` and `npm run build`;
- the three audits and `docs:links:enforce`;
- `live-docs:generate` and its `--check`.

The whole unit project, run once: 3,737 cases passed and 4 were skipped. Two failed, both the review's, and both are expected:
- finding 5, which waits on A;
- finding 12, which is F.

### Not reached in this leg

- **C and D built:** the format's change.
- **A's two designs, measured.**
- **F:** the reviewer's raw fuzzer as the fuzzer's second stage, and cases for the 56 refusals that have none.
- **G:** the Windows hazards.
- **The review's finding 5**, which waits on A.

### Commands the harness refused in this leg

None.

## Fifth milestone, second leg, 2026-11-22: the fuzzer reaches the grammar; inflating ahead measured

The root ruled on the first leg's forks:
- the link rule is mine: nothing climbing above the scanned folder, no scheme, no NUL;
- inflating ahead is to be decided by a quiet measure of strict against a bounded window.

### F. The fuzzer's second stage: the review's twelfth case is green

The package's mutants (`test/fuzz/mutants.mjs`) now have a second stage, the review's raw-section fuzzer taken in. On every odd seed but a bomb's, one section's uncompressed bytes are changed in one of nine ways: a bit, a byte set, a byte put in or taken out, a number written longer, a count one off, two bytes swapped, a byte one off, a section cut. The file is set down again with every hash and the end right, so that the mutant reaches the section's grammar.

Two more changes to the harness:
- **The worker gains the review's oracle.** What a reader accepts and can write again is written again and read back. A different content name is a finding ("a second name").
- **The harness goes on after a hang**, from the next seed, in a fresh worker. It used to stop at the first hang, and with the second stage the careless reader hung at seed 1, hiding every fault after it.

**What the cases show:**
- **The review's case "reaches the grammar of a section"** (at least a tenth of the mutants refused by a section's grammar) now passes. It failed before.
- **The fuzzer's own cases pass.** The real reader returns facts or a refusal for all 800 mutants, within its bounds, with no second name. The careless reader is still found out in at least two ways.

**The review's fifteen cases:** fourteen now pass. The one still failing is finding 5, the memory a byte of the file costs once its facts are built, which is A's.

### B4. Inflating ahead, measured

[`window.mjs`](window.mjs) writes a copy of the module with a window. The window inflates ahead, in order, only sections whose headers have passed every header-only check, and holds the raw bytes in flight within a constant. The probe times the whole read with and without it, interleaved, seven runs each. The machine was never quiet: other agents held its load at 11 to 17.

| Median of 7 | Strict | 8 MiB window | Strict | 32 MiB window |
| --- | ---: | ---: | ---: | ---: |
| DNN, 10,777 files | 1,345 ms | 927 ms | 816 ms | 655 ms |
| Five times DNN, 53,885 files | 2,395 ms | 2,241 ms | 2,847 ms | 2,336 ms |

**Strict is not within the noise of the window.** It is 20 to 30 % slower on DNN in both pairs, and 6 to 18 % at five times. So by the ruling the window is to be built, and its waste stated as its constant: at most the window's raw bytes, inflated ahead of the section being checked.

**Not built yet,** nor its case. A case that holds the bound needs a hostile file whose refusal comes only in its records, after valid paths and wires for every file the records declare. With sections of compressible bytes, the inflation bound refuses such a file before it reaches the records. The way I see: a file of a few incompressible 1 MiB records sections, the first refused, and a case holding that what is inflated ahead stays under the window's constant, measured as memory against the window. That is the next leg's first work, with the window set at 8 MiB unless the root prefers more speed for more memory.

Five times DNN, written as facts arrive from disk for these measures, took 8.3 s at a 251 MB peak (6,427,108 bytes). DNN took 2.4 s at 206 MB (2,238,498 bytes).

### What held in the second leg

The whole unit project, run once: 3,738 cases passed and 4 were skipped. One failed, the review's fifth, which waits on A.

Lint, the audits, `docs:links:enforce` and `live-docs:generate` passed too.

### Not reached in the second leg

- **The window built**, with its case.
- **C built:** targets and anchors derived, the rule in the specification in full, and what caching by folder buys.
- **D built:** the link rule measured, stated and refused.
- **A's two designs**, measured on DNN and five times DNN, under Node and in a tab. They decide the review's fifth case.
- **G:** the Windows hazards.
- **What the page does with a name holding bidirectional controls.**

### Commands the harness refused in the second leg

None.

## Fifth milestone, third leg, 2026-11-22: the two designs for a reader's cost, measured

The root's order: measure A's two designs first, since they decide the review's last red case and whether a whole read survives. The window waits on that, and C, D and G follow. Nothing was built; these are measures.

### What the consumers ask

From the page's own code:
- **The map** (the world map's model and controller) reads every file's paths, edges or wires, archetype and entries.
- **The search** (`graph-search.ts`, `search-field.ts`) walks every file's symbols for their names.
- **The reader's pane** (the detail panel, `sources-facts.ts`) reads one file's whole facts.
- **The command line** asks one file's facts, or walks wires.

So the page needs every file's paths, wires and symbol names, but one file's details at a time.

### Under Node

[`design-a.mjs`](design-a.mjs) runs each in a fresh process, at a load of 17 to 27:
- **Design 1**, the facts never built whole, is a copy of the module whose quick open keeps only the section it last decoded, and decodes an asked section again.
- **Design 2** is the whole read in a worker.

| | DNN: time | DNN: peak | DNN: held after | 5× DNN: time | 5× DNN: peak | 5× DNN: held after |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Today's whole read, every fact built and kept | 2.1 s | 238 MB | 87 MB | 4.5 s | 475 MB | 277 MB |
| 1: validation walk, every check made, nothing kept but strings, paths and wires | 2.4 s | 226 MB | 47 MB | 4.3 s | 373 MB | 76 MB |
| 1: one file asked after the walk (the hub's, 209 symbols) | 68 ms | | | 45 ms | | |
| 1: a search walk, every symbol's name read, the matches kept | 2.9 s | 217 MB | 57 MB | 4.3 s | 371 MB | 74 MB |
| 2: the scan cloned out of the worker | 3.7 s | 324 MB | 81 MB in the caller | 10.8 s | 827 MB | 368 MB in the caller |
| 2: kept in the worker, one file asked by message | 1.9 s, then 8 ms an ask | 253 MB | 12 MB in the caller | 3.5 s, then 8 ms | 507 MB | 20 MB in the caller |
| 2: the graph built in the worker and cloned out | 4.8 s | 371 MB | 101 MB in the caller | 11.5 s | 1,018 MB | 458 MB in the caller |

### In a tab

[`tab-worker.mjs`](tab-worker.mjs) builds a page holding DNN's stored form and the module's built script. The page starts a worker from a blob holding the module and hands it the bytes, transferred. One hold each.
- **Under today's policy, a page cannot start a worker at all.** Chromium refuses the blob worker by the page's `script-src` hash: "Creating a worker from 'blob:null/…' violates the following Content Security Policy directive". So design 2 on the page needs the policy to grow a `worker-src`, which is a change to the page's security the owner must weigh.
- **With `worker-src blob:` added, the module worker still failed**, with no message, on DNN and on five times. Why was not established in this leg: a module worker from a blob in a page opened from disk, or the worker inheriting the page's policy, are the first suspects.

### What the numbers say

**Design 1 cuts what a reader holds once it has read**, not its peak while reading:
- held after: 87 → 47 MB on DNN, and 277 → 76 MB at five times DNN, 3.6 times less;
- peak during the walk: 238 → 226 MB and 475 → 373 MB;
- time: about the whole read's, since every check is still made;
- one file is answered in 45 to 68 ms by decoding its section again.

What it does not do as measured: bound the memory of one section. A section holds 256 files, and its records may be up to 64 MiB, so asking for one file can still build a great deal. **The review's fifth case** (one file of a million symbols, its `length` asked within 54 MB) **can be met only by design 1 carried into a file's own lists**: a file read back as a view whose `symbols` decodes a symbol when it is asked for.
- No representation that builds the million symbols passes that case. V8's smallest object of a symbol's six fields is some 70 bytes, so a million is about 70 MB against the case's 54.
- Design 2 cannot pass it either, since the case reads in-process.

**Design 2 contains the cost; it does not reduce it:**
- **Cloning across the boundary doubles both time and memory** (10.8 s and 827 MB at five times DNN, against 4.5 s and 475 MB). It is not a way to hand a page its facts.
- **Kept in the worker and asked by message is cheap** (8 ms an ask, the caller holding 12 to 20 MB), but the worker holds the whole read as today (507 MB peak at five times).
- What design 2 buys is a ceiling: a stranger's file that would take the machine's memory ends the worker, not the page.
- On the page it needs a policy that allows a worker, which today's does not.

**My recommendation, which is the root's guess, now measured:**
- **Design 1 for memory.** The read gives back views, a file's lists decoded as asked. A validation walk checks the whole file once, keeping nothing but the string table, paths and wires. This is what makes the review's fifth case green.
- **Design 2 as the page's protection,** but only by asking through messages, never by cloning. It also needs a policy change, so it is the owner's to weigh against the page's single hashed script.

**Before building, a fork for the root and the owner:** design 1 changes what a reader returns. A `StoredFile` read back becomes a view and no longer a plain object, which every consumer of the module would read through. That is the API's shape for every later reader, and is worth a ruling before it is built.

**The window (B4)** survives design 1, since its validation walk is still a whole read in order. It is to be built after the ruling, at 8 MiB, with its case.

### Not reached in the third leg

- **Design 1 built**, which needs the ruling above.
- **The tab's worker under a `worker-src` policy**, debugged.
- **The window and its case.**
- **C, D and G**, and the page's bidirectional controls.
- **The second blind reading's additions**, received during this leg and not yet begun:
  - the end line's five variants as cases;
  - one reading of the text's bound;
  - nothing bounding the graph, to be named in A;
  - its thirty-five questions answered in the text;
  - the two Provenance sentences that tell a reader of blind readers, removed or moved.

### Commands the harness refused in the third leg

One, by a safety check, not the worktree rule: a command whose `rm -f $S/*.ndjson` named a shell variable that would reach `/` were it empty. It was re-issued with `"${S:?}"` and no removals. Because the refused command had also held the `mkdir` of the scratch folder, the first try at making the stored files did nothing, and was run again.

## Fifth milestone, fourth leg, 2026-11-22: the facts never built whole, and the fifteenth case green

The root ruled on A:
- **Design 1 is the format's answer, and is built.** A reader hands back a view.
- **Design 2 is the page's own question**, for the work on the one page that scans.
- **The inflation bound stays at 64.**

### What the tab's worker showed, exactly, for the page's probe to start from

From the third leg, with [`tab-worker.mjs`](tab-worker.mjs) in headless Chromium through the lane, on a page opened from disk (`file://`):
- **Today's policy, `default-src 'none'; script-src 'sha256-<the page script's hash>'`.** `new Worker(URL.createObjectURL(new Blob([module text], { type: "text/javascript" })), { type: "module" })` is refused. The console said: "Creating a worker from 'blob:null/915249d3-4c03-4b79-ae0d-75bee030c849' violates the following Content Security Policy directive: "script-src 'sha256-2TxB17ZBBPagcYalo6ytC1YHxvrhrkR6gWUPrPVYp0s='". No…" (cut at 200 characters by the probe).
- **The same policy with `; worker-src blob:` added.** The same call raised no exception, but the worker's `onerror` fired with an empty message, and the console held nothing. This was the same on DNN's page (3.06 MB) and on five times DNN's (8.64 MB).
- **Not tried:**
  - a classic worker, with the module's exports taken out;
  - a worker from a `data:` URL;
  - a page served over `http://` rather than opened from disk;
  - reading the worker's own error from inside it.

### The view, built

- **The whole read is a walk.** `readScan` reads every section once, in order, with every check. It keeps:
  - the string table, the paths and the wires;
  - each records section's inflated bytes.
  
  It keeps no file's facts: the section it decoded last is let go when the walk ends.
- **Its `files` is a view:** a read-only list whose items are decoded from their section's kept bytes when they are read, and not kept. To every reader of it, it is an array: its length, its indexes, iteration, `map`, `Array.isArray` and JSON all behave as on one. Writing to it is refused. An item read twice may be two equal objects, not one.
- **The quick open** (`openScan`) now keeps only the section it last decoded, and decodes again from kept bytes a section asked for after the walk passed it.
- **Specification:** section 6 now says what a reader promises:
  - after the walk, memory is what the file inflates to;
  - a file's facts are decoded when asked for, and what is held is what was asked for;
  - **not yet:** a file's own lists are decoded whole when the file is asked for, so a million symbols' count still builds the million symbols. That is the next step of the view.
  - The graph and the text are bounded by what they describe. A graph printed by a consumer is named as not bounded by the file's size: the second reading's fifth finding.

**Result:**
- **The review's fifteen cases all pass**, four still skipped for their reasons.
- **Every other case of the package passes through the view unchanged**, the fuzzer's included.

**On the three corpora, read through the view,** the graph still prints byte for byte as each `index.json`, and both round trips are exact:

| Corpus | Files | Stored |
| --- | ---: | ---: |
| This repository | 1,336 | 1,125,314 B |
| Estate | 41 | 7,872 B |
| DNN | 10,777 | 2,238,800 B |

**DNN, two runs at a load of 12 to 23:**

| | First answer | Walk (facts read and checked) | The graph as asked | The whole graph | Peak |
| --- | ---: | ---: | ---: | ---: | ---: |
| | 162 to 194 ms | 1.18 to 1.48 s | 1.75 to 2.31 s | 1.88 to 2.10 s | 226 to 326 MB |

The graph as asked now costs about 0.6 s more than the walk: its index pass reads every file through the view, so each file is decoded a second time. Gathering the inbound and documented-by numbers during the walk itself would remove that second decoding. It is not done.

### The second reading's additions, done in this leg

- **The end line's five forms** (its finding 2) are now cases: `[null, "end",3]`, a trailing space, `[null,"end", 3]`, `[ null,"end",3]` and `[null,"end",3.0]`. Each is refused. All five failed with the end line's check taken out, and passed when it was put back.
- **The text's bound** (its finding 4) now has one reading: the text's own UTF-8 bytes, line breaks included (section 3.5, since the first leg).
- **Nothing bounds a printed graph** (its finding 5) is named in section 6.
- **Three passages that told a reader of blind readers were removed or made neutral:**
  - section 3.5's Provenance, "Both blind readers stream the text and write it";
  - section 3.2's naming of Python's and Go's inflaters;
  - the new section 6's naming of the second reading.

  The specification's opening lines, which the blind harness strips, still say what was read blind.

### The unit project

The first run of this leg failed 35 cases. Every one was the machine's, at a load of 35 with 1,749 processes:
- 30 of the engine's discovery oracle, each a `git config` that failed without a word;
- five five-second timeouts.

Run alone at a load of 12, the discovery oracle passed 60 of 60 and the package's suite 23 of 23. **The whole project, run again at that load, passed whole:** 3,744 cases passed and 4 were skipped, in 246 files.

### Not reached in the fourth leg

- **A file's own lists, decoded as read.**
- **The graph's index gathered during the walk.**
- **The window and its case.**
- **C and D.**
- **The second reading's thirty-five questions, answered in the text.**
- **G.**
- **The page and bidirectional controls.**

### Commands the harness refused in the fourth leg

One: an empty heredoc left by mistake before a `grep`, refused as too complex to verify. It did not name git. The `grep` was run alone.
