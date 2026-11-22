`Contracts/IPaymentService.cs` defines the WCF interface `IPaymentService`, which has a `Post(PaymentRequest)` operation. Four files use it directly.

**Direct users**
- `PaymentService/PaymentService.cs` has `PaymentService : IPaymentService`, which is the implementation.
- `Hub/PaymentHub.cs` builds a `ChannelFactory<IPaymentService>` and forwards calls through it. It also references the interface in a doc comment.
- `PaymentService/App.config` registers the contract as `Estate.Contracts.IPaymentService` on a netTcp endpoint.
- `Hub/App.config` also depends on it. It showed up as a direct dependency in the `live-docs` analysis, but my text search found no mention of the interface there.

**Indirect users**

These depend on it through the files above. The hop counts come from `live-docs inspect`.
- 2 hops: `Gateway/Web.config` and `PaymentService/Data/PaymentsContext.cs`
- 3 hops: `Gateway/GatewaySettings.cs` and `Gateway/Wcf/HubProxy.cs`
- 4 hops: `Gateway/Controllers/PaymentsController.cs`
- 5 hops: `Portal/Services/GatewayClient.cs`
- 6 hops: `Portal/Controllers/PaymentsController.cs`
- 7 hops: `Portal/Scripts/portal.js`
- 8 hops: `Portal/Pages/Default.aspx`

Changing the interface, for example the signature of `Post`, would affect the service, the hub and the endpoint config directly. The effect could reach the Gateway and Portal layers through the hub.
