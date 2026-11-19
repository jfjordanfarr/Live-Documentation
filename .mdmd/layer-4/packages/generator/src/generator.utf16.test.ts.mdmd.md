# `packages/generator/src/generator.utf16.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/generator/src/generator.utf16.test.ts`
- Generated At: 2026-11-19T22:40:12.792Z

## Authored
### Purpose
Holds a source file saved as UTF-16 without a byte-order mark to its UTF-8 twin's archetype and symbols, so that the binary sniff and the one reading step agree about such a file.

### Notes
- Written 2026-11-19 at the joining of the engine round's branches: the sniff called such a file an asset for its zero bytes while the reading step read it as text. Red before the sniff asked the step's rule (`unmarkedUtf16`).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `mkdtempSync`, `readFileSync`, `rmSync`, `writeFileSync`
- `node:os` - `tmpdir`
- `node:path` - `path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`document.parseLiveDoc`](../../engine/src/live-docs/document.ts.mdmd.md#symbol-parselivedoc)
- [`generator.generateLiveDocs`](./generator.ts.mdmd.md#symbol-generatelivedocs)
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
