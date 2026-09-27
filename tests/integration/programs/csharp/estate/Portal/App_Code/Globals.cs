using System.Configuration;

namespace Estate.Portal
{
    /// <summary>
    /// The one place the portal reads Web.config. Every appSettings key is a constant
    /// here so that a renamed key breaks in one file.
    /// </summary>
    public static class Globals
    {
        public const string GatewayBaseUrlKey  = "Portal.GatewayBaseUrl";
        public const string PaymentsEnabledKey = "Portal.PaymentsEnabled";

        public static string GatewayBaseUrl  => ConfigurationManager.AppSettings[GatewayBaseUrlKey];
        public static bool   PaymentsEnabled => bool.Parse(ConfigurationManager.AppSettings[PaymentsEnabledKey] ?? "false");
    }
}
