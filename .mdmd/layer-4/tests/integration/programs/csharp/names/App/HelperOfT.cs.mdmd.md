# `tests/integration/programs/csharp/names/App/HelperOfT.cs`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/programs/csharp/names/App/HelperOfT.cs`
- Generated At: 2026-11-21T05:35:21.902Z

## Authored
### Purpose
Declares `Lib.Helper<T>`, which differs from `Helper.cs`'s type only by arity: scip-dotnet's symbols do not carry arity, so its record makes the two one symbol, `Lib/Helper#`, and lists it as ambiguous.

### Notes
- Written on 2026-11-21 in the joining of the readers, from an independent review of the C# reader ([the work item](../../../../../../../../AI-Agent-Workspace/Work/readers-on-main.md)); what the program exercises is in [Sample Programs](../../../../../../../layer-3/sample-programs.mdmd.md#the-names-program).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Helper` {#symbol-helper}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/HelperOfT.cs#L3)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
