# `tests/integration/programs/csharp/names/App/Runner.cs`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/programs/csharp/names/App/Runner.cs`
- Generated At: 2026-11-22T01:24:27.257Z

## Authored
### Purpose
One part of the partial class `Runner`, holding the overload `Run(Count)`; the other part, `Runner.Text.cs`, holds `Run(Text)`. Each overload takes a type declared beside it, so that neither part uses another file. `Documented.cs` names each overload by its signature in a documentation reference, and the compiler resolves each to its own file, which is how the C# oracle's test tells an overload apart at the grain of files.

### Notes
- Written on 2026-11-22 with `Documented.cs` ([the record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/authors-word/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Runner` {#symbol-runner}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Runner.cs#L3)

#### `Count` {#symbol-count}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Runner.cs#L5)

#### `Run` {#symbol-run}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Runner.cs#L7)
- Parameters: `count`: [`Count`](#symbol-count)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
