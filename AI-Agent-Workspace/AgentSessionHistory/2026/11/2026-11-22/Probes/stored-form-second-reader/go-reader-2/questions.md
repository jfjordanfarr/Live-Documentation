# Questions on the specification

Each question is one the specification did not settle well enough for me to write a line of the program, or where it says two different things, or leans on something outside it. Each says the section, what is missing or in conflict, and what the program does.

## 1. How are "the names it would write" counted for the text bound?

**Section 3.5, the text export's bound.** The rule says a reader may refuse the text "when the names it would write exceed" `64 × (file length) + 1,048,576`. Then it says "the names are counted in UTF-8 bytes: each string, once for every time a record names it". These two readings disagree for a file's path. A record names its path once, but the text writes the path at the start of every line of that file (section 8). Counted once per record, a small file can still demand a huge text: one 1 MiB path and 500,000 two-byte entries make a file of a few tens of KB whose text is about 500 GB, and by the second reading that file is within the bound, so its text must be written.

**Choice:** I count every string the text writes from the records, in UTF-8 bytes, with the path counted once for each line of its file. Head strings are not counted, and escapes are counted as the bytes of the string, not of the escape. So my count is never lower than the per-record count. Where the two readings differ, I may refuse a text the per-record reading would require. Those are exactly the files whose text is many times larger than the bound.

**Still open:** even inside the bound, the text's fixed JSON overhead per line (`["p","entry",{"reason":"program"}]`) is not counted. A file at the 64× inflation limit made of two-byte entries gives a text about 1,000 times the file's size. I measured an 879 KB file giving 876 MB of text in 5 s. The specification requires it, and my program writes it, as a stream, in constant memory.

## 2. Is a valid file whose text is past the bound refused, and in what words?

**Section 3.5 against the task.** Section 3.5 lets a reader refuse the text past the bound, and lets it write the text anyway. It also says the reader "must say that it refuses the text, not the file". The task says a valid file gets its text and anything else gets one `refused:` line.

**Choice:** I refuse, so that time stays bounded by the file (section 6). The line is `refused: the text is not offered, though the file is valid: …`, which begins with `refused:` as the task asks and says it is the text that is refused. `graph` still gives the graph of such a file, and `name` of its text (if one had it) still gives the name. `tests/valid-past-text-bound.fpk` is such a file.

## 3. The graph's size is not bounded by the file

**Sections 5 and 6.** Section 6 says a reader's time and memory are bounded by the file's size. Section 3.5 says a file past the text bound is still valid and "a reader … gives its graph". Unlike the text, the graph has no bound. Its strings repeat too: a symbol's `slug` is written as `from` on every one of its edges, and every path is written once in each `inbound`, `outbound` and `documentedBy` list it is in. A small file can therefore have a very large graph.

**Choice:** `graph` always gives the graph. It is streamed, so memory stays bounded by the file, but time grows with the output.

## 4. Which graph members are always present?

**Section 5.** The task says every member is "present or absent by section 5's rules". Section 5 says when `documentation` and `documentedBy` are present (only when non-empty), and gives each edge member's condition. It says nothing about `edges`, `outbound` and `inbound` when they are empty.

**Choice:** `path`, `document`, `edges`, `outbound` and `inbound` are always present, as `[]` when empty. `documentation` and `documentedBy` are left out when empty.

## 5. Does an edge from a parameter's type carry both `from` and `parameter`?

**Section 5.** "For a type, `from`: the symbol's slug … For a parameter, `parameter`: its name." A parameter's types are types.

**Choice:** both. A parameter edge carries `from` when the symbol has a slug, and always carries `parameter`.

## 6. What does "qualifiers hold `re-export`" mean?

**Section 5.** For `typeOnly` and `basis` the text says "exactly". For the `re-export` kind it says "hold", which could mean equal to, or contain as a substring.

**Choice:** one qualifier exactly equal, byte for byte, to `re-export`, as for the other two.

## 7. Is `toSymbol` on an edge given without `to`?

**Section 5.** "`to`, when the link's target is the path of a file of the scan … Then also `toSymbol`, the anchor, when the link has one."

**Choice:** `toSymbol` only appears when `to` does. An anchor on a link whose target is not a scanned file gives no `toSymbol`. An edge whose target is the file's own path does carry `to` (and `toSymbol`), and that path is left out of `outbound`, as the rule says.

## 8. May a path hold a backslash after its first character?

**Section 2.4 against section 9.** Section 2.4: a path has "`/` (U+002F) between segments. A reader refuses anything else wherever a path is kept", then lists the checks. Section 9: "a path may still hold a `\`, which Windows takes as a separator".

