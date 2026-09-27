namespace Estate.Portal.Models
{
    /// <summary>What the browser receives, deserialized from the gateway's JSON.</summary>
    public class PaymentResultModel
    {
        public string  PaymentId      { get; set; }
        public string  Status         { get; set; }
        public decimal AccountBalance { get; set; }
    }
}
