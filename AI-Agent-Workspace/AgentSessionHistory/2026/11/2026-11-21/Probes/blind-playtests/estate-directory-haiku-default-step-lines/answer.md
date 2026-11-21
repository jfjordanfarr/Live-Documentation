The PaymentService folder has six files, and the map shows them connected like this:

- **PaymentService.cs** is the main code file. It sits at the center and has the most links (about 12 connections in the overview). Its symbols are in the `PaymentService` namespace. Lines run from it to the `Data` files and to `App.config`.
- **App.config** is the configuration file for the same service. It links to `PaymentService.cs` and to the `Data` files, and the map says one of its connections loops back into a cycle.
- **PaymentService.csproj** is the project file. It shows only one connection, so it's the most loosely tied to the rest of the code. I didn't trace that single link in the view.
- **Data/PaymentsContext.cs**, **Data/Payment.cs**, and **Data/PostPaymentRow.cs** are in a `Data` subfolder. Their lines run to `PaymentService.cs` and `App.config`, so the data layer is used by the main service class and configured by the app config.

In short, `PaymentService.cs` and `App.config` are the hub, the `Data` files feed into them, and the `.csproj` is the build entry that holds the folder together. The map also marks this folder as the `payments` service in the overall estate, with its database links going to `sqlserver` and `oracle`.

I typed "PaymentService" into the search box and expanded the `Data` group to get this view. I didn't change anything else on the map.
