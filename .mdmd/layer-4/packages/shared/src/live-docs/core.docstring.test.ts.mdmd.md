# packages/shared/src/live-docs/core.docstring.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/core.docstring.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-core-docstring-test-ts
- Generated At: 2026-02-03T21:55:40.331Z

## Authored
### Purpose
Verifies the Live Docs extraction engine emits structured docstrings for TypeScript sources, guarding the JSDoc bridge introduced for reverse documentation workflows.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-14.SUMMARIZED.md#turn-11-plan-the-typescript-docstring-bridge-lines-2101-2400]

### Notes
- Added while extending `extractJsDocDocumentation` so Live Docs could round-trip docstrings into generated sections without losing tags or formatting.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-14.SUMMARIZED.md#turn-11-plan-the-typescript-docstring-bridge-lines-2101-2400]
- Works in concert with the polyglot adapter tests landed the same week, ensuring the shared core honors language-specific docstring structures.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-12.SUMMARIZED.md#turn-08-stand-up-co-activation-infrastructure-lines-1101-1220]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:40.331Z","inputHash":"4e7aeb89368fc506"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_FILE_EXTENSION`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_file_extension)
- [`core.collectExportedSymbols`](./core.ts.mdmd.md#symbol-collectexportedsymbols)
- [`core.computePublicSymbolHeadingInfo`](./core.ts.mdmd.md#symbol-computepublicsymbolheadinginfo)
- [`core.renderPublicSymbolLines`](./core.ts.mdmd.md#symbol-renderpublicsymbollines)
- `typescript` - `ts`
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/config: [liveDocumentationConfig.ts](../config/liveDocumentationConfig.ts.mdmd.md)
- packages/shared/src/live-docs: [core.ts](./core.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
