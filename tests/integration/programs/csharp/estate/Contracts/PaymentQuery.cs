using System.Runtime.Serialization;

namespace Estate.Contracts
{
    /// <summary>Looks up a posted payment by id within a workload and environment.</summary>
    [DataContract(Namespace = "http://estate.example/payments")]
    public class PaymentQuery
    {
        [DataMember] public string PaymentId   { get; set; }
        [DataMember] public string Workload    { get; set; }
        [DataMember] public string Environment { get; set; }
    }
}
