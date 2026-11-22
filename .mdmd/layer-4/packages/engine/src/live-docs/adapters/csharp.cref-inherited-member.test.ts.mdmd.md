# `packages/engine/src/live-docs/adapters/csharp.cref-inherited-member.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/adapters/csharp.cref-inherited-member.test.ts`
- Generated At: 2026-11-22T07:13:50.005Z

## Authored
### Purpose
Holds the C# reader to the compiler's answer for an author's reference to a member named through a type that only inherits it. The test uses two projects. In one, `Derived : Base` declares `Grow(Calc[])`, while `Base` declares `Grow(Calc)`, `Shrink(Calc)` and a property `Layout`. The other project names these members through `Derived`. The compiler resolves none of the four inherited ones, so the reader must link none of them. Two controls must still link: `Derived`'s own `Grow(Calc[])`, and `Shrink` named through `Base`.

### Notes
- Written on 2026-11-22 by the engine review's third pass ([its record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/engine-review/README.md#2026-11-22-last-the-third-pass)). The compiler's answers come from two runs, which agree:
  - `scripts/oracle/csharp-compiler.cs` (Roslyn 4.12, without framework references), on exactly these files;
  - `dotnet build` with the framework and `GenerateDocumentationFile`, which warns CS1574 ("could not be resolved") for each of the four.
- The reader's stated rule ("a member named through its type is found where the type inherits it too") and its case in `csharp.test.ts` (`Derived.Layout`) say the opposite. Neither was held to the compiler. When the review committed this file, the four inherited cases failed and the two controls passed.

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
