A submitted payment passes through six pieces, in this order. I got this by clicking each box on the map and reading its "calls / called by" details.

1. **portal** (web, cloud): receives the submission at `POST api/payments` and passes it to the gateway.
2. **gateway** (web, cloud): has its own `POST api/payments` and passes it to the hub. This is where it crosses from cloud to on-prem, over a link the map labels "IPsec tunnel · declared".
3. **hub** (service, on-prem): forwards it to the payments service.
4. **payments** (PaymentService, on-prem): writes to the database.
5. **sqlserver** (database): the payment is stored here, in the `dbo.Payment` table, through the `dbo.usp_PostPayment` procedure.
6. **oracle** (database): last stop. SQL Server calls it, and the only thing it offers is a `CENTRAL.ACCOUNT` table. So the payment itself is stored in SQL Server, and the account table in Oracle appears to be updated afterwards. The map shows the call, not what that step actually does.

The seventh box, **contracts**, is a shared library used by the gateway, hub and payments. Nothing passes through it.

**Possible problem:** The map does show the hub calling payments. But the address in the hub's own settings (`App.config`) is a different server: `payments-staging.onprem.example:8732`. The payments service is actually at `payments.onprem.example:8732`, and the map flags the staging address with "nothing on the board serves it". If the hub really uses that setting, payments may never reach the payments service. Someone should check the hub's `App.config`.
