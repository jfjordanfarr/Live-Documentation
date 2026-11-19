I followed the connections on the map your colleague linked. Four files use `Contracts/IPaymentService.cs`:

- **`PaymentService/PaymentService.cs`** uses it most directly. The `PaymentService` class is the on-prem WCF payment service, and it's linked to the interface itself as well as to the file's internal code.
- **`Hub/PaymentHub.cs`** uses it in its internal code.
- **`PaymentService/App.config`** refers to it, which you'd expect if it's the WCF service contract named in the config.
- **`Hub/App.config`** also refers to it.

This list comes from tracing the lines on the map and hovering over the interface to highlight its links. I didn't open each connection to check it. The two config-file links were the hardest to follow, so treat those as likely rather than certain.

The links in the other direction are the things this file depends on, not what uses it: the shared `PaymentResult`, `PaymentQuery` and `PaymentRequest` types in the same Contracts folder.
