Four things use `Contracts/IPaymentService.cs`, according to the Dependents section of the file's Inspect panel:

1. **Hub/PaymentHub.cs**: code that uses the interface.
2. **PaymentService/PaymentService.cs**: code that uses the interface. This is the on-prem WCF payment service, and it implements the interface.
3. **Hub/App.config**: a config file that references it.
4. **PaymentService/App.config**: a config file that references it.

The file itself depends on `PaymentQuery.cs`, `PaymentRequest.cs` and `PaymentResult.cs` in the same Contracts folder. It exposes the public symbols `IPaymentService`, `Post` and `Get`.

The map view also shows connections to `PaymentResult.cs` and `PaymentQuery.cs` on the left, but I didn't read their direction clearly, so I'm relying on the Dependents list. The file's purpose field just says "Pending authored purpose", so there's no written description.

While exploring I zoomed the map, pinned a node (the pin counter shows 1), and opened the inspect panel. I didn't change any code or data.
