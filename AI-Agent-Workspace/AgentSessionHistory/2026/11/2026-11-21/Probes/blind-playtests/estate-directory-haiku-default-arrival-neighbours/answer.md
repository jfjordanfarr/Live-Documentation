I opened the PaymentService folder on the Local Map and expanded its Data subfolder. Here is how the files connect, based on the map's lines and the connection counts shown on each card. Some edges were hard to trace visually, so treat the exact pairings as approximate.

**Files in PaymentService**
- **PaymentService.cs** is the central file. It has about 12 connections and is the main code file, with 3 symbols. A teal line links it to **App.config**, and it has several links into the Data folder. The search also listed a PaymentService class and an IPaymentService interface, which lives in the Contracts folder.
- **App.config** has 3 symbols and 2 connections. It holds settings for the service, including the names `Estate.Payments.PaymentService` and `net.tcp://payments.onprem.example:8732/PaymentService`. Its lines run to PaymentService.cs and into the Data folder. The map also notes a cycle: one of its connections returns to itself.
- **PaymentService.csproj** has 1 symbol and 1 connection. It is the project file that defines the service's build, and it links to PaymentService.cs.

**Data subfolder (PaymentService/Data)**
- **PaymentsContext.cs** has 6 symbols and 1 connection. Its line goes to PaymentService.cs, so it is the data-access context the service uses.
- **PostPaymentRow.cs** has 4 symbols. It connects to App.config and to the service code.
- **Payment.cs** is the payment data model. It connects to App.config and to PaymentsContext.cs.

**Overall flow:** App.config and PaymentService.cs sit at the top. Payment.cs, PostPaymentRow.cs, and PaymentsContext.cs sit below them in Data. The service code uses the data classes, and the configuration links the two. The csproj ties the whole folder together for building.

I did not open the source files themselves, so the descriptions of what each class does come from their names and symbol counts.
