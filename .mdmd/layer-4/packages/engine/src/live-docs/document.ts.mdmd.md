# packages/engine/src/live-docs/document.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/document.ts
- Generated At: 2026-10-15T15:49:39.629Z

## Authored
### Purpose
The grammar of a Live Doc: the model of everything a doc says, `renderLiveDoc`, which writes it, and `parseLiveDoc`, which reads it back and refuses anything the grammar does not describe. The two are inverses, which is what lets the markdown be the store every other consumer reads.

### Notes
- Written 2026-09-27 to replace a regex parser (`parse.ts`) that recovered only symbol names, dependency links and three documentation sections, and two renderers (`markdown.ts`, `rendering.ts`) it could not round-trip. The round-trip suite under `tests/integration/live-docs` proves that rendering what was parsed gives back every committed doc byte for byte.
- A syntax error names its one-based line. Docstring bodies are kept verbatim, with fenced code blocks treated as opaque, so a heading-like line inside an example cannot start a section.
- `authoredBlockOf` is the one lenient reader: the generator uses it to carry an authored block forward from a doc written before the grammar or by hand. `symbolName` strips the parenthesised suffix a heading carries to tell two symbols of one name apart.
- The module has no imports, so the Explorer client bundles it to render a doc back from the graph. Resolving a link between docs lives in `graph.ts`.
- The `Entry` lines (2026-10-15, [Turn 4](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-4); [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)) stand between `Code Path` and `Generated At`: a reason, `program`, `command`, `module`, `opening`, `tooling` or `declared`, and its evidence, a symbol linked or bare, a command's name and its manifest, an opening. `parseEntry` refuses evidence that does not fit the reason; `entryWords` gives the CLI and the panel one wording. A test is an entry by its archetype and carries no line.

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
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L41)

##### `SymbolBlock` — Summary
One public symbol: a `####` heading, its detail lines and its documentation sections.

#### `ReferenceRole` {#symbol-referencerole}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L59)

##### `ReferenceRole` — Summary
The reference lines that list types directly; `Parameters` lists them per parameter.

#### `ReferenceLine` {#symbol-referenceline}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L62)

##### `ReferenceLine` — Summary
A line of type references on a symbol.

#### `TypeRef` {#symbol-typeref}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L67)

##### `TypeRef` — Summary
One type in a reference line: a link to the doc that declares it, or a bare name.

#### `DocSection` {#symbol-docsection}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L78)

##### `DocSection` — Summary
A `#####` documentation section under a symbol.

#### `Dependency` {#symbol-dependency}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L85)

##### `Dependency` — Summary
One line of the `Dependencies` section.

#### `EntryReason` {#symbol-entryreason}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L108)

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
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L111)

##### `Entry` — Summary
One `Entry` line of the Metadata block: the reason and its evidence.

#### `ReExport` {#symbol-reexport}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L122)

##### `ReExport` — Summary
One entry of the `Re-Exported Symbol Anchors` section.

#### `DEFAULT_AUTHORED_BLOCK` {#symbol-default_authored_block}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L148)

##### `DEFAULT_AUTHORED_BLOCK` — Summary
The authored block a new doc starts with.

#### `entryWords` {#symbol-entrywords}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L156)
- Parameters: `entry`: [`Entry`](#symbol-entry)

##### `entryWords` — Summary
An entry's reason and evidence in words, as the CLI prints them and the
Explorer shows them: "program main", "command build of package.json",
"module of packages/cli/package.json", "opening GET api/payments",
"tooling", "declared".

#### `symbolName` {#symbol-symbolname}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L176)

##### `symbolName` — Summary
The name of a symbol without the parenthesised suffix a heading carries to
tell it from another of the same name, such as `Widget (interface)` or
`parse (method overload 2)`.

#### `renderLiveDoc` {#symbol-renderlivedoc}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L185)
- Parameters: `doc`: [`LiveDoc`](#symbol-livedoc)

##### `renderLiveDoc` — Summary
Writes a Live Doc as markdown. The output always ends with one newline.

#### `renderSymbolBlocks` {#symbol-rendersymbolblocks}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L237)
- Parameters: `symbols`: [`SymbolBlock`](#symbol-symbolblock)[]

##### `renderSymbolBlocks` — Summary
Writes the body of the `Public Symbols` section: the lines between its markers.

#### `LiveDocSyntaxError` {#symbol-livedocsyntaxerror}
- Type: class
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L308)

##### `LiveDocSyntaxError` — Summary
Thrown when text is not a Live Doc. `line` is one-based.

#### `parseLiveDoc` {#symbol-parselivedoc}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L316)
- Returns: [`LiveDoc`](#symbol-livedoc)

##### `parseLiveDoc` — Summary
Reads a Live Doc back from markdown, refusing anything outside the grammar.

#### `authoredBlockOf` {#symbol-authoredblockof}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L606)

##### `authoredBlockOf` — Summary
The authored block of any text that has one, whatever else the text holds.

##### `authoredBlockOf` — Remarks
The generator uses this to carry a doc's authored block forward even when the
rest of the doc predates the grammar. It returns the default block when there
is nothing to carry.

#### `Reader` {#symbol-reader}
- Type: class
- Source: [source](../../../../../../packages/engine/src/live-docs/document.ts#L625)

##### `Reader` — Summary
Reads a text line by line for the parsers, and fails with the line number when the grammar is not met.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
