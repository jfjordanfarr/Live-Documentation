# The Stored Form of a Scan's Facts

_A proposal of 2026-11-22. Built as one module, `packages/stored-form/src/storedForm.ts`, which nothing in the product uses yet. Every name, the file's leading bytes, its extension and the text form's first line are provisional: doors that close at a first release, and the owner's to settle._

_Written so that a second reader can be written from this text alone. Where the module and this text disagree, this text is meant and the module is wrong. The research it rests on is [the stored-form research of 2026-11-21](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Research/stored-form/README.md); the module's measurements are in [its record](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/stored-form-module/README.md)._

## 1. What it is

A **scan** is what was read from one folder: for each file of the folder that was kept, the facts a reader of its language found in it. The stored form keeps one scan in one file, in a compact binary **layout**, and says exactly the same facts in a **text form** of one fact a line. Each converts to the other without loss, and each has one form for one set of facts: one set of facts gives one text and one set of uncompressed sections (section 3.4 says what may differ).

The owner's words that govern it (2026-11-21): of binary stored and text exported on demand, "Agreed. Yeah looks like this will have to be our lean."; that the data format should be "useful to more than one project, and could hopefully be visualized in more than one way"; and that it be "quite ironclad in its security guarantees. New file formats take on some risks."

**What a scan holds.** For each file: its path, the names, kinds and lines of its public symbols, the text of their documentation comments, the words a person wrote about it, its dependency labels and the links its documents make, and what each link names. **What it never holds:** a file's contents beyond those comments, and any absolute path. A reader refuses an absolute path wherever the layout keeps a path or a link (section 2.4). **What it says it left out:** its head lists what the scanner left out, each with a reason, a count and a detail, such as files left out by the configuration's patterns. The scanner fills that list; the layout carries it and does not judge it.

## 2. Conventions

### 2.1 Numbers

- **u8** is one byte. **u32** is four bytes, little-endian, unsigned.
- **varint** is an unsigned number from 0 to 2^32 − 1, seven bits a byte, least significant group first, the high bit set on every byte but the last (LEB128). It is at most five bytes, and it is written in its shortest form: a last byte of 0 after any earlier byte is refused, as is a value above 2^32 − 1 and a sixth byte.
- A **count** is a varint that says how many items follow. Every item takes at least one byte, so a count larger than the bytes left in its section is refused before anything is made for it.
- A **mark** is a varint whose bits say which optional fields follow. A bit the layout does not define for that mark is refused.

### 2.2 Strings

Every string is UTF-8, well formed: a reader decodes it strictly and refuses any byte sequence that is not UTF-8, including encoded surrogates. A writer refuses a string holding a lone surrogate, which UTF-8 cannot carry. No string is ever interpreted by the layout (section 9).

- **text** (in the head and the strings section): a varint byte length, then that many bytes.
- **sid** (in records): a varint, the number of a string in the scan's string table (section 4.2).

### 2.3 Path order

Files are kept in **path order**: by the UTF-16 code units of their paths, compared as JavaScript compares strings. This is not the order of UTF-8 bytes. They differ where a path holds a character above U+FFFF and another holds one from U+E000 to U+FFFF. A second reader in another language must compare UTF-16 code units. Two paths may differ only by case; the layout does not refuse them, though Windows cannot hold both.

### 2.4 Paths and links

