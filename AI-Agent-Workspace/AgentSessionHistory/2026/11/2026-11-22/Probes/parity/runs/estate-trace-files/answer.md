A submitted payment passes through these pieces, in this order:

1. **Browser form (`Portal/Pages/Default.aspx` and `Scripts/portal.js`).** The submit handler cancels the normal postback. It sends a `fetch` POST to `api/payments` with `{accountNumber, amount}`. If payments are disabled, the form is hidden and nothing is sent.
2. **Portal Web API (`Portal/Controllers/PaymentsController.cs`).** `Post` checks `Globals.PaymentsEnabled`. It then hands the request to `GatewayClient`.
3. **Portal `GatewayClient`.** It sends an HTTP POST with JSON to `api/payments` at the gateway. The address comes from `Portal.GatewayBaseUrl` in the config.
4. **Gateway Web API (`Gateway/Controllers/PaymentsController.cs`).** It stamps the request with the gateway's configured `Workload` and `Environment`. It then calls `HubProxy`.
5. **Gateway `HubProxy`.** It makes a WCF call over the IPSEC tunnel to the on-prem hub. It uses the client endpoint named `PaymentHub`.
6. **Hub (`Hub/PaymentHub.cs`).** It does no payment work itself. `ServiceRouting` builds the endpoint name `PaymentService.<Workload>.<Environment>`. The hub forwards the call to that service over WCF.
7. **PaymentService (`PaymentService.cs`).** `Post` opens a `PaymentsContext`, which is Entity Framework 6 using the `PaymentsDb` connection string. It calls `PostPayment`.
8. **SQL Server stored procedure `dbo.usp_PostPayment`.** The context runs `EXEC dbo.usp_PostPayment`. The procedure generates a GUID payment ID and inserts the row into **`dbo.Payment`** with status `Posted`. This is where the payment is stored.

The Oracle database is not part of the storage step. In the same procedure, after the insert, a `SELECT` reads the account balance from `CENTRAL.ACCOUNT` through the `ORACLE_CENTRAL` linked server. That read only fetches the balance for the response.

The result then travels back along the same path. It contains the payment ID, status and balance, and the browser shows "status (balance …)".

I read the C# and the stored procedure. I did not read the config files (`Web.config` and `App.config`), so the endpoint addresses and connection strings come from the code and README.
