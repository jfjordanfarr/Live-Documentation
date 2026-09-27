using System.Configuration;

namespace WebForms.AppCode;

public static class Globals
{
    private const string WidgetToggleKey = "EnableWidget";
    private const string ClientConfigKey = "ClientConfig";

    public static string GetWidgetToggle() => GetSetting(WidgetToggleKey);

    public static string GetClientConfig() => GetSetting(ClientConfigKey);

    public static string GetSetting(string key)
    {
        var value = ConfigurationManager.AppSettings[key];
        return string.IsNullOrWhiteSpace(value) ? string.Empty : value;
    }
}
