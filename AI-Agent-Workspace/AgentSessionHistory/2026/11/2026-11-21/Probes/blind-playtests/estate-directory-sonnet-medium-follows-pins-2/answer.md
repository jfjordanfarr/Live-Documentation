I opened PaymentService in the Local Map. It holds six files: `App.config`, `PaymentService.cs` and `PaymentService.csproj` at the top level, plus a `Data` subfolder with three more. I read the link directions from the map's "offers" and "uses" markers, so treat them as my best reading. I didn't trace the `.csproj` link.

**Top level**
- **`PaymentService.cs`** is the main file and the most connected, with about 12 connections in the map. It uses `App.config`, and that link runs in a cycle, so the two reference each other. It also reaches into the Data files described below.
- **`App.config`** has 3 symbols. Besides the cycle with `PaymentService.cs`, it links to `PaymentsContext.cs` in Data.
- **`PaymentService.csproj`** is the project file. The map shows it with 1 connection.

**`Data` subfolder**
- **`PaymentsContext.cs`** is the hub of this folder. It uses `Payment.cs` and `PostPaymentRow.cs`. `PaymentService.cs` also uses it.
- **`Payment.cs`** and **`PostPaymentRow.cs`** are the data types. `PaymentsContext.cs` and `PaymentService.cs` both use them.

In short, `PaymentService.cs` sits on top and works with `App.config` and the Data files. `PaymentsContext.cs` ties together the two model files, `Payment.cs` and `PostPaymentRow.cs`.
