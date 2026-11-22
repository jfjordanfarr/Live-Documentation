When someone submits a payment on the web page, it passes through these pieces in order:

1. **Browser form (`Portal/Scripts/portal.js`)**: the submit handler stops the normal postback. It sends a `POST api/payments` request with JSON containing the account number and amount. If payments are disabled, the form is hidden and nothing is sent.
2. **Portal Web API (`Portal/Controllers/PaymentsController.cs`)**: this rejects the request if payments are disabled. Otherwise it passes the request to `GatewayClient`.
3. **Portal `GatewayClient`**: it sends an HTTP `POST` to `api/payments` at the gateway's base URL. That URL is `Portal.GatewayBaseUrl` in `Web.config`.
4. **Gateway Web API (`Gateway/Controllers/PaymentsController.cs`)**: it stamps the request with the workload and environment from `GatewaySettings`. It then hands the request to `HubProxy`.
5. **Gateway `HubProxy`**: it makes a WCF call over the IPsec tunnel to the on-prem hub. It uses the client endpoint named `PaymentHub`.
6. **Hub (`Hub/PaymentHub.cs` and `ServiceRouting.cs`)**: the hub does no payment work itself. It builds an endpoint name of the form `PaymentService.<Workload>.<Environment>` and forwards the call over WCF.
7. **PaymentService (`PaymentService/PaymentService.cs`)**: its `Post` method opens a `PaymentsContext`, which is the Entity Framework 6 context. It calls `PostPayment` on that context.
8. **SQL Server stored procedure (`dbo.usp_PostPayment`)**: the context runs `EXEC dbo.usp_PostPayment`. The procedure generates a payment ID and inserts the row into **`dbo.Payment`** with status `Posted`. That insert is where the payment is stored.

Two other things happen at the end of the procedure:
- **Oracle read:** the same procedure reads the account balance from `CENTRAL.ACCOUNT` in Oracle, through the `ORACLE_CENTRAL` linked server. This is only a read. Nothing is written to Oracle.
- **Result path:** the payment ID, status and balance go back up the chain in the same order, reversed. The page then shows "status (balance …)".

I read the code only and did not run it. The hops between projects (portal to gateway, gateway to hub, hub to service) depend on the endpoint names and addresses in the `Web.config` and `App.config` files. I did not check those values.
