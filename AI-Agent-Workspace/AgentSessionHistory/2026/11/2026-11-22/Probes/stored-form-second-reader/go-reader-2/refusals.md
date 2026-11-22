# What the program refuses

Each line names one kind of input the program refuses, and the section that requires the refusal. Every refusal is printed as one line, `refused: <reason>`, and the reason names the section too. Unless a line says otherwise, `read` and `graph` refuse the same binary files, and `name` refuses the texts.

## Binary files (`read`, `graph`)

### The signature and the frames
- A file that does not begin with the 8 bytes `89 46 50 4B 0D 0A 1A 0A`, including an empty file or one shorter than 8 bytes. (3.1)
- An unfinished file: it stops before an end frame, a frame header is cut short of 45 bytes, or a frame's `storedLength` runs past the file's end. (3.3, 3.5)
- A frame whose `kind` is not 1 to 6. (3.2)
- A frame whose `rawLength` is above 67,108,864 (MAX_SECTION). (3.5)
- A frame whose `rawLength` is above `1032 × storedLength + 1024`. (3.5)
- `rawLength` summed over the frames read so far, the end's included, above `64 × file length + 1,048,576`. (3.5)
- Any byte after the end frame. (3.3)

### The order of the frames
- A first frame that is not the head. (3.3)
- A head frame whose `count` is not 0. (3.2, 3.3)
- A strings frame with `count` 0. (3.3)
- A strings frame not immediately followed by a records frame, such as two strings frames in a row. (3.3)
- A records frame whose `count` is 0 or above 256. (3.3)
- A records frame that comes after one holding fewer than 256 files, so the short one is not the last. (3.3)
- Some other frame (a second head, a misplaced end, wires before paths) standing where the paths, wires or end frame is due, or one of those frames missing. (3.3)
- A paths or wires frame whose `count` is not the number of files the records hold. (3.2, 3.3)
- An end frame whose `count` is not the number of frames before it. (3.2, 3.3)
- An end frame whose `rawLength` is not 32. (3.3)
- A strings or records `count` above its frame's `rawLength`, a paths `count` above half its `rawLength`, or a wires `count` above its `rawLength`. These are early refusals of files that would run out of bytes anyway. (2.1)

### Compression and hashes
- Stored bytes that `compress/flate` does not accept as a raw deflate stream, including a stream with no final block or one cut short. (3.2)
- Stored bytes that inflate to fewer than `rawLength` bytes. (3.2)
- Stored bytes that would inflate to more than `rawLength` bytes; inflation stops there. (3.2, 3.5)
- A whole byte after the end of the deflate stream. (3.2)
- A section whose uncompressed bytes do not have the SHA-256 in its header. (3.2)
- An end frame whose header `hash` is not the SHA-256 of the content's name computed from the headers. (3.4)
- An end section that is not the content's name, the SHA-256 of every earlier frame's hash joined in order. (3.4)

### Numbers, counts and strings (in every section)
- A varint cut short by the end of its section. (2.1)
- A varint not in its shortest form, such as `80 00`. (2.1)
- A varint whose value is above 2^32 − 1. (2.1)
- A varint that runs to a sixth byte. (2.1)
- A count larger than the bytes left in its section; a left-out count larger than a third of them. (2.1)
- A string, field or item cut short by the end of its section. (3.2)
- Any byte after a section's last item, in the head, strings, records, paths or wires. (3.2)
- A string that is not well-formed UTF-8 (an overlong form, an encoded surrogate, a code point above U+10FFFF, a byte that cannot begin or continue a sequence, a sequence cut short), in the head, the strings or the paths. (2.2)
- A mark with a bit set that the layout does not define, in the file, entry, symbol, type, doc, dependency or re-export mark. (2.1, 4.3)

### The head
- A version other than 1. (4.1)
- A `root` or `baseLayer` that is neither empty nor a path. (2.4, 4.1)
- An `extension` that holds `/`, `\` or U+0000. (4.1)

### The string table
- A string that appears twice in the string table, compared by its bytes. (4.2)
- A sid larger than the next string not yet met, so strings are not in first-met order. (4.2)
- A sid naming the next new string when no strings section before it has set that string down. (4.2)
- A string set down but not met by the end of the records section that follows it. (4.2)

### The records
- A record's `path` that is not a path. (2.4, 4.3)
- A record's `path` that is not the paths section's path at the same place. Together with the paths checks, this refuses records out of path order and repeated paths. (4.3, 4.4)
- A `target` that is not a path, whether or not it names a scanned file. (2.4, 4.3)
- A link (`symbolLink`, `declarerLink`, `sourcePath`, `link`, a cited-by's link, `fromLink`) that begins with `/`, `\`, an ASCII letter and `:`, or `file:` in any case. (2.4, 4.3)
- An entry mark with bit 1 (symbolLink) set without bit 0 (symbolName). (4.3)
- A `linked` mark with a target but no link, or an anchor but no target, in a type, a documentation reference or a dependency. (4.3)
- An entry `reason` above 5. (4.3)
- A reference `role` above 4. (4.3)
- A record whose outbound wires in the wires section are not, sorted and once each, the other scanned files its dependencies' and types' link targets land on. (4.5, 5)

### Paths (section 2.4), wherever a path is kept
- An empty path. (2.4)
- A path beginning with `/` or `\`. (2.4)
- A path beginning with an ASCII letter followed by `:`, such as `c:dir/x.ts`. (2.4)
- A path beginning with `file:` in any mix of ASCII case. (2.4)
- A path holding U+0000. (2.4)
- A path with an empty segment, such as `a//b`, or a trailing `/`. (2.4)
- A path with a `.` or `..` segment. (2.4)

