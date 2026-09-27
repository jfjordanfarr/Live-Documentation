# tests/integration/benchmarks/fixtures/csharp/webforms/src/Pages/Default.aspx

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/csharp/webforms/src/Pages/Default.aspx
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-csharp-webforms-src-pages-default-aspx
- Generated At: 2026-09-27T10:16:28.217Z

## Authored
### Purpose
Represent the WebForms markup that bridges the config-driven hidden fields from the code-behind into the client script so we can validate Live Docs coverage across ASP.NET markup, C#, and JavaScript.

### Notes
Keeps the `aspNetMarkupAdapter` exercised: the test expects dependencies to `Default.aspx.cs` via the page directive and to `Scripts/appConfig.js` through the `<script>` tag.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T10:16:28.217Z","inputHash":"3a3b0afda4955713"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ClientConfigHidden` {#symbol-clientconfighidden}
- Type: variable

#### `form1` {#symbol-form1}
- Type: variable

#### `widget-container` {#symbol-widgetcontainer}
- Type: variable

#### `WidgetToggleHidden` {#symbol-widgettogglehidden}
- Type: variable
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Default.aspx`](./Default.aspx.cs.mdmd.md)
- [`appConfig`](../Scripts/appConfig.js.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
