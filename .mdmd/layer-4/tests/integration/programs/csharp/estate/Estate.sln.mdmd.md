# tests/integration/programs/csharp/estate/Estate.sln

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Estate.sln
- Generated At: 2026-11-19T20:43:09.167Z

## Authored
### Purpose
The estate's Visual Studio solution: the five projects that build together (Contracts, Portal, Gateway, Hub and PaymentService), and the file through which the compiler oracle indexes the estate.

### Notes
- `oracle:index` looks for the one `.sln` at a fixture's root and runs scip-dotnet over it ([`index-fixture.ts`](../../../../../../../scripts/oracle/index-fixture.ts)); the compiler's edges record it as their project file. Since November 19, 2026 the solution reader draws its five wires to the projects it names, the same five `dotnet sln list` reports ([the .NET gaps probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/dotnet-gaps/README.md)). Every configuration, Debug or Release on any platform, builds each project as Any CPU.
- Written on 2026-09-27 with the estate itself, the owner's payment chain in miniature, so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../tests/integration/programs/csharp/estate/README.md)). Gained a Live Doc on 2026-10-22, when discovery's default became every file outside the owner's list of files never documented ([Turn 8 of the October 21 session](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-21/2026-10-21.1.record.md#turn-8)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Contracts`](./Contracts/Contracts.csproj.mdmd.md#symbol-contracts)
- [`Gateway`](./Gateway/Gateway.csproj.mdmd.md#symbol-gateway)
- [`Hub`](./Hub/Hub.csproj.mdmd.md#symbol-hub)
- [`PaymentService`](./PaymentService/PaymentService.csproj.mdmd.md#symbol-paymentservice)
- [`Portal`](./Portal/Portal.csproj.mdmd.md#symbol-portal)
<!-- LIVE-DOC:END Dependencies -->
