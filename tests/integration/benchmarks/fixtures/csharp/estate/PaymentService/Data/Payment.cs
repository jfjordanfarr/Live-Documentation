using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Estate.Payments.Data
{
    /// <summary>A row of dbo.Payment.</summary>
    [Table("Payment", Schema = "dbo")]
    public class Payment
    {
        [Key]
        public string   PaymentId     { get; set; }
        public string   AccountNumber { get; set; }
        public decimal  Amount        { get; set; }
        public string   Status        { get; set; }
        public DateTime PostedAt      { get; set; }
    }
}
