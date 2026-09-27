using System;
using System.Web.UI;
using WebForms.AppCode;

namespace WebForms.Pages;

public partial class Default : Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        // Populate hidden fields so downstream JavaScript can read the config values.
        WidgetToggleHidden.Value = Globals.GetWidgetToggle();
        ClientConfigHidden.Value = Globals.GetClientConfig();
    }
}
