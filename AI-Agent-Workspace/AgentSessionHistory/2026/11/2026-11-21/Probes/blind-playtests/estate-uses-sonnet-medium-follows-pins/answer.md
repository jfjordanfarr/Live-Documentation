On the Local Map for `Contracts/IPaymentService.cs`, four files point at it. I read this off the graph's connecting lines, since the page has no plain "used by" list. The exact link types and the Hub `App.config` attribution are my reading of the lines.

- **`PaymentService/PaymentService.cs`** is the main user. It's the on-prem implementation of the interface.
- **`Hub/PaymentHub.cs`** also references it.
- **`PaymentService/App.config`** references it too.
- **A second `App.config`**, which looks like it belongs to the Hub project, references it as well.

The three other files in `Contracts` (`PaymentResult.cs`, `PaymentQuery.cs` and `PaymentRequest.cs`) sit next to it. They are the types its `Get` and `Post` methods work with, not users of it. The page's footer says only 36 files were scanned, so anything outside that scan won't show up.
