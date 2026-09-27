using Estate.Contracts;
using Estate.Payments.Data;

namespace Estate.Payments
{
    /// <summary>The on-prem WCF payment service. Posting goes through a stored procedure; lookups go through Entity Framework.</summary>
    public class PaymentService : IPaymentService
    {
        public PaymentResult Post(PaymentRequest request)
        {
            using (var db = new PaymentsContext())
            {
                PostPaymentRow row = db.PostPayment(request.AccountNumber, request.Amount);
                return new PaymentResult
                {
                    PaymentId      = row.PaymentId,
                    Status         = row.Status,
                    AccountBalance = row.AccountBalance
                };
            }
        }

        public PaymentResult Get(PaymentQuery query)
        {
            using (var db = new PaymentsContext())
            {
                Payment payment = db.Payments.Find(query.PaymentId);
                if (payment == null)
                {
                    return null;
                }
                return new PaymentResult
                {
                    PaymentId      = payment.PaymentId,
                    Status         = payment.Status,
                    AccountBalance = 0m
                };
            }
        }
    }
}
