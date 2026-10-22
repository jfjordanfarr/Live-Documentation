# tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Extensions/WidgetExtensions.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Extensions/WidgetExtensions.cs
- Generated At: 2026-10-22T16:47:59.170Z

## Authored
### Purpose
Captures the `WidgetExtensions` helpers the C# advanced symbols fixture uses to verify extension methods and namespace aliasing are reflected.

### Notes
Leave the extension method signature as-is; the benchmark inspects the generated symbol to ensure extension discovery.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WidgetExtensions` {#symbol-widgetextensions}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Extensions/WidgetExtensions.cs#L10)

##### `WidgetExtensions` — Summary
Provides helpers for flattening widget dependency graphs.

#### `FlattenDependencies` {#symbol-flattendependencies}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Extensions/WidgetExtensions.cs#L12)
- Parameters: `widget`: [`BaseWidget`](../BaseWidget.cs.mdmd.md#symbol-basewidget-class); `context`: [`RenderContext`](../RenderContext.cs.mdmd.md#symbol-rendercontext-class)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`BaseWidget`](../BaseWidget.cs.mdmd.md#symbol-basewidget-class)
- [`RenderContext`](../RenderContext.cs.mdmd.md#symbol-rendercontext-class)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`tests/integration/fixtures/csharp-advanced-symbols/docs/symbol-scenarios.md`](../../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/docs/symbol-scenarios.md)
<!-- LIVE-DOC:END Cited By -->
