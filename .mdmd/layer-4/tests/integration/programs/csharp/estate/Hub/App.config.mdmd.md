# tests/integration/programs/csharp/estate/Hub/App.config

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/csharp/estate/Hub/App.config
- Generated At: 2026-10-02T20:20:04.953Z

## Authored
### Purpose
The hub's configuration: the service it hosts at `net.tcp://hub.onprem.example:8731/PaymentHub`, and one client endpoint per workload and environment for the payment services behind it, `PaymentService.Consumer.Production` and `.Staging`, whose names `ServiceRouting` builds at run time.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../tests/integration/programs/csharp/estate/README.md)). The configuration adapter publishes the service, its listening address (the door the gateway's client address matches, observed from configuration) and the two client endpoints, and links the service name and the contracts to `PaymentHub.cs`, `IPaymentHub.cs` and `IPaymentService.cs`. The production client address matches the payment service's listening address, the second remote hop observed from configuration; the staging one matches nothing in the estate and stays as an external. The hub's run-time endpoint names are the hop no scan gives.

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
