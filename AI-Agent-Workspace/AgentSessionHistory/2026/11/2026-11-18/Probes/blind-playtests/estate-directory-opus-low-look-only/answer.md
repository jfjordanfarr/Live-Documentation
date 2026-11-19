I opened PaymentService in the Local Map and expanded its Data subfolder. It has six files, and in the map the links run from the data files toward PaymentService.cs:

- **Data/Payment.cs** and **Data/PostPaymentRow.cs** are both used by **Data/PaymentsContext.cs** and by **PaymentService.cs**.
- **App.config** is also used by **PaymentsContext.cs**.
- **Data/PaymentsContext.cs** is used by **PaymentService.cs**.
- **PaymentService.cs** is the central file: it pulls together the context and both data types. It also has a link back to itself, which the map marks as "1 connection returns in a cycle", and it has about 9 more connections outside this folder.
- **App.config** has its own looping link ("returns in a cycle") and 2 connections outside the folder.
- **PaymentService.csproj** has no links to the other files here, only one outside connection.

So the files form a simple stack: the data types and config feed PaymentsContext, and PaymentsContext and the data types feed PaymentService.cs. I read the direction of each link from where the curves start and end and from the map's "Offers → Uses" legend. If you need it exact, hover over the links in the map to check.
