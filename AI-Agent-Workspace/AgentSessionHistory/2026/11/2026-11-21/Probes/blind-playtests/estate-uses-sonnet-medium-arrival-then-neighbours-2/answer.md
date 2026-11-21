Four files use `Contracts/IPaymentService.cs`. I got this from the Dependents list in the Live Docs Explorer panel for the file:

1. `PaymentService/PaymentService.cs`
2. `Hub/PaymentHub.cs`
3. `PaymentService/App.config`
4. `Hub/App.config`

The file defines `IPaymentService` with the `Post` and `Get` members. It depends on `PaymentQuery.cs`, `PaymentRequest.cs` and `PaymentResult.cs`, all in `Contracts`.

I only looked at the explorer's Dependents list. I didn't open any of the source files. The two `App.config` entries presumably reference the interface in configuration, but I didn't check that.

The panel's purpose and notes sections for this file are still empty ("Pending authored purpose" and "Pending notes").
