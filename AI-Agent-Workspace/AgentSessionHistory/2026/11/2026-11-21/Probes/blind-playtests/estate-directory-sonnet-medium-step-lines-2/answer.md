I opened the PaymentService folder. It holds five files, plus a Data subfolder with three of them. I read the links from the map's lines, so the exact direction of a few is my best reading.

**Top level**
- **PaymentService.cs** is the hub of the folder. It has the most connections, about 12 in total. It connects to App.config and to all three Data files. App.config also links back to it, which the map flags as a cycle.
- **App.config** is wired up as the service's configuration. It connects to PaymentService.cs and to the Data files, mainly PaymentsContext.cs.
- **PaymentService.csproj** is the project file. It has only one connection, and I didn't expand it.

**Data subfolder**
- **PaymentsContext.cs** is the database context. It connects to Payment.cs and PostPaymentRow.cs, and PaymentService.cs reaches it through that link.
- **Payment.cs** and **PostPaymentRow.cs** are the data model classes. Both feed into PaymentsContext.cs and are used by PaymentService.cs.

**In short:** PaymentService.cs calls into PaymentsContext.cs, which works with the Payment and PostPaymentRow classes. App.config supplies the settings, and the .csproj sits apart as the build file.

On the wider map, this service is "payments". It connects across to the on-prem databases (sqlserver and oracle) and to the "hub" service, and an IPsec tunnel is declared on the on-prem side.
