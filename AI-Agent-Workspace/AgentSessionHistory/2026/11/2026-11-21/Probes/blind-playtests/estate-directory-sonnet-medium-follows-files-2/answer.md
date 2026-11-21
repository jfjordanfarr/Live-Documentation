I opened PaymentService in the Local Map. It holds six files. The Data subfolder is expanded and has three of them. I read the connections from the line colours (blue is "offers", green is "uses"), so the directions are my best reading.

**Top level**
- `PaymentService.cs` is the main file and the hub of the folder, with about 12 connections. It uses `App.config` and the files in Data (`PostPaymentRow.cs`, `Payment.cs` and `PaymentsContext.cs`).
- `App.config` has 3 symbols. It connects with `PaymentService.cs` and `PaymentsContext.cs`, and the map flags "1 connection returns in a cycle" for it.
- `PaymentService.csproj` is the project file. It has only 1 symbol and 1 connection, so it is barely linked to the rest.

**Data subfolder**
- `PaymentsContext.cs` is the centre of Data. It is a database-context-style file with 6 symbols. `PostPaymentRow.cs`, `Payment.cs` and `App.config` all link into it, and it also links up to `PaymentService.cs`.
- `PostPaymentRow.cs` has 4 symbols and feeds `PaymentsContext.cs`. It also links up to `PaymentService.cs`.
- `Payment.cs` is the model, with 6 symbols. It feeds `PaymentsContext.cs` and `PaymentService.cs`.

**Overall flow**
`PaymentService.cs` sits on top. It relies on `PaymentsContext.cs`, which is built from `Payment.cs` and `PostPaymentRow.cs` and reads settings from `App.config`. `PaymentService.cs` also uses `App.config` directly.

The `.csproj` file sat partly off-screen, so I only read its connection count and didn't check what it links to.
