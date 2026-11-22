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

## Second reading, of the amended specification

_Historical, written 2026-11-22 by a builder at the root's brief, on `day/2026-11-22` from `8cfd27b85`. Since the first reading, the specification was amended by every finding above, and the format grew: a symbol now carries its documentation references (section 4.3), the graph its `documentation` and `documentedBy` (section 5). The first readers cannot read today's files, so the claim was untested again. This repeats the reading on [the specification](../../../../../../../.mdmd/layer-3/stored-form.mdmd.md) as it stands at `3508a1895` (SHA-256 `2f773313…`), against [the module](../../../../../../../packages/stored-form/src/storedForm.ts) of the same commit. Everything down to "Findings of the second reading" is measured. The findings are the builder's reading of the text against each disagreement._

### What changed in the method

- **The same harness, tightened** ([`blind-implementer.mjs`](blind-implementer.mjs)):
  - Two runs now go at once. Each run's sandbox also denies reading the other's folder and its temporary folder (`--hide`), and the guard on `/var/tmp` lets another folder stand there only when it is so hidden. Each run's records go to the builder's scratch, never beside its folder (`--runs`).
  - The instruction (`implementPrompt2`) is the first one's with a third mode, `graph <file>`, that prints the graph of section 5 as `{"files":[...]}`, one object a file: `path`, `document`, `edges`, `outbound`, `inbound`, `documentation`, `documentedBy`. Member order and whitespace are free. It also asks for `refusals.md`, every kind of thing the program refuses with its section.
  - The second reader's language is named, Go. Left free, as in the first reading, the first second run chose JavaScript, the module's own platform. It was stopped after 11 minutes, before it had written its questions; its folder was moved out, and a fresh folder at the same hidden path was checked again and given Go.
