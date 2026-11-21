The PaymentService folder has three files at its top level and a Data subfolder with three more. I read the links from the map's lines, so the exact direction of a few is my best reading.

**Top level**
- **PaymentService.cs** is the main service class. It uses the three Data files. It also connects to App.config, and that link loops back, so the map flags it as a cycle.
- **App.config** holds the service's configuration. It links to PaymentService.cs and to PaymentsContext.cs. Its names include `Estate.Payments.PaymentService` and a `net.tcp://payments.onprem.example:8732/PaymentService` endpoint.
- **PaymentService.csproj** is the project file. The map shows only one connection for it.

**Data subfolder**
- **PaymentsContext.cs** is the data-access hub. It uses Payment.cs and PostPaymentRow.cs, and it feeds into PaymentService.cs.
- **Payment.cs** is the payment model. PaymentsContext.cs and PaymentService.cs both use it.
- **PostPaymentRow.cs** is a row type. PaymentsContext.cs and PaymentService.cs both use it.

**Overall shape:** PaymentService.cs sits on top and calls into PaymentsContext.cs. PaymentsContext.cs works with the Payment and PostPaymentRow types. App.config ties the service and the context together, and the project file stands mostly on its own.

I didn't find a folder named "PaymentService" on the world map itself. The matching service there is called "payments", and I opened the folder through search instead.