**Choice:** only the listed checks are made: not empty; no leading `/` or `\`; no letter followed by `:` at the start; no `file:` prefix in any case; no U+0000; no empty, `.` or `..` segment. So `a\b.ts` is accepted.

## 9. What does a link have to be?

**Section 2.4.** A link is refused only when it begins with `/`, `\`, a letter and `:`, or `file:`. Nothing is said about an empty link or a link holding U+0000.

**Choice:** a link is only checked for those beginnings. An empty link and a link holding U+0000 are accepted. Anchors, elements, labels, names, kinds, flags and qualifiers are not checked at all (section 4.3, "values the layout keeps but does not judge").

## 10. Is a `target` checked as a path when it names no scanned file?

**Section 4.3.** "`path` and `target` are paths." Section 5 allows a target that lands outside the scan.

**Choice:** every target must pass section 2.4's path checks, whether or not it is a scanned file.

## 11. How long may the first path's `shared` be?

**Section 4.4.** "`shared` is at most that path's length", meaning the length of the path before it. The first path has none.

**Choice:** the path before the first is taken to be empty, so the first path's `shared` must be 0.

## 12. May head strings repeat strings of the table?

**Sections 4.1 and 4.2.** The head's `root`, `baseLayer`, `extension`, `scanner` and left-out texts are `text`, not sids. "No string appears twice" is said of the string table.

**Choice:** head strings are outside the table. They may equal table strings or each other. They are decoded strictly (section 2.2), the folders and the extension are checked (sections 2.4 and 4.1), and the scanner and left-out texts are not judged.

## 13. A header whose `storedLength` runs past the end of the file

**Section 3.5:** "A header that does is a cut, not a refusal, while reading an unfinished file". **Section 3.3:** an unfinished file is refused as a scan.

**Choice:** all three modes read a file as a scan, so such a file is refused, with a reason that begins `unfinished:`.

## 14. Which inflater decides the edge cases of deflate?

**Section 3.2** says a reader refuses whatever its inflater refuses.

**Choice:** this program uses Go's `compress/flate`, as the specification names. It reads the stored bytes through an `io.ByteReader`, so it never reads past what the decoder needs. After the stream's final block, any whole byte left over is refused. Bits left over in the last byte are ignored, as `compress/flate` ignores them. Codes that `compress/flate` refuses (over-subscribed or incomplete Huffman codes, reserved length and distance codes) are refused. I did not measure these cases against zlib.

## 15. Must a text's facts fit in MAX_SECTION?

**Section 8 against section 3.5.** A valid text is one "whose facts a writer can store", and "a writer refuses facts that would need more" than 64 MiB in a section. But the list of checks in section 8 does not include MAX_SECTION, and it explicitly leaves out the inflation bound.

**Choice:** `name` refuses a text whose sections, written out, would exceed 67,108,864 bytes uncompressed, because no writer can store it. It does not apply the 64 × file-length bound, as section 8 says.

## 16. Byte-order mark and the text's head lines

**Section 8.** "UTF-8 with no byte-order mark." This does not say whether a leading U+FEFF is an error or is to be skipped. Nor does it say whether the `format` line's name and version are checked.

**Choice:** a text that begins with `EF BB BF` is refused. The first line must be exactly `[null,"format","fact-pack",1]`. A different name or version is refused (section 4.1: a reader refuses a version other than the one it reads). The first value of every head and end line must be `null`.

## 17. Which reason is given when several rules are broken?

**Section 6** gives the order of the steps. It does not say which reason to report when several rules are broken in one step.

**Choice:** the first broken rule in reading order wins, following section 6's steps: signature; each header (kind, then MAX_SECTION, then the deflate ratio, then the total bound, then the file's length); frame order; end; head; paths; wires; then strings and records in order. Within a step, the reason given is the first rule broken in byte order. Only the fact of refusal is fixed by the specification, not its words.

## 18. What does "bounded by the file's size" allow?

**Section 6 and section 3.5.** Memory is to be "bounded by the file's size". No constant is given.

**Choice:** memory is linear in the file's uncompressed sections. Those are at most 64 × the file length + 1 MiB, by the limits checked before anything is allocated. Measured: 28 MB to read a 2 MB file of 100,000 files; 54 MB for an 879 KB file inflating 58 times; about 330 MB for a hostile 21 MB file of 6 million distinct strings, which is the worst case I found (about 50 bytes per string for the duplicate check and the table).

## 19. Exit status

**Not in the specification; the task does not say either.**

**Choice:** exit status 0 for both kinds of answer, output or `refused:`. Exit status 2 only for a wrong command line (an unknown mode, or a missing argument), with a message on standard error. A file that cannot be opened is answered with `refused: cannot read the file: …`.

## 20. Is a records frame with no strings frame before it allowed?

**Sections 3.3 and 4.2.** The grammar `( strings? records )*` allows it. Section 4.2 says the strings frame before a records frame holds exactly the strings first met there.

**Choice:** allowed. Then that records section must meet no new string, which is possible when every string it names was met before (for example, its paths were earlier files' targets). A sid that would be a new string there is refused as naming a string that no strings section has set down.
