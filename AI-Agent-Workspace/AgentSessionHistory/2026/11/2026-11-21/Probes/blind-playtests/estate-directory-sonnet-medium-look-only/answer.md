I opened the PaymentService folder in the Local Map. It has six files, and these are the connections I could read from the lines on the map:

- **PaymentService.cs** is the main file. It draws on most of the others: `App.config`, `PaymentsContext.cs`, `Payment.cs` and `PostPaymentRow.cs`. The map says one of its connections "returns in a cycle", and `App.config` shows the same note. So `App.config` and `PaymentService.cs` seem to refer to each other. That is plausible, since the config names the service type.
- **App.config** links to `PaymentsContext.cs` and `PaymentService.cs`. Its endpoint is `net.tcp://payments.onprem.example:8732/PaymentService`.
- **Data subfolder:**
  - `PaymentsContext.cs` is the hub of the data code. It takes in `Payment.cs` and `PostPaymentRow.cs`, which are the data types. Its own output goes up to `PaymentService.cs`.
  - `Payment.cs` and `PostPaymentRow.cs` also connect straight to `PaymentService.cs`.
- **PaymentService.csproj** is the project file. It only shows one connection, and I didn't open it to see where it goes.

In short, `PaymentService.cs` sits on top. It uses the database context, which in turn uses the `Payment` and `PostPaymentRow` types, and `App.config` configures the service. I read this from line routing on a busy diagram, so treat the exact direction of individual links as approximate.

On the World Map, the `payments` service also has links to the `sqlserver` and `oracle` databases. I didn't open those.
