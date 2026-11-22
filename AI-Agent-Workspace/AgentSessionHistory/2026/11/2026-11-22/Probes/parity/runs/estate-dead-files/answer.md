No, don't delete it. `PaymentHub` is live code, even though no C# code calls `new PaymentHub()`.

It's a WCF service, so the framework creates it, not your code:

- **`Hub/App.config`** declares it as `<service name="Estate.Hub.PaymentHub">`. It's exposed on `net.tcp://hub.onprem.example:8731/PaymentHub` with the `IPaymentHub` contract. The WCF `ServiceHost` reads that entry and creates an instance for each call (`InstanceContextMode.PerCall`).
- **`Gateway/Web.config`** has a client endpoint named "PaymentHub" that points at that address.
- **`Gateway/Wcf/HubProxy.cs`** calls it through `ChannelFactory<IPaymentHub>("PaymentHub")`. It talks to the contract over the network and never references the class.
- **`README.md`** describes the same link: WCF over the IPSEC tunnel.

The hub does real work. It picks the right `IPaymentService` endpoint for the request's workload and environment, then forwards the call. If you deleted it, the Gateway's payment calls would fail at runtime. The compiler wouldn't flag it, because the link between the two sides is only config and the interface.

I only searched this folder. The hub is deployed separately on-prem, so I can't see whether anything else calls that endpoint. Whatever host process runs the `ServiceHost` may also be outside this copy.
