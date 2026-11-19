I opened the PaymentService folder in the map, expanded its Data subfolder and hovered over each file to see its links. It has six files, and the links run from the data files up to the service:

**Files**
- `Data/Payment.cs`
- `Data/PostPaymentRow.cs`
- `Data/PaymentsContext.cs`
- `PaymentService.cs`
- `App.config`
- `PaymentService.csproj`

**How they link** (by the map's legend, one file "offers" something and another "uses" it)
1. **PaymentsContext.cs** sits in the middle. It uses `Payment.cs`, `PostPaymentRow.cs` and `App.config`. My guess is that's its data-access setup and connection string, but the map only shows that the link exists.
2. **PaymentService.cs** is the top layer. It uses `PaymentsContext.cs`, and it also uses `Payment.cs` and `PostPaymentRow.cs` directly.
3. **App.config** feeds into PaymentsContext. The map also marks it with "1 connection returns in a cycle", meaning it loops back on itself.
4. **PaymentService.cs** has the same "returns in a cycle" loop.
5. **PaymentService.csproj** isn't linked to anything in the folder. Its one connection goes outside.

**Links outside the folder**
- PaymentService.cs has the most, with 9 more connections.
- App.config has 2.
- PaymentsContext.cs, Payment.cs and PaymentService.csproj have 1 each.

On the overall map this folder is the "payments" service. It links to the hub service and the sqlserver database next to it.
