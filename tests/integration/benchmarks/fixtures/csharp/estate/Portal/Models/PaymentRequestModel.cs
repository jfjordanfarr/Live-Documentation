namespace Estate.Portal.Models
{
    /// <summary>What the browser sends. The gateway's own request type is a separate class; the two meet only as JSON.</summary>
    public class PaymentRequestModel
    {
        public string  AccountNumber { get; set; }
        public decimal Amount        { get; set; }
    }
}
