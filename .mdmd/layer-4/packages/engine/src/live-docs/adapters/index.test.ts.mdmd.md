# packages/engine/src/live-docs/adapters/index.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/adapters/index.test.ts
- Generated At: 2026-10-16T16:21:40.677Z

## Authored
### Purpose
Holds the adapter registry to the configuration's lists of source extensions and file names: every extension and every file name an adapter registers has a default glob, every extension is lowercase with its dot, every adapter reads some file, and a manifest is read by its exact name while another file of its format is not.

### Notes
- Written 2026-10-16 with the suffix-anywhere defaults, so that a new adapter without a default glob fails a test rather than going unread on a cold run ([Turn 9 of the October 15 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-9)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:os`
- `node:path`
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_SOURCE_EXTENSIONS`](../../config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_source_extensions)
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_SOURCE_FILE_NAMES`](../../config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_source_file_names)
- [`index.LANGUAGE_ADAPTERS`](./index.ts.mdmd.md#symbol-language_adapters)
- [`index.analyzeWithLanguageAdapters`](./index.ts.mdmd.md#symbol-analyzewithlanguageadapters)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
