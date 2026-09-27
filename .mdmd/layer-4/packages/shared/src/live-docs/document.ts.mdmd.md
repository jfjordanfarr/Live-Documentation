# packages/shared/src/live-docs/document.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/document.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-document-ts
- Generated At: 2026-09-27T22:11:41.010Z

## Authored
### Purpose
The grammar of a Live Doc: the model of everything a doc says, `renderLiveDoc`, which writes it, and `parseLiveDoc`, which reads it back and refuses anything the grammar does not describe. The two are inverses, which is what lets the markdown be the store every other consumer reads.

### Notes
- Written 2026-09-27 to replace a regex parser (`parse.ts`) that recovered only symbol names, dependency links and three documentation sections, and two renderers (`markdown.ts`, `rendering.ts`) it could not round-trip. The round-trip suite under `tests/integration/live-docs` proves that rendering what was parsed gives back every committed doc byte for byte.
- A syntax error names its one-based line. Docstring bodies are kept verbatim, with fenced code blocks treated as opaque, so a heading-like line inside an example cannot start a section.
- `authoredBlockOf` is the one lenient reader: the generator uses it to carry an authored block forward from a doc written before the grammar or by hand.
- `linkTarget` resolves a doc-relative link to the doc it names and the source file that doc mirrors; the graph and the oracle use it so that no consumer re-derives the mirror layout.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T22:11:41.010Z","inputHash":"0267619c054e176c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDoc` {#symbol-livedoc}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L25)

##### `LiveDoc` — Summary
A Live Doc, as written to disk: everything the file says and nothing else.

#### `SymbolBlock` {#symbol-symbolblock}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L45)

##### `SymbolBlock` — Summary
One public symbol: a `####` heading, its detail lines and its documentation sections.

#### `ReferenceRole` {#symbol-referencerole}
- Type: type
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L63)

##### `ReferenceRole` — Summary
The reference lines that list types directly; `Parameters` lists them per parameter.

#### `ReferenceLine` {#symbol-referenceline}
- Type: type
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L66)

##### `ReferenceLine` — Summary
A line of type references on a symbol.

#### `TypeRef` {#symbol-typeref}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L71)

##### `TypeRef` — Summary
One type in a reference line: a link to the doc that declares it, or a bare name.

#### `DocSection` {#symbol-docsection}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L82)

##### `DocSection` — Summary
A `#####` documentation section under a symbol.

#### `Dependency` {#symbol-dependency}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L89)

##### `Dependency` — Summary
One line of the `Dependencies` section.

#### `ReExport` {#symbol-reexport}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L101)

##### `ReExport` — Summary
One entry of the `Re-Exported Symbol Anchors` section.

#### `DEFAULT_AUTHORED_BLOCK` {#symbol-default_authored_block}
- Type: const
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L128)

##### `DEFAULT_AUTHORED_BLOCK` — Summary
The authored block a new doc starts with.

#### `renderLiveDoc` {#symbol-renderlivedoc}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L135)
- Parameters: `doc`: [`LiveDoc`](#symbol-livedoc)

##### `renderLiveDoc` — Summary
Writes a Live Doc as markdown. The output always ends with one newline.

#### `renderSymbolBlocks` {#symbol-rendersymbolblocks}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L167)
- Parameters: `symbols`: [`SymbolBlock`](#symbol-symbolblock)[]

##### `renderSymbolBlocks` — Summary
Writes the body of the `Public Symbols` section: the lines between its markers.

#### `LiveDocSyntaxError` {#symbol-livedocsyntaxerror}
- Type: class
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L238)

##### `LiveDocSyntaxError` — Summary
Thrown when text is not a Live Doc. `line` is one-based.

#### `parseLiveDoc` {#symbol-parselivedoc}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L246)
- Returns: [`LiveDoc`](#symbol-livedoc)

##### `parseLiveDoc` — Summary
Reads a Live Doc back from markdown, refusing anything outside the grammar.

#### `authoredBlockOf` {#symbol-authoredblockof}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L497)

##### `authoredBlockOf` — Summary
The authored block of any text that has one, whatever else the text holds.

##### `authoredBlockOf` — Remarks
The generator uses this to carry a doc's authored block forward even when the
rest of the doc predates the grammar. It returns the default block when there
is nothing to carry.

#### `LinkTarget (interface)` {#symbol-linktarget-interface}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L516)

##### `LinkTarget (interface)` — Summary
The Live Doc a link in a doc points at, and the source file that doc mirrors.

#### `linkTarget (function)` {#symbol-linktarget-function}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/document.ts#L533)
- Returns: [`LinkTarget`](#symbol-linktarget-interface)

##### `linkTarget (function)` — Summary
Resolves a doc-relative link to the Live Doc it names.

##### `linkTarget (function)` — Parameters
- `config`: The root, base layer and extension of the docs.
- `docPath`: Workspace-relative path of the doc holding the link, with forward slashes.
- `link`: The link as written, relative to the doc, with an optional `#fragment`.

##### `linkTarget (function)` — Returns
The target, or undefined when the link leaves the workspace or does not name a Live Doc.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `posix`
- [`schema.LiveDocProvenance`](./schema.ts.mdmd.md#symbol-livedocprovenance) (type-only)
<!-- LIVE-DOC:END Dependencies -->
