The PaymentService folder is open in the map (search for "PaymentService" and open it). It holds four files plus a Data subfolder. I read these links from the drawn lines and the counts on each card, so the exact wiring may be slightly off.

**Files in PaymentService:**
- **PaymentService.cs** is the main class. It has the most links (about 9 connections plus several outside the folder, 12 in total on the first view). Its summary says one connection loops back to itself.
- **App.config** holds the settings and "Estate.Payments.PaymentService" and "net.tcp://payments.onprem.example:8732/PaymentService" entries. It has about 2 connections. Its line runs from the left side of the group, which is where the outside service connects in, and from there to PaymentService.cs.
- **PaymentService.csproj** is the project file that defines the PaymentService build. It has one connection, which is on the list as "+1 symbol / +1 connection" on the first view.
- **Data/** is a subfolder with three files:
  - **PaymentsContext.cs** has about 6 symbols and links to PaymentService.cs on the right and to Payment.cs and PostPaymentRow.cs on the left.
  - **Payment.cs** links up to PaymentService.cs and across to PaymentsContext.cs.
  - **PostPaymentRow.cs** has a short horizontal link into PaymentsContext.cs.

**How they connect, in short:** PaymentService.cs sits at the centre. App.config feeds it settings and the endpoint, and the Data files (PaymentsContext, Payment, PostPaymentRow) give it the data types and the database context. The csproj only ties the project together. Outside the folder, PaymentService.cs also links to the hub service (the hub's App.config points at PaymentService), and the on-prem payments service is reached through the net.tcp endpoint in App.config.

I didn't click into individual files, so the details come from the map view only.