- A **path** is a file's place in the scanned folder, with `/` between segments. It is not empty. It does not begin with `/` or `\`, and does not begin with a drive (`C:`) or a file URL (`file:`). It holds no NUL character. No segment is empty, `.` or `..`. A reader refuses anything else wherever a path is kept: a file's path, and what a link names.
- A **link** is written as the document wrote it, relative to that document. It may climb with `..`, but it may not name an absolute place: a link that begins with `/` or `\`, with a drive, or with `file:` is refused.
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

`stored` is the section compressed as a raw deflate stream (RFC 1951, no zlib or gzip wrapping). It must inflate to exactly `rawLength` bytes, end exactly at the stream's end with nothing after it, and give bytes whose SHA-256 is `hash`.

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
- **What may differ is the compression.** The stored bytes are any raw deflate stream that inflates to the section. Two writers with different deflate implementations can write different bytes for the same facts. The module uses the platform's `CompressionStream` at its default level. Node 26 and Chromium 149 link the same zlib, and on the research's measurement they wrote the same bytes. That is a fact of today's builds, not a promise.
- **The content's name** is the SHA-256 of the 32-byte hashes of every frame before the end, joined in order. The end frame's section is that name. Two scans hold the same facts exactly when their names agree, however they were compressed. A reader checks the name from the headers alone, before inflating anything.

### 3.5 Limits

These are checked before anything is allocated or inflated. Each, when broken, is a refusal that says which.

- A section's `rawLength` is at most 64 MiB (`MAX_SECTION`). A writer refuses facts that would need more.
- A section's `rawLength` is at most `1032 × storedLength + 1024`, the most raw deflate can give.
- **All the sections together inflate to at most `64 × (file length) + 1 MiB`.** This is the bound that makes what reading costs proportional to the file's size. Every fact a reader builds takes at least one uncompressed byte, so memory is bounded by the file's size. Real scans inflate about four to five times (section 11). A writer refuses to finish a file that would break it.
- `storedLength` must not run past the file's end. A header that does is a cut, not a refusal, while reading an unfinished file.
- Inflation stops the moment it would give more than `rawLength`, and refuses.

## 4. The sections

### 4.1 The head

```
version:u8 (= 1)  root:text  baseLayer:text  extension:text  scanner:text
leftOut:count × ( reason:text  number:varint  detail:text )
```

- `root` and `baseLayer` are folders (section 2.4). `extension` holds no `/`.
- A file's document is at `root/baseLayer/<path><extension>`, the empty folders left out. For example, `.mdmd/layer-4/src/a.ts.mdmd.md`. The layout keeps the location so that the graph can give each file its document's path. A reader refuses a version other than the one it reads.

### 4.2 Strings

`count` texts. Together, the strings sections of a file are its **string table**. Strings are numbered from 0 in the order they appear across all strings sections.

- **No string appears twice.**
- **A string is numbered in the order it is first met**, walking the records in order (section 4.3). Every sid in a record is either a number already met, or exactly the next number not yet met, which it then makes met. A sid larger than that is refused.
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
reference  = role:varint (0 Returns, 1 Extends, 2 Implements, 3 Constraints, 4 Parameters)
             role 4:  list(parameter)    where parameter = name:sid list(type)
             else:    list(type)
type       = name:sid  typeMark  linked  [array]  [promise]
             typeMark bits 0, 1, 2 as linked; bit 3 an array of the type; bit 4 a promise of it
section    = title:sid  list(line:sid)

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
- **What a link names.** `target` is the path of the file the link's document mirrors, and `anchor` is the fragment, as the scanner read the link. The target need not be a scanned file. A link to a file outside the scan keeps its target, and the graph (section 5) shows it landing nowhere. The layout does not resolve links itself, since that would be a second implementation of the scanner's rule. It carries the scanner's reading, and says so.
- Field values the layout keeps but does not judge: the `layer` number; the archetype; the kinds, flags and qualifiers, which are words a scanner chooses; and a section's lines, which may be any strings.

### 4.4 Paths

`count` paths, front-coded, in the records' order:

```
path = shared:varint  restLength:varint  rest:restLength bytes
```

- A path's UTF-8 bytes are the first `shared` bytes of the path before it, followed by `rest`. `shared` is at most that path's length, and it must be the longest shared beginning: when `rest` is not empty, its first byte differs from the previous path's byte at `shared`.
- Each path must be a path (section 2.4), in strict path order, and equal to the path of the record at the same place (checked when the record is read).
- All the paths together are at most as long as the declared length of the strings sections, since every path is also a string. So a beginning shared over and over cannot grow the paths past the file.

The paths section is an index: it lets a reader answer by path without reading the strings or the records.

### 4.5 Wires

For each file, in order, its **outbound wires**:

```
wires = n:count  first:varint  ( gapMinusOne:varint ){n−1}
```

- The wires are the file numbers (indexes in path order) of the scanned files that the file's links name, other than itself.
- They are sorted, each named once, each smaller than the number of files and none the file's own. The first is written as itself, and each later one as its distance from the one before, less one.
- They must equal what the records give (section 5), checked as each record is read.

**Inbound wires** are not stored. They are the outbound wires turned around: file *j*'s inbound wires are the files whose outbound wires hold *j*, in path order.

### 4.6 The end

The content's name, 32 bytes (section 3.4).

## 5. The graph

The graph is what the facts say about connection. A reader that gives one gives it by these rules, which are exactly those of `deriveLiveDocGraph` in this repository's engine.

- **Each file's document** is at `docPathOf(location, path)` (section 4.1).
- **The links that make edges**, in order: each dependency with a link, then, for each symbol in order, each reference in order. For a Parameters reference, each parameter's types; otherwise its types. A type makes an edge only when it has a link.
- **An edge** carries:
  - `kind`: `re-export` for a dependency whose qualifiers hold `re-export`, otherwise `import`. For a type, its role: `returns`, `extends`, `implements`, `constraint`, or `parameter`.
  - `label`: the dependency's label or the type's name.
  - `link`, when there is one.
  - **`to` and `toSymbol`, when the link's target is a scanned file**: the target and the anchor.
  - For a type, `from`: the symbol's slug, when it has one. For a parameter, `parameter`: its name.
  - For a dependency, `typeOnly` when its qualifiers hold `type-only`, and `basis` when they hold `contract` or `configuration` (the first of the two).
- **Outbound** is the sorted set of every edge's `to` other than the file's own. **Inbound** is turned around from outbound, as in section 4.5.

The module's `graphOf` gives the graph with each object's keys in the order this repository's `index.json` prints them. On this repository's own graph, the graph read back from the layout prints byte for byte as the `index.json` it was made from (section 11).

## 6. Reading

A reader takes any bytes at all and returns facts or a refusal that says why. It never hangs and never fails in any other way. Its time and memory are bounded by the file's size: every loop is bounded by bytes already checked to be there, every count by the bytes left, and every inflation by section 3.5. There is no expression, no filter, no plugin, and no reference to anything outside the file. A reader does, in this order:

1. Check the signature.
2. Hop the frame headers from the first. For each header, check the kind and the limits of section 3.5 before reading on. Stop at the end frame.
3. Check the frames' order (section 3.3).
4. Check the end: inflate it and compare it with the name computed from the headers' hashes.
5. Inflate the head, the paths and the wires, each checked against its hash, and read them. Inbound wires are computed here.

That is enough to answer "what depends on this file", "what does it use" and "what is reachable from here", by name, without reading any strings or records. The module's `openScan` stops here. **What it has not read it has not checked.** When asked for one file's facts, it reads that file's records section and every strings and records section before it, in order, with every check below.

6. **The whole read** (`readScan`) reads every strings and records section in order:
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

**The order of arrival.** The engine owes the writer files in path order. A host whose readers finish out of order holds the early ones back until their turn: the research measured that a wait of about five hundred files costs 20 to 55 MB.

### 7.2 Going on from a stop

An unfinished file is whole up to its last frame that fits. To go on from it:

1. Keep its frames up to the **last records section of 256 files**. A last section of fewer, and a strings section after the last records, are dropped, since only the finish may write a short one.
2. Read the kept frames, each with every check of section 6, and rebuild the strings, the paths and what the links name.
3. Hand the rest of the files to a writer given that state, beginning after the last path kept.

The finished file is byte for byte the one an unstopped write gives, with the same compressor. A file already finished is refused as nothing to go on from. One that stopped before its head was whole must begin again.

## 8. The text form

One fact a line. Each line is a JSON array written by JSON's own stringifying rules, with no space and with members in the order shown, and each line ends with an LF, the last one included. Members whose value is absent are left out of objects. In the layout, an absent value and an empty list are kept apart, and the text keeps them apart the same way: a missing line, or a line holding `[]`.

```
[null,"format","fact-pack",1]                        provisional name; the layout's version
[null,"location",root,baseLayer,extension]
[null,"scanner",scanner]
[null,"left-out",reason,number,detail]               one a line, in the head's order
then for each file, in path order:
[path,"file",layer,archetype|null,generatedAt|null]
[path,"authored",authored]
[path,"entry",{"reason","symbol":{"name","link"},"command","declarer":{"label","link"}}]        each entry
[path,"symbol",{"name","slug","kind","flags","source":{"path","line"},"references","sections"}]   each symbol
    a reference is {"role","types"} or {"role":"Parameters","parameters":[{"name","types"}]}
    a type is {"name","link","target","anchor","array","promise"}; a section is {"title","body"}
