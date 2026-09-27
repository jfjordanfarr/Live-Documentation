# tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/BaseWidget.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/BaseWidget.cs
- Live Doc ID: LD-implementation-tests-integration-fixtures-csharp-advanced-symbols-src-diagnostics-basewidget-cs
- Generated At: 2026-09-27T18:34:30.551Z

## Authored
### Purpose
Defines the `BaseWidget` abstraction used throughout the C# advanced symbols fixture to stress inheritance and `protected internal` members.

### Notes
Changes to rendering hooks must stay synchronized with the derived widget fixtures to keep the scenario coherent.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:34:30.551Z","inputHash":"98fb60682a278d4a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BaseWidget (class)` {#symbol-basewidget-class}
- Type: class
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/BaseWidget.cs#L7)

#### `BaseWidget (constructor)` {#symbol-basewidget-constructor}
- Type: constructor
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/BaseWidget.cs#L9)

#### `Name` {#symbol-name}
- Type: property
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/BaseWidget.cs#L14)

#### `Metadata (property)` {#symbol-metadata}
- Type: property
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/BaseWidget.cs#L16)

#### `Render` {#symbol-render}
- Type: method
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/BaseWidget.cs#L18)
- Returns: [`WidgetSnapshot`](./WidgetSnapshot.cs.mdmd.md#symbol-widgetsnapshot)
- Parameters: `context`: [`RenderContext`](./RenderContext.cs.mdmd.md#symbol-rendercontext-class)

#### `RenderCore` {#symbol-rendercore}
- Type: method
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/BaseWidget.cs#L31)
- Parameters: `context`: [`RenderContext`](./RenderContext.cs.mdmd.md#symbol-rendercontext-class)

#### `CollectDependencies` {#symbol-collectdependencies}
- Type: method
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/BaseWidget.cs#L33)

#### `UpdateMetadata` {#symbol-updatemetadata}
- Type: method
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/BaseWidget.cs#L38)
- Parameters: `mutator`: [`WidgetMetadata`](./WidgetMetadata.cs.mdmd.md#symbol-widgetmetadata-struct)

#### `TryMerge` {#symbol-trymerge}
- Type: method
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/BaseWidget.cs#L44)
- Parameters: `other`: [`BaseWidget`](#symbol-basewidget-class)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`RenderContext`](./RenderContext.cs.mdmd.md#symbol-rendercontext-class)
- [`WidgetMetadata`](./WidgetMetadata.cs.mdmd.md#symbol-widgetmetadata-struct)
- [`WidgetSnapshot`](./WidgetSnapshot.cs.mdmd.md#symbol-widgetsnapshot)
<!-- LIVE-DOC:END Dependencies -->
