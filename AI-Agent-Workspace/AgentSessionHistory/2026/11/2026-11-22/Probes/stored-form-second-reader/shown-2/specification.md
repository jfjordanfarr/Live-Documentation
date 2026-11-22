# The Stored Form of a Scan's Facts

## 1. What it is

A **scan** is what was read from one folder: for each file of the folder that was kept, the facts a reader of its language found in it. The stored form keeps one scan in one file, in a compact binary **layout**, and says exactly the same facts in a **text form** of one fact a line. Each converts to the other without loss, and each has one form for one set of facts: one set of facts gives one text and one set of uncompressed sections (section 3.4 says what may differ).

The owner's words that govern it (2026-11-21): of binary stored and text exported on demand, "Agreed. Yeah looks like this will have to be our lean."; that the data format should be "useful to more than one project, and could hopefully be visualized in more than one way"; and that it be "quite ironclad in its security guarantees. New file formats take on some risks."

**What a scan holds.** For each file: its path, the names, kinds and lines of its public symbols, the text of their documentation comments, the words a person wrote about it, its dependency labels and the links its documents make, and what each link names. **What it never holds:** a file's contents beyond those comments, and any absolute path. A reader refuses an absolute path wherever the layout keeps a path or a link (section 2.4). **What it says it left out:** its head lists what the scanner left out, each with a reason, a count and a detail, such as files left out by the configuration's patterns. The scanner fills that list; the layout carries it and does not judge it.

## 2. Conventions

### 2.1 Numbers

- **u8** is one byte. **u32** is four bytes, little-endian, unsigned.
- **varint** is an unsigned number from 0 to 2^32 − 1, seven bits a byte, least significant group first, the high bit set on every byte but the last (LEB128). It is at most five bytes, and it is written in its shortest form: a last byte of 0 after any earlier byte is refused, as is a value above 2^32 − 1 and a sixth byte.
- A **count** is a varint that says how many items follow. Every item takes at least one byte, so a count larger than the bytes left in its section is refused before anything is made for it.
  - A reader may refuse sooner where it knows an item takes more: a left-out entry takes at least 3 bytes, and a path in the paths section at least 2.
  - A frame's `count` may likewise be refused when it exceeds its section's raw length: strings, records and wires take at least 1 byte each, paths 2.
  - None of these changes which files are accepted. Each refuses only what would run out of bytes anyway.
- A **mark** is a varint whose bits say which optional fields follow. A bit the layout does not define for that mark is refused.

### 2.2 Strings

A **string** is a sequence of Unicode scalar values: code points from U+0000 to U+10FFFF, other than the surrogates U+D800 to U+DFFF. It is stored as UTF-8 (RFC 3629).

- **A reader decodes strictly.** It refuses any byte sequence that is not well-formed UTF-8 by the Unicode Standard's table of well-formed byte sequences (chapter 3, table 3-7): an overlong form, an encoded surrogate (`ED A0 80` to `ED BF BF`), a code point above U+10FFFF, a byte that cannot begin or continue a sequence, and a sequence cut short. A byte-order mark is not removed: U+FEFF at the start of a string is part of the string.
- **A writer refuses a string it cannot store as UTF-8.** In a language whose strings are UTF-16, that is a string holding an unpaired surrogate.
- **Two strings are equal when their UTF-8 bytes are equal.** No normalization is applied: `é` as one code point and as `e` with a combining accent are two strings.
- No string is ever interpreted by the layout (section 9).

Two ways a string appears:
- **text** (in the head and the strings section): a varint byte length, then that many bytes.
- **sid** (in records): a varint, the number of a string in the scan's string table (section 4.2).

### 2.3 Path order