[path,"dependency",{"label","link","target","anchor","symbols","qualifiers"}]                    each dependency
[path,"cited-by",[{"label","link"},…]]                present when the record's mark says so
[path,"re-exports",[{"name","slug","from":{"label","link"},"flags"},…]]                        likewise
[null,"end",numberOfFiles]
```

- `array` and `promise` are written `true` when set and left out when not.
- A reader of the text refuses any line that is not exactly the line written for what it says: another order of members, a space, `4.0` for `4`, `A` for `A`, `false` for an absent mark, an unknown member, a missing end line, or anything after it. So one set of facts has one text.
- The text holds no derived fact: no edges, no wires, no document paths. Those are the graph's.
- `grep '"target":"src/b.ts"'` finds every link that names `src/b.ts`, which is "what depends on it" by its links. `diff` of two texts is the change in the facts.

**Both ways, without loss.** Bytes → text → bytes gives the same bytes, with the same compressor. Text → bytes → text gives the same text. Both are tests (`storedForm.test.ts`) and are measured on real scans in section 11.

## 9. What a consumer owes

Every string in a scan came from someone else's files, and the scan itself may have come from anyone. The layout never interprets a string, and a reader's checks make a file well formed, never trustworthy. A consumer owes:

- **A viewer** renders every name, line and authored word as text, never as markup. An authored block holding `<script>` is shown as those characters; the fixture `everyFact` carries one. A link is not followed or fetched because a scan holds it.
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
