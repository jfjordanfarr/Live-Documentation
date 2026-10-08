# tests/integration/programs/csharp/estate/Contracts/Contracts.csproj

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/csharp/estate/Contracts/Contracts.csproj
- Generated At: 2026-10-02T20:20:04.709Z

## Authored
### Purpose
The shared contracts library of the estate: a .NET Framework 4.8 class library with no project references, standing on `System.ServiceModel` and `System.Runtime.Serialization` for its WCF service and data contracts. The gateway, the hub and the payment service reference it; the portal does not, since it talks JSON to the gateway.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../tests/integration/programs/csharp/estate/README.md)). Its doc is the project adapter's work: the project as a `library` symbol and its assembly references as externals. The three project references to it are what `oracle:compare` counts under project references, 3 of 3.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Contracts` {#symbol-contracts}
- Type: library
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/Contracts.csproj#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `System.Runtime.Serialization`
- `System.ServiceModel`
<!-- LIVE-DOC:END Dependencies -->
