# packages/shared/src/uri/normalizeFileUri.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/uri/normalizeFileUri.ts
- Generated At: 2026-09-27T23:21:31.771Z

## Authored
### Purpose

Centralises file URI canonicalisation so diagnostics, change events, and telemetry compare consistent `file://` strings across platforms ([shared refactor](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-28.md#L3258-L3277)).

### Notes

- Re-exported through the server `uri.ts` shim so every watcher and change processor path goes through the same normaliser instead of ad hoc `pathToFileURL` calls ([shared refactor](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-28.md#L3258-L3277)).
- Manually sanity-checked the built helper on Windows to confirm drive-letter casing and whitespace trimming behave as expected during the transitive diagnostics investigation ([debug session](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md#L2808-L2816)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `normalizeFileUri` {#symbol-normalizefileuri}
- Type: function
- Source: [source](../../../../../../packages/shared/src/uri/normalizeFileUri.ts#L8)

##### `normalizeFileUri` — Summary
Normalise a file URI so equivalent paths resolve to a consistent canonical representation.
Ensures Windows drive letters and percent-encoded segments are handled uniformly.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- `node:url` - `fileURLToPath`, `pathToFileURL`
<!-- LIVE-DOC:END Dependencies -->
