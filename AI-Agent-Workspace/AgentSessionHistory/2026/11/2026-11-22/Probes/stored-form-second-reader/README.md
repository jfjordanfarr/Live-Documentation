# A second reader of the stored form, written blind

_Historical, written 2026-11-22 by a builder at the root's brief, on `day/2026-11-22` from `6c1a34554`. It tests a sentence that [the specification](../../../../../../../.mdmd/layer-3/stored-form.mdmd.md) says of itself: "Written so that a second reader can be written from this text alone. Where the module and this text disagree, this text is meant and the module is wrong." Until now every test of [the module](../../../../../../../packages/stored-form/src/storedForm.ts) was written by the one who wrote both the module and the text. Everything down to "Findings" is measured. The findings are the builder's reading of the specification against each disagreement and each question, and each names its section._

## Why it is done this way

Every agent started inside this repository can read the module. So the builder only made the samples, ran the comparison and read the results. The second reader was written by a headless Claude Code run, `claude-opus-5-5` at high effort. It started in an empty folder outside the repository that held the specification and three valid samples, and nothing else. This is [the blind reading's harness](../design-philosophy-reading/README.md) (which is [the playtest's](../../../../../../scripts/playtest/README.md) without its browser), with a shell put back inside a sandbox. [`blind-implementer.mjs`](blind-implementer.mjs) starts it:

- **Its only tool is Bash**, through `--tools Bash`, `--allowedTools Bash` and `--permission-mode dontAsk`. It has no MCP server, no setting sources apart from the sandbox's own `--settings`, no slash commands, and a one-line system prompt in place of Claude Code's: `You are a careful software engineer working alone in the current folder.` Its environment carries only `HOME`, a plain `PATH`, `LANG`, `TERM` and `TMPDIR`.
- **Every command runs in Claude Code's sandbox** (bubblewrap), with `allowUnsandboxedCommands: false`.
  - It may write only in its folder.
  - It may read nothing under `/workspaces`, `/home`, `/root`, `/tmp`, `/vscode`, `/go` or `/opt`.
  - It has no network: `allowedDomains` is empty.
- **The folder is under `/var/tmp`**, because `/tmp` holds every session's scratch on this machine.
  - Claude Code gives a sandboxed command a temporary folder that it may read and write. Left to itself, that folder is `/tmp/claude-1000`, which holds this session's scratch and every other session's. A first trial with Haiku found that folder readable, so the run is given a `TMPDIR` of its own beside its folder.
  - `/var/tmp` itself stays readable, so the harness now refuses to start a run while anything but the run's own folder is there. This guard was added after the second implementer was started once while the first one's folder was still in `/var/tmp`. It was stopped within seconds, before its sandbox had been set up or a command run (its folder held no `.claude` yet). The first folder was moved away, and the second run was started afresh after its own blindness check.

