I opened the PaymentService folder in the Local Map. It holds three files and a `Data` subfolder, and the links I could read are below. The connection lines cross a lot, so some links may be missing from my list.

**Files in PaymentService:**
- **PaymentService.cs** is the main code file. It has the most links (12 in total), including links to files outside the folder.
- **App.config** holds settings. It connects to PaymentService.cs, and the map says one connection loops back in a cycle.
- **PaymentService.csproj** is the project file. It has one connection, which I could not trace to a specific file.

**Data subfolder** (`PaymentService/Data`):
- **PaymentsContext.cs** has 6 symbols and links to PaymentService.cs.
- **PostPaymentRow.cs** and **Payment.cs** each have links that run to PaymentService.cs and/or App.config.

**Links from outside:** A link also comes in from the left edge of the view, and PaymentService.cs connects out to other services on the wider map. The wider map shows `payments` as a service that talks to `hub` and to the `sqlserver` and `oracle` databases over an IPsec tunnel.

One correction: I may have accidentally pinned a node when I clicked to expand Data. The pin counter went from 1 to 2, and the search box now says "Data." If you want the view as it was, you can unpin the extra item.
