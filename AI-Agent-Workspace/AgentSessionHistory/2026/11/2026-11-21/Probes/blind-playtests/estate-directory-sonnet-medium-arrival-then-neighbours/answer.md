I opened the PaymentService folder in the Local Map. It holds three files plus a Data subfolder with three more. In the map's wording, a file "offers" what another file "uses". I read the arrows by eye, so the exact directions are my best reading rather than certain.

**Top level**
- **PaymentService.cs** is the main file. It uses almost everything else: the three Data files, and App.config. It has the most connections (about 12).
- **App.config** holds the service's settings. It links to PaymentService.cs and to PaymentsContext.cs. The map flags one of its connections as a cycle that returns to it. I think that is the link between PaymentService.cs and App.config, but I couldn't confirm it.
- **PaymentService.csproj** is the project file. It shows only one connection and no visible links to the other files.

**Data subfolder**
- **Payment.cs** and **PostPaymentRow.cs** are the data types. Each feeds into PaymentsContext.cs, and each also links straight to PaymentService.cs.
- **PaymentsContext.cs** is the database context. It uses Payment.cs and PostPaymentRow.cs, and PaymentService.cs uses it in turn.

**How it fits together:** PaymentService.cs sits on top. It calls PaymentsContext.cs, which builds on Payment.cs and PostPaymentRow.cs, and it also reads App.config. The one loop is between PaymentService.cs and App.config.
