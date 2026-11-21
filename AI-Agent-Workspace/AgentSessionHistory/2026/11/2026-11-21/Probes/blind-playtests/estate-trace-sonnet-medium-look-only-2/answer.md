A payment submitted on the web page passes through these pieces of the system, in this order:

1. **portal** is the web front end where the payment is submitted. It is in the cloud region.
2. **gateway** is a second web piece, also in the cloud. The portal hands the payment to it.
3. **hub** is a service in the on-prem region. The gateway calls it. The step from gateway to hub is the map's one crossing between regions, and it is marked "IPsec tunnel · declared". The hub exposes a net.tcp endpoint called PaymentHub.
4. **payments** is a service, also on-prem. The hub calls it.
5. **sqlserver** is a database, on-prem. The payments service calls it. It holds the dbo.Payment table and the dbo.usp_PostPayment stored procedure, so this is where the payment is first written.
6. **oracle** is a database, on-prem. sqlserver calls it. It holds the CENTRAL.ACCOUNT table, and the payment ends up there. This is the last stop on the map.

There is also a **contracts** library. It is shared code that the services build on. The payment does not pass through it.

The map notes that the hub also calls out to a staging payments address, `payments-staging…:8732`. Nothing on the map serves that address.

I confirmed the hand-offs from sqlserver, oracle and hub by opening their detail panels. The portal-to-gateway step comes from the arrows on the map. I did not open the portal or gateway panels.
