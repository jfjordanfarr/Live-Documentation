Four files depend on `Contracts/IPaymentService.cs`, according to the Live Docs Explorer map:

- `Hub/PaymentHub.cs`
- `PaymentService/PaymentService.cs`
- `Hub/App.config`
- `PaymentService/App.config`

The two `.config` files are probably configuration that refers to the service, not code that calls it. The map doesn't say how each one uses the interface.

The map's sidebar also notes 15 dependencies outside the scanned set, so there may be more users it can't see. The panel's Dependents list is what the tool shows, not a full search.

I only opened the file's panel and menu, so nothing was changed.
