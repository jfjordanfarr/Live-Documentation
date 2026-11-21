I opened PaymentService in the Local Map and expanded its Data subfolder. The folder holds six files. I read the links off the diagram, so the direction of each one is my best reading of the Offers/Uses legend.

**Top level**
- **PaymentService.cs** is the hub, with the most connections (about 12 in the first view). It is linked to App.config and to the files in Data.
- **App.config** is linked to PaymentService.cs and to PaymentsContext.cs.
- **PaymentService.csproj** is the project file. It shows only one connection and is otherwise isolated.

**Data subfolder**
- **PaymentsContext.cs** is the centre of the folder. It is linked to Payment.cs, PostPaymentRow.cs, App.config and PaymentService.cs.
- **Payment.cs** and **PostPaymentRow.cs** are the model files. Both connect to PaymentsContext.cs, and they also reach App.config and PaymentService.cs.

PaymentService.cs and App.config each show "1 connection returns in a cycle", which means there is a circular reference between them and the Data files.

In the World Map this service is labelled "payments" (6 files).
