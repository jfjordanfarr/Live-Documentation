I checked the dependency map for `Contracts/IPaymentService.cs`. Four files outside the Contracts folder use it:

1. **PaymentService/PaymentService.cs**: the on-premises WCF payment service, which implements this interface.
2. **PaymentService/App.config**: probably the service configuration naming this contract.
3. **Hub/PaymentHub.cs**: calls into the payment service through this interface.
4. **Hub/App.config**: the Hub's configuration also refers to it, probably as the client endpoint contract.

The two App.config links are the ones I'm least sure of. The lines into them overlap on the diagram, so it's worth opening those two files to confirm.

Three files in the Contracts folder are linked too, but the other way round: IPaymentService uses them (they're types in its `Get` and `Post` methods), not the reverse. They are `PaymentResult.cs`, `PaymentQuery.cs` and `PaymentRequest.cs`.
