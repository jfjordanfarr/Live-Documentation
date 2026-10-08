# tests/integration/programs/csharp/estate/PaymentService/PaymentService.csproj

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/csharp/estate/PaymentService/PaymentService.csproj
- Generated At: 2026-10-02T20:20:05.122Z

## Authored
### Purpose
The on-prem payment service's project: a .NET Framework 4.8 WCF service on Entity Framework 6, standing on the contracts library, the `EntityFramework` package and the WCF, data and annotations assemblies.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../tests/integration/programs/csharp/estate/README.md)). Read by the project adapter; its package reference with a version is what the board lists as something the `payments` thing stands on, `EntityFramework@6.5.1`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PaymentService` {#symbol-paymentservice}
- Type: library
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/PaymentService.csproj#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `EntityFramework@6.5.1`
- `System.ComponentModel.DataAnnotations`
- `System.Data`
- `System.ServiceModel`
- [`Contracts`](../Contracts/Contracts.csproj.mdmd.md#symbol-contracts)
<!-- LIVE-DOC:END Dependencies -->
