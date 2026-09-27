using System.ServiceModel;

namespace Estate.Contracts
{
    /// <summary>
    /// The on-prem hub's contract. The gateway calls it over WCF; the hub forwards
    /// each operation to the payment service that serves the request's workload
    /// and environment.
    /// </summary>
    [ServiceContract(Namespace = "http://estate.example/payments/hub")]
    public interface IPaymentHub
    {
        [OperationContract]
        PaymentResult PostPayment(PaymentRequest request);

        [OperationContract]
        PaymentResult GetPayment(PaymentQuery query);
    }
}
