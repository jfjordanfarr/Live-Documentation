I opened the PaymentService folder in the Local Map. It holds three files at the top level and a `Data` subfolder with three more. I read the links from the on-screen lines and badges rather than the underlying data, so the exact wiring is my best reading.

**Top level**
- **PaymentService.cs** is the main code file. It has the most links (badge says "+9 connections") and is the hub of the folder. Its "+3 symbols" and "1 connection returns in a cycle" are shown on the card. It links to App.config, which is the most direct connection I could see.
- **App.config** holds settings. It has about 2 connections, and it sits to the left of PaymentService.cs. The map also shows it reaching out of the folder to a file on the left edge.
- **PaymentService.csproj** is the project file. It has one connection (the badge says "+1 connection"), and the map does not show a line running directly to the code files.

**Data subfolder** (PaymentService/Data)
- **PaymentsContext.cs** has a link to PaymentService.cs and about one more connection. It is the data-access context.
- **PostPaymentRow.cs** and **Payment.cs** are data model files. Their lines run up to App.config and PaymentService.cs, which suggests the code reads and writes these models.

In short, PaymentService.cs sits in the middle. The Data files feed into it, and App.config supplies its settings. The csproj only holds the project together. At the estate level, the PaymentService node is a service that talks to the hub and a SQL Server database, and it is linked by an IPsec tunnel to the on-prem side.

I did not click individual edges, so if you need the exact call-by-call links, hovering each file or opening its details panel would confirm them.