**What the folder held**, all in [`shown/`](shown/):
- `specification.md`: the specification with the two lines at its top removed (the line that names the module and the line that links the repository's records) and nothing else changed. The text still names `comparePaths`, `deriveLiveDocGraph`, `graphOf`, `openScan`, `readScan`, `storedForm.test.ts` and `CompressionStream`, as the specification does.
- The estate sample's stored form and text form: `corpus-estate.fpk`, 7,794 bytes, and `corpus-estate.txt`, 91,311 bytes.
- The two smallest of the package's own made scans, each in both forms: the empty scan (310 bytes) and `everyFact` (963 bytes).

The builder read that "the two smallest made scans" in the brief means those of the package's tests. This probe's own made scans for the order and the characters are smaller than `everyFact`, but they were kept back as unseen tests.

### The blindness check

Before the implementer started, a run launched the same way, in the same folder, was asked to list its folder and to try `/workspaces`, its home folder, `/tmp`, `/` and `/var/tmp`. It was also asked to reach two sites, to write outside the folder, to quote its instructions, and to say what it knew of a project or its owner. The answer is kept whole in [`runs/check-1.json`](runs/check-1.json). In its words:

- "**`ls -la /workspaces`** printed `.` and `..` only"; "**`ls -la ~`** printed `ls: cannot access '/home/node': No such file or directory`"; "**`ls -la /tmp`** printed `.` and `..` only".
- `/var/tmp` held only the run's folder and its temporary folder.
- Both requests failed: "`Tunnel connection failed: 403 user denied`" and "`CONNECT tunnel failed, response 403`".
- "`touch: cannot touch '/var/tmp/outside-probe': Read-only file system`".
- "I have one tool, `Bash`".
- "I haven't opened any files. … All I have is the email address from the context above."

**What still reaches a run**, as it reported:
- the program's environment lines (the operating system, the date, the folder);
- the signed-in account's email address;
- the Bash tool's description, with its git rules;
- the sandbox's own description;
- placeholder files (`/dev/null`) that the sandbox lays over dotfiles in the folder.

None of these names this project, its documents or the module. The second implementer's check ([`runs/check-2.json`](runs/check-2.json)) gave the same answers. Its `/var/tmp` held only its own folder.

### The instruction, as given

The prompt is `implementPrompt` in [`blind-implementer.mjs`](blind-implementer.mjs), and it went in whole. In short:
- Write, from this specification alone, in Python with its standard library only, `reader.py`.
- In `read <file>`, print the text form byte for byte, or one line beginning `refused:`. The program must never hang, never crash with a traceback, and never use more time or memory than the specification allows a reader (sections 6 and 3.5).
- In `name <file>`, take a text form and print the content's name of the binary file it describes, or a refusal.
- "Wherever it does not tell you enough to write a line of your program, or says two different things, or leans on something you would have to guess or to know from elsewhere (a library, a language, another program), do not guess silently: write the question down in `questions.md` … That file is as important as the program."
- Test the program on the three samples, and make files of your own that a reader must refuse.

## The samples, and the module's answer for each

[`samples.ts`](samples.ts) made every sample with the module itself, and then recorded what the module does with each: its text (as a hash) or that it refuses, and why. These answers are in [`module-answers.json`](module-answers.json), with each file's SHA-256. The blind reader never saw a reason.

| Kind | Files | The module |
| --- | ---: | --- |
| This repository's graph (`.mdmd/index.json` of 00:38 UTC, SHA-256 `f03f5ad0…`), stored and as text | 1,294 files of facts; 1.09 MB stored, 7.09 MB of text | reads |
| DNN Platform's graph, from the readers' builder's corpora (`index.json` SHA-256 `6f7bd728…`), stored and as text | 10,777 files; 2.08 MB stored, 36.1 MB of text | reads |
| The package's made scans not shown: `seededScan` of 40, 257, 300, 30, 529 and 773 files | 6, each both forms | reads |
| This probe's made scans: the order's hard case (`z`, U+E000, U+FFFD, U+10000 and U+1F600 in one folder, each linking to the rest); every character the text form's rule names, in names, kinds, flags and lines; numbers at 0 and 2^32 − 1; every word of every enumeration with an extension of `\` and U+0000 | 4, each both forms | reads |
| The fuzzer's mutants ([`mutants.mjs`](../../../../../../../packages/stored-form/test/fuzz/mutants.mjs)), seeds 0 to 399, on `everyFact`, `seededScan(3, 300)` and the estate in turn: bits flipped, a cut, a lying count, raw length or stored length, a bomb, bytes put in or taken out, frames doubled or swapped, noise | 400: 50 of each of the eight kinds (the lies are 12, 22 and 16) | refuses 395; reads 5, frame swaps of a frame with itself |
| The unit cases' files whole in shape and not in form: a string twice, a string never named, a number longer than it needs, wires that are not the links, a character split between strings, a byte that is never UTF-8, a byte after the end, a cut, a flipped byte | 9 | refuses all |
| This probe's own, one change each, with every hash set right: the head's version 2 and count 1; a frame of kind 7; an empty strings frame; the end's count wrong; the records' and paths' counts wrong; an undefined bit in a file's mark; a front coding that shares less than the longest beginning; an absolute root; sections past the file's inflation bound and just within it; set down again by another deflate; a valid scan whose text names one 32 KiB string 2,000 times | 15 | refuses 12; reads 3 (the last three) |
| The unit cases' texts written another way: a space, `4.0`, `4e0`, members reordered, `false`, an escaped letter, `\/`, `\u0008`, `\u007f`, ` `, `é`, a surrogate pair, uppercase hex, `"`, a missing last line break, a wrong count, a line after the end, a path repeated, a byte-order mark, a byte FF, CR LF | 23 | refuses all |

The corpora and every sample larger than the shown files are not committed. They are made again, deterministically, by the commands under "Files", and the hashes in `module-answers.json` say whether they came out the same.

## What the second reader answered

The first implementer worked for 14.6 minutes over 22 turns and cost **$2.64**. It wrote [`python-reader/reader.py`](python-reader/reader.py), 1,195 lines, committed unchanged. It also wrote [`questions.md`](python-reader/questions.md) with 14 questions and [its own tests](python-reader/tests/). Those tests built 161 files that are not committed: 157 it expected refused (106 binary, 51 texts), and four it held valid. The four are a scan of 300 files in both forms, a file at the inflation bound, and a 7 KB file whose text is 300 MB. Its own summary is in [`runs/implement-1.json`](runs/implement-1.json).

[`compare.mjs`](compare.mjs) ran it once per sample, alone in a process.
- **Limits:** 10 seconds plus 60 a MiB, and an address space of 1 GiB plus 256 bytes per byte of input (`prlimit --as`).
- **Peak memory** was measured by [`peak.py`](peak.py), since GNU `time` is not installed.
- **Load:** the machine's was 4 to 6 during the runs.

| Samples it had not seen | Files | Same as the module | Both refuse | Disagree |
| --- | ---: | ---: | ---: | ---: |
| Corpora, `read`: text byte for byte | 2 | 2 | | |
| Corpora, `name`: the content's name from the text | 2 | 2 | | |
| Made scans, `read` | 10 | 10 | | |
| Made scans, `name` | 10 | 10 | | |
| Mutants | 400 | 5 | 395 | 0 |
| Unit cases' non-canonical files | 9 | | 9 | 0 |
| This probe's own files | 15 | 2 | 12 | **1** |
| Texts written another way, `name` | 23 | | 23 | 0 |
| **Its own test files, run by both** | 161 | 3 | 157 | **1** |

- **DNN, both ways.** The second reader's text of DNN is the module's 36,128,453 bytes byte for byte. From that text it gives the module's content name.
- **Disagreements.** It disagreed with the module on one file of ours and one of its own, and both are the same disagreement (the first finding below).
- **Its tests, run by both.** The module refuses all 157 files the second reader made to be refused, and reads three of its four valid ones. The fourth, the 300 MB text, is that disagreement again, from the other side.
- **No round back.** No disagreement was the second reader's own fault, so it was not given another round.
- **Time and memory.** It never ran past a limit: the most it used of a time limit was 9 %.
  - Slowest: DNN's stored form in 11.3 s (63 MB peak), and DNN's text in 12.5 s (463 MB peak), against the module's whole read of about 1.3 s.
  - All 50 bombs refused within 0.4 s, holding at most 22 MB.

## Findings

Each finding says which of the three it is: the text wrong or silent (against the specification), the module doing other than the text says (against the module), or the second reader doing other than the text plainly says (its own fault). None of the last kind was found.

### 1. The module refuses a file the specification calls valid: the text export's bound (against the module, and the text is silent)

- **The files.** `probe-text-past-the-file-bound.fpk` is 7,447 bytes. It is a valid scan whose 2,000 symbols name one 32 KiB string as their kind. The second reader's own `text-expansion-300MB.fpk` is the same idea, 7 KB giving a 300 MB text.
- **What the module does.** `textOf` refuses it: "the text would hold 65544891 bytes of names from a file of 7447 bytes, past 1525184". Its source says why: "A string is held once and named many times; written out, each naming is a copy. The copies are counted first, so that a small file naming one long string a million times is refused rather than written." The bound is `inflationBound`, 64 times the file and a mebibyte.
- **What the second reader does.** It prints the text: 65,701,031 bytes in 0.9 s, holding 23 MB. That text is byte for byte what the module's own `textOfScan` writes for the facts `readScan` returns.
- **What the text says.** Section 6 lists what a whole read checks and ends "A file that passes all of these is canonical". Section 8 says only how the text is written. No section bounds the text's length or lets a reader refuse a file for it. Section 3.5 bounds what the sections inflate to, and section 6 says "Its time and memory are bounded by the file's size". The second reader shows memory can stay bounded while the text is streamed, but the time to write it grows with the text, which the file's size does not bound.
- **Which it is.** By the specification's own rule, the module is wrong here: it refuses what the text accepts. The module's rule is the safer one, though, and the second reader asked for exactly such a rule (its question 3: "If the owner wants the text itself bounded, a limit is needed"). The mend is the specification's: state the bound on the export in section 8, or in 3.5 beside the sections' bound, by its unit (UTF-8 bytes of names, or of the whole text).

### 2. The wires' grammar says a `first` follows a count of none (against the specification)

Section 4.5 gives `wires = n:count first:varint ( gapMinusOne:varint ){n−1}`. Read as written, a file with no wires still writes a `first`. The module writes none, and `everyFact`'s wires (`01 01 01 00 00`) show it. The second reader followed the sample against the grammar (question 1). `first` belongs inside an optional group present only when `n` is at least 1.

### 3. Rules the module enforces and the text never states (against the specification)

The module and the second reader agree on each of these, the second reader by its own choice, and the text does not settle them. Another reader could choose otherwise and be right by the text.

- **No byte after a section's last item** in the head, strings, paths and wires (sections 4.1, 4.2, 4.4, 4.5; question 2). Only the records say "with no byte after the last". The module refuses all four of the second reader's trailing-byte files.
- **What makes a text valid beyond its form** (section 8; question 5). The text never says that the facts of a text must pass the layout's checks: paths, order, links, an anchor only with a target. The module refuses the second reader's texts that break them.
- **The order of a file's lines, and which are required** (section 8; question 6). The listing shows an order. It never says the order is required, or that `authored` is always present.
- **Which members of a text object are always present** (sections 8 and 4.3; question 7). They are inferred from the marks: `flags`, `references`, `sections`, `qualifiers`, `body` and the rest are present even when empty, and `symbols` only when its bit is set.
- **The words of the enumerations in the text, and how the binary's fields are named there** (sections 8 and 4.3; question 8). `Constraints` was a guess, since no shown sample holds role 3. The guess matches the module: the unseen `made-every-enumeration` holds every entry reason and every role, and both readers agree on it.
- **Which links make wires** (sections 4.5 and 5; question 9). Section 4.5 says "the scanned files that the file's links name". Entries, cited-by, re-exports and `sourcePath` also hold links, but have no target. Only section 5's rule, the `to` of the edges, gives the samples' wires.
- **What `extension` may hold** (section 4.1; question 11). Only `/` is excluded. The module and the second reader both accept `\` and U+0000 in it (`made-every-enumeration`). Whether that is meant, the text does not say.
- **"The declared length of the strings sections"** (section 4.4; question 10) has two readings: the frames' `rawLength`, or the strings' own bytes. As the second reader notes, neither reading changes which files are accepted.

### 4. Whether a text can be stored depends on the compressor (against the specification)

Section 3.5 says "A writer refuses to finish a file that would break" the file's inflation bound, and that bound is reckoned from the compressed file's length. Section 3.4 says the compressed bytes may differ between writers. So two correct writers can disagree on whether one set of facts can be stored at all, and a `name` from a text can be refused by one and given by the other (question 4). By the second reader's account, Python's zlib at its default level wrote 309 bytes where the module wrote 310 for the empty scan. No sample here sits at that edge. The mend is the specification's: either bound the facts by something the compressor does not change, or say that storability near the bound depends on the writer.

### 5. The text leans on code a second reader does not have (against the specification, small)

Sections 2.3, 3.4, 5, 6 and 8 name `comparePaths`, `deriveLiveDocGraph`, `graphOf`, `openScan`, `readScan`, `storedForm.test.ts`, the fixture `everyFact`, `CompressionStream`, and Node's and Chromium's versions (question 14). Each passage also states its rule in words, and the second reader needed none of them. They are provenance, and they could be marked as such.

### 6. What the brief left open, not the specification

The exit status of a refusal (question 12) is the brief's own gap. The second reader exits 1 with its one line, and the comparison counts that as a refusal. Question 13 lists where it let Python's strict UTF-8 codec, raw inflate and `json.loads` apply rules the text states. It rebuilds each JSON value in the one form and compares the bytes, as section 8 allows.

## The second implementer, in a language of its own choosing

**The run.** It started from a fresh folder holding the same six files, after its own blindness check, and with the first reader's folder moved out of reach. The instruction was the same, but "in a language of your own choosing other than Python, one that is installed here, using its standard library only", run by a `run.sh` beside it.
- **Language:** it chose Go.
- **Time and cost:** 23.3 minutes, 34 turns, **$4.29**.
- **What it wrote:** [`go-reader/`](go-reader/), committed unchanged but for its built binary:
  - `main.go`, `reader.go`, `text.go` and `writer.go`, 2,049 lines;
  - a Go test file of 843 lines;
  - [`questions.md`](go-reader/questions.md), with 20 questions.
- **Its own tests:** 167 files, not committed. Four were valid; 115 binary files and 48 texts were to be refused.

**What it answered.** It was run over the same samples, under the same limits, at a machine load of 36 to 50. It agrees with the module on every sample exactly as the Python reader does:
- the corpora, both ways, byte for byte;
- all ten made scans, both ways;
- the 400 mutants;
- the unit cases' and this probe's files;
- the 23 texts;
- the Python reader's 161 files.

Its only disagreements are the two files of the first finding. It prints their texts too: 65,701,031 and 300,908,680 bytes, the same bytes as the Python reader's.

**The other side.** The module and the Python reader were also run over the Go reader's own 165 files, its `.tsv` index aside. All three agree on every one: the four valid files are read the same, and the 161 others are refused.

**So the two blind readers agree with each other everywhere.** Where they disagree with the module, they disagree together, and the specification is on their side (finding 1).

**One run past a limit, and not the reader's.** Once, `name` of `made-seeded-11-773.txt` died before reading a byte. It stopped in the Go runtime's start (`runtime.schedinit`), under an address-space limit of 1,170 MiB. Run again alone under limits of 1,024, 1,100, 1,300 and 2,048 MiB, it gave the module's name each time. It failed again only at exactly 1,170 MiB, at a peak of 12 MB when unlimited. That is how Go reserves address space at start-up under `prlimit --as`, not memory the reader used, and the sample counts as the same.

**Speed.** Under the higher load, DNN's stored form read in 2.2 s (28 MB peak), and its text named in 8.2 s (210 MB peak). The 50 bombs were refused within 1.1 s, holding at most 11 MB.

**What its questions add.** Its questions overlap the Python reader's on trailing bytes, the text's bound, the compressor, the links that make wires, `Constraints`, the extension, the declared length and what makes a text valid. Five are new:

- **The name from the headers, or by inflating the end** (sections 3.4 and 6, step 4; its question 2). Section 3.4 says "A reader checks the name from the headers alone, before inflating anything", and section 6 says to inflate the end and compare. The two can both hold: the end's header holds the SHA-256 of the name. The text does not say that is the check meant. It made both.
- **Which raw deflate streams are valid** (section 3.2; question 13). RFC 1951 leaves corner cases to implementations: incomplete or over-subscribed Huffman codes, distance codes 30 and 31, length codes 286 and 287, and the padding bits after the final block. zlib (which the module, Python and Node use) and Go's `compress/flate` may decide them differently. Then a hostile file is a scan to one reader and refused by another. No mutant here found such a split, and none was built to look for one. This is against the specification, which leans on an implementation's reading of the RFC, and it is unmeasured.
- **The order in which sids are first met** (section 4.2; question 8). The text form puts `generatedAt` and `authored` before the entries, and the layout after them. The text's "walking the records in order (section 4.3)" settles it, and the samples confirm it.
- **The drive rule refuses ordinary names** (section 2.4; question 20). A path such as `a:b.txt`, or a link such as `c:foo`, begins with a letter and `:`. Both are refused, though on Linux and macOS each is a plain relative name. The text means this, but a file of that name in a scanned folder can then only be left out. That is a cost of the rule, which the owner may want to weigh.
- **How far a count may be refused sooner** (section 2.1; question 16). It used minimum sizes for every kind of item, not only the two the text names. Section 2.1's "None of these changes which files are accepted" makes that safe.

## Cost, as the program reports it

**$7.30 in all:**

- The Python implementer: $2.64, 876 s.
- The Go implementer: $4.29, 1,400 s.
- The blindness checks: $0.18 and $0.11.
- Two trials of the sandbox with Haiku: about $0.08. The first of them found `/tmp/claude-1000` readable.

## Files

- [`blind-implementer.mjs`](blind-implementer.mjs): the harness. `prepare`, `check`, `implement` and `again`.
- [`samples.ts`](samples.ts): makes the samples, and records the module's answers. It runs under `npx tsx --tsconfig ./tsconfig.base.json` from the repository's root.
  - `corpus <index.json> <base>` makes a corpus's two forms.
  - `made <dir>` makes the made scans.
  - `refusals <dir> made-every-fact.fpk made-seeded-3-300.fpk corpus-estate.fpk --seeds 400` makes the files to refuse.
  - `answers <dir>` records the module's answers.
  - The estate's `index.json` was made by `npm run live-docs:generate -- --workspace <a copy of tests/integration/programs/csharp/estate>`.
- [`compare.mjs`](compare.mjs) and [`peak.py`](peak.py): the comparison under time and memory limits. Run it as `node compare.mjs <out.json> --reader "/usr/bin/python3 -I python-reader/reader.py" --skip <the six shown files> <dir>...`.
- [`module-answers.json`](module-answers.json): every sample's SHA-256 and the module's answer, including the two blind readers' own test files (`python-reader-own/`, `go-reader-own/`).
- [`shown/`](shown/): exactly what each blind folder held.
- [`python-reader/`](python-reader/): the first implementer's program, questions and test scripts, unchanged.
- [`go-reader/`](go-reader/): the second's, unchanged, without its built binary. The comparison runs it as `--reader "/bin/sh go-reader/run.sh"`, which builds it with the installed Go on first use.
- [`runs/`](runs/): each headless run's prompt, answer, usage and cost.
