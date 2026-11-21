In the Live Docs Explorer, four files depend on `Contracts/IPaymentService.cs`:

- `PaymentService/PaymentService.cs`, which is most likely the main implementation.
- `Hub/PaymentHub.cs`
- `PaymentService/App.config`
- `Hub/App.config`

I didn't open the code in any of these files. I'm going by the explorer's Dependents list for the file.

Going the other way, `IPaymentService.cs` itself depends on three other contract files: `PaymentQuery.cs`, `PaymentRequest.cs` and `PaymentResult.cs`. It exposes `IPaymentService`, `Post` and `Get`.

The explorer's purpose and notes fields for this file both say "Pending authored purpose" and "Pending notes". It also says some references fall outside the scan (15 dependencies), so there could be users it can't see.
