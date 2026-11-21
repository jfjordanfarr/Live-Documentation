The PaymentService folder is in the Local Map, which I reached from the "payments" service node. It has six files: three at the top level and three in a `Data` subfolder.

**Top level**
- **PaymentService.cs** is the main code file. It has an edge to **App.config** and several edges into the Data folder.
- **App.config** connects to PaymentService.cs and to the Data files. It has a connection that loops back on itself (the map says "1 connection returns in a cycle").
- **PaymentService.csproj** is the project file. It sits in the folder with no visible code edges. The map shows it as having one connection, but the picture doesn't show where it goes.

**Data subfolder** (`PaymentService/Data`)
- **PaymentsContext.cs** receives edges from App.config and PaymentService.cs.
- **Payment.cs** has edges to and from App.config and PaymentService.cs.
- **PostPaymentRow.cs** also has edges from App.config and PaymentService.cs.

The arrows are hard to read in the picture, so the directions are my best reading. The popup for the whole payments service also says it offers `PaymentService` at `net.tcp://payments.onprem.example:8732/PaymentService`, calls `sqlserver`, is called by `hub`, and references EntityFramework and System.Data packages in PaymentService.csproj. I haven't opened the source files, so I can't say what the code inside them does.
