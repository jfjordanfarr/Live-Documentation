I opened the PaymentService folder in the Local Map and expanded its Data subfolder. I read the links off the diagram, and a few directions were hard to make out, so treat those as approximate.

**What's in it**
- Top level: `PaymentService.cs`, `App.config` and `PaymentService.csproj`.
- `Data` subfolder: `PaymentsContext.cs`, `Payment.cs` and `PostPaymentRow.cs`.

**How they connect**
- **`PaymentsContext.cs`** is the hub of the Data folder. `Payment.cs` and `PostPaymentRow.cs` both link into it, which fits a database context that works with those two data types.
- **`PaymentService.cs`** is the main service class. It links to `PaymentsContext.cs`, so it reaches the database through the context. It also links to `Payment.cs` and `PostPaymentRow.cs`. It has the most connections, about 9 or more.
- **`App.config`** links with the Data files and `PaymentService.cs`. The map flags a "connection returns in a cycle" for both `App.config` and `PaymentService.cs`, meaning they reference each other. The config is probably what ties the service to its settings. The search results show it holds the service name `Estate.Payments.PaymentService` and an `net.tcp://payments.onprem.example:8732/PaymentService` address.
- **`PaymentService.csproj`** is the project file. It shows just one connection and isn't linked to the code files in the diagram.

Outside the folder, the search also showed `Contracts/IPaymentService.cs`, which defines the service interface. `Hub/App.config` refers to the service as a consumer, with Production and Staging entries.
