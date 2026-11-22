Here is how the PaymentService files connect.

**The pieces**
- `PaymentService.csproj` builds a .NET Framework 4.8 project. It uses Entity Framework 6.5.1 and `System.ServiceModel` (WCF). It references `../Contracts/Contracts.csproj`.
- `../Contracts/IPaymentService.cs` sits outside the folder, in the Contracts project. It is the WCF `[ServiceContract]` with two operations, `Post` and `Get`. `PaymentRequest`, `PaymentQuery` and `PaymentResult` come from the same project. I didn't open those files.
- `PaymentService.cs` implements `IPaymentService`. It is the entry point for both operations.
- `Data/PaymentsContext.cs` is the EF `DbContext`. It exposes `DbSet<Payment>` and a `PostPayment` method.
- `Data/Payment.cs` is the entity mapped to `dbo.Payment`.
- `Data/PostPaymentRow.cs` is a plain class that holds the single row returned by the stored procedure.
- `App.config` holds the runtime configuration: the database connection string and the WCF endpoint.

**Request flow**
- **`Post`**
  - `PaymentService.Post` creates a `PaymentsContext` and calls `db.PostPayment(accountNumber, amount)`.
  - That runs the stored procedure `dbo.usp_PostPayment` through `Database.SqlQuery<PostPaymentRow>`.
  - The procedure does the linked-server read of the Oracle account balance, according to the comment in the code.
  - The `PostPaymentRow` it returns (`PaymentId`, `Status`, `AccountBalance`) is copied into a `PaymentResult`.
- **`Get`**
  - `PaymentService.Get` calls `db.Payments.Find(id)`, which uses EF and the `Payment` entity.
  - It maps `PaymentId` and `Status` into a `PaymentResult` and returns `null` if nothing is found.
  - `AccountBalance` is hardcoded to `0m`, because `Payment` has no balance column. Callers will see 0 for lookups, which may be unintended.

**Configuration links**
- `PaymentsContext` connects with `"name=" + "PaymentsDb"`. That matches the `PaymentsDb` connection string in `App.config`, which points at an on-prem SQL Server using Integrated Security.
- The `App.config` service entry `Estate.Payments.PaymentService` exposes `Estate.Contracts.IPaymentService` over `netTcpBinding` at `net.tcp://payments.onprem.example:8732/PaymentService`. The names match the implementation class and the contract interface.

**Dependency chain**
`App.config` → `PaymentService` (implements `IPaymentService` from Contracts) → `PaymentsContext` → `Payment` and `PostPaymentRow` → SQL Server (`dbo.Payment` table and `dbo.usp_PostPayment`) → Oracle, through a linked server.
