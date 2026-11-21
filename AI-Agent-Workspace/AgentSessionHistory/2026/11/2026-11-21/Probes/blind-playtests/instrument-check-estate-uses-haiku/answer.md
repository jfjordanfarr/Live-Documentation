Four files use `Contracts/IPaymentService.cs`, according to the map's Dependents list for that file:

1. **Hub/App.config**
2. **Hub/PaymentHub.cs**
3. **PaymentService/App.config**
4. **PaymentService/PaymentService.cs**

The `PaymentService/PaymentService.cs` entry is probably the main implementation of the interface. The two `App.config` files are config references rather than code calls.

The same panel lists what the interface itself depends on: `PaymentQuery.cs`, `PaymentRequest.cs` and `PaymentResult.cs`, all in `Contracts/`.

I only read the map in the browser, so this is the tool's view of the dependencies. I didn't check the source code.
