# tests/integration/programs/csharp/estate/Estate.sln

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Estate.sln
- Generated At: 2026-10-22T00:39:46.584Z

## Authored
### Purpose
The estate's Visual Studio solution: the five projects that build together (Contracts, Portal, Gateway, Hub and PaymentService), and the file through which the compiler oracle indexes the estate.

### Notes
_No reader handles this kind of file yet, so the generated sections are empty for that reason, not because the file exposes or uses nothing. Revisit this note when a reader arrives._
- `oracle:index` looks for the one `.sln` at a fixture's root and runs scip-dotnet over it ([`index-fixture.ts`](../../../../../../../scripts/oracle/index-fixture.ts)); the compiler's edges record it as their project file, which is the one wire the docs draw into this file today. The project adapter reads each project's `.csproj`, but nothing reads the solution's list of projects, so its five wires to them are not drawn yet. Every configuration, Debug or Release on any platform, builds each project as Any CPU.
- Written on 2026-09-27 with the estate itself, the owner's payment chain in miniature, so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../tests/integration/programs/csharp/estate/README.md)). Gained a Live Doc on 2026-10-22, when discovery's default became every file outside the owner's list of files never documented ([Turn 8 of the October 21 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
