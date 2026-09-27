using System.ServiceModel;

namespace Estate.Contracts
{
    /// <summary>The payment service's contract, one deployment per workload and environment.</summary>
    [ServiceContract(Namespace = "http://estate.example/payments/service")]
    public interface IPaymentService
    {
        [OperationContract]
        PaymentResult Post(PaymentRequest request);

        [OperationContract]
        PaymentResult Get(PaymentQuery query);
    }
}
