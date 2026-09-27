using System;
using System.ServiceModel;

using Estate.Contracts;

namespace Estate.Hub
{
    /// <summary>
    /// The on-prem WCF hub. It does no payment work itself: it picks the payment service
    /// for the request's workload and environment and forwards the operation.
    /// </summary>
    [ServiceBehavior(InstanceContextMode = InstanceContextMode.PerCall)]
    public class PaymentHub : IPaymentHub
    {
        public PaymentResult PostPayment(PaymentRequest request)
        {
            return Forward(request.Workload, request.Environment, service => service.Post(request));
        }

        public PaymentResult GetPayment(PaymentQuery query)
        {
            return Forward(query.Workload, query.Environment, service => service.Get(query));
        }

        private static T Forward<T>(string workload, string environment, Func<IPaymentService, T> operation)
        {
            var factory = new ChannelFactory<IPaymentService>(ServiceRouting.EndpointNameFor(workload, environment));
            IPaymentService channel = factory.CreateChannel();
            try
            {
                return operation(channel);
            }
            finally
            {
                ((IClientChannel)channel).Dispose();
                factory.Close();
            }
        }
    }
}
