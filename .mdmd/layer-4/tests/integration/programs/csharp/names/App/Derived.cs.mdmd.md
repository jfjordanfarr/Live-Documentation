# `tests/integration/programs/csharp/names/App/Derived.cs`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/programs/csharp/names/App/Derived.cs`
- Generated At: 2026-11-21T05:35:21.889Z

## Authored
### Purpose
The nested-type case: `Derived` inherits `Base` and names `Options` while a `using` brings in `App.Other`, which declares an `Options` too. C# looks a simple name up in the type's own members and its base types' before any namespace or `using`, so the compiler binds it to `Base.Options`, in `Base.cs`.

### Notes
- The C# adapter draws the edge to `Other.cs` instead, the measured miss `csharp-oracle.test.ts` registers until the reader looks up base types' members first. Written on 2026-11-21 in the joining of the readers, from an independent review of the C# reader ([the work item](../../../../../../../../AI-Agent-Workspace/Work/readers-on-main.md)); what the program exercises is in [Sample Programs](../../../../../../../layer-3/sample-programs.mdmd.md#the-names-program).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Derived` {#symbol-derived}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Derived.cs#L5)
- Extends: [`Base`](./Base.cs.mdmd.md#symbol-base)

#### `Settings` {#symbol-settings}
- Type: property
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Derived.cs#L7)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Base`](./Base.cs.mdmd.md#symbol-base)
- [`Other.Options`](./Other.cs.mdmd.md#symbol-options)
<!-- LIVE-DOC:END Dependencies -->
