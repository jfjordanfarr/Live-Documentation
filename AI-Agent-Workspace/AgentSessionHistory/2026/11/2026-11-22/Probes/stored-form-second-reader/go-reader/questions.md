# Questions on the specification

Each heading is one question. Under it: the section it is about, what is missing or in
conflict, and the choice the program (`run.sh` → Go, `reader.go`, `text.go`, `writer.go`)
made. "Confirmed by the samples" means the three sample files settle it; the rest is my choice.

## 1. May the head, strings, paths and wires sections have bytes after their last item?

- **Section:** 4.1, 4.2, 4.4, 4.5 (compare 4.3).
- **Missing:** Only the records section says "with no byte after the last". The head's grammar ends at the left-out list, and the strings, paths and wires sections end after `count` items, but none of them says that trailing bytes are refused. Section 3.4 says that one set of facts has one set of sections, which suggests they are refused.
- **Choice:** Any byte after the last item of any section is refused ("N bytes follow the last item of the section").

## 2. Is the content's name checked from the headers, or by inflating the end?

- **Section:** 3.4 vs 6 step 4.
- **Conflict:** Section 3.4 says "A reader checks the name from the headers alone, before inflating anything". Section 6 step 4 says to "inflate it and compare it with the name computed from the headers' hashes".
- **Choice:** Both, in this order. First, the name computed from the headers must have the SHA-256 held in the end frame's `hash` field (no inflating). Then the end section is inflated, checked against its hash, and compared with the name.

## 3. What is "the file length" in the 64× bound?

