# packages/shared/src/live-docs/document.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/document.ts
- Generated At: 2026-09-28T00:41:40.454Z

## Authored
### Purpose
The grammar of a Live Doc: the model of everything a doc says, `renderLiveDoc`, which writes it, and `parseLiveDoc`, which reads it back and refuses anything the grammar does not describe. The two are inverses, which is what lets the markdown be the store every other consumer reads.

### Notes
- Written 2026-09-27 to replace a regex parser (`parse.ts`) that recovered only symbol names, dependency links and three documentation sections, and two renderers (`markdown.ts`, `rendering.ts`) it could not round-trip. The round-trip suite under `tests/integration/live-docs` proves that rendering what was parsed gives back every committed doc byte for byte.
- A syntax error names its one-based line. Docstring bodies are kept verbatim, with fenced code blocks treated as opaque, so a heading-like line inside an example cannot start a section.
- `authoredBlockOf` is the one lenient reader: the generator uses it to carry an authored block forward from a doc written before the grammar or by hand. `symbolName` strips the parenthesised suffix a heading carries to tell two symbols of one name apart.
- The module has no imports, so the Explorer client bundles it to render a doc back from the graph. Resolving a link between docs lives in `graph.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDoc` {#symbol-livedoc}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L21)

##### `LiveDoc` — Summary
A Live Doc, as written to disk: everything the file says and nothing else.

#### `SymbolBlock` {#symbol-symbolblock}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L39)

##### `SymbolBlock` — Summary
One public symbol: a `####` heading, its detail lines and its documentation sections.

#### `ReferenceRole` {#symbol-referencerole}
- Type: type
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L57)

##### `ReferenceRole` — Summary
The reference lines that list types directly; `Parameters` lists them per parameter.

#### `ReferenceLine` {#symbol-referenceline}
- Type: type
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L60)

##### `ReferenceLine` — Summary
A line of type references on a symbol.

#### `TypeRef` {#symbol-typeref}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L65)

##### `TypeRef` — Summary
One type in a reference line: a link to the doc that declares it, or a bare name.

#### `DocSection` {#symbol-docsection}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L76)

##### `DocSection` — Summary
A `#####` documentation section under a symbol.

#### `Dependency` {#symbol-dependency}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L83)

##### `Dependency` — Summary
One line of the `Dependencies` section.

#### `ReExport` {#symbol-reexport}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L95)

##### `ReExport` — Summary
One entry of the `Re-Exported Symbol Anchors` section.

#### `DEFAULT_AUTHORED_BLOCK` {#symbol-default_authored_block}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L121)

##### `DEFAULT_AUTHORED_BLOCK` — Summary
The authored block a new doc starts with.

#### `symbolName` {#symbol-symbolname}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L128)

##### `symbolName` — Summary
The name of a symbol without the parenthesised suffix a heading carries to
tell it from another of the same name, such as `Widget (interface)` or
`parse (method overload 2)`.

#### `renderLiveDoc` {#symbol-renderlivedoc}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L137)
- Parameters: `doc`: [`LiveDoc`](#symbol-livedoc)

##### `renderLiveDoc` — Summary
Writes a Live Doc as markdown. The output always ends with one newline.

#### `renderSymbolBlocks` {#symbol-rendersymbolblocks}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L165)
- Parameters: `symbols`: [`SymbolBlock`](#symbol-symbolblock)[]

##### `renderSymbolBlocks` — Summary
Writes the body of the `Public Symbols` section: the lines between its markers.

#### `LiveDocSyntaxError` {#symbol-livedocsyntaxerror}
- Type: class
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L236)

##### `LiveDocSyntaxError` — Summary
Thrown when text is not a Live Doc. `line` is one-based.

#### `parseLiveDoc` {#symbol-parselivedoc}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L244)
- Returns: [`LiveDoc`](#symbol-livedoc)

##### `parseLiveDoc` — Summary
Reads a Live Doc back from markdown, refusing anything outside the grammar.

#### `authoredBlockOf` {#symbol-authoredblockof}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L484)

##### `authoredBlockOf` — Summary
The authored block of any text that has one, whatever else the text holds.

##### `authoredBlockOf` — Remarks
The generator uses this to carry a doc's authored block forward even when the
rest of the doc predates the grammar. It returns the default block when there
is nothing to carry.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
