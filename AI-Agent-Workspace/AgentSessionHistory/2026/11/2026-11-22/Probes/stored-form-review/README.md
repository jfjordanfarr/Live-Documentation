# The stored form, reviewed by someone who did not build it

_Historical record of 2026-11-22, by an independent reviewer for the root, on `day/2026-11-22` from `8cfd27b85`. It reviews [the module](../../../../../../../packages/stored-form/src/storedForm.ts) against [its specification](../../../../../../../.mdmd/layer-3/stored-form.mdmd.md), with the package's tests and fuzzer. Nothing in the module, the specification or the existing tests was changed. The findings come back as [one test file](../../../../../../../packages/stored-form/test/storedForm.review.test.ts) whose cases fail today, each for the reason its name states. The specification was read whole first, then the module; [the builder's record](../stored-form-module/README.md) and [the blind readers' record](../stored-form-second-reader/README.md) were read after._

## At the top: one guarantee broken five ways

**A reader's cost is bounded by the file it is handed** (section 6: "Its time and memory are bounded by the file's size"). It breaks five ways, each with its own cause:
1. the text export writes a path on every line;
2. the text export throws on a file of many lines;
3. the graph sorts paths from their first letter;
4. the whole read inflates every frame before it checks any;
5. the memory per byte of the file is about 30 times what the bound's reasoning assumes.

By the rule for this case (AGENTS.md, roots and builders): mending stops here, and the simplest design that does not need the guarantee is measured.

The guarantee as built is "every loop is bounded by bytes already checked to be there". Each break above lies in code that keeps that rule loop by loop. What is not bounded:
- the product of two bounded loops (breaks 1 and 3);
- the constant (break 5);
- the work started before a check (break 4);
- or a platform's limit on one call (break 2).

Two candidates the root might measure:
- **A budget the host enforces**, in place of a bound proved in every loop. Any read, text or graph of a stranger's file runs in a worker with a deadline and a memory ceiling, and a run past either is a refusal. A page can stop a worker; Node gives a worker `resourceLimits`.
- **A text written as a stream and counted as it is written**, in place of the walk that counts names first. One counter of the bytes written, against the bound, measures what it bounds. It is how both blind readers write it.

Neither was built.

## Findings, in rank order

Each finding gives the file or text, the command that shows the module's answer, the answer, and the sentence it breaks. Every case named is in [`storedForm.review.test.ts`](../../../../../../../packages/stored-form/test/storedForm.review.test.ts); run it with `npx vitest run packages/stored-form/test/storedForm.review.test.ts`. The probes beside this record measure each at larger sizes. Times are on a shared machine, at loads that varied, and compare only things run beside each other.

### Breaks a guarantee

**1. The text export writes a file's path on every line, which the bound's count of names counts once.**
- *The file:* one file whose path is 1,024 letters, holding 20,000 empty symbols. Written by `writeScan`, it is 588 bytes.
- *The module:* `textOf` returns a text of 22,402,209 bytes against a bound of 1,087,360, and does not refuse. ([`text.mjs`](text.mjs)) A 610-byte file with a path of 4,096 letters has a text of 83,848,331 bytes.
- *At scale:* a 642-byte file (a path of 32,768 letters, 18,000 symbols) makes `textOf` **throw** `RangeError: Invalid string length` after holding 725 MiB ([`text-big.mjs`](text-big.mjs)). The text grows as the square of what the file inflates to: a path of half the budget, named on a line by each of the budget's sevenths.
- *The sentences:*
  - Section 3.5: "The names are counted in UTF-8 bytes: each string, once for every time a record names it." The record names the path once; the text writes it on every line.
  - Section 6: "Its time and memory are bounded by the file's size."
  - The module's own words at `textOf`: "a small file naming one long string a million times is refused rather than written".
- *The text is at fault too:* the count it states does not count what the text writes.
- *Case:* "the text writes a file's path on every line of it…".

**2. The text of a file of 149,000 lines throws.**
- *The file:* one file, path `a`, 149,000 empty symbols: 1,886 bytes, within the bound.
- *The module:* `textOf` rejects with `RangeError: Maximum call stack size exceeded`, which `settle` passes up as it is. The cause is `lines.push(...fileLines(f))` in `textOfScan`: a spread call of one argument a line. On Node 26, 100,000 arguments pass and 150,000 do not ([`text.mjs`](text.mjs)).
- *The sentence:* section 6, "A reader takes any bytes at all and returns facts or a refusal that says why. It never hangs and never fails in any other way."
- *Case:* "the text of one file of 149,000 lines throws a RangeError…".

**3. The graph sorts paths by comparing them from their first letter.**
- *The file:* n files under one folder whose name is L letters, each depending on every file. The facts are an n-by-n table, which the whole read reads in linear time.
- *The module:* `graphViewOf` and `graphFileOf` sort every file's targets with `comparePaths`, which walks the L shared letters at every comparison. The cost is about n² log n × L. Measured with [`graph.mjs`](graph.mjs):

  | n | L | File | Whole read | One file's part asked (`graphViewOf`) | Whole graph (`graphOf`) |
  | ---: | ---: | ---: | ---: | ---: | ---: |
  | 256 | 16 | under 0.1 MiB | 89 ms | 45 ms | 86 ms |
  | 256 | 4,096 | under 0.1 MiB | 160 ms | 1.9 s | 3.8 s |
  | 512 | 4,096 | about 0.06 MiB | 380 ms | 6.6 s | 15.0 s |
  | 1,024 | 8,192 | about 0.24 MiB | 4.4 s | **157 s** | **212 s** |

  In the test, a 5,212-byte file is read in 236 ms, and its graph takes 4,490 ms.
- *What it costs a person:* asking for one file's part costs the whole pass that gathers inbound, so a Local Map of one file waits as long as the whole graph does.
- *The sentence:* section 6, as above; section 5 promises one pass over the targets, and this pass is not linear in them.
- *Case:* "the graph sorts paths by comparing them from their first character…".

**4. The whole read inflates every frame at once, before it checks anything.**
- *The file:* a head, k frames of records each declaring 256 files in one byte, and paths and wires each declaring 256 × k files in one byte. Every hash and the end are right.
- *The module:* both readers refuse it ("the paths claim … paths in 1 bytes"). The quick open refuses before any record is inflated. `readScan` first starts an inflation for every frame (`opening(bytes, true)`). Measured with [`frames.mjs`](frames.mjs):

  | k | File | Quick open refuses in | Whole read refuses in | Whole read's peak (RSS) |
  | ---: | ---: | ---: | ---: | ---: |
  | 10,000 | 0.5 MiB | 22 ms | 2.5 s | 237 MiB |
  | 50,000 | 2.3 MiB | 92 ms | 15.6 s | 1,049 MiB |
  | 100,000 | 4.6 MiB | 266 ms | **97.2 s** | **2,032 MiB** |

  Time grows faster than the file: twice the frames, six times the time.
- *The fuzzer misses it:* its measure (heap, ArrayBuffers and external) saw 1,049 MiB at k = 100,000, against its own bound of 341 MiB. The rest is the inflaters' native memory, which that measure does not count.
- *The sentence:* section 6, as above. Its order (check the end, then the head, paths and wires, then the records) is the order of answers. It is not the order of the cost.
- *Case:* "the whole read inflates every frame at once…".

**5. Memory a byte of the file: about 2,000 bytes, against the 64 the bound's reasoning gives.**
- *The file:* one record of n empty symbols (7 bytes each), its stream led by empty stored blocks so that the file is a 63rd of what it inflates to. That is within section 3.5's bound, and every inflater reads such a stream.
- *The module,* measured with [`memory.mjs`](memory.mjs):

  | Symbols | File | Read's peak | Held after | The fuzzer's bound |
  | ---: | ---: | ---: | ---: | ---: |
  | 300,000 | 16,694 B | 73.5 MiB | 44.1 MiB | 49.0 MiB |
  | 1,000,000 | 94,471 B | 207 MiB | 155 MiB | 53.8 MiB |
  | 4,000,000 | 427,802 B | **1,055 MiB** | 764 MiB | 74.1 MiB |

  In the test, the 94 KB file held 181 MB. At this rate a file of 2 MB passes a tab's heap. That figure is extrapolated: no tab was run.
- *The sentence:* section 3.5, "every fact a reader builds takes at least one uncompressed byte, so memory is bounded by the file's size". It holds in order and not in size. A symbol takes 7 bytes of the 64 and some 180 bytes of JavaScript objects, so the factor is about 64 × 25.
- *What this asks of the text:* the bound may be right as a bound on inflation. Section 6's promise needs either a bound that counts what a fact costs a reader, or a budget the host enforces.
- *Case:* "a 94 KB file within the inflation bound holds more than 150 MiB once read…".

**6. The end line of the text is accepted however it is written.**
- *The text:* `textOfScan` of two empty files. Its last line, `[null,"end",2]`, is replaced by each of `[null, "end", 2]`, `[null,"end",2.0]`, `[null,"end",2e0]`, `[null,"end",2]`, `[null,"end",2]` followed by a CR, and a line led by a space and ended by a tab.
- *The module:* `scanOfText` accepts all six ([`forms.mjs`](forms.mjs)). `parseText` parses, writes again and compares the head's lines and every file's lines. The end line it only parses (`row.length !== 3 || row[2] !== files.length`).
- *The sentences:* section 8:
  - "Each line is one JSON value (RFC 8259) written in exactly one way";
  - "no line holds a CR";
  - refused, among others, are "a space anywhere outside a string", "`4.0` or `4e0` for `4`" and "a letter written as a `\u` escape".
- *So:* one set of facts has seven texts.
- *Cases:* "refuses the end line written …", six of them.

**7. A file named `__proto__` is in the view and missing from the whole graph.**
- *The file:* two files, `__proto__` (depending on `a`) and `a`. Section 2.4 allows the path, and the module writes and reads it.
- *The module:* `graphViewOf(scan).file("__proto__")` gives the file. `graphOf` keys its files in a plain object, where setting `__proto__` sets the object's prototype instead of a member. So:
  - `Object.keys(graph.files)` is `["a"]`, and so is the printed graph;
  - `a`'s inbound names `__proto__`, a file the graph does not hold;
  - and `graph.files["edges"]`, a path no file has, answers with `__proto__`'s edges.
- *The sentences:*
  - section 5's "Provenance": `graphOf` "asks it for every file";
  - the brief's guarantee that `graphViewOf` asked for every file is `graphOf`;
  - and "the map does not lie": a file read is not drawn.
- *Outside this review's scope, read and not run:* the engine's `deriveLiveDocGraph` keys `files[...]` the same way. It also tests `if (files[doc.codePath])` before it sets one, and so it would throw "two docs describe" for a file named `constructor` or `toString`, which a plain object already answers.
- *Cases:* "gives the whole graph every file the view gives…" and "answers nothing for a path no file has…".

### A gap between the text and the module

**8. A text that section 8's list calls valid and no valid file holds.**
- *The text:* one file whose authored words are 64 MiB of letters.
- *The module:* `scanOfText` accepts it, and `bytesOfText` refuses it ("a section of 67108868 bytes is past the layout's 67108864").
- *The sentences:* section 8 defines a valid text by a list of "every check this specification makes on the facts themselves", and the list does not name `MAX_SECTION`. It then says "Equivalently, a valid text is exactly the text a reader writes for some valid file", and this text is not one.
- *The two definitions disagree.* The section limit depends on the facts alone, not on the compressor, so it belongs in the list (the inflation bound is left out for the compressor's sake, and that reason does not reach this limit).
- *Case:* "refuses as text the facts no valid file holds…". It builds a 64 MiB string and its text, and took 2.9 s.

**9. Section 5 says only a dependency with a link makes an edge; the module and the engine make one for every dependency.**
- *The sentence:* "The links that make edges, in order: each dependency with a link, then …".
- *The module:* `graphOf` of a file with `{ label: "node:fs", qualifiers: [] }` gives the edge `{"kind":"import","label":"node:fs"}`. So does the engine (`graph.ts`: "A dependency line without one names an external module"). The same section's "`link`, when there is one" assumes such edges exist.
- *No blind reader tested it:* the blind readers compared texts and content names, never graphs. A reader written from section 5 as it stands gives fewer edges.
- *Case:* skipped, text only.

**10. Section 2.4 says a link "may not name an absolute place"; its rule stores `https://`, `javascript:` and `data:` links.**
- The rule refuses a link that begins with `/`, `\`, a letter and `:`, or `file:`. The module keeps that rule.
- So `https://example.com/x`, `javascript:alert(1)` and `data:text/html,…` are stored, as are an empty link and a link holding U+0000 ([`forms.mjs`](forms.mjs)).
- The text says two things, and the mend is the text's, one way or the other.
- *Case:* skipped, text only.

**11. The specification says it was read blind, and its present grammar never was.**
- Its second paragraph says two blind readers agreed with the module. Those readers were committed at 02:56 (`d7b7ec38f`).
- The symbols' `docReference` list, the text's `documentation` member and the graph's documentation relation came at 03:38 (`7ba7acb27`). Neither reader holds the word "documentation".
- The extension's refusal of `\` and NUL came then too. The Python reader still reads an extension holding them: this review's differential fuzzer found exactly two disagreements in 2,000 files, both that.
- So section 4.3's symbol, section 5's documentation relation and section 8's `documentation` member have not been read by anyone but their builder.

### A weakness of the tests

**12. The fuzzer reaches the frames and the hashes, and almost never a section's grammar.**
- [`fuzz-reach.mjs`](fuzz-reach.mjs) reads the fuzzer's own 800 mutants and buckets each refusal by the check that made it.
- All but a handful are refused at the frame layer:
  - 290 by an undefined kind;
  - 133 cut;
  - 98 by a limit;
  - 99 by the frames' order and counts;
  - 22 by bytes after the end;
  - the rest by an inflater or a hash.
- Seven reach a check on a section's bytes, each through a header's lying count or raw length.
- None reaches a mark, a string's number, an enumeration, a number's shortest form, a path or link rule, the records' order, or the records against the paths or the wires. Every mutation is of the stored bytes, so any change inside a section fails its hash first.
- What the fuzzer never makes:
  - a section changed below its hash and set down again;
  - any field, count, mark or string number of a record;
  - more than two base files;
  - a valid file that costs much (findings 1 to 5).
- What its worker never calls: `openScan`, `file(i)`, `graphOf`, `graphViewOf`, `scanOfText` or `bytesOfText`. So the text parser and the graph are not fuzzed at all.
- Its measure of memory leaves out the inflaters' native memory (finding 4).
- *Case:* "reaches the grammar of a section…": 2 of 350 mutants, where a tenth is asked.

**13. Checks with no case.**
- [`check-removal-all.mjs`](check-removal-all.mjs) took each of the module's 91 refusals out once, in a copy, and ran the package's unit and blind suites against it.
- **56 of the 91 fail no case** ([`check-removal-all.json`](check-removal-all.json)). Many are guarded by a later check that refuses the same file, as the builder's record found for the blind cases. These guard one form for one set of facts, or the bound, and nothing else refuses their files:
  - **The strings' first-met order** ("a string numbered N where the next new one is N"). Without it, a record naming strings 1, 0, 1 meets every string by its end and is accepted, out of its one order.
  - **The end's name** ("the end does not name the sections before it"). Without it, an end that names other sections, its own hash right, is accepted.
  - **The enumerations' ranges:** an entry's reason and a reference's role.
  - **The marks' constraints:** a target without a link, an anchor without a target, and an entry's symbol link without its symbol.
  - **U+0000 in a path.**
  - **A number past 2^32 − 1, and one of six bytes.**
  - **The bound on the whole file's inflation**, the writer's bound at its finish, and the text export's bound.
  - **Two cases that accept either of two refusals:** "a string set down twice" matches `set down twice|not met`, and "wires that are not those the links name" matches `wires|after its last fact|names file`. Each still passes with its own check taken out.
- **The fuzzer does not hold them either.** Those fourteen were taken out again, one at a time, with the fuzzer's suite run beside the unit and blind suites ([`check-removal-fuzz.json`](check-removal-fuzz.json)). The fuzzer failed for none of them.
- The raw-section mutants of [`raw-fuzz.mjs`](raw-fuzz.mjs) reach most of these:
  - "a string numbered" 226 times;
  - the enumerations 47;
  - the marks' constraints 50;
  - numbers past 2^32 − 1 or of six bytes 15.

  They do not reach the end's name, since they set the end down right, nor the bounds. They are this finding's generator, for the builder to make cases from. A case for a check that refuses today passes, so none is in the review's file.

### Remarks

**14. What a hostile file can make a person see** (the brief's sixth guarantee). The layout carries a link and what it names side by side, and a symbol's documentation lines and their reading side by side, unchecked against each other (sections 4.3 and 12). Concretely, the skipped case's file holds a file `src/a.ts`:
- **A dependency** labelled `./b`, linking `b.ts.mdmd.md`, with target `src/c.ts`. The module reads it.
  - The pane shows `./b`, and its link opens b's document.
  - The graph wires `a` to `c`.
  - `b` has no inbound, so "what uses b" answers nothing and b looks dead. A person who trusts that and deletes b has been misled by a file that, to the eye, plainly uses b.
  - Leaving the dependency out would hide the use as well, but then the pane and the graph agree. Here the two contradict each other, and nothing can tell which is right.
- **A documentation line** `` - [`Widget`](b.ts.mdmd.md#widget) `` whose reading targets `src/c.ts`. The pane reads "see Widget on b"; the graph says `c` is documented by `a`.
- **A link may climb anywhere:** `../../../../../../etc/passwd` is stored. A page opened from disk that renders it as a link takes a click to that file of the person's machine.
- **A link may run script:** `javascript:` is stored. The Explorer's policy of hashed scripts would refuse to run one, but another viewer's might not.
- **A name can reverse itself on screen:** a path or name may hold bidirectional controls. `‮gnp.exe` is stored, and shows as `exe.png`.
- None of these is the module's error by the text.
- The disagreement between a link and its target is checkable: it is the engine's `linkTarget` (about 15 lines, with the markdown link rule's percent-decoding). Whether the format carries it is section 12's open question, and these are its stakes.

**15. Paths, against Windows** (the brief's fourth guarantee). The module stores, as section 2.4 allows:
- `a\..\..\..\x`, which climbs out of the folder on Windows;
- `CON` and `aux.txt`, reserved names;
- `src/a:b.txt`, an alternate data stream on NTFS;
- `dir./x`, `dir /x` and `x.`, which collide with `dir/x` and `x` where Windows trims a segment's trailing dot or space;
- `...` and `.. /x`.

Section 9 leaves each to the export, and names most of them. It does not name three:
- **A location whose documents land on the scanned files.** Root, base layer and extension may all be empty, and then `src/a.ts`'s document path is `src/a.ts`. With extension `.ts`, the files `a` and `a.ts` have it too: `a`'s document is `a.ts`. A writer of documents would overwrite source.
- **An extension that names a stream of the source.** An extension of `:x` makes `src/a.ts:x`, an alternate data stream of the source on NTFS.
- **Names equal under normalization**, which collide on macOS's file systems.

The extension also refuses `\` "since a backslash puts the document in another folder on Windows", while a path may hold one: the same hazard is refused in one field and allowed in the other.

*Outside this review's scope:* the engine's `linkTarget` with an empty extension computes `rest.slice(0, -0)`, which is the empty string. Every link then resolves to the path `""`.

*Case:* skipped, a remark on section 9.

**16. An empty link.** The layout stores a link of `""`, and the module's edge carries `link: ""`. The engine reads it as no link (`dependency.link ? resolve(…) : {}`), so the two graphs differ on a file the layout accepts. By section 5, "`link`, when there is one", the module is right.

## Attacked, and not broken

- **One file, one map, in the binary.** Every check of section 6 was read against the module's code: varints, counts, marks, string numbers, the frames' order, the front coding, the wires, the end. Then [`raw-fuzz.mjs`](raw-fuzz.mjs) made 5,000 mutants below the hashes, across five base files, in nine ways:
  - a bit, a byte set or one off, a byte put in or taken out, two swapped;
  - a number written longer;
  - a count one off;
  - a section cut.

  Each was set down again with every hash right ([`raw-fuzz.json`](raw-fuzz.json)). The results:
  - 758 were accepted and 4,242 refused, by 65 distinct checks.
  - Among them, 375 numbers written longer than they need and 15 past 2^32 − 1 or six bytes long were refused.
  - **For every accepted file, its facts written again gave the same content name and the same text: no second name.**
  - The 2,000 mutants of the two bases with no symbols were also read by the blind Python reader. The two disagreed on 2, both the extension rule the Python reader predates (finding 11).
- **One set of facts, one name.** As above. The text, apart from its end line (finding 6), was compared byte for byte by the module in every case tried.
- **The path order.** `comparePaths` agrees with `Buffer.compare` of the UTF-8 on all 117,649 pairs of strings of up to two code points, drawn from the boundaries of every range ([`order.mjs`](order.mjs)). Among them were U+0080, U+07FF, U+0800, U+D7FF, U+E000, U+FEFF, U+FFFD, U+FFFF, U+10000 and U+10FFFF, and empty and prefix strings.
- **The documentation relation.** I read `graphFileOf` and `graphViewOf` against section 5, with a reference to the file itself, to files outside the scan, and with and without link, target and anchor. I found no difference, and none follows a documentation reference into an edge or a wire.
- **A bomb within a frame.** Node's inflater stopped at the declared raw length in the fuzzer's bombs. I did not measure this again.

## Not reached

- A browser tab: Chromium's `DecompressionStream` (whether it too stops at the declared length), and the tab's heap on the files of findings 4 and 5.
- The Go reader as an oracle. It is as stale as the Python reader on the documentation list.
- Inflaters splitting on RFC 1951's corner cases.
- `resumeFrom` beyond the package's own cases.

## Commands the harness refused

One: `grep … ; git -C . log …`, a chained command naming git with a directory computed at runtime. The same questions were asked again by plain commands, one at a time.

## Files

- [`storedForm.review.test.ts`](../../../../../../../packages/stored-form/test/storedForm.review.test.ts): the findings as cases. 15 fail today, 1 passes (the text the end-line cases are made from), and 4 are skipped with their reasons.
- [`raw-fuzz.mjs`](raw-fuzz.mjs) and [`raw-fuzz.json`](raw-fuzz.json): the mutants below the hashes, with both oracles.
- [`check-removal-all.mjs`](check-removal-all.mjs), [`check-removal-all.json`](check-removal-all.json) and [`check-removal-fuzz.json`](check-removal-fuzz.json): every refusal of the module taken out once, in a copy, against the unit and blind suites; and fourteen of them against the fuzzer too.
- [`fuzz-reach.mjs`](fuzz-reach.mjs): what the package's fuzzer reaches.
- [`text.mjs`](text.mjs), [`text-big.mjs`](text-big.mjs), [`graph.mjs`](graph.mjs), [`frames.mjs`](frames.mjs), [`memory.mjs`](memory.mjs): the five costs, at sizes the tests do not run.
- [`forms.mjs`](forms.mjs): the end line, `__proto__`, a dependency with no link, and the paths, links and locations stored.
- [`order.mjs`](order.mjs): the path order on boundary code points.
- [`lib.mjs`](lib.mjs): the probes' framing and padding.
