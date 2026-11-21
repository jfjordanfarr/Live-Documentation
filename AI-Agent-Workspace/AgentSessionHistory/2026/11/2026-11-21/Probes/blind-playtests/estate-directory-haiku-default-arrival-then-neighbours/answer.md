The PaymentService folder is open on the map. Here is how its files connect, based on the two views I looked at.

**Files in the folder**
- **PaymentService.csproj**: the project file. It has one connection and sits off to the side with no visible links on the map.
- **App.config**: the configuration file. It is linked to PaymentService.cs by a line, and it has about three connections in total.
- **PaymentService.cs**: the main code file, and the hub of the folder. It has the most links, about twelve, including a link to App.config and links into the Data subfolder. One of its connections is part of a cycle.
- **Data subfolder** (PaymentService/Data) with three files:
  - **PaymentsContext.cs**: linked to PaymentService.cs.
  - **Payment.cs** and **PostPaymentRow.cs**: both connected to PaymentService.cs and App.config. The lines cross, so I can't tell exactly which goes where.

Two links leave the folder. One runs from the folder's left edge toward another part of the estate, and one runs from PaymentService.cs toward the outside. On the estate map, this folder is the "payments" service, which talks to the "hub" service across the on-prem boundary and to the sqlserver and oracle databases.

I may have changed the view by accident. Clicking the Data arrow seems to have pinned it, and the map now says "2 pins" where it said "1 pin" before. I didn't mean to pin anything, so you may want to unpin it. The search box also still shows "Data," which I didn't intend.
