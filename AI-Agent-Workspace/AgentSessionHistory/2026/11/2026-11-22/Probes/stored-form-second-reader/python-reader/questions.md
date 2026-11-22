# Questions on the specification

Each heading is one question. Under it: the section it is about, what is missing or in conflict, and the choice `reader.py` makes. They are ordered roughly by how much the choice matters.

## 1. Is `first` written in a file's wires when it has no outbound wires?

**Section 4.5.** The grammar is `wires = n:count first:varint (gapMinusOne:varint){n−1}`, which reads as if `first` is always present, even when `n` is 0. `made-every-fact.fpk` has wires `01 01 01 00 00` for three files: file 2 is the single byte `00`, with no `first`. So the grammar and the sample disagree.

**Choice:** `first` is present only when `n ≥ 1`, which is what the sample does. A file whose wires write a `first` after `n = 0` ends up with bytes left over and is refused (test `wires-n0-with-first`).

## 2. Is a byte after the last item refused in the head, strings, paths and wires sections?

**Sections 4.1, 4.2, 4.4, 4.5.** Only records say "with no byte after the last" (4.3). For the other sections the spec gives the grammar but never says the section must end where the grammar ends. Section 3.4 does say one set of facts has one sequence of uncompressed sections, and trailing bytes would make a second one.

**Choice:** every section must end exactly where its grammar ends. Otherwise it is refused (`head-trailing-byte`, `strings-trailing-byte`, `paths-trailing`, `wires-trailing`).

## 3. The text form can be far larger than the file. What bounds `read`?

**Sections 3.5, 6 and 8.** Section 6 bounds a reader's time and memory by the file's size, and the argument is that "every fact a reader builds takes at least one uncompressed byte". But in the text, each sid is written out as its whole string. So one string of a few kilobytes, named by a hundred thousand one-byte sids, gives a text thousands of times longer than the file. My test `text-expansion-300MB` is a 7 KB file, within every limit of 3.5, whose text is 300 MB. The spec puts no bound on the text, and none of its refusals applies to such a file.

**Choice:** such a file is valid, so its text is printed. Reading checks everything first, so a refusal is never preceded by partial output. It then writes the text record by record, in blocks of about 1 MiB, so memory stays bounded by the file (about 29 MB for the 300 MB text). Time is proportional to the length of the text, which the file's size does not bound. If the owner wants the text itself bounded, a limit is needed, for example on the ratio of text to file length.

## 4. In `name`, which compressor decides the total-inflation limit?

**Sections 3.4 and 3.5.** "A writer refuses to finish a file that would break [64 × file length + 1 MiB]." The file's length depends on the compressed bytes, which section 3.4 says may differ between writers. So whether a text describes a binary file that can be written depends on the compressor. Text made mostly of a few long, repetitive strings could pass with one deflate and fail with another. Section 3.4 names the module's compressor (`CompressionStream` at its default level, the zlib of Node 26 or Chromium 149), but that is a fact about other programs, not a rule.

**Choice:** `name` builds the whole file with Python's `zlib` (raw deflate, default level, window 15, memLevel 8, which I believe are `CompressionStream`'s settings) and refuses the text if that file breaks the limit. `MAX_SECTION` is checked on the uncompressed sections, so it does not depend on the compressor. My zlib does **not** reproduce the samples' stored bytes (it writes 309 bytes for `made-empty.fpk`'s 310), so the margin is not exactly the module's. The name itself depends only on the uncompressed sections, and it matches all three samples.

## 5. What makes a text form valid, beyond being written in the one form?

**Sections 8 and 6.** Section 8 says the text reader refuses any line that is not exactly the line written for what it says, and gives the forms. It does not say whether the facts must also be ones the layout can hold. A text could hold an absolute path, files out of path order, a link starting `C:`, a `target` without a `link`, or an anchor without a target (which no mark can say). Every one of these is well-formed JSON written in the one form.

**Choice:** the text is valid only if it is in the one form **and** its facts pass every check that section 6 makes on a binary file. That covers paths and links (2.4), strict path order with no repeats, the folders and extension (4.1), version 1, enumerations, numbers from 0 to 2^32−1, the `linked` constraints, and an end count equal to the number of files. These are the same facts a writer would refuse (7.1).

## 6. What order do a file's lines come in, and which are required?

**Section 8.** The listing shows `file`, `authored`, `entry`…, `symbol`…, `dependency`…, `cited-by`, `re-exports`, then the next file. It never says this order is required, or that `authored` must be present.

**Choice:** this order, exactly. `file` and `authored` are required (in the layout, `authored` is not optional). There is one `entry`, `symbol` and `dependency` line per item, at most one `cited-by` and one `re-exports`, all with that file's path. Files are in path order, the `left-out` lines come between `scanner` and the first file, and the `end` line comes last. Anything else is refused.

## 7. Which members of a text object are always present?

