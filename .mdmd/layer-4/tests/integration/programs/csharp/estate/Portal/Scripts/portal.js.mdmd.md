# tests/integration/programs/csharp/estate/Portal/Scripts/portal.js

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/estate/Portal/Scripts/portal.js
- Generated At: 2026-10-02T20:20:05.314Z

## Authored
### Purpose
Drives the payment form without postbacks: reads the server-authored values from the hidden fields, posts a payment and looks one up through the portal's own Web API by `fetch`, and hides the form when payments are disabled.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../../tests/integration/programs/csharp/estate/README.md)). Two hand-verified hops: to the page by the element ids it reads, which the DOM heuristic links, and to the portal's controller by the two routes it fetches, which the routes heuristic links at home, observed from a contract. The relative URL is what makes home win over the gateway's identical routes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`PaymentsController.GET api/payments/{paymentId}`](../Controllers/PaymentsController.cs.mdmd.md#symbol-get-apipaymentspaymentid) (contract)
- [`PaymentsController.POST api/payments`](../Controllers/PaymentsController.cs.mdmd.md#symbol-post-apipayments) (contract)
- [`Default.paymentForm`](../Pages/Default.aspx.mdmd.md#symbol-paymentform)
- [`Default.paymentStatus`](../Pages/Default.aspx.mdmd.md#symbol-paymentstatus)
<!-- LIVE-DOC:END Dependencies -->
