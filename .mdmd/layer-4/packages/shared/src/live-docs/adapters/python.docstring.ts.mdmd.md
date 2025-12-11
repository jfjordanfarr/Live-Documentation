# packages/shared/src/live-docs/adapters/python.docstring.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/python.docstring.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-python-docstring-ts
- Generated At: 2025-12-11T01:40:49.482Z

## Authored
### Purpose
Parses Python docstrings into structured `SymbolDocumentation` objects, supporting three major conventions: **reStructuredText** (`:param:`, `:returns:`), **Google-style** (`Args:`, `Returns:`), and **NumPy-style** (underlined section headers). Extracted from `python.ts` on 2025-12-10 to reduce that file below the 1000-line threshold.

### Notes
- **Extraction Context:** This module was extracted as part of a P0 "Large File Refactoring" task identified during trajectory analysis. The original `python.ts` (1145 lines) exceeded the 1000-line threshold that ensures reliable LLM tool edits.
- **Format Detection:** The parser auto-detects docstring format by scanning for section headers (Google: `Args:`, NumPy: underlined `Parameters`) and falls back to reST field parsing.
- **State Accumulator Pattern:** Uses `MutableDocstringState` to collect parsed fragments, then assembles into immutable `SymbolDocumentation` at the end.
- **Companion Tests:** See [python.docstring.unit.test.ts](./python.docstring.unit.test.ts.mdmd.md) for 65 unit tests covering all three docstring formats and edge cases.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T01:40:49.482Z","inputHash":"d54a734ecf886e83"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MutableDocstringState` {#symbol-mutabledocstringstate}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L26)

##### `MutableDocstringState` — Summary
Mutable state accumulated during docstring parsing.
Used internally to collect documentation fragments before final assembly.

