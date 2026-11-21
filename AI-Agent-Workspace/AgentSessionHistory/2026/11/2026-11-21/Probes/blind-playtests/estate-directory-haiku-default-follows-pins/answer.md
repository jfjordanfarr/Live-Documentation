The PaymentService folder holds six files, and the map links them like this:

- **PaymentService.cs** is the main service file. It has the most connections (12), and it's the one that links to App.config.
- **App.config** holds the service address, `net.tcp://payments.onprem.example:8732/PaymentService`. Its connections run to the Data files, and the map flags one connection that returns in a cycle.
- **PaymentService.csproj** has one connection. It's the project file, and it lists the packages the service uses: EntityFramework 6.5.1, System.ComponentModel.DataAnnotations, System.Data, and System.ServiceModel.
- **Data/** is a subfolder with three files:
  - **PaymentsContext.cs** (6 symbols, 1 connection) is the data context, and it links to the csproj.
  - **Payment.cs** and **PostPaymentRow.cs** both link to App.config and PaymentsContext.cs.

Outside the folder, the payments service is called by "hub" and calls "sqlserver". The overall map marks it as on-prem, and the Data subfolder links to the contracts library.

I couldn't read every edge endpoint clearly, and the csproj node was cut off on the right edge, so the exact wiring between the top-level files may differ slightly from this summary. I didn't change anything in the map; I only clicked to open and expand views.
