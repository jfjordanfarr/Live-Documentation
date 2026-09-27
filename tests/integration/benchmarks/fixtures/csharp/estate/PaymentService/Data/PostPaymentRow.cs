namespace Estate.Payments.Data
{
    /// <summary>The single row dbo.usp_PostPayment returns.</summary>
    public class PostPaymentRow
    {
        public string  PaymentId      { get; set; }
        public string  Status         { get; set; }
        public decimal AccountBalance { get; set; }
    }
}
