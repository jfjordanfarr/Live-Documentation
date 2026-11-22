# `packages/engine/src/live-docs/adapters/csharp.cref-overloads.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/adapters/csharp.cref-overloads.test.ts`
- Generated At: 2026-11-22T05:57:44.345Z

## Authored
### Purpose
Holds the C# reader's resolution of an author's reference to one overload of a method to the C# compiler's own answer, declaration by declaration rather than file pair by file pair. The test runs on two small projects. One declares `Mix(Calc[])`, `Mix(ref Calc)` and `Mix(Calc, Calc)`. The other names them in five `cref`s:

- one for the array overload;
- one for the `ref` overload;
- one for an overload that does not exist;
- one written with a stray comma;
- one for the two-parameter overload, a control.

Each case expects the lines the compiler names in `Lib/Calc.cs`.

### Notes
- Written on 2026-11-22 by the engine review of that day's work ([its record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/engine-review/README.md#2026-11-22-later-the-second-pass)). The compiler's answers come from `scripts/oracle/csharp-compiler.cs` (Roslyn 4.12) run on exactly these files.
- The reader compares parameters by a shape that drops array marks and modifiers, so `Calc[]` and `ref Calc` look alike to it. Where no overload matches, it links every overload of the same count. When the review committed the file, the first four cases failed and the control passed.
- The C# oracle cannot see these misses: it compares file pairs, and every target here lies in one file.

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
