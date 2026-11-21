Going by the map, three files use `IPaymentService.cs`, though I only read this from the graph's lines, so the exact kind of link is my interpretation.

- **`PaymentService/PaymentService.cs`** is the on-prem WCF payment service. The map links it to the interface, and I assume it implements it.
- **`Hub/PaymentHub.cs`** has links from the interface into its internals.
- **`App.config`**: the map draws a link from the interface to an App.config in the PaymentService folder. A second App.config at the far right, which I couldn't see in full, also has a link.

`PaymentResult.cs`, `PaymentQuery.cs` and `PaymentRequest.cs` sit next to it in the same Contracts folder and connect to it. Those look like types the interface itself uses, not files that use it.

The footer says 36 files and 95 references were scanned, plus 15 dependencies outside the scan. The map doesn't count those, so there could be other users I haven't seen. If you need a firm answer, search the codebase for `IPaymentService`.
