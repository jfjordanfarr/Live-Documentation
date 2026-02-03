# packages/shared/src/live-docs/adapters/python.docstring.unit.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/python.docstring.unit.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-python-docstring-unit-test-ts
- Generated At: 2026-02-03T21:55:40.073Z

## Authored
### Purpose
Unit tests for the Python docstring parsing module, validating correct extraction of parameters, return values, exceptions, examples, and links from reStructuredText, Google-style, and NumPy-style docstrings.

### Notes
- **65 Tests:** Covers `parseDocstring` (the main entry point), plus helper functions like `extractDocstringSummary`, `parseRestFields`, `parseGoogleSections`, `parseNumpySections`, `joinParagraphs`, `detectMinimumIndent`, and `normalizeExample`.
- **Edge Cases:** Includes tests for multi-paragraph summaries, mixed format detection, indentation normalization, and malformed docstrings.
- **Created:** 2025-12-10 during the `python.ts` refactoring to ensure the extracted module is test-backed.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:40.073Z","inputHash":"ebb87b0dea1200cf"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `./python.docstring` - `capitalize`, `createEmptyDocstringState`, `detectGoogleSections`, `detectMinimumIndent`, `detectNumpySections`, `extractDocstringSummary`, `joinParagraphs`, `normalizeExample`, `parseDocstring`, `parseIndentedEntries`, `parseNumpyEntries`
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
