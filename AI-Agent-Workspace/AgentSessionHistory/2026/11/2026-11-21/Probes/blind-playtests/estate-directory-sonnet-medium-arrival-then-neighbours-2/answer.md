I opened the PaymentService folder in the Local Map. It holds three files, plus a Data subfolder with three more.

**Top level**
- `PaymentService.cs` is the main file. It has a link to `App.config`, which is its configuration.
- `PaymentService.csproj` is the project file. It shows only one connection.
- `App.config` has links in both directions. `PaymentService.cs` reads it, and it also connects to the Data files.

**Data subfolder**
- `Payment.cs` and `PostPaymentRow.cs` are the data models. Both connect to `PaymentsContext.cs`.
- `PaymentsContext.cs` is the hub of the folder. It uses the two models above, and `PaymentService.cs` uses it.

The overall flow is `PaymentService.cs` → `PaymentsContext.cs` → `Payment.cs` and `PostPaymentRow.cs`. `App.config` is linked to both `PaymentService.cs` and the Data files.

The map draws the links as unlabeled curves, so I read the direction and the `App.config` links from how they looked. The `App.config` links are the part I'm least sure of. The map also marks a few connections as returning in a cycle, which I didn't look into.
