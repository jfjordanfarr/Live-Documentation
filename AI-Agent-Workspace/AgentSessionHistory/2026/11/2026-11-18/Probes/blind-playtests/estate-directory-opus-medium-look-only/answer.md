I opened the PaymentService folder (the "payments" box on the world map) and its Data subfolder. It holds 6 files: PaymentService.cs, App.config and PaymentService.csproj, plus PostPaymentRow.cs, Payment.cs and PaymentsContext.cs in Data.

The map shows the links as lines between files. I couldn't get labels or tooltips for them, so the direction comes from the map's key: a line runs from the file that offers something to the file that uses it.

**How they connect:**
- **The data types:** PostPaymentRow.cs and Payment.cs are both used by PaymentsContext.cs and by PaymentService.cs.
- **PaymentsContext.cs to PaymentService.cs:** PaymentService.cs uses PaymentsContext.cs, so it pulls in the data types both directly and through the context. It's the busiest file, with about 12 connections.
- **App.config is part of a loop:** App.config feeds PaymentsContext.cs, which feeds PaymentService.cs, and PaymentService.cs links back to App.config. The map marks App.config and PaymentService.cs with "1 connection returns in a cycle." Most likely the config holds the context's settings, such as the connection string, and also refers back to the service.
- **PaymentService.csproj:** it has no links to the code files. Its only link goes outside the folder, to Contracts.csproj in the Contracts library.

To sum up: two data files feed a data context, and the PaymentService.cs file sits on top of all of them. App.config ties into a small loop with the context and the service, and the project file depends on the Contracts project.
