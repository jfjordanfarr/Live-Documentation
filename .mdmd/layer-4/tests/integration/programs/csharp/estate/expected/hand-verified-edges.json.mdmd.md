# tests/integration/programs/csharp/estate/expected/hand-verified-edges.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/csharp/estate/expected/hand-verified-edges.json
- Generated At: 2026-10-02T20:20:05.377Z

## Authored
### Purpose
The twenty edges of the estate that a reader verified by hand, each with how it is carried (`via`) and whether it is a hop between deployments that no compiler can see (`remote`). `oracle:compare` reports which of them the shipped generator finds and which it misses, and the board test checks that every remote one is drawn as a wire between two things.

### Notes
- Written on 2026-09-27 with the estate ([Turn 2](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-2)) as the measure beyond the compiler's 37 edges: 3 of 20 were found that morning, 8 after the C# rewrite, 17 after the openings of 2026-09-28. The three still missing are the ones no scan of the files honestly gives, a designer file's fields to the page's control ids, endpoint names the hub builds at run time, and a row type matched to a procedure by its result columns; [Openings](../../../../../../../layer-3/openings.mdmd.md) names them. Nothing here is trimmed to fit the adapter: an edge it cannot find stays as a missing one.
- The paths are relative to this file's folder and `readHandVerifiedEdges` in `scripts/oracle/files.ts` resolves them against the program.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `convention` {#symbol-convention}
- Type: key

#### `edges` {#symbol-edges}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`CENTRAL.ACCOUNT`](../Database/Oracle/CENTRAL.ACCOUNT.sql.mdmd.md)
- [`dbo.Payment`](../Database/SqlServer/dbo.Payment.sql.mdmd.md)
- [`dbo.usp_PostPayment`](../Database/SqlServer/dbo.usp_PostPayment.sql.mdmd.md)
- [`PaymentsController`](../Gateway/Controllers/PaymentsController.cs.mdmd.md)
- [`GatewaySettings`](../Gateway/GatewaySettings.cs.mdmd.md)
- [`HubProxy`](../Gateway/Wcf/HubProxy.cs.mdmd.md)
- [`Web`](../Gateway/Web.config.mdmd.md)
- [`App`](../Hub/App.config.mdmd.md)
- [`PaymentHub`](../Hub/PaymentHub.cs.mdmd.md)
- [`App`](../PaymentService/App.config.mdmd.md)
- [`Payment`](../PaymentService/Data/Payment.cs.mdmd.md)
- [`PaymentsContext`](../PaymentService/Data/PaymentsContext.cs.mdmd.md)
- [`PostPaymentRow`](../PaymentService/Data/PostPaymentRow.cs.mdmd.md)
- [`PaymentService`](../PaymentService/PaymentService.cs.mdmd.md)
- [`Globals`](../Portal/App_Code/Globals.cs.mdmd.md)
- [`PaymentsController`](../Portal/Controllers/PaymentsController.cs.mdmd.md)
- [`Default`](../Portal/Pages/Default.aspx.mdmd.md)
- [`Default.aspx`](../Portal/Pages/Default.aspx.cs.mdmd.md)
- [`Default.aspx.designer`](../Portal/Pages/Default.aspx.designer.cs.mdmd.md)
- [`portal`](../Portal/Scripts/portal.js.mdmd.md)
- [`GatewayClient`](../Portal/Services/GatewayClient.cs.mdmd.md)
- [`Web`](../Portal/Web.config.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
