A payment submitted on the page goes through these pieces, in order:

1. **portal** (web, cloud): the page the customer submits from.
2. **gateway** (web, cloud): receives it at `POST api/payments` (route in `Controllers/PaymentsController.cs`) and forwards it to hub.
3. **hub** (service, on-prem): called by gateway and passes the payment to payments. The map shows the IPsec tunnel between cloud and on-prem on this hop.
4. **payments** (service, on-prem): the `PaymentService`, which calls sqlserver.
5. **sqlserver** (database, on-prem): the payment is stored here, in the `dbo.Payment` table, written by the `dbo.usp_PostPayment` procedure.

Oracle is not on the path to storage. sqlserver calls it, and it holds the `CENTRAL.ACCOUNT` table, so it is downstream of where the payment is saved.

I didn't open the portal's own details panel, so its place in the path comes from gateway being called by portal rather than from the portal itself.
