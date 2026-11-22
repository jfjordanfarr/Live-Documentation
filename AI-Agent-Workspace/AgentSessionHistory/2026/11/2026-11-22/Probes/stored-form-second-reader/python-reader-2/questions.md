# Questions on the specification

Each heading is one question. Under it: the section it is about, what is missing
or in conflict, and the choice `reader.py` makes. The specification was my only
source; where I relied on how Python's standard library behaves, I say so.

## 1. Must a reader print a text past the text bound, or refuse it?

**Section 3.5 (the text export's bound), and the task.** Section 3.5 lets a
reader refuse to write the text of a valid file whose named strings exceed
`64 × file length + 1 MiB`, and says that writing it anyway "is right too". It
also says such a refusal "must say that it refuses the text, not the file". The
task says a valid file's text is printed, and anything else is one `refused:`
line. A refusal of the text alone would therefore look exactly like a refusal of
the file.

**Choice:** `read` always writes the text of a valid file. It streams it, so
memory stays bounded however long the text is. Section 3.5's own example (one
32 KiB string named 9,000 times, a 417-byte file here) gives a 295 MB text in
about 1.3 s with a peak of 21 MB. The reader never refuses a text alone, so it
never has to say which kind of refusal it is making.

## 2. Which deflate streams are accepted where inflaters may differ?

**Section 3.2 (where two inflaters may differ).** The specification leaves
incomplete or over-subscribed Huffman codes, the reserved codes, and bits left
over in the last byte "to its implementations", and says a reader refuses what
its inflater refuses.

**Choice:** the inflater is Python's `zlib` (raw deflate, `wbits=-15`). Whatever
it refuses is refused. Whatever it accepts is then held to section 3.2's rules:
it must reach the end of the stream, leave no whole byte after it, inflate to
exactly `rawLength` bytes, and match the hash. So unused bits in the last byte
are accepted, as zlib accepts them. I did not measure where zlib and other
inflaters differ.

## 3. "Inflation stops the moment it would give more than rawLength": by how much?

**Section 3.5, last bullet.** The rule doesn't say whether an inflater may
produce one byte past `rawLength` in order to notice the overrun.

**Choice:** zlib is asked for at most `rawLength + 1` bytes. If it gives
`rawLength + 1`, the section is refused. Memory is never more than one byte past
the declared length.

## 4. Is a text valid if its facts need a section longer than 64 MiB?

**Sections 8 (a valid text) and 3.5 (MAX_SECTION).** Section 8 defines a valid
text as one "whose facts a writer can store" and then lists the checks that
means. `MAX_SECTION` is not among them, but section 3.5 says "a writer refuses
facts that would need more". The list and the definition disagree for, say, 256
records that together set down more than 64 MiB.

**Choice:** `name` refuses such a text, because no writer can store it, so there
is no binary file for it to name. The 64× inflation bound is not applied to
texts, since section 8 excludes it explicitly.

## 5. May a link be empty, hold U+0000, or be a URL?

**Section 2.4 (links).** A link is refused when it begins with `/`, `\`, a
letter and `:`, or `file:`. Unlike a path, nothing says a link may not be empty
or hold U+0000. And `https://host/x` names an absolute place in one sense but
matches none of the listed beginnings. Section 4.3 counts web links among the
lines scanners write.

**Choice:** only the listed beginnings are refused. The empty link, a link
holding U+0000, and `https://…`, `mailto:…` and `#frag` are accepted. A `target`
is a path, and gets every path check.

## 6. What does the first path in the paths section share with?

**Section 4.4.** "A path's UTF-8 bytes are the first `shared` bytes of the path
before it", and "`shared` is at most that path's length". The first path has no
path before it.

**Choice:** the path before the first is taken as empty, so the first path's
`shared` must be 0. This writer-side reading reproduces the paths sections of all
three samples byte for byte.

## 7. Does "qualifiers hold `re-export`" mean an exact qualifier?

