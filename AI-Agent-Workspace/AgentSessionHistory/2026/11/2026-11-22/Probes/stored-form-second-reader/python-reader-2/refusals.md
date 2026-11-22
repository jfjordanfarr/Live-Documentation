# What reader.py refuses

One kind of refusal a line, with the section that requires it. Files of each
kind, built by `tests/make_cases.py`, are in `tests/refuse/` and listed in
`tests/refuse/CASES.tsv`. Run `tests/run_refusals.py` to check them all.

## Binary files (`read`, `graph`)

### The container
- A file that does not begin with `89 46 50 4B 0D 0A 1A 0A`, including an empty or shorter file — 3.1
- An unfinished file: it stops before an end frame, or a frame header is cut short — 3.3
- An unfinished file: a frame's `storedLength` runs past the file's end — 3.5, 3.3
- A byte after the end frame — 3.3
- A frame kind other than 1 to 6 — 3.2
- A `rawLength` above 64 MiB (`MAX_SECTION`) — 3.5
- A `rawLength` above `1032 × storedLength + 1024` — 3.5
- Sections whose `rawLength`s add up (end included) to more than `64 × file length + 1,048,576` — 3.5
- Stored bytes that are not a raw deflate stream, as refused by the inflater (zlib), including a zlib- or gzip-wrapped stream — 3.2
- A deflate stream that does not reach its end (cut short) — 3.2
- A whole byte after the end of the deflate stream — 3.2
- A stream that inflates to more than `rawLength` (inflation stops and refuses) — 3.5
- A stream that inflates to fewer than `rawLength` bytes — 3.2
- A section whose SHA-256 is not its header's `hash` — 3.2
### The order of frames
- A first frame that is not the head — 3.3
- A head whose `count` is not 0 — 3.3
- A second head, or any frame out of `head (strings? records)* paths wires end` — 3.3
- Frames that do not end with paths, then wires, then end — 3.3
- A strings frame not immediately before a records frame — 3.3
- A strings frame with a `count` of 0 — 3.3
- A records frame of 0 files or of more than 256 — 3.3
- A records frame of fewer than 256 files that is not the last — 3.3
- A paths or wires `count` other than the number of files the records hold — 3.3
- An end `count` other than the number of frames before it — 3.3
- An end `rawLength` other than 32 — 3.3
- A strings, records or wires `count` above its section's `rawLength`, or a paths `count` above half of it (the early refusal) — 2.1
### The end and the content's name
- An end header `hash` that is not SHA-256 of the name computed from the headers (the early check) — 3.4
- An end whose inflated 32 bytes are not the content's name — 3.4
### Numbers, counts and strings, in every section
- A varint not in its shortest form (a last byte of 0 after an earlier byte) — 2.1
- A varint of more than five bytes — 2.1
- A varint above 2^32 − 1 — 2.1
- A varint cut short by its section's end — 2.1
- A count larger than the bytes left in its section (and a left-out count above a third of them) — 2.1
- A text length that runs past its section — 2.2
- A section that ends inside an item (a record, an entry, a symbol, a path, the head) — 3.2, 4.3
- A byte after a section's last item (head, strings, records, paths, wires) — 3.2
- A string that is not well-formed UTF-8: an overlong form, an encoded surrogate, a code point above U+10FFFF, a byte that cannot begin or continue a sequence, a sequence cut short — 2.2
### The head
- A version other than 1, or a head too short to hold one — 4.1
- A `root` or `baseLayer` that is neither empty nor a path (as below) — 2.4, 4.1
- An `extension` holding `/`, `\` or U+0000 — 4.1
### Paths (a file's path in the records or the paths section, a `target`, a non-empty `root` or `baseLayer`)
- An empty path — 2.4
- A path beginning with `/` or `\` — 2.4
- A path beginning with an ASCII letter and `:` (a drive, such as `c:dir/x.ts`) — 2.4
- A path beginning with `file:` in any mix of ASCII case — 2.4
- A path holding U+0000 — 2.4
- A path with an empty, `.` or `..` segment (`a//b`, `a/`, `./x`, `../x`) — 2.4
### Links (`symbolLink`, `declarerLink`, `sourcePath`, `link`, the cited-by link, `fromLink`)
- A link beginning with `/` or `\` — 2.4
- A link beginning with an ASCII letter and `:` (such as `c:foo`) — 2.4
- A link beginning with `file:` in any mix of ASCII case — 2.4
### The string table
- A string that appears twice across the strings sections — 4.2
- Fewer texts in a strings section than its `count` — 4.2
- A sid larger than the next string not yet met — 4.2
- A sid that is the next not yet met but names no string set down before these records — 4.2
- A records section after which some string set down is never met (a string nobody names) — 4.2
### Records
- A mark with a bit the layout does not define: file (bits 4+), entry (4+), symbol (2+), type (5+), documentation reference (4+), dependency (4+), re-export (2+) — 2.1, 4.3
- An entry's symbol link without its symbol name (entry mark bit 1 without bit 0) — 4.3
- A target without a link, or an anchor without a target (linked bits 1 or 2 without the one before) — 4.3
- An entry reason above 5 — 4.3
- A reference role above 4 — 4.3
- A record whose path is not after the one before it in path order (out of order, or repeated) — 4.3
- A record whose path is not the paths section's path at the same place — 4.4
- Fewer or more records than the records frame's `count` — 4.3
### The paths section
- A `shared` longer than the path before it (for the first path, any `shared` above 0) — 4.4
- A path not front-coded with the longest shared beginning — 4.4
- Paths not in strict path order (by UTF-8 bytes), or a path repeated — 4.4, 2.3
- Paths whose bytes together exceed the sum of the strings frames' `rawLength` — 4.4
### The wires section
- A wire to a file number not below the number of files (including one reached by a gap) — 4.5
- A wire from a file to itself — 4.5
- A file's wires other than the targets of its dependencies' and types' links that are files of the scan, sorted, each once and none its own; for example a wire made from a documentation reference, or one left out — 4.5, 5

## Text forms (`name`)

### The text as a whole
- An empty text — 8
- A text beginning with a byte-order mark — 8
- A text that is not well-formed UTF-8 — 8, 2.2
- A CR anywhere — 8
- A last line not ending with LF — 8
- No end line, or any line after the end line — 8
- A text that stops before its format, location and scanner lines — 8
### Each line
- A line that is not one JSON value (including an empty line or a raw control character in a string) — 8
- A line nested too deep for the parser (no valid line nests more than seven deep) — 8
- A line that is not an array of a subject and a kind — 8
- A line of a kind the text does not have — 8
- A member written twice in an object — 8
- A member the object does not have, or an always-present member left out — 8
- A value of the wrong type (a string for a number, `null` for an absent member, `"true"` for `true`) — 8
- `false` or any value but `true` for `array` or `promise` — 8, 8.1
- A number that is not a whole number from 0 to 2^32 − 1 (`4.0`, `4e0`, `-2`, `4294967296`), and `NaN` or `Infinity` — 8.1
- Any form other than the one of 8.1: whitespace between tokens, a leading zero, members in another order, a `\u` escape of a printable character, `\/`, uppercase hex, `\u0009` for `\t`, a pair of `\u` surrogate escapes for a code point above U+FFFF — 8.1
- A lone surrogate, escaped as `\ud800` — 2.2
### The order of lines
- A first line that is not `[null,"format","fact-pack",1]`, or a version other than 1 — 8, 4.1
- A second line that is not the location line, or a third that is not the scanner line — 8
- A left-out line after a file's lines — 8
- A file's line before its file line, or among another file's lines — 8
- A file without its authored line, or a file line given twice — 8
- A file's lines out of their order (file, authored, entries, symbols, dependencies, cited-by, re-exports), or two authored, cited-by or re-exports lines — 8
- An end count other than the number of files — 8
### The facts
- Any fact that a binary file would be refused for, found by setting the text down as sections and reading them back: bad paths, links and folders, an extension holding `/`, `\` or U+0000, files out of strict path order (including UTF-16 code-unit order) or repeated — 8, 2.3, 2.4, 4.1, 4.3
- An entry reason or reference role that is not a word of 4.3, in its exact case — 8, 4.3
- A target without a link, or an anchor without a target — 8
- An entry's symbol without its name, or a declarer or origin without its label or link — 8
- Facts needing a section longer than 64 MiB, which no writer can store — 8, 3.5

## Arguments
- An unreadable file (missing, a directory, no permission) — not the specification: the program cannot read it
- A mode other than `read`, `name`, `graph`, or a wrong number of arguments — not the specification: usage
