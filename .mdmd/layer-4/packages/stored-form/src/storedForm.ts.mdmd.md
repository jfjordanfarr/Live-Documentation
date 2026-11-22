# `packages/stored-form/src/storedForm.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/stored-form/src/storedForm.ts`
- Entry: module of [`packages/stored-form/package.json`](../package.json.mdmd.md)
- Generated At: 2026-11-22T05:38:30.573Z

## Authored
### Purpose
The stored form of a scan's facts, the whole of it in one module that imports nothing: a binary layout written as facts arrive one file at a time in path order and resumable after a stop; a reader that, for any bytes at all, returns facts or a refusal that says why, in time and memory bounded by the file's size; a text form of one fact a line that converts both ways without loss; and the graph the facts describe, edges and wires both ways, which prints as today's `index.json` does.

### Notes
A proposal of 2026-11-22, built from [the research of 2026-11-21](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Research/stored-form/README.md) (its resumable, self-naming "press") for [the work item](../../../../../AI-Agent-Workspace/Work/tool-arrives-on-windows.md#a-scans-facts-in-one-stored-form-written-by-either-host); [its record](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/stored-form-module/README.md). [The specification](../../../../layer-3/stored-form.mdmd.md) is what the layout means, and this code must agree with it. The signature, the text form's first line and the names are provisional. Its edge listing, and since 2026-11-22 its documentation relation, repeat the engine's `deriveLiveDocGraph` (measured equal on three corpora); when the two are wired, one of them goes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Location` {#symbol-location}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L29)

##### `Location` — Summary
Where a scan's documents are, relative to the scanned folder, and what they are named.

#### `LeftOut` {#symbol-leftout}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L36)

##### `LeftOut` — Summary
One kind of thing the scan left out: why, how many, and a detail such as the patterns that left them out.

#### `ScanHead` {#symbol-scanhead}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L43)

##### `ScanHead` — Summary
What a scan says of itself: where its documents are, what made it, and what it left out.

#### `EntryReason` {#symbol-entryreason}
- Type: type
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L51)

##### `EntryReason` — Summary
Why something outside the code starts a file.

#### `StoredEntry` {#symbol-storedentry}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L54)

##### `StoredEntry` — Summary
One reason a file is an entry, with its evidence.

#### `StoredType` {#symbol-storedtype}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L65)

##### `StoredType` — Summary
One type named on a symbol. A type with a link carries what the link names: the scanned path (`target`) and the
symbol's anchor on it (`anchor`), as the scanner read the link. Whether that path was scanned is the graph's to say.

#### `ReferenceRole` {#symbol-referencerole}
- Type: type
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L75)

##### `ReferenceRole` — Summary
The roles of a reference line that list types directly.

#### `StoredReference` {#symbol-storedreference}
- Type: type
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L78)

##### `StoredReference` — Summary
A line of type references on a symbol.

#### `StoredSymbol` {#symbol-storedsymbol}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L83)

##### `StoredSymbol` — Summary
A public symbol, its references and its documentation sections.

#### `StoredDocumentation` {#symbol-storeddocumentation}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L100)

##### `StoredDocumentation` — Summary
One reference a symbol's documentation makes, as the scanner read it.

#### `StoredDependency` {#symbol-storeddependency}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L109)

##### `StoredDependency` — Summary
One dependency line: a label, and for a workspace file the link and what it names.

#### `StoredReExport` {#symbol-storedreexport}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L119)

##### `StoredReExport` — Summary
One re-exported symbol.

#### `StoredFile` {#symbol-storedfile}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L127)

##### `StoredFile` — Summary
One scanned file's facts.

#### `Scan` {#symbol-scan}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L143)

##### `Scan` — Summary
A whole scan: its head and its files in path order.

#### `Result` {#symbol-result}
- Type: type
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L149)

##### `Result` — Summary
The answer of a reader: facts, or a refusal that says why.

#### `SIGNATURE` {#symbol-signature}
- Type: const
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L159)

##### `SIGNATURE` — Summary
The file's first eight bytes. Provisional: a door that closes at a first release, the owner's to settle. Shaped as
PNG's is, so that a transfer that changes line endings or drops the high bit is caught at the first byte.

#### `LAYOUT_VERSION` {#symbol-layout_version}
- Type: const
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L162)

##### `LAYOUT_VERSION` — Summary
The layout's version, written in the head; a reader refuses any other.

#### `CHUNK` {#symbol-chunk}
- Type: const
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L165)

##### `CHUNK` — Summary
Files per section of records.

#### `MAX_SECTION` {#symbol-max_section}
- Type: const
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L168)

##### `MAX_SECTION` — Summary
The most bytes one section may inflate to. A writer refuses facts that would need more.

#### `inflationBound` {#symbol-inflationbound}
- Type: function
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L179)

##### `inflationBound` — Summary
The most bytes a whole file's sections may inflate to, by the file's size: 64 times it, and a mebibyte. Every fact a
reader builds takes at least one of those bytes, so this bounds what reading costs by the file's size. Real scans
inflate about four times (the measurements beside the specification).

#### `Refusal` {#symbol-refusal}
- Type: class
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L202)

##### `Refusal` — Summary
Why bytes or text were refused, or facts could not be stored. Thrown inside; returned as a {@link Result}.

#### `comparePaths` {#symbol-comparepaths}
- Type: function
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L484)

##### `comparePaths` — Summary
The order paths are kept in: by their UTF-8 bytes, which is the order of their code points, and the order a reader in
any language gets by comparing bytes (as git orders a tree). Computed on UTF-16 units without encoding: at the first
unit that differs, a surrogate (a code point above U+FFFF) sorts after every other unit, which it does not by value
alone against U+E000 to U+FFFF. Strings are well formed, so a surrogate here is always half of a pair.

