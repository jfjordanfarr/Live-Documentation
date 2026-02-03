# tests/integration/fixtures/webforms-appsettings/workspace/packages/site/Default.aspx.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/webforms-appsettings/workspace/packages/site/Default.aspx.cs
- Live Doc ID: LD-implementation-tests-integration-fixtures-webforms-appsettings-workspace-packages-site-default-aspx-cs
- Generated At: 2026-02-03T21:55:51.258Z

## Authored
### Purpose
Code-behind file for the WebForms telemetry sample, demonstrating how runtime configuration keys flow into page lifecycle events during tests.

### Notes
- Exposes the instrumentation key consumed by diagnostics that validate configuration propagation.
- Fixture intentionally mirrors production-style WebForms patterns so heuristics recognise field injections and event handlers.
- Update alongside the paired `Web.config` Live Doc whenever configuration keys or telemetry wiring changes.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:51.258Z","inputHash":"8a8be9521e7ed90c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WebApp_Default` {#symbol-webapp_default}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/fixtures/webforms-appsettings/workspace/packages/site/Default.aspx.cs#L4)
- Extends: `Page`

#### `AppInsightsInstrumentationKey` {#symbol-appinsightsinstrumentationkey}
- Type: field
- Source: [source](../../../../../../../../../tests/integration/fixtures/webforms-appsettings/workspace/packages/site/Default.aspx.cs#L8)

#### `Page_Load` {#symbol-page_load}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/fixtures/webforms-appsettings/workspace/packages/site/Default.aspx.cs#L10)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Web.AppInsightsInstrumentationKey`](../../Web.config.mdmd.md#symbol-appinsightsinstrumentationkey)
<!-- LIVE-DOC:END Dependencies -->
