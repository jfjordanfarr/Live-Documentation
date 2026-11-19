The PaymentService folder has six files. Most of them connect through one chain, and I read the direction of the links from the Local Map. The map doesn't label them, so treat the directions as my best reading.

**Data subfolder**
- `Payment.cs` and `PostPaymentRow.cs` are the basic data types. Both feed into `PaymentsContext.cs`, which holds the payments data context.
- `Payment.cs` and `PostPaymentRow.cs` also link directly to `PaymentService.cs`, so the service uses them as well as going through the context.
- `PaymentsContext.cs` links to `PaymentService.cs`, the main service class.

**Top level of the folder**
- `PaymentService.cs` is the hub. It has the most links, about 12 in total, and its Data links come from the files above.
- `App.config` links into `PaymentsContext.cs`, which looks like the config feeding the data context. It also has a cycle with `PaymentService.cs`, and the map flags "1 connection returns in a cycle" on both. The service and its config refer to each other.
- `PaymentService.csproj` is the project file. It has only one connection, and the map shows it attached to `PaymentService.cs`.

**In short:** `Payment.cs` and `PostPaymentRow.cs` feed `PaymentsContext.cs`, which feeds `PaymentService.cs`. `App.config` configures that stack, and `PaymentService.csproj` just ties the project together.

Your link had no folder called "PaymentService" on the World Map. The closest match was the "payments" service, so I found the folder by searching and opened it in the Local Map. I also expanded its Data subfolder.
