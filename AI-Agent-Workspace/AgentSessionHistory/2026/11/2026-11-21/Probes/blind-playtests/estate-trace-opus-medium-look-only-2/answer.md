Based on the map, a payment passes through six pieces, in this order:

1. **portal** (web app, cloud). It takes the submission at `POST api/payments` and passes it to the gateway.
2. **gateway** (web app, cloud). It has the same `POST api/payments` route and sends the payment on to the hub.
3. **IPsec tunnel**. This is where the payment leaves the cloud for the on-premises network. The map marks it as "declared," meaning someone wrote it down rather than the scan finding it in code.
4. **hub** (service, on-prem, at `net.tcp://hub.onprem.example:8731/PaymentHub`). It calls the payments service.
5. **payments** (PaymentService, on-prem, at `net.tcp://payments.onprem.example:8732/PaymentService`). It calls the SQL Server database.
6. **sqlserver** (database). This is where the payment is stored: the `dbo.usp_PostPayment` procedure writes it to the `dbo.Payment` table.

After that, sqlserver calls **oracle**, which has a `CENTRAL.ACCOUNT` table. The map only shows that call; it doesn't say what the call does. It may update the account, but that's my guess.

The map also flags something you should check. The hub's config (`App.config`) points to `net.tcp://payments-staging.onprem.example:8732/PaymentService`, a **staging** address, not the payments service's real address. The map says nothing serves that address ("a ghost"). Even though the map draws a hub → payments link, payments may not reach the payments service as configured.

The **contracts** box is a shared code library used by gateway, hub and payments. Payments don't pass through it.
