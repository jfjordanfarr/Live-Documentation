# tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/CompositeWidget.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/CompositeWidget.cs
- Generated At: 2026-09-27T23:21:32.697Z

## Authored
### Purpose
Explains the `CompositeWidget` base used by the C# advanced symbols fixture to stress composite patterns and overridden dependency propagation.

### Notes
Keep the child traversal logic straightforward; the fixture asserts that inherited `CollectDependencies` results are preserved.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CompositeWidget (class)` {#symbol-compositewidget-class}
- Type: class
- Source: [source](../../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/CompositeWidget.cs#L5)
- Extends: [`BaseWidget`](../BaseWidget.cs.mdmd.md#symbol-basewidget-class)

#### `CompositeWidget (constructor)` {#symbol-compositewidget-constructor}
- Type: constructor
- Source: [source](../../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/CompositeWidget.cs#L9)

#### `RenderCore` {#symbol-rendercore}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/CompositeWidget.cs#L13)
- Parameters: `context`: [`RenderContext`](../RenderContext.cs.mdmd.md#symbol-rendercontext-class)

#### `AttachChild` {#symbol-attachchild}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/CompositeWidget.cs#L21)
- Parameters: `widget`: [`BaseWidget`](../BaseWidget.cs.mdmd.md#symbol-basewidget-class)

#### `CollectDependencies` {#symbol-collectdependencies}
- Type: method
- Source: [source](../../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/Widgets/CompositeWidget.cs#L29)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`BaseWidget`](../BaseWidget.cs.mdmd.md#symbol-basewidget-class)
- [`RenderContext`](../RenderContext.cs.mdmd.md#symbol-rendercontext-class)
<!-- LIVE-DOC:END Dependencies -->
