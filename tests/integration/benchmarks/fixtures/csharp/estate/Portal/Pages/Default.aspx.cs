using System;
using System.Web.UI;

namespace Estate.Portal.Pages
{
    /// <summary>
    /// Renders server-authored values into hidden fields once, on load. Nothing posts back;
    /// portal.js reads the fields and talks to the portal's own Web API from then on.
    /// </summary>
    public partial class Default : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            PaymentsEnabledHidden.Value = Globals.PaymentsEnabled.ToString();
            GatewayBaseUrlHidden.Value  = Globals.GatewayBaseUrl;
        }
    }
}
