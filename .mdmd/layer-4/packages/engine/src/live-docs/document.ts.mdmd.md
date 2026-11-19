# packages/engine/src/live-docs/document.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/document.ts
- Generated At: 2026-11-19T20:24:42.908Z

## Authored
### Purpose
The grammar of a Live Doc: the model of everything a doc says, `renderLiveDoc`, which writes it, and `parseLiveDoc`, which reads it back and refuses anything the grammar does not describe. The two are inverses, which is what lets the markdown be the store every other consumer reads.

### Notes
- Written 2026-09-27 to replace a regex parser (`parse.ts`) that recovered only symbol names, dependency links and three documentation sections, and two renderers (`markdown.ts`, `rendering.ts`) it could not round-trip. The round-trip suite under `tests/integration/live-docs` proves that rendering what was parsed gives back every committed doc byte for byte.
- A syntax error names its one-based line. Docstring bodies are kept as the composer gives them, with fenced code blocks treated as opaque, so a heading-like line inside an example cannot start a section; since 2026-11-19 a line the reader would take for structure outside a fence is written with a backslash in front (below).
- `authoredBlockOf` is the one lenient reader: the generator uses it to carry an authored block forward from a doc written before the grammar or by hand. `symbolName` strips the parenthesised suffix a heading carries to tell two symbols of one name apart.
- The module has no imports, so the Explorer client bundles it to render a doc back from the graph. Resolving a link between docs lives in `graph.ts`.
- The `Entry` lines (2026-10-15, [Turn 4](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-15/2026-10-15.1.record.md#turn-4); [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)) stand between `Code Path` and `Generated At`: a reason, `program`, `command`, `module`, `opening`, `tooling` or `declared`, and its evidence, a symbol linked or bare, a command's name and its manifest, an opening. `parseEntry` refuses evidence that does not fit the reason; `entryWords` gives the CLI and the panel one wording. A test is an entry by its archetype and carries no line.
- `UNREAD_NOTE` and `UNREAD_AUTHORED_BLOCK` (2026-10-22): the note a new doc of a file no reader handles starts with, in its authored block in place of `_Pending notes_` and never in a generated region, where the owner asked for it: "a reasonable caveat to throw in the Authored section and worthy of remembering when we visit such a file again" ([Turn 8 of the October 21 session](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-21/2026-10-21.1.record.md#turn-8)). `hasMeaningfulAuthoredContent` reads it as a placeholder, so a doc holding nothing else is pruned with its file; a pass that adds a reader finds the docs to revisit by its exact words.
- `Cited By` (2026-10-22, [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#related-documents-run-both-ways-a-docs-cited-by-section-is-generated-from-the-documents-own-links-recorded-2026-10-22)): an optional generated section after `Dependencies` and before `Re-Exported Symbol Anchors`, one line per document whose links name the file, `- [\`path\`](link)`, present only when a document cites the file. The parser takes the optional sections in that order through `nextSectionIs`, so a doc without either still ends at `Dependencies`; a `Cited By` line it cannot read names its line, as the other refusals do.
- Since 2026-11-19 ([the second review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/second-review.md)) a symbol's name is written as a CommonMark code span whose fence is longer than any run of backticks in it, padded with a space where it begins or ends with a backtick or a space (`codeSpan`), and read the same way (`takeCodeSpan`), in the symbol and re-export headings, the section headings and an entry's symbol: a JSON key holding a backtick had made the generator write a doc it could not read back, which stopped a whole history.
- Later the same day ([the third review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/history-data-review/third-review.md), its fourth finding) every value a doc takes from a source file is written by one rule, `writeValue`, and read by its inverse, `takeValue`: in the slot's plain form, the form the format always wrote, where that reads back as the value, and as a JSON string anywhere else. Names (symbols, commands, types, parameters, labels) are code spans; `{"a\nb":1}` is headed `#### "a\nb"`, an empty script name is `command ""`, two lone surrogates `"\ud800"` and `"\udc00"`, while a key spelled `""` stays `` `""` ``. A plain form never begins with `"`, so the first character tells the forms apart, and the reader refuses a quoted value the plain form could carry, so each value has one form. Until then the command, declarer, type, parameter, dependency and cited-by readers each had a pattern of their own, `` `([^`]+)` `` and `[^)]+`, and threw on a script named `` a`b ``, an empty one, a key with a line break, or a folder with a parenthesis (`app/(auth)/`, Next.js's route groups); the lines are now read left to right by a `Cursor`, every value self-delimiting.
- A link is a URL reference: the composer writes a path's characters that a URL or a markdown link's target cannot hold percent-encoded (`encodeLinkPath`: `%`, `#`, `?`, parentheses, angle brackets, a backslash, a space, a control character, a line separator), so `notes/plan (draft).md` is linked as `notes/plan%20%28draft%29.md`, which a markdown viewer opens, and `graph.ts` decodes the path before the first `#` (`decodeLinkPath`). No link of this repository holds such a character, so none moved.
- A docstring line the reader would take for structure, a heading outside a fence, a section marker anywhere, or a fence no later line closes, is written with a backslash in front (`escapeBody`), which markdown shows as the line's own text; a line already behind backslashes gets one more, and `unescapeBodyLine` takes one off. A heading-like line in a docstring had thrown, and an unclosed fence had swallowed every symbol after it into one section.
- A line ends at LF or CRLF alike (`Reader`, and `authoredBlockOf`, which reads lines by LF and CRLF only so that a name holding U+2028 and `## Authored` is no heading), and since a later commit of that day at a carriage return alone too, as CommonMark ends a line, once no name could hold one unquoted: a doc saved with CR-only line endings had lost its authored words to the generator's fallback, and been deleted with its file by pruning ([the review of that day](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/names-read-back-review/README.md), its fifth finding), so a doc checked out with Windows line endings reads as the one written: a cold run that day found every command stopped at the first doc of such a checkout. The writer still writes LF and never ends a line with a carriage return of its own. A byte-order mark before the first line, which Windows PowerShell 5.1 writes whenever a file passes through it, is set aside too, and since a board is read through the same `Reader`, a board with CRLF or a mark reads as one without; until then a board with either was refused at its title. `&` is encoded in a link's path too, since CommonMark reads `&amp;` in a target as `&`, and a link's path is decoded whole, read as written where it is not well-formed, as the Explorer's reader reads one.
- A value holding a control character other than a tab, a NUL or a carriage return among them, or the line or paragraph separator U+2028 or U+2029, is quoted too (`UNWRITTEN`, the root's ruling of 2026-11-19 on the review's proposal), so that git shows and diffs a doc as text, where a NUL or a carriage return alone makes it take a file for binary, and no renderer breaks a line in the middle of a name. Such a name had read back before, so its form moved; no name of this repository holds one.
- `document.fuzz.test.ts` holds all of this to a seeded generator of hostile names through the real composer, writer and reader.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDoc` {#symbol-livedoc}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L29)

##### `LiveDoc` — Summary
A Live Doc, as written to disk: everything the file says and nothing else.

#### `SymbolBlock` {#symbol-symbolblock}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L51)

##### `SymbolBlock` — Summary
One public symbol: a `####` heading, its detail lines and its documentation sections.

#### `ReferenceRole` {#symbol-referencerole}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L69)

##### `ReferenceRole` — Summary
The reference lines that list types directly; `Parameters` lists them per parameter.

#### `ReferenceLine` {#symbol-referenceline}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L72)

##### `ReferenceLine` — Summary
A line of type references on a symbol.

#### `TypeRef` {#symbol-typeref}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L77)

##### `TypeRef` — Summary
One type in a reference line: a link to the doc that declares it, or a bare name.

#### `DocSection` {#symbol-docsection}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L88)

##### `DocSection` — Summary
A `#####` documentation section under a symbol.

#### `Dependency` {#symbol-dependency}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L95)

##### `Dependency` — Summary
One line of the `Dependencies` section.

#### `EntryReason` {#symbol-entryreason}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L118)

##### `EntryReason` — Summary
Why a file is an entry: something outside the code starts it.

- `program`: the file holds the language's program entry point.
- `command`: a manifest's script or binary runs it, by the script's or binary's name.
- `module`: a manifest's `main` names it as the package's module.
- `opening`: the file serves a route, an address, a procedure or a table that a caller outside the scan names.
- `tooling`: a tool reads it: a manifest, a compiler or runner configuration.
- `declared`: the configuration names it as an entry.

A test is an entry by its archetype and carries no line.

#### `Entry` {#symbol-entry}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L121)

##### `Entry` — Summary
One `Entry` line of the Metadata block: the reason and its evidence.

#### `CitedBy` {#symbol-citedby}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L138)

##### `CitedBy` — Summary
One line of the `Cited By` section: a document, outside the Live Docs, whose
markdown links name this file or its doc. The reverse of the links a doc's
authored words make, which the generator writes so that every reader of the
docs, the Explorer and the CLI alike, derives the same related documents
(the owner's rule of 2026-01-06, built in this direction on 2026-10-22).

#### `ReExport` {#symbol-reexport}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L146)

##### `ReExport` — Summary
One entry of the `Re-Exported Symbol Anchors` section.

#### `DEFAULT_AUTHORED_BLOCK` {#symbol-default_authored_block}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L181)

##### `DEFAULT_AUTHORED_BLOCK` — Summary
The authored block a new doc starts with.

#### `UNREAD_NOTE` {#symbol-unread_note}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L192)

##### `UNREAD_NOTE` — Summary
The note a new doc of a file no reader handles starts with, in place of
`_Pending notes_`. Its generated sections say only what was detected, and
nothing was looked for; the note says so where a person reads it, in the
authored block, since the generated regions say only what a reader found
(the owner, 2026-10-22: "a reasonable caveat to throw in the Authored
section and worthy of remembering when we visit such a file again"). Like
the pending placeholders it is not authored content of its own.

#### `UNREAD_AUTHORED_BLOCK` {#symbol-unread_authored_block}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L195)

##### `UNREAD_AUTHORED_BLOCK` — Summary
The authored block a new doc of a file no reader handles starts with: {@link DEFAULT_AUTHORED_BLOCK} with {@link UNREAD_NOTE}.

#### `entryWords` {#symbol-entrywords}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L203)
- Parameters: `entry`: [`Entry`](#symbol-entry)

##### `entryWords` — Summary
An entry's reason and evidence in words, as the CLI prints them and the
Explorer shows them: "program main", "command build of package.json",
"module of packages/cli/package.json", "opening GET api/payments",
"tooling", "declared".

#### `symbolName` {#symbol-symbolname}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L223)

##### `symbolName` — Summary
The name of a symbol without the parenthesised suffix a heading carries to
tell it from another of the same name, such as `Widget (interface)` or
`parse (method overload 2)`.

#### `codeSpan` {#symbol-codespan}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L345)

##### `codeSpan` — Summary
A name as a markdown code span that reads back as the name whatever it holds: fenced by one backtick more than its
longest run of backticks, and padded with a space on each side where it begins or ends with a backtick or a space,
as CommonMark reads a code span; a name that is all spaces is written as it is.

#### `takeCodeSpan` {#symbol-takecodespan}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L361)

##### `takeCodeSpan` — Summary
The code span that begins at `at`, as CommonMark reads one: its fence of backticks, its content up to the next run of
exactly as many, and a space stripped from each side where the content begins and ends with one and is not all
spaces; undefined where no span begins or it never closes.

#### `encodeLinkPath` {#symbol-encodelinkpath}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L393)

##### `encodeLinkPath` — Summary
A workspace path as a link's path: every character a URL or a markdown link's target cannot hold as itself
percent-encoded as UTF-8 (`notes/plan (draft).md` is `notes/plan%20%28draft%29.md`), every other as it is, so
that the link opens the file in a markdown viewer and its first `#` begins its fragment. A path of letters, digits
and `-./@_` is written as it is.

#### `decodeLinkPath` {#symbol-decodelinkpath}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L401)

##### `decodeLinkPath` — Summary
A link's path as the workspace path it names, percent-decoded as a browser reads it; a path that is not well-formed
percent-encoding is read as written, as the Explorer's reader reads one.

#### `renderLiveDoc` {#symbol-renderlivedoc}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L424)
- Parameters: `doc`: [`LiveDoc`](#symbol-livedoc)

##### `renderLiveDoc` — Summary
Writes a Live Doc as markdown. The output always ends with one newline.

#### `renderSymbolBlocks` {#symbol-rendersymbolblocks}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L481)
- Parameters: `symbols`: [`SymbolBlock`](#symbol-symbolblock)[]

##### `renderSymbolBlocks` — Summary
Writes the body of the `Public Symbols` section: the lines between its markers.

#### `LiveDocSyntaxError` {#symbol-livedocsyntaxerror}
- Type: class
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L606)

##### `LiveDocSyntaxError` — Summary
Thrown when text is not a Live Doc. `line` is one-based.

#### `parseLiveDoc` {#symbol-parselivedoc}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L614)
- Returns: [`LiveDoc`](#symbol-livedoc)

##### `parseLiveDoc` — Summary
Reads a Live Doc back from markdown, refusing anything outside the grammar.

#### `authoredBlockOf` {#symbol-authoredblockof}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L1036)

##### `authoredBlockOf` — Summary
The authored block of any text that has one, whatever else the text holds.

##### `authoredBlockOf` — Remarks
The generator uses this to carry a doc's authored block forward even when the
rest of the doc predates the grammar. It returns the default block when there
is nothing to carry.

#### `Reader` {#symbol-reader}
- Type: class
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L1063)

##### `Reader` — Summary
Reads a text line by line for the parsers, and fails with the line number when the grammar is not met. A line ends
at LF, CRLF or a carriage return alone, as CommonMark ends one, so a doc checked out with Windows line endings, or
saved by an editor that ends lines with CR, reads as the one written with LF: the writer holds no carriage return in
a line, quoting a name that has one ({@link UNWRITTEN}). A byte-order mark before the first line, which Windows
PowerShell 5.1 writes whenever a file passes through it, is set aside. A Live Doc and a board are both read here.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.agents/skills/live-documentation/reference.md`](../../../../../../.agents/skills/live-documentation/reference.md)
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-engine.mdmd.md`](../../../../../layer-3/live-documentation-engine.mdmd.md)
- [`.mdmd/layer-3/live-documentation-pipeline.mdmd.md`](../../../../../layer-3/live-documentation-pipeline.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