- **What each folder held** ([`shown-2/`](shown-2/)): the specification with its two top lines removed, as before, and three small files the module wrote today, each in both forms: the empty scan (310 bytes), `everyFact` (1,068 bytes, which now holds documentation references with and without element, link, target and anchor), and `seededScan(5, 30)` (2,199 bytes). The estate sample is no longer shown, since it is now a test corpus.
  - The text still says, in two **Provenance** sentences, that blind readers were written before (sections 3.5 and 3.2 name "Both blind readers" and Go's `compress/flate`). Nothing else in it names their record or code.
- **The blindness checks**, each kept whole in [`runs-2/`](runs-2/), asked the first record's questions in each folder, launched exactly as the implementer would be:
  - `/workspaces`, `/tmp`, `/home`, `/go`, `/opt`, `/root` and `/vscode` are empty stand-ins; the home folder "No such file or directory".
  - `/var/tmp` lists the run's own folder and temporary folder, and the other run's two as 40-byte empty stand-ins: "`fpk-py` and `fpk-py.tmp` are read-denied, which is why they show as empty". Each sees the other's folder name, so each knew a reader in another language existed. Nothing of its content.
  - Both network requests failed (`403 user denied`); `touch /var/tmp/outside-probe` failed (`Read-only file system`); one tool, Bash.
  - What still reaches a run is the first record's list: the environment lines, the account's email address, the Bash and sandbox descriptions, and the `/dev/null` placeholders over dotfiles.
- **The samples it had not seen**, made by [`samples.ts`](samples.ts) with today's module (`made`, `corpus`, `refusals`, and the new `second`), every one's SHA-256 and the module's answer in [`module-answers-2.json`](module-answers-2.json):

| Kind | Files | The module |
| --- | ---: | --- |
| This repository's graph (the main checkout's `.mdmd/index.json` of 04:35 UTC, SHA-256 `e4da0477…`), estate sample's (made afresh, `a84dd91d…`) and DNN's (the readers' builder's, `6f7bd728…`, as in the first reading), each stored and as text | 3 corpora: 1,334, 41 and 10,777 files; 1.12 MB, 7.8 KB and 2.09 MB stored | reads all; DNN's `index.json` holds 4,924 `Links` sections, whose references the corpus carries |
| The package's made scans not shown, and the first reading's own (order, characters, numbers, every enumeration, now with an empty extension) | 11, each both forms | reads |
| New: `made-doc-references`, documentation references of every shape: a name alone; with an element; a link with no target; to its own file, with and without anchor; to another scanned file, with and without element and anchor; to a file outside the scan; from a symbol with no slug. `made-no-wires`: two files, one with a dependency without a link | 2, each both forms | reads |
| The fuzzer's mutants, seeds 0 to 399, on `everyFact`, `seededScan(3, 300)` and the estate | 400 | refuses 395; reads 5 frame swaps of a frame with itself |
| The unit cases' not-canonical files, the first reading's own 15, its 23 texts written another way | 47 | as before, except `probe-text-past-the-file-bound`: the module reads it and refuses its text (section 3.5 now allows either) |
| New: the extension holding `\`, `.md\x`, U+0000, `/`, and empty, as binary; and as text with `\` | 6 | refuses all but the empty one |
| New: texts misordered (`authored` before `file`, a dependency before a symbol, an entry after a symbol, the scanner before the location), doubled (`file`, `authored`, `cited-by`, `location`, a `symbol`), a symbol without `documentation`, a documentation reference with a target and no link, with its members reordered, with `"element":null` | 14 | refuses all but the doubled symbol, which is two symbols and valid |
| New: a valid text past the export's bound (65.7 MB of text, the facts of `probe-text-past-the-file-bound`) | 1 | names it |

- **The comparison** ([`compare.mjs`](compare.mjs)) is the first's, run with `--graph`: every file the module reads is run a third way, `graph`, and its JSON with every object's members sorted is set beside the module's `graphOf`, projected to the instruction's shape. A file the module reads but whose text it refuses past the export's bound counts as the same when the reader writes the module's `textOfScan` byte for byte, or as both refusing its text. Same limits as before.

### What the Python reader answered

It worked 74.0 minutes over 67 turns for **$9.47** ([`runs-2/implement-python.json`](runs-2/implement-python.json)), much of it on stress tests near the 64-times bound. It wrote [`python-reader-2/`](python-reader-2/), committed unchanged but for the files its tests build:
- [`reader.py`](python-reader-2/reader.py), 2,118 lines;
- [`questions.md`](python-reader-2/questions.md), 15 questions, and [`refusals.md`](python-reader-2/refusals.md), 129 lines;
- its tests: `make_cases.py` builds 188 files to refuse (121 binary, 67 texts, indexed with the section each breaks in `tests/refuse/CASES.tsv`) and 14 valid ones; `roundtrip.py` writes 300 random scans' texts with Python's `json` and checks every way round, its graph against one derived separately from section 5; `mutate.py` 6,000 mutants; `stress.py` files near the bound.
- It wrote its stress files into its temporary folder, beside its own, and said so; that folder was the sandbox's, and nothing else was reached.

Its final `reader.py` is byte for byte the one copied at 05:53 UTC, which is the one compared.

| Samples it had not seen | Files | Same as the module | Both refuse | Disagree |
| --- | ---: | ---: | ---: | ---: |
| Corpora, `read`, text byte for byte | 3 | 3 | | |
| Corpora, `name` | 3 | 3 | | |
| Corpora, `graph` | 3 | | | **3** |
| Made scans, `read` and `name` | 11 each | 11 and 11 | | |
| Made scans, `graph` | 11 | 4 | | **7** |
| Mutants, unit cases' files, the first reading's own, texts written another way | 446 | 7 read the same, and `probe-text-past-the-file-bound`'s 65.7 MB text written the same | 438 | 0 |
| The same, `graph` of the 8 it reads | 8 | 2 | | **6** |
| The second reading's own, `read` and `name` | 20 | 3 | 17 | 0 |
| The second reading's own, `graph` | 1 | | | **1** |
| The six edge files after the Go reader's questions | 6 | 5, 5 and 5 graphs | 1 | 0 |
| The Go reader's 161 files | 161 | 1, its graph differing as below; the past-bound file's 72 MB text written | 159 | **1** graph |
| **Its own 202 files, run by the module and by the Go reader** | 202 | 7 read and 7 named alike by all three; 3 graphs | 186, by all three | **2** texts the module accepts; 4 graphs |

The table is of the final `reader.py` run over every sample ([`runs-2/compare-python.json`](runs-2/compare-python.json), [`runs-2/compare-python-own.json`](runs-2/compare-python-own.json), [`runs-2/compare-go-on-python-own.json`](runs-2/compare-go-on-python-own.json)). A snapshot of 05:01 gave the same verdicts ([`runs-2/compare-python-snapshot.json`](runs-2/compare-python-snapshot.json)).

- **Every disagreement is one.** Every graph that differs is the module's graph with the edges of dependencies that have no link taken out ([`gdiff.mts`](gdiff.mts) checks each): 6,576 such edges at DNN, 1,405 in this repository, 15 in the estate. With them out, all 17 agree byte for byte in sorted form, as the other 6 of the 23 graphs did already (files without such a dependency), `documentation` and `documentedBy` included: DNN's, the estate's and `made-doc-references`'s every shape.
- **On our files everything else agrees**: every text byte for byte, every content name, every refusal, both sides of the extension's backslash, every misordered and doubled line.
- **On its own files the module is wrong twice.** It accepts `text-space.txt`, whose end line is `[null, "end",0]`, and `text-trailing-space.txt`, `[null,"end",0] `. Both readers refuse them (finding 2). Its four graphs that differ are the one cause again.

### What the Go reader answered

It began at 04:58 UTC after its own blindness check ([`runs-2/check-go-after-the-stop.json`](runs-2/check-go-after-the-stop.json)), and worked 34.6 minutes over 49 turns for **$6.30** ([`runs-2/implement-go.json`](runs-2/implement-go.json)). It wrote [`go-reader-2/`](go-reader-2/), committed unchanged but for its built binary and its 45 MB build cache:
- `main.go`, `binary.go`, `textform.go` and `walker.go`, 2,683 lines, and `run.sh`, which builds it with the installed Go into a cache beside it;
- [`questions.md`](go-reader-2/questions.md), 20 questions, and [`refusals.md`](go-reader-2/refusals.md), 138 lines;
- its tests: 161 files indexed by `tests/expected.tsv` (107 binary and 52 texts to be refused, a valid two-file scan, and a valid file past the text's bound), and Python tools in `tools/` that made them.

| Samples it had not seen | Files | Same as the module | Both refuse | Disagree |
| --- | ---: | ---: | ---: | ---: |
| Corpora, `read` and `name` | 3 each | 3 and 3 | | |
| Corpora, `graph` | 3 | | | **3** |
| Made scans, `read` and `name` | 11 each | 11 and 11 | | |
| Made scans, `graph` | 11 | 4 | | **7** |
| Mutants, unit cases' files, the first reading's own, texts written another way | 446 | 7 | 438, and both refuse the text of `probe-text-past-the-file-bound` | 0 |
| The same, `graph` of the 8 it reads | 8 | 2 | | **6** |
| The second reading's own, `read` and `name` | 20 | 3 | 17 | 0 |
| The second reading's own, `graph` | 1 | | | **1** |
| Six files made after reading its questions 8 to 10: a path `a\b.ts`, an empty link, a link holding U+0000, an anchor on a target outside the scan, a dependency landing on its own file with every qualifier; and a target `../x`, as text | 6, 5 of them both forms | 5, 5 and 5 graphs | 1 | 0 |
| **Its own tests, run by the module** | 161 | 1, and its graph | 159, and both refuse the past-bound file's text | **1** graph |

- **The same one disagreement, and nothing else.** Each of its 18 graphs that differ is the module's with the unlinked dependencies' edges out (`gdiff.mts`). Every text, name and refusal agrees, on its own files as on ours.
- **It refuses the text past the bound**, where the Python reader writes it; section 3.5 allows both. Its line says so: "refused: the text is not offered, though the file is valid".
- **One run past a limit, and not the reader's**, as in the first reading. `name` of `made-seeded-11-773.txt` died in the Go runtime's start (`runtime.schedinit`) under an address-space limit of 1,185 MiB. Run alone under 1,024, 1,300 and 2,048 MiB it gave the module's name each time; at exactly 1,185 MiB it failed again. It counts as the same.
- **Speed**, at a machine load of 30 to 40: DNN's stored form in 1.2 s (29 MB peak), its text named in 2.0 s (113 MB peak).

### Findings of the second reading

#### 1. Section 5 says two things of a dependency without a link (against the text)

- **The sentences.** "**The links that make edges**, in order: each dependency with a link, then, for each symbol in order, each reference in order." And, of what an edge carries: "`link`, when there is one."
- The first makes no edge for a dependency without a link. The second only has a use if some edge has no link, and a type's edge always has one ("A type makes an edge only when it has a link"), so it can only be a dependency's.
- **The module** makes an edge for every dependency, linked or not (`{"kind":"import","label":"node:fs"}`). That is what this repository's `index.json` holds, and the graph read back prints byte for byte as it (section 11), so it is what the product means.
- **Both readers** followed the first sentence, each on its own, and neither wrote it down as a question: to each the text read as settled. Read plainly, the text is on their side, and by the text's own rule the module is wrong. The mend is the text's: "each dependency, with a link or not", if the engine's edges are meant.

#### 2. The module reads the end line of a text by its value, not its form (against the module)

- **The sentences** (section 8.1): "There is no whitespace between any two tokens", and "Only these forms are written, and no other is accepted." Section 8 lists among what is refused "a space anywhere outside a string" and "`4.0` or `4e0` for `4`".
- **The files**, from the Python reader's own tests: `text-space.txt` ends `[null, "end",0]`, and `text-trailing-space.txt` ends `[null,"end",0] `. The module names both; both readers refuse both.
- Tried further on `everyFact`'s text, the module accepts as its end line `[null, "end",3]`, `[null,"end",3] `, `[null,"end", 3]`, `[ null,"end",3]` and `[null,"end",3.0]`. It refuses a space in the `format`, `location`, `scanner` and `left-out` lines. So the end line alone is parsed for its count and never written again and compared, as section 8 allows a reader to check each line.
- Two texts then name one file, which section 3.4's "one form" is there to prevent.

#### 3. The module names the wrong line in some refusals of a text (against the module, small)

The verdicts agree; the reasons do not always point where they say. For `text-4.0-b`, whose line 4 is `["a","file",4.0,null,null]`, the module says "line 6 is not written as the text form writes it" and quotes from line 4 on. For `text-4.0` the line at fault is 5 and it says 16. Section 6 asks a refusal to say why; this one says why at the wrong place.

#### 4. The text's bound counts the names two ways (against the text)

- **The sentences** (section 3.5): "A reader that writes the text may refuse to, when the names it would write exceed the same bound", and "The names are counted in UTF-8 bytes: each string, once for every time a record names it."
- A record names its path once, but the text writes the path at the head of every line of that file. Counted by the record, a small file of one 1 MiB path and many short entries is within the bound while its text runs to hundreds of gigabytes (the Go reader's question 1).
- The module counts by the record: 65,544,891 bytes for `probe-text-past-the-file-bound`. The Go reader counts what the text writes, the path once a line: 65,546,892. Near the bound the two give different verdicts on whether the text must be written, and the second sentence then lets the bound fail at what it is for.
- No sample sits between the two counts, so no verdict differed here. The mend is the text's: count what the text writes, the path once for each line it heads.

#### 5. The graph is not bounded by the file (against the text, silent)

- Section 6 says a reader's "time and memory are bounded by the file's size". Section 3.5 bounds the text, and says a file past that bound is valid and "a reader … gives its graph". Nothing bounds the graph.
- Its strings repeat as the text's do: a dependency's label on every edge, a slug as `from` on every one of a symbol's edges, a path in every `inbound`, `outbound` and `documentedBy` list it is in. The Go reader's own `valid-past-text-bound.fpk` is 442 bytes; its text would be 72 MB of names, and the module's graph of it holds each of its long labels as an edge.
- Both readers and the module give such a graph whole. The Go reader streams it, so memory stays bounded but time does not (its question 3). The mend is the text's: bound the graph as the text is bounded, or say that a consumer of the graph owes that bound.

#### 6. Where the module goes beyond the text, and the readers agree with it

The two readers' questions name rules each chose where the text does not state them. The two made the same choice on every one they share, the Python reader's question number given after the Go reader's. Where their own files or the six edge files reach one, the module made the same choice too; two of them no file here reaches (marked).
- **The text's facts fit in a section** (Go 15, Python 4). Section 8's list of a valid text's checks leaves out `MAX_SECTION`. It refuses a text whose sections would exceed 64 MiB, since "a writer refuses facts that would need more". (No file here reaches it.)
- **The first path shares nothing** (Go 11, Python 6). Section 4.4's "`shared` is at most that path's length" has no path before the first.
- **The `format` line and every head line's `null` are checked** (Go 16, Python 13).
- **A records frame needs no strings frame before it** when it meets no new string (Go 20). The grammar `( strings? records )*` allows it, and section 4.2's rule then refuses a new sid there. (No file here reaches it.)
- **What a path and a link may hold** (Go 8 to 10, Python 5): `a\b.ts` is a path (section 9 says so; section 2.4's "A reader refuses anything else" reads otherwise), an empty link and a link holding U+0000 are links, and a target outside the scan must still be a path. The module agrees on all four: it reads the first three and its writer refuses `../x`.

#### The questions the two runs wrote down, grouped

**The Go reader's 20** ([`go-reader-2/questions.md`](go-reader-2/questions.md)):
- *The bounds:* how the text's names are counted (1, finding 4); a valid file past the text's bound refused in words that say so (2); the graph unbounded (3, finding 5); what "bounded by the file's size" allows (18); a text's sections within `MAX_SECTION` (15).
- *The graph:* `edges`, `outbound` and `inbound` always present, even empty (4); a parameter's edge carries both `from` and `parameter` (5); "qualifiers hold `re-export`" read as one qualifier exactly so (6); `toSymbol` only with `to` (7). The module agrees with all four.
- *Paths and links:* a backslash after a path's first character (8); what a link must be (9); a target outside the scan checked as a path (10); the first path's `shared` (11); head strings outside the string table (12).
- *Reading:* a `storedLength` past the end is refused as unfinished in every mode (13); which inflater decides deflate's corner cases, Go's `compress/flate`, unmeasured against zlib (14); the byte-order mark and the `format` line (16); which reason wins when several rules break (17); a records frame with no strings frame (20).
- *The brief's own gap:* the exit status (19). It exits 0 for both answers.

**The Python reader's 15** ([`python-reader-2/questions.md`](python-reader-2/questions.md)):
- *The bounds:* a text past the bound is always written, since in the brief a refusal of the text alone would look like a refusal of the file (1); how far inflation may overrun `rawLength` to notice it, one byte (3); a text's sections within `MAX_SECTION` (4); how fast "bounded by the file's size" is, 2 to 40 s on adversarial 340 KB files in pure Python (12).
- *The graph:* an empty anchor, present by its mark, gives `"toSymbol":""` (8), as the module does; how the graph is written, and `edges`, `outbound` and `inbound` always present (9); "qualifiers hold `re-export`" read as exactly (7).
- *Paths and links:* what a link may hold, the empty link, U+0000, `https://` and `#frag` accepted (5); the first path's `shared` (6).
- *Reading:* which inflater decides deflate's corner cases, Python's `zlib`, unmeasured against others (2); which reason wins (10); every optional early refusal made (11); the `format` line's name and version checked (13); Provenance sentences taken as history, not rules (14); where it trusts Python's strict UTF-8 and `json` to apply a stated rule (15).