- **Section:** 3.5.
- **Missing:** It does not say whether the length is that of the whole input or of the frames only, or (for an unfinished file) of what has arrived so far.
- **Choice:** The length of the whole input in bytes, signature included. The bound is `64 × len + 1,048,576`, compared with the running sum of `rawLength` (the end's included) as each header is hopped.

## 4. In what order are the checks of one header made, given that only the reason depends on it?

- **Section:** 3.5, 6 step 2.
- **Missing:** "Check the kind and the limits" does not order the kind, `MAX_SECTION`, the 1032× ratio, the running total and `storedLength` past the end. All of them refuse, so only the message differs.
- **Choice:** Kind, then `MAX_SECTION`, then 1032× + 1024, then the running total, then `storedLength` past the end ("unfinished"). Overall the reader follows the order of section 6: signature, headers, frame order, end, then head/paths/wires, then strings and records. The duplicate-string check runs last, after every section is read.

## 5. What does "the declared length of the strings sections" mean?

- **Section:** 4.4 ("All the paths together are at most as long as the declared length of the strings sections").
- **Missing:** "Declared" could mean the sum of the strings frames' `rawLength`, or their `storedLength`.
- **Choice:** The sum of the `rawLength` fields of every strings frame, taken from the headers before any strings section is inflated. A valid file always passes this, because each path is a distinct string whose bytes, plus a length, sit in some strings section.

## 6. Do `[array]` and `[promise]` in a type carry bytes?

- **Section:** 4.3 (`type = name:sid typeMark linked [array] [promise]`).
- **Missing:** The grammar writes them like the optional fields `[x]`, which are present when their mark bit is set. But nothing says what bytes an "array" would be.
- **Choice:** They are flags only (typeMark bits 3 and 4) and carry no bytes. Confirmed by the samples: `made-every-fact` holds both and reads back byte for byte.

## 7. What is the text's name for role 3: `Constraints` or `constraint`?

- **Section:** 4.3 (`3 Constraints`), 5 (edge kind `constraint`), 8.
- **Missing:** Section 8 never lists the role words, and no sample has role 3. The enumeration in 4.3 says `Constraints`, while the graph's edge kind is `constraint`. The text appears to use the enumeration's words (`Returns`, `Extends`, `Implements`, `Parameters` all match the samples).
- **Choice:** `"role":"Constraints"`. The same goes for the entry reasons `module` and `declared`, which no sample shows. They are written as the 4.3 enumeration spells them, as the other four are.

## 8. In what order are sids "met"?

- **Section:** 4.2 ("walking the records in order (section 4.3)").
- **Missing:** The text form puts `generatedAt` and `authored` before the entries, but the layout stores them after the entries. It is not said whether first-met order follows the bytes of the record or the order of the facts in the text.
- **Choice:** The order of the sids' bytes in the record, i.e. the grammar of 4.3. Confirmed by the samples: the names that `name` computes from the sample texts equal the names in the sample files.

## 9. Which links make wires?

- **Section:** 4.5 ("the scanned files that the file's links name") vs 5 (only dependencies' links and the types of references make edges).
- **Missing:** 4.5 speaks of all "the file's links". These include an entry's symbol and declarer links, the cited-by links, a re-export's `fromLink` and a symbol's `sourcePath`. Section 5 limits edges to dependencies and types.
- **Choice:** Section 5. A file's wires are the files, other than itself, whose path is the `target` of one of its dependencies or of a type in one of its symbols' references (parameters included). The two readings agree in practice, since only those links can have a `target`.

## 10. Is a valid text form one whose facts a valid binary file can hold?

- **Section:** 8, 7.1, 2.4.
- **Missing:** Section 8 says how each line is written and that a non-canonical line is refused. It does not say whether the text reader applies the layout's checks to the facts: paths and links (2.4), path order, the folders, the extension, and enumerations. A text with an absolute path, for example, is canonical JSON but describes no valid file.
- **Choice:** A text is valid exactly when it is the text that `read` would print for some valid binary file. `name` parses the lines into facts, writes them as a binary file (section 7.1), reads that file with every check of section 6, and then writes its text again. That text must equal the input byte for byte; otherwise it is refused, naming the first line that differs.

## 11. The 64× bound in `name` depends on a compressor the text does not fix.

- **Section:** 3.4, 3.5 ("A writer refuses to finish a file that would break it"), and the task's `name` mode.
- **Conflict:** The content's name does not depend on compression. Whether the facts can be stored at all does depend on it through the 64× bound, because that bound is relative to the compressed file's length. The same text could be storable with one deflate and not with another.
- **Choice:** `name` compresses with Go's `compress/flate` at `BestCompression` and applies the bound to that file. The bound can only bite on texts that inflate more than 64 times, far beyond real scans (about 4 to 5 times, section 11). `MAX_SECTION` does not depend on the compressor and is applied as written.

## 12. The text form of a valid file can be far larger than the file. Does section 6's bound cover printing it?

- **Section:** 6 ("Its time and memory are bounded by the file's size"), 3.5, 8.
- **Conflict:** A sid of one byte can name a string of up to 64 MiB, and a record can name it millions of times. A small valid file can therefore have a text form of terabytes. Printing that cannot be bounded by the file's size, yet the task requires printing the text of every valid file.
- **Choice:** Memory stays bounded. The reader checks everything first (every per-string check, such as "is this target a path" and "which file is it", is made once per string, not once per use). It then streams the text from the inflated records without building it, so time is proportional to the file plus the text printed. Nothing valid is refused for being large.

## 13. Which raw deflate streams are valid?

- **Section:** 3.2 ("a raw deflate stream (RFC 1951)… end exactly at the stream's end with nothing after it"), 3.4.
- **Missing:**
  - RFC 1951 leaves corner cases to implementations: incomplete or over-subscribed Huffman codes, distance codes 30 and 31, length codes 286 and 287, and the leftover bits of the last byte after the final block. Implementations (zlib, Go) differ slightly on some of them.
  - "Nothing after it" could mean whole bytes, or also non-zero padding bits.
- **Choice:**
  - Go's standard `compress/flate` decides validity.
  - The stream must reach its final block and inflate to exactly `rawLength` bytes. Reading stops at one byte more.
  - Not one whole byte of `stored` may remain after the final block. The padding bits of the last byte are not checked.

## 14. What may the extension be?

- **Section:** 4.1 ("`extension` holds no `/`").
- **Missing:** Nothing says whether the extension may be empty, or may hold `\`, U+0000, `..` or a drive prefix. It becomes part of every document path.
- **Choice:** Only `/` is refused. An empty extension and any other string are accepted.

## 15. Are inbound wires part of the read?

- **Section:** 6 step 5 ("Inbound wires are computed here").
- **Missing:** The text form holds no derived facts (section 8), so inbound wires change nothing that `read` prints, and they cannot make a file invalid.
- **Choice:** Not computed. The outbound wires are fully checked: each sorted, unique, below the file count and not the file itself, and equal to what the records give.

## 16. How far may a count be refused "sooner"?

- **Section:** 2.1.
- **Missing:** Only two minimum sizes are given: a left-out entry (3 bytes) and a path (2). Other items also have a known minimum size.
- **Choice:** Counts are refused when `count × minimum` exceeds the bytes left. The minimums are: entry 2, symbol 6, dependency 3, cited-by 2, re-export 3, reference 2, parameter 2, type 2, section 2, sid 1, wire 1. In the headers: strings, records and wires 1, paths 2. As 2.1 requires, this refuses only files that would run out of bytes anyway.

## 17. What exit status, and what exactly is printed?

- **Section:** none (the task's interface).
- **Missing:** The specification and the task give no exit status for a refusal. "64 lowercase hexadecimal digits" does not say whether a newline follows.
- **Choice:**
  - Exit status is 0 for both answers.
  - A refusal is the one line `refused: <reason>` on standard output, ending in LF. Control characters in the reason are replaced by spaces, so it stays one line.
  - The name is printed as 64 lowercase hex digits followed by LF.
  - Unreadable files, bad arguments and an unknown mode are also refusals.
  - An unexpected internal fault is caught and reported as `refused: internal error …`, never as a traceback. None was seen in testing.

## 18. Is a text with a BOM, CR or no final LF refused before anything else?

- **Section:** 8 ("UTF-8 with no byte-order mark… Every line ends with LF… no line holds a CR").
- **Missing:** Nothing is unclear about the rules themselves, only about the order of the checks.
- **Choice:** `name` checks, in this order:
  1. the text is not empty;
  2. no leading BOM;
  3. strict UTF-8 (the same table as 2.2: Go's `unicode/utf8.Valid` refuses overlongs, surrogates and code points above U+10FFFF);
  4. no CR anywhere;
  5. the last byte is LF.

  Then each line is parsed and checked. U+FEFF inside a string is kept as part of it, and is written literally (8.1).

## 19. Does a JSON parse refuse what writing again would refuse anyway?

- **Section:** 8 ("A reader may parse each line with any JSON parser, then write the line again… and compare").
- **Missing:** Nothing; this notes how the program does it. Its own parser refuses some forms at once, which only changes the reason given:
  - whitespace, `false`, signs, fractions, exponents and leading zeros;
  - numbers above 2^32 − 1;
  - unescaped control characters;
  - unpaired surrogate escapes (which cannot be a string by 2.2);
  - nesting deeper than any line has.

  Everything else is refused by the byte-for-byte comparison with the line written again: other member orders, duplicate or unknown members, `\/`, `A`, uppercase hex, surrogate-pair escapes, a wrong end count, lines after the end.
- **Choice:** As described.

## 20. Do the path checks apply to a link's `target` and to the folders, and to which "letter followed by `:`"?

- **Section:** 2.4.
- **Missing:** The rules are clear, but they refuse ordinary relative Unix names such as `a:b.txt` as a path, and `c:foo` as a link, because the first byte is an ASCII letter followed by `:`.
- **Choice:**
  - Applied as written. Only the first two bytes are tested for a drive, case is folded only for `file:`, and `\` is refused only as the first byte.
  - `target` is checked as a path; `link`, `symbolLink`, `declarerLink`, `sourcePath`, the cited-by link and `fromLink` as links.
  - `root` and `baseLayer` must be empty or a path.
