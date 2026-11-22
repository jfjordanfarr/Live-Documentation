The files in `PaymentService/` connect like this:

**Contract and hosting**
- `PaymentService.csproj` targets net48. It references EntityFramework 6.5.1 and `System.ServiceModel`. It also has a project reference to `../Contracts/Contracts.csproj`.
- That project holds `IPaymentService`. This is the WCF contract, with two operations: `Post(PaymentRequest)` and `Get(PaymentQuery)`. `PaymentRequest`, `PaymentQuery` and `PaymentResult` come from the same Contracts project. I didn't open those files.
- `PaymentService.cs` implements `IPaymentService`. `App.config` exposes it as a WCF service over `net.tcp://payments.onprem.example:8732/PaymentService`. It names the service as `Estate.Payments.PaymentService` and the contract as `Estate.Contracts.IPaymentService`.

**Data access**
- `PaymentService.cs` opens a new `PaymentsContext` (in `Data/PaymentsContext.cs`) for each call.
- `PaymentsContext` is an Entity Framework `DbContext`. It reads the connection string named `PaymentsDb` from `App.config`. That string points at the on-prem SQL Server `Payments` database with integrated security.

**The two paths**
- **`Post`** calls `PaymentsContext.PostPayment(...)`. That runs the stored procedure `dbo.usp_PostPayment` with the account number and amount. The procedure returns one row, which maps to `Data/PostPaymentRow.cs` (PaymentId, Status, AccountBalance). The service copies those fields into a `PaymentResult`. According to the comments, the procedure reads the Oracle account balance through a linked server. That happens in SQL, not in this code.
- **`Get`** uses `db.Payments.Find(id)`. `Payments` is a `DbSet<Payment>`, and `Data/Payment.cs` maps to the `dbo.Payment` table. The service returns a `PaymentResult` with the id and status. `AccountBalance` is hard-coded to `0m`, because the `Payment` table has no balance column. If the payment isn't found, it returns `null`.

**Things to be aware of**
- `Get` and `Post` return different data. `Get` never returns the real balance.
- The balance only comes from the stored procedure. The procedure's SQL isn't in this folder.
