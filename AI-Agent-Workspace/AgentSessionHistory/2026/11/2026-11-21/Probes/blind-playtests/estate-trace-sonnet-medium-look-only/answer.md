A payment submitted on the web page passes through these pieces in order, according to the map:

1. **portal** is the web front end in the cloud. It receives the payment at `POST api/payments`, which is handled in `PaymentsController.cs`. It calls the gateway.
2. **gateway** is a second web piece in the cloud. It sits between the portal and the on-prem systems and passes the payment across the declared IPsec tunnel, which is the map's one cloud-to-on-prem crossing. I didn't open the gateway's own details, but the hub's "called by" list confirms it calls the hub.
3. **hub** is an on-prem service that offers `PaymentHub` at `net.tcp://hub.onprem.example:8731`. It calls payments.
4. **payments** is an on-prem service that offers `PaymentService` at `net.tcp://payments.onprem.example:8732`. It calls sqlserver.
5. **sqlserver** is an on-prem database. It has the `dbo.Payment` table and the `dbo.usp_PostPayment` procedure, so this is where the payment is stored. It also calls oracle.
6. **oracle** is an on-prem database holding the `CENTRAL.ACCOUNT` table. The map shows sqlserver calling it, but it doesn't say whether that call writes the payment or only touches the account.

The final resting place is sqlserver's `dbo.Payment` table, written through `usp_PostPayment`.

The hub also lists a call out to `payments-staging.onprem.example:8732`. The map marks it as a ghost, because nothing on the board serves that address. It isn't part of the normal path.

The `contracts` library is shared code that the services use. Payments don't flow through it.
