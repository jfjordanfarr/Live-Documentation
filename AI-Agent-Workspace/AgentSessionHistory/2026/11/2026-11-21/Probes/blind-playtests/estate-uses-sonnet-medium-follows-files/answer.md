In this tool's local map for `Contracts/IPaymentService.cs`, four files are linked to it as users:

- **`PaymentService/PaymentService.cs`** is the on-prem WCF payment service. It's the implementation.
- **`Hub/PaymentHub.cs`** is linked to it.
- **`PaymentService/App.config`** is linked to it.
- **`Hub/App.config`** is linked to it.

I read this from the map's connection lines, and the diagram is dense. The two `App.config` links are probably configuration that refers to the interface by name, and I didn't confirm that. The `PaymentHub.cs` link is also unconfirmed: I couldn't tell whether it implements the interface or calls it.

The map also links the interface to `PaymentResult.cs`, `PaymentQuery.cs` and `PaymentRequest.cs`, which sit in the same `Contracts` folder. These look like types the interface's methods (`Get`, `Post`) depend on, so I'm not counting them as users of the file.

The sidebar footer says the scan covered 36 files, with 15 dependencies outside it. Anything outside that scan wouldn't show up on this map.
