Four files depend on `Contracts/IPaymentService.cs`, according to the Dependents tab in the Live Docs Explorer:

1. `Hub/App.config`
2. `Hub/PaymentHub.cs`
3. `PaymentService/App.config`
4. `PaymentService/PaymentService.cs`

The map shows `PaymentService/PaymentService.cs` on the right side, next to the interface, so it is probably the implementation. The Dependents list doesn't say which entries are implementers and which are callers, so I couldn't confirm that from the page.

The three files on the left (`PaymentResult.cs`, `PaymentQuery.cs`, `PaymentRequest.cs`) are things this interface depends on, not things that use it.
