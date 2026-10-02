# tests/integration/programs/csharp/estate/expected/compiler-edges.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/csharp/estate/expected/compiler-edges.json
- Generated At: 2026-10-02T20:20:05.362Z

## Authored
### Purpose
The file-to-file edges the compiler resolved for the `programs/csharp` sample program, written by `npm run oracle:index`; the ground truth `oracle:compare` measures the adapter against.

### Notes
- Never hand-edited. Regenerate with `oracle:index` after changing the program; nothing in it is trimmed to fit the adapter.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `tool` {#symbol-tool}
- Type: key

#### `projectFile` {#symbol-projectfile}
- Type: key

#### `projects` {#symbol-projects}
- Type: key

#### `documents` {#symbol-documents}
- Type: key

#### `outside` {#symbol-outside}
- Type: key

#### `edges` {#symbol-edges}
- Type: key

#### `ambiguous` {#symbol-ambiguous}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`IPaymentHub`](../Contracts/IPaymentHub.cs.mdmd.md)
- [`IPaymentService`](../Contracts/IPaymentService.cs.mdmd.md)
- [`PaymentQuery`](../Contracts/PaymentQuery.cs.mdmd.md)
- [`PaymentRequest`](../Contracts/PaymentRequest.cs.mdmd.md)
- [`PaymentResult`](../Contracts/PaymentResult.cs.mdmd.md)
- [`PaymentsController`](../Gateway/Controllers/PaymentsController.cs.mdmd.md)
- [`GatewaySettings`](../Gateway/GatewaySettings.cs.mdmd.md)
- [`HubProxy`](../Gateway/Wcf/HubProxy.cs.mdmd.md)
- [`PaymentHub`](../Hub/PaymentHub.cs.mdmd.md)
- [`ServiceRouting`](../Hub/ServiceRouting.cs.mdmd.md)
- [`Payment`](../PaymentService/Data/Payment.cs.mdmd.md)
- [`PaymentsContext`](../PaymentService/Data/PaymentsContext.cs.mdmd.md)
- [`PostPaymentRow`](../PaymentService/Data/PostPaymentRow.cs.mdmd.md)
- [`PaymentService`](../PaymentService/PaymentService.cs.mdmd.md)
- [`Globals`](../Portal/App_Code/Globals.cs.mdmd.md)
- [`PaymentsController`](../Portal/Controllers/PaymentsController.cs.mdmd.md)
- [`PaymentRequestModel`](../Portal/Models/PaymentRequestModel.cs.mdmd.md)
- [`PaymentResultModel`](../Portal/Models/PaymentResultModel.cs.mdmd.md)
- [`Default.aspx`](../Portal/Pages/Default.aspx.cs.mdmd.md)
- [`Default.aspx.designer`](../Portal/Pages/Default.aspx.designer.cs.mdmd.md)
- [`GatewayClient`](../Portal/Services/GatewayClient.cs.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
