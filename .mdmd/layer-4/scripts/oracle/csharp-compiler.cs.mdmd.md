# `scripts/oracle/csharp-compiler.cs`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/oracle/csharp-compiler.cs`
- Entry: program
- Generated At: 2026-11-21T05:26:06.838Z

## Authored
### Purpose
The C# oracle's compiler: a .NET file-based program (`dotnet run`, the Roslyn package pinned in its `#:package` line) that builds one compilation for each project of a folder, each referencing the compilations of the projects it references, binds every simple name, and prints every file-to-file edge a source symbol makes, by a type or only a member, with each file's declared type names and each project's references as it was given them and as its XML's elements name them. [`csharp-compare.ts`](./csharp-compare.ts.mdmd.md) runs it and reads what it prints.

### Notes
- Written on 2026-11-21 from the November 19 probe's `compiler-edges` program ([`dotnet-gaps`](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/dotnet-gaps/README.md)), which read each project's references by a pattern that took a commented-out reference for a real one, the fault an independent review found in the reader. It is now handed MSBuild's evaluation on standard input, and where MSBuild could not evaluate a project it reads the project's XML with System.Xml, so that a comment is no element.
- Without framework or package references, a name reached only through a framework type does not bind; the probe measured 65% of DNN's and 53% of mojoPortal's simple names bound so.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Microsoft.CodeAnalysis`
- `Microsoft.CodeAnalysis.CSharp`
- `Microsoft.CodeAnalysis.CSharp.Syntax`
<!-- LIVE-DOC:END Dependencies -->
