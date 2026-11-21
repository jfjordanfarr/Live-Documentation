I couldn't get a complete answer from this map, so treat what follows as partial.

**What the map shows for `Contracts/IPaymentService.cs`:**
- **Implemented by** `PaymentService/PaymentService.cs`, the on-prem WCF payment service. The contract's blue output port connects to that file's `PaymentService` port.
- **Connected on the left** to `PaymentResult.cs` and `PaymentQuery.cs`, which are visibly wired into the contract's `Get`, `Post`, and `IPaymentService` ports. The `PaymentQuery.cs` node's description says it fetches a posted payment by id.
- The file's `Internals` port is marked as part of the Contracts area, and it's the only port without a connection.

**What I couldn't confirm:** the map doesn't label edge direction, so I can't say for certain which of the left-side files call this interface and which it calls. The panel did not list callers by name. The sidebar says the scan covers 36 files, 95 references, and 15 dependencies outside the scan. To get an exact list of callers, you'd want to search for `IPaymentService` in your repo or check the "+N connections" chips on the nodes.

**A side effect to know about:** one of my clicks hit a pin control on the PaymentService node and saved a pin to it. I removed it, and the header is back to "0 pins". I also zoomed the view and opened the search box, but I didn't change anything else.
