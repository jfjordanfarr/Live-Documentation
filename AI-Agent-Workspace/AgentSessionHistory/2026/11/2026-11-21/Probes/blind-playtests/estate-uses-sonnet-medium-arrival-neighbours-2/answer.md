I checked the Live Docs Explorer page for `Contracts/IPaymentService.cs`. Four files use it:

- `Hub/PaymentHub.cs`
- `Hub/App.config`
- `PaymentService/PaymentService.cs`
- `PaymentService/App.config`

The interface itself depends on `PaymentQuery.cs`, `PaymentRequest.cs` and `PaymentResult.cs`, all in `Contracts/`. It exposes `IPaymentService`, `Get` and `Post`.

The page's purpose and notes sections for this file are still empty ("Pending"). The footer also says the scan covers 36 files and found 15 dependencies outside it. This list may therefore miss users that were not scanned.
