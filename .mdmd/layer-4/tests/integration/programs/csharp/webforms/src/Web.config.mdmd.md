# tests/integration/programs/csharp/webforms/src/Web.config

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/csharp/webforms/src/Web.config
- Live Doc ID: LD-test-tests-integration-programs-csharp-webforms-src-web-config
- Generated At: 2026-09-27T21:43:44.690Z

## Authored
### Purpose
Capture the Web.config appSettings that the WebForms benchmark relies on so Live Docs and the inspect CLI can trace configuration values back to their origin during cross-language ripple analysis.

### Notes
The fallback inference suite expects these keys to flow into `Globals.cs`, `Default.aspx.cs`, and `Default.aspx`, so the doc must remain in place to validate Web.config awareness in the analyzer.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:44.690Z","inputHash":"8deff0668043b529"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `EnableWidget` {#symbol-enablewidget}
- Type: setting
- Source: [source](../../../../../../../../tests/integration/programs/csharp/webforms/src/Web.config#L4)

#### `ClientConfig` {#symbol-clientconfig}
- Type: setting
- Source: [source](../../../../../../../../tests/integration/programs/csharp/webforms/src/Web.config#L5)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
