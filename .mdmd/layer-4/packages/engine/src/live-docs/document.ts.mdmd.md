# packages/engine/src/live-docs/document.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/document.ts
- Generated At: 2026-10-22T16:47:52.870Z

## Authored
### Purpose
The grammar of a Live Doc: the model of everything a doc says, `renderLiveDoc`, which writes it, and `parseLiveDoc`, which reads it back and refuses anything the grammar does not describe. The two are inverses, which is what lets the markdown be the store every other consumer reads.

### Notes
- Written 2026-09-27 to replace a regex parser (`parse.ts`) that recovered only symbol names, dependency links and three documentation sections, and two renderers (`markdown.ts`, `rendering.ts`) it could not round-trip. The round-trip suite under `tests/integration/live-docs` proves that rendering what was parsed gives back every committed doc byte for byte.
- A syntax error names its one-based line. Docstring bodies are kept verbatim, with fenced code blocks treated as opaque, so a heading-like line inside an example cannot start a section.
- `authoredBlockOf` is the one lenient reader: the generator uses it to carry an authored block forward from a doc written before the grammar or by hand. `symbolName` strips the parenthesised suffix a heading carries to tell two symbols of one name apart.
- The module has no imports, so the Explorer client bundles it to render a doc back from the graph. Resolving a link between docs lives in `graph.ts`.
- The `Entry` lines (2026-10-15, [Turn 4](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-4); [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)) stand between `Code Path` and `Generated At`: a reason, `program`, `command`, `module`, `opening`, `tooling` or `declared`, and its evidence, a symbol linked or bare, a command's name and its manifest, an opening. `parseEntry` refuses evidence that does not fit the reason; `entryWords` gives the CLI and the panel one wording. A test is an entry by its archetype and carries no line.
- `UNREAD_NOTE` and `UNREAD_AUTHORED_BLOCK` (2026-10-22): the note a new doc of a file no reader handles starts with, in its authored block in place of `_Pending notes_` and never in a generated region, where the owner asked for it: "a reasonable caveat to throw in the Authored section and worthy of remembering when we visit such a file again" ([Turn 8 of the October 21 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)). `hasMeaningfulAuthoredContent` reads it as a placeholder, so a doc holding nothing else is pruned with its file; a pass that adds a reader finds the docs to revisit by its exact words.
- `Cited By` (2026-10-22, [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#related-documents-run-both-ways-a-docs-cited-by-section-is-generated-from-the-documents-own-links-recorded-2026-10-22)): an optional generated section after `Dependencies` and before `Re-Exported Symbol Anchors`, one line per document whose links name the file, `- [\`path\`](link)`, present only when a document cites the file. The parser takes the optional sections in that order through `nextSectionIs`, so a doc without either still ends at `Dependencies`; a `Cited By` line it cannot read names its line, as the other refusals do.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDoc` {#symbol-livedoc}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L21)

##### `LiveDoc` — Summary
A Live Doc, as written to disk: everything the file says and nothing else.

#### `SymbolBlock` {#symbol-symbolblock}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L43)

##### `SymbolBlock` — Summary
One public symbol: a `####` heading, its detail lines and its documentation sections.

#### `ReferenceRole` {#symbol-referencerole}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L61)

##### `ReferenceRole` — Summary
The reference lines that list types directly; `Parameters` lists them per parameter.

#### `ReferenceLine` {#symbol-referenceline}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L64)

##### `ReferenceLine` — Summary
A line of type references on a symbol.

#### `TypeRef` {#symbol-typeref}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L69)

##### `TypeRef` — Summary
One type in a reference line: a link to the doc that declares it, or a bare name.

#### `DocSection` {#symbol-docsection}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L80)

##### `DocSection` — Summary
A `#####` documentation section under a symbol.

#### `Dependency` {#symbol-dependency}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L87)

##### `Dependency` — Summary
One line of the `Dependencies` section.

#### `EntryReason` {#symbol-entryreason}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L110)

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
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L113)

##### `Entry` — Summary
One `Entry` line of the Metadata block: the reason and its evidence.

#### `CitedBy` {#symbol-citedby}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L130)

##### `CitedBy` — Summary
One line of the `Cited By` section: a document, outside the Live Docs, whose
markdown links name this file or its doc. The reverse of the links a doc's
authored words make, which the generator writes so that every reader of the
docs, the Explorer and the CLI alike, derives the same related documents
(the owner's rule of 2026-01-06, built in this direction on 2026-10-22).

#### `ReExport` {#symbol-reexport}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L138)

##### `ReExport` — Summary
One entry of the `Re-Exported Symbol Anchors` section.

#### `DEFAULT_AUTHORED_BLOCK` {#symbol-default_authored_block}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L165)

##### `DEFAULT_AUTHORED_BLOCK` — Summary
The authored block a new doc starts with.

#### `UNREAD_NOTE` {#symbol-unread_note}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L176)

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
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L179)

##### `UNREAD_AUTHORED_BLOCK` — Summary
The authored block a new doc of a file no reader handles starts with: {@link DEFAULT_AUTHORED_BLOCK} with {@link UNREAD_NOTE}.

#### `entryWords` {#symbol-entrywords}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L187)
- Parameters: `entry`: [`Entry`](#symbol-entry)

##### `entryWords` — Summary
An entry's reason and evidence in words, as the CLI prints them and the
Explorer shows them: "program main", "command build of package.json",
"module of packages/cli/package.json", "opening GET api/payments",
"tooling", "declared".

#### `symbolName` {#symbol-symbolname}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L207)

##### `symbolName` — Summary
The name of a symbol without the parenthesised suffix a heading carries to
tell it from another of the same name, such as `Widget (interface)` or
`parse (method overload 2)`.

#### `renderLiveDoc` {#symbol-renderlivedoc}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L216)
- Parameters: `doc`: [`LiveDoc`](#symbol-livedoc)

##### `renderLiveDoc` — Summary
Writes a Live Doc as markdown. The output always ends with one newline.

#### `renderSymbolBlocks` {#symbol-rendersymbolblocks}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L272)
- Parameters: `symbols`: [`SymbolBlock`](#symbol-symbolblock)[]

##### `renderSymbolBlocks` — Summary
Writes the body of the `Public Symbols` section: the lines between its markers.

#### `LiveDocSyntaxError` {#symbol-livedocsyntaxerror}
- Type: class
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L347)

##### `LiveDocSyntaxError` — Summary
Thrown when text is not a Live Doc. `line` is one-based.

#### `parseLiveDoc` {#symbol-parselivedoc}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L355)
- Returns: [`LiveDoc`](#symbol-livedoc)

##### `parseLiveDoc` — Summary
Reads a Live Doc back from markdown, refusing anything outside the grammar.

#### `authoredBlockOf` {#symbol-authoredblockof}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L663)

##### `authoredBlockOf` — Summary
The authored block of any text that has one, whatever else the text holds.

##### `authoredBlockOf` — Remarks
The generator uses this to carry a doc's authored block forward even when the
rest of the doc predates the grammar. It returns the default block when there
is nothing to carry.

#### `Reader` {#symbol-reader}
- Type: class
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L682)

##### `Reader` — Summary
Reads a text line by line for the parsers, and fails with the line number when the grammar is not met.
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
