using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;

namespace Estate.Payments.Data
{
    /// <summary>
    /// Entity Framework context over the on-prem Payments database. The connection string
    /// is App.config's "PaymentsDb". Posting a payment calls dbo.usp_PostPayment, which is
    /// where the linked-server read of the Oracle account balance happens.
    /// </summary>
    public class PaymentsContext : DbContext
    {
        public const string ConnectionName       = "PaymentsDb";
        public const string PostPaymentProcedure = "dbo.usp_PostPayment";

        public PaymentsContext() : base("name=" + ConnectionName)
        {
        }

        public DbSet<Payment> Payments { get; set; }

        public PostPaymentRow PostPayment(string accountNumber, decimal amount)
        {
            return Database.SqlQuery<PostPaymentRow>(
                "EXEC " + PostPaymentProcedure + " @AccountNumber, @Amount",
                new SqlParameter("@AccountNumber", accountNumber),
                new SqlParameter("@Amount",        amount)).Single();
        }
    }
}
