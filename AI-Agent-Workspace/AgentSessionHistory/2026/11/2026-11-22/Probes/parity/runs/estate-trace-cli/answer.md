When someone submits a payment on the web page, it passes through these pieces in order. I read the code to confirm each hop.

1. **Portal page.** `Default.aspx` holds the form, and `Scripts/portal.js` handles the submit. It sends a JSON `POST` to `api/payments`. If payments are disabled, the form is hidden and nothing is sent.
2. **Portal Web API.** `Portal/Controllers/PaymentsController.Post` rejects the request if payments are disabled. Otherwise it passes the request to `GatewayClient`.
3. **Portal `GatewayClient`.** It makes an HTTP `POST` to `api/payments` at the gateway. The address is `Portal.GatewayBaseUrl` in `Web.config`.
4. **Gateway Web API.** `Gateway/Controllers/PaymentsController.Post` sets the workload and environment on the request from `GatewaySettings`. It then calls `HubProxy`.
5. **Gateway `HubProxy`.** It makes a WCF call through the client endpoint named `PaymentHub`, going over the IPSEC tunnel from the cloud to on-prem.
6. **Hub (`PaymentHub`, WCF, on-prem).** It does no payment work itself. `ServiceRouting` builds an endpoint name of the form `PaymentService.<Workload>.<Environment>`. The hub forwards the call to that endpoint.
7. **`PaymentService` (WCF, on-prem).** `Post` opens a `PaymentsContext`, which is Entity Framework 6. It calls `db.PostPayment`.
8. **SQL Server.** `PaymentsContext` runs `EXEC dbo.usp_PostPayment`, using the `PaymentsDb` connection string. The procedure inserts the row into **`dbo.Payment`**, with status "Posted". That insert is where the payment is stored.
9. **Oracle.** Still inside the procedure, SQL Server reads the balance from `CENTRAL.ACCOUNT` through the `ORACLE_CENTRAL` linked server. This is a read only. Oracle doesn't store the payment.

The result then returns back up the same chain: payment ID, status and account balance. The page shows it as "status (balance …)".

The `Contracts` project defines the WCF message types shared by the gateway, hub and service. The portal doesn't reference it and uses its own models.
