using System.Runtime.Serialization;

namespace Estate.Contracts
{
    /// <summary>The outcome of a payment operation, including the account balance read from the system of record.</summary>
    [DataContract(Namespace = "http://estate.example/payments")]
    public class PaymentResult
    {
        [DataMember] public string  PaymentId      { get; set; }
        [DataMember] public string  Status         { get; set; }
        [DataMember] public decimal AccountBalance { get; set; }
    }
}
