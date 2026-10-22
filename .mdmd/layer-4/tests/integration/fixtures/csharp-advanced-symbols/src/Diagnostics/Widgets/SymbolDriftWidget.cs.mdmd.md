# tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/SymbolDriftWidget.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/SymbolDriftWidget.cs
- Generated At: 2026-10-22T16:47:59.314Z

## Authored
### Purpose
Details the `SymbolDriftWidget` implementation that feeds tag-heavy metadata into the C# advanced symbols scenario.

### Notes
Maintain the merge semantics and dependency list—they emulate a real drift monitor the analyzer depends on.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SymbolDriftWidget (class)` {#symbol-symboldriftwidget-class}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/SymbolDriftWidget.cs#L6)
- Extends: [`BaseWidget`](../BaseWidget.cs.mdmd.md#symbol-basewidget-class)

#### `SymbolDriftWidget (constructor)` {#symbol-symboldriftwidget-constructor}
- Type: constructor
- Source: [source](../../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/SymbolDriftWidget.cs#L10)

#### `RenderCore` {#symbol-rendercore}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/SymbolDriftWidget.cs#L17)
- Parameters: `context`: [`RenderContext`](../RenderContext.cs.mdmd.md#symbol-rendercontext-class)

#### `CollectDependencies` {#symbol-collectdependencies}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/SymbolDriftWidget.cs#L25)

#### `TryMerge` {#symbol-trymerge}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/SymbolDriftWidget.cs#L31)
- Parameters: `other`: [`BaseWidget`](../BaseWidget.cs.mdmd.md#symbol-basewidget-class)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`BaseWidget`](../BaseWidget.cs.mdmd.md#symbol-basewidget-class)
- [`RenderContext`](../RenderContext.cs.mdmd.md#symbol-rendercontext-class)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`tests/integration/fixtures/csharp-advanced-symbols/docs/registry.md`](../../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/docs/registry.md)
- [`tests/integration/fixtures/csharp-advanced-symbols/docs/symbol-scenarios.md`](../../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/docs/symbol-scenarios.md)
<!-- LIVE-DOC:END Cited By -->
