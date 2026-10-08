# tests/integration/programs/csharp/estate/Contracts/PaymentQuery.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Contracts/PaymentQuery.cs
- Generated At: 2026-10-02T20:20:04.758Z

## Authored
### Purpose
The data contract for looking a posted payment up: its id, and the workload and environment the gateway stamps so that the hub can route the lookup. Shared by the gateway, the hub and the payment service.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../tests/integration/programs/csharp/estate/README.md)). A plain data contract: the compiler oracle sees every use of it and the C# adapter matches those edges. The portal has its own models and meets this type only as JSON.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PaymentQuery` {#symbol-paymentquery}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/PaymentQuery.cs#L7)

##### `PaymentQuery` — Summary
Looks up a posted payment by id within a workload and environment.

#### `PaymentId` {#symbol-paymentid}
- Type: property
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/PaymentQuery.cs#L9)

#### `Workload` {#symbol-workload}
- Type: property
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/PaymentQuery.cs#L10)

#### `Environment` {#symbol-environment}
- Type: property
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Contracts/PaymentQuery.cs#L11)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
