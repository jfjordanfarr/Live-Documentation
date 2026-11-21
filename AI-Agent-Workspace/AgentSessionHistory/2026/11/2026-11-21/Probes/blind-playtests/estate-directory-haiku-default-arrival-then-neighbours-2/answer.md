The PaymentService folder is open on the map, and I expanded its Data subfolder. I didn't read the source files, so this is what the map's edges and labels show.

**Files in the folder:**
- **PaymentService.cs** is the central file. It has about 3 symbols and 12 connections, and it links to the Data subfolder.
- **App.config** has about 3 symbols. It holds the service address, `net.tcp://payments.onprem.example:8732/PaymentService`. It links to PaymentService.cs, and the map flags one connection between them as a cycle.
- **PaymentService.csproj** has about 1 symbol and 1 connection. It declares the packages and references the service uses, including EntityFramework 6.5.1 and System.Data. It links to the contracts library, which is outside this folder.
- **Data/** holds the database code:
  - **PostPaymentRow.cs**, about 4 symbols.
  - **Payment.cs**, about 6 symbols, with 1 connection. It links to PaymentService.cs.
  - **PaymentsContext.cs**, about 6 symbols, with 1 connection. It links to PaymentService.cs.
  - There may be more files below the visible area of the Data group.

**How they connect:** The service's outward link runs from PaymentService.cs and App.config to the Data classes. PaymentsContext.cs is the database context, and the service uses it to reach sqlserver. Across the whole estate, the payments service is called by hub, offers the endpoint above, and calls sqlserver.

**Side effects:** The map view is now filtered to "Data," and the search box shows "Data." The pin count went from 1 to 2 while I was clicking, and I'm not sure which click added the second pin. You can clear the search and remove any pins you don't want.
