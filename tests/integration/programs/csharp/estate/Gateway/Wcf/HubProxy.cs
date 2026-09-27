using System;
using System.ServiceModel;

using Estate.Contracts;

namespace Estate.Gateway.Wcf
{
    /// <summary>
    /// Client side of the hub contract. The endpoint address lives in Web.config under the
    /// "PaymentHub" client endpoint; the hub itself is another deployment, on-prem.
    /// </summary>
    public sealed class HubProxy
    {
        public const string EndpointName = "PaymentHub";

        public PaymentResult PostPayment(PaymentRequest request) => Call(hub => hub.PostPayment(request));

        public PaymentResult GetPayment(PaymentQuery query) => Call(hub => hub.GetPayment(query));

        private static T Call<T>(Func<IPaymentHub, T> operation)
        {
            var factory = new ChannelFactory<IPaymentHub>(EndpointName);
            IPaymentHub channel = factory.CreateChannel();
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
