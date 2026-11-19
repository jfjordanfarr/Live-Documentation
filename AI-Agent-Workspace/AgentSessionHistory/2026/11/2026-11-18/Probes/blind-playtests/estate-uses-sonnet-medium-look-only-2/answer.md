Four files appear to use `Contracts/IPaymentService.cs`. I read this from the Local Map graph in the explorer, so the connections are only as exact as the lines I could trace.

- **`PaymentService/PaymentService.cs`** looks like the main implementation. It links to both the `IPaymentService` symbol and the file's internals.
- **`Hub/PaymentHub.cs`** links to it through its internals.
- **`PaymentService/App.config`** has a link, which is probably a configuration reference.
- **`Hub/App.config`** has a link too, probably a configuration reference as well.

The other files in `Contracts`, which are `PaymentResult.cs`, `PaymentQuery.cs` and `PaymentRequest.cs`, are also connected to it. They look like the types the interface's `Get` and `Post` members work with, so they are things it depends on rather than users of it.

The graph shows 36 files in the scan, and some usages could sit outside the scan. I only looked at the Local Map view, with "Show Tests" on, and no test files showed up as users.
