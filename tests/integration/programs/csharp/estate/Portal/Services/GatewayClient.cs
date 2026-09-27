using System;
using System.Net.Http;
using System.Threading.Tasks;

using Estate.Portal.Models;

namespace Estate.Portal.Services
{
    /// <summary>
    /// HTTP client for the payments gateway. The gateway is a separate deployment in the
    /// same cloud; the only ties are the base URL in Web.config and the route strings here.
    /// </summary>
    public sealed class GatewayClient
    {
        private static readonly HttpClient Http = new HttpClient();

        private readonly Uri baseUrl;

        public GatewayClient(string baseUrl)
        {
            this.baseUrl = new Uri(baseUrl);
        }

        public async Task<PaymentResultModel> PostPaymentAsync(PaymentRequestModel request)
        {
            HttpResponseMessage response = await Http.PostAsJsonAsync(new Uri(baseUrl, "api/payments"), request);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsAsync<PaymentResultModel>();
        }

        public async Task<PaymentResultModel> GetPaymentAsync(string paymentId)
        {
            HttpResponseMessage response = await Http.GetAsync(new Uri(baseUrl, "api/payments/" + paymentId));
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsAsync<PaymentResultModel>();
        }
    }
}