### The paths section
- A `shared` longer than the path before it (for the first path, longer than 0). (4.4)
- A `shared` that is not the longest shared beginning: the rest's first byte equals the previous path's byte at `shared`. (4.4)
- The paths' bytes together above the strings frames' `rawLength` together. (4.4)
- A path not strictly after the one before it in path order, which includes a repeated path. (2.3, 4.4)
- A path that is not a path. (2.4, 4.4)

### The wires section
- A wire to a file number not below the number of files, written as itself or reached by its gaps. (4.5)
- A wire from a file to itself. (4.5)

### The text, not the file (`read` only)
- A valid file whose text would write more than `64 × file length + 1,048,576` bytes of names (see questions.md, questions 1 and 2). The text is refused and the file is not: `graph` gives the graph of the same file. (3.5)

## Text forms (`name`)

### The whole text
- An empty text. (8)
- A text that is not well-formed UTF-8. (8, 2.2)
- A text beginning with a byte-order mark. (8)
- A CR anywhere in the text, so CR LF line endings are refused. (8)
- A last line that does not end with LF. (8)

### One form of each value
- Whitespace anywhere outside a string. (8.1)
- A line that is not one JSON array, or bytes after the line's value. (8)
- Anything that is not JSON: a string not closed, a bad token, a missing `,` `:` `]` or `}`. (8)
- A number with a sign, a leading zero, a decimal point or an exponent, or above 2^32 − 1. (8.1)
- A raw control character (U+0000 to U+001F) inside a string. (8.1)
- `\/`, or any escape other than `\" \\ \b \t \n \f \r` and `\u00XX`. (8.1)
- A `\u` escape of a printable character, of a character that has a short escape (such as `\u0009`), or of anything from U+0020 up, surrogate pairs included. (8.1)
- A `\u` escape with uppercase hexadecimal, or one cut short or not hexadecimal. (8.1)
- `false` written for an absent mark, or anything other than `true` for `array` or `promise`. (8, 8.1)
- A member written twice in one object. (8)
- A member the object does not have. (8)
- A member that is always present but is missing. (8)
- A value of the wrong JSON type, such as a number for a string or an object for an array. (8)
- Members in another order, or anything else that is not byte for byte the line a reader writes for the line's facts. (8, 8.1)
- Values nested deeper than 32 levels; no line of the text form nests more than 8. (8)

### The lines in their one order
- A first line that is not exactly `[null,"format","fact-pack",1]`, including another name or another version. (8, 4.1)
- A second line that is not the location line, or a third that is not the scanner line. A line of the wrong length, or a head or end line whose first value is not null. (8)
- A text that ends before its head lines are complete. (8)
- A left-out line after the files have begun. (8)
- A line of a kind the text form does not have, or a second format, location or scanner line. (8)
- A file's line before any file line, or with a path other than that of the file line before it. (8)
- A file without exactly one authored line directly after its file line. (8)
- A file's lines out of order (entries, then symbols, then dependencies, then at most one cited-by, then at most one re-exports), or a second cited-by or re-exports line. (8)
- No end line, any line after the end line, or an end count that is not the number of files. (8)

### Facts that no writer can store
- An entry reason or reference role not among section 4.3's words, which are case-sensitive. (8, 4.3)
- Any fact the binary reader refuses, once the text's facts are written as sections. These include a path, folder, link or target that breaks section 2.4, an extension holding `/`, `\` or U+0000, files out of strict path order or repeated, a target without a link, and an anchor without a target. (8, 2.4, 4.1, 4.3)
- A section that would exceed 67,108,864 bytes uncompressed (see questions.md, question 15). (3.5, 8)

## Neither

- A file that cannot be opened or read is answered `refused: cannot read the file: …`. An unknown mode or a wrong number of arguments is not an answer: it gets a usage message on standard error and exit status 2.
