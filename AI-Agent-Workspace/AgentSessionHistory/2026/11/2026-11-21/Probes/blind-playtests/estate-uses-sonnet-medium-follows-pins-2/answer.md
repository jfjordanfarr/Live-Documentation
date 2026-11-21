Four files in this scan use `Contracts/IPaymentService.cs`. I read them off the Local Map, where the file's outgoing links lead to:

1. **`PaymentService/PaymentService.cs`**: the `PaymentService` class, described on the map as the on-prem WCF payment service. This is the main implementation.
2. **`PaymentService/App.config`**: its link goes to the "Internals" entry, so it refers to the interface through configuration.
3. **`Hub/PaymentHub.cs`**: it links to the interface through "Internals".
4. **`Hub/App.config`**: its link also goes to "Internals".

The file defines `IPaymentService`, with `Get` and `Post` operations. The other files in `Contracts` (`PaymentResult.cs`, `PaymentQuery.cs` and `PaymentRequest.cs`) link to those operations from the same side. They're the types the interface uses, not users of it.

I read the connections from the graph, not from a written list of references. The scan covers 36 files and 95 references, so a caller outside the scan wouldn't show up.
