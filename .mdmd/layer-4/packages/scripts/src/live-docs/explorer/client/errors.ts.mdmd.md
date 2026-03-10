# packages/scripts/src/live-docs/explorer/client/errors.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/errors.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-errors-ts
- Generated At: 2026-03-09T19:16:51.544Z

## Authored
### Purpose
Global error handling for the Explorer client. Displays a user-friendly error overlay when fatal exceptions occur and captures unhandled promise rejections.

### Notes
- Created 2025-11-21 to surface JavaScript errors during development.
- `attachGlobalErrorHandler` wires `window.onerror` and `unhandledrejection` listeners.
- Error overlay includes stack traces and a "Reload" button.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-09T19:16:51.544Z","inputHash":"decf141802aa3a29"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `reportFatalExplorerError` {#symbol-reportfatalexplorererror}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/errors.ts#L47)

##### `reportFatalExplorerError` — Summary
Renders a full-page fatal error overlay with encoded stack trace.

#### `attachGlobalErrorHandler` {#symbol-attachglobalerrorhandler}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/errors.ts#L69)

##### `attachGlobalErrorHandler` — Summary
Installs a `window.error` listener that delegates to {@link reportFatalExplorerError}.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`template.detail-body`](../shared/template.html.mdmd.md#symbol-detailbody)
- [`template.detail-panel`](../shared/template.html.mdmd.md#symbol-detailpanel)
- [`template.stats-line`](../shared/template.html.mdmd.md#symbol-statsline)
<!-- LIVE-DOC:END Dependencies -->