Files are kept in **path order**: by the bytes of their paths' UTF-8, compared byte by byte as unsigned numbers, a path that is a prefix of another coming first.
- This is the order of their code points, and the order a reader in any language gets by comparing bytes, as git orders the names in a tree.
- A reader whose strings are UTF-16 does not get it by comparing code units. A code point above U+FFFF is a pair of units from U+D800 to U+DFFF, which compare below the single units from U+E000 to U+FFFF. Where the first units that differ are one such pair's and one unit from U+E000 up, the pair's path comes after. (**Provenance:** the module's `comparePaths` does this.)
- Every other sort in this specification is by this order too: the wires' files (by number, which is this order), a file's outbound and inbound paths.
- Two paths may differ only by case. The layout does not refuse them, though Windows cannot hold both.

### 2.4 Paths and links

The checks below compare characters as ASCII: `A` to `Z` and `a` to `z` are the letters, and case is folded only where it says so.

- A **path** is a file's place in the scanned folder, with `/` (U+002F) between segments. A reader refuses anything else wherever a path is kept, both a file's path and what a link names. A path:
  - is not empty;
  - does not begin with `/` or `\` (U+005C);
  - does not begin with an ASCII letter followed by `:` (a drive, as `C:`). This has a cost. On a system whose names may hold a colon, some files cannot be stored: a file at the scanned folder's top named like `a:b.txt`, and every file inside a top folder named so (`c:dir/x.ts`). Only a path's first two characters are tested, so `src/a:b.txt` is stored. A scanner leaves it out and lists it, with its reason, among what the head says was left out. A link that begins so (`c:foo`) is refused likewise;
  - does not begin with `file:` in any mix of ASCII case;
  - holds no U+0000;
  - has no segment, between slashes, that is empty, `.` or `..`.
- A **link** is written as the document wrote it, relative to that document. It may climb with `..`, but it may not name an absolute place. A link is refused when it begins with `/` or `\`, with a letter and `:`, or with `file:` in any case.
- A **folder** of the location (`root`, `baseLayer`) is empty or a path.

## 3. The file

```
file    = signature frame*
signature = 89 46 50 4B 0D 0A 1A 0A          (provisional)
frame   = kind:u8 count:u32 rawLength:u32 storedLength:u32 hash:32 bytes  stored:storedLength bytes
```

### 3.1 The signature

Eight bytes, `89 46 50 4B 0D 0A 1A 0A`, shaped as PNG's: a high byte, three letters (provisional), a CR LF, a ^Z and an LF, so that a transfer that changes line endings or drops the high bit is caught at once. Anything else is refused.

### 3.2 Frames

Each section is a frame. Its 45-byte header is:

| Field | Size | What it says |
| --- | --- | --- |
| `kind` | u8 | 1 head, 2 strings, 3 records, 4 paths, 5 wires, 6 end. Any other is refused. |
| `count` | u32 | Strings: how many. Records: how many files. Paths and wires: how many files in the scan. Head: 0. End: how many frames come before it. |
| `rawLength` | u32 | The section's length uncompressed. |
| `storedLength` | u32 | The length of the stored bytes that follow. |
| `hash` | 32 bytes | SHA-256 of the section's uncompressed bytes. |

`stored` is the section compressed as a raw deflate stream (RFC 1951, no zlib or gzip wrapping). It must inflate to exactly `rawLength` bytes, end exactly at the stream's end with no whole byte after it, and give bytes whose SHA-256 is `hash`.

**A section is exactly its grammar.** In every section, the head, strings, records, paths, wires and end alike, the uncompressed bytes end where the section's last item ends. A byte after it is refused.

**Where two inflaters may differ.** RFC 1951 leaves some streams to its implementations:
- Huffman codes that are incomplete or over-subscribed;
- the distance codes 30 and 31, and the length codes 286 and 287, which it reserves;
- bits left over after the final block, in its last byte.

One inflater may accept such a stream where another refuses it. A reader refuses whatever its inflater refuses. What the format guarantees is this: every section's uncompressed bytes are checked against their hash, and the hash names one content. So two correct readers can never be shown two different maps from one file. At worst, one shows the map and the other refuses the file. Whether the inflaters in use today (zlib, which Node, Chromium and Python use, and Go's `compress/flate`) split on any of these streams is unmeasured. No mutant of the fuzzer found such a split, and none was built to look for one. One stream with its last byte's high bit set was accepted by Node's zlib with the same output. Whether that bit was padding was not established.

### 3.3 The order of frames

```
head  ( strings? records )*  paths  wires  end
```

- The head comes first, with `count` 0.
- A strings frame comes only immediately before a records frame, and holds at least one string.
- Every records frame holds 256 files, except the last, which holds from 1 to 256. A scan of no files has no records frames.
- The paths, the wires and the end come last, in that order. The paths' and wires' `count` is the number of files the records hold. The end's `count` is the number of frames before it, and its `rawLength` is 32.
- The file ends exactly where the end frame ends. A byte after it is refused. A file that stops before an end frame is **unfinished**: a reader refuses it as a scan, and a writer may go on from it (section 7.2).

### 3.4 One form, and the content's name

- **Its content is canonical.** For one set of facts there is one sequence of uncompressed sections: every rule below that says "must" says how. A reader refuses a file whose sections break any of them, even when it could make sense of it, so that two readers cannot be shown two different maps.
- **What may differ is the compression.** The stored bytes are any raw deflate stream that inflates to the section. Two writers with different deflate implementations can write different bytes for the same facts. (**Provenance:** the module uses the platform's `CompressionStream` at its default level. Node 26 and Chromium 149 link the same zlib, and on the research's measurement they wrote the same bytes. That is a fact of today's builds, not a promise.)
- **The content's name** is the SHA-256 of the 32-byte hashes of every frame before the end, joined in order. The end frame's section is that name. Two scans hold the same facts exactly when their names agree, however they were compressed.
- **The check a reader must make of the end:** inflate the end, check it against its hash as every section is checked, and compare its 32 bytes with the name computed from the headers' hashes.
  - A reader may also check, from the headers alone and before inflating anything, that the end's header `hash` is the SHA-256 of that name. This catches a wrong end cheaply.
  - That alone does not check the end's stored bytes, so it never stands in for inflating.
  - For a file a correct writer wrote, both hold.

### 3.5 Limits

These are checked before anything is allocated or inflated. Each, when broken, is a refusal that says which.

A mebibyte (MiB) is 1,048,576 bytes.

- A section's `rawLength` is at most 64 MiB, 67,108,864 bytes (`MAX_SECTION`). A writer refuses facts that would need more.
- A section's `rawLength` is at most `1032 × storedLength + 1024`, the most raw deflate can give.
- **All the sections together inflate to at most `64 × (file length in bytes) + 1,048,576`.**
  - The file length is the whole input's, signature included.
  - The total is the sum of the `rawLength` of every frame, the end's included, checked as each header is hopped.
  - This is the bound that makes what reading costs proportional to the file a reader is handed: every fact a reader builds takes at least one uncompressed byte, so memory is bounded by the file's size.
  - Real scans inflate three to five times (section 11).
  - A writer refuses to finish a file that would break it.
- **The bound is of a file, so near it storability depends on the writer.** The bound is reckoned from the compressed length, and the compression may differ between writers (section 3.4). So for a set of facts that inflates nearly 64 times, one writer may store it and another refuse, and a content name from such a text may be given by one and refused by the other.
  - No reader's verdict on a given file depends on who wrote it: a reader judges the bytes it holds.
  - A bound that a compressor does not change, one reckoned from the uncompressed facts, would not bound what a reader of a given small file must inflate. That bound is what this one is for, so it is kept, and this is its price.
  - Real scans sit far from it (three to five times against 64).
- **The text export's bound.** A string is held once and may be named many times. Its text form writes it out each time it is named, so a small valid file can have a very long text: 7 KB naming one 32 KiB string 9,000 times has a text of 300 MB.
  - A reader that writes the text may refuse to, when the names it would write exceed the same bound, `64 × (file length in bytes) + 1,048,576`. The names are counted in UTF-8 bytes: each string, once for every time a record names it.
  - It must say that it refuses the text, not the file. Such a file is valid: a reader reads it, answers from it, gives its graph and its content's name. Only its text is not offered.
  - A reader that writes the text anyway is right too, and writes the same text.
  - So the text requires that a file within the bound be written as text. Past it, writing and refusing are both correct.
  - (**Provenance:** the module's `textOf` refuses past the bound. Both blind readers stream the text and write it.)
- `storedLength` must not run past the file's end. A header that does is a cut, not a refusal, while reading an unfinished file.
- Inflation stops the moment it would give more than `rawLength`, and refuses.

## 4. The sections

### 4.1 The head

```
version:u8 (= 1)  root:text  baseLayer:text  extension:text  scanner:text
leftOut:count × ( reason:text  number:varint  detail:text )
```

- `root` and `baseLayer` are folders (section 2.4).
- `extension` holds no `/`, no `\` and no U+0000, since it ends every document path: a slash or a backslash would put the document in another folder on one system or another, and no file system's names hold a NUL. It may be empty, and it may hold anything else.
- A file's **document path** is `root`, `baseLayer` and the file's path followed by `extension`, joined by `/`, with an empty folder and its `/` left out. For example, `.mdmd/layer-4/src/a.ts.mdmd.md`. The layout keeps the location so that the graph can give each file its document's path. A reader refuses a version other than the one it reads.

### 4.2 Strings

`count` texts. Together, the strings sections of a file are its **string table**. Strings are numbered from 0 in the order they appear across all strings sections.

- **No string appears twice.**
- **A string is numbered in the order it is first met**, walking the records' bytes in order, by the grammar of section 4.3. That is the layout's order, which is not the text form's order of lines: the layout keeps `generatedAt` and `authored` after the entries. Every sid in a record is either a number already met, or exactly the next number not yet met, which it then makes met. A sid larger than that is refused.
- **The strings section just before a records section holds exactly the strings first met in it.** After a records section, every string set down so far must have been met. So a cut file is whole up to its last records, and a string nobody names is refused.

### 4.3 Records

`count` file records, back to back, with no byte after the last. Each record, in this order, where `[x]` is present when its mark says so and `list(x)` is a count and then that many `x`:

```
record     = path:sid  layer:varint  fileMark
             [archetype:sid]                      fileMark bit 0
             list(entry)
             [generatedAt:sid]                    fileMark bit 1
             authored:sid
             list(symbol)
             list(dependency)
             [list(citedBy)]                      fileMark bit 2
             [list(reExport)]                     fileMark bit 3

entry      = reason:varint (0 program, 1 command, 2 module, 3 opening, 4 tooling, 5 declared)  entryMark
             [symbolName:sid]  [symbolLink:sid]   entryMark bits 0, 1 (bit 1 only with bit 0)
             [command:sid]                        entryMark bit 2
             [declarerLabel:sid declarerLink:sid] entryMark bit 3

symbol     = name:sid  symbolMark  [slug:sid]  kind:sid  list(flag:sid)  [sourcePath:sid sourceLine:varint]
             symbolMark bit 0 the slug, bit 1 the source
             list(reference)
             list(section)
             list(docReference)
reference  = role:varint (0 Returns, 1 Extends, 2 Implements, 3 Constraints, 4 Parameters)
             role 4:  list(parameter)    where parameter = name:sid list(type)
             else:    list(type)
type       = name:sid  typeMark  linked
             typeMark bits 0, 1, 2 as linked; bit 3 an array of the type; bit 4 a promise of it
             (the two last are marks only, and carry no bytes)
section    = title:sid  list(line:sid)
docReference = name:sid  docMark  [element:sid]  linked
             docMark bits 0, 1, 2 as linked; bit 3 the element

dependency = label:sid  depMark  linked  [list(symbol:sid)]  list(qualifier:sid)
             depMark bits 0, 1, 2 as linked; bit 3 the symbols list
linked     = [link:sid]  [target:sid]  [anchor:sid]
             bit 0 the link; bit 1 the target, only with the link; bit 2 the anchor, only with the target
citedBy    = label:sid  link:sid
reExport   = name:sid  reMark  [slug:sid]  [fromLabel:sid fromLink:sid]  list(flag:sid)
             reMark bit 0 the slug, bit 1 the origin
```

- The records' paths are in strict path order across all records sections. No path repeats.
- `path` and `target` are paths. `symbolLink`, `declarerLink`, `sourcePath`, `link`, the cited-by link and `fromLink` are links (section 2.4).
- The words of the enumerations, which the text form writes:
  - an entry's `reason`: 0 `program`, 1 `command`, 2 `module`, 3 `opening`, 4 `tooling`, 5 `declared`;
  - a reference's `role`: 0 `Returns`, 1 `Extends`, 2 `Implements`, 3 `Constraints`, 4 `Parameters`, with their capital letters.
  - These are not the graph's edge kinds (section 5), which are other words.
- **A symbol's documentation references** (`docReference`) are the references its documentation comment makes to declarations, as the scanner read them from its documentation: the name as the author wrote it, the element that carries it where that is not a plain reference (for example `exception` or `inheritdoc`), and, where the scanner resolved it, its link and what the link names.
  - The scanner also keeps the documentation's own lines among the symbol's sections, verbatim. The layout does not read those lines. It carries the scanner's reading of them beside them, as it carries what a link names, and does not check that the two agree.
  - **Why the fact is held twice.** The lines are not only references. Measured on 2026-11-22 on this repository's scan, the estate sample's and DNN's:
    - Of 7,886 lines in the sections the scanner reads references from, 7,848 are exactly the line the scanner's composer writes for a reference.
    - The other 38 are other kinds of line the composer writes into the same section: 35 web links (`- [url](url)`) and 3 plain names or paths (`- CreateValidID`, `- ../../docs/registry.md — Widget architecture`).
    - 46 reference lines also carry the author's words after the name. The reading does not hold them.
    - So the reading cannot stand for the lines.
  - **Which a consumer uses:** a viewer shows the lines, among the symbol's sections, as the author's documentation. The graph reads only the references (section 5).
  - **If the two disagree,** it is the scanner's fault, and a reader cannot see it: a reader would have to read the lines by the scanner's own grammar to compare them, and the layout keeps no copy of that grammar. A check of agreement costs little time (DNN has 7,842 such lines) but a second implementation of the scanner's documentation grammar in every reader. That is why it is not made.
  - (**Provenance:** this repository's scanner reads them from a section titled `Links`.)
- **What a link names.** `target` is the path of the file the link's document mirrors, and `anchor` is the fragment, as the scanner read the link. The target need not be a scanned file. A link to a file outside the scan keeps its target, and the graph (section 5) shows it landing nowhere. The layout does not resolve links itself, since that would be a second implementation of the scanner's rule. It carries the scanner's reading, and says so.
- Field values the layout keeps but does not judge: the `layer` number; the archetype; the kinds, flags and qualifiers, which are words a scanner chooses; and a section's lines, which may be any strings.

### 4.4 Paths

`count` paths, front-coded, in the records' order:

```
path = shared:varint  restLength:varint  rest:restLength bytes
```

- A path's UTF-8 bytes are the first `shared` bytes of the path before it, followed by `rest`. `shared` is at most that path's length, and it must be the longest shared beginning: when `rest` is not empty, its first byte differs from the previous path's byte at `shared`.
- Each path must be a path (section 2.4), in strict path order, and equal to the path of the record at the same place (checked when the record is read).
- All the paths' UTF-8 bytes together are at most the sum of the `rawLength` of every strings frame, as their headers declare it, so that a beginning shared over and over cannot grow the paths past the file. Every path is also a string, whose bytes and length sit in some strings section, so no valid file fails this. The check only stops a hostile paths section early.

The paths section is an index: it lets a reader answer by path without reading the strings or the records.

### 4.5 Wires

For each file, in order, its **outbound wires**:

```
wires = n:count  [ first:varint  ( gapMinusOne:varint ){n−1} ]     the bracket present only when n is at least 1
```

- A file with no wires is the single byte `00`, and nothing follows it for that file.
- The wires are the file numbers (indexes in path order) of the scanned files that the file's **edges** land on, other than itself: by section 5's rule, the targets of its dependencies' links and of its symbols' types' links (parameters' types included) that are paths of files of the scan.
  - No other link makes a wire: not an entry's, a cited-by's, a re-export's, a source's, nor a documentation reference's.
  - Only the links of dependencies, types and documentation references carry a target at all.
- They are sorted, each named once, each smaller than the number of files and none the file's own. The first is written as itself, and each later one as its distance from the one before, less one.
- They must equal what the records give (section 5), checked as each record is read.

**Inbound wires** are not stored. They are the outbound wires turned around: file *j*'s inbound wires are the files whose outbound wires hold *j*, in path order.

### 4.6 The end

The content's name, 32 bytes (section 3.4).

## 5. The graph

The graph is what the facts say about connection. A reader that gives one gives it by the rules below. (**Provenance:** they are the rules of `deriveLiveDocGraph` in this repository's engine, but this text is the authority.)

- **Each file's document** is at its document path (section 4.1).
- **The links that make edges**, in order: each dependency with a link, then, for each symbol in order, each reference in order. For a Parameters reference, each parameter's types; otherwise its types. A type makes an edge only when it has a link.
- **An edge** carries:
  - `kind`: `re-export` for a dependency whose qualifiers hold `re-export`, otherwise `import`. For a type, its role: `returns`, `extends`, `implements`, `constraint`, or `parameter`.
  - `label`: the dependency's label or the type's name.
  - `link`, when there is one.
  - **`to`, when the link's target is the path of a file of the scan**: that path. Then also `toSymbol`, the anchor, when the link has one.
  - For a type, `from`: the symbol's slug, when it has one. For a parameter, `parameter`: its name.
  - For a dependency, `typeOnly` (true) when one of its qualifiers is exactly `type-only`. And `basis`: the first of its qualifiers, in their order, that is exactly `contract` or `configuration`, when there is one.
  - A field the rules do not give is absent.
- **Outbound** is the set of every edge's `to` other than the file's own path, each once, in path order (section 2.3). **Inbound** is turned around from outbound, as in section 4.5, in path order.
- **Documentation** is a relation of its own, held apart from the edges, outbound and inbound. It is the author's word that two declarations are related, which is not a use. A reader that walks what is reachable, or answers what nothing uses, follows only the edges and never this.
  - For each symbol in order, each of its documentation references in order whose link has a target that is the path of a file of the scan gives one item:
    - `label`: the reference's name;
    - `link`;
    - `to`: the target;
    - `element`, when the reference has one;
    - `toSymbol`: the anchor, when it has one;
    - `from`: the symbol's slug, when it has one.
  - A reference with no link, or whose target is not a scanned file, gives nothing. A reference to the file's own declarations gives an item like any other.
  - A file's `documentation` is present only when it has at least one item.
- **Documented by**: for each file, the files other than itself whose documentation has an item with `to` equal to its path, each once, in path order. It is present only when there is one.

**A file's part of the graph needs two things of the other files:** which of them land on it (its inbound), and which of them name it in their documentation (its documented-by). Both come from the targets alone. A reader may gather those in one pass and build each file's part only when it is asked for. A Local Map, for example, asks for a few files' parts out of thousands. (**Provenance:** the module's `graphViewOf` does this, and its `graphOf` asks it for every file.)

The order of an object's members is not a fact. (**Provenance:** the module's `graphOf` gives them in the order this repository's `index.json` prints them, so that the two can be compared byte for byte. On this repository's own graph, the estate sample's and DNN's, the graph read back from the layout prints byte for byte as the `index.json` it was made from, `documentation` and `documentedBy` included; section 11.)

## 6. Reading

A reader takes any bytes at all and returns facts or a refusal that says why. It never hangs and never fails in any other way. Its time and memory are bounded by the file's size: every loop is bounded by bytes already checked to be there, every count by the bytes left, and every inflation by section 3.5. There is no expression, no filter, no plugin, and no reference to anything outside the file. A reader does, in this order:

1. Check the signature.
2. Hop the frame headers from the first. For each header, check the kind and the limits of section 3.5 before reading on. Stop at the end frame.
3. Check the frames' order (section 3.3).
4. Check the end as section 3.4 requires: inflate it, check it against its hash, and compare it with the name computed from the headers' hashes.
5. Inflate the head, the paths and the wires, each checked against its hash, and read them. Inbound wires are computed here.

That is enough to answer "what depends on this file", "what does it use" and "what is reachable from here", by name, without reading any strings or records. A reader may stop here, as a **quick open**. **What it has not read it has not checked.** When asked for one file's facts, it reads that file's records section and every strings and records section before it, in order, with every check below. (**Provenance:** the module's `openScan`.)

6. **The whole read** (**Provenance:** the module's `readScan`) reads every strings and records section in order:
   - each against its hash;
   - every string strictly decoded, and none twice;
   - every sid in first-met order;
   - every mark's undefined bits zero;
   - every enumeration in range;
   - every path and link as section 2.4 requires;
   - the records in path order;
   - each record's path equal to the paths section's;
   - each record's wires equal to the wires section's;
   - every string set down met.

   A file that passes all of these is canonical.

## 7. Writing

### 7.1 As facts arrive

A writer is handed a scan's head, then its files one at a time in path order, then told to finish. A file out of path order is refused, as is a fact the layout cannot hold as it is: an absolute path, a lone surrogate, a number out of range. A refused file leaves the writer as it was, so a host may count it as left out and go on.

The writer keeps:
- every distinct string;
- each file's path;
- what each file's links name.

It holds the current 256 files' records. When 256 have come, it sets down the strings first met in them, then their records.

At the finish it sets down:
- the last records;
- the paths;
- the wires, made from what the links name, now that every path is known;
- the end.

Every frame is handed to the host as it is set down, the signature first. The pieces in order are the file, so a host can append them to a file or keep them in a page's storage.

**The order of arrival.** A writer is owed files in path order, the order of UTF-8 bytes (section 2.3). (**Provenance:** when the engine and the module are wired, the engine's sink sorts by the module's comparator, so that there is one comparator.) A host whose readers finish out of order holds the early ones back until their turn: the research measured that a wait of about five hundred files costs 20 to 55 MB.

### 7.2 Going on from a stop

An unfinished file is whole up to its last frame that fits. To go on from it:

1. Keep its frames up to the **last records section of 256 files**. A last section of fewer, and a strings section after the last records, are dropped, since only the finish may write a short one.
2. Read the kept frames, each with every check of section 6, and rebuild the strings, the paths and what the links name.
3. Hand the rest of the files to a writer given that state, beginning after the last path kept.

The finished file is byte for byte the one an unstopped write gives, with the same compressor. A file already finished is refused as nothing to go on from. One that stopped before its head was whole must begin again.

## 8. The text form

One fact a line. The text is UTF-8 with no byte-order mark, and decoded strictly as section 2.2 decodes a string. Every line ends with LF (U+000A), the last one included, and no line holds a CR. Each line is one JSON value (RFC 8259) written in exactly one way, given in section 8.1. Members whose value is absent are left out of objects. In the layout, an absent value and an empty list are kept apart, and the text keeps them apart the same way: a missing line, or a line holding `[]`.

```
[null,"format","fact-pack",1]                        provisional name; the layout's version
[null,"location",root,baseLayer,extension]
[null,"scanner",scanner]
[null,"left-out",reason,number,detail]               one a line, in the head's order
then for each file, in path order:
[path,"file",layer,archetype|null,generatedAt|null]
[path,"authored",authored]
[path,"entry",{"reason","symbol":{"name","link"},"command","declarer":{"label","link"}}]        each entry
[path,"symbol",{"name","slug","kind","flags","source":{"path","line"},"references","sections","documentation"}]   each symbol
    a reference is {"role","types"} or {"role":"Parameters","parameters":[{"name","types"}]}
    a type is {"name","link","target","anchor","array","promise"}; a section is {"title","body"}
    a documentation reference is {"name","element","link","target","anchor"}
[path,"dependency",{"label","link","target","anchor","symbols","qualifiers"}]                    each dependency
[path,"cited-by",[{"label","link"},…]]                present when the record's mark says so
[path,"re-exports",[{"name","slug","from":{"label","link"},"flags"},…]]                        likewise
[null,"end",numberOfFiles]
```

- `array` and `promise` are written `true` when set and left out when not.

**The lines, in their one order.** The order is required, and any other order is refused:
1. the `format` line;
2. the `location` line;
3. the `scanner` line;
4. every `left-out` line, in the head's order;
5. then each file, in path order. Each file's lines carry its path and come in this order:
   - exactly one `file` line;
   - exactly one `authored` line;
   - one `entry` line for each entry;
   - one `symbol` line for each symbol;
   - one `dependency` line for each dependency;
   - at most one `cited-by` line, there when the record's mark bit 2 is set, even if its list is empty;
   - at most one `re-exports` line, likewise for bit 3;
6. last, the `end` line, whose number is the count of files.

A line of any other kind, or a line after the end, is refused.

**The members of each object.** A member that the layout guards by a mark is present exactly when the mark's bit is set. Every other member is always present, even when its list is empty. So:
- **Always present:**
  - an entry's `reason`;
  - a symbol's `name`, `kind`, `flags`, `references`, `sections` and `documentation`;
  - a source's `path` and `line`;
  - a reference's `role`, with `types`, or `parameters` for `Parameters`;
  - a parameter's `name` and `types`;
  - a type's `name`;
  - a section's `title` and `body`;
  - a documentation reference's `name`;
  - a dependency's `label` and `qualifiers`;
  - a cited-by item's `label` and `link`;
  - a re-export's `name` and `flags`;
  - a declarer's and an origin's `label` and `link`;
  - an entry's symbol's `name`.
- **Present by a mark:**
  - an entry's `symbol` (with `link` by its own bit), `command` and `declarer`;
  - a symbol's `slug` and `source`;
  - a dependency's `symbols`, a different fact from `[]`;
  - a re-export's `slug` and `from`;
  - `link`, `target` and `anchor` wherever `linked` stands;
  - `element`, `array` and `promise`.

**Names in the two grammars.** Section 4.3's fields are written under these names:
- a section's `list(line)` as `body`;
- `sourcePath` and `sourceLine` as `source:{path,line}`;
- `symbolName` and `symbolLink` as `symbol:{name,link}`;
- `declarerLabel` and `declarerLink` as `declarer:{label,link}`;
- `fromLabel` and `fromLink` as `from:{label,link}`;
- the lists of `docReference` as `documentation`.

The enumerations are written as section 4.3's words.

**A valid text** is one written in the one form whose facts a writer can store. That second part means every check this specification makes on the facts themselves:
- paths, links and folders (section 2.4);
- the extension (section 4.1);
- strict path order with no path repeated;
- the version;
- every enumeration's word;
- numbers from 0 to 2^32 − 1;
- the marks' constraints: a target only with a link, and an anchor only with a target;
- an end count equal to the number of files.

Equivalently, a valid text is exactly the text a reader writes for some valid file. The inflation bound of section 3.5 is not among these checks, since whether it holds depends on the writer's compression.

**Refused, for example:**
- another order of members, or a member the line does not have;
- a member written twice;
- a space anywhere outside a string;
- `4.0` or `4e0` for `4`;
- a letter written as a `\u` escape;
- `false` for an absent mark;
- a missing end line, or anything after it.
- A reader may parse each line with any JSON parser, then write the line again by section 8.1 and compare the bytes. A parser that keeps the last of two members with one name is safe this way, since the line written again has one.

### 8.1 How each value is written

Only these forms are written, and no other is accepted.

- **Arrays and objects:** `[` and `]`, `{` and `}`, members separated by `,` alone. An object's member is its name as a string, `:`, and its value. There is no whitespace between any two tokens.
- **`null`** and **`true`** as those four letters. `false` is never written.
- **A number** is a whole number from 0 to 2^32 − 1, written in decimal ASCII digits:
  - no sign;
  - no leading zero, except `0` itself;
  - no decimal point and no exponent.
- **A string** is `"`, then each code point of the string in order, then `"`. Each code point is written thus:

  | Code point | Written as |
  | --- | --- |
  | U+0022 `"` | `\"` |
  | U+005C `\` | `\\` |
  | U+0008 | `\b` |
  | U+0009 | `\t` |
  | U+000A | `\n` |
  | U+000C | `\f` |
  | U+000D | `\r` |
  | every other code point from U+0000 to U+001F | `\u00` then two lowercase hexadecimal digits, for example `\u0000`, `\u000b`, `\u001f` |
  | every other code point | itself, in UTF-8 |

  "Every other code point" includes:
  - `/`, which is never written `\/`;
  - U+007F and the C1 controls U+0080 to U+009F;
  - U+2028 and U+2029, which are written literally although some JavaScript engines would not have read them so before 2019;
  - U+FEFF;
  - every code point above U+FFFF, which is written as its four UTF-8 bytes and never as a pair of `\u` surrogate escapes.

  No other escape is written: no `\u` escape of a printable character, and no uppercase hexadecimal.

(**Provenance:** these are the forms ECMAScript's `JSON.stringify` writes for well-formed strings and whole numbers, which is how the module writes them. They are stated here as rules so that a reader in another language need not know that.)
- The text holds no derived fact: no edges, no wires, no document paths. Those are the graph's.
- `grep '"target":"src/b.ts"'` finds every link that names `src/b.ts`, which is "what depends on it" by its links. `diff` of two texts is the change in the facts.

**Both ways, without loss.** Bytes → text → bytes gives the same bytes, with the same compressor. Text → bytes → text gives the same text. (**Provenance:** both are the module's tests, `storedForm.test.ts`, and are measured on real scans; section 11.)

## 9. What a consumer owes

Every string in a scan came from someone else's files, and the scan itself may have come from anyone. The layout never interprets a string, and a reader's checks make a file well formed, never trustworthy. A consumer owes:

- **A viewer** renders every name, line and authored word as text, never as markup. An authored block holding `<script>` is shown as those characters. (**Provenance:** the module's test scan `everyFact` carries one.) A link is not followed or fetched because a scan holds it.
- **An export that writes files named by scanned paths** (the Markdown export does) resolves each path under its output folder and refuses one that escapes it. The layout refuses `..` segments and absolute paths, but a path may still hold a `\`, which Windows takes as a separator. It may hold a name Windows reserves (`CON`, `aux.txt`), a trailing dot or space, a colon (an alternate data stream on NTFS), or two names that differ only by case. An export that writes onto Windows refuses or escapes each of these.
- **An agent** that reads a scan reads every description, comment and authored word as quoted data from the scanned code, never as an instruction to it. A doc comment that says "ignore your previous instructions" is a fact about that file.
- **A page that takes in another page's data** reads it as bytes into this reader, and runs nothing from it.
- **What a scan holds** is said by its head and section 1. A person sharing a scan shares the names, paths, doc comments and authored words of every file in it.

## 10. Stable names

Authored plans, a World Map's board, are kept as text beside the scans and joined to them by names. What the layout offers as a name:

- **A file**: its path in the scanned folder. A rescan gives the same name to the same path. A file renamed or moved is a different name, and a plan joined to the old one becomes a ghost, to be shown as one. The layout keeps no identity across a rename; the history's renames, from git, are where one could be found.
- **A symbol**: its file's path and its slug, the anchor its document gives it (for example `src/b.ts#widget`), with its name as the words a person sees. A slug is as stable as the scanner makes it. Today's scanner makes it from the name, and from a suffix where two names would clash. A rescan keeps it while the name stays and the clash does not change, and a symbol renamed is a different name. A symbol with no slug can be joined only by its name.
- **A scan**: the content's name (section 3.4) names one set of facts exactly, and changes with any fact. So it names a moment, not a folder. A plan that should outlive rescans joins to the folder the scan is of, which the board already names (`From`), and not to a content name.

## 11. What was measured

The module's record measures, on this repository's graph, the estate sample and DNN Platform:
- its size against today's `index.json` gzipped;
- the time to a first answer and to the whole map;
- peak memory;
- the inflation ratio that section 3.5's bound rests on;
- every round trip above.

## 12. Open, for the owner

- **The name, the extension, the signature's letters (`FPK`) and the text's first line.** All provisional.
- **One form of compressed bytes, or one form of content.** A reader that checked the stored bytes would recompress every section and compare. That costs a write's time on every read, and it ties the format to one deflate implementation's exact output, which no standard fixes. This proposal makes the content canonical and names it by hash.
- **The link rule.** The layout carries what each link names, as the scanner read it, and does not check it, since checking would put a second copy of the scanner's link rule in the format. A hostile file can say a link names a file it does not. Only a reader with the scanner's rule could tell.
- **What was left out**, beyond the head's list. The head carries a list; which reasons the scanner reports is the wiring's to decide.