**Sections 8 and 4.3.** Section 8 lists every member name an object can have, but not which are optional. I inferred it from the marks in 4.3: what a mark guards is optional, everything else is required. So these are always present, even when empty: `flags`, `references` and `sections` of a symbol; `qualifiers` of a dependency; `flags` of a re-export; `types` and `parameters`; `body` of a section; `link` in `declarer`, `from` and a cited-by item; `line` in `source`. `symbols` of a dependency is present only when its mark bit is set, and that is a different fact from `[]`. The samples agree.

**Choice:** as inferred. A required member that is missing is refused, and so is a member the object does not have.

## 8. How are the binary fields named in the text, and which words name the enumerations?

**Sections 8 and 4.3.** The two grammars use different names: a section's `list(line)` becomes `"body"`, `sourcePath` and `sourceLine` become `"source":{"path","line"}`, `symbolName` and `symbolLink` become `"symbol":{"name","link"}`, and a re-export's `fromLabel` and `fromLink` become `"from":{"label","link"}`. Section 8 does not say which words the enumerations are written as. The samples show `"reason":"program"` and roles written as `"Returns"`, `"Extends"`, `"Implements"`, `"Parameters"`. No sample shows role 3. Section 4.3 calls it `Constraints`, while section 5 calls the edge kind `constraint`.

**Choice:** fields map by position, as above. The entry reasons are 4.3's words, `program` … `declared`, and the roles are 4.3's words with their case: `Returns`, `Extends`, `Implements`, `Constraints`, `Parameters`. `Constraints` is a guess that no sample confirms.

## 9. Which links make a file's wires?

**Sections 4.5 and 5.** Section 4.5 says the wires are "the scanned files that the file's links name". But links also appear in entries (`symbolLink`, `declarerLink`), in cited-by items, in re-exports (`fromLink`) and in `sourcePath`, and none of those has a `target`. Section 5's "outbound" counts only the edges' `to`, from dependencies and from types.

**Choice:** section 5's rule. The wires are the `target`s of dependencies and of types (in references and parameters) that are the path of a file in the scan, other than the file itself, each once, sorted by file number. The links are never resolved. This gives exactly the wires of all three samples.

## 10. What is "the declared length of the strings sections"?

**Section 4.4.** "All the paths together are at most as long as the declared length of the strings sections." This could mean the sum of the strings frames' `rawLength`, which includes each string's length varint, or the sum of the strings' own byte lengths.

**Choice:** the paths' total byte length must be at most the sum of the strings frames' `rawLength`, checked as each path is decoded. Every path is also a string, so neither reading changes which valid files are accepted. The check only stops a hostile paths section early.

## 11. Is anything required of `extension` beyond holding no `/`?

**Section 4.1.** `root` and `baseLayer` are folders, but `extension` is said only to hold no `/`. Nothing says whether it may be empty, hold `\`, hold U+0000, or begin with a drive.

**Choice:** only `/` is refused. It may be empty.

## 12. What exit status, and what wording, for a refusal?

**Not in the specification.** The task says what to print but not the exit status. The wording after `refused:` is free.

**Choice:** exit 0 with the text or the name, and exit 1 with the single `refused: …` line. A usage error (wrong mode or argument count) prints usage to standard error and exits 2. A file that cannot be opened is a refusal. Strings from the file that appear in a refusal are escaped onto one line and cut to about 60 characters.

## 13. Where the program leans on Python's libraries for rules the spec states

**Sections 2.2, 3.2, 8.** The spec states its own rules, but the program uses three library pieces to apply them:
- **Python's strict UTF-8 codec** stands in for table 3-7. It refuses overlong forms, encoded surrogates, values above U+10FFFF, stray and cut bytes, and it keeps a leading U+FEFF. The tests check each of these.
- **`zlib` raw inflate (window −15)** stands in for RFC 1951. Output is capped at `rawLength + 1`, and the stream must reach its end with no input left over.
- **`json.loads`** parses each text line. It is permissive (`NaN`, duplicate members, lone `\ud800` escapes, arbitrary whitespace), so it is never trusted. Each value is rebuilt in the one form, the text is written again and compared byte for byte (as section 8 allows), and a lone surrogate is refused explicitly.

**Choice:** these are believed to match the stated rules. A different UTF-8 decoder or inflater might not.

## 14. The spec names code I do not have

**Sections 2.3, 3.4, 5, 6, 8.** The spec refers to `comparePaths`, `deriveLiveDocGraph`, `graphOf`, `index.json`, `openScan`, `readScan`, `storedForm.test.ts`, the fixture `everyFact`, `CompressionStream`, and Node and Chromium versions.

**Choice:** none of them is used. The spec says its text is the authority (section 5), and every rule the program needs is stated in the text. Path order is byte order on UTF-8, the graph's edges are used only for the wires, and JSON's forms are given in 8.1.
