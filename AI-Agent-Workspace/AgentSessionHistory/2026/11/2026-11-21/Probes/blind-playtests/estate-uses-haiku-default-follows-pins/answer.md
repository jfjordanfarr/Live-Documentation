Here's what the graph shows. I read it from the diagram rather than from the code, so treat the less certain parts as leads to check.

**Direct consumer (clear):**
- **`PaymentService/PaymentService.cs`** uses it. Its "Payment Service" port connects to the `IPaymentService` offer. The map labels it as the on-prem WCF payment service, so it's the implementation of this interface.

**Probable or indirect consumers (less certain):**
- Curved edges leave `IPaymentService` toward the `PaymentService` group and then toward `App.cs`. The edge into `App.cs` lands on its grayed "Internals" port, so it may be an indirect or internal link rather than a direct use.
- Several edges run down toward the `Hub` group, including `PaymentHub.cs`, and toward the lower-right area. I couldn't confirm which files they end at.

**What this file uses (for context):** `PaymentResult.cs`, `PaymentQuery.cs`, and `PaymentRequest.cs`, through its `Get`, `Post`, and similar members.

I didn't open any individual node's details panel, so I may have missed some consumers. If you need a complete list, click `IPaymentService.cs` and check its references or dependents, or search the repo for `IPaymentService`.
