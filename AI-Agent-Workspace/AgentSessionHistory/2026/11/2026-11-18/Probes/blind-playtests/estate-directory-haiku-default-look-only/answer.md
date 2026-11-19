The PaymentService folder has six files, arranged in a `Data` subfolder plus three files at the top level. I opened it through the `payments` node on the World Map, then switched to Local Map. The lines in the diagram are hard to trace exactly, so the links below are the ones I could confirm.

**Files:**
- **Data/PostPaymentRow.cs**, **Data/Payment.cs**, **Data/PaymentsContext.cs** (inside the `Data` subfolder)
- **App.config** (top level)
- **PaymentService.cs** (top level)
- **PaymentService.csproj** (top level)

**How they connect:**
- **App.config → the code:** App.config holds the service address, `net.tcp://payments.onprem.example:8732/PaymentService`. It has a line running into the `Data` files, and a loop that suggests a cycle back to itself.
- **PaymentService.cs is the entry point:** it is the file that offers the service endpoint and calls `sqlserver`. It has the most connections of the code files, nine in total, and is linked to `PaymentsContext.cs`, which is the data-access context it uses.
- **Data files:** `PostPaymentRow.cs`, `Payment.cs` and `PaymentsContext.cs` connect to each other and to `PaymentService.cs`.
- **PaymentService.csproj** declares the NuGet and framework references the code depends on: EntityFramework 6.5.1, System.ComponentModel.DataAnnotations, System.Data and System.ServiceModel. It has one connection in the map, to the service.

Outside the folder, `payments` is called by `hub` and calls `sqlserver`, and it stands on `contracts`.

I only changed the view by clicking and expanding. I didn't edit anything in the folder.
