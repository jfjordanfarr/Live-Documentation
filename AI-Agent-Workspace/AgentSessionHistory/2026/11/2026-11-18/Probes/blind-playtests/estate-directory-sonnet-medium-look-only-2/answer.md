I opened PaymentService in the Local Map and expanded its Data subfolder. It holds six files, and they connect as follows. I read the links from the lines in the map, which are thin where they cross, so the exact directions may not be perfect.

**Data subfolder**
- **PostPaymentRow.cs** and **Payment.cs** are the row and entity types. Both link into **PaymentsContext.cs**, the data context, and both also link directly to **PaymentService.cs**.
- **PaymentsContext.cs** links on to **PaymentService.cs**.

**Top level**
- **PaymentService.cs** is the hub. It has the most connections (about 12), and it uses the Data files above.
- **App.config** is linked with PaymentService.cs. The map flags a cycle on both of them ("1 connection returns in a cycle"), so each depends on the other.
- **PaymentService.csproj** is the project file. It has only one connection and sits apart from the rest.

In the wider World Map, this folder is the "payments" service (6 files). It connects to the "hub" service and to the sqlserver and oracle databases.