#### `createEmptyDocstringState` {#symbol-createemptydocstringstate}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L41)
- Returns: [`MutableDocstringState`](#symbol-mutabledocstringstate)

##### `createEmptyDocstringState` — Summary
Creates an empty mutable docstring state for accumulating parsed content.

#### `parseDocstring` {#symbol-parsedocstring}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L64)
- Returns: [`SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation)

##### `parseDocstring` — Summary
Parses a Python docstring into structured documentation.

Recognizes reStructuredText, Google, and NumPy-style docstring conventions,
extracting summary, parameters, return values, exceptions, examples, and links.

##### `parseDocstring` — Parameters
- `docstring`: The raw docstring text (without surrounding triple quotes)

##### `parseDocstring` — Returns
Structured documentation object

#### `extractDocstringSummary` {#symbol-extractdocstringsummary}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L166)

##### `extractDocstringSummary` — Summary
Extracts the summary paragraph from docstring lines.

The summary is the first paragraph (up to the first blank line or sentence-ending period).

##### `extractDocstringSummary` — Parameters
- `lines`: Array of docstring lines

##### `extractDocstringSummary` — Returns
Object with summary text and remaining lines

#### `parseRestFields` {#symbol-parserestfields}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L206)
- Parameters: `mutable`: [`MutableDocstringState`](#symbol-mutabledocstringstate)

##### `parseRestFields` — Summary
Parses reStructuredText-style field lists (`:param:`, `:returns:`, etc.).

##### `parseRestFields` — Parameters
- `lines`: Lines to parse
- `mutable`: State object to accumulate results into

##### `parseRestFields` — Returns
Lines that weren't consumed by reST field parsing

#### `detectGoogleSections` {#symbol-detectgooglesections}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L338)

##### `detectGoogleSections` — Summary
Detects whether lines contain Google-style section headers.

#### `detectNumpySections` {#symbol-detectnumpysections}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L345)

##### `detectNumpySections` — Summary
Detects whether lines contain NumPy-style underlined section headers.

#### `parseGoogleSections` {#symbol-parsegooglesections}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L359)
- Parameters: `mutable`: [`MutableDocstringState`](#symbol-mutabledocstringstate)

##### `parseGoogleSections` — Summary
Parses Google-style docstring sections (`Args:`, `Returns:`, etc.).

#### `parseNumpySections` {#symbol-parsenumpysections}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L444)
- Parameters: `mutable`: [`MutableDocstringState`](#symbol-mutabledocstringstate)

##### `parseNumpySections` — Summary
Parses NumPy-style docstring sections (underlined headers).

#### `collectIndentedBlock` {#symbol-collectindentedblock}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L516)

##### `collectIndentedBlock` — Summary
Collects lines that are indented relative to a starting position.

#### `collectGoogleBlock` {#symbol-collectgoogleblock}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L540)

##### `collectGoogleBlock` — Summary
Collects a Google-style section block (indented content until next section).

#### `collectNumpyBlock` {#symbol-collectnumpyblock}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L567)

##### `collectNumpyBlock` — Summary
Collects a NumPy-style section block (content until next underlined header).

#### `parseGoogleParameters` {#symbol-parsegoogleparameters}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L595)
- Parameters: `mutable`: [`MutableDocstringState`](#symbol-mutabledocstringstate)

##### `parseGoogleParameters` — Summary
Parses Google-style parameter entries from indented lines.

#### `parseGoogleReturns` {#symbol-parsegooglereturns}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L611)

##### `parseGoogleReturns` — Summary
Parses Google-style return value entries.

#### `parseGoogleExceptions` {#symbol-parsegoogleexceptions}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L627)

##### `parseGoogleExceptions` — Summary
Parses Google-style exception entries.

#### `parseNumpyParameters` {#symbol-parsenumpyparameters}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L645)
- Parameters: `mutable`: [`MutableDocstringState`](#symbol-mutabledocstringstate)

##### `parseNumpyParameters` — Summary
Parses NumPy-style parameter entries.

#### `parseNumpyReturns` {#symbol-parsenumpyreturns}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L661)

##### `parseNumpyReturns` — Summary
Parses NumPy-style return value entries.

#### `parseNumpyExceptions` {#symbol-parsenumpyexceptions}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L677)

##### `parseNumpyExceptions` — Summary
Parses NumPy-style exception entries.

#### `parseIndentedEntries` {#symbol-parseindentedentries}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L692)

##### `parseIndentedEntries` — Summary
Parses indented entries in Google-style format.
Each entry has format: `name (type): description`

#### `parseNumpyEntries` {#symbol-parsenumpyentries}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L751)

##### `parseNumpyEntries` — Summary
Parses NumPy-style entries (name on one line, description indented below).

#### `normalizeExample` {#symbol-normalizeexample}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L808)
- Returns: [`SymbolDocumentationExample`](../core.ts.mdmd.md#symbol-symboldocumentationexample)

##### `normalizeExample` — Summary
Normalizes a Python example block, detecting `>>>` interactive sessions.

#### `joinParagraphs` {#symbol-joinparagraphs}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L853)

##### `joinParagraphs` — Summary
Joins paragraph chunks with double newlines, trimming trailing whitespace.

#### `detectMinimumIndent` {#symbol-detectminimumindent}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L863)

##### `detectMinimumIndent` — Summary
Detects the minimum indentation level among non-empty lines.

#### `ensureParameter` {#symbol-ensureparameter}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L884)
- Parameters: `mutable`: [`MutableDocstringState`](#symbol-mutabledocstringstate)

##### `ensureParameter` — Summary
Ensures a parameter entry exists in the mutable state.

#### `ensureException` {#symbol-ensureexception}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L900)

##### `ensureException` — Summary
Ensures an exception entry exists in the bucket.

#### `capitalize` {#symbol-capitalize}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.docstring.ts#L916)

##### `capitalize` — Summary
Capitalizes the first character of a string.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`core.SymbolDocumentationExample`](../core.ts.mdmd.md#symbol-symboldocumentationexample) (type-only)
- [`core.SymbolDocumentationLink`](../core.ts.mdmd.md#symbol-symboldocumentationlink) (type-only)
<!-- LIVE-DOC:END Dependencies -->
