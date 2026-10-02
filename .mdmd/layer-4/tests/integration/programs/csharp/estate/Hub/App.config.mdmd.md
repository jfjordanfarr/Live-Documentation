# tests/integration/programs/csharp/estate/Hub/App.config

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/csharp/estate/Hub/App.config
- Generated At: 2026-10-02T20:20:04.953Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Estate.Hub.PaymentHub` {#symbol-estatehubpaymenthub}
- Type: service
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Hub/App.config#L5)

#### `net.tcp://hub.onprem.example:8731/PaymentHub` {#symbol-nettcphubonpremexample8731paymenthub}
- Type: address
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Hub/App.config#L6)

#### `PaymentService.Consumer.Production` {#symbol-paymentserviceconsumerproduction}
- Type: endpoint
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Hub/App.config#L12)

#### `PaymentService.Consumer.Staging` {#symbol-paymentserviceconsumerstaging}
- Type: endpoint
- Source: [source](../../../../../../../../tests/integration/programs/csharp/estate/Hub/App.config#L15)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `net.tcp://payments-staging.onprem.example:8732/PaymentService` (configuration)
- [`IPaymentHub`](../Contracts/IPaymentHub.cs.mdmd.md#symbol-ipaymenthub)
- [`IPaymentService`](../Contracts/IPaymentService.cs.mdmd.md#symbol-ipaymentservice)
- [`PaymentHub`](./PaymentHub.cs.mdmd.md#symbol-paymenthub)
- [`App.net.tcp://payments.onprem.example:8732/PaymentService`](../PaymentService/App.config.mdmd.md#symbol-nettcppaymentsonpremexample8732paymentservice) (configuration)
<!-- LIVE-DOC:END Dependencies -->
