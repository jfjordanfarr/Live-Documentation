`Contracts/IPaymentService.cs` defines the WCF contract `Estate.Contracts.IPaymentService`. It has two operations, `Post(PaymentRequest)` and `Get(PaymentQuery)`. Three projects use it, plus the config files that name it. I found these by searching the repo for the interface name and for references to the Contracts project.

**Code that uses the interface**
- **`PaymentService/PaymentService.cs`** implements it (`PaymentService : IPaymentService`). This is the actual service.
- **`Hub/PaymentHub.cs`** is the client. `Forward<T>` builds a `ChannelFactory<IPaymentService>`, using the endpoint name from `ServiceRouting.EndpointNameFor(workload, environment)`. It then calls `Post` or `Get` on the channel. The hub does no payment work itself and only forwards requests to the payment service for the right workload and environment.

**Config that names it**
- **`Hub/App.config`** (lines 14 and 17) has two client endpoints with `contract="Estate.Contracts.IPaymentService"`.
- **`PaymentService/App.config`** (line 12) has the service endpoint with the same contract name.

**Project references**
- `PaymentService`, `Hub` and `Gateway` all reference `Contracts/Contracts.csproj`. `Gateway` doesn't mention `IPaymentService` directly. It may use the other shared contracts and data contracts in that project.
- The portal doesn't reference `Contracts`. According to the README, it talks JSON to the gateway and has its own models.

If you change the interface, for example by renaming it, moving its namespace, or changing an operation, you'll also need to update the three `App.config` entries. The contract name there is a string, so the compiler won't catch a mismatch.
