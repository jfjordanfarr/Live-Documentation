using System.Runtime.Serialization;

namespace Estate.Contracts
{
    /// <summary>A payment to post. Workload and Environment are stamped by the gateway, never by the browser.</summary>
    [DataContract(Namespace = "http://estate.example/payments")]
    public class PaymentRequest
    {
        [DataMember] public string  AccountNumber { get; set; }
        [DataMember] public decimal Amount        { get; set; }
        [DataMember] public string  Workload      { get; set; }
        [DataMember] public string  Environment   { get; set; }
    }
}
