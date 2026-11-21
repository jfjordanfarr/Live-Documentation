# `tests/integration/programs/csharp/names/App/Use.cs`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/programs/csharp/names/App/Use.cs`
- Generated At: 2026-11-21T05:57:41.477Z

## Authored
### Purpose
The alias case: `using H = Lib.Helper;` names the non-generic type, since the alias's text gives no type arguments, so the compiler binds `H` to `Helper.cs` alone.

### Notes
- The C# adapter drew the edge to `HelperOfT.cs` as well until, the same day, it read the alias's arity from its syntax. Written on 2026-11-21 in the joining of the readers, from an independent review of the C# reader ([the work item](../../../../../../../../AI-Agent-Workspace/Work/readers-on-main.md)); what the program exercises is in [Sample Programs](../../../../../../../layer-3/sample-programs.mdmd.md#the-names-program).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Use` {#symbol-use}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Use.cs#L5)

#### `Item` {#symbol-item}
- Type: property
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Use.cs#L7)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Helper`](./Helper.cs.mdmd.md#symbol-helper)
<!-- LIVE-DOC:END Dependencies -->