**What neither asked.** Neither wrote a question on section 5's edges from a dependency without a link (finding 1); each read the text as settled, and each read it the same way. Neither asked about the end line's form (finding 2); both apply the one form to it as to every line.

**Their own refusal cases.** The Go reader's [`refusals.md`](go-reader-2/refusals.md) lists 138 lines by section, and its 159 files to refuse; the Python reader's [`refusals.md`](python-reader-2/refusals.md) 129 lines, and its 188 files with their sections in `tests/refuse/CASES.tsv`. The module refuses every one of the 159 and 186 of the 188, the two of finding 2 apart. Each reader refuses every one of the other's.

#### The leaks, and whether either run used them

- **Each run saw the other's folder name**, `fpk-py` or `fpk-go`, as an empty directory. That could tell a run that a second reader of the same files was being written, and in which language. It could not tell it anything of that reader's code or choices, since the folder read as empty. Neither run's code, tests, questions or summary names the other folder, a sibling, or another reader (searched for `fpk-go`, `fpk-py`, `sibling`, `blind` and `other reader`).
- **The specification itself names the first blind readers** in one Provenance sentence of section 3.5: "Both blind readers stream the text and write it." That could tell a run what earlier readers chose where the text allows two choices. The Python reader writes the text past the bound, as that sentence says; the Go reader refuses it, against it. Neither run's questions cite the sentence: the Go reader's question 2 argues its choice from section 6's bound, and the Python reader's question 1 from the brief's two answers. Section 3.2's naming of Go's `compress/flate` is a platform's name, and the Go reader's question 14 cites it ("as the specification names").
- So neither leak shows in what either run made. The first could be closed by naming the folders alike (`reader-a`, `reader-b`); the second is the specification's, and a Provenance sentence about earlier readers belongs in this record rather than in the text.

