`Contracts/IPaymentService.cs` defines the WCF service contract `Estate.Contracts.IPaymentService`. It has two operations, `Post(PaymentRequest)` and `Get(PaymentQuery)`. Searching for `IPaymentService` found these users:

- **`PaymentService/PaymentService.cs`**: `PaymentService` implements the interface, so this is the actual service.
- **`PaymentService/App.config`**: one `netTcpBinding` endpoint is declared with this contract, which is the service-side hosting config.
- **`Hub/PaymentHub.cs`**:
  - `Forward<T>` creates a `ChannelFactory<IPaymentService>` and calls `CreateChannel()`. It picks the endpoint name with `ServiceRouting.EndpointNameFor(workload, environment)`.
  - A doc comment also refers to `IPaymentService.Post(PaymentRequest)`.
- **`Hub/App.config`**: two `netTcpBinding` client endpoints use this contract. They are presumably the per-workload or per-environment targets that the hub routes to.

The contract is tied to those endpoints by its full name, `Estate.Contracts.IPaymentService`, in the config files. Renaming the interface or changing its namespace would therefore break both `App.config` files without a compile error.

My search for `.csproj` and `.sln` references to the Contracts project failed with a shell glob error, so I haven't confirmed which projects reference it. The code above does show Hub and PaymentService depending on it. I also didn't look for non-text consumers such as built binaries.
