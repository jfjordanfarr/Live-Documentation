# packages/shared/src/languages/index.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/languages/index.test.ts
- Live Doc ID: LD-test-packages-shared-src-languages-index-test-ts
- Generated At: 2026-01-29T20:55:08.259Z

## Authored
### Purpose
Unit tests for the language syntax registry. Validates lookup functions (`getSyntaxById`, `getSyntaxByExtension`, `getSyntaxByPath`) and verifies comment/string stripping for each supported language.

### Notes
Origin: [2026-01-29.1.md](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md) — 22 tests covering registry lookup and basic stripping correctness. Does not exhaustively test edge cases (heredocs, raw strings, template literals); those will be validated via benchmark fixtures when tree-sitter integration lands.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-29T20:55:08.259Z","inputHash":"ee7162b0bdaafb88"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`index.cSyntax`](./index.ts.mdmd.md#symbol-csyntax)
- [`index.csharpSyntax`](./index.ts.mdmd.md#symbol-csharpsyntax)
- [`index.getSyntaxByExtension`](./index.ts.mdmd.md#symbol-getsyntaxbyextension)
- [`index.getSyntaxById`](./index.ts.mdmd.md#symbol-getsyntaxbyid)
- [`index.getSyntaxByPath`](./index.ts.mdmd.md#symbol-getsyntaxbypath)
- [`index.goSyntax`](./index.ts.mdmd.md#symbol-gosyntax)
- [`index.isExtensionSupported`](./index.ts.mdmd.md#symbol-isextensionsupported)
- [`index.isLanguageSupported`](./index.ts.mdmd.md#symbol-islanguagesupported)
- [`index.pythonSyntax`](./index.ts.mdmd.md#symbol-pythonsyntax)
- [`index.typescriptSyntax`](./index.ts.mdmd.md#symbol-typescriptsyntax)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/languages: [languages/index.ts](./index.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
