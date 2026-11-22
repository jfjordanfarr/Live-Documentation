No, don't delete it. `PaymentHub` is live code that gets created by WCF at runtime rather than by your C# code.

- **Hosting:** `Hub/App.config` declares `<service name="Estate.Hub.PaymentHub">` and exposes it at `net.tcp://hub.onprem.example:8731/PaymentHub`. The WCF `ServiceHost` creates an instance for each call, which fits the `InstanceContextMode.PerCall` attribute on the class.
- **Callers:** `Gateway/Wcf/HubProxy.cs` builds a `ChannelFactory<IPaymentHub>` using the endpoint name `"PaymentHub"`. `Gateway/Web.config` maps that name to the same hub address. Every gateway payment call goes through that path.
- **Where it sits:** The README shows it as the middle hop, Gateway → Hub → PaymentService. The hub is the only place that picks the service endpoint for a workload and environment, using `ServiceRouting`.

A search for `new PaymentHub` finds nothing for two reasons. The service is bound by its name in config. And callers only ever see the `IPaymentHub` interface, not the class.

If you deleted it, the on-prem hub service would fail at startup because the config names a type that no longer exists. The gateway would then get connection errors on every payment.

I only searched this folder, and it isn't a git repo, so I couldn't check history. If the hub is hosed by a `.svc` file or a separate host project that isn't in this copy, that would also be a reason to keep it.
