# packages/engine/src/config/liveDocumentationConfig.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/config/liveDocumentationConfig.test.ts
- Generated At: 2026-10-22T00:54:15.367Z

## Authored
### Purpose
Exercises `normalizeLiveDocumentationConfig` so Live Docs tooling respects trimmed overrides, glob dedupe, and slug/archetype settings added during the configuration hardening in [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-19-config--schema-hardening-lines-3561-3760](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-19-config--schema-hardening-lines-3561-3760).

### Notes
- The default glob is held to every file, `**/*`, since 2026-10-22 ([Turn 8 of the October 21 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)), and the lists to what a reader handles: `hasReader` by extension in any case or by a manifest's exact name, `isMediaAsset` for images, fonts and recordings and nothing else. Until then it held the default globs to one pattern per readable extension and manifest name.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](./liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_ASSET_EXTENSIONS`](./liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_asset_extensions)
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_DEFAULT_GLOBS`](./liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_default_globs)
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_SOURCE_EXTENSIONS`](./liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_source_extensions)
- [`liveDocumentationConfig.hasReader`](./liveDocumentationConfig.ts.mdmd.md#symbol-hasreader)
- [`liveDocumentationConfig.isMediaAsset`](./liveDocumentationConfig.ts.mdmd.md#symbol-ismediaasset)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](./liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`coreConstants.SUPPORTED_SCRIPT_EXTENSIONS`](../live-docs/coreConstants.ts.mdmd.md#symbol-supported_script_extensions)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
