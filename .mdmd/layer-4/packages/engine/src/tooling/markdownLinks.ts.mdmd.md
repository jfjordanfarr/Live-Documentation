# `packages/engine/src/tooling/markdownLinks.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/markdownLinks.ts`
- Generated At: 2026-11-19T22:40:10.857Z

## Authored
### Purpose
How a markdown link is read, by CommonMark's rule, in one place: where a link's destination begins and ends, its title, the escapes and character references in both, what is not a link because a code span, an autolink or raw HTML claims its characters first, which links a reference takes from a definition, and how a destination becomes a path. The engine reads a doc's related documents and every document's citations with it ([relatedDocs.ts](../live-docs/relatedDocs.ts.mdmd.md)), the Explorer renders prose with it ([markdown.ts](../../../explorer/src/client/markdown.ts.mdmd.md)) and the link audit checks links with it ([markdownLinks.ts](../../../../scripts/slopcop/markdownLinks.ts.mdmd.md)), so that a link the map counts is the link the reader opens and the audit checks.

### Notes
- Written 2026-11-19 ([the probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/markdown-link-targets/README.md)), after [the decision of the same day](../../../../../layer-3/architectural-decisions.mdmd.md#every-name-a-repository-can-hold-reads-back-from-its-doc-recorded-2026-11-19) made every link the generator writes read back and left the links people write by hand to three patterns that disagreed: the engine's missed a title in parentheses, nested parentheses, escapes and references to characters; the Explorer's ended a target at its first `)`, so a link the engine counted did not open; the audit's decoded with `decodeURI`, which leaves `%23` and `%3F` encoded. A cold run on public repositories the same day met names such as `Lib - Copy (2).ps1`, which Windows makes, and web frameworks name folders `(auth)`.
- Graded by CommonMark 0.31.2's own examples of the eight sections that bear on links ([the oracle](markdownLinks.commonmark.test.ts.mdmd.md)); one of 230 is read otherwise, a definition in an indented code block. The module's remarks name the three places it differs from the specification on purpose, each because it keeps no container structure of lists and block quotes: indented code blocks, fences inside containers, HTML blocks.
- It reads in two stages, as CommonMark does: the lines into paragraphs, where reference definitions stand at a paragraph's start, then each paragraph's inline text. So reference links fall out of it. At first the engine counted only inline links and images, since the Explorer renders a doc section by section and would not have opened a reference whose definition stands in another section; the same day the root ruled that a reference cites, the renderer learned to hide definition lines (`leadingDefinitions`), and the reader passes it the whole block's definitions. No markdown file of this repository, nor of four public repositories read cold the same day, holds a reference link to a relative path.
- Its work grows with the text, held by a count rather than a clock (`readingSteps`, and the renderer's `renderingSteps`): each hostile paragraph read at ten times the size takes under twelve times the steps. The first draft was quadratic in six ways an independent review measured, the worst a run of `[a](`, which took 70 s for 80 KB at a load of 27 and takes 0.28 s now. A bare destination's parentheses nest at most 32 deep, as cmark bounds them and the specification allows; a comment, instruction, declaration or CDATA section ends at a closer found by one search that reading reuses; a link deactivates earlier openers by one number; a code span's closer comes from an index of the paragraph's backtick runs; and what stands inside an image is found in one sweep.
- Pure and free of dependencies but HTML's table of named references ([htmlEntities.ts](htmlEntities.ts.mdmd.md)), so that the Explorer's page carries it. `linkPath` is the path rule the generator's links were settled on that day, the fragment set apart before percent-decoding, with the query set apart too as a browser reads it; the graph's `resolveDocLink` and the reader's `resolveReaderTarget` still decode by their own copies of the older form.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `readingSteps` {#symbol-readingsteps}
- Type: const
- Source: [source](../../../../../../packages/engine/src/tooling/markdownLinks.ts#L45)

##### `readingSteps` — Summary
How many characters and tokens the reader has looked at since it was loaded, for the test that holds its work
linear in the text: each loop that walks characters, and each search for a closer, adds what it walked. A
pattern tried at one place is counted once, since each is bounded by its own delimiters or by a closer known to
stand ahead.

#### `MarkdownLink` {#symbol-markdownlink}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/markdownLinks.ts#L48)

##### `MarkdownLink` — Summary
A link, an image or an autolink, as CommonMark reads it.

#### `MarkdownLiteral` {#symbol-markdownliteral}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/markdownLinks.ts#L73)

##### `MarkdownLiteral` — Summary
Something inline that is not a link but claims its characters before a link can.

#### `InlineToken` {#symbol-inlinetoken}
- Type: type
- Source: [source](../../../../../../packages/engine/src/tooling/markdownLinks.ts#L86)
- Returns: [`MarkdownLink`](#symbol-markdownlink), [`MarkdownLiteral`](#symbol-markdownliteral)

##### `InlineToken` — Summary
What a run of inline text holds, in the order it begins, a link's contents after the link.

#### `LinkDefinition` {#symbol-linkdefinition}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/markdownLinks.ts#L89)

##### `LinkDefinition` — Summary
A link reference definition's destination and title.

#### `LinkDefinitions` {#symbol-linkdefinitions}
- Type: type
- Source: [source](../../../../../../packages/engine/src/tooling/markdownLinks.ts#L95)
- Returns: `ReadonlyMap`

##### `LinkDefinitions` — Summary
A document's link reference definitions, by their labels as {@link normalizeLabel} gives them.

#### `MarkdownLinkReading` {#symbol-markdownlinkreading}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/markdownLinks.ts#L98)

##### `MarkdownLinkReading` — Summary
What a document's links are: every link, image and autolink, and the references whose label no definition names.

#### `readMarkdownLinks` {#symbol-readmarkdownlinks}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/markdownLinks.ts#L113)
- Returns: [`MarkdownLinkReading`](#symbol-markdownlinkreading)

##### `readMarkdownLinks` — Summary
Every link of a markdown document, by CommonMark's rule but where the module's remarks say otherwise. Offsets
are the document's own.

#### `leadingDefinitions` {#symbol-leadingdefinitions}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/markdownLinks.ts#L163)

##### `leadingDefinitions` — Summary
Where a paragraph's text goes on after the link reference definitions it begins with, which CommonMark reads as
definitions and does not show; 0 when it begins with none. Each definition is added to `definitions` unless its
label is defined already, since the first definition of a label is the one that counts.

#### `inlineTokens` {#symbol-inlinetokens}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/markdownLinks.ts#L178)
- Returns: [`InlineToken`](#symbol-inlinetoken)[]
- Parameters: `definitions`: [`LinkDefinitions`](#symbol-linkdefinitions)

##### `inlineTokens` — Summary
What one run of inline text holds, a paragraph's or a heading's: its links and what claims characters before
them, in the order they begin, with offsets into the text. A reference link needs the document's definitions.

#### `isLink` {#symbol-islink}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/markdownLinks.ts#L183)
- Parameters: `token`: [`InlineToken`](#symbol-inlinetoken)

##### `isLink` — Summary
True for a link, an image or an autolink.

#### `linkPath` {#symbol-linkpath}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/markdownLinks.ts#L193)

##### `linkPath` — Summary
The path a link's destination names, and its fragment, read as a browser reads a URL reference: the fragment
begins at the first `#` and the query at the first `?` before it, and the path before them is percent-decoded,
so that `plan%20%28draft%29.md` names `plan (draft).md` and `a%23b.md#top` the file `a#b.md` at `top`. A path
whose percent-encoding is malformed is left as written. The fragment is decoded the same way.

#### `normalizeLabel` {#symbol-normalizelabel}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/markdownLinks.ts#L205)

##### `normalizeLabel` — Summary
A label as CommonMark matches it: without its brackets, its runs of spaces, tabs and line endings one space, no
space at either end, and case folded; empty when the label holds nothing else, which no definition can name.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`htmlEntities.namedCharacterReference`](./htmlEntities.ts.mdmd.md#symbol-namedcharacterreference)
<!-- LIVE-DOC:END Dependencies -->
