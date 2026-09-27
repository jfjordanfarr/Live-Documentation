# packages/shared/src/live-docs/adapters/python.docstring.unit.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/python.docstring.unit.test.ts
- Generated At: 2026-09-27T23:21:30.919Z

## Authored
### Purpose
Unit tests for the Python docstring parsing module, validating correct extraction of parameters, return values, exceptions, examples, and links from reStructuredText, Google-style, and NumPy-style docstrings.

### Notes
- **65 Tests:** Covers `parseDocstring` (the main entry point), plus helper functions like `extractDocstringSummary`, `parseRestFields`, `parseGoogleSections`, `parseNumpySections`, `joinParagraphs`, `detectMinimumIndent`, and `normalizeExample`.
- **Edge Cases:** Includes tests for multi-paragraph summaries, mixed format detection, indentation normalization, and malformed docstrings.
- **Created:** 2025-12-10 during the `python.ts` refactoring to ensure the extracted module is test-backed.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`python.docstring.capitalize`](./python.docstring.ts.mdmd.md#symbol-capitalize)
- [`python.docstring.createEmptyDocstringState`](./python.docstring.ts.mdmd.md#symbol-createemptydocstringstate)
- [`python.docstring.detectGoogleSections`](./python.docstring.ts.mdmd.md#symbol-detectgooglesections)
- [`python.docstring.detectMinimumIndent`](./python.docstring.ts.mdmd.md#symbol-detectminimumindent)
- [`python.docstring.detectNumpySections`](./python.docstring.ts.mdmd.md#symbol-detectnumpysections)
- [`python.docstring.extractDocstringSummary`](./python.docstring.ts.mdmd.md#symbol-extractdocstringsummary)
- [`python.docstring.joinParagraphs`](./python.docstring.ts.mdmd.md#symbol-joinparagraphs)
- [`python.docstring.normalizeExample`](./python.docstring.ts.mdmd.md#symbol-normalizeexample)
- [`python.docstring.parseDocstring`](./python.docstring.ts.mdmd.md#symbol-parsedocstring)
- [`python.docstring.parseIndentedEntries`](./python.docstring.ts.mdmd.md#symbol-parseindentedentries)
- [`python.docstring.parseNumpyEntries`](./python.docstring.ts.mdmd.md#symbol-parsenumpyentries)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
