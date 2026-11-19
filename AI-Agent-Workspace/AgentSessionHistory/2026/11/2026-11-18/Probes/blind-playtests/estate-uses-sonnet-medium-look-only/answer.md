Going by the Local Map for `Contracts/IPaymentService.cs`, four files in the payments code are linked to it:

- **`PaymentService/PaymentService.cs`**: the on-premises implementation of the interface.
- **`Hub/PaymentHub.cs`**: connected through its internals.
- **`PaymentService/App.config`**: connected through its internals.
- **`Hub/App.config`**: connected through its internals.

The map also shows links to `PaymentResult.cs`, `PaymentQuery.cs` and `PaymentRequest.cs`. These sit in the same `Contracts` folder, and the interface's methods (`Get`, `Post`) are connected to them.

I read all of this from the diagram's connecting lines, not from the code. I didn't open each file to check how it uses the interface. The map's footer says 36 files and 95 references were scanned, so anything outside that scan wouldn't appear.