#### `ResumeState` {#symbol-resumestate}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1067)

##### `ResumeState` — Summary
What a writer needs to go on from a stopped write: found by {@link resumeFrom}.

#### `Writer` {#symbol-writer}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1079)

##### `Writer` — Summary
A writer of one scan, handed its files one at a time in path order.

#### `createWriter` {#symbol-createwriter}
- Type: function
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1093)
- Returns: [`Writer`](#symbol-writer)
- Parameters: `head`: [`ScanHead`](#symbol-scanhead)

##### `createWriter` — Summary
A writer of one scan. `onBytes` is handed every piece of the file as it is set down, the signature first, so that
a host can keep it as it goes (a file appended to, a store in the page); the pieces in order are the file. Given
`resume`, it goes on from what a stopped write left, and hands on only what it adds.

#### `writeScan` {#symbol-writescan}
- Type: function
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1184)
- Parameters: `scan`: [`Scan`](#symbol-scan)

##### `writeScan` — Summary
Writes a whole scan at once: the same bytes as its files handed to {@link createWriter} one by one.

#### `resumeFrom` {#symbol-resumefrom}
- Type: function
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1196)

##### `resumeFrom` — Summary
What a stopped write left whole: every frame up to the last full section of records, the strings, paths and targets
it holds, and so where a writer goes on. A file already finished is refused, as is anything not a prefix of one.

#### `OpenedScan` {#symbol-openedscan}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1297)

##### `OpenedScan` — Summary
A scan opened for questions: the paths and the wires read, each file's facts read when asked for.

#### `openScan` {#symbol-openscan}
- Type: function
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1316)

##### `openScan` — Summary
Opens a finished scan by reading its head, its paths and its wires, each checked against its hash, and every
section's header. What it has not read it has not checked: {@link readScan} reads and checks the whole.

#### `readScan` {#symbol-readscan}
- Type: function
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1397)

##### `readScan` — Summary
Reads and checks a whole scan: every section against its hash, every fact, and every derived section against what it derives from.

#### `TEXT_FORMAT` {#symbol-text_format}
- Type: const
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1411)

##### `TEXT_FORMAT` — Summary
The text form's first line names the layout: provisional, as {@link SIGNATURE} is.

#### `textOfScan` {#symbol-textofscan}
- Type: function
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1503)
- Parameters: `scan`: [`Scan`](#symbol-scan)

##### `textOfScan` — Summary
The text form of a scan: one fact a line, each line a JSON array, the head first and the end last.

#### `textOf` {#symbol-textof}
- Type: function
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1512)

##### `textOf` — Summary
The text form of a stored scan's bytes: read and checked whole first, then written line by line and counted as it is
written. A text longer than the file's inflation bound is refused (section 3.5): a name held once can be written many
times, so a small file can have a very long text.

#### `scanOfText` {#symbol-scanoftext}
- Type: function
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1525)
- Returns: [`Result`](#symbol-result)

##### `scanOfText` — Summary
Reads the text form back into a scan. Each line must be exactly the line {@link textOfScan} writes for what it
says, so that one set of facts has one text, as it has one layout. Given bytes, they must be UTF-8 without a
byte-order mark, decoded strictly; given a string, it is taken as those bytes decoded.

#### `bytesOfText` {#symbol-bytesoftext}
- Type: function
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1655)

##### `bytesOfText` — Summary
Reads the text form and writes its layout: the bytes {@link textOf} came from, when it came from bytes.

#### `EdgeKind` {#symbol-edgekind}
- Type: type
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1665)

##### `EdgeKind` — Summary
How an edge arose.

#### `GraphEdge` {#symbol-graphedge}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1668)

##### `GraphEdge` — Summary
One reference a file makes, with the scanned file it lands on, if any.

#### `GraphFile` {#symbol-graphfile}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1681)

##### `GraphFile` — Summary
One file of the graph: its facts without what its links name, and its edges and wires.

#### `DocumentationEdge` {#symbol-documentationedge}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1706)

##### `DocumentationEdge` — Summary
One reference a symbol's documentation makes to a scanned file: the author's word that the two are related, which
is not a use, so that nothing that follows the edges or the wires follows it.

#### `Graph` {#symbol-graph}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1716)
- Extends: [`Location`](#symbol-location)

##### `Graph` — Summary
The graph of a scan: its location and every file keyed by path, in path order.

#### `docPathOf` {#symbol-docpathof}
- Type: function
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1723)
- Parameters: `location`: [`Location`](#symbol-location)

##### `docPathOf` — Summary
Where a file's document is: the location's root, its base layer, and the path with the extension.

#### `GraphView` {#symbol-graphview}
- Type: interface
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1736)
- Extends: [`Location`](#symbol-location)

##### `GraphView` — Summary
The graph of a scan, each file's part built only when it is asked for.

#### `graphViewOf` {#symbol-graphviewof}
- Type: function
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1749)
- Returns: [`GraphView`](#symbol-graphview)
- Parameters: `scan`: [`Scan`](#symbol-scan)

##### `graphViewOf` — Summary
The graph the facts describe, by section 5 of the specification, each file's part built only when a consumer asks
for it. What every file's part needs of the others, the files that land on it and the files whose documentation
names it, is gathered first, in one pass over the targets alone; a file's edges, its symbols written plainly and the
rest wait until it is asked for. A link lands on a file when what it names was scanned.

#### `graphOf` {#symbol-graphof}
- Type: function
- Source: [source](../../../../../packages/stored-form/src/storedForm.ts#L1878)
- Returns: [`Graph`](#symbol-graph)
- Parameters: `scan`: [`Scan`](#symbol-scan)

##### `graphOf` — Summary
The whole graph the facts describe, every file's part built: {@link graphViewOf} asked for each file in turn.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
