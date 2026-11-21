I opened PaymentService in the Local Map. It has 6 files: three at the top level and three in a `Data` subfolder. I read the links from the drawn lines, so the exact direction of a few of them is my best reading.

**Top level**
- `PaymentService.cs` is the main file. It has the most links (about 12) and depends on the rest of the folder.
- `App.config` is a configuration file. `PaymentService.cs` uses it, and the map flags one of its connections as "returns in a cycle". That means a link leads back to where it started.
- `PaymentService.csproj` is the project file. It has just one connection.

**`Data` subfolder**
- `Payment.cs` and `PostPaymentRow.cs` are data model files.
- `PaymentsContext.cs` is the data-access file. It uses both `Payment.cs` and `PostPaymentRow.cs`.

**How they connect**
1. `Payment.cs` and `PostPaymentRow.cs` feed into `PaymentsContext.cs`.
2. `PaymentsContext.cs` feeds up into `PaymentService.cs`. The service goes through the context to reach the data.
3. `Payment.cs` and `PostPaymentRow.cs` also link to `PaymentService.cs` and `App.config` directly.
4. `App.config` and `PaymentService.cs` are linked to each other, and that link is the cycle the map flags.

There was no folder with exactly this name on the World Map. I opened the "payments" service there, which has 6 files, and searching for "PaymentService" took me to this folder.
