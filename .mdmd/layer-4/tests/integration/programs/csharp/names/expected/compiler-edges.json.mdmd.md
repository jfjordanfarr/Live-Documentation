# `tests/integration/programs/csharp/names/expected/compiler-edges.json`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/programs/csharp/names/expected/compiler-edges.json`
- Generated At: 2026-11-21T07:28:52.350Z

## Authored
### Purpose
The file-to-file edges scip-dotnet resolved for the `names` sample, written by `npm run oracle:index`; `oracle:compare` measures the adapter against it. Its one ambiguity is `Lib/Helper#`, which names both `Helper.cs` and `HelperOfT.cs`, so the two edges resting on it are counted neither found nor missing.

### Notes
- Never hand-edited. Regenerate with `oracle:index` after changing the program; nothing in it is trimmed to fit the adapter. Written on 2026-11-21 in the joining of the readers, from an independent review of the C# reader ([the work item](../../../../../../../../AI-Agent-Workspace/Work/readers-on-main.md)); what the program exercises is in [Sample Programs](../../../../../../../layer-3/sample-programs.mdmd.md#the-names-program).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `tool` {#symbol-tool}
- Type: key

#### `projectFile` {#symbol-projectfile}
- Type: key

#### `projects` {#symbol-projects}
- Type: key

#### `documents` {#symbol-documents}
- Type: key

#### `outside` {#symbol-outside}
- Type: key

#### `edges` {#symbol-edges}
- Type: key

#### `ambiguous` {#symbol-ambiguous}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`UseIt`](../A/UseIt.cs.mdmd.md)
- [`Base`](../App/Base.cs.mdmd.md)
- [`Derived`](../App/Derived.cs.mdmd.md)
- [`Helper`](../App/Helper.cs.mdmd.md)
- [`HelperOfT`](../App/HelperOfT.cs.mdmd.md)
- [`MemberOverUsing`](../App/MemberOverUsing.cs.mdmd.md)
- [`Other`](../App/Other.cs.mdmd.md)
- [`Use`](../App/Use.cs.mdmd.md)
- [`Thing`](../B/Thing.cs.mdmd.md)
- [`Names`](../Names.sln.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
