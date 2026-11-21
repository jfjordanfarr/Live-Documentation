# `tests/integration/programs/csharp/names/App/MemberOverUsing.cs`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/programs/csharp/names/App/MemberOverUsing.cs`
- Generated At: 2026-11-21T07:28:52.333Z

## Authored
### Purpose
The inherited-member case: `MemberOverUsing` inherits `Base` and reads `Gadget * 2` while a `using` brings in `App.Other`, which declares a class `Gadget`. C# passes over types where an expression is read, so the compiler binds `Gadget` to `Base`'s property, in `Base.cs`, and draws nothing to `Other.cs`.

### Notes
- The C# adapter draws the edge to `Other.cs` as well, a known miss both oracle tests list (`csharp-oracle.test.ts`'s register and `compiler-differences.json`): it does not tell where an expression is read from where a type is, for a type's own members either. Added on 2026-11-21 after an independent review's second pass ([the work item](../../../../../../../../AI-Agent-Workspace/Work/readers-on-main.md)); what the program exercises is in [Sample Programs](../../../../../../../layer-3/sample-programs.mdmd.md#the-names-program).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MemberOverUsing` {#symbol-memberoverusing}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/MemberOverUsing.cs#L5)
- Extends: [`Base`](./Base.cs.mdmd.md#symbol-base)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Base`](./Base.cs.mdmd.md#symbol-base)
- [`Other.Gadget`](./Other.cs.mdmd.md#symbol-gadget)
<!-- LIVE-DOC:END Dependencies -->
