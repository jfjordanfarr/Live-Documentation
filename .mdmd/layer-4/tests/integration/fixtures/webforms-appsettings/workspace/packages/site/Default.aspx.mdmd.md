# tests/integration/fixtures/webforms-appsettings/workspace/packages/site/Default.aspx

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/webforms-appsettings/workspace/packages/site/Default.aspx
- Generated At: 2026-09-27T23:21:33.756Z

## Authored
### Purpose
Captures the ASP.NET Web Forms markup that hosts the telemetry demo page so fixtures can validate configuration discovery from UI assets.

### Notes
- The hidden field `AppInsightsInstrumentationKey` mirrors the value the code-behind supplies, which is how the Application Insights configuration reaches the front-end script. Its id and the form's are the page's public symbols, published by the markup adapter since 2026-09-27.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `AppInsightsInstrumentationKey` {#symbol-appinsightsinstrumentationkey}
- Type: variable

#### `form1` {#symbol-form1}
- Type: variable
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Default.aspx`](./Default.aspx.cs.mdmd.md)
- [`app-insights`](./Scripts/app-insights.js.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
