I opened the PaymentService folder in the Local Map. It holds 7 files: 3 at the top level and 4 in a Data subfolder. In the map, each link runs from the file that offers something to the file that uses it. I read the directions from the line colours, so a few details may be off.

**Top level**
- **PaymentService.cs** is the main hub. It has about 9 connections. It uses the Data files and shares a link with App.config that loops back on itself (the map flags a cycle).
- **App.config** has about 2 connections, to the Data files. It also has the cycle link with PaymentService.cs.
- **PaymentService.csproj** is the project file. It has 1 connection, and I couldn't tell what it links to.

**Data subfolder**
- **PaymentsContext.cs** is the centre of the Data folder. PostPaymentRow.cs and Payment.cs both connect to it, and it connects up to PaymentService.cs.
- **PostPaymentRow.cs** and **Payment.cs** also have lines that go up to PaymentService.cs and App.config.
- The fourth Data file was off-screen, so I didn't read it.

In short, PaymentService.cs sits on top and uses the Data layer, with PaymentsContext.cs as that layer's hub. App.config feeds into the same pieces.

On the wider map, this service ("payments") connects to the "hub" service and to the "sqlserver" and "oracle" databases.
