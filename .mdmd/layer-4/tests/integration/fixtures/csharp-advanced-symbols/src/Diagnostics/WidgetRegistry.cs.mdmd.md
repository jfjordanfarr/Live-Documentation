# tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetRegistry.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetRegistry.cs
- Live Doc ID: LD-implementation-tests-integration-fixtures-csharp-advanced-symbols-src-diagnostics-widgetregistry-cs
- Generated At: 2026-02-03T21:55:47.132Z

## Authored
### Purpose
Documents the `WidgetRegistry` class that exercises events, generics, and nullability behavior for the C# advanced symbols integration fixture.

### Notes
Keep the XML documentation and event surface intact; modify only when expanding the advanced C# fixture's coverage footprint.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:47.132Z","inputHash":"3f1745a0c37880a2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WidgetRegistry` {#symbol-widgetregistry}
- Type: class
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetRegistry.cs#L14)

##### `WidgetRegistry` — Summary
Maintains widget registrations and surfaces change notifications.

##### `WidgetRegistry` — Remarks
Widget registries coordinate cross-module widget discovery.

Thread-safety is provided by a concurrent dictionary shared by all callers.

##### `WidgetRegistry` — Links
- `../../docs/registry.md` — Widget architecture

#### `WidgetRegistered` {#symbol-widgetregistered}
- Type: event
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetRegistry.cs#L25)

##### `WidgetRegistered` — Summary
Raised when a widget is successfully added to the registry.

##### `WidgetRegistered` — Remarks
Subscribers receive `WidgetRegisteredEventArgs` instances describing the change.

##### `WidgetRegistered` — Links
- `WidgetRegisteredEventArgs`

#### `TryRegister` {#symbol-tryregister}
- Type: method
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetRegistry.cs#L45)

##### `TryRegister` — Summary
Attempts to register a widget and emits `WidgetRegistered` upon success.

##### `TryRegister` — Remarks
Duplicate registrations update existing entries when `widget` shares the same name.

Generated events run on the caller's thread.

##### `TryRegister` — Parameters
- `widget`: The widget instance being registered.

##### `TryRegister` — Returns
`true` when the widget is added; otherwise `false`.

##### `TryRegister` — Exceptions
- `ArgumentNullException`: Thrown when `widget` is `null`.

##### `TryRegister` — Examples
Registers a widget and inspects the resulting event payload.

```csharp

var registry = new WidgetRegistry();
var widget = new CompositeWidget("alpha");
registry.TryRegister(widget);
```

##### `TryRegister` — Links
- `WidgetRegistered`

#### `All` {#symbol-all}
- Type: property
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetRegistry.cs#L62)

##### `All` — Summary
Returns all registered widgets in insertion order.

##### `All` — Value
The ordered collection of registered widgets.

#### `Resolve` {#symbol-resolve}
- Type: method
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetRegistry.cs#L71)

##### `Resolve` — Summary
Resolves a widget by name or returns `null` when not found.

##### `Resolve` — Remarks
Lookup is case-insensitive.

##### `Resolve` — Parameters
- `name`: The widget name used to locate existing registrations.

##### `Resolve` — Returns
The registered widget, or `null` when the name is unknown.

##### `Resolve` — Exceptions
- `ArgumentNullException`: Thrown when `name` is `null`.

#### `TryMerge` {#symbol-trymerge}
- Type: method
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetRegistry.cs#L86)

##### `TryMerge` — Summary
Attempts to merge an incoming widget into the stored entry.

##### `TryMerge` — Remarks
Delegates to `BaseWidget.TryMerge(BaseWidget)` for the merge semantics.

##### `TryMerge` — Parameters
- `widget`: The incoming widget to merge.

##### `TryMerge` — Returns
`true` when the widget merged successfully; otherwise `false`.

##### `TryMerge` — Exceptions
- `ArgumentNullException`: Thrown when `widget` is `null`.

##### `TryMerge` — Links
- `BaseWidget.TryMerge(BaseWidget)`
- `Resolve(string)`

#### `OnWidgetRegistered` {#symbol-onwidgetregistered}
- Type: method
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetRegistry.cs#L99)

##### `OnWidgetRegistered` — Additional Documentation
- <inheritdoc cref="WidgetRegistered"/>

#### `WidgetRegisteredEventArgs (class)` {#symbol-widgetregisteredeventargs-class}
- Type: class
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetRegistry.cs#L109)
- Extends: `EventArgs`

##### `WidgetRegisteredEventArgs (class)` — Summary
Describes the widget that triggered a registration event.

##### `WidgetRegisteredEventArgs (class)` — Remarks
Provides access to the widget and its registration timestamp.

##### `WidgetRegisteredEventArgs (class)` — Links
- `WidgetRegistered`

#### `WidgetRegisteredEventArgs (constructor)` {#symbol-widgetregisteredeventargs-constructor}
- Type: constructor
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetRegistry.cs#L112)

#### `Widget` {#symbol-widget}
- Type: property
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetRegistry.cs#L122)

##### `Widget` — Summary
The widget that triggered the event.

##### `Widget` — Value
The widget instance passed to the registration event.

#### `RegisteredAt` {#symbol-registeredat}
- Type: property
- Source: [source](../../../../../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetRegistry.cs#L128)

##### `RegisteredAt` — Summary
Time when the widget was registered.

##### `RegisteredAt` — Value
A UTC timestamp captured at registration time.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
