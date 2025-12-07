# packages/shared/src/live-docs/core.docstring.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/core.docstring.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-core-docstring-test-ts
- Generated At: 2025-12-07T04:00:25.699Z

## Authored
### Purpose
Verifies the Live Docs extraction engine emits structured docstrings for TypeScript sources, guarding the JSDoc bridge introduced for reverse documentation workflows.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-14.SUMMARIZED.md#turn-11-plan-the-typescript-docstring-bridge-lines-2101-2400]

### Notes
- Added while extending `extractJsDocDocumentation` so Live Docs could round-trip docstrings into generated sections without losing tags or formatting.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-14.SUMMARIZED.md#turn-11-plan-the-typescript-docstring-bridge-lines-2101-2400]
- Works in concert with the polyglot adapter tests landed the same week, ensuring the shared core honors language-specific docstring structures.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-12.SUMMARIZED.md#turn-08-stand-up-co-activation-infrastructure-lines-1101-1220]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T04:00:25.699Z","inputHash":"07a58707d305d488"}]} -->
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
- packages/shared/src/live-docs: [archetype.ts](./archetype.ts.mdmd.md), [core.ts](./core.ts.mdmd.md), [coreConstants.ts](./coreConstants.ts.mdmd.md), [coreTypes.ts](./coreTypes.ts.mdmd.md), [coreUtils.ts](./coreUtils.ts.mdmd.md), [dependencies.ts](./dependencies.ts.mdmd.md)
  [discovery.ts](./discovery.ts.mdmd.md), [fileUtils.ts](./fileUtils.ts.mdmd.md), [gitUtils.ts](./gitUtils.ts.mdmd.md), [jsDoc.ts](./jsDoc.ts.mdmd.md), [rendering.ts](./rendering.ts.mdmd.md), [sourceAnalysis.ts](./sourceAnalysis.ts.mdmd.md)
  [symbolExtraction.ts](./symbolExtraction.ts.mdmd.md)
- packages/shared/src/live-docs/adapters: [adapters/index.ts](./adapters/index.ts.mdmd.md), [aspnet.ts](./adapters/aspnet.ts.mdmd.md), [c.ts](./adapters/c.ts.mdmd.md), [csharp.ts](./adapters/csharp.ts.mdmd.md), [java.ts](./adapters/java.ts.mdmd.md), [powershell.ts](./adapters/powershell.ts.mdmd.md)
  [python.ts](./adapters/python.ts.mdmd.md), [ruby.ts](./adapters/ruby.ts.mdmd.md), [rust.ts](./adapters/rust.ts.mdmd.md)
- packages/shared/src/live-docs/heuristics: [dom.ts](./heuristics/dom.ts.mdmd.md)
- packages/shared/src/tooling: [githubSlugger.ts](../tooling/githubSlugger.ts.mdmd.md), [githubSluggerRegex.ts](../tooling/githubSluggerRegex.ts.mdmd.md), [pathUtils.ts](../tooling/pathUtils.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
