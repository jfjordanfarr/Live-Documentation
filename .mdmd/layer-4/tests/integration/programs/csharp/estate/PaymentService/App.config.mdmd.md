# tests/integration/programs/csharp/estate/PaymentService/App.config

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/csharp/estate/PaymentService/App.config
- Generated At: 2026-10-02T20:20:05.019Z

## Authored
### Purpose
The payment service's configuration: the `PaymentsDb` connection string to the on-prem SQL Server, and the service it hosts at `net.tcp://payments.onprem.example:8732/PaymentService`.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../tests/integration/programs/csharp/estate/README.md)). The configuration adapter publishes the connection string and the listening address (the door the hub's production client endpoint matches, observed from configuration) and links the service name and contract to `PaymentService.cs` and `IPaymentService.cs`; `PaymentsContext.cs` reaches the connection string by name through a constant, a hand-verified hop.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PaymentsDb` {#symbol-paymentsdb}
- Type: connection-string
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/App.config#L4)

#### `Estate.Payments.PaymentService` {#symbol-estatepaymentspaymentservice}
- Type: service
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/App.config#L10)

#### `net.tcp://payments.onprem.example:8732/PaymentService` {#symbol-nettcppaymentsonpremexample8732paymentservice}
- Type: address
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/PaymentService/App.config#L11)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`IPaymentService`](../Contracts/IPaymentService.cs.mdmd.md#symbol-ipaymentservice)
- [`PaymentService`](./PaymentService.cs.mdmd.md#symbol-paymentservice)
<!-- LIVE-DOC:END Dependencies -->
