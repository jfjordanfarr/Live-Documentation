using System.Web.Http;

using Estate.Contracts;
using Estate.Gateway.Wcf;

namespace Estate.Gateway.Controllers
{
    /// <summary>Bridges the portal's REST calls into WCF calls on the on-prem hub.</summary>
    public class PaymentsController : ApiController
    {
        private readonly HubProxy hub = new HubProxy();

        [HttpPost]
        [Route("api/payments")]
        public IHttpActionResult Post(PaymentRequest request)
        {
            request.Workload    = GatewaySettings.Workload;
            request.Environment = GatewaySettings.Environment;
            return Ok(hub.PostPayment(request));
        }

        [HttpGet]
        [Route("api/payments/{paymentId}")]
        public IHttpActionResult Get(string paymentId)
        {
            var query = new PaymentQuery
            {
                PaymentId   = paymentId,
                Workload    = GatewaySettings.Workload,
                Environment = GatewaySettings.Environment
            };
            return Ok(hub.GetPayment(query));
        }
    }
}