**Section 5 (an edge's `kind`).** `typeOnly` and `basis` say "exactly"
(`type-only`, `contract`, `configuration`). `re-export` says only that the
qualifiers "hold" it, which could also mean containing it as a substring.

**Choice:** one qualifier must be exactly `re-export`. This is the same reading
as for the other two, and it matches the every-fact sample.

## 8. Does an empty anchor give `toSymbol` in the graph?

**Section 5 (`toSymbol`, "the anchor, when the link has one").** In the layout an
anchor is present by its mark bit, and it may be the empty string (the
seeded-5-30 sample has `"anchor":""`). Whether an empty anchor counts as the link
"having one" isn't said.

**Choice:** presence follows the mark. An anchor that is present but empty gives
`"toSymbol":""`, for an edge and for a documentation item alike.

## 9. How is the graph written: encoding, escapes, member order?

**Section 5 and the task.** The task fixes the shape, and leaves whitespace and
member order free. Neither says how strings are escaped or how the JSON is
encoded.

**Choice:** UTF-8, with strings and numbers written exactly as section 8.1
writes them, no whitespace, and members in the order section 5 lists them
(`kind, label, link, to, toSymbol, from, parameter, typeOnly, basis`;
`label, link, to, element, toSymbol, from`). `documentation` and `documentedBy`
are left out when they would be empty, as section 5 says. `edges`, `outbound`
and `inbound` are always present, as the task's shape shows. Output ends with
one LF.

## 10. Which refusal is reported when a file breaks several rules?

**Section 6.** Section 6 orders the steps (signature, headers, frame order, end,
head/paths/wires, then the whole read). It doesn't order the checks within a
step or ask for a particular reason. Section 3.5 asks only that a broken limit
"says which".

**Choice:** the steps run in section 6's order and the first broken rule is
reported, naming its section and, inside a section, the byte offset. Within
step 2, each header's checks run in this order: kind, `MAX_SECTION`,
`1032 × storedLength + 1024`, the running total, then `storedLength` against the
file's end. A file that stops before its end frame, or whose header or stored
bytes are cut, is refused with a reason beginning `unfinished:` (section 3.3).

## 11. Which optional early refusals are made?

**Section 2.1.** A reader "may" refuse a count sooner where it knows an item
takes more bytes. Section 3.4 says it "may" check the end's header hash before
inflating.

**Choice:** all of them are made: left-out entries take 3 bytes; the frame
counts of strings, records and wires 1 byte each and of paths 2; and the end's
header hash must be SHA-256 of the name. As the specification says, none of these
changes which files are accepted. The randomized tests found no valid file they
refuse.

## 12. How fast is "bounded by the file's size"?

**Sections 6 and 3.5.** Time and memory must be bounded by the file's size, and
the 64× bound makes them proportional to it. No constant is given.

**Choice:** every loop runs over bytes that are already checked to be there, and
memory is the uncompressed sections plus the string table. Text and graph are
streamed. Measured in pure Python on files of about 340 KB built to inflate
close to the 64× bound (about 20 MB of records): peak memory stayed between 60
and 90 MB. Time ran from 2 to 40 s depending on the record shape, the slowest
being millions of linked documentation references in `graph`. Real scans
inflate 3 to 5 times (section 11), and the samples take well under a second. A
caller with a strict time limit could still see a large adversarial file as a
hang.

## 13. Is the version on the text's format line the layout's version?

**Sections 8 and 4.1.** `[null,"format","fact-pack",1]` is called "the layout's
version". A reader "refuses a version other than the one it reads".

**Choice:** a text whose format line has any version but `1`, or any name but
`fact-pack`, is refused. `fact-pack` is provisional (section 12), but it is the
only name given.

## 14. Do provenance notes bind a reader?

**Sections 2.3, 3.4, 3.5, 5, 6 and 8.** Many paragraphs marked **Provenance**
name functions of "the module" (`comparePaths`, `textOf`, `graphOf`,
`readScan`, `CompressionStream`). Section 5 says "this text is the authority".

**Choice:** provenance notes are treated as history, not rules. Nothing is
taken from them except where the text itself states the rule, as with the
UTF-16 ordering in 2.3, which follows from byte order anyway.

## 15. Where the reader relies on Python for a rule the specification states

**Sections 2.2, 8 and 8.1.** These are not gaps in the specification. They are
places where the program trusts a library to apply a rule exactly:
- strict UTF-8 (table 3-7) is Python's `bytes.decode('utf-8')` in strict mode.
  It refuses overlongs, encoded surrogates, values above U+10FFFF and cut
  sequences, and keeps a leading U+FEFF. The refusal tests cover each case;
- a text line is parsed with Python's `json`, then the parsed facts are set down
  as sections, read back with every check, and written again. The text is valid
  only if that gives back its own bytes. That catches every non-canonical form
  in section 8's list. Duplicate members are refused while parsing. `NaN` and
  `Infinity` are refused. A line nested so deep that Python's parser gives up is
  refused, and no valid line nests more than seven deep.
