# `packages/engine/src/live-docs/adapters/csharp.cref-renamed-type-parameters.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/adapters/csharp.cref-renamed-type-parameters.test.ts`
- Generated At: 2026-11-22T07:13:50.016Z

## Authored
### Purpose
Holds the C# reader to the compiler's answer for an author's reference that calls a generic's type parameter by a name of its own. `Lib.Calc.Echo{U}(U)` names `Echo<T>(T)`, and `Lib.Box{X}.Put(X)` names `Box<T>.Put(T)`. The compiler binds each by position. The reader must link the same declaration. The references that spell the parameter as declared are the control.

### Notes
- Written on 2026-11-22 by the engine review's third pass ([its record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/engine-review/README.md#2026-11-22-last-the-third-pass)). Two runs give the compiler's answers, and they agree:
  - `scripts/oracle/csharp-compiler.cs` (Roslyn 4.12), on exactly these files;
  - `dotnet build` with the framework and `GenerateDocumentationFile`, which raises no CS1574 for any of the four.
- `parameterShape` compares a type by its written name, so `X` is not `T` to the reader, and it leaves the reference as text. When the review committed this file, the two renamed cases failed and the two controls passed.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:os`
- `node:path`
- [`csharp.csharpAdapter`](./csharp.ts.mdmd.md#symbol-csharpadapter)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
