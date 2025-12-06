# packages/scripts/src/live-docs/explorer/client/errors.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/errors.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-errors-ts
- Generated At: 2025-12-02T05:07:01.214Z

## Authored
### Purpose
Global error handling for the Explorer client. Displays a user-friendly error overlay when fatal exceptions occur and captures unhandled promise rejections.

### Notes
- Created 2025-11-21 to surface JavaScript errors during development.
- `attachGlobalErrorHandler` wires `window.onerror` and `unhandledrejection` listeners.
- Error overlay includes stack traces and a "Reload" button.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-02T05:07:01.214Z","inputHash":"e12a82c737fed29b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `reportFatalExplorerError` {#symbol-reportfatalexplorererror}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/errors.ts#L46)

#### `attachGlobalErrorHandler` {#symbol-attachglobalerrorhandler}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/errors.ts#L67)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