### Cost of the second reading, as the program reports it

**$16.51 reported in all:**
- The Python implementer: $9.47, 4,438 s, 67 turns.
- The Go implementer: $6.30, 2,074 s, 49 turns.
- The three blindness checks: $0.22, $0.29 and $0.23.
- The JavaScript run, stopped after 11 minutes: not reported, since a stopped run writes no account. Its folder was kept in the builder's scratch and removed with it; its reader was not compared, since Node does not start under the comparison's address-space limit (it exits 133).

### Files of the second reading

- [`blind-implementer.mjs`](blind-implementer.mjs): `--round 2` gives `implementPrompt2`; `--hide` hides another run's folder; `--runs` keeps the records apart.
- [`samples.ts`](samples.ts): the made scans' symbols now carry `documentation`; `made-every-enumeration`'s extension is empty; `made-doc-references` and `made-no-wires` are new; `second <dir>` makes the second reading's own; `answers` records each graph's SHA-256 in sorted form and, for a file whose text the module refuses past the bound, its `textOfScan`.
- [`compare.mjs`](compare.mjs): `--graph`.
- [`gdiff.mts`](gdiff.mts): sets a reader's graph beside the module's with unlinked dependencies' edges out. Run as `npx tsx --tsconfig ./tsconfig.base.json gdiff.mts <file.fpk> <reader's graph.json>`.
- [`edges.mts`](edges.mts): makes the six edge files after the Go reader's questions 8 to 10.
- [`module-answers-2.json`](module-answers-2.json): every sample's SHA-256 and the module's answer, by folder (`corpora`, `made`, `refusals`, `second`).
- [`shown-2/`](shown-2/): exactly what each blind folder held.
- [`runs-2/`](runs-2/): each check's and implementer's prompt, answer, usage and cost; and each comparison's tally and disagreements (`compare-*.json`).
- [`python-reader-2/`](python-reader-2/) and [`go-reader-2/`](go-reader-2/): the two programs, questions, refusals and test scripts, unchanged, without the files their tests build (each reader's `make_cases.py` builds them again), the Go reader's binary and build cache, or Python's `__pycache__`.
- The samples are made again by `samples.ts made`, `corpus`, `refusals` (with the bases `made-every-fact.fpk made-seeded-3-300.fpk corpus-estate.fpk`) and `second`. The corpora and every larger sample are not committed.

### Running a third reading from this record

The specification will change again, so a later reading repeats this one with these steps. Each command is run from the repository's root unless it says otherwise. `H` is this folder; `S` is a scratch folder of the reader's own, outside `/var/tmp`, and `/var/tmp` must start empty.

1. **What the module needs.** `npm ci` (or, in a worktree, a link to a checkout's `node_modules`), then `npm run build`. The corpora's `index.json` files come from the generator: this repository's `.mdmd/index.json` after `npm run live-docs:generate`; the estate's from `npm run live-docs:generate -- --workspace <a copy of tests/integration/programs/csharp/estate>`, which writes `<copy>/.live-documentation/index.json`; DNN's from the same command on a DNN checkout (this reading used the readers' builder's, SHA-256 `6f7bd728…`).
2. **Bring the probe's samples up to the format.** `samples.ts` builds scans by the module's types. When the format changes (a symbol's new field, a link's new shape), its scans and the `second` files must be given the new fields, and new samples aimed at the new sections added, before anything is made. A type-check of the file (`npx tsc --noEmit` over it, or a first `made` run, which fails on a missing field as this reading's did) finds what is missing.
3. **Make the samples.** `T="npx tsx --tsconfig ./tsconfig.base.json $H/samples.ts"`, then:
   - `$T made $S/samples/made`
   - `$T corpus <index.json> $S/samples/corpora/corpus-<name>` for each corpus
   - `$T refusals $S/samples/refusals $S/samples/made/made-every-fact.fpk $S/samples/made/made-seeded-3-300.fpk $S/samples/corpora/corpus-estate.fpk --seeds 400`
   - `$T second $S/samples/second`
   - `$T answers $S/samples/corpora $S/samples/made $S/samples/refusals $S/samples/second`, the module's answers, each folder's `answers.json`.
4. **Prepare two folders.** For each of `py` and `go`: `node $H/blind-implementer.mjs prepare /var/tmp/fpk-<x> .mdmd/layer-3/stored-form.mdmd.md` followed by the six shown files (`made-empty`, `made-every-fact`, `made-seeded-5-30`, each `.fpk` and `.txt`, from `$S/samples/made`). `prepare` removes the specification's two top lines by their opening words (`_A proposal of 2026-11-22. Built as one module` and `_Written so that a second reader can be written`) and refuses to go on unless it removed exactly two. If those lines are reworded, its two patterns are changed to match, and nothing else.
5. **Check each folder before its run.** `node $H/blind-implementer.mjs check /var/tmp/fpk-py --hide /var/tmp/fpk-go --runs $S/runs/py`, and the same for `fpk-go` hiding `fpk-py`. Read each answer. It must show `/workspaces`, `/tmp`, `/home`, `/go`, `/opt`, `/root` and `/vscode` as empty stand-ins, the other folder and its `.tmp` as empty stand-ins, both network requests refused, `touch /var/tmp/outside-probe` refused, and Bash as its one tool. Anything else readable is a leak, closed before going on.
6. **Start both implementers**, in the background:
   - `node $H/blind-implementer.mjs implement /var/tmp/fpk-py --round 2 --hide /var/tmp/fpk-go --runs $S/runs/py`
   - `node $H/blind-implementer.mjs implement /var/tmp/fpk-go --round 2 --language Go --hide /var/tmp/fpk-py --runs $S/runs/go`
   - The prompt is `implementPrompt2` in the harness, and each run's record in `runs-2/` holds it word for word. Here they took 74 and 35 minutes; brief a third reading's root for an hour and more.
   - If a folder must be begun again, its run is stopped, the folder moved out of `/var/tmp`, and a fresh one prepared at the same path, since the other run's sandbox hides that path and no other. It is checked again before it starts.
7. **Compare.** From this folder, for each reader:
   - `node compare.mjs $S/py.json --reader "/usr/bin/python3 -I <its reader.py>" --graph --skip <the six shown files, comma-separated> $S/samples/corpora $S/samples/made $S/samples/refusals $S/samples/second`
   - the same with `--reader "/bin/sh <its folder>/run.sh"` for Go, run from a copy of its folder outside the repository, since `run.sh` builds into the folder it stands in.
   - **The other side:** copy each reader's own test files into a folder of their own, run `$T answers` on it, and compare both readers over it. This is where this reading found the module's end-line fault.
   - **After reading their questions:** make files at the edges they name (as `edges.mts` does), record the module's answers, and compare again.
   - A reader in Node does not start under the comparison's address-space limit (it exits 133), so a Node reader would need that limit changed in `compare.mjs`.
   - Each disagreement is printed, and a graph or text that differs is kept beside the output as `<out>.<kind>.<file>.out`. `gdiff.mts` sets a kept graph beside the module's without the unlinked dependencies' edges. Once section 5's sentence is mended, that check is either retired or turned the other way.
8. **Copy the readers out unchanged**, without built binaries or `__pycache__`, into new folders here; record the module's answers (a merged `module-answers-<n>.json`), the shown files and the run records; then clear `/var/tmp`.
