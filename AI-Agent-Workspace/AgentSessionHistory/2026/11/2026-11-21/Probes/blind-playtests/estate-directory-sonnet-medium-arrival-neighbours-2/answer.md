The PaymentService folder has five files: four in the folder itself and a Data subfolder. They connect like this, going by the arrows in the Local Map:

- **PaymentService.cs** is the main file and the most connected, with about 9 connections. It uses everything in Data, so it depends on `PaymentsContext.cs`, `Payment.cs` and `PostPaymentRow.cs`. It also has a link with `App.config` that loops back on itself. The map flags this as "1 connection returns in a cycle", so the two reference each other.
- **App.config** is the folder's configuration. It feeds into `PaymentsContext.cs` and `PaymentService.cs`. It also has a link going out of the folder, which I didn't follow. I didn't check what that link points to.
- **Data/PaymentsContext.cs** is the data-access hub. It uses `Payment.cs` and `PostPaymentRow.cs`, and `PaymentService.cs` uses it in turn. It also uses `App.config`, probably for connection settings.
- **Data/Payment.cs** and **Data/PostPaymentRow.cs** are the data models. Both feed into `PaymentsContext.cs` and `PaymentService.cs`.
- **PaymentService.csproj** is the project file. It showed no connections to the other files.

The overall flow is `App.config` → `PaymentsContext.cs` (with the Payment and PostPaymentRow models) → `PaymentService.cs`.

The lines overlap heavily on the map, so I read some of the individual directions by eye. Treat the exact arrow directions as approximate.
