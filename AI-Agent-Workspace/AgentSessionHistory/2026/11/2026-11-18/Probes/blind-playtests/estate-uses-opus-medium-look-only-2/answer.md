Four files use it, in two parts of the code. I got this from the "Local Map" diagram your colleague's link opens. I hovered over the `IPaymentService` interface (the one thing the file defines) and checked which links lit up.

**PaymentService**
- **PaymentService.cs**: the `PaymentService` class uses the interface, and so does the internal code in that file.
- **App.config**: this settings file also refers to it, most likely to register which version of the service gets used.

**Hub**
- **PaymentHub.cs**: its internal code uses the interface.
- **App.config**: the Hub's own settings file also refers to it.

The links run the other way too: `IPaymentService.cs` itself uses `PaymentResult.cs`, `PaymentQuery.cs` and `PaymentRequest.cs`, all in the same Contracts folder. Its `Get` and `Post` entries have no links, so the map doesn't show anything calling those two directly.
