`Contracts/IPaymentService.cs` defines the WCF contract `Estate.Contracts.IPaymentService`. Four files use it directly, and nine more depend on it indirectly.

**Direct users (1 hop)**
- `PaymentService/PaymentService.cs`: the class `PaymentService` implements the interface.
- `Hub/PaymentHub.cs`: it creates a `ChannelFactory<IPaymentService>` and forwards calls through it, including `Post(PaymentRequest)`.
- `Hub/App.config`: it declares two netTcpBinding endpoints with this contract.
- `PaymentService/App.config`: it declares a netTcpBinding endpoint with this contract.

**Indirect dependents** (these reach it through the files above, and the hop count is the number of links)
- 2 hops: `Gateway/Web.config` and `PaymentService/Data/PaymentsContext.cs`.
- 3 hops: `Gateway/GatewaySettings.cs` and `Gateway/Wcf/HubProxy.cs`.
- 4 hops: `Gateway/Controllers/PaymentsController.cs`.
- 5 hops: `Portal/Services/GatewayClient.cs`.
- 6 hops: `Portal/Controllers/PaymentsController.cs`.
- 7 hops: `Portal/Scripts/portal.js`.
- 8 hops: `Portal/Pages/Default.aspx`.

A change to the interface affects the Hub and the PaymentService project directly. It can also affect the Gateway and Portal layers further up the chain. The config files reference the contract by its string name, so a rename won't cause a compile error there. You would need to update them by hand.

I got the direct references by searching the code for the name. I got the indirect ones from `live-docs inspect`, which reads the dependency data in `.live-documentation`. That data may be out of date if the code has changed since it was generated.
