using System.Threading.Tasks;
using System.Web.Http;

using Estate.Portal.Models;
using Estate.Portal.Services;

namespace Estate.Portal.Controllers
{
    /// <summary>Receives the browser's payment requests and forwards them to the gateway.</summary>
    public class PaymentsController : ApiController
    {
        private readonly GatewayClient gateway = new GatewayClient(Globals.GatewayBaseUrl);

        [HttpPost]
        [Route("api/payments")]
        public async Task<IHttpActionResult> Post(PaymentRequestModel request)
        {
            if (!Globals.PaymentsEnabled)
            {
                return BadRequest("Payments are disabled.");
            }
            PaymentResultModel result = await gateway.PostPaymentAsync(request);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/payments/{paymentId}")]
        public async Task<IHttpActionResult> Get(string paymentId)
        {
            PaymentResultModel result = await gateway.GetPaymentAsync(paymentId);
            return Ok(result);
        }
    }
}
